import { useState } from 'react';
import { PRESETS } from '../data/presets';
import { simulationService } from '../services/api'; // <--- IMPORT THE NEW SERVICE

/**
 * Custom Hook: useSimulationLogic
 * Encapsulates the entire business logic and state management for the simulation frontend.
 *
 * Responsibilities:
 * 1. Manages application state (inputs, configuration, results, theme, history).
 * 2. Handles user interactions (form updates, scenario selection).
 * 3. Delegates API communication to the Service Layer (api.js).
 * 4. Implements validation rules for experiment parameters.
 */
const useSimulationLogic = () => {
    // --- APP STATE ---
    const [selectedScenario, setSelectedScenario] = useState("custom");
    const [theme, setTheme] = useState("light");

    // --- SIMULATION EXECUTION STATE ---
    const [loading, setLoading] = useState(false); 
    const [results, setResults] = useState(null);  

    // --- HISTORY STATE ---
    const [isHistoryOpen, setIsHistoryOpen] = useState(false); 
    const [historyData, setHistoryData] = useState([]);        

    // --- INPUT PARAMETERS STATE ---
    const [inputs, setInputs] = useState(PRESETS.capacity);

    // --- SIMULATION LOOP CONFIGURATION ---
    const [simConfig, setSimConfig] = useState({
        variable: 'load',
        target: 10,
        step: 0.1
    });

    const [error, setError] = useState(null);

    // --- STATE HANDLERS ---
    const toggleTheme = () => setTheme(prev => prev === "light" ? "dark" : "light");

    const handleScenarioChange = (e) => {
        const scenarioId = e.target.value;
        setSelectedScenario(scenarioId);
        
        if (PRESETS[scenarioId]) {
            setInputs({
                ...PRESETS[scenarioId],
                a_resource: [...PRESETS[scenarioId].a_resource],
                r_resource: PRESETS[scenarioId].r_resource.map(row => [...row])
            });

            setSimConfig({
                variable: PRESETS[scenarioId].variable || 'load',
                target: PRESETS[scenarioId].target || 10,
                step: PRESETS[scenarioId].step || 0.1
            });
            setError(null);
        }
    };

    const handleInputChange = (field, value) => {
        setInputs(prev => ({ ...prev, [field]: value }));
    };

    const handleCheckboxChange = (field) => {
        setInputs(prev => ({ ...prev, [field]: !prev[field] }));
    };

    const handleResourceSelect = (index, val) => {
        const newResources = [...inputs.a_resource];
        newResources[index] = parseInt(val, 10);
        setInputs({ ...inputs, a_resource: newResources });
    };

    const handleServiceCountChange = (newCount) => {
        const count = parseInt(newCount, 10);
        let newMatrix = [...inputs.r_resource];

        if (count > inputs.K) {
            for (let i = inputs.K; i < count; i++) {
                newMatrix.push(new Array(inputs.M).fill(1));
            }
        } else if (count < inputs.K) {
            newMatrix = newMatrix.slice(0, count);
        }

        setInputs({ ...inputs, K: count, r_resource: newMatrix });
    };

    const handleMatrixChange = (rowIndex, colIndex, val) => {
        const newMatrix = [...inputs.r_resource];
        newMatrix[rowIndex][colIndex] = parseInt(val, 10);
        setInputs({ ...inputs, r_resource: newMatrix });
    };

    const handleSimConfigChange = (field, value) => {
        const numValue = value === "" ? "" : Number(value);
        setSimConfig(prev => ({ ...prev, [field]: numValue }));

        // Validation Rules
        if (field === 'step') {
            const isFloatAllowed = simConfig.variable === 'load';
            if (!isFloatAllowed && !Number.isInteger(numValue)) {
                setError("Decimals are only allowed when the variable is Traffic Load.");
                return;
            }
            if (isFloatAllowed && numValue > 1) {
                setError("Warning: A step > 1 for Traffic Load will generate very few data points.");
                return;
            }
        }
        setError(null);
    };

    // --- API COMMUNICATION DELEGATION ---

    const runSimulation = async () => {
        if (error) return;

        setLoading(true);
        const payload = {
            inputs,
            config: simConfig,
            scenario: selectedScenario
        };

        try {
            // DELEGATED TO SERVICE LAYER
            const data = await simulationService.runSimulation(payload);
            setResults(data);
        } catch (err) {
            alert("Error connecting to Python Server. Is it running?", err);
        } finally {
            setLoading(false);
        }
    };

    const fetchHistory = async () => {
        try {
            // DELEGATED TO SERVICE LAYER
            const data = await simulationService.getHistory();
            if (data.error) {
                alert("Error from server: " + data.error);
                return;
            }
            setHistoryData(data);
            setIsHistoryOpen(true);
        } catch (err) {
            alert("Could not connect to History Server.", err);
        }
    };

    const handleLoadHistory = (item) => {
        setInputs(item.inputs);
        setSimConfig(item.config);
        setSelectedScenario(item.scenario || "custom");
        
        if (item.results) {
            setResults(item.results);
        }
        
        setIsHistoryOpen(false);
    };

    const finalNoiseValue = inputs.enableNoise
        ? parseFloat(`${inputs.noiseMantissa}e-${inputs.noiseExponent}`)
        : 0;

    return {
        inputs, selectedScenario, theme, simConfig, error, finalNoiseValue, loading, results, historyData, isHistoryOpen,
        runSimulation, toggleTheme, handleServiceCountChange, handleMatrixChange, handleResourceSelect, handleScenarioChange,
        handleInputChange, handleCheckboxChange, handleSimConfigChange, fetchHistory, setIsHistoryOpen, handleLoadHistory
    };
};

export default useSimulationLogic;