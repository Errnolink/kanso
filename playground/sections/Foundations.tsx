// Foundations — tokens, type, geometry, surfaces. The part of the gallery
// that documents the design language rather than the component API.
import { useEffect, useState } from "react";
import { kanso } from "../../src/tokens";
import { rampGradient, RAMP_NAMES } from "../../src/ramp";
import { Demo, Grid, Section } from "../Showcase";

/**
 * Resolved values of CSS custom properties, re-read whenever the theme
 * attribute changes.
 *
 * The palette and ramp sections *document* whichever generation is on
 * screen, so they cannot be built from `kanso.color` / `RAMP_STOPS` — those
 * are compile-time v1 constants and would keep printing classic's hexes
 * under eva. A swatch strip that disagrees with the page around it is worse
 * than no swatch strip.
 */
function useTokenValues(vars: readonly string[]): Record<string, string> {
  const key = vars.join(",");
  const [values, setValues] = useState<Record<string, string>>({});

  useEffect(() => {
    const read = () => {
      const cs = getComputedStyle(document.documentElement);
      setValues(
        Object.fromEntries(vars.map((v) => [v, cs.getPropertyValue(v).trim()]))
      );
    };
    read();
    const observer = new MutationObserver(read);
    observer.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ["data-kanso-theme"],
    });
    return () => observer.disconnect();
    // `key` stands in for `vars`, which is a fresh array on every render.
  }, [key]);

  return values;
}

const NEUTRALS = new Set([
  "bg", "panel", "panel-2", "panel-3", "well",
  "border", "border-highlight", "text", "text-dim", "muted", "ink", "scrim",
]);

/** `fallback` is the compile-time value, used only for the first paint
    before the effect has read the live one. */
function Swatch({
  name,
  live,
  fallback,
}: {
  name: string;
  live?: string;
  fallback: string;
}) {
  return (
    <div className="swatch">
      <span
        className="swatch-chip"
        style={{ background: `var(--kanso-color-${name}, ${fallback})` }}
      />
      <span className="swatch-text">
        <code className="swatch-name">{name}</code>
        <code className="swatch-value">{live || fallback}</code>
      </span>
    </div>
  );
}

const SHAPES = [
  ["kanso-cut", "CUT"],
  ["kanso-cut-tr", "CUT-TR"],
  ["kanso-cut-bl", "CUT-BL"],
  ["kanso-notch", "NOTCH"],
  ["kanso-notch-tr", "NOTCH-TR"],
  ["kanso-shear", "SHEAR"],
] as const;

const FILLS = ["amber", "lime", "cyan", "green", "red", "violet"] as const;
const PHOSPHOR = ["orange", "amber", "lime", "violet", "cyan", "green"] as const;

export function Foundations() {
  const colors = Object.entries(kanso.color);
  const functional = colors.filter(
    ([n]) => !NEUTRALS.has(n) && !n.startsWith("phosphor-")
  );
  const neutrals = colors.filter(([n]) => NEUTRALS.has(n));

  const live = useTokenValues([
    ...colors.map(([n]) => `--kanso-color-${n}`),
    ...RAMP_NAMES.map((n) => `--kanso-ramp-${n}`),
  ]);

  return (
    <>
      <Section
        id="palette"
        index="01"
        title="PALETTE"
        lineage="CORE"
        blurb="One hue, one job. A colour means the same thing on every screen: orange is the system's own voice, cyan is information and focus, green is nominal, red is destructive. Never pick a colour because it looks good in that spot."
      >
        <Grid>
          <Demo title="FUNCTIONAL" wide>
            <div className="swatch-grid">
              {functional.map(([name, value]) => (
                <Swatch
                  key={name}
                  name={name}
                  live={live[`--kanso-color-${name}`]}
                  fallback={value}
                />
              ))}
            </div>
          </Demo>
          <Demo title="NEUTRALS" wide>
            <div className="swatch-grid">
              {neutrals.map(([name, value]) => (
                <Swatch
                  key={name}
                  name={name}
                  live={live[`--kanso-color-${name}`]}
                  fallback={value}
                />
              ))}
            </div>
          </Demo>
        </Grid>
      </Section>

      <Section
        id="ramp"
        index="02"
        title="SEVERITY RAMP"
        lineage="BTOP"
        blurb="btop's core idea, made a system primitive. Five stops shared by every meter, gauge, graph and magnitude cell — so 80% looks like 80% in every app, not just on every screen. This is the highest-value thing the library does."
      >
        <Demo
          title="RAMP"
          wide
          stack
          code={`import { rampColor, rampGradient, rampStep } from "@kanso/ui";

// Paint values are CSS, not hex — they follow the live theme.
rampColor(0.72)     // -> "color-mix(in srgb, var(--kanso-ramp-elevated) 12%, var(--kanso-ramp-warning))"
rampStep(0.72)      // -> "warning"
rampGradient("90deg")`}
        >
          <div style={{ height: 28, width: "100%", background: rampGradient() }} />
          <div className="row" style={{ justifyContent: "space-between", width: "100%" }}>
            {RAMP_NAMES.map((name) => (
              <span
                key={name}
                className="type-label"
                style={{ width: "auto", color: `var(--kanso-ramp-${name})` }}
              >
                {name.toUpperCase()} {live[`--kanso-ramp-${name}`]}
              </span>
            ))}
          </div>
        </Demo>
      </Section>

      <Section
        id="type"
        index="03"
        title="TYPOGRAPHY"
        lineage="EVA"
        blurb="Four families, four jobs. The signature move is horizontal compression — scaleX(0.82) on display and stamp text — which makes a title read as stamped onto the interface rather than typed into it."
      >
        <Grid>
          <Demo title="ROLES" stack>
            <div className="type-row">
              <span className="type-label">title</span>
              <span className="kanso-title type-demo" style={{ fontSize: "1.5rem" }}>EVA-01</span>
            </div>
            <div className="type-row">
              <span className="type-label">stamp</span>
              <span className="kanso-stamp type-demo" style={{ fontSize: "1.5rem" }}>MAGI SYSTEM</span>
            </div>
            <div className="type-row">
              <span className="type-label">label</span>
              <span className="kanso-label type-demo">SYNC RATIO</span>
            </div>
            <div className="type-row">
              <span className="type-label">value</span>
              <span className="kanso-value type-demo">41.3%</span>
            </div>
            <div className="type-row">
              <span className="type-label">jp</span>
              <span className="kanso-jp type-demo">第三新東京市</span>
            </div>
          </Demo>

          <Demo title="PHOSPHOR" stack note="One class per node — never stack two. Stacking reads as bloom, which the system rejects.">
            {PHOSPHOR.map((p) => (
              <div className="type-row" key={p}>
                <span className="type-label">{p}</span>
                <span className={`kanso-phosphor-${p} type-demo`}>PATTERN BLUE DETECTED</span>
              </div>
            ))}
          </Demo>

          <Demo title="SIZE RAMP" stack>
            {(["xs", "sm", "base", "md", "lg", "xl", "2xl", "3xl"] as const).map((s) => (
              <div className="type-row" key={s}>
                <span className="type-label">size-{s}</span>
                <span className="type-demo" style={{ fontSize: `var(--kanso-type-size-${s})` }}>
                  Kanso 簡素 0123
                </span>
              </div>
            ))}
          </Demo>

          <Demo title="TRACKING" stack>
            {(["normal", "wide", "wider", "label", "stamp", "widest"] as const).map((t) => (
              <div className="type-row" key={t}>
                <span className="type-label">{t}</span>
                <span
                  className="type-demo"
                  style={{ letterSpacing: `var(--kanso-type-tracking-${t})`, textTransform: "uppercase" }}
                >
                  Emergency
                </span>
              </div>
            ))}
          </Demo>
        </Grid>
      </Section>

      <Section
        id="geometry"
        index="04"
        title="GEOMETRY"
        lineage="NERV"
        blurb="Six shapes, all clip-path polygons. Pick one per element and never nest two clipped boxes. Notch direction encodes anchoring: a panel notches away from the screen edge it hugs, so you can read a screenshot and tell where each panel lives."
      >
        <Demo title="SHAPE PRIMITIVES" wide>
          {SHAPES.map(([cls, label]) => (
            <div key={cls} className={`shape-box ${cls}`}>
              {label}
            </div>
          ))}
        </Demo>
      </Section>

      <Section
        id="surfaces"
        index="05"
        title="SURFACES"
        lineage="CYBER"
        blurb="Depth comes from hairlines and black shadow, never from a gray card. Glass is reserved for chrome that floats over live content — over a flat background it is an expensive way to draw a dark rectangle."
      >
        <Grid>
          <Demo title="DEPTHS" stack>
            <div className="kanso-surface" style={{ padding: 12 }}>.kanso-surface — the default</div>
            <div className="kanso-surface-raised" style={{ padding: 12 }}>.kanso-surface-raised — controls</div>
            <div className="kanso-surface-well" style={{ padding: 12 }}>.kanso-surface-well — graph beds</div>
          </Demo>

          <Demo title="GLASS OVER LIVE CONTENT" live>
            <div className="kanso-glass kanso-notch" style={{ padding: 16, minWidth: 220 }}>
              <div className="kanso-label kanso-label--accent">SECTOR SCAN</div>
              <div className="kanso-value" style={{ fontSize: 20 }}>N 35.6812 / E 139.7671</div>
            </div>
          </Demo>

          <Demo title="BEVEL FILLS" wide note="The one place Kanso allows a gradient. For selected ticket tabs and primary confirmations.">
            {FILLS.map((f) => (
              <span
                key={f}
                className={`kanso-fill-${f} kanso-cut`}
                style={{ padding: "6px 14px", fontSize: 11, letterSpacing: "0.1em" }}
              >
                {f.toUpperCase()}
              </span>
            ))}
            <span className="kanso-fill-dim kanso-cut" style={{ padding: "6px 14px", fontSize: 11, letterSpacing: "0.1em" }}>
              IDLE
            </span>
          </Demo>

          <Demo title="ACCENT RULES" wide note="A 2px coloured top border is how a surface declares its role.">
            {(["primary", "danger", "info", "success", "accent"] as const).map((r) => (
              <div
                key={r}
                className={`kanso-surface kanso-rule-${r}`}
                style={{ padding: "10px 14px", minWidth: 120, fontSize: 10, letterSpacing: "0.12em" }}
              >
                {r.toUpperCase()}
              </div>
            ))}
          </Demo>
        </Grid>
      </Section>
    </>
  );
}
