import assert from "node:assert/strict";
import { readFileSync, readdirSync } from "node:fs";
import { fileURLToPath } from "node:url";
import test from "node:test";

// Stable builds (no `beta` feature) used to omit these providers from
// /api/status entirely, and older servers still do, so the UI must never
// dereference them with a plain dot: reading `status.playbox.enabled` on such a
// payload threw "Cannot read properties of undefined (reading 'enabled')"
// during render and left the whole Settings page stuck on "Loading…".
const PROVIDER_CARDS = {
  playbox: "PlayboxTV",
  vzy: "VZY",
  airtel: "Airtel Xstream",
  tataplay: "Tata Play",
};
const OPTIONAL_PROVIDERS = Object.keys(PROVIDER_CARDS);

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

// `status.playbox.connected`, `status["playbox"].connected` and
// `status?.playbox.connected` are all the bug: optional chaining on `status`
// alone still dereferences a missing provider. `status.playbox?.connected`,
// `status["playbox"]?.connected` and a bare `{#if status.playbox}` are fine.
const QUOTE = "[\"'`]";

// Matches `status.<key>`, `status?.<key>`, `status["<key>"]` and
// `status?.["<key>"]`. With `deref`, a `.` must follow the provider, i.e. a
// property is read off the provider itself; `?.` after the provider is fine.
function statusAccess(keys, { deref = false } = {}) {
  const any = `(?:${keys.join("|")})`;
  const access = `status\\??\\.${any}|status(?:\\?\\.)?\\[${QUOTE}${any}${QUOTE}\\]`;
  return new RegExp(deref ? `(?:${access})\\.` : access);
}

function unsafeReads(source) {
  const found = [];
  const unsafe = statusAccess(OPTIONAL_PROVIDERS, { deref: true });
  source.split("\n").forEach((line, index) => {
    if (unsafe.test(line)) found.push(`line ${index + 1}: ${line.trim()}`);
  });
  return found;
}

const offenders = componentSources().flatMap(({ name, source }) =>
  unsafeReads(source).map((hit) => `${name} ${hit}`),
);

test("no component reads a status key a stable build omits without optional chaining", () => {
  assert.deepEqual(offenders, []);
});

test("the scan covers the shell and the views that read provider status", () => {
  const names = componentSources().map(({ name }) => name);
  assert.ok(names.includes("App.svelte"), "app shell is scanned");
  const readsStatus = statusAccess([...OPTIONAL_PROVIDERS, "extras", "fastway"]);
  const readingStatus = names.filter((name) =>
    readsStatus.test(readFileSync(`${srcDir}${name}`, "utf8")),
  );
  // Only the presence of these views matters: the list may grow as more
  // components start reading provider status.
  for (const name of ["App.svelte", "views/Settings.svelte", "views/Watch.svelte"]) {
    assert.ok(readingStatus.includes(name), `${name} reads provider status`);
  }
});

// Returns the body of `{#if <guard>}`, so a test can assert what the guard
// actually wraps instead of only that the guard text exists somewhere.
function guardedBlock(source, guard) {
  const open = `{#if ${guard}}`;
  const start = source.indexOf(open);
  if (start === -1) return "";
  const token = /\{#if\b|\{\/if\}/g;
  token.lastIndex = start;
  let depth = 0;
  for (let match = token.exec(source); match; match = token.exec(source)) {
    depth += match[0] === "{/if}" ? -1 : 1;
    if (depth === 0) return source.slice(start + open.length, match.index);
  }
  return "";
}

test("Settings wraps each optional provider's card in its enabled guard", () => {
  const settings = readFileSync(`${srcDir}views/Settings.svelte`, "utf8");
  for (const [provider, heading] of Object.entries(PROVIDER_CARDS)) {
    // This is a source check, not a render test. A stable build now always
    // sends the keys, disabled, so a presence-only guard would put a dead beta
    // section on the page.
    const block = guardedBlock(settings, `status.${provider}?.enabled`);
    assert.notEqual(block.trim(), "", `status.${provider}?.enabled guards a block`);
    assert.ok(block.includes('<section class="card">'), `${provider} card is inside the guard`);
    assert.ok(block.includes(`<h2>${heading}`), `${provider} card is the guarded block`);
  }
});

test("the scan catches a direct read of an omitted provider key", () => {
  assert.deepEqual(unsafeReads('{#if status.playbox.enabled}<p>PlayboxTV</p>{/if}'), [
    "line 1: {#if status.playbox.enabled}<p>PlayboxTV</p>{/if}",
  ]);
  assert.deepEqual(unsafeReads("status.vzy.connected"), ["line 1: status.vzy.connected"]);
  assert.deepEqual(unsafeReads("status?.playbox.enabled"), ["line 1: status?.playbox.enabled"]);
  assert.deepEqual(unsafeReads('status["playbox"].connected'), [
    'line 1: status["playbox"].connected',
  ]);
  assert.deepEqual(unsafeReads('status?.["airtel"].enabled'), [
    'line 1: status?.["airtel"].enabled',
  ]);
  assert.deepEqual(unsafeReads('status["playbox"]?.connected'), []);
  assert.deepEqual(unsafeReads("status['vzy']?.connected"), []);
  assert.deepEqual(unsafeReads('{#if status.vzy}{status.vzy?.connected}{/if}'), []);
  assert.deepEqual(unsafeReads("{status?.playbox?.enabled}"), []);
});
