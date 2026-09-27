"""
admin_endpoints.py
All /api/admin/* routes for book ingestion, pipeline control, and audit log.
"""
from __future__ import annotations

import io
import json
from typing import Any, Dict, List, Optional

import pandas as pd
from fastapi import APIRouter, BackgroundTasks, HTTPException, UploadFile, File
from pydantic import BaseModel, field_validator

from backend.app.services.book_ingestion_service import (
    BookIngestionService, normalize_book_payload
)
from backend.app.services.mlops_pipeline_service import MLOpsPipelineService
from backend.app.config import DATASETS_DIR

admin_router = APIRouter(prefix="/admin")

ingestion_svc = BookIngestionService()
pipeline_svc = MLOpsPipelineService()

AUDIT_LOG_PATH = DATASETS_DIR / "audit_log.json"
VERSIONS_PATH = DATASETS_DIR / "book_versions.json"
RECENT_ACTIVITY_PATH = DATASETS_DIR / "recent_activity.json"

# ──────────────────────────────────────────────
# Pydantic Schemas
# ──────────────────────────────────────────────

class BookPayload(BaseModel):
    title: Optional[str] = None
    author: Optional[str] = None
    isbn: Optional[str] = None
    isbn_10: Optional[str] = None
    isbn_13: Optional[str] = None
    publisher: Optional[str] = None
    publication_year: Optional[str] = None
    genre: Optional[str] = None
    description: Optional[str] = None
    language: Optional[str] = None
    cover_image_url: Optional[str] = None
    open_library_id: Optional[str] = None
    # allow extras
    model_config = {"extra": "allow"}

    @field_validator("publication_year", mode="before")
    @classmethod
    def coerce_year(cls, v):
        return str(v) if v is not None else None


class UpdateBookPayload(BaseModel):
    row_index: int
    updates: Dict[str, Any]
    author: Optional[str] = "admin"


class BulkExecutePayload(BaseModel):
    preview_result: Dict[str, Any]
    author: Optional[str] = "admin"


# ──────────────────────────────────────────────
# Helper: record recent activity
# ──────────────────────────────────────────────

def _record_activity(status: str, book: dict, operation: str, changed_fields: list = None):
    """Save to recent_activity.json for the frontend Recent Activity section."""
    from datetime import datetime, timezone
    import time

    activity = []
    if RECENT_ACTIVITY_PATH.exists():
        try:
            activity = json.loads(RECENT_ACTIVITY_PATH.read_text(encoding="utf-8"))
        except Exception:
            pass

    entry = {
        "id": str(int(time.time() * 1000)),
        "operation": operation,   # "NEW" | "UPDATED" | "NO_CHANGE"
        "status": status,
        "timestamp": datetime.now(timezone.utc).isoformat(),
        "book": {
            "ISBN": book.get("ISBN") or book.get("isbn") or "",
            "Book-Title": book.get("Book-Title") or book.get("title") or "",
            "Book-Author": book.get("Book-Author") or book.get("author") or "",
            "Publisher": book.get("Publisher") or book.get("publisher") or "",
            "Year-Of-Publication": book.get("Year-Of-Publication") or book.get("publication_year") or "",
            "Image-URL-L": book.get("Image-URL-L") or book.get("cover_image_url") or "",
            "Image-URL-M": book.get("Image-URL-M") or "",
        },
        "changed_fields": changed_fields or [],
    }
    activity.insert(0, entry)
    # Keep last 100 entries
    RECENT_ACTIVITY_PATH.write_text(
        json.dumps(activity[:100], ensure_ascii=False, indent=2), encoding="utf-8"
    )


# ──────────────────────────────────────────────
# BOOK INGESTION ENDPOINTS
# ──────────────────────────────────────────────

@admin_router.post("/books/check")
def check_book(payload: BookPayload):
    """
    Classify a book without mutating anything.
    Returns: NEW | NO_CHANGE | EXISTING_CHANGED + field diff.
    """
    raw = payload.model_dump(exclude_none=False)
    result = ingestion_svc.check_book(raw)
    return result


@admin_router.post("/books")
def add_new_book(payload: BookPayload, background_tasks: BackgroundTasks):
    """
    Insert a new book. Runs duplicate check first.
    Triggers ML pipeline rebuild in background if insertion succeeds.
    """
    raw = payload.model_dump(exclude_none=False)
    result = ingestion_svc.insert_book(raw, author="admin")

    if not result.get("success"):
        raise HTTPException(status_code=409, detail=result.get("error", "Duplicate detected"))

    norm = normalize_book_payload(raw)
    _record_activity("SUCCESS", norm, "NEW")

    if result.get("ml_pipeline_required"):
        background_tasks.add_task(
            _run_pipeline_bg,
            "new_book_ingestion", 1, 0, ["Book-Title", "Book-Author"]
        )

    return result


@admin_router.patch("/books/{row_index}")
def update_book(row_index: int, payload: BookPayload, background_tasks: BackgroundTasks):
    """
    Partially update an existing book by its dataset row index.
    Only changed fields are written. ML pipeline triggered if needed.
    """
    raw = payload.model_dump(exclude_none=False)
    result = ingestion_svc.update_book(row_index, raw, author="admin")

    if not result.get("success"):
        status_code = 400 if result.get("status") == "NO_CHANGE" else 422
        raise HTTPException(status_code=status_code, detail=result.get("message", "Update failed"))

    norm = normalize_book_payload(raw)
    changed = [c["field"] for c in result.get("changed_fields", [])]
    _record_activity("SUCCESS", norm, "UPDATED", changed_fields=changed)

    if result.get("ml_pipeline_required"):
        background_tasks.add_task(
            _run_pipeline_bg,
            "book_update", 0, 1, changed
        )

    return result


@admin_router.get("/books/{book_id}")
def get_admin_book_detail(book_id: str):
    """Returns book record + version history for admin review."""
    df = ingestion_svc.get_df()
    match = df[df["ISBN"].astype(str) == book_id] if "ISBN" in df.columns else pd.DataFrame()
    if match.empty and "Book-Title" in df.columns:
        match = df[df["Book-Title"].astype(str).str.lower() == book_id.lower()]
    if match.empty:
        raise HTTPException(status_code=404, detail=f"Book '{book_id}' not found")

    row_index = int(match.index[0])
    record = ingestion_svc._clean(match.iloc[0].to_dict())
    history = ingestion_svc.get_book_history(book_id)

    return {
        "book": record,
        "row_index": row_index,
        "version_count": len(history),
        "history": history,
    }


@admin_router.get("/books/{book_id}/history")
def get_book_history(book_id: str):
    """Returns full version history for a book."""
    history = ingestion_svc.get_book_history(book_id)
    return {"book_id": book_id, "history": history, "total_versions": len(history)}


# ──────────────────────────────────────────────
# BULK INGESTION
# ──────────────────────────────────────────────

@admin_router.post("/books/bulk/preview")
async def preview_bulk_upload(file: UploadFile = File(...)):
    """
    Parse and preview a CSV upload.
    Classifies each row: NEW | UPDATED | NO_CHANGE | INVALID.
    Does NOT mutate data.
    """
    if not file.filename.endswith(".csv"):
        raise HTTPException(status_code=400, detail="Only CSV files are supported for bulk upload.")

    content = await file.read()
    try:
        df = pd.read_csv(io.BytesIO(content), low_memory=False)
    except Exception as exc:
        raise HTTPException(status_code=400, detail=f"CSV parse error: {exc}")

    # Normalise column names: strip whitespace
    df.columns = [c.strip() for c in df.columns]
    rows = df.fillna("").to_dict(orient="records")

    if len(rows) == 0:
        raise HTTPException(status_code=400, detail="CSV file is empty.")
    if len(rows) > 5000:
        raise HTTPException(status_code=400, detail="Max 5000 rows per bulk upload.")

    result = ingestion_svc.preview_bulk(rows)
    # Strip internal keys before returning
    result.pop("_new_raw", None)
    result.pop("_updated_raw", None)
    return result


@admin_router.post("/books/bulk/execute")
def execute_bulk_upload(payload: BulkExecutePayload, background_tasks: BackgroundTasks):
    """Execute a previously previewed bulk import."""
    result = ingestion_svc.execute_bulk(payload.preview_result, author=payload.author or "admin")

    if result.get("ml_pipeline_required"):
        background_tasks.add_task(
            _run_pipeline_bg,
            "bulk_ingestion",
            result.get("inserted", 0),
            result.get("updated", 0),
            []
        )

    return result


# ──────────────────────────────────────────────
# PIPELINE STATUS
# ──────────────────────────────────────────────

@admin_router.get("/pipeline/status")
def get_pipeline_status():
    """Returns the last 10 pipeline runs with step-level details."""
    return pipeline_svc.get_pipeline_status()


@admin_router.get("/pipeline/{run_id}")
def get_pipeline_run(run_id: str):
    """Returns details for a specific pipeline run."""
    return pipeline_svc.get_pipeline_status(run_id)


@admin_router.post("/pipeline/trigger")
def trigger_pipeline(background_tasks: BackgroundTasks):
    """Manually trigger the full ML pipeline rebuild."""
    background_tasks.add_task(
        _run_pipeline_bg, "manual_trigger", 0, 0, []
    )
    return {"status": "TRIGGERED", "message": "Pipeline rebuild started in background."}


# ──────────────────────────────────────────────
# AUDIT LOG & RECENT ACTIVITY
# ──────────────────────────────────────────────

@admin_router.get("/audit-log")
def get_audit_log(limit: int = 50):
    """Returns recent admin operation audit log entries."""
    log = ingestion_svc.get_audit_log(limit=limit)
    return {"audit_log": log, "total": len(log)}


@admin_router.get("/recent-activity")
def get_recent_activity(limit: int = 20):
    """
    Returns recently added / updated books for display on the main site.
    Consumed by the 'Recent Catalog Activity' section on the frontend.
    """
    activity = []
    if RECENT_ACTIVITY_PATH.exists():
        try:
            activity = json.loads(RECENT_ACTIVITY_PATH.read_text(encoding="utf-8"))
        except Exception:
            pass
    return {
        "activity": activity[:limit],
        "total": len(activity),
    }


# ──────────────────────────────────────────────
# Background helper
# ──────────────────────────────────────────────

def _run_pipeline_bg(
    trigger_reason: str,
    num_new: int,
    num_updated: int,
    changed_fields: list,
):
    """Background task: runs full pipeline and stores result."""
    pipeline_svc.run_full_pipeline(
        trigger_reason=trigger_reason,
        num_new_books=num_new,
        num_updated_books=num_updated,
        changed_fields=changed_fields,
        max_features=5000,
    )
