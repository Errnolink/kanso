// MagiConsensus — n named nodes plus the aggregate they add up to. The MAGI
// screen is the one NERV device with no equivalent anywhere else, and it is
// a real pattern underneath the fiction: CI shard status, replica/quorum
// health, multi-region availability, approval workflows, ensemble model
// voting. Anywhere several named voters produce one answer.
//
// The connector wires are drawn in a single aria-hidden SVG on a 0–100
// viewBox rather than from measured geometry: the lines run *behind* opaque
// node boxes, so approximate endpoints are invisible and the component
// needs no ResizeObserver to stay correct.
import { type CSSProperties, type HTMLAttributes, type ReactNode, forwardRef } from "react";
import { HazardStripe } from "../HazardStripe/HazardStripe";

export type MagiNodeState =
  | "pending"
  | "affirm"
  | "deny"
  | "abstain"
  | "compromised";

export interface MagiNode {
  id: string;
  name: string;
  state: MagiNodeState;
  /** Dim line under the state word — a reason, a region, a shard id. */
  detail?: string;
}

export interface MagiConsensusProps extends HTMLAttributes<HTMLDivElement> {
  nodes: MagiNode[];
  /** Override the derived aggregate. */
  verdict?: ReactNode;
  /** Votes needed to carry. Defaults to a simple majority. */
  quorum?: number;
  label?: string;
  /** "triangle" only applies at n = 3; everything else falls back to a row. */
  layout?: "triangle" | "row";
}

const STATE_WORD: Record<MagiNodeState, string> = {
  pending: "PENDING",
  affirm: "AFFIRM",
  deny: "DENY",
  abstain: "ABSTAIN",
  compromised: "COMPROMISED",
};

/** Triangle node centres, then row node centres, as viewBox percentages. */
const TRIANGLE_POINTS: Array<[number, number]> = [
  [25, 15],
  [75, 15],
  [50, 85],
];
const TRIANGLE_HUB: [number, number] = [50, 50];
const ROW_NODE_Y = 22;
const ROW_HUB: [number, number] = [50, 78];

export const MagiConsensus = forwardRef<HTMLDivElement, MagiConsensusProps>(
  function MagiConsensus(
    { nodes, verdict, quorum, label, layout = "triangle", className = "", style, ...rest },
    ref
  ) {
    const count = nodes.length;
    const carry = quorum ?? Math.floor(count / 2) + 1;
    const affirm = nodes.filter((n) => n.state === "affirm").length;
    const deny = nodes.filter((n) => n.state === "deny").length;

    // Only affirm and deny are votes. A compromised node has not decided
    // anything; counting it either way would be the actual failure mode.
    const outcome =
      affirm >= carry ? "approved" : deny >= carry ? "rejected" : "deliberating";
    const outcomeWord =
      outcome === "approved"
        ? "APPROVED"
        : outcome === "rejected"
          ? "REJECTED"
          : "DELIBERATING";

    const triangle = layout === "triangle" && count === 3;
    const points: Array<[number, number]> = triangle
      ? TRIANGLE_POINTS
      : nodes.map((_, i) => [((i + 0.5) / count) * 100, ROW_NODE_Y]);
    const hub = triangle ? TRIANGLE_HUB : ROW_HUB;

    return (
      <div
        ref={ref}
        role="group"
        aria-label={label ?? "consensus"}
        className={[
          "kanso-magi",
          triangle ? "kanso-magi--triangle" : "kanso-magi--row",
          className,
        ]
          .filter(Boolean)
          .join(" ")}
        style={{ ...style, "--kanso-magi-count": count } as CSSProperties}
        {...rest}
      >
        {label && <p className="kanso-magi__label">{label}</p>}

        <div className="kanso-magi__field">
          <svg
            className="kanso-magi__wires"
            viewBox="0 0 100 100"
            preserveAspectRatio="none"
            aria-hidden="true"
          >
            {points.map(([x, y], i) => (
              <line
                key={nodes[i]?.id ?? i}
                x1={x}
                y1={y}
                x2={hub[0]}
                y2={hub[1]}
                vectorEffect="non-scaling-stroke"
              />
            ))}
          </svg>

          {nodes.map((node, i) => (
            <div
              key={node.id}
              className={[
                "kanso-magi__node",
                `kanso-magi__node--${node.state}`,
                `kanso-magi__node--pos-${i + 1}`,
                "kanso-cut",
              ].join(" ")}
            >
              {node.state === "compromised" && <HazardStripe color="danger" />}
              <span className="kanso-magi__name">{node.name}</span>
              <span className="kanso-magi__state">{STATE_WORD[node.state]}</span>
              {node.detail && (
                <span className="kanso-magi__detail">{node.detail}</span>
              )}
            </div>
          ))}

          <div
            className={`kanso-magi__verdict kanso-magi__verdict--${outcome} kanso-notch`}
            role="status"
          >
            <span className="kanso-magi__verdict-label">CONSENSUS</span>
            <span className="kanso-magi__verdict-word">
              {verdict ?? outcomeWord}
            </span>
            <span className="kanso-magi__tally">
              AFFIRM {affirm} · DENY {deny} · QUORUM {carry}/{count}
            </span>
          </div>
        </div>
      </div>
    );
  }
);
