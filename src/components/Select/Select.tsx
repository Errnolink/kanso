// Select — native <select> in Kanso chrome (NERV parameter-picker lineage).
// Native on purpose: the OS popup is keyboard- and screen-reader-correct on
// every platform, and no listbox reimplementation beats that. Only the
// closed state is restyled, with a ▼ MARK glyph standing in for the arrow.
//
// Platform note — what Select.css can and cannot reach in the open list:
//   reachable  `color-scheme: dark` (popup frame, scrollbar and shadow all
//              flip to the dark theme), and per-row `background-color`,
//              `color`, `font-family` on option/optgroup, including the
//              `:checked` row. Blink and Gecko honour all of it.
//   not        the highlight colour of the row under the pointer or the
//              keyboard cursor — that is the OS accent and there is no CSS
//              hook for it; row height, padding and the popup's own border
//              radius; anything at all on Safari/WebKit, which draws the
//              popup as a system menu and ignores option colours; and the
//              closed control on iOS, which renders its own text style.
// Anything past that line needs a custom listbox, which costs more in
// accessibility than it buys in theming.
import {
  type ReactNode,
  type SelectHTMLAttributes,
  forwardRef,
  useId,
} from "react";
import { MARK } from "../../glyphs";
import type { FieldSize } from "../Input/Input";

export interface SelectOption {
  value: string;
  label: string;
  disabled?: boolean;
}

export interface SelectProps
  extends Omit<SelectHTMLAttributes<HTMLSelectElement>, "size"> {
  label?: ReactNode;
  hint?: ReactNode;
  error?: ReactNode;
  size?: FieldSize;
  block?: boolean;
  /** Declarative options. Ignored when `children` is provided. */
  options?: readonly SelectOption[];
  /** Dim first entry with an empty value, for "no selection yet". */
  placeholder?: string;
}

export const Select = forwardRef<HTMLSelectElement, SelectProps>(
  function Select(
    {
      label,
      hint,
      error,
      size = "md",
      block = false,
      options,
      placeholder,
      id,
      className = "",
      disabled,
      required,
      children,
      ...rest
    },
    ref
  ) {
    const autoId = useId();
    const controlId = id ?? `kanso-select-${autoId}`;
    const hintId = `${controlId}-hint`;
    const errorId = `${controlId}-error`;
    const invalid = Boolean(error);

    const describedBy =
      [error ? errorId : null, hint ? hintId : null].filter(Boolean).join(" ") ||
      undefined;

    return (
      <div
        className={[
          "kanso-field",
          `kanso-field--${size}`,
          block ? "kanso-field--block" : "",
          invalid ? "kanso-field--invalid" : "",
          disabled ? "kanso-field--disabled" : "",
          className,
        ]
          .filter(Boolean)
          .join(" ")}
      >
        {label && (
          <label className="kanso-field__label" htmlFor={controlId}>
            {label}
            {required && (
              <span className="kanso-field__required" aria-hidden="true">
                *
              </span>
            )}
          </label>
        )}

        <div className="kanso-input kanso-select kanso-cut-tr">
          <select
            ref={ref}
            id={controlId}
            className="kanso-input__control kanso-select__control"
            disabled={disabled}
            required={required}
            aria-invalid={invalid || undefined}
            aria-describedby={describedBy}
            {...rest}
          >
            {placeholder && (
              <option value="" disabled>
                {placeholder}
              </option>
            )}
            {children ??
              options?.map((opt) => (
                <option key={opt.value} value={opt.value} disabled={opt.disabled}>
                  {opt.label}
                </option>
              ))}
          </select>
          <span className="kanso-select__arrow" aria-hidden="true">
            {MARK.down}
          </span>
        </div>

        {hint && !error && (
          <p className="kanso-field__hint" id={hintId}>
            {hint}
          </p>
        )}
        {error && (
          <p className="kanso-field__error" id={errorId}>
            {error}
          </p>
        )}
      </div>
    );
  }
);
