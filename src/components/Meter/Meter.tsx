// Meter — btop's horizontal bar. Lineage: btop meters, on the Kanso ramp.
//
// The fill is painted with the full five-stop ramp scaled so the gradient
// spans the whole *track*, then scaled down to the filled fraction: 30%
// reads green→caution, 95% runs green→red. `segments` switches to btop's
// discrete block cells, each cell coloured by its own ramp position.
//
// The bar is always capped at `max`; `allowOverrange` caps only the paint,
// never the number — a silent clamp is a lie about the telemetry.
import {
  type CSSProperties,
  type HTMLAttributes,
  forwardRef,
} from "react";
import { HUE, type Hue, rampColor, rampGradient, rampOverrange } from "../../ramp";

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
  /**
   * Let `value` exceed `max` instead of clamping it away. The bar caps, a
   * hazard block flags the excess, and the readout carries the true number —
   * the sync-ratio case, where 412% must never render as 100%.
   */
  allowOverrange?: boolean;
  /**
   * Render the ramp step's word — NOMINAL … CRITICAL — beside the value, so
   * severity survives the orange-red axis that deuteranopia collapses.
   * Ignored unless `color="ramp"`: a single hue has no severity step.
   *
   * Three states, because this is the one place the two generations
   * genuinely disagree: `true`/`false` pin it, and **leaving it undefined
   * defers to the theme** — off under classic, on under eva. The word is
   * always in the DOM and CSS decides, so the switch costs no re-render and
   * v1 keeps rendering exactly as it did.
   */
  showStep?: boolean;
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
    allowOverrange = false,
    showStep,
    className = "",
    style,
    "aria-label": ariaLabel,
    ...rest
  },
  ref
) {
  // role="meter" is nothing to a screen reader without a name, and `label`
  // is optional — so fall back rather than ship an anonymous meter.
  const { frac, ratio, over, step } = rampOverrange(value, max);
  const overrange = allowOverrange && over;
  // The bar always draws the clamped fraction; only the text escapes the cap.
  const pct = Math.round((overrange ? ratio : frac) * 100);
  // Rendered whenever there is a step to show; `--step` / `--no-step` pin the
  // visibility and their absence lets the theme decide (see Meter.css).
  const stepWord = color === "ramp" ? step.toUpperCase() : null;
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
      aria-valuetext={overrange ? `${pct}% — OVERRANGE` : `${pct}%`}
      aria-label={ariaLabel ?? label ?? "meter"}
      className={[
        "kanso-meter",
        size === "sm" ? "kanso-meter--sm" : "kanso-meter--md",
        ...(overrange ? ["kanso-meter--overrange"] : []),
        ...(showStep === true ? ["kanso-meter--step"] : []),
        ...(showStep === false ? ["kanso-meter--no-step"] : []),
        className,
      ].join(" ")}
      style={style}
      {...rest}
    >
      {(label !== undefined || showValue || stepWord) && (
        <div className="kanso-meter__head">
          {label !== undefined && <span className="kanso-meter__label">{label}</span>}
          {/* Overrange text takes its colour from the modifier class, so the
              theme layer can restyle the state the inline tint would pin. */}
          {stepWord && (
            <span
              className="kanso-meter__step"
              style={overrange ? undefined : { color: tint }}
            >
              {stepWord}
            </span>
          )}
          {showValue && (
            <span
              className="kanso-meter__value"
              style={overrange ? undefined : { color: tint }}
            >
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
          {overrange && <span className="kanso-meter__overflow" />}
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
          {overrange && <span className="kanso-meter__overflow" />}
        </div>
      )}
    </div>
  );
});
