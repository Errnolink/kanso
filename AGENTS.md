# AGENTS.md

Do not preserve backward compatibility. Remove obsolete paths instead of adding
compatibility layers, fallbacks, or migrations.

Choose the simplest implementation that fully meets the current requirements.
Avoid speculative abstractions, configuration, and indirection.

Grow the system in layers. Start from the smallest version that works end to end,
and add each new capability on top of a product that already works.

Use the editor's native write/edit tools for file changes — never spawn shells to
create or modify file contents. Use the shell only for executing commands.

## Project: kanso

`@kanso/ui` — the in-house design language. Tokens + React components distilled
from NERV-UI, Evangelion interface design, btop terminal telemetry and cyberpunk
chrome. Consumed by the other projects under `Documents/Errnolink/`.

**The docs are the source of truth, in this order:**

| File | What it answers |
| --- | --- |
| `KANSO.md` | The rules. Palette semantics, geometry, typography, motion, surfaces, themes, how to extend. **Read this before adding anything.** |
| `COMPONENTS.md` | The API reference. Every prop, type, default, and utility class. |
| `ADOPTION.md` | How the sibling projects map onto Kanso, and the gaps the system still has. |
| `README.md` | Overview and install. |

One document lives outside the repo and outranks none of them, but explains
*why* v2 looks the way it does: **`../theme-research/REPORT.md`**. It is the
research archive — the Evangelion / btop / cyberpunk source analysis, the
accessibility evidence, and a 20-item audit of this library measured against it.
The `eva` theme and everything in §"Current state" below is that report
implemented. Treat it as read-only history: it is a dated snapshot, it is not
under version control, and its Part B measurements describe the pre-v2 tree.

## Verify before finishing

```bash
npm run verify   # build:tokens -> check:contrast -> check:type -> typecheck
npm run build    # library bundle; must succeed before you claim done
```

Browser checks — start `npm run dev` first, then point these at the port it
actually prints (it falls back from 5173 if the port is taken):

```bash
node scripts/smoke.mjs   http://localhost:PORT   # renders, full-page screenshot
node scripts/shots.mjs   http://localhost:PORT [sectionId...]
node scripts/interact.mjs http://localhost:PORT  # opens every overlay, asserts ARIA
```

All three resolve a browser through `scripts/chrome.mjs`: `CHROME_PATH` first,
then a Chromium downloaded under your home directory, then the usual system
installs for the platform. Set `CHROME_PATH` to override. `playwright-core`
ships no binary on purpose, which is why this exists at all.

`interact.mjs` is the one that matters for overlays — a static gallery never opens
them, so Modal/Menu/Palette/Toast regressions are invisible without it. It asserts
that overlays actually **unmount**: a palette that lingers leaves a scrim that
swallows every later click.

## Hard conventions

1. **Tokens are the source of truth.** Edit `tokens/*.json`, never the generated
   `src/tokens.ts` / `src/tokens.css` / `dist/tokens.*`. Add a token before you add
   a value; if a component needs a colour that isn't in `tokens/`, either it should
   reuse an existing role or the role is missing from the system.
2. **Naming.** Global tokens are `--kanso-<group>-<name>` where group is the
   filename. Component-local properties are `--kanso-<component>-<name>` and must
   have a default in the component's own base CSS block.
3. **File layout.** `src/components/<Name>/<Name>.tsx` + `<Name>.css`, one
   `@import` in `src/kanso.css`, one `export` + `export type` pair in
   `src/index.ts`. **Components never import their own CSS** — `kanso.css`
   aggregates so consumers get one file and one predictable cascade order.
4. **Class names are public API.** The vanilla-CSS consumers (NERV Style AQI,
   app-launcher) use them directly without React. Renaming one is a breaking change.
5. **Durations already carry their unit in CSS.** Write
   `var(--kanso-motion-duration-tick)`, never `var(--kanso-motion-duration-tick)ms`
   — that produces `140msms`, which is invalid and silently kills the transition.
   In TS the same tokens are plain numbers (milliseconds).
6. **Accessibility is not optional here.** Dark chrome and small type make it easy
   to ship an invisible focus ring. Cyan `#20f0ff` is reserved for focus (eva
   repoints it to pattern-blue `#4aa8ff`). Clipped elements draw the ring as an
   inset `box-shadow`, because a `clip-path` crops an `outline` — **and because
   `box-shadow` is forced to `none` in `forced-colors: active`, `base/a11y.css`
   restores a real `outline` there at a negative offset.** A positive offset puts
   the ring outside the clip polygon, where it is clipped away entirely; that sign
   is load-bearing, not cosmetic. Every meter carries real `aria-value*`, every log
   `role="log"`, every modal `aria-modal` with a focus trap.
7. **`npm run check:contrast` gates 230 pairs per theme.** Not tokens against
   `#000000` — that was the old gate, and pure black is the most favourable
   surface in the system, which is how `muted` shipped at 3.86:1 and how eleven
   more pairs went unnoticed. It now composites **layer stacks** (`row-hover` over
   `panel-3` is a different number from `panel-3`), declares a per-pair minimum
   and a `nonText` tier, and resolves each theme's effective palette. Surfaces,
   pairs and tiers are **declared as data at the top of the file** — extend the
   table, not the loop. `check:type` enforces the 11px floor over CSS, inline
   styles and theme tokens alike.
8. **Themes are override maps, never forks.** `tokens/themes/<id>.json` may only
   re-declare a token the base already defines; inventing one there fails the
   build, because a property that exists in a single theme is how a component
   silently loses its colour in the other. Style components with `var(--kanso-*)`
   and they follow the toggle for free. **Do not resolve a token to a literal in
   JS** — that is exactly the bug that made `ramp.ts` bake v1 hex into every meter.

## Current state — v0.3.0

41 components, 172 tokens across 12 groups, **2 themes**. `verify` and `build`
both clean.

Layers: chrome (Panel, Frame, Divider, HazardStripe, TopBar/Brand, StatusBar,
CRT/Scanlines/Grain/Vignette) · telemetry (TermBox, Meter, Gauge, Sparkline,
BrailleGraph, BarChart, SegmentBar, CoreGrid, Progress, LED, Readout, DataList,
Table, Terminal, Skeleton, **MagiConsensus**) · controls (Button, IconButton,
Chip, Input, Textarea, Select, Checkbox, Radio, Switch, Slider, Segmented,
Badge) · overlays (Modal, Toast, Tooltip, Menu, CommandPalette, Alert,
**Takeover**, BootSequence, Spinner) · display (**DataTexture**).

### The two design generations

v2 is a **theme layer, not a rewrite**. `tokens/*.json` still compiles to `:root`
and still *is* v1; `tokens/themes/eva.json` compiles to one override block behind
a bare `[data-kanso-theme="eva"]` attribute selector. Because custom properties
inherit, putting that attribute on any element re-themes that subtree — which is
how the gallery renders both generations side by side, and how an app themes a
single panel without a second stylesheet.

```tsx
const [theme, setTheme] = useKansoTheme();   // writes <html>, persists the choice
```

`classic` is the **absence** of the attribute, so an app that never opts in has
exactly the DOM it had before themes existed. `applyTheme`, `readTheme`, `THEMES`
and `ThemeId` are exported for apps managing their own state.

What `eva` changes: NERV orange `#ff6a00` for `#ff9830`; an **11px type floor**
(v1's `size-xs` is 8px); `border-highlight` raised to a perceivable `#6c6c78`;
`muted` lifted to clear 4.5:1 on every real surface; a wider severity ramp with a
true green at the bottom; Shippori Mincho B1 promoted to `display`; pattern-blue
focus; static scanlines; reduced phosphor.

**v1 is kept, not deprecated.** It is the reference v2 is measured against. Both
gates therefore *report* v1's known defects — 11 contrast pairs and the 8/10px
type tokens — without failing on them, and say so in their output. **A green
`verify` does not mean classic is fine.** Do not "fix" those without a decision
to change what v1 looks like, because the whole point of the toggle is that v1
still renders the way it always did.

### Decisions that look like bugs but aren't

- **The Radio's dot is the library's only `border-radius`.** Deliberate, owner-
  approved: a square dot in a square box reads as a checkbox. Documented in
  `KANSO.md` rule 2.
- **A focused *invalid* field shows the cyan focus ring, not the red one.** Focus
  visibility outranks state colour; the error is still carried by the resting
  border, the `!` prefix and the message.
- **`TermBox`'s frame variant is `boxStyle`, not `style`** — `style` stays the DOM
  escape hatch.
- **`Chip` and `Scanlines` are the only reason `animejs` is a dependency.** Chip
  tweens colour, border and text-shadow together on a mechanical curve; CSS
  transitions cannot coordinate them the same way.
- **Meters fill with `transform: scaleX()`, not `width`** — a virtualized grid can
  show fifty at once and animating `width` repaints every one every frame.
- **`Sparkline` is fluid by default; `BrailleGraph` auto-fits its columns.** Both
  measure their container rather than taking a fixed size.
- **`check:contrast` and `check:type` exit 0 while printing real failures.** Those
  are v1's, reported deliberately and labelled `KNOWN`. See "The two design
  generations" above before touching them.
- **`text-faint` (`#6a6a65`) is below the AA floor on purpose.** It is the one
  decorative-only text token, for `DataTexture` and nothing else, and it is
  excluded from the gate's text tier. It exists so that effect is a *declared*
  colour rather than `muted` behind an `opacity` multiplier — an opacity fudge
  makes the delivered ratio unmeasurable, which is the failure this system
  exists to prevent. Anything using it must be `aria-hidden`.
- **Phosphor glow silently disappears below `size-md`.** `text.css` gates the blur
  through a `clamp()` on `1em`, so it keys off the element's real computed size
  with no blocklist of classes. A 4px blur on an 8–11px glyph is a large fraction
  of the stroke width. It is also `none` under `prefers-contrast: more`, and
  `forced-colors` kills it by specification — so glow can never be load-bearing.
- **`Meter`'s overrange block is a flag, not a quantity.** Fixed width, no
  encoding of how far past `max` the value went; the true number carries the
  magnitude, as btop does. Encoding excess as width would either animate `width`
  or distort the hazard stripes under `scaleX`.
- **`MagiConsensus` does not measure its own wires.** The connector SVG uses
  nominal percentages and no `ResizeObserver`, because the lines run behind
  opaque boxes. Below 480px they are `display: none` rather than drawn wrong.
- **`DataTexture` will not pad or repeat to fill `rows`.** A caller wanting a
  taller field supplies more real data. Filling a dashboard with meaningless
  content to look busy is the anti-pattern the component exists to replace.

### Known gaps

`ADOPTION.md` §5 lists 18 of them, each tied to a real file in a sibling project.
The sharpest, in rough priority order:

1. **`Chip` has no CSS-only state transitions** (it tweens in anime.js), so the two
   vanilla projects it cites as its own lineage cannot actually use it. Needs a
   `.kanso-chip--active` + CSS transition fallback.
2. **No `<LineChart>`** — a time series with a past/forecast split. `NERV Style
   AQI/src/ui/chart.js` hand-builds one; it is the largest gap in the system.
3. **No `<PieChart>` / donut**, no **vertical `<BarChart>`**, no **`<Kbd>`**.
4. **No density scale** and no user-facing effects registry for the atmosphere
   layer — both already solved independently in `cadence-planner`.

Opened by the v2 work:

5. **No light mode, deliberately.** Both the research report and this library
   agree: a tonally-inverted Eva theme is incoherent, because the aesthetic is
   constituted by black being the majority of the frame. If one is ever wanted it
   must be a separate *document* register — ink on bone paper, effects layer off
   by definition — not an inversion. `filter: invert()` is not a light mode.
6. **`glass` can never carry a verified contrast number.** A ratio against a
   translucent surface is a range, not a value, and `prefers-reduced-transparency`
   changes the composite. The gate measures only the best case (glass over
   `panel-3`) and says so. Proposed rule, not yet enforced: glass may carry `text`
   and `text-2` only, never `muted` or any `-dim` token.
Two more were **resolved as toggles rather than decisions**, on the same
principle as the theme itself — where the generations disagree, both values
survive and the attribute picks:

7. **Adjacent severity-ramp stops sit ~1.2–1.7:1 apart.** Inherent to five stops
   on a green→red path, and not a literal 1.4.11 failure since every stop clears
   3:1 against the track. More hue would not fix it; the *word* does.
   `Meter.showStep` is therefore three-state: `true`/`false` pin it, and leaving
   it undefined defers to the theme — off under classic, **on under eva**. The
   word is always in the DOM and CSS decides, so switching costs no re-render
   and v1 renders exactly as before. Measured on the gallery: 8 of 25 meters
   show it under classic (only the explicitly pinned ones), 24 under eva.
8. **`hazard` is violet in both themes.** The report's objection was about hazard
   *striping*, where amber/black is the convention — a different object from a
   level-5 state colour, and violet-past-red is a real convention there (AQI uses
   purple and maroon for its worst bands). What was actually wrong is that
   classic's `#b020ff` is 3.54:1 on `panel-3`, too dark to carry a word. eva
   lifts it to `#d38bff` at 7.02:1. Both survive behind the toggle.

Still genuinely open:

9. **`scripts/chrome.mjs` picks the newest downloaded Chromium by directory-name
   sort.** Good enough, and it beats the pinned build number it replaced, but it
   is a string sort — `win64-9…` would sort above `win64-10…`. Set `CHROME_PATH`
   if it ever picks wrong.

## Commit style

`feat(vX.Y.Z): …` / `fix: …` / `chore: …` / `docs: …` on `main`.
Do not add AI co-author trailers.
