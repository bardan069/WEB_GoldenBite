# GoldenBite Frontend

Next.js (App Router) single-page application for GoldenBite. Consumes the [backend REST API](../backend/README.md) for auth, medications, exercises, diet tracking, and admin user management.

## Tech stack

- **Next.js 16** (App Router, Server Actions)
- **React 19**
- **Tailwind CSS 4**
- **react-hook-form + zod** — form state and validation
- **axios** — HTTP client, with server-side requests routed through Next's `/api/*` rewrite to the backend
- **Jest + React Testing Library** — component unit tests
- **Playwright** — end-to-end tests

## Getting started

```bash
npm install
npm run dev   # http://localhost:3000
```

By default `/api/*` and `/uploads/*` requests are rewritten to `http://localhost:8089` (the backend). Override with a `BACKEND_URL` env var if the backend runs elsewhere (see `next.config.ts`).

## Testing

```bash
npm test              # Jest unit tests (components, forms)
npm run test:e2e      # Playwright end-to-end tests (needs both dev servers running)
npm run test:e2e:ui   # Playwright with the interactive UI runner
```

## Structure

```
app/
  (auth)/            login, register — public routes
  (homepage)/         marketing/landing page
  dashboard/
    page.tsx          dashboard home — real stat cards + "Today's reminders"
    medications/      medication reminder CRUD
    exercises/        exercise reminder CRUD
    diet/             age-based nutrition targets + meal log CRUD
    admin/users/      admin user management (admin role only)
    profile/          profile edit (incl. date of birth)
    password/         change password
lib/
  api/                axios wrappers per resource, one function per endpoint
  actions/            "use server" actions that call lib/api and revalidate paths
  contexts/           AuthContext (client-side auth state)
  cookies.ts          server-side cookie helpers (auth token, user data)
proxy.ts              route-protection middleware (redirects unauthenticated/non-admin access)
__tests__/            Jest unit tests
e2e/                  Playwright end-to-end tests
```

Each dashboard feature (medications/exercises/diet) follows the same pattern: `lib/api/<resource>.ts` → `lib/actions/<resource>-action.ts` → `app/dashboard/<resource>/page.tsx` (list + modals) with form logic in `_components/<Resource>Form.tsx` + `_components/schema.ts`.
