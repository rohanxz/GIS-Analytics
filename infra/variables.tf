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

# variables.tf

variable "project_id" {
  description = "The GCP Project ID to deploy the resources in."
  type        = string
  default     = "acc-279"
}

variable "gcp_region" {
  description = "The GCP region for deployment."
  type        = string
  default     = "us-central1"
}

variable "app_service_name" {
  description = "The name of the Cloud Run service."
  type        = string
  default     = "agentic-ux-da-app"
}

variable "artifact_registry_repo" {
  description = "The name of the Artifact Registry repository."
  type        = string
  default     = "agentic-ux-repo"
}

variable "image_name" {
  description = "The name of the Docker image."
  type        = string
  default     = "main-app"
}

# variable "db_instance_name" {
#   description = "The name of the Cloud SQL instance."
#   type        = string
#   default     = "agentic-ux-db"
# }

# variable "db_user" {
#   description = "The username for the PostgreSQL database."
#   type        = string
#   default     = "dbreader"
# }

# variable "db_name" {
#   description = "The name of the PostgreSQL database."
#   type        = string
#   default     = "postgres"
# }

# # These variables will be populated from the environment variables
# # set by sourcing the .env file.

# variable "db_password" {
#   description = "The password for the database user. Set via TF_VAR_db_password environment variable."
#   type        = string
#   sensitive   = true
# }

variable "google_api_key" {
  description = "The Google API Key. Set via TF_VAR_google_api_key environment variable."
  type        = string
  sensitive   = true
}