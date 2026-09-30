#!/usr/bin/env bash
# Upload AarogyaGrid Model to Vertex AI Model Registry
PROJECT_ID="${1:-${GCP_PROJECT_ID:-aarogyagrid-dev}}"
REGION="${2:-asia-south1}"
GCS_BUCKET_URI="gs://${PROJECT_ID}-models/aarogyagrid-v1"

echo "Copying model artifacts to Cloud Storage: $GCS_BUCKET_URI..."
gcloud storage cp D:\AarogyaGrid-AI\ai-data\src\models\vertex_export\model.joblib "$GCS_BUCKET_URI/model.joblib"
gcloud storage cp D:\AarogyaGrid-AI\ai-data\src\models\vertex_export\metadata.json "$GCS_BUCKET_URI/metadata.json"

echo "Registering model in Vertex AI Model Registry..."
gcloud ai models upload \
  --region="$REGION" \
  --display-name="aarogyagrid-demand-forecaster-v1" \
  --artifact-uri="$GCS_BUCKET_URI" \
  --container-image-uri="us-docker.pkg.dev/vertex-ai/prediction/sklearn-cpu.1-3:latest" \
  --project="$PROJECT_ID"
