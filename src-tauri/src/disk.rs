// Encrypted files under the app data dir (docs/APP-PLAN.md §5). Nothing is ever written in plain text.
use crate::crypt::{self, Key};
use std::fs;
use std::path::{Path, PathBuf};

pub struct Disk {
    dir: PathBuf,
    key: Key,
}

fn write_atomic(path: &Path, bytes: &[u8]) -> Result<(), String> {
    if let Some(p) = path.parent() {
        fs::create_dir_all(p).map_err(|e| e.to_string())?;
    }
    let tmp = path.with_extension("tmp");
    fs::write(&tmp, bytes).map_err(|e| e.to_string())?;
    fs::rename(&tmp, path).map_err(|e| e.to_string()) // replaces the old file in one step
}

impl Disk {
    /// A second handle on the same vault for a background job (sync); the key is zeroized when it drops.
    pub fn key_copy(&self) -> Key {
        zeroize::Zeroizing::new(*self.key)
    }

    pub fn new(dir: PathBuf, key: Key) -> Self {
        Disk { dir, key }
    }

    fn rel_rec(&self, col: &str, id: &str) -> String {
        let c = crypt::name(&self.key, &format!("col:{col}"));
        format!("rec/{c}/{}.enc", crypt::name(&self.key, &format!("{col}/{id}")))
    }
    fn rel_doc(&self, id: &str, ext: &str) -> String {
        format!("doc/{}.{ext}", crypt::name(&self.key, &format!("doc:{id}")))
    }
    fn put(&self, rel: &str, plain: &[u8]) -> Result<(), String> {
        write_atomic(&self.dir.join(rel), &crypt::seal(&self.key, plain, rel.as_bytes()))
    }
    fn get(&self, rel: &str) -> Result<Vec<u8>, String> {
        let sealed = fs::read(self.dir.join(rel)).map_err(|e| e.to_string())?;
        Ok(crypt::open(&self.key, &sealed, rel.as_bytes())?.to_vec())
    }
    fn rel_of(&self, p: &Path) -> String {
        p.strip_prefix(&self.dir).unwrap_or(p).to_string_lossy().replace('\\', "/")
    }

    /// One record = the store's full JSON ({col, id, rev, at, born, dev, del, json}).
    pub fn rec_put(&self, rec: &str) -> Result<(), String> {
        let v: serde_json::Value = serde_json::from_str(rec).map_err(|e| e.to_string())?;
        let (col, id) = (v["col"].as_str().unwrap_or(""), v["id"].as_str().unwrap_or(""));
        if col.is_empty() || id.is_empty() {
            return Err("record needs col and id".into());
        }
        self.put(&self.rel_rec(col, id), rec.as_bytes())
    }

    /// Every record, decrypted. Unreadable files are skipped and counted, never deleted.
    pub fn rec_all(&self) -> Result<(Vec<String>, usize), String> {
        let (mut out, mut bad) = (Vec::new(), 0);
        let Ok(cols) = fs::read_dir(self.dir.join("rec")) else { return Ok((out, 0)) };
        for col in cols.flatten() {
            for f in fs::read_dir(col.path()).into_iter().flatten().flatten() {
                let p = f.path();
                if p.extension().and_then(|e| e.to_str()) != Some("enc") {
                    continue;
                }
                match self.get(&self.rel_of(&p)).and_then(|b| String::from_utf8(b).map_err(|e| e.to_string())) {
                    Ok(s) => out.push(s),
                    Err(_) => bad += 1,
                }
            }
        }
        Ok((out, bad))
    }

    pub fn doc_add(&self, id: &str, meta: &str, bytes: &[u8]) -> Result<(), String> {
        if id.is_empty() {
            return Err("document needs an id".into());
        }
        self.put(&self.rel_doc(id, "enc"), bytes)?;
        self.put(&self.rel_doc(id, "m"), meta.as_bytes())
    }
    pub fn doc_open(&self, id: &str) -> Result<Vec<u8>, String> {
        self.get(&self.rel_doc(id, "enc"))
    }
    pub fn doc_list(&self) -> Result<Vec<String>, String> {
        let Ok(rd) = fs::read_dir(self.dir.join("doc")) else { return Ok(vec![]) };
        Ok(rd
            .flatten()
            .map(|f| f.path())
            .filter(|p| p.extension().and_then(|e| e.to_str()) == Some("m"))
            .filter_map(|p| self.get(&self.rel_of(&p)).ok().and_then(|b| String::from_utf8(b).ok()))
            .collect())
    }
    pub fn doc_del(&self, id: &str) -> Result<(), String> {
        for ext in ["enc", "m"] {
            let p = self.dir.join(self.rel_doc(id, ext));
            if p.exists() {
                fs::remove_file(p).map_err(|e| e.to_string())?;
            }
        }
        Ok(())
    }
    // ---- raw sealed files, for sync (docs/APP-PLAN.md §6). Cloud and disk hold the very same sealed bytes. ----

    /// Names of the files that sync: vault.json, every record and every document file.
    pub fn sync_files(&self) -> Vec<String> {
        let mut out = vec![];
        if self.dir.join("vault.json").exists() {
            out.push("vault.json".to_string());
        }
        for sub in ["rec", "doc"] {
            let Ok(top) = fs::read_dir(self.dir.join(sub)) else { continue };
            for e in top.flatten() {
                let p = e.path();
                let files: Vec<PathBuf> = if p.is_dir() { fs::read_dir(&p).into_iter().flatten().flatten().map(|f| f.path()).collect() } else { vec![p] };
                out.extend(files.iter().filter(|f| f.extension().is_some_and(|x| x == "enc" || x == "m")).map(|f| self.rel_of(f)));
            }
        }
        out
    }
    pub fn raw_get(&self, rel: &str) -> Option<Vec<u8>> {
        fs::read(self.dir.join(rel)).ok()
    }
    /// Accepts only bytes that open with this vault's key (a file from another vault is refused). vault.json is plain JSON.
    pub fn raw_put(&self, rel: &str, bytes: &[u8]) -> Result<(), String> {
        if rel != "vault.json" {
            crypt::open(&self.key, bytes, rel.as_bytes()).map_err(|_| format!("{rel}: not sealed with this vault's key"))?;
        }
        write_atomic(&self.dir.join(rel), bytes)
    }
    pub fn raw_del(&self, rel: &str) -> Result<(), String> {
        let p = self.dir.join(rel);
        if p.exists() { fs::remove_file(p).map_err(|e| e.to_string())? }
        Ok(())
    }
    /// The decrypted record inside a rec/ file, if it is one.
    pub fn rec_plain(&self, rel: &str) -> Option<String> {
        if !rel.starts_with("rec/") { return None }
        String::from_utf8(self.get(rel).ok()?).ok()
    }
    /// Open sealed bytes that are not on disk (the cloud copy) with this vault's key.
    pub fn open_foreign(&self, rel: &str, sealed: &[u8]) -> Option<String> {
        if !rel.starts_with("rec/") { return None }
        String::from_utf8(crypt::open(&self.key, sealed, rel.as_bytes()).ok()?.to_vec()).ok()
    }
    /// Sync bookkeeping and the conflict copies are sealed under their own fixed names.
    pub fn side_get(&self, rel: &str) -> Option<String> {
        String::from_utf8(self.get(rel).ok()?).ok()
    }
    pub fn side_put(&self, rel: &str, text: &str) -> Result<(), String> {
        self.put(rel, text.as_bytes())
    }
    pub fn side_list(&self, sub: &str) -> Vec<String> {
        fs::read_dir(self.dir.join(sub)).into_iter().flatten().flatten().map(|f| self.rel_of(&f.path())).collect()
    }
}

#[cfg(test)]
mod tests {
    use super::*;

    fn walk(p: &Path) -> Vec<String> {
        let mut v = vec![];
        for e in fs::read_dir(p).into_iter().flatten().flatten() {
            v.push(e.file_name().to_string_lossy().into_owned());
            if e.path().is_dir() {
                v.extend(walk(&e.path()));
            }
        }
        v
    }

    #[test]
    fn records_and_docs_survive_reopen() {
        let dir = std::env::temp_dir().join(format!("folio-test-{}", std::process::id()));
        let key = crypt::random_key();
        let again: Key = zeroize::Zeroizing::new(*key);
        let d = Disk::new(dir.clone(), key);
        d.rec_put(r#"{"col":"eng","id":"pins-comp","rev":1,"json":"{}"}"#).unwrap();
        d.rec_put(r#"{"col":"eng","id":"pins-comp","rev":2,"json":"{}"}"#).unwrap();
        d.doc_add("d1", r#"{"name":"juin.pdf"}"#, b"%PDF").unwrap();
        let d = Disk::new(dir.clone(), again); // same key, fresh instance = app restart
        let (recs, bad) = d.rec_all().unwrap();
        assert_eq!((recs.len(), bad), (1, 0));
        assert!(recs[0].contains("\"rev\":2"));
        assert_eq!(d.doc_open("d1").unwrap(), b"%PDF");
        assert_eq!(d.doc_list().unwrap().len(), 1);
        assert!(walk(&dir).iter().all(|n| !n.contains("pins") && !n.contains("juin"))); // names leak nothing
        d.doc_del("d1").unwrap();
        assert!(d.doc_list().unwrap().is_empty());
        let _ = fs::remove_dir_all(dir);
    }
}
