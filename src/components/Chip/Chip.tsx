// Chip — notched selector chip (NERV wtab/term-tab lineage). State changes
// (hover, active) are driven by the anime.js engine, not CSS transitions.
import {
  forwardRef,
  useCallback,
  useEffect,
  useRef,
  type ButtonHTMLAttributes,
  type MouseEvent,
} from "react";
import { animate, cubicBezier, type JSAnimation } from "animejs";
import { kanso } from "../../tokens";

export interface ChipProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  active?: boolean;
  variant?: "tab" | "term";
  size?: "sm" | "md" | "lg";
}

const sizeClass: Record<NonNullable<ChipProps["size"]>, string> = {
  sm: "kanso-chip--sm",
  md: "kanso-chip--md",
  lg: "kanso-chip--lg",
};

type Palette = {
  color: string;
  borderColor: string;
  backgroundColor: string;
  textShadow: string;
};

const palettes: Record<"tab" | "term", { base: Palette; hover: Palette; active: Palette }> = {
  tab: {
    base: {
      color: kanso.color.muted,
      borderColor: kanso.color.border,
      backgroundColor: "rgba(0, 0, 0, 0)",
      textShadow: "0 0 0px rgba(255, 152, 48, 0)",
    },
    hover: {
      color: kanso.color.info,
      borderColor: kanso.color.info,
      backgroundColor: "rgba(32, 240, 255, 0.05)",
      textShadow: "0 0 0px rgba(255, 152, 48, 0)",
    },
    active: {
      color: kanso.color.primary,
      borderColor: kanso.color.primary,
      backgroundColor: "rgba(255, 152, 48, 0.08)",
      textShadow: "0 0 6px rgba(255, 152, 48, 0.4)",
    },
  },
  // A terminal tab has to be readable when idle — it is the only label on
  // the pane it names — so idle sits at text-dim, not muted, and the active
  // tab adds the wash fill under the primary baseline drawn in CSS.
  term: {
    base: {
      color: kanso.color["text-dim"],
      borderColor: kanso.color.border,
      backgroundColor: "rgba(0, 0, 0, 0)",
      textShadow: "0 0 0px rgba(255, 152, 48, 0)",
    },
    hover: {
      color: kanso.color.text,
      borderColor: kanso.color.border,
      backgroundColor: kanso.color["primary-film"],
      textShadow: "0 0 0px rgba(255, 152, 48, 0)",
    },
    active: {
      color: kanso.color.primary,
      borderColor: kanso.color.border,
      backgroundColor: kanso.color["primary-wash"],
      textShadow: "0 0 0px rgba(255, 152, 48, 0)",
    },
  },
};

const EASE = cubicBezier(...kanso.motion["ease-mechanical"]);

export const Chip = forwardRef<HTMLButtonElement, ChipProps>(function Chip(
  {
    active = false,
    variant = "tab",
    size = "md",
    type = "button",
    className = "",
    onMouseEnter,
    onMouseLeave,
    ...rest
  },
  ref
) {
  const innerRef = useRef<HTMLButtonElement | null>(null);
  const animRef = useRef<JSAnimation | null>(null);
  const hoveredRef = useRef(false);
  const reducedRef = useRef(false);

  useEffect(() => {
    reducedRef.current = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  }, []);

  useEffect(() => {
    return () => {
      animRef.current?.revert();
    };
  }, []);

  const resolve = useCallback((): Palette => {
    if (active) return palettes[variant].active;
    return hoveredRef.current ? palettes[variant].hover : palettes[variant].base;
  }, [active, variant]);

  const tween = useCallback(
    (target: Palette) => {
      const el = innerRef.current;
      if (!el) return;
      if (reducedRef.current) {
        el.style.color = target.color;
        el.style.borderColor = target.borderColor;
        el.style.backgroundColor = target.backgroundColor;
        el.style.textShadow = target.textShadow;
        return;
      }
      animRef.current = animate(el, {
        color: target.color,
        borderColor: target.borderColor,
        backgroundColor: target.backgroundColor,
        textShadow: target.textShadow,
        duration: kanso.motion["duration-tick"],
        ease: EASE,
      });
    },
    []
  );

  useEffect(() => {
    tween(resolve());
  }, [resolve, tween]);

  const handleEnter = (e: MouseEvent<HTMLButtonElement>) => {
    hoveredRef.current = true;
    onMouseEnter?.(e);
    tween(resolve());
  };

  const handleLeave = (e: MouseEvent<HTMLButtonElement>) => {
    hoveredRef.current = false;
    onMouseLeave?.(e);
    tween(resolve());
  };

  return (
    <button
      ref={(node) => {
        innerRef.current = node;
        if (typeof ref === "function") ref(node);
        else if (ref) ref.current = node;
      }}
      type={type}
      aria-pressed={active}
      className={[
        "kanso-chip",
        `kanso-chip--${variant}`,
        sizeClass[size],
        className,
      ].join(" ")}
      onMouseEnter={handleEnter}
      onMouseLeave={handleLeave}
      {...rest}
    />
  );
});
