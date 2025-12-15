# Mindster — Architecture Decisions

## Project

- **Name:** Mindster
- **Domain:** mindstr.ru
- **Concept:** Personal AI-Powered Assistant Platform
- **Core idea:** Modular plugin-ready platform with tools unified by AI assistant

## Business Model

- Self-hosted turnkey installation (first stage)
- SaaS (future)

## Prototype Clients

- Responsive web interface (SPA)
- Telegram bot
- Mobile and desktop — future

## Technology Stack

### Backend

| Component | Solution |
|-----------|----------|
| Runtime | Bun |
| Framework | Fastify |
| Database | PostgreSQL |
| ORM | Drizzle |
| Authentication | Better Auth (single admin account for prototype) |
| AI Providers | Vercel AI SDK |
| Telegram | grammY |
| API Keys Encryption | AES-256 (key in .env) |
| Architecture | Feature-based modular (→ Clean Architecture on growth) |

### Frontend

| Component | Solution |
|-----------|----------|
| Framework | React + Vite |
| UI | Tailwind CSS + shadcn/ui |
| Architecture | Feature-Sliced Design (FSD) |

### API and Contracts

| Component | Solution |
|-----------|----------|
| Approach | API First |
| Specification | OpenAPI |
| Client Generation | orval (types + React Query hooks) |

### Deployment

| Component | Solution |
|-----------|----------|
| Prototype | Docker Compose (API + PostgreSQL + bot) |

### Development

| Component | Solution |
|-----------|----------|
| OS | Windows + WSL2 |
| Approach | AI-Driven Development |
| Git workflow (Prototype) | GitHub Flow |
| Git workflow (MVP) | Trunk-based + Feature Flags |

### Testing

| Component | Solution |
|-----------|----------|
| Framework | Vitest |
| Levels | Unit + Integration |
| Contracts | OpenAPI (structure) + TypeScript (types) |
| E2E / BDD | Future |

## Prototype Features

1. Admin account (created on first launch)
2. Adding AI provider API keys (encrypted in DB)
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
5. AI assistant integration with tools ("break down this task", "remind me to call X")

## Architecture Principles

- `user_id` in all data tables (SaaS readiness)
- Support for any OpenAI-compatible models without system updates
- AI provider abstraction via Vercel AI SDK
- API First — specification before implementation
- **Plugin-ready architecture** — each tool is a module with standard interface

## Roadmap

### MVP (after prototype)
- Calendar, Contacts, Plugin API (see MVP Features)
- Feature Flags (for controlled rollout)
- Trunk-based development + CI/CD
- E2E testing (Playwright)

### Future (after MVP)
- SaaS with multi-tenancy
- External plugins, marketplace
- RAG, document processing (Python microservice possible)
- Native mobile clients
- BDD for behavior documentation

---

*Document created from brainstorming session, 2025-12-15*
