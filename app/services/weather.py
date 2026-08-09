import math
from typing import Dict, Any, List
from datetime import datetime, timedelta

class WeatherForecastingService:
    """
    Environmental Weather & Thermal Degradation Forecasting Engine.
    Simulates ambient temperature, tarmac solar radiation, and 48-hour forward package heat gain.
    """
    def __init__(self):
        self.ambient_weather_db = {
            "Frankfurt, Germany": {"temp_c": 38.5, "humidity_pct": 65, "solar_uv_index": 8.5, "condition": "Severe Heatwave"},
            "Basel, Switzerland": {"temp_c": 26.0, "humidity_pct": 50, "solar_uv_index": 5.0, "condition": "Clear Sky"},
            "Zurich, Switzerland": {"temp_c": 24.5, "humidity_pct": 52, "solar_uv_index": 4.8, "condition": "Partly Cloudy"},
            "Boston, USA": {"temp_c": 28.0, "humidity_pct": 58, "solar_uv_index": 6.2, "condition": "Warm / Humid"},
            "Rotterdam, Netherlands": {"temp_c": 22.0, "humidity_pct": 70, "solar_uv_index": 3.9, "condition": "Moderate Coastal"},
            "London, UK": {"temp_c": 23.5, "humidity_pct": 62, "solar_uv_index": 4.1, "condition": "Overcast"}
        }

    def get_weather_forecast(self, location_name: str = "Frankfurt, Germany") -> Dict[str, Any]:
        """
        Get current weather conditions and 48-hour ambient forecast trend.
        Integrates with live OpenWeatherMap API if configured.
        """
        from app.config import settings
        import httpx

        current_temp_c = None
        humidity_pct = None
        condition = None

        if settings.OPENWEATHER_API_KEY:
            try:
                # Query OpenWeatherMap Current Weather API
                city = location_name.split(',')[0].strip()
                url = f"https://api.openweathermap.org/data/2.5/weather?q={city}&appid={settings.OPENWEATHER_API_KEY}&units=metric"
                with httpx.Client(timeout=5.0) as client:
                    resp = client.get(url)
                    if resp.status_code == 200:
                        data = resp.json()
                        current_temp_c = round(data["main"]["temp"], 1)
                        humidity_pct = data["main"]["humidity"]
                        condition = data["weather"][0]["description"].title()
            except Exception as exc:
                pass

        base = self.ambient_weather_db.get(location_name, {
            "temp_c": 35.0, "humidity_pct": 60, "solar_uv_index": 7.0, "condition": "Ambient Heat Warning"
        })

        if current_temp_c is None:
            current_temp_c = base["temp_c"]
        if humidity_pct is None:
            humidity_pct = base["humidity_pct"]
        if condition is None:
            condition = base["condition"]

        hourly_forecast = []
        now = datetime.utcnow()
        for hour in range(48):
            time_label = (now + timedelta(hours=hour)).strftime("%H:00 (%a)")
            hour_of_day = (now + timedelta(hours=hour)).hour
            temp_var = 5.0 * math.sin((hour_of_day - 9) * math.pi / 12)
            ambient_temp = round(current_temp_c + temp_var, 1)

            hourly_forecast.append({
                "hour": hour,
                "timestamp": time_label,
                "ambient_temp_c": ambient_temp,
                "solar_radiation_w_m2": round(max(0.0, 800.0 * math.sin((hour_of_day - 6) * math.pi / 12)), 0)
            })

        return {
            "location": location_name,
            "current_temp_c": current_temp_c,
            "humidity_pct": humidity_pct,
            "solar_uv_index": base.get("solar_uv_index", 6.5),
            "condition": condition,
            "heatwave_alert": current_temp_c > 30.0,
            "hourly_forecast": hourly_forecast
        }

    def calculate_thermal_decay_curve(
        self,
        initial_temp_c: float = -22.5,
        ambient_temp_c: float = 38.5,
        insulation_r_value: float = 4.5,
        payload_volume_l: float = 25.0
    ) -> Dict[str, Any]:
        """
        Calculate 48-hour forward thermal decay curve using Newton's Law of Cooling.
        """
        # Heat transfer rate constant k (depends on insulation R-value and payload volume)
        k = 0.085 / (insulation_r_value * (payload_volume_l / 20.0))
        
        decay_points = []
        time_to_failure_hours = None
        now = datetime.utcnow()

        for hour in range(48):
            time_label = (now + timedelta(hours=hour)).strftime("%H:00")
            
            # Ambient temp fluctuation
            hour_of_day = (now + timedelta(hours=hour)).hour
            ambient = ambient_temp_c + 4.0 * math.sin((hour_of_day - 9) * math.pi / 12)

            # Newton's cooling model
            package_temp = ambient - (ambient - initial_temp_c) * math.exp(-k * hour)
            package_temp = round(package_temp, 1)

            if package_temp > -20.0 and time_to_failure_hours is None:
                time_to_failure_hours = round(hour + (package_temp - (-20.0)) / max(0.1, (package_temp - initial_temp_c)), 1)

            decay_points.append({
                "hour": hour,
                "time_label": time_label,
                "package_temp_c": package_temp,
                "ambient_temp_c": round(ambient, 1),
                "safety_threshold_c": -20.0
            })

        ttf_formatted = f"{int(time_to_failure_hours)}h {int((time_to_failure_hours % 1) * 60)}m" if time_to_failure_hours else "Safe (>48h)"

        return {
            "initial_temp_c": initial_temp_c,
            "ambient_temp_c": ambient_temp_c,
            "insulation_r_value": insulation_r_value,
            "time_to_failure_hours": time_to_failure_hours,
            "ttf_formatted": ttf_formatted,
            "thermal_buffer_health_pct": max(0.0, round(100.0 - (time_to_failure_hours / 48.0 * 100.0 if time_to_failure_hours else 0.0), 1)),
            "decay_points": decay_points
        }

weather_service = WeatherForecastingService()
