// AES-256-GCM sealing and HMAC file names (docs/APP-PLAN.md §4-5).
use aes_gcm::aead::{Aead, KeyInit, Payload};
use aes_gcm::{Aes256Gcm, Nonce};
use hmac::{Hmac, Mac};
use rand::RngCore;
use sha2::Sha256;
use zeroize::Zeroizing;

pub type Key = Zeroizing<[u8; 32]>;

pub fn random_key() -> Key {
    let mut k = Zeroizing::new([0u8; 32]);
    rand::rngs::OsRng.fill_bytes(k.as_mut());
    k
}

/// nonce (12 bytes) || ciphertext+tag. `aad` binds the bytes to their place (file path), so files can't be swapped.
pub fn seal(key: &Key, plain: &[u8], aad: &[u8]) -> Vec<u8> {
    let cipher = Aes256Gcm::new_from_slice(key.as_ref()).expect("32-byte key");
    let mut nonce = [0u8; 12];
    rand::rngs::OsRng.fill_bytes(&mut nonce);
    let ct = cipher.encrypt(Nonce::from_slice(&nonce), Payload { msg: plain, aad }).expect("encrypt");
    let mut out = Vec::with_capacity(12 + ct.len());
    out.extend_from_slice(&nonce);
    out.extend_from_slice(&ct);
    out
}

pub fn open(key: &Key, sealed: &[u8], aad: &[u8]) -> Result<Zeroizing<Vec<u8>>, String> {
    if sealed.len() < 12 + 16 {
        return Err("file too short".into());
    }
    let cipher = Aes256Gcm::new_from_slice(key.as_ref()).expect("32-byte key");
    let (nonce, ct) = sealed.split_at(12);
    cipher
        .decrypt(Nonce::from_slice(nonce), Payload { msg: ct, aad })
        .map(Zeroizing::new)
        .map_err(|_| "wrong key or damaged file".to_string())
}

/// File name for a record or document: reveals nothing about the client or the record id.
pub fn name(key: &Key, label: &str) -> String {
    let mut mac = <Hmac<Sha256> as Mac>::new_from_slice(key.as_ref()).expect("hmac key");
    mac.update(b"solva-name\0");
    mac.update(label.as_bytes());
    hex::encode(&mac.finalize().into_bytes()[..16])
}

#[cfg(test)]
mod tests {
    use super::*;
    #[test]
    fn round_trip_and_tamper() {
        let k = random_key();
        let s = seal(&k, b"bank statement", b"rec/eng/x");
        assert_eq!(&open(&k, &s, b"rec/eng/x").unwrap()[..], b"bank statement");
        assert!(open(&k, &s, b"rec/eng/y").is_err()); // moved file
        let mut bad = s.clone();
        bad[20] ^= 1;
        assert!(open(&k, &bad, b"rec/eng/x").is_err()); // changed byte
        assert!(open(&random_key(), &s, b"rec/eng/x").is_err()); // other key
        assert_eq!(name(&k, "eng/a"), name(&k, "eng/a"));
        assert_ne!(name(&k, "eng/a"), name(&k, "eng/b"));
    }
}
