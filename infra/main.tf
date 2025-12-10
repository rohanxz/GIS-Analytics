# Copyright 2025 Google LLC
#
# Licensed under the Apache License, Version 2.0 (the "License");
# you may not use this file except in compliance with the License.
# You may obtain a copy of the License at
#
#     https://www.apache.org/licenses/LICENSE-2.0
#
# Unless required by applicable law or agreed to in writing, software
# distributed under the License is distributed on an "AS IS" BASIS,
# WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
# See the License for the specific language governing permissions and
# limitations under the License.

# --- Provider & Project Configuration ---
terraform {
  required_providers {
    google = {
      source  = "hashicorp/google"
      version = "~> 5.0" # Loosen version constraint slightly for flexibility
    }
  }
}

provider "google" {
  project = var.project_id
  region  = var.gcp_region
}

# --- Enable Necessary Google Cloud APIs ---
resource "google_project_service" "apis" {
  for_each = toset([
    "run.googleapis.com",
    "cloudbuild.googleapis.com",
    "artifactregistry.googleapis.com",
    "sqladmin.googleapis.com",
    "secretmanager.googleapis.com",
    "iam.googleapis.com",
    "generativelanguage.googleapis.com",
    "customsearch.googleapis.com",
    "logging.googleapis.com",
    "compute.googleapis.com",
    "cloudresourcemanager.googleapis.com",
    "aiplatform.googleapis.com",
    # --- ADDED: Enable BigQuery API ---
    # This is required for any BigQuery operations.
    "bigquery.googleapis.com"
  ])
  project                    = var.project_id
  service                    = each.key
  disable_on_destroy         = false
  disable_dependent_services = true
}

# --- Artifact Registry ---
resource "google_artifact_registry_repository" "repo" {
  provider      = google
  project       = var.project_id
  location      = var.gcp_region
  repository_id = var.artifact_registry_repo
  description   = "Repository for the AI LeadGen application"
  # --- FIX: Corrected typo from DOKCER to DOCKER ---
  format        = "DOCKER"
  depends_on    = [google_project_service.apis["artifactregistry.googleapis.com"]]
}

# --- Secret Manager ---
resource "google_secret_manager_secret" "google_api_key" {
  provider  = google
  project   = var.project_id
  secret_id = "GOOGLE_API_KEY"
  replication {
    auto {}
  }
  depends_on = [google_project_service.apis["secretmanager.googleapis.com"]]
}

resource "google_secret_manager_secret_version" "google_api_key_version" {
  provider    = google
  secret      = google_secret_manager_secret.google_api_key.id
  secret_data = var.google_api_key
  # Implicit dependency on the secret resource is sufficient here.
}

# --- IAM Permissions ---
data "google_project" "project" {}

# We are granting permissions to the Compute Engine default service account,
# which is the identity Cloud Run uses by default.
locals {
  cloud_run_service_account = "serviceAccount:${data.google_project.project.number}-compute@developer.gserviceaccount.com"
}

resource "google_secret_manager_secret_iam_member" "secret_accessor" {
  project   = var.project_id
  secret_id = google_secret_manager_secret.google_api_key.secret_id
  role      = "roles/secretmanager.secretAccessor"
  member    = local.cloud_run_service_account
  # --- ADDED: Explicit dependency to ensure APIs are enabled first ---
  depends_on = [
    google_project_service.apis["secretmanager.googleapis.com"],
    google_project_service.apis["iam.googleapis.com"]
  ]
}

resource "google_project_iam_member" "cloud_run_permissions" {
  for_each = toset([
    "roles/cloudsql.client",
    # --- ADDED: Grant Vertex AI User role ---
    # This is the key fix. It allows the service account to use Vertex AI
    # services, including the Code Interpreter Extension.
    "roles/aiplatform.user",
    # --- ADDED: Grant BigQuery User role ---
    # This role allows the service account to run jobs, including queries,
    # and read data from BigQuery datasets.
    "roles/bigquery.user"
  ])
  project = var.project_id
  role    = each.key
  member  = local.cloud_run_service_account
  # --- ADDED: Explicit dependency to ensure APIs are enabled first ---
  depends_on = [
    google_project_service.apis["sqladmin.googleapis.com"],
    google_project_service.apis["aiplatform.googleapis.com"],
    google_project_service.apis["bigquery.googleapis.com"],
    google_project_service.apis["iam.googleapis.com"]
  ]
}

# Grant permissions to the Cloud Build service account to deploy and manage the app
resource "google_project_iam_member" "cloud_build_permissions" {
  for_each = toset([
    "roles/run.admin",
    "roles/iam.serviceAccountUser",
    "roles/storage.objectViewer",
    "roles/artifactregistry.writer",
    "roles/logging.logWriter"
  ])
  project = var.project_id
  role    = each.key
  # Note: This grants permissions to the default Cloud Build SA, not the Cloud Run SA
  member  = "serviceAccount:${data.google_project.project.number}@cloudbuild.gserviceaccount.com"
  # --- UPDATED: Made dependencies more explicit ---
  depends_on = [
    google_project_service.apis["cloudbuild.googleapis.com"],
    google_project_service.apis["iam.googleapis.com"],
    google_project_service.apis["run.googleapis.com"],
    google_project_service.apis["artifactregistry.googleapis.com"],
    google_project_service.apis["logging.googleapis.com"]
  ]
}

# Note: The commented-out Cloud SQL resources are preserved as-is.
# # --- Cloud SQL for PostgreSQL ---
# resource "google_sql_database_instance" "main_instance" { ... }
# resource "google_sql_user" "db_user" { ... }