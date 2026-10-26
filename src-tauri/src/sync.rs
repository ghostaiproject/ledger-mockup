// Sync (docs/APP-PLAN.md §6). Local and cloud hold the same sealed files; this decides which side wins per file.
// Three-way: `base` = the hash both sides had at the last sync. Changed on one side only → copy it over (a missing file
// counts as a delete). Changed on both → the record with the higher (at, device) wins, the other is kept as a conflict.
use crate::disk::Disk;
use serde::{Deserialize, Serialize};
use sha2::{Digest, Sha256};
use std::collections::{BTreeMap, BTreeSet};

pub trait Remote {
    /// name → hash of the sealed bytes (as given to `put`)
    fn list(&self) -> Result<BTreeMap<String, String>, String>;
    fn get(&self, name: &str) -> Result<Vec<u8>, String>;
    fn put(&self, name: &str, bytes: &[u8], hash: &str) -> Result<(), String>;
    fn del(&self, name: &str) -> Result<(), String>;
}

#[derive(Default, Serialize, Deserialize, Clone)]
pub struct State {
    #[serde(default)]
    pub refresh: Option<String>, // Google refresh token (sealed on disk with everything else here)
    #[serde(default)]
    pub base: BTreeMap<String, String>,
    #[serde(default)]
    pub last: u64,
}
const STATE: &str = "sync/state.json";

pub fn load(d: &Disk) -> State {
    d.side_get(STATE).and_then(|s| serde_json::from_str(&s).ok()).unwrap_or_default()
}
pub fn save(d: &Disk, s: &State) -> Result<(), String> {
    d.side_put(STATE, &serde_json::to_string(s).map_err(|e| e.to_string())?)
}

#[derive(Default, Serialize, Debug)]
pub struct Report {
    pub up: usize,
    pub down: usize,
    pub removed: usize,
    pub conflicts: usize,
    pub bad: Vec<String>,
    /// records that came down (decrypted JSON), for the page to merge into memory
    pub changed: Vec<String>,
}

pub fn hash(bytes: &[u8]) -> String {
    hex::encode(Sha256::digest(bytes))
}

fn stamp(plain: &Option<String>) -> (u64, String) {
    plain.as_deref().and_then(|s| serde_json::from_str::<serde_json::Value>(s).ok())
        .map(|v| (v["at"].as_u64().unwrap_or(0), v["dev"].as_str().unwrap_or("").to_string()))
        .unwrap_or((0, String::new()))
}

/// Keep the losing version of a record where the "Conflicts" panel can list it.
fn keep_conflict(d: &Disk, rel: &str, plain: &str, h: &str) -> Result<(), String> {
    let id = &hash(format!("{rel}{h}").as_bytes())[..16];
    d.side_put(&format!("sync/conflicts/{id}.enc"), &serde_json::json!({ "rel": rel, "rec": plain }).to_string())
}

pub fn run(d: &Disk, r: &dyn Remote, st: &mut State) -> Result<Report, String> {
    let mut rep = Report::default();
    let remote = r.list()?;
    let mut local: BTreeMap<String, String> = BTreeMap::new();
    for f in d.sync_files() {
        if let Some(b) = d.raw_get(&f) {
            local.insert(f, hash(&b));
        }
    }
    let names: BTreeSet<String> = local.keys().chain(remote.keys()).chain(st.base.keys()).cloned().collect();
    for n in names {
        let (l, rm, b) = (local.get(&n).cloned(), remote.get(&n).cloned(), st.base.get(&n).cloned());
        let step: Result<Option<String>, String> = (|| {
            if l == rm { return Ok(l.clone()) }
            let remote_wins = if l == b { true } else if rm == b { false } else {
                // both sides changed
                match (&l, &rm) {
                    (Some(lh), Some(rh)) => {
                        let rb = r.get(&n)?;
                        let (lp, rp) = (d.rec_plain(&n), d.open_foreign(&n, &rb));
                        let rw = stamp(&rp) >= stamp(&lp); // vault.json and documents carry no stamp: the cloud copy wins
                        let (loser, h) = if rw { (lp, lh) } else { (rp, rh) };
                        if let Some(p) = loser { keep_conflict(d, &n, &p, h)?; rep.conflicts += 1 }
                        rw
                    }
                    (None, Some(_)) => true,  // deleted here, changed there: keep the change
                    _ => false,               // changed here, deleted there: keep the change
                }
            };
            if remote_wins {
                match &rm {
                    Some(_) => {
                        let bytes = r.get(&n)?;
                        d.raw_put(&n, &bytes)?;
                        if let Some(p) = d.rec_plain(&n) { rep.changed.push(p) }
                        rep.down += 1;
                        Ok(Some(hash(&bytes)))
                    }
                    None => { d.raw_del(&n)?; rep.removed += 1; Ok(None) }
                }
            } else {
                match &l {
                    Some(h) => { let bytes = d.raw_get(&n).ok_or("file vanished")?; r.put(&n, &bytes, h)?; rep.up += 1; Ok(Some(h.clone())) }
                    None => { r.del(&n)?; rep.removed += 1; Ok(None) }
                }
            }
        })();
        match step {
            Ok(Some(h)) => { st.base.insert(n, h); }
            Ok(None) => { st.base.remove(&n); }
            Err(e) => rep.bad.push(format!("{n}: {e}")), // one bad file never stops the rest
        }
    }
    Ok(rep)
}

#[cfg(test)]
mod tests {
    use super::*;
    use crate::crypt;
    use std::cell::RefCell;

    #[derive(Default)]
    struct Mem(RefCell<BTreeMap<String, Vec<u8>>>);
    impl Remote for Mem {
        fn list(&self) -> Result<BTreeMap<String, String>, String> { Ok(self.0.borrow().iter().map(|(k, v)| (k.clone(), hash(v))).collect()) }
        fn get(&self, n: &str) -> Result<Vec<u8>, String> { self.0.borrow().get(n).cloned().ok_or("missing".into()) }
        fn put(&self, n: &str, b: &[u8], _h: &str) -> Result<(), String> { self.0.borrow_mut().insert(n.into(), b.to_vec()); Ok(()) }
        fn del(&self, n: &str) -> Result<(), String> { self.0.borrow_mut().remove(n); Ok(()) }
    }
    fn dev(dir: &str, key: &crypt::Key) -> Disk {
        let p = std::env::temp_dir().join(format!("folio-sync-{}-{dir}", std::process::id()));
        let _ = std::fs::remove_dir_all(&p);
        Disk::new(p, zeroize::Zeroizing::new(**key))
    }
    fn rec(at: u64, d: &str, v: &str) -> String { format!(r#"{{"col":"eng","id":"e1","rev":1,"at":{at},"dev":"{d}","del":false,"json":"{v}"}}"#) }

    #[test]
    fn two_devices_converge_and_keep_the_conflict() {
        let key = crypt::random_key();
        let (a, b, cloud) = (dev("a", &key), dev("b", &key), Mem::default());
        let (mut sa, mut sb) = (State::default(), State::default());
        a.rec_put(&rec(10, "A", "one")).unwrap();
        a.doc_add("d1", "{}", b"pdf").unwrap();
        let r = run(&a, &cloud, &mut sa).unwrap();
        assert_eq!((r.up, r.down), (3, 0));
        let r = run(&b, &cloud, &mut sb).unwrap(); // B gets everything
        assert_eq!((r.down, r.changed.len()), (3, 1));
        assert_eq!(b.doc_open("d1").unwrap(), b"pdf");
        // both edit the same record: the later one wins, the other is kept
        a.rec_put(&rec(20, "A", "from A")).unwrap();
        b.rec_put(&rec(30, "B", "from B")).unwrap();
        run(&a, &cloud, &mut sa).unwrap();
        let r = run(&b, &cloud, &mut sb).unwrap();
        assert_eq!((r.conflicts, r.up), (1, 1));
        let r = run(&a, &cloud, &mut sa).unwrap();
        assert!(r.changed[0].contains("from B"));
        assert_eq!(a.rec_all().unwrap().0, b.rec_all().unwrap().0);
        assert_eq!(b.side_list("sync/conflicts").len(), 1);
        // a delete travels, and nothing is left to do after
        a.doc_del("d1").unwrap();
        run(&a, &cloud, &mut sa).unwrap();
        let r = run(&b, &cloud, &mut sb).unwrap();
        assert_eq!(r.removed, 2);
        let r = run(&b, &cloud, &mut sb).unwrap();
        assert_eq!((r.up, r.down, r.removed), (0, 0, 0));
        // a file sealed under another vault's key is refused, the rest still syncs
        let other = dev("c", &crypt::random_key());
        other.rec_put(&rec(5, "C", "alien")).unwrap();
        let f = other.sync_files().remove(0);
        cloud.put(&f, &other.raw_get(&f).unwrap(), "").unwrap();
        let r = run(&b, &cloud, &mut sb).unwrap();
        assert_eq!(r.bad.len(), 1);
    }
}
