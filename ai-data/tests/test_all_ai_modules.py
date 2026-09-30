"""
AarogyaGrid AI - Comprehensive Test Suite
Phase 13: Testing & Validation
"""

import pytest
from fastapi.testclient import TestClient
from src.data_generator import generate_synthetic_dataset
from src.models.schemas import RiskSeverity, TransferStatus
from src.storage.store import LocalDataStore
from src.ml.forecasting import DemandForecaster
from src.risk.risk_engine import RiskEngine
from src.redistribution.redistribution_engine import (
    RedistributionEngine,
    calculate_haversine_distance_km
)
from src.assistant.gemini_assistant import GroundedOperationsAssistant
from src.federated.federated_sim import FederatedCoordinator
from src.emergency.surge_scenario import EmergencySurgeSimulator
from src.main import app

@pytest.fixture
def dataset():
    return generate_synthetic_dataset(days=60, seed=42)

@pytest.fixture
def store(dataset):
    return LocalDataStore()

@pytest.fixture
def client():
    return TestClient(app)

# 1. Synthetic Data Generator Tests
def test_synthetic_data_integrity(dataset):
    phcs = dataset["phcs"]
    inventory = dataset["inventory"]
    records = dataset["daily_records"]

    assert len(phcs) == 16
    assert len(inventory) == 96 # 16 centres * 6 medicines
    assert len(records) == 960  # 16 centres * 60 days

    for r in records:
        assert r["patients"] > 0
        assert r["occupiedBeds"] <= r["totalBeds"]
        assert r["doctorsPresent"] <= r["doctorsTotal"]
        assert r["nursesPresent"] <= r["nursesTotal"]
        for _, usage in r["medicineUsage"].items():
            assert usage >= 0.0

# 2. Distance Calculation Test
def test_haversine_distance():
    # Laxmi Nagar (28.6315, 77.2773) to Sector 62 Noida (28.6270, 77.3620) is ~8.3 km
    dist = calculate_haversine_distance_km(28.6315, 77.2773, 28.6270, 77.3620)
    assert 7.0 <= dist <= 10.0

# 3. ML Forecasting & Chronological Evaluation Tests
def test_demand_forecasting_and_metrics(dataset):
    forecaster = DemandForecaster()
    phc_id = "phc-delhi-east-01"
    phc_history = [r for r in dataset["daily_records"] if r["phcId"] == phc_id]

    res = forecaster.forecast(
        phc_id=phc_id,
        medicine="Paracetamol 500mg",
        current_stock=100,
        daily_usage=50.0,
        patient_footfall=160,
        history=phc_history,
        horizon_days=7
    )

    assert res.phcId == phc_id
    assert res.daysToStockout == pytest.approx(2.0, rel=0.3)
    assert res.severity in [RiskSeverity.CRITICAL, RiskSeverity.HIGH_RISK]
    assert len(res.forecastDetails) == 7
    assert res.modelType == "lagged_ridge_timeseries"
    assert "mae" in res.evaluationMetrics

# 4. Deterministic Risk Engine Tests
def test_risk_engine_thresholds(dataset):
    forecaster = DemandForecaster()
    risk_engine = RiskEngine(critical_days_threshold=2.0)

    # Critical Case
    fc_critical = forecaster.forecast("phc-test", "Insulin", current_stock=30, daily_usage=30.0)
    alert_crit = risk_engine.assess_medicine_risk(fc_critical)
    assert alert_crit is not None
    assert alert_crit.severity == RiskSeverity.CRITICAL

    # Healthy Case
    fc_healthy = forecaster.forecast("phc-test", "ORS", current_stock=500, daily_usage=20.0)
    alert_healthy = risk_engine.assess_medicine_risk(fc_healthy)
    assert alert_healthy is None

# 5. Smart Redistribution & Donor Safety Buffer Tests
def test_smart_redistribution_donor_safety(store):
    forecaster = DemandForecaster()
    redist = RedistributionEngine()

    all_phcs = store.list_phcs()
    # Deficit PHC: Sector 22 Noida (critical on Insulin)
    deficit_phc = [p for p in all_phcs if p["id"] == "phc-noida-sec22"][0]
    deficit_inv = store.get_inventory_item("phc-noida-sec22", "Insulin Glargine 100IU")
    deficit_hist = store.list_daily_records("phc-noida-sec22", days=60)

    deficit_fc = forecaster.forecast(
        "phc-noida-sec22", "Insulin Glargine 100IU",
        current_stock=deficit_inv["quantity"],
        daily_usage=deficit_inv["dailyUsage"],
        history=deficit_hist
    )

    donor_map = {}
    for p in all_phcs:
        inv = store.get_inventory_item(p["id"], "Insulin Glargine 100IU")
        hist = store.list_daily_records(p["id"], days=60)
        donor_map[p["id"]] = forecaster.forecast(
            p["id"], "Insulin Glargine 100IU", inv["quantity"], inv["dailyUsage"], history=hist
        )

    recs = redist.find_transfer_recommendations(
        deficit_phc=deficit_phc,
        deficit_forecast=deficit_fc,
        candidate_donors=all_phcs,
        donor_forecasts_map=donor_map
    )

    assert len(recs) > 0
    top_donor = recs[0]
    # Sector 62 Noida was specifically engineered as a surplus donor for Sector 22 Noida
    assert top_donor.fromPhcId == "phc-noida-sec62"
    assert top_donor.toPhcId == "phc-noida-sec22"
    assert top_donor.quantity > 0
    assert top_donor.donorRemainingStockAfterTransfer >= top_donor.donorSafetyBuffer
    assert top_donor.status == TransferStatus.PROPOSED

# 6. Grounded Gemini Operations Assistant Tests
def test_grounded_assistant_queries(store):
    assistant = GroundedOperationsAssistant(store=store)
    res = assistant.query("Which centres have the highest risk right now?")

    assert res["grounded"] is True
    assert len(res["answer"]) > 20
    assert "AarogyaGrid" in res["answer"] or "risk" in res["answer"].lower()

# 7. Simulated Federated AI (3 Regional Nodes) Tests
def test_federated_ai_training_round():
    coordinator = FederatedCoordinator()
    res = coordinator.run_federated_round(round_num=1)

    assert res["status"] == "COMPLETED"
    assert res["participatingNodes"] == 3
    assert len(res["aggregatedGlobalModel"]["weights"]) == 4
    assert len(res["nodeEvaluations"]) == 3
    for node_eval in res["nodeEvaluations"]:
        assert "globalModelMAE" in node_eval["localValidationWithGlobalModel"]

# 8. Emergency Outbreak Surge Simulation Tests
def test_emergency_dengue_surge(store):
    sim = EmergencySurgeSimulator(store=store)
    res = sim.run_dengue_surge_simulation(target_districts=["Delhi East", "Ghaziabad"])

    assert res["summary"]["affectedCentresCount"] > 0
    assert res["summary"]["emergencyAlertsGenerated"] > 0
    assert len(res["emergencyRedistributionPlan"]) > 0

# 9. FastAPI REST Endpoints Tests (Node.js compatibility)
def test_api_predict_contract(client):
    # Tests exact contract expected by Node.js Backend POST /api/ai/predict
    payload = {
        "phcId": "phc-delhi-east-01",
        "medicine": "Paracetamol 500mg",
        "currentStock": 35,
        "dailyUsage": 25.0,
        "patientFootfall": 170
    }
    response = client.post("/predict", json=payload)
    assert response.status_code == 200
    data = response.json()

    assert data["phcId"] == "phc-delhi-east-01"
    assert data["medicine"] == "Paracetamol 500mg"
    assert "daysToStockout" in data
    assert "stockoutRisk" in data
    assert "severity" in data
    assert "recommendedBufferStock" in data
    assert "suggestedTransferQuantity" in data
    assert data["severity"] in ["HIGH_RISK", "CRITICAL"]

def test_api_health_and_summary(client):
    resp_health = client.get("/health")
    assert resp_health.status_code == 200
    assert resp_health.json()["status"] == "healthy"

    resp_summary = client.get("/summary/dashboard")
    assert resp_summary.status_code == 200
    assert resp_summary.json()["monitoredCentres"] == 16
