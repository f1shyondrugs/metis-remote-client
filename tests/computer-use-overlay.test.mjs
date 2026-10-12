import test from "node:test";
import assert from "node:assert/strict";
import { EventEmitter } from "node:events";
import overlayPackage from "../desktop/computer-use-overlay.cjs";

const { createComputerUseOverlay } = overlayPackage;

function fixture(hideFromCapture = true) {
  const displays = [
    { id: 1, bounds: { x: -1920, y: 0, width: 1920, height: 1080 } },
    { id: 2, bounds: { x: 0, y: 0, width: 2560, height: 1440 } },
  ];
  const screen = new EventEmitter();
  screen.getAllDisplays = () => displays;
  const windows = [];
  class BrowserWindow {
    constructor(options) {
      this.options = options;
      this.visible = false;
      this.destroyed = false;
      this.scripts = [];
      this.webContents = new EventEmitter();
      this.webContents.isLoading = () => false;
      this.webContents.executeJavaScript = (script) => { this.scripts.push(script); return Promise.resolve(); };
      windows.push(this);
    }
    setAlwaysOnTop(value, level) { this.level = value && level; }
    setIgnoreMouseEvents(value) { this.ignoreMouse = value; }
    setContentProtection(value) { this.protected = value; }
    loadURL(url) { this.url = url; }
    setBounds(bounds) { this.bounds = bounds; }
    showInactive() { this.visible = true; }
    hide() { this.visible = false; }
    isDestroyed() { return this.destroyed; }
    on() {}
  }
  let escape;
  let cancelled = 0;
  const globalShortcut = {
    register(key, callback) { assert.equal(key, "Escape"); escape = callback; return true; },
    unregister(key) { assert.equal(key, "Escape"); escape = undefined; },
  };
  const overlay = createComputerUseOverlay({ BrowserWindow, screen, globalShortcut, onCancel: () => { cancelled++; }, hideFromCapture });
  return { overlay, windows, screen, displays, getEscape: () => escape, getCancelled: () => cancelled };
}

test("computer-use overlay covers every display and stays out of captures", () => {
  const { overlay, windows, getEscape, getCancelled } = fixture();

  overlay.touch();
  assert.equal(windows.length, 2);
  for (const item of windows) {
    assert.equal(item.visible, true);
    assert.equal(item.protected, true);
    assert.equal(item.ignoreMouse, true);
    assert.equal(item.level, "screen-saver");
    const html = decodeURIComponent(item.url);
    assert.match(html, /Metis is using your computer/);
    assert.match(html, /Press Escape to cancel/);
    assert.match(html, /body::before/);
    assert.match(html, /border: 2px solid rgba\(255,255,255,.96\)/);
    assert.match(html, /M7\.1 4\.15C4\.05 3\.4 1\.72 6\.15/);
  }
  assert.deepEqual(windows.map((item) => item.options.x), [-1920, 0]);

  windows[0].webContents.isLoading = () => true;
  overlay.updateCursor(-1800, 120);
  assert.equal(windows[0].scripts.length, 0);
  windows[0].webContents.isLoading = () => false;
  windows[0].webContents.emit("did-finish-load");
  assert.match(windows[0].scripts.at(-1), /window\.metisCursor\?\.\(120,120,true\)/);
  overlay.suspendCapture();
  assert.ok(windows.every((item) => !item.visible));
  overlay.resumeCapture();
  assert.ok(windows.every((item) => item.visible));

  getEscape()();
  assert.equal(getCancelled(), 1);
  assert.ok(windows.every((item) => !item.visible));
  assert.equal(getEscape(), undefined);
  overlay.resumeCapture();
  assert.ok(windows.every((item) => !item.visible));
});


test("stream visibility switches live and applies to new monitors without ending control", () => {
  const { overlay, windows, screen, displays, getEscape, getCancelled } = fixture(false);
  try {
    overlay.touch();
    assert.ok(windows.every(w => w.visible && !w.protected));
    overlay.setHideFromCapture(true);
    assert.ok(windows.every(w => w.visible && w.protected));
    overlay.suspendCapture();
    overlay.setHideFromCapture(false);
    assert.ok(windows.every(w => !w.visible && !w.protected));
    displays.push({ id: 3, bounds: { x: 2560, y: 0, width: 1920, height: 1080 } });
    screen.emit("display-added");
    assert.equal(windows.length, 3);
    assert.ok(windows.every(w => !w.visible && !w.protected));
    overlay.resumeCapture();
    assert.ok(windows.every(w => w.visible && !w.protected));
    windows[0].destroyed = true;
    windows[0].setContentProtection = () => { throw Error("Destroyed window touched"); };
    overlay.setHideFromCapture(true);
    assert.ok(windows.slice(1).every(w => w.protected));
    assert.equal(getCancelled(), 0);
    assert.equal(typeof getEscape(), "function");
    assert.throws(() => overlay.setHideFromCapture("false"), /boolean/);
  } finally { overlay.hide(); }
});
