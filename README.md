# Book Finder — MLOps Recommendation Engine

Book Finder is a full-stack book discovery platform and content-based recommendation system. Built on a dataset of over **271,000 books**, it uses TF-IDF feature extraction and Nearest Neighbors cosine distance to surface relevant reading recommendations.

The project incorporates an end-to-end MLOps pipeline for dataset versioning (DVC), experiment tracking (MLflow), and automated data drift monitoring (Evidently AI).

---

## Key Features

- **Content-Based Recommendations**: Uses title, author, and publisher metadata to suggest similar titles based on vector distance.
- **Smart Cover Loading**: Image fallback system that queries Open Library API by ISBN whenever raw CDN links are unavailable.
- **Modern UI**: Light-themed React interface with responsive filtering by author, publisher, and title.
- **MLOps Integration**:
  - **DVC**: Tracks dataset revisions and pipeline artifacts.
  - **MLflow**: Logs hyperparameter runs, vocabulary size, Precision@K, and training latencies.
  - **Evidently AI**: Detects distribution drift between baseline and incoming inference requests.

---

## Tech Stack

| Layer | Technologies |
| :--- | :--- |
| **Frontend** | React 18, Vite, Tailwind CSS, Lucide Icons |
| **Backend** | Python 3.11, FastAPI, Uvicorn |
| **ML & Analytics** | Scikit-learn, Pandas, PyArrow, NumPy |
| **MLOps & DevOps** | DVC, MLflow, Evidently AI, Docker, Docker Compose |

---

## Getting Started

### Prerequisites
- Python 3.11+
- Node.js 18+

### 1. Run Backend

```bash
# Install dependencies
pip install -r requirements.txt

# Start FastAPI server
python -m uvicorn backend.app.main:app --host 0.0.0.0 --port 8000
```

The API will be available at `http://localhost:8000`. Interactive docs are available at `http://localhost:8000/docs`.

### 2. Run Frontend

```bash
# Navigate to frontend directory
cd frontend

# Install Node dependencies
npm install

# Start Vite dev server
npm run dev
```

Open `http://localhost:3000` in your browser.

### 3. Run with Docker

To launch the full application stack using Docker Compose:

```bash
docker-compose up --build
```

---

## API Overview

- `GET /api/books` — Paginated book catalog with search support.
- `GET /api/books/{isbn}` — Book details metadata and similar items.
- `GET /api/recommend/item/{title}` — Content-based recommendations by book title.
- `GET /api/authors` — Author directory and catalog lookup.
- `GET /api/publishers` — Publisher directory and catalog lookup.
- `GET /api/health` — Service health and model status.
- `GET /api/model/info` — Active model parameters and version metadata.
- `GET /api/drift` — Evidently AI drift report.

---

## License

MIT License. Free to use and modify.
