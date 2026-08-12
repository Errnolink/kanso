// Button — Kanso command button. Mechanical in-out motion, chamfered cut,
// mono label. Variant + size follow the system-wide naming convention.
import { type ButtonHTMLAttributes, forwardRef } from "react";

export interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "secondary" | "ghost" | "danger";
  size?: "sm" | "md" | "lg";
}

const variantClass: Record<NonNullable<ButtonProps["variant"]>, string> = {
  primary: "kanso-btn--primary",
  secondary: "kanso-btn--secondary",
  ghost: "kanso-btn--ghost",
  danger: "kanso-btn--danger",
};

const sizeClass: Record<NonNullable<ButtonProps["size"]>, string> = {
  sm: "kanso-btn--sm",
  md: "kanso-btn--md",
  lg: "kanso-btn--lg",
};

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(function Button(
  { variant = "primary", size = "md", type = "button", className = "", ...rest },
  ref
) {
  return (
    <button
      ref={ref}
      type={type}
      className={["kanso-btn", variantClass[variant], sizeClass[size], className].join(" ")}
      {...rest}
    />
  );
});
