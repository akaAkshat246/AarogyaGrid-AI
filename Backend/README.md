# AarogyaGrid Backend

Node.js + Express 5 + Firebase Admin/Firestore backend for the AarogyaGrid hackathon.
The AI model runs separately; this backend calls your friend's HTTP service.

## Start in five steps

1. Install **Node.js 22 or later**. Extract the ZIP and open a terminal inside `Backend`.
2. In [Firebase Console](https://console.firebase.google.com/), create/select a project and create the **Cloud Firestore default database**. In **Project settings → Service accounts**, generate a private key and save it as `Backend/serviceAccountKey.json`. Your service account needs permission to read/write Firestore.
3. Edit the included `.env` (it contains templates only). Keep the credentials path or change it to your key file. Set `AI_URL` to your friend's base URL and `AI_PREDICT_PATH` to their prediction path, such as `/predict` or `/ai/predict`. Set `AI_API_KEY` only if their service requires a Bearer token.
4. Install and start:

   ```sh
   npm ci
   npm start
   ```

5. Visit [http://127.0.0.1:5000/health](http://127.0.0.1:5000/health), then [http://127.0.0.1:5000/api/health/ready](http://127.0.0.1:5000/api/health/ready). The second endpoint actually checks Firestore access.

Use `npm run dev` for automatic restarts. If `.env` is missing, copy `.env.example` to `.env`.
No collections, indexes or seed data need to be created manually; the API creates documents on first use. Firestore must already be enabled.

## Test

```sh
npm test
# In another terminal while npm start is running:
npm run smoke
# Also call your real AI service:
npm run smoke -- --ai
```

`npm test` uses an in-memory test double and mocked AI/auth; no credentials are needed.
`npm run smoke` uses your real Firestore database and **creates demo records** which remain for inspection. Use a development Firebase project.
For a different server set `BASE_URL`; if authentication is enabled set `FIREBASE_ID_TOKEN` to a current Firebase client ID token before running smoke.

Example PowerShell:
```powershell
$env:BASE_URL = "http://127.0.0.1:5000"
$env:FIREBASE_ID_TOKEN = "your-client-id-token"
npm run smoke -- --ai
```

## Authentication and configuration

The included `.env` starts in **local demo mode**: `DEV_SKIP_AUTH=true`, bound to `127.0.0.1`.
For authentication, enable a Firebase Auth sign-in provider, sign in through your frontend, set `DEV_SKIP_AUTH=false`, and send `Authorization: Bearer <Firebase ID token>` on all `/api/*` requests. Missing, expired and revoked tokens are rejected.
This starter grants every authenticated user access to all PHCs; it has no role or per-PHC authorization. Add those controls before using it with real operational data.
Production mode refuses the auth bypass. Set `NODE_ENV=production`, `DEV_SKIP_AUTH=false`, and `HOST=0.0.0.0` when hosting; configure the allowed frontend origins in `CORS_ORIGINS`.
Firebase Admin uses service-account permissions and bypasses client Firestore rules. Keep client rules restrictive; do not enable public Firestore access.
Never commit your private key or edited `.env`. The ZIP contains no credentials.

| Setting | Meaning |
| --- | --- |
| PORT / HOST | Defaults: 5000 / 127.0.0.1 |
| GOOGLE_APPLICATION_CREDENTIALS | Key path relative to Backend, or absolute path |
| AI_URL / AI_PREDICT_PATH | Base URL and appended prediction path |
| AI_TIMEOUT_MS | AI deadline, default 15000 ms |
| AI_API_KEY | Optional upstream Bearer credential |
| CORS_ORIGINS | Comma-separated frontend origins |
| DEV_SKIP_AUTH | Local demo bypass; use false for authenticated access |

## API reference

All bodies are JSON. Success: `{ "success": true, "data": ... }`; creation also returns top-level `id`.
Errors: `{ "success": false, "message": "...", "errors": [...] }` (field errors appear for validation failures).
Counts must be nonnegative JSON numbers; no numeric strings. Unknown body fields are rejected.
IDs are returned by creation endpoints. All timestamps use ISO UTC strings.

| Method | Endpoint | Purpose |
| --- | --- | --- |
| GET | /health | Process health; does not contact Firebase |
| GET | /api/health/ready | Verify Firestore access |
| GET, POST | /api/phcs | List/create PHCs |
| GET, PUT, DELETE | /api/phcs/:id | Read/update/delete PHC |
| GET | /api/inventory/:phcId | PHC medicine inventory |
| POST | /api/inventory | Add inventory item |
| PUT, DELETE | /api/inventory/:id | Update/delete inventory item |
| GET, PUT | /api/beds/:phcId | Read/replace bed counts |
| GET, PUT | /api/staff/:phcId | Read/replace staffing counts |
| GET | /api/footfall/:phcId | Daily totals, newest date first |
| POST | /api/footfall | Set a PHC's total for a date |
| GET, POST | /api/alerts | List/create alerts |
| PUT | /api/alerts/:id/resolve | Resolve alert |
| GET, POST | /api/transfers | List/create transfer records |
| PUT | /api/transfers/:id/status | Advance transfer workflow |
| GET | /api/dashboard | Aggregate dashboard metrics |
| POST | /api/ai/predict | Call AI and save prediction |
| GET | /api/ai/predictions/:phcId | Saved predictions |

Alerts/transfers support `?phcId=ID&status=STATUS`.
Dashboard supports `?phcId=ID&date=YYYY-MM-DD`; date filters footfall only.
Without a date, `totalPatients` sums all recorded daily totals, not unique patients.
Dashboard counts only records linked to currently existing PHCs; shortages mean quantity <= minimumStock.

### Request bodies

Replace `PHC_ID` and `OTHER_PHC_ID` with IDs from POST /api/phcs.

```json
{
  "name": "PHC Ghaziabad 04",
  "district": "Ghaziabad",
  "state": "Uttar Pradesh",
  "latitude": 28.67,
  "longitude": 77.45
}
```

| Endpoint | Example body |
| --- | --- |
| POST /api/inventory | `{"phcId":"PHC_ID","medicine":"Insulin","quantity":120,"minimumStock":50,"dailyUsage":35}` |
| PUT /api/beds/PHC_ID | `{"totalBeds":20,"occupiedBeds":6}` |
| PUT /api/staff/PHC_ID | `{"doctorsTotal":3,"doctorsPresent":2,"nursesTotal":6,"nursesPresent":5}` |
| POST /api/footfall | `{"phcId":"PHC_ID","date":"2026-09-29","patients":180}` |
| POST /api/alerts | `{"phcId":"PHC_ID","type":"LOW_STOCK","severity":"HIGH","message":"Insulin running low","medicine":"Insulin"}` |
| PUT /api/alerts/ALERT_ID/resolve | `{}` |
| POST /api/transfers | `{"fromPhcId":"PHC_ID","toPhcId":"OTHER_PHC_ID","medicine":"Insulin","quantity":20}` |
| PUT /api/transfers/TRANSFER_ID/status | `{"status":"APPROVED"}` |

PHC/inventory PUT accepts partial updates; inventory `phcId` cannot be changed.
Beds and staff PUT require all counts; occupied/present cannot exceed total.
Footfall POST is an upsert, returning 200: one record per PHC/date, repeated submissions replace the count.
Alert severities: LOW, MEDIUM, HIGH, CRITICAL. Status starts ACTIVE and resolves to RESOLVED.
Transfer flow: PENDING → APPROVED → IN_TRANSIT → COMPLETED. Any nonterminal state can become CANCELLED; repeated current status is allowed. Invalid transitions return 409.
**Transfers track workflow only; they do not move inventory automatically.** Inventory changes use the inventory API.
Deleting a PHC does not cascade: historical records remain in Firestore. List APIs and dashboard are designed for hackathon-sized data; pagination and large-scale aggregation are not included.

## AI service contract

POST `/api/ai/predict`:

```json
{
  "phcId": "PHC_ID",
  "medicine": "Insulin",
  "currentStock": 120,
  "dailyUsage": 35,
  "patientFootfall": 180
}
```

The backend validates the input and PHC, forwards that JSON to `AI_URL + AI_PREDICT_PATH`, and accepts a JSON object, for example:

```json
{"risk":"HIGH","daysRemaining":2.4,"predictedDemand":52}
```

Results are saved to `predictions` with `input`, `result`, `phcId` and timestamps, and returned under `data`.
No fake predictions are generated if AI is unavailable. Upstream failures/invalid JSON return 502; timeouts return 504.
The actual AI model/schema belongs to your friend: adapt `services/aiService.js` if their API uses different fields.
Predictions do not automatically create alerts; use POST /api/alerts to save a reviewed alert.

## Layout and troubleshooting

- `config/`: environment loading and Firebase connection.
- `routes/`: endpoint mappings.
- `controllers/`: request handling for each module.
- `services/`: Firestore repository, validation and AI HTTP client.
- `middleware/`: Firebase authentication and JSON error handling.
- `app.js`: Express app factory; `server.js`: startup and shutdown.
- `test/`: isolated HTTP and AI tests; `scripts/smoke.js`: live integration check.

Missing key: verify the file path and that you are using a service-account key, not Firebase web configuration.
Readiness 503: create Firestore's default database and check the service account's project and permissions.
AI 502/504: verify the base URL, path, network access and AI service response.
401: use a Firebase client ID token, not an API key or service-account JSON.
Frontend CORS: add its exact origin (scheme + host + port) to CORS_ORIGINS and restart.

References: [Firebase Admin setup](https://firebase.google.com/docs/admin/setup), [Express 5 error handling](https://expressjs.com/en/guide/error-handling/).
