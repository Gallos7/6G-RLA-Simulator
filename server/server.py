"""
Backend API Server (Flask).
Acts as the bridge between the React Frontend and the core Scientific Simulation Logic.

Responsibilities:
1. API Gateway: Exposes REST endpoints ('/run_simulation', '/api/history') for the UI.
2. Logic Orchestrator: Receives inputs, calls the 'run_simulation_api' runner, and returns results.
3. Database Manager: Handles connections to MongoDB to persist simulation history (Inputs + Results).

Thesis Context:
This module implements a microservice-like architecture where the presentation layer (Frontend)
is decoupled from the computation layer (Backend), allowing for scalability and independent development.
"""

from flask import Flask, request, jsonify
from flask_cors import CORS
from pymongo import MongoClient
import sys
import os
import datetime

# Add the General_Analysis directory to the system path to allow module imports
sys.path.append(os.path.join(os.path.dirname(__file__), 'code_python'))

# IMPORT SIMULATION RUNNER
from code_python.main import run_simulation_api

app = Flask(__name__)
CORS(app)  # Enable Cross-Origin Resource Sharing for React communication

# --- 1. DATABASE CONNECTION (MONGODB) ---
# Ensure pymongo is installed via: pip install pymongo
try:
    # Connect to local MongoDB instance (Port 27017)
    client = MongoClient('mongodb://localhost:27017/')
    db = client['6g_simulator_db']  # Database Name
    history_collection = db['history']  # Collection (Table) Name
    print("✅ Connected to MongoDB successfully!")
except Exception as e:
    print(f"❌ Failed to connect to MongoDB: {e}")
    # If connection fails, the app continues running without history saving capabilities.


@app.route('/run_simulation', methods=['POST'])
def run_simulation():
    """
    Endpoint: /run_simulation
    Method: POST
    
    Description:
    The primary execution trigger. It accepts simulation parameters from the Frontend,
    executes the Erlang B logic, saves the run to the database, and returns the results.
    
    Process Flow:
    1. Parse JSON inputs.
    2. Invoke 'run_simulation_api'.
    3. Construct a history record (Timestamp + Inputs + Config + Results).
    4. Persist to MongoDB.
    5. Return JSON response to Client.
    """
    # Receive the full payload from the React Frontend
    data = request.json
    print("📥 Received Data:", data) 

    try:
        # 1. EXECUTE SIMULATION (Core Logic Wrapper)
        results = run_simulation_api(data)

        # 2. SAVE TO HISTORY (Database Integration)
        try:
            # Construct the history record object
            history_item = {
                "timestamp": datetime.datetime.now().isoformat(),
                "scenario": data.get('scenario', 'custom'),
                "variable": data.get('config', {}).get('variable', 'unknown'),
                "target": data.get('config', {}).get('target', 0),
                "step": data.get('config', {}).get('step', 0),
                "inputs": data.get('inputs', {}),
                "config": data.get('config', {}),
                "results": results  # Store results as well for instant preview/caching
            }
            
            # Insert record into database
            history_collection.insert_one(history_item)
            print("💾 Simulation saved to History.")
            
        except Exception as db_error:
            # Log DB errors without crashing the main application flow (Fail-safe)
            print(f"⚠️ Warning: Could not save to DB: {db_error}")

        # 3. RETURN RESULTS TO CLIENT
        return jsonify(results)
        
    except Exception as e:
        print("❌ Error during simulation:", e)
        return jsonify({"error": str(e)}), 500


# --- HISTORY API ENDPOINT ---
@app.route('/api/history', methods=['GET'])
def get_history():
    """
    Endpoint: /api/history
    Method: GET
    
    Description:
    Retrieves past simulation records for the History Drawer UI.
    Fetches the last 20 entries, sorted by most recent first.
    """
    try:
        # Retrieve the last 20 experiments, sorted by timestamp descending
        # Exclude '_id' field as MongoDB ObjectId is not directly JSON serializable
        history = list(history_collection.find({}, {'_id': 0}).sort('timestamp', -1).limit(20))
        
        return jsonify(history), 200
    except Exception as e:
        print(f"❌ Error fetching history: {e}")
        return jsonify({"error": str(e)}), 500

if __name__ == '__main__':
    print("🚀 Server running on http://localhost:5000")
    app.run(debug=True, port=5000)