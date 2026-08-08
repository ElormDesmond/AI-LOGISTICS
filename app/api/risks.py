from fastapi import APIRouter, Depends, HTTPException, status, Query
from sqlalchemy.orm import Session
from typing import List, Optional
from app.database.connection import get_db
from app.database import crud
from app.models.risk import RiskAssessmentRead

router = APIRouter(prefix="/risks", tags=["Risk Assessments"])

@router.get("", response_model=List[RiskAssessmentRead])
def list_risks_endpoint(
    company_id: int = Query(1, description="Company ID filter"),
    shipment_id: Optional[int] = Query(None, description="Filter by specific shipment ID"),
    min_score: Optional[float] = Query(None, ge=0.0, le=10.0, description="Minimum risk score threshold (e.g. 7.0 for high risk)"),
    skip: int = Query(0, ge=0),
    limit: int = Query(50, ge=1, le=100),
    db: Session = Depends(get_db)
):
    """
    List AI agent risk assessments with pagination and filters.
    """
    return crud.get_risks(
        db=db,
        company_id=company_id,
        shipment_id=shipment_id,
        min_score=min_score,
        skip=skip,
        limit=limit
    )

@router.get("/{risk_id}", response_model=RiskAssessmentRead)
def get_risk_endpoint(
    risk_id: int,
    company_id: int = Query(1, description="Company ID filter"),
    db: Session = Depends(get_db)
):
    """Fetch single risk assessment by ID."""
    risks = crud.get_risks(db=db, company_id=company_id, limit=500)
    target = next((r for r in risks if r.id == risk_id), None)
    if not target:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Risk assessment id={risk_id} not found."
        )
    return target
