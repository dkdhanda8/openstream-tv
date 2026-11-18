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
// `status?.["<key>"]`. With `deref`, a plain `.` or `[` must follow the
// provider, i.e. a property is read off the provider itself; the optional
// forms `?.` and `?.[` short-circuit and are fine. Whitespace is allowed
// before the read so an expression broken across lines is still caught.
function statusAccess(keys, { deref = false } = {}) {
  const any = `(?:${keys.join("|")})`;
  const access = `status\\??\\.${any}|status(?:\\?\\.)?\\[${QUOTE}${any}${QUOTE}\\]`;
  return new RegExp(deref ? `(?:${access})\\s*(?:\\.|\\[)` : access);
}

// Blanks out comments, keeping their newlines, so a read quoted in prose is
// not reported as a live dereference. `//` is only treated as a comment at the
// start of a line or after punctuation, which leaves `https://` links intact.
const COMMENT_PATTERNS = [
  /(?:<!--[\s\S]*?-->|\{\/\*[\s\S]*?\*\/\}|\/\*[\s\S]*?\*\/)/g,
  /(^|[;{},)])([ \t]*)\/\/[^\n]*/gm,
];

function maskComments(source) {
  return COMMENT_PATTERNS.reduce(
    (text, pattern) => text.replace(pattern, (match) => match.replace(/[^\n]/g, " ")),
    source,
  );
}

function unsafeReads(source) {
  const lines = source.split("\n");
  // Scan the whole file so an expression split across lines is one match, but
  // report the source line the match starts on, once per line.
  const scan = maskComments(source);
  const unsafe = new RegExp(statusAccess(OPTIONAL_PROVIDERS, { deref: true }).source, "g");
  const found = [];
  const seen = new Set();
  for (const match of scan.matchAll(unsafe)) {
    const line = scan.slice(0, match.index).split("\n").length;
    if (seen.has(line)) continue;
    seen.add(line);
    found.push(`line ${line}: ${lines[line - 1].trim()}`);
  }
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
// actually wraps instead of only that the guard text exists. The scan stops at
// the guard's own `{:else}` (or `{:else if}`), so a card moved into the empty
// branch cannot satisfy the assertion; branches nested inside the body are
// kept, and every block type is tracked so their `{:else}` is not mistaken for
// the guard's.
function guardedBlock(source, guard) {
  const open = `{#if ${guard}}`;
  const start = source.indexOf(open);
  if (start === -1) return "";
  const token = /\{#(?:if|each|await|key|snippet)\b|\{\/(?:if|each|await|key|snippet)\}|\{:else\b/g;
  token.lastIndex = start;
  const stack = [];
  for (let match = token.exec(source); match; match = token.exec(source)) {
    if (match[0].startsWith("{/")) {
      stack.pop();
      if (stack.length === 0) return source.slice(start + open.length, match.index);
    } else if (match[0].startsWith("{:else")) {
      if (stack.length === 1) return source.slice(start + open.length, match.index);
    } else {
      stack.push(match[0]);
    }
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

test("the scan reads bracket dereferences but not the optional form", () => {
  assert.deepEqual(unsafeReads('status.playbox["enabled"]'), ['line 1: status.playbox["enabled"]']);
  assert.deepEqual(unsafeReads('status?.["playbox"]["enabled"]'), [
    'line 1: status?.["playbox"]["enabled"]',
  ]);
  assert.deepEqual(unsafeReads('status.playbox?.["enabled"]'), []);
  assert.deepEqual(unsafeReads('status?.["airtel"]?.["enabled"]'), []);
});

test("the scan follows a read across a line break and skips comments", () => {
  assert.deepEqual(unsafeReads("status.playbox\n  .enabled"), ["line 1: status.playbox"]);
  assert.deepEqual(unsafeReads("<!-- {#if status.playbox.enabled} -->"), []);
  assert.deepEqual(unsafeReads("{/* status.vzy.connected */}"), []);
  assert.deepEqual(unsafeReads("  // status.tataplay.enabled"), []);
  assert.deepEqual(unsafeReads('href="https://example.test" status.vzy.connected'), [
    'line 1: href="https://example.test" status.vzy.connected',
  ]);
});

test("the guarded block stops at the guard's own else branch", () => {
  const card = '<section class="card"><h2>VZY</h2></section>';
  const withElse = guardedBlock(
    `{#if status.vzy?.enabled}${card}{:else}<p>off</p>{/if}`,
    "status.vzy?.enabled",
  );
  assert.ok(withElse.includes(card));
  assert.ok(!withElse.includes("<p>off</p>"));
  // A nested branch keeps its own else; only the guard's else ends the body.
  assert.equal(
    guardedBlock(
      "{#if status.vzy?.enabled}{#if status.vzy?.connected}a{:else}b{/if}{:else}off{/if}",
      "status.vzy?.enabled",
    ),
    "{#if status.vzy?.connected}a{:else}b{/if}",
  );
});
