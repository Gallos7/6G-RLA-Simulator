import React from "react";
import { CHART_COLORS } from "../data/presets";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { generateAndDownloadCSV } from "../utils/exportHandler";

/**
 * Component: Chart (SimulationChartConfig)
 * Visualizes the simulation results using a dual-view approach:
 * 1. Interactive Line Chart (Recharts): Plots Blocking Probability vs. the Variable parameter.
 * 2. Data Table: A detailed tabular view of the exact values for further inspection.
 *
 * Thesis Context:
 * This component provides the visual proof of the mathematical models. It allows the user
 * to observe the non-linear relationship between Traffic Load/Capacity and Blocking Probability
 * across multiple service classes simultaneously.
 *
 * @param {string} theme - Current UI theme ('light' or 'dark').
 * @param {boolean} loading - State flag showing the spinner during calculation.
 * @param {Object} results - The dataset returned from the Python backend (x_label, chart_data).
 * @param {Object} inputs - Simulation input state (used for export context).
 * @param {Object} simConfig - Simulation control configuration (used for export context).
 * @param {string} selectedScenario - ID of the active scenario (used for export context).
 */
const Chart = ({
    theme,
    loading,
    results,
    inputs,
    simConfig,
    selectedScenario
}) => {

    // Extract dynamic keys for services (excluding the 'x' axis key)
    const dataKeys = results && results.chart_data.length > 0
        ? Object.keys(results.chart_data[0]).filter(key => key !== 'x')
        : [];

    // Helper to format scientific numbers for cleaner display
    const formatNumber = (num) => {
        if (num === 0) return "0";
        if (Math.abs(num) < 0.01) return num.toExponential(4);
        return num.toFixed(6);
    };

    return (
        <>
            <div className="card-body d-flex flex-column align-items-center justify-content-center" style={{ minHeight: "500px" }}>
                {loading ? (
                    <div className="text-center animate__animated animate__pulse animate__infinite">
                        <div className="spinner-grow text-primary" role="status" style={{ width: "3rem", height: "3rem" }}></div>
                        <h4 className="mt-3 fw-light">Simulating Network...</h4>
                    </div>
                ) : results ? (
                    <div className="w-100 h-100 animate__animated animate__fadeIn" style={{ paddingBottom: '80px' }}>

                        {/* --- CHART VISUALIZATION --- */}
                        <div className="chart-container">
                            <h3 className="text-center mb-4 fw-bold" style={{ color: 'var(--text-main)', fontSize: '18px' }}>
                                📉 {results.x_label} vs Blocking Probability
                            </h3>
                            <ResponsiveContainer width="100%" height="100%">
                                <LineChart data={results.chart_data} margin={{ top: 10, right: 30, left: 20, bottom: 50 }}>
                                    <CartesianGrid strokeDasharray="3 3" stroke={theme === 'dark' ? "#333" : "#f0f0f0"} vertical={false} />
                                    <XAxis
                                        dataKey="x"
                                        stroke={theme === 'dark' ? '#555' : '#ccc'}
                                        tick={{ fill: theme === 'dark' ? '#aaa' : '#666' }}
                                        label={{
                                            value: results.x_label,
                                            position: 'insideBottom',
                                            offset: -15,
                                            fill: theme === 'dark' ? '#e0e0e0' : '#000000',
                                            style: { fontWeight: 'bold', fontSize: '14px' }
                                        }}
                                    />
                                    <YAxis
                                        stroke={theme === 'dark' ? '#555' : '#ccc'}
                                        tick={{ fill: theme === 'dark' ? '#aaa' : '#666' }}
                                        label={{
                                            value: 'Blocking Prob. (%)',
                                            angle: -90,
                                            position: 'insideLeft',
                                            fill: theme === 'dark' ? '#e0e0e0' : '#000000',
                                            style: { fontWeight: 'bold', textAnchor: 'middle', fontSize: '14px' }
                                        }}
                                    />
                                    <Tooltip
                                        contentStyle={{ backgroundColor: 'var(--bg-card)', borderColor: 'var(--border-color)', color: 'var(--text-main)', borderRadius: '8px' }}
                                        formatter={(value) => formatNumber(value) + " %"}
                                    />
                                    <Legend verticalAlign="top" height={40} iconType="circle" />
                                    {dataKeys.map((key, index) => (
                                        <Line
                                            key={key}
                                            type="monotone"
                                            dataKey={key}
                                            name={`Service ${index + 1}`}
                                            stroke={CHART_COLORS[index % CHART_COLORS.length]}
                                            strokeWidth={3}
                                            dot={{ r: 0 }}
                                            activeDot={{ r: 6 }}
                                        />
                                    ))}
                                </LineChart>
                            </ResponsiveContainer>
                        </div>

                        {/* --- DATA TABLE & EXPORT --- */}
                        <div style={{ marginTop: '40px', fontFamily: "'Inter', sans-serif" }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
                                <h3 style={{ color: theme === 'dark' ? '#e0e0e0' : '#2c3e50', margin: 0, fontSize: '18px', fontWeight: '600' }}>
                                    📋 Detailed Data Table
                                </h3>
                                {/* BUTTON: Calls the external export utility function */}
                                <button
                                    onClick={() => generateAndDownloadCSV(results, inputs, simConfig, selectedScenario)}
                                    className={`btn btn-sm btn-outline-success fw-bold d-flex align-items-center gap-2`}
                                    title="Download Excel Report"
                                >
                                    <span>📊</span> Export to Excel
                                </button>
                            </div>

                            <div className="data-table-container">
                                <table className="custom-table w-100">
                                    <thead>
                                        <tr>
                                            <th className="p-2 border-bottom">{results.x_label} (X)</th>
                                            {dataKeys.map((key, index) => (
                                                <th key={key} className="p-2 border-bottom" style={{ color: CHART_COLORS[index % CHART_COLORS.length] }}>
                                                    Service {index + 1} (%)
                                                </th>
                                            ))}
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {results.chart_data.map((row, rowIndex) => (
                                            <tr key={rowIndex}>
                                                <td className="fw-bold p-2 border-bottom">{row.x}</td>
                                                {dataKeys.map((key, colIndex) => (
                                                    <td key={key} className="p-2 border-bottom" style={{ color: CHART_COLORS[colIndex % CHART_COLORS.length], fontFamily: 'monospace' }}>
                                                        {formatNumber(row[key])}
                                                    </td>
                                                ))}
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </div>

                    </div >
                ) : (
                    <div className="text-center opacity-50">
                        <h1 style={{ fontSize: "4rem", filter: "grayscale(1)" }}>📉</h1>
                        <h3 className="fw-light">Waiting for Simulation...</h3>
                        <p>Configure parameters and click "RUN" to start.</p>
                    </div>
                )}
            </div>
        </>
    );
};

export default Chart;