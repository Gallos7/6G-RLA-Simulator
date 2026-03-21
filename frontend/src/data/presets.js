/**
 * Global Configuration & Data Presets.
 * acts as the central repository for static configuration data used throughout the application.
 *
 * This module exports:
 * 1. PRESETS: A dictionary of pre-configured simulation scenarios.
 * 2. UI_COLORS: The application's visual theme definitions.
 * 3. CHART_COLORS: A standard palette for data visualization consistency.
 */

/**
 * @constant {Object} PRESETS
 * Dictionary of pre-defined simulation scenarios used to quickly populate the input forms.
 *
 * Data Structure Definition:
 * - id {string}: Unique identifier for the scenario.
 * - label {string}: Display name shown in the UI dropdown.
 * - description {string}: Short explanatory text describing the scenario's purpose.
 * - variable {string}: The independent variable for the X-axis (e.g., 'load', 'server').
 * - target {number}: The stop condition value for the independent variable.
 * - step {number}: The increment size for the simulation loop.
 * - K {number}: Number of Service Classes (Services).
 * - M {number}: Number of Network Links (Topology size).
 * - load {number}: Initial Traffic Intensity (Erlang).
 * - a_resource {Array<number>}: Capacity Vector C = [C1, C2, ... CM]. Represents channels per link.
 * - r_resource {Array<Array<number>>}: Requirement Matrix (b_kj). Rows=Services, Cols=Links.
 * - enableNoise {boolean}: Whether to inject Gaussian noise into the simulation.
 * - noiseMantissa {number}: Scientific notation base for noise.
 * - noiseExponent {string}: Scientific notation exponent for noise.
 */
export const PRESETS = {
  // --- DEFAULT CUSTOM SCENARIO ---
  custom: {
    id: "custom",
    label: "🔧 Custom (Manual)",
    description: "Manually configure all simulation parameters.",
    variable: "load",
    target: 6.0,
    step: 0.5,
    K: 2,
    M: 5,
    load: 4.0,
    a_resource: [80, 400, 70, 70, 70],
    r_resource: [
      [5, 25, 6, 5, 4],
      [2, 15, 4, 3, 2]
    ],
    enableNoise: false,
    noiseMantissa: 1,
    noiseExponent: "06"
  },

  // --- SCENARIO 1: CAPACITY SCALING ---
  capacity: {
    id: "capacity",
    label: "📶 Capacity Scaling Test",
    description: "Study of antenna capacity scaling impact (40 -> 100).",
    variable: "antenna",
    target: 100,
    step: 5,
    K: 2,
    M: 5,
    load: 4.0,
    a_resource: [80, 400, 40, 40, 40],
    r_resource: [
      [5, 25, 6, 5, 4],
      [2, 15, 4, 3, 2]
    ],
    enableNoise: false,
    noiseMantissa: 1,
    noiseExponent: "06"
  },

  // --- SCENARIO 2: STREAMING ---
  streaming: {
    id: "streaming",
    label: "🎥 4K Video Streaming",
    description: "High bandwidth data requirement scenario.",
    variable: "load",
    target: 8.0,
    step: 0.5,
    K: 3,
    M: 5,
    load: 4.0,
    a_resource: [120, 600, 100, 100, 100],
    r_resource: [
      [1, 2, 1, 1, 1],   // Audio Only (Light)
      [4, 10, 3, 3, 3],  // HD Video (Medium)
      [12, 40, 8, 8, 8]  // 4K Stream (Heavy)
    ],
    enableNoise: true,
    noiseMantissa: 1,
    noiseExponent: "06"
  },

  // --- SCENARIO 3: CONFERENCE ---
  conference: {
    id: "conference",
    label: "💼 Zoom Conference",
    description: "Real-time communication scenario.",
    variable: "load",
    target: 6.0,
    step: 0.2,
    K: 2,
    M: 5,
    load: 3.5,
    a_resource: [100, 500, 80, 80, 80],
    r_resource: [
      [2, 5, 2, 2, 2],   // Voice Participant
      [6, 20, 4, 4, 4]   // Presenter (Video + Screen Share)
    ],
    enableNoise: true,
    noiseMantissa: 1,
    noiseExponent: "06"
  },

  // --- SCENARIO 4: IOT ---
  iot: {
    id: "iot",
    label: "📡 IoT Sensor Network",
    description: "Multiple small devices with distinct resource profiles.",
    variable: "load",
    target: 20.0,
    step: 1.0,
    K: 4,
    M: 5,
    load: 10.0,
    a_resource: [50, 200, 40, 40, 40],
    r_resource: [
      [1, 1, 1, 1, 1],   // S1: Temp Sensor (Very Low)
      [1, 3, 1, 1, 1],   // S2: Smart Meter (More Server processing)
      [2, 5, 2, 2, 2],   // S3: Motion Camera (Higher Bandwidth)
      [3, 8, 3, 3, 3]    // S4: IoT Gateway (Aggregator - Heavy)
    ],
    enableNoise: true,
    noiseMantissa: 1,
    noiseExponent: "06"
  },

  // --- SCENARIO 5: SMART CITY ---
  smart_city: {
    id: "smart_city",
    label: "🏙️ Smart City Traffic Control",
    description: "Complex environment with 5 concurrent services.",
    variable: "fronthaul",
    target: 200.0,
    step: 10.0,
    K: 5,
    M: 5,
    load: 3.0,
    a_resource: [60, 500, 80, 80, 80],
    r_resource: [
      [4, 10, 3, 3, 3], // S1: HD Traffic Cameras (High BW)
      [1, 2, 1, 1, 1],  // S2: Parking Sensors (Low)
      [2, 6, 2, 2, 2],  // S3: Public Wi-Fi (Medium)
      [1, 15, 1, 1, 1], // S4: Emergency Signals (Low BW, High Server Priority)
      [3, 8, 2, 2, 2]   // S5: V2X (Balanced)
    ],
    enableNoise: true,
    noiseMantissa: 1,
    noiseExponent: "06"
  },

  // --- SCENARIO 6: INDUSTRY 4.0 ---
  industry_40: {
    id: "industry_40",
    label: "🏭 Industry 4.0 Robotics",
    description: "Factory automation environment with interference factors.",
    variable: "server",
    target: 600.0,
    step: 20.0,
    K: 4,
    M: 5,
    load: 5.0,
    a_resource: [100, 200, 60, 60, 60],
    r_resource: [
      [2, 20, 2, 2, 2], // S1: Robotic Arm (High CPU)
      [5, 10, 4, 4, 4], // S2: Visual Inspection (High Fronthaul)
      [1, 2, 1, 1, 1],  // S3: Env Sensors (Minimal)
      [3, 5, 2, 2, 2]   // S4: AGV Vehicles (Medium)
    ],
    enableNoise: true,
    noiseMantissa: 1,
    noiseExponent: "06"
  },

  // --- SCENARIO 7: STADIUM ---
  stadium: {
    id: "stadium",
    label: "🏟️ Stadium Massive Event",
    description: "High user density in a confined area.",
    variable: "antenna",
    target: 150.0,
    step: 5.0,
    K: 4,
    M: 5,
    load: 4.5,
    a_resource: [150, 600, 50, 50, 50],
    r_resource: [
      [1, 2, 1, 1, 1],  // S1: Voice Calls (Basic)
      [2, 5, 2, 2, 2],  // S2: Social Media (Uploads)
      [6, 15, 4, 4, 4], // S3: Live Video (Heavy)
      [1, 8, 1, 1, 1]   // S4: POS/Ticketing (High Server verification)
    ],
    enableNoise: true,
    noiseMantissa: 1,
    noiseExponent: "06"
  }
};

/**
 * @constant {Object} UI_COLORS
 * Centralized color palette definitions to maintain UI consistency.
 *
 * Properties:
 * - primaryGradient: CSS gradient for main headers (Navbar, Config).
 * - secondaryGradient: CSS gradient for results/charts headers.
 * - actionButton: Solid color for primary actions (Run, Export).
 * - actionText: Text color for action buttons.
 */
export const UI_COLORS = {
  primaryGradient: "linear-gradient(135deg, #1a237e 0%, #4a148c 100%)", // Navbar & Config (Deep Blue/Purple)
  secondaryGradient: "linear-gradient(135deg, #37474f 0%, #546e7a 100%)", // Results (Blue Grey)
  actionButton: "#00b894", // Run Button (Teal)
  actionText: "#ffffff"
};

/**
 * @constant {Array<string>} CHART_COLORS
 * An array of hexadecimal color strings used by the Recharts library.
 * Each service line in the graph will pick a color from this array sequentially.
 */
export const CHART_COLORS = [
  "#8884d8", // Purple
  "#82ca9d", // Green
  "#ff7300", // Orange
  "#ff0000", // Red
  "#00C49F", // Turquoise
  "#FFBB28"  // Yellow
];