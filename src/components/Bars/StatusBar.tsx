// StatusBar — the docked telemetry strip. A row of label/value cells
// separated by hairlines, plus a free right slot. This is the bottom edge
// of every btop-shaped app: always-visible, never interactive.
import { forwardRef, type HTMLAttributes, type ReactNode } from "react";

export interface StatusCell {
  label?: ReactNode;
  value: ReactNode;
  /** Tints the value. Defaults to plain text. */
  state?: "nominal" | "caution" | "elevated" | "warning" | "critical" | "info" | "dim";
  /** Push this and everything after it to the right edge. */
  spacer?: boolean;
}

export interface StatusBarProps extends HTMLAttributes<HTMLElement> {
  cells?: StatusCell[];
  /** Dock to the bottom of the viewport. */
  fixed?: boolean;
  glass?: boolean;
  children?: ReactNode;
}

export const StatusBar = forwardRef<HTMLElement, StatusBarProps>(function StatusBar(
  { cells = [], fixed = false, glass = false, className = "", children, ...rest },
  ref
) {
  return (
    <footer
      ref={ref}
      className={[
        "kanso-statusbar",
        fixed ? "kanso-statusbar--fixed" : "",
        glass ? "kanso-glass" : "",
        className,
      ]
        .filter(Boolean)
        .join(" ")}
      {...rest}
    >
      {cells.map((cell, i) => (
        <div
          key={i}
          className={[
            "kanso-statusbar__cell",
            cell.spacer ? "kanso-statusbar__cell--spacer" : "",
          ]
            .filter(Boolean)
            .join(" ")}
        >
          {cell.label && <span className="kanso-statusbar__label">{cell.label}</span>}
          <span
            className={[
              "kanso-statusbar__value",
              cell.state ? `kanso-statusbar__value--${cell.state}` : "",
            ]
              .filter(Boolean)
              .join(" ")}
          >
            {cell.value}
          </span>
        </div>
      ))}
      {children}
    </footer>
  );
});
