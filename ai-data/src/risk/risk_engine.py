"""
AarogyaGrid AI - Deterministic Resource Risk Engine
Phase 5: Resource Risk & Buffer Stock Engine
"""

from typing import List, Dict, Any, Optional
from ..models.schemas import RiskSeverity, RiskAlertModel, ForecastResultModel

class RiskEngine:
    """
    Evaluates operational risk across medicines, beds, and staffing with transparent, configurable thresholds.
    """
    def __init__(
        self,
        critical_days_threshold: float = 2.0,
        high_risk_days_threshold: float = 4.0,
        watch_days_threshold: float = 7.0,
        bed_critical_occupancy_pct: float = 92.0,
        bed_high_occupancy_pct: float = 80.0
    ):
        self.critical_days = critical_days_threshold
        self.high_risk_days = high_risk_days_threshold
        self.watch_days = watch_days_threshold
        self.bed_critical_pct = bed_critical_occupancy_pct
        self.bed_high_pct = bed_high_occupancy_pct

    def assess_medicine_risk(self, forecast: ForecastResultModel) -> Optional[RiskAlertModel]:
        """
        Evaluates stockout risk for a specific medicine and emits a risk alert if thresholds are exceeded.
        """
        days = forecast.daysToStockout
        if days <= self.critical_days:
            severity = RiskSeverity.CRITICAL
            msg = (f"CRITICAL: {forecast.phcId} is predicted to STOCK OUT of {forecast.medicine} "
                   f"in {days:.1f} days (Stock: {forecast.currentStock}, Tomorrow Demand: {forecast.predictedDemandTomorrow:.1f}). "
                   f"Immediate replenishment or transfer of {forecast.suggestedTransferQuantity} units recommended.")
        elif days <= self.high_risk_days:
            severity = RiskSeverity.HIGH_RISK
            msg = (f"HIGH RISK: {forecast.phcId} has only {days:.1f} days of {forecast.medicine} remaining. "
                   f"Stock is below recommended safety buffer ({forecast.recommendedBufferStock} units).")
        elif days <= self.watch_days:
            severity = RiskSeverity.WATCH
            msg = f"WATCH: {forecast.phcId} {forecast.medicine} is nearing re-order threshold ({days:.1f} days left)."
        else:
            return None

        return RiskAlertModel(
            phcId=forecast.phcId,
            type="MEDICINE_STOCKOUT_RISK",
            severity=severity,
            medicine=forecast.medicine,
            message=msg,
            daysRemaining=days,
            actionRequired=severity in [RiskSeverity.CRITICAL, RiskSeverity.HIGH_RISK]
        )

    def assess_phc_overall_health(
        self,
        phc_id: str,
        medicine_forecasts: List[ForecastResultModel],
        bed_staff_info: Dict[str, Any]
    ) -> Dict[str, Any]:
        """
        Calculates holistic PHC operational health score (0 to 100) and aggregates active alerts.
        """
        health_score = 100.0
        alerts: List[RiskAlertModel] = []
        critical_count = 0
        high_risk_count = 0

        # Assess medicines
        for f in medicine_forecasts:
            alert = self.assess_medicine_risk(f)
            if alert:
                alerts.append(alert)
                if alert.severity == RiskSeverity.CRITICAL:
                    health_score -= 25.0
                    critical_count += 1
                elif alert.severity == RiskSeverity.HIGH_RISK:
                    health_score -= 15.0
                    high_risk_count += 1
                elif alert.severity == RiskSeverity.WATCH:
                    health_score -= 5.0

        # Assess beds
        occ_rate = bed_staff_info.get("projectedOccupancyRatePercent", 60.0)
        if occ_rate >= self.bed_critical_pct:
            health_score -= 20.0
            alerts.append(RiskAlertModel(
                phcId=phc_id,
                type="BED_CAPACITY_CRITICAL",
                severity=RiskSeverity.CRITICAL,
                message=f"CRITICAL BED OVERLOAD: Projected evening occupancy is {occ_rate:.1f}%. Only {bed_staff_info.get('projectedAvailableBeds', 0)} beds available."
            ))
        elif occ_rate >= self.bed_high_pct:
            health_score -= 10.0
            alerts.append(RiskAlertModel(
                phcId=phc_id,
                type="BED_CAPACITY_HIGH",
                severity=RiskSeverity.HIGH_RISK,
                message=f"HIGH BED OCCUPANCY: Projected evening occupancy is {occ_rate:.1f}%."
            ))

        # Assess staff strain
        staff_strain = bed_staff_info.get("staffStrainSeverity", RiskSeverity.HEALTHY)
        if staff_strain == RiskSeverity.HIGH_RISK:
            health_score -= 10.0
            alerts.append(RiskAlertModel(
                phcId=phc_id,
                type="STAFF_STRAIN_HIGH",
                severity=RiskSeverity.HIGH_RISK,
                message=f"STAFF STRAIN: High patient-to-doctor ratio ({bed_staff_info.get('patientsPerDoctor', 0)}:1)."
            ))

        final_score = int(max(10, min(100, round(health_score))))
        if critical_count > 0 or final_score < 50:
            overall_status = RiskSeverity.CRITICAL
        elif high_risk_count > 0 or final_score < 75:
            overall_status = RiskSeverity.HIGH_RISK
        elif len(alerts) > 0 or final_score < 90:
            overall_status = RiskSeverity.WATCH
        else:
            overall_status = RiskSeverity.HEALTHY

        return {
            "phcId": phc_id,
            "operationalHealthScore": final_score,
            "overallStatus": overall_status,
            "criticalAlertsCount": critical_count,
            "highRiskAlertsCount": high_risk_count,
            "totalAlerts": len(alerts),
            "alerts": alerts
        }
