# TaskOS

> A lightweight, high-performance Jira-like task management platform with an integrated official Model Context Protocol (MCP) server.

TaskOS bridges human task management and AI agentic workflows. It exposes project planning, task tracking, lifecycle transitions, collaboration, and dependency graphs to AI clients (such as Claude Desktop and Cursor) via the Model Context Protocol (MCP Streamable HTTP) while strictly preserving workspace isolation, role-based access control, cryptographic key authentication, and audit trails.

---

## Table of Contents

1. [Architectural Overview](#1-architectural-overview)
2. [Tech Stack](#2-tech-stack)
3. [Workspace Multi-Tenancy & Data Isolation](#3-workspace-multi-tenancy--data-isolation)
4. [Role-Based Access Control (RBAC)](#4-role-based-access-control-rbac)
5. [Task Lifecycle & State Machine](#5-task-lifecycle--state-machine)
6. [MCP Server Architecture](#6-mcp-server-architecture)
7. [API Keys, Scopes & Dual-Gate Security](#7-api-keys-scopes--dual-gate-security)
8. [MCP Tool Registry (12 Tools)](#8-mcp-tool-registry-12-tools)
9. [MCP Resources & Prompts](#9-mcp-resources--prompts)
10. [Audit Logging & Security Boundary](#10-audit-logging--security-boundary)
11. [Idempotency & Retry Semantics](#11-idempotency--retry-semantics)
12. [AI Client Setup (Claude Desktop & Cursor)](#12-ai-client-setup-claude-desktop--cursor)
13. [Local Development & Testing](#13-local-development--testing)
14. [Production Deployment](#14-production-deployment)

---

## 1. Architectural Overview

TaskOS is engineered with a strict four-layer service architecture and an absolute rule of modularity:

```
[ HTTP REST Clients ]               [ External AI Clients (Claude / Cursor) ]
         │                                               │
         ▼                                               ▼
[ REST Controllers ]                         [ MCP Streamable HTTP (/mcp) ]
         │                                               │
         │   (Authentication & Workspace Context)        │
         └───────────────────────┬───────────────────────┘
                                 │
                                 ▼
                    [ Central Service Layer ]
            (taskService, projectService, memberService, etc.)
                                 │
                                 ▼
                     [ Data Repository Layer ]
                 (Direct native MongoDB driver queries)
                                 │
                                 ▼
                    [ MongoDB Atlas Cluster ]
```

### Architectural Principles
- **Routes → Controller → Service → Repository**: Controllers and MCP handlers never execute raw database queries. All business rules live in pure, reusable service functions.
- **Zero Duplication**: MCP write tools invoke the exact same service methods that power the web interface.
- **Micro-Modular Source Code**: Every single `.js`, `.ts`, and `.tsx` source file in the project is strictly constrained to **fewer than 50 lines of code**.
- **Context Isolation**: MCP requests use Node.js `AsyncLocalStorage` to propagate authenticated user, workspace, and role contexts down the call stack without parameter tampering.

---

## 2. Tech Stack

| Layer | Technologies | Description |
|---|---|---|
| **Frontend** | Next.js 16 (App Router), React 19, TypeScript, Tailwind CSS v4 | Modular dashboard, board/list views, real-time key management |
| **Backend** | Node.js (ESM), Express 5, Native MongoDB Driver | Controller-independent services, transactions, zero ORM overhead |
| **Protocol** | `@modelcontextprotocol/sdk` (TypeScript v2) | Official Streamable HTTP server, JSON-RPC 2.0, SSE streaming |
| **Validation** | Zod 4 | Input contract validation for both REST endpoints and MCP tools |
| **Hosting** | Render (Backend), Vercel (Frontend), MongoDB Atlas | Production continuous deployment linked to `main` branch |

---

## 3. Workspace Multi-Tenancy & Data Isolation

TaskOS uses a tenant-isolated data model where **Workspaces** represent the fundamental administrative and security boundary:

1. **Workspace Boundary**: Every entity (`projects`, `tasks`, `comments`, `task_dependencies`, `task_events`, `mcp_api_keys`) is tagged with its parent `workspaceId`.
2. **Cross-Workspace Defense**: If an AI client or user provides an ID belonging to another workspace, the service layer throws `404 Not Found` (rather than `403 Forbidden`) to prevent workspace entity enumeration.
3. **Atomic Sequential Task Keys**: Each project generates human-readable, sequentially incremented keys (e.g. `CORE-1`, `CORE-2`, `DBSE-7`) using atomic MongoDB counter updates within transactions.
4. **Subtask Hierarchy**: Tasks support subtasks linked via `parentTaskId`. Subtasks strictly inherit and validate parent project and workspace containment.

---

## 4. Role-Based Access Control (RBAC)

TaskOS defines a 4-tier role hierarchy within each workspace:

$$\text{viewer} < \text{member} < \text{admin} < \text{owner}$$

### Permissions Matrix

| Capability | Viewer | Member | Admin | Owner |
|---|:---:|:---:|:---:|:---:|
| View projects, tasks, comments & blockers | ✅ | ✅ | ✅ | ✅ |
| Execute read-only MCP tools & read resources | ✅ | ✅ | ✅ | ✅ |
| Create tasks and subtasks | ❌ | ✅ | ✅ | ✅ |
| Update task details (title, description, priority, due date) | ❌ | ✅ | ✅ | ✅ |
| Assign / reassign tasks to workspace members | ❌ | ✅ | ✅ | ✅ |
| Transition task statuses (`backlog` → `done`) | ❌ | ✅ | ✅ | ✅ |
| Add task comments | ❌ | ✅ | ✅ | ✅ |
| Add prerequisite task dependencies | ❌ | ✅ | ✅ | ✅ |
| Archive / unarchive tasks | ❌ | ❌ | ✅ | ✅ |
| Invite members & modify member roles | ❌ | ❌ | ✅ | ✅ |
| Generate & revoke MCP API keys | ❌ | ✅ | ✅ | ✅ |
| Transfer workspace ownership | ❌ | ❌ | ❌ | ✅ |

### Dynamic Role Resolution
The MCP authentication layer resolves the user's role in real-time from `workspace_members`. If an administrator downgrades a user or removes them from a workspace, their active MCP keys immediately reflect the new restrictions without requiring key rotation.

---

## 5. Task Lifecycle & State Machine

Tasks move through a validated five-stage lifecycle:

$$\text{backlog} \longrightarrow \text{todo} \longrightarrow \text{in\_progress} \longrightarrow \text{in\_review} \longrightarrow \text{done}$$

### Lifecycle Rules & Guards
- **Blocked Task Protection**: A task flagged with an active blocker reason cannot be transitioned to `done`.
- **Dependency Completion Guard**: A task with unfinished prerequisite dependencies cannot be transitioned to `done`. Attempting to complete it returns a validation error detailing the blocking task keys.
- **Automatic Completion Timestamps**: Reaching `done` automatically records `completedAt: new Date()`. Moving a task back to an earlier status clears `completedAt`.
- **Dependency Cycle Detection**: Graph traversal prevents circular dependency chains (e.g. A depends on B, B depends on C, C depends on A).
- **Self-Dependency Prohibition**: Tasks cannot depend on themselves.

---

## 6. MCP Server Architecture

The TaskOS MCP server is exposed at `/mcp` using the **Streamable HTTP transport**:

```
[ AI Model ] 
    │
    ▼ JSON-RPC 2.0 (POST /mcp)
[ Security Layer ]
    ├─ DNS Rebinding & Host Validation
    ├─ Origin Verification (Permits Native AI Clients with missing origin)
    └─ Bearer Token Hash Lookup
    │
    ▼
[ AsyncLocalStorage Execution Context ]
    │  (userId, workspaceId, role, scopes, keyId)
    │
    ├─► [ 12 Registered Tools ]
    ├─► [ 5 Registered Resources ]
    └─► [ 5 Reusable Prompts ]
```

- **Transport**: Standard HTTP POST supporting both `application/json` and Server-Sent Events (`text/event-stream`).
- **Development vs. Production**: In production, development-mode contexts are strictly disabled; all requests require valid Bearer token authentication.

---

## 7. API Keys, Scopes & Dual-Gate Security

### API Key Specification
- **Format**: `taskos_live_<64-character-hex>` (256-bit cryptographically secure entropy).
- **One-Time Secret Reveal**: The plaintext key is returned exactly once upon creation. Only a salted SHA-256 hash is persisted in the database.
- **Revocation**: Revoked keys (`revokedAt != null`) are rejected instantly.

### Scope Definitions

| Scope | Type | Permitted Capabilities |
|---|---|---|
| `projects:read` | Read | Query workspace projects, project details, project resources |
| `tasks:read` | Read | Query tasks, subtasks, task details, task resources |
| `reports:read` | Read | Query blocker reports, blocker analysis prompt |
| `tasks:write` | Write | Create tasks, update fields, assign members, transition statuses |
| `comments:write` | Write | Post task comments |
| `dependencies:write` | Write | Link prerequisite task dependencies |

### The Dual-Gate Security Model
Every mutation requires **both** the workspace role **and** the API key scope to permit the action:

$$\text{Authorized} \iff \text{RolePermits}(\text{Action}) \land \text{ScopePermits}(\text{Action})$$

- If a workspace **Owner** uses an API key with only `tasks:read`, write mutations are rejected with `403 Forbidden: missing required scope 'tasks:write'`.
- If a workspace **Viewer** uses an API key with `tasks:write`, write mutations are rejected with `403 Forbidden: insufficient permissions`.

---

## 8. MCP Tool Registry (12 Tools)

TaskOS provides 12 official tools registered with the MCP runtime:

### Diagnostic Tool
- **`taskos_server_info`**: Returns server identity, runtime status, and feature matrix.

### Read Tools (`readOnlyHint: true`)
- **`project_list`**: Lists all projects within the authenticated workspace.
  - *Scope*: `projects:read`
- **`project_get`**: Retrieves project metadata by `projectId`.
  - *Scope*: `projects:read`
- **`task_list`**: Queries tasks in a project with optional `status`, `priority`, and pagination (`page`, `limit`).
  - *Scope*: `tasks:read`
- **`task_get`**: Retrieves complete details for a single task by `taskId`.
  - *Scope*: `tasks:read`
- **`report_blockers`**: Returns explicit blockers and unresolved dependency blockers for a project.
  - *Scope*: `reports:read`

### Write Tools (`readOnlyHint: false`)
- **`task_create`**: Creates a task or subtask.
  - *Inputs*: `projectId`, `title`, `description?`, `priority?`, `assigneeId?`, `dueDate?`, `parentTaskId?`
  - *Scope*: `tasks:write`
- **`task_update`**: Modifies permitted fields on an existing task.
  - *Inputs*: `taskId`, `title?`, `description?`, `priority?`, `dueDate?`
  - *Scope*: `tasks:write`
- **`task_assign`**: Assigns/reassigns a task to an eligible workspace member, or unassigns (`assigneeId: null`).
  - *Inputs*: `taskId`, `assigneeId`
  - *Scope*: `tasks:write`
- **`task_transition`**: Changes lifecycle status with blocker and dependency enforcement.
  - *Inputs*: `taskId`, `status` (`backlog`, `todo`, `in_progress`, `in_review`, `done`)
  - *Scope*: `tasks:write`
- **`task_comment_create`**: Appends a comment to a task attributed to the authenticated user.
  - *Inputs*: `taskId`, `content` (1–5000 characters)
  - *Scope*: `comments:write`
- **`task_dependency_add`**: Establishes prerequisite dependency between two tasks in the same project.
  - *Inputs*: `taskId`, `dependsOnTaskId`
  - *Scope*: `dependencies:write`

---

## 9. MCP Resources & Prompts

### Resources
Clients can read live workspace entities via standardized URI templates:

| Resource URI | Description | Scope |
|---|---|---|
| `taskos://workspace/projects` | Overview of all projects in the workspace | `projects:read` |
| `taskos://projects/{projectId}` | Comprehensive project metadata | `projects:read` |
| `taskos://projects/{projectId}/tasks` | Full list of active tasks for a project | `tasks:read` |
| `taskos://tasks/{taskId}` | Detailed single task record | `tasks:read` |
| `taskos://projects/{projectId}/blockers` | Active blockers and blocked task hierarchy | `reports:read` |

### Prompts
TaskOS provides structured prompts to guide AI reasoning over workspace state:
- **`project_overview`**: Summarizes health, scope, and progress of a project.
- **`break_down_feature`**: Converts high-level requirements into parent tasks and subtasks.
- **`sprint_review`**: Evaluates completed vs pending work in a project.
- **`blocker_analysis`**: Investigates blocked tasks and recommends resolution steps.
- **`task_review`**: Inspects a specific task's readiness, description clarity, and dependencies.

---

## 10. Audit Logging & Security Boundary

Every mutation executed through an MCP tool produces an audit trail in the `mcp_audit_logs` collection:

```json
{
  "_id": "6aec453ba734cc4c59e2a2a6",
  "keyId": "6aec3725decceba7ea87db3d9",
  "userId": "6ae9977b682abdf72ef1f3af",
  "workspaceId": "6ae9977b682abdf72ef1f3b0",
  "toolName": "task_create",
  "success": true,
  "errorCategory": null,
  "createdAt": "2026-11-05T08:58:35.120Z"
}
```

### Security Guarantees
- **No Token Leaks**: Plaintext API keys, Bearer headers, and session cookies are never written to audit logs.
- **Safe Error Classification**: Failed invocations record a standardized `errorCategory` (`VALIDATION_ERROR`, `FORBIDDEN`, `NOT_FOUND`, `CONFLICT`, `INTERNAL_ERROR`) without leaking stack traces or internal database errors to clients.

---

## 11. Idempotency & Retry Semantics

- **Naturally Idempotent Operations**:
  - `task_update`: Applying the same values produces the identical final task state.
  - `task_assign`: Assigning an already-assigned task is safe and idempotent.
  - `task_transition`: Transitioning to the current state preserves lifecycle integrity.
  - `task_dependency_add`: Guarded by duplicate detection; duplicate requests return `400 Dependency already exists`.
- **Creation Retries (`task_create`, `task_comment_create`)**:
  - Task and comment creations allocate new sequential keys and records. AI client developers should query `task_list` before retrying timed-out creation requests to avoid accidental duplicate task creation.

---

## 12. AI Client Setup (Claude Desktop & Cursor)

### Claude Desktop Configuration
Add the TaskOS server configuration to your `claude_desktop_config.json`:

- **macOS**: `~/Library/Application Support/Claude/claude_desktop_config.json`
- **Windows**: `%APPDATA%\Claude\claude_desktop_config.json`

```json
{
  "mcpServers": {
    "taskos": {
      "command": "npx",
      "args": [
        "-y",
        "mcp-remote-client",
        "https://taskos-7pgk.onrender.com/mcp",
        "--header",
        "Authorization: Bearer taskos_live_YOUR_ACTUAL_API_KEY_HERE"
      ]
    }
  }
}
```

### Direct HTTP Request Example
```bash
curl -X POST https://taskos-7pgk.onrender.com/mcp \
  -H "Content-Type: application/json" \
  -H "Accept: application/json, text/event-stream" \
  -H "Authorization: Bearer taskos_live_YOUR_API_KEY" \
  -d '{
    "jsonrpc": "2.0",
    "id": "1",
    "method": "tools/call",
    "params": {
      "name": "task_create",
      "arguments": {
        "projectId": "6ae9bc6decceba7ea87db3ac",
        "title": "Build user notification preferences",
        "priority": "high"
      }
    }
  }'
```

---

## 13. Local Development & Testing

### Prerequisites
- Node.js 20+
- MongoDB instance (Atlas or local)

### Backend Setup
```bash
cd backend
cp .env.example .env
# Configure MONGODB_URI, JWT_SECRET, FRONTEND_URL, MCP_ENABLED=true
npm install
npm run dev
```

### Run Integration Tests
The backend test suite runs 59 integration tests against the isolated in-memory/test database:
```bash
npm --prefix backend test
```

### Frontend Setup
```bash
cd frontend
cp .env.example .env.local
# Set NEXT_PUBLIC_API_URL=http://localhost:5000
npm install
npm run dev
npm run lint
npm run build
```

---

## 14. Production Deployment

| Service | Host | URL | Configuration |
|---|---|---|---|
| **Backend** | Render | `https://taskos-7pgk.onrender.com` | `MCP_ENABLED=true`, `NODE_ENV=production` |
| **Frontend** | Vercel | `https://taskos-khaki.vercel.app` | `NEXT_PUBLIC_API_URL=https://taskos-7pgk.onrender.com` |
| **Database** | MongoDB Atlas | Cluster | Native indexes on `workspaceId`, `projectId`, `taskKey` |

Both Render and Vercel automatically trigger zero-downtime builds upon pushes to the `main` branch.
