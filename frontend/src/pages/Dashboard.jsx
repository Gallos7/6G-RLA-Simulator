import React from 'react';
import { UI_COLORS } from "../data/presets";
import useSimulationLogic from "../hooks/useSimulationLogic";

import Header from "../components/layout/Header";
import HistoryDrawer from "../features/history/HistoryDrawer";
import SimulationChart from "../features/results/SimulationChart";
import ScenarioConfig from "../features/simulation/ScenarioConfig";
import CompactGroupConfig from "../features/simulation/CompactGroupConfig";
import ResourceConfig from "../features/simulation/ResourceConfig";
import SimulationControlConfig from "../features/simulation/SimulationControlConfig";


/**
 * Page: Dashboard
 * The primary workspace for the 6G Simulator. 
 * Handles the grid layout: Controls on the left, Visualization on the right.
 */
const Dashboard = () => {
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
      <Header
        theme={theme} error={error} loading={loading}
        toggleTheme={toggleTheme} fetchHistory={fetchHistory} runSimulation={runSimulation}
      />

      <div className="container-fluid py-4 px-md-5">
        <div className="row g-4">
          
          {/* LEFT COLUMN: CONTROLS */}
          <div className="col-md-4">
            <div className="card shadow-sm h-100 border-0">
              <div className="p-3 text-white fw-bold d-flex align-items-center"
                style={{ background: UI_COLORS.primaryGradient }}>
                ⚙️ Simulation Parameters
              </div>
              <div className="card-body bg-body">
                <ScenarioConfig
                  selectedScenario={selectedScenario} handleScenarioChange={handleScenarioChange}
                />
                <hr className="opacity-25 my-4" />
                <CompactGroupConfig
                  inputs={inputs} handleInputChange={handleInputChange} handleCheckboxChange={handleCheckboxChange}
                />
                <hr className="opacity-25 my-4" />
                <ResourceConfig
                  inputs={inputs} handleResourceSelect={handleResourceSelect}
                  handleServiceCountChange={handleServiceCountChange} handleMatrixChange={handleMatrixChange}
                />
                <hr className="opacity-25 my-4" />
                <SimulationControlConfig
                  error={error} simConfig={simConfig} handleSimConfigChange={handleSimConfigChange}
                />
              </div>
            </div>
          </div>

          {/* RIGHT COLUMN: RESULTS */}
          <div className="col-md-8">
            <div className="card shadow-sm h-100 border-0 overflow-hidden">
              <div className="p-3 text-white fw-bold d-flex align-items-center"
                style={{ background: UI_COLORS.secondaryGradient }}>
                📊 Results Visualization
              </div>
              <SimulationChart
                theme={theme} loading={loading} results={results}
                inputs={inputs} simConfig={simConfig} selectedScenario={selectedScenario}
              />
            </div>
          </div>

        </div>
      </div>

      {/* HISTORY DRAWER */}
      <HistoryDrawer
        isOpen={isHistoryOpen} onClose={() => setIsHistoryOpen(false)}
        historyItems={historyData} onLoad={handleLoadHistory}
      />
    </div>
  );
};

export default Dashboard;