# Agentic AI Supply Chain Orchestrator - Technical Specification

**Document Version:** 1.0  
**Status:** Approved for MVP Development  
**Target Vertical:** Cold-Chain Logistics (Pharmaceuticals, Biotech, Perishables)

---

## 1. Functional Requirements

### 1.1 Data Ingestion Layer
* **POST /api/v1/shipments:** Ingest shipment metadata (tracking ID, origin, destination, thermal thresholds, estimated delivery, product value, carrier).
* **Telematics & Event Ingestion:** Ingest real-time GPS locations, temperature readings (°C), humidity, and status updates via API polling and incoming carrier webhooks.
* **Input Validation:** Strict Pydantic model validation rejecting malformed coordinates, missing tracking IDs, or invalid temperature ranges.

### 1.2 Risk Detection Agent (Claude API + LangChain ReAct)
* **Risk Score Calculation:** Evaluate shipments on a 0.0 to 10.0 risk scale.
* **Risk Categories:**
  - `temperature_breach`: Temperature approaching or exceeding critical threshold (e.g., > -20°C for deep freeze pharma).
  - `delay`: Carrier ETA exceeding expected window by > 4 hours.
  - `weather`: Severe storm, hurricane, or extreme ambient temperature forecast along route.
  - `regulatory`: Customs hold or missing documentation at transit ports.
* **Reasoning Output:** Structured JSON containing confidence score (0-1), explanation, and category classification.

### 1.3 Action Recommendation Agent
* **Action Types:**
  - `REROUTE`: Book alternative carrier/route to bypass bottleneck.
  - `NEGOTIATE`: Request carrier priority handling or rate credit.
  - `INSURE`: Purchase supplemental cargo insurance for high-value risk shipments.
  - `NOTIFY`: Send urgent alert to customer/stakeholders.
  - `HOLD`: Place on active monitoring queue without intervention.
* **Tradeoff Evaluation:** Calculate estimated cost ($) vs. expected risk reduction (0-10 scale).

### 1.4 Human-in-the-Loop Approval Workflow
* **Approval Queue:** All high-cost or state-changing actions (`REROUTE`, `NEGOTIATE`, `INSURE`) marked as `pending_approval`.
* **One-Click Actions:** Operator can approve or reject recommendations via REST API or React Dashboard.
* **Execution:** Upon approval, trigger backend task to invoke carrier/vendor integration.

---

## 2. Non-Functional Requirements

### 2.1 Performance
* **API Latency:** Ingestion endpoints (`POST /shipments`) respond in < 150ms.
* **Agent Evaluation Time:** Async Celery background worker completes risk evaluation in < 8 seconds.
* **Dashboard Refresh:** Real-time updates delivered via TanStack Query polling (5s interval).

### 2.2 Security & Compliance
* **Authentication:** JWT Bearer tokens with bcrypt password hashing.
* **Multi-Tenant Isolation:** Row-level security filtering every database query by `company_id`.
* **API Key Security:** External secrets encrypted at rest using Fernet 256-bit encryption; production keys stored in AWS Secrets Manager.
* **PII Protection:** Shipper/recipient contact details encrypted and masked in application logs.
* **Audit Logging:** Immutable audit records stored for all state-changing API operations (FDA 21 CFR Part 11 compliant).

### 2.3 Scalability & Availability
* **MVP Throughput:** Support 1,000 active shipments per day with 5-minute telemetry updates.
* **Architecture:** Stateless FastAPI application containers, PostgreSQL with connection pooling, Redis Celery job queue.

---

## 3. Data Model (Core Database Schemas)

```
┌─────────────────┐       1:N       ┌────────────────────────┐
│     users       ├─────────────────┤       shipments        │
└─────────────────┘                 └───────────┬────────────┘
                                                │ 1:N
                                                ▼
                                    ┌────────────────────────┐
                                    │    risk_assessments    │
                                    └───────────┬────────────┘
                                                │ 1:N
                                                ▼
                                    ┌────────────────────────┐
                                    │     agent_actions      │
                                    └────────────────────────┘

┌─────────────────┐
│   audit_log     │ (Global System Compliance Log)
└─────────────────┘
```

---

## 4. API Specification

| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| `POST` | `/api/v1/auth/login` | Authenticate user & return JWT token | No |
| `POST` | `/api/v1/shipments` | Ingest new cold-chain shipment | Yes |
| `GET` | `/api/v1/shipments` | List shipments (paginated, filtered by company) | Yes |
| `GET` | `/api/v1/shipments/{id}` | Get detailed shipment telemetry & history | Yes |
| `GET` | `/api/v1/risks` | Fetch risk assessments (filter by risk score >= 7) | Yes |
| `POST` | `/api/v1/actions/{id}/approve` | Approve recommended agent action | Yes |
| `POST` | `/api/v1/actions/{id}/reject` | Reject recommended agent action | Yes |
| `GET` | `/api/v1/audit-log` | Fetch compliance audit log entries | Yes (Admin) |

---

## 5. Third-Party Integrations

1. **Carrier APIs:** FedEx Shipping & Tracking API, DHL Express API, UPS Supply Chain API (Sandbox wrappers for MVP).
2. **Weather API:** OpenWeatherMap / National Weather Service API for ambient thermal forecasts.
3. **LLM Engine:** Anthropic Claude API (`claude-3-5-sonnet`) via LangChain Python SDK.

---

## 6. Development Phasing Matrix

| Feature / Capability | MVP (Phase 1-2) | Phase 3 (Integrations) | Phase 4 (Scale) |
|----------------------|-----------------|------------------------|-----------------|
| Vertical Focus | Cold-Chain Only | Cold-Chain + Perishables | Multi-Vertical |
| Risk Detection Agent | Active (Claude) | Active (Multi-Tool) | Custom Fine-Tuning |
| Human Approval Queue | Active | Active (Auto-rules option) | Policy Engine |
| Carrier Integrations | Mock Sandbox APIs | Live Carrier APIs | EDI + API Hybrid |
| Tenant Isolation | Logical `company_id` | Enforced Row Security | Dedicated Schemas |
| Compliance Audit Log | JSON DB Table | Exportable CSV/PDF | Immutable S3 Archive |
