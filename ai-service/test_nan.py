import numpy as np
import math

try:
    val = np.nan
    print(f"Rounding numpy nan: {round(val, 2)}")
except Exception as e:
    print(f"Error rounding numpy nan: {e}")

try:
    val = np.mean([])
    print(f"Mean of empty: {val}")
    print(f"Rounding mean of empty: {round(val, 2)}")
except Exception as e:
    print(f"Error rounding mean of empty: {e}")
