from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from typing import Dict, Any
from app.database.connection import get_db
from app.database.models import Shipment
from app.services.weather import weather_service
from app.security.jwt_handler import get_current_user

router = APIRouter(prefix="/weather", tags=["Environmental Weather & Thermal Decay Analytics"])

@router.get("/forecast")
def get_weather_forecast_endpoint(
    location: str = Query("Frankfurt, Germany", description="City location name"),
    current_user: dict = Depends(get_current_user)
):
    """
    Fetch current ambient weather conditions and 48-hour ambient temperature trend forecast.
    """
    return weather_service.get_weather_forecast(location_name=location)

@router.get("/shipment/{shipment_id}/thermal-decay")
def get_shipment_thermal_decay_endpoint(
    shipment_id: int,
    current_user: dict = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Calculate 48-hour forward thermal decay curve & Time-to-Failure (TTF) for a specific shipment.
    """
    shipment = db.query(Shipment).filter(Shipment.id == shipment_id).first()
    if not shipment:
        raise HTTPException(status_code=404, detail=f"Shipment id={shipment_id} not found")

    initial_temp = shipment.temperature if shipment.temperature is not None else -22.5
    location = shipment.origin or "Frankfurt, Germany"
    weather = weather_service.get_weather_forecast(location)

    decay_analysis = weather_service.calculate_thermal_decay_curve(
        initial_temp_c=initial_temp,
        ambient_temp_c=weather["current_temp_c"],
        insulation_r_value=4.5,
        payload_volume_l=25.0
    )

    return {
        "shipment_id": shipment.id,
        "tracking_id": shipment.tracking_id,
        "weather_context": weather,
        "thermal_decay": decay_analysis
    }
