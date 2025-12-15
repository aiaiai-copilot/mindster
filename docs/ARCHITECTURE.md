# Mindster — Architecture Decisions

## Project

- **Name:** Mindster
- **Domain:** mindstr.ru
- **Concept:** Personal intelligent hub

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

## MVP Features

1. Admin account (created on first launch)
2. Adding AI provider API keys (encrypted in DB)
3. Connecting custom models via endpoint + API key
4. Chat with selected model (streaming)
5. Conversation history
6. Telegram bot (linked to owner, same functionality)

## Architecture Principles

- `user_id` in all data tables (SaaS readiness)
- Support for any OpenAI-compatible models without system updates
- AI provider abstraction via Vercel AI SDK
- API First — specification before implementation

## Roadmap

### MVP (after prototype)
- Feature Flags (for controlled rollout)
- Trunk-based development + CI/CD
- E2E testing (Playwright)

### Future (after MVP)
- SaaS with multi-tenancy
- RAG, document processing (Python microservice possible)
- Native mobile clients
- BDD for behavior documentation

---

*Document created from brainstorming session, 2025-12-15*
