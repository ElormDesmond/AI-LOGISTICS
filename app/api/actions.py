from fastapi import APIRouter, Depends, HTTPException, status, Query
from sqlalchemy.orm import Session
from typing import List, Optional
from app.database.connection import get_db
from app.database import crud
from app.database.models import AgentAction
from app.models.action import AgentActionRead, AgentActionApprove
from app.security.jwt_handler import get_current_user

router = APIRouter(prefix="/actions", tags=["Agent Actions & Approvals"])

@router.get("/pending", response_model=List[AgentActionRead])
def list_pending_actions_endpoint(
    current_user: dict = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Fetch all agent actions currently awaiting human operator approval.
    Filtered by the authenticated user's company_id for multi-tenant isolation.
    """
    return crud.get_pending_actions(db=db, company_id=current_user["company_id"])

@router.post("/{action_id}/approve", response_model=AgentActionRead)
def approve_action_endpoint(
    action_id: int,
    approval_in: Optional[AgentActionApprove] = None,
    current_user: dict = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Approve a pending agent recommendation (e.g. REROUTE shipment or NEGOTIATE rate).
    Enforces authorization, multi-tenant checks, and creates compliance audit log entry.
    """
    updated_action = crud.update_action_status(
        db=db,
        action_id=action_id,
        status="approved",
        user_id=current_user["user_id"],
        result={"approved_by_user_id": current_user["user_id"], "notes": approval_in.notes if approval_in else "Approved"}
    )
    
    if not updated_action:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Action id={action_id} not found."
        )
    
    # Create compliance audit log record
    crud.create_audit_log(
        db=db,
        user_id=current_user["user_id"],
        company_id=current_user["company_id"],
        action="APPROVE_AGENT_ACTION",
        resource_type="agent_action",
        resource_id=action_id,
        change_data={"action_type": updated_action.action_type, "status": "approved"}
    )
    
    return updated_action

@router.post("/{action_id}/reject", response_model=AgentActionRead)
def reject_action_endpoint(
    action_id: int,
    current_user: dict = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Reject a pending agent recommendation.
    """
    updated_action = crud.update_action_status(
        db=db,
        action_id=action_id,
        status="rejected",
        user_id=current_user["user_id"],
        result={"rejected_by_user_id": current_user["user_id"]}
    )
    
    if not updated_action:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Action id={action_id} not found."
        )
    
    crud.create_audit_log(
        db=db,
        user_id=current_user["user_id"],
        company_id=current_user["company_id"],
        action="REJECT_AGENT_ACTION",
        resource_type="agent_action",
        resource_id=action_id,
        change_data={"action_type": updated_action.action_type, "status": "rejected"}
    )
    
    return updated_action
