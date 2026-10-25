// Data key (DEK) handling (docs/APP-PLAN.md §4). One random DEK per vault, stored only wrapped:
// - vault.local.json: wrapped by this device's key (Windows Hello / Android Keystore), never synced
// - vault.json: wrapped by Argon2id(passphrase), the file that goes to the cloud folder in step 5
use crate::crypt::{self, Key};
use crate::device;
use argon2::{Algorithm, Argon2, Params, Version};
use hkdf::Hkdf;
use rand::RngCore;
use serde::{Deserialize, Serialize};
use sha2::Sha256;
use std::fs;
use std::path::Path;
use zeroize::Zeroizing;

pub const MIN_PASS: usize = 10;
const LOCAL: &str = "vault.local.json";
const SHARED: &str = "vault.json";

#[derive(Serialize, Deserialize, Clone, Copy)]
pub struct Cost {
    pub m: u32, // KiB
    pub t: u32,
    pub p: u32,
}
pub const COST: Cost = Cost { m: 64 * 1024, t: 3, p: 1 };

#[derive(Serialize, Deserialize)]
struct PassWrap {
    v: u32,
    id: String,
    alg: String,
    cost: Cost,
    salt: String,
    dek: String,
}

#[derive(Serialize, Deserialize)]
struct DevWrap {
    v: u32,
    id: String,
    kind: String,
    name: String,
    salt: String,
    dek: String,
}

fn rand_hex(n: usize) -> String {
    let mut b = vec![0u8; n];
    rand::rngs::OsRng.fill_bytes(&mut b);
    hex::encode(b)
}

fn read<T: for<'a> Deserialize<'a>>(dir: &Path, f: &str) -> Option<T> {
    serde_json::from_str(&fs::read_to_string(dir.join(f)).ok()?).ok()
}

fn write<T: Serialize>(dir: &Path, f: &str, v: &T) -> Result<(), String> {
    fs::create_dir_all(dir).map_err(|e| e.to_string())?;
    let tmp = dir.join(format!("{f}.tmp"));
    fs::write(&tmp, serde_json::to_vec_pretty(v).map_err(|e| e.to_string())?).map_err(|e| e.to_string())?;
    fs::rename(&tmp, dir.join(f)).map_err(|e| e.to_string())
}

fn pass_key(pass: &str, salt: &[u8], c: Cost) -> Result<Key, String> {
    let params = Params::new(c.m, c.t, c.p, Some(32)).map_err(|e| e.to_string())?;
    let mut k = Zeroizing::new([0u8; 32]);
    Argon2::new(Algorithm::Argon2id, Version::V0x13, params)
        .hash_password_into(pass.as_bytes(), salt, k.as_mut())
        .map_err(|e| e.to_string())?;
    Ok(k)
}

fn dev_key(secret: &[u8], salt: &[u8]) -> Key {
    let mut k = Zeroizing::new([0u8; 32]);
    Hkdf::<Sha256>::new(Some(salt), secret).expand(b"folio-device-wrap/v1", k.as_mut()).expect("32 bytes");
    k
}

fn unwrap_dek(wrap: &Key, sealed_hex: &str, aad: &str) -> Result<Key, String> {
    let sealed = hex::decode(sealed_hex).map_err(|e| e.to_string())?;
    let plain = crypt::open(wrap, &sealed, aad.as_bytes())?;
    let arr: [u8; 32] = plain[..].try_into().map_err(|_| "bad vault file".to_string())?;
    Ok(Zeroizing::new(arr))
}

/// What the unlock screen needs: "new" (no vault yet), "locked"; `device` = this vault can open with the device key.
pub fn status(dir: &Path) -> (&'static str, bool) {
    let shared = dir.join(SHARED).exists();
    let local: Option<DevWrap> = read(dir, LOCAL);
    let usable = local.as_ref().is_some_and(|w| Some(w.kind.as_str()) == device::kind(dir));
    (if shared || local.is_some() { "locked" } else { "new" }, usable)
}

/// New vault: random DEK (debug: adopts the step 3 dev key so test data stays readable), passphrase wrap, device wrap.
pub fn create(dir: &Path, pass: &str, cost: Cost) -> Result<Key, String> {
    if status(dir).0 != "new" {
        return Err("a vault already exists".into());
    }
    if pass.chars().count() < MIN_PASS {
        return Err(format!("passphrase needs at least {MIN_PASS} characters"));
    }
    let old = dir.join("vault.dev.key");
    let dek = match fs::read_to_string(&old).ok().filter(|_| cfg!(debug_assertions)) {
        Some(h) => {
            let arr: [u8; 32] = hex::decode(h.trim()).ok().and_then(|b| b.try_into().ok()).ok_or("bad dev key")?;
            Zeroizing::new(arr)
        }
        None => crypt::random_key(),
    };
    let id = rand_hex(8);
    let salt = rand_hex(16);
    let wrap = pass_key(pass, &hex::decode(&salt).unwrap(), cost)?;
    let dek_hex = hex::encode(crypt::seal(&wrap, dek.as_ref(), format!("folio-vault/{id}/pass").as_bytes()));
    write(dir, SHARED, &PassWrap { v: 1, id: id.clone(), alg: "argon2id".into(), cost, salt, dek: dek_hex })?;
    if device::kind(dir).is_some() {
        add_device(dir, &id, &dek)?;
    }
    let _ = fs::remove_file(old);
    Ok(dek)
}

fn add_device(dir: &Path, id: &str, dek: &Key) -> Result<(), String> {
    let kind = device::kind(dir).ok_or("no device key here")?;
    let (salt, name) = (rand_hex(16), format!("Folio vault {id}"));
    let secret = device::create(dir, &name, salt.as_bytes())?;
    let wrap = dev_key(&secret, salt.as_bytes());
    let dek_hex = hex::encode(crypt::seal(&wrap, dek.as_ref(), format!("folio-vault/{id}/{kind}").as_bytes()));
    write(dir, LOCAL, &DevWrap { v: 1, id: id.into(), kind: kind.into(), name, salt, dek: dek_hex })
}

/// Fingerprint / face / PIN (Windows Hello), no passphrase.
pub fn open_device(dir: &Path) -> Result<Key, String> {
    let w: DevWrap = read(dir, LOCAL).ok_or("this device has no key for the vault yet: use the passphrase")?;
    let secret = device::secret(dir, &w.name, w.salt.as_bytes())?;
    unwrap_dek(&dev_key(&secret, w.salt.as_bytes()), &w.dek, &format!("folio-vault/{}/{}", w.id, w.kind))
        .map_err(|_| "the device key changed: use the passphrase".to_string())
}

/// Passphrase unlock. A device without its own wrap yet (new PC, key reset) gets one, so next time is fingerprint/PIN.
pub fn open_pass(dir: &Path, pass: &str) -> Result<Key, String> {
    let w: PassWrap = read(dir, SHARED).ok_or("no vault.json here")?;
    let salt = hex::decode(&w.salt).map_err(|e| e.to_string())?;
    let dek = unwrap_dek(&pass_key(pass, &salt, w.cost)?, &w.dek, &format!("folio-vault/{}/pass", w.id))
        .map_err(|_| "wrong passphrase".to_string())?;
    if !status(dir).1 && device::kind(dir).is_some() {
        let _ = add_device(dir, &w.id, &dek); // optional: a cancelled Hello prompt still unlocks
    }
    Ok(dek)
}

#[cfg(test)]
mod tests {
    use super::*;
    const FAST: Cost = Cost { m: 256, t: 1, p: 1 };

    fn tmp(tag: &str) -> std::path::PathBuf {
        let d = std::env::temp_dir().join(format!("folio-vault-{tag}-{}", std::process::id()));
        let _ = fs::remove_dir_all(&d);
        d
    }

    #[test]
    fn passphrase_and_device_open_same_key() {
        let d = tmp("both");
        assert_eq!(status(&d).0, "new");
        assert!(create(&d, "short", FAST).is_err());
        let k = create(&d, "correct horse battery", FAST).unwrap();
        assert_eq!(status(&d), ("locked", true));
        assert!(create(&d, "correct horse battery", FAST).is_err()); // never overwrites a vault
        assert_eq!(open_device(&d).unwrap()[..], k[..]);
        assert_eq!(open_pass(&d, "correct horse battery").unwrap()[..], k[..]);
        assert_eq!(open_pass(&d, "wrong horse battery").unwrap_err(), "wrong passphrase");
        let raw = fs::read_to_string(d.join(SHARED)).unwrap() + &fs::read_to_string(d.join(LOCAL)).unwrap();
        assert!(!raw.contains(&hex::encode(k.as_ref()))); // DEK never stored in clear
        let _ = fs::remove_dir_all(&d);
    }

    #[test]
    fn new_device_gets_its_wrap_from_the_passphrase() {
        let d = tmp("newdev");
        let k = create(&d, "correct horse battery", FAST).unwrap();
        fs::remove_file(d.join(LOCAL)).unwrap(); // as if vault.json just came from the cloud
        assert!(open_device(&d).is_err());
        assert_eq!(open_pass(&d, "correct horse battery").unwrap()[..], k[..]);
        assert_eq!(open_device(&d).unwrap()[..], k[..]);
        let _ = fs::remove_dir_all(&d);
    }
}
