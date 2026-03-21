/**
 * Service Layer: API Communication
 * * This module abstracts all HTTP requests to the Python Flask backend.
 * By isolating Axios calls here, UI components and Custom Hooks remain agnostic 
 * to network protocols, endpoints, and data-fetching libraries.
 */

import axios from 'axios';

// Enterprise Pattern: Centralize configuration
const API_BASE_URL = 'http://localhost:5000';

const apiClient = axios.create({
    baseURL: API_BASE_URL,
    headers: {
        'Content-Type': 'application/json',
    },
});

export const simulationService = {
    /**
     * Executes the main simulation via the Backend API.
     * @param {Object} payload - The structured JSON (inputs + config).
     * @returns {Promise<Object>} The calculated chart_data and x_label.
     */
    runSimulation: async (payload) => {
        try {
            const response = await apiClient.post('/run_simulation', payload);
            return response.data;
        } catch (error) {
            console.error("API Error [runSimulation]:", error);
            throw error; // Re-throw to let the Hook handle the UI error state
        }
    },

    /**
     * Fetches the 20 most recent simulation records.
     * @returns {Promise<Array>} Array of history objects.
     */
    getHistory: async () => {
        try {
            const response = await apiClient.get('/api/history');
            return response.data;
        } catch (error) {
            console.error("API Error [getHistory]:", error);
            throw error;
        }
    }
};