// Google Drive appDataFolder as the cloud (scope drive.appdata: an app-only folder, the user's other files are invisible).
// Only sealed `.enc` files and vault.json go up. A file's sha256 rides along as an appProperty so listing needs no download.
use crate::sync::Remote;
use std::cell::RefCell;
use std::collections::{BTreeMap, HashMap};
use std::io::Read;

const API: &str = "https://www.googleapis.com/drive/v3/files";
const UP: &str = "https://www.googleapis.com/upload/drive/v3/files";

pub struct Drive {
    token: String,
    ids: RefCell<HashMap<String, String>>, // name → file id, filled by list()
}

fn err(e: ureq::Error) -> String {
    match e {
        ureq::Error::Status(c, r) => format!("Google Drive {c}: {}", r.into_string().unwrap_or_default().chars().take(160).collect::<String>()),
        e => format!("network: {e}"),
    }
}

impl Drive {
    pub fn new(token: String) -> Self {
        Drive { token, ids: RefCell::new(HashMap::new()) }
    }
    fn auth(&self) -> String {
        format!("Bearer {}", self.token)
    }
}

impl Remote for Drive {
    fn list(&self) -> Result<BTreeMap<String, String>, String> {
        let (mut out, mut page) = (BTreeMap::new(), String::new());
        self.ids.borrow_mut().clear();
        loop {
            let mut req = ureq::get(API)
                .set("Authorization", &self.auth())
                .query("spaces", "appDataFolder")
                .query("pageSize", "1000")
                .query("fields", "nextPageToken,files(id,name,appProperties)");
            if !page.is_empty() {
                req = req.query("pageToken", &page);
            }
            let v: serde_json::Value = req.call().map_err(err)?.into_json().map_err(|e| e.to_string())?;
            for f in v["files"].as_array().into_iter().flatten() {
                let (Some(id), Some(name)) = (f["id"].as_str(), f["name"].as_str()) else { continue };
                self.ids.borrow_mut().insert(name.to_string(), id.to_string());
                out.insert(name.to_string(), f["appProperties"]["h"].as_str().unwrap_or("").to_string());
            }
            match v["nextPageToken"].as_str() {
                Some(t) => page = t.to_string(),
                None => return Ok(out),
            }
        }
    }

    fn get(&self, name: &str) -> Result<Vec<u8>, String> {
        let id = self.ids.borrow().get(name).cloned().ok_or("not in the cloud")?;
        let mut buf = vec![];
        ureq::get(&format!("{API}/{id}"))
            .set("Authorization", &self.auth())
            .query("alt", "media")
            .call()
            .map_err(err)?
            .into_reader()
            .take(256 << 20)
            .read_to_end(&mut buf)
            .map_err(|e| e.to_string())?;
        Ok(buf)
    }

    fn put(&self, name: &str, bytes: &[u8], hash: &str) -> Result<(), String> {
        let existing = self.ids.borrow().get(name).cloned();
        let mut meta = serde_json::json!({ "name": name, "appProperties": { "h": hash } });
        if existing.is_none() {
            meta["parents"] = serde_json::json!(["appDataFolder"]);
        }
        let b = "folio-boundary-7f3a";
        let mut body = format!("--{b}\r\nContent-Type: application/json; charset=UTF-8\r\n\r\n{meta}\r\n--{b}\r\nContent-Type: application/octet-stream\r\n\r\n").into_bytes();
        body.extend_from_slice(bytes);
        body.extend_from_slice(format!("\r\n--{b}--").as_bytes());
        let ct = format!("multipart/related; boundary={b}");
        let res = match &existing {
            Some(id) => ureq::request("PATCH", &format!("{UP}/{id}")).set("Authorization", &self.auth()).set("Content-Type", &ct).query("uploadType", "multipart").send_bytes(&body),
            None => ureq::post(UP).set("Authorization", &self.auth()).set("Content-Type", &ct).query("uploadType", "multipart").send_bytes(&body),
        };
        let v: serde_json::Value = res.map_err(err)?.into_json().map_err(|e| e.to_string())?;
        if let Some(id) = v["id"].as_str() {
            self.ids.borrow_mut().insert(name.to_string(), id.to_string());
        }
        Ok(())
    }

    fn del(&self, name: &str) -> Result<(), String> {
        let Some(id) = self.ids.borrow_mut().remove(name) else { return Ok(()) };
        ureq::delete(&format!("{API}/{id}")).set("Authorization", &self.auth()).call().map_err(err)?;
        Ok(())
    }
}
