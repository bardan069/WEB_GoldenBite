# GoldenBite

GoldenBite is a full-stack wellness app for adults: medication reminders, exercise reminders, and diet tracking against targets based on your age.

It is a monorepo with two independent projects:

| Folder | Stack | Docs |
|---|---|---|
| [`backend/`](backend/) | Node.js, Express, MongoDB (Mongoose), JWT auth | [backend/README.md](backend/README.md) |
| [`frontend/`](frontend/) | Next.js (App Router), React, Tailwind CSS | see below |

## Features

- Account registration, login, and profile management (including date of birth, used to personalise diet targets)
- **Medications**: log dosage/schedule, see what's due today, mark doses taken
- **Exercises**: schedule routines by day of week, see what's due today, mark sessions complete
- **Diet**: age-based daily calorie/protein/water targets, with a personal meal log
- **Admin**: paginated user management for admin accounts

## Quick start

Run the backend and frontend in separate terminals.

```bash
# Terminal 1 — backend API (default: http://localhost:8089)
cd backend
npm install
cp .env.example .env
npm run dev

# Terminal 2 — frontend (default: http://localhost:3000)
cd frontend
npm install
npm run dev
```

The frontend rewrites `/api/*` requests to the backend (see `frontend/next.config.ts`, configurable via the `BACKEND_URL` env var).

## Testing

```bash
# Backend: Jest + Supertest against an in-memory MongoDB
cd backend && npm test

# Frontend: Jest + React Testing Library (unit tests)
cd frontend && npm test

# Frontend: Playwright (end-to-end, requires both dev servers running)
cd frontend && npm run test:e2e
```

## Project structure

```
backend/    Express REST API (routes -> controllers -> services -> repositories -> models)
frontend/   Next.js app (App Router pages, server actions, API client, component tests, e2e tests)
```
