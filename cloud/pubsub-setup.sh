#!/usr/bin/env bash
# ==============================================================================
# AarogyaGrid AI - Cloud Pub/Sub Setup Script
# ==============================================================================
set -euo pipefail

PROJECT_ID="${1:-${GCP_PROJECT_ID:-aarogyagrid-ai}}"
TOPIC_NAME="aarogyagrid-critical-alerts"
SUBSCRIPTION_NAME="aarogyagrid-alerts-worker"

echo "Creating Pub/Sub topic: $TOPIC_NAME..."
gcloud pubsub topics create "$TOPIC_NAME" --project="$PROJECT_ID" || true

echo "Creating Pub/Sub subscription: $SUBSCRIPTION_NAME..."
gcloud pubsub subscriptions create "$SUBSCRIPTION_NAME" \
  --topic="$TOPIC_NAME" \
  --ack-deadline=60 \
  --project="$PROJECT_ID" || true

echo "Pub/Sub configuration complete."
