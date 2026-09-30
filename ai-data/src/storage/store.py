"""
AarogyaGrid AI - Storage Layer (Dual-Mode: Local Mock & Live Firestore)
Phase 3: Data Pipelines and Storage
"""

import os
import json
import logging
from abc import ABC, abstractmethod
from typing import List, Dict, Any, Optional
from datetime import datetime, timezone

logger = logging.getLogger("AarogyaGrid.Storage")

class BaseDataStore(ABC):
    @abstractmethod
    def list_phcs(self) -> List[Dict[str, Any]]: pass

    @abstractmethod
    def get_phc(self, phc_id: str) -> Optional[Dict[str, Any]]: pass

    @abstractmethod
    def list_inventory(self, phc_id: Optional[str] = None) -> List[Dict[str, Any]]: pass

    @abstractmethod
    def get_inventory_item(self, phc_id: str, medicine: str) -> Optional[Dict[str, Any]]: pass

    @abstractmethod
    def list_daily_records(self, phc_id: Optional[str] = None, days: int = 60) -> List[Dict[str, Any]]: pass

    @abstractmethod
    def list_alerts(self, phc_id: Optional[str] = None, status: Optional[str] = None) -> List[Dict[str, Any]]: pass

    @abstractmethod
    def create_alert(self, alert: Dict[str, Any]) -> Dict[str, Any]: pass

    @abstractmethod
    def list_transfers(self, phc_id: Optional[str] = None, status: Optional[str] = None) -> List[Dict[str, Any]]: pass

    @abstractmethod
    def create_transfer(self, transfer: Dict[str, Any]) -> Dict[str, Any]: pass

    @abstractmethod
    def update_transfer_status(self, transfer_id: str, status: str, approved_by: Optional[str] = None) -> Optional[Dict[str, Any]]: pass

    @abstractmethod
    def save_prediction(self, prediction: Dict[str, Any]) -> Dict[str, Any]: pass

    @abstractmethod
    def list_predictions(self, phc_id: str) -> List[Dict[str, Any]]: pass


class LocalDataStore(BaseDataStore):
    """
    In-memory and fixture-backed store for deterministic, zero-cost local development & testing.
    """
    def __init__(self, data_dir: Optional[str] = None):
        if data_dir is None:
            # store.py is at <root>/ai-data/src/storage/store.py
            # Go up 3 levels to reach ai-data/
            src_storage_dir = os.path.dirname(os.path.abspath(__file__))
            src_dir = os.path.dirname(src_storage_dir)
            ai_data_dir = os.path.dirname(src_dir)
            data_dir = os.path.join(ai_data_dir, "data", "raw")
            # If not found, try fallback relative to workspace root
            if not os.path.exists(data_dir):
                data_dir = os.path.join(os.getcwd(), "ai-data", "data", "raw")
        self.data_dir = data_dir
        self._phcs: Dict[str, Dict[str, Any]] = {}
        self._inventory: List[Dict[str, Any]] = []
        self._daily_records: List[Dict[str, Any]] = []
        self._alerts: List[Dict[str, Any]] = []
        self._transfers: List[Dict[str, Any]] = []
        self._predictions: List[Dict[str, Any]] = []
        self._load_fixtures()

    def _load_fixtures(self):
        phc_file = os.path.join(self.data_dir, "phcs.json")
        inv_file = os.path.join(self.data_dir, "inventory.json")
        daily_file = os.path.join(self.data_dir, "daily_records.json")

        if os.path.exists(phc_file):
            with open(phc_file, "r", encoding="utf-8") as f:
                for phc in json.load(f):
                    self._phcs[phc["id"]] = phc

        if os.path.exists(inv_file):
            with open(inv_file, "r", encoding="utf-8") as f:
                self._inventory = json.load(f)

        if os.path.exists(daily_file):
            with open(daily_file, "r", encoding="utf-8") as f:
                self._daily_records = json.load(f)

    def list_phcs(self) -> List[Dict[str, Any]]:
        return list(self._phcs.values())

    def get_phc(self, phc_id: str) -> Optional[Dict[str, Any]]:
        return self._phcs.get(phc_id)

    def list_inventory(self, phc_id: Optional[str] = None) -> List[Dict[str, Any]]:
        if phc_id:
            return [i for i in self._inventory if i["phcId"] == phc_id]
        return list(self._inventory)

    def get_inventory_item(self, phc_id: str, medicine: str) -> Optional[Dict[str, Any]]:
        for i in self._inventory:
            if i["phcId"] == phc_id and i["medicine"].lower() == medicine.lower():
                return i
        return None

    def list_daily_records(self, phc_id: Optional[str] = None, days: int = 60) -> List[Dict[str, Any]]:
        records = self._daily_records
        if phc_id:
            records = [r for r in records if r["phcId"] == phc_id]
        return records[-days:] if days else records

    def list_alerts(self, phc_id: Optional[str] = None, status: Optional[str] = None) -> List[Dict[str, Any]]:
        res = self._alerts
        if phc_id:
            res = [a for a in res if a["phcId"] == phc_id]
        if status:
            res = [a for a in res if a.get("status") == status]
        return res

    def create_alert(self, alert: Dict[str, Any]) -> Dict[str, Any]:
        if not alert.get("id"):
            alert["id"] = f"alert-{len(self._alerts) + 1}-{int(datetime.now(timezone.utc).timestamp())}"
        self._alerts.append(alert)
        return alert

    def list_transfers(self, phc_id: Optional[str] = None, status: Optional[str] = None) -> List[Dict[str, Any]]:
        res = self._transfers
        if phc_id:
            res = [t for t in res if t["fromPhcId"] == phc_id or t["toPhcId"] == phc_id]
        if status:
            res = [t for t in res if t.get("status") == status]
        return res

    def create_transfer(self, transfer: Dict[str, Any]) -> Dict[str, Any]:
        if not transfer.get("id"):
            transfer["id"] = f"tr-{len(self._transfers) + 1}-{int(datetime.now(timezone.utc).timestamp())}"
        self._transfers.append(transfer)
        return transfer

    def update_transfer_status(self, transfer_id: str, status: str, approved_by: Optional[str] = None) -> Optional[Dict[str, Any]]:
        for t in self._transfers:
            if t["id"] == transfer_id:
                t["status"] = status
                if approved_by:
                    t["approvedBy"] = approved_by
                    t["approvedAt"] = datetime.now(timezone.utc).isoformat()
                return t
        return None

    def save_prediction(self, prediction: Dict[str, Any]) -> Dict[str, Any]:
        if not prediction.get("id"):
            prediction["id"] = f"pred-{len(self._predictions) + 1}-{int(datetime.now(timezone.utc).timestamp())}"
        self._predictions.append(prediction)
        return prediction

    def list_predictions(self, phc_id: str) -> List[Dict[str, Any]]:
        return [p for p in self._predictions if p.get("phcId") == phc_id]


class FirestoreDataStore(BaseDataStore):
    """
    Google Cloud Firestore store implementation for live production mode.
    """
    def __init__(self, fallback_local: LocalDataStore):
        self.fallback = fallback_local
        self.client = None
        self._init_firestore()

    def _init_firestore(self):
        try:
            import firebase_admin
            from firebase_admin import credentials, firestore
            if not firebase_admin._apps:
                cred_path = os.getenv("GOOGLE_APPLICATION_CREDENTIALS")
                if cred_path and os.path.exists(cred_path):
                    cred = credentials.Certificate(cred_path)
                    firebase_admin.initialize_app(cred)
                else:
                    firebase_admin.initialize_app()
            self.client = firestore.client()
            logger.info("Firestore client initialized successfully.")
        except Exception as e:
            logger.warning(f"Firestore not available ({e}). Using LocalDataStore fallback.")
            self.client = None

    def list_phcs(self) -> List[Dict[str, Any]]:
        if not self.client: return self.fallback.list_phcs()
        docs = self.client.collection("phcs").stream()
        return [dict(doc.to_dict(), id=doc.id) for doc in docs]

    def get_phc(self, phc_id: str) -> Optional[Dict[str, Any]]:
        if not self.client: return self.fallback.get_phc(phc_id)
        doc = self.client.collection("phcs").document(phc_id).get()
        return dict(doc.to_dict(), id=doc.id) if doc.exists else None

    def list_inventory(self, phc_id: Optional[str] = None) -> List[Dict[str, Any]]:
        if not self.client: return self.fallback.list_inventory(phc_id)
        col = self.client.collection("inventory")
        q = col.where("phcId", "==", phc_id) if phc_id else col
        return [dict(d.to_dict(), id=d.id) for d in q.stream()]

    def get_inventory_item(self, phc_id: str, medicine: str) -> Optional[Dict[str, Any]]:
        if not self.client: return self.fallback.get_inventory_item(phc_id, medicine)
        docs = self.client.collection("inventory").where("phcId", "==", phc_id).where("medicine", "==", medicine).stream()
        for d in docs: return dict(d.to_dict(), id=d.id)
        return None

    def list_daily_records(self, phc_id: Optional[str] = None, days: int = 60) -> List[Dict[str, Any]]:
        if not self.client: return self.fallback.list_daily_records(phc_id, days)
        col = self.client.collection("daily_records")
        q = col.where("phcId", "==", phc_id).order_by("date", direction="DESCENDING").limit(days) if phc_id else col.limit(days)
        return [d.to_dict() for d in q.stream()]

    def list_alerts(self, phc_id: Optional[str] = None, status: Optional[str] = None) -> List[Dict[str, Any]]:
        if not self.client: return self.fallback.list_alerts(phc_id, status)
        col = self.client.collection("alerts")
        q = col
        if phc_id: q = q.where("phcId", "==", phc_id)
        return [dict(d.to_dict(), id=d.id) for d in q.stream()]

    def create_alert(self, alert: Dict[str, Any]) -> Dict[str, Any]:
        if not self.client: return self.fallback.create_alert(alert)
        ref = self.client.collection("alerts").document()
        alert["id"] = ref.id
        ref.set(alert)
        return alert

    def list_transfers(self, phc_id: Optional[str] = None, status: Optional[str] = None) -> List[Dict[str, Any]]:
        if not self.client: return self.fallback.list_transfers(phc_id, status)
        col = self.client.collection("transfers")
        return [dict(d.to_dict(), id=d.id) for d in col.stream()]

    def create_transfer(self, transfer: Dict[str, Any]) -> Dict[str, Any]:
        if not self.client: return self.fallback.create_transfer(transfer)
        ref = self.client.collection("transfers").document()
        transfer["id"] = ref.id
        ref.set(transfer)
        return transfer

    def update_transfer_status(self, transfer_id: str, status: str, approved_by: Optional[str] = None) -> Optional[Dict[str, Any]]:
        if not self.client: return self.fallback.update_transfer_status(transfer_id, status, approved_by)
        ref = self.client.collection("transfers").document(transfer_id)
        payload = {"status": status}
        if approved_by:
            payload["approvedBy"] = approved_by
            payload["approvedAt"] = datetime.utcnow().isoformat()
        ref.update(payload)
        doc = ref.get()
        return dict(doc.to_dict(), id=doc.id) if doc.exists else None

    def save_prediction(self, prediction: Dict[str, Any]) -> Dict[str, Any]:
        if not self.client: return self.fallback.save_prediction(prediction)
        ref = self.client.collection("predictions").document()
        prediction["id"] = ref.id
        ref.set(prediction)
        return prediction

    def list_predictions(self, phc_id: str) -> List[Dict[str, Any]]:
        if not self.client: return self.fallback.list_predictions(phc_id)
        docs = self.client.collection("predictions").where("phcId", "==", phc_id).stream()
        return [dict(d.to_dict(), id=d.id) for d in docs]


# Singleton Store Holder
_GLOBAL_STORE: Optional[BaseDataStore] = None

def get_store() -> BaseDataStore:
    global _GLOBAL_STORE
    if _GLOBAL_STORE is None:
        backend_type = os.getenv("STORAGE_BACKEND", "mock").lower()
        local_store = LocalDataStore()
        if backend_type == "firestore":
            _GLOBAL_STORE = FirestoreDataStore(fallback_local=local_store)
        else:
            _GLOBAL_STORE = local_store
    return _GLOBAL_STORE
