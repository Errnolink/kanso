// Sparkline — compact SVG line + area chart. Lineage: btop's history
// strips. No curve smoothing: telemetry is sampled, and a spline would
// draw values that were never measured. Crisp 1px non-scaling stroke.
import {
  type HTMLAttributes,
  forwardRef,
  useId,
} from "react";
import { type Hue, resolveHue } from "../../ramp";

export interface SparklineProps extends Omit<HTMLAttributes<HTMLDivElement>, "color"> {
  values: readonly number[];
  color?: Hue | "ramp";
  /** Draw the area under the line as a fade to transparent. */
  fill?: boolean;
  height?: number;
  /** Sampling resolution and the intrinsic width when not fluid. */
  width?: number;
  /**
   * Stretch to the container's width, keeping `height` exact. On by
   * default — a telemetry trace almost always wants the space it is given,
   * and `preserveAspectRatio="none"` plus a non-scaling stroke means
   * stretching horizontally costs nothing. Set false for a fixed inline
   * strip, e.g. inside a table cell.
   */
  fluid?: boolean;
  /** Fixed upper bound. Defaults to the series peak. */
  max?: number;
  /** Value the area is measured from. Defaults to 0. */
  baseline?: number;
}

export const Sparkline = forwardRef<HTMLDivElement, SparklineProps>(function Sparkline(
  {
    values,
    color = "ramp",
    fill = true,
    height = 28,
    width = 140,
    fluid = true,
    max,
    baseline = 0,
    className = "",
    "aria-label": ariaLabel,
    ...rest
  },
  ref
) {
  // useId() emits colons, which are legal in an id but awkward in url(#…).
  const gradientId = `kanso-spark-${useId().replace(/:/g, "")}`;
  const series = values.length > 0 ? values : [baseline];
  const peak = max ?? Math.max(...series, baseline + 1e-9);
  const floor = Math.min(baseline, ...series);
  const range = Math.max(1e-9, peak - floor);
  const last = series[series.length - 1];
  const tint = resolveHue(color, (last - floor) / range);

  // Half-pixel inset so a 1px stroke lands on the pixel grid.
  const top = 0.5;
  const bottom = height - 0.5;
  const step = series.length > 1 ? (width - 1) / (series.length - 1) : 0;
  const points = series.map((v, i) => {
    const x = 0.5 + i * step;
    const y = bottom - ((v - floor) / range) * (bottom - top);
    return `${x.toFixed(2)},${y.toFixed(2)}`;
  });

  const line = `M ${points.join(" L ")}`;
  const area = `${line} L ${(0.5 + (series.length - 1) * step).toFixed(2)},${bottom} L 0.5,${bottom} Z`;

  return (
    <div
      ref={ref}
      className={["kanso-sparkline", fluid ? "kanso-sparkline--fluid" : "", className]
        .filter(Boolean)
        .join(" ")}
      role="img"
      aria-label={
        ariaLabel ??
        `Sparkline, ${series.length} samples, latest ${last}, peak ${peak.toFixed(2)}`
      }
      {...rest}
    >
      <svg
        className="kanso-sparkline__svg"
        width={width}
        height={height}
        viewBox={`0 0 ${width} ${height}`}
        preserveAspectRatio="none"
        aria-hidden="true"
        focusable="false"
      >
        {fill && (
          <defs>
            <linearGradient id={gradientId} x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor={tint} stopOpacity="0.28" />
              <stop offset="100%" stopColor={tint} stopOpacity="0" />
            </linearGradient>
          </defs>
        )}
        {fill && <path className="kanso-sparkline__area" d={area} fill={`url(#${gradientId})`} />}
        <path
          className="kanso-sparkline__line"
          d={line}
          stroke={tint}
          fill="none"
          vectorEffect="non-scaling-stroke"
        />
      </svg>
    </div>
  );
});
