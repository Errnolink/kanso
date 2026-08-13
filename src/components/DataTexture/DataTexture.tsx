// DataTexture — the text-as-texture field. Eva fills its screens with dense
// blocks nobody is meant to read; the field does real work, communicating
// "this system is doing far more than it is telling you".
//
// The rule from §A1.4, which this component exists to enforce:
//
//   Text-as-texture must be built from the application's OWN REAL DATA, in
//   the user's own script, rendered at the faintest text token and marked
//   `aria-hidden="true"` with `user-select: none`.
//
// So `lines` is required and nothing is ever generated. Ornamental CJK is
// techno-orientalist, is frequently wrong (Blade Runner's signage is partly
// gibberish, and forty years of design has copied it), and is read aloud by
// screen readers. Real hex dumps, request ids, commit SHAs, timestamps and
// IPs give the identical optical texture — denser, in fact, because it is
// the same thing NERV's own screens are showing.
//
// It never pads or repeats to reach `rows`: the field is exactly as tall as
// the data you actually have.
import { type CSSProperties, type HTMLAttributes, forwardRef } from "react";

export interface DataTextureProps extends HTMLAttributes<HTMLDivElement> {
  /** Real application data. Required, and never synthesised on your behalf. */
  lines: string[];
  /** Cap on rendered lines. Fewer lines than this simply render shorter. */
  rows?: number;
  /** Field width in characters. Long lines are clipped, not wrapped. */
  columns?: number;
  /** Mask the top and bottom edges so the field reads as a fragment. */
  fade?: boolean;
}

export const DataTexture = forwardRef<HTMLDivElement, DataTextureProps>(
  function DataTexture(
    { lines, rows, columns, fade = false, className = "", style, ...rest },
    ref
  ) {
    const shown = rows === undefined ? lines : lines.slice(0, rows);
    if (shown.length === 0) return null;

    return (
      <div
        ref={ref}
        aria-hidden="true"
        className={[
          "kanso-data-texture",
          fade ? "kanso-data-texture--fade" : "",
          className,
        ]
          .filter(Boolean)
          .join(" ")}
        style={
          {
            ...style,
            ...(columns !== undefined
              ? { "--kanso-data-texture-width": `${columns}ch` }
              : null),
          } as CSSProperties
        }
        {...rest}
      >
        {shown.map((line, i) => (
          <span className="kanso-data-texture__line" key={`${i}-${line}`}>
            {line}
          </span>
        ))}
      </div>
    );
  }
);
