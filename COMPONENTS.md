# Kanso — component API reference

Every export from `src/index.ts`, with its real prop names, types and defaults.
[KANSO.md](./KANSO.md) is the spec, [README.md](./README.md) is the overview,
[ADOPTION.md](./ADOPTION.md) is the migration plan. This file is the thing you open
when you already know what you are building.

---

## 1. How to read this

Everything imports from the package root — `import { Panel, Meter, rampColor } from "@kanso/ui"`
plus one `import "@kanso/ui/kanso.css"` — and everything must render inside an element
carrying `className="kanso-root"`, because the reset, the cyan focus rings, the scrollbars
and `border-radius: 0` are all scoped to it. Defaults below are the destructured defaults
in the `.tsx`; where a default lives in CSS instead, the table says so. Props marked
**required** have no default and no `?`. Most components spread their remaining props onto
a DOM element — the "DOM element" line under each props table names which one, so
`data-*`, `id`, `onClick` and `style` all pass through. **The `kanso-*` class names are
public API**, not implementation detail: the vanilla consumers in §6 of ADOPTION.md write
against them directly, so they are versioned alongside the props.

This is **v0.3.0 — 41 components, 172 tokens, 2 themes.** The second theme is a palette
swap, not a second component set: every prop, class name and default below is identical
under `data-kanso-theme="eva"`, and only the values the tokens resolve to change. The theme
API itself is in §8.

---

## 2. Component index

### Chrome

| Component | Use it when |
| --- | --- |
| `Panel` | Any block of content needs a frame, a title and a role-declaring accent rule |
| `Frame` | You want to target a region rather than contain it — brackets, no fill |
| `Divider` | A section head or a toolbar cluster separator |
| `HazardStripe` | Marking the outer boundary of the screen or an actively dangerous region |
| `TopBar` / `Brand` | The command masthead: wordmark left, telemetry right |
| `StatusBar` | The always-visible bottom strip of label/value cells |
| `Scanlines` / `Vignette` / `Grain` / `CRT` | Atmosphere at the app root. `CRT` is all three |
| `DataTexture` | A dense field of the app's **own real data**, used as texture behind the chrome |

### Telemetry

| Component | Use it when |
| --- | --- |
| `TermBox` | btop's framed box with a hotkey digit punched into the top rule |
| `Meter` | A single 0..1 magnitude as a horizontal bar, smooth or in discrete cells |
| `Gauge` | The same magnitude as a 240° dial, when it is the headline number |
| `Sparkline` | A time series as real SVG geometry |
| `BrailleGraph` | A time series as text, at 2×4 subpixels per character |
| `BarChart` | Labelled horizontal bars across a small set of named quantities |
| `SegmentBar` | Composition — how one total splits — not severity |
| `CoreGrid` | 8–64 tiny labelled meters that must read as one texture |
| `Progress` | A determinate operation, or an indeterminate one that has to look honest |
| `LED` | A discrete state lamp with a 6px halo |
| `Readout` | The stat tile: tracked label, large tabular value, optional delta |
| `DataList` | A parameter block of label/value rows |
| `Table` | A process list, a manifest, anything sortable and selectable |
| `Terminal` | A scrolling log feed with levels and a block cursor |
| `MagiConsensus` | Several named voters produce one answer: quorum, replica health, approvals |

### Controls

| Component | Use it when |
| --- | --- |
| `Button` | A command. Four variants, three sizes |
| `IconButton` | A single glyph in a chamfered keycap — needs a `label` |
| `Chip` | A pressable tab or terminal-pane selector; colour tweens in anime.js |
| `Input` / `Textarea` | Text entry with a wired-up label / hint / error contract |
| `Select` | A native `<select>` in Kanso chrome |
| `Checkbox` / `Radio` / `Switch` | Pick any / pick one / power rail |
| `Slider` | A continuous parameter with an optional readout and tick marks |
| `Segmented` | A mode selector where exactly one of N is live |

### Overlays

| Component | Use it when |
| --- | --- |
| `Modal` | A dialog that owns the screen: focus trap, Escape, scroll lock |
| `Toast` / `ToastProvider` / `useToast` | Transient alerts raised from anywhere in the tree |
| `Tooltip` | A few words of callout on hover or focus |
| `Menu` / `useContextMenu` | A dropdown from an element, or a context menu from a point |
| `CommandPalette` | Keyboard-first command entry with subsequence filtering |

### Feedback

| Component | Use it when |
| --- | --- |
| `Alert` | A persistent inline banner that stays until the condition clears |
| `Takeover` | The rung above `Alert`: the whole screen, one word, nothing else on it |
| `BootSequence` | The EVA cold open. Theatre, never a gate |
| `Spinner` | Indeterminate activity: a reticle, or an inline braille throbber |
| `Badge` | A label tag, one step below `Chip` on the type ramp |
| `Skeleton` | Awaiting-telemetry blanks, safe at fifty on screen |

### Shared props that are not shared

Five concepts have more than one spelling. Read the per-component table, not the pattern.

| Concept | The disagreement |
| --- | --- |
| `size` | `"sm" \| "md"` on `Meter` and `Progress`; `"sm" \| "md" \| "lg"` on `Button`, `IconButton`, `Chip`, `Badge`, `LED`, `CoreGrid`, `Segmented`, `Slider`, `Spinner`, and as `FieldSize` on `Input`/`Textarea`/`Select`; `"sm" \| "md" \| "lg" \| "full"` on `Modal`; and a **`number` of pixels** on `Gauge` |
| `color` | `Hue \| "ramp"` on `Meter`, `Gauge`, `Sparkline`, `BrailleGraph`, `BarChart`, `CoreGrid`; bare `Hue` on `Frame`, `TermBox`, `Progress` and `SegmentBarSegment`; private unions on `Divider` (adds `"muted"`), `HazardStripe` (four hues only) and `Spinner` (`SpinnerColor`, adds `"dim"`) |
| severity state | `ReadoutState` and `DataListState` are `RampName \| "info" \| "neutral"`; `StatusCell.state` is `RampName \| "info" \| "dim"` — no `neutral`, and it is optional rather than defaulted |
| value visibility | `showValue` on `Meter`, `Progress`, `Slider`; `showValues` on `BarChart`, `CoreGrid`; `showLegend` on `SegmentBar`; `showLabel` on `Spinner` |
| `level` | `AlertLevel` and `ToastLevel` are both `"info" \| "success" \| "warning" \| "danger"` but are separate types; `TakeoverLevel` is **`"danger" \| "warning"` only** — nothing below `warning` earns the whole screen |

Two more worth knowing: `max` defaults to `1` on `Meter`, `Gauge`, `CoreGrid` and
`Progress` (the value is a fraction) but to **the series peak** on `Sparkline`,
`BrailleGraph` and `BarChart`. And `label` is the visible caption on most telemetry
components, the *accessible name only* on `IconButton`, `Segmented`, `Menu` and `Spinner`,
and the content itself on `Badge`.

---

## 3. Chrome

### Panel

The NERV HUD surface: hairline frame, 2px accent rule declaring the panel's role,
uppercase mono header, optional notched corners. Lineage: NERV.

| Prop | Type | Default | Notes |
| --- | --- | --- | --- |
| `title` | `ReactNode` | — | Header label. Also names the `<section>` landmark via a generated `useId` |
| `meta` | `ReactNode` | — | Small dim text after the title |
| `actions` | `ReactNode` | — | Right-hand header slot |
| `footer` | `ReactNode` | — | Footer strip below the body |
| `title2` | `ReactNode` | — | **New in 0.3.0.** Secondary readout notched into the *bottom* rule, right-aligned — btop's `createBox` title2. Metadata, never a heading |
| `accent` | `"primary" \| "danger" \| "info" \| "success" \| "accent" \| "none"` | `"primary"` | Sets both the `.kanso-rule-*` top border and the header film tint |
| `notch` | `"left" \| "right" \| "none"` | `"none"` | `left` → `.kanso-notch`, `right` → `.kanso-notch-tr` |
| `glass` | `boolean` | `false` | Swaps `.kanso-surface` for `.kanso-glass`. Costs a `backdrop-filter` |
| `scroll` | `boolean` | `false` | Body scrolls and gains `.kanso-scroll-thin` |
| `flush` | `boolean` | `false` | Removes body padding |
| `children` | `ReactNode` | — | Body content |

DOM element: `<section>`; extends `Omit<HTMLAttributes<HTMLDivElement>, "title">`, rest
spread onto the section, `className` appended to the root class list.

```tsx
<Panel title="MAGI // CORE STATUS" meta="3 UNITS" accent="primary" notch="left"
       actions={<LED state="ok" label="LINK" />}>
  <Readout label="SYNC RATIO" value="41.3" unit="%" delta={2.1} state="nominal" />
</Panel>
```

**Notes.** A `<section>` is only a landmark once it has a name, so a Panel without `title`
is a plain framed box to a screen reader — that is deliberate, not a gap. The header only
renders when `title` or `actions` is set; `meta` alone will not produce one. `accent="none"`
still emits `kanso-panel__header--none`, which greys the title rather than removing the
header. The ref is typed `HTMLElement`, not `HTMLDivElement`, because the element is a
`<section>`; the props still extend `HTMLAttributes<HTMLDivElement>`.

`title2` is additive and defaults to `undefined` — **a Panel that does not pass it renders
exactly the markup it rendered in 0.2.0.** When it is set the panel adds
`.kanso-panel--title2`, which turns its own `border-bottom` transparent and hands the
bottom edge to the `.kanso-panel__title2` strip, because the panel clips to its padding box
and a label straddling the real border would lose its lower half. It composes with `footer`
rather than replacing it: the footer is a content strip, `title2` is the edge itself. The
label is `muted`, uppercase and tabular, and it ellipsises rather than wrapping.

---

### Frame

The NERV targeting container: four L-brackets, a label straddling the top rule, guide
rails, and an optional survey grid. A Panel contains; a Frame targets. Lineage: NERV.

| Prop | Type | Default | Notes |
| --- | --- | --- | --- |
| `label` | `ReactNode` | — | Straddles the top edge |
| `readout` | `ReactNode` | — | Faint text parked at top-right |
| `color` | `FrameColor` (= `Hue`) | `"primary"` | Painted into `--kanso-frame-color` |
| `bracketSize` | `number` | `18` | Arm length in px |
| `crosshairs` | `boolean` | `false` | Survey grid backdrop. Off because it is loud |
| `rails` | `boolean` | `true` | Horizontal guide rails |
| `children` | `ReactNode` | — | Body content |

DOM element: `<div>`; extends `Omit<HTMLAttributes<HTMLDivElement>, "color">`. `style` is
merged with the component's own custom properties rather than replaced.

```tsx
<Frame label="SECTOR 07" readout="35.6586N 139.6823E" color="danger" crosshairs>
  <BrailleGraph values={proximity} rows={4} color="ramp" />
</Frame>
```

**Notes.** `bracketSize` is written as `--kanso-shape-bracket` — a *global* shape token
overridden for this subtree, which is how the rails and the readout stay pinned to the
bracket arms at any size. It is the one place a component writes a global token name, and
it will leak to any descendant that reads that token (`Modal`'s brackets do, but a Modal is
never a Frame descendant). The header sits in normal flow and is pulled up, so a long
`label` widens the frame instead of overhanging it.

---

### Divider

A coloured rule with an optional bracketed label in a punched-out gap. Lineage: NERV.

| Prop | Type | Default | Notes |
| --- | --- | --- | --- |
| `label` | `string` | — | Rendered as `[ LABEL ]`. Horizontal only |
| `color` | `"primary" \| "info" \| "success" \| "danger" \| "muted"` | `"primary"` | `muted` maps to `border-highlight` |
| `variant` | `"solid" \| "dashed" \| "dotted"` | `"solid"` | Ignored on a labelled or vertical divider |
| `orientation` | `"horizontal" \| "vertical"` | `"horizontal"` | Vertical is a gradient hairline that fades at both ends |
| `align` | `"start" \| "center" \| "end"` | `"start"` | Where the label sits |

DOM element: `<div role="separator">` with `aria-orientation`.

```tsx
<Divider label="DIAGNOSTICS" color="info" />
<Divider orientation="vertical" color="muted" />
```

---

### HazardStripe

The diagonal caution barber-pole. At most one pair per screen. Lineage: NERV.

| Prop | Type | Default | Notes |
| --- | --- | --- | --- |
| `edge` | `"top" \| "bottom" \| "none"` | `"none"` | `top`/`bottom` make it `position: fixed` at `z-dock` |
| `color` | `"primary" \| "danger" \| "warning" \| "accent"` | `"primary"` | Narrower than `Hue` on purpose |
| `height` | `number \| string` | `--kanso-shape-hazard-height` (6px) | Inline `height` when set |
| `animated` | `boolean` | `false` | 1200ms `crawl` travel. Reserve for genuinely active states |
| `offset` | `number \| string` | — | Distance from the edge, for docking above a terminal bar |

DOM element: `<div aria-hidden="true">`; extends `HTMLAttributes<HTMLDivElement>`.

```tsx
<HazardStripe edge="top" color="danger" animated />
<HazardStripe edge="bottom" offset={150} />
```

**Notes.** `offset` writes `bottom` when `edge="bottom"` and `top` otherwise — including
when `edge="none"`, where the element is not positioned and the value does nothing. It is
`aria-hidden`, so the condition it marks needs a real signal elsewhere (an `Alert`, a
`LED`, a `StatusBar` cell).

---

### TopBar

The command masthead. Three fixed slots, because every NERV screen ends up with exactly
this arrangement. Lineage: NERV.

| Prop | Type | Default | Notes |
| --- | --- | --- | --- |
| `left` | `ReactNode` | — | Wrapped in `.kanso-topbar__slot--left .kanso-no-drag` |
| `center` | `ReactNode` | — | Flex-1, centred |
| `right` | `ReactNode` | — | `margin-left: auto` |
| `glass` | `boolean` | `false` | Adds `.kanso-glass .kanso-topbar--glass` |
| `sticky` | `boolean` | `false` | `position: sticky; top: 0` at `z-dock` |
| `draggable` | `boolean` | `false` | Electron `-webkit-app-region: drag` on the bar |
| `children` | `ReactNode` | — | Rendered between the center and right slots |

DOM element: `<header>`; extends `HTMLAttributes<HTMLElement>`.

```tsx
<TopBar sticky draggable
  left={<Brand name="NERV" sub="MAGI CONSOLE" jp="магі" version="v2.4.0" />}
  right={<><LED state="ok" label="LINK" /><span className="kanso-stamp kanso-phosphor-cyan">02:41:22</span></>} />
```

**Notes.** The three slots get `.kanso-no-drag`; `children` does not, so an interactive
element passed as `children` inside a `draggable` bar becomes part of the drag region.

---

### Brand

The compressed wordmark block. Lineage: NERV / EVA.

| Prop | Type | Default | Notes |
| --- | --- | --- | --- |
| `name` | `ReactNode` | **required** | Set in the stamp face with the sanctioned `shadow-wordmark-glow` |
| `sub` | `ReactNode` | — | Small uppercase line underneath |
| `jp` | `ReactNode` | — | Rendered in mincho, before `sub` |
| `version` | `ReactNode` | — | Tinted cyan, after `sub` |

DOM element: `<div>`; extends `HTMLAttributes<HTMLDivElement>`.

**Notes.** The sub-line only renders if at least one of `sub`, `jp`, `version` is set. The
wordmark's 18px 45% halo is the only text glow in the system wider than the 4px phosphor
set, and it is tokenised so it cannot be reached for casually.

---

### StatusBar

The docked telemetry strip: label/value cells separated by hairlines. Never interactive.
Lineage: btop.

| Prop | Type | Default | Notes |
| --- | --- | --- | --- |
| `cells` | `StatusCell[]` | `[]` | Keyed by array index |
| `fixed` | `boolean` | `false` | Docks to the bottom of the viewport at `z-dock` |
| `glass` | `boolean` | `false` | Adds `.kanso-glass` |
| `children` | `ReactNode` | — | Rendered after the cells |

`StatusCell`:

| Field | Type | Notes |
| --- | --- | --- |
| `label` | `ReactNode?` | Uppercase, tracked, muted |
| `value` | `ReactNode` | **required**, tabular |
| `state` | `"nominal" \| "caution" \| "elevated" \| "warning" \| "critical" \| "info" \| "dim"` | Optional. Undefined leaves the value plain `text` |
| `spacer` | `boolean?` | Pushes this cell and everything after it to the right edge |

DOM element: `<footer>`; extends `HTMLAttributes<HTMLElement>`.

```tsx
<StatusBar fixed cells={[
  { label: "HOST", value: "nerv-tokyo-3" },
  { label: "LOAD", value: "0.42", state: "nominal" },
  { label: "THERM", value: "78°C", state: "warning" },
  { label: "ALERT", value: "LEVEL 2", state: "critical", spacer: true },
]} />
```

**Notes.** The bar is a fixed 24px (`--kanso-shape-bar-height`) with `overflow: hidden`, so
cells past the width are clipped rather than wrapped. `state` has no `neutral` member —
omit it instead.

---

### Scanlines / Vignette / Grain / CRT

The atmosphere layer. All four are `position: fixed`, `pointer-events: none`,
`aria-hidden`. Lineage: cyberpunk.

`Scanlines`:

| Prop | Type | Default | Notes |
| --- | --- | --- | --- |
| `className` | `string` | `""` | |
| `zIndex` | `number` | `kanso.z.overlay` (9998) | |
| `speed` | `number` | `kanso.scanline.duration` (10000) | Scroll period in ms. `0` or `prefers-reduced-motion` pins them still |
| `vignette` | `boolean` | `false` | Legacy convenience. Prefer `<CRT />` |

`Vignette`: `className` (`""`), `zIndex` (`kanso.z.overlay`).

`Grain`: `className` (`""`), `zIndex` (`kanso.z.grain`, 9999), `opacity`
(`kanso.effect["grain-opacity"]`, `0.02`).

`CRT`:

| Prop | Type | Default | Notes |
| --- | --- | --- | --- |
| `scanlines` | `boolean` | `true` | |
| `grain` | `boolean` | `true` | Mounted at `zIndex + 1`, overriding `Grain`'s own default |
| `vignette` | `boolean` | `true` | |
| `speed` | `number` | `kanso.scanline.duration` | `0` for a static mask |
| `zIndex` | `number` | `kanso.z.overlay` | |

None of the four takes DOM props or a ref.

```tsx
<div className="kanso-root">
  <CRT speed={0} />
  {/* speed={0} on anything content-heavy — a moving mask over a wall of text is hostile */}
</div>
```

**Notes.** `Scanlines` is one of the two components that pull `animejs` (the other is
`Chip`); it tweens `background-position`, which is one of the three sanctioned carve-outs
from the transform/opacity rule, valid because there is exactly one instance per screen.
Mount `CRT` once, at the app root.

---

### DataTexture

Text-as-texture: a dense mono field rendered at `text-faint`, `aria-hidden`, unselectable.
Eva fills its screens with blocks nobody is meant to read; the field's job is to say "this
system is doing more than it is telling you". Lineage: EVA. **New in 0.3.0.**

| Prop | Type | Default | Notes |
| --- | --- | --- | --- |
| `lines` | `string[]` | **required** | Real application data. Nothing is ever generated for you |
| `rows` | `number` | — | Cap on rendered lines. Fewer lines than this simply render shorter |
| `columns` | `number` | — | Field width in `ch`, written to `--kanso-data-texture-width`. Long lines are clipped, never wrapped |
| `fade` | `boolean` | `false` | Masks the top and bottom 12% so the field reads as a fragment |

DOM element: `<div aria-hidden="true">`; extends `HTMLAttributes<HTMLDivElement>`. `style`
is merged with the component's own custom property rather than replaced. Renders `null`
when there is nothing to show.

```tsx
<DataTexture fade rows={24} columns={48} lines={requests.map(
  (r) => `${r.ts} ${r.id} ${r.method.padEnd(6)} ${r.path} ${r.ms}ms`
)} />
```

**Notes.** `lines` is required and the component **never pads or repeats to reach `rows`** —
a caller who wants a taller field supplies more real data. Filling a dashboard with
meaningless content to look busy is the anti-pattern this component exists to replace.

Ornamental CJK is the thing it replaces specifically: it is techno-orientalist, it is
frequently wrong (Blade Runner's signage is partly gibberish and forty years of design has
copied it), and a screen reader reads it aloud. Hex dumps, request ids, commit SHAs,
timestamps and IPs give the identical optical texture and are what NERV's own screens are
actually showing.

It paints with `--kanso-color-text-faint` (`#6a6a65` classic, `#6e6961` eva), the one text
token deliberately below the AA floor and declared decorative-only — see §9. That is why
the field is a *declared* colour instead of `muted` behind an `opacity` multiplier: an
opacity fudge makes the delivered ratio unmeasurable. Nothing here may ever be the only
place a fact appears. There is no animation: a moving wall of text behind live data is
hostile, and re-rendering it per frame is the one way this effect stops being free.

---

## 4. Telemetry

### TermBox

btop's framed box: `┌─ 1 ─ cpu ─────────┐`. The rules are real CSS hairlines so the frame
stays 1px at any size; only the four corner marks are glyphs. Lineage: btop × NERV.

| Prop | Type | Default | Notes |
| --- | --- | --- | --- |
| `label` | `string` | **required** | Punches a hole in the top rule |
| `hotkey` | `string \| number` | — | btop-style digit ahead of the label, on an inked chip |
| `boxStyle` | `BoxStyle` (`"sharp" \| "rounded" \| "heavy" \| "double"`) | `"sharp"` | **Not `style`** — see below |
| `color` | `Hue` | — | CSS default is `primary` via `--kanso-termbox-accent` |
| `right` | `ReactNode` | — | Top-right readout |
| `children` | `ReactNode` | — | Body |

DOM element: `<div>`; extends `Omit<HTMLAttributes<HTMLDivElement>, "color">`. `style`
stays the real DOM style attribute and is merged after the component's custom properties.

```tsx
<TermBox label="cpu" hotkey={1} right="18%" color="success">
  <BrailleGraph values={cpu} rows={4} color="ramp" />
</TermBox>
```

**Notes.** The frame-style prop is `boxStyle`, not `style`, precisely so the DOM `style`
attribute stays usable. `sharp` and `rounded` differ only in corner glyphs and carry no
modifier class; `heavy` and `double` change the border weight. `color` has no TS default —
leaving it off yields the CSS default rather than an explicit `HUE.primary` write.

---

### Meter

btop's horizontal bar, on the Kanso ramp. Lineage: btop.

| Prop | Type | Default | Notes |
| --- | --- | --- | --- |
| `value` | `number` | **required** | |
| `max` | `number` | `1` | `value / max`. The *bar* is always clamped to 0..1 |
| `label` | `string` | — | Also the `aria-label` fallback |
| `showValue` | `boolean` | `true` | Renders the rounded percent, tinted |
| `color` | `Hue \| "ramp"` | `"ramp"` | |
| `segments` | `number` | — | Switches to N discrete btop cells |
| `size` | `"sm" \| "md"` | `"md"` | 4px / 8px track. No `lg` |
| `allowOverrange` | `boolean` | `false` | **New in 0.3.0.** Let the *readout* exceed `max` instead of clamping it away. Adds `.kanso-meter--overrange` and a hazard block at the right end |
| `showStep` | `boolean` | `false` | **New in 0.3.0.** Print the ramp step's word — `NOMINAL` … `CRITICAL`, or `OVERRANGE` — beside the value. **Ignored unless `color="ramp"`** |

DOM element: `<div role="meter">` with `aria-valuenow/min/max/text`; extends
`Omit<HTMLAttributes<HTMLDivElement>, "color">`.

```tsx
<Meter label="THERM" value={0.81} />
<Meter label="CORE 02" value={0.92} segments={24} />
<Meter label="INDEX" value={0.55} color="info" size="sm" showValue={false} />
<Meter label="SYNC RATIO" value={412} max={100} allowOverrange showStep />
```

**Notes.** The gradient spans the whole *track* and the fill is then scaled to the
fraction, so 30% reads green→caution and 95% runs green→red — this is what makes 80% look
identical across apps. Fills animate with `transform: scaleX()`, never `width`. In
`segments` mode each cell is coloured by *its own* ramp position, not the meter's, so a
lit cell at index 20 of 24 is red regardless of the current value. `aria-label` falls back
to `label` and then to the literal `"meter"`, because `role="meter"` is anonymous without
a name.

**Both new props default to `false`, so a Meter written against 0.2.0 renders and announces
exactly as it did.** With `allowOverrange` left off, `value > max` still clamps to 100% the
way it always has.

`allowOverrange` splits the value through `rampOverrange` (§8): the bar draws the clamped
fraction, while the percent and `aria-valuetext` carry the true `value / max` — 412%, not
100% — and `aria-valuetext` becomes `"412% — OVERRANGE"`. `aria-valuenow` is always the raw
`value` and `aria-valuemax` always `max`, so an overrange is a genuine out-of-range meter to
AT, not a relabelled full one. **The overrange block is a flag, not a quantity:** it is a
fixed-width hazard strip welded to the right end, one caution cycle wide, and it does not
encode *how far* past `max` the value went. The number carries the magnitude, as btop does.
Encoding the excess as width would mean either animating `width` or distorting the stripes
under `scaleX`.

`showStep` exists for WCAG 1.4.1. Adjacent ramp stops sit ~1.2–1.7:1 apart along the
orange-red axis, which is the axis deuteranopia collapses, so the word is the signal and the
colour only agrees with it. In overrange the value and the step word both take `danger` from
the modifier class rather than the inline tint, which is what lets the theme layer restyle
the state.

The two props are independent, and one combination is worth knowing: with `showStep` on,
`allowOverrange` **off** and `value > max`, the step word reads `OVERRANGE` while the
percent reads `100%`. The step comes from `rampOverrange`, which sees the real ratio
whatever the paint does. Pass both together, or neither.

---

### Gauge

240° radial dial with the gap at the bottom, ticks at the five ramp stops. SVG arc, HTML
number. Lineage: EVA cockpit × btop.

| Prop | Type | Default | Notes |
| --- | --- | --- | --- |
| `value` | `number` | **required** | |
| `max` | `number` | `1` | |
| `label` | `string` | — | Caption under the dial; also the `aria-label` fallback |
| `unit` | `string` | — | Defaults to `"%"` only when `max === 1` and `unit` is undefined |
| `size` | `number` | `120` | **Outer diameter in px**, not a size token |
| `color` | `Hue \| "ramp"` | `"ramp"` | |

DOM element: `<div>`; the inner `<svg>` carries `role="meter"`. Extends
`Omit<HTMLAttributes<HTMLDivElement>, "color">`.

```tsx
<Gauge value={0.94} label="THERM" />
<Gauge value={41.3} max={100} unit="%" label="SYNC" color="info" size={96} />
```

**Notes.** When `max === 1` and no `unit` is given the readout shows `Math.round(frac*100)`
with a `%` suffix; otherwise it shows the raw `value`, as an integer if it is one and to
one decimal if not. Stroke width and tick geometry derive from `size`, so a gauge below
about 64px loses its ticks into the arc. The arc animates `stroke-dashoffset` — the third
sanctioned carve-out — and the transition is disabled under `prefers-reduced-motion`.

---

### Sparkline

Compact SVG line + area. No curve smoothing: telemetry is sampled, and a spline draws
values that were never measured. Lineage: btop history strips.

| Prop | Type | Default | Notes |
| --- | --- | --- | --- |
| `values` | `readonly number[]` | **required** | Empty array falls back to `[baseline]` |
| `color` | `Hue \| "ramp"` | `"ramp"` | Ramp position is taken from the **last** sample |
| `fill` | `boolean` | `true` | Area gradient, 28% → 0 |
| `height` | `number` | `28` | Kept exact even when fluid |
| `width` | `number` | `140` | Sampling resolution; the intrinsic width when `fluid={false}` |
| `fluid` | `boolean` | `true` | Stretches to the container |
| `max` | `number` | series peak | |
| `baseline` | `number` | `0` | Value the area is measured from |

DOM element: `<div role="img">` with a generated `aria-label`; extends
`Omit<HTMLAttributes<HTMLDivElement>, "color">`.

```tsx
<Sparkline values={cpu} height={64} />
<Sparkline values={rx} height={20} width={90} fluid={false} color="info" fill={false} />
```

**Notes.** `fluid` is on by default — set it false for a fixed inline strip such as a table
cell, otherwise the trace eats the column. `preserveAspectRatio="none"` plus a non-scaling
1px stroke means horizontal stretching costs nothing but resolution. The default
`aria-label` prints the raw `latest` value unformatted; pass your own for anything with
units.

---

### BrailleGraph

btop's braille plot as real text — 2 samples and 4 vertical subpixels per character, so it
survives being pasted into a terminal or a log file. Lineage: btop.

| Prop | Type | Default | Notes |
| --- | --- | --- | --- |
| `values` | `readonly number[]` | **required** | |
| `rows` | `number` | `4` | Character rows; each resolves 4 subpixels |
| `columns` | `number` | auto-fit | Omit to measure the container and fill it |
| `max` | `number` | series peak | |
| `color` | `Hue \| "ramp"` | `"ramp"` | `ramp` tints each row by its own height |
| `label` | `string` | — | Visible caption above the art |

DOM element: `<div>`; extends `Omit<HTMLAttributes<HTMLDivElement>, "color">`.

```tsx
<BrailleGraph values={cpu} rows={4} color="ramp" label="CPU 60s" />
<BrailleGraph values={rx} rows={3} columns={60} color="info" label="NET RX" />
```

**Notes.** With `columns` omitted the component appends a hidden probe span, measures one
glyph advance, and installs a `ResizeObserver` — that is a layout read per resize, so pass
an explicit `columns` if you are rendering many of these in a virtualized list. Before the
first measurement it falls back to one column per two samples, so the first paint is never
empty. The art is `aria-hidden`; a `.kanso-sr-only` line carries sample count, latest, mean
and peak. Row 0 is the *top* of the plot, hence the highest ramp colour.

---

### BarChart

Horizontal labelled bars, same ramp trick as `Meter`. Lineage: btop's per-device lists.

| Prop | Type | Default | Notes |
| --- | --- | --- | --- |
| `data` | `readonly BarChartDatum[]` | **required** | Keyed by `label` |
| `max` | `number` | largest value in `data` | |
| `showValues` | `boolean` | `true` | Integers plain, otherwise one decimal |
| `color` | `Hue \| "ramp"` | `"ramp"` | |

`BarChartDatum`: `label: string` (**required**), `value: number` (**required**),
`color?: Hue` (per-row override of the chart-level colour).

DOM element: `<div>`; each track is a `role="meter"`. Extends
`Omit<HTMLAttributes<HTMLDivElement>, "color">`.

```tsx
<BarChart data={[
  { label: "IMAGES", value: 1284 },
  { label: "VIDEO",  value: 862 },
  { label: "RAW",    value: 341 },
  { label: "AUDIO",  value: 96, color: "info" },
]} />
```

**Notes.** Rows are keyed by `label`, so duplicate labels will collide. A row that sets its
own `color` drops out of the ramp entirely and paints flat. The chart is horizontal only —
there is no `orientation` prop (ADOPTION.md §5.2).

---

### SegmentBar

One stacked ratio bar for composition: disk used/free, tag split, memory breakdown. Not a
severity reading, so it takes explicit hues rather than the ramp. Lineage: btop's memory bar.

| Prop | Type | Default | Notes |
| --- | --- | --- | --- |
| `segments` | `readonly SegmentBarSegment[]` | **required** | Keyed by `label` |
| `showLegend` | `boolean` | `true` | Swatch / name / percent list |

`SegmentBarSegment`: `label: string`, `value: number`, `color: Hue` — **all three
required**. There is no default hue.

DOM element: `<div>`; the track is a `role="img"` whose `aria-label` lists every segment
and its percentage. Extends `Omit<HTMLAttributes<HTMLDivElement>, "color">`.

```tsx
<SegmentBar segments={[
  { label: "SYSTEM", value: 42,  color: "primary" },
  { label: "MEDIA",  value: 118, color: "info" },
  { label: "CACHE",  value: 31,  color: "accent" },
  { label: "FREE",   value: 89,  color: "success" },
]} />
```

**Notes.** Percentages are computed from the sum of the segments, with negatives clamped to
zero — pass the parts, not the parts plus the total, or `FREE` will be counted twice.

---

### CoreGrid

btop's per-core wall: a dense matrix of tiny labelled meters, each on one baseline row.
Deliberately bespoke rather than a grid of `<Meter>`s. Lineage: btop.

| Prop | Type | Default | Notes |
| --- | --- | --- | --- |
| `cores` | `readonly CoreGridCore[]` | **required** | Keyed by `label` |
| `columns` | `number` | `4` | A **maximum**, not a fixed count — the grid auto-fits |
| `max` | `number` | `1` | Applies to every core |
| `color` | `Hue \| "ramp"` | `"ramp"` | |
| `showValues` | `boolean` | `true` | Rounded percent, no `%` sign, right-aligned at 3ch |
| `size` | `"sm" \| "md" \| "lg"` | `"md"` | `sm` is the old hairline density |

`CoreGridCore`: `label: string`, `value: number` — both required.

DOM element: `<div>`; each track is a `role="meter"`. Extends
`Omit<HTMLAttributes<HTMLDivElement>, "color">`.

```tsx
<CoreGrid cores={cores} columns={8} size="sm" />
```

**Notes.** `columns` is a ceiling. The grid is `auto-fit` with a per-size minimum cell
width (4rem / 4.75rem / 7.5rem), so a panel too narrow to keep the label, bar and 3-digit
value legible drops to fewer, wider cells instead of crushing every cell. Sixty-four cores
at `size="lg"` in a sidebar will render as two columns; that is the intended failure mode.

---

### Progress

Determinate fill or an indeterminate sweep. Lineage: NERV operation chrome.

| Prop | Type | Default | Notes |
| --- | --- | --- | --- |
| `value` | `number` | — | **Omitting it makes the bar indeterminate** |
| `max` | `number` | `1` | |
| `label` | `string` | — | Also the `aria-label` fallback |
| `showValue` | `boolean` | `true` | `"···"` while indeterminate |
| `indeterminate` | `boolean` | — | Forces the sweep |
| `color` | `Hue` | `"primary"` | No `"ramp"` — progress is not a severity |
| `size` | `"sm" \| "md"` | `"md"` | 4px / 8px track |

DOM element: `<div>`; the track is `role="progressbar"`. Extends
`Omit<HTMLAttributes<HTMLDivElement>, "color">`.

```tsx
<Progress value={0.62} label="INDEXING" />
<Progress indeterminate label="SCANNING SECTOR 07" />
```

**Notes.** `indeterminate` is `value === undefined || indeterminate === true` — passing
`indeterminate={false}` with no `value` still sweeps, because a determinate bar with no
`aria-valuenow` is a lie. While running, all four `aria-value*` attributes are omitted
rather than zeroed. Under `prefers-reduced-motion` the sweeping band becomes a static 35%
wash across the full track.

---

### LED

Status dot with a single tight 6px halo. Lineage: NERV indicator lamps.

| Prop | Type | Default | Notes |
| --- | --- | --- | --- |
| `state` | `"ok" \| "warn" \| "crit" \| "off" \| "info"` | **required** | `warn` is orange (`primary`), not `warning` |
| `label` | `string` | — | Visible caption. Without it, a `.kanso-sr-only` state word is emitted |
| `blink` | `boolean` | `false` | Shares the 1000ms `kanso-blink` cadence |
| `size` | `"sm" \| "md" \| "lg"` | `"md"` | 4 / 6 / 9px dot |

DOM element: `<span>`; extends `Omit<HTMLAttributes<HTMLSpanElement>, "color">`.

```tsx
<LED state="ok" label="MELCHIOR" />
<LED state="crit" label="BREACH" blink />
```

**Notes.** Without `label` the component still names itself — `ok` → "nominal", `warn` →
"warning", `crit` → "critical", `off` → "offline", `info` → "info" — so a bare dot is not
silent to a screen reader. `off` draws no halo but an inset hairline ring, so it reads as
a socket rather than as a missing element. Blink is disabled under
`prefers-reduced-motion`; if the blink is the only signal, add a word.

---

### Readout

The primary stat tile: tiny tracked label, large tabular value, optional unit and delta.
Chamfered top-right. Lineage: NERV status panel × btop header figures.

| Prop | Type | Default | Notes |
| --- | --- | --- | --- |
| `label` | `string` | **required** | |
| `value` | `ReactNode` | **required** | |
| `unit` | `string` | — | |
| `delta` | `number` | — | Signed. Rendered with ▲ / ▼ / · |
| `deltaUnit` | `string` | — | Suffix on the delta figure |
| `deltaInverted` | `boolean` | `false` | Flips good/bad for latency, errors, cost |
| `state` | `ReadoutState` = `RampName \| "info" \| "neutral"` | `"neutral"` | |
| `footnote` | `ReactNode` | — | |

DOM element: `<div>` carrying `.kanso-cut-tr`; extends
`Omit<HTMLAttributes<HTMLDivElement>, "color">`.

```tsx
<Readout label="UPTIME" value="412:09:55" />
<Readout label="LATENCY" value="128" unit="ms" delta={14} deltaUnit="ms" deltaInverted state="warning" />
<Readout label="BREACHES" value="1" state="critical" footnote="SECTOR 7" />
```

**Notes.** The delta arrow is `aria-hidden` and paired with a `.kanso-sr-only`
"up"/"down"/"unchanged" — the colour is never the only signal. `delta={0}` renders the
`·` bullet in the flat style rather than being suppressed. The absolute value is printed;
the sign lives in the arrow. `.kanso-cut-tr` is already applied, so do not add a second
clip class.

---

### DataList

Label/value rows: label left in tracked mono, value right in tabular mono, one hairline
between rows and none at the ends. Lineage: NERV's parameter block.

| Prop | Type | Default | Notes |
| --- | --- | --- | --- |
| `items` | `readonly DataListItem[]` | **required** | Keyed by `label` |
| `dense` | `boolean` | `false` | |

`DataListItem`: `label: string` (**required**), `value: ReactNode` (**required**),
`state?: DataListState` (= `RampName \| "info" \| "neutral"`, default `"neutral"`, which
adds no class).

DOM element: `<dl>`; each row is a `<div><dt>/<dd></div>`. Extends
`Omit<HTMLAttributes<HTMLDListElement>, "color">`.

```tsx
<DataList items={[
  { label: "HOST",   value: "nerv-tokyo-3" },
  { label: "KERNEL", value: "6.9.4-magi" },
  { label: "LOAD",   value: "0.42 0.51 0.60", state: "nominal" },
  { label: "THERM",  value: "78°C", state: "warning" },
]} />
```

**Notes.** Rows are keyed by `label`; duplicates collide. Use this for a fixed parameter
block — for anything sortable or selectable, use `Table`.

---

### Table

Data table: dim uppercase head, hairline separators, 1.5% zebra, orange wash on the
selected row. Lineage: btop's process list × NERV manifest sheets.

**`Table` is a generic function component, not a `forwardRef`** — forwarding a ref would
erase `T`. There is no `ref` prop.

| Prop | Type | Default | Notes |
| --- | --- | --- | --- |
| `columns` | `readonly TableColumn<T>[]` | **required** | |
| `rows` | `readonly T[]` | **required** | |
| `rowKey` | `(row: T) => string` | **required** | |
| `selectedKey` | `string` | — | Compared against `rowKey(row)` |
| `onSelect` | `(row: T) => void` | — | **Its presence flips the whole table into grid roles** |
| `sort` | `TableSort` | — | `{ key, direction: "asc" \| "desc" }` |
| `onSortChange` | `(key: string) => void` | — | Its presence makes every head a button |
| `dense` | `boolean` | `false` | |
| `caption` | `string` | — | Rendered `.kanso-sr-only`; also the `aria-label` fallback |

`TableColumn<T>`: `key: string` (**required**), `header: ReactNode` (**required**),
`align?: TableAlign` (`"left" \| "center" \| "right"`, default `"left"`),
`width?: string \| number`, `render?: (row: T) => ReactNode`.

DOM element: `<table>` inside a `.kanso-table__scroll` wrapper `<div>`. `className` and the
rest go on the `<table>`, not the wrapper. Extends
`Omit<HTMLAttributes<HTMLTableElement>, "onSelect">`.

```tsx
<Table<Proc>
  rows={rows}
  rowKey={(r) => String(r.pid)}
  selectedKey={selected}
  onSelect={(r) => setSelected(String(r.pid))}
  sort={sort}
  onSortChange={(key) => setSort((s) =>
    s.key === key ? { key, direction: s.direction === "asc" ? "desc" : "asc" } : { key, direction: "desc" })}
  columns={[
    { key: "pid",  header: "PID", align: "right", width: 70 },
    { key: "name", header: "COMMAND" },
    { key: "cpu",  header: "CPU%", align: "right", width: 110,
      render: (r) => <Meter value={r.cpu} size="sm" /> },
    { key: "mem",  header: "MEM", align: "right", width: 80,
      render: (r) => `${r.mem.toFixed(1)} GB` },
  ]}
/>
```

**Notes.** Without `render`, a cell falls back to `row[column.key]` and prints it only if
it is a `string`, `number` or `boolean` — anything else renders empty. `aria-selected` is
only legal inside a grid, so passing `onSelect` switches the table to
`role="grid"`/`row`/`columnheader`/`gridcell` wholesale and makes each row `tabIndex={0}`
with Enter/Space handling; a static table stays a plain `<table>` and says nothing about
selection. `onSortChange` receives the column key and nothing else — the component holds
no sort state, and does not sort `rows` for you.

---

### Terminal

Scrolling log view: dim timestamp column, level-coloured text, 1.5% stripe, blinking block
cursor. Lineage: NERV console feed × btop's message pane.

| Prop | Type | Default | Notes |
| --- | --- | --- | --- |
| `lines` | `readonly TerminalLine[]` | **required** | Keyed by `${index}-${ts}` |
| `follow` | `boolean` | `true` | Pins the view to the newest line on every `lines` change |
| `cursor` | `boolean` | `false` | Blinking block after the last line |
| `title` | `ReactNode` | — | Header with a `❯` prompt |
| `height` | `number \| string` | `220` | `max-height` of the scroll region |

`TerminalLine`: `ts?: string`, `level: TerminalLevel` (**required**), `text: string`
(**required**). `TerminalLevel` is `"info" | "warn" | "error" | "system"` — info is green,
warn is orange, error is red with a faint shadow, system is cyan.

DOM element: `<div>`; the body is `role="log" aria-live="polite" aria-relevant="additions"`
and `tabIndex={0}`. Extends `Omit<HTMLAttributes<HTMLDivElement>, "title">`.

```tsx
<Terminal title="SYSTEM LOG" height={200} cursor lines={[
  { ts: "02:41:03", level: "system", text: "MAGI handshake complete — 3/3 units responding" },
  { ts: "02:41:16", level: "warn",   text: "thermal margin narrowing on BALTHASAR (78°C)" },
  { ts: "02:41:22", level: "error",  text: "pattern BLUE detected — sector 7, closing 61 m/s" },
]} />
```

**Notes.** `aria-live="polite"` means every appended line is announced; for a high-rate
feed, batch updates or the screen reader will not keep up. The log region's accessible
name is `aria-label`, then `title` **only if `title` is a string**, then the literal
`"log"`. Keys use the array index plus `ts`, so prepending to `lines` re-keys everything
below — append. The cursor's blink is disabled under `prefers-reduced-motion`.

---

### MagiConsensus

N named voters and the one answer they add up to. The MAGI screen is the NERV device with
no equivalent anywhere else, and there is a real pattern under the fiction: CI shard status,
replica/quorum health, multi-region availability, approval workflows, ensemble voting.
Lineage: EVA. **New in 0.3.0.**

| Prop | Type | Default | Notes |
| --- | --- | --- | --- |
| `nodes` | `MagiNode[]` | **required** | The voters, in display order |
| `verdict` | `ReactNode` | — | Overrides the derived aggregate word only — the tally line is still computed |
| `quorum` | `number` | `Math.floor(nodes.length / 2) + 1` | Votes needed to carry |
| `label` | `string` | — | Visible caption **and** the group's accessible name; falls back to `"consensus"` |
| `layout` | `"triangle" \| "row"` | `"triangle"` | `triangle` applies **only at exactly 3 nodes**; anything else falls back to a row |

`MagiNode`: `id: string` (**required**, the React key), `name: string` (**required**),
`state: MagiNodeState` (**required**), `detail?: string` (dim line under the state word — a
reason, a region, a shard id).

`MagiNodeState` is `"pending" | "affirm" | "deny" | "abstain" | "compromised"` →
`text-dim` / `success` / `danger` / `muted` / `danger` with a hazard stripe across the node.

DOM element: `<div role="group">` with `aria-label`; extends `HTMLAttributes<HTMLDivElement>`.
`style` is merged with `--kanso-magi-count`. The verdict box is `role="status"`.

```tsx
<MagiConsensus label="MAGI // DEPLOY GATE" nodes={[
  { id: "mel", name: "MELCHIOR", state: "affirm", detail: "eu-west-1" },
  { id: "bal", name: "BALTHASAR", state: "affirm", detail: "us-east-1" },
  { id: "cas", name: "CASPER", state: "deny", detail: "p99 regression" },
]} />
```

**Notes.** Only `affirm` and `deny` count as votes. `pending`, `abstain` and `compromised`
count as nothing — a compromised node has not decided anything, and counting it either way
is the actual failure mode this display exists to make visible. The outcome is `APPROVED`
when `affirm >= quorum`, `REJECTED` when `deny >= quorum`, and `DELIBERATING` otherwise, so
a three-node board with one compromised unit sits in `DELIBERATING` rather than resolving.
The tally line always prints `AFFIRM n · DENY n · QUORUM carry/count`, including when
`verdict` overrides the word, so a hand-written verdict can never hide the count it came
from.

**It does not measure its own wires.** The connector SVG is a single `aria-hidden` element
on a fixed `0 0 100 100` viewBox with `preserveAspectRatio="none"` and non-scaling strokes,
drawn from nominal percentages — no `ResizeObserver`. The lines run *behind* opaque node
boxes, so approximate endpoints are invisible. Below 480px the triangle collapses to a row
and the wires are `display: none` rather than drawn wrong.

The verdict box is `role="status"`, so a change in outcome is announced politely; the node
states are not live regions, and a board that changes several nodes per second will not
narrate them.

---

## 5. Controls

### Button

The command button: mechanical in-out motion, chamfered cut, mono label. Lineage: NERV.

| Prop | Type | Default | Notes |
| --- | --- | --- | --- |
| `variant` | `"primary" \| "secondary" \| "ghost" \| "danger"` | `"primary"` | |
| `size` | `"sm" \| "md" \| "lg"` | `"md"` | `md` is the ~30px control height |
| `type` | `"button" \| "submit" \| "reset"` | `"button"` | Overridden by passing `type` |

DOM element: `<button>`; extends `ButtonHTMLAttributes<HTMLButtonElement>` — `disabled`,
`onClick`, `form` and the rest pass straight through.

```tsx
<Button variant="danger" size="sm" onClick={purge}>PURGE CACHE</Button>
```

**Notes.** `type` defaults to `"button"`, so a Button inside a `<form>` will not submit
unless you pass `type="submit"`.

---

### IconButton

A square glyph key: one chamfered cell, one glyph. Lineage: NERV console keycap.

| Prop | Type | Default | Notes |
| --- | --- | --- | --- |
| `variant` | `"ghost" \| "outline" \| "solid" \| "danger"` | `"outline"` | `ghost` is transparent until hovered |
| `size` | `"sm" \| "md" \| "lg"` | `"md"` | |
| `label` | `string` | **required** | Becomes both `aria-label` and the DOM `title` |
| `children` | `ReactNode` | **required** | The glyph — a character, an SVG, anything one cell wide |
| `type` | — | `"button"` | |

DOM element: `<button>` with `.kanso-cut-sm`; extends
`Omit<ButtonHTMLAttributes<HTMLButtonElement>, "aria-label">` — you cannot pass
`aria-label`, `label` is it.

```tsx
<IconButton label="Refresh telemetry" onClick={refresh}>{MARK.netBoth}</IconButton>
```

**Notes.** `label` is mandatory because the button has no text, and it doubles as a native
tooltip. Wrapping an IconButton in `<Tooltip>` therefore produces two tooltips — pass the
Tooltip's content as `label` instead, or accept the duplication deliberately.

---

### Chip

The notched selector chip. **State changes are driven by anime.js, not CSS transitions.**
Lineage: NERV `wtab` / `term-tab`.

| Prop | Type | Default | Notes |
| --- | --- | --- | --- |
| `active` | `boolean` | `false` | Also emitted as `aria-pressed` |
| `variant` | `"tab" \| "term"` | `"tab"` | `term` is a rectangular pane tab with a bleeding baseline |
| `size` | `"sm" \| "md" \| "lg"` | `"md"` | |
| `type` | — | `"button"` | |

DOM element: `<button aria-pressed>`; extends `ButtonHTMLAttributes<HTMLButtonElement>`.
`onMouseEnter` / `onMouseLeave` are chained, not replaced.

```tsx
<div className="row">
  {panes.map((p) => (
    <Chip key={p} variant="term" active={pane === p} onClick={() => setPane(p)}>{p}</Chip>
  ))}
</div>
```

**Notes.** `Chip` and `Scanlines` are the only two components that pull `animejs`; a
consumer taking the tokens-only path gets neither. Because colour, border, background and
text-shadow are tweened in JS, `Chip.css` carries no transitions — a **vanilla consumer
gets no hover or active tween** (ADOPTION.md §5.14). The `term` variant is the partial
exception: its 2px baseline is a `::after` driven by `[aria-pressed="true"]`, so that much
works without React. Under `prefers-reduced-motion` the palette is applied as a direct
style write rather than a tween. `tab` idles at `muted`; `term` idles at `text-dim`,
because a terminal tab is the only label on the pane it names.

---

### Input

The text field: a recessed well behind a hairline frame, TR chamfer, cyan caret. Label,
hint and error are wired to the control with real ids. Lineage: NERV data-entry cell.

| Prop | Type | Default | Notes |
| --- | --- | --- | --- |
| `label` | `ReactNode` | — | A real `<label htmlFor>` |
| `hint` | `ReactNode` | — | **Suppressed while `error` is set** |
| `error` | `ReactNode` | — | Presence flips the field to `aria-invalid` and the danger edge |
| `prefix` | `ReactNode` | — | Static ornament inside the well, `aria-hidden` |
| `suffix` | `ReactNode` | — | Static ornament after the control, `aria-hidden` |
| `size` | `FieldSize` = `"sm" \| "md" \| "lg"` | `"md"` | Min-heights 1.5 / 1.875 / 2.375rem |
| `block` | `boolean` | `false` | Stretch to the parent |

DOM element: `<input>` inside a `.kanso-field` wrapper. `className` lands on the **wrapper**,
not the input. Extends `Omit<InputHTMLAttributes<HTMLInputElement>, "size" | "prefix">`.

```tsx
<Input label="TARGET HOST" block required
       placeholder="nerv-tokyo-3"
       prefix="//" suffix="TCP"
       error={invalid ? "UNRESOLVED HOSTNAME" : undefined} />
```

**Notes.** `size` and `prefix` are re-typed away from their DOM meanings — you cannot set
the HTML `size` attribute. `id` is generated from `useId` if you do not pass one, and the
hint/error ids derive from it, so `aria-describedby` is always correct. `required` renders
a `*` marker and sets the native attribute. Focus outranks invalid: a focused invalid field
shows the cyan ring, because cyan is the focus colour system-wide; the danger signal is
still carried by the resting border, the `!` prefix on the error line, and the words.

---

### Textarea

Multi-line sibling of `Input`, sharing `Input.css` and the same field contract. Lineage:
NERV log-entry cell.

| Prop | Type | Default | Notes |
| --- | --- | --- | --- |
| `label` | `ReactNode` | — | |
| `hint` | `ReactNode` | — | Suppressed while `error` is set |
| `error` | `ReactNode` | — | |
| `size` | `FieldSize` | `"md"` | |
| `block` | `boolean` | `false` | |
| `rows` | `number` | `4` | |

DOM element: `<textarea>` inside a `.kanso-field` wrapper. Extends
`TextareaHTMLAttributes<HTMLTextAreaElement>` — note it does **not** omit `size`.

**Notes.** No chamfer on the control: a resizable box cannot keep a `clip-path` honest, so
the frame stays square. There are no `prefix` / `suffix` props.

---

### Select

A native `<select>` in Kanso chrome. Native on purpose — the OS popup is keyboard- and
screen-reader-correct on every platform. Lineage: NERV parameter picker.

| Prop | Type | Default | Notes |
| --- | --- | --- | --- |
| `label` | `ReactNode` | — | |
| `hint` | `ReactNode` | — | Suppressed while `error` is set |
| `error` | `ReactNode` | — | |
| `size` | `FieldSize` | `"md"` | |
| `block` | `boolean` | `false` | |
| `options` | `readonly SelectOption[]` | — | **Ignored when `children` is provided** |
| `placeholder` | `string` | — | Emits a disabled `<option value="">` first |

`SelectOption`: `value: string`, `label: string`, `disabled?: boolean`.

DOM element: `<select>` inside a `.kanso-field` wrapper. Extends
`Omit<SelectHTMLAttributes<HTMLSelectElement>, "size">`.

```tsx
<Select label="SEVERITY FLOOR" block value={floor} onChange={(e) => setFloor(e.target.value)}
        options={[
          { value: "nominal",  label: "NOMINAL" },
          { value: "elevated", label: "ELEVATED" },
          { value: "critical", label: "CRITICAL" },
        ]} />
```

**Notes.** Only the closed control is restyled. What CSS *can* reach in the open list:
`color-scheme: dark` for the popup frame and scrollbar, and per-row `background-color`,
`color` and `font-family` on `option`/`optgroup` in Blink and Gecko. What it cannot: the
pointer/keyboard highlight colour (the OS accent), row height and padding, and anything at
all on Safari/WebKit, which draws a system menu. The `▼` is `MARK.down` in a `<span>`, not
a background gradient.

---

### Checkbox

Square box with an orange tick drawn as an SVG polyline. Lineage: NERV checklist.

| Prop | Type | Default | Notes |
| --- | --- | --- | --- |
| `label` | `ReactNode` | — | |
| `description` | `ReactNode` | — | Dim second line, wired via `aria-describedby` |

DOM element: `<input type="checkbox">` inside a `<label>` wrapper. `className` lands on the
wrapper. Extends `Omit<InputHTMLAttributes<HTMLInputElement>, "type" | "size">`.

```tsx
<Checkbox defaultChecked label="AUTO-ESCALATE" description="Raise to level 2 without confirmation" />
```

**Notes.** The tick is SVG geometry, not a `✓` glyph: several mono faces draw U+2713 as a
radical sign, and a text mark's weight and baseline shift with whatever font resolves. A
real `<input>` carries state and focus underneath, so keyboard and AT behaviour is native.
There is no `indeterminate` prop — set it on the DOM node through a ref.

---

### Radio

Square box, round dot. Lineage: NERV mode select.

| Prop | Type | Default | Notes |
| --- | --- | --- | --- |
| `label` | `ReactNode` | — | |
| `description` | `ReactNode` | — | |

DOM element: `<input type="radio">` inside a `<label>` wrapper. Extends
`Omit<InputHTMLAttributes<HTMLInputElement>, "type" | "size">`.

```tsx
<Radio name="mode" value="auto" defaultChecked label="AUTO" />
<Radio name="mode" value="manual" label="MANUAL" description="Operator holds the trigger" />
```

**Notes.** **The dot is the one sanctioned `border-radius` in the library.** A square dot
in a square box read as a checkbox that had forgotten what it was, and the distinction
between "pick one" and "pick any" is worth more than the purity of rule 2. The outer box
stays square. There is no radio-group component — use a shared `name`.

---

### Switch

Rectangular breaker: a square thumb travelling a rectangular track in one hard 120ms move.
Lineage: NERV power-rail toggle.

| Prop | Type | Default | Notes |
| --- | --- | --- | --- |
| `label` | `ReactNode` | — | |
| `description` | `ReactNode` | — | |

DOM element: `<input type="checkbox" role="switch">` inside a `<label>` wrapper. Extends
`Omit<InputHTMLAttributes<HTMLInputElement>, "type" | "size">`.

```tsx
<Switch defaultChecked label="SCANLINES" description="Atmosphere layer" />
```

---

### Slider

Linear parameter rail: a 4px well track, the travelled portion painted orange, a 12px
square thumb. Lineage: btop meter × NERV trim control.

| Prop | Type | Default | Notes |
| --- | --- | --- | --- |
| `label` | `ReactNode` | — | A real `<label htmlFor>` |
| `hint` | `ReactNode` | — | Wired via `aria-describedby` |
| `size` | `"sm" \| "md" \| "lg"` | `"md"` | |
| `block` | `boolean` | `false` | |
| `showValue` | `boolean` | `false` | Renders an `<output>` beside the label |
| `unit` | `string` | `""` | Appended after a space |
| `ticks` | `number` | — | Evenly spaced marks; ignored below 2 |
| `formatValue` | `(value: number) => string` | — | Overrides `unit` entirely |
| `min` / `max` / `step` | `number \| string` | `0` / `100` / `1` | Passed to the native input |

DOM element: `<input type="range">` inside a `.kanso-slider` wrapper. `className` lands on
the wrapper, and the wrapper's `style` is owned by the component
(`--kanso-slider-pct`) — an inline `style` prop reaches the **input**, not the wrapper.
Extends `Omit<InputHTMLAttributes<HTMLInputElement>, "type" | "size">`.

```tsx
<Slider label="SCAN INTERVAL" block showValue unit="ms" min={50} max={2000} step={50}
        ticks={5} value={interval} onChange={(e) => setInterval(+e.target.value)} />
```

**Notes.** The component mirrors the value into internal state so the fill can be painted
without a re-render of the parent, and syncs from `value` in an effect — controlled usage
works, but the fill lags by one effect tick if the parent rejects the change. Passing
`value` switches the native input to controlled and drops `defaultValue`.

---

### Segmented

EVA mode selector: a row of sheared tabs where exactly one is live. **Generic over its
value union.** Lineage: EVA.

| Prop | Type | Default | Notes |
| --- | --- | --- | --- |
| `options` | `readonly SegmentedOption<T>[]` | **required** | Keyed by `value` |
| `value` | `T` | **required** | |
| `onChange` | `(value: T) => void` | **required** | Also fires on arrow-key movement |
| `size` | `"sm" \| "md" \| "lg"` | `"md"` | |
| `block` | `boolean` | `false` | Splits the parent evenly |
| `label` | `string` | — | Accessible name for the tablist. Not visible |
| `className` | `string` | `""` | |
| `id` | `string` | — | |

`SegmentedOption<T>`: `value: T`, `label: ReactNode`, `icon?: ReactNode`,
`disabled?: boolean`.

DOM element: `<div role="tablist">` of `<button role="tab">`. **No DOM prop spread** — the
props interface is closed; only `className` and `id` pass through. It accepts a
`ref: ForwardedRef<HTMLDivElement>`.

```tsx
type View = "graph" | "table" | "raw";

<Segmented<View>
  label="Telemetry view"
  value={view}
  onChange={setView}
  options={[
    { value: "graph", label: "GRAPH" },
    { value: "table", label: "TABLE" },
    { value: "raw",   label: "RAW", disabled: !debug },
  ]}
/>
```

**Notes.** `forwardRef` erases type parameters, so the export is a cast — `Segmented` is
typed as `<T extends string>(props: SegmentedProps<T> & { ref?: ... }) => ReactElement`.
The union is inferred from `options` and `value` together, so a typo in either is a type
error at the call site. The whole control is one tab stop: the active segment holds
`tabIndex={0}` and arrows move *and commit* the selection (there is no
follow-focus-without-select mode). Home/End jump to the first/last enabled option. Idle
segments use `.kanso-fill-dim`; the active one is a solid orange plate with dark ink.

---

## 6. Overlays

### Modal

The NERV command dialog: black scrim, hairline panel, orange accent rule, four L-brackets.
Enters in 160ms, leaves in 100ms. Lineage: NERV.

| Prop | Type | Default | Notes |
| --- | --- | --- | --- |
| `open` | `boolean` | **required** | |
| `onClose` | `() => void` | **required** | Called by Escape, the close button and the scrim |
| `title` | `ReactNode` | **required** | Also the dialog's accessible name |
| `subtitle` | `ReactNode` | — | Becomes `aria-describedby` when set |
| `footer` | `ReactNode` | — | Right-aligned strip |
| `size` | `"sm" \| "md" \| "lg" \| "full"` | `"md"` | 24 / 33 / 48rem, or full-bleed |
| `blur` | `boolean` | `false` | Blurs behind the scrim. Costs a `backdrop-filter` |
| `dismissOnScrim` | `boolean` | `true` | |
| `children` | `ReactNode` | — | Body, scrollable with `.kanso-scroll-thin` |

DOM element: portalled to `document.body`; `className` and the rest land on the
`role="dialog"` panel. Extends `Omit<HTMLAttributes<HTMLDivElement>, "title">`.

```tsx
<Modal open={open} onClose={close} size="sm"
       title="PURGE SECTOR 07"
       subtitle="This cannot be undone"
       footer={<><Button variant="ghost" onClick={close}>ABORT</Button>
                 <Button variant="danger" onClick={purge}>PURGE</Button></>}>
  <p>1,284 records and 4.2 GB of cached media will be destroyed.</p>
</Modal>
```

**Notes.** The component stays mounted for one `panelExit` beat after `open` flips false so
the exit animation can run; under `prefers-reduced-motion` that beat is zero. It traps Tab,
locks `document.body` scroll, moves focus to the first focusable node in the panel (or the
panel itself), and restores focus to whatever was active on the way out. The Escape
listener is on `document` in the capture phase and calls `stopPropagation` — that stops
the event reaching the app, but **not** other Modals' listeners on the same node, so
stacked modals all close together. `dismissOnScrim` fires on `mousedown`, so a drag that
starts inside the panel and ends on the scrim will not close it.

---

### Toast / ToastProvider / useToast

Transient alert cards stacked bottom-right, with a ramp-coloured countdown rule along the
bottom edge. Lineage: NERV alert bus × btop status line.

`ToastProvider`:

| Prop | Type | Default | Notes |
| --- | --- | --- | --- |
| `children` | `ReactNode` | — | |
| `duration` | `number` | `4000` | Default dwell in ms for toasts that do not set one |
| `max` | `number` | `5` | Hard cap; the oldest is dropped past it |

`Toast` (usable standalone, but normally rendered by the provider):

| Prop | Type | Default | Notes |
| --- | --- | --- | --- |
| `level` | `ToastLevel` = `"info" \| "success" \| "warning" \| "danger"` | `"info"` | |
| `title` | `ReactNode` | — | Uppercase mono headline |
| `message` | `ReactNode` | — | |
| `duration` | `number` | `4000` | `0` pins the card |
| `onDismiss` | `() => void` | — | **Its presence is what renders the close button** |
| `className` | `string` | `""` | |
| `children` | `ReactNode` | — | Rendered after `message` |

`useToast(): ToastApi` — `{ toast(options: ToastOptions | string): string; dismiss(id?: string): void }`.
A bare string is treated as the `title`. `dismiss()` with no id clears everything.
`ToastOptions` is `{ title?, message?, level?, duration? }`; `ToastRecord` is that plus
`id: string`.

Neither `Toast` nor `ToastProvider` spreads DOM props or takes a ref.

```tsx
function App() {
  return <ToastProvider max={3}><Console /></ToastProvider>;
}

function Console() {
  const { toast } = useToast();
  return <Button variant="danger" onClick={() => {
    toast({ level: "danger", title: "PATTERN BLUE", message: "Sector 7 — closing 61 m/s", duration: 0 });
  }}>RAISE ALERT</Button>;
}
```

**Notes.** **`useToast` throws** — `"useToast must be used inside a <ToastProvider>."` —
if no provider is above it in the tree. Mount the provider once, near the root. Each card
owns its own dwell timer, so hovering or focusing pauses only that card and the remaining
time is preserved across the pause. The viewport is a single `role="region"` with
`aria-live="polite"` and each card is `role="status"`. `Toast` renders a close button only
when `onDismiss` is passed, which the provider always does — a standalone `<Toast>`
without it cannot be dismissed by the user. Note the `info` level paints from
`--kanso-ramp-cool`, not `--kanso-color-info`, though they are the same hex.

---

### Tooltip

Hover/focus callout: true black slab, dim orange hairline, TR chamfer, portalled and
positioned from measured rects. Lineage: NERV instrument callout.

| Prop | Type | Default | Notes |
| --- | --- | --- | --- |
| `content` | `ReactNode` | **required** | Falsy content suppresses the tooltip entirely |
| `placement` | `"top" \| "bottom" \| "left" \| "right"` | `"top"` | Flips to the opposite side if it does not fit |
| `delay` | `number` | `200` | Hover dwell in ms. **Focus always shows immediately** |
| `disabled` | `boolean` | `false` | Turns it off without unmounting the trigger |
| `children` | `ReactElement` | **required** | **Exactly one element** |

No DOM prop spread, no ref.

```tsx
<Tooltip content="SYNC RATIO — LAST 60s" placement="bottom">
  <Readout label="SYNC" value="41.3" unit="%" />
</Tooltip>
```

**Notes.** The trigger is **cloned, not wrapped** — `cloneElement` injects `ref`,
`aria-describedby` and the four handlers, so the description lands on the real interactive
element and layout is untouched. Consequences: the child must accept a `ref` (a function
component without `forwardRef` will not work), and its own `onMouseEnter` /
`onMouseLeave` / `onFocus` / `onBlur` are chained rather than replaced. If `children` is
not a valid element it is returned unchanged and no tooltip is attached. Escape hides it;
scroll and resize reposition it. A 10px gap is deliberate — at 6px the slab read as part of
the card behind it. Do not wrap an `IconButton`, which already sets a native `title`.

---

### Menu

Portalled dropdown or context menu, anchored to a point or an element. Lineage: NERV
console command list.

| Prop | Type | Default | Notes |
| --- | --- | --- | --- |
| `open` | `boolean` | **required** | |
| `onClose` | `() => void` | **required** | |
| `items` | `readonly MenuItem[]` | **required** | Keyed by `key` |
| `anchor` | `MenuAnchor` | **required** | `{ x, y }` viewport point, or a `RefObject<HTMLElement \| null>` |
| `label` | `string` | `"Menu"` | Accessible name |
| `className` | `string` | `""` | |

`MenuActionItem`: `key: string`, `label: ReactNode`, `icon?: ReactNode`,
`shortcut?: string`, `danger?: boolean`, `disabled?: boolean`, `onSelect?: () => void`,
`separator?: false`.
`MenuSeparatorItem`: `key: string`, `separator: true`.
`MenuItem = MenuActionItem | MenuSeparatorItem`.

`useContextMenu(): ContextMenuState` — `{ open, anchor: {x,y}, onContextMenu(event),
openAt(x, y), close(), menuProps }`, where `menuProps` is
`Pick<MenuProps, "open" | "onClose" | "anchor">` ready to spread.

No DOM prop spread, no ref.

```tsx
const ctx = useContextMenu();

<tbody onContextMenu={ctx.onContextMenu}>…</tbody>

<Menu {...ctx.menuProps} label="Process actions" items={[
  { key: "inspect", label: "INSPECT", shortcut: "↵", onSelect: inspect },
  { key: "trace",   label: "ATTACH TRACE", shortcut: "⌘T", onSelect: trace },
  { key: "s1",      separator: true },
  { key: "kill",    label: "TERMINATE", danger: true, onSelect: kill },
]} />
```

**Notes.** A point anchor flips up/left when it would overflow; an element anchor opens
2px below the element's bottom edge and flips above it if there is no room. `open` is
required, so the menu is fully controlled — `useContextMenu` exists to hold that state for
you. Roving focus over `role="menuitem"` buttons, all at `tabIndex={-1}`; Escape, Tab, an
outside `mousedown`, a scroll or a resize all close it. Selecting an item calls `onSelect`
then `onClose`. `shortcut` is `aria-hidden` decoration — it binds nothing.

---

### CommandPalette

The flagship overlay: a prompt line, a subsequence filter, grouped results, a key legend.
Lineage: NERV MAGI command entry × btop's keyboard-first ethos.

| Prop | Type | Default | Notes |
| --- | --- | --- | --- |
| `open` | `boolean` | **required** | |
| `onClose` | `() => void` | **required** | |
| `commands` | `readonly PaletteCommand[]` | **required** | |
| `placeholder` | `string` | `"TYPE A COMMAND"` | |
| `defaultGroup` | `string` | `"COMMANDS"` | Heading for commands with no `group` |
| `emptyMessage` | `ReactNode` | `"NO MATCHING COMMAND"` | |

**The item type is exported from the barrel as `PaletteCommand`**, not `Command` —
`Command` is too broad a name to occupy at a library root. Its fields: `id: string`,
`label: string` (plain text; it is filtered and match-highlighted character by character),
`group?: string`, `hint?: string`, `keywords?: readonly string[]` (searched, never
rendered), `onRun: () => void`, `disabled?: boolean`.

No DOM prop spread, no ref. Portalled to `document.body`.

```tsx
<CommandPalette open={open} onClose={() => setOpen(false)} commands={[
  { id: "purge",  label: "PURGE SECTOR CACHE", group: "MAINTENANCE",
    hint: "4.2 GB", keywords: ["clear", "delete"], onRun: purge },
  { id: "escal",  label: "ESCALATE TO LEVEL 2", group: "ALERT",
    hint: "⌘⇧E", onRun: escalate },
  { id: "reboot", label: "REBOOT BALTHASAR", group: "MAINTENANCE",
    onRun: reboot, disabled: !operator },
]} />
```

**Notes.** Disabled commands are filtered out before scoring, so they never appear —
`disabled` hides rather than greys. Matching is subsequence, not substring: every query
character must appear in order, with contiguous runs (+8) and word starts (+6) scoring
higher, and shorter labels winning ties. A label match outranks any group/keyword match by
a flat +100. Display is grouped in first-seen order but arrow navigation runs over the
flat list. Semantics follow combobox/listbox: the input holds focus for the whole session
and points at the active row with `aria-activedescendant`, so rows are never focused. Tab
is swallowed — the palette owns the keyboard while open. The query resets on every open.

---

## 7. Feedback

### Alert

A persistent inline banner: left accent bar in the level colour, an 8% wash, uppercase mono
title. Unlike a Toast it stays until the condition clears. Lineage: NERV caution placard.

| Prop | Type | Default | Notes |
| --- | --- | --- | --- |
| `level` | `AlertLevel` = `"info" \| "success" \| "warning" \| "danger"` | **required** | No default |
| `title` | `ReactNode` | **required** | |
| `children` | `ReactNode` | — | Body copy under the title |
| `onDismiss` | `() => void` | — | Omit for a banner the user cannot silence |

DOM element: `<div>` with `role="alert"` when `level="danger"` and `role="status"`
otherwise. Extends `Omit<HTMLAttributes<HTMLDivElement>, "title">`.

```tsx
<Alert level="danger" title="AT FIELD BREACH">
  Pattern BLUE confirmed in sector 7. Evacuation protocol engaged.
</Alert>
```

**Notes.** `role="alert"` is assertive and interrupts the screen reader — that is why only
`danger` gets it. Rendering three danger Alerts at once will queue three interruptions.

---

### Takeover

The full-bleed alert, and the third rung of the escalation ladder: strip → banner →
takeover. `position: fixed; inset: 0` on opaque black, one enormous word in the level
colour, hazard chevrons top and bottom, everything else gone. A critical alert rendered as a
slightly redder toast has thrown away the point. Lineage: EVA. **New in 0.3.0.**

| Prop | Type | Default | Notes |
| --- | --- | --- | --- |
| `open` | `boolean` | **required** | |
| `word` | `string` | **required** | The single enormous word. One word — this is not a headline slot |
| `detail` | `ReactNode` | — | Dim mono line under the word. Becomes `aria-describedby` when set |
| `level` | `TakeoverLevel` = `"danger" \| "warning"` | `"danger"` | Two levels only — nothing below `warning` earns the screen |
| `code` | `string` | — | Hex or ordinal prefix — `05:`, `0B:`. Joins `word` in the accessible name |
| `actions` | `ReactNode` | — | Button row under the detail |
| `onDismiss` | `() => void` | — | **Omit for an alert the user cannot silence:** no Escape listener, no close control |
| `strobe` | `boolean` | `false` | 1 Hz opacity strobe on the word. Withheld under either reduce-motion switch |

DOM element: portalled to `document.body`; `className` and the rest land on the
`role="alertdialog"` plate. Extends `HTMLAttributes<HTMLDivElement>`.

```tsx
<Takeover open={breach} level="danger" code="05:" word="PATTERN BLUE"
          detail="AT field detected, sector 7. Closing 61 m/s."
          actions={<Button variant="danger" onClick={sortie}>LAUNCH</Button>}
          onDismiss={ack} />
```

**Notes.** The mount, focus-trap, scroll-lock and Escape machinery is `Modal`'s, deliberately
identical in shape so the two dialogs behave the same way: it stays mounted for one
`panelExit` beat after `open` flips false (zero under `prefers-reduced-motion`), traps Tab,
locks `document.body` scroll, focuses the first focusable node or the plate itself, and
restores focus to the trigger on the way out.

`onDismiss` is the whole dismissibility contract. With no handler there is no Escape
listener and no close button, which is the point for an alert that must be acted on rather
than cleared — but it also means the only way out is an `actions` control or the `open` prop
going false, so do not ship one without either.

`code` and `word` are joined into `aria-labelledby` in that order, so the ordinal is read
before the word. Real ordinals only: a decorative hex prefix is a fabricated fact in the
accessible name.

**The reduce-motion checks run in JS as well as in CSS**, and both are load-bearing. The
component portals to `<body>`, outside `.kanso-root`, where the global opt-outs in
`base/a11y.css` cannot reach it by descent — so `Takeover.css` writes its own unscoped
`prefers-reduced-motion` and `.kanso-reduce-motion` rules, and the component additionally
withholds the strobe class when either switch is on. The strobe itself runs on the `blink`
token (1000ms, step-end) — 1 Hz, well under WCAG 2.3.1's 3/sec ceiling — and dims the *word*
rather than the plate, so the flashing area is a glyph run and not the whole viewport.

`role="alertdialog"` is assertive by definition. One takeover at a time; two stacked plates
are two interruptions and one unreadable screen.

---

### BootSequence

The EVA cold open: lines type themselves out, each closing with an `[ OK ]` / `[ FAIL ]` /
`[ WARN ]` stamp, then `onComplete` fires. Lineage: EVA.

| Prop | Type | Default | Notes |
| --- | --- | --- | --- |
| `lines` | `readonly BootLine[]` | **required** | |
| `speed` | `number` | `12` | Milliseconds **per character** |
| `lineDelay` | `number` | `90` | Default pause between lines |
| `prompt` | `string` | `">"` | Printed before every line |
| `showSkipHint` | `boolean` | `true` | The "CLICK OR PRESS ANY KEY TO SKIP" footer |
| `onComplete` | `() => void` | — | Fires exactly once |

`BootLine`: `text: string` (**required**), `status?: BootStatus`
(`"ok" | "fail" | "warn" | "none"`, default `"none"`), `delay?: number` (overrides
`lineDelay` after this line).

DOM element: `<div role="log" aria-live="polite">`; extends
`Omit<HTMLAttributes<HTMLDivElement>, "children">` — it owns its children.

```tsx
<BootSequence onComplete={() => setBooted(true)} lines={[
  { text: "MAGI SYSTEM — MELCHIOR / BALTHASAR / CASPER", status: "ok" },
  { text: "loading sector map 07..12", status: "ok" },
  { text: "AT field integrity check", status: "warn", delay: 400 },
  { text: "handshake complete", status: "ok" },
]} />
```

**Notes.** It is theatre, so it must never be a gate. Under `prefers-reduced-motion` the
whole list prints immediately; any click on the element or **any keydown anywhere in the
document** skips the rest. `onComplete` is guarded by a ref and fires once even if the
sequence is skipped mid-line. One timer per character: a 400-character boot log at
`speed={12}` is 400 renders, so keep the lines short.

---

### Spinner

Indeterminate activity: a rotating square reticle, or an inline braille throbber. Lineage:
NERV scanning reticle × btop's braille spinner.

| Prop | Type | Default | Notes |
| --- | --- | --- | --- |
| `size` | `"sm" \| "md" \| "lg"` | `"md"` | 0.75 / 1 / 1.5rem |
| `color` | `SpinnerColor` = `"primary" \| "info" \| "success" \| "warning" \| "danger" \| "accent" \| "dim"` | `"primary"` | Its own union — adds `dim`, drops `magenta`/`lime` |
| `label` | `string` | `"Loading"` | |
| `variant` | `"ring" \| "glyph"` | `"ring"` | |
| `showLabel` | `boolean` | `false` | Prints the label in dim mono beside the spinner |

`BRAILLE_FRAMES` is exported alongside: the ten-frame `⠋⠙⠹⠸⠼⠴⠦⠧⠇⠏` cycle, btop's
throbber frame for frame.

DOM element: `<span role="status">`; extends
`Omit<HTMLAttributes<HTMLSpanElement>, "color">`.

```tsx
<Spinner variant="glyph" color="info" label="Scanning sector 07" showLabel />
```

**Notes.** `aria-label` is set to `label` **only when `showLabel` is false** — when the
label is visible it is not duplicated to AT. The `glyph` variant advances on a
`setInterval` at `DURATION.instant` (60ms) and is pinned to frame 0 under
`prefers-reduced-motion`; the `ring` variant is pure CSS.

---

### Badge

A label tag. A Badge labels; a Chip is pressable — the Badge ramp sits one step below
Chip's so the two never read as the same affordance. Lineage: NERV chip (ported from
Seele / mdrbx nerv-ui, MIT).

| Prop | Type | Default | Notes |
| --- | --- | --- | --- |
| `variant` | `"default" \| "success" \| "warning" \| "danger" \| "info"` | `"default"` | `default` is orange |
| `size` | `"sm" \| "md" \| "lg"` | `"md"` | |
| `label` | `ReactNode` | **required** | The badge content |
| `removable` | `boolean` | `false` | Renders a `×` button |
| `onRemove` | `() => void` | — | |
| `removeLabel` | `string` | `Remove ${label}` / `"Remove"` | Accessible name for that button |

DOM element: `<span>`; extends `Omit<HTMLAttributes<HTMLSpanElement>, "color">`.

```tsx
<Badge variant="success" label="OPERATIONAL" />
<Badge size="sm" label="SECTOR 7" removable onRemove={() => drop("sector-7")} />
```

**Notes.** Four of the five variants are filled with dark ink; `danger` alone is outlined
on a 10% wash, so it does not read as a Chip. A `ReactNode` label stringifies to
`"[object Object]"`, so the remove button's name falls back to the bare verb `"Remove"`
unless you pass `removeLabel`. The remove click calls `stopPropagation`, so a Badge inside
a clickable row is safe. There is still no outlined/idle variant (ADOPTION.md §5.10).

---

### Skeleton

Loading placeholder. Opacity pulse only. Lineage: NERV "awaiting telemetry" blanks.

| Prop | Type | Default | Notes |
| --- | --- | --- | --- |
| `width` | `number \| string` | `"100%"` | |
| `height` | `number \| string` | `12` | |
| `count` | `number` | `1` | N stacked bars; clamped to at least 1 |

DOM element: `<div aria-hidden="true">`; extends `HTMLAttributes<HTMLDivElement>`.

```tsx
<Skeleton height={18} count={4} />
```

**Notes.** With `count > 1` the component renders a `.kanso-skeleton__stack` wrapper and
the **last bar is forced to 62% width**, the way real text runs short — your `width` is
ignored on that bar. It animates opacity, not a background-position sweep, because a
virtualized grid can show fifty at once and a moving gradient repaints every one of them
every frame. Under `prefers-reduced-motion` the pulse stops at a flat 0.7 opacity. It is
`aria-hidden`, so announce loading state separately.

---

## 8. Runtime helpers

These are part of the public API, not internals. Import them from the package root.

### The ramp — `src/ramp.ts`

| Export | Signature / type | Returns |
| --- | --- | --- |
| `RAMP_STOPS` | `readonly [string, string, string, string, string]` | The classic hex stops, for swatches and docs: `#50ff50 #a3e635 #ffb700 #ff9830 #ff3030`. Literal, so it does **not** follow the theme — paint with `rampColor`/`rampGradient` instead |
| `RAMP_NAMES` | `readonly RampName[]` | `["nominal","caution","elevated","warning","critical"]` |
| `RampName` | type | `"nominal" \| "caution" \| "elevated" \| "warning" \| "critical"` |
| `rampColor` | `(value: number, invert = false) => string` | `color-mix(in srgb, var(--kanso-ramp-<a>) <p>%, var(--kanso-ramp-<b>))` between the two nearest stops |
| `rampStep` | `(value: number, invert = false) => RampName` | The snapped stop name — for text classes and discrete labels |
| `rampOverrange` | `(value: number, max = 1) => RampReading` | The magnitude split against its bound, so an overrange survives to the screen instead of being clamped away |
| `RampReading` | type | `{ frac, ratio, excess, over, step }` — `step` adds `"overrange"` above `critical` |
| `rampGradient` | `(direction = "90deg") => string` | A `linear-gradient(...)` across all five `var(--kanso-ramp-*)` stops at 0/25/50/75/100% |
| `HUE` | `Record<Hue, string>` | The eight semantic hues as `var(--kanso-color-*)` references: `primary info success warning danger accent magenta lime` |
| `Hue` | type | `keyof typeof HUE` |
| `resolveHue` | `(hue: Hue \| "ramp", value = 0) => string` | `HUE[hue]`, or `rampColor(value)` when `hue === "ramp"` |

Every paint value above is **CSS, not hex** — a `var()` reference or a `color-mix()` over
two of them, resolved by the browser against whichever theme is live. That is what lets
`data-kanso-theme="eva"` reach telemetry, and it carries one constraint: the string only
substitutes in a CSS context. In SVG it must go through `style`, never a presentation
attribute — `style={{ fill: … }}`, not `fill={…}`.

Reach for `rampColor` when you are painting something the components do not cover — an SVG
`fill`, a map marker. Reach for `rampStep` when you need a *word* or a class name rather
than a colour: `` `kanso-text-${rampStep(load)}` ``. Reach for `rampGradient` only if you
are hand-rolling a fill; every built-in meter already does the span-then-scale trick for
you. A canvas takes none of them — `getContext("2d")` has no cascade to resolve a custom
property against, so read the token off `getComputedStyle(el)` yourself.

```tsx
const load = 0.87;
<circle style={{ fill: rampColor(load) }} />
<span className={`kanso-value kanso-text-${rampStep(load)}`}>{(load * 100).toFixed(0)}%</span>
```

`invert` is for quantities where **low is bad** — signal strength, battery, free space:
`rampColor(battery, true)` paints a full battery green and an empty one red. Values are
clamped to 0..1 and non-finite input falls back to 0.

### Glyphs — `src/glyphs.ts`

| Export | Type | Contents |
| --- | --- | --- |
| `BOX` | `{ sharp, rounded, heavy, double }` | Each with `tl tr bl br h v tee teeUp teeLeft teeRight cross` |
| `BoxStyle` | type | `keyof typeof BOX` |
| `TREE` | `{ branch: "├─", last: "└─", pipe: "│ ", space: "  " }` | Process trees, folder trees, dependency lists |
| `BLOCK_V` | 9 strings | `"" ▁▂▃▄▅▆▇█` — vertical eighth-blocks, fills bottom-up |
| `BLOCK_H` | 9 strings | `"" ▏▎▍▌▋▊▉█` — horizontal eighth-blocks, fills left-to-right |
| `SHADE` | 4 strings | `░▒▓█` |
| `MARK` | object | `up down right left netUp netDown netBoth on off half square squareOpen ok fail warn ellipsis cursor prompt bullet` |

| Function | Signature | Returns |
| --- | --- | --- |
| `brailleGraph` | `(values, { width?, height?, max? }) => string[]` | `height` strings, **top row first**. `width` defaults to `ceil(values.length / 2)`, `height` to `2`, `max` to the series peak |
| `blockSparkline` | `(values, max?) => string` | One string, one character per sample |
| `blockBar` | `(fraction, width) => string` | A `width`-character bar with sub-character precision, space-padded to `width` |
| `boxTitle` | `(label, width, { style?, hotkey? }) => string` | `┌─ 1 ─ cpu ────────────┐` as a plain string |

These exist because a character-rendered chart survives being copy-pasted into a terminal,
a log file or a `<pre>`. Use them when the output has to be text — a CLI, an exported
report, a log line — and use `<BrailleGraph>` / `<Meter>` when it is going on screen.
`brailleGraph` resamples with nearest-neighbour rather than interpolating, because
interpolating telemetry invents data that was never measured.

```ts
const rows = brailleGraph(cpu, { width: 60, height: 4 });
log(`${boxTitle("cpu", 64, { hotkey: 1 })}\n${rows.join("\n")}`);
log(`mem [${blockBar(0.62, 20)}] 62%`);
log(`net ${blockSparkline(rx)}`);
```

**Emoji are banned in Kanso chrome** (KANSO.md, anti-patterns). `MARK` is the sanctioned
substitute — `MARK.ok`, `MARK.fail`, `MARK.up` — and it is already what `Readout`,
`Table`, `Terminal`, `Select` and `CommandPalette` draw with.

### Motion — `src/motion.ts`

| Export | Type | Value |
| --- | --- | --- |
| `EASE_MECHANICAL` | `readonly [number,number,number,number]` | `[0.83, 0, 0.17, 1]` — the default |
| `EASE_OUT` | same | `[0.16, 1, 0.3, 1]` |
| `EASE_IN` | same | `[0.7, 0, 0.84, 0]` |
| `DURATION` | object of ms numbers | `instant 60`, `tick 120`, `overlayEnter 140`, `overlayExit 90`, `panelEnter 160`, `panelExit 100`, `sweep 2000`, `blink 1000` |
| `PANEL_ENTER` / `PANEL_EXIT` | `{ duration, ease }` | Duration in **seconds** (0.16 / 0.1), ease as the raw cubic array |
| `OVERLAY_ENTER` / `OVERLAY_EXIT` | same | 0.14 / 0.09 |
| `ease` | `(curve) => string` | `"cubic-bezier(0.83, 0, 0.17, 1)"` |
| `transition` | `(properties: string[], duration = DURATION.tick, curve = EASE_MECHANICAL) => string` | A full CSS `transition` value |
| `prefersReducedMotion` | `() => boolean` | SSR-safe; `false` when there is no `window` |

The four `*_ENTER` / `*_EXIT` presets are shaped for Framer Motion and anime.js so a port
keeps one vocabulary — this is what replaces a project's local `motion.ts` wholesale. Note
they carry **seconds**, while `DURATION` carries **milliseconds**.

```tsx
<div style={{ transition: transition(["opacity", "transform"], DURATION.overlayEnter) }} />
{!prefersReducedMotion() && startSweep()}
```

`DURATION` does not expose `crawl` (1200) or `pulse` (1400) — reach for
`kanso.motion["duration-crawl"]` or the CSS custom property for those.

### Tokens — `src/tokens.ts`

`kanso` is the whole token tree as a typed `as const` object — 172 tokens across 12 groups:
`kanso.color.primary`, `kanso.motion["duration-tick"]`, `kanso.z.modal`. `Kanso` is its
type. `cssVar(group, name)` builds the custom-property reference — `cssVar("color",
"primary")` → `"var(--kanso-color-primary)"`.

`kanso` is **v1 (`classic`) only**, because it is a compile-time constant and a theme is a
runtime cascade. The per-theme override maps ship alongside it:

| Export | Type | What it is |
| --- | --- | --- |
| `kansoThemes` | `{ eva: { color: {...}, ramp: {...}, ... } }` | The override maps, group by group — only the tokens a theme re-declares. `classic` has no entry, because it *is* the base |
| `KansoThemeId` | type | `keyof typeof kansoThemes` — the override maps only, so `"eva"`. **Not** the same union as `ThemeId` below |
| `KANSO_THEMES` | `readonly ["classic", "eva"]` | Every selectable id, base included |

Use `kanso` wherever a class cannot reach: SVG `fill`, canvas, an inline `style` object, a
third-party chart config. Use `cssVar` when you want the value to stay live against the
cascade rather than being frozen at render — which under two themes is almost always what
you want. **Resolving a token to a literal in JS is how a component silently keeps the v1
palette under `data-kanso-theme="eva"`;** `kansoThemes` exists for swatches and theme
tooling, not as a lookup to paint with.

### Themes — `src/theme.ts`

Two design generations, one component set. `tokens/*.json` compiles to `:root` and **is**
v1; `tokens/themes/eva.json` compiles to one block behind a bare `[data-kanso-theme="eva"]`
attribute selector that re-declares 86 of the 172 tokens. Components never learn which theme
is live — they read `var(--kanso-*)` and the cascade does the rest. See KANSO.md §3.

| Export | Signature / type | Notes |
| --- | --- | --- |
| `ThemeId` | type | `"classic" \| "eva"` — `(typeof KANSO_THEMES)[number]` |
| `DEFAULT_THEME` | `ThemeId` | `"classic"`. The base palette, i.e. no override block and **no attribute** |
| `THEME_ATTR` | `string` | `"data-kanso-theme"` |
| `THEME_STORAGE_KEY` | `string` | `"kanso.theme"` |
| `THEMES` | `readonly ThemeInfo[]` | `classic` first, then one entry per override map in `kansoThemes`. The list to build a theme switcher from |
| `ThemeInfo` | type | `{ id: ThemeId; label: string; description: string }` |
| `isThemeId` | `(value: unknown) => value is ThemeId` | The guard for anything coming out of storage, a URL or a config file |
| `applyTheme` | `(theme: ThemeId, target?: Element \| null) => void` | Writes the attribute. Target defaults to `<html>`; no-ops when there is no `document` |
| `readTheme` | `(target?: Element \| null) => ThemeId` | The attribute, or `DEFAULT_THEME` when it is absent or unrecognised |
| `storedTheme` | `() => ThemeId` | Last stored choice, or the default |
| `storeTheme` | `(theme: ThemeId) => void` | Writes `localStorage` |
| `useKansoTheme` | `(options?: UseThemeOptions) => [ThemeId, (theme: ThemeId) => void]` | State plus the DOM write, as one hook |
| `UseThemeOptions` | type | `{ target?: Element \| null; persist?: boolean; initial?: ThemeId }` — `persist` defaults to `true`, `initial` wins over the stored value |

```tsx
const [theme, setTheme] = useKansoTheme();          // writes <html>, persists the choice
<Segmented value={theme} onChange={setTheme}
           options={THEMES.map((t) => ({ value: t.id, label: t.label }))} />
```

**`classic` is the absence of the attribute, not `="classic"`.** `applyTheme("classic")`
calls `removeAttribute`, so an app that never opts in has exactly the DOM it had before
themes existed — and adding `@kanso/ui@0.3.0` to an app that ignores this section changes
nothing it renders.

The default target is `<html>`, not the app root, because modals and toasts portal to
`document.body` and would otherwise keep the old palette. The selector is unqualified on
purpose: custom properties inherit, so setting the attribute on **any** element re-themes
that subtree. That is what lets one page show both generations side by side, and lets an app
theme a single panel without a second stylesheet.

`useKansoTheme` writes the attribute in an effect rather than during render, because a theme
swap is a document-level side effect and the first paint has to match the HTML for apps that
pre-set the attribute themselves. `storedTheme` / `storeTheme` swallow their exceptions, so
private mode and blocked storage degrade to a session-only choice rather than throwing.
Both are SSR-safe, as are `applyTheme` and `readTheme`.

**Only `classic`'s `ThemeInfo` currently carries prose.** `theme.ts` reads each other
theme's `label` and `description` from a `$meta` key, but `build-tokens.mjs` strips `$meta`
before emitting `kansoThemes` — so today `eva` resolves to `label: "EVA"` (the uppercased
id) and `description: ""`. A switcher built from `THEMES` renders correctly; one that prints
`description` renders one blank line. Do not hardcode the strings in the app — the fix is
either to emit `$meta` or to drop the field.

---

## 9. Utility classes

The classes below are meant to be used directly, by React and vanilla consumers alike.
They are stable public API. Everything is in `src/base/*.css` except the drag pair, which
lives in `Bars.css`.

### Root

| Class | What it does |
| --- | --- |
| `.kanso-root` | **Mandatory ancestor.** Black background, mono face, `box-sizing`, `border-radius: 0`, focus rings, scrollbars, `user-select: none` on chrome |
| `.kanso-selectable` | Re-enables text selection inside the chrome (inputs and `[contenteditable]` already have it) |

### Shapes — pick one per element, never nest two

| Class | Shape |
| --- | --- |
| `.kanso-cut` | TL + BR chamfer, 6px — buttons, chips, tickets |
| `.kanso-cut-sm` / `.kanso-cut-lg` | Same, 5px / 9px |
| `.kanso-cut-tr` | TR chamfer only — labels, inputs, stat tiles |
| `.kanso-cut-bl` | BL chamfer only — footers, stamps |
| `.kanso-notch` | TL + BR, 12px — HUD panels docked **left** |
| `.kanso-notch-tr` | TR + BL, 12px — HUD panels docked **right** |
| `.kanso-shear` | Parallelogram, 5px — action tabs, view switchers |
| `.kanso-hazard-fill` | The diagonal caution barber-pole as a background, for any surface |
| `.kanso-grid-backdrop` | Faint survey grid. Absolute child of a `position: relative` parent; takes `currentColor` |

Notch direction encodes anchoring: a panel notches *away* from the edge it hugs.

### Text roles

| Class | What it does |
| --- | --- |
| `.kanso-title` | Display serif, 900, uppercase, `tracking-label`, compressed `scaleX(0.82)` |
| `.kanso-stamp` | Bebas, uppercase, `tracking-stamp` |
| `.kanso-label` | Mono, 10px, uppercase, `tracking-stamp`, `muted` |
| `.kanso-label--accent` | Same, in `primary` |
| `.kanso-value` | Mono, tabular figures, **ligatures off**, `text` |
| `.kanso-jp` | Mincho, `tracking-wider` |

`.kanso-value` disables ligatures deliberately: JetBrains Mono ships coding ligatures on,
which turns `!=`, `->` and `>=` in a readout into single glyphs.

### Phosphor — one class per node, never two

`.kanso-phosphor-orange`, `-amber`, `-lime`, `-violet`, `-cyan`, `-green`, `-red` each set
a colour plus one 4px 30% shadow. `.kanso-phosphor-dim` sets `text-dim` with **no** shadow.
Stacking two reads as bloom, which the system rejects. Use `-violet` (`#c4b5fd`) whenever
the accent violet has to carry words — `accent` itself is 3.7:1 and is a surface colour
only.

### Text state

`.kanso-text-dim`, `.kanso-text-muted`, and the ramp set `.kanso-text-nominal`,
`-caution`, `-elevated`, `-warning`, `-critical`. Pair them with `rampStep()` to colour a
number by its own magnitude.

**`--kanso-color-text-faint` is not part of that scale and has no class.** It is `#6a6a65`
in classic and `#6e6961` in eva, both below the AA floor, and it is **decorative-only**: it
exists for `DataTexture`'s field of real application data and nothing else. It is excluded
from `check-contrast.mjs`'s text tier by declaration, so nothing will catch a misuse, and
anything painted with it must be `aria-hidden`. It is a token rather than `muted` behind an
`opacity` multiplier because an opacity fudge makes the delivered ratio unmeasurable, which
is the exact failure this system is built to avoid — a *declared* out-of-spec colour can at
least be found by grep. Promoting it to a caption is a bug. `muted` (4.60:1) remains the
floor for anything a user is expected to read.

### Surfaces

| Class | What it is |
| --- | --- |
| `.kanso-surface` | Flat opaque panel — **the default** |
| `.kanso-surface-raised` | Inputs, list rows, table heads |
| `.kanso-surface-well` | Recessed bed for graphs, meters, code |
| `.kanso-surface-checker` | Alpha-transparency bed under an image that may have transparency. Direct children get `position: relative; z-index: 1` unless they carry `.kanso-abs` |
| `.kanso-glass` | Floating HUD chrome **over live content only** |
| `.kanso-glass--heavy` | Same, at 85% black |

Glass costs a `backdrop-filter`, the most expensive thing in the system. Over a flat
background it is an expensive way to draw a rectangle.

### Bevel fills — the one sanctioned gradient

`.kanso-fill-amber`, `-lime`, `-cyan`, `-green`, `-red`, `-violet`: a 3-stop vertical
gradient, inset top highlight and bottom dark edge, one tight halo, dark ink text, and
brightness-only hover. `.kanso-fill-dim` is their idle counterpart. They are for *selected*
ticket tabs and primary confirmations — the EVA layer, not general buttons.

### Accent rules

`.kanso-rule-primary`, `-danger`, `-info`, `-success`, `-accent` — a 2px coloured top
border declaring a surface's role. Orange is command, red destructive, cyan informational,
green nominal, violet system chrome.

### Scroll

| Class | What it does |
| --- | --- |
| `.kanso-scroll-thin` | 3px rail — panel bodies, overlay scroll regions |
| `.kanso-scroll-hidden` | No rail at all — filmstrips, tab bars |

### Motion and accessibility

| Class | What it does |
| --- | --- |
| `.kanso-anim-blink` | 1000ms step-end opacity blink |
| `.kanso-anim-pulse` | 1400ms ease-in-out opacity pulse |
| `.kanso-anim-sweep` | 2000ms linear `translateY(-100% → 100%)`. Put it on an absolutely-positioned child of a `position: relative; overflow: hidden` parent |
| `.kanso-reduce-motion` | App-level motion opt-out, alongside the OS query. Set both from one setting |
| `.kanso-no-blur` | Kills every `backdrop-filter` in the subtree, for low-end hardware |
| `.kanso-sr-only` | Visually hidden, still announced |
| `.kanso-drag` / `.kanso-no-drag` | Electron frameless-window drag regions |

Shared keyframes you can reference by name: `kanso-blink`, `kanso-cursor`, `kanso-pulse`,
`kanso-sweep`, `kanso-crt-scroll`, `kanso-spin`.

---

## 10. Patterns

### 10.1 A telemetry panel

The default arrangement: a Panel declaring its role, a row of Readouts, meters beneath.

```tsx
<Panel title="MAGI // CORE STATUS" meta="3 UNITS" accent="primary" notch="left"
       actions={<LED state="ok" label="LINK" />}>
  <div className="row">
    <Readout label="UPTIME" value="412:09:55" />
    <Readout label="SYNC RATIO" value="41.3" unit="%" delta={2.1} state="nominal" />
    <Readout label="LATENCY" value="128" unit="ms" delta={14} deltaUnit="ms"
             deltaInverted state="warning" />
  </div>

  <Divider label="LOAD" color="info" />

  <Meter label="CPU"   value={cpu} />
  <Meter label="MEM"   value={mem} />
  <Meter label="THERM" value={therm} />

  <Sparkline values={history} height={48} />
</Panel>
```

`accent` and `notch` are doing real work here: orange says "command surface", `left` says
"this panel is docked to the left edge". Both are readable from a screenshot.

### 10.2 A process table with in-cell meters

`Sparkline` and `Meter` both render inside a `render` callback. Note `fluid={false}` on the
sparkline — a fluid trace will eat the column.

```tsx
<Panel title="PROCESSES" meta={`${rows.length} LIVE`} flush>
  <Table<Proc>
    dense
    caption="Running processes"
    rows={rows}
    rowKey={(r) => String(r.pid)}
    selectedKey={selected}
    onSelect={(r) => setSelected(String(r.pid))}
    sort={sort}
    onSortChange={(key) => setSort((s) =>
      s.key === key ? { key, direction: s.direction === "asc" ? "desc" : "asc" }
                    : { key, direction: "desc" })}
    columns={[
      { key: "pid",  header: "PID", align: "right", width: 70 },
      { key: "name", header: "COMMAND" },
      { key: "user", header: "USER", width: 90 },
      { key: "cpu",  header: "CPU%", align: "right", width: 120,
        render: (r) => <Meter value={r.cpu} size="sm" /> },
      { key: "trend", header: "60s", width: 100,
        render: (r) => <Sparkline values={r.history} height={16} width={90}
                                  fluid={false} fill={false} /> },
      { key: "mem",  header: "MEM", align: "right", width: 80,
        render: (r) => `${r.mem.toFixed(1)} GB` },
    ]}
  />
</Panel>
```

`flush` on the Panel removes the body padding so the table owns its own gutters. Sorting is
yours to implement — `onSortChange` hands you a key and nothing more.

### 10.3 A form with validation

The field scaffold wires ids for you; your job is to decide when `error` is set. `hint` is
suppressed while `error` is present, so you can pass both.

```tsx
const [host, setHost] = useState("");
const [mode, setMode] = useState("auto");
const touched = useRef(false);
const hostError = touched.current && !host.trim() ? "HOSTNAME REQUIRED" : undefined;

<form onSubmit={submit}>
  <Input label="TARGET HOST" block required
         value={host}
         onChange={(e) => { touched.current = true; setHost(e.target.value); }}
         placeholder="nerv-tokyo-3"
         prefix="//"
         hint="FQDN or IP"
         error={hostError} />

  <Select label="ESCALATION MODE" block value={mode}
          onChange={(e) => setMode(e.target.value)}
          options={[
            { value: "auto",   label: "AUTOMATIC" },
            { value: "manual", label: "OPERATOR CONFIRM" },
          ]} />

  <Slider label="SCAN INTERVAL" block showValue unit="ms"
          min={50} max={2000} step={50} ticks={5}
          value={interval} onChange={(e) => setInterval(+e.target.value)} />

  <Checkbox label="AUTO-ESCALATE"
            description="Raise to level 2 without confirmation"
            checked={escalate} onChange={(e) => setEscalate(e.target.checked)} />

  <Textarea label="OPERATOR NOTE" block rows={3} />

  <div className="row">
    <Button variant="ghost" type="reset">RESET</Button>
    <Button type="submit" disabled={Boolean(hostError)}>ARM</Button>
  </div>
</form>
```

`Button` defaults to `type="button"`, so the submit button must say so explicitly.

### 10.4 An app shell

`CRT` once at the root, a sticky `TopBar`, a fixed `StatusBar`, and one hazard pair marking
the outer boundary.

```tsx
<div className="kanso-root app">
  <CRT speed={0} />
  <HazardStripe edge="top" />

  <TopBar sticky draggable
    left={<Brand name="NERV" sub="MAGI CONSOLE" jp="магі" version="v2.4.0" />}
    center={<Segmented<View> label="View" value={view} onChange={setView}
              options={[{ value: "graph", label: "GRAPH" },
                        { value: "table", label: "TABLE" }]} />}
    right={<>
      <IconButton label="Command palette" onClick={() => setPalette(true)}>⌘</IconButton>
      <LED state={link} label="LINK" />
    </>} />

  <main>{view === "graph" ? <GraphView /> : <TableView />}</main>

  <StatusBar fixed cells={[
    { label: "HOST",  value: "nerv-tokyo-3" },
    { label: "LOAD",  value: load.toFixed(2), state: rampStep(load / 4) },
    { label: "THERM", value: `${therm}°C`, state: "warning" },
    { label: "ALERT", value: "LEVEL 2", state: "critical", spacer: true },
  ]} />

  <CommandPalette open={palette} onClose={() => setPalette(false)} commands={commands} />
</div>
```

`rampStep()` in the StatusBar cell is the pattern for making a value colour itself — the
same ramp the meters use, so the strip and the graphs agree.

### 10.5 A confirm-destructive-action dialog

Red rules everywhere, the destructive button last, and the outcome announced through the
toast bus rather than by leaving the dialog open.

```tsx
const { toast } = useToast();

<Modal open={confirming} onClose={() => setConfirming(false)} size="sm"
       title="PURGE SECTOR 07"
       subtitle="This cannot be undone"
       footer={<>
         <Button variant="ghost" onClick={() => setConfirming(false)}>ABORT</Button>
         <Button variant="danger" onClick={async () => {
           setConfirming(false);
           await purge();
           toast({ level: "danger", title: "SECTOR 07 PURGED",
                   message: "1,284 records destroyed" });
         }}>PURGE</Button>
       </>}>
  <Alert level="warning" title="4.2 GB WILL BE DESTROYED">
    Cached media and 1,284 index records for sector 07.
  </Alert>
  <DataList items={[
    { label: "RECORDS", value: "1,284" },
    { label: "MEDIA",   value: "4.2 GB", state: "warning" },
    { label: "BACKUP",  value: "NONE", state: "critical" },
  ]} />
</Modal>
```

The Modal already traps focus, locks scroll and closes on Escape. It focuses the *first*
focusable node in the panel, which here is the Alert's dismiss control if you give it one
— omit `onDismiss` on a banner inside a dialog so focus lands on ABORT instead.

### 10.6 A right-click command surface

`useContextMenu` holds the position and open state; `Menu` renders it. The same commands
usually belong in the palette too.

```tsx
const ctx = useContextMenu();

<div onContextMenu={ctx.onContextMenu}>
  <CoreGrid cores={cores} columns={8} size="sm" />
</div>

<Menu {...ctx.menuProps} label="Core actions" items={[
  { key: "pin",    label: "PIN CORE",     icon: MARK.square, onSelect: pin },
  { key: "trace",  label: "ATTACH TRACE", shortcut: "⌘T",    onSelect: trace },
  { key: "sep",    separator: true },
  { key: "offline", label: "TAKE OFFLINE", danger: true, disabled: !operator,
    onSelect: offline },
]} />
```

`shortcut` is decoration — bind the real key yourself, and register the same action in
`CommandPalette` so it is reachable without the mouse.
