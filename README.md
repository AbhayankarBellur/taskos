# taskos

Lightweight Jira-like task management application with a reusable MCP server.

- `backend/` — Node.js + Express (ESM) + MongoDB Atlas
- `frontend/` — Next.js + React + TypeScript + Tailwind CSS

## Local development

```bash
cd backend && cp .env.example .env   # fill in MONGODB_URI and JWT_SECRET
npm install && npm run dev

cd frontend && cp .env.example .env.local
npm install && npm run dev
```

Generate a JWT secret with `openssl rand -base64 48` (or
`node -e "console.log(require('crypto').randomBytes(48).toString('base64'))"`).

## Backend tests

`npm test` in `backend/` runs the `node:test` integration suite against the
`taskos_test` database on the cluster in `MONGODB_URI`. It clears that database
before and after each file and never touches `MONGODB_DB_NAME`.

## Authentication and workspaces

- Login sets an HttpOnly `taskos_session` cookie holding a signed JWT (HS256,
  issuer `JWT_ISSUER`, 7 days). Its session id is checked against the
  `sessions` collection, so logout revokes it server-side.
- Production cookies are `Secure; SameSite=None`; development uses `SameSite=Lax`.
- CSRF: every POST/PATCH/DELETE must come from an origin in `FRONTEND_URL`, and
  authenticated mutations must send the `X-CSRF-Token` header returned by
  `/auth/login`, `/auth/register` and `/auth/me`. The frontend keeps it in memory.
- `FRONTEND_URL` is a comma-separated list of exact origins (no trailing slash).
  It drives both CORS and the origin check.
- All projects live under `/api/v1/workspaces/:workspaceId/projects` and every
  query filters by `workspaceId`.

## Migrating Phase 1 projects

Projects created before Phase 2 have no `workspaceId` and are invisible until
migrated. Register your account first, then from `backend/`:

```bash
node scripts/migrate-legacy-projects.js --owner-email you@example.com            # dry run
node scripts/migrate-legacy-projects.js --owner-email you@example.com --apply    # migrate
```

Add `--workspace <id>` if the account owns more than one workspace. The script
only targets workspaces the given user owns and is safe to re-run.

## Deployment

| | Render (backend, root `backend`) | Vercel (frontend, root `frontend`) |
|---|---|---|
| Env | `NODE_ENV=production`, `MONGODB_URI`, `MONGODB_DB_NAME`, `FRONTEND_URL`, `JWT_SECRET`, optional `JWT_ISSUER`, `AUTH_RATE_LIMIT` | `NEXT_PUBLIC_API_URL` |
| Health | `/health` | — |

The backend refuses to start without a `JWT_SECRET` of at least 32 characters.
