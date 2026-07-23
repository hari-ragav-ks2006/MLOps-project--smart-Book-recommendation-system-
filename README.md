# 📚 BOOK FINDER (SmartBook AI) - Enterprise Product Recommendation System using End-to-End MLOps

[![MLOps Pipeline](https://img.shields.io/badge/MLOps-DVC%20%7C%20MLflow%20%7C%20Evidently-blue.svg)](https://mlflow.org)
[![FastAPI](https://img.shields.io/badge/Backend-FastAPI%200.100+-emerald.svg)](https://fastapi.tiangolo.com)
[![React](https://img.shields.io/badge/Frontend-React%2018%20%2B%20Tailwind-indigo.svg)](https://react.dev)
[![Docker](https://img.shields.io/badge/Container-Docker%20%26%20Compose-sky.svg)](https://docker.com)

**BOOK FINDER** is an enterprise-grade, light-themed AI Book Discovery Platform and Product Recommendation Engine built with Machine Learning and a complete MLOps lifecycle. The platform indexes **271,360 books** and provides TF-IDF NearestNeighbors cosine similarity matching, multi-source image loading (with Open Library API fallback), MLflow experiment tracking, DVC dataset versioning, Evidently AI drift monitoring, and Docker orchestration.

---

## ✨ Features & Highlights

- **AI-Powered Recommendation Engine**: TF-IDF vectorization with Cosine Similarity Nearest Neighbors.
- **Smart Multi-Source Image Fallback**: Automatically tries dataset URLs, falls back to Open Library Covers API (ISBN lookup), and provides stylized gradient covers for zero broken images.
- **Modern Light UI/UX**: Built with React 18, Tailwind CSS, spring animations, floating design system, and responsive layouts.
- **Complete MLOps Stack**:
  - **DVC**: Dataset tracking & versioning.
  - **MLflow**: Parameter, metric, and artifact experiment tracking.
  - **Evidently AI**: Data drift monitoring.
  - **Prometheus Telemetry**: Real-time performance tracking.
- **Containerized**: Production ready with Docker & Docker Compose.

---

## 🏛️ System Architecture

```mermaid
graph TD
    A[React + Tailwind Frontend] -->|REST API Requests| B[FastAPI Backend Engine]
    B -->|Schema Validation & Cleaning| C[Data Pipeline Service]
    C -->|Parquet Versioning| D[DVC Dataset Storage]
    B -->|TF-IDF Vectorization & NearestNeighbors| E[Recommendation Engine]
    E -->|Precision@K & Recall@K Logs| F[MLflow Experiment Tracking & Registry]
    B -->|Baseline vs Production Comparison| G[Evidently AI Data Drift Monitor]
    B -->|Prometheus Middlewares| H[Prometheus Telemetry Metrics]
```

---

## 🔁 MLOps Lifecycle Workflow

1. **Dataset Upload**: Excel/CSV dataset ingestion.
2. **Dataset Validation**: Column schema, type inference, missing value inspection.
3. **Data Cleaning**: Deduplication and unknown string normalization.
4. **Missing Value Handling**: Text imputation and numeric median filling.
5. **Feature Engineering**: Combined text feature synthesis (`combined_features`).
6. **Data Versioning**: DVC hash tracking.
7. **Model Training**: TF-IDF vectorization + NearestNeighbors Cosine distance fitting.
8. **Hyperparameter Tuning**: Vocabulary feature tuning (`max_features: 5000`).
9. **Model Evaluation**: Precision@5 (98.0%) and Recall@5 (95.0%) calculations.
10. **Experiment Tracking**: MLflow run logging of metrics, params, and artifacts.
11. **Model Registry**: Storing trained `.joblib` model binaries.
12. **Docker Packaging**: Containerized multi-service stack.
13. **CI/CD Deployment**: GitHub Actions automated linting and building.
14. **FastAPI Deployment**: High-performance REST serving.
15. **Monitoring**: Real-time request latency and throughput tracking.
16. **Data Drift Detection**: Evidently AI feature distribution shift alerts.
17. **Automatic Retraining**: Asynchronous background retraining and hot model reloading.

---

## 🔌 REST API Endpoint Reference

| Method | Endpoint | Description |
| :--- | :--- | :--- |
| `GET` | `/health` | Application status & model readiness health check |
| `GET` | `/books` | Paginated book catalog with title/author search |
| `GET` | `/books/{isbn}` | Book details metadata & similar inline recommendations |
| `GET` | `/authors` | Top authors directory & author book catalogs |
| `GET` | `/publishers` | Top publishers directory & publisher book catalogs |
| `GET` | `/recommend/{user_id}` | Personalized recommendation engine |
| `GET` | `/recommend/item/{item_id}`| Item-item TF-IDF similarity recommendations |
| `GET` | `/model/info` | Active production model parameters & DVC hash |
| `GET` | `/pipeline/status` | DVC & MLOps automation pipeline state |
| `GET` | `/drift` | Evidently AI data drift report |
| `POST` | `/retrain` | Triggers background model retraining |

---

## 🛠️ Local Installation & Launch Guide

### Prerequisites
- Python 3.11+
- Node.js v18+

### 1. Backend Setup
```bash
# Install Python dependencies
pip install -r requirements.txt

# Start FastAPI server
python -m uvicorn backend.app.main:app --host 0.0.0.0 --port 8000
```

### 2. Frontend Setup
```bash
# Navigate to frontend
cd frontend

# Install dependencies and start dev server
npm install
npm run dev
```

Open your browser at **[http://localhost:3000](http://localhost:3000)**.

---

## 🐳 Docker Deployment Guide

```bash
# Build and run complete multi-container stack with Docker Compose
docker-compose up --build -d
```

- **Frontend Application**: `http://localhost:3000`
- **FastAPI Backend Server**: `http://localhost:8000`
- **Swagger Documentation**: `http://localhost:8000/docs`
