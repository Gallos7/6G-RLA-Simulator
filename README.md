[🇬🇷 Διαβάστε στα Ελληνικά](./README-GR.md)

---

# 6G RLA Simulator (Resource Level Allocation)

> **Bachelor's Thesis:** Simulation of Resource Allocation in 6G Networks
> **Author:** Parissis Dimitrios (Computer Science Graduate)
> **Supervisor:** Ioannis Vardakas
> **Institution:** University of Western Macedonia, School of Science, Department of Informatics

---

## ⚖️ Declaration of Authorship & Supervision

To ensure clarity regarding the contribution of all parties involved:

1.  **Thesis Supervision:** The original Bachelor's Thesis (Theoretical Analysis & initial Java Implementation — available within the application as a PDF) was conducted under the supervision of Professor **Ioannis Vardakas**.
2.  **Software Implementation:** This specific software repository (**Full-Stack Web Simulator**: React, Python Flask, MongoDB) represents an independent evolution of the project. It was designed, architected, and developed **exclusively by Parissis Dimitrios**. No other individuals contributed to the modern software engineering, coding, or optimization of this web application.

---

## 📖 Project Description
This application is a scientific simulator designed to study the **Blocking Probability ($P_b$)** in next-generation telecommunication networks (6G).

The simulator solves the resource allocation problem in **Multi-rate Loss Systems** using iterative algorithms, while taking into account physical layer factors such as **Thermal Noise** and **Interference**.

The platform allows the user to parameterize network link capacities (Fronthaul, Server, Antennas) and service requirements, execute experiments in real-time, and export data for further analysis.

---

## 🚀 Technologies & Architecture

The system follows a three-tier **Microservices Architecture**:

### 1. Frontend (Client)
* **React.js (Vite):** High-performance modern User Interface (UI).
* **Recharts:** Library for dynamic data visualization (Line Charts).
* **Bootstrap 5:** Responsive design framework.
* **Axios:** Handling asynchronous communication with the Backend API.

### 2. Backend (Server)
* **Python (Flask):** REST API Server executing the business logic.
* **NumPy:** Utilizes vectorization for rapid execution of mathematical models.
* **Algorithms:** Implementation of Kaufman-Roberts (KRF) and Reduced Load Approximation (RLA) with numerical stability protections.

### 3. Database & Caching
* **MongoDB:** NoSQL database for storing experiment history.
* **Smart Caching:** Before executing an experiment, the system checks if it has been run before with identical parameters. If so, it retrieves results from the database ($O(1)$ time), avoiding redundant calculations.

---

## 🔬 Scientific Methodology

The simulation core is based on the following mathematical models:

1.  **Kaufman-Roberts Formula (KRF):**
    Recursive calculation of the occupancy distribution for a single link.
2.  **Reduced Load Approximation (RLA):**
    Iterative method (Erlang Fixed Point Approximation) to find the network equilibrium.
3.  **End-to-End Blocking (BPC):**
    Aggregation of blocking probabilities across all links in a path.

---

## ⚙️ Note on Implementation & Differences from Thesis

This application represents the **Software Implementation** of the Bachelor's Thesis.
However, the code has undergone **further technical optimizations** compared to the initial academic study to ensure maximum numerical stability under extreme load conditions.

Specifically, the following mechanisms have been introduced (which may not be detailed in the thesis text, as they strictly concern programming stability):

### 1. Numerical Stability (Dynamic Scaling)
In networks with very high load (>1000 Erlang), state probabilities can exceed floating-point limits. A **Dynamic Scaling** mechanism was applied to the KRF algorithm to prevent `Overflow` while maintaining accurate ratios.

### 2. Oscillation Damping
A **Damping Factor (0.5)** was introduced to the Erlang Fixed Point algorithm to eliminate oscillations during convergence in high-congestion scenarios.

### 3. Stricter Convergence Criteria
This version requires **absolute convergence** (`tolerance < 0.0001`) for every service on every link individually, as opposed to looser average-error methods used in standard implementations.

> **Observation:** Due to these accuracy improvements, the simulation results may show slight deviations (typically slightly higher/more conservative Blocking values) compared to the static charts presented in the Thesis PDF.

---

## 🛠️ Installation Instructions

### Step 1: Database (MongoDB)
Ensure the MongoDB service is running locally (`localhost:27017`).
The application will automatically create the database: `Reduced_Load_Approximation_Kaufman_Roberts`.

### Step 2: Backend (Server)
Open a terminal in the `server/` directory:
```bash
# Install required libraries
pip install flask flask-cors pymongo numpy

# Start the Server
python server.py