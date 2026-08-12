// Readout — the primary stat tile: tiny tracked label, large tabular
// value, optional unit and delta. Lineage: NERV status panel × btop's
// header figures. Chamfered top-right with the shared .kanso-cut-tr clip.
import {
  type HTMLAttributes,
  type ReactNode,
  forwardRef,
} from "react";
import { MARK } from "../../glyphs";
import type { RampName } from "../../ramp";

export type ReadoutState = RampName | "info" | "neutral";

export interface ReadoutProps extends Omit<HTMLAttributes<HTMLDivElement>, "color"> {
  label: string;
  value: ReactNode;
  unit?: string;
  /** Signed change since the previous sample. Rendered with ▲ / ▼. */
  delta?: number;
  /** Suffix for the delta figure, e.g. "%" or "/s". */
  deltaUnit?: string;
  /** Flip delta colouring for metrics where "up" is bad (latency, errors). */
  deltaInverted?: boolean;
  state?: ReadoutState;
  footnote?: ReactNode;
}

const stateClass: Record<ReadoutState, string> = {
  nominal: "kanso-readout--nominal",
  caution: "kanso-readout--caution",
  elevated: "kanso-readout--elevated",
  warning: "kanso-readout--warning",
  critical: "kanso-readout--critical",
  info: "kanso-readout--info",
  neutral: "kanso-readout--neutral",
};

function formatDelta(n: number): string {
  const abs = Math.abs(n);
  return Number.isInteger(abs) ? String(abs) : abs.toFixed(1);
}

export const Readout = forwardRef<HTMLDivElement, ReadoutProps>(function Readout(
  {
    label,
    value,
    unit,
    delta,
    deltaUnit,
    deltaInverted = false,
    state = "neutral",
    footnote,
    className = "",
    ...rest
  },
  ref
) {
  const rising = delta !== undefined && delta > 0;
  const falling = delta !== undefined && delta < 0;
  const good = deltaInverted ? falling : rising;

  return (
    <div
      ref={ref}
      className={[
        "kanso-readout",
        "kanso-cut-tr",
        stateClass[state],
        className,
      ].join(" ")}
      {...rest}
    >
      <div className="kanso-readout__label">{label}</div>

      <div className="kanso-readout__row">
        <span className="kanso-readout__value">{value}</span>
        {unit !== undefined && <span className="kanso-readout__unit">{unit}</span>}
      </div>

      {delta !== undefined && (
        <div
          className={[
            "kanso-readout__delta",
            delta === 0
              ? "kanso-readout__delta--flat"
              : good
                ? "kanso-readout__delta--good"
                : "kanso-readout__delta--bad",
          ].join(" ")}
        >
          <span className="kanso-readout__arrow" aria-hidden="true">
            {delta === 0 ? MARK.bullet : rising ? MARK.up : MARK.down}
          </span>
          <span className="kanso-sr-only">{rising ? "up" : falling ? "down" : "unchanged"}</span>
          {formatDelta(delta)}
          {deltaUnit}
        </div>
      )}

      {footnote !== undefined && <div className="kanso-readout__footnote">{footnote}</div>}
    </div>
  );
});
