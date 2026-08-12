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
| `KANSO.md` | The rules. Palette semantics, geometry, typography, motion, surfaces, how to extend. **Read this before adding anything.** |
| `COMPONENTS.md` | The API reference. Every prop, type, default, and utility class. |
| `ADOPTION.md` | How the sibling projects map onto Kanso, and the gaps the system still has. |
| `README.md` | Overview and install. |

## Verify before finishing

```bash
npm run verify   # build:tokens -> check:contrast -> typecheck
npm run build    # library bundle; must succeed before you claim done
```

Browser checks — start `npm run dev` first, then point these at the port it
actually prints (it falls back from 5173 if the port is taken):

```bash
node scripts/smoke.mjs   http://localhost:PORT   # renders, full-page screenshot
node scripts/shots.mjs   http://localhost:PORT [sectionId...]
node scripts/interact.mjs http://localhost:PORT  # opens every overlay, asserts ARIA
```

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
   to ship an invisible focus ring. Cyan `#20f0ff` is reserved for focus. Clipped
   elements draw the ring as an inset `box-shadow`, because a `clip-path` crops an
   `outline`. Every meter carries real `aria-value*`, every log `role="log"`, every
   modal `aria-modal` with a focus trap.
7. **`npm run check:contrast` gates every text token.** It exists because `muted`
   shipped at 3.86:1. If you add a colour that can carry text, add it to that
   script's `TEXT_TOKENS` map with the tier it must clear.

## Current state — v0.2.0

38 components, 171 tokens across 12 groups. `verify` and `build` both clean; the
gallery reports 0 console errors and every `interact.mjs` check passes.

Layers: chrome (Panel, Frame, Divider, HazardStripe, TopBar/Brand, StatusBar,
CRT/Scanlines/Grain/Vignette) · telemetry (TermBox, Meter, Gauge, Sparkline,
BrailleGraph, BarChart, SegmentBar, CoreGrid, Progress, LED, Readout, DataList,
Table, Terminal, Skeleton) · controls (Button, IconButton, Chip, Input, Textarea,
Select, Checkbox, Radio, Switch, Slider, Segmented, Badge) · overlays (Modal,
Toast, Tooltip, Menu, CommandPalette, Alert, BootSequence, Spinner).

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

## Commit style

`feat(vX.Y.Z): …` / `fix: …` / `chore: …` / `docs: …` on `main`.
Do not add AI co-author trailers.
