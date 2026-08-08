import pytest
import asyncio
from app.agents.risk_detector import _deterministic_risk_evaluation
from app.agents.action_planner import _deterministic_action_planner
from app.integrations.carriers import DHLClient, FedExClient, UPSClient

def test_deterministic_risk_evaluation_temperature_breach():
    shipment_data = {
        "tracking_id": "TEST-BREACH-001",
        "temperature": -15.0,  # Above -20°C threshold -> Breach
        "status": "in_transit"
    }

    result = _deterministic_risk_evaluation(shipment_data)

    assert result["risk_score"] >= 7.0
    assert result["risk_category"] == "temperature_breach"
    assert result["confidence"] > 0.8
    assert len(result["recommended_actions"]) > 0
    assert result["recommended_actions"][0]["action_type"] == "REROUTE"

def test_deterministic_risk_evaluation_safe_temperature():
    shipment_data = {
        "tracking_id": "TEST-SAFE-002",
        "temperature": -25.0,  # Safe temperature
        "status": "in_transit"
    }

    result = _deterministic_risk_evaluation(shipment_data)

    assert result["risk_score"] < 5.0
    assert result["risk_category"] == "low_risk"
    assert result["recommended_actions"][0]["action_type"] == "HOLD"

def test_action_planner_recommends_reroute_for_excursion():
    risk_assessment = {
        "risk_score": 8.5,
        "risk_category": "temperature_breach"
    }
    shipment_data = {
        "value_usd": 250000.0
    }

    actions = _deterministic_action_planner(risk_assessment, shipment_data)

    assert len(actions) >= 2
    action_types = [a["action_type"] for a in actions]
    assert "REROUTE" in action_types
    assert "INSURE" in action_types

@pytest.mark.asyncio
async def test_carrier_api_clients_execution():
    dhl = DHLClient()
    fedex = FedExClient()
    ups = UPSClient()

    dhl_res = await dhl.reroute_shipment("DHL-12345", "New York")
    fedex_res = await fedex.reroute_shipment("FDX-67890", "Chicago")
    ups_res = await ups.reroute_shipment("UPS-11223", "Miami")

    assert dhl_res["status"] == "success"
    assert fedex_res["status"] == "success"
    assert ups_res["status"] == "success"
