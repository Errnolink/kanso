// Panel — the NERV HUD surface. Every block of content in a Kanso app
// lives in one of these: hairline frame, 2px coloured accent rule declaring
// the panel's role, uppercase mono header, optional notched corners.
//
// Notch direction encodes anchoring — a panel notches away from the screen
// edge it hugs, so a left-docked panel uses notch="left".
import {
  forwardRef,
  useId,
  type HTMLAttributes,
  type ReactNode,
} from "react";

export type PanelAccent = "primary" | "danger" | "info" | "success" | "accent" | "none";

export interface PanelProps extends Omit<HTMLAttributes<HTMLDivElement>, "title"> {
  /** Header label. Omit for a bare framed surface. */
  title?: ReactNode;
  /** Small dim text after the title — unit, count, source. */
  meta?: ReactNode;
  /** Right-hand header slot: buttons, chips, a live readout. */
  actions?: ReactNode;
  /** Footer strip below the body. */
  footer?: ReactNode;
  /** Colour of the 2px top rule. Declares what the panel is for. */
  accent?: PanelAccent;
  /** Corner treatment. Notch away from the edge the panel is docked to. */
  notch?: "left" | "right" | "none";
  /** Float over live content (map, video). Costs a backdrop-filter. */
  glass?: boolean;
  /** Body scrolls instead of growing. */
  scroll?: boolean;
  /** Remove body padding — for tables and lists that own their own gutters. */
  flush?: boolean;
  children?: ReactNode;
}

const accentClass: Record<PanelAccent, string> = {
  primary: "kanso-rule-primary",
  danger: "kanso-rule-danger",
  info: "kanso-rule-info",
  success: "kanso-rule-success",
  accent: "kanso-rule-accent",
  none: "",
};

const notchClass = {
  left: "kanso-notch",
  right: "kanso-notch-tr",
  none: "",
} as const;

// Ref is HTMLElement, not HTMLDivElement — this renders a <section>.
export const Panel = forwardRef<HTMLElement, PanelProps>(function Panel(
  {
    title,
    meta,
    actions,
    footer,
    accent = "primary",
    notch = "none",
    glass = false,
    scroll = false,
    flush = false,
    className = "",
    children,
    ...rest
  },
  ref
) {
  // A <section> only becomes a landmark once it has a name, so the title
  // doubles as the region label when there is one.
  const titleId = useId();

  return (
    <section
      ref={ref}
      aria-labelledby={title ? titleId : undefined}
      className={[
        "kanso-panel",
        glass ? "kanso-glass" : "kanso-surface",
        accentClass[accent],
        notchClass[notch],
        className,
      ]
        .filter(Boolean)
        .join(" ")}
      {...rest}
    >
      {(title || actions) && (
        <header className={`kanso-panel__header kanso-panel__header--${accent}`}>
          {title && (
            <span id={titleId} className="kanso-panel__title">
              {title}
            </span>
          )}
          {meta && <span className="kanso-panel__meta">{meta}</span>}
          {actions && <div className="kanso-panel__actions">{actions}</div>}
        </header>
      )}
      <div
        className={[
          "kanso-panel__body",
          scroll ? "kanso-panel__body--scroll kanso-scroll-thin" : "",
          flush ? "kanso-panel__body--flush" : "",
        ]
          .filter(Boolean)
          .join(" ")}
      >
        {children}
      </div>
      {footer && <footer className="kanso-panel__footer">{footer}</footer>}
    </section>
  );
});
