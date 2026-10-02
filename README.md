# Metis AI Remote Client

The desktop remote client for Metis AI lives in this public repository. Download the current installer from the [latest GitHub Release](https://github.com/f1shyondrugs/metis-remote-client/releases/latest):

- Windows: `Metis-AI-Remote-Client-Setup.exe`
- macOS Apple Silicon: `Metis-AI-Remote-Client-arm64.dmg`
- Linux x64: `Metis-AI-Remote-Client-x86_64.AppImage`

Windows releases include `latest.yml` for automatic updates. The app checks this repository directly; pairing credentials stay with the Metis server and are never sent to GitHub.

## Pair a device

1. Install the EXE, DMG, or AppImage from the latest release.
2. In Metis AI, open **Settings → Devices → Add client** and choose the matching OS.
3. Open the app and enter the server URL and pairing code. On Windows, admin access requires launching the app as administrator and confirming UAC. On macOS, grant Screen Recording and Accessibility for desktop control. On Linux, use an X11 session with `xdotool`, `wmctrl`, and ImageMagick.

The pairing code expires after 15 minutes. See [desktop/README.md](desktop/README.md) for permissions and Computer Use details.

## Build and test

On Windows with Node.js 22 or later:

```powershell
node --test tests/computer-use-overlay.test.mjs tests/computer-use-worker.test.mjs tests/release-source.test.mjs
npm ci --prefix desktop
npm run build:win --prefix desktop -- --publish never
```

The Windows build writes `desktop/dist/Metis-AI-Remote-Client-Setup.exe` and `desktop/dist/latest.yml`. macOS writes `Metis-AI-Remote-Client-arm64.dmg`. Linux writes `Metis-AI-Remote-Client-x86_64.AppImage`. Push a tag matching `desktop/package.json`, such as `v1.4.2`, to publish release assets. Builds are currently unsigned.

```bash
npm ci --prefix desktop
npm run build:mac --prefix desktop -- --publish never
npm run build:linux --prefix desktop -- --publish never
```

The desktop app packages `client.mjs`, `computer-use.mjs`, `computer-use-unix.mjs`, and `computer-use-worker.mjs` from this repository. On macOS, Computer Use runs inside the app process so Screen Recording and Accessibility apply to Metis AI Remote Client only. The Metis server's headless terminal installer is maintained separately in the Metis repository.
