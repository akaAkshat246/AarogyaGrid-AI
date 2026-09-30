import requests
import json
import sys

endpoints = [
    ("Backend API", "GET", "http://127.0.0.1:5000/api/dashboard", None),
    ("Backend API", "GET", "http://127.0.0.1:5000/api/phcs", None),
    ("Backend API", "GET", "http://127.0.0.1:5000/api/inventory/phc-noida-sec22", None),
    ("Backend API", "GET", "http://127.0.0.1:5000/api/transfers", None),
    ("Backend API", "GET", "http://127.0.0.1:5000/api/alerts", None),
    ("AI Engine", "GET", "http://127.0.0.1:8000/health", None),
    ("AI Engine", "POST", "http://127.0.0.1:8000/predict", {
        "phcId": "phc-noida-sec22",
        "medicine": "Insulin Glargine 100IU",
        "currentStock": 38,
        "dailyUsage": 25.0,
        "patientFootfall": 140
    }),
    ("AI Engine", "GET", "http://127.0.0.1:8000/risk/assess/phc-noida-sec22", None),
    ("AI Engine", "POST", "http://127.0.0.1:8000/redistribute/recommend", {
        "deficitPhcId": "phc-noida-sec22",
        "medicine": "Insulin Glargine 100IU"
    }),
    ("AI Engine", "POST", "http://127.0.0.1:8000/emergency/dengue-surge", {}),
    ("AI Engine", "POST", "http://127.0.0.1:8000/assistant/query", {
        "query": "What is the bed occupancy at PHC Noida Sec 22?"
    }),
    ("AI Engine", "POST", "http://127.0.0.1:8000/federated/train-round", {})
]

print("=== AAROGYAGRID SYSTEM HEALTH & INTEGRATION AUDIT ===")
all_passed = True
for service, method, url, payload in endpoints:
    try:
        if method == "GET":
            res = requests.get(url, timeout=12)
        else:
            res = requests.post(url, json=payload, timeout=12)
        
        status = res.status_code
        ok = 200 <= status < 300
        if not ok:
            all_passed = False
        print(f"[{service}] {method:4} {url} -> Status: {status} (OK: {ok})")
    except Exception as e:
        all_passed = False
        print(f"[{service}] {method:4} {url} -> FAILED ({e})")

print("-" * 55)
print(f"Summary Result: {'ALL SYSTEMS FULLY OPERATIONAL' if all_passed else 'SOME ENDPOINTS FAILED'}")
sys.exit(0 if all_passed else 1)
