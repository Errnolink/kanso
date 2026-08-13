#!/usr/bin/env node
/**
 * Contrast gate for the Kanso palette — every theme, every surface a token can
 * actually land on.
 *
 * WHAT THIS CAUGHT, AND WHAT IT MISSED FOR A YEAR. The first version of this
 * gate measured every text token against `const BG = "#000000"`. It found
 * `muted` at 3.86:1 and got the token fixed — a real save. Then it went on
 * printing "24 tokens checked, 0 failing" while an audit against the real
 * surface stack found nineteen failures. Pure black is the most favourable
 * surface in the system and almost nothing is drawn on it: components render
 * on `panel`, `panel-2`, `panel-3`, `well`, and through the `zebra`,
 * `row-hover` and `glass` composites layered on those. The gap between "0
 * failing" and "19 failing" was the whole finding.
 *
 * Three capabilities, ported from theme-research/check-contrast.mjs:
 *
 *   1. Every token is measured against EVERY surface it can land on, declared
 *      per token in the tables below — not against one flattering ground.
 *   2. Surfaces are LAYER STACKS, bottom-first, alpha-composited before the
 *      ratio is computed. `muted` on `row-hover` over `panel-3` is a different
 *      number from `muted` on `panel-3`; checking against the wrong ground is
 *      how contrast bugs ship.
 *   3. Every pair declares its own minimum: 4.5 for body text, 3.0 for UI
 *      graphics and large text (WCAG 1.4.11), and a third tier — `RECORD` —
 *      for marks that are declared decorative and 1.4.11-exempt. Those are
 *      measured and printed but never gated, so the number is on the record
 *      rather than absent from it.
 *
 * EXIT-CODE POLICY — read this before you read a green build as "we're fine".
 *
 *   eva      is GATED. Any failure there exits 1. It was authored against
 *            these numbers and it is expected to stay clean.
 *   classic  is the v1 look, preserved behind `data-kanso-theme` as a
 *            reference. It carries ~19 known failures. They are printed in
 *            full, labelled KNOWN/LEGACY, and they do NOT fail the build,
 *            because fixing them would change v1 and being unchanged is the
 *            only thing v1 is for.
 *
 *   CLASSIC IS NOT FINE. A green build means "no new failures in a gated
 *   theme". It does not mean the legacy block above the summary is empty.
 *   Unresolvable tokens fail the build in every theme, gated or not — a gate
 *   that cannot find its inputs is not passing, it is broken.
 *
 * ADVISORY ROWS (`NOTE`) are ramp-stop-against-ramp-stop and series-against-
 * series adjacency. WCAG 1.4.11 governs a graphical object against its
 * adjacent colour and every ramp stop already clears 3:1 against the track,
 * so these are not literal AA failures — they answer the more practical
 * question "can a user tell WARNING from CRITICAL?". They are measured and
 * printed, never gated. The fix for a bad one is rampStep()'s NAME rendered
 * as text beside the bar, not more hue.
 *
 * Reads tokens/*.json + tokens/themes/*.json directly, so the gate does not
 * depend on the build step having run.
 *
 * Usage: node scripts/check-contrast.mjs [--all] [--theme <id>]
 *        --all    print every pair, not just the worst surface per token
 *        --theme  restrict to one theme id (classic | eva | ...)
 */
import { readFileSync, readdirSync, existsSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const root = dirname(dirname(fileURLToPath(import.meta.url)));

/* ========================================================================
   DECLARED DATA — the contract. Everything below this block is machinery.

   A token file that lists colours tells you nothing about whether the design
   works. A file that lists PAIRS PLUS MINIMUMS is a testable contract. Edit
   the tables; do not bury a judgement call in the loop.
   ======================================================================== */

/** AA normal text. Anything that can carry a sentence or a number. */
const AA = 4.5;
/** AA large text (>=18.66px bold / 24px) and WCAG 1.4.11 UI graphics. */
const AA_LARGE = 3;
/**
 * RECORDED, not required. WCAG 1.4.11 exempts marks that are never the sole
 * indicator of anything (a hairline between two rows already separated by
 * position and padding) and the presentation of inactive/disabled components.
 * Asserting a number for those would be inventing a threshold; asserting
 * nothing would let a hairline silently reach its own background colour. So
 * they are measured and printed every run, and never gated. Moving a pair out
 * of this tier — deciding a mark IS load-bearing — is the real decision, and
 * it is made here, in this table.
 */
const RECORD = null;

/**
 * Surfaces, as layer stacks, BOTTOM FIRST. Translucent layers are composited
 * onto the layer beneath before measurement.
 *
 * The composites are grounded in what the library actually draws, not in what
 * the tokens permit — each is cited. If you add a component that puts an
 * interactive row on a different ground, add the composite here.
 */
const SURFACES = {
  bg: ["color.bg"],
  well: ["color.well"],
  panel: ["color.panel"],
  "panel-2": ["color.panel-2"],
  "panel-3": ["color.panel-3"],

  // Composites — the ones a token-vs-#000 gate cannot see.
  "zebra/panel": ["color.panel", "color.zebra"], // Table rows, Terminal lines
  "hover/panel": ["color.panel", "color.row-hover"], // Table row hover
  "wash/panel": ["color.panel", "color.primary-wash"], // selected row, active menu item
  // NOTE: there is deliberately no `hover/panel-3`. `panel-3` today is drawn
  // only by the checkerboard in src/base/surfaces.css — nothing hovers a row
  // on it. In classic, `muted` on row-hover over panel-3 measures 3.54:1, the
  // worst value in the system; the moment a component puts a hoverable row on
  // panel-3, add it here and expect that number back.

  // Best case for glass: it sits over the brightest opaque panel. A
  // backdrop-filter over a chart, an image or a video composites to something
  // else entirely and that ratio cannot be computed in advance — which is why
  // glass may only carry `text` / `text-2`.
  "glass/panel-3": ["color.panel-3", "glass.bg"],
  "glass-heavy/bg": ["color.bg", "glass.bg-heavy"],
  "scrim/panel-3": ["color.panel-3", "color.scrim"],

  // Solid fills that carry a label.
  "fill/primary": ["color.primary"],
  "fill/danger": ["color.danger"],
  "fill/warning": ["color.warning"],
  "fill/success": ["color.success"],
  "fill/info": ["color.info"],

  // Meter / graph trough.
  track: ["ramp.void"],
};

/** Every opaque and composite surface that body text is drawn on. */
const TEXT_ON = [
  "bg",
  "well",
  "panel",
  "panel-2",
  "panel-3",
  "zebra/panel",
  "hover/panel",
  "wash/panel",
  "glass/panel-3",
];

/**
 * Surfaces for text that is only ever drawn on a panel, not in a scrolling
 * row: panel titles, readout labels, chart axis labels.
 */
const PANEL_ON = ["bg", "well", "panel", "panel-2", "panel-3"];

/** Chrome (borders, marks, meter fills) lands on the same grounds as text. */
const CHROME_ON = ["bg", "panel", "panel-2", "panel-3", "hover/panel"];

/**
 * Declared pairs. `fg` is a token path `<group>.<name>`; `on` is a list of
 * surface keys; `min` is the ratio it must clear on EVERY one of them.
 */
const PAIRS = [
  /* -- body and label text ------------------------------------------------ */
  { fg: "color.text", on: TEXT_ON, min: AA, use: "Primary text, numerics" },
  { fg: "color.text-2", on: TEXT_ON, min: AA, use: "Body" },
  { fg: "color.text-dim", on: TEXT_ON, min: AA, use: "Secondary labels" },
  { fg: "color.muted", on: TEXT_ON, min: AA, use: "Table/menu labels, units — the floor" },

  /* -- semantic text ------------------------------------------------------ */
  { fg: "color.primary", on: TEXT_ON, min: AA, use: "Accent text, links, active label" },
  { fg: "color.primary-hot", on: TEXT_ON, min: AA, use: "Hover/active accent text" },
  { fg: "color.info", on: TEXT_ON, min: AA, use: "Info text" },
  { fg: "color.success", on: TEXT_ON, min: AA, use: "Success text" },
  { fg: "color.danger", on: TEXT_ON, min: AA, use: "Danger text" },
  { fg: "color.warning", on: TEXT_ON, min: AA, use: "Warning text" },
  { fg: "color.magenta", on: PANEL_ON, min: AA, use: "Series/chart label" },
  { fg: "color.lime", on: PANEL_ON, min: AA, use: "Series/chart label" },

  /* -- phosphor text (the glow variants are text by definition) ----------- */
  { fg: "color.phosphor-orange", on: PANEL_ON, min: AA, use: "Phosphor text" },
  { fg: "color.phosphor-amber", on: PANEL_ON, min: AA, use: "Phosphor text" },
  { fg: "color.phosphor-lime", on: PANEL_ON, min: AA, use: "Phosphor text" },
  { fg: "color.phosphor-violet", on: PANEL_ON, min: AA, use: "Phosphor text — violet's TEXT form" },
  { fg: "color.phosphor-cyan", on: PANEL_ON, min: AA, use: "Phosphor text" },
  { fg: "color.phosphor-green", on: PANEL_ON, min: AA, use: "Phosphor text" },
  { fg: "color.phosphor-red", on: PANEL_ON, min: AA, use: "Phosphor text" },

  /* -- labels on solid fills ---------------------------------------------- */
  {
    fg: "color.ink",
    on: ["fill/primary", "fill/danger", "fill/warning", "fill/success", "fill/info"],
    min: AA,
    use: "Label on a solid button/badge fill",
  },

  /* -- text over overlays -------------------------------------------------- */
  { fg: "color.text", on: ["glass-heavy/bg", "scrim/panel-3"], min: AA, use: "Modal/palette text" },
  { fg: "color.text-2", on: ["glass-heavy/bg", "scrim/panel-3"], min: AA, use: "Modal/palette body" },

  /* -- decorative / surface-only hues, previously ungated ------------------
     `accent` is NOT a text token: #7c3aed measures 3.14:1 on panel-3 and
     KANSO.md §10 plus the eva theme both state the violet family is a
     series/surface colour whose text form is `phosphor-violet`. It is gated
     here at the UI-graphic minimum, which is the job it actually has. */
  { fg: "color.accent", on: CHROME_ON, min: AA_LARGE, nonText: true, use: "Violet as a MARK — never text (KANSO §10)" },
  { fg: "color.hazard", on: CHROME_ON, min: AA_LARGE, nonText: true, use: "Hazard stripe / placard fill" },
  { fg: "color.magenta", on: CHROME_ON, min: AA_LARGE, nonText: true, use: "Series mark" },
  { fg: "color.lime", on: CHROME_ON, min: AA_LARGE, nonText: true, use: "Series mark" },

  /* -- structural chrome --------------------------------------------------- */
  {
    fg: "color.border-highlight",
    on: ["panel", "panel-2", "panel-3"],
    min: AA_LARGE,
    nonText: true,
    use: "Active/selected outline — must be perceivable",
  },
  { fg: "color.focus", on: CHROME_ON, min: AA_LARGE, nonText: true, use: "Focus ring" },

  /* -- recorded, not required (1.4.11-exempt) ------------------------------
     `border` is the hairline inside a panel. It is never the sole indicator
     of anything — every box it draws is also separated by position, padding
     and background. Raising it to 3:1 would put a spreadsheet outline on
     every element in the system, against KANSO.md rule 3. `border-highlight`
     above is the one that has to be seen, and it IS gated at 3:1.
     The `*-dim` family is inactive/disabled chrome and the edge on a field
     that is already flagged by an icon and a message — 1.4.11 exempts the
     presentation of inactive components. Printed with their real ratios so a
     regression is visible in the diff even though it does not gate. */
  { fg: "color.border", on: ["panel", "panel-2", "panel-3"], min: RECORD, nonText: true, use: "Decorative hairline (1.4.11-exempt)" },
  { fg: "glass.border", on: ["glass/panel-3"], min: RECORD, nonText: true, use: "Decorative overlay edge (1.4.11-exempt)" },
  { fg: "color.primary-dim", on: ["panel", "panel-2", "panel-3"], min: RECORD, nonText: true, use: "Inactive control edge (1.4.11-exempt)" },
  { fg: "color.accent-dim", on: ["panel", "panel-2", "panel-3"], min: RECORD, nonText: true, use: "Inactive control edge (1.4.11-exempt)" },
  // Verified, not assumed: Input.tsx renders a `.kanso-field__error` message
  // wired with aria-invalid + aria-describedby whenever this edge is red, so
  // the colour is never the sole signal.
  { fg: "color.danger-dim", on: ["panel", "panel-2", "panel-3"], min: RECORD, nonText: true, use: "Error field edge — never the sole signal" },
  { fg: "color.success-dim", on: ["panel", "panel-2", "panel-3"], min: RECORD, nonText: true, use: "Inactive control edge (1.4.11-exempt)" },
  { fg: "color.info-dim", on: ["panel", "panel-2", "panel-3"], min: RECORD, nonText: true, use: "Inactive control edge (1.4.11-exempt)" },
  { fg: "color.warning-dim", on: ["panel", "panel-2", "panel-3"], min: RECORD, nonText: true, use: "Inactive control edge (1.4.11-exempt)" },
];

/**
 * Severity ramp. Every stop must clear 3:1 against the track, because a
 * 3%-full meter must still be perceivable — btop's own dark ramp tails fail
 * this and are deliberately not copied.
 */
const RAMP_STOPS = ["nominal", "caution", "elevated", "warning", "critical", "cool"];

/**
 * Ramp stop vs ramp stop. ADVISORY (see header): not a literal AA failure,
 * but it is the number that decides whether a user can tell WARNING from
 * CRITICAL, and orange-vs-red is exactly the axis deuteranopia collapses.
 */
const RAMP_ADJACENT = [
  ["nominal", "caution"],
  ["caution", "elevated"],
  ["elevated", "warning"],
  ["warning", "critical"],
  ["elevated", "critical"],
];

/** Categorical series. Every series must be readable as a mark on a panel. */
const SERIES_KEYS = ["1", "2", "3", "4", "5", "6", "7", "8"];

/**
 * Series vs series. ADVISORY. Neighbours in the sequence plus the two known
 * same-family collisions (orange 1/6, cyan 2/7) that a six-series chart uses
 * together.
 */
const SERIES_ADJACENT = [
  ["1", "2"], ["2", "3"], ["3", "4"], ["4", "5"], ["5", "6"], ["6", "7"], ["7", "8"],
  ["1", "6"], ["2", "7"],
];

/**
 * Themes whose failures are REPORTED BUT NOT GATED. See the exit-code policy
 * in the header. Adding an id here is a decision to stop fixing that theme.
 */
const NOT_GATED = new Set(["classic"]);

/* ========================================================================
   MACHINERY
   ======================================================================== */

/* ---- token loading ---- */

const tokensDir = join(root, "tokens");
const themesDir = join(tokensDir, "themes");
const isNote = (k) => k.startsWith("_") || k.startsWith("$");

/** { group: { name: value } } from tokens/*.json */
function loadBase() {
  const out = {};
  for (const f of readdirSync(tokensDir).filter((f) => f.endsWith(".json"))) {
    const raw = JSON.parse(readFileSync(join(tokensDir, f), "utf8"));
    const group = f.replace(/\.json$/, "");
    out[group] = {};
    for (const [name, token] of Object.entries(raw)) {
      if (isNote(name)) continue;
      out[group][name] = token.$value;
    }
  }
  return out;
}

/** Theme overrides merged over the base — exactly what the CSS cascade does. */
function loadThemes() {
  const base = loadBase();
  const themes = [{ id: "classic", palette: base }];
  if (!existsSync(themesDir)) return themes;
  for (const f of readdirSync(themesDir).filter((f) => f.endsWith(".json"))) {
    const raw = JSON.parse(readFileSync(join(themesDir, f), "utf8"));
    const { $meta = {}, ...groups } = raw;
    const palette = Object.fromEntries(
      Object.entries(base).map(([g, tokens]) => [g, { ...tokens }])
    );
    for (const [group, tokens] of Object.entries(groups)) {
      for (const [name, token] of Object.entries(tokens)) {
        if (isNote(name)) continue;
        if (!palette[group]) palette[group] = {};
        palette[group][name] = token.$value;
      }
    }
    themes.push({ id: $meta.id ?? f.replace(/\.json$/, ""), palette });
  }
  return themes;
}

const tokenValue = (palette, path) => {
  const i = path.indexOf(".");
  return palette[path.slice(0, i)]?.[path.slice(i + 1)];
};

/* ---- colour maths (WCAG 2.2 relative luminance + contrast ratio) ---- */

/** @returns [r,g,b,a] — channels 0-255, alpha 0-1 */
function parseColor(input) {
  const s = String(input).trim();
  let m = /^#([0-9a-f]{3,8})$/i.exec(s);
  if (m) {
    let h = m[1];
    if (h.length === 3 || h.length === 4) h = [...h].map((c) => c + c).join("");
    if (h.length !== 6 && h.length !== 8) throw new Error(`bad hex: ${s}`);
    return [
      parseInt(h.slice(0, 2), 16),
      parseInt(h.slice(2, 4), 16),
      parseInt(h.slice(4, 6), 16),
      h.length === 8 ? parseInt(h.slice(6, 8), 16) / 255 : 1,
    ];
  }
  m = /^rgba?\(\s*([^)]+)\)$/i.exec(s);
  if (m) {
    const parts = m[1].split(/[\s,/]+/).filter(Boolean);
    if (parts.length < 3) throw new Error(`bad rgb: ${s}`);
    const ch = parts
      .slice(0, 3)
      .map((p) => (p.endsWith("%") ? Math.round((parseFloat(p) / 100) * 255) : parseFloat(p)));
    let a = 1;
    if (parts[3] !== undefined) {
      a = parts[3].endsWith("%") ? parseFloat(parts[3]) / 100 : parseFloat(parts[3]);
    }
    return [...ch, a];
  }
  throw new Error(`unparseable colour: ${s}`);
}

/** Source-over composite of `fg` (with alpha) onto opaque `bg`. */
function composite([fr, fg, fb, fa], [br, bg, bb]) {
  return [fr * fa + br * (1 - fa), fg * fa + bg * (1 - fa), fb * fa + bb * (1 - fa), 1];
}

/** Flatten a bottom-first layer stack to one opaque colour. */
function flatten(values) {
  let out = parseColor(values[0]);
  // A translucent bottom layer has no declared ground; assume white, the
  // worst case for the dark foregrounds this system is made of.
  if (out[3] < 1) out = composite(out, [255, 255, 255, 1]);
  for (let i = 1; i < values.length; i++) out = composite(parseColor(values[i]), out);
  return out;
}

function relativeLuminance([r, g, b]) {
  const lin = (c) => {
    const s = c / 255;
    return s <= 0.04045 ? s / 12.92 : Math.pow((s + 0.055) / 1.055, 2.4);
  };
  return 0.2126 * lin(r) + 0.7152 * lin(g) + 0.0722 * lin(b);
}

function contrastRatio(a, b) {
  const la = relativeLuminance(a);
  const lb = relativeLuminance(b);
  const [hi, lo] = la >= lb ? [la, lb] : [lb, la];
  return (hi + 0.05) / (lo + 0.05);
}

const hex = ([r, g, b]) =>
  "#" + [r, g, b].map((v) => Math.round(v).toString(16).padStart(2, "0")).join("");

/* ---- pair expansion ---- */

/** The declared table plus the generated ramp/series pairs. */
function allPairs() {
  const pairs = [...PAIRS];
  for (const stop of RAMP_STOPS) {
    pairs.push({
      fg: `ramp.${stop}`,
      on: ["track"],
      min: AA_LARGE,
      nonText: true,
      use: "Meter fill vs track — a 3%-full meter must be visible",
    });
  }
  for (const [a, b] of RAMP_ADJACENT) {
    pairs.push({
      fg: `ramp.${a}`,
      against: `ramp.${b}`,
      min: AA_LARGE,
      nonText: true,
      advisory: true,
      use: "Adjacent severity steps — can a user tell them apart?",
    });
  }
  for (const key of SERIES_KEYS) {
    pairs.push({
      fg: `series.${key}`,
      on: ["panel", "panel-3"],
      min: AA_LARGE,
      nonText: true,
      use: "Chart series mark vs plot ground",
    });
  }
  for (const [a, b] of SERIES_ADJACENT) {
    pairs.push({
      fg: `series.${a}`,
      against: `series.${b}`,
      min: AA_LARGE,
      nonText: true,
      advisory: true,
      use: "Series adjacency on one chart",
    });
  }
  return pairs;
}

/* ---- runner ---- */

function measure(palette, fgPath, layerPaths) {
  const fgRaw = tokenValue(palette, fgPath);
  const bgRaw = layerPaths.map((p) => tokenValue(palette, p));
  const missing = [
    fgRaw === undefined ? fgPath : null,
    ...layerPaths.filter((p, i) => bgRaw[i] === undefined),
  ].filter(Boolean);
  if (missing.length) return { error: `unresolved token(s): ${missing.join(", ")}` };
  const bg = flatten(bgRaw);
  const fgParsed = parseColor(fgRaw);
  const fg = fgParsed[3] < 1 ? composite(fgParsed, bg) : fgParsed;
  return { ratio: contrastRatio(fg, bg), fgHex: hex(fg), bgHex: hex(bg) };
}

function runTheme(theme, pairs) {
  const groups = [];
  let errors = 0;

  for (const pair of pairs) {
    const targets = pair.against
      ? [{ label: pair.against.replace(/^[a-z]+\./, ""), layers: [pair.against] }]
      : pair.on.map((s) => ({ label: s, layers: SURFACES[s] }));

    const results = [];
    for (const t of targets) {
      let m;
      try {
        m = measure(theme.palette, pair.fg, t.layers);
      } catch (e) {
        m = { error: e.message };
      }
      if (m.error) {
        console.error(`  ! ${theme.id} ${pair.fg} on ${t.label}: ${m.error}`);
        errors++;
        continue;
      }
      results.push({
        surface: t.label,
        ratio: m.ratio,
        bgHex: m.bgHex,
        // A RECORD-tier pair has no declared minimum, so it cannot fail.
        pass: pair.min === RECORD || m.ratio + 1e-9 >= pair.min,
      });
    }
    if (!results.length) continue;
    results.sort((a, b) => a.ratio - b.ratio);
    groups.push({ pair, results, worst: results[0], failed: results.filter((r) => !r.pass) });
  }

  const tally = (fn) => groups.filter(fn).reduce((n, g) => n + g.failed.length, 0);
  const fails = tally((g) => !g.pair.advisory && g.failed.length);
  const notes = tally((g) => g.pair.advisory && g.failed.length);
  const count = groups.reduce((n, g) => n + g.results.length, 0);
  return { theme, groups, fails, notes, errors, count };
}

/* ---- report ---- */

const argv = process.argv.slice(2);
const showAll = argv.includes("--all");
const onlyTheme = argv.includes("--theme") ? argv[argv.indexOf("--theme") + 1] : null;

const pairs = allPairs();
const themes = loadThemes().filter((t) => !onlyTheme || t.id === onlyTheme);
if (!themes.length) {
  console.error(`no such theme: ${onlyTheme}`);
  process.exit(1);
}

let gatedFails = 0;
let totalErrors = 0;
const summaries = [];

for (const theme of themes) {
  const res = runTheme(theme, pairs);
  totalErrors += res.errors;
  const gated = !NOT_GATED.has(theme.id);
  if (gated) gatedFails += res.fails;

  const label = gated ? "GATED" : "KNOWN / LEGACY — reported, not gating";
  console.log(`\n── ${theme.id}  (${label}) ${"─".repeat(Math.max(2, 48 - theme.id.length - label.length))}`);

  const rows = [];
  for (const g of res.groups) {
    // One line per declared pair by default, showing the WORST surface it
    // lands on — every surface with --all.
    const shown = showAll ? g.results : [g.worst];
    for (const r of shown) {
      const flag =
        g.pair.min === RECORD ? "rec" : r.pass ? "pass" : g.pair.advisory ? "NOTE" : gated ? "FAIL" : "KNOWN";
      const spread =
        !showAll && g.results.length > 1 && g.failed.length
          ? ` ${g.failed.length}/${g.results.length} surfaces`
          : "";
      const kind = g.pair.nonText ? "graphic" : "text";
      rows.push([
        flag,
        g.pair.fg.replace(/^color\./, ""),
        // --all shows the colour the layer stack actually composited to, which
        // is the number nobody can work out by eye from the token values.
        `on ${r.surface}${showAll ? ` ${r.bgHex}` : ""}`,
        `${r.ratio.toFixed(2)}:1`,
        (g.pair.min === RECORD ? `recorded ${kind}` : `min ${g.pair.min.toFixed(1)} ${kind}`) + spread,
        g.pair.use,
      ]);
    }
  }
  const w = [0, 1, 2, 3, 4].map((i) => Math.max(...rows.map((r) => r[i].length)));
  for (const r of rows) {
    console.log(
      `${r[0].padEnd(w[0])}  ${r[1].padEnd(w[1])}  ${r[2].padEnd(w[2])}  ${r[3].padStart(w[3])}  ${r[4].padEnd(w[4])}  ${r[5]}`
    );
  }

  summaries.push(
    `${theme.id.padEnd(8)} ${String(res.count).padStart(4)} pairs · ` +
      `${String(res.fails).padStart(2)} fail · ${String(res.notes).padStart(2)} advisory · ` +
      (gated
        ? "GATED — any failure exits 1"
        : "KNOWN LEGACY — v1 look preserved deliberately, NOT gating the build")
  );
}

console.log(`\n${"─".repeat(78)}`);
for (const s of summaries) console.log(s);
console.log(
  `\nSurfaces are layer stacks, alpha-composited bottom-first. "worst" is the\n` +
    `lowest-contrast surface a token can land on; run with --all for every pair.`
);

if (totalErrors) {
  console.error(`\nFAIL: ${totalErrors} token resolution error(s). The gate cannot see its inputs.`);
  process.exit(1);
}
if (gatedFails) {
  console.error(
    `\nFAIL: ${gatedFails} pair(s) below the declared minimum in a GATED theme.\n` +
      `Fix the token, or move the pair to a tier that states what it really is.`
  );
  process.exit(1);
}
console.log(
  `\nOK: every gated theme meets its declared minimums.` +
    (summaries.some((s) => s.includes("LEGACY"))
      ? ` Legacy failures above are\nreal and unfixed — green here does NOT mean classic is fine.`
      : "")
);
