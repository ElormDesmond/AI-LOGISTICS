import json
import logging
from typing import Dict, Any
from app.config import settings
from app.agents.tools import (
    get_shipment_telemetry,
    check_weather_forecast,
    check_regulatory_restrictions,
    get_carrier_performance
)

logger = logging.getLogger(__name__)

# System prompt guiding the Claude Risk Detector Agent
CLAUDE_RISK_DETECTOR_PROMPT = """
You are a senior cold-chain logistics risk analyst AI.
Your job is to analyze temperature-sensitive pharmaceutical and biological shipments and output a precise risk evaluation.

Rules for evaluation:
1. Temperature Breach: Cold-chain shipments must stay strictly below -20°C (or specified threshold). Any reading above this threshold is HIGH RISK (Score 7.0 - 10.0).
2. Delays: Extended transit times in hot ambient locations increase risk score proportionately.
3. Regulatory / Customs: Flag missing GDP documentation or customs hold risks.

Output MUST be a valid JSON object matching this structure:
{
    "risk_score": <float 0.0 to 10.0>,
    "risk_category": "<temperature_breach | delay | regulatory | weather | low_risk>",
    "reasoning": "<concise analytical explanation of why this risk score was assigned>",
    "confidence": <float 0.0 to 1.0>,
    "recommended_actions": [
        {
            "action_type": "<REROUTE | NEGOTIATE | INSURE | NOTIFY | HOLD>",
            "priority": "<high | medium | low>",
            "estimated_cost": <number in USD>,
            "expected_risk_reduction": <number 0.0 to 10.0>
        }
    ]
}
"""

async def evaluate_shipment_with_claude(shipment_data: Dict[str, Any]) -> Dict[str, Any]:
    """
    Evaluates shipment risk using Anthropic Claude API via LangChain / Anthropic SDK.
    Falls back to deterministic risk engine if API key is not set or network fails.
    """
    if not settings.ANTHROPIC_API_KEY:
        logger.warning("No ANTHROPIC_API_KEY provided; executing deterministic fallback risk evaluation.")
        return _deterministic_risk_evaluation(shipment_data)

    try:
        from langchain_anthropic import ChatAnthropic
        from langchain_core.messages import SystemMessage, HumanMessage

        llm = ChatAnthropic(
            model="claude-3-5-sonnet-20241022",
            anthropic_api_key=settings.ANTHROPIC_API_KEY,
            temperature=0.1,
            max_tokens=1000
        )

        user_content = f"Analyze the following shipment for risks:\n{json.dumps(shipment_data, indent=2, default=str)}"
        messages = [
            SystemMessage(content=CLAUDE_RISK_DETECTOR_PROMPT),
            HumanMessage(content=user_content)
        ]

        response = await llm.ainvoke(messages)
        content_str = response.content.strip()

        # Parse JSON output from Claude
        if "```json" in content_str:
            content_str = content_str.split("```json")[1].split("```")[0].strip()
        elif "```" in content_str:
            content_str = content_str.split("```")[1].split("```")[0].strip()

        risk_json = json.loads(content_str)
        return risk_json

    except Exception as e:
        logger.error(f"Claude API evaluation failed: {str(e)}; utilizing rule fallback.")
        return _deterministic_risk_evaluation(shipment_data)

def _deterministic_risk_evaluation(shipment_data: Dict[str, Any]) -> Dict[str, Any]:
    temp = shipment_data.get("temperature")
    is_breach = temp is not None and temp > -20.0

    if is_breach:
        return {
            "risk_score": 8.8,
            "risk_category": "temperature_breach",
            "reasoning": f"Telemetry temperature reading of {temp}°C breaches critical pharma freezing threshold (-20.0°C).",
            "confidence": 0.95,
            "recommended_actions": [
                {
                    "action_type": "REROUTE",
                    "priority": "high",
                    "estimated_cost": 500.0,
                    "expected_risk_reduction": 7.5
                },
                {
                    "action_type": "NOTIFY",
                    "priority": "medium",
                    "estimated_cost": 0.0,
                    "expected_risk_reduction": 2.0
                }
            ]
        }
    else:
        return {
            "risk_score": 1.5,
            "risk_category": "low_risk",
            "reasoning": "Shipment is progressing normally within thermal and schedule thresholds.",
            "confidence": 0.98,
            "recommended_actions": [
                {
                    "action_type": "HOLD",
                    "priority": "low",
                    "estimated_cost": 0.0,
                    "expected_risk_reduction": 0.0
                }
            ]
        }
