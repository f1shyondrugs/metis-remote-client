const appearance = require("./appearance.cjs");
const shortcut = require("./cancel-shortcut.cjs");
const appearanceScript = require("node:fs").readFileSync(require("node:path").join(__dirname, "appearance.cjs"), "utf8");

function edgeHtml(name) {
  return '<svg class="edge edge-'+name+'" aria-hidden="true" preserveAspectRatio="none"><defs>'+
    '<linearGradient id="fade-'+name+'" x2="0" y2="1"><stop stop-color="white" stop-opacity=".95"/><stop offset=".3" stop-color="white" stop-opacity=".5"/><stop offset="1" stop-color="white" stop-opacity="0"/></linearGradient>'+
    '<pattern id="dots-'+name+'" width="8" height="8" patternUnits="userSpaceOnUse"><circle cx="3" cy="3" r="1" fill="var(--primary)"/></pattern>'+
    '<filter id="soft-'+name+'" x="-10%" y="-50%" width="120%" height="200%"><feGaussianBlur stdDeviation="0 5"/></filter>'+
    '<mask id="mask-'+name+'"><path class="wave" filter="url(#soft-'+name+')" fill="url(#fade-'+name+')"/></mask></defs>'+
    '<g mask="url(#mask-'+name+')"><rect width="100%" height="42" fill="var(--primary)" opacity=".44"/><rect width="100%" height="42" fill="url(#dots-'+name+')" opacity=".85"/></g></svg>';
}

function createOverlayHtml(theme = appearance.fallback, cancelShortcut = "Escape") {
  const initial = JSON.stringify(appearance.normalize(theme) || appearance.fallback).replace(/</g, "\\u003c");
  const keyLabel = shortcut.label(cancelShortcut, process.platform);
  return `<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<meta http-equiv="Content-Security-Policy" content="default-src 'none'; script-src 'unsafe-inline'; style-src 'unsafe-inline'">
<style>
  :root { --primary: #d4d4d4; --background: #141414; --foreground: #f4f4f5; --muted-foreground: #b0b0b0; --border: #353535; }
  html, body { width: 100%; height: 100%; margin: 0; overflow: hidden; background: transparent; }
  body { font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif; pointer-events: none; animation: overlay-enter 700ms ease-out both; }
  .edge { position: fixed; z-index: 3; overflow: hidden; pointer-events: none; animation: breathe 18s ease-in-out infinite alternate; }
  .edge-top, .edge-bottom { left: 0; width: 100%; height: 42px; }
  .edge-top { top: 0; }
  .edge-bottom { bottom: 0; transform: rotate(180deg); animation-delay: -8s; }
  .edge-left, .edge-right { top: 0; width: 100vh; height: 42px; transform-origin: top left; }
  .edge-left { left: 0; transform: translateY(100vh) rotate(-90deg); animation-delay: -4s; }
  .edge-right { left: 100%; transform: rotate(90deg); animation-delay: -12s; }
  @keyframes overlay-enter { from { opacity: 0; } to { opacity: 1; } }
  @keyframes breathe { from { opacity: .8; } to { opacity: 1; } }
  @keyframes notice-enter { from { opacity: 0; transform: translate(-50%,-7px); } to { opacity: 1; transform: translate(-50%,0); } }
  .notice { position: fixed; z-index: 4; top: 14px; left: 50%; transform: translateX(-50%); display: flex; align-items: center; gap: 12px; width: max-content; max-width: calc(100vw - 32px); box-sizing: border-box; padding: 9px 13px; border: 1px solid color-mix(in srgb, var(--primary) 30%, transparent); border-radius: 999px; background: color-mix(in srgb, var(--background) 94%, transparent); color: var(--foreground); box-shadow: 0 4px 16px #0003; font-size: 12px; line-height: 18px; white-space: nowrap; animation: notice-enter 800ms cubic-bezier(.2,.7,.2,1) both; }
  .label { font-weight: 600; overflow-wrap: anywhere; }
  .cancel { max-width: 55%; min-width: 0; display: flex; align-items: center; gap: 5px; padding-left: 12px; border-left: 1px solid var(--border); color: var(--muted-foreground); }
  kbd { min-width: 0; font: inherit; font-size: 10px; font-weight: 600; line-height: 18px; padding: 0 4px; border: 1px solid var(--border); border-radius: 4px; color: var(--foreground); white-space: normal; overflow-wrap: anywhere; }
  .cursor { position: fixed; z-index: 5; left: 0; top: 0; width: 18px; height: 24px; opacity: 0; transform: translate(-12%,-10%); transition: opacity 160ms ease; filter: drop-shadow(0 2px 2px #0008); pointer-events: none; }
  .cursor.visible { opacity: 1; }
  @media (max-width: 480px) { .notice { top: 10px; gap: 8px; padding: 8px 10px; font-size: 11px; } .label { white-space: normal; min-width: 0; } .cancel { padding-left: 8px; flex-shrink: 0; } }
  @media (prefers-reduced-motion: reduce) { body, .notice, .edge { animation: none; } .cursor { transition: none; } }
</style>
</head>
<body>OVERLAY_EDGES
<div class="notice" role="status" aria-label="Metis is using your computer. Press OVERLAY_KEY to cancel.">
  <span class="label">Metis is using your computer</span>
  <div class="cancel"><kbd>OVERLAY_KEY</kbd><span>to cancel</span></div>
</div>OVERLAY_CURSOR
<script>OVERLAY_APPEARANCE_SCRIPT</script>
<script>
  window.metisAppearance = theme => window.MetisAppearance.apply(document.documentElement, theme);
  window.metisAppearance(OVERLAY_THEME_JSON);
  window.metisCancelShortcut = label => {
    document.querySelector("kbd").textContent = label;
    document.querySelector(".notice").setAttribute("aria-label", "Metis is using your computer. Press "+label+" to cancel.");
  };
  const cursor = document.querySelector(".cursor");
  window.metisCursor = (x,y,visible) => { cursor.style.left=x+"px"; cursor.style.top=y+"px"; cursor.classList.toggle("visible",visible); };

  // Match the viewBox to CSS pixels so circles never stretch with aspect ratio.
  const edges = [...document.querySelectorAll(".edge")].map((svg,index)=>({
    svg, path:svg.querySelector(".wave"), pattern:svg.querySelector("pattern"), index, width:0
  }));
  const reduced = matchMedia("(prefers-reduced-motion: reduce)");
  let frame, elapsed=0, previous=performance.now(), lastDraw=-Infinity;
  function resize() {
    for (const edge of edges) {
      edge.width = edge.svg.clientWidth;
      edge.svg.setAttribute("viewBox", "0 0 "+edge.width+" 42");
    }
    draw();
  }
  function draw() {
    for (const edge of edges) {
      const width=edge.width, phase=elapsed/7000+edge.index*1.7;
      let d="M0 0H"+width+"V26";
      for (let i=48;i>=0;i--) {
        const x=width*i/48;
        const y=25+Math.sin(x/210+phase)*4+Math.sin(x/430-phase*.63)*3;
        d+="L"+x.toFixed(2)+" "+y.toFixed(2);
      }
      edge.path.setAttribute("d",d+"Z");
      edge.pattern.setAttribute("patternTransform","translate("+(Math.sin(elapsed/15000+edge.index)*1.2).toFixed(3)+" 0)");
    }
  }
  function tick(now) {
    elapsed+=Math.min(now-previous,100); previous=now;
    if (now-lastDraw>=1000/24) { draw(); lastDraw=now; }
    frame=requestAnimationFrame(tick);
  }
  function updateMotion() {
    cancelAnimationFrame(frame);
    if (reduced.matches) { elapsed=0; draw(); }
    else if (!document.hidden) { previous=performance.now(); frame=requestAnimationFrame(tick); }
  }
  addEventListener("resize",resize);
  document.addEventListener("visibilitychange",updateMotion);
  reduced.addEventListener("change",updateMotion);
  resize(); updateMotion();
</script></body>
</html>`
    .replace("OVERLAY_EDGES",()=>["top","bottom","left","right"].map(edgeHtml).join(""))
    .replaceAll("OVERLAY_KEY",keyLabel)
    .replace("OVERLAY_CURSOR",()=>"<svg class=\"cursor\" aria-hidden=\"true\" viewBox=\"0 0 52 48\"><defs><linearGradient id=\"metis-browser-cursor-glass\" x1=\"7\" y1=\"4\" x2=\"39\" y2=\"42\" gradientUnits=\"userSpaceOnUse\"><stop offset=\"0\" stop-color=\"rgba(42,55,63,0.72)\"/><stop offset=\".44\" stop-color=\"rgba(18,28,34,0.54)\"/><stop offset=\"1\" stop-color=\"rgba(6,11,15,0.34)\"/></linearGradient><linearGradient id=\"metis-browser-cursor-edge\" x1=\"3\" y1=\"4\" x2=\"40\" y2=\"43\" gradientUnits=\"userSpaceOnUse\"><stop offset=\"0\" stop-color=\"rgba(255,255,255,0.96)\"/><stop offset=\".34\" stop-color=\"rgba(191,232,241,.78)\"/><stop offset=\".7\" stop-color=\"rgba(117,166,180,.58)\"/><stop offset=\"1\" stop-color=\"rgba(238,247,250,.84)\"/></linearGradient><radialGradient id=\"metis-browser-cursor-glow\" cx=\"0\" cy=\"0\" r=\"1\" gradientTransform=\"translate(15 12) rotate(34) scale(31 24)\" gradientUnits=\"userSpaceOnUse\"><stop stop-color=\"rgba(224,248,255,.3)\"/><stop offset=\"1\" stop-color=\"rgba(224,248,255,0)\"/></radialGradient></defs><path d=\"M7.1 4.15C4.05 3.4 1.72 6.15 2.8 9.08l13.35 33.55c1.04 2.78 4.82 3.08 6.28.48l7.35-17.38c1.1-2.57 3.2-4.55 5.83-5.51l12.78-4.7c3.46-1.27 3.46-6.17-.03-7.39L7.1 4.15Z\" fill=\"url(#metis-browser-cursor-glass)\" stroke=\"url(#metis-browser-cursor-edge)\" stroke-width=\"1.3\" stroke-linejoin=\"round\"/><path d=\"M7.35 5.8 18.02 40.9c.43 1.46 2.43 1.61 3.08.24l6.98-15.08c1.28-2.76 3.59-4.91 6.43-5.99l12.18-4.6\" fill=\"none\" stroke=\"rgba(238,252,255,.42)\" stroke-width=\".9\" stroke-linecap=\"round\"/><path d=\"M6.1 5.05 48.1 12.95 35.25 17.7 9.3 9.2Z\" fill=\"url(#metis-browser-cursor-glow)\"/></svg>")
    .replace("OVERLAY_APPEARANCE_SCRIPT",()=>appearanceScript)
    .replace("OVERLAY_THEME_JSON",()=>initial);
}

const IDLE_MS = 45_000;

function createComputerUseOverlay({ BrowserWindow, screen, globalShortcut, onCancel, hideFromCapture = true, cancelShortcut = "Escape" }) {
  const windows = new Map();
  let currentAppearance = appearance.fallback;
  let active = false;
  let suspended = false;
  let timer;
  let cursorHideTimer;
  let cursorDisplayId = null;
  let cursorPosition = null;
  let registeredShortcut = null;
  cancelShortcut = shortcut.normalize(cancelShortcut);
  let suppressShortcutUntil = 0;
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
    overlay.loadURL(`data:text/html;charset=utf-8,${encodeURIComponent(createOverlayHtml(currentAppearance, cancelShortcut))}`);
    overlay.webContents.on("did-finish-load", () => {
      setAppearance(currentAppearance);
      renderShortcut();
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
    if (registeredShortcut) globalShortcut.unregister(registeredShortcut);
    registeredShortcut = null;
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
    if (!registeredShortcut) {
      if (!registerShortcut(cancelShortcut)) {
        hide();
        throw new Error("Cancellation shortcut is unavailable. Choose another shortcut in the Remote Client.");
      }
      registeredShortcut = cancelShortcut;
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

  function registerShortcut(value) {
    return globalShortcut.register(value, () => {
      if (Date.now() < suppressShortcutUntil) return;
      hide();
      onCancel();
    });
  }

  function renderShortcut() {
    const label = JSON.stringify(shortcut.label(cancelShortcut, process.platform));
    for (const overlay of windows.values()) {
      if (!overlay.isDestroyed() && !overlay.webContents.isLoading()) {
        overlay.webContents.executeJavaScript("window.metisCancelShortcut?.(" + label + ")").catch(() => {});
      }
    }
  }

  function setCancelShortcut(value, persist = () => {}) {
    const next = shortcut.normalize(value);
    if (next === cancelShortcut) { persist(next); return next; }
    // Reserve the new combination before releasing the existing safety shortcut.
    if (!registerShortcut(next)) throw Error("This shortcut is already in use or unavailable. Choose another.");
    try { persist(next); }
    catch (error) { globalShortcut.unregister(next); throw error; }
    if (registeredShortcut) globalShortcut.unregister(registeredShortcut);
    cancelShortcut = next;
    registeredShortcut = active ? next : null;
    if (!active) globalShortcut.unregister(next);
    suppressShortcutUntil = 0;
    renderShortcut();
    return next;
  }

  function suppressInjectedShortcut(value) {
    try {
      if (shortcut.normalize(value) === cancelShortcut) suppressShortcutUntil = Date.now() + 1000;
    } catch { /* Unrelated or unsupported injected key. */ }
  }

  screen.on("display-added", sync);
  screen.on("display-removed", sync);
  screen.on("display-metrics-changed", sync);

  return { touch, hide, setAppearance, setHideFromCapture, suspendCapture, resumeCapture, setCancelShortcut, suppressInjectedShortcut, updateCursor, hideCursor };
}

module.exports = { createComputerUseOverlay, createOverlayHtml };
