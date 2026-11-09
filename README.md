# Metis Remote Client — compatibility repository

The desktop client has moved into [Metis-Apps](https://github.com/f1shyondrugs/Metis-Apps/tree/main/desktop) as the unified **Metis** app for Windows, macOS and Linux. New development and canonical releases belong there.

This repository stays available for existing installations and their old update feed. A transition release may mirror the exact binaries and updater metadata from Metis-Apps. After that update, the installed app checks Metis-Apps directly. Existing pairing, permissions and preferences are preserved; no headless client or live connection is automatically removed.

The sections below document the legacy client. For current builds and usage, use [the desktop documentation in Metis-Apps](https://github.com/f1shyondrugs/Metis-Apps/blob/main/desktop/README.md).


The desktop remote client for Metis AI lives in this public repository. Download the current installer from the [latest GitHub Release](https://github.com/f1shyondrugs/metis-remote-client/releases/latest):

- Windows: `Metis-AI-Remote-Client-Setup.exe`
- macOS Apple Silicon: `Metis-AI-Remote-Client-arm64.dmg`
- Linux x64: `Metis-AI-Remote-Client-x86_64.AppImage`

Windows releases include `latest.yml` for automatic updates. The app checks this repository directly; pairing credentials stay with the Metis server and are never sent to GitHub.

## Pair a device

1. Install the EXE, DMG, or AppImage from the latest release.
2. In Metis AI, open **Settings → Devices → Add client** and choose the matching OS.
3. Open the app and enter the server URL and pairing code. On Windows, admin access requires launching the app as administrator and confirming UAC. On macOS, grant Screen Recording and Accessibility for desktop control. On Linux, terminal and file access also work in Wayland sessions such as Hyprland. Desktop control requires an X11 session with `xdotool`, `wmctrl`, and ImageMagick.

The pairing code expires after 15 minutes. See [desktop/README.md](desktop/README.md) for permissions and Computer Use details.

## Screenshot coordinates

Every Computer Use observation includes a `coordinates` description: use pixels of the returned image from its top-left corner. The macOS desktop client captures the entire selected monitor, including the menu bar and Dock. Window geometry is reported separately. The client applies Retina/DPI scaling once and rejects positions outside the observed image. A changed macOS display layout requires a fresh observation before input.

Version 1.4.10 includes this contract in the client itself, so it is available to agents connected to any Metis installation without installing a separate skill. Existing clients receive it after updating. Windows and Linux keep their window screenshot behavior. macOS releases include the DMG installer and a ZIP archive for the updater.

## Build and test

On Windows with Node.js 22 or later:

```powershell
node --test tests/computer-use-overlay.test.mjs tests/computer-use-worker.test.mjs tests/release-source.test.mjs
npm ci --prefix desktop
npm run build:win --prefix desktop -- --publish never
```

The Windows build writes `desktop/dist/Metis-AI-Remote-Client-Setup.exe` and `desktop/dist/latest.yml`. macOS writes `Metis-AI-Remote-Client-arm64.dmg`. Linux writes `Metis-AI-Remote-Client-x86_64.AppImage`. Canonical releases are now built in Metis-Apps. Tag-based publishing in this compatibility repository is disabled; transition artifacts must be copied unchanged from a successful canonical release. Builds are currently unsigned.

```bash
npm ci --prefix desktop
npm run build:mac --prefix desktop -- --publish never
npm run build:linux --prefix desktop -- --publish never
```

The desktop app packages `client.mjs`, `computer-use.mjs`, `computer-use-unix.mjs`, and `computer-use-worker.mjs` from this repository. On macOS, Computer Use runs inside the app process so Screen Recording and Accessibility apply to Metis AI Remote Client only. The Metis server's headless terminal installer is maintained separately in the Metis repository. The Linux AppImage is a desktop Electron client; use `desktop/linux-launcher.sh` as a read-only preflight before starting it on Linux.
