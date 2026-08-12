// Terminal — scrolling log view. Lineage: NERV console feed × btop's
// message pane. Dim timestamp column, level-coloured text, 1.5% stripe,
// and a blinking block cursor on the last line when `cursor` is set.
import {
  type HTMLAttributes,
  type ReactNode,
  forwardRef,
  useEffect,
  useRef,
} from "react";
import { MARK } from "../../glyphs";

export type TerminalLevel = "info" | "warn" | "error" | "system";

export interface TerminalLine {
  ts?: string;
  level: TerminalLevel;
  text: string;
}

export interface TerminalProps extends Omit<HTMLAttributes<HTMLDivElement>, "title"> {
  lines: readonly TerminalLine[];
  /** Pin the view to the newest line as lines arrive. */
  follow?: boolean;
  /** Show a blinking block cursor after the last line. */
  cursor?: boolean;
  title?: ReactNode;
  /** Max height of the scroll region. */
  height?: number | string;
}

const levelClass: Record<TerminalLevel, string> = {
  info: "kanso-terminal__line--info",
  warn: "kanso-terminal__line--warn",
  error: "kanso-terminal__line--error",
  system: "kanso-terminal__line--system",
};

export const Terminal = forwardRef<HTMLDivElement, TerminalProps>(function Terminal(
  {
    lines,
    follow = true,
    cursor = false,
    title,
    height = 220,
    className = "",
    "aria-label": ariaLabel,
    ...rest
  },
  ref
) {
  // The log region is the thing being named, not the wrapper — and `title`
  // is a ReactNode, so only a string one can serve as the name.
  const logName = ariaLabel ?? (typeof title === "string" ? title : "log");
  const bodyRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (!follow) return;
    const el = bodyRef.current;
    if (!el) return;
    el.scrollTop = el.scrollHeight;
  }, [lines, follow]);

  return (
    <div ref={ref} className={["kanso-terminal", className].join(" ")} {...rest}>
      {title !== undefined && (
        <div className="kanso-terminal__title">
          <span className="kanso-terminal__prompt" aria-hidden="true">{MARK.prompt}</span>
          {title}
        </div>
      )}

      <div
        ref={bodyRef}
        className="kanso-terminal__body"
        style={{ maxHeight: height }}
        role="log"
        aria-label={logName}
        aria-live="polite"
        aria-relevant="additions"
        tabIndex={0}
      >
        {lines.map((line, i) => (
          <div
            key={`${i}-${line.ts ?? ""}`}
            className={["kanso-terminal__line", levelClass[line.level]].join(" ")}
          >
            {line.ts !== undefined && <span className="kanso-terminal__ts">{line.ts}</span>}
            <span className="kanso-terminal__text">{line.text}</span>
          </div>
        ))}

        {cursor && (
          <div className="kanso-terminal__line">
            <span className="kanso-terminal__cursor" aria-hidden="true">
              {MARK.cursor}
            </span>
          </div>
        )}
      </div>
    </div>
  );
});
