"""
AarogyaGrid AI - Synthetic Healthcare Data Generator
Phase 2: Synthetic Data Engineering

Generates reproducible, realistic, zero-PII synthetic data for 16 fictional Primary Health Centres (PHCs)
across Delhi-NCR and Western Uttar Pradesh over a 60-day historical window.
"""

import os
import json
import random
import math
from datetime import datetime, timedelta, timezone
from typing import List, Dict, Any
import numpy as np
import pandas as pd

# Fixed seed for absolute reproducibility
RANDOM_SEED = 42

# 16 Fictional PHCs with real geographical coordinates (Delhi NCR, Western UP, Haryana)
FICTIONAL_PHCS = [
    {
        "id": "phc-delhi-east-01",
        "name": "PHC Laxmi Nagar",
        "district": "Delhi East",
        "state": "Delhi",
        "latitude": 28.6315,
        "longitude": 77.2773,
        "totalBeds": 24,
        "doctorsTotal": 8,
        "nursesTotal": 16,
        "baseFootfall": 160,
        "profile": "surge_prone"  # Experiences seasonal viral surge
    },
    {
        "id": "phc-delhi-east-02",
        "name": "PHC Mayur Vihar",
        "district": "Delhi East",
        "state": "Delhi",
        "latitude": 28.6083,
        "longitude": 77.2952,
        "totalBeds": 30,
        "doctorsTotal": 10,
        "nursesTotal": 20,
        "baseFootfall": 180,
        "profile": "well_stocked" # Donor candidate
    },
    {
        "id": "phc-delhi-south-01",
        "name": "PHC Saket",
        "district": "Delhi South",
        "state": "Delhi",
        "latitude": 28.5244,
        "longitude": 77.2167,
        "totalBeds": 36,
        "doctorsTotal": 12,
        "nursesTotal": 24,
        "baseFootfall": 220,
        "profile": "high_capacity_hub"
    },
    {
        "id": "phc-delhi-south-02",
        "name": "PHC Hauz Khas",
        "district": "Delhi South",
        "state": "Delhi",
        "latitude": 28.5494,
        "longitude": 77.2001,
        "totalBeds": 20,
        "doctorsTotal": 6,
        "nursesTotal": 12,
        "baseFootfall": 130,
        "profile": "balanced"
    },
    {
        "id": "phc-delhi-north-01",
        "name": "PHC Rohini Sec-15",
        "district": "Delhi North",
        "state": "Delhi",
        "latitude": 28.7180,
        "longitude": 77.1264,
        "totalBeds": 28,
        "doctorsTotal": 8,
        "nursesTotal": 18,
        "baseFootfall": 175,
        "profile": "balanced"
    },
    {
        "id": "phc-delhi-central-01",
        "name": "PHC Karol Bagh",
        "district": "Delhi Central",
        "state": "Delhi",
        "latitude": 28.6514,
        "longitude": 77.1907,
        "totalBeds": 22,
        "doctorsTotal": 7,
        "nursesTotal": 14,
        "baseFootfall": 150,
        "profile": "balanced"
    },
    {
        "id": "phc-noida-sec22",
        "name": "PHC Sector 22 Noida",
        "district": "Gautam Buddha Nagar",
        "state": "Uttar Pradesh",
        "latitude": 28.5960,
        "longitude": 77.3480,
        "totalBeds": 18,
        "doctorsTotal": 6,
        "nursesTotal": 12,
        "baseFootfall": 140,
        "profile": "deficit_insulin" # Critical insulin deficit
    },
    {
        "id": "phc-noida-sec62",
        "name": "PHC Sector 62 Noida",
        "district": "Gautam Buddha Nagar",
        "state": "Uttar Pradesh",
        "latitude": 28.6270,
        "longitude": 77.3620,
        "totalBeds": 32,
        "doctorsTotal": 10,
        "nursesTotal": 20,
        "baseFootfall": 190,
        "profile": "well_stocked" # High surplus insulin donor
    },
    {
        "id": "phc-gr-noida-beta",
        "name": "CHC Beta 1 Greater Noida",
        "district": "Gautam Buddha Nagar",
        "state": "Uttar Pradesh",
        "latitude": 28.4720,
        "longitude": 77.5080,
        "totalBeds": 40,
        "doctorsTotal": 12,
        "nursesTotal": 22,
        "baseFootfall": 210,
        "profile": "well_stocked"
    },
    {
        "id": "phc-ghaziabad-indirapuram",
        "name": "PHC Indirapuram",
        "district": "Ghaziabad",
        "state": "Uttar Pradesh",
        "latitude": 28.6434,
        "longitude": 77.3713,
        "totalBeds": 20,
        "doctorsTotal": 6,
        "nursesTotal": 14,
        "baseFootfall": 165,
        "profile": "surge_prone"
    },
    {
        "id": "phc-ghaziabad-rajnagar",
        "name": "CHC Raj Nagar",
        "district": "Ghaziabad",
        "state": "Uttar Pradesh",
        "latitude": 28.6830,
        "longitude": 77.4420,
        "totalBeds": 35,
        "doctorsTotal": 11,
        "nursesTotal": 20,
        "baseFootfall": 205,
        "profile": "well_stocked" # IV Fluids / ORS donor
    },
    {
        "id": "phc-ghaziabad-rural",
        "name": "PHC Muradnagar Rural",
        "district": "Ghaziabad",
        "state": "Uttar Pradesh",
        "latitude": 28.7750,
        "longitude": 77.5020,
        "totalBeds": 15,
        "doctorsTotal": 4,
        "nursesTotal": 8,
        "baseFootfall": 95,
        "profile": "deficit_fluids" # Critical IV/ORS deficit
    },
    {
        "id": "phc-meerut-cantt",
        "name": "CHC Meerut Cantt",
        "district": "Meerut",
        "state": "Uttar Pradesh",
        "latitude": 28.9845,
        "longitude": 77.7064,
        "totalBeds": 45,
        "doctorsTotal": 14,
        "nursesTotal": 26,
        "baseFootfall": 240,
        "profile": "high_capacity_hub"
    },
    {
        "id": "phc-meerut-rural",
        "name": "PHC Partapur",
        "district": "Meerut",
        "state": "Uttar Pradesh",
        "latitude": 28.9210,
        "longitude": 77.6320,
        "totalBeds": 16,
        "doctorsTotal": 5,
        "nursesTotal": 10,
        "baseFootfall": 110,
        "profile": "balanced"
    },
    {
        "id": "phc-gurgaon-sec14",
        "name": "PHC Sector 14 Gurugram",
        "district": "Gurugram",
        "state": "Haryana",
        "latitude": 28.4732,
        "longitude": 77.0425,
        "totalBeds": 28,
        "doctorsTotal": 9,
        "nursesTotal": 18,
        "baseFootfall": 180,
        "profile": "balanced"
    },
    {
        "id": "phc-faridabad-sec16",
        "name": "CHC Sector 16 Faridabad",
        "district": "Faridabad",
        "state": "Haryana",
        "latitude": 28.4110,
        "longitude": 77.3180,
        "totalBeds": 34,
        "doctorsTotal": 10,
        "nursesTotal": 20,
        "baseFootfall": 195,
        "profile": "balanced"
    }
]

# Essential Medicines monitored with usage ratios per 100 patients
MEDICINES_CATALOG = [
    {
        "name": "Paracetamol 500mg",
        "unit": "Tablets",
        "usage_per_100_patients": 120.0,
        "surge_multiplier": 1.9,
        "critical_min_days": 3
    },
    {
        "name": "Insulin Glargine 100IU",
        "unit": "Vials",
        "usage_per_100_patients": 14.0,
        "surge_multiplier": 1.1,
        "critical_min_days": 4
    },
    {
        "name": "ORS Rehydration Salts",
        "unit": "Packets",
        "usage_per_100_patients": 85.0,
        "surge_multiplier": 2.6,
        "critical_min_days": 3
    },
    {
        "name": "Amoxicillin 500mg",
        "unit": "Capsules",
        "usage_per_100_patients": 48.0,
        "surge_multiplier": 1.4,
        "critical_min_days": 3
    },
    {
        "name": "IV Normal Saline 500ml",
        "unit": "Bottles",
        "usage_per_100_patients": 22.0,
        "surge_multiplier": 2.4,
        "critical_min_days": 4
    },
    {
        "name": "Oxygen Cylinders 40L",
        "unit": "Cylinders",
        "usage_per_100_patients": 3.5,
        "surge_multiplier": 1.8,
        "critical_min_days": 5
    }
]

def generate_synthetic_dataset(
    days: int = 60,
    seed: int = RANDOM_SEED,
    end_date: datetime = None
) -> Dict[str, Any]:
    """
    Generates realistic 60-day historical time-series and current snapshot data.
    """
    np.random.seed(seed)
    random.seed(seed)

    if end_date is None:
        end_date = datetime.now(timezone.utc).replace(hour=0, minute=0, second=0, microsecond=0)
    start_date = end_date - timedelta(days=days - 1)

    all_daily_records = []
    inventory_snapshot = []
    phc_clean_list = []

    # Process each PHC
    for phc in FICTIONAL_PHCS:
        phc_id = phc["id"]
        base_footfall = phc["baseFootfall"]
        total_beds = phc["totalBeds"]
        docs_total = phc["doctorsTotal"]
        nurses_total = phc["nursesTotal"]
        profile = phc["profile"]

        phc_record = {
            "id": phc_id,
            "name": phc["name"],
            "district": phc["district"],
            "state": phc["state"],
            "latitude": phc["latitude"],
            "longitude": phc["longitude"],
            "totalBeds": total_beds,
            "doctorsTotal": docs_total,
            "nursesTotal": nurses_total
        }
        phc_clean_list.append(phc_record)

        # Generate 60 days of logs
        current_date = start_date
        phc_med_consumption = {med["name"]: [] for med in MEDICINES_CATALOG}

        for day_idx in range(days):
            date_str = current_date.strftime("%Y-%m-%d")
            day_of_week = current_date.weekday() # 0 = Mon, 6 = Sun

            # Day of week factor: Mondays +25%, Saturdays normal, Sundays -35%
            weekday_factor = 1.25 if day_of_week == 0 else (0.65 if day_of_week == 6 else 1.0)

            # Seasonal trend & outbreak trigger in last 12 days for surge-prone centres
            outbreak_active = False
            surge_factor = 1.0
            if profile == "surge_prone" and day_idx >= (days - 12):
                outbreak_active = True
                surge_factor = 1.45 + 0.05 * np.sin(day_idx)
            elif profile == "deficit_fluids" and day_idx >= (days - 8):
                outbreak_active = True
                surge_factor = 1.35

            # Daily Footfall Calculation
            noise = np.random.normal(0, 0.08)
            daily_patients = int(max(20, round(base_footfall * weekday_factor * surge_factor * (1.0 + noise))))

            # Bed Occupancy Calculation
            base_occupancy_ratio = 0.65 if profile != "high_capacity_hub" else 0.55
            if outbreak_active:
                base_occupancy_ratio += 0.25
            occ_noise = np.random.uniform(-0.05, 0.05)
            occupied_beds = int(min(total_beds, max(2, round(total_beds * (base_occupancy_ratio + occ_noise)))))

            # Staff Attendance
            docs_present = int(max(1, min(docs_total, docs_total - int(np.random.choice([0, 1, 2], p=[0.75, 0.20, 0.05])))))
            nurses_present = int(max(2, min(nurses_total, nurses_total - int(np.random.choice([0, 1, 2, 3], p=[0.65, 0.25, 0.08, 0.02])))))

            # Medicine Consumption on this day
            med_usage_today = {}
            for med in MEDICINES_CATALOG:
                m_name = med["name"]
                base_per_100 = med["usage_per_100_patients"]
                med_surge = med["surge_multiplier"] if outbreak_active else 1.0
                
                expected_use = (daily_patients / 100.0) * base_per_100 * med_surge
                use_noise = float(np.random.normal(0, 0.10))
                actual_use = float(max(0.0, round(expected_use * (1.0 + use_noise), 1)))
                
                med_usage_today[m_name] = actual_use
                phc_med_consumption[m_name].append(actual_use)

            daily_entry = {
                "phcId": phc_id,
                "date": date_str,
                "dayOfWeek": day_of_week,
                "patients": daily_patients,
                "totalBeds": total_beds,
                "occupiedBeds": occupied_beds,
                "availableBeds": total_beds - occupied_beds,
                "doctorsTotal": docs_total,
                "doctorsPresent": docs_present,
                "nursesTotal": nurses_total,
                "nursesPresent": nurses_present,
                "outbreakFlag": outbreak_active,
                "medicineUsage": med_usage_today
            }
            all_daily_records.append(daily_entry)
            current_date += timedelta(days=1)

        # Create Current Live Inventory Snapshot
        for med in MEDICINES_CATALOG:
            m_name = med["name"]
            recent_7day_usage = float(np.mean(phc_med_consumption[m_name][-7:]))
            daily_usage_clean = round(recent_7day_usage, 1)

            # Assign stock based on designed profile to test redistribution scenarios
            if profile == "deficit_insulin" and "Insulin" in m_name:
                # 1.5 days of stock remaining -> CRITICAL
                quantity = int(max(10, round(daily_usage_clean * 1.5)))
                min_stock = int(round(daily_usage_clean * 4))
            elif profile == "well_stocked" and "Insulin" in m_name and phc_id == "phc-noida-sec62":
                # 20 days of stock -> SAFE SURPLUS DONOR
                quantity = int(round(daily_usage_clean * 20))
                min_stock = int(round(daily_usage_clean * 4))
            elif profile == "deficit_fluids" and ("IV Normal" in m_name or "ORS" in m_name):
                # 1.8 days of stock remaining -> HIGH RISK
                quantity = int(max(15, round(daily_usage_clean * 1.8)))
                min_stock = int(round(daily_usage_clean * 5))
            elif profile == "well_stocked" and ("IV Normal" in m_name or "ORS" in m_name) and phc_id == "phc-ghaziabad-rajnagar":
                # 25 days of stock -> SAFE SURPLUS DONOR
                quantity = int(round(daily_usage_clean * 25))
                min_stock = int(round(daily_usage_clean * 5))
            elif profile == "surge_prone" and ("Paracetamol" in m_name or "ORS" in m_name):
                # 3 days stock remaining -> WATCH / HIGH RISK
                quantity = int(round(daily_usage_clean * 3.2))
                min_stock = int(round(daily_usage_clean * 4))
            else:
                # Normal healthy stock (8 to 14 days)
                stock_days = random.uniform(8.0, 14.0)
                quantity = int(round(daily_usage_clean * stock_days))
                min_stock = int(round(daily_usage_clean * 4))

            inv_item = {
                "id": f"{phc_id}-{m_name.lower().replace(' ', '-')[:15]}",
                "phcId": phc_id,
                "medicine": m_name,
                "unit": med["unit"],
                "quantity": quantity,
                "minimumStock": min_stock,
                "dailyUsage": daily_usage_clean
            }
            inventory_snapshot.append(inv_item)

    # Flatten historical records to a DataFrame for ML & Analysis
    csv_rows = []
    for r in all_daily_records:
        base_row = {
            "phc_id": r["phcId"],
            "date": r["date"],
            "day_of_week": r["dayOfWeek"],
            "patients": r["patients"],
            "total_beds": r["totalBeds"],
            "occupied_beds": r["occupiedBeds"],
            "available_beds": r["availableBeds"],
            "doctors_total": r["doctorsTotal"],
            "doctors_present": r["doctorsPresent"],
            "nurses_total": r["nursesTotal"],
            "nurses_present": r["nursesPresent"],
            "outbreak_flag": int(r["outbreakFlag"])
        }
        for med_name, use_val in r["medicineUsage"].items():
            col_name = f"usage_{med_name.lower().replace(' ', '_')[:12]}"
            base_row[col_name] = use_val
        csv_rows.append(base_row)

    df_timeseries = pd.DataFrame(csv_rows)

    return {
        "phcs": phc_clean_list,
        "inventory": inventory_snapshot,
        "daily_records": all_daily_records,
        "timeseries_df": df_timeseries
    }

def save_synthetic_fixtures(output_dir: str = None):
    """
    Saves generated datasets to disk under ai-data/data/raw/
    """
    if output_dir is None:
        base_dir = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
        output_dir = os.path.join(base_dir, "data", "raw")

    os.makedirs(output_dir, exist_ok=True)
    dataset = generate_synthetic_dataset()

    # Save PHCs
    phc_path = os.path.join(output_dir, "phcs.json")
    with open(phc_path, "w", encoding="utf-8") as f:
        json.dump(dataset["phcs"], f, indent=2)

    # Save Inventory Snapshot
    inv_path = os.path.join(output_dir, "inventory.json")
    with open(inv_path, "w", encoding="utf-8") as f:
        json.dump(dataset["inventory"], f, indent=2)

    # Save Daily Records
    daily_path = os.path.join(output_dir, "daily_records.json")
    with open(daily_path, "w", encoding="utf-8") as f:
        json.dump(dataset["daily_records"], f, indent=2)

    # Save CSV Timeseries
    csv_path = os.path.join(output_dir, "historical_timeseries.csv")
    dataset["timeseries_df"].to_csv(csv_path, index=False)

    print(f"Generated synthetic fixtures successfully:")
    print(f" - PHCs: {len(dataset['phcs'])} centres -> {phc_path}")
    print(f" - Inventory: {len(dataset['inventory'])} items -> {inv_path}")
    print(f" - Daily Records: {len(dataset['daily_records'])} rows -> {daily_path}")
    print(f" - Timeseries CSV: {len(dataset['timeseries_df'])} rows -> {csv_path}")

if __name__ == "__main__":
    save_synthetic_fixtures()
