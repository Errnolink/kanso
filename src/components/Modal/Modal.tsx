// Modal — NERV command dialog. Black scrim, hairline panel, orange accent
// rule across the top and L-bracket corners marking the frame as targeted.
// Enters in 160ms and leaves in 100ms, transform + opacity only.
//
// The frame markup is local on purpose: Modal owns its brackets rather than
// depending on a shared Frame component.
import {
  type HTMLAttributes,
  type KeyboardEvent as ReactKeyboardEvent,
  type ReactNode,
  forwardRef,
  useCallback,
  useEffect,
  useId,
  useRef,
  useState,
} from "react";
import { createPortal } from "react-dom";
import { DURATION, prefersReducedMotion } from "../../motion";

export interface ModalProps
  extends Omit<HTMLAttributes<HTMLDivElement>, "title"> {
  open: boolean;
  onClose: () => void;
  /** Panel title — also the dialog's accessible name. */
  title: ReactNode;
  /** Dim mono line under the title. */
  subtitle?: ReactNode;
  /** Footer strip, usually a right-aligned button row. */
  footer?: ReactNode;
  size?: "sm" | "md" | "lg" | "full";
  /** Blur whatever is behind the scrim. Costs a backdrop-filter. */
  blur?: boolean;
  /** Clicking the scrim closes. Default true. */
  dismissOnScrim?: boolean;
  children?: ReactNode;
}

const FOCUSABLE = [
  "a[href]",
  "button:not([disabled])",
  "input:not([disabled]):not([type='hidden'])",
  "select:not([disabled])",
  "textarea:not([disabled])",
  "[tabindex]:not([tabindex='-1'])",
].join(",");

export const Modal = forwardRef<HTMLDivElement, ModalProps>(function Modal(
  {
    open,
    onClose,
    title,
    subtitle,
    footer,
    size = "md",
    blur = false,
    dismissOnScrim = true,
    className = "",
    children,
    ...rest
  },
  ref
) {
  const autoId = useId();
  const titleId = `kanso-modal-title-${autoId}`;
  const subtitleId = `kanso-modal-subtitle-${autoId}`;

  const panelRef = useRef<HTMLDivElement | null>(null);
  const restoreRef = useRef<HTMLElement | null>(null);
  const [mounted, setMounted] = useState(open);
  const [closing, setClosing] = useState(false);

  // Mount on open; on close, hold the node for one exit beat, then drop it.
  useEffect(() => {
    if (open) {
      setMounted(true);
      setClosing(false);
      return;
    }
    if (!mounted) return;
    setClosing(true);
    const ms = prefersReducedMotion() ? 0 : DURATION.panelExit;
    const t = window.setTimeout(() => {
      setMounted(false);
      setClosing(false);
    }, ms);
    return () => window.clearTimeout(t);
  }, [open, mounted]);

  // Remember the trigger, move focus in, and give it back on the way out.
  useEffect(() => {
    if (!mounted || closing) return;
    restoreRef.current = document.activeElement as HTMLElement | null;
    const panel = panelRef.current;
    if (!panel) return;
    const first = panel.querySelector<HTMLElement>(FOCUSABLE);
    (first ?? panel).focus({ preventScroll: true });
    return () => {
      restoreRef.current?.focus?.({ preventScroll: true });
    };
  }, [mounted, closing]);

  // Body scroll lock for as long as the dialog owns the screen.
  useEffect(() => {
    if (!mounted) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = prev;
    };
  }, [mounted]);

  // Escape closes, wherever focus currently is.
  useEffect(() => {
    if (!mounted) return;
    const onKey = (e: globalThis.KeyboardEvent) => {
      if (e.key === "Escape") {
        e.stopPropagation();
        onClose();
      }
    };
    document.addEventListener("keydown", onKey, true);
    return () => document.removeEventListener("keydown", onKey, true);
  }, [mounted, onClose]);

  const trapTab = useCallback((e: ReactKeyboardEvent<HTMLDivElement>) => {
    if (e.key !== "Tab") return;
    const panel = panelRef.current;
    if (!panel) return;
    const nodes = Array.from(panel.querySelectorAll<HTMLElement>(FOCUSABLE)).filter(
      (n) => n.offsetParent !== null || n === document.activeElement
    );
    if (nodes.length === 0) {
      e.preventDefault();
      panel.focus({ preventScroll: true });
      return;
    }
    const first = nodes[0];
    const last = nodes[nodes.length - 1];
    if (e.shiftKey && document.activeElement === first) {
      e.preventDefault();
      last.focus();
    } else if (!e.shiftKey && document.activeElement === last) {
      e.preventDefault();
      first.focus();
    }
  }, []);

  if (!mounted || typeof document === "undefined") return null;

  return createPortal(
    <div
      className={[
        "kanso-modal",
        closing ? "kanso-modal--closing" : "",
        blur ? "kanso-modal--blur" : "",
      ]
        .filter(Boolean)
        .join(" ")}
    >
      <div
        className="kanso-modal__scrim"
        onMouseDown={dismissOnScrim ? onClose : undefined}
        aria-hidden="true"
      />

      <div
        ref={(node) => {
          panelRef.current = node;
          if (typeof ref === "function") ref(node);
          else if (ref) ref.current = node;
        }}
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        aria-describedby={subtitle ? subtitleId : undefined}
        tabIndex={-1}
        onKeyDown={trapTab}
        className={[
          "kanso-modal__panel",
          `kanso-modal__panel--${size}`,
          className,
        ]
          .filter(Boolean)
          .join(" ")}
        {...rest}
      >
        {/* Targeting frame — four L-brackets, decoration only. */}
        <span className="kanso-modal__bracket kanso-modal__bracket--tl" aria-hidden="true" />
        <span className="kanso-modal__bracket kanso-modal__bracket--tr" aria-hidden="true" />
        <span className="kanso-modal__bracket kanso-modal__bracket--bl" aria-hidden="true" />
        <span className="kanso-modal__bracket kanso-modal__bracket--br" aria-hidden="true" />

        <header className="kanso-modal__header">
          <div className="kanso-modal__heading">
            <h2 className="kanso-modal__title" id={titleId}>
              {title}
            </h2>
            {subtitle && (
              <p className="kanso-modal__subtitle" id={subtitleId}>
                {subtitle}
              </p>
            )}
          </div>
          <button
            type="button"
            className="kanso-modal__close"
            aria-label="Close dialog"
            onClick={onClose}
          >
            ✕
          </button>
        </header>

        <div className="kanso-modal__body kanso-scroll-thin">{children}</div>

        {footer && <footer className="kanso-modal__footer">{footer}</footer>}
      </div>
    </div>,
    document.body
  );
});
