# AI Symptom Checker

This repository contains a two‑part application:

- **backend** – a FastAPI service that handles user accounts, chat
  persistence, and streaming AI responses via Ollama.
- **frontend** – a React (Vite) single‑page app for logging in and chatting.

---

## Prerequisites

Make sure you have the following installed on your machine:

- Git
- Node.js (v18+ recommended) and npm/yarn
- Python 3.11+ (virtual environment support)
- [Ollama](https://ollama.com/) or another LLM service if you plan to
  actually generate responses (the code is currently configured for
  `qwen2.5:3b`, adjust as needed).
- MongoDB instance (local or remote) and a connection URI in `.env`.

## Cloning the repository

```bash
git clone https://github.com/veerendrarevu/AI-symptom-checker.git
cd ai-symptom-checker
```

## Backend setup

1. **Change into the backend directory**

   ```bash
   cd backend
   ```

2. **Create and activate a Python virtual environment**

   ```bash
   python -m venv venv          # or "ENV", "env" etc.
   source venv/bin/activate     # on Windows use `venv\Scripts\activate`
   ```

3. **Install dependencies**

   ```bash
   pip install -r requirements.txt
   ```

4. **Configure environment variables**

   Create a `.env` file (it is already listed in `.gitignore`) with at
   least the following values:

   ```ini
   SECRET_KEY=your_jwt_secret
   MONGODB_URI=mongodb://localhost:27017/yourdb
   ```

   Adjust any other settings as needed.

5. **Start the backend**

   ```bash
   uvicorn app.main:app --reload --port 8000
   ```

   The server will be available at `http://localhost:8000`.
   Uses hot reloading during development.

## Frontend setup

1. **Change to the frontend directory**

   ```bash
   cd ../frontend
   ```

2. **Install node dependencies**

   ```bash
   npm install           # or `yarn` if you prefer
   ```

3. **Start the development server**

   ```bash
   npm run dev           # or `yarn dev`
   ```

   The React app will launch (usually at `http://localhost:5173`).
   It assumes the backend is running on port 8000; if you change that,
   update the axios base URL in `src/components/Chat.jsx` and other
   components.

## Usage

1. Open the frontend in your browser and register a new user.
2. Log in, create a new chat session, and start typing messages.
3. The backend will store chat history in MongoDB and stream AI
   responses token‑by‑token.

## Additional notes

- **Database**: the example uses MongoDB via Motor. Ensure the URI in
  `.env` is correct.
- **Streaming**: `/chat/{chat_id}/message/stream` returns Server‑Sent
  Events; the frontend uses `EventSource` to display tokens as they
  arrive.
- **Authentication**: JWTs are issued when users log in; the frontend
  stores them in `localStorage` and sends them with requests or as a
  query parameter for streaming endpoints.

## Deployment

For production, build the React app (`npm run build`) and serve the
static files with a proper web server or integrate them into FastAPI.
Use a process manager (e.g. `gunicorn`/`uvicorn` worker, Docker) for the
backend and secure your environment variables.

---

Feel free to modify this README to fit your environment or share
additional deployment instructions.
