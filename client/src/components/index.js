/**
 * Component Registry (Barrel File).
 * Centralizes the export of all UI components to simplify import statements throughout the application.
 *
 * Thesis Context:
 * This architectural pattern promotes modularity and maintainability. Instead of importing
 * components from scattered paths, the main 'App.js' can import everything from a single entry point.
 *
 * Example Usage:
 * import { Header, Chart, ResourceConfig } from "./components";
 */

export { default as ResourceConfig } from "./ResourceConfig";
export { default as ScenarioConfig } from "./ScenarioConfig";
export { default as CompactGroupConfig } from "./CompactGroupConfig";
export { default as SimulationControlConfig } from "./SimulationControlConfig";
export { default as Header } from "./HeaderNavbar_HistoryButtonConfig";
export { default as Chart } from "./SimulationChartConfig";
export { default as HistoryDrawer } from "./HistoryDrawer";