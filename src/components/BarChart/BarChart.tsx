// BarChart — horizontal labelled bars. Lineage: btop's per-device lists
// (disks, net interfaces) with NERV label typography. Same ramp trick as
// Meter: the gradient spans the track, the fill scales to the value.
import {
  type CSSProperties,
  type HTMLAttributes,
  forwardRef,
} from "react";
import { HUE, type Hue, rampColor, rampGradient } from "../../ramp";

export interface BarChartDatum {
  label: string;
  value: number;
  /** Per-row override of the chart-level colour. */
  color?: Hue;
}

export interface BarChartProps extends Omit<HTMLAttributes<HTMLDivElement>, "color"> {
  data: readonly BarChartDatum[];
  /** Fixed upper bound. Defaults to the largest value in `data`. */
  max?: number;
  showValues?: boolean;
  color?: Hue | "ramp";
}

function clamp01(n: number): number {
  return n < 0 ? 0 : n > 1 ? 1 : Number.isFinite(n) ? n : 0;
}

function formatValue(n: number): string {
  return Number.isInteger(n) ? String(n) : n.toFixed(1);
}

export const BarChart = forwardRef<HTMLDivElement, BarChartProps>(function BarChart(
  { data, max, showValues = true, color = "ramp", className = "", ...rest },
  ref
) {
  const bound = max ?? Math.max(1e-9, ...data.map((d) => d.value));

  return (
    <div ref={ref} className={["kanso-barchart", className].join(" ")} {...rest}>
      {data.map((d) => {
        const frac = clamp01(d.value / bound);
        const rowHue = d.color ?? (color === "ramp" ? undefined : color);
        const tint = rowHue ? HUE[rowHue] : rampColor(frac);
        const paint = rowHue
          ? `linear-gradient(90deg, ${tint}, ${tint})`
          : rampGradient();
        const span = !rowHue && frac > 0 ? `${(100 / frac).toFixed(3)}%` : "100%";

        return (
          <div className="kanso-barchart__row" key={d.label}>
            <span className="kanso-barchart__label" title={d.label}>
              {d.label}
            </span>
            <div
              className="kanso-barchart__track"
              role="meter"
              aria-label={d.label}
              aria-valuenow={d.value}
              aria-valuemin={0}
              aria-valuemax={bound}
            >
              <div
                className="kanso-barchart__fill"
                style={
                  {
                    "--kanso-barchart-frac": frac,
                    "--kanso-barchart-paint": paint,
                    "--kanso-barchart-span": span,
                  } as CSSProperties
                }
              />
            </div>
            {showValues && (
              <span className="kanso-barchart__value" style={{ color: tint }}>
                {formatValue(d.value)}
              </span>
            )}
          </div>
        );
      })}
    </div>
  );
});
