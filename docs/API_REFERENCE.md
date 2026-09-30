# AarogyaGrid AI — API Reference & Integration Manual

Complete endpoint specifications for the AarogyaGrid AI Platform.

---

## Service Endpoints Overview

| Base Service | Local Address | Framework | Default Port |
|---|---|---|---|
| **Node.js Express Backend** | `http://127.0.0.1:5000` | Express 5 + Firebase Admin | 5000 |
| **Python FastAPI AI Engine** | `http://127.0.0.1:8000` | FastAPI + Scikit-Learn | 8000 |

---

## 1. Node.js Express Backend Endpoints (`/api/*`)

### `GET /api/dashboard`
Returns high-level aggregate KPIs across all facilities or filtered by PHC.
* **Query Parameters:** `?phcId=ID` (optional), `?date=YYYY-MM-DD` (optional)
* **Response:** `{ success: true, data: { phcs, totalPatients, totalBeds, occupiedBeds, availableBeds, doctorsPresent, medicineShortages } }`

### `GET /api/phcs`
Lists all registered Primary Health Centres.
* **Response:** `{ success: true, data: [ { id, name, district, state, latitude, longitude } ] }`

### `GET /api/inventory/:phcId`
Returns real-time medicine inventory for a facility.
* **Response:** `{ success: true, data: [ { id, phcId, medicine, quantity, minimumStock, dailyUsage } ] }`

### `GET /api/transfers`
Lists all inter-facility transfer records.
* **Query Parameters:** `?phcId=ID&status=STATUS`
* **Status values:** `PENDING`, `APPROVED`, `IN_TRANSIT`, `COMPLETED`, `CANCELLED`

### `PUT /api/transfers/:id/status`
Advances the status of a transfer order (Human-in-the-loop).
* **Request Body:** `{ "status": "APPROVED" }`

---

## 2. Python FastAPI AI Microservice Endpoints

### `POST /predict`
Evaluates multi-step 1–7 day demand projection and stockout risk.
* **Request Body:**
```json
{
  "phcId": "phc-noida-sec22",
  "medicine": "Insulin Glargine 100IU",
  "currentStock": 38,
  "dailyUsage": 25.0,
  "patientFootfall": 140
}
```
* **Response:**
```json
{
  "phcId": "phc-noida-sec22",
  "medicine": "Insulin Glargine 100IU",
  "currentStock": 38,
  "predictedDemandTomorrow": 28.7,
  "daysToStockout": 1.3,
  "stockoutRisk": 0.95,
  "severity": "CRITICAL",
  "recommendedBufferStock": 100,
  "suggestedTransferQuantity": 150,
  "forecastHorizonDays": 7,
  "forecastDetails": [ ... ]
}
```

### `GET /risk/assess/{phc_id}`
Returns operational health index (0–100) and multi-factor alerts (medicine, beds, staff).

### `POST /redistribute/recommend`
Executes spatial surplus discovery and generates constraint-preserving transfer orders.
* **Request Body:** `{ "deficitPhcId": "phc-noida-sec22", "medicine": "Insulin Glargine 100IU" }`

### `POST /assistant/query`
Grounded operations copilot answering operational queries with live system state grounding.
* **Request Body:** `{ "query": "Which centres have the highest shortage risk in the next 24 hours?" }`

### `POST /emergency/dengue-surge`
Executes simulated Dengue outbreak stress scenario (+45% footfall, 2.5x IV fluids demand).

### `POST /federated/train-round`
Executes one round of Federated Averaging (FedAvg) across 3 regional nodes.
