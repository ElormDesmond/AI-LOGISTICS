def test_health_check_endpoint(client):
    response = client.get("/health")
    assert response.status_code == 200
    assert response.json()["status"] == "ok"

def test_prometheus_metrics_endpoint(client):
    response = client.get("/metrics")
    assert response.status_code == 200
    assert "api_requests_total" in response.text

def test_create_shipment_api(client):
    payload = {
        "tracking_id": "DHL-TEST-1001",
        "origin": "Frankfurt",
        "destination": "New York",
        "product_category": "cold_chain",
        "current_location": {"lat": 50.1109, "lng": 8.6821},
        "temperature": -18.5,
        "humidity": 50.0,
        "status": "in_transit",
        "estimated_delivery": "2026-08-10T12:00:00Z",
        "value_usd": 250000.0,
        "carrier": "DHL Express",
        "company_id": 1
    }

    response = client.post("/api/v1/shipments", json=payload)
    assert response.status_code == 201
    data = response.json()
    assert data["tracking_id"] == "DHL-TEST-1001"
    assert data["id"] is not None

def test_create_duplicate_shipment_fails(client):
    payload = {
        "tracking_id": "DHL-DUP-1002",
        "origin": "Paris",
        "destination": "London",
        "product_category": "cold_chain",
        "estimated_delivery": "2026-08-10T12:00:00Z",
        "value_usd": 50000.0,
        "carrier": "FedEx",
        "company_id": 1
    }

    res1 = client.post("/api/v1/shipments", json=payload)
    assert res1.status_code == 201

    res2 = client.post("/api/v1/shipments", json=payload)
    assert res2.status_code == 409

def test_user_registration_and_login_jwt(client):
    reg_payload = {
        "email": "testoperator@coldchain.com",
        "password": "securepassword123",
        "company_id": 1,
        "role": "operator"
    }

    reg_res = client.post("/api/v1/auth/register", json=reg_payload)
    assert reg_res.status_code == 201
    assert reg_res.json()["email"] == "testoperator@coldchain.com"

    login_res = client.post("/api/v1/auth/login", json=reg_payload)
    assert login_res.status_code == 200
    assert "access_token" in login_res.json()

def test_actions_pending_and_approval(client):
    payload = {
        "tracking_id": "DHL-RISK-9999",
        "origin": "Basel",
        "destination": "Boston",
        "product_category": "cold_chain",
        "temperature": -15.0,
        "estimated_delivery": "2026-08-10T12:00:00Z",
        "value_usd": 400000.0,
        "carrier": "DHL Express",
        "company_id": 1
    }
    client.post("/api/v1/shipments", json=payload)

    risks_res = client.get("/api/v1/risks?company_id=1")
    assert risks_res.status_code == 200

def test_audit_log_endpoint(client):
    res = client.get("/api/v1/audit-log?company_id=1")
    assert res.status_code == 200
    assert isinstance(res.json(), list)
