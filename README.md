# Metis AI Remote Client

The Windows desktop remote client for Metis AI lives in this public repository. Download the current installer from the [latest GitHub Release](https://github.com/f1shyondrugs/metis-remote-client/releases/latest/download/Metis-AI-Remote-Client-Setup.exe). Releases include `latest.yml` for automatic updates. The app checks this repository directly; pairing credentials stay with the Metis server and are never sent to GitHub.

## Pair a Windows PC

1. Install the EXE from the latest release.
2. In Metis AI, open **Settings → Devices → Add client** and choose **Windows**.
3. Open the app and enter the server URL and pairing code. Admin access requires launching the app as administrator and confirming UAC.

The pairing code expires after 15 minutes. See [desktop/README.md](desktop/README.md) for permissions and Computer Use details.

## Build and test

On Windows with Node.js 22 or later:

```powershell
node --test tests/computer-use-overlay.test.mjs tests/computer-use-worker.test.mjs tests/release-source.test.mjs
npm ci --prefix desktop
npm run build:win --prefix desktop -- --publish never
```

The build writes `desktop/dist/Metis-AI-Remote-Client-Setup.exe` and `desktop/dist/latest.yml`. Push a tag matching `desktop/package.json`, such as `v1.3.5`, to build on GitHub Actions and publish both files as public release assets. Builds are currently unsigned and may prompt Windows SmartScreen.

The desktop app packages `client.mjs`, `computer-use.mjs`, and `computer-use-worker.mjs` from this repository. The Metis server's legacy headless client is maintained separately in the Metis repository.
