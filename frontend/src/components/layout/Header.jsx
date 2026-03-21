import React from "react";
import { useState } from 'react';
import { UI_COLORS } from "../../data/presets";

/**
 * Component: Header (Navbar)
 * Represents the top navigation bar and the primary control center of the application.
 *
 * Responsibilities:
 * 1. Branding: Displays the application title and logo.
 * 2. Global Controls: Provides access to Theme toggling (Light/Dark) and History.
 * 3. Thesis Access: Quick link to the PDF documentation.
 * 4. Simulation Execution: Contains the primary 'RUN' trigger button.
 *
 * UI Note:
 * Uses 'UI_COLORS.primaryGradient' to establish the visual identity of the application.
 *
 * @param {string} theme - Current active theme ('light' or 'dark').
 * @param {string|null} error - Validation error message. If present, disables the Run button.
 * @param {boolean} loading - State flag indicating if a simulation is in progress.
 * @param {Function} toggleTheme - Handler to switch between light and dark modes.
 * @param {Function} fetchHistory - Handler to open the simulation history drawer.
 * @param {Function} runSimulation - Main handler to trigger the simulation request.
 */
const Header = ({
    theme,
    error,
    loading,
    toggleTheme,
    fetchHistory,
    runSimulation,
}) => {
    // Local state to manage the hover effect for the Thesis button
    const [hoverThesis, setHoverThesis] = useState(false);

    return (
        <>
            {/* HEADER (NAVBAR) - Uses UI_COLORS.primaryGradient */}
            <nav
                className="navbar navbar-expand-lg shadow-sm navbar-dark sticky-top"
                style={{
                    zIndex: 1020,
                    background: UI_COLORS.primaryGradient
                }}
            >
                <div className="container-fluid px-4">
                    {/* Brand Logo & Title */}
                    <a className="navbar-brand fw-bold d-flex align-items-center" href="#">
                        <span style={{ fontSize: "1.5rem", marginRight: "10px" }}>📡</span>
                        <span>6G RLA Simulator</span>
                    </a>

                    <div className="d-flex align-items-center gap-3">
                        {/* THEME TOGGLE */}
                        <button
                            className="btn btn-sm fw-bold shadow-sm"
                            onClick={toggleTheme}
                            style={{ backgroundColor: 'rgba(255,255,255,0.2)', color: '#fff', border: 'none' }}
                        >
                            {theme === "dark" ? "☀️ Light" : "🌙 Dark"}
                        </button>

                        {/* HISTORY BUTTON */}
                        <button
                            className="btn btn-sm d-flex align-items-center gap-2"
                            onClick={fetchHistory}
                            title="Open Simulation History Archive"
                            style={{
                                backgroundColor: 'rgba(255,255,255,0.2)',
                                color: '#fff',
                                border: '1px solid rgba(255,255,255,0.3)'
                            }}
                        >
                            <span style={{ fontSize: '1.2rem' }}>📜</span>
                            <span className="d-none d-md-inline fw-bold">History</span>
                        </button>

                        {/* PDF LINK */}
                        <a
                            href="/thesis.pdf"
                            target="_blank"
                            rel="noopener noreferrer"
                            className="btn btn-sm d-flex align-items-center gap-2 shadow-sm"
                            title="View Thesis PDF"
                            onMouseEnter={() => setHoverThesis(true)}
                            onMouseLeave={() => setHoverThesis(false)}
                            style={{
                                border: '2px solid #FFD700',
                                color: hoverThesis ? '#000' : '#FFD700',
                                backgroundColor: hoverThesis ? '#FFD700' : 'transparent',
                                transition: 'all 0.3s ease',
                                transform: hoverThesis ? 'translateY(-2px)' : 'none',
                                textDecoration: 'none'
                            }}
                        >
                            <span style={{ fontSize: '1.2rem' }}>🎓</span>
                            <span className="d-none d-md-inline fw-bold">Thesis</span>
                        </a>

                        {/* RUN BUTTON - Uses UI_COLORS.actionButton */}
                        <button
                            className="btn fw-bold px-4 d-flex align-items-center shadow"
                            onClick={runSimulation}
                            disabled={loading || !!error}
                            style={{
                                backgroundColor: UI_COLORS.actionButton,
                                color: UI_COLORS.actionText,
                                border: 'none',
                                fontSize: '1rem'
                            }}
                        >
                            {loading ? (
                                <>
                                    <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                                    RUNNING...
                                </>
                            ) : (
                                <>
                                    <span style={{ marginRight: "5px" }}>🚀</span> RUN SIMULATION
                                </>
                            )}
                        </button>
                    </div>
                </div>
            </nav>
        </>
    );
};

export default Header;