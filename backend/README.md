# GoldenBite API

RESTful backend for GoldenBite, a wellness app for adults that tracks medication reminders, exercise reminders, and age-based diet targets. Built with Node.js, Express and MongoDB (Mongoose).

## Tech stack

- **Express 5** — HTTP layer
- **MongoDB / Mongoose** — persistence
- **Zod** — request validation and DTO typing
- **JWT (jsonwebtoken) + bcryptjs** — authentication
- **Jest + Supertest + mongodb-memory-server** — automated testing (no external DB required to run tests)

## Getting started

```bash
npm install
cp .env.example .env   # then edit values as needed
npm run dev             # starts the API with hot-reload on PORT (default 8089)
```

Environment variables (see `.env.example`):

| Variable | Purpose | Default |
|---|---|---|
| `PORT` | HTTP port | `8089` |
| `MONGODB_URI` | Mongo connection string | `mongodb://127.0.0.1:27017/golden_bite` |
| `SECRET_KEY` | JWT signing secret | dev-only fallback, **set a real value in production** |

## Testing

```bash
npm test              # runs the full Jest suite against an in-memory MongoDB instance
npm run test:coverage # same, with coverage report
```

## Architecture

Each resource follows the same layered structure:

```
routes/*.route.ts        → wires HTTP verbs + middleware to controller methods
controllers/*.controller.ts → parses/validates request via zod DTOs, delegates to service, formats response
services/*.service.ts     → business rules, ownership checks, throws HttpException on failure
repositories/*.repository.ts → Mongoose queries only, no business logic
models/*.model.ts         → Mongoose schema/document typing
dtos/*.dto.ts             → zod schemas (also the inferred TypeScript types)
```

`authorizedMiddleware` verifies the JWT and attaches the full user document to `req.user`; every user-owned resource (medications, exercises, diet entries) is scoped to `req.user._id`, and services return 404 (not 403) when a record exists but belongs to someone else, to avoid leaking existence.

Responses are always shaped as `{ success, message, data }` via `ApiResponseHelper`; errors as `{ success: false, message }` with the appropriate HTTP status via `HttpException`.

## API Reference

All routes are prefixed with `/api/v1`. Routes marked **Auth** require `Authorization: Bearer <token>`.

### Auth (`/auth`)

| Method | Path | Auth | Body | Description |
|---|---|---|---|---|
| POST | `/auth/register` | – | firstName, lastName, email, username, password | Create an account |
| POST | `/auth/login` | – | email, password | Returns `{ user, token }` |
| GET | `/auth/whoami` | ✅ | – | Returns the current user |
| PUT | `/auth/update` | ✅ | any profile field (multipart if uploading `profileImage`) | Update profile, incl. `dateOfBirth` |
| PUT | `/auth/update-password` | ✅ | currentPassword, newPassword, confirmPassword | Change password |

### Admin — user management (`/admin`, requires `role: admin`)

| Method | Path | Description |
|---|---|---|
| GET | `/admin/users?page=&limit=&search=` | Paginated user list |
| GET | `/admin/users/:id` | Get a user |
| POST | `/admin/users` | Create a user (role settable) |
| PUT | `/admin/users/:id` | Update any user field |
| DELETE | `/admin/users/:id` | Delete a user |

### Medications (`/medications`, ✅ auth, scoped to caller)

| Method | Path | Description |
|---|---|---|
| GET | `/medications` | List all of the caller's medications |
| GET | `/medications/today` | Medications currently within their active date range |
| GET | `/medications/:id` | Get one medication |
| POST | `/medications` | Create a medication (name, dosage, frequencyPerDay, reminderTimes[], startDate, endDate?, notes?) |
| PUT | `/medications/:id` | Update a medication |
| DELETE | `/medications/:id` | Delete a medication |
| PATCH | `/medications/:id/taken` | Record today's dose as taken |

### Exercises (`/exercises`, ✅ auth, scoped to caller)

| Method | Path | Description |
|---|---|---|
| GET | `/exercises` | List all of the caller's exercises |
| GET | `/exercises/today` | Exercises scheduled for today's weekday |
| GET | `/exercises/:id` | Get one exercise |
| POST | `/exercises` | Create an exercise (name, type, durationMinutes, daysOfWeek[], reminderTime, notes?) |
| PUT | `/exercises/:id` | Update an exercise |
| DELETE | `/exercises/:id` | Delete an exercise |
| PATCH | `/exercises/:id/complete` | Record today's session as completed |

### Diet (`/diet`, ✅ auth, scoped to caller)

| Method | Path | Description |
|---|---|---|
| GET | `/diet/recommendation` | Daily calorie/protein/water targets computed from the caller's age (requires `dateOfBirth` set on the profile) |
| GET | `/diet/entries` | List the caller's meal log entries |
| GET | `/diet/entries/:id` | Get one meal entry |
| POST | `/diet/entries` | Log a meal (mealType, foodName, calories, date, notes?) |
| PUT | `/diet/entries/:id` | Update a meal entry |
| DELETE | `/diet/entries/:id` | Delete a meal entry |

## Uploads

`PUT /auth/update` accepts a `profileImage` file (multipart/form-data); files are served statically from `/uploads`.
