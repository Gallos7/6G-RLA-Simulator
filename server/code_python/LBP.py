import numpy as np
import math as m
import KRF as Kaufman

class LBP:
    """
    Link Blocking Probability (LBP) Calculator - Standard Model.
    Includes DAMPING factor to prevent oscillations under high load.
    """

    def __init__(self, K, b, t_Load, C):
        self.K = K
        self.t_Load = np.array(t_Load)
        self.b = np.array(b)
        self.C = np.array(C)
        self.links = len(self.C)
        self.counter = 0

    def getL_Blocking(self):
        Q = np.zeros((self.links, self.K))
        L = np.zeros((self.links, self.K))
        previousL = np.ones((self.links, self.K)) 
        
        # Start with 0 blocking to allow initial flow
        L.fill(0.0) 
        
        reducedTrafficLoad = np.zeros((self.links, self.K))

        # Initial Reduced Load Calculation
        survival_matrix = 1.0 - L
        for p in range(self.links):
            product_rest = np.prod(np.delete(survival_matrix, p, axis=0), axis=0)
            mask = self.b[p] > 0
            reducedTrafficLoad[p, mask] = self.t_Load[p, mask] * product_rest[mask]

        self.counter = 0
        converged = False
        
        while not converged:
            self.counter += 1
            
            # 1. Calculate Blocking for each link using KRF
            for p in range(self.links):
                kauf = Kaufman.KRF(self.C[p], self.K, self.b[p], reducedTrafficLoad[p])
                q = kauf.getQ()
                qNormalized = kauf.getQNormalized(q)
                blockingProbabilities = kauf.getBP(qNormalized)
                Q[p] = blockingProbabilities

            # 2. Update Step with DAMPING (50% old value, 50% new value)
            # This prevents the algorithm from oscillating between 0 and 1
            currentL = Q.copy()
            L = 0.5 * previousL + 0.5 * currentL

            # 3. Check Convergence
            if np.all(np.abs(previousL - L) <= 0.0001):
                converged = True
            
            previousL = L.copy()

            if converged:
                break

            # 4. Re-calculate Reduced Load
            survival_matrix = 1.0 - L
            for p in range(self.links):
                product_rest = np.prod(np.delete(survival_matrix, p, axis=0), axis=0)
                mask = self.b[p] > 0
                reducedTrafficLoad[p, mask] = self.t_Load[p, mask] * product_rest[mask]

            if self.counter > 500:
                print("Warning: Max iterations reached (Standard).")
                break
            
        return L

    def getCounter(self):
        return self.counter


class LBP_Noise:
    """
    Link Blocking Probability (LBP) Calculator - With Noise Injection.
    Includes DAMPING factor.
    """
    
    def __init__(self, K, b, t_Load, C, noise_val):
        self.K = K
        self.t_Load = np.array(t_Load)
        self.b = np.array(b)
        self.C = np.array(C)
        self.links = len(self.C)
        self.counter = 0
        self.noise_val = noise_val 

    def getL_Blocking(self):
        Q = np.zeros((self.links, self.K))
        L = np.zeros((self.links, self.K))
        previousL = np.ones((self.links, self.K)) 
        
        # Start with 0 blocking
        L.fill(0.0)
        
        reducedTrafficLoad = np.zeros((self.links, self.K))
        
        survival_matrix = 1.0 - L
        for p in range(self.links):
            product_rest = np.prod(np.delete(survival_matrix, p, axis=0), axis=0)
            mask = self.b[p] > 0
            reducedTrafficLoad[p, mask] = self.t_Load[p, mask] * product_rest[mask]

        self.counter, converged = 0, False
        
        while not converged:
            self.counter += 1

            for p in range(self.links):
                kauf = Kaufman.KRF_Noise(self.C[p], self.K, self.b[p], reducedTrafficLoad[p], self.noise_val)

                if p == 0 or p == 1:
                    q = kauf.getQ()
                    qNormalized = kauf.getQNormalized(q)
                    blockingProbabilities = kauf.getBP(qNormalized)
                else:
                    q = kauf.getQ_Local()
                    qNormalized = kauf.getQNormalized(q)
                    blockingProbabilities = kauf.getBPLocal(qNormalized)

                Q[p] = blockingProbabilities

            # --- DAMPING FIX ---
            currentL = Q.copy()
            L = 0.5 * previousL + 0.5 * currentL
            # -------------------

            if np.all(np.abs(previousL - L) <= 0.0001):
                converged = True
            
            previousL = L.copy()
            
            survival_matrix = 1.0 - L
            for p in range(self.links):
                product_rest = np.prod(np.delete(survival_matrix, p, axis=0), axis=0)
                mask = self.b[p] > 0
                reducedTrafficLoad[p, mask] = self.t_Load[p, mask] * product_rest[mask]

            if self.counter > 500:
                print("Warning: Max iterations reached (Noise).")
                break
            
        return L

    def getCounter(self):
        return self.counter