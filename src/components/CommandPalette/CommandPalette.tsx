// CommandPalette — the flagship overlay (NERV MAGI command entry × btop's
// keyboard-first ethos). A prompt line, a subsequence filter, grouped
// results, and a key legend. Everything is monospace and everything is
// reachable from the keyboard: ↑↓ to move, ↵ to run, ESC to abort.
//
// Semantics follow the combobox/listbox pattern: the input owns focus for
// the whole session and points at the active row with aria-activedescendant,
// so the rows themselves are never focused.
import {
  useCallback,
  useEffect,
  useId,
  useMemo,
  useRef,
  useState,
  type KeyboardEvent as ReactKeyboardEvent,
  type ReactNode,
} from "react";
import { createPortal } from "react-dom";
import { MARK } from "../../glyphs";
import { DURATION, prefersReducedMotion } from "../../motion";

export interface Command {
  id: string;
  /** Plain text — it is filtered and match-highlighted character by character. */
  label: string;
  /** Section heading. Commands without one land in `defaultGroup`. */
  group?: string;
  /** Dim right-aligned hint: a shortcut, a target, a value. */
  hint?: string;
  /** Extra search terms that never render. */
  keywords?: readonly string[];
  onRun: () => void;
  disabled?: boolean;
}

export interface CommandPaletteProps {
  open: boolean;
  onClose: () => void;
  commands: readonly Command[];
  placeholder?: string;
  /** Heading for commands with no `group`. */
  defaultGroup?: string;
  /** Shown when the filter matches nothing. */
  emptyMessage?: ReactNode;
}

interface Scored {
  command: Command;
  score: number;
  indices: readonly number[];
}

/**
 * Subsequence match: every query character must appear in order. Contiguous
 * runs and word starts score higher, and an earlier first hit wins ties, so
 * "op" ranks "OPEN FILE" above "REPORT PANEL".
 */
function fuzzyScore(
  text: string,
  query: string
): { score: number; indices: number[] } | null {
  const hay = text.toLowerCase();
  const needle = query.toLowerCase();
  if (needle.length === 0) return { score: 0, indices: [] };

  const indices: number[] = [];
  let score = 0;
  let at = 0;
  let previous = -2;

  for (const ch of needle) {
    const found = hay.indexOf(ch, at);
    if (found === -1) return null;
    indices.push(found);
    if (found === previous + 1) score += 8;
    if (found === 0 || /[\s\-_/.]/.test(hay[found - 1] ?? "")) score += 6;
    score += Math.max(0, 4 - found * 0.1);
    previous = found;
    at = found + 1;
  }

  // Shorter haystacks are more precise matches.
  score += Math.max(0, 20 - text.length * 0.2);
  return { score, indices };
}

function Highlight({ text, indices }: { text: string; indices: readonly number[] }) {
  if (indices.length === 0) return <>{text}</>;
  const hit = new Set(indices);
  return (
    <>
      {Array.from(text).map((ch, i) =>
        hit.has(i) ? (
          <mark key={i} className="kanso-cmdk__hit">
            {ch}
          </mark>
        ) : (
          <span key={i}>{ch}</span>
        )
      )}
    </>
  );
}

export function CommandPalette({
  open,
  onClose,
  commands,
  placeholder = "TYPE A COMMAND",
  defaultGroup = "COMMANDS",
  emptyMessage = "NO MATCHING COMMAND",
}: CommandPaletteProps) {
  const autoId = useId();
  const listId = `kanso-cmdk-list-${autoId}`;
  const rowId = (id: string) => `kanso-cmdk-row-${autoId}-${id}`;

  const [query, setQuery] = useState("");
  const [active, setActive] = useState(0);
  const [mounted, setMounted] = useState(open);
  const [closing, setClosing] = useState(false);

  const inputRef = useRef<HTMLInputElement | null>(null);
  const listRef = useRef<HTMLDivElement | null>(null);
  const restoreRef = useRef<HTMLElement | null>(null);

  // --- mount / unmount with an exit beat ---------------------------------
  useEffect(() => {
    if (open) {
      setMounted(true);
      setClosing(false);
      return;
    }
    if (!mounted) return;
    setClosing(true);
    const ms = prefersReducedMotion() ? 0 : DURATION.overlayExit;
    const t = window.setTimeout(() => {
      setMounted(false);
      setClosing(false);
    }, ms);
    return () => window.clearTimeout(t);
  }, [open, mounted]);

  // Fresh prompt on every session; focus in, focus back out.
  useEffect(() => {
    if (!open) return;
    setQuery("");
    setActive(0);
    restoreRef.current = document.activeElement as HTMLElement | null;
    const t = window.setTimeout(
      () => inputRef.current?.focus({ preventScroll: true }),
      0
    );
    return () => {
      window.clearTimeout(t);
      restoreRef.current?.focus?.({ preventScroll: true });
    };
  }, [open]);

  useEffect(() => {
    if (!mounted) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = prev;
    };
  }, [mounted]);

  // --- filtering ----------------------------------------------------------
  const results = useMemo<Scored[]>(() => {
    const q = query.trim();
    const scored: Scored[] = [];

    for (const command of commands) {
      if (command.disabled) continue;
      if (q.length === 0) {
        scored.push({ command, score: 0, indices: [] });
        continue;
      }
      const onLabel = fuzzyScore(command.label, q);
      if (onLabel) {
        scored.push({ command, score: onLabel.score + 100, indices: onLabel.indices });
        continue;
      }
      const alt = [command.group ?? "", ...(command.keywords ?? [])].join(" ");
      const onAlt = alt.trim() ? fuzzyScore(alt, q) : null;
      if (onAlt) scored.push({ command, score: onAlt.score, indices: [] });
    }

    if (q.length === 0) return scored;
    return scored.sort((a, b) => b.score - a.score);
  }, [commands, query]);

  // Grouped for display, but navigation runs over the flat order.
  const groups = useMemo(() => {
    const order: string[] = [];
    const bucket = new Map<string, Scored[]>();
    for (const row of results) {
      const name = row.command.group ?? defaultGroup;
      if (!bucket.has(name)) {
        bucket.set(name, []);
        order.push(name);
      }
      bucket.get(name)?.push(row);
    }
    return order.map((name) => ({ name, rows: bucket.get(name) ?? [] }));
  }, [results, defaultGroup]);

  const flat = useMemo(() => groups.flatMap((g) => g.rows), [groups]);

  useEffect(() => {
    setActive(0);
  }, [query]);

  const activeId = flat[active]?.command.id;

  // Keep the cursor row inside the scroll port.
  useEffect(() => {
    if (!activeId || !listRef.current) return;
    const node = listRef.current.querySelector<HTMLElement>(
      `[data-kanso-cmdk-id="${CSS.escape(activeId)}"]`
    );
    node?.scrollIntoView({ block: "nearest" });
  }, [activeId]);

  const run = useCallback(
    (row?: Scored) => {
      if (!row) return;
      row.command.onRun();
      onClose();
    },
    [onClose]
  );

  const handleKeyDown = useCallback(
    (e: ReactKeyboardEvent<HTMLDivElement>) => {
      switch (e.key) {
        case "ArrowDown":
          e.preventDefault();
          setActive((i) => (flat.length === 0 ? 0 : (i + 1) % flat.length));
          break;
        case "ArrowUp":
          e.preventDefault();
          setActive((i) =>
            flat.length === 0 ? 0 : (i - 1 + flat.length) % flat.length
          );
          break;
        case "Home":
          e.preventDefault();
          setActive(0);
          break;
        case "End":
          e.preventDefault();
          setActive(Math.max(0, flat.length - 1));
          break;
        case "Enter":
          e.preventDefault();
          run(flat[active]);
          break;
        case "Escape":
          e.preventDefault();
          e.stopPropagation();
          onClose();
          break;
        case "Tab":
          // One tab stop: the palette owns the keyboard while it is open.
          e.preventDefault();
          break;
        default:
          break;
      }
    },
    [flat, active, run, onClose]
  );

  if (!mounted || typeof document === "undefined") return null;

  return createPortal(
    <div
      className={["kanso-cmdk", closing ? "kanso-cmdk--closing" : ""]
        .filter(Boolean)
        .join(" ")}
      onKeyDown={handleKeyDown}
    >
      <div className="kanso-cmdk__scrim" onMouseDown={onClose} aria-hidden="true" />

      <div
        className="kanso-cmdk__panel"
        role="dialog"
        aria-modal="true"
        aria-label="Command palette"
      >
        <div className="kanso-cmdk__prompt">
          <span className="kanso-cmdk__caret" aria-hidden="true">
            {MARK.prompt}
          </span>
          <input
            ref={inputRef}
            className="kanso-cmdk__input"
            type="text"
            role="combobox"
            aria-expanded="true"
            aria-controls={listId}
            aria-autocomplete="list"
            aria-activedescendant={activeId ? rowId(activeId) : undefined}
            aria-label="Command"
            placeholder={placeholder}
            spellCheck={false}
            autoComplete="off"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
          />
          <span className="kanso-cmdk__count" aria-hidden="true">
            {flat.length.toString().padStart(2, "0")}
          </span>
        </div>

        <div
          ref={listRef}
          id={listId}
          role="listbox"
          aria-label="Commands"
          className="kanso-cmdk__list kanso-scroll-thin"
        >
          {flat.length === 0 && (
            <p className="kanso-cmdk__empty">{emptyMessage}</p>
          )}

          {groups.map((group) => (
            <div key={group.name} role="group" aria-label={group.name} className="kanso-cmdk__group">
              <div className="kanso-cmdk__group-label" aria-hidden="true">
                {group.name}
              </div>
              {group.rows.map((row) => {
                const index = flat.indexOf(row);
                const isActive = index === active;
                return (
                  <div
                    key={row.command.id}
                    id={rowId(row.command.id)}
                    data-kanso-cmdk-id={row.command.id}
                    role="option"
                    aria-selected={isActive}
                    className={[
                      "kanso-cmdk__row",
                      isActive ? "kanso-cmdk__row--active" : "",
                    ]
                      .filter(Boolean)
                      .join(" ")}
                    onMouseMove={() => setActive(index)}
                    onMouseDown={(e) => e.preventDefault()}
                    onClick={() => run(row)}
                  >
                    <span className="kanso-cmdk__row-mark" aria-hidden="true">
                      {isActive ? MARK.right : ""}
                    </span>
                    <span className="kanso-cmdk__row-label">
                      <Highlight text={row.command.label} indices={row.indices} />
                    </span>
                    {row.command.hint && (
                      <span className="kanso-cmdk__row-hint">{row.command.hint}</span>
                    )}
                  </div>
                );
              })}
            </div>
          ))}
        </div>

        <footer className="kanso-cmdk__legend" aria-hidden="true">
          <span>
            <b>↑↓</b> MOVE
          </span>
          <span>
            <b>↵</b> RUN
          </span>
          <span>
            <b>ESC</b> ABORT
          </span>
        </footer>
      </div>
    </div>,
    document.body
  );
}
