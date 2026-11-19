// Fullscreen helpers for the live player. Element fullscreen keeps the custom
// control overlay in charge, but mobile browsers leave the page in portrait
// unless it asks for a landscape lock once the request is granted.

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
