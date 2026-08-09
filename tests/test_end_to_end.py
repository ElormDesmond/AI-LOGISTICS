import pytest
from fastapi.testclient import TestClient
from app.main import app
from app.services.geospatial import haversine_distance_km, find_nearest_cold_hubs
from app.services.agents.orchestrator import orchestrator
from app.services.weather import weather_service
from app.services.claims import claims_service
from app.services.erp import erp_service

client = TestClient(app)

def test_api_root_and_health():
    """Verify root API welcome message and health check endpoint."""
    response = client.get("/")
    assert response.status_code == 200
    assert response.json()["status"] == "healthy"

    health_res = client.get("/health")
    assert health_res.status_code == 200
    assert health_res.json()["status"] == "ok"

def test_geospatial_haversine_and_hub_directory():
    """Verify Haversine distance calculator and GDP cold hub lookup."""
    dist = haversine_distance_km(50.1109, 8.6821, 47.3769, 8.5417)
    assert dist > 200.0  # ~285 km between Frankfurt and Zurich

    hubs = find_nearest_cold_hubs(50.1109, 8.6821, top_n=2)
    assert len(hubs) >= 1
    assert "Frankfurt" in hubs[0]["name"]

def test_multi_agent_autonomous_negotiation():
    """Verify multi-agent orchestrator synthesis and consensus output."""
    res = orchestrator.run_multi_agent_collaboration(
        tracking_id="TRK-PHARMA-COLD-9001",
        carrier="DHL Express",
        origin="Frankfurt",
        destination="Boston",
        temperature=18.5,
        value_usd=350000.0,
        risk_score=8.5
    )
    assert res["status"] == "CONSENSUS_ACHIEVED"
    assert res["unified_recommendation"]["savings_usd"] == 70.0
    assert len(res["dialogue_transcript"]) == 3

def test_weather_and_thermal_decay_curves():
    """Verify 48-hour forward thermal decay curve calculations."""
    forecast = weather_service.get_weather_forecast("Frankfurt, Germany")
    assert "heatwave_alert" in forecast
    assert "current_temp_c" in forecast
    assert forecast["current_temp_c"] is not None

    decay = weather_service.calculate_thermal_decay_curve(
        initial_temp_c=-22.5,
        ambient_temp_c=38.5,
        insulation_r_value=4.5
    )
    assert decay["time_to_failure_hours"] is not None
    assert decay["time_to_failure_hours"] > 0

def test_digital_cargo_claims_and_certificate():
    """Verify cargo insurance claim filing and GDP loss certificate generation."""
    claim = claims_service.file_insurance_claim(
        shipment_id=99,
        tracking_id="TRK-TEST-9999",
        value_usd=500000.0,
        temperature=19.0,
        origin="Basel",
        destination="Boston",
        carrier="PharmaExpress"
    )
    assert claim["claim_id"].startswith("CLM-2026-")
    assert claim["net_payout_usd"] == 495000.0  # $500,000 - $5,000 deductible

    cert = claims_service.generate_loss_certificate(claim["claim_id"])
    assert "FDA 21 CFR Part 11" in cert["compliance_authority"]

def test_erp_systems_integration_and_bol():
    """Verify SAP S/4HANA & Oracle NetSuite telemetry and e-BOL generation."""
    status = erp_service.get_sync_status()
    assert status["sap_s4hana"]["status"] == "CONNECTED"

    bol = erp_service.generate_bill_of_lading(
        shipment_id=1,
        tracking_id="TRK-PHARMA-COLD-9001",
        carrier="DHL Express",
        origin="Frankfurt",
        destination="Boston",
        val_usd=350000.0
    )
    assert bol["bol_number"].startswith("BOL-2026-")
    assert "SHA256-" in bol["digital_esignature"]["sha256_hash"]
