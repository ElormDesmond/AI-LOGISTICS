from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.config import settings

from app.database.connection import engine, Base
from app.database import models

app = FastAPI(
    title=settings.PROJECT_NAME,
    openapi_url=f"{settings.API_V1_STR}/openapi.json",
    docs_url="/docs",
    redoc_url="/redoc"
)

from app.security.password import hash_password

@app.on_event("startup")
def on_startup():
    Base.metadata.create_all(bind=engine)
    seed_demo_users()
    seed_demo_shipments()

def seed_demo_users():
    from app.database.connection import SessionLocal
    db = SessionLocal()
    try:
        demo_accounts = [
            ("admin@pharma.com", "SecurePassword123!", "ADMIN"),
            ("operator@pharma.com", "SecurePassword123!", "OPERATOR"),
            ("auditor@pharma.com", "SecurePassword123!", "AUDITOR"),
            ("operator@coldchain.com", "password123", "OPERATOR")
        ]
        for email, pwd, role in demo_accounts:
            existing = db.query(models.User).filter(models.User.email == email).first()
            if not existing:
                hashed = hash_password(pwd)
                user = models.User(email=email, password_hash=hashed, company_id=1, role=role)
                db.add(user)
        db.commit()
    except Exception:
        db.rollback()
    finally:
        db.close()

def seed_demo_shipments():
    from app.database.connection import SessionLocal
    from datetime import datetime, timedelta, timezone
    db = SessionLocal()
    try:
        now = datetime.now(timezone.utc)
        
        # Ensure TRK-PHARMA-COLD-9001 exists as the critical thermal excursion shipment
        s1 = db.query(models.Shipment).filter(models.Shipment.tracking_id == 'TRK-PHARMA-COLD-9001').first()
        if not s1:
            # Also check if old seed TRK-CRITICAL-7701 exists to rename or create new
            old_s = db.query(models.Shipment).filter(models.Shipment.tracking_id == 'TRK-CRITICAL-7701').first()
            if old_s:
                old_s.tracking_id = 'TRK-PHARMA-COLD-9001'
                s1 = old_s
            else:
                s1 = models.Shipment(
                    tracking_id='TRK-PHARMA-COLD-9001',
                    company_id=1,
                    origin='Frankfurt, Germany',
                    destination='Boston Distribution Hub, USA',
                    product_category='Ultra-Cold Vaccines & Biologics',
                    lat=50.1109,
                    lng=8.6821,
                    temperature=18.5,
                    humidity=45.0,
                    status='at_risk',
                    estimated_delivery=now + timedelta(days=4),
                    value_usd=350000.0,
                    carrier='DHL Express ColdChain'
                )
                db.add(s1)
                db.commit()
                db.refresh(s1)

        # Ensure RiskAssessment exists for TRK-PHARMA-COLD-9001
        r1 = db.query(models.RiskAssessment).filter(models.RiskAssessment.shipment_id == s1.id).first()
        if not r1:
            r1 = models.RiskAssessment(
                shipment_id=s1.id,
                agent_id='Claude-3.5-Orchestrator',
                risk_score=8.8,
                risk_category='temperature_breach',
                reasoning='CRITICAL THERMAL EXCURSION (+18.5°C vs -20°C threshold). Ramp ambient exposure. Reroute required.',
                recommended_actions=[{'action_type': 'REROUTE', 'priority': 'high', 'estimated_cost': 450.0}],
                confidence=0.96
            )
            db.add(r1)
            db.commit()
            db.refresh(r1)

        # Ensure AgentAction pending approval exists for TRK-PHARMA-COLD-9001
        a1 = db.query(models.AgentAction).filter(models.AgentAction.risk_assessment_id == r1.id).first()
        if not a1:
            a1 = models.AgentAction(
                risk_assessment_id=r1.id,
                action_type='REROUTE',
                action_details={
                    'tracking_id': 'TRK-PHARMA-COLD-9001',
                    'carrier': 'DHL Express ColdChain',
                    'origin': 'Frankfurt, Germany',
                    'destination': 'Boston Distribution Hub, USA',
                    'failure_segment': 'Frankfurt Airport Ramp',
                    'root_cause_explanation': 'Direct solar heatwave ambient exposure (+38°C)',
                    'nearest_recommended_hub': 'Frankfurt Airport GDP Cold Hub',
                    'hub_distance_km': 12.4
                },
                status='pending_approval',
                estimated_cost=450.0,
                expected_risk_reduction=6.8
            )
            db.add(a1)
        else:
            # Update action details tracking_id to TRK-PHARMA-COLD-9001
            details = dict(a1.action_details or {})
            details['tracking_id'] = 'TRK-PHARMA-COLD-9001'
            a1.action_details = details
            if a1.status != 'pending_approval' and a1.status != 'approved' and a1.status != 'executed':
                a1.status = 'pending_approval'

        # Ensure TRK-NORMAL-8802 exists
        s2 = db.query(models.Shipment).filter(models.Shipment.tracking_id == 'TRK-NORMAL-8802').first()
        if not s2:
            s2 = models.Shipment(
                tracking_id='TRK-NORMAL-8802',
                company_id=1,
                origin='Zurich, Switzerland',
                destination='New York, USA',
                product_category='Oncology Biologics',
                lat=47.3769,
                lng=8.5417,
                temperature=-24.5,
                humidity=38.0,
                status='in_transit',
                estimated_delivery=now + timedelta(days=3),
                value_usd=500000.0,
                carrier='FedEx Priority Alert'
            )
            db.add(s2)

        # Ensure TRK-DELIVERED-9903 exists
        s3 = db.query(models.Shipment).filter(models.Shipment.tracking_id == 'TRK-DELIVERED-9903').first()
        if not s3:
            s3 = models.Shipment(
                tracking_id='TRK-DELIVERED-9903',
                company_id=1,
                origin='Basel, Switzerland',
                destination='Boston Distribution Hub, USA',
                product_category='mRNA Vaccine Storage',
                lat=42.3601,
                lng=-71.0589,
                temperature=-22.0,
                humidity=40.0,
                status='delivered',
                estimated_delivery=now,
                value_usd=600000.0,
                carrier='PharmaExpress'
            )
            db.add(s3)

        db.commit()
    except Exception as e:
        db.rollback()
    finally:
        db.close()



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

from app.api import shipments, risks, auth, actions, audit_log, weather, claims, erp, notifications, audit_pdf

app.include_router(auth.router, prefix=settings.API_V1_STR)
app.include_router(shipments.router, prefix=settings.API_V1_STR)
app.include_router(risks.router, prefix=settings.API_V1_STR)
app.include_router(actions.router, prefix=settings.API_V1_STR)
app.include_router(audit_log.router, prefix=settings.API_V1_STR)
app.include_router(weather.router, prefix=settings.API_V1_STR)
app.include_router(claims.router, prefix=settings.API_V1_STR)
app.include_router(erp.router, prefix=settings.API_V1_STR)
app.include_router(notifications.router, prefix=settings.API_V1_STR)
app.include_router(audit_pdf.router, prefix=settings.API_V1_STR)

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
