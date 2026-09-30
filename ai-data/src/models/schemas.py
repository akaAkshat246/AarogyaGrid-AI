"""
AarogyaGrid AI - Core Data Models & Schemas
Phase 3: Data Contracts
"""

from datetime import date, datetime, timezone
from enum import Enum
from typing import List, Optional, Dict, Any
from pydantic import BaseModel, Field, field_validator

class RiskSeverity(str, Enum):
    HEALTHY = "HEALTHY"
    WATCH = "WATCH"
    HIGH_RISK = "HIGH_RISK"
    CRITICAL = "CRITICAL"

class TransferStatus(str, Enum):
    PROPOSED = "PROPOSED"
    PENDING = "PENDING"
    APPROVED = "APPROVED"
    IN_TRANSIT = "IN_TRANSIT"
    COMPLETED = "COMPLETED"
    CANCELLED = "CANCELLED"
    REJECTED = "REJECTED"

class PHCModel(BaseModel):
    id: str = Field(..., description="Unique PHC ID e.g. phc-delhi-east-01")
    name: str = Field(..., min_length=1, max_length=200)
    district: str = Field(..., min_length=1, max_length=100)
    state: str = Field(..., min_length=1, max_length=100)
    latitude: float = Field(..., ge=-90.0, le=90.0)
    longitude: float = Field(..., ge=-180.0, le=180.0)
    totalBeds: int = Field(..., ge=0)
    doctorsTotal: int = Field(..., ge=0)
    nursesTotal: int = Field(..., ge=0)

class InventoryItemModel(BaseModel):
    id: Optional[str] = None
    phcId: str = Field(..., min_length=1)
    medicine: str = Field(..., min_length=1, max_length=200)
    unit: str = Field(default="Units")
    quantity: int = Field(..., ge=0)
    minimumStock: int = Field(default=0, ge=0)
    dailyUsage: float = Field(default=0.0, ge=0.0)

class BedCapacityModel(BaseModel):
    phcId: Optional[str] = None
    totalBeds: int = Field(..., ge=0)
    occupiedBeds: int = Field(..., ge=0)
    availableBeds: Optional[int] = None

    @field_validator("occupiedBeds")
    def validate_beds(cls, v, info):
        total = info.data.get("totalBeds")
        if total is not None and v > total:
            raise ValueError("Occupied beds cannot exceed total beds")
        return v

class StaffRosterModel(BaseModel):
    phcId: Optional[str] = None
    doctorsTotal: int = Field(..., ge=0)
    doctorsPresent: int = Field(..., ge=0)
    nursesTotal: int = Field(..., ge=0)
    nursesPresent: int = Field(..., ge=0)

    @field_validator("doctorsPresent")
    def validate_docs(cls, v, info):
        total = info.data.get("doctorsTotal")
        if total is not None and v > total:
            raise ValueError("Doctors present cannot exceed total doctors")
        return v

    @field_validator("nursesPresent")
    def validate_nurses(cls, v, info):
        total = info.data.get("nursesTotal")
        if total is not None and v > total:
            raise ValueError("Nurses present cannot exceed total nurses")
        return v

class FootfallModel(BaseModel):
    phcId: str
    date: str = Field(..., pattern=r"^\d{4}-\d{2}-\d{2}$")
    patients: int = Field(..., ge=0)

class PredictionInputModel(BaseModel):
    """Payload matching Node.js Backend POST /api/ai/predict contract"""
    phcId: str
    medicine: str
    currentStock: int = Field(..., ge=0)
    dailyUsage: float = Field(..., ge=0.0)
    patientFootfall: int = Field(default=0, ge=0)

class DailyForecastPoint(BaseModel):
    dayOffset: int
    date: str
    predictedDemand: float
    projectedRemainingStock: float
    stockoutRiskProbability: float

class ForecastResultModel(BaseModel):
    phcId: str
    medicine: str
    currentStock: int
    predictedDemandTomorrow: float
    daysToStockout: float
    stockoutRisk: float
    severity: RiskSeverity
    recommendedBufferStock: int
    suggestedTransferQuantity: int
    forecastHorizonDays: int = 7
    forecastDetails: List[DailyForecastPoint] = []
    modelType: str = "lagged_ridge_timeseries"
    modelVersion: str = "v1.0.0"
    evaluationMetrics: Dict[str, float] = {}
    timestamp: str = Field(default_factory=lambda: datetime.now(timezone.utc).isoformat())

class RiskAlertModel(BaseModel):
    id: Optional[str] = None
    phcId: str
    type: str = "STOCKOUT_PREDICTION"
    severity: RiskSeverity
    medicine: Optional[str] = None
    message: str
    daysRemaining: Optional[float] = None
    actionRequired: bool = True
    resolved: bool = False
    createdAt: str = Field(default_factory=lambda: datetime.now(timezone.utc).isoformat())

class TransferRecommendationModel(BaseModel):
    id: Optional[str] = None
    fromPhcId: str
    fromPhcName: Optional[str] = None
    toPhcId: str
    toPhcName: Optional[str] = None
    medicine: str
    quantity: int = Field(..., gt=0)
    distanceKm: float
    estimatedTransitMinutes: int
    reason: str
    donorRemainingStockAfterTransfer: int
    donorSafetyBuffer: int
    status: TransferStatus = TransferStatus.PROPOSED
    proposedAt: str = Field(default_factory=lambda: datetime.now(timezone.utc).isoformat())
    approvedBy: Optional[str] = None
    approvedAt: Optional[str] = None
