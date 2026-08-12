// Overlays — modals, transient chrome, menus, and the boot sequence.
import { useRef, useState } from "react";
import {
  Alert,
  BootSequence,
  Button,
  CommandPalette,
  DataList,
  IconButton,
  Menu,
  Modal,
  Spinner,
  ToastProvider,
  Tooltip,
  useContextMenu,
  useToast,
  MARK,
  type PaletteCommand,
} from "../../src";
import { Demo, Grid, Section } from "../Showcase";

function ToastDemo() {
  const { toast, dismiss } = useToast();
  return (
    <>
      <Button size="sm" onClick={() => toast({ title: "SYNC COMPLETE", level: "success" })}>
        SUCCESS
      </Button>
      <Button
        size="sm"
        variant="secondary"
        onClick={() => toast({ title: "THERMAL MARGIN", message: "Unit BALTHASAR at 78°C", level: "warning" })}
      >
        WARNING
      </Button>
      <Button
        size="sm"
        variant="danger"
        onClick={() =>
          toast({ title: "PATTERN BLUE", message: "Sector 7 — closing 61 m/s", level: "danger", duration: 0 })
        }
      >
        PINNED DANGER
      </Button>
      <Button size="sm" variant="ghost" onClick={() => dismiss()}>
        DISMISS ALL
      </Button>
    </>
  );
}

export function Overlays() {
  const [modal, setModal] = useState(false);
  const [palette, setPalette] = useState(false);
  const [dropdown, setDropdown] = useState(false);
  const [booting, setBooting] = useState(false);
  const [alertShown, setAlertShown] = useState(true);
  const dropdownRef = useRef<HTMLButtonElement | null>(null);
  const ctx = useContextMenu();

  const commands: PaletteCommand[] = [
    { id: "scan", label: "Run full sector scan", group: "OPERATIONS", hint: "CTRL+ENTER", onRun: () => setPalette(false) },
    { id: "purge", label: "Purge trash queue", group: "OPERATIONS", hint: "CTRL+DEL", onRun: () => setPalette(false) },
    { id: "sync", label: "Force MAGI resync", group: "OPERATIONS", keywords: ["magi", "cluster"], onRun: () => setPalette(false) },
    { id: "grid", label: "Switch to grid view", group: "VIEW", hint: "1", onRun: () => setPalette(false) },
    { id: "list", label: "Switch to list view", group: "VIEW", hint: "2", onRun: () => setPalette(false) },
    { id: "crt", label: "Toggle CRT overlay", group: "VIEW", onRun: () => setPalette(false) },
    { id: "locked", label: "Detonate (requires authorisation)", group: "RESTRICTED", disabled: true, onRun: () => {} },
  ];

  return (
    <ToastProvider>
      <Section
        id="modal"
        index="21"
        title="MODAL"
        lineage="NERV"
        blurb="Scrim, orange accent rule, bracketed corners, focus trap, Escape to close, focus restored on exit. The enter is 160ms and the exit is 100ms — chrome arrives deliberately and leaves immediately."
      >
        <Demo
          title="DIALOG"
          wide
          code={`<Modal open={open} onClose={close} title="PURGE QUEUE" subtitle="4 ITEMS · 1.2 GB"
       footer={<><Button variant="ghost">CANCEL</Button><Button variant="danger">PURGE</Button></>}>
  …
</Modal>`}
        >
          <Button onClick={() => setModal(true)}>OPEN DIALOG</Button>
          <Modal
            open={modal}
            onClose={() => setModal(false)}
            title="PURGE QUEUE"
            subtitle="4 ITEMS · 1.2 GB · IRREVERSIBLE"
            footer={
              <>
                <Button variant="ghost" onClick={() => setModal(false)}>
                  CANCEL
                </Button>
                <Button variant="danger" onClick={() => setModal(false)}>
                  PURGE
                </Button>
              </>
            }
          >
            <Alert level="danger" title="THIS CANNOT BE UNDONE">
              Queued items are removed from disk immediately. There is no recovery path.
            </Alert>
            <div style={{ height: 12 }} />
            <DataList
              items={[
                { label: "ITEMS", value: "4" },
                { label: "SIZE", value: "1.2 GB" },
                { label: "OLDEST", value: "17d ago" },
                { label: "TARGET", value: "nerv-tokyo-3:/media", state: "warning" },
              ]}
            />
          </Modal>
        </Demo>
      </Section>

      <Section
        id="transient"
        index="22"
        title="TOAST / TOOLTIP"
        lineage="NERV"
        blurb="Transient chrome. Toasts stack bottom-right with a ramp-coloured countdown rule; a duration of 0 pins one until it is dismissed. Tooltips clone their child so aria-describedby lands on the real control."
      >
        <Grid>
          <Demo title="TOAST">
            <ToastDemo />
          </Demo>
          <Demo title="TOOLTIP">
            <Tooltip content="RUN FULL SECTOR SCAN">
              <Button variant="secondary">SCAN</Button>
            </Tooltip>
            <Tooltip content="BELOW" placement="bottom">
              <Button variant="ghost">BOTTOM</Button>
            </Tooltip>
            <Tooltip content="LEFT SIDE" placement="left">
              <IconButton label="Info">?</IconButton>
            </Tooltip>
            <Tooltip content="RIGHT SIDE" placement="right">
              <IconButton label="More">{MARK.ellipsis}</IconButton>
            </Tooltip>
          </Demo>
        </Grid>
      </Section>

      <Section
        id="menus"
        index="23"
        title="MENU / COMMAND PALETTE"
        lineage="CYBER"
        blurb="The palette is the flagship overlay: grouped, filtered, keyboard-driven, prompt-glyph prefixed. If an app has more than a dozen actions, this replaces most of its toolbar."
      >
        <Grid>
          <Demo title="DROPDOWN & CONTEXT MENU" stack>
            <div className="row">
              <Button ref={dropdownRef} variant="secondary" onClick={() => setDropdown((o) => !o)}>
                ACTIONS {MARK.down}
              </Button>
              <Menu
                open={dropdown}
                onClose={() => setDropdown(false)}
                anchor={dropdownRef}
                label="Actions"
                items={[
                  { key: "open", label: "Open in viewer", shortcut: "ENTER", onSelect: () => setDropdown(false) },
                  { key: "rename", label: "Rename", shortcut: "F2", onSelect: () => setDropdown(false) },
                  { key: "s1", separator: true },
                  { key: "tag", label: "Add tag", shortcut: "T", onSelect: () => setDropdown(false) },
                  { key: "hide", label: "Hide folder", disabled: true, onSelect: () => {} },
                  { key: "s2", separator: true },
                  { key: "trash", label: "Move to trash", shortcut: "DEL", danger: true, onSelect: () => setDropdown(false) },
                ]}
              />
            </div>
            <div
              onContextMenu={ctx.onContextMenu}
              className="kanso-surface-well"
              style={{ padding: 24, textAlign: "center", fontSize: 10, letterSpacing: "0.14em", color: "var(--kanso-color-muted)" }}
            >
              RIGHT-CLICK THIS REGION
            </div>
            <Menu
              {...ctx.menuProps}
              label="Region actions"
              items={[
                { key: "inspect", label: "Inspect region", onSelect: ctx.close },
                { key: "lock", label: "Lock region", onSelect: ctx.close },
                { key: "s1", separator: true },
                { key: "purge", label: "Purge region", danger: true, onSelect: ctx.close },
              ]}
            />
          </Demo>

          <Demo title="COMMAND PALETTE" code={`<CommandPalette open={open} onClose={close} commands={commands} />`}>
            <Button onClick={() => setPalette(true)}>OPEN PALETTE</Button>
            <CommandPalette
              open={palette}
              onClose={() => setPalette(false)}
              commands={commands}
              placeholder="Type a command…"
            />
          </Demo>
        </Grid>
      </Section>

      <Section
        id="feedback"
        index="24"
        title="ALERT / SPINNER"
        lineage="NERV"
        blurb="Inline banners take a left accent bar and an 8% wash. The spinner is a bracket reticle rather than a ring, because the system has no circles — and a braille throbber for inline terminal use."
      >
        <Grid>
          <Demo title="ALERTS" stack>
            <Alert level="info" title="TELEMETRY LINK ESTABLISHED">
              Streaming at 42.6 kbit/s from three units.
            </Alert>
            <Alert level="success" title="SYNC COMPLETE" />
            <Alert level="warning" title="THERMAL MARGIN NARROWING">
              Unit BALTHASAR is at 78°C. Throttling engages at 85°C.
            </Alert>
            {alertShown && (
              <Alert level="danger" title="PATTERN BLUE DETECTED" onDismiss={() => setAlertShown(false)}>
                Sector 7 — closing at 61 m/s. Dismissible.
              </Alert>
            )}
          </Demo>

          <Demo title="SPINNER" stack>
            <div className="row">
              <Spinner size="sm" label="Loading" />
              <Spinner size="md" label="Loading" />
              <Spinner size="lg" label="Loading" />
              <Spinner color="info" label="Scanning" />
              <Spinner color="danger" label="Failing" />
            </div>
            <div className="row">
              <Spinner variant="glyph" label="Extracting" showLabel />
              <Spinner variant="glyph" color="success" label="Indexing" showLabel />
            </div>
          </Demo>
        </Grid>
      </Section>

      <Section
        id="boot"
        index="25"
        title="BOOT SEQUENCE"
        lineage="EVA"
        blurb="The cold open. Types out a checklist with [ OK ] stamps, then hands over to the app. Skips instantly on click, keypress, or a reduced-motion preference — nobody should be trapped in an animation."
      >
        <Demo title="COLD OPEN" wide stack>
          <Button onClick={() => setBooting((b) => !b)}>
            {booting ? "RESET" : "RUN SEQUENCE"}
          </Button>
          {booting && (
            <BootSequence
              key="boot"
              lines={[
                { text: "MAGI SYSTEM — MELCHIOR ONLINE", status: "ok" },
                { text: "MAGI SYSTEM — BALTHASAR ONLINE", status: "ok" },
                { text: "MAGI SYSTEM — CASPER ONLINE", status: "ok" },
                { text: "A.T. FIELD HARMONICS", status: "ok", delay: 200 },
                { text: "SYNC RATIO CALIBRATION", status: "warn" },
                { text: "EXTERNAL POWER COUPLING", status: "fail" },
                { text: "HANDOVER TO OPERATOR" },
              ]}
              onComplete={() => undefined}
            />
          )}
        </Demo>
      </Section>
    </ToastProvider>
  );
}
