# ===============================
# Google Play Services
# ===============================
-keep class com.google.android.gms.** { *; }
-dontwarn com.google.android.gms.**

# ===============================
# Firebase
# ===============================
-keep class com.google.firebase.** { *; }
-dontwarn com.google.firebase.**

# ===============================
# Google Sign-In
# ===============================
-keep class com.google.android.gms.auth.api.signin.** { *; }
-keep class com.google.android.gms.common.api.** { *; }

# ===============================
# React Native
# ===============================
-keep class com.facebook.react.** { *; }
-dontwarn com.facebook.react.**

# ===============================
# Gson (used internally by Firebase)
# ===============================
-keep class com.google.gson.** { *; }
-dontwarn com.google.gson.**

# ===============================
# OkHttp / Networking
# ===============================
-dontwarn okhttp3.**
-dontwarn okio.**

# ===============================
# Kotlin (safe)
# ===============================
-keep class kotlin.Metadata { *; }
-dontwarn kotlin.**
