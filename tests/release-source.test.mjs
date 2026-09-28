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
