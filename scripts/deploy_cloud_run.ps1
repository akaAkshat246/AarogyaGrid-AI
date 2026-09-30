# ==============================================================================
# AarogyaGrid AI — Google Cloud Run PowerShell Deployment Script (Windows)
# ==============================================================================

param (
    [string]$ProjectId = "aarogyagrid-ai",
    [string]$Region = "asia-south1"
)

$ErrorActionPreference = "Stop"

Write-Host "============================================================" -ForegroundColor Cyan
Write-Host " Starting AarogyaGrid AI Cloud Run Automated Deployment" -ForegroundColor Cyan
Write-Host " Project: $ProjectId | Region: $Region" -ForegroundColor Cyan
Write-Host "============================================================" -ForegroundColor Cyan

# Step 1: Set GCP Project & enable required cloud APIs
Write-Host "[1/5] Configuring Google Cloud project and enabling required APIs..." -ForegroundColor Yellow
gcloud config set project $ProjectId
gcloud services enable run.googleapis.com artifactregistry.googleapis.com cloudbuild.googleapis.com bigquery.googleapis.com pubsub.googleapis.com

# Step 2: Ensure Artifact Registry repository exists
$RepoName = "aarogyagrid-repo"
Write-Host "[2/5] Ensuring Artifact Registry repository '$RepoName' exists..." -ForegroundColor Yellow
try {
    gcloud artifacts repositories describe $RepoName --location=$Region 2>$null
} catch {
    gcloud artifacts repositories create $RepoName --repository-format=docker --location=$Region --description="AarogyaGrid AI Docker Images"
}

$ImagePrefix = "$Region-docker.pkg.dev/$ProjectId/$RepoName"

# Step 3: Build & Deploy FastAPI AI Engine
Write-Host "[3/5] Building & Deploying FastAPI AI Engine..." -ForegroundColor Yellow
gcloud builds submit --tag "$ImagePrefix/ai-engine:latest" --file Dockerfile.ai .
gcloud run deploy aarogyagrid-ai-engine `
  --image "$ImagePrefix/ai-engine:latest" `
  --region $Region `
  --platform managed `
  --allow-unauthenticated `
  --set-env-vars "GCP_PROJECT_ID=$ProjectId,STORAGE_BACKEND=mock" `
  --memory 1Gi `
  --cpu 1

$AiEngineUrl = (gcloud run services describe aarogyagrid-ai-engine --region $Region --format 'value(status.url)').Trim()
Write-Host " -> Live AI Engine URL: $AiEngineUrl" -ForegroundColor Green

# Step 4: Build & Deploy Node.js Express Backend
Write-Host "[4/5] Building & Deploying Node.js Backend..." -ForegroundColor Yellow
gcloud builds submit --tag "$ImagePrefix/backend:latest" --file Dockerfile.backend .
gcloud run deploy aarogyagrid-backend `
  --image "$ImagePrefix/backend:latest" `
  --region $Region `
  --platform managed `
  --allow-unauthenticated `
  --set-env-vars "NODE_ENV=production,AI_URL=$AiEngineUrl,DEV_SKIP_AUTH=true" `
  --memory 512Mi `
  --cpu 1

$BackendUrl = (gcloud run services describe aarogyagrid-backend --region $Region --format 'value(status.url)').Trim()
Write-Host " -> Live Backend API URL: $BackendUrl" -ForegroundColor Green

# Step 5: Build & Deploy React Frontend
Write-Host "[5/5] Building & Deploying React Frontend..." -ForegroundColor Yellow
gcloud builds submit --tag "$ImagePrefix/frontend:latest" --file Dockerfile.frontend .
gcloud run deploy aarogyagrid-frontend `
  --image "$ImagePrefix/frontend:latest" `
  --region $Region `
  --platform managed `
  --allow-unauthenticated `
  --memory 512Mi `
  --cpu 1

$FrontendUrl = (gcloud run services describe aarogyagrid-frontend --region $Region --format 'value(status.url)').Trim()

Write-Host "============================================================" -ForegroundColor Cyan
Write-Host " AarogyaGrid AI Cloud Run Deployment COMPLETED SUCCESSFULLY!" -ForegroundColor Green
Write-Host " Frontend Web App:   $FrontendUrl" -ForegroundColor Cyan
Write-Host " Backend REST API:   $BackendUrl" -ForegroundColor Cyan
Write-Host " AI Engine (FastAPI): $AiEngineUrl" -ForegroundColor Cyan
Write-Host "============================================================" -ForegroundColor Cyan
