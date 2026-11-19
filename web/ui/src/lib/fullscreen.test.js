import assert from "node:assert/strict";
import test from "node:test";

import { lockLandscape, shouldKeepControlsVisible, unlockOrientation } from "./fullscreen.js";

function touchMedia(coarse = true) {
  return (query) => ({ matches: coarse && query.includes("pointer: coarse") });
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
