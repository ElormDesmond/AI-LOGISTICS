from fastapi import APIRouter, Depends, HTTPException
from typing import Dict, Any
from app.services.notifications import notification_service
from app.security.jwt_handler import get_current_user

router = APIRouter(prefix="/notifications", tags=["Acoustic Siren & Push Notifications"])

@router.get("/settings")
def get_notification_settings_endpoint(current_user: dict = Depends(get_current_user)):
    """
    Retrieve real-time acoustic siren, SMS, WhatsApp, and Web Push notification channel status.
    """
    return notification_service.get_settings()

@router.post("/dispatch-alert")
def dispatch_alert_endpoint(
    shipment_id: int,
    tracking_id: str,
    temperature: float,
    location: str = "Frankfurt Airport",
    current_user: dict = Depends(get_current_user)
):
    """
    Dispatch emergency multi-channel alert (Acoustic Siren, SMS, Web Push).
    """
    return notification_service.dispatch_emergency_alert(
        shipment_id=shipment_id,
        tracking_id=tracking_id,
        temperature=temperature,
        location=location
    )
