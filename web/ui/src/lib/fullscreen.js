// Fullscreen helpers for the live player. Element fullscreen keeps the custom
// control overlay in charge, but mobile browsers leave the page in portrait
// unless it asks for a landscape lock once the request is granted.

// iPad Safari below 16.4 only offers the WebKit-prefixed fullscreen API, and
// the event names differ there, so every access goes through these helpers.
export function fullscreenElement(doc = globalThis.document) {
  return doc?.fullscreenElement ?? doc?.webkitFullscreenElement ?? null;
}

export function supportsElementFullscreen(element) {
  return typeof element?.requestFullscreen === "function" || typeof element?.webkitRequestFullscreen === "function";
}

export function requestElementFullscreen(element) {
  if (typeof element?.requestFullscreen === "function") return element.requestFullscreen();
  if (typeof element?.webkitRequestFullscreen === "function") {
    element.webkitRequestFullscreen();
    return Promise.resolve();
  }
  return null;
}

export function exitElementFullscreen(doc = globalThis.document) {
  if (typeof doc?.exitFullscreen === "function") return doc.exitFullscreen();
  if (typeof doc?.webkitExitFullscreen === "function") {
    doc.webkitExitFullscreen();
    return Promise.resolve();
  }
  return null;
}

// Tapping a control leaves it focused on touch devices. Only keyboard focus
// should pin the overlay open; pointer focus must still fade after idle.
export function shouldKeepControlsVisible(container, active = globalThis.document?.activeElement) {
  if (!container || !active?.matches || !container.contains?.(active)) return false;
  try {
    return active.matches(":focus-visible") === true;
  } catch {
    return false;
  }
}

// Orientation locks only apply to fullscreen pages and only make sense on
// touch layouts; desktops keep whatever orientation their window has.
export async function lockLandscape(orientation = globalThis.screen?.orientation, media = globalThis.matchMedia) {
  if (typeof orientation?.lock !== "function" || !prefersTouchLayout(media)) return false;
  try {
    await orientation.lock("landscape");
    return true;
  } catch {
    return false;
  }
}

export function unlockOrientation(orientation = globalThis.screen?.orientation) {
  try {
    orientation?.unlock?.();
  } catch {}
}

function prefersTouchLayout(media) {
  try {
    return media?.("(pointer: coarse)")?.matches === true;
  } catch {
    return false;
  }
}
