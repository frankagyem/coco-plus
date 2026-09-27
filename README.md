# COCO+

Premium fashion e-commerce. React + Vite storefront, Express + TypeScript API, Supabase (Postgres + Auth + Storage).

## Layout

```
backend/    Express 5 API (TypeScript, CommonJS) - port 5000
frontend/   Vite 8 + React 19 + Tailwind 4 SPA    - port 5173
supabase/   CLI config + migrations
```

## Prerequisites

- Node.js 24+
- A Supabase project (free tier is fine)

## Database setup

The schema lives at `supabase/migrations/20260926000000_initial_schema.sql`
(18 tables), hardened by `20260926000100_hardening.sql`. Pick one of the two
routes below.

### Local Supabase (needs Docker Desktop)

Full local stack: Postgres, Auth, Storage, and Studio at
http://127.0.0.1:54323. The CLI is already installed, so once Docker Desktop
is running:

```bash
supabase start          # first run pulls several GB of images
supabase status
```

Migrations apply automatically on `start`. To load the sample catalogue
(5 categories, 14 products, 36 variants, 7 delivery areas):

```bash
psql "$DB_URL" -f supabase/seed.sql   # or paste into Studio's SQL editor
```

The seed is idempotent, so re-running it will not duplicate rows. To reset to a
clean state after editing a migration:

```bash
supabase db reset   # re-applies migrations, then re-runs seed.sql if present
supabase stop
```

`supabase start` prints the local API URL and anon / service-role keys. Copy
them into the two `.env` files below.

Local-only credentials, safe for `.env` but **never** for production:

| Variable | Local value |
| --- | --- |
| `SUPABASE_URL` / `VITE_SUPABASE_URL` | `http://127.0.0.1:54321` |
| `SUPABASE_ANON_KEY` / `VITE_SUPABASE_ANON_KEY` | the `ANON_KEY` from `supabase status` |
| `SUPABASE_SERVICE_ROLE_KEY` | the `SERVICE_ROLE_KEY` from `supabase status` |

Restart the backend after editing `backend/.env`; nodemon only watches
`backend/src`.

### Hosted Supabase

1. Create a project at https://supabase.com/dashboard
2. SQL Editor -> New query -> paste the whole migration file -> Run
3. Table Editor should then list all 18 tables

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

## API

All routes are prefixed `/api`. Errors return `{ "error": string }`.

| Method | Route | Auth | Purpose |
| --- | --- | --- | --- |
| GET | `/health` | - | Liveness plus a real query against `settings` |
| GET | `/categories` | - | Categories with product counts |
| GET | `/products` | - | Paginated active products. `category` (slug), `featured`, `new`, `search`, `page`, `limit` (max 60) |
| GET | `/products/:slug` | - | One product with images, variants, and rating summary |
| GET | `/delivery-areas` | - | Delivery areas and fees |
| GET | `/settings` | - | Public store settings |
| POST | `/orders` | optional | Create an order |

`POST /orders` takes `{ items: [{ productId, variantId?, quantity }], deliveryAreaId?, deliveryAddress?, voucherCode?, paymentMethod? }` and is the only write path from the client.

Totals are recomputed server-side from the database. Prices, discounts, delivery
fees and stock in the request body are ignored, because a browser can send
anything. The service-role client reads the products, applies the voucher rules,
writes the order, then decrements variant stock. A failed line insert rolls the
order row back.

Auth uses Supabase Auth. Send `Authorization: Bearer <access token>` from
`supabase.auth.getSession()`. Tokens are verified with `auth.getUser`, and
`requireAdmin` additionally checks the `admins` table.

## Project status

No database is connected yet, so nothing has run against real data. What exists:

- Schema, with a second migration for RLS, triggers, indexes and constraints
- API: health, categories, products, delivery areas, settings, orders
- Storefront: home, catalogue with filters and pagination, product detail,
  cart, WhatsApp checkout, four themes, 404

Not built: customer accounts and wishlists, admin UI, payment gateway,
product/variant management, order tracking, review submission.

## Security notes

- RLS is on for all 18 tables. The browser uses the anon key, so RLS is the only
  barrier between a leaked key and the database.
- Orders, customers, vouchers and referrals have no client insert policy by
  design. Only the service-role key can write them, which is what keeps order
  totals honest.
- `SUPABASE_SERVICE_ROLE_KEY` must never reach a `VITE_` variable. Vite inlines
  those into the client bundle.
