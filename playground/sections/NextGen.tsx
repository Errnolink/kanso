// V2 additions — the three components and two props the redesign added.
// Each one exists because a real screen needed it and the library made the
// app hand-roll it: an aggregate of named voters, an alert loud enough to
// stop work, a texture field that isn't fake Japanese, a meter that can
// admit it went past its bound, and a panel that can label its own footer.
import { useState } from "react";
import {
  Badge,
  Button,
  DataList,
  DataTexture,
  MagiConsensus,
  Meter,
  Panel,
  Readout,
  Switch,
  Takeover,
  RAMP_NAMES,
  rampGradient,
  type MagiNode,
} from "../../src";
import { Demo, Grid, Section, series } from "../Showcase";
import { Split } from "../ThemeSwitch";

// --- MAGI ----------------------------------------------------------------
const DELIBERATING: MagiNode[] = [
  { id: "melchior", name: "MELCHIOR", state: "affirm", detail: "harmonics within tolerance" },
  { id: "balthasar", name: "BALTHASAR", state: "pending", detail: "awaiting thermal sample" },
  { id: "casper", name: "CASPER", state: "deny", detail: "sync margin below floor" },
];

const COMPROMISED: MagiNode[] = [
  { id: "melchior", name: "MELCHIOR", state: "affirm", detail: "checksum verified" },
  { id: "balthasar", name: "BALTHASAR", state: "deny", detail: "checksum verified" },
  { id: "casper", name: "CASPER", state: "compromised", detail: "unsigned firmware — vote discarded" },
];

// The same component with the fiction taken out. This is what it is for.
const SHARDS: MagiNode[] = [
  { id: "s1", name: "SHARD 1", state: "affirm", detail: "412 passed · 0 failed" },
  { id: "s2", name: "SHARD 2", state: "affirm", detail: "398 passed · 0 failed" },
  { id: "s3", name: "SHARD 3", state: "deny", detail: "406 passed · 2 failed" },
  { id: "s4", name: "SHARD 4", state: "affirm", detail: "401 passed · 0 failed" },
  { id: "s5", name: "SHARD 5", state: "pending", detail: "running — 61%" },
];

// --- DataTexture ---------------------------------------------------------
// Real-shaped application data: ISO timestamps, request ids, commit SHAs,
// edge nodes, internal IPs, hex offsets. Nothing here is ornament — it is
// the same text the log pane above it would print, at the faintest token.
const SHAS = ["a3f9c21", "7d41e08", "0b52ff4", "e19a730", "4c8d15b", "91fe203", "2ab77c9", "d0341ae"];
const NODES = ["edge-nrt-04", "edge-fra-01", "edge-iad-07", "edge-sin-02", "edge-gru-03"];
const STATUS = ["200", "200", "200", "304", "200", "502", "200", "429"];

const LATENCY = series(28, 17, 0.05);

const TEXTURE = Array.from({ length: 28 }, (_, i) => {
  const ts = new Date(Date.UTC(2026, 7, 13, 2, 41, 3 + i * 7)).toISOString();
  const req = ((0x9e3779b9 * (i + 1)) >>> 0).toString(16).padStart(8, "0");
  const ms = String(Math.round(LATENCY[i] * 480)).padStart(3, " ");
  return [
    ts,
    `req_${req}`,
    SHAS[i % SHAS.length],
    NODES[i % NODES.length].padEnd(11, " "),
    `10.42.${i % 8}.${(i * 37) % 251}`.padEnd(14, " "),
    STATUS[i % STATUS.length],
    `${ms}ms`,
    `0x${(0x4a00 + i * 0x40).toString(16)}`,
  ].join("  ");
});

const HEXDUMP = Array.from({ length: 10 }, (_, i) => {
  const off = (0x1f40 + i * 16).toString(16).padStart(8, "0");
  const bytes = Array.from({ length: 16 }, (_, b) =>
    (((i * 16 + b) * 167 + 41) & 0xff).toString(16).padStart(2, "0")
  ).join(" ");
  return `${off}  ${bytes}`;
});

// --- Meter ---------------------------------------------------------------
const STEP_METERS: Array<[string, number]> = [
  ["CPU", 0.14],
  ["MEM", 0.38],
  ["SWAP", 0.57],
  ["THERM", 0.79],
  ["LOAD", 0.97],
];

export function NextGen({ split }: { split: boolean }) {
  const [takeover, setTakeover] = useState<"danger" | "warning" | null>(null);
  const [strobe, setStrobe] = useState(false);

  return (
    <>
      <Section
        id="consensus"
        index="26"
        title="MAGI CONSENSUS"
        lineage="NERV"
        blurb={
          <>
            n named voters and the one answer they add up to. The MAGI screen is the
            only NERV device with no equivalent anywhere else, and underneath the
            fiction it is an ordinary pattern the system had no primitive for: CI
            shard status, replica and quorum health, multi-region availability,
            approval workflows, ensemble model voting. Anywhere several named
            participants each hold a position and something has to report the
            aggregate. Read it as a costume and you will hand-roll it in three apps.
          </>
        }
      >
        <Grid>
          <Demo
            title="TRIANGLE — MID-DELIBERATION"
            stack
            note="The default layout at n = 3. The nodes are deliberately quiet and the aggregate is the one bright thing in the box, because the aggregate is the answer; the nodes are the working."
            code={`<MagiConsensus
  label="MAGI // DECISION 0x2C"
  nodes={[
    { id: "melchior", name: "MELCHIOR", state: "affirm", detail: "harmonics within tolerance" },
    { id: "balthasar", name: "BALTHASAR", state: "pending", detail: "awaiting thermal sample" },
    { id: "casper", name: "CASPER", state: "deny", detail: "sync margin below floor" },
  ]}
/>`}
          >
            <MagiConsensus label="MAGI // DECISION 0x2C" nodes={DELIBERATING} />
          </Demo>

          <Demo
            title="COMPROMISED NODE"
            stack
            note="A compromised node has not decided anything, so it is not counted as either vote — tallying it one way or the other is the actual failure mode. It takes the hazard fill and drops out of the quorum arithmetic, and the aggregate stays honest about being one vote short."
          >
            <MagiConsensus label="MAGI // DECISION 0x2D" nodes={COMPROMISED} />
          </Demo>
        </Grid>

        <Demo
          title="ROW — CI SHARD GATE"
          wide
          stack
          note="The same component with the fiction removed. Five test shards, a quorum of five because a merge gate is unanimous, and an explicit verdict word because DELIBERATING is not what a build says. layout=&quot;row&quot; is the fallback at any n ≠ 3 and can be forced at 3."
          code={`<MagiConsensus
  layout="row"
  label="CI // MERGE GATE — pr/2481"
  quorum={5}
  verdict="BLOCKED"
  nodes={shards}
/>`}
        >
          <MagiConsensus
            layout="row"
            label="CI // MERGE GATE — pr/2481"
            quorum={5}
            verdict="BLOCKED"
            nodes={SHARDS}
          />
        </Demo>
      </Section>

      <Section
        id="takeover"
        index="27"
        title="TAKEOVER"
        lineage="EVA"
        blurb="Third and loudest rung of strip → banner → takeover. Fixed to the whole viewport, one enormous word in the level colour, hazard chevrons top and bottom, everything else gone. A critical alert rendered as a slightly redder toast has thrown the point away — but so has a takeover for anything a banner would carry, so this is the rung you reach for roughly once per app."
      >
        <Demo
          title="FULL-BLEED ALERT"
          wide
          stack
          note="Omit onDismiss and the alert cannot be silenced: no close control, no Escape. That is the mode a real emergency wants, so the DANGER specimen below only leaves through its own ACKNOWLEDGE action. The WARNING one takes onDismiss and behaves like a modal."
          code={`<Takeover
  open={open}
  code="05:"
  word="BREACH"
  detail="MAGI quorum lost — 2 of 3 units unreachable"
  actions={<Button variant="danger" onClick={ack}>ACKNOWLEDGE</Button>}
/>`}
        >
          <div className="row">
            <Button variant="danger" onClick={() => setTakeover("danger")}>
              OPEN DANGER
            </Button>
            <Button variant="secondary" onClick={() => setTakeover("warning")}>
              OPEN WARNING (DISMISSABLE)
            </Button>
          </div>
          <Switch
            label="STROBE"
            description="Off by default. 1 Hz on the blink token, step-end — under WCAG 2.3.1's three-per-second ceiling — and it dims the word rather than the plate, so the flashing area is a glyph run and not the viewport. Withheld entirely under prefers-reduced-motion or .kanso-reduce-motion."
            checked={strobe}
            onChange={(e) => setStrobe(e.target.checked)}
          />

          <Takeover
            open={takeover === "danger"}
            code="05:"
            word="BREACH"
            strobe={strobe}
            detail={
              <>
                MAGI quorum lost — 2 of 3 units unreachable.
                <br />
                Writes to the primary have been fenced.
              </>
            }
            actions={
              <Button variant="danger" onClick={() => setTakeover(null)}>
                ACKNOWLEDGE
              </Button>
            }
          />

          <Takeover
            open={takeover === "warning"}
            level="warning"
            code="0B:"
            word="THROTTLE"
            detail="Edge fleet at 94% of the request budget. Non-critical jobs are being shed."
            onDismiss={() => setTakeover(null)}
            actions={
              <Button variant="secondary" onClick={() => setTakeover(null)}>
                RAISE BUDGET
              </Button>
            }
          />
        </Demo>
      </Section>

      <Section
        id="texture"
        index="28"
        title="DATA TEXTURE"
        lineage="EVA"
        blurb={
          <>
            The text-as-texture field, with the rule that makes it defensible baked
            into the type: <code>lines</code> is required and nothing is ever
            generated. Ornamental CJK is culturally lazy, is frequently wrong — a
            great deal of copied cyberpunk signage is gibberish — and is read aloud
            by screen readers. Real hex dumps, request ids, commit SHAs, timestamps
            and IPs give the identical optical texture and are, in fact, denser. The
            field is <code>aria-hidden</code>, unselectable, static, and painted in{" "}
            <code>text-faint</code>, the one token declared below the contrast floor
            precisely so this effect can be a measured colour instead of an opacity
            fudge.
          </>
        }
      >
        <Grid>
          <Demo
            title="BEHIND LIVE CONTENT"
            wide
            stack
            note="Its actual job. The readouts are the content; the field says the system is doing far more than it is telling you. Same request log, one tier down."
            code={`<DataTexture lines={requestLog} rows={22} fade />`}
          >
            <div className="texture-bed kanso-surface-well">
              <DataTexture lines={TEXTURE} rows={22} fade />
              <div className="texture-bed-content row">
                <Readout label="REQ/S" value="1 284" state="nominal" />
                <Readout label="P99" value="128" unit="ms" delta={14} deltaInverted state="warning" />
                <Readout label="5XX" value="3" state="critical" footnote="edge-fra-01" />
              </div>
            </div>
          </Demo>

          <Demo
            title="REQUEST LOG"
            stack
            note="Unfaded and column-capped. Long lines are clipped, never wrapped — a wrapped line stops reading as a fixed-pitch field."
          >
            <DataTexture lines={TEXTURE} rows={12} columns={44} />
          </Demo>

          <Demo
            title="HEX DUMP"
            stack
            note="The other honest source. Offsets and bytes from the buffer the screen is already holding."
          >
            <DataTexture lines={HEXDUMP} fade />
          </Demo>
        </Grid>
      </Section>

      <Section
        id="overrange"
        index="29"
        title="METER — OVERRANGE & STEP"
        lineage="BTOP"
        blurb="Two additive props, both off by default. allowOverrange caps the bar and not the number; showStep prints the ramp step's word beside the value, so severity survives a viewer for whom the orange-to-red half of the ramp is one colour."
      >
        <Grid>
          <Demo
            title="OVERRANGE"
            stack
            note="A silent clamp is a lie about the telemetry. The bar still caps — a bar that overflows its track is unreadable — but a hazard block flags the excess and the readout carries the true figure. The clamped meter below it is the same input rendered the old way, and it is indistinguishable from a healthy 100%."
            code={`<Meter label="SYNC RATIO" value={4.12} allowOverrange showStep />
<Meter label="SYNC RATIO" value={4.12} />   // 100% — the lie`}
          >
            <Meter label="SYNC RATIO" value={4.12} allowOverrange showStep />
            <Meter label="SYNC RATIO — CLAMPED" value={4.12} />
            <Meter label="BUDGET" value={148} max={100} allowOverrange showStep />
            <Meter label="QUEUE DEPTH" value={12} max={8} allowOverrange segments={24} />
          </Demo>

          <Demo
            title="STEP WORD"
            stack
            note="Adjacent ramp stops sit below 3:1 against each other — inherent to any five-stop green-to-red path, and not fixable with more hue. The fix is the word. Ignored unless color=&quot;ramp&quot;: a single hue has no severity step to name."
            code={`<Meter label="THERM" value={0.79} showStep />`}
          >
            <Split
              on={split}
              note="The specimen the redesign has to win on: the v2 ramp widens the green-to-amber leg and pulls warning off primary, and the step word means neither pane depends on that separation to be read."
            >
              {() => (
                <div className="col">
                  {STEP_METERS.map(([label, value]) => (
                    <Meter key={label} label={label} value={value} showStep />
                  ))}
                </div>
              )}
            </Split>
          </Demo>

          <Demo
            title="THE RAMP ITSELF"
            wide
            stack
            note="Both generations of the five stops, drawn from var(--kanso-ramp-*) rather than the baked hex list, which is why the bar follows the theme at all. v2 desaturates nominal, widens the middle, and stops warning from colliding with primary."
          >
            <Split on={split}>
              {() => (
                <div className="col">
                  <div className="ramp-bar" style={{ background: rampGradient() }} />
                  <div className="ramp-stops">
                    {RAMP_NAMES.map((n) => (
                      <span
                        key={n}
                        className="ramp-stop"
                        style={{ color: `var(--kanso-ramp-${n})` }}
                      >
                        {n.toUpperCase()}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </Split>
          </Demo>
        </Grid>
      </Section>

      <Section
        id="title2"
        index="30"
        title="PANEL — TITLE2"
        lineage="BTOP"
        blurb="btop's createBox draws a second title into the bottom rule, and every panel in every monitoring app eventually wants one: last-updated, record count, source. It is metadata, never a heading, and it composes with footer — the footer is a content strip, title2 is the edge itself."
      >
        <Grid>
          <Demo
            title="BOTTOM-RULE READOUT"
            stack
            code={`<Panel title="MAGI // CORE STATUS" title2="UPDATED 02:41:09" accent="primary">
  …
</Panel>`}
          >
            <Panel
              title="MAGI // CORE STATUS"
              meta="03 UNITS"
              title2="UPDATED 02:41:09"
              accent="primary"
              notch="left"
            >
              <DataList
                items={[
                  { label: "MELCHIOR", value: "ONLINE", state: "nominal" },
                  { label: "BALTHASAR", value: "78°C", state: "warning" },
                  { label: "CASPER", value: "UNSIGNED", state: "critical" },
                ]}
              />
            </Panel>

            <Panel
              title="REQUEST LOG"
              title2="1 284 ROWS · edge-nrt-04"
              accent="info"
              footer={<span>FILTERED — status ≥ 400</span>}
            >
              <span className="kanso-value">3 errors in the last 60 s</span>
            </Panel>
          </Demo>

          <Demo
            title="WITH A FOOTER"
            stack
            note="title2 and footer are not alternatives. The footer is a content strip inside the panel; title2 is the bottom edge itself, and a panel that has something to say in both places says it in both places."
          >
            <Panel
              title="SYNC MONITOR"
              meta="EVA-01"
              title2="LAST SAMPLE 00:00:02 AGO"
              accent="primary"
              actions={<Badge variant="success" label="LIVE" />}
              footer={<span>HARMONICS WITHIN TOLERANCE</span>}
            >
              <Meter label="SYNC" value={0.41} showStep />
            </Panel>
          </Demo>
        </Grid>
      </Section>
    </>
  );
}
