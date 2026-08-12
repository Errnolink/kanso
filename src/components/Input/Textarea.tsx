// Textarea — multi-line sibling of Input (NERV log-entry cell lineage).
// Shares Input.css: same well, same hairline frame, same label/hint/error
// contract. No chamfer on the control itself — a resizable box cannot keep
// a clip-path honest, so the frame stays square.
import {
  type ReactNode,
  type TextareaHTMLAttributes,
  forwardRef,
  useId,
} from "react";
import type { FieldSize } from "./Input";

export interface TextareaProps
  extends TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: ReactNode;
  hint?: ReactNode;
  error?: ReactNode;
  size?: FieldSize;
  block?: boolean;
}

export const Textarea = forwardRef<HTMLTextAreaElement, TextareaProps>(
  function Textarea(
    {
      label,
      hint,
      error,
      size = "md",
      block = false,
      rows = 4,
      id,
      className = "",
      disabled,
      required,
      ...rest
    },
    ref
  ) {
    const autoId = useId();
    const controlId = id ?? `kanso-textarea-${autoId}`;
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

        <div className="kanso-input kanso-input--textarea">
          <textarea
            ref={ref}
            id={controlId}
            rows={rows}
            className="kanso-input__control kanso-input__control--textarea"
            disabled={disabled}
            required={required}
            aria-invalid={invalid || undefined}
            aria-describedby={describedBy}
            {...rest}
          />
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
