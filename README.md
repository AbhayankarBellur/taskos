# taskos

Lightweight Jira-like task management application with a reusable MCP server.

- `backend/` — Node.js + Express (ESM) + MongoDB Atlas
- `frontend/` — Next.js + React + TypeScript + Tailwind CSS

## Local development

```bash
cd backend && cp .env.example .env   # fill in MONGODB_URI
npm install && npm run dev

cd frontend && cp .env.example .env.local
npm install && npm run dev
```
