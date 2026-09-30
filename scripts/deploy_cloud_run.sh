#!/usr/bin/env bash
# ==============================================================================
# AarogyaGrid AI — Google Cloud Run Automated Deployment Script
# Deploys AI Engine (FastAPI), Backend (Node.js Express), and Frontend (Vite/Nginx)
# ==============================================================================

set -e

PROJECT_ID=${GCP_PROJECT_ID:-"aarogyagrid-ai"}
REGION=${GCP_REGION:-"asia-south1"}
SERVICE_ACCOUNT="aarogyagrid-ai@${PROJECT_ID}.iam.gserviceaccount.com"

echo "============================================================"
echo " Starting AarogyaGrid AI Cloud Run Automated Deployment"
echo " Project: ${PROJECT_ID} | Region: ${REGION}"
echo "============================================================"

# Step 1: Set GCP Project & enable required cloud APIs
echo "[1/6] Configuring Google Cloud project and enabling required APIs..."
gcloud config set project "${PROJECT_ID}"
gcloud services enable \
  run.googleapis.com \
  artifactregistry.googleapis.com \
  cloudbuild.googleapis.com \
  bigquery.googleapis.com \
  pubsub.googleapis.com

# Step 2: Ensure Artifact Registry repository exists
REPO_NAME="aarogyagrid-repo"
echo "[2/6] Ensuring Artifact Registry repository '${REPO_NAME}' exists..."
gcloud artifacts repositories describe "${REPO_NAME}" --location="${REGION}" >/dev/null 2>&1 || \
gcloud artifacts repositories create "${REPO_NAME}" \
  --repository-format=docker \
  --location="${REGION}" \
  --description="AarogyaGrid AI Docker Images"

IMAGE_PREFIX="${REGION}-docker.pkg.dev/${PROJECT_ID}/${REPO_NAME}"

# Step 3: Build & Deploy FastAPI AI Engine Container
echo "[3/6] Building & Deploying FastAPI AI Engine to Cloud Run..."
gcloud builds submit --tag "${IMAGE_PREFIX}/ai-engine:latest" --file Dockerfile.ai .
gcloud run deploy aarogyagrid-ai-engine \
  --image "${IMAGE_PREFIX}/ai-engine:latest" \
  --region "${REGION}" \
  --platform managed \
  --allow-unauthenticated \
  --set-env-vars "GCP_PROJECT_ID=${PROJECT_ID},STORAGE_BACKEND=mock" \
  --memory 1Gi \
  --cpu 1 \
  --timeout 300

AI_ENGINE_URL=$(gcloud run services describe aarogyagrid-ai-engine --region "${REGION}" --format 'value(status.url)')
echo " -> AI Engine Live URL: ${AI_ENGINE_URL}"

# Step 4: Build & Deploy Node.js Express Backend Container
echo "[4/6] Building & Deploying Node.js Backend to Cloud Run..."
gcloud builds submit --tag "${IMAGE_PREFIX}/backend:latest" --file Dockerfile.backend .
gcloud run deploy aarogyagrid-backend \
  --image "${IMAGE_PREFIX}/backend:latest" \
  --region "${REGION}" \
  --platform managed \
  --allow-unauthenticated \
  --set-env-vars "NODE_ENV=production,AI_URL=${AI_ENGINE_URL},DEV_SKIP_AUTH=true" \
  --memory 512Mi \
  --cpu 1

BACKEND_URL=$(gcloud run services describe aarogyagrid-backend --region "${REGION}" --format 'value(status.url)')
echo " -> Backend Live URL: ${BACKEND_URL}"

# Step 5: Build & Deploy React Vite Frontend Container
echo "[5/6] Building & Deploying Frontend to Cloud Run..."
gcloud builds submit --tag "${IMAGE_PREFIX}/frontend:latest" --file Dockerfile.frontend .
gcloud run deploy aarogyagrid-frontend \
  --image "${IMAGE_PREFIX}/frontend:latest" \
  --region "${REGION}" \
  --platform managed \
  --allow-unauthenticated \
  --memory 512Mi \
  --cpu 1

FRONTEND_URL=$(gcloud run services describe aarogyagrid-frontend --region "${REGION}" --format 'value(status.url)')
echo " -> Frontend Live URL: ${FRONTEND_URL}"

# Step 6: Deployment Summary
echo "============================================================"
echo " AarogyaGrid AI Cloud Run Deployment COMPLETED SUCCESSFULLY!"
echo "------------------------------------------------------------"
echo " Frontend Web App: ${FRONTEND_URL}"
echo " Backend REST API: ${BACKEND_URL}"
echo " AI Engine (FastAPI): ${AI_ENGINE_URL}"
echo "============================================================"
