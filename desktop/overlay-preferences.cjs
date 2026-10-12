const fs = require("node:fs");
const path = require("node:path");

// Local presentation preferences survive disconnecting or re-pairing a device.
function createOverlayPreferences(file) {
  let hideFromCapture = true;
  try {
    const saved = JSON.parse(fs.readFileSync(file, "utf8"));
    if (typeof saved?.hideOverlayFromCapture === "boolean") hideFromCapture = saved.hideOverlayFromCapture;
  } catch (error) {
    if (error.code !== "ENOENT" && !(error instanceof SyntaxError)) throw error;
  }
  return {
    get: () => hideFromCapture,
    set(value) {
      if (typeof value !== "boolean") throw new TypeError("Capture visibility must be a boolean");
      fs.mkdirSync(path.dirname(file), { recursive: true });
      const temporary = file + ".tmp";
      try {
        fs.writeFileSync(temporary, JSON.stringify({ hideOverlayFromCapture: value }, null, 2), { mode: 0o600 });
        fs.renameSync(temporary, file);
      } finally {
        fs.rmSync(temporary, { force: true });
      }
      hideFromCapture = value;
      return value;
    },
  };
}

module.exports = { createOverlayPreferences };
