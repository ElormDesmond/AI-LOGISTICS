from pydantic import BaseModel, Field
from typing import Optional, Dict, Any
from datetime import datetime

class AgentActionBase(BaseModel):
    risk_assessment_id: int
    action_type: str = Field(..., description="Type: REROUTE, NEGOTIATE, INSURE, NOTIFY, HOLD")
    action_details: Dict[str, Any] = Field(default={}, description="Action payload metadata")
    estimated_cost: float = Field(default=0.0, ge=0.0)
    expected_risk_reduction: float = Field(default=5.0, ge=0.0, le=10.0)

class AgentActionCreate(AgentActionBase):
    status: str = Field(default="pending_approval")

class AgentActionApprove(BaseModel):
    user_id: Optional[int] = None
    notes: Optional[str] = None

class AgentActionRead(AgentActionBase):
    id: int
    status: str  # pending_approval, approved, rejected, executed, failed
    user_approved_by: Optional[int] = None
    approved_at: Optional[datetime] = None
    executed_at: Optional[datetime] = None
    result: Optional[Dict[str, Any]] = None
    created_at: datetime

    class Config:
        from_attributes = True
