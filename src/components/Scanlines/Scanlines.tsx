// Scanlines / Grain / Vignette / CRT — the atmosphere layer.
//
// These are the cheapest way to make a flat dark UI read as a physical
// instrument, and the easiest thing in the system to overdo. The house
// setting is: scanlines at 6% on a 4px period, grain at 2%, vignette on.
// If a screen needs more atmosphere than that, the problem is the layout.
import { useEffect, useRef } from "react";
import { animate, linear, type JSAnimation } from "animejs";
import { kanso } from "../../tokens";

export interface ScanlinesProps {
  className?: string;
  zIndex?: number;
  /** Scroll period in ms. 0 or `prefers-reduced-motion` pins them still. */
  speed?: number;
  /** Legacy convenience: render a vignette alongside. Prefer <CRT />. */
  vignette?: boolean;
}

export function Scanlines({
  className = "",
  zIndex = kanso.z.overlay,
  speed = kanso.scanline.duration,
  vignette = false,
}: ScanlinesProps) {
  const scanRef = useRef<HTMLDivElement | null>(null);
  const animRef = useRef<JSAnimation | null>(null);

  useEffect(() => {
    const el = scanRef.current;
    if (!el || !speed) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    // Loop restarts are invisible because the gradient period divides the
    // shifted distance exactly.
    animRef.current = animate(el, {
      backgroundPosition: ["0 0", "0 100%"],
      duration: speed,
      ease: linear(0, 1),
      loop: true,
    });
    return () => {
      animRef.current?.revert();
    };
  }, [speed]);

  return (
    <>
      <div
        ref={scanRef}
        aria-hidden="true"
        className={["kanso-scanlines", className].filter(Boolean).join(" ")}
        style={{ zIndex }}
      />
      {vignette && <Vignette zIndex={zIndex} />}
    </>
  );
}

export interface VignetteProps {
  className?: string;
  zIndex?: number;
}

/** Vignette — tube-edge falloff. Sells the curved glass more than scanlines do. */
export function Vignette({ className = "", zIndex = kanso.z.overlay }: VignetteProps) {
  return (
    <div
      aria-hidden="true"
      className={["kanso-vignette", className].filter(Boolean).join(" ")}
      style={{ zIndex }}
    />
  );
}

export interface GrainProps {
  className?: string;
  zIndex?: number;
  /** 0..1. Above ~0.04 it stops being film and starts being noise. */
  opacity?: number;
}

/** Grain — static fractal-noise film grain. Inline SVG, no network fetch. */
export function Grain({
  className = "",
  zIndex = kanso.z.grain,
  opacity = kanso.effect["grain-opacity"],
}: GrainProps) {
  return (
    <div
      aria-hidden="true"
      className={["kanso-grain", className].filter(Boolean).join(" ")}
      style={{ zIndex, opacity }}
    />
  );
}

export interface CRTProps {
  scanlines?: boolean;
  grain?: boolean;
  vignette?: boolean;
  /** Scanline scroll period in ms. Pass 0 for a static mask. */
  speed?: number;
  zIndex?: number;
}

/** CRT — the whole atmosphere stack in one mount. Put it at the app root. */
export function CRT({
  scanlines = true,
  grain = true,
  vignette = true,
  speed = kanso.scanline.duration,
  zIndex = kanso.z.overlay,
}: CRTProps) {
  return (
    <>
      {scanlines && <Scanlines speed={speed} zIndex={zIndex} />}
      {vignette && <Vignette zIndex={zIndex} />}
      {grain && <Grain zIndex={zIndex + 1} />}
    </>
  );
}
