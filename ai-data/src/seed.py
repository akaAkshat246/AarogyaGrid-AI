"""
AarogyaGrid AI - Database & Storage Seeder
Seeds synthetic PHC, inventory, bed, staff, and footfall records into either:
- Local Storage / JSON fixtures
- Node.js Backend REST API (if running on http://127.0.0.1:5000)
"""

import os
import json
import requests
from typing import Dict, Any, List
from .data_generator import save_synthetic_fixtures, generate_synthetic_dataset

def seed_backend_api(backend_url: str = "http://127.0.0.1:5000/api", id_token: str = None):
    """
    Seeds generated records into the live Node.js Express Backend.
    """
    dataset = generate_synthetic_dataset()
    headers = {"Content-Type": "application/json"}
    if id_token:
        headers["Authorization"] = f"Bearer {id_token}"

    print(f"Connecting to Backend API at {backend_url}...")
    phc_id_map = {}

    # 1. Create PHCs
    print("1. Seeding PHCs...")
    for phc in dataset["phcs"]:
        payload = {
            "name": phc["name"],
            "district": phc["district"],
            "state": phc["state"],
            "latitude": phc["latitude"],
            "longitude": phc["longitude"]
        }
        resp = requests.post(f"{backend_url}/phcs", json=payload, headers=headers)
        if resp.status_code in [200, 201]:
            created = resp.json()
            phc_id_map[phc["id"]] = created.get("id", created.get("data", {}).get("id"))
        else:
            print(f"Failed to create PHC {phc['name']}: {resp.text}")

    # 2. Seed Beds & Staff for each PHC
    print("2. Seeding Beds and Staffing...")
    for phc in dataset["phcs"]:
        target_id = phc_id_map.get(phc["id"])
        if not target_id: continue

        # Beds
        requests.put(f"{backend_url}/beds/{target_id}", json={
            "totalBeds": phc["totalBeds"],
            "occupiedBeds": int(phc["totalBeds"] * 0.65)
        }, headers=headers)

        # Staff
        requests.put(f"{backend_url}/staff/{target_id}", json={
            "doctorsTotal": phc["doctorsTotal"],
            "doctorsPresent": max(1, phc["doctorsTotal"] - 1),
            "nursesTotal": phc["nursesTotal"],
            "nursesPresent": max(2, phc["nursesTotal"] - 2)
        }, headers=headers)

    # 3. Seed Inventory
    print("3. Seeding Inventory Items...")
    for item in dataset["inventory"]:
        target_id = phc_id_map.get(item["phcId"])
        if not target_id: continue

        requests.post(f"{backend_url}/inventory", json={
            "phcId": target_id,
            "medicine": item["medicine"],
            "quantity": item["quantity"],
            "minimumStock": item["minimumStock"],
            "dailyUsage": item["dailyUsage"]
        }, headers=headers)

    print(f"Successfully seeded {len(phc_id_map)} PHCs into backend API!")

if __name__ == "__main__":
    import sys
    # Default action: Regenerate & save raw fixtures
    save_synthetic_fixtures()
    if "--backend" in sys.argv:
        backend_target = "http://127.0.0.1:5000/api"
        seed_backend_api(backend_target)
