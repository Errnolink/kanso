# @kanso/ui — 簡素

The house design language: tokens and React components distilled from **NERV-UI**,
**Evangelion** interface design, **btop** terminal telemetry, and **cyberpunk**
chrome — modernised into something that can carry a real application.

Black surfaces, hairline borders, chamfered corners, orange command chrome, mono
labels over tabular values, braille graphs, and a severity gradient shared by every
meter in every app.

| Doc | What it answers |
| --- | --- |
| **[KANSO.md](./KANSO.md)** | **The rules.** Palette semantics, geometry, typography, motion, surfaces, how to extend. Read this before adding anything. |
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

## What's in the box

**Foundation** — 145 tokens across 12 groups, a global reset, six clip-path shape
primitives, the typographic roles, surface skins and bevel fills, focus and
reduced-motion handling.

**Runtime helpers** — `rampColor()` / `rampGradient()` (the five-stop severity
ramp), `brailleGraph()` / `blockBar()` / `BOX` / `MARK` (the btop glyph layer), and
the motion constants.

**Components** — chrome (Panel, Frame, Divider, HazardStripe, TopBar, StatusBar,
CRT), telemetry (TermBox, Meter, Gauge, Sparkline, BrailleGraph, BarChart,
SegmentBar, CoreGrid, Progress, LED, Readout, DataList, Table, Terminal), controls
(Button, IconButton, Chip, Input, Select, Checkbox, Radio, Switch, Slider,
Segmented), and overlays (Modal, Toast, Tooltip, Menu, CommandPalette, Alert,
BootSequence, Spinner, Badge, Skeleton).

---

## Development

```bash
npm run build:tokens     # tokens/*.json -> src/tokens.ts, tokens.css, tokens.json
npm run check:contrast   # gate every text token against AA on black
npm run verify           # tokens + contrast + typecheck
npm run dev              # playground gallery
npm run build            # library bundle -> dist/
npm run smoke            # render the gallery in a real browser
```

Tokens are the source of truth. Edit `tokens/*.json`, never the generated files.
