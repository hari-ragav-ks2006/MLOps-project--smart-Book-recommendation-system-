import hashlib
import os
import time
from pathlib import Path
from backend.app.config import DEFAULT_DATASET_PATH, ARTIFACTS_DIR

def compute_dataset_hash(file_path: str = None) -> str:
    path = Path(file_path or DEFAULT_DATASET_PATH)
    if not path.exists():
        return "dataset_not_found"
    hasher = hashlib.md5()
    with open(path, "rb") as f:
        # Read sample block for fast hash
        buf = f.read(65536)
        hasher.update(buf)
    return hasher.hexdigest()

def get_dvc_version_info() -> dict:
    dvc_hash = compute_dataset_hash()
    return {
        "dataset_name": "Booksdataset.xlsx",
        "dvc_version_hash": dvc_hash[:12],
        "full_hash": dvc_hash,
        "last_tracked": time.strftime("%Y-%m-%d %H:%M:%S")
    }
