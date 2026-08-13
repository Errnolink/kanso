// @kanso/ui — 簡素
//
// The house design language: NERV command chrome, EVA ticket geometry,
// btop telemetry, cyberpunk atmosphere. See KANSO.md for the rules.
import "./kanso.css";

// --- foundations --------------------------------------------------------
export { kanso, cssVar, kansoThemes, KANSO_THEMES } from "./tokens";
export type { Kanso, KansoThemeId } from "./tokens";
export {
  THEMES,
  THEME_ATTR,
  THEME_STORAGE_KEY,
  DEFAULT_THEME,
  applyTheme,
  readTheme,
  storedTheme,
  storeTheme,
  isThemeId,
  useKansoTheme,
} from "./theme";
export type { ThemeId, ThemeInfo, UseThemeOptions } from "./theme";
export {
  EASE_MECHANICAL,
  EASE_OUT,
  EASE_IN,
  DURATION,
  PANEL_ENTER,
  PANEL_EXIT,
  OVERLAY_ENTER,
  OVERLAY_EXIT,
  ease,
  transition,
  prefersReducedMotion,
} from "./motion";
export {
  RAMP_STOPS,
  RAMP_NAMES,
  HUE,
  rampColor,
  rampStep,
  rampGradient,
  rampOverrange,
  resolveHue,
} from "./ramp";
export type { RampName, RampReading, Hue } from "./ramp";
export {
  BOX,
  TREE,
  BLOCK_V,
  BLOCK_H,
  SHADE,
  MARK,
  brailleGraph,
  blockSparkline,
  blockBar,
  boxTitle,
} from "./glyphs";
export type { BoxStyle } from "./glyphs";

// --- chrome -------------------------------------------------------------
export { Panel } from "./components/Panel/Panel";
export type { PanelProps, PanelAccent } from "./components/Panel/Panel";
export { Frame } from "./components/Frame/Frame";
export type { FrameProps, FrameColor } from "./components/Frame/Frame";
export { Divider } from "./components/Divider/Divider";
export type { DividerProps } from "./components/Divider/Divider";
export { HazardStripe } from "./components/HazardStripe/HazardStripe";
export type { HazardStripeProps } from "./components/HazardStripe/HazardStripe";
export { TopBar, Brand } from "./components/Bars/TopBar";
export type { TopBarProps, BrandProps } from "./components/Bars/TopBar";
export { StatusBar } from "./components/Bars/StatusBar";
export type { StatusBarProps, StatusCell } from "./components/Bars/StatusBar";
export { Scanlines, Vignette, Grain, CRT } from "./components/Scanlines/Scanlines";
export type {
  ScanlinesProps,
  VignetteProps,
  GrainProps,
  CRTProps,
} from "./components/Scanlines/Scanlines";

// --- controls -----------------------------------------------------------
export { Button } from "./components/Button/Button";
export type { ButtonProps } from "./components/Button/Button";
export { IconButton } from "./components/IconButton/IconButton";
export type { IconButtonProps } from "./components/IconButton/IconButton";
export { Chip } from "./components/Chip/Chip";
export type { ChipProps } from "./components/Chip/Chip";
export { Input } from "./components/Input/Input";
export type { InputProps, FieldSize } from "./components/Input/Input";
export { Textarea } from "./components/Input/Textarea";
export type { TextareaProps } from "./components/Input/Textarea";
export { Select } from "./components/Select/Select";
export type { SelectProps, SelectOption } from "./components/Select/Select";
export { Checkbox } from "./components/Toggle/Checkbox";
export type { CheckboxProps } from "./components/Toggle/Checkbox";
export { Radio } from "./components/Toggle/Radio";
export type { RadioProps } from "./components/Toggle/Radio";
export { Switch } from "./components/Toggle/Switch";
export type { SwitchProps } from "./components/Toggle/Switch";
export { Slider } from "./components/Slider/Slider";
export type { SliderProps } from "./components/Slider/Slider";
export { Segmented } from "./components/Segmented/Segmented";
export type { SegmentedProps, SegmentedOption } from "./components/Segmented/Segmented";

// --- overlays & feedback ------------------------------------------------
export { Modal } from "./components/Modal/Modal";
export type { ModalProps } from "./components/Modal/Modal";
export { Toast, ToastProvider } from "./components/Toast/Toast";
export type { ToastProps, ToastProviderProps } from "./components/Toast/Toast";
export { useToast } from "./components/Toast/useToast";
export type {
  ToastApi,
  ToastLevel,
  ToastOptions,
  ToastRecord,
} from "./components/Toast/useToast";
export { Tooltip } from "./components/Tooltip/Tooltip";
export type { TooltipProps, TooltipPlacement } from "./components/Tooltip/Tooltip";
export { Menu } from "./components/Menu/Menu";
export type {
  MenuProps,
  MenuItem,
  MenuActionItem,
  MenuSeparatorItem,
  MenuAnchor,
} from "./components/Menu/Menu";
export { useContextMenu } from "./components/Menu/useContextMenu";
export type { ContextMenuState } from "./components/Menu/useContextMenu";
export { CommandPalette } from "./components/CommandPalette/CommandPalette";
// Exported as `PaletteCommand` at the barrel — `Command` is too broad a name
// to occupy at a library root.
export type {
  CommandPaletteProps,
  Command as PaletteCommand,
} from "./components/CommandPalette/CommandPalette";
export { Alert } from "./components/Alert/Alert";
export type { AlertProps, AlertLevel } from "./components/Alert/Alert";
export { Takeover } from "./components/Takeover/Takeover";
export type { TakeoverProps, TakeoverLevel } from "./components/Takeover/Takeover";
export { BootSequence } from "./components/BootSequence/BootSequence";
export type {
  BootSequenceProps,
  BootLine,
  BootStatus,
} from "./components/BootSequence/BootSequence";
export { Spinner, BRAILLE_FRAMES } from "./components/Spinner/Spinner";
export type { SpinnerProps, SpinnerColor } from "./components/Spinner/Spinner";

// --- display ------------------------------------------------------------
export { Badge } from "./components/Badge/Badge";
export type { BadgeProps } from "./components/Badge/Badge";
export { DataTexture } from "./components/DataTexture/DataTexture";
export type { DataTextureProps } from "./components/DataTexture/DataTexture";

// --- telemetry ----------------------------------------------------------
export { BarChart } from "./components/BarChart/BarChart";
export type { BarChartProps, BarChartDatum } from "./components/BarChart/BarChart";
export { BrailleGraph } from "./components/BrailleGraph/BrailleGraph";
export type { BrailleGraphProps } from "./components/BrailleGraph/BrailleGraph";
export { CoreGrid } from "./components/CoreGrid/CoreGrid";
export type { CoreGridProps, CoreGridCore } from "./components/CoreGrid/CoreGrid";
export { DataList } from "./components/DataList/DataList";
export type {
  DataListProps,
  DataListItem,
  DataListState,
} from "./components/DataList/DataList";
export { Gauge } from "./components/Gauge/Gauge";
export type { GaugeProps } from "./components/Gauge/Gauge";
export { LED } from "./components/LED/LED";
export type { LEDProps, LEDState } from "./components/LED/LED";
export { MagiConsensus } from "./components/MagiConsensus/MagiConsensus";
export type {
  MagiConsensusProps,
  MagiNode,
  MagiNodeState,
} from "./components/MagiConsensus/MagiConsensus";
export { Meter } from "./components/Meter/Meter";
export type { MeterProps } from "./components/Meter/Meter";
export { Progress } from "./components/Progress/Progress";
export type { ProgressProps } from "./components/Progress/Progress";
export { Readout } from "./components/Readout/Readout";
export type { ReadoutProps, ReadoutState } from "./components/Readout/Readout";
export { SegmentBar } from "./components/SegmentBar/SegmentBar";
export type {
  SegmentBarProps,
  SegmentBarSegment,
} from "./components/SegmentBar/SegmentBar";
export { Skeleton } from "./components/Skeleton/Skeleton";
export type { SkeletonProps } from "./components/Skeleton/Skeleton";
export { Sparkline } from "./components/Sparkline/Sparkline";
export type { SparklineProps } from "./components/Sparkline/Sparkline";
export { Table } from "./components/Table/Table";
export type {
  TableProps,
  TableColumn,
  TableSort,
  TableAlign,
} from "./components/Table/Table";
export { TermBox } from "./components/TermBox/TermBox";
export type { TermBoxProps } from "./components/TermBox/TermBox";
export { Terminal } from "./components/Terminal/Terminal";
export type {
  TerminalProps,
  TerminalLine,
  TerminalLevel,
} from "./components/Terminal/Terminal";
