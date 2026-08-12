// IconButton — square glyph key (NERV console keycap lineage). A single
// chamfered cell holding one glyph: dark surface, hairline orange-dim edge,
// orange ink, brightening on hover. No label, so `label` is mandatory and
// becomes the accessible name.
import { type ButtonHTMLAttributes, type ReactNode, forwardRef } from "react";

export interface IconButtonProps
  extends Omit<ButtonHTMLAttributes<HTMLButtonElement>, "aria-label"> {
  /** Visual treatment. `ghost` is transparent until hovered. */
  variant?: "ghost" | "outline" | "solid" | "danger";
  size?: "sm" | "md" | "lg";
  /** Required — becomes `aria-label`, since the button has no text. */
  label: string;
  /** The glyph. A character, an SVG, anything one cell wide. */
  children: ReactNode;
}

const variantClass: Record<NonNullable<IconButtonProps["variant"]>, string> = {
  ghost: "kanso-icon-btn--ghost",
  outline: "kanso-icon-btn--outline",
  solid: "kanso-icon-btn--solid",
  danger: "kanso-icon-btn--danger",
};

const sizeClass: Record<NonNullable<IconButtonProps["size"]>, string> = {
  sm: "kanso-icon-btn--sm",
  md: "kanso-icon-btn--md",
  lg: "kanso-icon-btn--lg",
};

export const IconButton = forwardRef<HTMLButtonElement, IconButtonProps>(
  function IconButton(
    {
      variant = "outline",
      size = "md",
      label,
      type = "button",
      className = "",
      children,
      ...rest
    },
    ref
  ) {
    return (
      <button
        ref={ref}
        type={type}
        aria-label={label}
        title={label}
        className={[
          "kanso-icon-btn",
          "kanso-cut-sm",
          variantClass[variant],
          sizeClass[size],
          className,
        ]
          .filter(Boolean)
          .join(" ")}
        {...rest}
      >
        <span className="kanso-icon-btn__glyph" aria-hidden="true">
          {children}
        </span>
      </button>
    );
  }
);
