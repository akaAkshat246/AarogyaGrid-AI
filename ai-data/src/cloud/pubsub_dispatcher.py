"""
AarogyaGrid AI - Google Cloud Pub/Sub & FCM Alert Dispatcher
Phase 9: Event-Driven Alerts & Cloud Pub/Sub Integration

Publishes high-priority shortage and bed overload events to Google Cloud Pub/Sub
with local in-memory event bus fallback.
"""

import os
import json
import logging
from typing import Dict, Any, List, Optional
from datetime import datetime, timezone

logger = logging.getLogger("AarogyaGrid.PubSub")

class PubSubAlertDispatcher:
    def __init__(self, topic_name: str = "aarogyagrid-critical-alerts"):
        self.topic_name = topic_name
        self.project_id = os.getenv("GCP_PROJECT_ID", "aarogyagrid-ai")
        self.publisher = None
        self.in_memory_event_log: List[Dict[str, Any]] = []
        self._init_publisher()

    def _init_publisher(self):
        try:
            from google.cloud import pubsub_v1
            self.publisher = pubsub_v1.PublisherClient()
            self.topic_path = self.publisher.topic_path(self.project_id, self.topic_name)
            logger.info(f"Google Cloud Pub/Sub publisher connected to topic: {self.topic_path}")
        except Exception as e:
            logger.info(f"Using local in-memory event dispatcher fallback ({e})")
            self.publisher = None

    def publish_alert(self, alert: Dict[str, Any]) -> Dict[str, Any]:
        """
        Publishes a critical resource alert to Cloud Pub/Sub or in-memory queue.
        """
        event_payload = {
            "eventId": f"evt-{int(datetime.now(timezone.utc).timestamp() * 1000)}",
            "timestamp": datetime.now(timezone.utc).isoformat(),
            "topic": self.topic_name,
            "alert": alert,
            "fcmNotification": {
                "title": f"🚨 {alert.get('severity', 'ALERT')}: {alert.get('phcId')}",
                "body": alert.get("message", "Healthcare resource threshold exceeded."),
                "priority": "high" if alert.get("severity") == "CRITICAL" else "normal"
            }
        }

        # Store in local event audit log
        self.in_memory_event_log.append(event_payload)

        # Publish to Google Cloud if active
        if self.publisher and hasattr(self, 'topic_path'):
            try:
                data = json.dumps(event_payload).encode("utf-8")
                future = self.publisher.publish(self.topic_path, data=data)
                event_payload["cloudMessageId"] = future.result()
            except Exception as e:
                logger.warning(f"Failed to publish to Google Pub/Sub topic ({e}). Logged locally.")

        return event_payload

    def get_recent_events(self, limit: int = 20) -> List[Dict[str, Any]]:
        return self.in_memory_event_log[-limit:]
