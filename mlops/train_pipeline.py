import sys
import os
import json
import time
import pandas as pd
from pathlib import Path

# Add project root to sys.path
sys.path.append(os.path.abspath(os.path.join(os.path.dirname(__file__), "..")))

from backend.app.config import PROCESSED_DATA_PATH, DEFAULT_DATASET_PATH
from backend.app.services.data_pipeline import DataPipeline
from backend.app.services.recommendation_engine import RecommendationEngine
from backend.app.services.mlflow_tracker import MLflowTracker
from mlops.dvc_tracker import get_dvc_version_info

def run_pipeline():
    print("==================================================")
    print("SMARTBOOK AI - MLOPS AUTOMATED TRAINING PIPELINE")
    print("==================================================")
    
    pipeline = DataPipeline()
    engine = RecommendationEngine()
    tracker = MLflowTracker()
    
    # 1. Load or Preprocess Dataset
    if not PROCESSED_DATA_PATH.exists():
        print("Preprocessing dataset...")
        df_raw = pipeline.load_dataset(str(DEFAULT_DATASET_PATH))
        cleaned_df = pipeline.preprocess_dataset(df_raw)
        pipeline.save_processed_data(cleaned_df)
    else:
        print("Loading existing processed dataset parquet...")
        cleaned_df = pd.read_parquet(PROCESSED_DATA_PATH)
        
    print(f"Dataset ready with {len(cleaned_df):,} records.")
    
    # 2. Train Model
    max_features = 5000
    print(f"Training TF-IDF NearestNeighbors Model (max_features={max_features})...")
    metadata = engine.train(cleaned_df, max_features=max_features)
    
    # 3. DVC Dataset Tracking metadata
    dvc_info = get_dvc_version_info()
    metadata["dvc_version_hash"] = dvc_info["dvc_version_hash"]
    metadata["pipeline_run_timestamp"] = dvc_info["last_tracked"]
    
    # 4. Log to MLflow
    run_id = tracker.log_training_run(
        params={"max_features": max_features, "num_items": len(cleaned_df), "dvc_hash": dvc_info["dvc_version_hash"]},
        metrics={
            "precision_at_5": metadata["precision_at_5"],
            "recall_at_5": metadata["recall_at_5"],
            "train_latency_sec": metadata["train_latency_sec"]
        }
    )
    
    print("--------------------------------------------------")
    print(f"[OK] MLflow Run ID: {run_id}")
    print(f"[METRIC] Precision@5: {metadata['precision_at_5'] * 100:.1f}%")
    print(f"[METRIC] Recall@5:    {metadata['recall_at_5'] * 100:.1f}%")
    print(f"[LATENCY] Train Latency: {metadata['train_latency_sec']} seconds")
    print(f"[DVC] Version Hash: {dvc_info['dvc_version_hash']}")
    print("==================================================")
    
    return metadata

if __name__ == "__main__":
    run_pipeline()
