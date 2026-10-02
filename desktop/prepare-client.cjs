/* eslint-disable @typescript-eslint/no-require-imports */
const fs = require("node:fs");
const path = require("node:path");
const { spawnSync } = require("node:child_process");

fs.mkdirSync(path.join(__dirname, "assets"), { recursive: true });
for (const file of ["client.mjs", "computer-use.mjs", "computer-use-worker.mjs", "computer-use-unix.mjs", "metis-desktop-helper.swift"]) {
  fs.copyFileSync(path.join(__dirname, "..", file), path.join(__dirname, file));
}
if (process.platform === "darwin") {
  const compiled = spawnSync("xcrun", ["swiftc", "-O", "-emit-library", "-module-name", "MetisDesktop",
    path.join(__dirname, "metis-desktop-helper.swift"), "-o", path.join(__dirname, "libmetisdesktop.dylib")], { encoding: "utf8" });
  if (compiled.status !== 0) {
    throw new Error(compiled.stderr || compiled.stdout || "macOS desktop library failed to compile");
  }
}
