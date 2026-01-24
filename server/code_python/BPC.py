import numpy as np

class BPC:
    """
    Blocking Probability Calculator (BPC).
    
    This class is responsible for aggregating the link-level blocking probabilities
    into a final End-to-End Blocking Probability for each service class.
    
    Mathematical Principle:
    It assumes that blocking events on different links are statistically independent.
    Therefore, the probability of a service succeeding (survival) across the entire path
    is the product of the survival probabilities of each individual link.
    
    Formula:
        P_success(k) = Π (1 - B_lj)  for all links j
        P_blocking(k) = 1 - P_success(k)
    """

    def __init__(self, K, C, L):
        """
        Initialize the calculator.

        Args:
            K (int): Number of Service Classes.
            C (array-like): Capacity Vector (Total channels per link).
            L (numpy.ndarray): Link Blocking Probability Matrix (Rows=Links, Cols=Services).
                               Represents the probability that a specific link blocks a specific service.
        """
        self.C = np.array(C)        # Capacity vector (though strictly not needed for this aggregation step)
        self.K = K                  # Number of services (int)
        self.L = np.array(L)        # Matrix of Blocking probabilities per Link and Service (2D array)
        self.blockingProbabilities = np.zeros(self.K)

    def get_Blocking_Probabilities(self):
        """
        Performs the End-to-End calculation using Vectorization.
        
        Returns:
            numpy.ndarray: An array of size K containing the total blocking probability for each service.
        """
        
        # Step 1: Calculate the Survival Probability for each element in the matrix.
        # Survival = 1 - Blocking Probability
        survival_probs = 1.0 - self.L

        # Step 2: Multiply the survival probabilities along the path (all links).
        # We calculate the product down the columns (axis=0), i.e., across all links for each service.
        # Result is the Total Survival Probability for the service.
        total_survival_probs = np.prod(survival_probs, axis=0)

        # Step 3: Calculate the Final Blocking Probability.
        # Blocking = 1 - Total Survival Probability
        self.blockingProbabilities = 1.0 - total_survival_probs

        return self.blockingProbabilities