import React from 'react';
import { UI_COLORS } from "../../data/presets";

/**
 * Component: CompactGroupConfig
 * Renders the primary simulation configuration settings in a compact row.
 *
 * Sections:
 * 1. Links (M): Read-only display of the network topology size.
 * 2. Traffic Load: Main input for traffic intensity (Erlang).
 * 3. Noise Config: Toggle switch and parameters for Gaussian noise injection.
 *
 * @param {Object} inputs - The current state of simulation inputs.
 * @param {Function} handleInputChange - Handler for updating numeric fields (expects: field, value).
 * @param {Function} handleCheckboxChange - Handler for toggling boolean flags (expects: category).
 */
const CompactGroupConfig = ({
    inputs,
    handleInputChange,
    handleCheckboxChange,
}) => {
    return (
        <>
            <div className="resource-box mb-3">
                <div className="row g-2 align-items-end">

                    {/* --- 1. NETWORK LINKS (M) --- */}
                    {/* Read-only field displaying the number of active links in the topology */}
                    <div className="col-3">
                        <label className="form-label small fw-bold opacity-75 mb-1 d-block text-center">Links</label>
                        <input
                            type="number"
                            className="form-control text-center cursor-default py-1"
                            value={inputs.M}
                            disabled
                            style={{ backgroundColor: 'rgba(0,0,0,0.05)', border: 'none' }}
                        />
                    </div>

                    {/* --- 2. TRAFFIC LOAD (ERLANG) --- */}
                    {/* Main input for Traffic Intensity. Includes validation to prevent invalid chars */}
                    <div className="col-4">
                        <label className="form-label small fw-bold mb-1 d-block text-center text-body">
                            Traffic Load
                        </label>
                        <input
                            type="number"
                            step="0.1"
                            className="form-control text-center fw-bold py-1"
                            min="1.0"
                            value={inputs.load}
                            onChange={(e) => handleInputChange("load", e.target.value)}
                            onKeyDown={(e) => {
                                if (e.key === "-" || e.key === "+" || e.key === "e")
                                    e.preventDefault();
                            }}
                        />
                    </div>

                    {/* --- 3. NOISE CONFIGURATION --- */}
                    {/* Toggle switch for noise and conditional rendering of noise parameters */}
                    <div className="col-5">
                        <div className="d-flex flex-column align-items-center">
                            <div className="form-check form-switch mb-1">
                                <input
                                    className="form-check-input"
                                    type="checkbox"
                                    role="switch"
                                    checked={inputs.enableNoise}
                                    onChange={() => handleCheckboxChange("enableNoise")}
                                    style={inputs.enableNoise ? { backgroundColor: UI_COLORS.actionButton, borderColor: UI_COLORS.actionButton } : {}}
                                />
                                <label className="form-check-label small fw-bold ms-2">Local Noise</label>
                            </div>
                        </div>

                        {/* Noise Parameters: Mantissa & Exponent (Visible only if Noise is Enabled) */}
                        {inputs.enableNoise && (
                            <div className="animate__animated animate__fadeIn mt-1">
                                <div className="input-group input-group-sm">
                                    <input
                                        type="number"
                                        className="form-control text-end fw-bold px-1"
                                        placeholder="1"
                                        value={inputs.noiseMantissa}
                                        onChange={(e) => handleInputChange('noiseMantissa', e.target.value)}
                                    />
                                    <span className="input-group-text px-1 border-start-0 border-end-0">e-</span>
                                    <select
                                        className="form-select text-start fw-bold ps-1 pe-0 w-55px"
                                        value={inputs.noiseExponent}
                                        onChange={(e) => handleInputChange('noiseExponent', e.target.value)}
                                    >
                                        <option value="04">04</option>
                                        <option value="05">05</option>
                                        <option value="06">06</option>
                                        <option value="07">07</option>
                                    </select>
                                </div>
                            </div>
                        )}
                    </div>

                    {/* --- FOOTER INFO --- */}
                    {/* Static information regarding the topology structure */}
                    <div className="col-12">
                        <div className="form-text small opacity-50 mt-2 text-center fst-italic border-top pt-2">
                            🔒 Topology: FH + Server + 3 Antennas
                        </div>
                    </div>
                </div>
            </div>
        </>
    );
};

export default CompactGroupConfig;