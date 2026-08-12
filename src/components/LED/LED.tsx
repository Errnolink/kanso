// LED — status dot. Lineage: NERV console indicator lamps. A single tight
// 6px halo, never a bloom; `blink` reuses the shared kanso-blink keyframe
// so every flashing element in the system shares one cadence.
import { type HTMLAttributes, forwardRef } from "react";

export type LEDState = "ok" | "warn" | "crit" | "off" | "info";

export interface LEDProps extends Omit<HTMLAttributes<HTMLSpanElement>, "color"> {
  state: LEDState;
  label?: string;
  blink?: boolean;
  size?: "sm" | "md" | "lg";
}

const stateClass: Record<LEDState, string> = {
  ok: "kanso-led--ok",
  warn: "kanso-led--warn",
  crit: "kanso-led--crit",
  off: "kanso-led--off",
  info: "kanso-led--info",
};

const stateText: Record<LEDState, string> = {
  ok: "nominal",
  warn: "warning",
  crit: "critical",
  off: "offline",
  info: "info",
};

export const LED = forwardRef<HTMLSpanElement, LEDProps>(function LED(
  { state, label, blink = false, size = "md", className = "", ...rest },
  ref
) {
  return (
    <span
      ref={ref}
      className={[
        "kanso-led",
        stateClass[state],
        `kanso-led--${size}`,
        blink ? "kanso-led--blink" : "",
        className,
      ].join(" ")}
      {...rest}
    >
      <span className="kanso-led__dot" aria-hidden="true" />
      {label !== undefined ? (
        <span className="kanso-led__label">{label}</span>
      ) : (
        <span className="kanso-sr-only">{stateText[state]}</span>
      )}
    </span>
  );
});
