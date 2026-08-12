// SegmentBar — one stacked ratio bar for composition: disk used/free, tag
// split, memory breakdown. Lineage: btop's memory bar. Not a severity
// reading, so it takes explicit hues rather than the ramp.
import {
  type CSSProperties,
  type HTMLAttributes,
  forwardRef,
} from "react";
import { HUE, type Hue } from "../../ramp";

export interface SegmentBarSegment {
  label: string;
  value: number;
  color: Hue;
}

export interface SegmentBarProps extends Omit<HTMLAttributes<HTMLDivElement>, "color"> {
  segments: readonly SegmentBarSegment[];
  showLegend?: boolean;
}

export const SegmentBar = forwardRef<HTMLDivElement, SegmentBarProps>(
  function SegmentBar({ segments, showLegend = true, className = "", ...rest }, ref) {
    const total = segments.reduce((sum, s) => sum + Math.max(0, s.value), 0);
    const parts = segments.map((s) => ({
      ...s,
      pct: total > 0 ? (Math.max(0, s.value) / total) * 100 : 0,
    }));

    return (
      <div ref={ref} className={["kanso-segbar", className].join(" ")} {...rest}>
        <div
          className="kanso-segbar__track"
          role="img"
          aria-label={parts
            .map((p) => `${p.label} ${p.pct.toFixed(0)}%`)
            .join(", ")}
        >
          {parts.map((p) => (
            <span
              key={p.label}
              className="kanso-segbar__segment"
              style={
                {
                  width: `${p.pct}%`,
                  background: HUE[p.color],
                } as CSSProperties
              }
            />
          ))}
        </div>

        {showLegend && (
          <ul className="kanso-segbar__legend">
            {parts.map((p) => (
              <li className="kanso-segbar__item" key={p.label}>
                <span
                  className="kanso-segbar__swatch"
                  aria-hidden="true"
                  style={{ background: HUE[p.color] }}
                />
                <span className="kanso-segbar__name">{p.label}</span>
                <span className="kanso-segbar__pct">{p.pct.toFixed(0)}%</span>
              </li>
            ))}
          </ul>
        )}
      </div>
    );
  }
);
