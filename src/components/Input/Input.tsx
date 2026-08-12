// Input — the Kanso text field (NERV data-entry cell lineage). A recessed
// well behind a hairline frame, TR chamfer, cyan caret, orange focus edge.
// Label / hint / error are wired to the control with real ids, not guesses.
import {
  type InputHTMLAttributes,
  type ReactNode,
  forwardRef,
  useId,
} from "react";

export type FieldSize = "sm" | "md" | "lg";

export interface InputProps
  extends Omit<InputHTMLAttributes<HTMLInputElement>, "size" | "prefix"> {
  /** Mono uppercase field label. Rendered as a real <label>. */
  label?: ReactNode;
  /** Dim helper line under the control. */
  hint?: ReactNode;
  /** Error text. Presence flips the field to the danger state. */
  error?: ReactNode;
  /** Static ornament inside the well, before the control. */
  prefix?: ReactNode;
  /** Static ornament inside the well, after the control — unit, counter. */
  suffix?: ReactNode;
  size?: FieldSize;
  /** Stretch to the width of the parent. */
  block?: boolean;
}

export const Input = forwardRef<HTMLInputElement, InputProps>(function Input(
  {
    label,
    hint,
    error,
    prefix,
    suffix,
    size = "md",
    block = false,
    id,
    className = "",
    disabled,
    required,
    ...rest
  },
  ref
) {
  const autoId = useId();
  const controlId = id ?? `kanso-input-${autoId}`;
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

      <div className="kanso-input kanso-cut-tr">
        {prefix && (
          <span className="kanso-input__prefix" aria-hidden="true">
            {prefix}
          </span>
        )}
        <input
          ref={ref}
          id={controlId}
          className="kanso-input__control"
          disabled={disabled}
          required={required}
          aria-invalid={invalid || undefined}
          aria-describedby={describedBy}
          {...rest}
        />
        {suffix && (
          <span className="kanso-input__suffix" aria-hidden="true">
            {suffix}
          </span>
        )}
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
});
