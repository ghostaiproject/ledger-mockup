plugins {
    id("com.android.library")
    id("org.jetbrains.kotlin.android")
}

android {
    namespace = "ca.folio.keystore"
    compileSdk = 34
    defaultConfig {
        // per-use Keystore auth with a biometric OR the device PIN needs API 30
        minSdk = 30
    }
    compileOptions {
        sourceCompatibility = JavaVersion.VERSION_1_8
        targetCompatibility = JavaVersion.VERSION_1_8
    }
    kotlinOptions { jvmTarget = "1.8" }
}

dependencies {
    implementation("androidx.core:core-ktx:1.9.0")
    implementation("androidx.appcompat:appcompat:1.6.0")
    implementation("androidx.biometric:biometric:1.1.0")
    implementation(project(":tauri-android"))
}
