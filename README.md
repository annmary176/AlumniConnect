# AlumniConnect

AlumniConnect is a lightweight alumni networking platform that provides user authentication, profile directory, connections, chat, job postings, and mentorship features. This repository contains a Node.js backend and a Vite + React frontend.

## Table of Contents
- [Project Overview](#project-overview)
- [Tech Stack](#tech-stack)
- [Repository Structure](#repository-structure)
- [Prerequisites](#prerequisites)
- [Environment Variables](#environment-variables)
- [Database Setup & Migrations](#database-setup--migrations)
- [Running Locally](#running-locally)
  - [Backend](#backend)
  - [Frontend](#frontend)
- [API Endpoints (Overview)](#api-endpoints-overview)
- [Seeding & Sample Data](#seeding--sample-data)
- [Development Notes](#development-notes)
- [Contributing](#contributing)
- [License](#license)

## Project Overview

AlumniConnect aims to help former students keep in touch, find jobs, request mentorship, and chat. The project is split into two folders: `backend` (Node.js/Express) and `frontend` (Vite + React).

## Tech Stack

- Backend: Node.js, Express
- Database: (SQL-based — see `schema.sql`/`migration.sql` files)
- Frontend: React (Vite)
- Real-time/chat: WebSockets or a lightweight approach (see `chat.js`)

## Repository Structure

- `backend/` — Express server and API handlers
  - `server.js` — app entrypoint
  - `db.js` — database connection helper
  - `auth.js` — authentication routes/middleware
  - `alumni.js` — alumni directory endpoints
  - `connections.js` — connection requests and relationships
  - `chat.js` — chat routes and real-time code
  - `jobs.js` — job posting endpoints
  - `sessions.js` — session management
  - `graph.js`, `edges.json` — graph utilities/data (used for connections/visualization)
- `frontend/` — React app (Vite)
  - `src/pages` — page components (AlumniDirectory, Chat, Jobs, etc.)
  - `index.html`, `vite.config.js`, `tailwind.config.js`
- `schema.sql`, `migration.sql`, `run_schema.sql` — DB schema and migration helpers

## Prerequisites

- Node.js (16+ recommended)
- npm or yarn
- A SQL database compatible with the provided SQL (e.g., PostgreSQL, MySQL, or SQLite — adjust `db.js` accordingly)

## Environment Variables

Create a `.env` file in `backend/` (or provide env vars to your process manager). Typical variables:

- `PORT` — backend port (default: `3000`)
- `DATABASE_URL` — connection string for your SQL database
- `JWT_SECRET` — secret for signing JSON Web Tokens
- `SESSION_SECRET` — cookie/session secret (if sessions used)

Adjust the keys above to match usage in `backend/db.js`, `auth.js`, and session configuration.

## Database Setup & Migrations

1. Inspect `schema.sql`, `migration.sql`, or `run_schema.sql` to see table definitions and initial migrations.
2. Run your SQL client to create the database and apply the schema. Example (Postgres):

```bash
psql $DATABASE_URL -f run_schema.sql
```

3. If the project uses seed data, load those records (see `edges.json` and any seeding scripts).

Note: The repository contains `schema.sql` and `migration.sql` — review them for DB engine-specific syntax before running.

## Running Locally

Start the backend and frontend in separate terminals.

### Backend

1. Install dependencies and start the server:

```bash
cd backend
npm install
npm run start
```

If `package.json` defines `start` as `node server.js`, the server will bind to `PORT` or default to `3000`.

### Frontend

1. Install dependencies and start the Vite dev server:

```bash
cd frontend
npm install
npm run dev
```

2. Open the address printed by Vite (usually `http://localhost:5173`) and use the app.

### Combined

You can run both concurrently using a terminal multiplexer or tools like `concurrently` (not included by default).

## API Endpoints (Overview)

This is a high-level summary — inspect the route files for full details and request/response shapes.

- `POST /auth/login` — login and receive JWT/session
- `POST /auth/register` — create a new alumni account
- `GET /alumni` — fetch alumni directory (with filters/pagination)
- `GET /alumni/:id` — fetch a single alumni profile
- `POST /connections/request` — send connection request
- `POST /connections/accept` — accept connection
- `GET /connections` — list connections
- `GET /jobs` — list job postings
- `POST /jobs` — create job posting (auth required)
- `POST /chat/message` — send chat message (or WebSocket flow handled in `chat.js`)

For exact routes, parameters, and payload examples, open the corresponding files in `backend/`.

## Seeding & Sample Data

- `edges.json` contains sample graph edges used by `graph.js` for visualization or relationship building.
- To seed the DB, write a small seed script to insert CSV/JSON data into the tables, or manually insert via SQL.

## Development Notes

- Auth: `auth.js` likely uses JWTs or sessions. Keep secrets safe and don't commit `.env`.
- Database: `db.js` centralizes connections. Update pooling and timeouts per your DB.
- Real-time: `chat.js` has the chat implementation; if sockets are used, ensure proper CORS and transport configuration.
- Frontend: pages under `frontend/src/pages` map to routes. `AlumniDirectory.jsx` is a good starting point for UI updates.

## Testing

There are no test harnesses in the repository by default. Consider adding unit tests (Jest for backend, React Testing Library for frontend) and basic integration tests for endpoints.

## Deployment

- Backend: containerize or host on a Node-capable host (Heroku, Fly, AWS, etc.). Ensure `DATABASE_URL` and secret env vars are set.
- Frontend: build with Vite (`npm run build`) and serve via static host (Netlify, Vercel, S3) or proxy through your Node server.

## Contributing

Contributions are welcome. Suggested workflow:

1. Fork the repo and create a feature branch.
2. Add clear commit messages and open a pull request describing the change.
3. If adding DB schema changes, include migration SQL and, where possible, a small seed for testing.

Please include any environment variable changes in the README or a `.env.example` file.


