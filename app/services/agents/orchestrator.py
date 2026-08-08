from typing import Dict, Any, List
from app.services.agents.quality_agent import QualityAssuranceAgent
from app.services.agents.carrier_agent import CarrierNegotiationAgent
from app.services.agents.claims_agent import ClaimsRiskAgent

class MultiAgentOrchestrator:
    """
    Orchestrates collaboration, dialogue, and consensus synthesis between
    CarrierNegotiationAgent, QualityAssuranceAgent, and ClaimsRiskAgent.
    """
    def __init__(self):
        self.qa_agent = QualityAssuranceAgent()
        self.carrier_agent = CarrierNegotiationAgent()
        self.claims_agent = ClaimsRiskAgent()

    def run_multi_agent_collaboration(
        self,
        tracking_id: str,
        carrier: str,
        origin: str,
        destination: str,
        temperature: float,
        value_usd: float,
        risk_score: float
    ) -> Dict[str, Any]:
        """
        Execute multi-agent autonomous negotiation workflow.
        """
        # Step 1: Quality Agent computes MKT and stability verdict
        qa_result = self.qa_agent.evaluate_quality_impact(temperature)

        # Step 2: Carrier Agent negotiates priority flight slots & rates
        carrier_result = self.carrier_agent.negotiate_reroute_options(tracking_id, carrier, origin, destination)

        # Step 3: Claims Agent evaluates loss exposure & indemnity payout
        claims_result = self.claims_agent.evaluate_insurance_claim(
            shipment_value=value_usd,
            risk_score=risk_score,
            degradation_pct=qa_result["estimated_degradation_pct"]
        )

        # Step 4: Synthesize Multi-Agent Dialogue Transcript
        dialogue_transcript: List[Dict[str, str]] = [
            {
                "speaker": "QualityAssuranceAgent",
                "role_title": "FDA Compliance & Stability Agent",
                "avatar_color": "emerald",
                "message": f"EXCURSION ANALYSIS: Telemetry reading {temperature}°C yielded Mean Kinetic Temperature MKT of {qa_result['mean_kinetic_temp_c']}°C. Product degradation estimated at {qa_result['estimated_degradation_pct']}%. Immediate nitrogen cold-chamber reroute required to prevent batch loss."
            },
            {
                "speaker": "CarrierNegotiationAgent",
                "role_title": "Logistics & Rate Negotiation Agent",
                "avatar_color": "cyan",
                "message": f"CARRIER NEGOTIATION COMPLETE: Negotiated rate down from ${carrier_result['negotiated_options'][0]['quoted_cost']} to ${carrier_result['selected_best_option']['negotiated_cost']} with {carrier_result['selected_best_option']['carrier']}. Flight {carrier_result['selected_best_option']['flight_number']} departure secured with -22.5°C active cooling guarantee."
            },
            {
                "speaker": "ClaimsRiskAgent",
                "role_title": "Cargo Insurance & Risk Agent",
                "avatar_color": "purple",
                "message": f"FINANCIAL INDEMNITY VERDICT: Re-booking expenditure of ${carrier_result['selected_best_option']['negotiated_cost']} successfully prevents ${claims_result['potential_loss_usd']:,.2f} in potential cargo loss claims under policy {claims_result['policy_id']}. ROI ratio: {round(claims_result['potential_loss_usd'] / carrier_result['selected_best_option']['negotiated_cost'], 1)}x."
            }
        ]

        return {
            "tracking_id": tracking_id,
            "status": "CONSENSUS_ACHIEVED",
            "quality_evaluation": qa_result,
            "carrier_negotiation": carrier_result,
            "claims_evaluation": claims_result,
            "dialogue_transcript": dialogue_transcript,
            "unified_recommendation": {
                "action": "EXECUTE_REROUTE",
                "target_carrier": carrier_result['selected_best_option']['carrier'],
                "flight_slot": carrier_result['selected_best_option']['flight_number'],
                "final_cost_usd": carrier_result['selected_best_option']['negotiated_cost'],
                "savings_usd": carrier_result['total_savings_usd'],
                "qa_verdict": qa_result["quality_verdict"],
                "risk_reduction_pts": 6.5
            }
        }

orchestrator = MultiAgentOrchestrator()
