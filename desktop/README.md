# Metis AI Remote Client for Windows

The Windows Remote Client is an Electron app packaged as an NSIS installer. Windows lists it under **Installed apps** and provides an uninstaller. The app shows only this PC's command history and stays available from the system tray when its window is closed. User access runs normally; admin access requires launching the app as administrator and confirming UAC.

## Pair a device

1. In Metis AI, open **Settings → Devices → Add client**, choose **User access** or **Admin / system access**, then choose **Windows**.
2. Download and install the Windows app.
3. For user access, open the app normally. For admin access, start it as administrator and confirm UAC. Enter the server URL and pairing code shown in Metis AI.

The code expires after 15 minutes and binds the selected access mode to the device registration. An existing pairing keeps its original mode; disconnect and pair again to change it. The app stores its credential with Windows credential encryption under `%APPDATA%\\MetisAI\\RemoteClient`. Uninstalling the app removes that local data. The remote connection runs inside the app and reconnects automatically. **Start at Windows login** uses a scheduled task with the paired access level. Admin mode may require the administrator account to sign in before the interactive app can start.

## Computer Use

On a Windows PC with an interactive display, Computer Use is managed only in **Metis AI → Settings → Devices → Permissions**. New compatible devices start with Computer Use and Full Access enabled; no local app switch is required. Headless CLI clients cannot use it. Metis can list windows, capture a visible window screenshot, move the pointer, click, scroll, drag, type literal text, and press keys. The client checks that the Windows desktop is unlocked. Each input needs a recent, single-use observation ID.

During Computer Use, a white edge glow and compact status notice appear on every monitor. The custom cursor matches the browser Computer Use cursor and follows the live Windows pointer for the entire operation. Pressing Escape cancels active input without changing the saved website permission. The overlay is hidden during observation and its Electron windows are excluded from screen capture. It disappears after 45 seconds without Computer Use activity.

Computer Use uses built-in Windows APIs from the interactive client session. Its PowerShell work and screenshot processing run in a dedicated worker so the Electron interface stays responsive. It does not require the private `@oai/sky` package. The current screenshot path captures visible pixels; it does not capture a covered window or expose UI Automation element trees. The app package version is 1.3.6.

## Build

On Windows with Node.js 22 or later:

```powershell
cd desktop
npm ci
npm run build:win
```

The output is `dist/Metis-AI-Remote-Client-Setup.exe`. A matching version tag builds the installer on a Windows GitHub Actions runner and publishes it with `latest.yml` to this repository's public GitHub Releases. Configure code signing in the build environment before distributing the app broadly; unsigned Windows builds may show a SmartScreen warning.

Download the app from this repository's latest GitHub Release. Packaged clients check this public repository for `latest.yml` and download new EXE releases directly, including before pairing. The app does not send its Metis pairing credential to GitHub. Existing clients from version 1.3.4 still update through their paired Metis server until they install this release.

## Runtime

- This PC's identity and command history come from the authenticated Metis hub API. The API only returns records for the requesting client.
- A command with no confirmed response after timeout or disconnect appears as **Unclear**. Verify on the device before retrying.
- Command output in the server audit is redacted and shortened. `REMOTE_AUDIT_RETENTION_DAYS` sets its retention period (default 30, maximum 365).
- Public GitHub Releases are checked at startup and every six hours in packaged builds.
- The older PowerShell client remains available for existing installations until they are replaced through the Windows app.
