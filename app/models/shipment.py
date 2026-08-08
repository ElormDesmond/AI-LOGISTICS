from pydantic import BaseModel, Field, field_validator
from typing import Optional
from datetime import datetime
import re

class Location(BaseModel):
    lat: float = Field(..., ge=-90.0, le=90.0, description="Latitude")
    lng: float = Field(..., ge=-180.0, le=180.0, description="Longitude")

class ShipmentBase(BaseModel):
    tracking_id: str = Field(..., min_length=3, max_length=100, description="Unique carrier tracking code")
    origin: str = Field(..., min_length=2, max_length=150, description="Origin city / airport")
    destination: str = Field(..., min_length=2, max_length=150, description="Destination city / airport")
    product_category: str = Field(default="cold_chain", description="Category: cold_chain, pharma, biotech, food")
    current_location: Optional[Location] = None
    temperature: Optional[float] = Field(default=None, description="Current telemetry temperature in Celsius")
    humidity: Optional[float] = Field(default=None, description="Current humidity percentage")
    status: str = Field(default="in_transit", description="Status: in_transit, delayed, at_risk, delivered")
    estimated_delivery: datetime
    value_usd: float = Field(..., ge=0.0, description="Declared cargo value in USD")
    carrier: str = Field(..., min_length=2, max_length=100, description="Carrier name e.g. FedEx, DHL, UPS")

    @field_validator("tracking_id")
    @classmethod
    def validate_tracking_id(cls, v: str) -> str:
        clean_v = v.strip()
        if not re.match(r"^[A-Za-z0-9\-]+$", clean_v):
            raise ValueError("Tracking ID must contain only alphanumeric characters and dashes.")
        return clean_v.upper()

class ShipmentCreate(ShipmentBase):
    company_id: int = Field(default=1, description="Company ID for multi-tenant isolation")

class ShipmentRead(ShipmentBase):
    id: int
    company_id: int
    actual_delivery: Optional[datetime] = None
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True
