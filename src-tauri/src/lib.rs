// Solva native shell: encrypted records + documents (docs/APP-PLAN.md). Vault and sync come in steps 4-5.
mod crypt;
mod disk;
mod vault;

use std::sync::Mutex;
use tauri::ipc::{InvokeBody, Request, Response};
use tauri::{Manager, State};

struct App(Mutex<Option<disk::Disk>>, Mutex<String>); // open vault, or why it is locked

fn with<T>(app: &State<App>, f: impl FnOnce(&disk::Disk) -> Result<T, String>) -> Result<T, String> {
    let g = app.0.lock().map_err(|_| "busy".to_string())?;
    match g.as_ref() {
        Some(d) => f(d),
        None => Err(app.1.lock().map(|s| s.clone()).unwrap_or_default()),
    }
}

#[tauri::command]
fn app_info() -> serde_json::Value {
    serde_json::json!({ "version": env!("CARGO_PKG_VERSION"), "os": std::env::consts::OS, "dev": cfg!(debug_assertions) })
}

#[tauri::command]
fn vault_status(app: State<App>) -> serde_json::Value {
    let open = app.0.lock().map(|g| g.is_some()).unwrap_or(false);
    serde_json::json!({ "open": open, "why": app.1.lock().map(|s| s.clone()).unwrap_or_default() })
}

#[tauri::command]
fn rec_all(app: State<App>) -> Result<serde_json::Value, String> {
    with(&app, |d| d.rec_all().map(|(recs, bad)| serde_json::json!({ "recs": recs, "bad": bad })))
}

#[tauri::command]
fn rec_put(app: State<App>, rec: String) -> Result<(), String> {
    with(&app, |d| d.rec_put(&rec))
}

/// Raw bytes in the body; id and meta (hex-encoded JSON) in headers. No base64 round trip.
#[tauri::command]
fn doc_add(app: State<App>, request: Request) -> Result<(), String> {
    let h = |k: &str| request.headers().get(k).and_then(|v| v.to_str().ok()).unwrap_or("").to_string();
    let meta = String::from_utf8(hex::decode(h("meta")).map_err(|e| e.to_string())?).map_err(|e| e.to_string())?;
    let InvokeBody::Raw(bytes) = request.body() else { return Err("expected raw bytes".into()) };
    with(&app, |d| d.doc_add(&h("id"), &meta, bytes))
}

#[tauri::command]
fn doc_open(app: State<App>, id: String) -> Result<Response, String> {
    with(&app, |d| d.doc_open(&id)).map(Response::new)
}

#[tauri::command]
fn doc_list(app: State<App>) -> Result<Vec<String>, String> {
    with(&app, |d| d.doc_list())
}

#[tauri::command]
fn doc_del(app: State<App>, id: String) -> Result<(), String> {
    with(&app, |d| d.doc_del(&id))
}

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    tauri::Builder::default()
        .setup(|app| {
            // debug builds can run on a throwaway folder (tools/app_check.mjs); release always uses the app data dir
            let test_dir = std::env::var_os("SOLVA_DATA_DIR").filter(|_| cfg!(debug_assertions));
            let dir = match test_dir {
                Some(d) => std::path::PathBuf::from(d),
                None => app.path().app_data_dir()?,
            };
            let (disk, why) = match vault::open_key(&dir) {
                Ok(key) => (Some(disk::Disk::new(dir, key)), String::new()),
                Err(e) => (None, e),
            };
            app.manage(App(Mutex::new(disk), Mutex::new(why)));
            Ok(())
        })
        .invoke_handler(tauri::generate_handler![app_info, vault_status, rec_all, rec_put, doc_add, doc_open, doc_list, doc_del])
        .run(tauri::generate_context!())
        .expect("error while running Solva");
}
