import numpy as np
import math as m

class KRF:
    """
    Standard Kaufman-Roberts Formula (KRF).
    Calculates blocking probabilities for multi-rate loss systems without external noise.
    
    Theory:
    Instead of solving the complex Markov Chain (Macro-state), KRF uses a 1D recursive relation
    to find the occupancy distribution q(j).
    
    Recursive Formula:
        j * q(j) = Sum( a_k * b_k * q(j - b_k) ) for k=1 to K
    """

    def __init__(self, C, K, b, t_Load):
        """
        Initialize the KRF calculator.

        Args:
            C (int): Total Link Capacity (in resource units).
            K (int): Number of Service Classes.
            b (array-like): Resource Requirement per service class (b_k).
            t_Load (array-like): Traffic Load (Erlang) per service class (A_k).
        """
        self.C = C
        self.K = K
        self.b = np.array(b)
        self.t_Load = np.array(t_Load)
        # q: Unnormalized state probabilities array of size C + 1
        self.q = np.zeros(self.C + 1)
        self.qNormalized = np.zeros(self.C + 1)
        self.blockingProbabilities = np.zeros(K)

    def getQ(self):
        """
        Executes the Kaufman-Roberts recursion to populate the q(j) array.
        """
        self.q[0] = 1  # Base case: Probability of 0 occupancy is proportional to 1

        for j in range(1, self.C + 1):
            for k in range(self.K):
                # Check if state j is reachable from state (j - b_k)
                if j - self.b[k] >= 0: 
                    # Apply Recursion: q(j) += A_k * b_k * q(j - b_k)
                    self.q[j] += self.t_Load[k] * self.b[k] * self.q[j - self.b[k]]
            
            # Divide by j as per the formula
            self.q[j] = self.q[j] / j

            # --- SCALE PROTECTION ---
            # Αν η τιμή ξεπεράσει το 10^150, διαιρούμε όλο τον πίνακα με 10^150.
            # Αυτό κρατάει τα νούμερα μικρά χωρίς να χαλάει την πιθανότητα (λόγω normalization).
            if self.q[j] > 1e150:
                self.q = self.q / 1e150
            # ------------------------

        return self.q
    
    def getQNormalized(self, q):
        """
        Normalizes the q array so that the sum of probabilities equals 1.
        G is the Normalization Constant (Partition Function).
        """
        G = np.sum(q)
        self.qNormalized = q / G

        return self.qNormalized
    
    def getBP(self, qNormalized):
        """
        Calculates Blocking Probability (Pb) for each service class.
        
        Logic:
        A service 'k' is blocked if the remaining capacity is less than its requirement 'b_k'.
        Pb(k) = Sum( P(j) ) for all states j where (C - j) < b_k
        """
        self.blockingProbabilities.fill(0)

        for k in range(self.K):
            # Find the starting index where blocking begins for service k
            # States from (C - b_k + 1) up to C are blocking states
            start_index = int(self.C - self.b[k] + 1)

            # Sum probabilities of all blocking states
            self.blockingProbabilities[k] = np.sum(qNormalized[start_index:])

        return self.blockingProbabilities
    
    def get_Specific_Probability(self, i, blockingProbabilities):
        """Helper to safely retrieve probability for a specific index."""
        if i >= 0 and i < len(blockingProbabilities): 
            return blockingProbabilities[i]
        return 0.0


class KRF_Noise:
    """
    Modified Kaufman-Roberts Formula with Noise Injection.
    
    This class introduces 'Thermal Noise' and 'Interference Noise' into the 
    standard recursion to simulate physical layer degradations in 6G networks.
    """

    def __init__(self, C, K, b, t_Load, noise_val):
        """
        Args:
            noise_val (float): The interference factor input by the user.
        """
        self.C = C
        self.K = K
        self.b = np.array(b)
        self.t_Load = np.array(t_Load)
        self.q = np.zeros(self.C + 1)
        self.qNormalized = np.zeros(self.C + 1)
        self.blockingProbabilities = np.zeros(K)
        # Boltzmann constant (approximate for simulation scale)
        self.kT = 1.38069 * m.pow(10, -23)
        self.noise_val = noise_val

    def Thermal_Noise(self, j):
        """Calculates Thermal Noise factor based on a Gaussian-like distribution."""
        x = 0.9
        # Avoid division by zero if j=0
        term = self.kT * j if j > 0 else 1e-9 
        return (1 / m.sqrt(2 * m.pi * m.pow(term, 2))) * m.pow(m.e, -1 * (m.pow(x, 2) / (2 * m.pow(term, 2))))

    def Inter_Noise(self, j):
        """Calculates Interference Noise proportional to system occupancy (j)."""
        P = self.noise_val 
        return P * j
    
    def Total_Noise(self, j):
        """Aggregates Thermal and Interference noise."""
        return self.Inter_Noise(j) + self.Thermal_Noise(j)
    
    def getQ(self):
        """Standard recursion (without noise) - kept for reference or fallback."""
        self.q[0] = 1

        for j in range(1, self.C + 1):
            for k in range(self.K):
                if j - self.b[k] >= 0: 
                    self.q[j] += self.t_Load[k] * self.b[k] * self.q[j - self.b[k]]
            
            self.q[j] = self.q[j] / j

        return self.q
    
    def getQ_Local(self):
        """
        Modified Recursion:
        Injects the (1 - Total_Noise) factor into the transition probability.
        This effectively reduces the probability of entering higher states due to noise.
        """
        self.q[0] = 1

        for j in range(1, self.C + 1):
            for k in range(self.K):

                if j - self.b[k] > 0: 
                    # Apply noise penalty to the recursion term
                    noise_factor = 1 - self.Total_Noise(j - self.b[k])
                    self.q[j] += noise_factor * self.t_Load[k] * self.b[k] * self.q[j - self.b[k]]
                
                elif j - self.b[k] == 0:
                    self.q[j] += self.t_Load[k] * self.b[k] * self.q[j - self.b[k]]
            
            self.q[j] /= j

            # --- SCALE PROTECTION ---
            if self.q[j] > 1e150:
                self.q = self.q / 1e150
            # ------------------------

        return self.q
    
    def getQNormalized(self, q):
        G = np.sum(q)
        self.qNormalized = q / G
        return self.qNormalized
    
    def getBP(self, qNormalized):
        """Standard blocking probability summation."""
        self.blockingProbabilities.fill(0)

        for k in range(self.K):
            start_index = max(0, int(self.C - self.b[k] + 1))
            self.blockingProbabilities[k] = np.sum(qNormalized[start_index:])

        return self.blockingProbabilities
    

    def getBPLocal(self, qNormalized):
        """
        Modified Blocking Probability calculation.
        Adds a noise-induced blocking term to the standard capacity blocking.
        
        Formula Concept:
        BP = (Capacity Blocking) + (Noise Induced Blocking)
        """
        self.blockingProbabilities.fill(0)

        for k in range(self.K):
            # 1. Capacity Blocking (Standard Erlang B condition)
            start_cap = max(0, int(self.C - self.b[k] + 1))
            sum_capacity = np.sum(qNormalized[start_cap:])
            
            # 2. Noise Blocking (Sum of Prob(j) * Noise(j))
            end_noise = int(self.C - self.b[k])
            sum_noise = 0.0
            
            for j in range(1, end_noise + 1):
                sum_noise +=  qNormalized[j] * self.Total_Noise(j)

            self.blockingProbabilities[k] = sum_capacity + sum_noise

        return self.blockingProbabilities
    
    def get_Specific_Probability(self, i, blockingProbabilities):
        if i >= 0 and i < len(blockingProbabilities): 
            return blockingProbabilities[i]
        return 0.0