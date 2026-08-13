# @kanso/ui — 簡素

The house design language: tokens and React components distilled from **NERV-UI**,
**Evangelion** interface design, **btop** terminal telemetry, and **cyberpunk**
chrome — modernised into something that can carry a real application.

Black surfaces, hairline borders, chamfered corners, orange command chrome, mono
labels over tabular values, braille graphs, and a severity gradient shared by every
meter in every app.

**v0.3.0 — 41 components, 172 tokens across 12 groups, 2 themes.**

| Doc | What it answers |
| --- | --- |
| **[KANSO.md](./KANSO.md)** | **The rules.** Palette semantics, geometry, typography, motion, surfaces, themes, how to extend. Read this before adding anything. |
| **[COMPONENTS.md](./COMPONENTS.md)** | The API reference — every prop, type, default, and utility class. |
| **[ADOPTION.md](./ADOPTION.md)** | Migrating the sibling projects: token-by-token tables, divergences needing a decision, recipes for React / Tailwind / vanilla, and the gaps still open. |
| **[AGENTS.md](./AGENTS.md)** | Conventions, verification commands, current state, and the decisions that look like bugs but aren't. |

---

## Install & use

```tsx
import { Panel, Meter, Readout, CRT } from "@kanso/ui";
import "@kanso/ui/kanso.css";

export function App() {
  return (
    <div className="kanso-root">
      <CRT />
      <Panel title="MAGI // CORE STATUS" accent="primary" notch="left">
        <Readout label="UPTIME" value="412:09:55" />
        <Meter label="CPU" value={0.72} />
      </Panel>
    </div>
  );
}
```

Everything is scoped to `.kanso-root` or zero-specificity `:where()` selectors, so
the stylesheet never fights a host app's CSS.

**Without React** — take the tokens and write against the class names:

```html
<link rel="stylesheet" href="node_modules/@kanso/ui/dist/tokens.css" />
```

**Fonts are not bundled.** Load JetBrains Mono, Bebas Neue, Noto Serif Display, and
Shippori Mincho B1 however the host project prefers.

---

## Two design generations

v2 is a **theme layer, not a rewrite.** `tokens/*.json` still compiles to `:root` and still
*is* v1; `tokens/themes/eva.json` compiles to one override block, behind a bare
`[data-kanso-theme="eva"]` attribute selector, that re-declares 86 of the 172 tokens.
Same components, same props, same class names.

| Theme | Attribute | What it is |
| --- | --- | --- |
| `classic` | *(none)* | **v1.** The palette this library shipped with, unchanged |
| `eva` | `data-kanso-theme="eva"` | **v2.** NERV orange `#ff6a00`, an 11px type floor, visible borders, a wider severity ramp |

```tsx
const [theme, setTheme] = useKansoTheme();   // writes <html>, persists the choice
```

`applyTheme`, `readTheme`, `THEMES` and `ThemeId` are exported for apps that manage their
own state. **`classic` is the absence of the attribute**, so an app that never opts in has
exactly the DOM it had before themes existed. Custom properties inherit, so putting the
attribute on any element re-themes that subtree — one panel, or the whole document.

v1 is kept, not deprecated: it is the reference v2 is measured against. It carries 11 known
contrast failures out of 230 measured pairs, and two type tokens below the 11px floor (8px
and 10px). Both gates print them and deliberately do not fail on them — fixing them would
change what v1 looks like, which is the one thing the toggle exists to prevent. KANSO.md §3
and §10 have the detail.

---

## What's in the box

**Foundation** — 172 tokens across 12 groups, two themes, a global reset, six clip-path
shape primitives, the typographic roles, surface skins and bevel fills, focus, contrast,
transparency and reduced-motion handling.

**Runtime helpers** — `rampColor()` / `rampGradient()` / `rampOverrange()` (the five-stop
severity ramp), `brailleGraph()` / `blockBar()` / `BOX` / `MARK` (the btop glyph layer),
`useKansoTheme()` and the motion constants.

**Components** — chrome (Panel, Frame, Divider, HazardStripe, TopBar,
StatusBar, CRT, DataTexture), telemetry (TermBox, Meter, Gauge, Sparkline, BrailleGraph,
BarChart, SegmentBar, CoreGrid, Progress, LED, Readout, DataList, Table, Terminal,
MagiConsensus, Skeleton), controls (Button, IconButton, Chip, Input, Textarea, Select,
Checkbox, Radio, Switch, Slider, Segmented, Badge), and overlays (Modal, Toast, Tooltip,
Menu, CommandPalette, Alert, Takeover, BootSequence, Spinner).

---

## Development

```bash
npm run build:tokens     # tokens/*.json + tokens/themes/*.json -> ts / css / json
npm run check:contrast   # 230 pairs per theme, against real composited surfaces
npm run check:type       # the 11px floor, across CSS, inline styles and tokens
npm run verify           # tokens + contrast + type + typecheck
npm run dev              # playground gallery
npm run build            # library bundle -> dist/
npm run smoke            # render the gallery in a real browser
```

Tokens are the source of truth. Edit `tokens/*.json`, never the generated files.

Both gates report v1's known defects and still exit 0. **A green `verify` does not mean
`classic` is clean** — it means `eva` is, and `classic` is preserved on purpose.
