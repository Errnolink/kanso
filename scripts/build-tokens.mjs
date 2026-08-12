// Kanso token pipeline: tokens/*.json (DTCG-flavored) -> src/tokens.ts
// (typed TS constants for components), src/tokens.css + dist/tokens.css (CSS
// custom properties for any HTML/JS project), dist/tokens.json (canonical
// export for non-JS consumers).
//
// Naming contract: every token becomes `--kanso-<group>-<name>` where <group>
// is the filename. Nothing else in the system may invent a custom property.
import { readdirSync, readFileSync, writeFileSync, mkdirSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const root = dirname(dirname(fileURLToPath(import.meta.url)));
const tokensDir = join(root, "tokens");
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
`;

mkdirSync(dirname(outCssDist), { recursive: true });
writeFileSync(outTs, ts);
writeFileSync(outCssSrc, css);
writeFileSync(outCssDist, css);
writeFileSync(outJson, JSON.stringify(jsonOut, null, 2));

const count = groups.reduce((n, g) => n + Object.keys(g.tokens).length, 0);
console.log(
  `tokens -> src/tokens.ts, src/tokens.css, dist/tokens.css, dist/tokens.json (${groups.length} groups, ${count} tokens)`
);
