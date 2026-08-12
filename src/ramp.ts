// Kanso severity ramp — btop's core idea, made a system primitive.
//
// In btop a meter is never one flat colour: the bar is painted along a
// gradient so magnitude reads before the number does. Kanso generalises
// that into a five-stop ramp every gauge, meter, graph and table cell
// shares, so "80%" looks the same shade everywhere in every app.
import { kanso } from "./tokens";

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

function hexToRgb(hex: string): [number, number, number] {
  const h = hex.replace("#", "");
  return [
    parseInt(h.slice(0, 2), 16),
    parseInt(h.slice(2, 4), 16),
    parseInt(h.slice(4, 6), 16),
  ];
}

/**
 * Continuous ramp colour for a 0..1 magnitude. Interpolates between the
 * five stops in sRGB — deliberately, because the banding-free smoothness
 * of a perceptual space is not what a telemetry readout wants.
 */
export function rampColor(value: number, invert = false): string {
  const t = invert ? 1 - clamp01(value) : clamp01(value);
  const scaled = t * (RAMP_STOPS.length - 1);
  const i = Math.min(Math.floor(scaled), RAMP_STOPS.length - 2);
  const f = scaled - i;
  const [r1, g1, b1] = hexToRgb(RAMP_STOPS[i]);
  const [r2, g2, b2] = hexToRgb(RAMP_STOPS[i + 1]);
  const mix = (a: number, b: number) => Math.round(a + (b - a) * f);
  return `rgb(${mix(r1, r2)}, ${mix(g1, g2)}, ${mix(b1, b2)})`;
}

/** Snapped ramp step — for text classes and discrete state labels. */
export function rampStep(value: number, invert = false): RampName {
  const t = invert ? 1 - clamp01(value) : clamp01(value);
  return RAMP_NAMES[Math.min(RAMP_NAMES.length - 1, Math.floor(t * RAMP_NAMES.length))];
}

/**
 * CSS gradient across the ramp, clipped so the visible portion of a
 * partially-filled bar shows only the colours it has actually reached.
 * This is what makes a btop meter read correctly at 30% and at 95%.
 */
export function rampGradient(direction = "90deg"): string {
  const stops = RAMP_STOPS.map(
    (c, i) => `${c} ${((i / (RAMP_STOPS.length - 1)) * 100).toFixed(0)}%`
  );
  return `linear-gradient(${direction}, ${stops.join(", ")})`;
}

/** Single-hue variants for meters that track a non-severity quantity. */
export const HUE = {
  primary: kanso.color.primary,
  info: kanso.color.info,
  success: kanso.color.success,
  warning: kanso.color.warning,
  danger: kanso.color.danger,
  accent: kanso.color.accent,
  magenta: kanso.color.magenta,
  lime: kanso.color.lime,
} as const;

export type Hue = keyof typeof HUE;

/** Resolve a component `color` prop to a paint value. */
export function resolveHue(hue: Hue | "ramp", value = 0): string {
  return hue === "ramp" ? rampColor(value) : HUE[hue];
}
