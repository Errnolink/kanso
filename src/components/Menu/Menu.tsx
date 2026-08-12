// Menu — dropdown / context menu (NERV console command list lineage).
// Portalled, anchored to a point or an element, hairline framed, with
// right-aligned dim mono shortcut hints. Roving focus over `role="menuitem"`
// children; Escape, Tab and an outside click all close it.
import {
  useCallback,
  useEffect,
  useLayoutEffect,
  useRef,
  useState,
  type CSSProperties,
  type KeyboardEvent as ReactKeyboardEvent,
  type ReactNode,
  type RefObject,
} from "react";
import { createPortal } from "react-dom";

export interface MenuActionItem {
  key: string;
  label: ReactNode;
  icon?: ReactNode;
  /** Right-aligned hint, e.g. "⌘K" or "CTRL+D". */
  shortcut?: string;
  danger?: boolean;
  disabled?: boolean;
  onSelect?: () => void;
  separator?: false;
}

export interface MenuSeparatorItem {
  key: string;
  separator: true;
}

export type MenuItem = MenuActionItem | MenuSeparatorItem;

export type MenuAnchor =
  | { x: number; y: number }
  | RefObject<HTMLElement | null>;

export interface MenuProps {
  open: boolean;
  onClose: () => void;
  items: readonly MenuItem[];
  /** A viewport point (context menu) or an element ref (dropdown). */
  anchor: MenuAnchor;
  /** Accessible name for the menu. */
  label?: string;
  className?: string;
}

const EDGE = 8;

function isSeparator(item: MenuItem): item is MenuSeparatorItem {
  return (item as MenuSeparatorItem).separator === true;
}

function isPoint(a: MenuAnchor): a is { x: number; y: number } {
  return typeof (a as { x?: number }).x === "number";
}

export function Menu({
  open,
  onClose,
  items,
  anchor,
  label = "Menu",
  className = "",
}: MenuProps) {
  const listRef = useRef<HTMLDivElement | null>(null);
  const itemRefs = useRef<Array<HTMLButtonElement | null>>([]);
  const [coords, setCoords] = useState<{ top: number; left: number } | null>(null);

  const enabled = items
    .map((item, i) => ({ item, i }))
    .filter(({ item }) => !isSeparator(item) && !item.disabled)
    .map(({ i }) => i);

  // --- placement ---------------------------------------------------------
  useLayoutEffect(() => {
    if (!open) {
      setCoords(null);
      return;
    }
    const el = listRef.current;
    if (!el) return;

    const w = el.offsetWidth;
    const h = el.offsetHeight;
    const vw = window.innerWidth;
    const vh = window.innerHeight;

    let top: number;
    let left: number;

    if (isPoint(anchor)) {
      top = anchor.y;
      left = anchor.x;
      if (top + h > vh - EDGE) top = Math.max(EDGE, anchor.y - h);
      if (left + w > vw - EDGE) left = Math.max(EDGE, anchor.x - w);
    } else {
      const rect = anchor.current?.getBoundingClientRect();
      top = (rect?.bottom ?? EDGE) + 2;
      left = rect?.left ?? EDGE;
      if (rect && top + h > vh - EDGE) top = Math.max(EDGE, rect.top - h - 2);
      if (left + w > vw - EDGE) left = Math.max(EDGE, vw - w - EDGE);
    }

    setCoords({ top, left });
  }, [open, anchor, items]);

  // --- focus the first live row on open ----------------------------------
  useEffect(() => {
    if (!open) return;
    const first = enabled[0];
    if (first === undefined) {
      listRef.current?.focus({ preventScroll: true });
      return;
    }
    itemRefs.current[first]?.focus({ preventScroll: true });
    // `enabled` is derived from `items`, which is already a dependency.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, items]);

  // --- dismiss ------------------------------------------------------------
  useEffect(() => {
    if (!open) return;
    const onDown = (e: MouseEvent) => {
      if (!listRef.current?.contains(e.target as Node)) onClose();
    };
    const onScroll = () => onClose();
    document.addEventListener("mousedown", onDown, true);
    window.addEventListener("resize", onScroll);
    window.addEventListener("scroll", onScroll, true);
    return () => {
      document.removeEventListener("mousedown", onDown, true);
      window.removeEventListener("resize", onScroll);
      window.removeEventListener("scroll", onScroll, true);
    };
  }, [open, onClose]);

  const focusAt = useCallback(
    (position: number) => {
      if (enabled.length === 0) return;
      const wrapped = (position + enabled.length) % enabled.length;
      itemRefs.current[enabled[wrapped]]?.focus();
    },
    [enabled]
  );

  const handleKeyDown = useCallback(
    (e: ReactKeyboardEvent<HTMLButtonElement>, index: number) => {
      const at = enabled.indexOf(index);
      switch (e.key) {
        case "ArrowDown":
          e.preventDefault();
          focusAt(at + 1);
          break;
        case "ArrowUp":
          e.preventDefault();
          focusAt(at - 1);
          break;
        case "Home":
          e.preventDefault();
          focusAt(0);
          break;
        case "End":
          e.preventDefault();
          focusAt(enabled.length - 1);
          break;
        case "Escape":
          e.preventDefault();
          e.stopPropagation();
          onClose();
          break;
        case "Tab":
          onClose();
          break;
        default:
          break;
      }
    },
    [enabled, focusAt, onClose]
  );

  if (!open || typeof document === "undefined") return null;

  return createPortal(
    <div
      ref={listRef}
      role="menu"
      aria-label={label}
      tabIndex={-1}
      className={["kanso-menu", coords ? "kanso-menu--placed" : "", className]
        .filter(Boolean)
        .join(" ")}
      style={
        {
          top: `${coords?.top ?? 0}px`,
          left: `${coords?.left ?? 0}px`,
        } as CSSProperties
      }
    >
      {items.map((item, i) =>
        isSeparator(item) ? (
          <div key={item.key} role="separator" className="kanso-menu__separator" />
        ) : (
          <button
            key={item.key}
            ref={(node) => {
              itemRefs.current[i] = node;
            }}
            type="button"
            role="menuitem"
            tabIndex={-1}
            disabled={item.disabled}
            className={[
              "kanso-menu__item",
              item.danger ? "kanso-menu__item--danger" : "",
            ]
              .filter(Boolean)
              .join(" ")}
            onClick={() => {
              if (item.disabled) return;
              item.onSelect?.();
              onClose();
            }}
            onKeyDown={(e) => handleKeyDown(e, i)}
          >
            <span className="kanso-menu__icon" aria-hidden="true">
              {item.icon}
            </span>
            <span className="kanso-menu__label">{item.label}</span>
            {item.shortcut && (
              <span className="kanso-menu__shortcut" aria-hidden="true">
                {item.shortcut}
              </span>
            )}
          </button>
        )
      )}
    </div>,
    document.body
  );
}
