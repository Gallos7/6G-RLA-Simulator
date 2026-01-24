import "bootstrap/dist/css/bootstrap.min.css";
import "./App.css";
import "./index.css";
import { UI_COLORS } from "./data/presets";
import { HistoryDrawer, ResourceConfig, ScenarioConfig, CompactGroupConfig, SimulationControlConfig, Header, Chart } from "./components";
import useSimulationLogic from "./hooks/useSimulationLogic";

/**
 * Main Application Component.
 * Acts as the root container for the application layout.
 * It integrates the simulation logic hook and distributes state/handlers to child components.
 *
 * Layout Structure:
 * - Header: Navigation and global controls.
 * - Left Column: Configuration inputs (Scenario, Resources, Simulation Control).
 * - Right Column: Results visualization (Chart & Data).
 * - HistoryDrawer: Overlay for viewing past simulations.
 */
function App() {
  
  const {
    inputs, selectedScenario, theme, simConfig, error, loading, results, historyData, isHistoryOpen,
    runSimulation, toggleTheme, fetchHistory, handleServiceCountChange, handleMatrixChange, handleResourceSelect, handleLoadHistory,
    handleScenarioChange, handleInputChange, handleCheckboxChange, handleSimConfigChange, setIsHistoryOpen
  } = useSimulationLogic();


  return (
    <div className="app-container"
      data-bs-theme={theme}
      style={{
        minHeight: "100vh",
        backgroundColor: theme === "dark" ? "#121212" : "#f0f2f5",
        color: theme === "dark" ? "#e0e0e0" : "#212529",
        transition: "background-color 0.3s, color 0.3s"
      }}
    >

      {/* HEADER (NAVBAR) */}
      <Header
        theme={theme}
        error={error}
        loading={loading}
        toggleTheme={toggleTheme}
        fetchHistory={fetchHistory}
        runSimulation={runSimulation}
      />

      {/* MAIN GRID */}
      <div className="container-fluid mt-4 px-4">
        <div className="row g-4">

          {/* LEFT COLUMN: CONFIGURATION */}
          <div className="col-md-4">
            <div className="card shadow-sm h-100 border-0 overflow-hidden">
              {/* HEADER */}
              <div className="p-3 text-white fw-bold d-flex align-items-center"
                style={{ background: UI_COLORS.primaryGradient }}>
                ⚙️ Configuration
              </div>

              <div className="card-body">
                <ScenarioConfig
                  selectedScenario={selectedScenario}
                  handleScenarioChange={handleScenarioChange}
                />
                <CompactGroupConfig
                  inputs={inputs}
                  theme={theme}
                  handleInputChange={handleInputChange}
                  handleCheckboxChange={handleCheckboxChange}
                />
                <ResourceConfig
                  inputs={inputs}
                  handleResourceSelect={handleResourceSelect}
                  handleServiceCountChange={handleServiceCountChange}
                  handleMatrixChange={handleMatrixChange}
                  theme={theme}
                />
                <hr className="opacity-25 my-4" />
                <SimulationControlConfig
                  error={error}
                  theme={theme}
                  simConfig={simConfig}
                  handleSimConfigChange={handleSimConfigChange}
                />
              </div>
            </div>
          </div>

          {/* RIGHT COLUMN: RESULTS */}
          <div className="col-md-8">
            <div className="card shadow-sm h-100 border-0 overflow-hidden">

              {/* HEADER */}
              <div className="p-3 text-white fw-bold d-flex align-items-center"
                style={{ background: UI_COLORS.secondaryGradient }}>
                📊 Results Visualization
              </div>

              <Chart
                theme={theme}
                loading={loading}
                results={results}
                inputs={inputs}
                simConfig={simConfig}
                selectedScenario={selectedScenario}
              />

            </div>
          </div>

        </div>
      </div>

      {/* HISTORY DRAWER */}
      <HistoryDrawer
        isOpen={isHistoryOpen}
        onClose={() => setIsHistoryOpen(false)}
        historyItems={historyData}
        onLoad={handleLoadHistory}
      />

    </div>
  );
}

export default App;