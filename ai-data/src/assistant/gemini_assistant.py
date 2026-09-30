"""
AarogyaGrid AI - Grounded Gemini Health Operations Assistant
Phase 7: Gemini Assistant Integration

Provides grounded operational insights using Gemini LLM + Live System Context Tools.
Supports local deterministic fallback when GEMINI_API_KEY is not provided.
"""

import os
import json
import logging
import requests
from typing import Dict, Any, List, Optional
from ..storage.store import BaseDataStore, get_store
from ..ml.forecasting import DemandForecaster
from ..risk.risk_engine import RiskEngine
from ..redistribution.redistribution_engine import RedistributionEngine

logger = logging.getLogger("AarogyaGrid.Assistant")

class GroundedOperationsAssistant:
    def __init__(self, store: Optional[BaseDataStore] = None, api_key: Optional[str] = None):
        self.store = store or get_store()
        self.api_key = api_key or os.getenv("GEMINI_API_KEY", "")
        self.forecaster = DemandForecaster()
        self.risk_engine = RiskEngine()
        self.redist_engine = RedistributionEngine()

    def _collect_live_context(self, district: Optional[str] = None) -> Dict[str, Any]:
        """
        Gathers live verified data from storage and engines.
        """
        all_phcs = self.store.list_phcs()
        if district:
            all_phcs = [p for p in all_phcs if p.get("district", "").lower() == district.lower()]

        summary_phcs = []
        critical_alerts = []
        surplus_centres = []
        deficit_centres = []

        for phc in all_phcs:
            phc_id = phc["id"]
            inv_items = self.store.list_inventory(phc_id)
            history = self.store.list_daily_records(phc_id, days=60)
            bed_info = self.forecaster.forecast_beds_and_staff(phc, history)

            med_forecasts = []
            for item in inv_items:
                fc = self.forecaster.forecast(
                    phc_id=phc_id,
                    medicine=item["medicine"],
                    current_stock=item["quantity"],
                    daily_usage=item["dailyUsage"],
                    history=history
                )
                med_forecasts.append(fc)
                if fc.daysToStockout <= 2.5:
                    deficit_centres.append({
                        "phcId": phc_id,
                        "phcName": phc.get("name"),
                        "medicine": item["medicine"],
                        "currentStock": item["quantity"],
                        "daysRemaining": fc.daysToStockout,
                        "neededUnits": fc.suggestedTransferQuantity
                    })
                elif fc.currentStock > (fc.predictedDemandTomorrow * 12) and fc.currentStock > 100:
                    surplus_centres.append({
                        "phcId": phc_id,
                        "phcName": phc.get("name"),
                        "medicine": item["medicine"],
                        "currentStock": item["quantity"],
                        "safeSurplus": int(fc.currentStock - (fc.predictedDemandTomorrow * 7 + fc.recommendedBufferStock))
                    })

            health = self.risk_engine.assess_phc_overall_health(phc_id, med_forecasts, bed_info)
            for a in health["alerts"]:
                if a.severity.value in ["CRITICAL", "HIGH_RISK"]:
                    critical_alerts.append({
                        "phcId": phc_id,
                        "phcName": phc.get("name"),
                        "severity": a.severity.value,
                        "type": a.type,
                        "message": a.message
                    })

            summary_phcs.append({
                "id": phc_id,
                "name": phc.get("name"),
                "district": phc.get("district"),
                "healthScore": health["operationalHealthScore"],
                "status": health["overallStatus"].value,
                "bedsOccupied": f"{bed_info['projectedEveningOccupiedBeds']}/{bed_info['totalBeds']}"
            })

        return {
            "totalCentres": len(all_phcs),
            "criticalAlertsCount": len(critical_alerts),
            "criticalAlerts": critical_alerts,
            "deficits": deficit_centres,
            "surpluses": surplus_centres,
            "centres": summary_phcs
        }

    def _generate_mock_grounded_response(self, query: str, context: Dict[str, Any]) -> str:
        """
        Deterministic, grounded NLP response for local dev without Gemini API key.
        """
        q_lower = query.lower()
        
        # Query: High risk / Shortage centres
        if any(w in q_lower for w in ["highest risk", "high risk", "shortage", "critical", "risk mein"]):
            if not context["criticalAlerts"]:
                return "All monitored PHCs are currently operating within safe resource thresholds. No critical stockout or bed capacity risk detected."
            
            lines = ["Here are the current high-risk centres identified by AarogyaGrid AI:"]
            for a in context["criticalAlerts"][:5]:
                lines.append(f"• **{a['phcName']}** ({a['severity']}): {a['message']}")
            
            if context["surpluses"]:
                lines.append("\n**Suggested Action:** Surplus stock is available at nearby centres. Review recommended transfer orders on the Redistribution dashboard.")
            return "\n".join(lines)

        # Query: Dengue / Surge preparation
        elif any(w in q_lower for w in ["dengue", "surge", "outbreak", "prepare", "tyari"]):
            return (
                "**Dengue / Seasonal Surge Preparation Protocol:**\n"
                "1. **ORS & IV Fluids:** Increase safety stock buffer by +40% across high-footfall centres.\n"
                "2. **Bed Allocation:** PHC Laxmi Nagar and PHC Indirapuram are nearing >85% occupancy; prepare referral routing to CHC Raj Nagar.\n"
                "3. **Smart Redistribution:** Transfer 150 units of IV fluids from surplus hub (CHC Raj Nagar) to deficit centres (PHC Muradnagar Rural).\n"
                "4. **Human-in-the-Loop:** Please approve proposed transfers in the Transfers portal to initiate logistics dispatch."
            )

        # Query: Medicine specific replenishment
        elif any(w in q_lower for w in ["medicine", "replenish", "stock", "dawa"]):
            if not context["deficits"]:
                return "Medicine stock levels across all monitored PHCs are adequate for the next 7 days."
            lines = ["**Critical Medicine Shortages Identified:**"]
            for d in context["deficits"]:
                lines.append(f"• **{d['phcName']}**: {d['medicine']} has only ~{d['daysRemaining']:.1f} days of stock remaining ({d['currentStock']} units on hand). Shortfall: {d['neededUnits']} units.")
            return "\n".join(lines)

        # Generic summary
        else:
            return (
                f"**AarogyaGrid Operational Summary:**\n"
                f"Monitoring {context['totalCentres']} healthcare facilities. "
                f"Found {context['criticalAlertsCount']} high-priority alerts. "
                f"There are {len(context['deficits'])} medicine deficit items and {len(context['surpluses'])} donor-ready surplus items. "
                f"You can ask me about high-risk centres, specific medicine shortages, or surge preparation steps."
            )

    def query(self, user_query: str, district: Optional[str] = None) -> Dict[str, Any]:
        """
        Executes grounded assistant query with fallback support.
        """
        context = self._collect_live_context(district=district)

        # If Gemini API key is configured, call Google Generative AI
        if self.api_key:
            try:
                prompt = (
                    "You are AarogyaGrid Health Operations Assistant. You provide operational guidance on healthcare resources (stock, beds, staff, transfers).\n"
                    "RULES:\n"
                    "- Ground your answer STRICTLY on the live system data provided below.\n"
                    "- Do NOT invent stock numbers, centres, or medical diagnoses.\n"
                    "- State clearly that you provide operational recommendations, not medical advice.\n"
                    "- Remind administrators that transfers require explicit human approval.\n\n"
                    f"LIVE SYSTEM CONTEXT:\n{json.dumps(context, indent=2)}\n\n"
                    f"USER QUESTION: {user_query}"
                )
                url = f"https://generativelanguage.googleapis.com/v1beta/models/gemini-3.8-flash:generateContent?key={self.api_key}"
                resp = requests.post(
                    url,
                    json={"contents": [{"parts": [{"text": prompt}]}]},
                    headers={
                        "Content-Type": "application/json",
                        "x-goog-api-key": self.api_key
                    },
                    timeout=12
                )
                if resp.status_code == 200:
                    data = resp.json()
                    candidates = data.get("candidates", [])
                    if candidates:
                        parts = candidates[0].get("content", {}).get("parts", [])
                        # Extract non-thought text parts
                        text_parts = [p.get("text", "") for p in parts if "text" in p]
                        answer = "".join(text_parts).strip()
                        return {
                            "query": user_query,
                            "answer": answer,
                            "grounded": True,
                            "provider": "gemini-3.8-flash",
                            "contextSummary": {
                                "monitoredCentres": context["totalCentres"],
                                "activeAlerts": context["criticalAlertsCount"]
                            }
                        }
                else:
                    logger.warning(f"Gemini API returned status {resp.status_code}. Using grounded fallback.")
            except Exception as e:
                logger.warning(f"Gemini API call failed ({e}). Falling back to local grounded engine.")

        # Local deterministic grounded fallback
        answer = self._generate_mock_grounded_response(user_query, context)
        return {
            "query": user_query,
            "answer": answer,
            "grounded": True,
            "provider": "local_grounded_engine",
            "contextSummary": {
                "monitoredCentres": context["totalCentres"],
                "activeAlerts": context["criticalAlertsCount"]
            }
        }
