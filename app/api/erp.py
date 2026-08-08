from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import Dict, Any
from app.database.connection import get_db
from app.database.models import Shipment
from app.services.erp import erp_service
from app.security.jwt_handler import get_current_user

router = APIRouter(prefix="/erp", tags=["Enterprise ERP & Warehouse Integration Engine"])

@router.get("/sync-status")
def get_erp_sync_status_endpoint(current_user: dict = Depends(get_current_user)):
    """
    Fetch live connection telemetry for SAP S/4HANA & Oracle NetSuite ERPs.
    """
    return erp_service.get_sync_status()

@router.get("/bill-of-lading/{shipment_id}")
def get_bill_of_lading_endpoint(
    shipment_id: int,
    current_user: dict = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Generate electronic Bill of Lading (e-BOL) document for a specific shipment.
    """
    shipment = db.query(Shipment).filter(Shipment.id == shipment_id).first()
    if not shipment:
        raise HTTPException(status_code=404, detail=f"Shipment id={shipment_id} not found")

    return erp_service.generate_bill_of_lading(
        shipment_id=shipment.id,
        tracking_id=shipment.tracking_id,
        carrier=shipment.carrier,
        origin=shipment.origin,
        destination=shipment.destination,
        val_usd=shipment.value_usd
    )
