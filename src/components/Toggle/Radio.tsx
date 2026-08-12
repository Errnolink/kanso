// Radio — square box, round dot (NERV mode-select lineage). Exclusivity is
// signalled by a filled circle inside the square frame.
//
// The dot is the one sanctioned exception to rule 2 ("no rounded corners"):
// the previous square-in-square core was indistinguishable from a checked
// checkbox at this size, so "pick exactly one" did not read. The outer box
// stays square, and this is the only border-radius in the system.
import {
  type InputHTMLAttributes,
  type ReactNode,
  forwardRef,
  useId,
} from "react";

export interface RadioProps
  extends Omit<InputHTMLAttributes<HTMLInputElement>, "type" | "size"> {
  label?: ReactNode;
  description?: ReactNode;
}

export const Radio = forwardRef<HTMLInputElement, RadioProps>(function Radio(
  { label, description, id, className = "", disabled, ...rest },
  ref
) {
  const autoId = useId();
  const controlId = id ?? `kanso-radio-${autoId}`;
  const descId = `${controlId}-desc`;

  return (
    <label
      className={[
        "kanso-toggle",
        "kanso-toggle--radio",
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
          type="radio"
          className="kanso-toggle__input"
          disabled={disabled}
          aria-describedby={description ? descId : undefined}
          {...rest}
        />
        <span className="kanso-radio__box" aria-hidden="true">
          <span className="kanso-radio__core" />
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
});
