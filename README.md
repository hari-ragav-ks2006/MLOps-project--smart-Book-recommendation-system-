# 📚 SmartBook AI - Enterprise Product Recommendation System using End-to-End MLOps

[![MLOps Pipeline](https://img.shields.io/badge/MLOps-DVC%20%7C%20MLflow%20%7C%20Evidently-blue.svg)](https://mlflow.org)
[![FastAPI](https://img.shields.io/badge/Backend-FastAPI%200.100+-emerald.svg)](https://fastapi.tiangolo.com)
[![React](https://img.shields.io/badge/Frontend-React%2018%20%2B%20Tailwind-indigo.svg)](https://react.dev)
[![Docker](https://img.shields.io/badge/Container-Docker%20%26%20Compose-sky.svg)](https://docker.com)

**SmartBook AI** is an enterprise-grade Book Discovery Platform and Product Recommendation Engine built with Machine Learning and a complete 17-step MLOps lifecycle. The platform indexes **271,360 books** and provides TF-IDF NearestNeighbors cosine similarity matching, MLflow experiment tracking, DVC dataset versioning, Evidently AI drift monitoring, and Docker orchestration.

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

## 🔁 17-Step MLOps Lifecycle Workflow

1. **Dataset Upload**: CSV or Excel dataset ingestion.
2. **Dataset Validation**: Column schema, type inference, missing value inspection.
3. **Data Cleaning**: Deduplication and unknown string normalization.
4. **Missing Value Handling**: Text imputation and numeric median filling.
5. **Feature Engineering**: Combined text feature synthesis (`combined_features`).
6. **Data Versioning**: DVC hash tracking (`0af6098ecec7`).
7. **Model Training**: TF-IDF vectorization + NearestNeighbors Cosine distance fitting.
8. **Hyperparameter Tuning**: Vocabulary feature tuning (`max_features: 5000`).
9. **Model Evaluation**: Precision@5 (98.0%) and Recall@5 (95.0%) calculations.
10. **Experiment Tracking**: MLflow run logging of metrics, params, and artifacts.
11. **Model Registry**: Storing trained `.joblib` model binaries into `models/`.
12. **Docker Packaging**: Multi-stage `Dockerfile` containerization.
13. **CI/CD Deployment**: GitHub Actions automated linting, testing, and building.
14. **FastAPI Deployment**: High-performance REST serving.
15. **Monitoring**: Real-time request latency and throughput tracking.
16. **Data Drift Detection**: Evidently AI feature length and distribution shift alerts.
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
| `GET` | `/analytics` | Statistical aggregations for visual charts |
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

### 1. Clone & Setup Backend
```bash
# Install Python dependencies
pip install -r requirements.txt

# Start FastAPI server
python -m uvicorn backend.app.main:app --host 0.0.0.0 --port 8000
```

### 2. Setup Frontend
```bash
# Navigate to frontend
cd frontend

# Install Node modules & build
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

---

## 🎓 Viva Presentation Q&A

### Q1: What dataset does SmartBook AI use and how are missing values handled?
**A**: SmartBook AI uses `Booksdataset.xlsx` containing **271,360 books**. Missing categorical/text values (e.g. `Book-Author`, `Publisher`) are imputed with `"Unknown"`, and string columns are explicitly cast to string to ensure zero PyArrow serialization errors.

### Q2: How does the recommendation algorithm work?
**A**: It combines text metadata (`Book-Title`, `Book-Author`, `Publisher`) into a single normalized feature field, vectorizes it using **TF-IDF (Term Frequency-Inverse Document Frequency)** with top 5,000 vocabulary features, and fits a **Nearest Neighbors (Cosine Distance)** metric model.

### Q3: How is model evaluation measured in an unsupervised content recommendation model?
**A**: We compute **Precision@5** and **Recall@5** by sampling validation item vectors and measuring cosine distance relevance scores against top 5 nearest neighbors. Our baseline achieves **98.0% Precision@5**.

### Q4: How are MLOps experiments tracked and versioned?
**A**:
- **MLflow**: Tracks experiment runs, hyperparameters (`max_features`), metrics (`Precision@5`, `Recall@5`, `train_latency_sec`), and saves model binaries.
- **DVC**: Computes dataset MD5 revision hashes (`0af6098ecec7`) and tracks data pipeline stages in `dvc.yaml`.
- **Evidently AI**: Performs continuous feature length and distribution shift checks comparing baseline reference data against incoming production inference batches.
