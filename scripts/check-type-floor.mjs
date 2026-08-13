#!/usr/bin/env node
/**
 * Type-size floor gate. 11px. Nothing in the library may set a smaller
 * font-size — not a token, not a stylesheet, not an inline style.
 *
 * WHY THE NUMBER IS 11 AND NOT "SMALL LOOKS TECHNICAL". A sibling project
 * shipped `fontSize: '6px'` to production, with 7px, 8px and 9px pervasive;
 * the audit that found it recorded micro-type as "the most common complaint
 * any reviewer will have". At 6-8px a monospace glyph is three or four device
 * pixels tall on a standard-density display. This is THE failure mode of this
 * aesthetic, because tiny all-caps mono is the cheapest way to look technical
 * and it is unreadable — and it compounds with the other one, since the same
 * components reach for `muted` at the same time. The aesthetic survives an
 * 11px floor completely intact: KANSO.md rule 7 ("density over comfort, this
 * is a cockpit") is a real position and a 3px bump does not cost it anything.
 *
 * WHAT IS CHECKED
 *   1. hardcoded `font-size` (and the `font:` shorthand) in src/**\/*.css
 *   2. inline `fontSize` in src/**\/*.tsx — bare numbers are px in React
 *   3. every `fontSize` token, per theme, in tokens/
 *   rem and em are converted at a 16px root. Values with no literal length
 *   (var(), calc() of vars, %) cannot be judged statically and are skipped.
 *
 * EXIT-CODE POLICY — same policy, same rationale, as scripts/check-contrast.mjs.
 *   eva      is GATED. A font-size token below the floor there exits 1.
 *   classic  is the v1 look, preserved behind `data-kanso-theme` as a
 *            reference. `size-xs` is 8px and `size-sm` is 10px. That is a
 *            KNOWN v1 DEFECT, kept deliberately because fixing it would
 *            change v1, and being unchanged is the only thing v1 is for. It
 *            is printed every run, labelled, and does not fail the build.
 *   Everything in src/ is GATED for every theme — a stylesheet is not a
 *   theme, it renders under all of them, so there is no legacy exemption for
 *   a hardcoded size.
 *
 *   A green build here means "no size below 11px outside the declared legacy
 *   tokens". It does not mean classic's 8px labels are fine. They are not.
 *
 * Usage: node scripts/check-type-floor.mjs
 */
import { readFileSync, readdirSync, existsSync, statSync } from "node:fs";
import { join, dirname, relative, sep } from "node:path";
import { fileURLToPath } from "node:url";

const root = dirname(dirname(fileURLToPath(import.meta.url)));

/* ========================================================================
   DECLARED DATA — the contract.
   ======================================================================== */

/** The floor, in CSS px. REPORT §A4.5. Do not lower this. */
const FLOOR_PX = 11;

/** Root font size assumed when converting rem/em. */
const ROOT_PX = 16;

/**
 * Themes whose sub-floor tokens are REPORTED BUT NOT GATED. See the
 * exit-code policy above. Adding an id here is a decision to stop fixing
 * that theme's type scale.
 */
const NOT_GATED = new Set(["classic"]);

/**
 * Generated files. `src/tokens.css` is compiled from tokens/*.json — its
 * sizes are checked as tokens, per theme, where the legacy policy can apply.
 * Flagging it here as well would report classic's known 8px twice, once
 * without the label that makes it legible.
 */
const SKIP = new Set([join("src", "tokens.css"), join("src", "tokens.ts")]);

/** Directories scanned for hardcoded sizes. */
const SRC_DIRS = ["src"];

/* ========================================================================
   MACHINERY
   ======================================================================== */

const UNIT_PX = { px: 1, rem: ROOT_PX, em: ROOT_PX, pt: 4 / 3 };

/**
 * Every literal length in a CSS value, in px. `clamp(3rem, 12vw, 8rem)`
 * yields [48, 128] — the smallest is what the floor applies to. Viewport and
 * percentage units are not statically resolvable and are ignored.
 */
function lengthsPx(value) {
  const out = [];
  for (const m of value.matchAll(/(-?\d*\.?\d+)(px|rem|em|pt)\b/gi)) {
    const unit = m[2].toLowerCase();
    // `0.5rem` inside `calc()` is a multiplier of something unknown often
    // enough, but in this codebase every calc on a font-size is a var scale;
    // keeping them would produce noise, so calc() is skipped wholesale below.
    out.push(parseFloat(m[1]) * UNIT_PX[unit]);
  }
  return out;
}

/** The smallest statically-known px size in a value, or null. */
function smallestPx(value) {
  if (/\bcalc\(/i.test(value)) return null;
  const lens = lengthsPx(value).filter((n) => n > 0);
  return lens.length ? Math.min(...lens) : null;
}

function walk(dir, out = []) {
  if (!existsSync(dir)) return out;
  for (const entry of readdirSync(dir)) {
    const full = join(dir, entry);
    if (statSync(full).isDirectory()) walk(full, out);
    else out.push(full);
  }
  return out;
}

const findings = [];
const record = (kind, where, what, px, note) =>
  findings.push({ kind, where, what, px, note });

/* ---- 1 + 2. source files ---- */

for (const dir of SRC_DIRS) {
  for (const file of walk(join(root, dir))) {
    const rel = relative(root, file);
    if (SKIP.has(rel)) continue;
    const src = readFileSync(file, "utf8");

    if (file.endsWith(".css")) {
      // `font-size: <v>`, the `font: <v>` shorthand, and the component-level
      // custom properties this library funnels sizes through
      // (`--kanso-badge-font`, `--kanso-chip-font`, ...).
      const decl = /(^|[;{\s])(font-size|font|--[a-z0-9-]*(?:font|font-size))\s*:\s*([^;}]+)/gi;
      for (const m of src.matchAll(decl)) {
        const px = smallestPx(m[3]);
        if (px !== null && px < FLOOR_PX) {
          const line = src.slice(0, m.index).split("\n").length;
          record("css", `${rel}:${line}`, `${m[2]}: ${m[3].trim()}`, px, "");
        }
      }
    }

    if (file.endsWith(".tsx") || file.endsWith(".ts")) {
      // Inline styles: `fontSize: 9`, `fontSize: "9px"`, `fontSize: '0.5rem'`.
      // A bare number is px in React.
      for (const m of src.matchAll(/fontSize\s*:\s*(["'`]?)([^,;}\n]+?)\1\s*[,}\n]/g)) {
        const raw = m[2].trim();
        const px = /^-?\d*\.?\d+$/.test(raw) ? parseFloat(raw) : smallestPx(raw);
        if (px !== null && px > 0 && px < FLOOR_PX) {
          const line = src.slice(0, m.index).split("\n").length;
          record("tsx", `${rel}:${line}`, `fontSize: ${raw}`, px, "");
        }
      }
    }
  }
}

/* ---- 3. tokens, per theme ---- */

const tokensDir = join(root, "tokens");
const themesDir = join(tokensDir, "themes");
const isNote = (k) => k.startsWith("_") || k.startsWith("$");

function sizeTokens(obj = {}) {
  return Object.entries(obj).filter(
    ([name, token]) => !isNote(name) && token && token.$type === "fontSize"
  );
}

const baseType = JSON.parse(readFileSync(join(tokensDir, "type.json"), "utf8"));
const themes = [{ id: "classic", type: baseType }];

if (existsSync(themesDir)) {
  for (const f of readdirSync(themesDir).filter((f) => f.endsWith(".json"))) {
    const raw = JSON.parse(readFileSync(join(themesDir, f), "utf8"));
    const { $meta = {} } = raw;
    // A theme re-declares a subset; everything it does not name inherits.
    themes.push({
      id: $meta.id ?? f.replace(/\.json$/, ""),
      type: { ...baseType, ...(raw.type ?? {}) },
      overrides: new Set(Object.keys(raw.type ?? {})),
    });
  }
}

for (const theme of themes) {
  for (const [name, token] of sizeTokens(theme.type)) {
    const px = smallestPx(String(token.$value));
    if (px === null || px >= FLOOR_PX) continue;
    const gated = !NOT_GATED.has(theme.id);
    record(
      gated ? "token" : "legacy",
      `${theme.id}: type.${name}`,
      String(token.$value),
      px,
      theme.overrides && !theme.overrides.has(name) ? "inherited from base" : ""
    );
  }
}

/* ---- report ---- */

const rows = findings.map((f) => [
  f.kind === "legacy" ? "KNOWN" : "FAIL",
  f.where.split(sep).join("/"),
  f.what,
  `${f.px}px`,
  (f.kind === "legacy"
    ? "v1 LEGACY — deliberate, not gating"
    : `below the ${FLOOR_PX}px floor`) + (f.note ? ` (${f.note})` : ""),
]);

if (rows.length) {
  const w = [0, 1, 2, 3].map((i) => Math.max(...rows.map((r) => r[i].length)));
  console.log("");
  for (const r of rows) {
    console.log(
      `${r[0].padEnd(w[0])}  ${r[1].padEnd(w[1])}  ${r[2].padEnd(w[2])}  ${r[3].padStart(w[3])}  ${r[4]}`
    );
  }
}

const hard = findings.filter((f) => f.kind !== "legacy");
const legacy = findings.filter((f) => f.kind === "legacy");
const scanned = SRC_DIRS.flatMap((d) => walk(join(root, d))).filter(
  (f) => (f.endsWith(".css") || f.endsWith(".tsx")) && !SKIP.has(relative(root, f))
).length;

console.log(
  `\nfloor ${FLOOR_PX}px · ${scanned} source files + ${themes.length} theme(s) [${themes
    .map((t) => t.id)
    .join(", ")}] · ${hard.length} failing · ${legacy.length} known-legacy`
);

if (legacy.length) {
  console.log(
    `\nThe KNOWN rows are v1's type scale, preserved behind data-kanso-theme on\n` +
      `purpose. They are real defects — 8px labels at 3.9:1 — and they are not\n` +
      `being fixed because changing them would change the reference look. A\n` +
      `green build here does not mean classic is fine.`
  );
}

if (hard.length) {
  console.error(
    `\nFAIL: ${hard.length} font-size below ${FLOOR_PX}px.\n` +
      `Micro-type is the failure mode of this aesthetic — REPORT §A4.5. Use a\n` +
      `type token; if none is small enough, that is the answer, not a smaller\n` +
      `number.`
  );
  process.exit(1);
}
console.log(`\nOK: nothing outside the declared legacy tokens sets type below ${FLOOR_PX}px.`);
