// Kanso token pipeline: tokens/*.json (DTCG-flavored) -> src/tokens.ts
// (typed TS constants for components), src/tokens.css + dist/tokens.css (CSS
// custom properties for any HTML/JS project), dist/tokens.json (canonical
// export for non-JS consumers).
//
// Naming contract: every token becomes `--kanso-<group>-<name>` where <group>
// is the filename. Nothing else in the system may invent a custom property.
//
// Themes: `tokens/themes/<id>.json` is an *override* map, `{ <group>: { <name>:
// token } }`. It emits one extra selector block re-declaring only the tokens it
// names; everything else inherits from `:root`. That is what lets a theme be a
// toggle rather than a fork — v1 stays byte-identical in `:root`, and switching
// `data-kanso-theme` swaps a few dozen custom properties underneath the same
// components.
import {
  readdirSync,
  readFileSync,
  writeFileSync,
  mkdirSync,
  existsSync,
} from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const root = dirname(dirname(fileURLToPath(import.meta.url)));
const tokensDir = join(root, "tokens");
const themesDir = join(tokensDir, "themes");
const outTs = join(root, "src", "tokens.ts");
const outCssSrc = join(root, "src", "tokens.css");
const outCssDist = join(root, "dist", "tokens.css");
const outJson = join(root, "dist", "tokens.json");

const NUMERIC_TYPES = new Set(["number", "duration"]);

// Keys beginning with `_` are file-level notes, not tokens. Without this
// they compile to `--kanso-<group>-_comment: undefined`.
const isNote = (key) => key.startsWith("_");

const groups = readdirSync(tokensDir)
  .filter((f) => f.endsWith(".json"))
  .sort()
  .map((f) => {
    const raw = JSON.parse(readFileSync(join(tokensDir, f), "utf8"));
    const tokens = Object.fromEntries(
      Object.entries(raw).filter(([key]) => !isNote(key))
    );
    return { name: f.replace(/\.json$/, ""), tokens };
  });

// `$meta` documents the theme; it is not a token group.
const themes = (existsSync(themesDir) ? readdirSync(themesDir) : [])
  .filter((f) => f.endsWith(".json"))
  .sort()
  .map((f) => {
    const raw = JSON.parse(readFileSync(join(themesDir, f), "utf8"));
    const { $meta = {}, ...groups } = raw;
    const id = $meta.id ?? f.replace(/\.json$/, "");
    return { id, meta: $meta, groups };
  });

const baseNames = new Map(
  groups.map((g) => [g.name, new Set(Object.keys(g.tokens))])
);

function cssValue(token) {
  if (token.$type === "cubicBezier") {
    return `cubic-bezier(${token.$value.join(", ")})`;
  }
  // Durations land in CSS already carrying their unit — consumers write
  // `transition: color var(--kanso-motion-duration-tick) ...`, never `…ms`.
  if (token.$type === "duration") {
    return `${token.$value}ms`;
  }
  return token.$value;
}

function tsValue(token) {
  if (token.$type === "cubicBezier") {
    return `[${token.$value.join(", ")}] as const`;
  }
  // Numbers and durations stay numbers in TS so they can feed anime.js and
  // arithmetic directly (durations are milliseconds).
  if (NUMERIC_TYPES.has(token.$type)) {
    return String(Number(token.$value));
  }
  return `"${String(token.$value).replaceAll('"', '\\"')}"`;
}

let css = `/* Kanso design tokens — generated from tokens/*.json. Do not edit. */\n:root {\n`;
const jsonOut = {};

for (const group of groups) {
  css += `\n  /* ${group.name} */\n`;
  jsonOut[group.name] = {};
  for (const [name, token] of Object.entries(group.tokens)) {
    css += `  --kanso-${group.name}-${name}: ${cssValue(token)};\n`;
    jsonOut[group.name][name] = token.$value;
  }
}

css += `}\n`;

// --- theme override blocks ------------------------------------------------
// One attribute selector, deliberately not qualified with `:root` or
// `.kanso-root`. Custom properties inherit, so putting the attribute on *any*
// element re-declares the palette for that subtree — which is what lets the
// gallery render both design generations side by side on one page, and lets a
// host app theme a single panel without a second stylesheet.
const themeJson = {};
const unknown = [];

for (const theme of themes) {
  const sel = `[data-kanso-theme="${theme.id}"]`;
  css += `\n/* theme: ${theme.id}${theme.meta.label ? ` — ${theme.meta.label}` : ""}. Overrides only; everything else inherits :root. */\n`;
  css += `${sel} {\n`;
  themeJson[theme.id] = { $meta: theme.meta };
  for (const [groupName, tokens] of Object.entries(theme.groups)) {
    css += `\n  /* ${groupName} */\n`;
    themeJson[theme.id][groupName] = {};
    for (const [name, token] of Object.entries(tokens)) {
      if (isNote(name)) continue;
      // A theme may only re-declare tokens the base defines. Inventing one
      // here would give a property that exists in exactly one theme, which
      // is how a component silently loses its colour in the other.
      if (!baseNames.get(groupName)?.has(name)) {
        unknown.push(`${theme.id}: --kanso-${groupName}-${name}`);
        continue;
      }
      css += `  --kanso-${groupName}-${name}: ${cssValue(token)};\n`;
      themeJson[theme.id][groupName][name] = token.$value;
    }
  }
  css += `}\n`;
}

if (unknown.length) {
  console.error(
    `\nTheme override names no base token — add it to tokens/<group>.json first:\n  ${unknown.join("\n  ")}\n`
  );
  process.exitCode = 1;
}

const themeTs = themes.length
  ? `
/** Theme override maps. Keys are the tokens a theme re-declares; everything
    else inherits from \`kanso\`. Applied in CSS via \`data-kanso-theme\`. */
export const kansoThemes = {
${themes
  .map((theme) => {
    const body = Object.entries(theme.groups)
      .map(([groupName, tokens]) => {
        const entries = Object.entries(tokens)
          .filter(([name]) => !isNote(name) && baseNames.get(groupName)?.has(name))
          .map(
            ([name, token]) =>
              `      ${/^[a-z][a-z0-9]*$/.test(name) ? name : JSON.stringify(name)}: ${tsValue(token)},`
          )
          .join("\n");
        return `    ${JSON.stringify(groupName)}: {\n${entries}\n    },`;
      })
      .join("\n");
    // `$meta` is emitted alongside the groups because `theme.ts` builds the
    // user-facing theme list from it. Stripping it here is what made every
    // theme's `description` an empty string.
    const meta = [
      `      id: ${JSON.stringify(theme.meta.id ?? theme.id)},`,
      `      label: ${JSON.stringify(theme.meta.label ?? theme.id.toUpperCase())},`,
      `      description: ${JSON.stringify(theme.meta.description ?? "")},`,
    ].join("\n");
    return `  ${JSON.stringify(theme.id)}: {\n    $meta: {\n${meta}\n    },\n${body}\n  },`;
  })
  .join("\n")}
} as const;

export type KansoThemeId = keyof typeof kansoThemes;

/** Every theme id the token pipeline emitted, plus the untouched base. */
export const KANSO_THEMES = ["classic", ${themes.map((t) => JSON.stringify(t.id)).join(", ")}] as const;
`
  : "";

const ts = `// Kanso design tokens — generated from tokens/*.json. Do not edit.
export const kanso = {
${groups
  .map((g) => {
    const entries = Object.entries(g.tokens)
      .map(
        ([name, token]) =>
          `    ${/^[a-z][a-z0-9]*$/.test(name) ? name : JSON.stringify(name)}: ${tsValue(token)},`
      )
      .join("\n");
    return `  ${g.name}: {\n${entries}\n  },`;
  })
  .join("\n")}
} as const;

export type Kanso = typeof kanso;

/** CSS custom-property reference for a token, e.g. cssVar("color", "primary"). */
export function cssVar<G extends keyof Kanso>(group: G, name: keyof Kanso[G] & string): string {
  return \`var(--kanso-\${group}-\${name})\`;
}
${themeTs}`;

mkdirSync(dirname(outCssDist), { recursive: true });
writeFileSync(outTs, ts);
writeFileSync(outCssSrc, css);
writeFileSync(outCssDist, css);
writeFileSync(outJson, JSON.stringify({ ...jsonOut, $themes: themeJson }, null, 2));

const count = groups.reduce((n, g) => n + Object.keys(g.tokens).length, 0);
const themeCount = themes.reduce(
  (n, t) => n + Object.values(t.groups).reduce((m, g) => m + Object.keys(g).length, 0),
  0
);
console.log(
  `tokens -> src/tokens.ts, src/tokens.css, dist/tokens.css, dist/tokens.json (${groups.length} groups, ${count} tokens` +
    (themes.length
      ? `; ${themes.length} theme(s) [${themes.map((t) => t.id).join(", ")}] overriding ${themeCount} tokens)`
      : ")")
);
