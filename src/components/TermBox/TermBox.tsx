// TermBox — btop's signature framed box: `┌─ 1 ─ cpu ─────────┐`.
// Lineage: btop (box-drawing frames) crossed with NERV panel chrome. The
// rules are real CSS hairline borders so the frame stays 1px at any pixel
// size; only the four corner marks are box-drawing glyphs, laid over the
// border joints, and the title punches a hole in the top rule.
import {
  type CSSProperties,
  type HTMLAttributes,
  type ReactNode,
  forwardRef,
} from "react";
import { BOX, type BoxStyle } from "../../glyphs";
import { HUE, type Hue } from "../../ramp";

export interface TermBoxProps extends Omit<HTMLAttributes<HTMLDivElement>, "color"> {
  /** Box title, rendered over the top rule. */
  label: string;
  /** btop-style hotkey digit shown ahead of the label. */
  hotkey?: string | number;
  /** Box-drawing set for the corner marks. Named `boxStyle` so the DOM
   *  `style` attribute stays available — see the deviation note. */
  boxStyle?: BoxStyle;
  /** Accent hue for the title and corner marks. */
  color?: Hue;
  /** Top-right readout, e.g. a live value or a status chip. */
  right?: ReactNode;
  children?: ReactNode;
}

// sharp and rounded differ only in their corner glyphs, so they carry no
// class — the frame itself is identical to the base box.
const boxStyleClass: Record<BoxStyle, string> = {
  sharp: "",
  rounded: "",
  heavy: "kanso-termbox--heavy",
  double: "kanso-termbox--double",
};

export const TermBox = forwardRef<HTMLDivElement, TermBoxProps>(function TermBox(
  {
    label,
    hotkey,
    boxStyle = "sharp",
    color,
    right,
    children,
    className = "",
    style,
    ...rest
  },
  ref
) {
  const g = BOX[boxStyle];
  const vars = {
    ...(color ? { "--kanso-termbox-accent": HUE[color] } : null),
    ...style,
  } as CSSProperties;

  return (
    <div
      ref={ref}
      className={["kanso-termbox", boxStyleClass[boxStyle], className]
        .filter(Boolean)
        .join(" ")}
      style={vars}
      {...rest}
    >
      <span aria-hidden="true" className="kanso-termbox__corner kanso-termbox__corner--tl">{g.tl}</span>
      <span aria-hidden="true" className="kanso-termbox__corner kanso-termbox__corner--tr">{g.tr}</span>
      <span aria-hidden="true" className="kanso-termbox__corner kanso-termbox__corner--bl">{g.bl}</span>
      <span aria-hidden="true" className="kanso-termbox__corner kanso-termbox__corner--br">{g.br}</span>

      <div className="kanso-termbox__title">
        <span aria-hidden="true" className="kanso-termbox__rule">{g.h}</span>
        {hotkey !== undefined && (
          <>
            <span className="kanso-termbox__hotkey">{hotkey}</span>
            <span aria-hidden="true" className="kanso-termbox__rule">{g.h}</span>
          </>
        )}
        <span className="kanso-termbox__label">{label}</span>
      </div>

      {right !== undefined && right !== null && (
        <div className="kanso-termbox__right">{right}</div>
      )}

      <div className="kanso-termbox__body">{children}</div>
    </div>
  );
});
