// Kanso motion contract.
//
// Motion in this system is mechanical, not organic: hard cubic-bezier
// in-out, short durations, transform/opacity only. Nothing eases softly,
// nothing bounces, nothing springs. Enter is slower than exit — chrome
// arrives deliberately and leaves immediately.
import { kanso } from "./tokens";

export const EASE_MECHANICAL = kanso.motion["ease-mechanical"];
export const EASE_OUT = kanso.motion["ease-out"];
export const EASE_IN = kanso.motion["ease-in"];

/** CSS `cubic-bezier(...)` string for a token easing. */
export function ease(curve: readonly [number, number, number, number]): string {
  return `cubic-bezier(${curve.join(", ")})`;
}

export const DURATION = {
  instant: kanso.motion["duration-instant"],
  tick: kanso.motion["duration-tick"],
  overlayEnter: kanso.motion["duration-overlay-enter"],
  overlayExit: kanso.motion["duration-overlay-exit"],
  panelEnter: kanso.motion["duration-panel-enter"],
  panelExit: kanso.motion["duration-panel-exit"],
  crawl: kanso.motion["duration-crawl"],
  pulse: kanso.motion["duration-pulse"],
  sweep: kanso.motion["duration-sweep"],
  blink: kanso.motion["duration-blink"],
} as const;

/** Framer-Motion / anime-shaped presets, so ports keep one vocabulary. */
export const PANEL_ENTER = {
  duration: DURATION.panelEnter / 1000,
  ease: EASE_MECHANICAL,
} as const;

export const PANEL_EXIT = {
  duration: DURATION.panelExit / 1000,
  ease: EASE_MECHANICAL,
} as const;

export const OVERLAY_ENTER = {
  duration: DURATION.overlayEnter / 1000,
  ease: EASE_MECHANICAL,
} as const;

export const OVERLAY_EXIT = {
  duration: DURATION.overlayExit / 1000,
  ease: EASE_MECHANICAL,
} as const;

/** True when the OS asks for reduced motion. Safe during SSR. */
export function prefersReducedMotion(): boolean {
  if (typeof window === "undefined" || !window.matchMedia) return false;
  return window.matchMedia("(prefers-reduced-motion: reduce)").matches;
}

/** Standard CSS transition string for a set of properties. */
export function transition(
  properties: string[],
  duration: number = DURATION.tick,
  curve: readonly [number, number, number, number] = EASE_MECHANICAL
): string {
  return properties.map((p) => `${p} ${duration}ms ${ease(curve)}`).join(", ");
}
