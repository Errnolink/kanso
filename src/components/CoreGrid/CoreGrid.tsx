// CoreGrid — btop's per-core CPU grid: a dense matrix of tiny labelled
// meters. Lineage: btop. Deliberately bespoke rather than a grid of
// <Meter>s: at 32+ cells the label/bar/value must share one baseline row.
import {
  type CSSProperties,
  type HTMLAttributes,
  forwardRef,
} from "react";
import { HUE, type Hue, rampColor, rampGradient } from "../../ramp";

export interface CoreGridCore {
  label: string;
  value: number;
}

export interface CoreGridProps extends Omit<HTMLAttributes<HTMLDivElement>, "color"> {
  cores: readonly CoreGridCore[];
  /**
   * Maximum columns. The grid auto-fits, so a panel too narrow to keep a
   * cell legible at this count drops to fewer, wider cells instead.
   */
  columns?: number;
  /** Upper bound of each core's value. Defaults to 1. */
  max?: number;
  color?: Hue | "ramp";
  showValues?: boolean;
  /** Cell scale. `sm` is the old hairline density. Defaults to `md`. */
  size?: "sm" | "md" | "lg";
}

const sizeClass: Record<NonNullable<CoreGridProps["size"]>, string> = {
  sm: "kanso-coregrid--sm",
  md: "kanso-coregrid--md",
  lg: "kanso-coregrid--lg",
};

function clamp01(n: number): number {
  return n < 0 ? 0 : n > 1 ? 1 : Number.isFinite(n) ? n : 0;
}

export const CoreGrid = forwardRef<HTMLDivElement, CoreGridProps>(function CoreGrid(
  {
    cores,
    columns = 4,
    max = 1,
    color = "ramp",
    showValues = true,
    size = "md",
    className = "",
    style,
    ...rest
  },
  ref
) {
  return (
    <div
      ref={ref}
      className={["kanso-coregrid", sizeClass[size], className].join(" ")}
      style={{ ...style, "--kanso-coregrid-columns": String(columns) } as CSSProperties}
      {...rest}
    >
      {cores.map((core) => {
        const frac = clamp01(max > 0 ? core.value / max : 0);
        const tint = color === "ramp" ? rampColor(frac) : HUE[color];
        const paint =
          color === "ramp" ? rampGradient() : `linear-gradient(90deg, ${tint}, ${tint})`;
        const span = color === "ramp" && frac > 0 ? `${(100 / frac).toFixed(3)}%` : "100%";

        return (
          <div className="kanso-coregrid__cell" key={core.label}>
            <span className="kanso-coregrid__label">{core.label}</span>
            <div
              className="kanso-coregrid__track"
              role="meter"
              aria-label={core.label}
              aria-valuenow={core.value}
              aria-valuemin={0}
              aria-valuemax={max}
              aria-valuetext={`${Math.round(frac * 100)}%`}
            >
              <div
                className="kanso-coregrid__fill"
                style={
                  {
                    "--kanso-coregrid-frac": frac,
                    "--kanso-coregrid-paint": paint,
                    "--kanso-coregrid-span": span,
                  } as CSSProperties
                }
              />
            </div>
            {showValues && (
              <span className="kanso-coregrid__value" style={{ color: tint }}>
                {Math.round(frac * 100)}
              </span>
            )}
          </div>
        );
      })}
    </div>
  );
});
