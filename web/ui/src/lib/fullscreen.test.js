import assert from "node:assert/strict";
import test from "node:test";

import { exitElementFullscreen, fullscreenElement, lockLandscape, requestElementFullscreen, shouldKeepControlsVisible, supportsElementFullscreen, unlockOrientation } from "./fullscreen.js";

function touchMedia(coarse = true) {
  return (query) => ({ matches: coarse && query.includes("pointer: coarse") });
}

function fakeDocument() {
  const listeners = new Map();
  return {
    webkitFullscreenElement: null,
    listeners,
    addEventListener(type, handler) { listeners.set(type, handler); },
    removeEventListener(type, handler) {
      if (listeners.get(type) === handler) listeners.delete(type);
    },
    emit(type) { listeners.get(type)?.(); },
  };
}

test("pointer focus inside the player does not pin the controls open", () => {
  const button = { matches: (selector) => selector === ":focus-visible" && false };
  const container = { contains: (node) => node === button };
  assert.equal(shouldKeepControlsVisible(container, button), false);
});

test("keyboard focus inside the player keeps the controls open", () => {
  const button = { matches: (selector) => selector === ":focus-visible" };
  const container = { contains: (node) => node === button };
  assert.equal(shouldKeepControlsVisible(container, button), true);
});

test("focus outside the player never pins the controls", () => {
  const outside = { matches: () => true };
  const container = { contains: () => false };
  assert.equal(shouldKeepControlsVisible(container, outside), false);
  assert.equal(shouldKeepControlsVisible(null, outside), false);
});

test("locks landscape on a coarse-pointer device after fullscreen", async () => {
  const calls = [];
  const orientation = { lock: async (value) => calls.push(value) };
  assert.equal(await lockLandscape(orientation, touchMedia(true)), true);
  assert.deepEqual(calls, ["landscape"]);
});

test("does not lock desktop windows or unsupported browsers", async () => {
  const calls = [];
  const orientation = { lock: async (value) => calls.push(value) };
  assert.equal(await lockLandscape(orientation, touchMedia(false)), false);
  assert.equal(await lockLandscape({}, touchMedia(true)), false);
  assert.deepEqual(calls, []);
});

test("a rejected orientation lock is not fatal", async () => {
  const orientation = { lock: async () => Promise.reject(new Error("unsupported")) };
  assert.equal(await lockLandscape(orientation, touchMedia(true)), false);
});

test("unlocking ignores browsers without the API", () => {
  const calls = [];
  unlockOrientation({ unlock: () => calls.push("unlock") });
  unlockOrientation(undefined);
  unlockOrientation({ unlock: () => { throw new Error("denied"); } });
  assert.deepEqual(calls, ["unlock"]);
});

test("element fullscreen prefers the standard API and falls back to WebKit", async () => {
  const standard = { requestFullscreen: async () => "standard" };
  assert.equal(supportsElementFullscreen(standard), true);
  assert.equal(await requestElementFullscreen(standard), "standard");

  const doc = fakeDocument();
  const prefixed = { webkitRequestFullscreen: () => {} };
  assert.equal(supportsElementFullscreen(prefixed), true);
  const pending = requestElementFullscreen(prefixed, doc);
  assert.equal(doc.listeners.size, 2);
  doc.webkitFullscreenElement = prefixed;
  doc.emit("webkitfullscreenchange");
  await pending;
  assert.equal(doc.listeners.size, 0);
});

test("prefixed fullscreen rejects when WebKit reports an error", async () => {
  const doc = fakeDocument();
  const pending = requestElementFullscreen({ webkitRequestFullscreen: () => {} }, doc);
  doc.emit("webkitfullscreenerror");
  await assert.rejects(pending, /refused/);
  assert.equal(doc.listeners.size, 0);
});

test("element fullscreen reports unsupported containers", async () => {
  assert.equal(supportsElementFullscreen(null), false);
  assert.equal(await requestElementFullscreen({}), null);
  assert.equal(await exitElementFullscreen({}), null);
});

test("fullscreen element and exit use the WebKit fallback", async () => {
  const target = { id: "stage" };
  assert.equal(fullscreenElement({ webkitFullscreenElement: target }), target);
  assert.equal(fullscreenElement({}), null);

  const calls = [];
  await exitElementFullscreen({ webkitExitFullscreen: () => calls.push("exit") });
  assert.deepEqual(calls, ["exit"]);
});
