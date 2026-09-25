# COCO+

Premium fashion e-commerce. React + Vite storefront, Express + TypeScript API, Supabase (Postgres + Auth + Storage).

## Layout

```
backend/    Express 5 API (TypeScript, CommonJS) - port 5000
frontend/   Vite 8 + React 19 + Tailwind 4 SPA    - port 5173
supabase_schema.sql
```

## Prerequisites

- Node.js 24+
- A Supabase project (free tier is fine)

## Database setup

1. Create a project at https://supabase.com/dashboard
2. SQL Editor -> paste all of `supabase_schema.sql` -> Run. Creates 16 tables.

## Environment

Copy both example files and fill them in.

```bash
cp backend/.env.example backend/.env
cp frontend/.env.example frontend/.env
```

Backend (`backend/.env`) - Project Settings -> API:

| Variable | Notes |
| --- | --- |
| `SUPABASE_URL` | Project URL |
| `SUPABASE_ANON_KEY` | anon public key |
| `SUPABASE_SERVICE_ROLE_KEY` | **server only**, bypasses RLS |
| `JWT_SECRET` | long random string |
| `FRONTEND_URL` | CORS allowlist, e.g. `http://localhost:5173` |

Frontend (`frontend/.env`) - must be prefixed `VITE_` to be exposed to the browser:

| Variable | Notes |
| --- | --- |
| `VITE_SUPABASE_URL` | Project URL |
| `VITE_SUPABASE_ANON_KEY` | anon key only - never the service role key |
| `VITE_API_URL` | `http://localhost:5000` |

`backend/src/config/env.ts` throws on startup for any missing variable, so a
misconfigured deploy fails loudly instead of silently 403ing.

## Local development

Two terminals:

```bash
cd backend  && npm install && npm run dev   # tsc build + node dist/server.js, nodemon on src/
cd frontend && npm install && npm run dev   # Vite HMR
```

Verify: `curl http://localhost:5000/api/health` returns
`{"status":"ok","database":"connected"}`.

| Script | Location | Does |
| --- | --- | --- |
| `npm run dev` | both | dev server with watch + reload |
| `npm run build` | backend | compile to `dist/` |
| `npm start` | backend | run compiled `dist/server.js` |
| `npm run typecheck` | backend | `tsc --noEmit` |
| `npm run lint` | frontend | oxlint |
| `npm run build` | frontend | `tsc -b && vite build` |

Note: nodemon watches `backend/src` only, so editing `backend/.env` needs a restart.

## Deploy

Frontend and backend go to different hosts - the SPA is static, the API is a
long-running server.

### Frontend -> Vercel

1. New Project -> import the repo
2. Set **Root Directory** to `frontend` (required, it is a monorepo)
3. Framework preset: Vite. Build `npm run build`, output `dist`
4. Environment: `VITE_SUPABASE_URL`, `VITE_SUPABASE_ANON_KEY`, `VITE_API_URL`
   (set `VITE_API_URL` to the deployed backend URL)

### Backend -> Render

`render.yaml` is a blueprint, so the service is created from config:

1. New -> Blueprint -> point at the repo
2. Render prompts for the `sync: false` vars: `FRONTEND_URL` and the three
   `SUPABASE_*` keys. `JWT_SECRET` is generated automatically
3. `SUPABASE_SERVICE_ROLE_KEY` stays server-side

Then set `VITE_API_URL` on the Vercel project to the Render URL and redeploy.

## CI

`.github/workflows/ci.yml` runs backend typecheck + build and frontend lint +
build on every push and PR to `main`.

## Project status

The storefront UI is still the stock Vite template and the API exposes only
`/api/health`. Schema and infrastructure are in place; routes, auth, and the
catalogue UI are not built yet.

### Known schema gaps

Not yet addressed in `supabase_schema.sql`:

- No row level security policies. Required before any real data goes in.
- No `updated_at` triggers, so `products` / `orders` timestamps go stale.
- No indexes on foreign key or frequently filtered columns.
- `settings` has no constraint enforcing a single row.
