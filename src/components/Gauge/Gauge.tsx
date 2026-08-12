// Gauge — radial arc gauge, 240° sweep with the gap at the bottom.
// Lineage: EVA cockpit dials × btop's ramp colouring. SVG because the arc
// is continuous; the value itself is HTML so it keeps mono tabular figures.
import {
  type CSSProperties,
  type HTMLAttributes,
  forwardRef,
} from "react";
import { type Hue, resolveHue } from "../../ramp";

export interface GaugeProps extends Omit<HTMLAttributes<HTMLDivElement>, "color"> {
  value: number;
  /** Upper bound. Defaults to 1, i.e. `value` is a fraction. */
  max?: number;
  label?: string;
  /** Unit suffix. Defaults to "%" when `max` is left at 1. */
  unit?: string;
  /** Outer diameter in px. */
  size?: number;
  color?: Hue | "ramp";
}

const START_DEG = 150;
const SWEEP_DEG = 240;
const TICK_COUNT = 5;

function clamp01(n: number): number {
  return n < 0 ? 0 : n > 1 ? 1 : Number.isFinite(n) ? n : 0;
}

function polar(cx: number, cy: number, r: number, deg: number): [number, number] {
  const a = (deg * Math.PI) / 180;
  return [cx + r * Math.cos(a), cy + r * Math.sin(a)];
}

function arcPath(cx: number, cy: number, r: number, from: number, to: number): string {
  const [x1, y1] = polar(cx, cy, r, from);
  const [x2, y2] = polar(cx, cy, r, to);
  const large = Math.abs(to - from) > 180 ? 1 : 0;
  return `M ${x1.toFixed(2)} ${y1.toFixed(2)} A ${r} ${r} 0 ${large} 1 ${x2.toFixed(2)} ${y2.toFixed(2)}`;
}

export const Gauge = forwardRef<HTMLDivElement, GaugeProps>(function Gauge(
  {
    value,
    max = 1,
    label,
    unit,
    size = 120,
    color = "ramp",
    className = "",
    style,
    "aria-label": ariaLabel,
    ...rest
  },
  ref
) {
  // The dial carries role="meter", which is anonymous without a name and
  // `label` is optional — hence the fallback.
  const frac = clamp01(max > 0 ? value / max : 0);
  const tint = resolveHue(color, frac);

  const stroke = Math.max(3, Math.round(size * 0.075));
  const cx = size / 2;
  const cy = size / 2;
  const r = (size - stroke) / 2 - 1;
  const track = arcPath(cx, cy, r, START_DEG, START_DEG + SWEEP_DEG);

  // Percent by default: a gauge whose max is 1 is a fraction gauge.
  const asPercent = max === 1 && unit === undefined;
  const shown = asPercent ? Math.round(frac * 100) : value;
  const shownUnit = asPercent ? "%" : unit;
  const text = Number.isInteger(shown) ? String(shown) : shown.toFixed(1);

  const ticks = Array.from({ length: TICK_COUNT }, (_, i) => {
    const deg = START_DEG + (SWEEP_DEG * i) / (TICK_COUNT - 1);
    const [x1, y1] = polar(cx, cy, r - stroke, deg);
    const [x2, y2] = polar(cx, cy, r - stroke - Math.max(2, stroke * 0.6), deg);
    return { x1, y1, x2, y2, key: i };
  });

  return (
    <div
      ref={ref}
      className={["kanso-gauge", className].join(" ")}
      style={{ ...style, width: size } as CSSProperties}
      {...rest}
    >
      <div className="kanso-gauge__dial" style={{ width: size, height: size }}>
        <svg
          className="kanso-gauge__svg"
          width={size}
          height={size}
          viewBox={`0 0 ${size} ${size}`}
          role="meter"
          aria-valuenow={value}
          aria-valuemin={0}
          aria-valuemax={max}
          aria-valuetext={`${text}${shownUnit ?? ""}`}
          aria-label={ariaLabel ?? label ?? "gauge"}
        >
          <path
            className="kanso-gauge__track"
            d={track}
            strokeWidth={stroke}
            fill="none"
          />
          {ticks.map((t) => (
            <line
              key={t.key}
              className="kanso-gauge__tick"
              x1={t.x1.toFixed(2)}
              y1={t.y1.toFixed(2)}
              x2={t.x2.toFixed(2)}
              y2={t.y2.toFixed(2)}
            />
          ))}
          <path
            className="kanso-gauge__arc"
            d={track}
            pathLength={100}
            strokeDasharray="100"
            strokeDashoffset={100 - frac * 100}
            strokeWidth={stroke}
            stroke={tint}
            fill="none"
          />
        </svg>

        <div className="kanso-gauge__readout" aria-hidden="true">
          <span className="kanso-gauge__number" style={{ color: tint }}>
            {text}
          </span>
          {shownUnit !== undefined && <span className="kanso-gauge__unit">{shownUnit}</span>}
        </div>
      </div>

      {label !== undefined && <div className="kanso-gauge__label">{label}</div>}
    </div>
  );
});
