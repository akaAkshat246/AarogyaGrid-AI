# AarogyaGrid AI — Predict. Share. Respond.
> **Smart Health & Supply Chain Resilience Platform**
> Google Cloud Build with AI — Code for Community

AarogyaGrid AI is a predictive healthcare resource management platform designed for Primary Health Centres (PHCs) and Community Health Centres (CHCs). It forecasts medicine stockouts, predicts evening bed-capacity and staff-overload risks, identifies nearby donor centres with safe surplus, and recommends human-in-the-loop stock redistribution before crises occur.

---

## System Architecture

```text
                                +-----------------------------------+
                                |   React + Google Maps Dashboard   |
                                +-----------------+-----------------+
                                                  | (REST / Firebase Auth)
                                                  v
                                +-----------------------------------+
                                |    Node.js + Express Backend      |
                                |     (Google Cloud Run / Port 5000)|
                                +--------+--------------------+-----+
                                         |                    |
                 (Internal AI HTTP Call) |                    | (Dual-mode Storage)
                                         v                    v
         +-------------------------------------+   +---------------------+
         |      FastAPI AI & ML Engine         |   | Firestore / Mock DB |
         |   (Vertex AI / Cloud Run / Port 8000)|   +---------------------+
         +---+-------------+---------------+---+
             |             |               |
             v             v               v
     [Time-Series ML] [Risk Engine] [Redistribution Engine]
     [Grounded Gemini Assistant]    [Simulated Federated AI]
```

---

## Key Modules & Capabilities

1. **Synthetic Data Engine (`ai-data/src/data_generator.py`):**
   - 16 realistic fictional PHCs across Delhi NCR, Western UP, and Haryana.
   - 60 days of historical time-series (patient footfall, medicine consumption, bed occupancy, doctor/nurse rosters).
   - Zero PII, realistic weekday variations, and seasonal outbreak flags.

2. **AI/ML Forecasting Engine (`ai-data/src/ml/forecasting.py`):**
   - Lagged feature Ridge regression + baseline moving average with chronological splits (Zero data leakage).
   - 1–7 day demand forecast horizon, days to stockout estimation, stockout probability, and recommended safety buffers.
   - Evening peak bed occupancy and staff strain risk modeling.

3. **Deterministic Resource Risk Engine (`ai-data/src/risk/risk_engine.py`):**
   - Multi-tier classification: `HEALTHY`, `WATCH`, `HIGH_RISK`, `CRITICAL`.
   - Explainable thresholds for stockout horizons and bed overloads.

4. **Smart Redistribution Engine (`ai-data/src/redistribution/redistribution_engine.py`):**
   - Donor Safe Surplus Check: Ensures donor centre preserves its own 7-day projected demand + safety buffer.
   - Haversine distance and transit ETA ranking.
   - Human-in-the-loop state machine: `PROPOSED` $\rightarrow$ `APPROVED`/`REJECTED` $\rightarrow$ `IN_TRANSIT` $\rightarrow$ `COMPLETED`.

5. **Grounded Gemini Operations Assistant (`ai-data/src/assistant/gemini_assistant.py`):**
   - Real-time operational copilot grounded strictly in live system state (PHC stock, alerts, transfer orders).
   - Deterministic local fallback when running without external API keys.

6. **Simulated Federated AI (`ai-data/src/federated/federated_sim.py`):**
   - 3 isolated regional nodes (Delhi, Uttar Pradesh, Rajasthan).
   - Federated Averaging (FedAvg) demonstrating cross-state pattern learning without exposing raw records.

7. **Emergency Dengue Surge Simulator (`ai-data/src/emergency/surge_scenario.py`):**
   - Stress-testing module simulating +45% patient footfall and 2.5x IV fluids/ORS demand spikes.

---

## Local Development & Setup (100% Free / No Paid Cloud Required)

### 1. Python Virtual Environment Setup

```powershell
# Activate venv
.\.venv\Scripts\Activate.ps1

# Install requirements
pip install -r requirements.txt
```

### 2. Generate Synthetic Data Fixtures

```powershell
.\.venv\Scripts\python.exe ai-data/src/data_generator.py
```

### 3. Start Python AI Engine (Port 8000)

```powershell
$env:PYTHONPATH="d:\AarogyaGrid-AI\ai-data"
.\.venv\Scripts\python.exe -m uvicorn src.main:app --host 127.0.0.1 --port 8000 --reload
```
* Interactive API Docs available at: [http://127.0.0.1:8000/docs](http://127.0.0.1:8000/docs)

### 4. Start Node.js Express Backend (Port 5000)

```powershell
cd Backend
npm install
npm start
```
* Backend Health check: [http://127.0.0.1:5000/health](http://127.0.0.1:5000/health)

### 5. Start React + Vite Frontend (Port 5173)

```powershell
cd frontend
npm install
npm run dev
```
* Frontend Dashboard: [http://localhost:5173](http://localhost:5173)

---

## One-Command Full Stack Startup (Docker Compose)

You can launch all 3 services simultaneously with a single command:

```bash
docker compose up --build
```

- **Frontend Dashboard:** [http://localhost:5173](http://localhost:5173)
- **Node.js Express Backend:** [http://localhost:5000](http://localhost:5000)
- **Python FastAPI AI Engine:** [http://localhost:8000](http://localhost:8000) (Docs: [/docs](http://localhost:8000/docs))

---

## 2-Minute Demo Script & Pitch CLI

Run the automated live demonstration script to pitch the complete end-to-end flow:

```powershell
.\.venv\Scripts\python.exe scripts/demo_runner.py
```

---

## Running Automated Tests

### 1. AI & Data Engine Test Suite (Pytest - 11/11 Passing)
```powershell
$env:PYTHONPATH="d:\AarogyaGrid-AI\ai-data"
.\.venv\Scripts\python.exe -m pytest ai-data/tests/ -v
```

### 2. Backend API Test Suite (Node.js Test Runner - 8/8 Passing)
```powershell
cd Backend
npm test
```

### 3. Frontend Production Build
```powershell
cd frontend
npm run build
```

---

## API Summary

| Service | Method | Endpoint | Description |
|---|---|---|---|
| **Python AI** | `POST` | `/predict` | ML Demand Forecast & Stockout Risk (Backend Contract) |
| **Python AI** | `GET` | `/risk/assess/{phc_id}` | Operational Health Score (0-100) & Active Alerts |
| **Python AI** | `GET` | `/risk/district/{district}` | District-wide aggregate risk & bed occupancy |
| **Python AI** | `POST` | `/redistribute/recommend` | Safe surplus donor search & ranked transfer orders |
| **Python AI** | `POST` | `/assistant/query` | Grounded Gemini Health Operations Assistant |
| **Python AI** | `POST` | `/emergency/dengue-surge` | Dengue outbreak stress scenario runner |
| **Python AI** | `POST` | `/federated/train-round` | 3-node Federated Averaging round |
| **Node API** | `GET` | `/api/dashboard` | Aggregated PHC metrics |
| **Node API** | `GET` | `/api/phcs` | List all connected PHC health centres |
| **Node API** | `GET` | `/api/inventory/:phcId` | Live inventory with shortage signals |
| **Node API** | `POST` | `/api/transfers` | Create/propose transfer record |
| **Node API** | `PUT` | `/api/transfers/:id/status` | Advance transfer approval lifecycle |

