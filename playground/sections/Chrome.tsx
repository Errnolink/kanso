// Chrome — the structural shell components: panels, frames, bars, rules,
// and the CRT atmosphere layer.
import { useState } from "react";
import {
  Badge,
  Brand,
  Button,
  Chip,
  Divider,
  Frame,
  HazardStripe,
  Panel,
  StatusBar,
  TopBar,
} from "../../src";
import { Demo, Grid, Section } from "../Showcase";

export function Chrome({
  crt,
  onToggleCrt,
}: {
  crt: { scanlines: boolean; grain: boolean; vignette: boolean };
  onToggleCrt: (key: "scanlines" | "grain" | "vignette") => void;
}) {
  const [tab, setTab] = useState("OVERVIEW");

  return (
    <>
      <Section
        id="panel"
        index="06"
        title="PANEL"
        lineage="NERV"
        blurb="Every block of content lives in one of these. The 2px accent rule declares the panel's role, and the notch declares where it is docked."
      >
        <Grid>
          <Demo
            title="ACCENTS"
            stack
            code={`<Panel title="MAGI // CORE" meta="03 UNITS" accent="primary" notch="left">
  …
</Panel>`}
          >
            <Panel title="MAGI // CORE STATUS" meta="03 UNITS" accent="primary" notch="left">
              <span className="kanso-value">MELCHIOR · BALTHASAR · CASPER</span>
            </Panel>
            <Panel title="CONTAINMENT BREACH" accent="danger">
              <span className="kanso-value">PATTERN BLUE — SECTOR 7</span>
            </Panel>
            <Panel title="TELEMETRY LINK" accent="info" notch="right">
              <span className="kanso-value">42.6 kbit/s · 12 ms</span>
            </Panel>
          </Demo>

          <Demo title="HEADER ACTIONS + FOOTER" stack>
            <Panel
              title="SYNC MONITOR"
              accent="primary"
              actions={
                <>
                  <Badge variant="success" label="LIVE" />
                  <Button size="sm" variant="ghost">
                    RESET
                  </Button>
                </>
              }
              footer={<span>LAST SAMPLE 00:00:02 AGO</span>}
            >
              <span className="kanso-value">HARMONICS NOMINAL</span>
            </Panel>
          </Demo>
        </Grid>
      </Section>

      <Section
        id="frame"
        index="07"
        title="FRAME"
        lineage="NERV"
        blurb="The targeting container: four L-brackets, a label straddling the top rule, guide rails and an optional survey grid. A Panel contains; a Frame targets."
      >
        <Grid>
          <Demo
            title="TARGETING FRAME"
            code={`<Frame label="TARGET LOCK" readout="AZ 041 / EL 12" color="danger" crosshairs>
  …
</Frame>`}
          >
            <Frame label="TARGET LOCK" readout="AZ 041 / EL 12" color="danger" crosshairs>
              <div className="kanso-value" style={{ padding: "18px 6px" }}>
                RANGE 2.4 km · CLOSING 61 m/s
              </div>
            </Frame>
          </Demo>
          <Demo title="COLOURS" stack>
            <Frame label="SCAN" readout="SECTOR 07" color="info">
              <div className="kanso-value">ACTIVE — 12 CONTACTS</div>
            </Frame>
            <Frame label="NOMINAL" readout="ALL UNITS" color="success">
              <div className="kanso-value">STABLE — HARMONICS WITHIN TOLERANCE</div>
            </Frame>
            <Frame label="SYSTEM" readout="3 / 3" color="accent">
              <div className="kanso-value">MAGI — MELCHIOR · BALTHASAR · CASPER</div>
            </Frame>
          </Demo>
        </Grid>
      </Section>

      <Section
        id="bars"
        index="08"
        title="TOPBAR / STATUSBAR"
        lineage="NERV"
        blurb="The fixed chrome: a compressed wordmark and telemetry cluster at the top, a dense hairline-separated cell strip at the bottom. Three fixed slots, because every NERV screen ends up with exactly this arrangement."
      >
        <Demo title="MASTHEAD + STATUS STRIP" wide stack>
          <TopBar
            left={<Brand name="KANSO" jp="簡素" sub="DESIGN DIVISION" version="v0.2.0" />}
            center={
              <div className="row">
                {["OVERVIEW", "TELEMETRY", "LOGS"].map((t) => (
                  <Chip key={t} active={tab === t} onClick={() => setTab(t)}>
                    {t}
                  </Chip>
                ))}
              </div>
            }
            right={
              <div className="row">
                <Badge variant="success" label="ONLINE" />
                <span className="kanso-stamp" style={{ fontSize: 20, color: "var(--kanso-color-info)" }}>
                  02:41:09
                </span>
              </div>
            }
          />
          <StatusBar
            cells={[
              { label: "CPU", value: "18%", state: "nominal" },
              { label: "MEM", value: "6.1/32 GB", state: "nominal" },
              { label: "NET", value: "↓ 12.4 MB/s", state: "info" },
              { label: "THERM", value: "78°C", state: "warning", spacer: true },
              { label: "MODE", value: tab, state: "dim" },
            ]}
          />
        </Demo>
      </Section>

      <Section
        id="rules"
        index="09"
        title="DIVIDER / HAZARD"
        lineage="NERV"
        blurb="Section separators and the diagonal caution barber-pole. At most one hazard pair per screen, marking the outer boundary or an actively dangerous region."
      >
        <Grid>
          <Demo title="DIVIDERS" stack>
            <Divider label="SECTION" />
            <Divider label="TELEMETRY" color="info" variant="dashed" />
            <Divider label="CENTERED" color="success" align="center" />
            <Divider color="danger" variant="dotted" />
            <div className="row" style={{ height: 32 }}>
              <span className="kanso-label">A</span>
              <Divider orientation="vertical" />
              <span className="kanso-label">B</span>
              <Divider orientation="vertical" color="info" />
              <span className="kanso-label">C</span>
            </div>
          </Demo>

          <Demo title="HAZARD STRIPES" stack>
            <HazardStripe />
            <HazardStripe color="danger" />
            <HazardStripe color="warning" animated />
            <span className="kanso-label">animated — reserve for genuinely active states</span>
          </Demo>
        </Grid>
      </Section>

      <Section
        id="atmosphere"
        index="10"
        title="ATMOSPHERE"
        lineage="CYBER"
        blurb="Scanlines, grain and vignette. The cheapest way to make a flat dark UI read as a physical instrument, and the easiest thing in the system to overdo. If a screen needs more atmosphere than the house setting, the layout is wrong."
      >
        <Demo
          title="CRT LAYER — LIVE ON THIS PAGE"
          wide
          code={`<CRT />                                  // house setting
<CRT grain={false} speed={0} />          // static mask, no grain
<Scanlines /> <Grain /> <Vignette />     // or mount individually`}
        >
          {(["scanlines", "grain", "vignette"] as const).map((k) => (
            <Button
              key={k}
              size="sm"
              variant={crt[k] ? "primary" : "ghost"}
              onClick={() => onToggleCrt(k)}
            >
              {k.toUpperCase()} {crt[k] ? "ON" : "OFF"}
            </Button>
          ))}
        </Demo>
      </Section>
    </>
  );
}
