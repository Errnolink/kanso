// HazardStripe — the diagonal caution barber-pole that frames a NERV
// viewport. Two of these (top and bottom) instantly read as "this is an
// instrument, not a document". Use sparingly: at most one pair per screen,
// and only to mark the outer boundary or an actively dangerous region.
import { forwardRef, type HTMLAttributes } from "react";

export interface HazardStripeProps extends HTMLAttributes<HTMLDivElement> {
  /** Fixed to a viewport edge, or inline in the flow. */
  edge?: "top" | "bottom" | "none";
  color?: "primary" | "danger" | "warning" | "accent";
  /** Stripe thickness. Defaults to the 6px token. */
  height?: number | string;
  /** Slide the stripes — reserve it for genuinely active states. */
  animated?: boolean;
  /**
   * Distance from the viewport edge, for docking clear of another fixed
   * element. Only meaningful with `edge="top"` or `"bottom"` — an inline
   * stripe is not positioned, so there is nothing to offset from.
   */
  offset?: number | string;
}

export const HazardStripe = forwardRef<HTMLDivElement, HazardStripeProps>(
  function HazardStripe(
    { edge = "none", color = "primary", height, animated = false, offset, className = "", style, ...rest },
    ref
  ) {
    return (
      <div
        ref={ref}
        aria-hidden="true"
        className={[
          "kanso-hazard",
          `kanso-hazard--${color}`,
          edge !== "none" ? `kanso-hazard--${edge}` : "",
          animated ? "kanso-hazard--animated" : "",
          className,
        ]
          .filter(Boolean)
          .join(" ")}
        style={{
          ...style,
          ...(height !== undefined ? { height } : null),
          // Only applied to a docked stripe. An inline one is static, so
          // setting `top` on it would be a silent no-op.
          ...(offset !== undefined && edge === "bottom" ? { bottom: offset } : null),
          ...(offset !== undefined && edge === "top" ? { top: offset } : null),
        }}
        {...rest}
      />
    );
  }
);
