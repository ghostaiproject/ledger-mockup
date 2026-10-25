// Folio native shell: vault (DEK wrapped by device key + passphrase), encrypted records + documents (docs/APP-PLAN.md).
mod crypt;
mod device;
mod disk;
mod drive;
mod oauth;
mod sync;
#[cfg(windows)]
mod hello_win;
mod vault;

use std::path::{Path, PathBuf};
use std::sync::Mutex;
use tauri::ipc::{InvokeBody, Request, Response};
use tauri::{AppHandle, Manager, State};
use tauri_plugin_opener::OpenerExt;

struct App {
    disk: Mutex<Option<disk::Disk>>, // Some = unlocked; dropping it zeroizes the DEK
    dir: PathBuf,
}

fn with<T>(app: &State<App>, f: impl FnOnce(&disk::Disk) -> Result<T, String>) -> Result<T, String> {
    let g = app.disk.lock().map_err(|_| "busy".to_string())?;
    g.as_ref().map_or(Err("locked".into()), f)
}

/// Argon2id and Windows Hello block: run them off the UI thread, then open the vault with the key they give.
async fn open_with(app: State<'_, App>, f: impl FnOnce(&Path) -> Result<crypt::Key, String> + Send + 'static) -> Result<(), String> {
    let dir = app.dir.clone();
    let key = tauri::async_runtime::spawn_blocking(move || f(&dir)).await.map_err(|e| e.to_string())??;
    *app.disk.lock().map_err(|_| "busy".to_string())? = Some(disk::Disk::new(app.dir.clone(), key));
    Ok(())
}

#[tauri::command]
fn app_info() -> serde_json::Value {
    serde_json::json!({ "version": env!("CARGO_PKG_VERSION"), "os": std::env::consts::OS, "dev": cfg!(debug_assertions) })
}

/// state: "new" | "locked" | "open"; device: "hello" | "file" | null (what this PC offers); deviceReady: the vault opens with it.
#[tauri::command]
fn vault_status(app: State<App>) -> serde_json::Value {
    let open = app.disk.lock().map(|g| g.is_some()).unwrap_or(false);
    let (state, ready) = vault::status(&app.dir);
    let state = if open { "open" } else { state };
    serde_json::json!({ "state": state, "device": device::kind(&app.dir), "deviceReady": ready, "minPass": vault::MIN_PASS })
}

#[tauri::command]
async fn vault_create(app: State<'_, App>, pass: String) -> Result<(), String> {
    let pass = zeroize::Zeroizing::new(pass);
    open_with(app, move |d| vault::create(d, &pass, vault::COST)).await
}

/// No passphrase = device key (fingerprint, face or PIN).
#[tauri::command]
async fn vault_unlock(app: State<'_, App>, pass: Option<String>) -> Result<(), String> {
    match pass.map(zeroize::Zeroizing::new) {
        Some(p) => open_with(app, move |d| vault::open_pass(d, &p)).await,
        None => open_with(app, vault::open_device).await,
    }
}

#[tauri::command]
fn vault_lock(app: State<App>) {
    if let Ok(mut g) = app.disk.lock() {
        *g = None;
    }
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

/// {configured: a Google client id exists, connected: signed in, last: ms of the last good sync}
#[tauri::command]
fn sync_status(app: State<App>) -> serde_json::Value {
    let st = with(&app, |d| Ok(sync::load(d))).unwrap_or_default();
    serde_json::json!({ "configured": oauth::client(&app.dir).is_some(), "connected": st.refresh.is_some(), "last": st.last })
}

#[tauri::command]
async fn sync_connect(handle: AppHandle, app: State<'_, App>) -> Result<(), String> {
    let c = oauth::client(&app.dir).ok_or("no Google client id: see docs/APP-PLAN.md section 6")?;
    let h2 = handle.clone();
    let token = tauri::async_runtime::spawn_blocking(move || oauth::connect(&c, |u| h2.opener().open_url(u, None::<&str>).map_err(|e| e.to_string())))
        .await
        .map_err(|e| e.to_string())??;
    with(&app, |d| {
        let mut st = sync::load(d);
        st.refresh = Some(token);
        sync::save(d, &st)
    })
}

#[tauri::command]
fn sync_disconnect(app: State<App>) -> Result<(), String> {
    with(&app, |d| {
        let mut st = sync::load(d);
        st.refresh = None;
        st.base.clear();
        sync::save(d, &st)
    })
}

/// Push and pull. Needs the vault open and the network; the report says what moved.
#[tauri::command]
async fn sync_run(app: State<'_, App>) -> Result<serde_json::Value, String> {
    let c = oauth::client(&app.dir).ok_or("no Google client id")?;
    let (dir, key) = {
        let g = app.disk.lock().map_err(|_| "busy".to_string())?;
        let d = g.as_ref().ok_or("locked")?;
        (app.dir.clone(), d.key_copy())
    };
    let rep = tauri::async_runtime::spawn_blocking(move || -> Result<sync::Report, String> {
        let d = disk::Disk::new(dir, key);
        let mut st = sync::load(&d);
        let refresh = st.refresh.clone().ok_or("not connected")?;
        let drive = drive::Drive::new(oauth::access_token(&c, &refresh)?);
        let rep = sync::run(&d, &drive, &mut st)?;
        st.last = std::time::SystemTime::now().duration_since(std::time::UNIX_EPOCH).map(|t| t.as_millis() as u64).unwrap_or(0);
        sync::save(&d, &st)?;
        Ok(rep)
    })
    .await
    .map_err(|e| e.to_string())??;
    serde_json::to_value(rep).map_err(|e| e.to_string())
}

/// Losing versions kept after a clash, each {id, rel, rec}.
#[tauri::command]
fn conflicts_list(app: State<App>) -> Result<Vec<serde_json::Value>, String> {
    with(&app, |d| {
        Ok(d.side_list("sync/conflicts")
            .into_iter()
            .filter_map(|rel| {
                let mut v: serde_json::Value = serde_json::from_str(&d.side_get(&rel)?).ok()?;
                v["id"] = rel.into();
                Some(v)
            })
            .collect())
    })
}

#[tauri::command]
fn conflict_del(app: State<App>, id: String) -> Result<(), String> {
    if !id.starts_with("sync/conflicts/") || id.contains("..") {
        return Err("bad id".into());
    }
    with(&app, |d| d.raw_del(&id))
}

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    let builder = tauri::Builder::default();
    #[cfg(target_os = "android")]
    let builder = builder.plugin(tauri_plugin_keystore::init());
    builder
        .plugin(tauri_plugin_opener::init())
        .setup(|app| {
            // debug builds can run on a throwaway folder (tools/app_check.mjs); release always uses the app data dir
            let test_dir = std::env::var_os("FOLIO_DATA_DIR").filter(|_| cfg!(debug_assertions));
            let dir = match test_dir {
                Some(d) => std::path::PathBuf::from(d),
                None => app.path().app_data_dir()?,
            };
            app.manage(App { disk: Mutex::new(None), dir });
            Ok(())
        })
        .invoke_handler(tauri::generate_handler![app_info, vault_status, vault_create, vault_unlock, vault_lock, rec_all, rec_put, doc_add, doc_open, doc_list, doc_del, sync_status, sync_connect, sync_disconnect, sync_run, conflicts_list, conflict_del])
        .run(tauri::generate_context!())
        .expect("error while running Folio");
}
