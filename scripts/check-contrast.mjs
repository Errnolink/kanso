/**
 * Contrast gate for the Kanso palette.
 *
 * The aesthetic is dim text on true black, which is exactly the condition
 * under which contrast failures are easy to ship and hard to notice. This
 * ran once by hand and found `muted` at 3.86:1 — below AA for the 8-10px
 * labels it was being used on. Now it runs in CI.
 *
 * Usage: node scripts/check-contrast.mjs
 * Exits non-zero if any text token fails its declared tier.
 */
import { readFileSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const root = dirname(dirname(fileURLToPath(import.meta.url)));
const colors = JSON.parse(readFileSync(join(root, "tokens", "color.json"), "utf8"));

const BG = "#000000";

/** AA normal text. Anything that can carry a sentence or a number. */
const AA = 4.5;
/** AA large text (>=18.66px bold / 24px). Also the floor for UI graphics. */
const AA_LARGE = 3;

/**
 * Every token that is allowed to be used as text, and the tier it must
 * clear. A token absent from this list is a surface/fill colour and is not
 * gated — but if you start setting `color:` with it, add it here.
 */
const TEXT_TOKENS = {
  text: AA,
  "text-2": AA,
  "text-dim": AA,
  muted: AA,
  primary: AA,
  "primary-hot": AA,
  info: AA,
  success: AA,
  danger: AA,
  warning: AA,
  magenta: AA,
  lime: AA,
  "phosphor-orange": AA,
  "phosphor-amber": AA,
  "phosphor-lime": AA,
  "phosphor-violet": AA,
  "phosphor-cyan": AA,
  "phosphor-green": AA,
  "phosphor-red": AA,
  // Dim variants are borders and de-emphasised marks, not body text.
  "primary-dim": AA_LARGE,
  "info-dim": AA_LARGE,
  "success-dim": AA_LARGE,
  "danger-dim": AA_LARGE,
  "warning-dim": AA_LARGE,
};

function channel(c) {
  const s = c / 255;
  return s <= 0.03928 ? s / 12.92 : Math.pow((s + 0.055) / 1.055, 2.4);
}

function luminance(hex) {
  const h = hex.replace("#", "");
  const [r, g, b] = [0, 2, 4].map((i) => channel(parseInt(h.slice(i, i + 2), 16)));
  return 0.2126 * r + 0.7152 * g + 0.0722 * b;
}

function contrast(fg, bg) {
  const a = luminance(fg);
  const b = luminance(bg);
  const [hi, lo] = a > b ? [a, b] : [b, a];
  return (hi + 0.05) / (lo + 0.05);
}

let failures = 0;
const rows = [];

for (const [name, required] of Object.entries(TEXT_TOKENS)) {
  const token = colors[name];
  if (!token) {
    rows.push([name, "—", "—", "MISSING FROM tokens/color.json"]);
    failures++;
    continue;
  }
  const value = token.$value;
  if (!/^#[0-9a-f]{6}$/i.test(value)) continue; // skip rgba() tints
  const ratio = contrast(value, BG);
  const ok = ratio >= required;
  if (!ok) failures++;
  rows.push([
    name,
    value,
    `${ratio.toFixed(2)}:1`,
    ok ? `ok (needs ${required})` : `FAIL — needs ${required}:1`,
  ]);
}

const width = Math.max(...rows.map((r) => r[0].length));
for (const [name, value, ratio, verdict] of rows) {
  console.log(
    `${name.padEnd(width)}  ${value.padEnd(7)} ${ratio.padStart(8)}  ${verdict}`
  );
}

console.log(
  `\n${rows.length} text tokens checked against ${BG} — ${failures} failing.`
);

if (failures > 0) {
  console.error(
    "\nFix the token in tokens/color.json, or move it out of TEXT_TOKENS if it\n" +
      "is genuinely a surface colour that should never carry text."
  );
  process.exitCode = 1;
}
