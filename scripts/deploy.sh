#!/bin/bash

# Exit immediately if a command exits with a non-zero status.
set -e

# === Script Setup ===
# Go to the project's root directory relative to this script's location.
cd "$(dirname "$0")/.."

# Source all configuration variables from init.sh
if [ -f "./scripts/init.sh" ]; then
    echo "Sourcing configuration from init.sh..."
    . ./scripts/init.sh
else
    echo "Error: Configuration file ./scripts/init.sh not found!"
    exit 1
fi

# === Validate Sourced Configuration ===
# Check that all essential variables are set.
if [ -z "$PROJECT_ID" ] || [ -z "$GCP_REGION" ] || \
   [ -z "$ARTIFACT_REGISTRY_REPO" ] || [ -z "$IMAGE_NAME" ] || \
   [ -z "$TAG" ] || [ -z "$APP_SERVICE_NAME" ]; then
    echo "Error: One or more required variables are not set in init.sh."
    echo "Please check: PROJECT_ID, GCP_REGION, ARTIFACT_REGISTRY_REPO, IMAGE_NAME, TAG, APP_SERVICE_NAME"
    exit 1
fi
echo "Using PROJECT_ID: $PROJECT_ID"

# === Construct Full Image Name ===
MAIN_IMAGE_NAME="${GCP_REGION}-docker.pkg.dev/${PROJECT_ID}/${ARTIFACT_REGISTRY_REPO}/${IMAGE_NAME}:${TAG}"
CLOUDRUN_SERVICE_NAME="$APP_SERVICE_NAME"

echo "Deploying service: $CLOUDRUN_SERVICE_NAME"

# === GCP Setup ===
echo "Setting GCP project to: $PROJECT_ID"
gcloud config set project "$PROJECT_ID"

# === Build Docker Image (using Cloud Build) ===
echo "Submitting build to Cloud Build for image: $MAIN_IMAGE_NAME"
gcloud builds submit \
  --config cloudbuild.yaml \
  --substitutions=_IMAGE_NAME="$MAIN_IMAGE_NAME" \
  --timeout=1200s \
  .
echo "Cloud Build finished successfully."

# === Deploy to Cloud Run ===
echo "Deploying image to Cloud Run service $CLOUDRUN_SERVICE_NAME..."

# Prepare environment variables string for Cloud Run.
# APP_IDENTIFIER is now checked implicitly by the validation block if it's the same as APP_SERVICE_NAME
ENV_VARS="APP_MODE=$APP_IDENTIFIER,GOOGLE_GENAI_USE_VERTEXAI=0"

gcloud run deploy "$CLOUDRUN_SERVICE_NAME" \
    --image "$MAIN_IMAGE_NAME" \
    --region "$GCP_REGION" \
    --platform managed \
    --port 8080 \
    --set-env-vars "$ENV_VARS" \
    --set-secrets=GOOGLE_API_KEY=GOOGLE_API_KEY:latest \
    --min-instances 1 \
    --max-instances 3 \
    --no-allow-unauthenticated \
    --cpu 2 \
    --memory 4Gi

# The script will exit automatically here if deployment fails, due to 'set -e'

echo "✅ Successfully deployed $CLOUDRUN_SERVICE_NAME to Cloud Run in region $GCP_REGION."
SERVICE_URL=$(gcloud run services describe "$CLOUDRUN_SERVICE_NAME" --platform managed --region "$GCP_REGION" --format 'value(status.url)')
echo "Service URL: $SERVICE_URL"