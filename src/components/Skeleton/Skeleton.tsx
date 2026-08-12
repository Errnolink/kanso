// Skeleton — loading placeholder. Lineage: NERV "awaiting telemetry"
// blanks. Opacity pulse only: a moving background-position sweep repaints
// every frame, and a virtualized grid can show fifty of these at once.
import {
  type CSSProperties,
  type HTMLAttributes,
  forwardRef,
} from "react";

export interface SkeletonProps extends HTMLAttributes<HTMLDivElement> {
  width?: number | string;
  height?: number | string;
  /** Render N stacked bars — a paragraph or list placeholder. */
  count?: number;
}

export const Skeleton = forwardRef<HTMLDivElement, SkeletonProps>(function Skeleton(
  { width = "100%", height = 12, count = 1, className = "", style, ...rest },
  ref
) {
  const bars = Math.max(1, count);
  const box: CSSProperties = { width, height };

  if (bars === 1) {
    return (
      <div
        ref={ref}
        aria-hidden="true"
        className={["kanso-skeleton", className].join(" ")}
        style={{ ...box, ...style }}
        {...rest}
      />
    );
  }

  return (
    <div
      ref={ref}
      aria-hidden="true"
      className={["kanso-skeleton__stack", className].join(" ")}
      style={style}
      {...rest}
    >
      {Array.from({ length: bars }, (_, i) => (
        <div
          key={i}
          className="kanso-skeleton"
          style={{
            ...box,
            // Last bar runs short, the way real text does.
            width: i === bars - 1 ? "62%" : width,
          }}
        />
      ))}
    </div>
  );
});
