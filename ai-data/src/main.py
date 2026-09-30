"""
AarogyaGrid AI - Core FastAPI Microservice
Phase 9 & 10: REST APIs, Engine Integration & Cloud Run Readiness

Exposes high-performance endpoints for ML Demand Forecasting, Risk Scoring,
Smart Redistribution, Grounded Gemini Assistant, Emergency Simulation, and Federated AI.
Directly compatible with Node.js Express Backend.
"""

import os
import logging
from typing import Dict, Any, List, Optional
from fastapi import FastAPI, HTTPException, Query, status
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, Field

from .models.schemas import (
    PredictionInputModel,
    ForecastResultModel,
    RiskSeverity,
    TransferRecommendationModel
)
from .storage.store import get_store
from .ml.forecasting import DemandForecaster
from .risk.risk_engine import RiskEngine
from .redistribution.redistribution_engine import RedistributionEngine
from .assistant.gemini_assistant import GroundedOperationsAssistant
from .emergency.surge_scenario import EmergencySurgeSimulator
from .federated.federated_sim import FederatedCoordinator

logging.basicConfig(level=logging.INFO, format="%(asctime)s [%(levelname)s] %(name)s: %(message)s")
logger = logging.getLogger("AarogyaGrid.API")

app = FastAPI(
    title="AarogyaGrid AI Engine",
    version="1.0.0",
    description="Predictive Healthcare Resource Management AI Engine"
)

# Enable CORS for local Vite frontend and Node.js backend
origins = os.getenv("CORS_ORIGINS", "http://localhost:5173,http://127.0.0.1:5173,http://localhost:3000,http://127.0.0.1:3000,http://127.0.0.1:5000").split(",")
app.add_middleware(
    CORSMiddleware,
    allow_origins=[o.strip() for o in origins if o.strip()] if "*" not in origins else ["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Initialize engines
store = get_store()
forecaster = DemandForecaster()
risk_engine = RiskEngine()
redist_engine = RedistributionEngine()
assistant = GroundedOperationsAssistant(store=store)
emergency_sim = EmergencySurgeSimulator(store=store)
fed_coordinator = FederatedCoordinator()


class AssistantQueryRequest(BaseModel):
    query: str = Field(..., min_length=1, max_length=1000)
    district: Optional[str] = None

class RedistributionRequest(BaseModel):
    deficitPhcId: str
    medicine: str

class FederatedRoundRequest(BaseModel):
    roundNumber: int = Field(default=1, ge=1)


@app.get("/health", tags=["System"])
def health_check():
    """Service health probe"""
    return {
        "success": True,
        "status": "healthy",
        "service": "AarogyaGrid AI Engine",
        "storageBackend": os.getenv("STORAGE_BACKEND", "mock")
    }


@app.post("/predict", response_model=ForecastResultModel, tags=["AI Forecasting"])
def predict_endpoint(payload: PredictionInputModel):
    """
    Direct endpoint called by Node.js Backend (POST /api/ai/predict).
    Evaluates ML demand forecast, stockout probability, days to stockout, and safety buffers.
    """
    try:
        history = store.list_daily_records(payload.phcId, days=60)
        forecast_res = forecaster.forecast(
            phc_id=payload.phcId,
            medicine=payload.medicine,
            current_stock=payload.currentStock,
            daily_usage=payload.dailyUsage,
            patient_footfall=payload.patientFootfall,
            history=history,
            horizon_days=7
        )
        return forecast_res
    except Exception as e:
        logger.error(f"Prediction failed for PHC {payload.phcId}: {e}", exc_info=True)
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Forecasting error: {str(e)}"
        )


@app.get("/risk/assess/{phc_id}", tags=["Risk Engine"])
def get_phc_risk_assessment(phc_id: str):
    """
    Evaluates holistic operational health score (0-100) and active alerts for a PHC.
    """
    phc = store.get_phc(phc_id)
    if not phc:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=f"PHC '{phc_id}' not found")

    history = store.list_daily_records(phc_id, days=60)
    inv_items = store.list_inventory(phc_id)
    bed_info = forecaster.forecast_beds_and_staff(phc, history)

    med_forecasts = []
    for item in inv_items:
        fc = forecaster.forecast(
            phc_id=phc_id,
            medicine=item["medicine"],
            current_stock=item["quantity"],
            daily_usage=item["dailyUsage"],
            history=history
        )
        med_forecasts.append(fc)

    health_summary = risk_engine.assess_phc_overall_health(phc_id, med_forecasts, bed_info)
    return {
        "success": True,
        "phc": phc,
        "health": health_summary,
        "bedAndStaffing": bed_info,
        "forecasts": med_forecasts
    }


@app.get("/risk/district/{district}", tags=["Risk Engine"])
def get_district_risk_overview(district: str):
    """
    District-wide aggregate view for District Administrators.
    """
    all_phcs = [p for p in store.list_phcs() if p.get("district", "").lower() == district.lower()]
    if not all_phcs:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=f"No PHCs found in district '{district}'")

    centre_overviews = []
    district_critical_alerts = 0
    total_beds = 0
    occupied_beds = 0

    for phc in all_phcs:
        phc_id = phc["id"]
        history = store.list_daily_records(phc_id, days=60)
        inv = store.list_inventory(phc_id)
        bed_info = forecaster.forecast_beds_and_staff(phc, history)

        med_forecasts = [
            forecaster.forecast(phc_id, item["medicine"], item["quantity"], item["dailyUsage"], history=history)
            for item in inv
        ]
        health = risk_engine.assess_phc_overall_health(phc_id, med_forecasts, bed_info)

        total_beds += bed_info["totalBeds"]
        occupied_beds += bed_info["projectedEveningOccupiedBeds"]
        district_critical_alerts += health["criticalAlertsCount"]

        centre_overviews.append({
            "id": phc_id,
            "name": phc["name"],
            "latitude": phc.get("latitude"),
            "longitude": phc.get("longitude"),
            "healthScore": health["operationalHealthScore"],
            "status": health["overallStatus"].value,
            "criticalAlerts": health["criticalAlertsCount"],
            "availableBeds": bed_info["projectedAvailableBeds"],
            "totalBeds": bed_info["totalBeds"]
        })

    return {
        "success": True,
        "district": district,
        "totalCentres": len(all_phcs),
        "districtCriticalAlerts": district_critical_alerts,
        "bedOccupancy": {
            "totalBeds": total_beds,
            "projectedOccupied": occupied_beds,
            "projectedAvailable": total_beds - occupied_beds,
            "ratePercent": round((occupied_beds / max(1, total_beds)) * 100, 1)
        },
        "centres": centre_overviews
    }


@app.post("/redistribute/recommend", tags=["Smart Redistribution"])
def get_redistribution_recommendations(payload: RedistributionRequest):
    """
    Identifies feasible donor centres with safe surplus and generates ranked transfer suggestions.
    """
    deficit_phc = store.get_phc(payload.deficitPhcId)
    if not deficit_phc:
        raise HTTPException(status_code=404, detail="Deficit PHC not found")

    deficit_inv = store.get_inventory_item(payload.deficitPhcId, payload.medicine)
    if not deficit_inv:
        raise HTTPException(status_code=404, detail=f"Medicine '{payload.medicine}' not tracked at this PHC")

    history = store.list_daily_records(payload.deficitPhcId, days=60)
    deficit_fc = forecaster.forecast(
        payload.deficitPhcId,
        payload.medicine,
        deficit_inv["quantity"],
        deficit_inv["dailyUsage"],
        history=history
    )

    all_phcs = store.list_phcs()
    donor_map = {}
    for p in all_phcs:
        p_id = p["id"]
        inv_item = store.get_inventory_item(p_id, payload.medicine)
        if inv_item:
            p_hist = store.list_daily_records(p_id, days=60)
            donor_map[p_id] = forecaster.forecast(
                p_id, payload.medicine, inv_item["quantity"], inv_item["dailyUsage"], history=p_hist
            )

    recommendations = redist_engine.find_transfer_recommendations(
        deficit_phc=deficit_phc,
        deficit_forecast=deficit_fc,
        candidate_donors=all_phcs,
        donor_forecasts_map=donor_map
    )

    return {
        "success": True,
        "deficitPhc": deficit_phc,
        "forecast": deficit_fc,
        "recommendationsCount": len(recommendations),
        "recommendations": recommendations
    }


@app.post("/assistant/query", tags=["Gemini Operations Assistant"])
def query_assistant(payload: AssistantQueryRequest):
    """
    Grounded Operations Copilot answering operational queries with live data tool-grounding.
    """
    res = assistant.query(payload.query, district=payload.district)
    return {"success": True, "result": res}


@app.post("/emergency/dengue-surge", tags=["Emergency Mode"])
def simulate_dengue_surge():
    """
    Simulates dengue/viral outbreak surge across East Delhi and Ghaziabad centres.
    """
    res = emergency_sim.run_dengue_surge_simulation()
    return {"success": True, "simulation": res}


@app.post("/federated/train-round", tags=["Federated AI"])
def run_federated_round(payload: FederatedRoundRequest):
    """
    Executes a round of simulated Federated Averaging across Delhi, UP, and Rajasthan nodes.
    """
    res = fed_coordinator.run_federated_round(round_num=payload.roundNumber)
    return {"success": True, "federatedResult": res}


@app.get("/summary/dashboard", tags=["System"])
def get_system_summary():
    """
    Top-level operational summary for district/state overview.
    """
    all_phcs = store.list_phcs()
    total_patients_today = 0
    total_beds = 0
    available_beds = 0
    total_doctors = 0

    for p in all_phcs:
        p_id = p["id"]
        history = store.list_daily_records(p_id, days=1)
        if history:
            total_patients_today += history[-1].get("patients", 0)
            occupied = history[-1].get("occupiedBeds", 0)
            total_b = p.get("totalBeds", 20)
            total_beds += total_b
            available_beds += max(0, total_b - occupied)
            total_doctors += history[-1].get("doctorsPresent", p.get("doctorsTotal", 6))

    return {
        "success": True,
        "monitoredCentres": len(all_phcs),
        "patientsToday": total_patients_today,
        "totalBeds": total_beds,
        "availableBeds": available_beds,
        "doctorsPresent": total_doctors,
        "criticalMedicinesMonitored": 6
    }
