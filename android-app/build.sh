#!/usr/bin/env bash
# Builds the Revision OS APK. Needs: bash, node, a JDK (17 or later), unzip, zip, git, pip.
#   ./build.sh                 debug APK, signed with the test key in this folder
#   ./build.sh release         release APK, signed with your own key (see README.md)
# Version: REVOS_VERSION_NAME and REVOS_VERSION_CODE, or the defaults below.
set -euo pipefail
cd "$(dirname "$0")"
VARIANT="${1:-debug}"
NAME="${REVOS_VERSION_NAME:-3.0.0}"
CODE="${REVOS_VERSION_CODE:-$(( $(date -u +%s) / 60 - 29000000 ))}"      # minutes since a fixed point: always increasing
T=tools; B=build; PKG=com/pawanchander/revisionos
unset JAVA_TOOL_OPTIONS || true

./fetch-tools.sh
rm -rf "$B"; mkdir -p "$B/gen" "$B/classes" "$B/dex" out
node build-www.mjs

echo "[1/5] resources"
"$T/aapt2" compile --dir res -o "$B/res.zip"
"$T/aapt2" link -o "$B/unsigned.apk" -I "$T/android.jar" --manifest AndroidManifest.xml --java "$B/gen" \
  --min-sdk-version 24 --target-sdk-version 34 --version-code "$CODE" --version-name "$NAME" \
  -A "$B/assets" "$B/res.zip"

echo "[2/5] compile"
javac -nowarn --release 8 -cp "$T/android.jar" -d "$B/classes" src/$PKG/*.java "$B/gen/$PKG/R.java" 2>&1 | grep -v "bootstrap class path\|source value 8\|target value 8\|obsolete options\|^[0-9] warnings\?$" || true
test -f "$B/classes/$PKG/MainActivity.class"

echo "[3/5] dex"
java -cp "$T/d8.jar:$T/d8libs/*" com.android.tools.r8.D8 --release --lib "$T/android.jar" --min-api 24 --output "$B/dex" $(find "$B/classes" -name "*.class")
(cd "$B/dex" && zip -q -j ../unsigned.apk classes.dex)

echo "[4/5] sign ($VARIANT)"
if [ "$VARIANT" = "release" ]; then
  : "${REVOS_KEYSTORE_FILE:?set REVOS_KEYSTORE_FILE, REVOS_KEYSTORE_PASSWORD, REVOS_KEY_ALIAS and REVOS_KEY_PASSWORD}"
  java -jar "$T/signer.jar" --apks "$B/unsigned.apk" --out "$B/signed" --ks "$REVOS_KEYSTORE_FILE" --ksPass "$REVOS_KEYSTORE_PASSWORD" --ksAlias "$REVOS_KEY_ALIAS" --ksKeyPass "$REVOS_KEY_PASSWORD" --allowResign >"$B/sign.log"
else
  java -jar "$T/signer.jar" --apks "$B/unsigned.apk" --out "$B/signed" --ks debug.keystore --ksPass android --ksAlias androiddebugkey --ksKeyPass android --allowResign >"$B/sign.log"
fi
OUT="out/RevisionOS-$NAME-$VARIANT.apk"
cp "$B"/signed/*.apk "$OUT"

echo "[5/5] verify"
java -jar "$T/signer.jar" --apks "$OUT" --onlyVerify | grep -i "verif\|signature\|sha256" | head -8
"$T/aapt2" dump badging "$OUT" | grep -E "^package|^sdkVersion|^targetSdkVersion|^application-label:|^launchable-activity|uses-permission" 
echo "built $OUT  $(du -h "$OUT" | cut -f1)  version $NAME ($CODE)"
