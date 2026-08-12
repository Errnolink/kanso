// Divider — NERV section separator. A coloured rule with an optional
// bracketed label sitting in a gap punched out of the middle. Horizontal
// dividers head sections; vertical ones separate clusters inside a toolbar.
import { forwardRef, type HTMLAttributes } from "react";

export interface DividerProps extends Omit<HTMLAttributes<HTMLDivElement>, "color"> {
  label?: string;
  color?: "primary" | "info" | "success" | "danger" | "muted";
  variant?: "solid" | "dashed" | "dotted";
  orientation?: "horizontal" | "vertical";
  /** Where the label sits on a horizontal rule. */
  align?: "start" | "center" | "end";
}

export const Divider = forwardRef<HTMLDivElement, DividerProps>(function Divider(
  {
    label,
    color = "primary",
    variant = "solid",
    orientation = "horizontal",
    align = "start",
    className = "",
    ...rest
  },
  ref
) {
  if (orientation === "vertical") {
    return (
      <div
        ref={ref}
        role="separator"
        aria-orientation="vertical"
        className={[
          "kanso-divider",
          "kanso-divider--vertical",
          `kanso-divider--${color}`,
          className,
        ]
          .filter(Boolean)
          .join(" ")}
        {...rest}
      />
    );
  }

  return (
    <div
      ref={ref}
      role="separator"
      aria-orientation="horizontal"
      className={[
        "kanso-divider",
        "kanso-divider--horizontal",
        `kanso-divider--${color}`,
        `kanso-divider--${variant}`,
        label ? `kanso-divider--labeled kanso-divider--${align}` : "",
        className,
      ]
        .filter(Boolean)
        .join(" ")}
      {...rest}
    >
      {label && <span className="kanso-divider__label">[ {label} ]</span>}
    </div>
  );
});
