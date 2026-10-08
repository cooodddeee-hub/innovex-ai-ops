import math
import numpy as np
import pandas as pd

def sanitize_for_json(obj):
    """
    Recursively converts numpy/pandas types and NaN/Inf values into standard JSON-serializable Python types.
    """
    if obj is None:
        return None
    if isinstance(obj, (int, str, bool)):
        return obj
    if isinstance(obj, (float, np.floating)):
        val = float(obj)
        if math.isnan(val) or math.isinf(val):
            return 0.0
        return val
    if isinstance(obj, (np.integer, np.int64, np.int32, np.int16, np.int8)):
        return int(obj)
    if isinstance(obj, (np.bool_)):
        return bool(obj)
    if isinstance(obj, (np.ndarray, list, tuple)):
        return [sanitize_for_json(item) for item in obj]
    if isinstance(obj, dict):
        return {str(k): sanitize_for_json(v) for k, v in obj.items()}
    if pd.isna(obj):
        return None
    return str(obj)
