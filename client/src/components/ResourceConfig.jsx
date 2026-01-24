import React from 'react';
import { UI_COLORS } from "../data/presets"; // <--- IMPORT COLORS

/**
 * Component: InfoTooltip
 * A small helper component to display context hints.
 * Visual Style: Uses the global 'actionButton' color for consistency.
 */
const InfoTooltip = ({ text }) => (
    <span
        className="ms-1"
        style={{ cursor: 'help', fontSize: '0.9em', color: UI_COLORS.actionButton }}
        title={text}
    >
        ⓘ
    </span>
);

/**
 * Component: ResourceConfig
 * Manages the detailed configuration of network resources.
 *
 * This component handles two critical matrices for the Erlang B calculation:
 * 1. Available Resources Vector (C): The total capacity of each link (Fronthaul, Server, Antennas).
 * 2. Resource Requirement Matrix (b_kj): The number of resource units required by service 'k' on link 'j'.
 *
 * @param {Object} inputs - Current simulation state (contains 'a_resource', 'r_resource', 'K').
 * @param {Function} handleResourceSelect - Updates the Capacity Vector (C).
 * @param {Function} handleServiceCountChange - Updates the number of Service Classes (K).
 * @param {Function} handleMatrixChange - Updates specific cells in the Requirement Matrix (b_kj).
 */
const ResourceConfig = ({
    inputs,
    handleResourceSelect,
    handleServiceCountChange,
    handleMatrixChange,
}) => {

    // Presets for Total Capacity options (Available Resources)
    const resourceOptions = {
        fronthaul: [30, 40, 50, 60, 80, 100, 120, 150, 160, 200],
        server: [100, 150, 200, 250, 300, 350, 400, 450, 500, 600],
        antenna: [30, 40, 50, 60, 70, 80, 90, 100, 110, 120]
    };

    // Strict options for Per-Service Requirements (Matrix b_kj)
    // Limits the user to realistic consumption values to ensure valid simulation results.
    const strictOptions = {
        fronthaul: [1, 2, 3, 4, 5, 6, 8, 10, 12],
        server: [2, 5, 10, 15, 20, 25, 30, 40],
        antenna: [1, 2, 3, 4, 5, 6, 8]
    };

    // Helper to determine which option set to use based on the column index (Link type)
    const getOptionsForColumn = (colIndex) => {
        if (colIndex === 0) return strictOptions.fronthaul;
        if (colIndex === 1) return strictOptions.server;
        return strictOptions.antenna;
    };

    return (
        <>
            {/* --- 1. Available Resources Section (Capacity Vector C) --- */}
            <div className="resource-box mb-3">
                <label className="form-label fw-bold text-body">
                    Network Capacities (Bandwidth Units)
                    <InfoTooltip text="Total available capacity for each network segment." />
                </label>

                <div className="row g-3">
                    <div className="col-md-4">
                        <label className="form-label small w-100">
                            Fronthaul (Link 1)
                        </label>
                        <select
                            className="form-select border-secondary bg-transparent text-inherit"
                            value={inputs.a_resource[0]}
                            onChange={(e) => handleResourceSelect("fronthaul", e.target.value)}
                        >
                            {resourceOptions.fronthaul.map(opt => (
                                <option key={opt} value={opt} className="bg-body text-body">
                                    {opt} b.u.
                                </option>
                            ))}
                        </select>
                    </div>

                    <div className="col-md-4">
                        <label className="form-label small w-100">
                            Server SDN (Link 2)
                        </label>
                        <select
                            className="form-select border-secondary bg-transparent text-inherit"
                            value={inputs.a_resource[1]}
                            onChange={(e) => handleResourceSelect("server", e.target.value)}
                        >
                            {resourceOptions.server.map(opt => (
                                <option key={opt} value={opt} className="bg-body text-body">
                                    {opt} b.u.
                                </option>
                            ))}
                        </select>
                    </div>

                    <div className="col-md-4">
                        <label className="form-label small w-100">
                            Antennas (Links 3-5)
                        </label>
                        <select
                            className="form-select border-secondary bg-transparent text-inherit"
                            value={inputs.a_resource[2]}
                            onChange={(e) => handleResourceSelect("antenna", e.target.value)}
                        >
                            {resourceOptions.antenna.map(opt => (
                                <option key={opt} value={opt} className="bg-body text-body">
                                    {opt} b.u.
                                </option>
                            ))}
                        </select>
                    </div>
                </div>

                <div className="form-text mt-2 small">
                    Current Config: <strong>[{inputs.a_resource.join(", ")}]</strong>
                </div>
            </div>

            {/* --- 2. Required Resources Section (Matrix b_kj) --- */}
            <div className="resource-box">
                <div className="d-flex justify-content-between align-items-center mb-3">
                    <label className="form-label fw-bold mb-0 text-body">
                        Required Resources (<i>b</i><sub>kj</sub>)
                        <InfoTooltip text="Amount of resources consumed by each service on each link." />
                    </label>

                    <div className="d-flex align-items-center">
                        <span className="small me-2 fw-bold text-body">Services (K):</span>
                        <input
                            type="number"
                            className="form-control form-control-sm text-center fw-bold border-secondary bg-transparent text-inherit"
                            style={{ width: "60px" }}
                            min="2" max="6"
                            value={inputs.K}
                            onChange={(e) => handleServiceCountChange(e.target.value)}
                        />
                    </div>
                </div>

                <div className="table-responsive rounded shadow-sm border-0">
                    <table className="table table-bordered table-sm text-center align-middle mb-0">
                        <thead className="text-white small" style={{ background: UI_COLORS.secondaryGradient }}>
                            <tr>
                                <th style={{ width: "15%" }}>Service</th>
                                <th style={{ width: "17%" }}>Fronthaul</th>
                                <th style={{ width: "17%" }}>Server</th>
                                <th>Ant 1</th>
                                <th>Ant 2</th>
                                <th>Ant 3</th>
                            </tr>
                        </thead>
                        <tbody>
                            {inputs.r_resource.map((row, serviceIndex) => (
                                <tr key={serviceIndex}>
                                    <td className="fw-bold small opacity-75">
                                        Class {serviceIndex + 1}
                                    </td>
                                    {row.map((val, linkIndex) => (
                                        <td key={linkIndex} className="p-0">
                                            <select
                                                className="form-select-sm shadow-none table-select w-100 h-100 border-0 text-center"
                                                style={{ cursor: 'pointer' }}
                                                value={val}
                                                onChange={(e) => handleMatrixChange(serviceIndex, linkIndex, e.target.value)}
                                            >
                                                {getOptionsForColumn(linkIndex).map(opt => (
                                                    <option key={opt} value={opt} className="bg-body text-body">
                                                        {opt}
                                                    </option>
                                                ))}
                                            </select>
                                        </td>
                                    ))}
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </>
    );
};

export default ResourceConfig;