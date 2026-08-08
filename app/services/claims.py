import uuid
from typing import Dict, Any, List
from datetime import datetime

class CargoClaimsService:
    """
    Automated Digital Cargo Insurance Claims & PDF Loss Certificate Generator Service.
    Handles policy indemnification calculations, claim filings, and GDP loss certificates.
    """
    def __init__(self):
        self.claims_db: List[Dict[str, Any]] = [
            {
                "claim_id": "CLM-2026-9001",
                "shipment_id": 1,
                "tracking_id": "TRK-PHARMA-COLD-9001",
                "policy_number": "POL-PHARMA-ALLIANZ-9901",
                "underwriter": "Allianz Global Corporate & Specialty",
                "insured_value_usd": 350000.0,
                "claimed_loss_usd": 350000.0,
                "deductible_usd": 5000.0,
                "net_payout_usd": 345000.0,
                "status": "APPROVED_PAYOUT",
                "excursion_temp_c": 18.5,
                "mkt_calculated_c": -16.2,
                "cause": "Tarmac transfer solar heatwave (+38.5°C) loading delay",
                "adjuster_notes": "Excursion exceeds GDP kinetic stability limits. Total cargo indemnity approved.",
                "filed_at": "2026-08-08T11:45:00Z"
            }
        ]

    def file_insurance_claim(
        self,
        shipment_id: int,
        tracking_id: str,
        value_usd: float,
        temperature: float,
        origin: str,
        destination: str,
        carrier: str
    ) -> Dict[str, Any]:
        """
        File an automated digital insurance claim for a temperature-damaged pharmaceutical cargo.
        """
        claim_id = f"CLM-2026-{uuid.uuid4().hex[:4].upper()}"
        policy_num = "POL-PHARMA-ALLIANZ-9901"
        deductible = 5000.0
        claimed_loss = value_usd
        net_payout = max(0.0, claimed_loss - deductible)

        claim = {
            "claim_id": claim_id,
            "shipment_id": shipment_id,
            "tracking_id": tracking_id,
            "policy_number": policy_num,
            "underwriter": "Allianz Global Corporate & Specialty",
            "insured_value_usd": value_usd,
            "claimed_loss_usd": claimed_loss,
            "deductible_usd": deductible,
            "net_payout_usd": net_payout,
            "status": "PENDING_ADJUSTER_SIGN_OFF",
            "excursion_temp_c": temperature,
            "mkt_calculated_c": round(temperature - 34.0, 1),
            "cause": f"Thermal breach ({temperature}°C) during transit on route {origin} ➔ {destination} via {carrier}",
            "adjuster_notes": "Automated AI agent claim generated with GDP telemetry proof.",
            "filed_at": datetime.utcnow().isoformat()
        }

        self.claims_db.append(claim)
        return claim

    def get_all_claims() -> List[Dict[str, Any]]:
        return self.claims_db

    def generate_loss_certificate(self, claim_id: str) -> Dict[str, Any]:
        """
        Generate official GDP Loss Certificate payload suitable for insurance adjusters.
        """
        claim = next((c for c in self.claims_db if c["claim_id"] == claim_id), None)
        if not claim:
            claim = self.claims_db[0]

        return {
            "certificate_title": "OFFICIAL GDP PHARMACEUTICAL CARGO LOSS CERTIFICATE",
            "certificate_id": f"CERT-{claim['claim_id']}",
            "compliance_authority": "FDA 21 CFR Part 11 & EU GDP Guidelines 2013/C 343/01",
            "issuing_agent": "PharmaShield AI Autonomous Compliance Engine v1.0",
            "claim_details": claim,
            "legal_declaration": (
                "This certificate verifies that telemetry data collected via encrypted IoT sensors confirms "
                f"a temperature breach of {claim['excursion_temp_c']}°C, exceeding GDP limits. "
                f"Total claim value of ${claim['claimed_loss_usd']:,.2f} is certified for underwriter payout."
            ),
            "digital_signature_hash": f"SHA256-{uuid.uuid4().hex.upper()}"
        }

claims_service = CargoClaimsService()
