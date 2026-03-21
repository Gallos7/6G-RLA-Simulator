"""
Presentation Layer: Simulation API Router.

This module defines the RESTful endpoints for the simulation engine. 
It strictly handles HTTP requests, payload extraction, and JSON responses.
All heavy computational tasks and database logic are delegated to the 
underlying Service Layer (simulation_service.py) to ensure separation of concerns.
"""

from flask import Blueprint, request, jsonify
from pymongo import MongoClient
import datetime
import os
from dotenv import load_dotenv

from app.services.simulation_service import run_simulation_api

simulation_router = Blueprint('simulation', __name__)

# Load the environment variables
load_dotenv()

# --- DATABASE CONNECTION (MONGODB - HISTORY) ---
try:
    mongo_uri = os.getenv("MONGO_URI", "mongodb://localhost:27017/")
    client = MongoClient(mongo_uri)
    db = client['6g_simulator_db']  
    history_collection = db['history']  
    print("✅ Router connected to MongoDB successfully via .env!")
except Exception as e:
    print(f"❌ Failed to connect to MongoDB: {e}")

@simulation_router.route('/run_simulation', methods=['POST'])
def run_simulation():
    """
    Endpoint: /run_simulation
    Method: POST
    """
    data = request.json
    print("📥 Received Data:", data) 

    try:
        # 1. EXECUTE SIMULATION (Calling the Service)
        results = run_simulation_api(data)

        # 2. SAVE TO HISTORY 
        try:
            history_item = {
                "timestamp": datetime.datetime.now().isoformat(),
                "scenario": data.get('scenario', 'custom'),
                "variable": data.get('config', {}).get('variable', 'unknown'),
                "target": data.get('config', {}).get('target', 0),
                "step": data.get('config', {}).get('step', 0),
                "inputs": data.get('inputs', {}),
                "config": data.get('config', {}),
                "results": results  
            }
            history_collection.insert_one(history_item)
            print("💾 Simulation saved to History.")
        except Exception as db_error:
            print(f"⚠️ Warning: Could not save to DB: {db_error}")

        # 3. RETURN RESULTS
        return jsonify(results)
        
    except Exception as e:
        print("❌ Error during simulation:", e)
        return jsonify({"error": str(e)}), 500

@simulation_router.route('/api/history', methods=['GET'])
def get_history():
    """
    Endpoint: /api/history
    Method: GET
    """
    try:
        history = list(history_collection.find({}, {'_id': 0}).sort('timestamp', -1).limit(20))
        return jsonify(history), 200
    except Exception as e:
        print(f"❌ Error fetching history: {e}")
        return jsonify({"error": str(e)}), 500