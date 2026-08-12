// Kanso glyphs — the btop layer.
//
// btop draws everything with characters: box-drawing rules for frames,
// braille cells for graphs (2x4 subpixels per character), block elements
// for meters. That is a genuinely different rendering model from SVG and
// it is worth keeping, because it makes a chart that survives being
// copy-pasted into a terminal, a log file, or a <pre>.

/** Box-drawing sets. `sharp` is the Kanso default; `rounded` is btop's. */
export const BOX = {
  sharp: {
    tl: "┌", tr: "┐", bl: "└", br: "┘",
    h: "─", v: "│",
    tee: "┬", teeUp: "┴", teeLeft: "┤", teeRight: "├", cross: "┼",
  },
  rounded: {
    tl: "╭", tr: "╮", bl: "╰", br: "╯",
    h: "─", v: "│",
    tee: "┬", teeUp: "┴", teeLeft: "┤", teeRight: "├", cross: "┼",
  },
  heavy: {
    tl: "┏", tr: "┓", bl: "┗", br: "┛",
    h: "━", v: "┃",
    tee: "┳", teeUp: "┻", teeLeft: "┫", teeRight: "┣", cross: "╋",
  },
  double: {
    tl: "╔", tr: "╗", bl: "╚", br: "╝",
    h: "═", v: "║",
    tee: "╦", teeUp: "╩", teeLeft: "╣", teeRight: "╠", cross: "╬",
  },
} as const;

export type BoxStyle = keyof typeof BOX;

/** Tree connectors — process trees, folder trees, dependency lists. */
export const TREE = { branch: "├─", last: "└─", pipe: "│ ", space: "  " } as const;

/** Eighth-block ramps. Vertical fills bottom-up, horizontal left-to-right. */
export const BLOCK_V = ["", "▁", "▂", "▃", "▄", "▅", "▆", "▇", "█"] as const;
export const BLOCK_H = ["", "▏", "▎", "▍", "▌", "▋", "▊", "▉", "█"] as const;
export const SHADE = ["░", "▒", "▓", "█"] as const;

/** Status and direction marks used across readouts. */
export const MARK = {
  up: "▲", down: "▼", right: "▶", left: "◀",
  netUp: "↑", netDown: "↓", netBoth: "⇅",
  on: "●", off: "○", half: "◐", square: "■", squareOpen: "□",
  ok: "✓", fail: "✗", warn: "!", ellipsis: "…",
  cursor: "█", prompt: "❯", bullet: "·",
} as const;

// --- braille -----------------------------------------------------------
// A braille cell is 2 columns x 4 rows of dots. Bit weights are not in
// visual order (historical accident of the Unicode block), so the row
// masks are spelled out rather than computed.
const BRAILLE_BASE = 0x2800;
const DOT_LEFT = [0x01, 0x02, 0x04, 0x40]; // top -> bottom
const DOT_RIGHT = [0x08, 0x10, 0x20, 0x80];

/**
 * Render a series as braille rows, btop-style.
 *
 * Each output character holds two samples side by side and four vertical
 * subpixels, so a `height` of 2 rows resolves 8 levels in 1 line of text.
 * Returns `height` strings, top row first.
 */
export function brailleGraph(
  values: readonly number[],
  opts: { width?: number; height?: number; max?: number } = {}
): string[] {
  const height = Math.max(1, opts.height ?? 2);
  const cols = Math.max(1, opts.width ?? Math.ceil(values.length / 2));
  const samples = cols * 2;
  const subRows = height * 4;

  // Resample to exactly `samples` points — nearest-neighbour, because
  // interpolating telemetry invents data that was never measured.
  const series: number[] = [];
  for (let i = 0; i < samples; i++) {
    if (values.length === 0) {
      series.push(0);
      continue;
    }
    const idx = Math.min(
      values.length - 1,
      Math.round((i / Math.max(1, samples - 1)) * (values.length - 1))
    );
    series.push(values[idx]);
  }

  const max = opts.max ?? Math.max(1e-9, ...series);
  const levels = series.map((v) =>
    Math.max(0, Math.min(subRows, Math.round((v / max) * subRows)))
  );

  const rows: string[] = [];
  for (let r = 0; r < height; r++) {
    let line = "";
    for (let c = 0; c < cols; c++) {
      let bits = 0;
      for (const [col, dots] of [
        [c * 2, DOT_LEFT],
        [c * 2 + 1, DOT_RIGHT],
      ] as const) {
        const level = levels[col] ?? 0;
        for (let sub = 0; sub < 4; sub++) {
          // Subrow index counted from the top of the whole graph.
          const fromTop = r * 4 + sub;
          const fromBottom = subRows - fromTop;
          if (level >= fromBottom) bits |= dots[sub];
        }
      }
      line += String.fromCharCode(BRAILLE_BASE + bits);
    }
    rows.push(line);
  }
  return rows;
}

/** Single-line block sparkline — coarser than braille, reads at any size. */
export function blockSparkline(values: readonly number[], max?: number): string {
  if (values.length === 0) return "";
  const peak = max ?? Math.max(1e-9, ...values);
  return values
    .map((v) => {
      const step = Math.round((Math.max(0, v) / peak) * 8);
      return BLOCK_V[Math.min(8, step)] || "▁";
    })
    .join("");
}

/** Horizontal block meter with sub-character precision, btop's bar style. */
export function blockBar(fraction: number, width: number): string {
  const f = Math.max(0, Math.min(1, fraction));
  const total = f * width;
  const full = Math.floor(total);
  const remainder = Math.round((total - full) * 8);
  return (
    "█".repeat(full) +
    (full < width ? BLOCK_H[remainder] : "") +
    " ".repeat(Math.max(0, width - full - (remainder > 0 && full < width ? 1 : 0)))
  );
}

/**
 * A btop box title bar: `┌─ 1 ─ cpu ────────────────┐`.
 * Returned as a plain string so it can go in a <pre> or a log line.
 */
export function boxTitle(
  label: string,
  width: number,
  opts: { style?: BoxStyle; hotkey?: string | number } = {}
): string {
  const b = BOX[opts.style ?? "sharp"];
  const key = opts.hotkey === undefined ? "" : `${b.h} ${opts.hotkey} `;
  const head = `${b.tl}${b.h}${key}${b.h} ${label} `;
  const fill = Math.max(0, width - head.length - 1);
  return `${head}${b.h.repeat(fill)}${b.tr}`;
}
