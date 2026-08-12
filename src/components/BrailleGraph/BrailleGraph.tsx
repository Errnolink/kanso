// BrailleGraph — btop's braille plot, rendered as real text.
// Lineage: btop. Each character is a 2x4 dot cell, so two samples and four
// vertical subpixels fit per glyph. When `color="ramp"` each row is tinted
// by its own height, which reproduces btop's vertical severity gradient.
import {
  type HTMLAttributes,
  forwardRef,
  useCallback,
  useEffect,
  useRef,
  useState,
} from "react";
import { brailleGraph } from "../../glyphs";
import { HUE, type Hue, rampColor } from "../../ramp";

export interface BrailleGraphProps extends Omit<HTMLAttributes<HTMLDivElement>, "color"> {
  values: readonly number[];
  /** Character rows. Each row resolves 4 vertical subpixels. */
  rows?: number;
  /**
   * Character columns; each holds 2 samples. Omit to fill the container —
   * the component measures one glyph and recomputes on resize, which is
   * what makes a text plot behave like a chart instead of a fixed block.
   */
  columns?: number;
  /** Fixed upper bound. Defaults to the series peak. */
  max?: number;
  color?: Hue | "ramp";
  label?: string;
}

export const BrailleGraph = forwardRef<HTMLDivElement, BrailleGraphProps>(
  function BrailleGraph(
    {
      values,
      rows = 4,
      columns,
      max,
      color = "ramp",
      label,
      className = "",
      style,
      ...rest
    },
    ref
  ) {
    // Auto-fit: measure the rendered glyph advance rather than guessing a
    // ratio, because the mono face is whatever the host app loaded.
    const artRef = useRef<HTMLPreElement | null>(null);
    const [autoCols, setAutoCols] = useState<number | null>(null);

    const measure = useCallback(() => {
      const el = artRef.current;
      if (!el) return;
      const probe = document.createElement("span");
      probe.textContent = "⣿".repeat(10);
      probe.style.cssText = "position:absolute;visibility:hidden;white-space:pre;";
      el.appendChild(probe);
      const glyph = probe.getBoundingClientRect().width / 10;
      probe.remove();
      if (!glyph) return;
      const inner =
        el.clientWidth -
        parseFloat(getComputedStyle(el).paddingLeft) -
        parseFloat(getComputedStyle(el).paddingRight);
      setAutoCols(Math.max(1, Math.floor(inner / glyph)));
    }, []);

    useEffect(() => {
      if (columns !== undefined) return;
      measure();
      const el = artRef.current;
      if (!el || typeof ResizeObserver === "undefined") return;
      const ro = new ResizeObserver(measure);
      ro.observe(el);
      return () => ro.disconnect();
    }, [columns, measure]);

    // Before the first measurement, fall back to one column per 2 samples so
    // the first paint is never empty.
    const cols =
      columns ?? autoCols ?? Math.max(1, Math.ceil(values.length / 2));
    const lines = brailleGraph(values, { width: cols, height: rows, max });

    const peak = values.length > 0 ? Math.max(...values) : 0;
    const bound = max ?? Math.max(peak, 1e-9);
    const last = values.length > 0 ? values[values.length - 1] : 0;
    const mean =
      values.length > 0 ? values.reduce((a, b) => a + b, 0) / values.length : 0;

    const flat = color !== "ramp" ? HUE[color] : undefined;

    return (
      <div
        ref={ref}
        className={["kanso-braille", className].join(" ")}
        style={style}
        {...rest}
      >
        {label !== undefined && <div className="kanso-braille__label">{label}</div>}

        <pre ref={artRef} className="kanso-braille__art" aria-hidden="true">
          {lines.map((line, i) => (
            <span
              key={i}
              className="kanso-braille__row"
              style={{
                // Row 0 is the top of the plot, i.e. the highest magnitude.
                color: flat ?? rampColor(rows > 1 ? (rows - i) / rows : 1),
              }}
            >
              {line}
            </span>
          ))}
        </pre>

        <span className="kanso-sr-only">
          {label ? `${label}: ` : ""}
          {values.length} samples, latest {last.toFixed(2)}, mean {mean.toFixed(2)}, peak{" "}
          {peak.toFixed(2)} of {bound.toFixed(2)}
        </span>
      </div>
    );
  }
);
