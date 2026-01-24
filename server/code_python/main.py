import sys
import os
import numpy as np

# Setup path to allow imports from the current directory
current_dir = os.path.dirname(os.path.abspath(__file__))
sys.path.append(current_dir)

from db_manager import DBManager
import LBP as Blocking_Probability
import BPC


def run_simulation_api(data_payload):
    """
    Main Execution Entry Point for the API.
    
    This function acts as the Orchestrator for the simulation. It receives the raw JSON 
    payload from the Frontend, configures the mathematical models, checks the database 
    for cached results, and if necessary, runs the iterative simulation loop.
    
    Args:
        data_payload (dict): The JSON object sent by the React client containing 
                             'inputs' (Topology, Load) and 'config' (Experiment controls).
                             
    Returns:
        dict: A dictionary containing 'chart_data' (formatted for Recharts) and 'x_label'.
    """
    print("\n--- API Execution: General Analysis ---")

    # Extract inputs and configuration from payload
    inputs = data_payload["inputs"]
    config = data_payload["config"]
    
    
    # --- 1. BASIC PARAMETERS ---
    K = int(inputs["K"])      # Number of Services
    links = int(inputs["M"])  # Number of Links

    # --- NOISE CALCULATION ---
    # Determine if noise is enabled and parse the scientific notation values
    noise_flag = "Yes" if inputs.get("enableNoise") else "No"

    if noise_flag == "Yes":
        mantissa = float(inputs.get("noiseMantissa", 1))
        exponent = inputs.get("noiseExponent", "06")

        # Create a label for the database (e.g., "5e-06")
        noise_label = f"{int(mantissa)}e-{exponent}"

        # Calculate the actual float value for the simulation
        # e.g., 5 * 10^-6 = 0.000005
        current_noise_val = float(f"{mantissa}e-{exponent}")
    else:
        noise_label = "0"
        current_noise_val = 0.0
    
    var = config["variable"] # The independent variable (X-Axis)

    # --- RESOURCE MATRICES SETUP ---
    # Transpose (.T) is necessary because the UI sends arrays as [Rows=Links], 
    # but the LBP logic expects [Rows=Links] as well (Wait, check numpy structure).
    # Actually, standard python arrays need conversion to numpy for Transpose operations.
    C = np.array(inputs["a_resource"], dtype=int).T 
    b = np.array(inputs["r_resource"], dtype=int).T
    single_load_val = float(inputs["load"])
    load = np.full((links, K), single_load_val) # Initialize Load Matrix


    # Limits for the Simulation Loop
    target_value = float(config["target"])
    step = float(config["step"])
    scenario = "Web - " + config.get("variable", "Custom")


    # --- 2. DATABASE CHECK ---
    # Before running heavy calculations, check if this exact experiment exists in MongoDB.
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

        # Reconstruct the chart data format for the Frontend
        chart_data = []
        for i in range(len(x_range)):
            point = {"x": x_range[i]}
            for k in range(len(pb_lists)):
                key = "y" if k == 0 else f"y{k+1}" 
                point[key] = pb_lists[k][i] * 100 # Convert to Percentage
            chart_data.append(point)

        return { "chart_data": chart_data, "x_label": var.upper() }

    # --- 3. NEW EXPERIMENT (SIMULATION LOOP) ---
    print("⚠️ No results found. Running new experiment...")
    try:
        # Save the experiment configuration first (Metadata)
        db_id = db.save_config(K, links, load, b, C, scenario, var, noise_flag, noise_label, target_value, step)
    except:
        db_id = None
    
    # Initialize Result Containers
    x_axis = []
    loops_list = []
    service_results = [[] for _ in range(K)]

    # Initialize Loop Control Variable based on the selected parameter
    if var == "antenna": current_val = C[2]
    elif var == "load": current_val = load[0][0]
    elif var == "fronthaul": current_val = C[0]
    elif var == "server": current_val = C[1]
    else: current_val = 0 # Fallback

    sim_C = C.copy()
    sim_load = load.copy()

    # --- UNIFIED SIMULATION LOOP (Handles both Noise and No-Noise cases) ---
    # We add a small epsilon (step/1000.0) to target_value to avoid floating point comparison issues.
    while current_val <= target_value + (step/1000.0): 

        # Dynamic Solver Selection: Choose the appropriate class based on noise flag
        if noise_flag == "Yes":
            qBlock = Blocking_Probability.LBP_Noise(K, b, load, C, current_noise_val)
        else:
            qBlock = Blocking_Probability.LBP(K, b, load, C)

        # Common Calculations
        # 1. Calculate Link Blocking Probabilities (Iterative RLA)
        linkBlockingProbs = qBlock.getL_Blocking()
        
        # 2. Calculate End-to-End Blocking Probabilities (BPC)
        bl = BPC.BPC(K, C, linkBlockingProbs)
        blockings = bl.get_Blocking_Probabilities()

        # Store Results for this iteration
        x_axis.append(round(current_val, 2))
        loops_list.append(qBlock.getCounter())
        for i in range(K):
            service_results[i].append(blockings[i])

        # Increment the Independent Variable for the next iteration
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

        # Safety Break: Prevent infinite loops if logic fails
        if current_val > target_value + 0.001:
            break

    # --- 4. FORMATTING & SAVING RESULTS ---
    
    # Format data for Recharts (Array of Objects)
    chart_data = []
    for i in range(len(x_axis)):
        point = {"x": x_axis[i]}
        for k in range(K):
            key = "y" if k == 0 else f"y{k+1}"
            point[key] = service_results[k][i] * 100 # Convert to %
        chart_data.append(point)

    # Save the computed results to the database (linked to the config ID)
    if db_id:
        try:
            final_results_array = np.array([x_axis] + service_results + [loops_list])
            db.save_results(db_id, final_results_array, var)
        except: pass

    return { "chart_data": chart_data, "x_label": var.upper() }