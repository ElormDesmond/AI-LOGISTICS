from sqlalchemy import Column, Integer, String, Float, DateTime, ForeignKey, Text, JSON, func, Index
from sqlalchemy.orm import relationship
from app.database.connection import Base

class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    email = Column(String(255), unique=True, nullable=False, index=True)
    password_hash = Column(String(255), nullable=False)
    company_id = Column(Integer, nullable=False, default=1, index=True)
    role = Column(String(50), nullable=False, default="operator")
    created_at = Column(DateTime, server_default=func.now())

class Shipment(Base):
    __tablename__ = "shipments"

    id = Column(Integer, primary_key=True, index=True)
    tracking_id = Column(String(100), unique=True, nullable=False, index=True)
    company_id = Column(Integer, nullable=False, default=1, index=True)
    origin = Column(String(150), nullable=False)
    destination = Column(String(150), nullable=False)
    product_category = Column(String(100), default="cold_chain")
    lat = Column(Float, nullable=True)
    lng = Column(Float, nullable=True)
    temperature = Column(Float, nullable=True)
    humidity = Column(Float, nullable=True)
    status = Column(String(50), nullable=False, default="in_transit", index=True)
    estimated_delivery = Column(DateTime, nullable=False)
    actual_delivery = Column(DateTime, nullable=True)
    value_usd = Column(Float, nullable=False, default=0.0)
    carrier = Column(String(100), nullable=False)
    created_at = Column(DateTime, server_default=func.now())
    updated_at = Column(DateTime, server_default=func.now(), onupdate=func.now())

    risks = relationship("RiskAssessment", back_populates="shipment", cascade="all, delete-orphan")

class RiskAssessment(Base):
    __tablename__ = "risk_assessments"

    id = Column(Integer, primary_key=True, index=True)
    shipment_id = Column(Integer, ForeignKey("shipments.id", ondelete="CASCADE"), nullable=False, index=True)
    agent_id = Column(String(100), nullable=False, default="claude_risk_detector_v1")
    risk_score = Column(Float, nullable=False, index=True)
    risk_category = Column(String(100), nullable=False, index=True)
    reasoning = Column(Text, nullable=False)
    recommended_actions = Column(JSON, nullable=True)
    confidence = Column(Float, nullable=False, default=0.9)
    created_at = Column(DateTime, server_default=func.now())

    shipment = relationship("Shipment", back_populates="risks")
    actions = relationship("AgentAction", back_populates="risk_assessment", cascade="all, delete-orphan")

class AgentAction(Base):
    __tablename__ = "agent_actions"

    id = Column(Integer, primary_key=True, index=True)
    risk_assessment_id = Column(Integer, ForeignKey("risk_assessments.id", ondelete="CASCADE"), nullable=False, index=True)
    action_type = Column(String(100), nullable=False, index=True)
    action_details = Column(JSON, nullable=True)
    status = Column(String(50), nullable=False, default="pending_approval", index=True)
    estimated_cost = Column(Float, default=0.0)
    expected_risk_reduction = Column(Float, default=5.0)
    user_approved_by = Column(Integer, ForeignKey("users.id"), nullable=True)
    approved_at = Column(DateTime, nullable=True)
    executed_at = Column(DateTime, nullable=True)
    result = Column(JSON, nullable=True)
    created_at = Column(DateTime, server_default=func.now())

    risk_assessment = relationship("RiskAssessment", back_populates="actions")

class AuditLog(Base):
    __tablename__ = "audit_log"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, nullable=True, index=True)
    company_id = Column(Integer, nullable=False, default=1, index=True)
    action = Column(String(255), nullable=False)
    resource_type = Column(String(100), nullable=False, index=True)
    resource_id = Column(Integer, nullable=True, index=True)
    change_data = Column(JSON, nullable=True)
    ip_address = Column(String(45), nullable=True)
    created_at = Column(DateTime, server_default=func.now())

# Index declarations for fast lookups
Index("idx_shipments_company_status", Shipment.company_id, Shipment.status)
Index("idx_risks_shipment_score", RiskAssessment.shipment_id, RiskAssessment.risk_score)
