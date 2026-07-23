import unittest
import os
import pandas as pd
from backend.app.services.data_pipeline import DataPipeline
from backend.app.services.recommendation_engine import RecommendationEngine

def test_data_pipeline_and_training():
    pipeline = DataPipeline()
    dataset_path = "c:/Users/MD Arsheer/MLOPS Project/Booksdataset.xlsx"
    assert os.path.exists(dataset_path), "Booksdataset.xlsx should exist"
    
    # Test reading & analysis
    df = pipeline.load_dataset(dataset_path)
    assert len(df) > 0
    analysis = pipeline.analyze_dataset(df)
    assert analysis["total_rows"] == len(df)
    
    # Sample subset for fast testing
    sample_df = df.head(1000)
    cleaned_df = pipeline.preprocess_dataset(sample_df)
    assert "combined_features" in cleaned_df.columns
    
    # Test recommendation model training
    engine = RecommendationEngine()
    meta = engine.train(cleaned_df, max_features=1000)
    assert meta["num_items"] == 1000
    assert "precision_at_5" in meta
    
    # Test recommendations lookup
    rec_res = engine.recommend_by_item("Classical Mythology", k=3)
    assert rec_res["recommendations_count"] > 0
    
    user_res = engine.recommend_for_user(user_id="user_123", k=3)
    assert len(user_res["recommendations"]) == 3
