# Revision OS for Android

This folder turns the web app in `../os` into an installable APK. The app is not rewritten:
the same files are packaged inside the APK and shown in a full-screen WebView, with a small
bridge (`native.js`) for the things Android does better: reminders, vibration, the back
button and the system bars.

## Build

```
./build.sh             # debug APK in out/, signed with the test key in this folder
./build.sh release     # release APK, signed with your own key (below)
```

Needs bash, node, a JDK (17 or later), git, pip, zip and unzip. It does not need Android
Studio, Gradle or an Android SDK install: `fetch-tools.sh` downloads the four tools it uses.

Set the version with `REVOS_VERSION_NAME=3.1.0 REVOS_VERSION_CODE=12 ./build.sh`. The version
code must go up with every build you want to install over an older one.

Pushing to `gh-pages` also builds the APK on GitHub (see `.github/workflows/android.yml`)
and attaches it to the `android-latest` release.

## What is in the APK

| Part | File |
| --- | --- |
| The screen, the bridge to Android, file serving | `src/.../MainActivity.java` |
| Reminder storage and alarms | `src/.../Reminders.java` |
| Showing a reminder | `src/.../ReminderReceiver.java` |
| Restoring reminders after restart or update | `src/.../BootReceiver.java` |
| Web side of the bridge | `native.js` |
| Icon, splash, colours | `res/` |

## Signing

**Debug.** `debug.keystore` is a test-only key, committed on purpose. Every debug build is
signed with it, so a new debug APK installs over the previous one and your progress stays.
It is not a secret and must never be used for a store release.

**Release.** Create your own key once and keep it out of the repository:

```
keytool -genkeypair -v -keystore revisionos-release.jks -alias revisionos \
  -keyalg RSA -keysize 4096 -validity 10000
```

Back the file and its passwords up somewhere safe. If you lose them you can never publish
an update to the same app. To build locally:

```
REVOS_KEYSTORE_FILE=/path/revisionos-release.jks REVOS_KEYSTORE_PASSWORD=... \
REVOS_KEY_ALIAS=revisionos REVOS_KEY_PASSWORD=... ./build.sh release
```

To build on GitHub, add four repository secrets (Settings, Secrets and variables, Actions):
`ANDROID_KEYSTORE_BASE64` (output of `base64 -w0 revisionos-release.jks`),
`ANDROID_KEYSTORE_PASSWORD`, `ANDROID_KEY_ALIAS`, `ANDROID_KEY_PASSWORD`. The workflow
builds a release APK only when they exist.

A debug build and a release build are signed differently, so one cannot install over the
other. Use the backup on the You screen to carry progress across.

## Reminders

Planned in `native.js`, delivered by Android alarms. Each time progress changes the next
seven days are re-planned, so nothing fires for a mission that is already done. The alarms
are inexact by design (no special permission), so Android may deliver one some minutes
late, and battery saver or a force stop can delay or drop it.

## Deep links

`revisionos://c/<concept-id>`, `revisionos://review`, `revisionos://hack`, `revisionos://map`.
