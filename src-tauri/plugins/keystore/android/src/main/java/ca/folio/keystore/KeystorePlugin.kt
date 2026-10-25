package ca.folio.keystore

import android.app.Activity
import android.security.keystore.KeyGenParameterSpec
import android.security.keystore.KeyProperties
import androidx.biometric.BiometricManager
import androidx.biometric.BiometricManager.Authenticators.BIOMETRIC_STRONG
import androidx.biometric.BiometricManager.Authenticators.DEVICE_CREDENTIAL
import androidx.biometric.BiometricPrompt
import androidx.core.content.ContextCompat
import androidx.fragment.app.FragmentActivity
import app.tauri.annotation.Command
import app.tauri.annotation.InvokeArg
import app.tauri.annotation.TauriPlugin
import app.tauri.plugin.Invoke
import app.tauri.plugin.JSObject
import app.tauri.plugin.Plugin
import java.security.KeyStore
import javax.crypto.KeyGenerator
import javax.crypto.Mac
import javax.crypto.SecretKey

@InvokeArg
class KeyArgs {
    lateinit var name: String
    lateinit var challenge: String // hex
}

/**
 * Device key for Folio on Android: a Keystore HMAC-SHA256 key that needs fingerprint, face or the device PIN on every
 * use (BiometricPrompt + CryptoObject). HMAC is deterministic: the same name + challenge always gives the same secret.
 * The key never leaves the secure hardware. Rust turns the secret into the wrap key (HKDF), like the Windows Hello path.
 */
@TauriPlugin
class KeystorePlugin(private val activity: Activity) : Plugin(activity) {
    private val auth = BIOMETRIC_STRONG or DEVICE_CREDENTIAL
    private val store = KeyStore.getInstance("AndroidKeyStore").apply { load(null) }

    private fun alias(name: String) = "folio-$name"

    @Command
    fun supported(invoke: Invoke) {
        val ok = BiometricManager.from(activity).canAuthenticate(auth) == BiometricManager.BIOMETRIC_SUCCESS
        invoke.resolve(JSObject().put("supported", ok))
    }

    @Command
    fun create(invoke: Invoke) {
        val a = invoke.parseArgs(KeyArgs::class.java)
        try {
            val al = alias(a.name)
            if (store.containsAlias(al)) store.deleteEntry(al)
            val spec = KeyGenParameterSpec.Builder(al, KeyProperties.PURPOSE_SIGN)
                .setUserAuthenticationRequired(true)
                .setUserAuthenticationParameters(0, KeyProperties.AUTH_BIOMETRIC_STRONG or KeyProperties.AUTH_DEVICE_CREDENTIAL)
                .setInvalidatedByBiometricEnrollment(false)
                .build()
            KeyGenerator.getInstance(KeyProperties.KEY_ALGORITHM_HMAC_SHA256, "AndroidKeyStore").apply { init(spec) }.generateKey()
            ask(invoke, a)
        } catch (e: Exception) {
            invoke.reject("device key failed: ${e.message}")
        }
    }

    @Command
    fun secret(invoke: Invoke) {
        ask(invoke, invoke.parseArgs(KeyArgs::class.java))
    }

    private fun ask(invoke: Invoke, a: KeyArgs) {
        val key = store.getKey(alias(a.name), null) as? SecretKey
        if (key == null) { invoke.reject("the device key for this vault is gone: use the passphrase"); return }
        val mac = try {
            Mac.getInstance("HmacSHA256").apply { init(key) }
        } catch (e: Exception) { // key invalidated (lock screen removed or reset)
            invoke.reject("the device key for this vault is gone: use the passphrase"); return
        }
        val act = activity as? FragmentActivity
        if (act == null) { invoke.reject("device key failed: no activity"); return }
        act.runOnUiThread {
            val cb = object : BiometricPrompt.AuthenticationCallback() {
                override fun onAuthenticationSucceeded(r: BiometricPrompt.AuthenticationResult) {
                    try {
                        val m = r.cryptoObject!!.mac!!
                        val out = m.doFinal(hex(a.challenge).let { a.name.toByteArray() + it })
                        invoke.resolve(JSObject().put("secret", out.joinToString("") { "%02x".format(it) }))
                    } catch (e: Exception) { invoke.reject("device key failed: ${e.message}") }
                }
                override fun onAuthenticationError(code: Int, msg: CharSequence) {
                    val cancelled = code == BiometricPrompt.ERROR_USER_CANCELED || code == BiometricPrompt.ERROR_NEGATIVE_BUTTON || code == BiometricPrompt.ERROR_CANCELED
                    val locked = code == BiometricPrompt.ERROR_LOCKOUT || code == BiometricPrompt.ERROR_LOCKOUT_PERMANENT
                    invoke.reject(if (cancelled) "Hello cancelled" else if (locked) "locked for now" else "device key failed: $msg")
                }
            }
            val info = BiometricPrompt.PromptInfo.Builder()
                .setTitle("Folio")
                .setSubtitle("Déverrouiller / Unlock")
                .setAllowedAuthenticators(auth)
                .build()
            BiometricPrompt(act, ContextCompat.getMainExecutor(act), cb).authenticate(info, BiometricPrompt.CryptoObject(mac))
        }
    }

    private fun hex(s: String) = ByteArray(s.length / 2) { s.substring(it * 2, it * 2 + 2).toInt(16).toByte() }
}
