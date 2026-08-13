// The generation switch. v1 ("classic") is still the `:root` palette and is
// preserved unchanged; "eva" is an override block keyed on a data attribute.
// Flipping this writes one attribute — no remount, no reload, no second
// stylesheet — which is the whole point of doing the redesign as a theme
// layer rather than as an edit.
//
// SPLIT renders the gallery's comparison strips, which put both generations
// on screen at once. That works because the theme selector is a bare
// attribute selector, so any wrapper element re-declares the palette for its
// own subtree.
import type { ReactNode } from "react";
import { Segmented, THEMES, type ThemeId } from "../src";

export interface ThemeSwitchProps {
  theme: ThemeId;
  onTheme: (theme: ThemeId) => void;
  split: boolean;
  onSplit: (split: boolean) => void;
}

const OPTIONS = THEMES.map((t) => ({ value: t.id, label: t.label }));

export function ThemeSwitch({ theme, onTheme, split, onSplit }: ThemeSwitchProps) {
  const active = THEMES.find((t) => t.id === theme);

  return (
    <aside className="themeswitch kanso-surface kanso-notch-tr" aria-label="Design generation">
      <div className="themeswitch-head">
        <span className="themeswitch-label">DESIGN</span>
        <span className="themeswitch-gen">{theme === "classic" ? "V1" : "V2"}</span>
      </div>

      <Segmented
        options={OPTIONS}
        value={theme}
        onChange={onTheme}
        size="sm"
        block
        label="Design generation"
      />

      <button
        type="button"
        className={`themeswitch-split${split ? " themeswitch-split--on" : ""}`}
        aria-pressed={split}
        onClick={() => onSplit(!split)}
      >
        <span className="themeswitch-split-box" aria-hidden="true">
          {split ? "▣" : "▢"}
        </span>
        SPLIT COMPARE
      </button>

      {active?.description && <p className="themeswitch-note">{active.description}</p>}
    </aside>
  );
}

/**
 * Side-by-side strip: the same children rendered under both palettes.
 *
 * `children` is a render function rather than a node because React elements
 * are not safely reusable across two trees when they hold their own state —
 * calling it twice gives each side its own instances.
 */
export function Split({
  on,
  children,
  note,
}: {
  on: boolean;
  note?: string;
  children: () => ReactNode;
}) {
  if (!on) return <>{children()}</>;

  return (
    <div className="split">
      {THEMES.map((t) => (
        <div
          key={t.id}
          className="split-pane"
          // `classic` is the absence of the attribute, so it must not be set —
          // setting it would look up an override block that does not exist.
          {...(t.id === "classic" ? {} : { "data-kanso-theme": t.id })}
        >
          <div className="split-tag">
            {t.id === "classic" ? "V1 · CLASSIC" : `V2 · ${t.label}`}
          </div>
          <div className="split-body">{children()}</div>
        </div>
      ))}
      {note && <p className="split-note">{note}</p>}
    </div>
  );
}
