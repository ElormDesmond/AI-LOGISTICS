from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List, Dict, Any
from app.database.connection import get_db
from app.database.models import Shipment
from app.services.claims import claims_service
from app.security.jwt_handler import get_current_user

router = APIRouter(prefix="/claims", tags=["Digital Cargo Claims & Loss Certificates"])

@router.get("")
def list_claims_endpoint(current_user: dict = Depends(get_current_user)):
    """
    List all digital cargo insurance claims filed under the company account.
    """
    return claims_service.claims_db

@router.post("/file-claim/{shipment_id}")
def file_claim_endpoint(
    shipment_id: int,
    current_user: dict = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    File an automated digital cargo insurance claim for a damaged/excursion shipment.
    """
    shipment = db.query(Shipment).filter(Shipment.id == shipment_id).first()
    if not shipment:
        raise HTTPException(status_code=404, detail=f"Shipment id={shipment_id} not found")

    claim = claims_service.file_insurance_claim(
        shipment_id=shipment.id,
        tracking_id=shipment.tracking_id,
        value_usd=shipment.value_usd,
        temperature=shipment.temperature if shipment.temperature is not None else 18.5,
        origin=shipment.origin,
        destination=shipment.destination,
        carrier=shipment.carrier
    )

    # Log compliance audit entry for claim filing
    from app.database import crud
    crud.create_audit_log(
        db=db,
        user_id=current_user["user_id"],
        company_id=current_user["company_id"],
        action="FILE_CARGO_INSURANCE_CLAIM",
        resource_type="insurance_claim",
        resource_id=shipment_id,
        change_data={"claim_id": claim["claim_id"], "net_payout_usd": claim["net_payout_usd"]}
    )

    return claim

@router.get("/{claim_id}/certificate")
def get_loss_certificate_endpoint(
    claim_id: str,
    current_user: dict = Depends(get_current_user)
):
    """
    Generate & retrieve official GDP Loss Certificate payload for insurance underwriters.
    """
    return claims_service.generate_loss_certificate(claim_id=claim_id)
