"""
AarogyaGrid AI - End-to-End Vertical Slice Verification Test
Tests: Synthetic Data -> Storage -> ML Forecast -> Risk Alert -> Redistribution Recommendation -> Transfer Approval
"""

from src.storage.store import LocalDataStore
from src.ml.forecasting import DemandForecaster
from src.risk.risk_engine import RiskEngine
from src.redistribution.redistribution_engine import RedistributionEngine
from src.models.schemas import RiskSeverity, TransferStatus

def test_full_vertical_slice():
    # 1. Initialize local store loaded with 16 PHCs & 60-day records
    store = LocalDataStore()
    phcs = store.list_phcs()
    assert len(phcs) == 16

    # 2. Deficit centre: Sector 22 Noida (critical on Insulin)
    deficit_phc = [p for p in phcs if p["id"] == "phc-noida-sec22"][0]
    inv_item = store.get_inventory_item("phc-noida-sec22", "Insulin Glargine 100IU")
    history = store.list_daily_records("phc-noida-sec22", days=60)

    # 3. AI Forecast
    forecaster = DemandForecaster()
    forecast = forecaster.forecast(
        phc_id="phc-noida-sec22",
        medicine="Insulin Glargine 100IU",
        current_stock=inv_item["quantity"],
        daily_usage=inv_item["dailyUsage"],
        history=history
    )
    assert forecast.severity == RiskSeverity.CRITICAL
    assert forecast.daysToStockout <= 2.0

    # 4. Risk Engine: Generate Alert
    risk_engine = RiskEngine()
    alert = risk_engine.assess_medicine_risk(forecast)
    assert alert is not None
    saved_alert = store.create_alert(alert.model_dump())
    assert saved_alert["id"] is not None

    # 5. Smart Redistribution: Find candidate donor with safe surplus
    redist_engine = RedistributionEngine()
    donor_map = {}
    for p in phcs:
        p_inv = store.get_inventory_item(p["id"], "Insulin Glargine 100IU")
        p_hist = store.list_daily_records(p["id"], days=60)
        donor_map[p["id"]] = forecaster.forecast(
            p["id"], "Insulin Glargine 100IU", p_inv["quantity"], p_inv["dailyUsage"], history=p_hist
        )

    recommendations = redist_engine.find_transfer_recommendations(
        deficit_phc=deficit_phc,
        deficit_forecast=forecast,
        candidate_donors=phcs,
        donor_forecasts_map=donor_map
    )
    assert len(recommendations) > 0
    top_rec = recommendations[0]

    # 6. Transfer Workflow: Proposed -> Approved by Admin
    transfer_record = store.create_transfer({
        "fromPhcId": top_rec.fromPhcId,
        "fromPhcName": top_rec.fromPhcName,
        "toPhcId": top_rec.toPhcId,
        "toPhcName": top_rec.toPhcName,
        "medicine": top_rec.medicine,
        "quantity": top_rec.quantity,
        "distanceKm": top_rec.distanceKm,
        "status": top_rec.status.value,
        "reason": top_rec.reason
    })

    # Admin approves transfer
    approved_transfer = store.update_transfer_status(
        transfer_id=transfer_record["id"],
        status=TransferStatus.APPROVED.value,
        approved_by="DistrictAdmin-Noida"
    )
    assert approved_transfer["status"] == "APPROVED"
    assert approved_transfer["approvedBy"] == "DistrictAdmin-Noida"
