from langchain.tools import tool
import random

@tool
def get_shipment_telemetry(shipment_id: int) -> dict:
    """Fetch live telematics and shipment details for a given shipment_id."""
    # Dummy mock provider for MVP tools
    return {
        "shipment_id": shipment_id,
        "temperature_celsius": -18.2,
        "safe_threshold_celsius": -20.0,
        "humidity_percentage": 55.0,
        "location": "Frankfurt Airport (EDDF)",
        "time_in_transit_hours": 36.5,
        "carrier": "DHL Express"
    }

@tool
def check_weather_forecast(location: str) -> dict:
    """Check weather forecast and severe storm warnings for a transit location."""
    return {
        "location": location,
        "condition": "Severe Heatwave",
        "ambient_temp_celsius": 38.5,
        "storm_warning": False,
        "delay_probability": 0.35
    }

@tool
def check_regulatory_restrictions(origin: str, destination: str) -> dict:
    """Check customs restrictions, import documentation requirements, and tariff holds."""
    return {
        "origin": origin,
        "destination": destination,
        "requires_gdp_certificate": True,
        "customs_hold_risk": "low",
        "average_customs_delay_hours": 1.5
    }

@tool
def get_carrier_performance(carrier: str) -> dict:
    """Get historical reliability rating and excursion rate for a logistics carrier."""
    return {
        "carrier": carrier,
        "on_time_delivery_rate": 0.94,
        "thermal_excursion_rate": 0.02,
        "rating": "A"
    }
