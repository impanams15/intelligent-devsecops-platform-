import numpy as np
import json

val = round(np.mean([1.0, 2.0, 3.0]), 2)
print(f"Value type: {type(val)}")
try:
    json.dumps(val)
    print("JSON serializable")
except TypeError as e:
    print(f"ERROR: {e}")
