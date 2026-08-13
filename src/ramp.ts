// Kanso severity ramp — btop's core idea, made a system primitive.
//
// In btop a meter is never one flat colour: the bar is painted along a
// gradient so magnitude reads before the number does. Kanso generalises
// that into a five-stop ramp every gauge, meter, graph and table cell
// shares, so "80%" looks the same shade everywhere in every app.
//
// Every value here that a component paints with is a `var(--kanso-*)`
// reference, never a hex — a colour baked in at module-evaluation time
// cannot follow a theme, and telemetry still wearing the v1 palette under
// `[data-kanso-theme="eva"]` is the half-broken toggle this prevents.
// The corollary: these strings resolve in a CSS context only. In SVG they
// go through `style`, not a `stroke=`/`fill=` presentation attribute.
import { cssVar, kanso } from "./tokens";

/** The classic stop list, as literal hex. For swatches and docs — paint
 *  goes through `rampColor`/`rampGradient`, which stay themeable. */
export const RAMP_STOPS = [
  kanso.ramp.nominal,
  kanso.ramp.caution,
  kanso.ramp.elevated,
  kanso.ramp.warning,
  kanso.ramp.critical,
] as const;

export type RampName = "nominal" | "caution" | "elevated" | "warning" | "critical";

export const RAMP_NAMES: readonly RampName[] = [
  "nominal",
  "caution",
  "elevated",
  "warning",
  "critical",
];

function clamp01(n: number): number {
  return n < 0 ? 0 : n > 1 ? 1 : Number.isFinite(n) ? n : 0;
}

function rampVar(name: RampName): string {
  return `var(--kanso-ramp-${name})`;
}

/**
 * Continuous ramp colour for a 0..1 magnitude, as a `color-mix` between
 * the two nearest stops.
 *
 * The interpolation is still sRGB, deliberately: the banding-free
 * smoothness of a perceptual space is not what a telemetry readout wants.
 * What changed is *where* it happens — the browser mixes the two custom
 * properties at paint time instead of JS mixing two hex strings at render
 * time, so the result follows whichever palette the live theme declares.
 */
export function rampColor(value: number, invert = false): string {
  const t = invert ? 1 - clamp01(value) : clamp01(value);
  const scaled = t * (RAMP_NAMES.length - 1);
  const i = Math.min(Math.floor(scaled), RAMP_NAMES.length - 2);
  const f = scaled - i;
  // Weight names the *first* stop, so f=0 is a clean 100% of it.
  const pct = +((1 - f) * 100).toFixed(2);
  return `color-mix(in srgb, ${rampVar(RAMP_NAMES[i])} ${pct}%, ${rampVar(RAMP_NAMES[i + 1])})`;
}

/** Snapped ramp step — for text classes and discrete state labels. */
export function rampStep(value: number, invert = false): RampName {
  const t = invert ? 1 - clamp01(value) : clamp01(value);
  return RAMP_NAMES[Math.min(RAMP_NAMES.length - 1, Math.floor(t * RAMP_NAMES.length))];
}

/** A magnitude read against its bound, kept whole instead of clamped. */
export interface RampReading {
  /** 0..1 — the in-range portion, i.e. all a capped bar can draw. */
  frac: number;
  /** `value / max`, unclamped. The true magnitude, for the readout. */
  ratio: number;
  /** How far past `max` the value went, as a fraction of `max`. 0 in range. */
  excess: number;
  over: boolean;
  /** Severity word, with `"overrange"` as the step above `critical`. */
  step: RampName | "overrange";
}

/**
 * Split a value against its bound so an overrange survives to the screen.
 * `rampColor`/`rampStep` clamp, which is right for paint and wrong for the
 * sync-ratio case: 412% must not render as 100%. Additive — nothing else
 * in the ramp changes meaning.
 */
export function rampOverrange(value: number, max = 1): RampReading {
  const ratio = max > 0 ? value / max : 0;
  const frac = clamp01(ratio);
  // Non-finite input is a broken feed, not an overrange — clamp01 already
  // folds it to a drawable fraction, so don't let it reach the readout.
  const over = Number.isFinite(ratio) && ratio > 1;
  return {
    frac,
    ratio,
    excess: over ? ratio - 1 : 0,
    over,
    step: over ? "overrange" : rampStep(frac),
  };
}

/**
 * CSS gradient across the ramp, clipped so the visible portion of a
 * partially-filled bar shows only the colours it has actually reached.
 * This is what makes a btop meter read correctly at 30% and at 95%.
 */
export function rampGradient(direction = "90deg"): string {
  const stops = RAMP_NAMES.map(
    (n, i) => `${rampVar(n)} ${((i / (RAMP_NAMES.length - 1)) * 100).toFixed(0)}%`
  );
  return `linear-gradient(${direction}, ${stops.join(", ")})`;
}

/** Single-hue variants for meters that track a non-severity quantity. */
export const HUE = {
  primary: cssVar("color", "primary"),
  info: cssVar("color", "info"),
  success: cssVar("color", "success"),
  warning: cssVar("color", "warning"),
  danger: cssVar("color", "danger"),
  accent: cssVar("color", "accent"),
  magenta: cssVar("color", "magenta"),
  lime: cssVar("color", "lime"),
} as const;

export type Hue = keyof typeof HUE;

/** Resolve a component `color` prop to a paint value. */
export function resolveHue(hue: Hue | "ramp", value = 0): string {
  return hue === "ramp" ? rampColor(value) : HUE[hue];
}
