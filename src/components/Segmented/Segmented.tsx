// Segmented — EVA mode selector. A row of sheared tabs where exactly one is
// live: active reads as a solid orange plate with dark ink, idle sits on the
// dim fill. Arrow keys move the selection, so the whole control is one tab
// stop, as a tablist should be.
import {
  type ForwardedRef,
  type KeyboardEvent,
  type ReactElement,
  type ReactNode,
  forwardRef,
  useRef,
} from "react";

export interface SegmentedOption<T extends string = string> {
  value: T;
  label: ReactNode;
  icon?: ReactNode;
  disabled?: boolean;
}

export interface SegmentedProps<T extends string = string> {
  options: readonly SegmentedOption<T>[];
  value: T;
  onChange: (value: T) => void;
  size?: "sm" | "md" | "lg";
  /** Fill the parent, splitting evenly between segments. */
  block?: boolean;
  /** Accessible name for the tablist. */
  label?: string;
  className?: string;
  id?: string;
}

function SegmentedInner<T extends string>(
  {
    options,
    value,
    onChange,
    size = "md",
    block = false,
    label,
    className = "",
    id,
  }: SegmentedProps<T>,
  ref: ForwardedRef<HTMLDivElement>
): ReactElement {
  const itemRefs = useRef<Array<HTMLButtonElement | null>>([]);

  const move = (from: number, dir: 1 | -1) => {
    const n = options.length;
    for (let step = 1; step <= n; step++) {
      const i = (from + dir * step + n * step) % n;
      const opt = options[i];
      if (opt && !opt.disabled) {
        onChange(opt.value);
        itemRefs.current[i]?.focus();
        return;
      }
    }
  };

  const edge = (dir: 1 | -1) => {
    const list = dir === 1 ? [...options].reverse() : options;
    const found = list.find((o) => !o.disabled);
    if (!found) return;
    const i = options.indexOf(found);
    onChange(found.value);
    itemRefs.current[i]?.focus();
  };

  const handleKeyDown = (e: KeyboardEvent<HTMLButtonElement>, index: number) => {
    switch (e.key) {
      case "ArrowRight":
      case "ArrowDown":
        e.preventDefault();
        move(index, 1);
        break;
      case "ArrowLeft":
      case "ArrowUp":
        e.preventDefault();
        move(index, -1);
        break;
      case "Home":
        e.preventDefault();
        edge(-1);
        break;
      case "End":
        e.preventDefault();
        edge(1);
        break;
      default:
        break;
    }
  };

  return (
    <div
      ref={ref}
      id={id}
      role="tablist"
      aria-label={label}
      aria-orientation="horizontal"
      className={[
        "kanso-segmented",
        `kanso-segmented--${size}`,
        block ? "kanso-segmented--block" : "",
        className,
      ]
        .filter(Boolean)
        .join(" ")}
    >
      {options.map((opt, i) => {
        const active = opt.value === value;
        return (
          <button
            key={opt.value}
            ref={(node) => {
              itemRefs.current[i] = node;
            }}
            type="button"
            role="tab"
            aria-selected={active}
            tabIndex={active ? 0 : -1}
            disabled={opt.disabled}
            className={[
              "kanso-segmented__item",
              "kanso-shear",
              active ? "kanso-segmented__item--active" : "kanso-fill-dim",
            ].join(" ")}
            onClick={() => !opt.disabled && onChange(opt.value)}
            onKeyDown={(e) => handleKeyDown(e, i)}
          >
            {opt.icon && (
              <span className="kanso-segmented__icon" aria-hidden="true">
                {opt.icon}
              </span>
            )}
            <span className="kanso-segmented__label">{opt.label}</span>
          </button>
        );
      })}
    </div>
  );
}

/**
 * Generic forwardRef needs the cast: `forwardRef` erases type parameters,
 * so the component is re-typed to keep `value`/`onChange` in the same union.
 */
export const Segmented = forwardRef(SegmentedInner) as <T extends string>(
  props: SegmentedProps<T> & { ref?: ForwardedRef<HTMLDivElement> }
) => ReactElement;
