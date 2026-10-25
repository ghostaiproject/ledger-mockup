// Windows Hello device key (docs/APP-PLAN.md §4): a KeyCredentialManager RSA key in the TPM signs a fixed challenge.
// RSA PKCS#1 v1.5 signatures are deterministic, so the same challenge gives the same bytes → HKDF → wrap key.
// The key never leaves the TPM and every signature needs fingerprint, face or PIN.
use std::sync::OnceLock;
use windows::core::{HSTRING, w};
use windows::Security::Credentials::{KeyCredential, KeyCredentialCreationOption, KeyCredentialManager, KeyCredentialStatus};
use windows::Security::Cryptography::CryptographicBuffer;
use windows::Win32::UI::WindowsAndMessaging::{FindWindowW, SetForegroundWindow};

pub fn supported() -> bool {
    static S: OnceLock<bool> = OnceLock::new();
    *S.get_or_init(|| KeyCredentialManager::IsSupportedAsync().and_then(|op| op.join()).unwrap_or(false))
}

fn why(s: KeyCredentialStatus) -> Result<(), String> {
    match s {
        KeyCredentialStatus::Success => Ok(()),
        KeyCredentialStatus::UserCanceled | KeyCredentialStatus::UserPrefersPassword => Err("Windows Hello cancelled".into()),
        KeyCredentialStatus::NotFound => Err("the Windows Hello key for this vault is gone: use the passphrase".into()),
        KeyCredentialStatus::SecurityDeviceLocked => Err("Windows Hello is locked for now (too many tries)".into()),
        _ => Err("Windows Hello failed".into()),
    }
}

/// From a desktop app the Hello dialog can open behind our window: bring it to the front once it shows up.
fn raise_dialog() {
    std::thread::spawn(|| {
        for _ in 0..50 {
            std::thread::sleep(std::time::Duration::from_millis(100));
            if let Ok(h) = unsafe { FindWindowW(w!("Credential Dialog Xaml Host"), None) } {
                let _ = unsafe { SetForegroundWindow(h) };
                return;
            }
        }
    });
}

fn sign(cred: &KeyCredential, challenge: &[u8]) -> Result<Vec<u8>, String> {
    let msg = [b"folio-hello/v1\0".as_slice(), challenge].concat();
    let buf = CryptographicBuffer::CreateFromByteArray(&msg).map_err(|e| e.to_string())?;
    raise_dialog();
    let r = cred.RequestSignAsync(&buf).and_then(|op| op.join()).map_err(|e| e.to_string())?;
    why(r.Status().map_err(|e| e.to_string())?)?;
    let mut out = windows::core::Array::<u8>::new();
    CryptographicBuffer::CopyToByteArray(&r.Result().map_err(|e| e.to_string())?, &mut out).map_err(|e| e.to_string())?;
    Ok(out.to_vec())
}

pub fn create(name: &str, challenge: &[u8]) -> Result<Vec<u8>, String> {
    raise_dialog();
    let r = KeyCredentialManager::RequestCreateAsync(&HSTRING::from(name), KeyCredentialCreationOption::ReplaceExisting)
        .and_then(|op| op.join())
        .map_err(|e| e.to_string())?;
    why(r.Status().map_err(|e| e.to_string())?)?;
    sign(&r.Credential().map_err(|e| e.to_string())?, challenge)
}

pub fn secret(name: &str, challenge: &[u8]) -> Result<Vec<u8>, String> {
    let r = KeyCredentialManager::OpenAsync(&HSTRING::from(name)).and_then(|op| op.join()).map_err(|e| e.to_string())?;
    why(r.Status().map_err(|e| e.to_string())?)?;
    sign(&r.Credential().map_err(|e| e.to_string())?, challenge)
}
