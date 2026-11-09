const appearance = require("./appearance.cjs");
const appearanceScript = require("node:fs").readFileSync(require("node:path").join(__dirname, "appearance.cjs"), "utf8");

function createOverlayHtml(theme = appearance.fallback) {
  const initial = JSON.stringify(appearance.normalize(theme) || appearance.fallback).replace(/</g, "\\u003c");
  return `<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<meta http-equiv="Content-Security-Policy" content="default-src 'none'; script-src 'unsafe-inline'; style-src 'unsafe-inline'">
<style>
  :root { --primary: #d4d4d4; --background: #141414; --foreground: #f4f4f5; --muted-foreground: #b0b0b0; --border: #353535; }
  html, body { width: 100%; height: 100%; margin: 0; overflow: hidden; background: transparent; }
  body { font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif; pointer-events: none; }
  .edge { position: fixed; z-index: 3; overflow: hidden; pointer-events: none; }
  .edge-top, .edge-bottom { left: 0; width: 100%; height: 42px; }
  .edge-top { top: 0; }
  .edge-bottom { bottom: 0; transform: rotate(180deg); }
  .edge-left, .edge-right { top: 0; width: 100vh; height: 42px; transform-origin: top left; }
  .edge-left { left: 0; transform: translateY(100vh) rotate(-90deg); }
  .edge-right { left: 100%; transform: rotate(90deg); }
  .wave { transform-origin: top; animation: tide 9s ease-in-out infinite alternate; }
  .edge-bottom .wave { animation-delay: -4s; }
  .edge-left .wave { animation-delay: -2s; }
  .edge-right .wave { animation-delay: -6s; }
  @keyframes tide { from { transform: scaleY(.76); opacity: .8; } to { transform: scaleY(1); opacity: 1; } }
  .notice { position: fixed; z-index: 4; top: 14px; left: 50%; transform: translateX(-50%); display: flex; align-items: center; gap: 12px; width: max-content; max-width: calc(100vw - 48px); box-sizing: border-box; padding: 9px 12px; border: 1px solid color-mix(in srgb, var(--primary) 30%, transparent); border-radius: 999px; background: color-mix(in srgb, var(--background) 94%, transparent); color: var(--foreground); box-shadow: 0 4px 16px #0003; font-size: 12px; line-height: 18px; white-space: nowrap; }
  .mark { display: grid; place-items: center; width: 24px; height: 24px; flex: none; border-radius: 50%; background: color-mix(in srgb, var(--primary) 14%, transparent); color: var(--primary); }
  .mark svg { width: 14px; height: 14px; }
  .label { display: flex; align-items: center; gap: 8px; }
  .label strong { font-weight: 650; }
  .activity { width: 4px; height: 4px; border-radius: 50%; background: var(--primary); }
  .label span, .cancel { color: var(--muted-foreground); }
  .cancel { display: flex; align-items: center; gap: 5px; padding-left: 12px; border-left: 1px solid var(--border); }
  kbd { font: inherit; font-size: 10px; font-weight: 600; line-height: 18px; padding: 0 4px; border: 1px solid var(--border); border-radius: 4px; color: var(--foreground); }
  .cursor { position: fixed; z-index: 5; left: 0; top: 0; width: 18px; height: 24px; opacity: 0; transform: translate(-12%,-10%); transition: opacity 100ms ease; filter: drop-shadow(0 2px 2px #0008); pointer-events: none; }
  .cursor.visible { opacity: 1; }
  @media (max-width: 480px) { .notice { gap: 8px; top: 10px; padding: 7px 10px; } .label { gap: 6px; } .cancel { padding-left: 8px; } .cancel span { display: none; } }
  @media (prefers-reduced-motion: reduce) { .wave { animation: none; } .cursor { transition: none; } }
</style>
</head>
<body><svg class="edge edge-top" aria-hidden="true" viewBox="0 0 1200 42" preserveAspectRatio="none"><defs><linearGradient id="fade-top" x2="0" y2="1"><stop stop-color="white" stop-opacity=".95"/><stop offset=".3" stop-color="white" stop-opacity=".5"/><stop offset="1" stop-color="white" stop-opacity="0"/></linearGradient><pattern id="dots-top" width="8" height="8" patternUnits="userSpaceOnUse"><circle cx="3" cy="3" r="1" fill="var(--primary)"/></pattern><filter id="soft-top" x="-10%" y="-50%" width="120%" height="200%"><feGaussianBlur stdDeviation="0 5"/></filter><mask id="mask-top"><path filter="url(#soft-top)" fill="url(#fade-top)" d="M0 0H1200V26C1040 13 970 40 810 25S570 9 420 28S170 40 0 24Z"/></mask></defs><g class="wave" mask="url(#mask-top)"><rect width="1200" height="42" fill="var(--primary)" opacity=".44"/><rect width="1200" height="42" fill="url(#dots-top)" opacity=".85"/></g></svg><svg class="edge edge-bottom" aria-hidden="true" viewBox="0 0 1200 42" preserveAspectRatio="none"><defs><linearGradient id="fade-bottom" x2="0" y2="1"><stop stop-color="white" stop-opacity=".95"/><stop offset=".3" stop-color="white" stop-opacity=".5"/><stop offset="1" stop-color="white" stop-opacity="0"/></linearGradient><pattern id="dots-bottom" width="8" height="8" patternUnits="userSpaceOnUse"><circle cx="3" cy="3" r="1" fill="var(--primary)"/></pattern><filter id="soft-bottom" x="-10%" y="-50%" width="120%" height="200%"><feGaussianBlur stdDeviation="0 5"/></filter><mask id="mask-bottom"><path filter="url(#soft-bottom)" fill="url(#fade-bottom)" d="M0 0H1200V26C1040 13 970 40 810 25S570 9 420 28S170 40 0 24Z"/></mask></defs><g class="wave" mask="url(#mask-bottom)"><rect width="1200" height="42" fill="var(--primary)" opacity=".44"/><rect width="1200" height="42" fill="url(#dots-bottom)" opacity=".85"/></g></svg><svg class="edge edge-left" aria-hidden="true" viewBox="0 0 1200 42" preserveAspectRatio="none"><defs><linearGradient id="fade-left" x2="0" y2="1"><stop stop-color="white" stop-opacity=".95"/><stop offset=".3" stop-color="white" stop-opacity=".5"/><stop offset="1" stop-color="white" stop-opacity="0"/></linearGradient><pattern id="dots-left" width="8" height="8" patternUnits="userSpaceOnUse"><circle cx="3" cy="3" r="1" fill="var(--primary)"/></pattern><filter id="soft-left" x="-10%" y="-50%" width="120%" height="200%"><feGaussianBlur stdDeviation="0 5"/></filter><mask id="mask-left"><path filter="url(#soft-left)" fill="url(#fade-left)" d="M0 0H1200V26C1040 13 970 40 810 25S570 9 420 28S170 40 0 24Z"/></mask></defs><g class="wave" mask="url(#mask-left)"><rect width="1200" height="42" fill="var(--primary)" opacity=".44"/><rect width="1200" height="42" fill="url(#dots-left)" opacity=".85"/></g></svg><svg class="edge edge-right" aria-hidden="true" viewBox="0 0 1200 42" preserveAspectRatio="none"><defs><linearGradient id="fade-right" x2="0" y2="1"><stop stop-color="white" stop-opacity=".95"/><stop offset=".3" stop-color="white" stop-opacity=".5"/><stop offset="1" stop-color="white" stop-opacity="0"/></linearGradient><pattern id="dots-right" width="8" height="8" patternUnits="userSpaceOnUse"><circle cx="3" cy="3" r="1" fill="var(--primary)"/></pattern><filter id="soft-right" x="-10%" y="-50%" width="120%" height="200%"><feGaussianBlur stdDeviation="0 5"/></filter><mask id="mask-right"><path filter="url(#soft-right)" fill="url(#fade-right)" d="M0 0H1200V26C1040 13 970 40 810 25S570 9 420 28S170 40 0 24Z"/></mask></defs><g class="wave" mask="url(#mask-right)"><rect width="1200" height="42" fill="var(--primary)" opacity=".44"/><rect width="1200" height="42" fill="url(#dots-right)" opacity=".85"/></g></svg>
<div class="notice" role="status" aria-label="Metis is controlling your computer. Press Escape to cancel.">
  <div class="mark" aria-hidden="true"><svg viewBox="0 0 20 20" fill="none"><path d="M3 15V5l7 7 7-7v10" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"/></svg></div>
  <div class="label"><strong>Metis</strong><i class="activity" aria-hidden="true"></i><span>Computer Use</span></div>
  <div class="cancel"><kbd>Esc</kbd><span>to cancel</span></div>
</div><svg class="cursor" aria-hidden="true" viewBox="0 0 52 48"><defs><linearGradient id="metis-browser-cursor-glass" x1="7" y1="4" x2="39" y2="42" gradientUnits="userSpaceOnUse"><stop offset="0" stop-color="rgba(42,55,63,0.72)"/><stop offset=".44" stop-color="rgba(18,28,34,0.54)"/><stop offset="1" stop-color="rgba(6,11,15,0.34)"/></linearGradient><linearGradient id="metis-browser-cursor-edge" x1="3" y1="4" x2="40" y2="43" gradientUnits="userSpaceOnUse"><stop offset="0" stop-color="rgba(255,255,255,0.96)"/><stop offset=".34" stop-color="rgba(191,232,241,.78)"/><stop offset=".7" stop-color="rgba(117,166,180,.58)"/><stop offset="1" stop-color="rgba(238,247,250,.84)"/></linearGradient><radialGradient id="metis-browser-cursor-glow" cx="0" cy="0" r="1" gradientTransform="translate(15 12) rotate(34) scale(31 24)" gradientUnits="userSpaceOnUse"><stop stop-color="rgba(224,248,255,.3)"/><stop offset="1" stop-color="rgba(224,248,255,0)"/></radialGradient></defs><path d="M7.1 4.15C4.05 3.4 1.72 6.15 2.8 9.08l13.35 33.55c1.04 2.78 4.82 3.08 6.28.48l7.35-17.38c1.1-2.57 3.2-4.55 5.83-5.51l12.78-4.7c3.46-1.27 3.46-6.17-.03-7.39L7.1 4.15Z" fill="url(#metis-browser-cursor-glass)" stroke="url(#metis-browser-cursor-edge)" stroke-width="1.3" stroke-linejoin="round"/><path d="M7.35 5.8 18.02 40.9c.43 1.46 2.43 1.61 3.08.24l6.98-15.08c1.28-2.76 3.59-4.91 6.43-5.99l12.18-4.6" fill="none" stroke="rgba(238,252,255,.42)" stroke-width=".9" stroke-linecap="round"/><path d="M6.1 5.05 48.1 12.95 35.25 17.7 9.3 9.2Z" fill="url(#metis-browser-cursor-glow)"/></svg>
<script>${appearanceScript}</script>
<script>
  window.metisAppearance = theme => window.MetisAppearance.apply(document.documentElement, theme);
  window.metisAppearance(${initial});
  const cursor = document.querySelector(".cursor");
  window.metisCursor = (x,y,visible) => { cursor.style.left=x+"px"; cursor.style.top=y+"px"; cursor.classList.toggle("visible",visible); };
</script></body>
</html>`;
}

const IDLE_MS = 45_000;

function createComputerUseOverlay({ BrowserWindow, screen, globalShortcut, onCancel, hideFromCapture = true }) {
  const windows = new Map();
  let currentAppearance = appearance.fallback;
  let active = false;
  let suspended = false;
  let timer;
  let cursorHideTimer;
  let cursorDisplayId = null;
  let cursorPosition = null;
  let escapeRegistered = false;
  let suppressEscapeUntil = 0;
  const scriptStates = new WeakMap();

  function runScript(overlay, script) {
    if (overlay.isDestroyed() || overlay.webContents.isLoading()) return;
    let state = scriptStates.get(overlay);
    if (!state) { state = { running: false, latest: null, sent: null }; scriptStates.set(overlay, state); }
    if (state.running) { state.latest = script; return; }
    if (state.sent === script) return;
    state.running = true;
    state.sent = script;
    let execution;
    try { execution = overlay.webContents.executeJavaScript(script); }
    catch { state.running = false; state.sent = null; return; }
    Promise.resolve(execution).catch(() => { state.sent = null; }).finally(() => {
      state.running = false;
      const latest = state.latest; state.latest = null;
      if (latest && !overlay.isDestroyed()) runScript(overlay, latest);
    });
  }

  function renderCursor(display, overlay) {
    if (!cursorPosition || cursorDisplayId !== display.id || suspended || overlay.isDestroyed() || overlay.webContents.isLoading()) return;
    const localX = cursorPosition.x - display.bounds.x;
    const localY = cursorPosition.y - display.bounds.y;
    runScript(overlay, `window.metisCursor?.(${localX},${localY},true)`);
  }

  function createWindow(display) {
    const overlay = new BrowserWindow({
      x: display.bounds.x,
      y: display.bounds.y,
      width: display.bounds.width,
      height: display.bounds.height,
      transparent: true,
      frame: false,
      show: false,
      focusable: false,
      skipTaskbar: true,
      resizable: false,
      movable: false,
      hasShadow: false,
      webPreferences: { sandbox: true, contextIsolation: true, nodeIntegration: false },
    });
    overlay.setAlwaysOnTop(true, "screen-saver");
    // The overlay is passive. Forwarding installs a native mouse path through
    // Electron, which can stall the system pointer whenever its main loop is busy.
    overlay.setIgnoreMouseEvents(true);
    overlay.setContentProtection(hideFromCapture);
    overlay.loadURL(`data:text/html;charset=utf-8,${encodeURIComponent(createOverlayHtml(currentAppearance))}`);
    overlay.webContents.on("did-finish-load", () => {
      setAppearance(currentAppearance);
      if (active && !suspended && !overlay.isDestroyed()) {
        overlay.showInactive();
        renderCursor(display, overlay);
      }
    });
    overlay.on("closed", () => { if (windows.get(display.id) === overlay) windows.delete(display.id); });
    return overlay;
  }

  function sync() {
    if (!active) return;
    const displays = screen.getAllDisplays();
    const ids = new Set(displays.map((display) => display.id));
    for (const [id, overlay] of windows) {
      if (!ids.has(id)) {
        windows.delete(id);
        if (!overlay.isDestroyed()) overlay.destroy();
      }
    }
    for (const display of displays) {
      let overlay = windows.get(display.id);
      if (!overlay || overlay.isDestroyed()) {
        overlay = createWindow(display);
        windows.set(display.id, overlay);
      } else {
        overlay.setBounds(display.bounds);
      }
      if (overlay.webContents.isLoading()) continue;
      if (suspended) overlay.hide();
      else overlay.showInactive();
    }
  }

  function updateCursor(x, y) {
    if (!active || !Number.isFinite(x) || !Number.isFinite(y)) return;
    clearTimeout(cursorHideTimer);
    cursorPosition = { x, y };
    const display = screen.getAllDisplays().find((item) => {
      const b = item.bounds;
      return x >= b.x && y >= b.y && x < b.x + b.width && y < b.y + b.height;
    });
    const nextId = display?.id ?? null;
    if (cursorDisplayId !== null && cursorDisplayId !== nextId) {
      const previous = windows.get(cursorDisplayId);
      if (previous && !previous.isDestroyed()) runScript(previous, "window.metisCursor?.(0,0,false)");
    }
    cursorDisplayId = nextId;
    if (!display || suspended) return;
    const overlay = windows.get(display.id);
    if (!overlay) return;
    renderCursor(display, overlay);
  }

  function hideCursor(delay = 0) {
    clearTimeout(cursorHideTimer);
    cursorHideTimer = setTimeout(() => {
      if (cursorDisplayId !== null) {
        const overlay = windows.get(cursorDisplayId);
        if (overlay && !overlay.isDestroyed()) runScript(overlay, "window.metisCursor?.(0,0,false)");
      }
      cursorDisplayId = null;
      cursorPosition = null;
    }, delay);
  }

  function hide() {
    active = false;
    suspended = false;
    hideCursor();
    clearTimeout(timer);
    if (escapeRegistered) globalShortcut.unregister("Escape");
    escapeRegistered = false;
    for (const overlay of windows.values()) {
      if (!overlay.isDestroyed()) overlay.destroy();
    }
    windows.clear();
  }

  function touch() {
    active = true;
    clearTimeout(timer);
    timer = setTimeout(hide, IDLE_MS);
    timer.unref?.();
    if (!escapeRegistered) {
      escapeRegistered = globalShortcut.register("Escape", () => {
        if (Date.now() < suppressEscapeUntil) return;
        hide();
        onCancel();
      });
    }
    sync();
  }

  function setAppearance(input) {
    const next = appearance.normalize(input);
    if (!next) return false;
    currentAppearance = next;
    // Read at execution time so concurrent cursor work cannot overwrite a theme.
    for (const overlay of windows.values()) {
      if (overlay.isDestroyed() || overlay.webContents.isLoading()) continue;
      overlay.webContents.executeJavaScript("window.metisAppearance?.(" + JSON.stringify(next).replace(/</g, "\\u003c") + ")").catch(() => {});
    }
    return true;
  }

  function setHideFromCapture(value) {
    if (typeof value !== "boolean") throw new TypeError("Capture visibility must be a boolean");
    hideFromCapture = value;
    for (const overlay of windows.values()) {
      if (!overlay.isDestroyed()) overlay.setContentProtection(value);
    }
  }

  function suspendCapture() {
    if (!active) return;
    suspended = true;
    hideCursor();
    for (const overlay of windows.values()) {
      if (!overlay.isDestroyed()) overlay.hide();
    }
  }

  function resumeCapture() {
    if (!active) return;
    suspended = false;
    sync();
    if (cursorPosition) updateCursor(cursorPosition.x, cursorPosition.y);
  }

  function suppressInjectedEscape() {
    suppressEscapeUntil = Date.now() + 1000;
  }

  screen.on("display-added", sync);
  screen.on("display-removed", sync);
  screen.on("display-metrics-changed", sync);

  return { touch, hide, setAppearance, setHideFromCapture, suspendCapture, resumeCapture, suppressInjectedEscape, updateCursor, hideCursor };
}

module.exports = { createComputerUseOverlay, createOverlayHtml };
