import React from 'react';
import { UI_COLORS } from "../data/presets"; // <--- IMPORT COLORS

/**
 * Component: SimulationControlConfig
 * Manages the parameters of the simulation loop (The "Experiment").
 *
 * Thesis Context:
 * In scientific simulations, we need to observe how a system behaves as one variable changes.
 * This component allows the user to define:
 * 1. The Independent Variable (X-Axis): What are we changing? (e.g., Traffic Load).
 * 2. The Target Limit: When should the simulation stop?
 * 3. The Step Size: How fine-grained should the data points be?
 *
 * @param {string|null} error - Validation error message (e.g., "Step too large").
 * @param {Object} simConfig - Current configuration state (variable, target, step).
 * @param {Function} handleSimConfigChange - Handler to update configuration values.
 */
const SimulationControlConfig = ({
    error,
    simConfig,
    handleSimConfigChange,
}) => {

    // Logic: Only "Traffic Load" supports decimal values (floats).
    // Capacity units (Server, Fronthaul, Antennas) must be integers.
    const isFloatAllowed = simConfig.variable === 'load';
    const stepValue = isFloatAllowed ? "0.1" : "1";

    // Prevent user from typing decimals if the selected variable is an integer type
    const handleKeyDown = (e) => {
        if (!isFloatAllowed) {
            if (e.key === '.' || e.key === ',') {
                e.preventDefault();
            }
        }
    };

    return (
        <>
            <div className="resource-box">

                {/* SECTION HEADER USING ACTION COLOR */}
                <h6 className="section-header mb-3 fw-bold d-flex align-items-center gap-2"
                    style={{ color: UI_COLORS.actionButton }}>
                    <span>🧪</span> Experiment Setup
                </h6>

                {/* Variable Selection */}
                <div className="mb-3">
                    <label className="form-label small fw-bold">Independent Variable (X-Axis)</label>
                    <select
                        className="form-select form-select-sm fw-bold"
                        style={{ borderColor: UI_COLORS.actionButton }}
                        value={simConfig.variable}
                        onChange={(e) => handleSimConfigChange("variable", e.target.value)}
                    >
                        <option value="load">Traffic Load (Erlang)</option>
                        <option value="fronthaul">Fronthaul Capacity</option>
                        <option value="server">Server Capacity</option>
                        <option value="access">Access (Antennas) Capacity</option>
                    </select>
                </div>

                <div className="row g-2">
                    {/* Target Value */}
                    <div className="col-6">
                        <label className="form-label small fw-bold text-muted mb-1">Target Value</label>
                        <input
                            type="number"
                            step={stepValue}
                            className="form-control form-control-sm"
                            value={simConfig.target}
                            onChange={(e) => handleSimConfigChange("target", e.target.value)}
                            onKeyDown={handleKeyDown}
                        />
                    </div>

                    {/* Step Size */}
                    <div className="col-6 position-relative">
                        <div className="d-flex align-items-center justify-content-between">
                            <label className="form-label small fw-bold text-muted mb-1">Step Size</label>

                            {/* HELPER BADGE USING ACTION COLOR */}
                            <span
                                className="badge rounded-pill"
                                style={{ backgroundColor: UI_COLORS.actionButton, cursor: 'help' }}
                                title={isFloatAllowed
                                    ? "Recommended: 0.1 - 0.5"
                                    : "Recommended: 5 - 50"}
                            >
                                ℹ️ Info
                            </span>
                        </div>

                        <input
                            type="number"
                            step={stepValue}
                            className={`form-control form-control-sm ${error ? "is-invalid" : ""}`}
                            value={simConfig.step}
                            onChange={(e) => handleSimConfigChange("step", e.target.value)}
                            onKeyDown={handleKeyDown}
                        />
                    </div>
                </div>

                {/* ERROR MESSAGE */}
                {error && (
                    <div className="alert alert-danger mt-3 py-2 px-3 small d-flex align-items-center mb-0 animate__animated animate__headShake">
                        <span className="me-2">⚠️</span>
                        <strong>{error}</strong>
                    </div>
                )}

            </div>
        </>
    );
};

export default SimulationControlConfig;