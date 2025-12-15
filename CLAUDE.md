# Mindster

Personal intelligent hub — a center for managing AI agents, services, and tools.

## Tech Stack

### Backend
- **Runtime:** Bun
- **Framework:** Fastify
- **Database:** PostgreSQL
- **ORM:** Drizzle
- **Auth:** Better Auth
- **AI:** Vercel AI SDK
- **Telegram:** grammY

### Frontend
- **Framework:** React + Vite
- **UI:** Tailwind CSS + shadcn/ui
- **Architecture:** Feature-Sliced Design (FSD)

### API
- **Approach:** API First
- **Spec:** OpenAPI
- **Client generation:** orval

### Testing
- **Framework:** Vitest

## Project Structure

```
mindster/
├── apps/
│   ├── api/          # Fastify backend
│   ├── web/          # React SPA
│   └── bot/          # Telegram bot
├── packages/
│   └── shared/       # Shared types, utils
├── docs/
│   ├── ARCHITECTURE.md
│   └── adr/          # Architecture Decision Records
└── docker-compose.yml
```

## Commands

```bash
# Install dependencies
bun install

# Development
bun run dev           # Start all services
bun run dev:api       # Start API only
bun run dev:web       # Start web only
bun run dev:bot       # Start bot only

# Testing
bun run test          # Run all tests
bun run test:unit     # Unit tests only
bun run test:int      # Integration tests only

# API
bun run gen:api       # Generate API client from OpenAPI spec

# Build
bun run build         # Build all
bun run docker:up     # Start with Docker Compose
```

## Code Conventions

- **Language:** English (code, comments, commits, docs)
- **Commits:** Conventional Commits format
- **Backend architecture:** Feature-based modular
- **Frontend architecture:** FSD (app, pages, widgets, features, entities, shared)
- **API:** Spec-first — update OpenAPI before implementation

## Key Files

- `apps/api/openapi.yaml` — API specification
- `apps/api/src/modules/` — Backend modules
- `apps/web/src/` — Frontend (FSD structure)
- `docker-compose.yml` — Local deployment

## Environment Variables

```bash
# Database
DATABASE_URL=postgresql://user:pass@localhost:5432/mindster

# Encryption key for API keys storage
ENCRYPTION_KEY=your-32-byte-key

# Telegram bot
TELEGRAM_BOT_TOKEN=your-bot-token
```

## Architecture Decisions

See `docs/adr/` for detailed rationale on technology choices.

## Claude Code Instructions

### MANDATORY: Use Subagents

**ALWAYS delegate to specialized agents — do NOT handle directly:**

#### Built-in Subagents

| Task | Subagent | When |
|------|----------|------|
| Explore codebase | `Explore` | Searching files, understanding structure, finding patterns |
| Plan implementation | `Plan` | Before implementing features with 3+ steps |
| Complex multi-step tasks | `general-purpose` | Research, refactoring across multiple files |

#### Project-Specific Agents (`.claude/agents/`)

| Agent | Domain | When to Use |
|-------|--------|-------------|
| `frontend` | React, FSD, Tailwind, shadcn/ui | Any work in `apps/web/` |
| `backend` | Fastify, Drizzle, modules | Any work in `apps/api/` |
| `bot` | grammY, Telegram | Any work in `apps/bot/` |
| `api-designer` | OpenAPI specification | Designing/modifying API contracts |

**Example triggers:**
- "Where is X implemented?" → Use `Explore` subagent
- "How does Y work?" → Use `Explore` subagent
- "Implement feature Z" → Use `Plan` first, then delegate to `frontend`/`backend`
- "Add new endpoint" → Use `api-designer` first, then `backend`, then `frontend`
- "Create React component" → Use `frontend` agent
- "Add Telegram command" → Use `bot` agent

### MANDATORY: Use Skills

**Use skills for common procedures (`.claude/skills/`):**

| Skill | Purpose | When to Use |
|-------|---------|-------------|
| `fsd-component` | Create FSD-compliant component | New React component needed |
| `api-endpoint` | Full API cycle (spec→backend→frontend) | New endpoint needed |
| `db-migration` | Drizzle schema + migration | Database changes |
| `new-module` | Scaffold backend module | New feature area |

**Workflow example — "Add provider management":**
1. Use `api-designer` agent to design OpenAPI
2. Use `db-migration` skill for database schema
3. Use `new-module` skill for backend module
4. Use `api-endpoint` skill for each endpoint
5. Use `fsd-component` skill for frontend components

### Use Slash Commands

Available project commands (use these instead of typing commands manually):

- `/test` — Run tests
- `/lint` — Check code style
- `/gen-api` — Generate API client from OpenAPI spec
- `/typecheck` — Run type checking

### Use TodoWrite Tool

**ALWAYS use TodoWrite for:**
- Tasks with 2+ steps
- Any feature implementation
- Bug fixes requiring investigation
- Refactoring tasks

Update todo status in real-time. Mark complete immediately after finishing each item.

### API First Workflow

When implementing API endpoints:
1. Update `apps/api/openapi.yaml` first
2. Run `/gen-api` to regenerate client
3. Implement backend endpoint
4. Use generated hooks on frontend

### FSD Guidelines (Frontend)

Layer import rules (top can import from bottom only):
```
app → pages → widgets → features → entities → shared
```

Never import upward. Use `shared` for cross-cutting concerns.

### MANDATORY: Use MCP Servers

**Available MCP servers (`.mcp.json`):**

| Server | Purpose | When to Use |
|--------|---------|-------------|
| `context7` | Fresh documentation for libraries | Checking API of Fastify, Drizzle, grammY, shadcn/ui, etc. |
| `postgres` | Direct database access | Debugging queries, checking data, exploring schema |
| `playwright` | Browser automation | E2E tests, screenshots, visual validation |

**Example triggers:**
- "How does Drizzle handle relations?" → Use `context7` for latest docs
- "What's in the users table?" → Use `postgres` to query
- "Check if login page works" → Use `playwright` to test
- "Take screenshot of dashboard" → Use `playwright`

**IMPORTANT:** Prefer MCP tools over guessing or using outdated knowledge. Always use `context7` when unsure about library APIs.
