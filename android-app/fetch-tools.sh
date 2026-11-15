#!/usr/bin/env bash
# Fetches the four build tools into ./tools. No Android Studio, Gradle or Android SDK install needed.
#   aapt2        resource compiler      (PyPI package "aapt2")
#   android.jar  platform API to compile against, API 34   (github.com/Sable/android-platforms)
#   d8           Java bytecode to Android dex              (github.com/facebook/buck, third-party)
#   signer       zipalign and APK signing                  (github.com/patrickfav/uber-apk-signer)
set -euo pipefail
cd "$(dirname "$0")"
T=tools; mkdir -p "$T/d8libs"
if [ ! -x "$T/aapt2" ]; then
  pip download --quiet --no-deps -d "$T/.pip" aapt2==0.2.1
  unzip -o -q "$T"/.pip/aapt2-*.whl -d "$T/.aapt2"
  cp "$T/.aapt2/aapt2/bin/Linux/aapt2" "$T/aapt2"; chmod +x "$T/aapt2"
fi
if [ ! -f "$T/android.jar" ]; then
  git clone -q --depth 1 --filter=blob:none --sparse https://github.com/Sable/android-platforms "$T/.sable"
  git -C "$T/.sable" sparse-checkout set android-34 >/dev/null
  cp "$T/.sable/android-34/android.jar" "$T/android.jar"
fi
if [ ! -f "$T/d8.jar" ]; then
  git clone -q --depth 1 --filter=blob:none --sparse https://github.com/facebook/buck "$T/.buck"
  git -C "$T/.buck" sparse-checkout set third-party/java/d8 third-party/java/asm third-party/java/commons-compress third-party/java/fastutil third-party/java/guava third-party/java/jopt-simple third-party/java/json-simple third-party/java/kotlinx-metadata-jvm third-party/java/kotlin third-party/java/gson >/dev/null
  cp "$T/.buck/third-party/java/d8/d8.jar" "$T/d8.jar"
  for f in asm/asm-7.1.jar asm/asm-analysis-7.1.jar asm/asm-commons-7.1.jar asm/asm-tree-7.1.jar asm/asm-util-7.1.jar commons-compress/commons-compress-1.18.jar fastutil/fastutil-7.2.0.jar guava/guava-23.3-jre.jar jopt-simple/jopt-simple-4.6.jar json-simple/json-simple-1.1.1.jar kotlinx-metadata-jvm/kotlinx-metadata-jvm-0.1.0.jar; do
    cp "$T/.buck/third-party/java/$f" "$T/d8libs/"
  done
  find "$T/.buck/third-party/java/kotlin" "$T/.buck/third-party/java/gson" -name "kotlin-stdlib.jar" -o -name "gson-*.jar" | grep -v sources | xargs -I{} cp {} "$T/d8libs/"
fi
if [ ! -f "$T/signer.jar" ]; then
  curl -sSL --fail -o "$T/signer.jar" https://github.com/patrickfav/uber-apk-signer/releases/download/v1.3.0/uber-apk-signer-1.3.0.jar
fi
echo "tools ready: $(ls "$T" | tr '\n' ' ')"
