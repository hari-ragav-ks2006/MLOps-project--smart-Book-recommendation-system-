"""
book_ingestion_service.py
Central service for book duplicate detection, field diffing,
version history, and dataset mutation.
"""
from __future__ import annotations

import json
import re
import uuid
import time
import hashlib
from datetime import datetime, timezone
from pathlib import Path
from typing import Optional

import numpy as np
import pandas as pd

from backend.app.config import (
    PROCESSED_DATA_PATH,
    REFERENCE_DATA_PATH,
    CURRENT_DATA_PATH,
    DATASETS_DIR,
)

# ──────────────────────────────────────────────
# Storage paths (all JSON sidecars alongside parquet)
# ──────────────────────────────────────────────
VERSIONS_PATH: Path = DATASETS_DIR / "book_versions.json"
AUDIT_LOG_PATH: Path = DATASETS_DIR / "audit_log.json"

# ──────────────────────────────────────────────
# Field Classification
# ──────────────────────────────────────────────
ML_RELEVANT_FIELDS = {
    "Book-Title", "Book-Author", "Publisher", "Year-Of-Publication",
    "Genre", "Description", "Language"
}
DISPLAY_ONLY_FIELDS = {
    "Image-URL-S", "Image-URL-M", "Image-URL-L",
    "cover_url", "open_library_id"
}
IDENTITY_FIELDS = {"ISBN", "ISBN-13", "ISBN-10"}


def _now() -> str:
    return datetime.now(timezone.utc).isoformat()


def _load_json(path: Path, default) -> dict | list:
    if path.exists():
        try:
            return json.loads(path.read_text(encoding="utf-8"))
        except Exception:
            pass
    return default


def _save_json(path: Path, data) -> None:
    path.write_text(json.dumps(data, ensure_ascii=False, indent=2), encoding="utf-8")


# ──────────────────────────────────────────────
# Normalization helpers
# ──────────────────────────────────────────────

def normalize_isbn(raw: str) -> str:
    """Strip hyphens, whitespace; return digits only (or X for ISBN-10 check digit)."""
    if not raw:
        return ""
    cleaned = re.sub(r"[\s\-]", "", str(raw).strip().upper())
    return cleaned


def normalize_text(val: str) -> str:
    if not val:
        return ""
    return " ".join(str(val).strip().split()).lower()


def normalize_year(val) -> str:
    if not val:
        return ""
    s = str(val).strip()
    m = re.match(r"(\d{4})", s)
    return m.group(1) if m else ""


def composite_identity(title: str, author: str, year: str) -> str:
    """Fallback identity hash from normalized title + author + year."""
    key = f"{normalize_text(title)}||{normalize_text(author)}||{normalize_year(year)}"
    return hashlib.md5(key.encode()).hexdigest()


# ──────────────────────────────────────────────
# Duplicate Detection
# ──────────────────────────────────────────────

class DuplicateResult:
    def __init__(
        self,
        status: str,          # "NEW" | "EXISTING" | "NO_CHANGE"
        existing_row: Optional[dict] = None,
        matched_by: Optional[str] = None,
        row_index: Optional[int] = None,
    ):
        self.status = status
        self.existing_row = existing_row
        self.matched_by = matched_by
        self.row_index = row_index


def check_duplicate(df: pd.DataFrame, book: dict) -> DuplicateResult:
    """
    Priority:
    1. ISBN-13
    2. ISBN-10 / ISBN
    3. open_library_id
    4. composite: normalized title + author + year
    """
    isbn13 = normalize_isbn(book.get("ISBN-13") or book.get("isbn_13") or "")
    isbn10 = normalize_isbn(book.get("ISBN-10") or book.get("isbn_10") or book.get("ISBN") or "")
    ol_id = normalize_text(book.get("open_library_id") or "")

    if "ISBN" in df.columns:
        df_isbn = df["ISBN"].astype(str).apply(normalize_isbn)

        if isbn13:
            match = df[df_isbn == isbn13]
            if not match.empty:
                return DuplicateResult("EXISTING", match.iloc[0].to_dict(), "ISBN-13", int(match.index[0]))

        if isbn10:
            match = df[df_isbn == isbn10]
            if not match.empty:
                return DuplicateResult("EXISTING", match.iloc[0].to_dict(), "ISBN-10", int(match.index[0]))

    # Open Library ID
    if ol_id and "open_library_id" in df.columns:
        df_ol = df["open_library_id"].astype(str).apply(normalize_text)
        match = df[df_ol == ol_id]
        if not match.empty:
            return DuplicateResult("EXISTING", match.iloc[0].to_dict(), "OpenLibraryID", int(match.index[0]))

    # Composite fallback
    title = book.get("Book-Title") or book.get("title") or ""
    author = book.get("Book-Author") or book.get("author") or ""
    year = book.get("Year-Of-Publication") or book.get("year") or ""
    comp_hash = composite_identity(title, author, year)

    if "Book-Title" in df.columns and "Book-Author" in df.columns:
        df_hash = df.apply(
            lambda r: composite_identity(
                str(r.get("Book-Title", "")),
                str(r.get("Book-Author", "")),
                str(r.get("Year-Of-Publication", ""))
            ), axis=1
        )
        match_idx = df_hash[df_hash == comp_hash]
        if not match_idx.empty:
            idx = match_idx.index[0]
            return DuplicateResult("EXISTING", df.loc[idx].to_dict(), "title+author+year", int(idx))

    return DuplicateResult("NEW")


# ──────────────────────────────────────────────
# Field Diff
# ──────────────────────────────────────────────

class FieldChange:
    def __init__(self, field: str, old_value: str, new_value: str, category: str):
        self.field = field
        self.old_value = old_value
        self.new_value = new_value
        self.category = category  # "ML_RELEVANT" | "DISPLAY_ONLY" | "IDENTIFIER"

    def to_dict(self):
        return {
            "field": self.field,
            "old_value": self.old_value,
            "new_value": self.new_value,
            "category": self.category,
        }


def diff_book(existing: dict, incoming: dict) -> list[FieldChange]:
    """Compare field-by-field and return only changed fields with category."""
    changes = []
    all_fields = set(existing.keys()) | set(incoming.keys())
    skip = {"combined_features", "row_id", "_index"}

    for field in all_fields:
        if field in skip:
            continue
        old_val = str(existing.get(field, "") or "").strip()
        new_val = str(incoming.get(field, "") or "").strip()
        if old_val == new_val:
            continue
        if not new_val:  # ignore blanking out existing data
            continue

        if field in IDENTITY_FIELDS:
            category = "IDENTIFIER"
        elif field in ML_RELEVANT_FIELDS:
            category = "ML_RELEVANT"
        elif field in DISPLAY_ONLY_FIELDS:
            category = "DISPLAY_ONLY"
        else:
            category = "ML_RELEVANT"  # unknown fields conservatively treated as ML-relevant

        changes.append(FieldChange(field, old_val, new_val, category))

    return changes


# ──────────────────────────────────────────────
# Normalize incoming book dict to schema columns
# ──────────────────────────────────────────────

FIELD_ALIASES = {
    "title": "Book-Title",
    "author": "Book-Author",
    "isbn": "ISBN",
    "isbn_10": "ISBN",
    "isbn_13": "ISBN",
    "year": "Year-Of-Publication",
    "publication_year": "Year-Of-Publication",
    "cover_image_url": "Image-URL-L",
}


def normalize_book_payload(raw: dict) -> dict:
    """Normalize an incoming API payload to the canonical dataset schema."""
    norm = {}
    for k, v in raw.items():
        canonical_k = FIELD_ALIASES.get(k, k)
        norm[canonical_k] = v

    # Normalize specific fields
    for isbn_field in ["ISBN", "ISBN-10", "ISBN-13"]:
        if isbn_field in norm:
            norm[isbn_field] = normalize_isbn(norm[isbn_field])

    if "Year-Of-Publication" in norm:
        norm["Year-Of-Publication"] = normalize_year(norm["Year-Of-Publication"])

    for text_field in ["Book-Title", "Book-Author", "Publisher", "Genre", "Description", "Language"]:
        if text_field in norm:
            norm[text_field] = str(norm[text_field]).strip() if norm[text_field] else ""

    # Ensure primary ISBN column is set
    if "ISBN-13" in norm and not norm.get("ISBN"):
        norm["ISBN"] = norm["ISBN-13"]
    elif "ISBN-10" in norm and not norm.get("ISBN"):
        norm["ISBN"] = norm["ISBN-10"]

    return norm


# ──────────────────────────────────────────────
# Dataset Mutation
# ──────────────────────────────────────────────

class BookIngestionService:

    def __init__(self):
        self._df: Optional[pd.DataFrame] = None

    def _load_df(self) -> pd.DataFrame:
        if PROCESSED_DATA_PATH.exists():
            self._df = pd.read_parquet(PROCESSED_DATA_PATH)
        else:
            self._df = pd.DataFrame()
        return self._df

    def _reload_df(self) -> pd.DataFrame:
        self._df = None
        return self._load_df()

    def get_df(self) -> pd.DataFrame:
        if self._df is None:
            return self._load_df()
        return self._df

    # ── Check / Classify Book ──────────────────

    def check_book(self, raw_payload: dict) -> dict:
        """
        Returns a classification result: NEW | EXISTING_NO_CHANGE | EXISTING_CHANGED.
        Does NOT mutate anything.
        """
        book = normalize_book_payload(raw_payload)
        df = self.get_df()

        dup = check_duplicate(df, book)

        if dup.status == "NEW":
            return {
                "status": "NEW",
                "message": "No matching book found in catalog.",
                "matched_by": None,
                "existing_book": None,
                "changed_fields": [],
                "has_ml_changes": False,
            }

        # Existing — compute diff
        changes = diff_book(dup.existing_row, book)
        if not changes:
            return {
                "status": "NO_CHANGE",
                "message": "Book already exists with identical data. No action required.",
                "matched_by": dup.matched_by,
                "existing_book": self._clean(dup.existing_row),
                "changed_fields": [],
                "has_ml_changes": False,
            }

        has_ml = any(c.category == "ML_RELEVANT" for c in changes)
        return {
            "status": "EXISTING_CHANGED",
            "message": f"Book found ({dup.matched_by}). {len(changes)} field(s) changed.",
            "matched_by": dup.matched_by,
            "row_index": dup.row_index,
            "existing_book": self._clean(dup.existing_row),
            "changed_fields": [c.to_dict() for c in changes],
            "has_ml_changes": has_ml,
        }

    # ── Insert New Book ──────────────────────────

    def insert_book(self, raw_payload: dict, author: str = "admin") -> dict:
        """Insert a brand new book. Fails if duplicate detected."""
        book = normalize_book_payload(raw_payload)
        df = self.get_df()

        dup = check_duplicate(df, book)
        if dup.status != "NEW":
            return {"success": False, "error": "Duplicate detected. Use update endpoint.", "status": dup.status}

        # Build new row aligned to existing columns
        new_row = {col: "" for col in df.columns}
        for k, v in book.items():
            if k in df.columns:
                new_row[k] = v

        # Generate combined_features for TF-IDF
        new_row["combined_features"] = self._build_combined_features(book)
        # Assign a unique row identifier
        new_row["row_id"] = str(uuid.uuid4())

        new_df = pd.concat([df, pd.DataFrame([new_row])], ignore_index=True)
        self._persist(new_df)
        self._df = new_df

        book_id = new_row.get("ISBN") or new_row.get("row_id")
        version_id = self._record_version(book_id, "CREATE", {}, book, [], author)
        self._write_audit("BOOK_ADDED", book_id, book.get("Book-Title", ""), author, "SUCCESS")

        return {
            "success": True,
            "status": "INSERTED",
            "book_id": book_id,
            "version_id": version_id,
            "ml_pipeline_required": True,
            "message": "New book inserted. ML pipeline rebuild required.",
        }

    # ── Update Existing Book ──────────────────────

    def update_book(self, row_index: int, raw_payload: dict, author: str = "admin") -> dict:
        """Partially update an existing book. Only changed fields are overwritten."""
        df = self.get_df()
        if row_index < 0 or row_index >= len(df):
            return {"success": False, "error": f"Row index {row_index} out of range."}

        incoming = normalize_book_payload(raw_payload)
        existing = df.iloc[row_index].to_dict()
        changes = diff_book(existing, incoming)

        if not changes:
            return {"success": False, "status": "NO_CHANGE", "message": "No field changes detected. Nothing updated."}

        # Apply changes
        for change in changes:
            df.at[row_index, change.field] = change.new_value

        # Rebuild combined_features only if ML-relevant fields changed
        if any(c.category == "ML_RELEVANT" for c in changes):
            updated_row = df.iloc[row_index].to_dict()
            df.at[row_index, "combined_features"] = self._build_combined_features(updated_row)

        self._persist(df)
        self._df = df

        book_id = existing.get("ISBN") or str(row_index)
        has_ml = any(c.category == "ML_RELEVANT" for c in changes)
        has_display = any(c.category == "DISPLAY_ONLY" for c in changes)
        has_id_change = any(c.category == "IDENTIFIER" for c in changes)

        version_id = self._record_version(book_id, "UPDATE", existing, incoming, changes, author)
        self._write_audit("BOOK_UPDATED", book_id, existing.get("Book-Title", ""), author, "SUCCESS",
                          details=f"Changed: {[c.field for c in changes]}")

        return {
            "success": True,
            "status": "UPDATED",
            "book_id": book_id,
            "row_index": row_index,
            "version_id": version_id,
            "changed_fields": [c.to_dict() for c in changes],
            "has_ml_changes": has_ml,
            "has_display_changes": has_display,
            "has_identifier_changes": has_id_change,
            "ml_pipeline_required": has_ml,
            "catalog_update_only": has_display and not has_ml,
            "message": f"Updated {len(changes)} field(s). ML rebuild {'required' if has_ml else 'NOT required'}.",
        }

    # ── Bulk Ingest ────────────────────────────

    def preview_bulk(self, rows: list[dict]) -> dict:
        """
        Preview what would happen if a list of book dicts were imported.
        Does NOT mutate anything.
        """
        df = self.get_df()
        new_books = []
        updated_books = []
        no_change = []
        invalid = []

        seen_in_batch: set[str] = set()

        for i, raw in enumerate(rows):
            try:
                book = normalize_book_payload(raw)
                isbn = normalize_isbn(book.get("ISBN") or "")
                title = normalize_text(book.get("Book-Title") or "")
                author = normalize_text(book.get("Book-Author") or "")

                batch_key = isbn or f"{title}||{author}"
                if batch_key and batch_key in seen_in_batch:
                    invalid.append({"row": i + 1, "reason": "Duplicate within batch", "data": raw})
                    continue
                if batch_key:
                    seen_in_batch.add(batch_key)

                if not book.get("Book-Title") or not book.get("Book-Author"):
                    invalid.append({"row": i + 1, "reason": "Missing required fields (Title/Author)", "data": raw})
                    continue

                dup = check_duplicate(df, book)
                if dup.status == "NEW":
                    new_books.append({"row": i + 1, "book": book})
                else:
                    changes = diff_book(dup.existing_row, book)
                    if not changes:
                        no_change.append({"row": i + 1, "isbn": isbn or title})
                    else:
                        has_ml = any(c.category == "ML_RELEVANT" for c in changes)
                        updated_books.append({
                            "row": i + 1,
                            "book": book,
                            "row_index": dup.row_index,
                            "matched_by": dup.matched_by,
                            "changed_fields": [c.to_dict() for c in changes],
                            "has_ml_changes": has_ml,
                        })
            except Exception as exc:
                invalid.append({"row": i + 1, "reason": str(exc), "data": raw})

        ml_relevant_updates = sum(1 for u in updated_books if u["has_ml_changes"])
        display_only_updates = len(updated_books) - ml_relevant_updates

        return {
            "total_rows": len(rows),
            "new_books": len(new_books),
            "updated_books": len(updated_books),
            "no_change": len(no_change),
            "invalid": len(invalid),
            "ml_relevant_updates": ml_relevant_updates,
            "display_only_updates": display_only_updates,
            "new_books_list": new_books[:20],
            "updated_books_list": updated_books[:20],
            "invalid_list": invalid[:20],
            "_new_raw": new_books,
            "_updated_raw": updated_books,
        }

    def execute_bulk(self, preview_result: dict, author: str = "admin") -> dict:
        """Execute a previously previewed bulk import."""
        new_books = preview_result.get("_new_raw", [])
        updated_books = preview_result.get("_updated_raw", [])
        inserted = 0
        updated = 0
        errors = []

        for item in new_books:
            res = self.insert_book(item["book"], author)
            if res["success"]:
                inserted += 1
            else:
                errors.append(res.get("error"))

        for item in updated_books:
            res = self.update_book(item["row_index"], item["book"], author)
            if res["success"]:
                updated += 1
            else:
                errors.append(res.get("error"))

        has_ml = any(u.get("has_ml_changes") for u in updated_books) or inserted > 0
        self._write_audit("BULK_IMPORT", "N/A", f"Bulk {inserted} new + {updated} updated", author,
                          "SUCCESS" if not errors else "PARTIAL",
                          details=f"errors: {errors[:5]}")

        return {
            "success": True,
            "inserted": inserted,
            "updated": updated,
            "errors": errors[:10],
            "ml_pipeline_required": has_ml,
        }

    # ── History & Audit ────────────────────────

    def get_book_history(self, book_id: str) -> list[dict]:
        versions = _load_json(VERSIONS_PATH, {})
        return versions.get(book_id, [])

    def get_audit_log(self, limit: int = 50) -> list[dict]:
        log = _load_json(AUDIT_LOG_PATH, [])
        return log[-limit:][::-1]  # newest first

    # ── Internals ─────────────────────────────

    def _persist(self, df: pd.DataFrame) -> None:
        df.to_parquet(PROCESSED_DATA_PATH, index=False)
        # Refresh drift splits
        n = len(df)
        split_idx = int(n * 0.7)
        df.iloc[:split_idx].to_parquet(REFERENCE_DATA_PATH, index=False)
        df.iloc[split_idx:].to_parquet(CURRENT_DATA_PATH, index=False)

    def _build_combined_features(self, book: dict) -> str:
        content_fields = ["Book-Title", "Book-Author", "Publisher", "Year-Of-Publication",
                          "Genre", "Description", "Language"]
        parts = []
        for f in content_fields:
            val = str(book.get(f, "") or "").strip()
            if val and val.lower() not in ("unknown", "nan", "none", ""):
                parts.append(val)
        return " ".join(parts)

    def _record_version(self, book_id: str, operation: str, old: dict, new: dict,
                        changes: list, author: str) -> str:
        versions = _load_json(VERSIONS_PATH, {})
        history = versions.get(book_id, [])
        version_num = len(history) + 1
        version_id = f"v{version_num}_{int(time.time())}"
        entry = {
            "version_id": version_id,
            "version": version_num,
            "operation": operation,
            "timestamp": _now(),
            "author": author,
            "changed_fields": [c.to_dict() for c in changes] if changes else [],
        }
        if operation == "CREATE":
            entry["book_snapshot"] = {k: v for k, v in new.items()
                                       if k not in ("combined_features",)}
        history.append(entry)
        versions[book_id] = history
        _save_json(VERSIONS_PATH, versions)
        return version_id

    def _write_audit(self, event_type: str, book_id: str, book_title: str,
                     author: str, status: str, details: str = "") -> None:
        log = _load_json(AUDIT_LOG_PATH, [])
        log.append({
            "timestamp": _now(),
            "event_type": event_type,
            "book_id": book_id,
            "book_title": book_title,
            "author": author,
            "status": status,
            "details": details,
        })
        _save_json(AUDIT_LOG_PATH, log)

    @staticmethod
    def _clean(record: dict) -> dict:
        if not record:
            return {}
        result = {}
        for k, v in record.items():
            if pd.isna(v) if not isinstance(v, (str, list, dict, bool)) else False:
                result[k] = ""
            elif isinstance(v, (np.int64, np.int32, np.int16, np.int8)):
                result[k] = int(v)
            elif isinstance(v, (np.float64, np.float32)):
                result[k] = float(v)
            else:
                result[k] = str(v) if not isinstance(v, (str, int, float, bool, type(None))) else v
        return result
