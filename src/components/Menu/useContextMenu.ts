// useContextMenu — right-click plumbing for <Menu>. Captures the pointer
// position, keeps open state, and hands back a props bag that can be spread
// straight onto the Menu. (NERV console lineage: every surface has a command
// list behind it.)
import { useCallback, useMemo, useState, type MouseEvent } from "react";
import type { MenuProps } from "./Menu";

export interface ContextMenuState {
  open: boolean;
  /** Viewport coordinates of the last right-click. */
  anchor: { x: number; y: number };
  /** Attach to the element that should own the menu. */
  onContextMenu: (event: MouseEvent) => void;
  /** Open at an explicit point, e.g. from a keyboard shortcut. */
  openAt: (x: number, y: number) => void;
  close: () => void;
  /** Spread onto <Menu {...menuProps} items={...} />. */
  menuProps: Pick<MenuProps, "open" | "onClose" | "anchor">;
}

export function useContextMenu(): ContextMenuState {
  const [open, setOpen] = useState(false);
  const [anchor, setAnchor] = useState({ x: 0, y: 0 });

  const onContextMenu = useCallback((event: MouseEvent) => {
    event.preventDefault();
    setAnchor({ x: event.clientX, y: event.clientY });
    setOpen(true);
  }, []);

  const openAt = useCallback((x: number, y: number) => {
    setAnchor({ x, y });
    setOpen(true);
  }, []);

  const close = useCallback(() => setOpen(false), []);

  const menuProps = useMemo(
    () => ({ open, onClose: close, anchor }),
    [open, close, anchor]
  );

  return { open, anchor, onContextMenu, openAt, close, menuProps };
}
