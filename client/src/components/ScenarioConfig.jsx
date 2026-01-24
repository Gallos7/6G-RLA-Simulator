import React from 'react';
import { PRESETS, UI_COLORS } from "../data/presets";

/**
 * Component: ScenarioConfig
 * Renders the scenario selection dropdown menu.
 *
 * Thesis Context:
 * This component acts as the high-level controller for the experiment.
 * By selecting a scenario, the user automatically populates all simulation inputs
 * (Topology, Resource Matrix, Traffic Load) with pre-defined values that correspond
 * to specific real-world use cases (e.g., IoT, 4K Streaming, Stadium Event).
 *
 * @param {string} selectedScenario - The ID of the currently active scenario (e.g., 'capacity', 'iot').
 * @param {Function} handleScenarioChange - Handler that triggers the state update across the app.
 */
const ScenarioConfig = ({
    selectedScenario,
    handleScenarioChange
}) => {
    return (
        <div className="mb-4">
            {/* Label */}
            <label className="form-label fw-bold small text-uppercase ls-1 text-body">
                Select Scenario
            </label>

            {/* Dropdown Selector */}
            <select
                className="form-select fw-bold cursor-pointer shadow-sm"
                value={selectedScenario}
                onChange={handleScenarioChange}
                style={{ borderLeft: `4px solid ${UI_COLORS.actionButton || '#0d6efd'}` }}
            >
                {/* Dynamically generate options from the PRESETS object */}
                {Object.values(PRESETS).map(preset => (
                    <option key={preset.id} value={preset.id}>
                        {preset.label}
                    </option>
                ))}
            </select>

            {/* Description Text */}
            <div className="form-text mt-1 opacity-75 fst-italic small">
                {PRESETS[selectedScenario]?.description || "No description available."}
            </div>
        </div>
    );
};

export default ScenarioConfig;