# Kanso — 簡素

**The house design language.** Tokens, rules, and components distilled from NERV-UI,
Evangelion interface design, btop's terminal telemetry, and cyberpunk chrome —
modernised into something that can carry a real application.

This document is the reference. When another project asks "what does a button look
like here", the answer is in this file and in `src/`. Nothing gets re-decided per
project.

---

## 1. What Kanso is

Four lineages, one system:

| Lineage | What it contributes |
| --- | --- |
| **NERV-UI** | Notched panels, hazard stripes, uppercase mono labels, orange-on-black command chrome, targeting brackets |
| **Evangelion** | Compressed display type, ticket/chamfer geometry, bevel fills, Japanese institutional subtitles, the cold-open boot sequence |
| **btop** | Box-drawing frames, braille and block-character graphs, the severity gradient, dense per-core grids, always-visible telemetry |
| **Cyberpunk** | Phosphor glow, CRT scanlines and grain, glass over live content, magenta/violet accents |

And one word of restraint. *Kanso* (簡素) is the Zen principle of simplicity —
eliminating clutter, not adding ornament. The atmosphere layer exists so the
**data** looks like it lives inside a machine. It is not the point. If a screen
needs more glow to look good, the layout is wrong.

---

## 2. The seven rules

These are non-negotiable. Everything else is preference.

1. **Black is the background.** `#000000` for the page, `#0a0a0c` for panels,
   `#121214` for raised controls. Never a gray card on a gray page.
2. **No rounded corners.** Corners are either sharp or **chamfered** with a
   clip-path. A `border-radius` anywhere in a Kanso surface is a bug.

   **One sanctioned exception:** the Radio's inner dot. A square dot in a
   square box reads as a checkbox that has forgotten what it is, and the
   distinction between "pick one" and "pick any" is worth more than the
   purity of the rule. It is the only `border-radius` in the library, and
   the only curve on screen — which is precisely why it succeeds at telling
   you the control is a different kind of thing.
3. **Hairlines, not shadows.** Depth comes from 1px `#1f1f23` borders and pure
   black shadow. Coloured drop shadows are limited to the tokenised `glow-*`
   set — 25% alpha, 12px, interactive states only. **No bloom.**

   Two halos exceed that, both tokenised so they cannot spread: `shadow-halo-*`
   (55%, 6px) for LED status dots, which are 6px of ink and need the halo to
   register at all, and `shadow-wordmark-glow` (45%, 18px) for the masthead
   wordmark, which reads as an illuminated sign rather than as glowing text.
   If you find yourself wanting a third, you want a different layout.
4. **One hue, one job.** A colour means the same thing on every screen (§4).
   Never pick a colour because it looks good in that spot.
5. **Labels are mono, uppercase, tracked, dim. Values are mono and tabular.**
   The label/value pair is the atom of this system.
6. **Motion is mechanical.** `cubic-bezier(0.83, 0, 0.17, 1)`, 90–160ms,
   transform and opacity only. Enter is slower than exit. Nothing bounces,
   springs, or fades softly.
7. **Density over comfort — for data, not for controls.** This is a cockpit:
   tight padding, small type, information adjacency, whitespace for grouping
   rather than breathing. But density is a property of *readouts*. Anything
   the user clicks or reads as a label needs to be comfortably hittable and
   legible at 100% zoom, and the first pass of this library got that wrong —
   8px badges, 4px meter tracks, chips that read as captions. Controls sit at
   a ~30px height and 12–16px type; the density lives in the tables, meters
   and graphs around them.

### Anti-patterns

- Rounded corners, soft shadows, gradient backgrounds on surfaces
- Stacked text glows (one phosphor class per node, never two)
- Colour used decoratively — a green button that isn't confirming anything
- Sentence-case labels, proportional numerals in a readout
- Always-on animation beyond the atmosphere layer
- Backdrop blur over a flat background (an expensive way to draw a rectangle)
- Emoji anywhere in the chrome — use the glyph sets in `src/glyphs.ts`

---

## 3. Tokens

Everything comes from `tokens/*.json`, compiled by `scripts/build-tokens.mjs` into
four artefacts:

| Artefact | For |
| --- | --- |
| `src/tokens.ts` | Typed constants for React components and runtime maths |
| `src/tokens.css` | What `kanso.css` imports — the in-tree stylesheet |
| `dist/tokens.css` | `--kanso-*` custom properties for any HTML/CSS project |
| `dist/tokens.json` | Canonical export for non-JS consumers |

**Naming contract:** every *global* token is `--kanso-<group>-<name>`, where the
group is the filename. `color.json` → `--kanso-color-primary`. Nothing may invent a
global custom property outside this scheme.

Components may declare **component-local** properties for values they compute at
runtime — `--kanso-meter-frac`, `--kanso-frame-color`, `--kanso-led-halo`. These are
namespaced `--kanso-<component>-<name>`, are always given a default in the
component's base CSS block (so the component still renders if the inline style is
stripped), and are never read from outside their own component.

Groups: `color`, `ramp`, `type`, `spacing`, `shape`, `shadow`, `glass`, `motion`,
`scanline`, `effect`, `series`, `z`.

There is deliberately **no radius group**. Rule 2 forbids using one.

### Themes — two design generations, one component set

`tokens/themes/<id>.json` is an **override map**, `{ <group>: { <name>: token } }`.
It compiles to one extra CSS block that re-declares only the tokens it names;
everything else inherits from `:root`. A theme may only override a token the base
already defines — inventing one there fails the build, because a property that
exists in a single theme is how a component silently loses its colour in the other.

| Theme | Attribute | What it is |
| --- | --- | --- |
| `classic` | *(none)* | **v1.** The palette this library shipped with. `:root`, unchanged. |
| `eva` | `data-kanso-theme="eva"` | **v2.** The `theme-research` synthesis — NERV orange `#ff6a00`, an 11px type floor, borders that are actually visible, a wider severity ramp. |

The selector is a bare attribute selector, deliberately unqualified. Custom
properties inherit, so putting `data-kanso-theme` on **any** element re-themes
that subtree — which is what lets the gallery render both generations side by
side on one page, and lets an app theme a single panel without a second
stylesheet.

```tsx
const [theme, setTheme] = useKansoTheme();   // writes <html>, persists the choice
```

`applyTheme`, `readTheme`, `THEMES` and `ThemeId` are exported for apps that
manage their own state. `classic` is represented by the **absence** of the
attribute, so an app that never opts in has exactly the DOM it had before themes
existed.

**v1 is kept, not deprecated.** It is the reference the redesign is measured
against, which is why the contrast and type-floor gates report its known defects
without failing on them — see §10.

Durations carry their unit in CSS (`140ms`) and are plain numbers in TS (`140`).
Write `transition: color var(--kanso-motion-duration-tick) ...` — never append `ms`.

---

## 4. Colour — one hue, one job

### Functional palette

| Token | Hex | Means |
| --- | --- | --- |
| `primary` | `#ff9830` | Command. Labels, active state, the system's own voice |
| `info` | `#20f0ff` | Information, resolution, links — **and focus rings, exclusively** |
| `success` | `#50ff50` | Nominal. Healthy telemetry, completed work |
| `warning` | `#ffb700` | Priority, starred, needs attention |
| `danger` | `#ff3030` | Destructive and emergency. Nothing else |
| `accent` | `#7c3aed` | System chrome — the violet sheen on frames and headers |
| `magenta` | `#ff4fd8` | Rare categorical marker. One per screen at most |
| `lime` | `#a3e635` | Phosphor readouts |

`primary`, `success`, `info` and `danger` carry the full set: `-dim` (muted
border/text), `-deep` (near-black fill) and `-film` (4% tint for header bands).
`warning` and `accent` have `-dim`/`-deep`; `magenta` and `lime` have `-dim` only.
`primary` additionally has `-hot` (bright hover), `-glow` and `-wash` (8%).

Two further colours exist outside the role table: `hazard` (#b020ff) is the
purple reserved for a maximum-severity state above `critical` — a level-5 event,
not a routine error — and `ramp-cool` (#20f0ff) is the ramp's inverse anchor for
quantities where low is bad (signal strength, battery, free space).

### Neutrals

`bg #000` → `panel #0a0a0c` → `panel-2 #121214` → `panel-3 #17171b`, with `well
#050505` for recessed beds. Borders: `border #1f1f23`, `border-highlight #2e2e34`.
Text: `text #e8e8e4` → `text-2 #b8b8b2` → `text-dim #8a8a85` → `muted #767670`.

One token sits **below** that floor and is not part of the scale: `text-faint`
(`#6a6a65`) is **decorative-only**, for `DataTexture`'s field of real
application data and nothing else. It is deliberately excluded from the contrast
gate's text tier, and anything using it must be `aria-hidden`. It exists so that
effect can be a declared colour rather than `muted` behind an opacity
multiplier — an opacity fudge makes the delivered ratio unmeasurable, which is
the failure this system is built to avoid. Promoting it to a caption is a bug.

### The severity ramp — btop's idea, made a primitive

Five stops, used by **every** meter, gauge, graph and magnitude cell:

```
nominal #50ff50 → caution #a3e635 → elevated #ffb700 → warning #ff9830 → critical #ff3030
```

`src/ramp.ts` provides `rampColor(0..1)`, `rampStep()`, and `rampGradient()`. Because
every component draws from the same ramp, **80% looks like 80% everywhere** — across
apps, not just across screens. That consistency is the single highest-value thing
this library does.

Use a single `Hue` instead of the ramp when the quantity isn't a severity (a
category share, a download count).

### Categorical series

`ramp` is severity and `HUE` is semantic — neither answers "eight unrelated series
on one chart". That is what the `series` group is for: `--kanso-series-1` through
`-8`, ordered for hue separation at adjacent indices. **Use them in index order and
never by meaning** — `series-4` is not "the danger one". Reaching for `danger` to
colour the fourth line of a chart is how a palette stops meaning anything.

---

## 5. Typography

Four families, four jobs. The pairings below *are* the type system.

| Role | Family | Used for |
| --- | --- | --- |
| `display` | Noto Serif Display, 900 | EVA title cards. Compressed `scaleX(0.82)` |
| `stamp` | Bebas Neue | Wordmarks, banners, big stamped readouts |
| `mono` | JetBrains Mono | **Everything else.** All UI text, all data |
| `jp` | Shippori Mincho B1 | Institutional Japanese subtitles |

The signature move is **horizontal compression** — `transform: scaleX(0.82)` with
`transform-origin: left center` on display and stamp text. It is what makes a title
read as stamped onto the interface rather than typed into it.

Sizes run `xs 8px` → `4xl 40px`.

- **Labels and dense data** — `sm 10px` / `base 12px`. Table cells, meter
  labels, status strips, hints.
- **Interactive controls** — `base 12px` to `lg 16px`. A chip or button label
  below 12px is not comfortably readable, whatever the density rule implies.
- **Readouts** — `xl 18px` and up. A number large enough to read across a room
  is the whole point of a stat tile.
- `xs 8px` is for ornament only — bracket readouts, corner marks. Never for
  anything the user has to actually read.

Tracking is heavy and deliberate. Uppercase mono without tracking looks broken in
this system. The tokens name the *amount*, not the role — pick by density, not by
the word in the token:

| Token | Value | Typical use |
| --- | --- | --- |
| `tracking-wide` / `-wider` | 0.025 / 0.05em | Running text, inline values |
| `tracking-label` | 0.14em | Display titles, tight labels in dense rows |
| `tracking-stamp` | 0.2em | The default for `.kanso-label`, panel titles, chips |
| `tracking-widest` | 0.24em | Frame labels, section heads, anything isolated |

Classes: `.kanso-title`, `.kanso-stamp`, `.kanso-label`, `.kanso-value`, `.kanso-jp`,
and the phosphor set `.kanso-phosphor-{orange,amber,lime,violet,cyan,green,dim}`.

---

## 6. Geometry

Six shapes, in three sizes for the full chamfer. Pick one per element; never nest
two clipped boxes.

| Class | Shape | Used on |
| --- | --- | --- |
| `.kanso-cut` | TL + BR chamfer, 6px | Buttons, chips, tickets |
| `.kanso-cut-sm` / `-lg` | Same, 5px / 9px | Dense controls / large plates |
| `.kanso-cut-tr` | TR chamfer only | Labels, inputs, stat tiles |
| `.kanso-cut-bl` | BL chamfer only | Footers, stamps |
| `.kanso-notch` | TL + BR, 12px | HUD panels docked left |
| `.kanso-notch-tr` | TR + BL, 12px | HUD panels docked right |
| `.kanso-shear` | Parallelogram, 5px | Action tabs, view switchers |

**Notch direction encodes anchoring.** A panel notches *away* from the screen edge it
hugs. Left-docked → `.kanso-notch`. Right-docked → `.kanso-notch-tr`. Read a
screenshot and you can tell where each panel lives.

Two more structural marks:

- **Accent rule** — a 2px coloured top border declaring a surface's role
  (`.kanso-rule-primary|danger|info|success|accent`).
- **Hazard stripe** — the diagonal caution barber-pole. At most one pair per screen,
  marking the outer boundary or an actively dangerous region.

---

## 7. Surfaces

| Class | What it is |
| --- | --- |
| `.kanso-surface` | Flat opaque panel. **The default.** |
| `.kanso-surface-raised` | Inputs, list rows, table heads |
| `.kanso-surface-well` | Recessed bed for graphs, meters, code |
| `.kanso-glass` | Floating HUD chrome **over live content only** |

Glass costs a `backdrop-filter`, the most expensive thing in the system. Use it over
a map, a video, or media — never over a flat background. `.kanso-no-blur` on an
ancestor kills every instance for low-end hardware.

**Bevel fills** (`.kanso-fill-{amber,lime,cyan,green,red,violet}`) are the one place
Kanso allows a gradient: a 3-stop vertical ramp, inset top highlight and bottom dark
edge, one tight halo, dark ink text, brightness-only hover. They are for *selected*
ticket tabs and primary confirmations — the EVA layer. `.kanso-fill-dim` is their
idle counterpart.

---

## 8. Motion

```
ease-mechanical  cubic-bezier(0.83, 0, 0.17, 1)   the default; hard in, hard out
ease-out         cubic-bezier(0.16, 1, 0.3, 1)    entrances that need to settle
ease-in          cubic-bezier(0.7, 0, 0.84, 0)    exits that need to snap away
```

| Duration | ms | For |
| --- | --- | --- |
| `instant` | 60 | Hover tint, press |
| `tick` | 120 | Control state changes |
| `overlay-enter` / `-exit` | 140 / 90 | Menus, toasts, tooltips |
| `panel-enter` / `-exit` | 160 / 100 | Modals, drawers |
| `crawl` | 1200 | Hazard-stripe travel |
| `pulse` | 1400 | Skeleton and idle pulses |
| `sweep` | 2000 | Scan sweeps, slow attention loops |
| `blink` | 1000 | LED blink, terminal cursor |

Animate **transform and opacity only** for anything that can appear many times at
once. A virtualized grid can show fifty skeletons or meters, and each animated
`width`, `background-position`, or filter repaints every one of them every frame.
Meters and progress bars therefore fill with `transform: scaleX()`, not `width`.

Three carve-outs, because the alternative is worse:

- **The atmosphere layer** animates `background-position` (scanlines, hazard crawl).
  There is exactly one of each per screen, and they are the effect.
- **Colour transitions** on interactive chrome — a chip tweening border, text and
  background together on a mechanical curve is the point of the idiom.
- **`stroke-dashoffset`** on the Gauge arc. An arc has no transform-based equivalent
  that preserves its geometry; it is disabled under reduced motion.

Everything else follows the rule.

Two opt-outs are wired globally: the OS `prefers-reduced-motion` preference, and a
`.kanso-reduce-motion` class the app sets from its own settings screen.

---

## 9. Atmosphere

`<CRT />` mounts the whole stack at the app root. House settings:

- **Scanlines** — 6% black, 4px period, 10s scroll
- **Grain** — 2% fractal noise, static, inline SVG data URI
- **Vignette** — falloff from 60% to `rgba(0,0,0,0.45)`

All three are `position: fixed`, `pointer-events: none`, `aria-hidden`. They must
never intercept input or reach a screen reader. Turn the scroll off (`speed={0}`) on
anything content-heavy — a moving mask over a wall of text is hostile.

---

## 10. Accessibility, because the aesthetic fights it

Dark chrome, low contrast, and small type make three things mandatory:

1. **Cyan focus rings, always visible.** `#20f0ff` is reserved for focus and never
   used decoratively on an interactive element (eva repoints it to pattern-blue
   `#4aa8ff`, which stays distinct from that theme's orange chrome). Clipped
   elements draw the ring as an inset `box-shadow` because a `clip-path` crops an
   `outline` — **and `forced-colors: active` forces `box-shadow: none` by
   specification**, which would delete the focus indicator from most of the
   interactive set. `a11y.css` restores a real `outline` there at a *negative*
   offset: at a positive offset the ring lands outside the clip polygon and is
   clipped away entirely. The cost is the two chamfered corners.

   Three user preferences beyond reduced motion are honoured: `prefers-contrast:
   more` promotes `muted` to `text-dim` and `border` to `border-highlight`, and
   drops phosphor, scanlines and grain; `prefers-reduced-transparency` makes glass
   opaque and kills every `backdrop-filter`; `forced-colors` is assumed to delete
   the whole effects layer, so glow, shadow, gradient and stripe may **never** be
   the sole carrier of state, focus or boundary.
2. **`muted` is the floor, and it is measured.** `#767670` on black is 4.60:1 —
   the lowest-contrast text the system allows, and only for labels. It was
   `#6a6a65` until a contrast audit put that at 3.86:1, which fails AA for the
   8–10px labels it was being used on. Two separate projects had already
   lightened it locally; two independent discoveries of the same defect is a
   system problem, not a project problem.

   Verified ratios on black: `text` 17.1:1, `text-dim` 6.1:1, `muted` 4.6:1,
   `primary` 9.8:1, `info` 15.0:1, `success` 15.8:1, `danger` 5.7:1,
   `warning` 12.0:1, `magenta` 7.4:1, `lime` 13.9:1.

   **`accent` (#7c3aed) is 3.7:1 and is therefore a surface colour, never text.**
   When the violet has to carry words, use `phosphor-violet` (#c4b5fd).
3. **Colour is never the only signal.** A ramp colour is always paired with a number,
   a glyph, or a word.

Chrome is `user-select: none`; data is selectable. Every meter carries
`role="meter"` with real `aria-value*`, every log `role="log"`, every modal
`aria-modal` with a focus trap and Escape.

---

## 11. Using Kanso in another project

**React:**

```tsx
import { Panel, Meter, CRT } from "@kanso/ui";
import "@kanso/ui/kanso.css";

<div className="kanso-root">
  <CRT />
  <Panel title="MAGI // STATUS" accent="primary" notch="left">
    <Meter label="CPU" value={0.72} />
  </Panel>
</div>
```

Everything is scoped to `.kanso-root` or `:where()`, so dropping the stylesheet into
an existing app never fights the host CSS.

**Plain HTML / any framework:** import only the tokens and write against the classes.

```html
<link rel="stylesheet" href="node_modules/@kanso/ui/dist/tokens.css" />
```

This is how `app-launcher` and the NERV telemetry console consume the system — they
get the palette and geometry without a React dependency.

**Fonts** are not bundled. Load JetBrains Mono, Bebas Neue, Noto Serif Display, and
Shippori Mincho B1 however the host project prefers.

**Dependencies:** React 18+ is a peer dependency. `animejs` is a real runtime
dependency, used by exactly two components — `Chip` (which tweens colour, border
and text-shadow together on a mechanical curve) and `Scanlines` (which scrolls the
mask). Everything else is CSS. A consumer taking the tokens-only path pulls
neither.

---

## 12. Extending the system

1. **Add a token before you add a value.** If a component needs a colour that isn't
   in `tokens/`, either it should reuse an existing role or the role is missing from
   the system — decide which, then edit the JSON. Never hardcode.
2. **Match the file layout.** `src/components/<Name>/<Name>.tsx` + `<Name>.css`, one
   `@import` line in `src/kanso.css`, one export pair in `src/index.ts`.
3. **Class names are `kanso-` prefixed and BEM-ish:** `.kanso-meter`,
   `.kanso-meter__track`, `.kanso-meter--danger`.
4. **Components never import their own CSS.** `kanso.css` aggregates, so consumers
   get one stylesheet and one cascade order.
5. **Ask which lineage it belongs to.** A new component should be recognisably NERV,
   EVA, btop, or cyberpunk. If it isn't any of them, it probably belongs in the app,
   not the library.

```bash
npm run build:tokens     # tokens/*.json + tokens/themes/*.json -> ts / css / json
npm run check:contrast   # 230 pairs per theme, against real composited surfaces
npm run check:type       # the 11px floor, across CSS, inline styles and tokens
npm run verify           # tokens + contrast + type + typecheck
npm run dev              # playground gallery at localhost
npm run build            # library bundle to dist/
npm run smoke            # render the gallery in a real browser
```

`check:contrast` is not optional ceremony. It is the thing that caught `muted`
shipping at 3.86:1 — and then, once it stopped testing against pure black alone,
eleven more pairs that the old gate called clean. **Pure black is the most
favourable surface in the system**, so a token is now measured against every
surface it can actually land on, with `zebra`, `row-hover`, `wash` and `glass`
alpha-composited over their base before measurement. Surfaces, pairs, minimums
and tiers are declared as data at the top of the script: extend the table, not
the loop. If you add a colour that can carry text, add its pair there.

Both gates print v1's known failures and still exit 0 — see §3 "Themes". Green
does **not** mean classic is clean; it means v2 is, and v1 is preserved
deliberately.
