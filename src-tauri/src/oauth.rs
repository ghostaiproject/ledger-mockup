// Google sign-in for a desktop/mobile app: OAuth 2.0 + PKCE with a loopback redirect (http://127.0.0.1:<port>).
// The app needs an OAuth client id of type "Desktop app" from the owner's Google Cloud project: dir/google.json
// {"client_id": "...", "client_secret": "..."} (Google gives desktop apps a secret that is not secret), or the env vars
// FOLIO_GOOGLE_CLIENT_ID / FOLIO_GOOGLE_CLIENT_SECRET. The only scope asked is drive.appdata.
use base64::{engine::general_purpose::URL_SAFE_NO_PAD as B64, Engine};
use rand::RngCore;
use sha2::{Digest, Sha256};
use std::io::{Read, Write};
use std::net::TcpListener;
use std::path::Path;
use std::time::{Duration, Instant};

const AUTH: &str = "https://accounts.google.com/o/oauth2/v2/auth";
const TOKEN: &str = "https://oauth2.googleapis.com/token";
const SCOPE: &str = "https://www.googleapis.com/auth/drive.appdata";

pub struct Client {
    pub id: String,
    pub secret: String,
}

pub fn client(dir: &Path) -> Option<Client> {
    let from_file = std::fs::read_to_string(dir.join("google.json")).ok().and_then(|s| serde_json::from_str::<serde_json::Value>(&s).ok());
    let pick = |env: &str, key: &str| {
        std::env::var(env).ok().filter(|v| !v.is_empty()).or_else(|| from_file.as_ref().and_then(|v| v[key].as_str().map(String::from)))
    };
    Some(Client { id: pick("FOLIO_GOOGLE_CLIENT_ID", "client_id")?, secret: pick("FOLIO_GOOGLE_CLIENT_SECRET", "client_secret").unwrap_or_default() })
}

fn rnd(n: usize) -> String {
    let mut b = vec![0u8; n];
    rand::thread_rng().fill_bytes(&mut b);
    B64.encode(b)
}

fn form(c: &Client, pairs: &[(&str, &str)]) -> Result<serde_json::Value, String> {
    let mut all = vec![("client_id", c.id.as_str())];
    if !c.secret.is_empty() {
        all.push(("client_secret", c.secret.as_str()));
    }
    all.extend_from_slice(pairs);
    match ureq::post(TOKEN).send_form(&all) {
        Ok(r) => r.into_json().map_err(|e| e.to_string()),
        Err(ureq::Error::Status(_, r)) => Err(format!("Google sign-in refused: {}", r.into_string().unwrap_or_default().chars().take(160).collect::<String>())),
        Err(e) => Err(format!("network: {e}")),
    }
}

fn enc(v: &str) -> String {
    v.bytes().map(|b| if b.is_ascii_alphanumeric() || b"-_.~".contains(&b) { (b as char).to_string() } else { format!("%{b:02X}") }).collect()
}

/// Opens the consent page with `open_url`, waits for Google to redirect to the loopback port, returns the refresh token.
pub fn connect(c: &Client, open_url: impl FnOnce(&str) -> Result<(), String>) -> Result<String, String> {
    let l = TcpListener::bind("127.0.0.1:0").map_err(|e| e.to_string())?;
    l.set_nonblocking(true).map_err(|e| e.to_string())?;
    let redirect = format!("http://127.0.0.1:{}", l.local_addr().map_err(|e| e.to_string())?.port());
    let (verifier, state) = (rnd(48), rnd(16));
    let challenge = B64.encode(Sha256::digest(verifier.as_bytes()));
    let pairs = [("client_id", c.id.as_str()), ("redirect_uri", &redirect), ("response_type", "code"), ("scope", SCOPE), ("state", &state),
        ("code_challenge", &challenge), ("code_challenge_method", "S256"), ("access_type", "offline"), ("prompt", "consent")];
    let url = format!("{AUTH}?{}", pairs.iter().map(|(k, v)| format!("{k}={}", enc(v))).collect::<Vec<_>>().join("&"));
    open_url(&url)?;
    let t0 = Instant::now();
    let (code, mut sock) = loop {
        if t0.elapsed() > Duration::from_secs(180) {
            return Err("sign-in timed out".into());
        }
        match l.accept() {
            Ok((mut s, _)) => {
                let _ = s.set_nonblocking(false);
                let mut buf = [0u8; 4096];
                let n = s.read(&mut buf).unwrap_or(0);
                let line = String::from_utf8_lossy(&buf[..n]).lines().next().unwrap_or("").to_string();
                let query = line.split_whitespace().nth(1).and_then(|p| p.split('?').nth(1)).unwrap_or("").to_string();
                let get = |k: &str| query.split('&').find_map(|kv| kv.strip_prefix(&format!("{k}=")).map(String::from));
                if let Some(code) = get("code").filter(|_| get("state").as_deref() == Some(state.as_str())) {
                    break (code, s);
                }
                let _ = s.write_all(b"HTTP/1.1 400 Bad Request\r\nContent-Length: 0\r\n\r\n");
                if get("error").is_some() {
                    return Err("Google sign-in cancelled".into());
                }
            }
            Err(_) => std::thread::sleep(Duration::from_millis(150)),
        }
    };
    let page = "<html><body style=\"font-family:sans-serif;text-align:center;margin-top:20vh\"><h2>Folio</h2><p>You are connected. You can close this tab.</p></body></html>";
    let _ = sock.write_all(format!("HTTP/1.1 200 OK\r\nContent-Type: text/html; charset=utf-8\r\nContent-Length: {}\r\n\r\n{page}", page.len()).as_bytes());
    let code = code.replace("%2F", "/");
    let v = form(c, &[("code", &code), ("code_verifier", &verifier), ("redirect_uri", &redirect), ("grant_type", "authorization_code")])?;
    v["refresh_token"].as_str().map(String::from).ok_or_else(|| "Google gave no refresh token".to_string())
}

pub fn access_token(c: &Client, refresh: &str) -> Result<String, String> {
    let v = form(c, &[("refresh_token", refresh), ("grant_type", "refresh_token")])?;
    v["access_token"].as_str().map(String::from).ok_or_else(|| "Google gave no access token".to_string())
}
