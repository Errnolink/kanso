# Adopting Kanso — 導入

How the five existing Errnolink projects map onto `@kanso/ui`. This is a plan, not a
migration: nothing outside this repository has been touched.

[KANSO.md](./KANSO.md) is the spec. Where a project disagrees with it, §3 of this
document says which side loses.

---

## 1. The projects

| Project | Stack | Current styling | Distance | Effort | What adoption buys |
| --- | --- | --- | --- | --- | --- |
| **Seele** | Electron + React + TS, Tailwind v4 | `@theme` block in `src/renderer/theme.css` (23 colours, 3 families, 5 animations) + ~340 lines of hand-written global CSS in `index.css` + a local `motion.ts` | **Zero.** Kanso was distilled *from* this. Every phosphor class, every bevel fill, every clip-path polygon already matches byte-for-byte | **L** | Deletes ~300 lines of `index.css` and all of `motion.ts`. Collapses ten distinct oranges to four tokens. Gets `Table`, `Meter`, `Gauge`, `Readout`, `DataList`, `CommandPalette`, `Menu` — all currently hand-rolled or absent. Fixes a live bug: `EvaSegmented` accepts `accent="purple"` but `.eva-fill-purple` does not exist; `.kanso-fill-violet` does |
| **NERV Style AQI** | Vanilla HTML/CSS/JS + MapLibre | 8 `@import`ed CSS files, own `--or`/`--st`/`--cy` token set, no build step | **Close in value, far in name.** 20 of 30 tokens are exact Kanso values under different names | **M** | Focus rings — it currently has **none**, on a keyboard-driven console with a command terminal. Collapses a duplicate legacy palette (`#FF8A00`/`#00E5FF`/`#FF2A2A`) onto tokens. Kills the dead `:.logo` selector that silently disables the only use of `--compress` in the project. It is also the one legitimate `.kanso-glass` consumer in the portfolio — real live content behind every panel |
| **app-launcher** | Vanilla HTML/CSS/JS | `style.css` hand-copies Kanso's values into a private `:root` block | **Zero, by transcription.** 16 of 22 properties are exact Kanso values | **S** | Stops the drift that has already started (`#050506` vs `well #050505`, `--notch` naming inverted, focus ring orange instead of cyan). This is a pure delete: remove the `:root` block, add one `<link>` |
| **cadence-planner** | React + Tailwind v3 + Supabase | A second, complete design system: `--cad-*` tokens, two themes, a nine-effect registry, contrast-verified text tiers, `data-density` scale. Tailwind does layout only — 274 inline `style={{}}`, 0 `rounded-*`, 1 Tailwind palette colour (dead) | **Zero visually, large mechanically** | **L** | **Nothing. Do not adopt.** See §6.5 |
| **omp-theme-lab** | Vanilla, single 784-line `index.html` | One inline `<style>`, nine tokens, no accent token, Segoe UI, 3–10px radii everywhere | **Far, and correctly so** | S | **Nothing. Do not adopt.** Its chrome is a neutral frame around a live preview of *someone else's* colour theme. Painting it orange-on-black biases every judgement made inside it. See §6.6 |

Three adopt. Two don't. The two that don't are not failures — one is a peer system worth
harvesting, the other has a principled reason to stay neutral.

---

## 2. Token mapping

### 2.1 NERV Style AQI — custom properties

`css/tokens.css` → `dist/tokens.css`. Exhaustive.

| Old | Value | Kanso | Match |
| --- | --- | --- | --- |
| `--or` | `#FF9830` | `--kanso-color-primary` | exact |
| `--or-dim` | `#8A4A00` | `--kanso-color-primary-**deep**` | exact value, **name inverts** — see §3.1 |
| `--gr` | `#50FF50` | `--kanso-color-success` / `--kanso-ramp-nominal` | exact |
| `--gr-dim` | `#184D18` | `--kanso-color-success-**deep**` | exact value, name inverts |
| `--cy` | `#20F0FF` | `--kanso-color-info` | exact |
| `--cy-dim` | `#005A66` | `--kanso-color-info-**deep**` | exact value, name inverts |
| `--rd` | `#FF3030` | `--kanso-color-danger` / `--kanso-ramp-critical` | exact |
| `--rd-dim` | `#660000` | `--kanso-color-danger-**deep**` | exact value, name inverts |
| `--pu` | `#B020FF` | `--kanso-color-hazard` | exact |
| `--pu-dim` | `#3A005A` | — | **gap**, propose `hazard-deep` |
| `--bg` | `#0A0A0C` | `--kanso-color-panel` | value is Kanso's *panel*, used as the page — §3.2 |
| `--panel` | `#0D0D0D` | `--kanso-color-panel` `#0a0a0c` | near, take Kanso's |
| `--dim` | `#111116` | `--kanso-color-panel-2` `#121214` | near, bluer; take Kanso's |
| `--border` | `#222228` | `--kanso-color-border` `#1f1f23` | near, take Kanso's |
| `--mid` | `#555566` | `--kanso-color-muted` `#767670` | near, bluer; take Kanso's |
| `--st` | `#D8D8D0` | `--kanso-color-text` `#e8e8e4` | near, take Kanso's |
| `--mono` | IBM Plex Mono | `--kanso-type-mono` (JetBrains) | **divergence** — §3.3 |
| `--stamp` | Bebas Neue | `--kanso-type-stamp` | exact |
| `--compress` | `scaleX(0.82)` | `--kanso-type-compress` | exact (currently dead — the only consumer is inside the broken `:.logo` rule) |
| `--ac` | runtime alias | — | **gap**, propose `--kanso-color-active` — §5.6 |
| `--glass-bg` | `rgba(10,10,12,0.72)` | `--kanso-glass-bg` | exact |
| `--glass-border` | `rgba(255,255,255,0.06)` | `--kanso-glass-border` | exact |
| `--glass-blur` | `18px` | `--kanso-glass-blur` | exact |
| `--glass-shadow` | `0 8px 32px rgba(0,0,0,0.65)` | `--kanso-shadow-float` | exact |
| `--notch` | `12px` | `--kanso-shape-notch` | exact |
| `--notch-sm` | `8px` | `--kanso-shape-notch-sm` | exact |
| `--hud-gap` | `12px` | `--kanso-spacing-gutter` | exact |
| `--terminal-height` | `150px` | — | app layout, keep local |
| `--topbar-height` | `54px` | — | app layout, keep local |
| `--z-map` | `0` | `--kanso-z-base` | exact |
| `--z-hud` | `100` | `--kanso-z-hud` | exact |
| `--z-terminal` | `200` | `--kanso-z-dock` | exact |
| `--z-overlay` | `9999` | `--kanso-z-overlay` `9998` | near; `9999` is Kanso's `z-grain` |

Legacy triple, hardcoded across `css/*.css` and `src/ui/chart.js`, with no token behind it:

| Legacy | → |
| --- | --- |
| `#FF8A00` (`.vbw:hover .vbar`, `.log-e.cur`, chart TGT marks, threshold band) | `--kanso-color-primary` |
| `#00E5FF` (`.vbw.act .vbar`, `src/map/marker.js:33`, chart fallback) | `--kanso-color-info` |
| `#FF2A2A` (`pulse-a`, `.pd-who-ex`, `#err-box`, WHO line) | `--kanso-color-danger` |

### 2.2 NERV Style AQI — classes

| Old | Kanso |
| --- | --- |
| `.nerv-panel` | `<Panel glass notch="right" accent="primary">` / `.kanso-panel .kanso-glass .kanso-notch-tr .kanso-rule-primary` |
| `.nerv-panel--tl` | `.kanso-notch` (left-anchored — this is what `#hud-left` should have been using) |
| `.nerv-panel::after` | built in; `.kanso-panel::after` is the same `inset:1px` / `rgba(255,255,255,0.04)` hairline |
| `.phdr` | `.kanso-panel__header` + `.kanso-panel__title` |
| `.phdr-rd` | `.kanso-panel__header--danger` + `.kanso-rule-danger` |
| `.pscroll` | `<Panel scroll>` / `.kanso-panel__body--scroll .kanso-scroll-thin` |
| `.psec` / `.plbl` / `.pval` | `<DataList items>` / `.kanso-datalist__row` / `__label` / `__value` |
| `.btn-clear` | `<Button variant="danger" size="sm">` (its hover is red, not orange — `ghost` is wrong) |
| `.scan-line-overlay` | `<Scanlines />` / `.kanso-scanlines` |
| `body::before` (vignette) | `<Vignette />` / `.kanso-vignette` — identical gradient |
| `.hazard-border-top` / `-bot` | `<HazardStripe edge="top" />` / `edge="bottom" offset={…}` |
| `#topbar` | `<TopBar glass sticky>` / `.kanso-topbar--glass .kanso-topbar--sticky` |
| `.topbar-brand` / `.logo` / `.logo-sub` / `.logo-ver` | `<Brand name sub version>` / `.kanso-brand__name` / `__sub` / `__version` |
| `.sep` | `.kanso-topbar__slot--right` |
| `.topbar-alert-strip` | `.kanso-surface-raised` wrapper |
| `.alert-led` / `.warn` / `.crit` | `<LED state="ok"\|"warn"\|"crit" blink>` |
| `.alert-text` | `.kanso-led__label` |
| `.clock` | `.kanso-stamp .kanso-phosphor-cyan` |
| `.top-sys` | `<StatusBar cells>` / `.kanso-statusbar__cell` |
| `#terminal` | `<Terminal lines follow cursor>` inside a docked `.kanso-glass` |
| `.terminal-header` | `.kanso-terminal__title` |
| `.term-tab` / `.term-tab.active` | `<Chip variant="term" active>` — the literal lineage; see §5.14 |
| `.terminal-status` | `<LED state="ok" label="ONLINE">` |
| `.terminal-output` / `.terminal-line` | `.kanso-terminal__body` / `__line` |
| `--info` / `--warn` / `--error` / `--system` | `.kanso-terminal__line--info\|--warn\|--error\|--system` — the same four levels, same colours |
| `.terminal-line .timestamp` | `.kanso-terminal__ts` (currently dead — JS inlines the timestamp into `textContent`) |
| `.terminal-prompt` | `.kanso-terminal__prompt` |
| `.terminal-inp` | `<Input block>` / `.kanso-input__control` |
| `.wtab` / `.wtab.on` | `<Chip variant="tab" active>` — 8px notch, same geometry |
| `.wwtab` / `.wwtab.on` | same `<Chip variant="tab">`; also fixes the inconsistency where `.wwtab` has no clip-path |
| `.wave-dock` | `<Panel>` body over `.kanso-surface-well` |
| `#wave-svg` / `#weather-wave-svg` | **no equivalent** — §5.1 |
| `.aqi-num` | `.kanso-stamp .kanso-phosphor-orange`, or `<Gauge value unit>` |
| `.aqi-status` / `.aqi-cat` / `.aqi-stamp` | `<Readout label value state>` |
| `.sev-wrap` / `.sev-row` / `.sev-blk` | `<Meter segments={5} color="ramp">` / `.kanso-meter__segments` / `__cell` |
| `.weather-grid` / `.weather-item` | grid of `<Readout>` |
| `.weather-val` / `.weather-lbl` | `.kanso-readout__value` / `__label` |
| `.vbars-row` / `.vbw` / `.vbar` / `.vbf` | **no equivalent** — `BarChart` is horizontal — §5.2 |
| `.vb-n` / `.vb-v` / `.vb-u` | `.kanso-barchart__label` / `__value` |
| `.pol-detail` / `.pd-row` / `.pd-lbl` / `.pd-val` | `<Panel>` + `<DataList>` |
| `.pd-who-ok` / `.pd-who-ex` | `.kanso-text-nominal` / `.kanso-text-critical` |
| `.log-e` / `.log-e.cur` | `<Table selectable>` / `.kanso-table__row--selected` |
| `.log-ts` / `.log-nm` / `.log-aql` / `.log-aqv` | `.kanso-label` / `.kanso-value` |
| `.led` / `.led-gr` / `.led-or` / `.led-rd` | `<LED>` — but these are **dead**: `status-bar.js` targets `$('led')`, which does not exist in the markup. Delete |
| `#err-box` | `<Toast level="danger">` or `<Alert level="danger">` |
| `.hud-center-card` / `.hcc-label` / `.hcc-coords` | `<Panel glass accent="info">` / `.kanso-stamp` / `.kanso-value` |
| `.hcc-connector` | keep local |
| `.nerv-marker*` / `.nerv-popup*` | **no equivalent** — §5.8 |
| `#mobile-tabs` / `.mtab` / `.mtab.act` | `<Segmented block>` |
| `@keyframes crt-scroll` | `kanso-crt-scroll` |
| `@keyframes blink` | `kanso-blink` / `.kanso-anim-blink` |
| `@keyframes ring-pulse` | none — §5.8 |
| `@keyframes pulse-a` | `.kanso-anim-pulse` — but it animates `box-shadow`, which §8 forbids. §3.7 |
| `@keyframes flicker` | defined, never applied. Delete |

### 2.3 app-launcher — custom properties

`style.css` `:root` → `dist/tokens.css`. Exhaustive.

| Old | Value | Kanso | Match |
| --- | --- | --- | --- |
| `--bg` | `#000000` | `--kanso-color-bg` | exact |
| `--panel` | `#0a0a0c` | `--kanso-color-panel` | exact |
| `--panel-2` | `#121214` | `--kanso-color-panel-2` | exact |
| `--border` | `#1f1f23` | `--kanso-color-border` | exact |
| `--border-hi` | `#2e2e34` | `--kanso-color-border-highlight` | exact |
| `--text` | `#e8e8e4` | `--kanso-color-text` | exact |
| `--text-dim` | `#8a8a85` | `--kanso-color-text-dim` | exact |
| `--muted` | `#6a6a65` | `--kanso-color-muted` `#767670` | **was** exact; Kanso lightened it to clear AA (§3.12) |
| `--primary` | `#ff9830` | `--kanso-color-primary` | exact |
| `--primary-hot` | `#ffcc50` | `--kanso-color-primary-hot` | exact |
| `--primary-dim` | `#c87020` | `--kanso-color-primary-dim` | exact |
| `--glow-primary` | `0 0 12px rgba(255,152,48,0.25)` | `--kanso-shadow-glow-primary` | exact |
| `--success` | `#50ff50` | `--kanso-color-success` | exact |
| `--warning` | `#ffb700` | `--kanso-color-warning` | exact |
| `--danger` | `#ff3030` | `--kanso-color-danger` | exact |
| `--info` | `#20f0ff` | `--kanso-color-info` | exact (declared, never used — it becomes the focus ring, §3.4) |
| `--mono` | JetBrains stack | `--kanso-type-mono` | exact string |
| `--stamp` | Bebas stack | `--kanso-type-stamp` | exact string |
| `--ease` | `cubic-bezier(0.83,0,0.17,1)` | `--kanso-motion-ease-mechanical` | exact |
| `--dur` | `140ms` | `--kanso-motion-duration-overlay-enter` | exact value, wrong role — §3.8 |
| `--notch` | 5px TL+BR polygon | `.kanso-cut-sm` (5px) | exact geometry, **name inverted** — §3.6 |
| `--notch-sm` | 8px TL+BR polygon | `--kanso-shape-notch-sm` (8px) / `.kanso-chip` clip | exact geometry, name inverted |
| `#050506` (`.log-wrap`) | — | `--kanso-color-well` `#050505` | 1 step off; take Kanso's |
| `#b8b8b2` (`.log`) | — | none | **gap** — §5.11 |

### 2.4 app-launcher — classes

| Old | Kanso |
| --- | --- |
| `.scanlines` | `<Scanlines />` / `.kanso-scanlines` — identical 2px/4px period at 6% |
| `.vignette` | `<Vignette />` / `.kanso-vignette` — identical gradient |
| `header` | `<TopBar sticky>` / `.kanso-topbar` |
| `.brand` / `h1` / `.slash` / `.sub` | `<Brand name sub>` / `.kanso-brand__name` / `__sub`. The `//` prefix is `Brand`'s built-in idiom |
| `.actions` | `.kanso-topbar__slot--right` |
| `.btn` | `<Button>` / `.kanso-btn .kanso-cut` |
| `.btn.primary` | `<Button variant="primary">` |
| `.btn.secondary` | `<Button variant="secondary">` |
| `.btn.ghost` | `<Button variant="ghost">` |
| `.btn.danger` | `<Button variant="danger">` |
| `.btn.sm` | `size="sm"` / `.kanso-btn--sm` |
| `.banner` | `<Alert level="danger">` / `.kanso-alert--danger` |
| `.hidden` | keep local — app state, not design |
| `.card` | `<Panel accent="primary">` / `.kanso-surface`. Cards have no accent rule today; adding one is a straight upgrade |
| `.card-head` | `.kanso-panel__header` |
| `.identity h2` | `.kanso-stamp` |
| `.cmd` | `.kanso-surface-raised .kanso-value` |
| `.cwd` | `.kanso-label` |
| `.card-actions` | `.kanso-panel__actions` |
| `.badge` | `<Badge>` / `.kanso-badge` — same 5px `cut-sm` clip, same black ink |
| `.badge.operational` | `<Badge variant="success">` |
| `.badge.booting` / `.badge.shutdown` | `<Badge variant="warning">` |
| `.badge.standby` | **no equivalent** — outlined/idle variant missing — §5.10 |
| `.log-toggle` | `<Chip variant="term">` — exact match at 9px mono / 2px tracking / uppercase |
| `.log-wrap` | `.kanso-surface-well` |
| `.log` | `<Terminal>` / `.kanso-terminal__body` |
| `.log .log-head` | `.kanso-terminal__line--system` (dead selector — `app.js` never emits it. Delete) |
| `.overlay` | `.kanso-modal__scrim` — theirs is `0.8`, `--kanso-color-scrim` is `0.72`. §3.9 |
| `.modal` | `<Modal size="sm">` / `.kanso-modal__panel--sm` |
| `.modal h2` | `.kanso-modal__title` |
| `.modal label` | `.kanso-field__label` |
| `.modal input` | `<Input label hint>` / `.kanso-input__control` |
| `.modal select` | `<Select options>` / `.kanso-select__control` |
| `.modal select` chevron gradients | `.kanso-select__arrow` — delete the two-gradient hack |
| `.modal input:focus` (orange 1px) | `.kanso-root :focus-visible` (cyan) — §3.4, must change |
| `.modal-actions` | `.kanso-modal__footer` |

Note for whoever does this: `app.js` builds class strings in JS (`btn sm primary toggle`,
`badge ${cls}` from `STATE_META`, and `setStateUi` rewriting `className` wholesale). The
CSS rename and the `app.js` rename have to land in the same commit.

### 2.5 Seele — `theme.css`

Every `--color-nerv-*` maps. Twenty-one of twenty-three are exact.

| Old | Kanso | Match |
| --- | --- | --- |
| `--color-nerv-bg` | `--kanso-color-bg` | exact |
| `--color-nerv-panel` | `--kanso-color-panel` | exact |
| `--color-nerv-panel-2` | `--kanso-color-panel-2` | exact |
| `--color-nerv-panel-hi` `#17171c` | `--kanso-color-panel-3` `#17171b` | 1 off in blue; take Kanso's |
| `--color-nerv-border` | `--kanso-color-border` | exact |
| `--color-nerv-border-highlight` | `--kanso-color-border-highlight` | exact |
| `--color-nerv-orange` | `--kanso-color-primary` | exact |
| `--color-nerv-orange-hot` | `--kanso-color-primary-hot` | exact |
| `--color-nerv-orange-dim` | `--kanso-color-primary-dim` | exact |
| `--color-nerv-orange-glow` | `--kanso-color-primary-glow` | exact |
| `--color-nerv-green` | `--kanso-color-success` / `--kanso-ramp-nominal` | exact |
| `--color-nerv-green-dim` | `--kanso-color-success-dim` | exact |
| `--color-nerv-cyan` | `--kanso-color-info` | exact |
| `--color-nerv-cyan-dim` | `--kanso-color-info-dim` | exact |
| `--color-nerv-red` | `--kanso-color-danger` / `--kanso-ramp-critical` | exact |
| `--color-nerv-amber` | `--kanso-color-warning` / `--kanso-ramp-elevated` | exact |
| `--color-nerv-purple` | `--kanso-color-accent` | exact |
| `--color-nerv-magenta` | `--kanso-color-magenta` | exact |
| `--color-nerv-lime` | `--kanso-color-lime` / `--kanso-ramp-caution` | exact |
| `--color-nerv-text` | `--kanso-color-text` | exact |
| `--color-nerv-text-dim` | `--kanso-color-text-dim` | exact |
| `--color-nerv-muted` | `--kanso-color-muted` | exact (both already lightened from `#565650`) |
| `--font-display` | `--kanso-type-display` | exact |
| `--font-mono` | `--kanso-type-mono` | Kanso adds Cascadia/Consolas fallbacks |
| `--font-jp` | `--kanso-type-jp` | exact; **dead in Seele** — zero usages, yet `index.html` fetches Shippori Mincho B1 at three weights |
| `--animate-pulse-soft` / `--animate-pulse` | `.kanso-anim-pulse` / `@keyframes kanso-pulse` | exact (1 → 0.55) |
| `--animate-scanline` | `@keyframes kanso-sweep` | exact translateY(-100% → 100%) |
| `--animate-boot-glitch` / `matrix-glitch` | none | **gap** — §5.13 |
| `--animate-fade-in` | none | minor gap; Kanso fades inside components |
| `@keyframes shimmer-pulse` | `<Skeleton>` / `.kanso-skeleton` | |
| `@keyframes cursor-blink` | `@keyframes kanso-cursor` | exact, both `0,50%→1 / 50.01%,100%→0` |

### 2.6 Seele — `index.css`

| Old | Kanso | Note |
| --- | --- | --- |
| `.phosphor-orange` … `.phosphor-green` | `.kanso-phosphor-orange` … `-green` | all six exact — same hex, same `0 0 4px … 0.3` shadow |
| `.phosphor-dim` `#8a7a68` | `.kanso-phosphor-dim` (`text-dim #8a8a85`) | **divergence** — Seele's is warm. §3.10 |
| `.eva-title` | `.kanso-title` | exact |
| `.eva-cut` (6px TL+BR) | `.kanso-cut` | exact |
| `.eva-cut-tr` (6px TR) | `.kanso-cut-tr` | exact |
| `.eva-shear` (5px) | `.kanso-shear` | exact |
| `.tag-chip` (5px TL+BR) | `.kanso-cut-sm` | exact |
| `.eva-ticket` (**9px TR+BL**) | none — `cut-lg` is 9px TL+BR, `notch-tr` is 12px TR+BL | **divergence** — §3.5 |
| `.eva-fill-amber` / `-lime` / `-cyan` / `-green` / `-red` | `.kanso-fill-*` | exact, all twenty gradient stops |
| *(missing)* `.eva-fill-purple` | `.kanso-fill-violet` | Kanso fixes a live Seele bug (`EvaSegmented.tsx:58`) |
| `.eva-dim` (`#17130d` / `#857763`) | `.kanso-fill-dim` | exact |
| `.eva-sqbtn` | `<IconButton variant="outline">` / `.kanso-icon-btn--outline` | drop the hardcoded `#121214` |
| `.eva-divider` (`rgb(198,120,22)`) | `<Divider orientation="vertical">` | `#c67816` ≠ `primary-dim #c87020`; take Kanso's |
| `.eva-segbar` (`#050505`) | `<SegmentBar>` over `.kanso-surface-well` | exact bg |
| `.eva-slider` | `<Slider>` / `.kanso-slider` | Seele's carries `border-radius: 2px` — violates rule 2 |
| `.eva-top-bar` | `.kanso-topbar` | exact `rgba(124,58,237,0.09) → black` sheen |
| `.shimmer` | `<Skeleton>` | Seele's three rgbas are blue-grey and off-palette |
| `.crt-overlay` | `<CRT />` | Seele fuses scanlines + vignette in one node; Kanso splits into `<Scanlines>` + `<Vignette>` |
| `body::before` (grain) | `<Grain />` / `.kanso-grain` | exact 2% fractalNoise data-URI |
| `.titlebar-drag` / `.no-drag` | `.kanso-drag` / `.kanso-no-drag` | exact |
| `.seele-reduce-motion` | `.kanso-reduce-motion` | exact idea, same two-switch design |
| `.seele-no-blur` | `.kanso-no-blur` | exact |
| `.scrollbar-thin` | `.kanso-scroll-**hidden**` | Seele's name is a lie — it hides the bar. Kanso's `.kanso-scroll-thin` is an actual 3px rail |
| `* { border-radius: 0 }` | `.kanso-root :where(*) { border-radius: 0 }` | Kanso's is zero-specificity, so a deliberate radius still wins |
| scrollbar `rgba(255,85,0,…)` ×5 | Kanso `rgba(255,152,48,…)` | `#ff5500` is a fifth orange. §3.11 |
| focus ring (amber 2px + 2px halo) | cyan 1px / 2px offset | **must change** — §3.4 |
| `src/renderer/motion.ts` | `EASE_MECHANICAL`, `OVERLAY_ENTER`, `OVERLAY_EXIT`, `PANEL_ENTER`, `PANEL_EXIT` from `@kanso/ui` | **numerically identical.** Delete the file, re-export |

### 2.7 Seele — components

| Seele | Kanso |
| --- | --- |
| `Badge.tsx` | `<Badge>` |
| `BarChart.tsx` | `<BarChart>` |
| `Divider.tsx` | `<Divider>` |
| `Toast.tsx` + `useToast.ts` | `<Toast>` + `useToast` |
| `TargetingContainer.tsx` | `<Frame label readout crosshairs rails>` |
| `BootSequence.tsx` | `<BootSequence lines>` |
| `TerminalDisplay.tsx` | `<Terminal>` / `<BootSequence>` |
| `CommandPalette.tsx` | `<CommandPalette commands>` |
| `ContextMenu.tsx` | `<Menu>` + `useContextMenu` |
| `EvaSegmented.tsx` | `<Segmented options value onChange>` |
| `TitleBar.tsx` | `<TopBar draggable>` |
| `ViewerTopBar.tsx` | `<TopBar glass>` |
| `ViewerFooter.tsx` (`<kbd>` chips) | `<Badge>` today; §5.9 |
| the nine modals | `<Modal>` — deletes the byte-identical `initial/animate/exit` pair nine times over |
| `SettingsModal` toggles | `<Switch>`, `<Checkbox>`, `<Slider>` |
| `SessionChangesModal` table | `<Table columns rows sort>` |
| `KeyboardHelp.tsx` | `<Modal>` + `<Table dense>` |
| `ActivityLog.tsx` | `<Terminal>` or `<DataList>` |
| `Sidebar` storage footer | `<SegmentBar>` / `<Meter>` |
| `FolderBrowser` capacity bar | `<Meter color="ramp">` |
| `MonitorOverlay.tsx` | partially `<Frame crosshairs>`; the rest is app-specific |
| `PieChart.tsx` | **no equivalent** — §5.4 |
| `MasonryGrid`, `MediaViewer`, `ViewerFilmstrip`, `FileUpload`, `FolderBrowser`, `InspectorParts`, `ErrorBoundary` | app-specific. Keep |

### 2.8 cadence-planner — reconciliation

Listed for completeness and because decisions should flow *out* of this project. The
"Kanso" column is where the value would land if it ever adopted; the last column says who
is right.

| Old | Value | Kanso | Who wins |
| --- | --- | --- | --- |
| `--cad-bg-primary` | `#050505` | `--kanso-color-well` | Kanso — a page background is `#000` (rule 1) |
| `--cad-bg-panel` | `#0d0d0d` | `--kanso-color-panel` `#0a0a0c` | Kanso |
| `--cad-bg-elevated` / `--cad-bg-input` | `#1a1612` | `--kanso-color-panel-2` `#121214` | open — cadence's is deliberately warm |
| `--cad-accent` | `#FF9830` | `--kanso-color-primary` | tie |
| `--cad-accent-dim` | `#8A4A00` | `--kanso-color-primary-deep` | tie on value, Kanso on name |
| `--cad-accent-mid` | `#332b21` | none | cadence — warm border tier is missing from Kanso |
| `--cad-accent-glow` | `rgba(255,152,48,0.30)` | `--kanso-color-primary-glow` `0.25` | Kanso |
| `--cad-text-hi` | `#E8E8DF` | `--kanso-color-text` `#e8e8e4` | Kanso |
| `--cad-text-mid` / `-lo` / `-xlo` | `#9A8A70` / `#948567` / `#8d7e60` | `--kanso-color-text-dim` / `--kanso-color-muted` | **cadence** — §3.12 |
| `--cad-border` | `#332b21` | `--kanso-color-border` `#1f1f23` | open |
| `--cad-danger` / `--cad-success` | `#FF3030` / `#50FF50` | `danger` / `success` | tie |
| `--cad-font-ui` | Bebas Neue | `--kanso-type-stamp` | tie |
| `--cad-font-mono` | IBM Plex Mono | `--kanso-type-mono` | Kanso — §3.3 |
| `--cad-radius` | `0px` | reset `border-radius: 0` | tie |
| `--cad-shadow-panel` | `0 0 40px rgba(255,152,48,.25), 0 0 80px …` | `--kanso-shadow-panel` (black) | **Kanso** — this is exactly the bloom rule 3 bans |
| `--cad-fs-micro\|xs\|sm\|md` | 10/11/12/14 | `--kanso-type-size-xs\|sm\|base\|md` 8/10/12/14 | open |
| `--cad-track-wide` / `-mid` | `0.15em` / `0.10em` | `tracking-label` `0.14em` / `tracking-wider` `0.05em` | Kanso |
| `.panel-chamfer` (12px TL/BR) | | `.kanso-notch` | tie |
| `.panel-chamfer-sm` (7px TL/BR) | | `.kanso-cut` 6px / `.kanso-cut-lg` 9px | Kanso — 7px is a third size for no reason |
| `.cad-label` / `.cad-value` / `.cad-input` | | `.kanso-label` / `.kanso-value` / `.kanso-input__control` | tie |
| `.cad-chip[data-active]` | | `<Chip active>` | tie |
| `.btn-mech` | | `.kanso-btn` | tie |
| `.blink` | | `.kanso-anim-blink` | tie |
| `.hazard-border-top` / `-bot` | | `<HazardStripe>` | tie |
| `.glow-accent` / `-success` / `-danger` | | `.kanso-phosphor-orange` / `-green` / *(no red phosphor)* | Kanso is missing a red phosphor |
| `.sr-only` | | `.kanso-sr-only` | tie |
| `data-fx-*` registry | | none | **cadence** — §5.14 |
| `data-density="compact"` | | none | **cadence** — §5.15 |
| `ui/Modal.jsx` | | `<Modal>` | tie |
| `ui/AttendanceToggle.jsx` | | `<Segmented size="sm">` | tie |
| `ui/Dot.jsx` | | `<LED>` | Kanso |
| `ui/ColorPicker.jsx` | | none | cadence |
| attendance meter (`AttendanceView.jsx`) | | `<Meter>` — **without the 75% threshold line** | §5.5 |

### 2.9 omp-theme-lab — collisions only

Nine tokens, seven of which collide by name with Kanso and none by value. This is the
whole argument for not adopting: the names would move, the values wouldn't, and the file
that changes is the one rendering a *neutral* preview.

| Old | Value | Same-named Kanso token | Value |
| --- | --- | --- | --- |
| `--chrome` | `#14151a` | *(would be `--kanso-color-bg`)* | `#000000` |
| `--panel` | `#1c1e26` | `--kanso-color-panel` | `#0a0a0c` |
| `--panel2` | `#232531` | `--kanso-color-panel-2` | `#121214` |
| `--line` | `#2e3140` | `--kanso-color-border` | `#1f1f23` |
| `--fg` | `#c9cbd6` | `--kanso-color-text` | `#e8e8e4` |
| `--dim` | `#8a8d9e` | `--kanso-color-text-dim` | `#8a8a85` |
| `--ok` / `--warn` / `--bad` | `#3ddc84` / `#ffd166` / `#ff6b6b` | `ramp-nominal` / `-elevated` / `-critical` | `#50ff50` / `#ffb700` / `#ff3030` |
| *(none)* — `#7aa2f7`, `#3d5afe` hardcoded ×4 | | no accent token exists in the project | |

---

## 3. Divergences that need a decision

### 3.1 `-dim` means two different things — **change the projects**

`NERV AQI`'s `--or-dim: #8A4A00` and `cadence-planner`'s `--cad-accent-dim: #8A4A00` are
both Kanso's `primary-**deep**`. Kanso's `primary-dim` is `#c87020` — a *visible* muted
border, not a near-black fill. A mechanical `-dim → -dim` rename brightens every muted
border in both apps.

Kanso's three-way split (`base` / `dim` for muted borders and text / `deep` for near-black
fills) is already consistent across five hues and carries more information. Adopt it. Do
the rename with the value, not the name: `--or-dim` → `--kanso-color-primary-deep`.

### 3.2 Page background — **change the projects, but it's a no-op in one**

Rule 1: `#000000` is the page. NERV AQI uses `#0A0A0C` (Kanso's *panel*) and
cadence-planner uses `#050505` (Kanso's *well*). Both are wrong by the spec.

In NERV AQI it is genuinely invisible — `#map-wrap` is a full-screen fixed MapLibre canvas
at `z-index: 0` and the body is never seen. Rename the token and move on. In
cadence-planner it is visible, and it's one of the reasons that project should stay put.

### 3.3 IBM Plex Mono vs JetBrains Mono — **change the projects**

NERV AQI and cadence-planner both use IBM Plex Mono; Kanso specifies JetBrains. Rule 4
("one hue, one job") applies to type as well: a shared system whose text sets at different
widths per app is not shared, it's a colour palette with extra steps.

Two costs to plan for. Bebas Neue pairs slightly differently against JetBrains'
wider lowercase, so stamped headers will need a tracking pass. And JetBrains Mono ships
coding ligatures **on** — `!=`, `->`, `>=` in a telemetry readout will render as single
glyphs. That is a Kanso bug, not a project bug: see §5.12.

### 3.4 Focus rings — **change the projects, non-negotiable**

| Project | Today | Required |
| --- | --- | --- |
| Seele | amber `2px` outline + `0 0 0 2px rgba(255,183,0,0.35)` | cyan `#20f0ff`, 1px, 2px offset |
| app-launcher | `border-color: --primary-dim` + `0 0 0 1px --primary-dim`, inputs only | same, on everything focusable |
| NERV AQI | **nothing** | same |

KANSO.md §10.1 reserves `#20f0ff` for focus and forbids using it decoratively on an
interactive element. This is an accessibility rule on a dark, low-contrast, small-type
system, not a preference. NERV AQI is the urgent one — it has a command terminal, a `/`
focus hotkey, and no visible focus state anywhere.

Watch the interaction with clipped elements: a `clip-path` crops an `outline`, which is why
`base/a11y.css` redraws the ring as an inset `box-shadow` on the six shape classes. Any
project keeping its own clipped controls has to keep that rule too.

### 3.5 Seele's `.eva-ticket` is a seventh shape — **change Seele**

`.eva-ticket` is a 9px TR+BL chamfer. Kanso has 9px (`.kanso-cut-lg`) but TL+BR, and TR+BL
(`.kanso-notch-tr`) but at 12px. Neither is what Seele draws.

Adding `.kanso-cut-lg-tr` would make seven shapes, and §6 caps the count at six
deliberately — the constraint is the feature, because notch *direction* is supposed to
encode anchoring rather than taste. Move Seele's tickets to `.kanso-cut-tr` (6px). At
ticket scale the 3px difference is not load-bearing.

### 3.6 app-launcher's notch names are inverted — **change the project**

`--notch` is the 5px polygon and `--notch-sm` is the 8px one. Adopting `.kanso-cut-sm`
(5px) and `--kanso-shape-notch-sm` (8px) fixes it as a side effect. Mentioned only because
a careless find-and-replace on the *names* will swap every corner in the app.

### 3.7 `pulse-a` animates `box-shadow` — **change the project**

`css/panels.css` runs `pulse-a` (an inset `box-shadow` tween) on **every** `.nerv-panel`
whenever `body` carries `lv3`/`lv4`/`lv5`. §8 forbids animating `box-shadow`, and this is
the case that rule exists for: a compositor-hostile paint, on multiple full-height glass
panels, running at 2s infinite, on the exact screens where the app is already busiest.

Replace with `.kanso-anim-pulse` (opacity) on a `1px`-inset absolutely-positioned border
overlay, or with `<HazardStripe animated>` on the affected region.

### 3.8 `--dur: 140ms` for everything — **change the project**

app-launcher uses one duration for hovers, colour changes, and the modal. Kanso splits:
`instant 60` for hover tint, `tick 120` for control state, `overlay-enter 140` /
`overlay-exit 90`, `panel-enter 160` / `panel-exit 100`. Enter is slower than exit and both
are shorter than 140 for a hover. Map `--dur` to `tick` on buttons and to
`overlay-enter`/`-exit` on the modal.

### 3.9 Scrim alpha — **change the projects**

`--kanso-color-scrim` is `rgba(0,0,0,0.72)`. app-launcher's `.overlay` is `0.8`; NERV AQI's
popup body is `rgba(10,10,12,0.92)`. Neither difference is intentional. Take the token.

### 3.10 Seele's warm dim — **change Seele**

`.phosphor-dim` is `#8a7a68`, the only warm grey in an otherwise neutral set, against
Kanso's `#8a8a85`. Almost certainly a leftover. Take the token.

### 3.11 Seele's fifth orange — **change Seele**

Scrollbars use `rgba(255,85,0,…)` in five places. `#ff5500` is not `#ff9830`. Kanso's
`reset.css` already uses the same alphas at the correct hue, so this disappears on adoption
— but it's worth logging as evidence of how a palette drifts without a token pipeline.
Seele currently carries **ten** distinct oranges, four of them tokenised.

### 3.12 The `muted` contrast floor — **change the system** ✔ RESOLVED

This was the strongest case in the document for Kanso being wrong, and it was acted on:
`muted` is now `#767670` (4.60:1, measured), and `scripts/check-contrast.mjs` gates every
text token in `npm run verify`. The original finding is kept below because the reasoning is
the reusable part.

`--kanso-color-muted: #6a6a65` on `#000000` landed around 4.0:1 — under AA for normal text.
KANSO.md §10.2 already concedes this ("the lowest-contrast text allowed, and only for
labels"), but nothing measures it and nothing stops it being used on `panel-2`, where it is
worse.

Two projects found this independently and fixed it:

- `Seele/src/renderer/theme.css` — `--color-nerv-muted` carries the comment *"lightened
  from spec `#565650` for AA readability"*.
- `cadence-planner/src/themes/nerv/tokens.css:19-26` — documents measured ratios per tier
  (`mid 5.35:1 · lo 4.98:1 · xlo 4.53:1` on `#1a1612`), explains why `--cad-text-xlo` moved
  from `#6b5f4b` (2.88:1), and cites `scripts/check-contrast.mjs` as the verification.

Two independent discoveries of the same defect is a system problem. Port the contrast
script into `kanso/scripts/`, run it over every text-on-surface pair the tokens permit, and
either raise `muted` or ship a documented `muted-aa` tier for the cases where it carries
real content rather than a label.

### 3.13 Glass over flat backgrounds

Not a conflict, a clarification worth writing down. NERV AQI is the **only** project in the
portfolio with a legitimate `.kanso-glass` case: `#hud-left`, `#hud-right`, `#topbar` and
`#terminal` all float over a live MapLibre canvas. Seele's dialog blur is correctly behind
a setting (`.seele-no-blur`). app-launcher has no glass and must not gain any — §7 is
explicit that glass over a flat background is an expensive way to draw a rectangle.

---

## 4. Consumption recipes

### 4.1 React

```bash
npm i @kanso/ui
```

```tsx
// entry, before any app CSS
import "@kanso/ui/kanso.css";
import { CRT, Panel, Meter, kanso } from "@kanso/ui";

<div className="kanso-root">
  <CRT />
  <Panel title="MAGI // STATUS" accent="primary" notch="left">
    <Meter label="CPU" value={0.72} color="ramp" />
  </Panel>
</div>
```

Four things to know:

1. **`.kanso-root` is load-bearing.** The reset, the focus rings, the scrollbars and
   `border-radius: 0` are all scoped to it. Everything else is `:where()` and will never
   fight host CSS.
2. **`animejs@^4` is a hard dependency**, not a peer. `Chip` and `Scanlines` tween in JS.
   Seele already ships `motion@13`; adopting means two animation runtimes in one Electron
   bundle. That is a real cost — measure it before committing, and see §5.14 for the
   CSS-only escape hatch.
3. **Use `kanso` / `cssVar()` for JS colour strings.** This is what kills Seele's
   hardcoded hex maps in `PieChart.tsx:47-50`, `BarChart.tsx:59-63`,
   `TargetingContainer.tsx:46-51`, `MonitorOverlay.tsx:41-62` and `useTags.ts:28-33` —
   SVG `fill` and inline `style` can't reach a Tailwind class, but they can reach
   `kanso.color.info`.
4. **Reduced motion is two switches**, the OS query and `.kanso-reduce-motion`. Seele's
   `<MotionConfig reducedMotion>` stays — it governs `motion/react`, which Kanso doesn't
   know about. Set both from the same setting.

### 4.2 Tailwind

**v4 (Seele).** The bridge is `@theme inline`, and the `inline` keyword is the entire
point:

```css
@import "tailwindcss";
@import "@kanso/ui/kanso.css";   /* defines --kanso-* on :root */

@theme inline {
  --color-primary: var(--kanso-color-primary);
  --color-info:    var(--kanso-color-info);
  --color-panel:   var(--kanso-color-panel);
  --color-border:  var(--kanso-color-border);
  --font-mono:     var(--kanso-type-mono);
  --font-display:  var(--kanso-type-display);
}
```

Without `inline`, Tailwind v4 emits its own `--color-primary` custom property *and*
references it — you get two definitions of the same colour and a variable that breaks when
redefined in a nested scope. With `inline`, Tailwind substitutes at build time, so
`bg-primary` compiles straight to `background-color: var(--kanso-color-primary)` and there
is exactly one definition, in `tokens.css`, generated from `tokens/color.json`.

Keep the bridged list short. Only declare what is actually used as a utility class.
Anything needed in JS comes from `import { kanso }`, not from a Tailwind name.

Cascade order matters: `kanso.css` after `tailwindcss`, and app CSS after both. Seele
already relies on this (`main.tsx` imports `theme.css` then `index.css`, which is why its
global `* { border-radius: 0 }` wins).

**v3 (cadence-planner, hypothetically).** `theme.extend.colors = { primary: "var(--kanso-color-primary)" }`
works, but opacity modifiers (`bg-primary/50`) silently break, because v3 needs the
`<alpha-value>` channel form and Kanso stores hex. Either accept no opacity modifiers on
Kanso colours, or don't route them through Tailwind at all. Given cadence-planner uses
Tailwind purely for layout and has exactly one Tailwind palette colour in the whole
codebase (a dead `bg-green-500` in `Dot.jsx`), the second option is obviously correct — and
it's another reason that project doesn't need this.

### 4.3 Vanilla HTML/CSS

```html
<link rel="stylesheet" href="node_modules/@kanso/ui/dist/kanso.css">
<body class="kanso-root">
```

- **Take `kanso.css`, not `tokens.css`.** `.kanso-panel`, `.kanso-terminal`, `.kanso-btn`,
  `.kanso-meter` and the six shape classes are plain CSS. The React components are markup
  conveniences on top; a vanilla consumer gets ~90% of the system from the stylesheet
  alone. `tokens.css` is for projects that genuinely only want the palette.
- **`class="kanso-root"` on `<body>` is mandatory.** Without it: no reset, no focus rings,
  no scrollbars, no `border-radius: 0`. This is the single most likely adoption mistake.
- **Neither vanilla project has a bundler.** app-launcher has a `package.json` and a
  local server; NERV AQI has no build step at all and loads MapLibre from unpkg. Vendor
  `dist/kanso.css` into the repo, or serve it from `node_modules` — don't assume a
  resolver.
- **`Chip` states don't work without React.** `Chip.css` deliberately carries no
  transitions because `Chip.tsx` tweens colour/border/background in anime.js. NERV AQI's
  `.wtab` / `.term-tab` and app-launcher's `.log-toggle` are the exact patterns Chip was
  distilled *from*, and all three are vanilla. Until §5.14 lands, vanilla consumers must
  add their own `transition: color var(--kanso-motion-duration-tick) var(--kanso-motion-ease-mechanical)`
  and an `.is-active` rule.
- **Fonts.** All three vanilla projects load Google Fonts. Kanso bundles none. NERV AQI's
  `<link>` requests IBM Plex Mono and must change (§3.3); app-launcher's already requests
  JetBrains Mono and Bebas Neue and needs no edit.

---

## 5. What Kanso is still missing

Gaps found by reading these five codebases. Each names the file and the pattern.

**Closed since this list was written** — do not re-implement these:
`5.3` (`tokens/series.json`, `--kanso-series-1..8`) · `5.7` (`.kanso-surface-checker`) ·
`5.11` (`--kanso-color-text-2`, though nothing consumes it yet) · `5.12`
(`font-variant-ligatures: none` on `.kanso-value`) · `5.17` (`.kanso-phosphor-red`).
`5.14` is **half** closed: `.kanso-chip--term` has a CSS-only active state via
`[aria-pressed="true"]`, but the default `tab` variant still has none — which is the half
that actually blocks the vanilla consumers.

The rest below are still open.

| # | Proposal | Why — the pattern that needs it |
| --- | --- | --- |
| 5.1 | **`<LineChart>`** — time series with a past/forecast split | `NERV Style AQI/src/ui/chart.js` hand-builds a 48h SVG: solid past line, dashed forecast at 0.3 opacity, NOW marker, day-boundary ticks, threshold bands, area gradient, pinch-zoom. `Sparkline` has no axes or time; `BrailleGraph` is glyph art. **The largest gap in the system.** |
| 5.2 | **Vertical `<BarChart>`** (`orientation="column"`) | `NERV Style AQI/css/hud.css` `.vbars-row` / `.vbw` / `.vbar` / `.vbf` — a 6-column pollutant rack with click-to-select per column and a 1.2s fill. Kanso's `BarChart` renders horizontal rows only |
| 5.3 | **`tokens/series.json`** — an ordered categorical palette | `NERV Style AQI/src/config.js` invents eleven colours in `WAVE_COLS` / `WEATHER_WAVE_COLS` (`#c8a0ff`, `#FFD740`, `#4ECDC4`, `#C49CFF`, `#8899AA`, `#FF6B6B`) and `Seele/src/renderer/components/PieChart.tsx:47-50` invents `#0099ff`, because `HUE`'s eight hues are *semantic* and `ramp` is *severity*. Neither is "N series on one chart" |
| 5.4 | **`<PieChart>` / donut with a centre readout** | `Seele/src/renderer/components/PieChart.tsx` (256 lines), driven by `AnalyticsModal` for the storage breakdown. `SegmentBar` is the 1-D cousin and doesn't cover it |
| 5.5 | **`<Meter threshold thresholdLabel>`** | `cadence-planner/src/components/attendance/AttendanceView.jsx` absolutely-positions a 1px `--cad-danger` line at 75% with a 7px label; `NERV Style AQI/src/ui/chart.js:147` draws the WHO reference line. Both are "the line you must not cross", both hand-built |
| 5.6 | **`--kanso-color-active`** — a sanctioned consumer-writable token | `NERV Style AQI/src/ui/panels.js` `renderData()` does `documentElement.style.setProperty('--ac', lv.col)` to recolour the whole console by severity, and `src/map/marker.js:33` reads it back via `getComputedStyle`. Good pattern; §3's naming contract currently forbids it and offers no alternative |
| 5.7 | **`.kanso-surface-checker`** — an alpha-transparency bed | `Seele/src/renderer/index.css` `.thumb-checkerboard::before` (four 45° gradients, `#1a1a22` on `#0d0d12`, 16px) sits under every thumbnail in `MasonryGrid`. Any media app needs it; `surface-well` is flat |
| 5.8 | **`<Marker>` + a documented `.kanso-popup` skin** | `NERV Style AQI/css/hud.css` `.nerv-marker` / `-ring` (`ring-pulse`) / `-dot`, plus a full override of MapLibre's `.maplibregl-popup-content`. Map-backed telemetry is a NERV-lineage staple and this is the only project that has had to solve it |
| 5.9 | **`<Kbd>`** | `Seele/src/renderer/components/ViewerFooter.tsx` and `KeyboardHelp.tsx` render `<kbd>` chips by hand, while Kanso already has two private spellings of the same thing: `.kanso-cmdk__row-hint` and `.kanso-menu__shortcut` |
| 5.10 | **`<Badge variant="idle">`** — outlined, muted, unfilled | `app-launcher/style.css` `.badge.standby`: `background:none; color:var(--muted); border:1px solid var(--border-hi); clip-path:none`. "Nothing is happening" is a real state and all five Badge variants except `danger` are filled |
| 5.11 | **`--kanso-color-text-2`** — a tier between `text-dim` and `text` | `app-launcher/style.css` `.log` uses `#b8b8b2` for log body copy: brighter than `text-dim #8a8a85`, quieter than `text #e8e8e4`. Kanso's `Terminal.css` body uses full `text`, which is too loud for a 200-line scrollback |
| 5.12 | **`font-variant-ligatures: none` on `.kanso-value`** | JetBrains Mono ships coding ligatures on by default. `.kanso-value` sets `tnum` but not this, so `!=` / `->` / `>=` in a readout render as single glyphs. A one-line fix in `base/text.css` |
| 5.13 | **A per-value glitch reveal** | `Seele/src/renderer/theme.css` `matrix-glitch` (5-stop `clip-path: inset()`) and `cadence-planner/src/components/roster/GpaBadge.jsx` (IntersectionObserver, `---` → value over 75/150ms) are two independent EVA-lineage reveals. `BootSequence` covers the full-screen case; neither covers a single `<Readout>` arriving |
| 5.14 | **CSS-only Chip states** | `Chip.css` has no transitions by design — `Chip.tsx` tweens in anime.js. But KANSO.md §11 names app-launcher and the NERV console as the reference vanilla consumers, and Chip's own header comment cites their `wtab` / `term-tab` as its lineage. The two projects the component was built for cannot use it. Add `.kanso-chip--active` + a CSS transition fallback |
| 5.15 | **A `data-fx-*` effects registry** | `cadence-planner/src/themes/effects.js` allowlists nine composable toggles (`crt-scanlines`, `grid-background`, `hazard-border`, `chamfer`, `glow`, `hud-flicker`, `status-pulse`, `hex-labels`, `force-uppercase`), each gated `:root[data-fx-*]`. Kanso has two global opt-outs and no way to expose the atmosphere layer as user settings. Seele built the same thing independently in `SettingsModal.tsx` |
| 5.16 | **A density scale** (`.kanso-dense`) | `cadence-planner/src/index.css` `:root[data-density="compact"]` re-declares the whole `--cad-fs-*` scale. Kanso hardcodes its sizes. Seele's four `MasonryGrid` view modes want the same lever |
| 5.17 | **A red phosphor** | `.kanso-phosphor-*` covers orange, amber, lime, violet, cyan, green — no red, while `cadence-planner` ships `.glow-danger` and `NERV AQI`'s `.terminal-line--error` hand-rolls `text-shadow: 0 0 4px rgba(255,48,48,0.3)`. An asymmetry with no reason behind it |
| 5.18 | **Port `check-contrast.mjs`** | `cadence-planner/scripts/check-contrast.mjs` plus the measured ratios in `src/themes/nerv/tokens.css:19-26`. The most transferable artifact in the portfolio, and the fix for §3.12 |

---

## 6. Order of adoption

### 6.1 app-launcher — first

Smallest surface, zero intended visual change, and the only project where adoption is a
pure delete: remove the 22-line `:root` block, add one `<link>`. It exists to prove the
packaging works.

Specifically: if `dist/kanso.css` cannot be consumed cleanly by a project with no bundler,
that is a Kanso packaging bug, and you want to hit it in a 339-line stylesheet rather than
in a 9,000-line Electron app. Same for the `.kanso-root` requirement and the vanilla `Chip`
problem (§5.14) — both surface here, both cheap to fix here.

Land the `app.js` class-string rename in the same commit as the CSS.

### 6.2 NERV Style AQI — second

Vanilla, maps cleanly, and gains the most: focus rings where there are none today, one
palette instead of two, and a genuine `.kanso-glass` case that stress-tests the surface
layer properly.

Do three cleanups **before** the token swap so the diff stays readable:

1. Fix `:.logo` at `css/topbar.css:30` — the invalid selector kills the whole wordmark
   rule, including the only use of `--compress` in the project.
2. Collapse the legacy triple (`#FF8A00` / `#00E5FF` / `#FF2A2A`) onto the existing
   tokens.
3. Delete the dead code: `@keyframes flicker`, the `.led-*` family (`status-bar.js`
   targets a `#led` that isn't in the markup), `#term-autocomplete`, and
   `.nerv-panel--tl` (defined, never applied — though it's the class `#hud-left` should
   have had).

Then swap tokens, then classes. Expect friction in `src/ui/chart.js` and
`src/ui/panels.js`, both of which write inline styles that override CSS — `updateWaveTabs()`
in particular sets `backgroundColor` / `color:'#000'` / `borderColor` directly on the tabs,
so restyling `.wtab` alone will appear to do nothing.

### 6.3 Kanso itself — third

Close the gaps that 6.1 and 6.2 surfaced before touching Seele. At minimum: CSS-only Chip
states (§5.14), `--kanso-color-active` (§5.6), the series palette (§5.3), the contrast
script and whatever it says about `muted` (§5.18, §3.12), and the one-line ligature fix
(§5.12).

Adopting into Seele while known gaps remain guarantees Seele re-forks, and Seele is the one
project where a fork is fatal — it's the upstream.

### 6.4 Seele — fourth, and deliberately last among adopters

Largest surface (34 components, 9,230 lines) and lowest risk per change, because the values
already match. Order within:

1. `src/renderer/motion.ts` → re-export from `@kanso/ui`. Numerically identical, zero
   visual risk, proves the dependency resolves in the Electron build.
2. `theme.css` → the `@theme inline` bridge (§4.2). Tailwind utility names stay; the
   palette stops being duplicated.
3. Delete the duplicated `index.css` blocks: phosphor set, bevel fills, shape primitives,
   drag regions, reduce-motion, no-blur, scrollbars. This is the ~300-line win.
4. Keep the `.eva-*` class names as thin aliases for one release. A 34-file rename and a
   behaviour change in the same commit is unreviewable.
5. Swap components, starting with the nine modals — they share a byte-identical
   `initial`/`animate`/`exit` pair, so `<Modal>` deletes the same nine blocks nine times.
   Then `Badge`, `Divider`, `BarChart`, `Toast`, `TargetingContainer` → `Frame`,
   `EvaSegmented` → `Segmented`.

The real cost of this step is not technical. Seele is where the house style is currently
decided; after adoption it stops being that place. Budget for the discipline of editing
`tokens/*.json` instead of `theme.css`.

### 6.5 cadence-planner — don't

It already *is* the house style, arrived at independently, and in three places it is ahead
of Kanso: contrast-verified text tiers with a script to prove it, a nine-effect composable
registry, and a density scale. Adopting would mean rewriting 274 inline `style={{}}`
objects to gain nothing visual and lose `--cad-accent-mid`, the warm border tier, and the
two-theme structure Kanso has no answer for.

Flow decisions the other way instead — §5.18, §5.15, §5.16 all originate here.

Revisit only if it needs something Kanso has and it doesn't: `Table`, `Terminal`,
`CommandPalette`, `Gauge`.

And note that step zero for that repository is unrelated to design systems. Commit
`7296dd3` changed `SUBJECT_COLORS` in `src/data/colors.js` from `{id, name, bg, border,
text}` to `{id, name}`, but three consumers were never migrated —
`TimetableGrid.jsx:374,483,538`, `SubjectRow.jsx:6`, and `ClassInstanceModal.jsx:8` still
read `.bg` / `.border` / `.text` and now emit `borderLeft: "3px solid undefined"`. Subject
accents are silently dropped on the timetable and roster today. Fix that before any
styling conversation.

### 6.6 omp-theme-lab — never

The tool renders a live preview of an Oh My Pi terminal theme: 67 tokens, WCAG badges
computed per token, bidirectional hover inspection between the sidebar and the mock
session. Its chrome is a neutral instrument around someone else's colours.

Wrapping that in orange-on-black NERV chrome would bias every judgement made inside it —
a warm frame shifts the perception of the warm tokens being edited, and a phosphor-glow
context makes an unglowing preview look dead. The blue-grey `#14151a` / `#7aa2f7` palette
is not drift; it is the correct choice for a colour-editing surface, the same reason image
editors ship neutral grey chrome.

There is nothing worth taking from Kanso here, and nothing worth taking from here into
Kanso — except, arguably, the discipline of putting a measured contrast badge next to every
colour, which §5.18 already covers from a better source.
