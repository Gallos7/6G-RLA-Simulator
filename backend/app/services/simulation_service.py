"""
Business Logic Layer: Simulation Orchestrator.

This service module acts as the bridge between the API routers, the database, 
and the core mathematical engine. 
"""

import sys
import os
import numpy as np

# Setup path to allow imports from the current directory
from app.db.db_manager import DBManager
from app.core import LBP as Blocking_Probability
from app.core import BPC

def run_simulation_api(data_payload):
    print("\n--- API Execution: General Analysis ---")

    # Extract inputs and configuration from payload
    inputs = data_payload["inputs"]
    config = data_payload["config"]
    
    # --- 1. BASIC PARAMETERS ---
    K = int(inputs["K"])      # Number of Services
    links = int(inputs["M"])  # Number of Links

    # --- NOISE CALCULATION ---
    noise_flag = "Yes" if inputs.get("enableNoise") else "No"

    if noise_flag == "Yes":
        mantissa = float(inputs.get("noiseMantissa", 1))
        exponent = inputs.get("noiseExponent", "06")
        noise_label = f"{int(mantissa)}e-{exponent}"
        current_noise_val = float(f"{mantissa}e-{exponent}")
    else:
        noise_label = "0"
        current_noise_val = 0.0
    
    var = config["variable"] 

    # --- RESOURCE MATRICES SETUP ---
    C = np.array(inputs["a_resource"], dtype=int).T 
    b = np.array(inputs["r_resource"], dtype=int).T
    single_load_val = float(inputs["load"])
    load = np.full((links, K), single_load_val) 

    target_value = float(config["target"])
    step = float(config["step"])
    scenario = "Web - " + config.get("variable", "Custom")


    # --- 2. DATABASE CHECK ---
    try:
        db = DBManager()
        cached_results = db.get_existing_experiment(K, links, load, b, C, var, scenario, noise_flag, noise_label, target_value, step)
    except Exception as e:
        print("⚠️ Database Error:", e)
        cached_results = None

    if cached_results:
        print("✅ Results found in Database!")
        x_range = cached_results["x_axis"]
        pb_lists = cached_results["blocking_probabilities"]

        # Reconstruct the chart data format for the Frontend (NO FLOAT NEEDED HERE)
        chart_data = []
        for i in range(len(x_range)):
            point = {"x": x_range[i]}
            for k in range(len(pb_lists)):
                key = "y" if k == 0 else f"y{k+1}" 
                point[key] = pb_lists[k][i] * 100 
            chart_data.append(point)

        return { "chart_data": chart_data, "x_label": var.upper() }

    # --- 3. NEW EXPERIMENT (SIMULATION LOOP) ---
    print("⚠️ No results found. Running new experiment...")
    try:
        db_id = db.save_config(K, links, load, b, C, scenario, var, noise_flag, noise_label, target_value, step)
    except:
        db_id = None
    
    x_axis = []
    loops_list = []
    service_results = [[] for _ in range(K)]

    if var == "antenna": current_val = C[2]
    elif var == "load": current_val = load[0][0]
    elif var == "fronthaul": current_val = C[0]
    elif var == "server": current_val = C[1]
    else: current_val = 0 

    sim_C = C.copy()
    sim_load = load.copy()

    while current_val <= target_value + (step/1000.0): 

        if noise_flag == "Yes":
            qBlock = Blocking_Probability.LBP_Noise(K, b, load, C, current_noise_val)
        else:
            qBlock = Blocking_Probability.LBP(K, b, load, C)

        linkBlockingProbs = qBlock.getL_Blocking()
        bl = BPC.BPC(K, C, linkBlockingProbs)
        blockings = bl.get_Blocking_Probabilities()

        x_axis.append(round(current_val, 2))
        loops_list.append(qBlock.getCounter())
        for i in range(K):
            service_results[i].append(blockings[i])

        match var:
            case "load":
                load += step
                current_val = load[0][0]
            case "antenna":
                for i in range(2, links): C[i] += step
                current_val = C[2]
            case "fronthaul":
                C[0] += step
                current_val = C[0]
            case "server":
                C[1] += step
                current_val = C[1]
            case _:
                print("❌ Unknown parameter!")
                break

        if current_val > target_value + 0.001:
            break

    # --- 4. FORMATTING & SAVING RESULTS (FLOAT WRAPPER APPLIED HERE) ---
    chart_data = []
    for i in range(len(x_axis)):
        point = {"x": float(x_axis[i])} # <-- Strips numpy wrapper
        for k in range(K):
            key = "y" if k == 0 else f"y{k+1}"
            point[key] = float(service_results[k][i] * 100) # <-- Strips numpy wrapper
        chart_data.append(point)

    if db_id:
        try:
            final_results_array = np.array([x_axis] + service_results + [loops_list])
            db.save_results(db_id, final_results_array, var)
        except: pass

    return { "chart_data": chart_data, "x_label": var.upper() }