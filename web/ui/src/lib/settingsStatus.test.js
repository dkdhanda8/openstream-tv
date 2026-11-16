import assert from "node:assert/strict";
import { readFileSync, readdirSync } from "node:fs";
import { fileURLToPath } from "node:url";
import test from "node:test";

// Stable builds (no `beta` feature) used to omit these providers from
// /api/status entirely, and older servers still do, so the UI must never
// dereference them with a plain dot: reading `status.playbox.enabled` on such a
// payload threw "Cannot read properties of undefined (reading 'enabled')"
// during render and left the whole Settings page stuck on "Loading…".
const OPTIONAL_PROVIDERS = ["playbox", "vzy", "airtel", "tataplay"];

const srcDir = fileURLToPath(new URL("..", import.meta.url));

function componentSources() {
  return readdirSync(srcDir, { recursive: true })
    .filter((name) => name.endsWith(".svelte"))
    .sort()
    // Read through the native path, but compare slash-separated names so the
    // coverage assertion means the same thing on Windows.
    .map((path) => ({
      name: path.split(/[\\/]/).join("/"),
      source: readFileSync(`${srcDir}${path}`, "utf8"),
    }));
}

// `status.playbox.connected` and `status?.playbox.connected` are both the bug:
// optional chaining on `status` alone still dereferences a missing provider.
// `status.playbox?.connected` and a bare `{#if status.playbox}` check are fine.
function plainDotReads(source) {
  const found = [];
  source.split("\n").forEach((line, index) => {
    for (const provider of OPTIONAL_PROVIDERS) {
      if (new RegExp(`status\\??\\.${provider}\\.`).test(line)) {
        found.push(`line ${index + 1}: ${line.trim()}`);
      }
    }
  });
  return found;
}

const offenders = componentSources().flatMap(({ name, source }) =>
  plainDotReads(source).map((hit) => `${name} ${hit}`),
);

test("no component reads a status key a stable build omits without optional chaining", () => {
  assert.deepEqual(offenders, []);
});

test("the scan covers the shell and the views that read provider status", () => {
  const names = componentSources().map(({ name }) => name);
  assert.ok(names.includes("App.svelte"), "app shell is scanned");
  const readingStatus = names.filter((name) =>
    /status\??\.(playbox|vzy|airtel|tataplay|extras|fastway)/.test(
      readFileSync(`${srcDir}${name}`, "utf8"),
    ),
  );
  assert.deepEqual(readingStatus, ["App.svelte", "views/Settings.svelte", "views/Watch.svelte"]);
});

test("Settings reads each optional provider's enabled flag in its section guard", () => {
  const settings = readFileSync(`${srcDir}views/Settings.svelte`, "utf8");
  for (const provider of OPTIONAL_PROVIDERS) {
    // This is a source check, not a render test. A stable build now always
    // sends the keys, disabled, so a presence-only guard would put a dead beta
    // section on the page.
    assert.match(settings, new RegExp(`\\{#if status\\.${provider}\\?\\.enabled\\}`));
  }
});

test("the guard catches a plain-dot read of an omitted provider key", () => {
  assert.deepEqual(
    plainDotReads('{#if status.playbox.enabled}<p>PlayboxTV</p>{/if}'),
    ["line 1: {#if status.playbox.enabled}<p>PlayboxTV</p>{/if}"],
  );
  assert.deepEqual(plainDotReads("status.vzy.connected"), ["line 1: status.vzy.connected"]);
  assert.deepEqual(plainDotReads("status?.playbox.enabled"), ["line 1: status?.playbox.enabled"]);
  assert.deepEqual(plainDotReads('{#if status.vzy}{status.vzy?.connected}{/if}'), []);
  assert.deepEqual(plainDotReads("{status?.playbox?.enabled}"), []);
});
