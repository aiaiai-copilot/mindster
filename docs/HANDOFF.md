# Handoff: Mindster Brainstorming Session

**Date:** 2025-12-15
**Status:** Architecture and configuration complete, ready for implementation

## Project Summary

**Mindster** — Personal AI-Powered Assistant Platform.

- **Concept:** Modular plugin-ready platform with tools unified by AI assistant
- **Domain:** mindstr.ru
- **Repository:** https://github.com/aiaiai-copilot/mindster
- **Business model:** Self-hosted turnkey → SaaS (future)

## What Was Done

### 1. Architecture Decisions
All technology choices documented in `docs/ARCHITECTURE.md` and `docs/adr/001-tech-stack.md`:

| Layer | Stack |
|-------|-------|
| Backend | Bun + Fastify + Drizzle + PostgreSQL |
| Frontend | React + Vite + Tailwind + shadcn/ui |
| Auth | Better Auth (single admin for prototype) |
| AI | Vercel AI SDK (multi-provider, user custom models) |
| Telegram | grammY |
| API | API First + OpenAPI + orval |
| Testing | Vitest (unit + integration) |
| Deploy | Docker Compose |

### 2. Claude Code Configuration
All configurations verified against current documentation:

| Component | Location | Status |
|-----------|----------|--------|
| CLAUDE.md | `/CLAUDE.md` | ✅ Complete |
| Slash commands | `.claude/commands/*.md` | ✅ With frontmatter |
| Agents | `.claude/agents/*.md` | ✅ With YAML frontmatter |
| Skills | `.claude/skills/*/SKILL.md` | ✅ Directory structure |
| MCP servers | `.mcp.json` | ✅ context7, postgres, playwright |

### 3. Project Structure (Planned)
```
mindster/
├── apps/
│   ├── api/          # Fastify backend (modular architecture)
│   ├── web/          # React SPA (FSD architecture)
│   └── bot/          # Telegram bot (grammY)
├── packages/
│   └── shared/       # Shared types, utils
├── docs/
│   ├── ARCHITECTURE.md
│   ├── HANDOFF.md
│   └── adr/
└── docker-compose.yml
```

## Prototype Features

1. Admin account (created on first launch)
2. Adding AI provider API keys (AES-256 encrypted in DB)
3. Connecting custom models via endpoint + API key
4. Chat with selected model (streaming)
5. Conversation history
6. **Simple task list** (CRUD, statuses)
7. Telegram bot (linked to owner, same functionality)

## MVP Features (after prototype)

1. All prototype features
2. **Calendar** (events, reminders)
3. **Contacts** (CRUD, link to tasks)
4. **Plugin API** (standard interface for modules, enable/disable)
5. AI assistant integration with tools

## Key Architectural Decisions

- `user_id` in all tables (SaaS readiness)
- OpenAI-compatible models without system updates
- API First — update OpenAPI before implementation
- FSD for frontend, modular for backend
- **Plugin-ready architecture** — each tool is a module with standard interface

## Git Workflow

- **Prototype:** GitHub Flow (current)
- **MVP:** Trunk-based + Feature Flags

## Development Environment

- OS: Windows + WSL2
- Approach: AI-Driven Development
- Language: English (code, comments, commits, docs)

## Custom Agents Available

| Agent | Purpose |
|-------|---------|
| `frontend` | React, FSD, Tailwind, shadcn/ui |
| `backend` | Fastify, Drizzle, modular architecture |
| `bot` | grammY, Telegram |
| `api-designer` | OpenAPI specifications |

## Custom Skills Available

| Skill | Purpose |
|-------|---------|
| `fsd-component` | Create FSD-compliant React component |
| `api-endpoint` | Full cycle: OpenAPI → backend → frontend |
| `db-migration` | Drizzle schema + migration |
| `new-module` | Scaffold backend module |

## MCP Servers Configured

| Server | Purpose |
|--------|---------|
| `context7` | Fresh library documentation |
| `postgres` | Direct database access |
| `playwright` | E2E testing, screenshots |

## Next Steps

1. **Initialize monorepo structure** (apps/, packages/)
2. **Set up Bun workspace** with package.json
3. **Create Docker Compose** for local development
4. **Scaffold API app** with Fastify + Drizzle
5. **Scaffold Web app** with Vite + React + FSD
6. **Scaffold Bot app** with grammY
7. **Implement MVP features**

## Open Questions (None Currently)

All architectural decisions have been made. Ready for implementation.

## User Context

- 40+ years development experience
- Starting freelance direction with AI focus
- Site: alexanderlapygin.com
- FL.ru: https://www.fl.ru/users/someonelse/portfolio/

## Session Notes

- Russian language for communication, English for code/docs
- AI saves tokens with English (1.5-2x difference)
- User prefers detailed explanations before decisions
- Always ask one question at a time, wait for response

---

*Handoff created: 2025-12-15*
