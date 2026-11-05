# TaskOS MCP Server Documentation

TaskOS provides an official Model Context Protocol (MCP) Streamable HTTP endpoint at `/mcp` that exposes project management, task lifecycles, and collaboration capabilities to AI clients (e.g. Claude Desktop, Cursor).

---

## 1. Available MCP Tools

### Read-Only Tools (Read Scopes)
1. `taskos_server_info`: Diagnostic tool returning server version, mode, identity, and supported capabilities.
2. `project_list`: Lists all projects within the authenticated workspace.
3. `project_get`: Retrieves details for a specific project by ID.
4. `task_list`: Queries and paginates tasks in a project, with optional status and priority filters.
5. `task_get`: Retrieves complete task details by ID within the workspace.
6. `report_blockers`: Analyzes blockers for a project, categorizing explicit blockers and unresolved dependency blockers.

### Controlled Write Tools (Write Scopes)
1. `task_create`: Creates a task or subtask in an authorized project.
2. `task_update`: Updates permitted mutable task fields (`title`, `description`, `priority`, `dueDate`).
3. `task_assign`: Assigns or reassigns a task to an eligible workspace member, or unassigns with `null`.
4. `task_transition`: Advances or transitions a task status through its lifecycle (`backlog`, `todo`, `in_progress`, `in_review`, `done`).
5. `task_comment_create`: Appends a comment to a task attributed to the authenticated user.
6. `task_dependency_add`: Establishes a prerequisite dependency between two tasks in the same project with cycle detection.

---

## 2. Scopes and Permissions

API keys enforce fine-grained access scopes:

| Scope | Category | Description | Permitted Tools / Resources |
|---|---|---|---|
| `projects:read` | Read | Read workspace projects | `project_list`, `project_get`, `taskos://workspace/projects`, `taskos://projects/{id}` |
| `tasks:read` | Read | Read tasks and metadata | `task_list`, `task_get`, `taskos://projects/{id}/tasks` |
| `reports:read` | Read | Read blocker reports and analytics | `report_blockers`, `taskos://projects/{id}/blockers` |
| `tasks:write` | Write | Create/update/assign/transition tasks | `task_create`, `task_update`, `task_assign`, `task_transition` |
| `comments:write` | Write | Add task comments | `task_comment_create` |
| `dependencies:write` | Write | Add task dependencies | `task_dependency_add` |

---

## 3. Workspace Role Enforcement

TaskOS resolves effective authorization dynamically from the API key creator's current workspace membership:

- **Viewer**: Read-only access (`projects:read`, `tasks:read`, `reports:read`). All write tool executions are rejected with `403 Forbidden`.
- **Member**: Authorized for standard task operations: creating tasks, editing mutable fields, assigning tasks, status transitions, adding comments, and creating dependencies.
- **Admin / Owner**: Full task and administrative operations.

If a member's role is updated or membership is revoked, permissions take effect immediately without regenerating API keys.

---

## 4. API Key Setup

API keys are created in the TaskOS Workspace Settings under **MCP API Keys**:
- **Format**: `taskos_live_<64-character-hex>`
- **Storage**: Plaintext keys are shown only once upon creation. Only a salted SHA-256 hash is persisted in the database.
- **Header**: Passed in the `Authorization: Bearer <key>` header on all `/mcp` requests.

---

## 5. Tool Invocations & Examples

### A. Task Creation (`task_create`)
```json
{
  "name": "task_create",
  "arguments": {
    "projectId": "672901234567890abcdef012",
    "title": "Implement OAuth flow",
    "priority": "high",
    "description": "Add Google and GitHub OAuth providers."
  }
}
```
**Response**:
```json
{
  "content": [{ "type": "text", "text": "Created task [AUTH-4] Implement OAuth flow" }],
  "structuredContent": {
    "success": true,
    "data": {
      "task": {
        "id": "672901234567890abcdef099",
        "key": "AUTH-4",
        "title": "Implement OAuth flow",
        "status": "backlog",
        "projectId": "672901234567890abcdef012"
      }
    }
  }
}
```

### B. Task Assignment (`task_assign`)
```json
{
  "name": "task_assign",
  "arguments": {
    "taskId": "672901234567890abcdef099",
    "assigneeId": "672901234567890abcdef044"
  }
}
```

### C. Status Transition (`task_transition`)
```json
{
  "name": "task_transition",
  "arguments": {
    "taskId": "672901234567890abcdef099",
    "status": "in_progress"
  }
}
```

### D. Comment Creation (`task_comment_create`)
```json
{
  "name": "task_comment_create",
  "arguments": {
    "taskId": "672901234567890abcdef099",
    "content": "Initial PR opened for review."
  }
}
```

### E. Dependency Addition (`task_dependency_add`)
```json
{
  "name": "task_dependency_add",
  "arguments": {
    "taskId": "672901234567890abcdef099",
    "dependsOnTaskId": "672901234567890abcdef010"
  }
}
```

---

## 6. Error Handling & Safe Error Categories

All tool errors return structured error responses without leaking MongoDB internals, stack traces, or authorization tokens:

```json
{
  "isError": true,
  "content": [{ "type": "text", "text": "Error: Cannot complete task with unfinished dependencies" }],
  "structuredContent": {
    "success": false,
    "error": "Cannot complete task with unfinished dependencies"
  }
}
```

Audit logs classify failures into safe error categories: `VALIDATION_ERROR`, `FORBIDDEN`, `NOT_FOUND`, `CONFLICT`, or `INTERNAL_ERROR`.

---

## 7. Idempotency & Retry Behavior

- **Naturally Idempotent Operations**:
  - `task_update`: Setting fields to the same values results in the same task state.
  - `task_assign`: Re-assigning to the same assignee is idempotent.
  - `task_transition`: Re-transitioning to the current state preserves lifecycle validation.
  - `task_dependency_add`: Idempotently guarded by uniqueness validation (`400 Dependency already exists`).
- **Creation Retries (`task_create`, `task_comment_create`)**:
  - Task and comment creations generate new sequential keys and entities. In the event of network timeouts, AI clients should query existing tasks (`task_list`) or verify recent comments before re-attempting creation to prevent unintentional duplicates.

---

## 8. Client Configuration Example (Claude Desktop)

Add the following to your `claude_desktop_config.json`:

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
        "Authorization: Bearer taskos_live_0123456789abcdef0123456789abcdef0123456789abcdef0123456789abcdef"
      ]
    }
  }
}
```
*(Replace the placeholder API key above with your actual key generated from TaskOS settings).*
