# Copyright 2025 Google LLC
#
# Licensed under the Apache License, Version 2.0 (the "License");
# you may not use this file except in compliance with the License.
# You may not obtain a copy of the License at
#
#     https://www.apache.org/licenses/LICENSE-2.0
#
# Unless required by applicable law or agreed to in writing, software
# distributed under the License is distributed on an "AS IS" BASIS,
# WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
# See the License for the specific language governing permissions and
# limitations under the License.

import os
import logging
import json
import sys
from typing import List, Dict, Any, Optional

from fastapi import FastAPI, HTTPException, Request
from fastapi.responses import JSONResponse, FileResponse, StreamingResponse
from fastapi.staticfiles import StaticFiles
from pydantic import BaseModel
from dotenv import load_dotenv

# --- Basic Logging Configuration ---
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s',
    stream=sys.stdout
)
logger = logging.getLogger(__name__)

# --- Project Path Setup ---
project_root = os.path.abspath(os.path.join(os.path.dirname(__file__), '..'))
if project_root not in sys.path:
    sys.path.insert(0, project_root)
logger.info(f"Project root added to sys.path: {project_root}")

# --- Environment Variable Loading ---
dotenv_path = os.path.join(project_root, '.env')
if os.path.exists(dotenv_path):
    load_dotenv(dotenv_path)
    logger.info(".env file loaded.")

# --- ADK and Agent Imports ---
try:
    from ux_agent.agent import root_agent
    from google.adk.runners import Runner
    from google.adk.sessions.in_memory_session_service import InMemorySessionService
    from google.adk.artifacts.in_memory_artifact_service import InMemoryArtifactService
    from google.genai import types as genai_types
    logger.info("Successfully imported ADK components and UX agent.")
except ImportError as e:
    logger.critical(f"FATAL: Could not import required components. Error: {e}", exc_info=True)
    sys.exit(1)

# --- Pydantic Models ---
class ChatMessagePart(BaseModel):
    text: Optional[str] = None
    inline_data: Optional[Dict[str, Any]] = None

class ChatMessage(BaseModel):
    parts: List[ChatMessagePart]
    role: str = 'user'

class ChatRequest(BaseModel):
    app_name: str = "ux_agent_app"
    user_id: str
    session_id: Optional[str] = None
    new_message: ChatMessage

class UXAgentWebServer:
    """Encapsulates the FastAPI application, services, and runner for the UX agent."""
    def __init__(self, agent, session_service, artifact_service):
        self.app_name = "ux_agent_app"
        self.agent_runner = Runner(
            app_name=self.app_name, agent=agent,
            session_service=session_service, artifact_service=artifact_service
        )
        self.session_service = session_service
        self.itinerary_data = self._load_itinerary_data()
        self.google_maps_api_key = os.getenv("GOOGLE_API_KEY")
        if not self.google_maps_api_key:
            logger.warning("GOOGLE_API_KEY environment variable not set. Map view will not work.")

        logger.info("UXAgentWebServer initialized successfully.")

    def _load_itinerary_data(self):
        """Loads the itinerary JSON data from file."""
        try:
            itinerary_path = os.path.join(os.path.dirname(__file__), 'itinerary_data.json')
            with open(itinerary_path, "r") as f: return json.load(f)
        except Exception as e:
            logger.error(f"Failed to load itinerary_data.json: {e}", exc_info=True)
            return None

    def get_fast_api_app(self):
        """Creates and configures the FastAPI application instance."""
        app = FastAPI(title="UX Itinerary Agent API")

        # --- API Endpoints for Data Fetching ---
        @app.get("/api/maps-key")
        async def get_maps_key():
            if not self.google_maps_api_key:
                raise HTTPException(status_code=500, detail="Google Maps API Key not configured on the server.")
            return JSONResponse(content={"apiKey": self.google_maps_api_key})

        @app.get("/api/itinerary")
        async def get_full_itinerary():
            if self.itinerary_data is None:
                raise HTTPException(status_code=500, detail="Itinerary data is not available.")
            return JSONResponse(content=self.itinerary_data)
        
        @app.get("/api/day/{day_number}")
        async def get_day_data(day_number: int):
            if self.itinerary_data:
                for day in self.itinerary_data.get("itinerary", []):
                    if day.get("day") == day_number:
                        return JSONResponse(content=day)
            raise HTTPException(status_code=404, detail=f"Day {day_number} not found.")

        @app.get("/api/activity/{activity_id}")
        async def get_activity_data(activity_id: str):
             if self.itinerary_data:
                for day in self.itinerary_data.get("itinerary", []):
                    for activity in day.get("activities", []):
                        if activity.get("id") == activity_id:
                            return JSONResponse(content=activity)
             raise HTTPException(status_code=404, detail=f"Activity {activity_id} not found.")

        @app.post("/api/chat")
        async def agent_chat_sse(req: ChatRequest):
            """Handles chat requests and returns a structured JSON response in the final SSE event."""
            async def event_generator():
                session_id = req.session_id
                final_content_text = None
                try:
                    if session_id:
                        session = await self.session_service.get_session(app_name=req.app_name, user_id=req.user_id, session_id=session_id)
                        if not session: session = await self.session_service.create_session(app_name=req.app_name, user_id=req.user_id)
                    else:
                        session = await self.session_service.create_session(app_name=req.app_name, user_id=req.user_id)
                    
                    session_id = session.id
                    yield f"data: {json.dumps({'session_id': session_id})}\n\n"

                    new_message = genai_types.Content(parts=[p.model_dump(exclude_none=True) for p in req.new_message.parts], role='user')
                    async_generator = self.agent_runner.run_async(user_id=req.user_id, session_id=session_id, new_message=new_message)

                    async for event in async_generator:
                        if event.content and event.content.parts:
                            final_content_text = event.content.parts[0].text
                    
                    if final_content_text:
                        logger.info(f"Agent raw response: {final_content_text}")
                        cleaned_json_string = final_content_text.strip()
                        if cleaned_json_string.startswith("```json"):
                            cleaned_json_string = cleaned_json_string[7:-3]
                        if cleaned_json_string.endswith("```"):
                            cleaned_json_string = cleaned_json_string[:-3]
                        cleaned_json_string = cleaned_json_string.strip()

                        try:
                            structured_response = json.loads(cleaned_json_string)
                            yield f"data: {json.dumps(structured_response)}\n\n"
                        except json.JSONDecodeError:
                            logger.error("Agent returned a non-JSON response. Sending error.")
                            error_payload = {"viewType": "simple_response", "responseSummary": "Error", "payload": {"text": "Sorry, I received an unexpected response. Please try again."}}
                            yield f"data: {json.dumps(error_payload)}\n\n"
                    else:
                         logger.warning("Agent did not return any content.")

                except Exception as e:
                    logger.error(f"Error during agent execution: {e}", exc_info=True)
                    error_event = json.dumps({'error': str(e)})
                    yield f"data: {error_event}\n\n"

            return StreamingResponse(event_generator(), media_type="text/event-stream")

        # --- Static File Serving ---
        build_dir = os.path.join(project_root, 'frontend', 'build')
        if os.path.exists(build_dir):
            app.mount("/static", StaticFiles(directory=os.path.join(build_dir, "static")), name="static")
            @app.get("/{full_path:path}")
            async def serve_react_app(request: Request, full_path: str):
                index_path = os.path.join(build_dir, 'index.html')
                if not os.path.exists(index_path):
                    return JSONResponse(status_code=404, content={"detail": "Frontend not found."})
                return FileResponse(index_path)
        else:
            logger.warning(f"Frontend build directory not found at {build_dir}. The UI will not be served.")

        return app

# --- Application Entry Point ---
server = UXAgentWebServer(
    agent=root_agent,
    session_service=InMemorySessionService(),
    artifact_service=InMemoryArtifactService()
)
app = server.get_fast_api_app()

if __name__ == '__main__':
    import uvicorn
    if 'GOOGLE_API_KEY' not in os.environ:
        logger.warning("GOOGLE_API_KEY environment variable not set.")
    port = int(os.environ.get("PORT", 8000))
    uvicorn.run("app:app", host="0.0.0.0", port=port, reload=True)

