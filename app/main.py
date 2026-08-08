from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.config import settings

app = FastAPI(
    title=settings.PROJECT_NAME,
    openapi_url=f"{settings.API_V1_STR}/openapi.json",
    docs_url="/docs",
    redoc_url="/redoc"
)

# Enable CORS for React frontend
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # In production, constrain to specific domains
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

from app.middleware.audit_logger import ComplianceAuditMiddleware
from app.middleware.company_isolation import MultiTenantCompanyIsolationMiddleware
from app.monitoring.metrics import prometheus_monitoring_middleware, get_prometheus_metrics_response

app.add_middleware(ComplianceAuditMiddleware)
app.add_middleware(MultiTenantCompanyIsolationMiddleware)
app.middleware("http")(prometheus_monitoring_middleware)

@app.get("/metrics", include_in_schema=False)
def metrics():
    """Prometheus metrics scrape endpoint."""
    return get_prometheus_metrics_response()

from app.api import shipments, risks, auth, actions, audit_log

app.include_router(auth.router, prefix=settings.API_V1_STR)
app.include_router(shipments.router, prefix=settings.API_V1_STR)
app.include_router(risks.router, prefix=settings.API_V1_STR)
app.include_router(actions.router, prefix=settings.API_V1_STR)
app.include_router(audit_log.router, prefix=settings.API_V1_STR)

@app.get("/")
def root():

    return {
        "message": "Welcome to Agentic AI Supply Chain Orchestrator API",
        "version": "1.0.0",
        "docs": "/docs",
        "status": "healthy"
    }

@app.get("/health")
def health_check():
    return {"status": "ok", "environment": settings.ENVIRONMENT}
