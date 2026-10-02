import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";

const main = readFileSync(new URL("../desktop/main.cjs", import.meta.url), "utf8");
const pkg = JSON.parse(readFileSync(new URL("../desktop/package.json", import.meta.url), "utf8"));

test("packaged client updates from the public remote-client repository without pairing credentials", () => {
  assert.deepEqual(pkg.build.publish, [{
    provider: "github",
    owner: "f1shyondrugs",
    repo: "metis-remote-client",
  }]);
  assert.ok(main.includes('provider: "github"'));
  assert.ok(main.includes('repo: "metis-remote-client"'));
  assert.equal(main.includes("autoUpdater.requestHeaders"), false);
  assert.equal(main.includes("/api/remote-clients/windows-updates"), false);
});

test("macOS computer use loads an in-process library instead of a helper process", () => {
  const unix = readFileSync(new URL("../computer-use-unix.mjs", import.meta.url), "utf8");
  assert.match(unix, /libmetisdesktop\.dylib/);
  assert.match(unix, /koffi\.load/);
  assert.equal(unix.includes("metis-desktop-helper\""), false);
  assert.match(String(pkg.dependencies.koffi), /\^2\./);
});
