"""
AarogyaGrid AI - Live Hackathon Demo Story Runner
Executes the complete 2-minute operational scenario in the terminal:
1. Normal PHC state -> 2. AI Predicts Stockout -> 3. Critical Alert Generated
4. Nearby Surplus Donor Found -> 5. Transfer Approved -> 6. Gemini Copilot Q&A
"""

import os
import sys
import time
from datetime import datetime, timezone

# Ensure clean UTF-8 console output on Windows
if sys.stdout and hasattr(sys.stdout, 'reconfigure'):
    sys.stdout.reconfigure(encoding='utf-8')

# Add ai-data to sys.path
sys.path.insert(0, os.path.join(os.path.dirname(os.path.dirname(os.path.abspath(__file__))), "ai-data"))

from src.storage.store import LocalDataStore
from src.ml.forecasting import DemandForecaster
from src.risk.risk_engine import RiskEngine
from src.redistribution.redistribution_engine import RedistributionEngine
from src.assistant.gemini_assistant import GroundedOperationsAssistant
from src.models.schemas import RiskSeverity, TransferStatus

def print_header(title):
    print("\n" + "=" * 70)
    print(f"  {title.upper()}")
    print("=" * 70)

def run_demo():
    print_header("AarogyaGrid AI — 2-Minute Pitch & Operational Demo")
    print("Mission: Predict. Share. Respond. (Resource Intelligence Platform)\n")
    time.sleep(1)

    store = LocalDataStore()
    forecaster = DemandForecaster()
    risk_engine = RiskEngine()
    redist_engine = RedistributionEngine()
    assistant = GroundedOperationsAssistant(store=store)

    # Step 1: Normal PHC State
    print_header("Step 1: Baseline Facility State")
    all_phcs = store.list_phcs()
    deficit_phc = [p for p in all_phcs if p["id"] == "phc-noida-sec22"][0]
    inv_item = store.get_inventory_item("phc-noida-sec22", "Insulin Glargine 100IU")
    history = store.list_daily_records("phc-noida-sec22", days=60)

    print(f"Facility:     {deficit_phc['name']} ({deficit_phc['district']}, {deficit_phc['state']})")
    print(f"Resource:     {inv_item['medicine']}")
    print(f"Stock on hand: {inv_item['quantity']} vials")
    print(f"Avg Usage:    {inv_item['dailyUsage']} vials/day")
    print("Status:       Appears stable on simple inventory sheet...")
    time.sleep(1.5)

    # Step 2: AI Forecasting Engine
    print_header("Step 2: AI Demand Forecasting & Shortage Detection")
    forecast = forecaster.forecast(
        phc_id="phc-noida-sec22",
        medicine="Insulin Glargine 100IU",
        current_stock=inv_item["quantity"],
        daily_usage=inv_item["dailyUsage"],
        history=history,
        horizon_days=7
    )

    print(f"Tomorrow Predicted Demand: {forecast.predictedDemandTomorrow:.1f} vials")
    print(f"Estimated Days to Stockout: {forecast.daysToStockout:.1f} DAYS")
    print(f"Stockout Probability:       {forecast.stockoutRisk * 100:.0f}%")
    print(f"Predicted Severity:         {forecast.severity.value}")
    print(f"Recommended Safety Buffer:  {forecast.recommendedBufferStock} vials")
    print(f"Deficit to Replenish:       {forecast.suggestedTransferQuantity} vials")
    time.sleep(1.5)

    # Step 3: Risk Engine & Alert Generation
    print_header("Step 3: Automated Early Warning Alert")
    alert = risk_engine.assess_medicine_risk(forecast)
    saved_alert = store.create_alert(alert.model_dump())
    print(f"[🚨 ALERT GENERATED] Severity: {saved_alert['severity']}")
    print(f"Message: {saved_alert['message']}")
    time.sleep(1.5)

    # Step 4: Smart Redistribution Engine
    print_header("Step 4: Smart Redistribution & Safe Surplus Discovery")
    donor_map = {}
    for p in all_phcs:
        p_inv = store.get_inventory_item(p["id"], "Insulin Glargine 100IU")
        p_hist = store.list_daily_records(p["id"], days=60)
        donor_map[p["id"]] = forecaster.forecast(
            p["id"], "Insulin Glargine 100IU", p_inv["quantity"], p_inv["dailyUsage"], history=p_hist
        )

    recommendations = redist_engine.find_transfer_recommendations(
        deficit_phc=deficit_phc,
        deficit_forecast=forecast,
        candidate_donors=all_phcs,
        donor_forecasts_map=donor_map
    )

    top_rec = recommendations[0]
    print(f"Candidate Donor Found:   {top_rec.fromPhcName}")
    print(f"Distance & Transit ETA:  {top_rec.distanceKm} km (Est: {top_rec.estimatedTransitMinutes} mins)")
    print(f"Suggested Transfer Qty:  {top_rec.quantity} vials")
    print(f"Donor Reserve Preserved: {top_rec.donorRemainingStockAfterTransfer} vials (Buffer: {top_rec.donorSafetyBuffer} locked)")
    print(f"Algorithm Rationale:     {top_rec.reason}")
    time.sleep(1.5)

    # Step 5: Human-in-the-Loop Admin Approval
    print_header("Step 5: Human-in-the-Loop Administrator Approval")
    transfer_order = store.create_transfer({
        "fromPhcId": top_rec.fromPhcId,
        "fromPhcName": top_rec.fromPhcName,
        "toPhcId": top_rec.toPhcId,
        "toPhcName": top_rec.toPhcName,
        "medicine": top_rec.medicine,
        "quantity": top_rec.quantity,
        "distanceKm": top_rec.distanceKm,
        "status": TransferStatus.PROPOSED.value,
        "reason": top_rec.reason
    })

    print(f"Transfer Order #{transfer_order['id']} PROPOSED.")
    print("Action: District Administrator clicks [APPROVE TRANSFER] in portal...")
    time.sleep(1)

    approved = store.update_transfer_status(
        transfer_id=transfer_order["id"],
        status=TransferStatus.APPROVED.value,
        approved_by="DistrictAdmin-GautamBuddhaNagar"
    )
    print(f"[✅ ORDER APPROVED] Status: {approved['status']} | Approved By: {approved['approvedBy']}")
    print(f"Logistics status: In-transit dispatch initiated. Predicted crisis PREVENTED!")
    time.sleep(1.5)

    # Step 6: Gemini Grounded Assistant
    print_header("Step 6: Grounded Gemini Health Operations Assistant")
    query = "Which centres have the highest risk in the next 24 hours?"
    print(f"User Question: \"{query}\"")
    assistant_resp = assistant.query(query)
    print(f"\nGemini Response (Grounded in live system state):\n{assistant_resp['answer']}")

    print("\n" + "=" * 70)
    print("  DEMO COMPLETED SUCCESSFULLY — READY FOR HACKATHON JURY!")
    print("=" * 70 + "\n")

if __name__ == "__main__":
    run_demo()
