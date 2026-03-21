import React, { useState } from 'react';
import { UI_COLORS } from '../../data/presets'; // <--- IMPORT COLORS

/**
 * Component: HistoryDrawer
 * A sliding drawer component that displays the simulation history archive.
 *
 * Features:
 * 1. Split-pane layout: List of past simulations (Left) vs Detailed Preview (Right).
 * 2. Visual Consistency: Uses the global UI_COLORS gradients and action colors.
 * 3. Interaction: Allows users to inspect past parameters and restore (Load) a state.
 *
 * @param {boolean} isOpen - Controls the visibility of the drawer overlay.
 * @param {Function} onClose - Handler to close the drawer.
 * @param {Array} historyItems - List of historical simulation records from the backend.
 * @param {Function} onLoad - Handler to restore the selected historical state to the active app.
 */
const HistoryDrawer = ({
    isOpen,
    onClose,
    historyItems,
    onLoad
}) => {

    const [selectedItem, setSelectedItem] = useState(null);

    if (!isOpen) return null;

    // Helper to format ISO timestamps into a readable local string
    const formatDate = (iso) => new Date(iso).toLocaleString('el-GR', {
        day: '2-digit', month: '2-digit', hour: '2-digit', minute: '2-digit'
    });

    return (
        // BACKDROP OVERLAY
        <div
            style={{
                position: 'fixed', inset: 0, backgroundColor: 'rgba(0,0,0,0.6)', zIndex: 1050,
                display: 'flex', justifyContent: 'flex-end'
            }}
            onClick={onClose}
        >
            {/* DRAWER CONTAINER */}
            <div
                className="shadow-lg h-100 d-flex flex-column animate__animated animate__slideInRight bg-body text-body"
                style={{ width: '85%', maxWidth: '1100px' }}
                onClick={(e) => e.stopPropagation()}
            >
                {/* HEADER - Uses UI_COLORS.primaryGradient */}
                <div className="p-3 d-flex justify-content-between align-items-center border-bottom shadow-sm"
                    style={{ background: UI_COLORS.primaryGradient, color: '#fff' }}>
                    <div className="d-flex align-items-center gap-2">
                        <span style={{ fontSize: '1.5rem' }}>📜</span>
                        <h5 className="m-0 fw-bold">Simulation History Archive</h5>
                    </div>
                    <button onClick={onClose} className="btn-close btn-close-white"></button>
                </div>

                {/* MAIN CONTENT BODY */}
                <div className="d-flex flex-grow-1" style={{ overflow: 'hidden' }}>

                    {/* A. LEFT COLUMN: HISTORY LIST */}
                    <div className="border-end overflow-auto" style={{ width: '35%' }}>
                        {historyItems.length === 0 ? (
                            <div className="p-5 text-center text-muted">No history found yet.</div>
                        ) : (
                            <div className="list-group list-group-flush">
                                {historyItems.map((item, idx) => {
                                    const isActive = selectedItem === item;
                                    return (
                                        <button
                                            key={idx}
                                            className={`list-group-item list-group-item-action py-3 ${isActive ? 'active-item' : ''}`}
                                            onClick={() => setSelectedItem(item)}
                                            style={isActive ? {
                                                background: UI_COLORS.secondaryGradient,
                                                color: '#fff',
                                                borderLeft: `5px solid ${UI_COLORS.actionButton}` // Accent border on active item
                                            } : {}}
                                        >
                                            <div className="d-flex w-100 justify-content-between">
                                                <small className={isActive ? 'text-white-50' : 'text-muted'}>
                                                    {formatDate(item.timestamp)}
                                                </small>
                                                {item.inputs && item.inputs.enableNoise && <span>📶</span>}
                                            </div>
                                            <h6 className="mb-1 fw-bold mt-1">
                                                {item.scenario === 'custom' ? '🔧 CUSTOM SETUP' : `📦 ${item.scenario?.toUpperCase()}`}
                                            </h6>
                                            <small className={isActive ? 'text-white-50' : 'text-muted'}>
                                                Var: {item.variable || 'N/A'} ➔ Target: {item.target || 'N/A'}
                                            </small>
                                        </button>
                                    );
                                })}
                            </div>
                        )}
                    </div>

                    {/* B. RIGHT COLUMN: PREVIEW DETAILS */}
                    <div className="p-4 flex-grow-1 overflow-auto bg-body-tertiary">

                        {selectedItem ? (
                            <div className="animate__animated animate__fadeIn">

                                {/* ACTION BAR */}
                                <div className="d-flex justify-content-between align-items-center mb-4 pb-3 border-bottom border-secondary-subtle">
                                    <h4 className="fw-bold m-0" style={{ color: UI_COLORS.actionButton }}>Experiment Details</h4> {/* Turquoise Title */}

                                    {/* LOAD BUTTON - Uses UI_COLORS.actionButton */}
                                    <button
                                        className="btn fw-bold px-4 shadow"
                                        onClick={() => { onLoad(selectedItem); onClose(); }}
                                        style={{
                                            backgroundColor: UI_COLORS.actionButton,
                                            color: UI_COLORS.actionText,
                                            border: 'none'
                                        }}
                                    >
                                        📥 LOAD SETUP
                                    </button>
                                </div>

                                {/* INFO CARDS GRID */}
                                <div className="row g-3">
                                    <div className="col-md-6">
                                        <div className="card shadow-sm h-100 border-0">
                                            {/* Card Header with Secondary Gradient */}
                                            <div className="card-header fw-bold small text-white"
                                                style={{ background: UI_COLORS.secondaryGradient }}>
                                                📡 NETWORK RESOURCES
                                            </div>
                                            <div className="card-body">
                                                {selectedItem.inputs && selectedItem.inputs.a_resource ? (
                                                    <>
                                                        <div className="mb-2"><strong>Fronthaul:</strong> {selectedItem.inputs.a_resource[0]}</div>
                                                        <div className="mb-2"><strong>Server:</strong> {selectedItem.inputs.a_resource[1]}</div>
                                                        <div><strong>Antennas:</strong> {selectedItem.inputs.a_resource.slice(2).join(', ')}</div>
                                                    </>
                                                ) : <span className="text-danger">Invalid Data</span>}
                                            </div>
                                        </div>
                                    </div>

                                    <div className="col-md-6">
                                        <div className="card shadow-sm h-100 border-0">
                                            <div className="card-header fw-bold small text-white"
                                                style={{ background: UI_COLORS.secondaryGradient }}>
                                                ⚙️ ENVIRONMENT
                                            </div>
                                            <div className="card-body">
                                                {selectedItem.inputs ? (
                                                    <>
                                                        <div className="mb-2"><strong>Load:</strong> {selectedItem.inputs.load} Erlang</div>
                                                        <div className="mb-2"><strong>Step Size:</strong> {selectedItem.step}</div>
                                                        <div><strong>Noise:</strong> {selectedItem.inputs.enableNoise ? "ON" : "OFF"}</div>
                                                    </>
                                                ) : <span className="text-danger">Invalid Data</span>}
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                {/* RESOURCE MATRIX TABLE */}
                                <div className="mt-4">
                                    <h6 className="fw-bold mb-3" style={{ color: '#546e7a' }}>REQUESTED RESOURCES MATRIX</h6>
                                    {selectedItem.inputs && selectedItem.inputs.r_resource ? (
                                        <div className="table-responsive rounded shadow-sm border-0">
                                            <table className="table table-sm text-center mb-0 align-middle table-hover">
                                                <thead className="text-white" style={{ background: UI_COLORS.secondaryGradient }}>
                                                    <tr><th>Svc</th><th>FH</th><th>Srv</th><th>A1</th><th>A2</th><th>A3</th></tr>
                                                </thead>
                                                <tbody className="bg-white">
                                                    {selectedItem.inputs.r_resource.map((row, i) => (
                                                        <tr key={i}>
                                                            <td className="fw-bold" style={{ color: UI_COLORS.actionButton }}>S{i + 1}</td>
                                                            {row.map((v, j) => <td key={j}>{v}</td>)}
                                                        </tr>
                                                    ))}
                                                </tbody>
                                            </table>
                                        </div>
                                    ) : <div className="alert alert-warning">Matrix data missing</div>}
                                </div>

                            </div>
                        ) : (
                            <div className="h-100 d-flex flex-column align-items-center justify-content-center opacity-50">
                                <h1 style={{ fontSize: '4rem' }}>📜</h1>
                                <h4 className="mt-3">Select a scenario</h4>
                                <p>Choose from the list on the left to view details.</p>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default HistoryDrawer;