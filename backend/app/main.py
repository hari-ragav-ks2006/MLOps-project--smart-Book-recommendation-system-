from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from backend.app.api.endpoints import router as api_router
from backend.app.config import DATASETS_DIR

app = FastAPI(
    title="Smart Product Recommendation System API",
    description="Production-grade recommendation service with dynamic preprocessing, experiment tracking, and drift detection.",
    version="1.0"
)

# CORS setup
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Prometheus metrics setup (optional)
try:
    from prometheus_client import make_asgi_app
    metrics_app = make_asgi_app()
    app.mount("/prometheus_metrics", metrics_app)
except Exception:
    pass

# Include API Router - mount at multiple prefixes for compatibility
app.include_router(api_router, prefix="/api/v1")
app.include_router(api_router, prefix="/api")
app.include_router(api_router)


@app.get("/")
def root():
    return {
        "message": "Welcome to Smart Product Recommendation System API",
        "docs_url": "/docs",
        "health_check": "/health"
    }

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("backend.app.main:app", host="0.0.0.0", port=8000, reload=True)
