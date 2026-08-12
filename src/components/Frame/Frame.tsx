// Frame — the NERV targeting container. Four L-brackets, a label straddling
// the top rule, a faint readout at top-right, guide rails, and an optional
// survey grid. Pure 1px lines and black shading: no glow, no fill.
//
// Use it where a Panel would feel too solid — around a modal body, a preview
// stage, a selected region. A Panel contains; a Frame targets.
import {
  forwardRef,
  type CSSProperties,
  type HTMLAttributes,
  type ReactNode,
} from "react";
import { HUE, type Hue } from "../../ramp";

/** Frames take any system hue. Kept as an alias so `FrameColor` stays a
 *  meaningful name at call sites. */
export type FrameColor = Hue;

export interface FrameProps extends Omit<HTMLAttributes<HTMLDivElement>, "color"> {
  /** Label straddling the top edge. */
  label?: ReactNode;
  /** Faint readout parked at the top-right — coordinates, mode, count. */
  readout?: ReactNode;
  color?: FrameColor;
  /** Arm length of the corner brackets, in px. */
  bracketSize?: number;
  /** Survey grid backdrop. Off by default — it is loud. */
  crosshairs?: boolean;
  /** Horizontal guide rails under the label and above the bottom edge. */
  rails?: boolean;
  children?: ReactNode;
}

export const Frame = forwardRef<HTMLDivElement, FrameProps>(function Frame(
  {
    label,
    readout,
    color = "primary",
    bracketSize = 18,
    crosshairs = false,
    rails = true,
    className = "",
    style,
    children,
    ...rest
  },
  ref
) {
  const c = HUE[color];

  return (
    <div
      ref={ref}
      className={["kanso-frame", className].filter(Boolean).join(" ")}
      style={
        {
          ...style,
          "--kanso-frame-color": c,
          // Overrides the token for this subtree so the guide rails and the
          // top-right readout stay pinned to the bracket arms at any size.
          "--kanso-shape-bracket": `${bracketSize}px`,
        } as CSSProperties
      }
      {...rest}
    >
      {crosshairs && (
        <div className="kanso-grid-backdrop kanso-frame__grid" aria-hidden="true" />
      )}

      {rails && (
        <>
          <div className="kanso-frame__rail kanso-frame__rail--top" aria-hidden="true" />
          <div className="kanso-frame__rail kanso-frame__rail--bottom" aria-hidden="true" />
        </>
      )}

      <div className="kanso-frame__bracket kanso-frame__bracket--tl" aria-hidden="true" />
      <div className="kanso-frame__bracket kanso-frame__bracket--tr" aria-hidden="true" />
      <div className="kanso-frame__bracket kanso-frame__bracket--bl" aria-hidden="true" />
      <div className="kanso-frame__bracket kanso-frame__bracket--br" aria-hidden="true" />

      {/* The header sits in normal flow and is pulled up to straddle the top
          rule, rather than being absolutely positioned. Absolute children
          contribute nothing to intrinsic width, so a label longer than the
          body used to overhang the frame and collide with the brackets. */}
      {(label || readout) && (
        <div className="kanso-frame__header">
          {label && <span className="kanso-frame__label">{label}</span>}
          {readout && <span className="kanso-frame__readout">{readout}</span>}
        </div>
      )}

      <div className="kanso-frame__body">{children}</div>
    </div>
  );
});
