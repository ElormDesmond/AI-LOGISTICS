from fastapi import APIRouter, Depends, Query
from sqlalchemy.orm import Session
from sqlalchemy import desc
from typing import List, Optional
from pydantic import BaseModel
from datetime import datetime
from app.database.connection import get_db
from app.database.models import AuditLog
from app.security.jwt_handler import get_current_user

router = APIRouter(prefix="/audit-log", tags=["Audit Log Compliance"])

class AuditLogRead(BaseModel):
    id: int
    user_id: Optional[int] = None
    company_id: int
    action: str
    resource_type: str
    resource_id: Optional[int] = None
    change_data: Optional[dict] = None
    ip_address: Optional[str] = None
    created_at: datetime

    class Config:
        from_attributes = True

@router.get("", response_model=List[AuditLogRead])
def list_audit_logs_endpoint(
    skip: int = Query(0, ge=0),
    limit: int = Query(50, ge=1, le=100),
    resource_type: Optional[str] = Query(None, description="Filter by resource type (e.g. shipment, agent_action)"),
    current_user: dict = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Fetch immutable audit log trail for compliance auditing (FDA 21 CFR Part 11).
    Filtered by user company_id.
    """
    query = db.query(AuditLog).filter(AuditLog.company_id == current_user["company_id"])
    if resource_type:
        query = query.filter(AuditLog.resource_type == resource_type)
    return query.order_by(desc(AuditLog.created_at)).offset(skip).limit(limit).all()
