// Badge — Kanso label tag. Ported from Seele's NERV chip (mdrbx/nerv-ui,
// MIT), restyled onto Kanso tokens + class system. A Badge labels; a Chip is
// pressable — the Badge ramp stays one step below Chip's so the two never
// read as the same affordance.
import { type HTMLAttributes, type ReactNode, forwardRef } from "react";

export interface BadgeProps
  extends Omit<HTMLAttributes<HTMLSpanElement>, "color"> {
  variant?: "default" | "success" | "warning" | "danger" | "info";
  size?: "sm" | "md" | "lg";
  label: ReactNode;
  removable?: boolean;
  onRemove?: () => void;
  /** Accessible name for the remove button. Needed when `label` is a node. */
  removeLabel?: string;
  className?: string;
}

const variantClass: Record<NonNullable<BadgeProps["variant"]>, string> = {
  default: "kanso-badge--default",
  success: "kanso-badge--success",
  warning: "kanso-badge--warning",
  danger: "kanso-badge--danger",
  info: "kanso-badge--info",
};

const sizeClass: Record<NonNullable<BadgeProps["size"]>, string> = {
  sm: "kanso-badge--sm",
  md: "kanso-badge--md",
  lg: "kanso-badge--lg",
};

export const Badge = forwardRef<HTMLSpanElement, BadgeProps>(function Badge(
  {
    variant = "default",
    size = "md",
    label,
    removable = false,
    onRemove,
    removeLabel,
    className = "",
    ...rest
  },
  ref
) {
  // A ReactNode label stringifies to "[object Object]", so only a string
  // label can name the button; anything else falls back to the bare verb.
  const removeName =
    removeLabel ?? (typeof label === "string" ? `Remove ${label}` : "Remove");

  return (
    <span
      ref={ref}
      className={[
        "kanso-badge",
        variantClass[variant],
        sizeClass[size],
        removable ? "kanso-badge--removable" : "",
        className,
      ].join(" ")}
      {...rest}
    >
      {label}
      {removable && (
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            onRemove?.();
          }}
          className="kanso-badge__remove"
          aria-label={removeName}
        >
          ×
        </button>
      )}
    </span>
  );
});
