// Switch — rectangular breaker (NERV power-rail toggle lineage). A square
// thumb travelling a rectangular track in one hard 120ms move: off is dim,
// on is orange. Underneath it is a checkbox with `role="switch"`.
import {
  type InputHTMLAttributes,
  type ReactNode,
  forwardRef,
  useId,
} from "react";

export interface SwitchProps
  extends Omit<InputHTMLAttributes<HTMLInputElement>, "type" | "size"> {
  label?: ReactNode;
  description?: ReactNode;
}

export const Switch = forwardRef<HTMLInputElement, SwitchProps>(function Switch(
  { label, description, id, className = "", disabled, ...rest },
  ref
) {
  const autoId = useId();
  const controlId = id ?? `kanso-switch-${autoId}`;
  const descId = `${controlId}-desc`;

  return (
    <label
      className={[
        "kanso-toggle",
        "kanso-toggle--switch",
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
          role="switch"
          className="kanso-toggle__input"
          disabled={disabled}
          aria-describedby={description ? descId : undefined}
          {...rest}
        />
        <span className="kanso-switch__track" aria-hidden="true">
          <span className="kanso-switch__thumb" />
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
