# Development Commands

## Firefox Android with the Momo Icon

After `pnpm build`, run from the repository root:

```bash
adb devices

web-ext run \
  --target=firefox-android \
  --android-device=DEVICE_ID \
  --firefox-apk=org.mozilla.firefox \
  --firefox-apk-component=org.mozilla.firefox.AppMomo
```

Replace `DEVICE_ID` with the ID reported by `adb devices`. This command targets regular Firefox with the Momo icon selected. `AppMomo` is a launcher activity alias; the package ID remains `org.mozilla.firefox`.

References: [Firefox launcher aliases](https://searchfox.org/mozilla-central/source/mobile/android/fenix/app/src/main/AndroidManifest.xml), [web-ext Android launcher implementation](https://github.com/mozilla/web-ext/blob/master/src/util/adb.js).
