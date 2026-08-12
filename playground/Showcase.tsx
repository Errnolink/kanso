// Gallery scaffolding for the playground. Deliberately built from the
// library's own primitives — if the docs page is painful to build, the
// library is wrong.
import { useEffect, useRef, useState, type ReactNode } from "react";

export interface SectionProps {
  id: string;
  index: string;
  title: string;
  lineage?: "NERV" | "EVA" | "BTOP" | "CYBER" | "CORE";
  blurb?: ReactNode;
  children: ReactNode;
}

export function Section({ id, index, title, lineage, blurb, children }: SectionProps) {
  return (
    <section className="sec" id={id}>
      <div className="sec-head">
        <span className="sec-index">{index}</span>
        <span className="sec-title kanso-stamp">{title}</span>
        {lineage && <span className={`sec-lineage sec-lineage--${lineage.toLowerCase()}`}>{lineage}</span>}
      </div>
      {blurb && <p className="sec-blurb">{blurb}</p>}
      <div className="sec-body">{children}</div>
    </section>
  );
}

export interface DemoProps {
  title: string;
  note?: ReactNode;
  code?: string;
  /** Lay the demo surface out as a column instead of a wrapped row. */
  stack?: boolean;
  /** Give the demo a live background so glass and overlays read correctly. */
  live?: boolean;
  wide?: boolean;
  children: ReactNode;
}

export function Demo({ title, note, code, stack, live, wide, children }: DemoProps) {
  const [showCode, setShowCode] = useState(false);
  return (
    <div className={`demo${wide ? " demo--wide" : ""}`}>
      <div className="demo-bar">
        <span className="demo-title">{title}</span>
        {code && (
          <button
            type="button"
            className="demo-toggle"
            onClick={() => setShowCode((s) => !s)}
            aria-expanded={showCode}
          >
            {showCode ? "HIDE SRC" : "SRC"}
          </button>
        )}
      </div>
      {note && <p className="demo-note">{note}</p>}
      <div className={`demo-stage${stack ? " demo-stage--stack" : ""}${live ? " demo-stage--live" : ""}`}>
        {children}
      </div>
      {code && showCode && (
        <pre className="demo-code">
          <code>{code}</code>
        </pre>
      )}
    </div>
  );
}

export function Grid({ children, cols }: { children: ReactNode; cols?: number }) {
  return (
    <div className="demo-grid" style={cols ? { gridTemplateColumns: `repeat(${cols}, minmax(0, 1fr))` } : undefined}>
      {children}
    </div>
  );
}

/** Scroll-spy sidebar. Plain IntersectionObserver — no router, no deps. */
export function Nav({ items }: { items: Array<{ id: string; label: string; group: string }> }) {
  const [active, setActive] = useState(items[0]?.id ?? "");
  const ref = useRef<IntersectionObserver | null>(null);

  useEffect(() => {
    ref.current = new IntersectionObserver(
      (entries) => {
        const visible = entries
          .filter((e) => e.isIntersecting)
          .sort((a, b) => a.boundingClientRect.top - b.boundingClientRect.top)[0];
        if (visible) setActive(visible.target.id);
      },
      { rootMargin: "-10% 0px -75% 0px", threshold: 0 }
    );
    for (const item of items) {
      const el = document.getElementById(item.id);
      if (el) ref.current.observe(el);
    }
    return () => ref.current?.disconnect();
  }, [items]);

  const groups = items.reduce<Record<string, typeof items>>((acc, item) => {
    (acc[item.group] ||= []).push(item);
    return acc;
  }, {});

  return (
    <nav className="nav" aria-label="Component index">
      {Object.entries(groups).map(([group, entries]) => (
        <div className="nav-group" key={group}>
          <div className="nav-group-label">{group}</div>
          {entries.map((item) => (
            <a
              key={item.id}
              href={`#${item.id}`}
              className={`nav-link${active === item.id ? " nav-link--active" : ""}`}
            >
              {item.label}
            </a>
          ))}
        </div>
      ))}
    </nav>
  );
}

/** Deterministic pseudo-random series, so the gallery renders identically
    on every reload and screenshots stay diffable. */
export function series(n: number, seed = 7, floor = 0.08): number[] {
  const out: number[] = [];
  let s = seed;
  for (let i = 0; i < n; i++) {
    s = (s * 1103515245 + 12345) % 2147483648;
    const wave = (Math.sin(i / 5) + 1) / 2;
    out.push(Math.max(floor, wave * 0.6 + (s / 2147483648) * 0.4));
  }
  return out;
}
