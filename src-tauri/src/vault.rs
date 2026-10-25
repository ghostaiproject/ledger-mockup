// Data key handling. Step 3: a temporary key file, debug builds only.
// Step 4 replaces this with the DEK wrapped by Windows Hello / Android Keystore + a passphrase (docs/APP-PLAN.md §4).
use crate::crypt::{self, Key};
use std::fs;
use std::path::Path;

pub fn open_key(dir: &Path) -> Result<Key, String> {
    if !cfg!(debug_assertions) {
        return Err("vault not set up (release builds need the device-key vault)".into());
    }
    let path = dir.join("vault.dev.key");
    if let Ok(hexkey) = fs::read_to_string(&path) {
        let bytes = hex::decode(hexkey.trim()).map_err(|e| e.to_string())?;
        let arr: [u8; 32] = bytes.try_into().map_err(|_| "bad dev key".to_string())?;
        return Ok(zeroize::Zeroizing::new(arr));
    }
    fs::create_dir_all(dir).map_err(|e| e.to_string())?;
    let k = crypt::random_key();
    fs::write(&path, hex::encode(k.as_ref())).map_err(|e| e.to_string())?;
    Ok(k)
}
