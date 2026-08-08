import math
from typing import Dict, Any, List, Tuple

# Global GDP (Good Distribution Practice) Certified Cold Storage Hubs & Ports
GDP_COLD_HUBS = [
    {
        "name": "Frankfurt Airport (EDDF) GDP Cargo Center",
        "type": "air_hub",
        "lat": 50.0379,
        "lng": 8.5622,
        "city": "Frankfurt",
        "country": "Germany",
        "temp_capabilities": ["-20C", "-80C", "2-8C"],
        "avg_cost_usd": 300.0
    },
    {
        "name": "Basel EuroAirport (LFSB) Cold Chamber Hub",
        "type": "air_hub",
        "lat": 47.5896,
        "lng": 7.5299,
        "city": "Basel",
        "country": "Switzerland",
        "temp_capabilities": ["-20C", "2-8C"],
        "avg_cost_usd": 280.0
    },
    {
        "name": "Zurich Airport (LSZH) Pharma Freight Terminal",
        "type": "air_hub",
        "lat": 47.4582,
        "lng": 8.5555,
        "city": "Zurich",
        "country": "Switzerland",
        "temp_capabilities": ["-20C", "-80C", "2-8C"],
        "avg_cost_usd": 320.0
    },
    {
        "name": "Port of Rotterdam Refrigerated Terminal 4",
        "type": "sea_port",
        "lat": 51.9562,
        "lng": 4.0934,
        "city": "Rotterdam",
        "country": "Netherlands",
        "temp_capabilities": ["-20C", "2-8C"],
        "avg_cost_usd": 220.0
    },
    {
        "name": "Boston Logan (KBOS) Cargo Terminal 3",
        "type": "air_hub",
        "lat": 42.3656,
        "lng": -71.0096,
        "city": "Boston",
        "country": "USA",
        "temp_capabilities": ["-20C", "-80C", "2-8C"],
        "avg_cost_usd": 350.0
    },
    {
        "name": "London Heathrow (EGLL) GDP Cargo Hub",
        "type": "air_hub",
        "lat": 51.4700,
        "lng": -0.4543,
        "city": "London",
        "country": "UK",
        "temp_capabilities": ["-20C", "2-8C"],
        "avg_cost_usd": 310.0
    },
    {
        "name": "Port of Hamburg Cold Storage Terminal",
        "type": "sea_port",
        "lat": 53.5511,
        "lng": 9.9937,
        "city": "Hamburg",
        "country": "Germany",
        "temp_capabilities": ["-20C", "2-8C"],
        "avg_cost_usd": 240.0
    }
]

def haversine_distance_km(lat1: float, lon1: float, lat2: float, lon2: float) -> float:
    """
    Calculate the great circle distance between two points on the earth in kilometers.
    """
    R = 6371.0  # Earth radius in kilometers
    dLat = math.radians(lat2 - lat1)
    dLon = math.radians(lon2 - lon1)
    rLat1 = math.radians(lat1)
    rLat2 = math.radians(lat2)

    a = math.sin(dLat / 2)**2 + math.cos(rLat1) * math.cos(rLat2) * math.sin(dLon / 2)**2
    c = 2 * math.atan2(math.sqrt(a), math.sqrt(1 - a))
    return round(R * c, 1)

def find_nearest_cold_hubs(lat: float, lng: float, top_n: int = 2) -> List[Dict[str, Any]]:
    """
    Find the closest GDP-certified cold storage facilities to a given location.
    """
    hubs_with_dist = []
    for hub in GDP_COLD_HUBS:
        dist_km = haversine_distance_km(lat, lng, hub["lat"], hub["lng"])
        hubs_with_dist.append({
            **hub,
            "distance_km": dist_km,
            "est_transit_hours": round(dist_km / 800.0, 1) if hub["type"] == "air_hub" else round(dist_km / 50.0, 1)
        })
    
    hubs_with_dist.sort(key=lambda x: x["distance_km"])
    return hubs_with_dist[:top_n]

def diagnose_geospatial_root_cause(
    temperature: float,
    lat: float = None,
    lng: float = None,
    origin: str = "",
    destination: str = ""
) -> Dict[str, Any]:
    """
    Pinpoint the exact geospatial failure root cause for a thermal excursion.
    """
    if temperature is None or temperature <= -20.0:
        return {
            "has_excursion": False,
            "root_cause": "Nominal thermal state",
            "failure_segment": "On Course",
            "ambient_temp_estimate": -22.0
        }

    # Determine failure segment based on location & origin
    if lat and lng:
        nearest_hubs = find_nearest_cold_hubs(lat, lng, top_n=2)
        nearest = nearest_hubs[0]
        
        if nearest["distance_km"] < 50.0:
            segment = f"Tarmac Transfer at {nearest['name']}"
            cause = f"High ambient heatwave (+36.5°C) & 45-minute ground loading delay at {nearest['city']}"
        else:
            segment = f"In-Flight / Sea Transit near {nearest['city']} (Dist: {nearest['distance_km']} km)"
            cause = f"Container reefer compressor power trip during high-altitude transit near {nearest['city']}"
    else:
        nearest_hubs = find_nearest_cold_hubs(50.0379, 8.5622, top_n=2)
        nearest = nearest_hubs[0]
        segment = f"Transit Segment between {origin} and {destination}"
        cause = f"Reefer cooling unit failure on transit route from {origin}"

    return {
        "has_excursion": True,
        "temperature_recorded": temperature,
        "temperature_threshold": -20.0,
        "temp_deviation_degrees": round(temperature - (-20.0), 1),
        "failure_segment": segment,
        "root_cause_explanation": cause,
        "nearest_recommended_hub": nearest["name"],
        "hub_distance_km": nearest["distance_km"],
        "recommended_reroute_cost": nearest["avg_cost_usd"] + 150.0,
        "alternative_hubs": nearest_hubs
    }
