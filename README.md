# AarogyaGrid-AI

Predictive healthcare resource management using AI, data engineering, and Google Cloud.

# AarogyaGrid — Backend

A backend that helps Primary Health Centres (PHCs) track resources, identify shortages, and coordinate medicine transfers.

## What it does

- **PHC management:** Create and manage health-centre records.
- **Resource tracking:** Monitor medicine inventory, bed availability, and staff attendance.
- **Patient footfall:** Record daily patient counts.
- **Alerts and transfers:** Track shortage alerts and medicine-transfer status.
- **Dashboard:** Summarize resource availability and operational needs.
- **AI integration:** Send data to an external prediction service and save its results.

## Technology

**Node.js · Express · Firebase Firestore · Firebase Authentication**

```text
Frontend → Express APIs → Firestore
                ↕
        External AI Service
```

## Quick start

Requires **Node.js 22+** and a Firebase project with Firestore enabled.

1. Place your Firebase service-account key in `Backend/serviceAccountKey.json`.
2. Configure `.env` with the credentials path and AI service URL.
3. Run:

```bash
npm ci
npm start
```

The backend runs at `http://127.0.0.1:5000`.

## Demo and testing

Check the database connection:

```http
GET /api/health/ready
```

View dashboard metrics:

```http
GET /api/dashboard
```

Run automated tests or create sample records for a live demo:

```bash
npm test
npm run smoke
```

With the external AI service running:

```bash
npm run smoke -- --ai
```

## Main APIs

| Endpoint          | Purpose                  |
| ----------------- | ------------------------ |
| `/api/phcs`       | Health-centre management |
| `/api/inventory`  | Medicine inventory       |
| `/api/beds`       | Bed availability         |
| `/api/staff`      | Staff counts             |
| `/api/footfall`   | Daily patient totals     |
| `/api/alerts`     | Shortage alerts          |
| `/api/transfers`  | Transfer workflow        |
| `/api/dashboard`  | Summary metrics          |
| `/api/ai/predict` | AI predictions           |

## Hackathon scope

The backend includes input validation, consistent error responses, and AI timeout handling. The AI model is a separate service. Transfers track progress; inventory updates are handled separately.

Local demo mode uses `DEV_SKIP_AUTH=true`. Set it to `false` to require Firebase login tokens. Keep credentials private. Role-based access is a future improvement.
