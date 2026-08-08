import json
import logging
from typing import List, Dict, Any
from app.config import settings

logger = logging.getLogger(__name__)

CLAUDE_ACTION_PLANNER_PROMPT = """
You are an expert cold-chain logistics action optimization agent.
Given a risk assessment for a cold-chain pharmaceutical shipment, output an array of concrete, actionable recommendations.

Action Types Allowed:
1. REROUTE: Book alternative air/ground carrier route to bypass thermal bottleneck.
2. NEGOTIATE: Demand expedited handling or freight credit from current carrier.
3. INSURE: Purchase supplemental cargo insurance for high-value risk shipments (cargo value > $100K).
4. NOTIFY: Alert QA manager and recipient of impending disruption.
5. HOLD: Place on active monitoring queue without intervention.

Constraints:
- Prioritize actions that maximize risk reduction while minimizing operational cost.
- High-value shipments (> $100K) with thermal breaches MUST include REROUTE or NOTIFY.

Output MUST be a JSON array of recommendation objects matching this schema:
[
    {
        "action_type": "<REROUTE | NEGOTIATE | INSURE | NOTIFY | HOLD>",
        "priority": "<high | medium | low>",
        "rationale": "<analytical explanation of why this action is recommended>",
        "estimated_cost": <number in USD>,
        "expected_risk_reduction": <number 0.0 to 10.0>,
        "approval_required": true
    }
]
"""

async def plan_actions_with_claude(risk_assessment: Dict[str, Any], shipment_data: Dict[str, Any]) -> List[Dict[str, Any]]:
    """
    Action Planning Agent utilizing Gemini API or Anthropic Claude API.
    Recommends optimal cost-vs-risk mitigation strategies with human approval gates.
    """
    user_content = f"""
    Risk Assessment:
    {json.dumps(risk_assessment, indent=2, default=str)}

    Shipment Data:
    {json.dumps(shipment_data, indent=2, default=str)}

    What mitigation actions should we execute?
    """

    if settings.GEMINI_API_KEY:
        try:
            from langchain_google_genai import ChatGoogleGenerativeAI
            from langchain_core.messages import SystemMessage, HumanMessage

            llm = ChatGoogleGenerativeAI(
                model="gemini-1.5-pro",
                google_api_key=settings.GEMINI_API_KEY,
                temperature=0.1,
                max_output_tokens=1000
            )

            messages = [
                SystemMessage(content=CLAUDE_ACTION_PLANNER_PROMPT),
                HumanMessage(content=user_content)
            ]

            response = await llm.ainvoke(messages)
            content_str = str(response.content).strip()

            if "```json" in content_str:
                content_str = content_str.split("```json")[1].split("```")[0].strip()
            elif "```" in content_str:
                content_str = content_str.split("```")[1].split("```")[0].strip()

            actions = json.loads(content_str)
            return actions if isinstance(actions, list) else [actions]

        except Exception as e:
            logger.error(f"Gemini Action Planning Agent call failed: {str(e)}; trying fallback.")

    if settings.ANTHROPIC_API_KEY:
        try:
            from langchain_anthropic import ChatAnthropic
            from langchain_core.messages import SystemMessage, HumanMessage

            llm = ChatAnthropic(
                model="claude-3-5-sonnet-20241022",
                anthropic_api_key=settings.ANTHROPIC_API_KEY,
                temperature=0.1,
                max_tokens=1000
            )

            messages = [
                SystemMessage(content=CLAUDE_ACTION_PLANNER_PROMPT),
                HumanMessage(content=user_content)
            ]

            response = await llm.ainvoke(messages)
            content_str = str(response.content).strip()

            if "```json" in content_str:
                content_str = content_str.split("```json")[1].split("```")[0].strip()
            elif "```" in content_str:
                content_str = content_str.split("```")[1].split("```")[0].strip()

            actions = json.loads(content_str)
            return actions if isinstance(actions, list) else [actions]

        except Exception as e:
            logger.error(f"Claude Action Planning Agent call failed: {str(e)}; utilizing rule fallback.")

    logger.warning("No Gemini or Anthropic API key provided; executing deterministic fallback action planning.")
    return _deterministic_action_planner(risk_assessment, shipment_data)

def _deterministic_action_planner(risk_assessment: Dict[str, Any], shipment_data: Dict[str, Any]) -> List[Dict[str, Any]]:
    score = risk_assessment.get("risk_score", 0.0)
    cargo_val = shipment_data.get("value_usd", 0.0)
    category = risk_assessment.get("risk_category", "low_risk")

    actions = []

    if score >= 7.0 or category == "temperature_breach":
        actions.append({
            "action_type": "REROUTE",
            "priority": "high",
            "rationale": f"High risk score ({score}/10) with thermal excursion ({category}). Immediate reroute required.",
            "estimated_cost": 450.0,
            "expected_risk_reduction": 7.5,
            "approval_required": True
        })

    if cargo_val > 100000.0 and score >= 5.0:
        actions.append({
            "action_type": "INSURE",
            "priority": "medium",
            "rationale": f"High cargo value (${cargo_val:,.2f}) under moderate-high disruption risk.",
            "estimated_cost": 250.0,
            "expected_risk_reduction": 3.0,
            "approval_required": True
        })

    if score >= 4.0:
        actions.append({
            "action_type": "NOTIFY",
            "priority": "low",
            "rationale": "Notify QA team and customer of active disruption monitoring.",
            "estimated_cost": 0.0,
            "expected_risk_reduction": 1.0,
            "approval_required": False
        })

    if not actions:
        actions.append({
            "action_type": "HOLD",
            "priority": "low",
            "rationale": "Shipment parameters normal; keep on passive telemetry tracking.",
            "estimated_cost": 0.0,
            "expected_risk_reduction": 0.0,
            "approval_required": False
        })

    return actions
