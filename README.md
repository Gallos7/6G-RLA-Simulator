# 6G RLA Simulator 📶

> A modern, enterprise-grade simulation platform for resource allocation in 6G networks.

This project is a full-stack scientific simulator designed to compute and visualize **Blocking Probability ($P_b$)** in next-generation telecommunication systems (6G). It implements a highly optimized **Reduced Load Approximation (RLA)** algorithm based on the **Kaufman-Roberts Formula (KRF)**.

---

## 🎓 Academic Context & Authorship

- **Thesis:** Simulation of Resource Allocation in 6G Networks  
- **Author:** Parissis Dimitrios (Computer Science Graduate)  
- **Supervisor:** Professor Ioannis Vardakas  
- **Institution:** University of Western Macedonia, Department of Informatics  

> *Note:* The theoretical analysis and initial Java prototype were developed under academic supervision.  
> The full-stack architecture, modern web simulator (React, Flask, MongoDB), and UI/UX design were independently designed and implemented by the author.

---

## 📸 Dashboard Preview

<video src="https://github.com/user-attachments/assets/1fc9c9c2-b082-4a28-a954-7e7b35495df9" controls="controls" muted="muted" style="max-height: 600px; width: 100%; border-radius: 8px; box-shadow: 0 4px 8px rgba(0,0,0,0.1);"></video>

---

## ✨ Key Features

- **📊 Multi-Rate Loss System Engine**  
  Computes end-to-end blocking probabilities across complex topologies (Fronthaul, Servers, Antennas) supporting multiple service classes simultaneously.

- **⚡ Dynamic Noise Injection**  
  Simulates real-world interference using configurable Gaussian noise parameters integrated directly into the capacity model.

- **🛡️ High-Load Stability (Damping Factor)**  
  Applies a damping factor (0.5) to the Erlang Fixed Point algorithm, ensuring convergence and eliminating oscillations under extreme loads (>1000 Erlang).

- **💾 O(1) Smart Caching (MongoDB)**  
  Identical simulations are cached. Re-running the same scenario instantly returns results without recomputation.

- **📈 Visualization & Export**  
  Interactive charts (Recharts) with instant CSV export (EU format), compatible with MATLAB and Excel.

---

## 🏗️ Tech Stack & Architecture

This project follows a **Monorepo / Feature-Driven Architecture**, cleanly separating the UI from the computational engine.

### 🔧 Backend (Service-Oriented API)

- **Framework:** Python / Flask  
- **Database:** MongoDB (PyMongo)  
- **Math Engine:** NumPy (vectorized operations)  

```text
backend/
├── app/
│   ├── api/          # REST API routes
│   ├── core/         # Mathematical engine (RLA, KRF, BPC)
│   ├── db/           # MongoDB access layer
│   └── services/     # Business logic & orchestration
├── requirements.txt
└── .env              # Environment configuration
```

---

### 🎨 Frontend (Feature-Driven UI)

- **Framework:** React 19 + Vite  
- **Styling:** Bootstrap 5 + Custom CSS Variables (Dark/Light Mode)  
- **Charts:** Recharts  

```text
frontend/
├── src/
│   ├── components/   # Reusable UI components
│   ├── features/     # Domain-specific modules
│   ├── hooks/        # State management hooks
│   ├── pages/        # Main dashboard views
│   └── services/     # API communication (Axios)
└── package.json
```

---

## 🚀 Installation & Setup

### Prerequisites

- Node.js 18+  
- Python 3.10+  
- MongoDB running locally on port `27017`  

---

### 1️⃣ Backend Setup

```bash
# Navigate to backend
cd backend

# Create & activate virtual environment
python -m venv venv
source venv/bin/activate        # Windows: .\venv\Scripts\activate

# Install dependencies
pip install -r requirements.txt

# Create .env file and add:
# MONGO_URI=mongodb://localhost:27017/
# MONGO_DB_NAME=Reduced_Load_Approximation_Kaufman_Roberts

# Navigate to backend
cd backend

# Start Development Server
python -m main
```

Backend runs at: **http://localhost:5000**

---

### 2️⃣ Frontend Setup

Open a new terminal:

```bash
# Navigate to frontend
cd frontend

# Install dependencies
npm install

# Start development server
npm run dev
```

Frontend runs at: **http://localhost:5173**

---

## 📌 Notes

- Designed for **6G network research and simulation**
- Optimized for **high computational loads**
- Built with emphasis on **performance, accuracy, and usability**

---

<div align="center">
  <p><i>Built with precision for 6G Telecommunication Research</i></p>
</div>
