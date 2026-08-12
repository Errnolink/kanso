// Kanso gallery — the reference page. Every component in the library,
// rendered live, with the design rationale next to it. This page is also
// the dogfooding test: it is built entirely from Kanso's own primitives.
import { createRoot } from "react-dom/client";
import { useState } from "react";
import { Badge, CRT, HazardStripe } from "../src";
import { Nav } from "./Showcase";
import { Foundations } from "./sections/Foundations";
import { Chrome } from "./sections/Chrome";
import { Telemetry } from "./sections/Telemetry";
import { Controls } from "./sections/Controls";
import { Overlays } from "./sections/Overlays";
import "./fonts.css";
import "./playground.css";

const NAV = [
  { id: "palette", label: "Palette", group: "FOUNDATION" },
  { id: "ramp", label: "Severity ramp", group: "FOUNDATION" },
  { id: "type", label: "Typography", group: "FOUNDATION" },
  { id: "geometry", label: "Geometry", group: "FOUNDATION" },
  { id: "surfaces", label: "Surfaces", group: "FOUNDATION" },

  { id: "panel", label: "Panel", group: "CHROME" },
  { id: "frame", label: "Frame", group: "CHROME" },
  { id: "bars", label: "Bars", group: "CHROME" },
  { id: "rules", label: "Divider / Hazard", group: "CHROME" },
  { id: "atmosphere", label: "Atmosphere", group: "CHROME" },

  { id: "termbox", label: "TermBox", group: "TELEMETRY" },
  { id: "meters", label: "Meters & gauges", group: "TELEMETRY" },
  { id: "graphs", label: "Graphs", group: "TELEMETRY" },
  { id: "readouts", label: "Readouts", group: "TELEMETRY" },
  { id: "data", label: "Table & terminal", group: "TELEMETRY" },

  { id: "buttons", label: "Buttons", group: "CONTROLS" },
  { id: "chips", label: "Chips & badges", group: "CONTROLS" },
  { id: "fields", label: "Fields", group: "CONTROLS" },
  { id: "toggles", label: "Toggles", group: "CONTROLS" },
  { id: "selectors", label: "Selectors", group: "CONTROLS" },

  { id: "modal", label: "Modal", group: "OVERLAYS" },
  { id: "transient", label: "Toast / Tooltip", group: "OVERLAYS" },
  { id: "menus", label: "Menu / Palette", group: "OVERLAYS" },
  { id: "feedback", label: "Alert / Spinner", group: "OVERLAYS" },
  { id: "boot", label: "Boot sequence", group: "OVERLAYS" },
];

function App() {
  const [crt, setCrt] = useState({ scanlines: true, grain: true, vignette: true });

  const toggleCrt = (key: "scanlines" | "grain" | "vignette") =>
    setCrt((c) => ({ ...c, [key]: !c[key] }));

  return (
    <div className="kanso-root shell">
      <CRT scanlines={crt.scanlines} grain={crt.grain} vignette={crt.vignette} />
      <HazardStripe edge="top" />

      <Nav items={NAV} />

      <div className="page">
        <header className="masthead">
          <div className="wordmark">
            <span className="wordmark-name">KANSO</span>
            <span className="wordmark-mark">簡素</span>
          </div>
          <p className="tagline">
            The house design language — tokens and components distilled from NERV-UI,
            Evangelion interface design, btop terminal telemetry and cyberpunk chrome.
            Black surfaces, hairline borders, chamfered corners, mono labels over
            tabular values, and one severity ramp shared by every meter in every app.
          </p>
          <div className="masthead-badges">
            <Badge label="v0.2.0" />
            <Badge variant="info" label="REACT + TS" />
            <Badge variant="success" label="TOKENS-FIRST" />
            <Badge variant="warning" label="145 TOKENS" />
          </div>
        </header>

        <Foundations />
        <Chrome crt={crt} onToggleCrt={toggleCrt} />
        <Telemetry />
        <Controls />
        <Overlays />

        <footer className="footer">
          <span>KANSO — 簡素 — SIMPLICITY</span>
          <span>SEE KANSO.MD FOR THE RULES</span>
        </footer>
      </div>
    </div>
  );
}

createRoot(document.getElementById("root")!).render(<App />);
