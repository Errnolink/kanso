// Meter — btop's horizontal bar. Lineage: btop meters, on the Kanso ramp.
//
// The fill is painted with the full five-stop ramp scaled so the gradient
// spans the whole *track*, then scaled down to the filled fraction: 30%
// reads green→caution, 95% runs green→red. `segments` switches to btop's
// discrete block cells, each cell coloured by its own ramp position.
import {
  type CSSProperties,
  type HTMLAttributes,
  forwardRef,
} from "react";
import { HUE, type Hue, rampColor, rampGradient } from "../../ramp";

export interface MeterProps extends Omit<HTMLAttributes<HTMLDivElement>, "color"> {
  value: number;
  /** Upper bound of `value`. Defaults to 1, i.e. `value` is a fraction. */
  max?: number;
  label?: string;
  showValue?: boolean;
  color?: Hue | "ramp";
  /** When set, render as N discrete block segments instead of a smooth bar. */
  segments?: number;
  size?: "sm" | "md";
}

function clamp01(n: number): number {
  return n < 0 ? 0 : n > 1 ? 1 : Number.isFinite(n) ? n : 0;
}

export const Meter = forwardRef<HTMLDivElement, MeterProps>(function Meter(
  {
    value,
    max = 1,
    label,
    showValue = true,
    color = "ramp",
    segments,
    size = "md",
    className = "",
    style,
    "aria-label": ariaLabel,
    ...rest
  },
  ref
) {
  // role="meter" is nothing to a screen reader without a name, and `label`
  // is optional — so fall back rather than ship an anonymous meter.
  const frac = clamp01(max > 0 ? value / max : 0);
  const pct = Math.round(frac * 100);
  const tint = color === "ramp" ? rampColor(frac) : HUE[color];

  // Gradient spans the whole track, then the fill is scaled to `frac`, so
  // the visible band only ever contains the colours it has reached.
  const paint = color === "ramp" ? rampGradient() : `linear-gradient(90deg, ${tint}, ${tint})`;
  const span = color === "ramp" && frac > 0 ? `${(100 / frac).toFixed(3)}%` : "100%";

  const filled = segments ? Math.round(frac * segments) : 0;

  return (
    <div
      ref={ref}
      role="meter"
      aria-valuenow={value}
      aria-valuemin={0}
      aria-valuemax={max}
      aria-valuetext={`${pct}%`}
      aria-label={ariaLabel ?? label ?? "meter"}
      className={[
        "kanso-meter",
        size === "sm" ? "kanso-meter--sm" : "kanso-meter--md",
        className,
      ].join(" ")}
      style={style}
      {...rest}
    >
      {(label !== undefined || showValue) && (
        <div className="kanso-meter__head">
          {label !== undefined && <span className="kanso-meter__label">{label}</span>}
          {showValue && (
            <span className="kanso-meter__value" style={{ color: tint }}>
              {pct}%
            </span>
          )}
        </div>
      )}

      {segments ? (
        <div className="kanso-meter__segments" aria-hidden="true">
          {Array.from({ length: segments }, (_, i) => {
            const on = i < filled;
            const cellColor =
              color === "ramp" ? rampColor(segments > 1 ? i / (segments - 1) : 0) : tint;
            return (
              <span
                key={i}
                className={["kanso-meter__cell", on ? "kanso-meter__cell--on" : ""].join(" ")}
                style={on ? { background: cellColor } : undefined}
              />
            );
          })}
        </div>
      ) : (
        <div className="kanso-meter__track" aria-hidden="true">
          <div
            className="kanso-meter__fill"
            style={
              {
                "--kanso-meter-frac": frac,
                "--kanso-meter-paint": paint,
                "--kanso-meter-span": span,
              } as CSSProperties
            }
          />
        </div>
      )}
    </div>
  );
});
