#!/bin/bash

# This file contains all the configuration variables for the deployment.
# Edit these values to match your GCP environment and application needs.

# --- Project Configuration ---
# Your GCP Project ID. This is the most critical setting.
export PROJECT_ID=acc-279
# The region where resources will be deployed.
export GCP_REGION="us-central1"
# The name of the Artifact Registry repository to store Docker images.
export ARTIFACT_REGISTRY_REPO="acc-repo"


# --- Application Configuration ---
# A short identifier for the main application, used as a command-line argument.
export APP_IDENTIFIER="app"
# The name for the main application's Cloud Run service.
export APP_SERVICE_NAME="agentic-ux-app"


# --- Image Configuration ---
# The base name for the Docker image that will be built.
export IMAGE_NAME="agentic-ux-app"
# The tag for the Docker image (e.g., "latest", "v1.0").
export TAG="latest"