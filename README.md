# TripCanvas: An Agentic UI Travel Planner

Welcome to TripCanvas! This is a modern travel planning application that uses an **agentic user interface**. Instead of clicking buttons, you interact with the app using natural language. An AI agent on the backend analyzes your questions and decides which UI component is the best way to present the information, creating a dynamic and intuitive user experience.

## 🏛️ Architecture Overview

The application is built on a robust client-server architecture that separates the "brains" from the "presentation."

1. **Frontend (React)**: A dynamic and responsive single-page application built with React. Its primary job is to render the UI components that the backend agent decides upon. It acts as a versatile "canvas" for the agent's instructions.

2. **Backend (Python & FastAPI)**: A high-performance web server built with FastAPI. It serves the frontend application, exposes data endpoints, and, most importantly, hosts and runs the AI agent.

3. **AI Agent (Google ADK & Gemini)**: The core intelligence of the application. Built using Google's Agent Development Kit (ADK) and powered by the Gemini model, the agent's role is to understand the user's intent and choose the most appropriate action or UI view.

## 📂 Key Files & Their Roles

### The Data

* `itinerary_data.json`: This file is the **single source of truth** for the entire trip. It contains a detailed, structured breakdown of each day, including activities, times, locations, costs, and image URLs. The AI agent uses this data as its primary context.

### The Backend "Brain" 🧠

* `ux_agent/agent.py`: This is the agent's constitution. It contains a detailed set of instructions that tells the Gemini model how to behave. It defines the different `viewType`s the agent can choose from (e.g., `calendar_view`, `map_view`) and provides strict rules for how the agent must format its JSON response. This file is critical for ensuring the agent's output is predictable and reliable.

* `backend/app.py`: This is the main server file. It uses FastAPI to create the web server and defines several key API endpoints:

  * `/api/chat`: The primary endpoint that receives user messages, passes them to the AI agent for processing, and streams the agent's JSON response back to the frontend.

  * `/api/itinerary`: An endpoint that serves the complete `itinerary_data.json` file.

  * `/api/day/{day_number}` & `/api/activity/{activity_id}`: Endpoints that provide detailed information for a specific day or activity, allowing the frontend to fetch only the data it needs.

### The Frontend "Canvas" 🎨

* `frontend/src/App.js`: The root component of the React application. It manages the application's core state, including the chat history and the `currentView` object received from the agent. It is responsible for sending user messages to the backend and calling the correct view component to be rendered.

* `frontend/src/components/*.js`: These are the individual UI views (`MoodBoardView.js`, `CalendarView.js`, etc.). Each component is a specialist, designed to do one thing well: receive a specific `payload` from the agent and render a beautiful, interactive visualization of that data.

## 🔄 The Interaction Flow: A User's Journey

The magic of the agentic UI lies in its seamless interaction flow. Here’s what happens when you ask a question like, **"Where are we going on Day 3?"**

1. **User Input**: You type your question into the chat interface.

2. **Frontend Request**: `App.js` captures the message and sends it in a `POST` request to the backend's `/api/chat` endpoint.

3. **Agent Invocation**: The FastAPI server (`app.py`) receives the request and passes the user's message to the agent runner.

4. **The Agent Thinks**: The agent (`agent.py`) analyzes your question. Guided by its instructions, it understands the intent is about **location**. It consults the `itinerary_data.json` context to find all activities scheduled for "Day 3".

5. **The Agent Responds**: The agent constructs a precise JSON object. It decides the best UI is a `map_view` and formulates both a conversational chat response and a short title. The `payload` contains only the necessary IDs.

   ```
   {
     "viewType": "map_view",
     "responseSummary": "Locations for Day 3",
     "chatResponse": "On Day 3, you'll be on Sentosa Island visiting Universal Studios, the Skyline Luge, and more. I've marked them on the map for you.",
     "payload": { "activityIds": ["activity-08", "activity-09", "activity-10", "activity-23"] }
   }
   
   ```

6. **Frontend State Update**: `App.js` receives this JSON. It updates its state:

   * The `chatResponse` is added to the chat history.

   * The `currentView` state is updated with the `viewType`, `responseSummary`, and `payload`.

7. **Dynamic Rendering**: The state update triggers a re-render. The `renderView()` function in `App.js` now sees that `currentView.viewType` is `"map_view"` and renders the `<MapView />` component, passing it the `activityIds` from the payload.

8. **Targeted Data Fetching**: The `<MapView />` component receives the list of IDs. It then makes a targeted API call to the backend (e.g., `/api/itinerary`) to fetch the full details for *only those specific activities*.

9. **Final UI**: The `<MapView />` uses the fetched location data to render markers on the map, completing the user's request.

# GIS-Analytics
