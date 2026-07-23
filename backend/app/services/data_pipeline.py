import pandas as pd
import numpy as np
import os
import json
from pathlib import Path
from backend.app.config import DATASETS_DIR, PROCESSED_DATA_PATH, REFERENCE_DATA_PATH, CURRENT_DATA_PATH

class DataPipeline:
    def __init__(self):
        pass

    def load_dataset(self, file_path: str) -> pd.DataFrame:
        """Loads CSV or Excel dataset dynamically."""
        path = Path(file_path)
        if not path.exists():
            raise FileNotFoundError(f"Dataset file not found at {file_path}")
        
        if path.suffix.lower() in ['.xlsx', '.xls']:
            df = pd.read_excel(path)
        elif path.suffix.lower() == '.csv':
            df = pd.read_csv(path, low_memory=False)
        else:
            raise ValueError(f"Unsupported file format: {path.suffix}")
        return df

    def analyze_dataset(self, df: pd.DataFrame) -> dict:
        """Dynamically analyzes dataset columns, types, missing values, and statistics."""
        analysis = {
            "total_rows": int(len(df)),
            "total_columns": int(len(df.columns)),
            "columns": list(df.columns),
            "dtypes": {col: str(dtype) for col, dtype in df.dtypes.items()},
            "missing_values": {col: int(count) for col, count in df.isnull().sum().items()},
            "duplicate_rows": int(df.duplicated().sum()),
            "numeric_columns": list(df.select_dtypes(include=[np.number]).columns),
            "text_columns": list(df.select_dtypes(include=['object', 'string']).columns),
            "sample_records": df.head(5).fillna("").to_dict(orient="records")
        }
        return analysis

    def preprocess_dataset(self, df: pd.DataFrame) -> pd.DataFrame:
        """Automated cleaning, missing value handling, and dynamic text feature synthesis."""
        cleaned_df = df.copy()
        
        # 1. Drop exact duplicates
        cleaned_df.drop_duplicates(inplace=True)
        
        # 2. Identify text & numeric columns
        text_cols = list(cleaned_df.select_dtypes(include=['object', 'string']).columns)
        num_cols = list(cleaned_df.select_dtypes(include=[np.number]).columns)
        
        # Impute missing values and ensure string type for text columns
        for col in text_cols:
            cleaned_df[col] = cleaned_df[col].astype(str).fillna("Unknown")

        for col in num_cols:
            cleaned_df[col] = cleaned_df[col].fillna(cleaned_df[col].median() if len(cleaned_df[col].dropna()) > 0 else 0)

        # Create normalized text field for TF-IDF indexing
        # Filter out URL columns from text synthesis
        content_cols = [col for col in text_cols if not col.lower().startswith(('image', 'url', 'link'))]
        if content_cols:
            cleaned_df['combined_features'] = cleaned_df[content_cols].apply(
                lambda row: " ".join([str(val) for val in row.values if str(val) != "Unknown"]), axis=1
            )
        else:
            cleaned_df['combined_features'] = "item_" + cleaned_df.index.astype(str)

        return cleaned_df

    def save_processed_data(self, df: pd.DataFrame):
        """Saves processed dataset as parquet and sets reference/current splits for drift monitoring."""
        df.to_parquet(PROCESSED_DATA_PATH, index=False)
        
        # Split into reference baseline and current batch for drift analysis
        n = len(df)
        split_idx = int(n * 0.7)
        reference_df = df.iloc[:split_idx]
        current_df = df.iloc[split_idx:]
        
        reference_df.to_parquet(REFERENCE_DATA_PATH, index=False)
        current_df.to_parquet(CURRENT_DATA_PATH, index=False)
        
        return {
            "processed_path": str(PROCESSED_DATA_PATH),
            "reference_size": len(reference_df),
            "current_size": len(current_df)
        }
