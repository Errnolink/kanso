// BootSequence — the EVA cold open. Lines type themselves out one after
// another, each closing with an [ OK ] / [ FAIL ] stamp, then `onComplete`
// fires and the app takes over.
//
// It is theatre, so it must never be a gate: reduced-motion users get the
// finished list immediately, and any click or key press skips the rest.
import {
  type HTMLAttributes,
  forwardRef,
  useCallback,
  useEffect,
  useRef,
  useState,
} from "react";
import { prefersReducedMotion } from "../../motion";

export type BootStatus = "ok" | "fail" | "warn" | "none";

export interface BootLine {
  text: string;
  /** Stamp printed at the end of the line once it finishes typing. */
  status?: BootStatus;
  /** Extra pause after this line, in ms. */
  delay?: number;
}

export interface BootSequenceProps
  extends Omit<HTMLAttributes<HTMLDivElement>, "children"> {
  lines: readonly BootLine[];
  /** Milliseconds per character. */
  speed?: number;
  /** Default pause between lines, in ms. */
  lineDelay?: number;
  /** Prefix printed before every line. */
  prompt?: string;
  /** Show the "CLICK OR PRESS ANY KEY TO SKIP" footer. */
  showSkipHint?: boolean;
  onComplete?: () => void;
}

const STAMP: Record<Exclude<BootStatus, "none">, string> = {
  ok: "[ OK ]",
  fail: "[ FAIL ]",
  warn: "[ WARN ]",
};

export const BootSequence = forwardRef<HTMLDivElement, BootSequenceProps>(
  function BootSequence(
    {
      lines,
      speed = 12,
      lineDelay = 90,
      prompt = ">",
      showSkipHint = true,
      onComplete,
      className = "",
      ...rest
    },
    ref
  ) {
    const [line, setLine] = useState(0);
    const [chars, setChars] = useState(0);
    const [done, setDone] = useState(false);
    const firedRef = useRef(false);

    const skip = useCallback(() => {
      setLine(lines.length);
      setChars(0);
      setDone(true);
    }, [lines.length]);

    // Reduced motion: print the whole log, skip the performance.
    useEffect(() => {
      if (prefersReducedMotion()) skip();
    }, [skip]);

    // Any key aborts the sequence.
    useEffect(() => {
      if (done) return;
      const onKey = () => skip();
      document.addEventListener("keydown", onKey);
      return () => document.removeEventListener("keydown", onKey);
    }, [done, skip]);

    // The type-writer itself: one timer per character, one per line break.
    useEffect(() => {
      if (done) return;
      if (line >= lines.length) {
        setDone(true);
        return;
      }
      const current = lines[line];
      if (chars < current.text.length) {
        const t = window.setTimeout(
          () => setChars((c) => c + 1),
          Math.max(0, speed)
        );
        return () => window.clearTimeout(t);
      }
      const t = window.setTimeout(() => {
        setLine((l) => l + 1);
        setChars(0);
      }, Math.max(0, current.delay ?? lineDelay));
      return () => window.clearTimeout(t);
    }, [done, line, chars, lines, speed, lineDelay]);

    useEffect(() => {
      if (!done || firedRef.current) return;
      firedRef.current = true;
      onComplete?.();
    }, [done, onComplete]);

    const visible = done ? lines.length : Math.min(line + 1, lines.length);

    return (
      <div
        ref={ref}
        role="log"
        aria-live="polite"
        aria-label="System boot log"
        className={["kanso-boot", done ? "kanso-boot--done" : "", className]
          .filter(Boolean)
          .join(" ")}
        onClick={skip}
        {...rest}
      >
        <ol className="kanso-boot__lines">
          {lines.slice(0, visible).map((item, i) => {
            const settled = done || i < line;
            const text = settled ? item.text : item.text.slice(0, chars);
            const status = item.status ?? "none";
            return (
              <li className="kanso-boot__line" key={`${i}-${item.text}`}>
                <span className="kanso-boot__prompt" aria-hidden="true">
                  {prompt}
                </span>
                <span className="kanso-boot__text">{text}</span>
                {!settled && (
                  <span className="kanso-boot__cursor" aria-hidden="true" />
                )}
                {settled && status !== "none" && (
                  <span
                    className={`kanso-boot__stamp kanso-boot__stamp--${status}`}
                  >
                    {STAMP[status]}
                  </span>
                )}
              </li>
            );
          })}
        </ol>

        {showSkipHint && !done && (
          <p className="kanso-boot__skip" aria-hidden="true">
            CLICK OR PRESS ANY KEY TO SKIP
          </p>
        )}
      </div>
    );
  }
);
