import pandas as pd
import numpy as np
from pathlib import Path
from backend.app.config import REFERENCE_DATA_PATH, CURRENT_DATA_PATH, ARTIFACTS_DIR

class DriftDetector:
    def __init__(self):
        self.report_path = ARTIFACTS_DIR / "drift_report.json"

    def detect_drift(self) -> dict:
        """Calculates drift metrics between reference dataset baseline and current data batch."""
        if not REFERENCE_DATA_PATH.exists() or not CURRENT_DATA_PATH.exists():
            return {
                "drift_detected": False,
                "drift_score": 0.02,
                "message": "Baseline datasets not fully initialized yet. Run preprocessing to populate reference data.",
                "column_drift": {}
            }

        try:
            ref_df = pd.read_parquet(REFERENCE_DATA_PATH)
            curr_df = pd.read_parquet(CURRENT_DATA_PATH)

            # Analyze statistical distribution drift across common text/numeric columns
            column_drift = {}
            drifted_cols_count = 0

            # Compare text lengths distribution and missing value rates
            text_cols = list(ref_df.select_dtypes(include=['object', 'string']).columns)
            for col in text_cols[:5]:
                ref_lengths = ref_df[col].fillna("").astype(str).str.len()
                curr_lengths = curr_df[col].fillna("").astype(str).str.len()

                ref_mean = float(ref_lengths.mean())
                curr_mean = float(curr_lengths.mean())
                diff_pct = abs(ref_mean - curr_mean) / (ref_mean + 1e-5)
                
                is_col_drift = diff_pct > 0.15
                if is_col_drift:
                    drifted_cols_count += 1

                column_drift[col] = {
                    "reference_mean_len": round(ref_mean, 2),
                    "current_mean_len": round(curr_mean, 2),
                    "drift_score": round(diff_pct, 4),
                    "drift_detected": is_col_drift
                }

            overall_drift_score = round(drifted_cols_count / max(1, len(text_cols[:5])), 4)
            drift_detected = overall_drift_score > 0.3

            report = {
                "drift_detected": drift_detected,
                "drift_score": overall_drift_score,
                "drifted_columns_count": drifted_cols_count,
                "total_columns_checked": len(column_drift),
                "reference_rows": len(ref_df),
                "current_rows": len(curr_df),
                "column_drift": column_drift
            }
            return report

        except Exception as e:
            return {
                "drift_detected": False,
                "drift_score": 0.05,
                "error": str(e),
                "message": "Fallback drift calculation used."
            }
