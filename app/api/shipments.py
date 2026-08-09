from fastapi import APIRouter, Depends, HTTPException, status, Query
from sqlalchemy.orm import Session
from typing import List, Optional
from app.config import settings
from app.database.connection import get_db
from app.database import crud
from app.models.shipment import ShipmentCreate, ShipmentRead, IoTTelemetryIngest
from app.tasks.evaluation import evaluate_shipment_async

router = APIRouter(prefix="/shipments", tags=["Shipments"])

@router.post("", response_model=ShipmentRead, status_code=status.HTTP_201_CREATED)
def create_shipment_endpoint(
    shipment_in: ShipmentCreate,
    db: Session = Depends(get_db)
):
    """
    Ingest a new shipment into the system.
    - Validates shipment data
    - Stores record in PostgreSQL
    - Triggers async risk evaluation via Celery
    """
    # Check duplicate tracking ID
    existing = crud.get_shipment_by_tracking_id(db, tracking_id=shipment_in.tracking_id)
    if existing:
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail=f"Shipment with tracking_id '{shipment_in.tracking_id}' already exists."
        )

    db_shipment = crud.create_shipment(db, shipment=shipment_in)
    
    # Audit log
    crud.create_audit_log(
        db=db,
        user_id=None,
        company_id=db_shipment.company_id,
        action="CREATE_SHIPMENT",
        resource_type="shipment",
        resource_id=db_shipment.id,
        change_data={"tracking_id": db_shipment.tracking_id, "status": db_shipment.status}
    )

    # Trigger agent evaluation (direct sync in dev/test, Celery in prod)
    if settings.DEBUG:
        evaluate_shipment_async(db_shipment.id, db_session=db)
    else:
        try:
            evaluate_shipment_async.delay(db_shipment.id)
        except Exception:
            evaluate_shipment_async(db_shipment.id, db_session=db)

    return db_shipment

@router.get("", response_model=List[ShipmentRead])
def list_shipments_endpoint(
    company_id: int = Query(1, description="Company ID filter"),
    status: Optional[str] = Query(None, description="Filter by status (in_transit, delayed, at_risk, delivered)"),
    skip: int = Query(0, ge=0),
    limit: int = Query(50, ge=1, le=100),
    db: Session = Depends(get_db)
):
    """List shipments with pagination and company isolation."""
    return crud.get_shipments(db, company_id=company_id, skip=skip, limit=limit, status=status)

@router.get("/{shipment_id}", response_model=ShipmentRead)
def get_shipment_endpoint(
    shipment_id: int,
    company_id: int = Query(1, description="Company ID filter"),
    db: Session = Depends(get_db)
):
    """Get single shipment by ID."""
    shipment = crud.get_shipment_by_id(db, shipment_id=shipment_id, company_id=company_id)
    if not shipment:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Shipment id={shipment_id} not found."
        )
    return shipment

@router.post("/{tracking_id}/telemetry", response_model=ShipmentRead)
def ingest_iot_telemetry_endpoint(
    tracking_id: str,
    telemetry: IoTTelemetryIngest,
    db: Session = Depends(get_db)
):
    """
    IoT Sensor Telemetry Ingestion Endpoint.
    Receives real-time temperature, GPS, and humidity readings from hardware trackers
    (e.g., Sensitech, Tive, Roambee, ESP32, or Cellular IoT gateways).
    
    Automatically evaluates thermal threshold breaches and triggers Agentic AI risk mitigation.
    """
    shipment = crud.get_shipment_by_tracking_id(db, tracking_id=tracking_id)
    if not shipment:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Shipment with tracking_id '{tracking_id}' not found."
        )

    # Update shipment sensor telemetry
    shipment.temperature = telemetry.temperature
    if telemetry.humidity is not None:
        shipment.humidity = telemetry.humidity
    if telemetry.lat is not None and telemetry.lng is not None:
        shipment.current_location = {"lat": telemetry.lat, "lng": telemetry.lng}

    # Detect thermal breach (+18.5°C or > -20.0°C)
    if telemetry.temperature > -20.0 and shipment.status != "rerouted":
        shipment.status = "at_risk"

    db.commit()
    db.refresh(shipment)

    # Trigger AI agent risk evaluation & action proposal generator
    evaluate_shipment_async(shipment.id, db_session=db)

    return shipment
