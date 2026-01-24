from pymongo import MongoClient
from datetime import datetime
import numpy as np

class DBManager:
    """
    Database Manager Class.
    Handles all interactions with the MongoDB database using the 'pymongo' driver.
    
    Architecture:
    The database consists of two separate collections to optimize storage and retrieval:
    1. Experiments_Config: Stores the input parameters (Topology, Load, Matrix) and Scenario metadata.
    2. Experiment_Data: Stores the calculated results (X-Axis, Blocking Probabilities, Loops).
    
    This separation allows efficiently querying for existing configurations without loading heavy result datasets.
    """

    def __init__(self):
        """
        Initialize the database connection.
        Connects to the local MongoDB instance on port 27017.
        """
        try:
            self.conn = MongoClient("localhost", 27017)
            print("✅ DBManager Connected successfully!")
        except Exception as e:
            print("❌ Could not connect to MongoDB:", e)

        self.db = self.conn["Reduced_Load_Approximation_Kaufman_Roberts"]
        self.configs_col = self.db["Experiments_Config"]
        self.results_col = self.db["Experiment_Data"]


    def save_config(self, K: int, links: int, load: np.ndarray, b: np.ndarray, C: np.ndarray, scenario: str, var: str, noise_flag: str, noise_label, target_value, step_size):
        """
        Saves the experiment configuration parameters to the 'Experiments_Config' collection.
        Returns the inserted document ID (ObjectId) to link it with results later.
        """
        # 1. Convert Numpy Arrays to Python Lists (Required for MongoDB BSON serialization)
        # Use type checking to avoid errors if inputs are already lists
        clean_load = load.tolist() if isinstance(load, np.ndarray) else load
        clean_b = b.tolist() if isinstance(b, np.ndarray) else b
        clean_C = C.tolist() if isinstance(C, np.ndarray) else C
        

        record = {
            "timestamp": datetime.now(),
            "description": "Guided Scenario - " + scenario,
            "variable_param": var,

            "inputs": {
                "K": K,
                "M": links,
                "topology": "Server-Fronthaul-Antennas",
                "Local_Noise": noise_flag,      # Stores "Yes" / "No"
                "Noise_Value": noise_label,     # Stores the value string (e.g., "1.0e-6" or "Variable")
                "C": clean_C,
                "b": clean_b,
                "load": clean_load,

                "simulation_limits": {      
                    "target_value": target_value,    
                    "step_size": step_size          
                }
            }
        }

        result = self.configs_col.insert_one(record)
        return result.inserted_id
        

    def save_results(self, config_id: str, results_data: np.ndarray, var: str):
        """
        Saves the simulation results to the 'Experiment_Data' collection.
        Links the results to the configuration via 'config_id'.
        """
        data_list = results_data.tolist() if isinstance(results_data, np.ndarray) else results_data

        # Dynamic Data Splitting
        x_axis = data_list[0]       # First row: X-Axis values
        loops = data_list[-1]       # Last row: Iteration counts (Loops)
        pbs = data_list[1:-1]       # Middle rows: Service Blocking Probabilities

        results_dict = {
            "x_axis": x_axis,
            "loops": loops,
            "blocking_probabilities": pbs
        }


        record = {
            "config_id": config_id,
            "variable_param": var,
            "results": results_dict
        }

        self.results_col.insert_one(record)
        print(f"✅ Results saved for Config ID: {config_id}")


    def get_existing_experiment(self, K: int, links: int, load: np.ndarray, b: np.ndarray, C: np.ndarray, var: str, scenario: str, noise_flag: str, noise_label, target_value, step_size):
        """
        Checks the database for an exact match of the experiment parameters (Cache Hit).
        If found, returns the cached results, avoiding re-calculation.
        """
        clean_load = load.tolist() if isinstance(load, np.ndarray) else load
        clean_b = b.tolist() if isinstance(b, np.ndarray) else b
        clean_C = C.tolist() if isinstance(C, np.ndarray) else C
        
        # Construct the query to match all input parameters
        myquery = {
            "description": "Guided Scenario - " + scenario,
            "variable_param": var,
            
            "inputs": {
                "K": K,
                "M": links,
                "topology": "Server-Fronthaul-Antennas",
                "Local_Noise": noise_flag,    
                "Noise_Value": noise_label,   
                "C": clean_C,
                "b": clean_b,
                "load": clean_load,

                "simulation_limits": {      
                    "target_value": target_value,    
                    "step_size": step_size          
                }
            }
        }

        existing_config = self.configs_col.find_one(myquery)

        if existing_config:
            # print("found")

            config_id = existing_config["_id"]
            results_doc = self.results_col.find_one({"config_id": config_id})
            
            if results_doc:
                # print("✅ Found cached results in DB!")
                return results_doc["results"] # Return cached data
            else:
                return None # Config exists but results are missing (e.g., partial crash)
        else:
            return None # No match found