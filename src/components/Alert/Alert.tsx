// Alert — inline status banner (NERV caution placard lineage). A left accent
// bar in the level colour, an 8% wash of the same hue, uppercase mono title.
// Persistent by nature: unlike a Toast it stays until the condition clears.
import { type HTMLAttributes, type ReactNode, forwardRef } from "react";

export type AlertLevel = "info" | "success" | "warning" | "danger";

export interface AlertProps
  extends Omit<HTMLAttributes<HTMLDivElement>, "title"> {
  level: AlertLevel;
  title: ReactNode;
  /** Optional body copy under the title. */
  children?: ReactNode;
  /** Render a dismiss control. Omit for a banner the user cannot silence. */
  onDismiss?: () => void;
}

const GLYPH: Record<AlertLevel, string> = {
  info: "i",
  success: "✓",
  warning: "!",
  danger: "✕",
};

export const Alert = forwardRef<HTMLDivElement, AlertProps>(function Alert(
  { level, title, children, onDismiss, className = "", ...rest },
  ref
) {
  return (
    <div
      ref={ref}
      role={level === "danger" ? "alert" : "status"}
      className={["kanso-alert", `kanso-alert--${level}`, className]
        .filter(Boolean)
        .join(" ")}
      {...rest}
    >
      <span className="kanso-alert__glyph" aria-hidden="true">
        {GLYPH[level]}
      </span>

      <div className="kanso-alert__text">
        <p className="kanso-alert__title">{title}</p>
        {children && <div className="kanso-alert__body">{children}</div>}
      </div>

      {onDismiss && (
        <button
          type="button"
          className="kanso-alert__close"
          aria-label="Dismiss alert"
          onClick={onDismiss}
        >
          ✕
        </button>
      )}
    </div>
  );
});
