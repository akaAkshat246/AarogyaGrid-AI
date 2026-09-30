"""
AarogyaGrid AI - Emergency Mode & Outbreak Surge Simulator
Phase 12: Emergency Dengue & Seasonal Outbreak Stress Simulation
"""

from typing import Dict, Any, List, Optional
from datetime import datetime, timezone
from ..storage.store import BaseDataStore, get_store
from ..ml.forecasting import DemandForecaster
from ..risk.risk_engine import RiskEngine
from ..redistribution.redistribution_engine import RedistributionEngine
from ..models.schemas import RiskSeverity

class EmergencySurgeSimulator:
    def __init__(self, store: Optional[BaseDataStore] = None):
        self.store = store or get_store()
        self.forecaster = DemandForecaster()
        self.risk_engine = RiskEngine()
        self.redist_engine = RedistributionEngine()

    def run_dengue_surge_simulation(
        self,
        target_districts: Optional[List[str]] = None,
        patient_surge_factor: float = 1.45,
        iv_fluid_multiplier: float = 2.4,
        ors_multiplier: float = 2.6,
        paracetamol_multiplier: float = 1.9
    ) -> Dict[str, Any]:
        """
        Simulates an active Dengue/Vector-borne outbreak surge across selected districts.
        """
        if target_districts is None:
            target_districts = ["Delhi East", "Ghaziabad", "Gautam Buddha Nagar"]

        all_phcs = self.store.list_phcs()
        affected_phcs = [p for p in all_phcs if p.get("district") in target_districts]
        unaffected_phcs = [p for p in all_phcs if p.get("district") not in target_districts]

        surge_results = []
        emergency_alerts = []
        all_forecast_map = {}

        # 1. Recalculate demands and risks for affected centres
        for phc in affected_phcs:
            phc_id = phc["id"]
            history = self.store.list_daily_records(phc_id, days=60)
            inv_items = self.store.list_inventory(phc_id)

            # Simulated surge footfall
            base_patients = phc.get("baseFootfall", 160)
            surge_patients = int(round(base_patients * patient_surge_factor))

            # Recalculate bed occupancy under surge
            total_beds = phc.get("totalBeds", 20)
            surge_occupied_beds = min(total_beds, int(round(total_beds * 0.94)))
            bed_info = {
                "phcId": phc_id,
                "totalBeds": total_beds,
                "projectedEveningOccupiedBeds": surge_occupied_beds,
                "projectedAvailableBeds": max(0, total_beds - surge_occupied_beds),
                "projectedOccupancyRatePercent": round((surge_occupied_beds / max(1, total_beds)) * 100, 1),
                "bedRiskSeverity": RiskSeverity.CRITICAL if surge_occupied_beds >= total_beds * 0.92 else RiskSeverity.HIGH_RISK,
                "patientsPerDoctor": round(surge_patients / max(1, phc.get("doctorsTotal", 6)), 1),
                "staffStrainSeverity": RiskSeverity.HIGH_RISK
            }

            med_forecasts = []
            for item in inv_items:
                med_name = item["medicine"]
                base_daily = item["dailyUsage"]
                surge_mult = 1.0
                if "IV Normal" in med_name: surge_mult = iv_fluid_multiplier
                elif "ORS" in med_name: surge_mult = ors_multiplier
                elif "Paracetamol" in med_name: surge_mult = paracetamol_multiplier

                surge_daily_demand = round(base_daily * surge_mult, 1)

                fc = self.forecaster.forecast(
                    phc_id=phc_id,
                    medicine=med_name,
                    current_stock=item["quantity"],
                    daily_usage=surge_daily_demand,
                    patient_footfall=surge_patients,
                    history=history
                )
                med_forecasts.append(fc)
                all_forecast_map[f"{phc_id}_{med_name}"] = fc

            health = self.risk_engine.assess_phc_overall_health(phc_id, med_forecasts, bed_info)
            for a in health["alerts"]:
                emergency_alerts.append({
                    "phcId": phc_id,
                    "phcName": phc.get("name"),
                    "type": a.type,
                    "severity": a.severity.value,
                    "message": f"[SURGE SIMULATION] {a.message}"
                })

            surge_results.append({
                "phcId": phc_id,
                "phcName": phc.get("name"),
                "district": phc.get("district"),
                "surgeFootfall": surge_patients,
                "surgeOccupancyRate": bed_info["projectedOccupancyRatePercent"],
                "healthScore": health["operationalHealthScore"],
                "criticalMedicines": [f.medicine for f in med_forecasts if f.severity == RiskSeverity.CRITICAL]
            })

        # 2. Compute forecasts for potential donor centres
        for donor in unaffected_phcs:
            donor_id = donor["id"]
            inv_items = self.store.list_inventory(donor_id)
            history = self.store.list_daily_records(donor_id, days=60)
            for item in inv_items:
                fc = self.forecaster.forecast(
                    phc_id=donor_id,
                    medicine=item["medicine"],
                    current_stock=item["quantity"],
                    daily_usage=item["dailyUsage"],
                    history=history
                )
                all_forecast_map[f"{donor_id}_{item['medicine']}"] = fc

        # 3. Formulate Emergency Redistribution Plan
        emergency_transfers = []
        for phc in affected_phcs:
            phc_id = phc["id"]
            for med_name in ["IV Normal Saline 500ml", "ORS Rehydration Salts", "Paracetamol 500mg"]:
                deficit_fc = all_forecast_map.get(f"{phc_id}_{med_name}")
                if deficit_fc and deficit_fc.severity in [RiskSeverity.CRITICAL, RiskSeverity.HIGH_RISK]:
                    recs = self.redist_engine.find_transfer_recommendations(
                        deficit_phc=phc,
                        deficit_forecast=deficit_fc,
                        candidate_donors=unaffected_phcs + [p for p in affected_phcs if p["id"] != phc_id],
                        donor_forecasts_map={d["id"]: all_forecast_map.get(f"{d['id']}_{med_name}") for d in all_phcs}
                    )
                    if recs:
                        emergency_transfers.append(recs[0])

        return {
            "scenario": "Dengue Outbreak Surge (Demo Scenario)",
            "simulationTimestamp": datetime.now(timezone.utc).isoformat(),
            "disclosure": "THIS IS A SIMULATED OPERATIONAL SCENARIO FOR HACKATHON DEMO. NOT A CLINICAL FORECAST.",
            "surgeParameters": {
                "patientFootfallSurge": f"+{int((patient_surge_factor - 1.0) * 100)}%",
                "ivFluidsDemandMultiplier": f"{iv_fluid_multiplier}x",
                "orsDemandMultiplier": f"{ors_multiplier}x",
                "paracetamolDemandMultiplier": f"{paracetamol_multiplier}x",
                "affectedDistricts": target_districts
            },
            "summary": {
                "affectedCentresCount": len(affected_phcs),
                "emergencyAlertsGenerated": len(emergency_alerts),
                "recommendedEmergencyTransfers": len(emergency_transfers)
            },
            "affectedCentres": surge_results,
            "emergencyAlerts": emergency_alerts,
            "emergencyRedistributionPlan": [t.model_dump() for t in emergency_transfers]
        }
