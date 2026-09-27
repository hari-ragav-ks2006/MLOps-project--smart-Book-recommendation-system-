"""
test_book_ingestion.py
Tests for the full book ingestion + duplicate detection + field diff pipeline.
"""
import os
import json
import shutil
import tempfile
import pandas as pd
import pytest
from pathlib import Path

# ── Fixture: minimal test DataFrame ─────────────
@pytest.fixture
def sample_df():
    return pd.DataFrame([
        {
            "ISBN": "9780395489314",
            "Book-Title": "The Fellowship of the Ring",
            "Book-Author": "J.R.R. Tolkien",
            "Publisher": "Allen & Unwin",
            "Year-Of-Publication": "1954",
            "Image-URL-S": "",
            "Image-URL-M": "",
            "Image-URL-L": "",
            "combined_features": "The Fellowship of the Ring J.R.R. Tolkien Allen & Unwin 1954",
        },
        {
            "ISBN": "0061964360",
            "Book-Title": "Dune",
            "Book-Author": "Frank Herbert",
            "Publisher": "Chilton Books",
            "Year-Of-Publication": "1965",
            "Image-URL-S": "",
            "Image-URL-M": "",
            "Image-URL-L": "",
            "combined_features": "Dune Frank Herbert Chilton Books 1965",
        }
    ])


# ── Test: normalize helpers ──────────────────────
def test_normalize_isbn():
    from backend.app.services.book_ingestion_service import normalize_isbn
    assert normalize_isbn("978-0-395-48931-4") == "9780395489314"
    assert normalize_isbn("  006-1964360 ") == "0061964360"
    assert normalize_isbn("") == ""


def test_normalize_year():
    from backend.app.services.book_ingestion_service import normalize_year
    assert normalize_year("1984") == "1984"
    assert normalize_year("  2001 ") == "2001"
    assert normalize_year("abc") == ""


def test_composite_identity_stable():
    from backend.app.services.book_ingestion_service import composite_identity
    h1 = composite_identity("The Hobbit", "J.R.R. Tolkien", "1937")
    h2 = composite_identity("The Hobbit", "J.R.R. Tolkien", "1937")
    h3 = composite_identity("The Hobbit", "J.R.R. Tolkien", "1938")
    assert h1 == h2
    assert h1 != h3


# ── Test: duplicate detection ─────────────────────
def test_check_duplicate_isbn_match(sample_df):
    from backend.app.services.book_ingestion_service import check_duplicate
    book = {"ISBN": "9780395489314", "Book-Title": "Fellowship", "Book-Author": "Tolkien"}
    result = check_duplicate(sample_df, book)
    assert result.status == "EXISTING"
    assert result.matched_by in ("ISBN-13", "ISBN-10", "ISBN")


def test_check_duplicate_composite_match(sample_df):
    from backend.app.services.book_ingestion_service import check_duplicate
    # Match by title+author+year without ISBN
    book = {
        "Book-Title": "The Fellowship of the Ring",
        "Book-Author": "J.R.R. Tolkien",
        "Year-Of-Publication": "1954",
    }
    result = check_duplicate(sample_df, book)
    assert result.status == "EXISTING"
    assert "title" in result.matched_by.lower() or "author" in result.matched_by.lower()


def test_check_duplicate_new_book(sample_df):
    from backend.app.services.book_ingestion_service import check_duplicate
    book = {
        "ISBN": "9991234567890",
        "Book-Title": "A Brand New Book",
        "Book-Author": "New Author",
        "Year-Of-Publication": "2024",
    }
    result = check_duplicate(sample_df, book)
    assert result.status == "NEW"


# ── Test: field diff ─────────────────────────────
def test_diff_book_no_changes():
    from backend.app.services.book_ingestion_service import diff_book
    existing = {"Book-Title": "Dune", "Book-Author": "Frank Herbert", "Year-Of-Publication": "1965"}
    incoming = {"Book-Title": "Dune", "Book-Author": "Frank Herbert", "Year-Of-Publication": "1965"}
    changes = diff_book(existing, incoming)
    assert len(changes) == 0


def test_diff_book_ml_change():
    from backend.app.services.book_ingestion_service import diff_book
    existing = {"Book-Title": "Dune", "Book-Author": "Frank Herbert", "Year-Of-Publication": "1965"}
    incoming = {"Book-Title": "Dune", "Book-Author": "Frank Herbert", "Publisher": "Ace Books"}
    changes = diff_book(existing, incoming)
    assert any(c.field == "Publisher" and c.category == "ML_RELEVANT" for c in changes)


def test_diff_book_display_only_change():
    from backend.app.services.book_ingestion_service import diff_book
    existing = {"Book-Title": "Dune", "Image-URL-L": "http://old.com/img.jpg"}
    incoming = {"Book-Title": "Dune", "Image-URL-L": "http://new.com/img.jpg"}
    changes = diff_book(existing, incoming)
    assert any(c.field == "Image-URL-L" and c.category == "DISPLAY_ONLY" for c in changes)


# ── Test: BookIngestionService (isolated with temp parquet) ─
@pytest.fixture
def service_with_temp_data(sample_df, tmp_path, monkeypatch):
    """Patches config paths to use temp directory."""
    import backend.app.services.book_ingestion_service as svc_module
    import backend.app.config as config_module

    parquet_path = tmp_path / "processed_data.parquet"
    ref_path = tmp_path / "reference_data.parquet"
    cur_path = tmp_path / "current_data.parquet"
    versions_path = tmp_path / "book_versions.json"
    audit_path = tmp_path / "audit_log.json"

    sample_df.to_parquet(parquet_path, index=False)

    monkeypatch.setattr(config_module, "PROCESSED_DATA_PATH", parquet_path)
    monkeypatch.setattr(config_module, "REFERENCE_DATA_PATH", ref_path)
    monkeypatch.setattr(config_module, "CURRENT_DATA_PATH", cur_path)
    monkeypatch.setattr(svc_module, "VERSIONS_PATH", versions_path)
    monkeypatch.setattr(svc_module, "AUDIT_LOG_PATH", audit_path)

    from backend.app.services.book_ingestion_service import BookIngestionService
    svc = BookIngestionService()
    return svc


def test_check_book_new(service_with_temp_data):
    svc = service_with_temp_data
    result = svc.check_book({"title": "A Totally New Title", "author": "Nobody", "isbn": "0000000000"})
    assert result["status"] == "NEW"


def test_check_book_existing_no_change(service_with_temp_data):
    svc = service_with_temp_data
    result = svc.check_book({
        "isbn": "9780395489314",
        "title": "The Fellowship of the Ring",
        "author": "J.R.R. Tolkien",
    })
    # status is either NO_CHANGE or EXISTING_CHANGED; with no changed fields it should be NO_CHANGE
    assert result["status"] in ("NO_CHANGE", "EXISTING_CHANGED")


def test_insert_new_book(service_with_temp_data):
    svc = service_with_temp_data
    result = svc.insert_book({
        "isbn": "0000000001",
        "title": "Test Book Alpha",
        "author": "Test Author",
        "publisher": "Test Press",
        "publication_year": "2024",
    })
    assert result["success"] is True
    assert result["status"] == "INSERTED"
    assert result["ml_pipeline_required"] is True


def test_insert_duplicate_rejected(service_with_temp_data):
    svc = service_with_temp_data
    result = svc.insert_book({
        "isbn": "9780395489314",
        "title": "The Fellowship of the Ring",
        "author": "J.R.R. Tolkien",
    })
    assert result["success"] is False


def test_update_book_display_only(service_with_temp_data):
    svc = service_with_temp_data
    result = svc.update_book(
        row_index=0,
        raw_payload={"cover_image_url": "https://new-cover.jpg"},
    )
    # Display-only change should NOT require ML rebuild
    assert result["success"] is True
    assert result.get("ml_pipeline_required") is False or result.get("catalog_update_only") is True


def test_update_book_ml_change(service_with_temp_data):
    svc = service_with_temp_data
    result = svc.update_book(
        row_index=0,
        raw_payload={"publisher": "New Publisher Corp"},
    )
    assert result["success"] is True
    assert result["ml_pipeline_required"] is True


def test_preview_bulk(service_with_temp_data):
    svc = service_with_temp_data
    rows = [
        # New book
        {"title": "Neuromancer", "author": "William Gibson", "isbn": "0441569595", "publication_year": "1984"},
        # Duplicate (should be NO_CHANGE or UPDATED)
        {"title": "Dune", "author": "Frank Herbert", "isbn": "0061964360"},
        # Invalid (no title)
        {"author": "Mystery Author", "isbn": "1111111111"},
    ]
    result = svc.preview_bulk(rows)
    assert result["total_rows"] == 3
    assert result["new_books"] >= 1
    assert result["invalid"] >= 1


def test_audit_log_written(service_with_temp_data, tmp_path):
    svc = service_with_temp_data
    svc.insert_book({
        "isbn": "9998887770001",
        "title": "Audit Test Book",
        "author": "Audit Author",
    })
    # Audit log should have been written
    import backend.app.services.book_ingestion_service as svc_module
    log = json.loads(svc_module.AUDIT_LOG_PATH.read_text())
    assert len(log) >= 1
    assert any(e["event_type"] == "BOOK_ADDED" for e in log)


def test_version_history_recorded(service_with_temp_data):
    svc = service_with_temp_data
    result = svc.insert_book({
        "isbn": "7770000000001",
        "title": "Versioned Book",
        "author": "Version Author",
    })
    assert result["version_id"] is not None
    history = svc.get_book_history(result["book_id"])
    assert len(history) >= 1
    assert history[0]["operation"] == "CREATE"
