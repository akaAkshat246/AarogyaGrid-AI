"""
AarogyaGrid AI - Smart Redistribution Engine
Phase 6: Resource Redistribution & Human-in-the-loop Transfer Management
"""

import math
from datetime import datetime, timezone
from typing import List, Dict, Any, Optional
from ..models.schemas import (
    TransferStatus,
    TransferRecommendationModel,
    ForecastResultModel,
    PHCModel
)

def calculate_haversine_distance_km(lat1: float, lon1: float, lat2: float, lon2: float) -> float:
    """
    Calculates great-circle distance between two geographical points using Haversine formula.
    """
    r = 6371.0 # Earth's radius in kilometers
    d_lat = math.radians(lat2 - lat1)
    d_lon = math.radians(lon2 - lon1)
    a = (math.sin(d_lat / 2.0) ** 2 +
         math.cos(math.radians(lat1)) * math.cos(math.radians(lat2)) * math.sin(d_lon / 2.0) ** 2)
    c = 2.0 * math.atan2(math.sqrt(a), math.sqrt(1.0 - a))
    return round(r * c, 2)

def estimate_transit_time_minutes(distance_km: float) -> int:
    """
    Estimates road transit time in minutes (urban/suburban avg speed: 25-30 km/h + 10 min logistics buffer).
    """
    avg_speed_kmh = 28.0
    travel_mins = (distance_km / avg_speed_kmh) * 60.0
    total_mins = int(round(travel_mins + 10.0))
    return max(15, total_mins)

class RedistributionEngine:
    """
    Recommends safe, constraint-preserving stock redistribution between nearby healthcare centres.
    """
    def __init__(self, max_search_radius_km: float = 60.0, donor_surplus_share_ratio: float = 0.65):
        self.max_search_radius_km = max_search_radius_km
        self.donor_share_ratio = donor_surplus_share_ratio

    def find_transfer_recommendations(
        self,
        deficit_phc: Dict[str, Any],
        deficit_forecast: ForecastResultModel,
        candidate_donors: List[Dict[str, Any]],
        donor_forecasts_map: Dict[str, ForecastResultModel]
    ) -> List[TransferRecommendationModel]:
        """
        Identifies eligible donor centres and ranks feasible transfer options.
        """
        recommendations: List[TransferRecommendationModel] = []
        med_name = deficit_forecast.medicine
        needed_units = deficit_forecast.suggestedTransferQuantity
        if needed_units <= 0:
            return []

        def_lat = deficit_phc.get("latitude", 0.0)
        def_lon = deficit_phc.get("longitude", 0.0)
        def_id = deficit_phc["id"]
        def_name = deficit_phc.get("name", def_id)

        for donor in candidate_donors:
            donor_id = donor["id"]
            if donor_id == def_id:
                continue

            donor_name = donor.get("name", donor_id)
            donor_forecast = donor_forecasts_map.get(donor_id)
            if not donor_forecast or donor_forecast.medicine != med_name:
                continue

            # Check donor safety constraints
            donor_stock = donor_forecast.currentStock
            donor_safety_buffer = donor_forecast.recommendedBufferStock
            donor_7d_demand = donor_forecast.predictedDemandTomorrow * 7.0

            # Safe surplus = Current Stock - (7-day projected demand + Safety Buffer)
            safe_surplus = donor_stock - int(math.ceil(donor_7d_demand + donor_safety_buffer))

            if safe_surplus <= 10:
                # Donor cannot safely spare stock without risking its own patients
                continue

            # Calculate Distance & ETA
            donor_lat = donor.get("latitude", 0.0)
            donor_lon = donor.get("longitude", 0.0)
            distance = calculate_haversine_distance_km(def_lat, def_lon, donor_lat, donor_lon)

            if distance > self.max_search_radius_km:
                continue

            transit_eta = estimate_transit_time_minutes(distance)

            # Sizing transfer quantity conservatively
            max_spareable = int(math.floor(safe_surplus * self.donor_share_ratio))
            suggested_qty = min(needed_units, max_spareable)

            if suggested_qty <= 0:
                continue

            remaining_donor_stock = donor_stock - suggested_qty

            reason = (
                f"{donor_name} has {safe_surplus} units of safe surplus above its 7-day reserve ({donor_safety_buffer} buffer). "
                f"Transfer of {suggested_qty} units resolves {def_name}'s predicted stockout in {deficit_forecast.daysToStockout:.1f} days."
            )

            rec = TransferRecommendationModel(
                id=f"rec-{donor_id[:8]}-{def_id[:8]}-{int(datetime.now(timezone.utc).timestamp())}",
                fromPhcId=donor_id,
                fromPhcName=donor_name,
                toPhcId=def_id,
                toPhcName=def_name,
                medicine=med_name,
                quantity=suggested_qty,
                distanceKm=distance,
                estimatedTransitMinutes=transit_eta,
                reason=reason,
                donorRemainingStockAfterTransfer=remaining_donor_stock,
                donorSafetyBuffer=donor_safety_buffer,
                status=TransferStatus.PROPOSED
            )
            recommendations.append(rec)

        # Sort recommendations: Nearest and highest surplus first
        recommendations.sort(key=lambda r: (r.distanceKm, -r.quantity))
        return recommendations
