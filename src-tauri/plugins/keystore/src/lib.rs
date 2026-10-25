// Android device key: a Keystore HMAC key that needs fingerprint, face or PIN on every use (Kotlin side, android/).
// HMAC-SHA256 is deterministic, so the same name + challenge always gives the same secret, like the Windows Hello key.
use serde::{Deserialize, Serialize};
use std::sync::OnceLock;
use tauri::plugin::{Builder, PluginHandle, TauriPlugin};

static HANDLE: OnceLock<PluginHandle<tauri::Wry>> = OnceLock::new();

#[cfg_attr(not(mobile), allow(dead_code))]
#[derive(Serialize)]
struct Args<'a> {
    name: &'a str,
    challenge: String,
}
#[cfg_attr(not(mobile), allow(dead_code))]
#[derive(Deserialize)]
struct Secret {
    secret: String,
}
#[cfg_attr(not(mobile), allow(dead_code))]
#[derive(Deserialize)]
struct Supported {
    supported: bool,
}

#[cfg_attr(not(mobile), allow(dead_code))]
fn handle() -> Result<&'static PluginHandle<tauri::Wry>, String> {
    HANDLE.get().ok_or_else(|| "no device key on this system".to_string())
}

#[cfg(mobile)]
pub fn supported() -> bool {
    handle().ok().and_then(|h| h.run_mobile_plugin::<Supported>("supported", ()).ok()).is_some_and(|s| s.supported)
}

#[cfg(mobile)]
fn call(cmd: &str, name: &str, challenge: &[u8]) -> Result<Vec<u8>, String> {
    let r: Secret = handle()?.run_mobile_plugin(cmd, Args { name, challenge: hex::encode(challenge) }).map_err(|e| e.to_string())?;
    hex::decode(r.secret).map_err(|e| e.to_string())
}

// Desktop builds compile the crate only for `cargo check`; the key lives in Kotlin
#[cfg(not(mobile))]
pub fn supported() -> bool {
    false
}

#[cfg(not(mobile))]
fn call(_cmd: &str, name: &str, challenge: &[u8]) -> Result<Vec<u8>, String> {
    let _ = (name, challenge);
    Err("no device key on this system".into())
}

/// New Keystore key (replaces one with the same name), then its first secret.
pub fn create(name: &str, challenge: &[u8]) -> Result<Vec<u8>, String> {
    call("create", name, challenge)
}

pub fn secret(name: &str, challenge: &[u8]) -> Result<Vec<u8>, String> {
    call("secret", name, challenge)
}

pub fn init() -> TauriPlugin<tauri::Wry> {
    Builder::<tauri::Wry>::new("keystore")
        .setup(|_app, _api| {
            #[cfg(target_os = "android")]
            {
                let _ = HANDLE.set(_api.register_android_plugin("ca.folio.keystore", "KeystorePlugin")?);
            }
            Ok(())
        })
        .build()
}

