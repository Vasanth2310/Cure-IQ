# CureIQ

CureIQ is a full-stack health data platform with a React + Vite frontend and a Node.js/Express backend.

## Project structure

- `backend/` - Express server, authentication, data controllers, file uploads, and API routes
- `frontend/` - React application built with Vite, including dashboards, auth pages, and chart components

## Setup

1. Install dependencies for both backend and frontend:

   ```bash
   cd backend
   npm install
   cd ../frontend
   npm install
   ```

2. Create environment files for each service:

   - `backend/.env`
   - `frontend/.env` (if needed)

   Example values should include secrets for things like `JWT_SECRET`, database connection strings, and any API keys.

3. Run the backend and frontend separately in development:

   ```bash
   # backend
   cd backend
   npm start

   # frontend
   cd frontend
   npm run dev
   ```

## Available scripts

### Frontend
- `npm run dev` - start Vite dev server
- `npm run build` - build production assets
- `npm run preview` - preview built app
- `npm run lint` - run ESLint

### Backend
- No frontend-like start script is defined yet. Add one if needed.

## Notes

- The repository root `.gitignore` includes ignores for `node_modules`, environment files, logs, and editor files.
- Keep sensitive values out of source control by adding them to `.env` and never committing those files.
