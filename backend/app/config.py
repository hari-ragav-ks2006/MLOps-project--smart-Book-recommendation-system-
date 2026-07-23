import os
from pathlib import Path

os.environ["MLFLOW_ALLOW_FILE_STORE"] = "true"


BASE_DIR = Path(__file__).resolve().parent.parent.parent
DATASETS_DIR = BASE_DIR / "datasets"
MODELS_DIR = BASE_DIR / "models"
ARTIFACTS_DIR = BASE_DIR / "artifacts"
MLFLOW_DIR = BASE_DIR / "mlflow"

# Create necessary directories
DATASETS_DIR.mkdir(exist_ok=True)
MODELS_DIR.mkdir(exist_ok=True)
ARTIFACTS_DIR.mkdir(exist_ok=True)
MLFLOW_DIR.mkdir(exist_ok=True)

DEFAULT_DATASET_PATH = BASE_DIR / "Booksdataset.xlsx"
PROCESSED_DATA_PATH = DATASETS_DIR / "processed_data.parquet"
REFERENCE_DATA_PATH = DATASETS_DIR / "reference_data.parquet"
CURRENT_DATA_PATH = DATASETS_DIR / "current_data.parquet"
MODEL_PATH = MODELS_DIR / "recommendation_model.joblib"
VECTORIZER_PATH = MODELS_DIR / "vectorizer.joblib"
METADATA_PATH = MODELS_DIR / "model_metadata.json"

MLFLOW_TRACKING_URI = os.getenv("MLFLOW_TRACKING_URI", f"file:///{MLFLOW_DIR.as_posix()}")
EXPERIMENT_NAME = "Smart_Product_Recommendation_System"
