// Takeover — the full-bleed alert. Third and loudest rung of the escalation
// strip → banner → takeover: `position: fixed; inset: 0`, one enormous word
// in the level colour on black, hazard chevrons top and bottom, everything
// else gone. A critical alert rendered as a slightly-redder toast has thrown
// away the point.
//
// The mount/focus/scroll-lock machinery is deliberately Modal's, verbatim in
// shape, so the two dialogs behave identically. The one addition is that the
// reduce-motion switches are resolved in JS as well as in CSS: the takeover
// portals to <body>, outside `.kanso-root`, where the global opt-outs in
// base/a11y.css cannot reach it by descent.
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
import { HazardStripe } from "../HazardStripe/HazardStripe";

export type TakeoverLevel = "danger" | "warning";

export interface TakeoverProps extends HTMLAttributes<HTMLDivElement> {
  open: boolean;
  /** The single enormous word. One word — this is not a headline slot. */
  word: string;
  /** Dim mono line under the word. */
  detail?: ReactNode;
  level?: TakeoverLevel;
  /** Hex or ordinal prefix — `05:`, `0B:`. Real ordinals only. */
  code?: string;
  /** Button row under the detail. */
  actions?: ReactNode;
  /** Omit for an alert the user cannot silence: no Escape, no close control. */
  onDismiss?: () => void;
  /** Off by default, and off under either reduce-motion switch. See the CSS. */
  strobe?: boolean;
}

const FOCUSABLE = [
  "a[href]",
  "button:not([disabled])",
  "input:not([disabled]):not([type='hidden'])",
  "select:not([disabled])",
  "textarea:not([disabled])",
  "[tabindex]:not([tabindex='-1'])",
].join(",");

function motionSuppressed(): boolean {
  if (typeof document === "undefined") return true;
  return (
    prefersReducedMotion() ||
    document.querySelector(".kanso-reduce-motion") !== null
  );
}

export const Takeover = forwardRef<HTMLDivElement, TakeoverProps>(
  function Takeover(
    {
      open,
      word,
      detail,
      level = "danger",
      code,
      actions,
      onDismiss,
      strobe = false,
      className = "",
      ...rest
    },
    ref
  ) {
    const autoId = useId();
    const codeId = `kanso-takeover-code-${autoId}`;
    const wordId = `kanso-takeover-word-${autoId}`;
    const detailId = `kanso-takeover-detail-${autoId}`;

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

    // Body scroll lock for as long as the alert owns the screen.
    useEffect(() => {
      if (!mounted) return;
      const prev = document.body.style.overflow;
      document.body.style.overflow = "hidden";
      return () => {
        document.body.style.overflow = prev;
      };
    }, [mounted]);

    // Escape dismisses — but only when the alert is dismissible at all.
    useEffect(() => {
      if (!mounted || !onDismiss) return;
      const onKey = (e: globalThis.KeyboardEvent) => {
        if (e.key === "Escape") {
          e.stopPropagation();
          onDismiss();
        }
      };
      document.addEventListener("keydown", onKey, true);
      return () => document.removeEventListener("keydown", onKey, true);
    }, [mounted, onDismiss]);

    const trapTab = useCallback((e: ReactKeyboardEvent<HTMLDivElement>) => {
      if (e.key !== "Tab") return;
      const panel = panelRef.current;
      if (!panel) return;
      const nodes = Array.from(
        panel.querySelectorAll<HTMLElement>(FOCUSABLE)
      ).filter((n) => n.offsetParent !== null || n === document.activeElement);
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
        ref={(node) => {
          panelRef.current = node;
          if (typeof ref === "function") ref(node);
          else if (ref) ref.current = node;
        }}
        role="alertdialog"
        aria-modal="true"
        aria-labelledby={code ? `${codeId} ${wordId}` : wordId}
        aria-describedby={detail ? detailId : undefined}
        tabIndex={-1}
        onKeyDown={trapTab}
        className={[
          "kanso-takeover",
          `kanso-takeover--${level}`,
          closing ? "kanso-takeover--closing" : "",
          strobe && !motionSuppressed() ? "kanso-takeover--strobe" : "",
          className,
        ]
          .filter(Boolean)
          .join(" ")}
        {...rest}
      >
        <HazardStripe edge="top" color={level} />

        <div className="kanso-takeover__body">
          {code && (
            <p className="kanso-takeover__code" id={codeId}>
              {code}
            </p>
          )}

          <p className="kanso-takeover__word" id={wordId}>
            {word}
          </p>

          {detail && (
            <div className="kanso-takeover__detail" id={detailId}>
              {detail}
            </div>
          )}

          {actions && <div className="kanso-takeover__actions">{actions}</div>}
        </div>

        {onDismiss && (
          <button
            type="button"
            className="kanso-takeover__close"
            aria-label="Dismiss alert"
            onClick={onDismiss}
          >
            ✕
          </button>
        )}

        <HazardStripe edge="bottom" color={level} />
      </div>,
      document.body
    );
  }
);
