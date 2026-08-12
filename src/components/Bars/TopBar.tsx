// TopBar — the command masthead. Brand block on the left, free slots in the
// middle, telemetry cluster on the right. Deliberately three fixed slots:
// every NERV screen in the wild ends up with exactly this arrangement, and
// pretending otherwise just means each app reinvents the flexbox.
import { forwardRef, type HTMLAttributes, type ReactNode } from "react";

export interface TopBarProps extends HTMLAttributes<HTMLElement> {
  left?: ReactNode;
  center?: ReactNode;
  right?: ReactNode;
  /** Float over live content. */
  glass?: boolean;
  /** Stick to the top of the scroll container. */
  sticky?: boolean;
  /** Electron frameless-window drag region. */
  draggable?: boolean;
  children?: ReactNode;
}

export const TopBar = forwardRef<HTMLElement, TopBarProps>(function TopBar(
  { left, center, right, glass = false, sticky = false, draggable = false, className = "", children, ...rest },
  ref
) {
  return (
    <header
      ref={ref}
      className={[
        "kanso-topbar",
        glass ? "kanso-glass kanso-topbar--glass" : "",
        sticky ? "kanso-topbar--sticky" : "",
        draggable ? "kanso-drag" : "",
        className,
      ]
        .filter(Boolean)
        .join(" ")}
      {...rest}
    >
      {left && <div className="kanso-topbar__slot kanso-topbar__slot--left kanso-no-drag">{left}</div>}
      {center && <div className="kanso-topbar__slot kanso-topbar__slot--center kanso-no-drag">{center}</div>}
      {children}
      {right && <div className="kanso-topbar__slot kanso-topbar__slot--right kanso-no-drag">{right}</div>}
    </header>
  );
});

export interface BrandProps extends HTMLAttributes<HTMLDivElement> {
  /** Wordmark. Rendered in the compressed stamp face. */
  name: ReactNode;
  /** Small uppercase line underneath — division, subsystem, build. */
  sub?: ReactNode;
  /** Japanese institutional subtitle, set in mincho. */
  jp?: ReactNode;
  /** Version tag, tinted cyan. */
  version?: ReactNode;
}

/** Brand — the compressed wordmark block used at the left of a TopBar. */
export const Brand = forwardRef<HTMLDivElement, BrandProps>(function Brand(
  { name, sub, jp, version, className = "", ...rest },
  ref
) {
  return (
    <div ref={ref} className={["kanso-brand", className].filter(Boolean).join(" ")} {...rest}>
      <span className="kanso-brand__name kanso-stamp">{name}</span>
      {(sub || version || jp) && (
        <span className="kanso-brand__sub">
          {jp && <span className="kanso-jp kanso-brand__jp">{jp}</span>}
          {sub}
          {version && <span className="kanso-brand__version">{version}</span>}
        </span>
      )}
    </div>
  );
});
