# CureIQ

CureIQ is a full-stack health data platform for managing patient vitals, doctor/patient workflows, and document-based medical question answering.

The project combines:
- A Node.js + Express backend in `backend/`
- A React app built with Vite in `frontend/`
- MongoDB user storage and optional Pinecone + Gemini RAG functionality for medical document search and assisted responses

## Project structure

- `backend/`
  - `server.js` — Express app entry point
  - `routes/api.js` — authentication, patient/doctor, chat, upload routes
  - `controllers/` — auth, data, and RAG controller logic
  - `middleware/` — JWT auth guard for protected routes
  - `models/` — MongoDB user model with password hashing
  - `services/vectorService.js` — Pinecone/Gemini embedding and retrieval logic
  - `uploads/` — local storage for uploaded PDF documents
- `frontend/`
  - `src/` — React application source code
  - `pages/` — login/signup, patient dashboard, doctor dashboard, home screens
  - `components/` — shared UI pieces and charts

## Features

- Patient and doctor authentication via JWT
- Protected API routes for vitals, history, patient lists, chat, and document uploads
- PDF upload support and text extraction for knowledge base embeddings
- RAG-style question answering with Pinecone and Gemini on uploaded medical documents
- Real-time connection via Socket.io for dashboard updates and chat interactions

## Required environment variables

Create `backend/.env` with at least the following values:

```bash
PORT=5000
MONGO_URI=mongodb+srv://<username>:<password>@cluster0.mongodb.net/cureiq?retryWrites=true&w=majority
JWT_SECRET=your_jwt_secret_here
PINECONE_API_KEY=your_pinecone_api_key
GEMINI_API_KEY=your_gemini_api_key
```

Notes:
- `PORT` is optional; defaults to `5000`.
- `MONGO_URI` is used to connect to MongoDB. If missing or invalid, the backend will skip database initialization and some features may not work.
- `JWT_SECRET` secures auth tokens. If missing, the server falls back to a default secret, but you should always set it in production.
- `PINECONE_API_KEY` and `GEMINI_API_KEY` are required for document embeddings and AI responses. Without them, the RAG pipeline will not function.

Optional frontend env settings:

- `frontend/.env` — not required by current code, but useful if you later add `VITE_API_BASE_URL` or other client configuration.

## Setup and run

1. Install dependencies:

```bash
cd backend
npm install
cd ../frontend
npm install
```

2. Start the backend:

```bash
cd backend
node server.js
```

> Tip: you can also add a `start` script in `backend/package.json`:
>
> ```json
> "scripts": {
>   "start": "node server.js"
> }
> ```

3. Start the frontend:

```bash
cd frontend
npm run dev
```

4. Open the app in your browser at the Vite dev URL, usually `http://localhost:5173`.

## API endpoints

- `POST /api/auth/register` — create patient or doctor account
- `POST /api/auth/login` — login and receive JWT
- `GET /api/doctor/patients` — doctor-only patient list
- `GET /api/patient/:id/history` — patient history by ID
- `POST /api/patient/vitals` — submit patient vital records
- `POST /api/chat` — ask the AI assistant a question (protected)
- `POST /api/upload` — upload a PDF document for embedding (protected)

## Notes on local development

- The frontend uses `http://localhost:5000` as the backend URL for API calls and Socket.io connections.
- Ensure `uploads/` exists inside `backend/` so file uploads can be stored.
- Do not commit `.env` files. Use `.gitignore` to keep secrets out of source control.
- If you change the backend port, update the frontend API URLs or switch to a frontend `.env` configuration.

## Recommended future improvements

- Add a backend `start` script to `backend/package.json`
- Add frontend environment config for `VITE_API_BASE_URL`
- Add proper CORS origin restrictions for production
- Persist uploaded document metadata in the database
- Add tests for auth, vitals, and chat flows
