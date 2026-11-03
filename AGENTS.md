# TaskOS - Engineering Instructions

## Project Objective
Build a lightweight Jira-like task management
application with a reusable MCP server.

## Stack
- Frontend: Next.js, React, TypeScript
- Backend: Node.js, Express, JavaScript ESM
- Database: MongoDB Atlas
- Validation: Zod
- MCP: Official TypeScript SDK
- Frontend hosting: Vercel
- Backend hosting: Render

## Backend Architecture
Every domain module must follow:

Routes -> Controller -> Service -> Repository

- Routes define HTTP endpoints.
- Controllers handle HTTP request/response.
- Services contain business logic.
- Repositories contain database operations.
- Validation schemas define input contracts.

## Architecture Rules
- Keep every source file below 50 lines.
- Use modular, reusable functions.
- Avoid duplicate business logic.
- Never access MongoDB from controllers.
- Never put business logic in routes.
- MCP tools must reuse service functions.
- Use async/await.
- Use centralized error handling.
- Validate all external input using Zod.

## Frontend Rules
- Use reusable React components.
- Separate UI primitives from domain components.
- Use TypeScript.
- Keep pages thin.
- Use Tailwind CSS.
- Avoid giant components.
- Keep API communication in lib/api.ts.

## Infrastructure
- No Docker.
- No Redis.
- No microservices.
- MongoDB Atlas for persistence.
- Render for backend.
- Vercel for frontend.

## Development Workflow
1. Work one phase at a time.
2. Never implement future phases prematurely.
3. Explain architectural changes.
4. Do not silently modify existing contracts.
5. Test each feature before moving forward.
6. Report changed files and test results.
7. Never commit secrets or .env files.
