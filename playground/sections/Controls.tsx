// Controls — buttons, fields, toggles and selectors. The interactive
// surface: dense, mechanical, and never comfortable-looking.
import { useState } from "react";
import {
  Badge,
  Button,
  Checkbox,
  Chip,
  IconButton,
  Input,
  Radio,
  Segmented,
  Select,
  Slider,
  Switch,
  Textarea,
  MARK,
} from "../../src";
import { Demo, Grid, Section } from "../Showcase";
import { Split } from "../ThemeSwitch";

type View = "grid" | "list" | "split";

export function Controls({ split }: { split: boolean }) {
  const [clicks, setClicks] = useState(0);
  const [pollutant, setPollutant] = useState("PM2.5");
  const [termTab, setTermTab] = useState("LOG");
  const [view, setView] = useState<View>("grid");
  const [threshold, setThreshold] = useState(64);
  const [scanlines, setScanlines] = useState(true);
  const [autoScan, setAutoScan] = useState(false);
  const [mode, setMode] = useState("balanced");
  const [query, setQuery] = useState("");

  return (
    <>
      <Section
        id="buttons"
        index="16"
        title="BUTTONS"
        lineage="NERV"
        blurb="Chamfered, mono, uppercase, tracked. The primary variant is a solid orange plate with black ink — the system speaking in its own voice. Ghost is the default for anything that isn't the main action."
      >
        <Grid>
          <Demo
            title="VARIANTS"
            code={`<Button>EXECUTE</Button>
<Button variant="secondary">MONITOR</Button>
<Button variant="ghost">CANCEL</Button>
<Button variant="danger">PURGE</Button>`}
          >
            <Button onClick={() => setClicks((c) => c + 1)}>EXECUTE ({clicks})</Button>
            <Button variant="secondary">MONITOR</Button>
            <Button variant="ghost">CANCEL</Button>
            <Button variant="danger">PURGE</Button>
          </Demo>

          <Demo title="SIZES & STATE">
            <Button size="sm">SMALL</Button>
            <Button size="md">MEDIUM</Button>
            <Button size="lg">LARGE</Button>
            <Button disabled>DISABLED</Button>
          </Demo>

          <Demo title="ICON BUTTONS" note="The label prop is required — it becomes the accessible name.">
            <IconButton label="Play">{MARK.right}</IconButton>
            <IconButton label="Confirm" variant="solid">{MARK.ok}</IconButton>
            <IconButton label="Refresh" variant="outline">{MARK.netBoth}</IconButton>
            <IconButton label="Delete" variant="danger">{MARK.fail}</IconButton>
            <IconButton label="Small" size="sm">{MARK.up}</IconButton>
            <IconButton label="Large" size="lg">{MARK.down}</IconButton>
          </Demo>
        </Grid>
      </Section>

      <Section
        id="chips"
        index="17"
        title="CHIPS & BADGES"
        lineage="EVA"
        blurb="Chips select; badges label. The chip's state transitions are tweened rather than CSS-transitioned, because colour, border and text-shadow have to move together on a mechanical curve."
      >
        <Grid>
          <Demo title="SELECTOR CHIPS">
            {["PM2.5", "PM10", "O₃", "NO₂"].map((p) => (
              <Chip key={p} active={pollutant === p} onClick={() => setPollutant(p)}>
                {p}
              </Chip>
            ))}
          </Demo>

          <Demo title="TERMINAL TABS">
            {["LOG", "TASK", "SYS"].map((t) => (
              <Chip key={t} variant="term" active={termTab === t} onClick={() => setTermTab(t)}>
                {t}
              </Chip>
            ))}
          </Demo>

          <Demo title="BADGES">
            <Split
              on={split}
              note="Five badges is the whole functional palette in one row at the size it is actually read at, which makes this the cheapest test of a palette change: v2 lifts the badge off the 8px floor and pulls info away from the cyan reserved for focus."
            >
              {() => (
                <div className="row">
                  <Badge label="DEFAULT" />
                  <Badge variant="success" label="NOMINAL" />
                  <Badge variant="warning" label="PRIORITY" />
                  <Badge variant="info" label="RESOLVED" />
                  <Badge variant="danger" label="PURGED" />
                </div>
              )}
            </Split>
          </Demo>
        </Grid>
      </Section>

      <Section
        id="fields"
        index="18"
        title="FIELDS"
        lineage="NERV"
        blurb="Recessed wells with a single top-right chamfer, cyan caret, orange focus border. The label/hint/error contract is identical across Input, Textarea and Select so forms never drift."
      >
        <Grid>
          <Demo title="INPUT" stack>
            <Input
              label="TARGET DESIGNATION"
              placeholder="sector-07"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              block
            />
            <Input label="SEARCH" prefix={MARK.prompt} placeholder="filter…" block />
            <Input label="THRESHOLD" suffix="ppm" defaultValue="42" block />
            <Input label="HINTED" hint="Accepts a sector id or coordinate pair" block />
            <Input label="INVALID" error="Sector does not exist" defaultValue="sector-99" block />
            <Input label="DISABLED" disabled defaultValue="locked" block />
          </Demo>

          <Demo title="TEXTAREA & SELECT" stack>
            <Textarea label="OPERATOR NOTE" rows={4} placeholder="Log entry…" block />
            <Select
              label="PROFILE"
              value={mode}
              onChange={(e) => setMode(e.target.value)}
              options={[
                { value: "eco", label: "ECO" },
                { value: "balanced", label: "BALANCED" },
                { value: "combat", label: "COMBAT" },
                { value: "locked", label: "LOCKED", disabled: true },
              ]}
              block
            />
            <Select label="SECTOR" placeholder="— select —" options={[
              { value: "7", label: "SECTOR 07" },
              { value: "8", label: "SECTOR 08" },
            ]} block />
          </Demo>
        </Grid>
      </Section>

      <Section
        id="toggles"
        index="19"
        title="TOGGLES"
        lineage="NERV"
        blurb="Square boxes and rectangular switches. The radio is the system's one sanctioned curve: a round dot in a square box, because every square-in-square radio ends up reading as a checkbox that has forgotten what it is."
      >
        <Grid>
          <Demo title="CHECKBOX / RADIO" stack>
            <Checkbox label="CRT SCANLINES" checked={scanlines} onChange={(e) => setScanlines(e.target.checked)} />
            <Checkbox label="FILM GRAIN" description="Static fractal noise at 2%" defaultChecked />
            <Checkbox label="LOCKED" disabled />
            <div style={{ height: 8 }} />
            <Radio name="pri" label="PRIORITY LOW" defaultChecked />
            <Radio name="pri" label="PRIORITY HIGH" description="Escalates to the MAGI cluster" />
            <Radio name="pri" label="UNAVAILABLE" disabled />
          </Demo>

          <Demo title="SWITCH" stack>
            <Switch label="AUTO-SCAN" checked={autoScan} onChange={(e) => setAutoScan(e.target.checked)} />
            <Switch label="TELEMETRY UPLINK" description="Streams to the MAGI cluster" defaultChecked />
            <Switch label="MAINTENANCE MODE" disabled />
          </Demo>
        </Grid>
      </Section>

      <Section
        id="selectors"
        index="20"
        title="SELECTORS"
        lineage="EVA"
        blurb="The segmented control is the EVA ticket idiom applied to navigation: exactly one active, active is a bevel fill with dark ink, idle is the dim plate."
      >
        <Grid>
          <Demo
            title="SEGMENTED"
            stack
            code={`<Segmented
  label="View mode"
  value={view}
  onChange={setView}
  options={[{ value: "grid", label: "GRID" }, …]}
/>`}
          >
            <Segmented<View>
              label="View mode"
              value={view}
              onChange={setView}
              options={[
                { value: "grid", label: "GRID" },
                { value: "list", label: "LIST" },
                { value: "split", label: "SPLIT" },
              ]}
            />
            <Segmented<View>
              label="View mode small"
              size="sm"
              value={view}
              onChange={setView}
              options={[
                { value: "grid", label: "GRID" },
                { value: "list", label: "LIST" },
                { value: "split", label: "SPLIT" },
              ]}
            />
          </Demo>

          <Demo title="SLIDER" stack>
            <Slider
              label="ALERT THRESHOLD"
              min={0}
              max={100}
              value={threshold}
              onChange={(e) => setThreshold(Number(e.target.value))}
              showValue
              unit="%"
              block
            />
            <Slider label="TICKED" min={0} max={8} defaultValue={3} ticks={9} showValue block />
            <Slider label="SMALL" size="sm" defaultValue={40} block />
          </Demo>
        </Grid>
      </Section>
    </>
  );
}
