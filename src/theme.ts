// Kanso themes — the toggle between design generations.
//
// A theme is not a fork. `tokens/*.json` compiles to `:root` and stays the
// canonical v1 palette; `tokens/themes/<id>.json` compiles to an override
// block scoped to `[data-kanso-theme="<id>"]` that re-declares a subset of
// the same custom properties. Components never learn which theme is active —
// they read `var(--kanso-*)` and the cascade does the rest.
//
// That is what makes this a switch rather than a migration: v1 is still in
// the stylesheet, byte-for-byte, and one attribute swaps between them.
import { useCallback, useEffect, useState } from "react";
import { KANSO_THEMES, kansoThemes } from "./tokens";

export type ThemeId = (typeof KANSO_THEMES)[number];

/** The base palette, i.e. no override block. Carries no attribute. */
export const DEFAULT_THEME: ThemeId = "classic";

export const THEME_ATTR = "data-kanso-theme";

/** Persisted so a reload doesn't drop the user back into the other design. */
export const THEME_STORAGE_KEY = "kanso.theme";

export interface ThemeInfo {
  id: ThemeId;
  label: string;
  description: string;
}

export const THEMES: readonly ThemeInfo[] = [
  {
    id: "classic",
    label: "CLASSIC",
    description:
      "v1 — the palette this library shipped with. Preserved unchanged as the reference.",
  },
  ...Object.entries(kansoThemes).map(([id, theme]) => {
    // `$meta` lives in the JSON but not in the emitted override map, so read
    // it defensively rather than asserting a shape the generator may change.
    const meta = (theme as { $meta?: { label?: string; description?: string } }).$meta;
    return {
      id: id as ThemeId,
      label: meta?.label ?? id.toUpperCase(),
      description: meta?.description ?? "",
    };
  }),
];

export function isThemeId(value: unknown): value is ThemeId {
  return typeof value === "string" && (KANSO_THEMES as readonly string[]).includes(value);
}

/**
 * Apply a theme to an element (default: `<html>`, which covers portalled
 * overlays — modals and toasts render outside the app subtree).
 *
 * The base theme removes the attribute rather than setting `="classic"`,
 * so the DOM of an app that never opted in looks exactly as it did before
 * themes existed.
 */
export function applyTheme(theme: ThemeId, target?: Element | null): void {
  const el = target ?? (typeof document === "undefined" ? null : document.documentElement);
  if (!el) return;
  if (theme === DEFAULT_THEME) el.removeAttribute(THEME_ATTR);
  else el.setAttribute(THEME_ATTR, theme);
}

export function readTheme(target?: Element | null): ThemeId {
  const el = target ?? (typeof document === "undefined" ? null : document.documentElement);
  const value = el?.getAttribute(THEME_ATTR);
  return isThemeId(value) ? value : DEFAULT_THEME;
}

/** Last stored choice, or the default. Safe in SSR and in blocked-storage contexts. */
export function storedTheme(): ThemeId {
  try {
    const value = globalThis.localStorage?.getItem(THEME_STORAGE_KEY);
    return isThemeId(value) ? value : DEFAULT_THEME;
  } catch {
    return DEFAULT_THEME;
  }
}

export function storeTheme(theme: ThemeId): void {
  try {
    globalThis.localStorage?.setItem(THEME_STORAGE_KEY, theme);
  } catch {
    // Private mode / storage disabled. The theme still applies for the session.
  }
}

export interface UseThemeOptions {
  /** Where to write the attribute. Defaults to `<html>`. */
  target?: Element | null;
  /** Restore the last choice on mount. */
  persist?: boolean;
  initial?: ThemeId;
}

/**
 * Theme state plus the DOM write, as one hook.
 *
 * The attribute is applied in an effect rather than during render because a
 * theme swap is a document-level side effect, and because the initial paint
 * must match the server/HTML for apps that pre-set the attribute themselves.
 */
export function useKansoTheme({
  target,
  persist = true,
  initial,
}: UseThemeOptions = {}): [ThemeId, (theme: ThemeId) => void] {
  const [theme, setState] = useState<ThemeId>(
    () => initial ?? (persist ? storedTheme() : DEFAULT_THEME)
  );

  useEffect(() => {
    applyTheme(theme, target);
  }, [theme, target]);

  const setTheme = useCallback(
    (next: ThemeId) => {
      setState(next);
      if (persist) storeTheme(next);
    },
    [persist]
  );

  return [theme, setTheme];
}
