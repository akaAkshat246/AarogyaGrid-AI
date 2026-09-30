#!/usr/bin/env bash
# ==============================================================================
# AarogyaGrid AI - Google Cloud Run Deployment Script
# ==============================================================================
set -euo pipefail

PROJECT_ID="${1:-${GCP_PROJECT_ID:-aarogyagrid-dev}}"
REGION="${2:-asia-south1}"

echo "========================================================"
echo " Deploying AarogyaGrid AI Engine to Google Cloud Run"
echo " Project: $PROJECT_ID | Region: $REGION"
echo "========================================================"

# 1. Enable Required GCP APIs
echo "1. Enabling required Google Cloud APIs..."
gcloud services enable \
  run.googleapis.com \
  firestore.googleapis.com \
  bigquery.googleapis.com \
  pubsub.googleapis.com \
  secretmanager.googleapis.com \
  aiplatform.googleapis.com \
  --project="$PROJECT_ID"

# 2. Build & Submit Container via Cloud Build
echo "2. Building AI Engine Container with Cloud Build..."
gcloud builds submit --tag "gcr.io/${PROJECT_ID}/aarogyagrid-ai:latest" \
  --project="$PROJECT_ID" -f Dockerfile.ai .

# 3. Deploy to Cloud Run
echo "3. Deploying to Cloud Run..."
gcloud run deploy aarogyagrid-ai-engine \
  --image="gcr.io/${PROJECT_ID}/aarogyagrid-ai:latest" \
  --platform=managed \
  --region="$REGION" \
  --allow-unauthenticated \
  --set-env-vars="APP_ENV=production,STORAGE_BACKEND=firestore,GCP_PROJECT_ID=${PROJECT_ID}" \
  --project="$PROJECT_ID"

echo "Deployment finished successfully!"
