// Telemetry — the btop layer. Meters, gauges, graphs, tables and logs.
import { useEffect, useState } from "react";
import {
  BarChart,
  BrailleGraph,
  CoreGrid,
  DataList,
  Gauge,
  LED,
  Meter,
  Progress,
  Readout,
  SegmentBar,
  Skeleton,
  Sparkline,
  Table,
  TermBox,
  Terminal,
  type TerminalLine,
} from "../../src";
import { Demo, Grid, Section, series } from "../Showcase";
import { Split } from "../ThemeSwitch";

const CPU = series(64, 11);
const NET = series(48, 29);
const CORES = Array.from({ length: 16 }, (_, i) => ({
  label: `C${String(i).padStart(2, "0")}`,
  value: series(16, 3 + i)[i] ?? 0.4,
}));

interface Proc {
  pid: number;
  name: string;
  cpu: number;
  mem: number;
  user: string;
}

const PROCS: Proc[] = [
  { pid: 1204, name: "magi-core", cpu: 0.91, mem: 4.2, user: "root" },
  { pid: 2318, name: "sync-daemon", cpu: 0.62, mem: 1.8, user: "nerv" },
  { pid: 3390, name: "at-field-mon", cpu: 0.41, mem: 0.9, user: "nerv" },
  { pid: 4471, name: "telemetry", cpu: 0.18, mem: 0.4, user: "nerv" },
  { pid: 5522, name: "vite", cpu: 0.07, mem: 0.3, user: "chef" },
];

const LOG: TerminalLine[] = [
  { ts: "02:41:03", level: "system", text: "MAGI handshake complete — 3/3 units responding" },
  { ts: "02:41:04", level: "info", text: "sync ratio nominal (41.3%)" },
  { ts: "02:41:09", level: "info", text: "sector scan 07 → 12 clear" },
  { ts: "02:41:16", level: "warn", text: "thermal margin narrowing on unit BALTHASAR (78°C)" },
  { ts: "02:41:22", level: "error", text: "pattern BLUE detected — sector 7, closing 61 m/s" },
  { ts: "02:41:22", level: "system", text: "escalating to level 2 alert" },
];

export function Telemetry({ split }: { split: boolean }) {
  const [progress, setProgress] = useState(0.15);
  const [sortKey, setSortKey] = useState<{ key: string; direction: "asc" | "desc" }>({
    key: "cpu",
    direction: "desc",
  });
  const [selected, setSelected] = useState("1204");

  useEffect(() => {
    const id = setInterval(() => setProgress((p) => (p >= 1 ? 0.05 : p + 0.05)), 900);
    return () => clearInterval(id);
  }, []);

  const rows = [...PROCS].sort((a, b) => {
    const dir = sortKey.direction === "asc" ? 1 : -1;
    const key = sortKey.key as keyof Proc;
    return a[key] > b[key] ? dir : a[key] < b[key] ? -dir : 0;
  });

  return (
    <>
      <Section
        id="termbox"
        index="11"
        title="TERMBOX"
        lineage="BTOP"
        blurb="btop's framed box, drawn with real box-drawing characters and a hotkey digit in the top rule. The frame is CSS so it holds at any pixel size; the corner marks are glyphs so it still reads as a terminal."
      >
        <Grid>
          <Demo
            title="CPU BOX"
            wide
            stack
            code={`<TermBox label="cpu" hotkey={1} right="18%">
  {/* columns omitted — the graph measures and fills the box */}
  <BrailleGraph values={cpu} rows={4} color="ramp" />
</TermBox>`}
          >
            <TermBox label="cpu" hotkey={1} right="18%" color="success">
              <BrailleGraph values={CPU} rows={4} color="ramp" />
            </TermBox>
          </Demo>
          <Demo title="BOX STYLES" wide stack>
            {(["sharp", "rounded", "heavy", "double"] as const).map((s) => (
              <TermBox key={s} label={s} boxStyle={s} hotkey={s[0].toUpperCase()} color="primary">
                <span className="kanso-value">box-drawing set: {s}</span>
              </TermBox>
            ))}
          </Demo>
        </Grid>
      </Section>

      <Section
        id="meters"
        index="12"
        title="METERS & GAUGES"
        lineage="BTOP"
        blurb="Every fill draws from the shared severity ramp, so magnitude reads before the number does — and 80% looks the same shade in every app that uses Kanso."
      >
        <Grid>
          <Demo
            title="METER — RAMP"
            stack
            code={`<Meter label="CPU" value={0.18} />
<Meter label="MEM" value={0.62} />
<Meter label="THERM" value={0.94} />`}
          >
            <Meter label="CPU" value={0.18} />
            <Meter label="MEM" value={0.44} />
            <Meter label="SWAP" value={0.62} />
            <Meter label="THERM" value={0.81} />
            <Meter label="LOAD" value={0.96} />
          </Demo>

          <Demo title="METER — SEGMENTED" stack note="btop's discrete block bar. Use when the quantity is naturally quantised.">
            <Meter label="CORE 00" value={0.35} segments={24} />
            <Meter label="CORE 01" value={0.68} segments={24} />
            <Meter label="CORE 02" value={0.92} segments={24} />
            <Meter label="FIXED HUE" value={0.55} segments={24} color="info" />
            <Meter label="SMALL" value={0.72} size="sm" />
          </Demo>

          <Demo title="GAUGE">
            <Gauge value={0.18} label="CPU" />
            <Gauge value={0.62} label="MEM" />
            <Gauge value={0.94} label="THERM" />
            <Gauge value={41.3} max={100} unit="%" label="SYNC" color="info" size={96} />
          </Demo>

          <Demo
            title="CORE GRID"
            wide
            stack
            note="btop's per-core wall — dense enough to scan as a texture, legible enough to read a single core."
          >
            <CoreGrid cores={CORES} columns={4} />
          </Demo>
        </Grid>
      </Section>

      <Section
        id="graphs"
        index="13"
        title="GRAPHS"
        lineage="BTOP"
        blurb="Two rendering models. Braille packs 2×4 subpixels into every character — a graph that survives being pasted into a terminal or a log file. SVG is for when you need real geometry."
      >
        <Grid>
          <Demo
            title="BRAILLE"
            wide
            stack
            code={`<BrailleGraph values={cpu} rows={4} columns={60} color="ramp" />`}
          >
            <BrailleGraph values={CPU} rows={4} color="ramp" label="CPU 60s" />
            <BrailleGraph values={NET} rows={3} color="info" label="NET RX" />
          </Demo>

          <Demo title="SPARKLINE" wide stack note="Fluid by default — the trace takes the width it is given.">
            <Sparkline values={CPU} height={64} fill />
            <Sparkline values={NET} height={64} color="info" fill />
            <Sparkline values={CPU} height={36} color="ramp" />
          </Demo>

          <Demo title="BAR CHART" stack>
            <BarChart
              data={[
                { label: "IMAGES", value: 1284 },
                { label: "VIDEO", value: 862 },
                { label: "RAW", value: 341 },
                { label: "AUDIO", value: 96 },
                { label: "OTHER", value: 24 },
              ]}
              showValues
              color="ramp"
            />
          </Demo>

          <Demo title="SEGMENT BAR" stack note="Composition, not severity — so it takes explicit hues.">
            <SegmentBar
              segments={[
                { label: "SYSTEM", value: 42, color: "primary" },
                { label: "MEDIA", value: 118, color: "info" },
                { label: "CACHE", value: 31, color: "accent" },
                { label: "FREE", value: 89, color: "success" },
              ]}
              showLegend
            />
          </Demo>
        </Grid>
      </Section>

      <Section
        id="readouts"
        index="14"
        title="READOUTS"
        lineage="NERV"
        blurb="The label/value pair is the atom of this system: tiny uppercase tracked label, large tabular value. Everything else is arrangement."
      >
        <Grid>
          <Demo title="STAT TILES">
            <Readout label="UPTIME" value="412:09:55" />
            <Readout label="SYNC RATIO" value="41.3" unit="%" delta={2.1} state="nominal" />
            <Readout label="LATENCY" value="128" unit="ms" delta={14} deltaInverted state="warning" />
            <Readout label="BREACHES" value="1" state="critical" footnote="SECTOR 7" />
          </Demo>

          <Demo title="DATA LIST">
            <DataList
              items={[
                { label: "HOST", value: "nerv-tokyo-3" },
                { label: "KERNEL", value: "6.9.4-magi" },
                { label: "UPTIME", value: "17d 04:09" },
                { label: "LOAD", value: "0.42 0.51 0.60", state: "nominal" },
                { label: "THERM", value: "78°C", state: "warning" },
              ]}
            />
          </Demo>

          <Demo title="LEDS" stack>
            <div className="row">
              <LED state="ok" label="MELCHIOR" />
              <LED state="ok" label="BALTHASAR" />
              <LED state="warn" label="CASPER" />
            </div>
            <div className="row">
              <LED state="crit" label="BREACH" blink />
              <LED state="info" label="SCAN" />
              <LED state="off" label="STANDBY" />
            </div>
          </Demo>

          <Demo title="PROGRESS" stack>
            <Progress value={progress} label="EXTRACTING" showValue />
            <Progress value={0.62} label="INDEX" color="info" />
            <Progress indeterminate label="SCANNING" />
            <Progress value={0.4} size="sm" />
          </Demo>
        </Grid>
      </Section>

      <Section
        id="data"
        index="15"
        title="TABLE & TERMINAL"
        lineage="BTOP"
        blurb="The process list and the log. Between them they cover most of what a monitoring surface actually shows."
      >
        <Demo title="PROCESS TABLE" wide>
          <Split
            on={split}
            note="The table head carries the most small tracked type on any screen in the system, so it is where the v2 type floor and the visible-border change earn or lose their argument. Sort state is held above the panes, so both sides stay on the same column."
          >
            {() => (
              <div className="col">
                <Table<Proc>
                  rows={rows}
                  rowKey={(r) => String(r.pid)}
                  selectedKey={selected}
                  onSelect={(r) => setSelected(String(r.pid))}
                  sort={sortKey}
                  onSortChange={(key) =>
                    setSortKey((s) =>
                      s.key === key
                        ? { key, direction: s.direction === "asc" ? "desc" : "asc" }
                        : { key, direction: "desc" }
                    )
                  }
                  columns={[
                    { key: "pid", header: "PID", align: "right", width: 70 },
                    { key: "name", header: "COMMAND" },
                    { key: "user", header: "USER", width: 90 },
                    {
                      key: "cpu",
                      header: "CPU%",
                      align: "right",
                      width: 110,
                      render: (r) => <Meter value={r.cpu} size="sm" showValue />,
                    },
                    {
                      key: "mem",
                      header: "MEM",
                      align: "right",
                      width: 80,
                      render: (r) => `${r.mem.toFixed(1)} GB`,
                    },
                  ]}
                />
              </div>
            )}
          </Split>
        </Demo>

        <Grid>
          <Demo title="TERMINAL">
            <Terminal title="SYSTEM LOG" lines={LOG} cursor height={200} follow />
          </Demo>
          <Demo title="SKELETON" stack note="Opacity pulse only — an animated gradient sweep repaints every frame, and a virtualized grid shows fifty at once.">
            <Skeleton height={18} count={4} />
          </Demo>
        </Grid>
      </Section>
    </>
  );
}
