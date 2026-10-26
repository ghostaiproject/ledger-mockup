// The device key that wraps the DEK (docs/APP-PLAN.md §4). The secret it gives back is the same every time for the same
// name + challenge, and only after the user proves presence (fingerprint, face or PIN).
// - "hello": Windows Hello key credential (hello_win.rs)
// - "file": debug builds with FOLIO_DEVICE=file (and cargo tests) only: a plain key file, so checks run without a prompt
// - "keystore": Android Keystore HMAC key behind BiometricPrompt (plugins/keystore, Kotlin); Android builds run in CI only
use std::path::Path;

fn file_mode() -> bool {
    cfg!(test) || (cfg!(debug_assertions) && std::env::var("FOLIO_DEVICE").is_ok_and(|v| v == "file"))
}

pub fn kind(_dir: &Path) -> Option<&'static str> {
    if file_mode() {
        return Some("file");
    }
    #[cfg(windows)]
    if crate::hello_win::supported() {
        return Some("hello");
    }
    #[cfg(target_os = "android")]
    if tauri_plugin_keystore::supported() {
        return Some("keystore");
    }
    None
}

pub fn create(dir: &Path, name: &str, challenge: &[u8]) -> Result<Vec<u8>, String> {
    if file_mode() {
        let p = dir.join("device.dev.key");
        if !p.exists() {
            std::fs::write(&p, hex::encode(crate::crypt::random_key().as_ref())).map_err(|e| e.to_string())?;
        }
        return secret(dir, name, challenge);
    }
    #[cfg(windows)]
    return crate::hello_win::create(name, challenge);
    #[cfg(target_os = "android")]
    return tauri_plugin_keystore::create(name, challenge);
    #[allow(unreachable_code)]
    Err("no device key on this system".into())
}

pub fn secret(dir: &Path, name: &str, challenge: &[u8]) -> Result<Vec<u8>, String> {
    if file_mode() {
        use hmac::{Hmac, Mac};
        let key = std::fs::read_to_string(dir.join("device.dev.key")).map_err(|_| "device key file missing".to_string())?;
        let mut mac = <Hmac<sha2::Sha256> as Mac>::new_from_slice(key.trim().as_bytes()).expect("hmac key");
        mac.update(name.as_bytes());
        mac.update(challenge);
        return Ok(mac.finalize().into_bytes().to_vec());
    }
    #[cfg(windows)]
    return crate::hello_win::secret(name, challenge);
    #[cfg(target_os = "android")]
    return tauri_plugin_keystore::secret(name, challenge);
    #[allow(unreachable_code)]
    Err("no device key on this system".into())
}
