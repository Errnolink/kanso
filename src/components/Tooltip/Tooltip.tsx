// Tooltip — hover/focus readout (NERV instrument callout lineage). True
// black slab, dim orange hairline, top-right chamfer, tiny uppercase tracked
// mono, positioned from measured rects through a portal so nothing depends
// on a positioning library.
//
// The trigger is cloned rather than wrapped, so `aria-describedby` lands on
// the real interactive element and layout is untouched.
import {
  cloneElement,
  isValidElement,
  useCallback,
  useEffect,
  useId,
  useLayoutEffect,
  useRef,
  useState,
  type CSSProperties,
  type ReactElement,
  type ReactNode,
  type Ref,
} from "react";
import { createPortal } from "react-dom";

export type TooltipPlacement = "top" | "bottom" | "left" | "right";

export interface TooltipProps {
  /** Tooltip body. Keep it to a few words — this is a callout, not a card. */
  content: ReactNode;
  placement?: TooltipPlacement;
  /** Hover dwell before showing, in ms. Focus always shows immediately. */
  delay?: number;
  /** Turn the tooltip off without unmounting the trigger. */
  disabled?: boolean;
  /** Exactly one element. It receives the handlers and the description id. */
  children: ReactElement;
}

// Distance from the anchor's edge to the callout. Deliberately generous:
// at 6px the slab all but touched its trigger and read as part of the card
// behind it rather than as chrome floating over it.
const GAP = 10;
const EDGE = 8;

type Coords = { top: number; left: number; placement: TooltipPlacement };

function place(
  anchor: DOMRect,
  tip: { width: number; height: number },
  wanted: TooltipPlacement
): Coords {
  const vw = window.innerWidth;
  const vh = window.innerHeight;

  const fits: Record<TooltipPlacement, boolean> = {
    top: anchor.top - tip.height - GAP >= EDGE,
    bottom: anchor.bottom + tip.height + GAP <= vh - EDGE,
    left: anchor.left - tip.width - GAP >= EDGE,
    right: anchor.right + tip.width + GAP <= vw - EDGE,
  };

  const opposite: Record<TooltipPlacement, TooltipPlacement> = {
    top: "bottom",
    bottom: "top",
    left: "right",
    right: "left",
  };

  const placement = fits[wanted] ? wanted : fits[opposite[wanted]] ? opposite[wanted] : wanted;

  let top = 0;
  let left = 0;

  switch (placement) {
    case "top":
      top = anchor.top - tip.height - GAP;
      left = anchor.left + anchor.width / 2 - tip.width / 2;
      break;
    case "bottom":
      top = anchor.bottom + GAP;
      left = anchor.left + anchor.width / 2 - tip.width / 2;
      break;
    case "left":
      top = anchor.top + anchor.height / 2 - tip.height / 2;
      left = anchor.left - tip.width - GAP;
      break;
    case "right":
      top = anchor.top + anchor.height / 2 - tip.height / 2;
      left = anchor.right + GAP;
      break;
  }

  left = Math.max(EDGE, Math.min(left, vw - tip.width - EDGE));
  top = Math.max(EDGE, Math.min(top, vh - tip.height - EDGE));

  return { top, left, placement };
}

export function Tooltip({
  content,
  placement = "top",
  delay = 200,
  disabled = false,
  children,
}: TooltipProps) {
  const id = `kanso-tooltip-${useId()}`;
  const anchorRef = useRef<HTMLElement | null>(null);
  const tipRef = useRef<HTMLDivElement | null>(null);
  const timerRef = useRef<number | null>(null);

  const [visible, setVisible] = useState(false);
  const [coords, setCoords] = useState<Coords | null>(null);

  const clearTimer = useCallback(() => {
    if (timerRef.current !== null) {
      window.clearTimeout(timerRef.current);
      timerRef.current = null;
    }
  }, []);

  const show = useCallback(
    (immediate: boolean) => {
      if (disabled || !content) return;
      clearTimer();
      if (immediate || delay <= 0) {
        setVisible(true);
        return;
      }
      timerRef.current = window.setTimeout(() => setVisible(true), delay);
    },
    [clearTimer, content, delay, disabled]
  );

  const hide = useCallback(() => {
    clearTimer();
    setVisible(false);
    setCoords(null);
  }, [clearTimer]);

  useEffect(() => clearTimer, [clearTimer]);

  const reposition = useCallback(() => {
    const anchor = anchorRef.current;
    const tip = tipRef.current;
    if (!anchor || !tip) return;
    const rect = anchor.getBoundingClientRect();
    setCoords(
      place(rect, { width: tip.offsetWidth, height: tip.offsetHeight }, placement)
    );
  }, [placement]);

  useLayoutEffect(() => {
    if (!visible) return;
    reposition();
  }, [visible, reposition, content]);

  useEffect(() => {
    if (!visible) return;
    const onScroll = () => reposition();
    const onKey = (e: globalThis.KeyboardEvent) => {
      if (e.key === "Escape") hide();
    };
    window.addEventListener("scroll", onScroll, true);
    window.addEventListener("resize", onScroll);
    document.addEventListener("keydown", onKey);
    return () => {
      window.removeEventListener("scroll", onScroll, true);
      window.removeEventListener("resize", onScroll);
      document.removeEventListener("keydown", onKey);
    };
  }, [visible, reposition, hide]);

  if (!isValidElement(children)) return children;

  const childRef = (children as ReactElement & { ref?: Ref<HTMLElement> }).ref;
  const childProps = children.props as Record<string, unknown>;

  const setAnchor = (node: HTMLElement | null) => {
    anchorRef.current = node;
    if (typeof childRef === "function") childRef(node);
    else if (childRef && typeof childRef === "object") {
      (childRef as { current: HTMLElement | null }).current = node;
    }
  };

  const chain =
    (own: () => void, theirs: unknown) =>
    (event: unknown) => {
      own();
      if (typeof theirs === "function") (theirs as (e: unknown) => void)(event);
    };

  const describedBy = [childProps["aria-describedby"], visible ? id : null]
    .filter(Boolean)
    .join(" ");

  // Re-typed with an open prop bag so `ref` and the handlers are accepted;
  // React 18's `ReactElement` defaults its props to `unknown`.
  const element = children as ReactElement<Record<string, unknown>>;

  const trigger = cloneElement(element, {
    ref: setAnchor,
    "aria-describedby": describedBy || undefined,
    onMouseEnter: chain(() => show(false), childProps.onMouseEnter),
    onMouseLeave: chain(hide, childProps.onMouseLeave),
    onFocus: chain(() => show(true), childProps.onFocus),
    onBlur: chain(hide, childProps.onBlur),
  });

  return (
    <>
      {trigger}
      {visible &&
        typeof document !== "undefined" &&
        createPortal(
          <div
            ref={tipRef}
            id={id}
            role="tooltip"
            className={[
              "kanso-tooltip",
              "kanso-cut-tr",
              `kanso-tooltip--${coords?.placement ?? placement}`,
              coords ? "kanso-tooltip--placed" : "",
            ]
              .filter(Boolean)
              .join(" ")}
            style={
              {
                top: `${coords?.top ?? 0}px`,
                left: `${coords?.left ?? 0}px`,
              } as CSSProperties
            }
          >
            {content}
          </div>,
          document.body
        )}
    </>
  );
}
