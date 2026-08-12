// Progress — determinate and indeterminate progress bar.
// Lineage: NERV operation chrome. Determinate scales a solid fill on the
// transform axis; indeterminate sweeps a narrow band across the track and
// stops dead under prefers-reduced-motion.
import {
  type CSSProperties,
  type HTMLAttributes,
  forwardRef,
} from "react";
import { HUE, type Hue } from "../../ramp";

export interface ProgressProps extends Omit<HTMLAttributes<HTMLDivElement>, "color"> {
  /** Omit (or set `indeterminate`) for an unknown-duration operation. */
  value?: number;
  max?: number;
  label?: string;
  showValue?: boolean;
  indeterminate?: boolean;
  color?: Hue;
  size?: "sm" | "md";
}

function clamp01(n: number): number {
  return n < 0 ? 0 : n > 1 ? 1 : Number.isFinite(n) ? n : 0;
}

export const Progress = forwardRef<HTMLDivElement, ProgressProps>(function Progress(
  {
    value,
    max = 1,
    label,
    showValue = true,
    indeterminate,
    color = "primary",
    size = "md",
    className = "",
    style,
    "aria-label": ariaLabel,
    ...rest
  },
  ref
) {
  // No value means nothing to report: an honest sweep beats a determinate
  // bar with no aria-valuenow, even when `indeterminate` is explicitly false.
  const running = indeterminate === true || value === undefined;
  const frac = running ? 0 : clamp01(max > 0 ? (value ?? 0) / max : 0);
  const pct = Math.round(frac * 100);
  const tint = HUE[color];

  return (
    <div
      ref={ref}
      className={[
        "kanso-progress",
        size === "sm" ? "kanso-progress--sm" : "kanso-progress--md",
        className,
      ].join(" ")}
      style={{ ...style, "--kanso-progress-tint": tint } as CSSProperties}
      {...rest}
    >
      {(label !== undefined || showValue) && (
        <div className="kanso-progress__head">
          {label !== undefined && <span className="kanso-progress__label">{label}</span>}
          {showValue && (
            <span className="kanso-progress__value">{running ? "···" : `${pct}%`}</span>
          )}
        </div>
      )}

      <div
        className="kanso-progress__track"
        role="progressbar"
        aria-label={ariaLabel ?? label ?? "progress"}
        aria-valuemin={running ? undefined : 0}
        aria-valuemax={running ? undefined : max}
        aria-valuenow={running ? undefined : value}
        aria-valuetext={running ? undefined : `${pct}%`}
      >
        {running ? (
          <div className="kanso-progress__band" />
        ) : (
          <div
            className="kanso-progress__fill"
            style={{ "--kanso-progress-frac": frac } as CSSProperties}
          />
        )}
      </div>
    </div>
  );
});
