// Spinner — indeterminate activity (NERV scanning reticle × btop's braille
// throbber). Two modes: a rotating bracket ring drawn as SVG corner strokes
// (a square reticle, not a circle of dots), and a `glyph` mode that cycles
// the braille frames a terminal would use inline with text.
import {
  type HTMLAttributes,
  forwardRef,
  useEffect,
  useState,
} from "react";
import { DURATION, prefersReducedMotion } from "../../motion";

export type SpinnerColor =
  | "primary"
  | "info"
  | "success"
  | "warning"
  | "danger"
  | "accent"
  | "dim";

export interface SpinnerProps
  extends Omit<HTMLAttributes<HTMLSpanElement>, "color"> {
  size?: "sm" | "md" | "lg";
  color?: SpinnerColor;
  /** Accessible name, also used for an adjacent visible caption if shown. */
  label?: string;
  /** `ring` is the reticle; `glyph` is the inline braille throbber. */
  variant?: "ring" | "glyph";
  /** Print the label next to the spinner in dim mono. */
  showLabel?: boolean;
}

/** btop's throbber, frame for frame. */
export const BRAILLE_FRAMES = [
  "⠋", "⠙", "⠹", "⠸", "⠼", "⠴", "⠦", "⠧", "⠇", "⠏",
] as const;

/** One frame per motion "instant" tick — the token, not a magic number. */
const FRAME_MS = DURATION.instant;

export const Spinner = forwardRef<HTMLSpanElement, SpinnerProps>(
  function Spinner(
    {
      size = "md",
      color = "primary",
      label = "Loading",
      variant = "ring",
      showLabel = false,
      className = "",
      ...rest
    },
    ref
  ) {
    const [frame, setFrame] = useState(0);

    useEffect(() => {
      if (variant !== "glyph") return;
      if (prefersReducedMotion()) return;
      const id = window.setInterval(
        () => setFrame((f) => (f + 1) % BRAILLE_FRAMES.length),
        FRAME_MS
      );
      return () => window.clearInterval(id);
    }, [variant]);

    return (
      <span
        ref={ref}
        role="status"
        aria-label={showLabel ? undefined : label}
        className={[
          "kanso-spinner",
          `kanso-spinner--${size}`,
          `kanso-spinner--${color}`,
          `kanso-spinner--${variant}`,
          className,
        ]
          .filter(Boolean)
          .join(" ")}
        {...rest}
      >
        {variant === "glyph" ? (
          <span className="kanso-spinner__glyph" aria-hidden="true">
            {BRAILLE_FRAMES[frame]}
          </span>
        ) : (
          <svg
            className="kanso-spinner__ring"
            viewBox="0 0 24 24"
            aria-hidden="true"
            focusable="false"
          >
            {/* Outer reticle — four corner brackets, rotating. */}
            <g className="kanso-spinner__arc kanso-spinner__arc--outer">
              <path d="M2 7V2h5" />
              <path d="M17 2h5v5" />
              <path d="M22 17v5h-5" />
              <path d="M7 22H2v-5" />
            </g>
            {/* Inner pair — counter-rotating, half the sweep. */}
            <g className="kanso-spinner__arc kanso-spinner__arc--inner">
              <path d="M8 8h4" />
              <path d="M16 16h-4" />
            </g>
          </svg>
        )}

        {showLabel && <span className="kanso-spinner__label">{label}</span>}
      </span>
    );
  }
);
