// Checkbox — square box with an orange tick (NERV checklist lineage).
// A real <input type="checkbox"> carries state and focus; the drawn box is
// decoration layered on top of it, so keyboard and AT behaviour is native.
//
// The tick is an SVG polyline rather than a ✓ glyph: several mono faces
// draw U+2713 as a radical sign, and any text mark's weight and baseline
// shift with whatever font actually resolves. Geometry drawn as geometry
// looks the same everywhere.
import {
  type InputHTMLAttributes,
  type ReactNode,
  forwardRef,
  useId,
} from "react";

export interface CheckboxProps
  extends Omit<InputHTMLAttributes<HTMLInputElement>, "type" | "size"> {
  label?: ReactNode;
  /** Dim second line under the label. */
  description?: ReactNode;
}

export const Checkbox = forwardRef<HTMLInputElement, CheckboxProps>(
  function Checkbox(
    { label, description, id, className = "", disabled, ...rest },
    ref
  ) {
    const autoId = useId();
    const controlId = id ?? `kanso-checkbox-${autoId}`;
    const descId = `${controlId}-desc`;

    return (
      <label
        className={[
          "kanso-toggle",
          "kanso-toggle--checkbox",
          disabled ? "kanso-toggle--disabled" : "",
          className,
        ]
          .filter(Boolean)
          .join(" ")}
        htmlFor={controlId}
      >
        <span className="kanso-toggle__control">
          <input
            ref={ref}
            id={controlId}
            type="checkbox"
            className="kanso-toggle__input"
            disabled={disabled}
            aria-describedby={description ? descId : undefined}
            {...rest}
          />
          <span className="kanso-checkbox__box" aria-hidden="true">
            <svg
              className="kanso-checkbox__mark"
              viewBox="0 0 12 12"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="square"
              strokeLinejoin="miter"
              focusable="false"
              aria-hidden="true"
            >
              <path d="M1.5 6.25 4.5 9.25 10.5 3" />
            </svg>
          </span>
        </span>

        {(label || description) && (
          <span className="kanso-toggle__text">
            {label && <span className="kanso-toggle__label">{label}</span>}
            {description && (
              <span className="kanso-toggle__description" id={descId}>
                {description}
              </span>
            )}
          </span>
        )}
      </label>
    );
  }
);
