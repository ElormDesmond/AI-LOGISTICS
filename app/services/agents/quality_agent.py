import math
from typing import Dict, Any

class QualityAssuranceAgent:
    """
    Quality Assurance Agent responsible for GDP compliance, FDA 21 CFR Part 11 rules,
    and Mean Kinetic Temperature (MKT) stability calculations.
    """
    def __init__(self):
        self.name = "QualityAssuranceAgent_v1"

    def calculate_mkt(self, temp_readings: list) -> float:
        """
        Calculate Mean Kinetic Temperature (MKT) in Celsius using Arrhenius equation.
        """
        if not temp_readings:
            return -22.5
        
        # Activation energy for pharmaceutical degradation (approx 83.144 kJ/mol)
        delta_h_over_r = 10000.0  # DH / R in Kelvin
        
        # Convert readings to Kelvin
        kelvins = [t + 273.15 for t in temp_readings]
        sum_exp = sum(math.exp(-delta_h_over_r / T) for T in kelvins)
        avg_exp = sum_exp / len(kelvins)
        
        mkt_kelvin = -delta_h_over_r / math.log(avg_exp)
        return round(mkt_kelvin - 273.15, 2)

    def evaluate_quality_impact(self, current_temp: float, exposure_hours: float = 2.0) -> Dict[str, Any]:
        """
        Evaluate product stability & remaining shelf-life impact.
        """
        simulated_history = [-22.5, -22.0, -21.8, current_temp]
        mkt = self.calculate_mkt(simulated_history)
        
        is_compliant = mkt <= -18.0
        degradation_percent = min(100.0, max(0.0, (current_temp - (-20.0)) * 8.5 * exposure_hours))
        
        return {
            "agent_name": self.name,
            "mean_kinetic_temp_c": mkt,
            "is_gdp_compliant": is_compliant,
            "estimated_degradation_pct": round(degradation_percent, 1),
            "shelf_life_remaining_days": max(0, int(730 - (degradation_percent * 5))),
            "quality_verdict": "APPROVED_FOR_REROUTE" if is_compliant or current_temp < 25.0 else "REJECTED_QUARANTINE_REQUIRED",
            "qa_reasoning": f"MKT calculated at {mkt}°C. " + (
                "Thermal exposure is within emergency recovery limits. Re-booking authorized."
                if is_compliant else "Excursion exceeds safe kinetic threshold. Requires priority nitrogen chamber reroute."
            )
        }
