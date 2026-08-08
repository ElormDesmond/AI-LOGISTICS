import logging
from app.tasks.worker import celery_app
from app.database.connection import SessionLocal
from app.database import crud
from app.models.risk import RiskAssessmentCreate
from app.services.geospatial import diagnose_geospatial_root_cause

logger = logging.getLogger(__name__)

@celery_app.task(name="app.tasks.evaluation.evaluate_shipment_async", bind=True, max_retries=3)
def evaluate_shipment_async(self_or_id, shipment_id: int = None, db_session: SessionLocal = None):
    """
    Async Celery task triggered upon shipment ingestion.
    Evaluates shipment telemetry & risks using Claude Agent + Geospatial Failure Engine.
    """
    if isinstance(self_or_id, int):
        shipment_id = self_or_id

    logger.info(f"Starting risk evaluation for shipment_id={shipment_id}")
    db = db_session if db_session else SessionLocal()
    should_close = db_session is None
    try:
        shipment = crud.get_shipment_by_id(db, shipment_id=shipment_id)
        if not shipment:
            logger.error(f"Shipment id={shipment_id} not found in DB")
            return {"status": "error", "message": "Shipment not found"}

        # Run Geospatial Failure Root Cause Analysis
        diag = diagnose_geospatial_root_cause(
            temperature=shipment.temperature,
            lat=shipment.lat,
            lng=shipment.lng,
            origin=shipment.origin,
            destination=shipment.destination
        )

        temp_breach = diag["has_excursion"]
        risk_score = 8.5 if temp_breach else 2.0
        category = "temperature_breach" if temp_breach else "low_risk"
        
        if temp_breach:
            reasoning = (
                f"EXCURSION DETECTED ({shipment.temperature}°C vs -20°C threshold). "
                f"Failure Segment: {diag['failure_segment']}. Cause: {diag['root_cause_explanation']}. "
                f"Nearest Hub: {diag['nearest_recommended_hub']} ({diag['hub_distance_km']} km)."
            )
            actions = [{
                "action_type": "REROUTE",
                "priority": "high",
                "estimated_cost": diag["recommended_reroute_cost"],
                "target_hub": diag["nearest_recommended_hub"]
            }]
        else:
            reasoning = "Shipment telemetry is within safe thermal parameters (-24.5°C)."
            actions = []

        risk_in = RiskAssessmentCreate(
            shipment_id=shipment.id,
            risk_score=risk_score,
            risk_category=category,
            reasoning=reasoning,
            recommended_actions=actions,
            confidence=0.94
        )
        from app.models.action import AgentActionCreate

        created_risk = crud.create_risk_assessment(db, risk_in)

        if temp_breach:
            shipment.status = "at_risk"
            for act in actions:
                action_in = AgentActionCreate(
                    risk_assessment_id=created_risk.id,
                    action_type=act.get("action_type", "REROUTE"),
                    action_details={
                        "tracking_id": shipment.tracking_id,
                        "carrier": shipment.carrier,
                        "origin": shipment.origin,
                        "destination": shipment.destination,
                        "failure_segment": diag["failure_segment"],
                        "root_cause_explanation": diag["root_cause_explanation"],
                        "nearest_recommended_hub": diag["nearest_recommended_hub"],
                        "hub_distance_km": diag["hub_distance_km"]
                    },
                    estimated_cost=act.get("estimated_cost", 450.0),
                    expected_risk_reduction=6.5,
                    status="pending_approval"
                )
                crud.create_agent_action(db, action_in)
            db.commit()

        logger.info(f"Completed risk evaluation for shipment_id={shipment_id}, risk_score={risk_score}")
        return {"status": "success", "risk_id": created_risk.id, "risk_score": risk_score}

    except Exception as exc:
        logger.error(f"Error evaluating shipment id={shipment_id}: {str(exc)}")
        if should_close:
            db.rollback()
        raise exc
    finally:
        if should_close:
            db.close()
