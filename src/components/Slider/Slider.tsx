// Slider — linear parameter rail (btop meter × NERV trim control). A 4px
// well track, the travelled portion painted orange, a 12px square thumb.
// The fill is driven by a `--kanso-slider-pct` custom property so the paint
// stays in CSS and the component only reports a number.
import {
  type CSSProperties,
  type ChangeEvent,
  type InputHTMLAttributes,
  type ReactNode,
  forwardRef,
  useCallback,
  useEffect,
  useId,
  useState,
} from "react";

export interface SliderProps
  extends Omit<InputHTMLAttributes<HTMLInputElement>, "type" | "size"> {
  label?: ReactNode;
  hint?: ReactNode;
  size?: "sm" | "md" | "lg";
  block?: boolean;
  /** Show a tabular readout of the current value beside the track. */
  showValue?: boolean;
  /** Unit suffix for the readout — "%", "ms", "RPM". */
  unit?: string;
  /** Number of evenly spaced tick marks drawn under the track (>= 2). */
  ticks?: number;
  /** Format the readout. Defaults to the raw number plus `unit`. */
  formatValue?: (value: number) => string;
}

function toNumber(v: unknown, fallback: number): number {
  const n = typeof v === "number" ? v : parseFloat(String(v ?? ""));
  return Number.isFinite(n) ? n : fallback;
}

export const Slider = forwardRef<HTMLInputElement, SliderProps>(function Slider(
  {
    label,
    hint,
    size = "md",
    block = false,
    showValue = false,
    unit = "",
    ticks,
    formatValue,
    min = 0,
    max = 100,
    step = 1,
    value,
    defaultValue,
    onChange,
    id,
    className = "",
    disabled,
    ...rest
  },
  ref
) {
  const autoId = useId();
  const controlId = id ?? `kanso-slider-${autoId}`;
  const hintId = `${controlId}-hint`;

  const lo = toNumber(min, 0);
  const hi = toNumber(max, 100);

  const [internal, setInternal] = useState(() =>
    toNumber(value ?? defaultValue, lo)
  );

  useEffect(() => {
    if (value !== undefined) setInternal(toNumber(value, lo));
  }, [value, lo]);

  const handleChange = useCallback(
    (e: ChangeEvent<HTMLInputElement>) => {
      setInternal(toNumber(e.target.value, lo));
      onChange?.(e);
    },
    [onChange, lo]
  );

  const span = hi - lo || 1;
  const pct = Math.max(0, Math.min(100, ((internal - lo) / span) * 100));

  const readout = formatValue
    ? formatValue(internal)
    : `${internal}${unit ? ` ${unit}` : ""}`;

  const tickCount = ticks && ticks >= 2 ? Math.floor(ticks) : 0;

  return (
    <div
      className={[
        "kanso-slider",
        `kanso-slider--${size}`,
        block ? "kanso-slider--block" : "",
        disabled ? "kanso-slider--disabled" : "",
        className,
      ]
        .filter(Boolean)
        .join(" ")}
      style={{ "--kanso-slider-pct": `${pct}%` } as CSSProperties}
    >
      {(label || showValue) && (
        <div className="kanso-slider__head">
          {label && (
            <label className="kanso-slider__label" htmlFor={controlId}>
              {label}
            </label>
          )}
          {showValue && (
            <output className="kanso-slider__readout" htmlFor={controlId}>
              {readout}
            </output>
          )}
        </div>
      )}

      <div className="kanso-slider__rail">
        <input
          ref={ref}
          id={controlId}
          type="range"
          className="kanso-slider__input"
          min={min}
          max={max}
          step={step}
          value={value !== undefined ? value : undefined}
          defaultValue={value === undefined ? defaultValue : undefined}
          onChange={handleChange}
          disabled={disabled}
          aria-describedby={hint ? hintId : undefined}
          {...rest}
        />
        {tickCount > 0 && (
          <div className="kanso-slider__ticks" aria-hidden="true">
            {Array.from({ length: tickCount }, (_, i) => (
              <span
                key={i}
                className="kanso-slider__tick"
                style={{ left: `${(i / (tickCount - 1)) * 100}%` }}
              />
            ))}
          </div>
        )}
      </div>

      {hint && (
        <p className="kanso-slider__hint" id={hintId}>
          {hint}
        </p>
      )}
    </div>
  );
});
