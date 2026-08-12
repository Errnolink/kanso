// Toast — transient alert card (NERV alert bus × btop status line). Stacked
// bottom-right, chamfered, hairline-framed, with a thin ramp-coloured rule
// running out along the bottom edge as the dwell time expires.
//
// The stack is announced through one polite live region; individual cards
// are `role="status"` so a screen reader reads them as they arrive.
import {
  type CSSProperties,
  type ReactNode,
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { createPortal } from "react-dom";
import {
  ToastContext,
  type ToastApi,
  type ToastLevel,
  type ToastOptions,
  type ToastRecord,
} from "./useToast";

export interface ToastProps {
  level?: ToastLevel;
  title?: ReactNode;
  message?: ReactNode;
  /** Auto-dismiss in ms. `0` pins the card. */
  duration?: number;
  onDismiss?: () => void;
  className?: string;
  children?: ReactNode;
}

export interface ToastProviderProps {
  children?: ReactNode;
  /** Default dwell time in ms. */
  duration?: number;
  /** Hard cap on visible cards; the oldest is dropped past it. */
  max?: number;
}

const LEVEL_GLYPH: Record<ToastLevel, string> = {
  info: "i",
  success: "✓",
  warning: "!",
  danger: "✕",
};

/** One card. Owns its own dwell timer so hovering can pause just that card. */
export function Toast({
  level = "info",
  title,
  message,
  duration = 4000,
  onDismiss,
  className = "",
  children,
}: ToastProps) {
  const [paused, setPaused] = useState(false);
  const remainingRef = useRef(duration);
  const startedRef = useRef(0);

  useEffect(() => {
    remainingRef.current = duration;
  }, [duration]);

  useEffect(() => {
    if (duration <= 0 || paused) return;
    startedRef.current = Date.now();
    const t = window.setTimeout(() => onDismiss?.(), remainingRef.current);
    return () => {
      window.clearTimeout(t);
      remainingRef.current = Math.max(
        0,
        remainingRef.current - (Date.now() - startedRef.current)
      );
    };
  }, [duration, paused, onDismiss]);

  return (
    <div
      role="status"
      className={[
        "kanso-toast",
        `kanso-toast--${level}`,
        "kanso-cut-tr",
        className,
      ]
        .filter(Boolean)
        .join(" ")}
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
      onFocusCapture={() => setPaused(true)}
      onBlurCapture={() => setPaused(false)}
    >
      <span className="kanso-toast__glyph" aria-hidden="true">
        {LEVEL_GLYPH[level]}
      </span>

      <div className="kanso-toast__text">
        {title && <p className="kanso-toast__title">{title}</p>}
        {message && <p className="kanso-toast__message">{message}</p>}
        {children}
      </div>

      {onDismiss && (
        <button
          type="button"
          className="kanso-toast__close"
          aria-label="Dismiss notification"
          onClick={onDismiss}
        >
          ✕
        </button>
      )}

      {duration > 0 && (
        <span
          className="kanso-toast__countdown"
          aria-hidden="true"
          style={
            {
              animationDuration: `${duration}ms`,
              animationPlayState: paused ? "paused" : "running",
            } as CSSProperties
          }
        />
      )}
    </div>
  );
}

let seq = 0;

export function ToastProvider({
  children,
  duration = 4000,
  max = 5,
}: ToastProviderProps) {
  const [items, setItems] = useState<ToastRecord[]>([]);
  const [mounted, setMounted] = useState(false);

  useEffect(() => setMounted(true), []);

  const dismiss = useCallback((id?: string) => {
    setItems((prev) => (id === undefined ? [] : prev.filter((t) => t.id !== id)));
  }, []);

  const toast = useCallback(
    (options: ToastOptions | string) => {
      const opts: ToastOptions =
        typeof options === "string" ? { title: options } : options;
      seq += 1;
      const id = `kanso-toast-${seq}`;
      setItems((prev) => {
        const next = [...prev, { id, duration, ...opts }];
        return next.length > max ? next.slice(next.length - max) : next;
      });
      return id;
    },
    [duration, max]
  );

  const api = useMemo<ToastApi>(() => ({ toast, dismiss }), [toast, dismiss]);

  return (
    <ToastContext.Provider value={api}>
      {children}
      {mounted &&
        createPortal(
          <div
            className="kanso-toast-viewport"
            role="region"
            aria-label="Notifications"
            aria-live="polite"
            aria-relevant="additions text"
          >
            {items.map((t) => (
              <Toast
                key={t.id}
                level={t.level}
                title={t.title}
                message={t.message}
                duration={t.duration ?? duration}
                onDismiss={() => dismiss(t.id)}
              />
            ))}
          </div>,
          document.body
        )}
    </ToastContext.Provider>
  );
}
