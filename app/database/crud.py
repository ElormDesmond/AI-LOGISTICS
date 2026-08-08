from sqlalchemy.orm import Session
from sqlalchemy import desc
from typing import List, Optional
from datetime import datetime
from app.database.models import Shipment, RiskAssessment, AgentAction, AuditLog, User
from app.models.shipment import ShipmentCreate
from app.models.risk import RiskAssessmentCreate
from app.models.action import AgentActionCreate

# Shipment CRUD
def create_shipment(db: Session, shipment: ShipmentCreate) -> Shipment:
    location_data = shipment.current_location
    lat = location_data.lat if location_data else None
    lng = location_data.lng if location_data else None

    db_shipment = Shipment(
        tracking_id=shipment.tracking_id,
        company_id=shipment.company_id,
        origin=shipment.origin,
        destination=shipment.destination,
        product_category=shipment.product_category,
        lat=lat,
        lng=lng,
        temperature=shipment.temperature,
        humidity=shipment.humidity,
        status=shipment.status,
        estimated_delivery=shipment.estimated_delivery,
        value_usd=shipment.value_usd,
        carrier=shipment.carrier
    )
    db.add(db_shipment)
    db.commit()
    db.refresh(db_shipment)
    return db_shipment

def get_shipment_by_id(db: Session, shipment_id: int, company_id: Optional[int] = None) -> Optional[Shipment]:
    query = db.query(Shipment).filter(Shipment.id == shipment_id)
    if company_id is not None:
        query = query.filter(Shipment.company_id == company_id)
    return query.first()

def get_shipment_by_tracking_id(db: Session, tracking_id: str) -> Optional[Shipment]:
    return db.query(Shipment).filter(Shipment.tracking_id == tracking_id).first()

def get_shipments(db: Session, company_id: int, skip: int = 0, limit: int = 50, status: Optional[str] = None) -> List[Shipment]:
    query = db.query(Shipment).filter(Shipment.company_id == company_id)
    if status:
        query = query.filter(Shipment.status == status)
    return query.order_by(desc(Shipment.created_at)).offset(skip).limit(limit).all()

# Risk CRUD
def create_risk_assessment(db: Session, risk: RiskAssessmentCreate) -> RiskAssessment:
    db_risk = RiskAssessment(
        shipment_id=risk.shipment_id,
        agent_id=risk.agent_id,
        risk_score=risk.risk_score,
        risk_category=risk.risk_category,
        reasoning=risk.reasoning,
        recommended_actions=risk.recommended_actions,
        confidence=risk.confidence
    )
    db.add(db_risk)
    db.commit()
    db.refresh(db_risk)
    return db_risk

def get_risks(db: Session, company_id: int, shipment_id: Optional[int] = None, min_score: Optional[float] = None, skip: int = 0, limit: int = 50) -> List[RiskAssessment]:
    query = db.query(RiskAssessment).join(Shipment).filter(Shipment.company_id == company_id)
    if shipment_id:
        query = query.filter(RiskAssessment.shipment_id == shipment_id)
    if min_score is not None:
        query = query.filter(RiskAssessment.risk_score >= min_score)
    return query.order_by(desc(RiskAssessment.created_at)).offset(skip).limit(limit).all()

# Agent Action CRUD
def create_agent_action(db: Session, action: AgentActionCreate) -> AgentAction:
    db_action = AgentAction(
        risk_assessment_id=action.risk_assessment_id,
        action_type=action.action_type,
        action_details=action.action_details,
        status=action.status,
        estimated_cost=action.estimated_cost,
        expected_risk_reduction=action.expected_risk_reduction
    )
    db.add(db_action)
    db.commit()
    db.refresh(db_action)
    return db_action

def get_pending_actions(db: Session, company_id: int) -> List[AgentAction]:
    return db.query(AgentAction)\
        .join(RiskAssessment)\
        .join(Shipment)\
        .filter(Shipment.company_id == company_id)\
        .filter(AgentAction.status == "pending_approval")\
        .order_by(desc(AgentAction.created_at))\
        .all()

def update_action_status(db: Session, action_id: int, status: str, user_id: Optional[int] = None, result: Optional[dict] = None) -> Optional[AgentAction]:
    action = db.query(AgentAction).filter(AgentAction.id == action_id).first()
    if not action:
        return None
    action.status = status
    if user_id:
        action.user_approved_by = user_id
        action.approved_at = datetime.utcnow()
    if status in ["executed", "failed"]:
        action.executed_at = datetime.utcnow()
    if result:
        action.result = result
    db.commit()
    db.refresh(action)
    return action

# Audit Log CRUD
def create_audit_log(db: Session, user_id: Optional[int], company_id: int, action: str, resource_type: str, resource_id: Optional[int], change_data: Optional[dict] = None, ip_address: Optional[str] = None) -> AuditLog:
    log = AuditLog(
        user_id=user_id,
        company_id=company_id,
        action=action,
        resource_type=resource_type,
        resource_id=resource_id,
        change_data=change_data,
        ip_address=ip_address
    )
    db.add(log)
    db.commit()
    db.refresh(log)
    return log
