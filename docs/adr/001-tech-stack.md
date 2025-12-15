# ADR-001: Technology Stack Selection

**Status:** Accepted
**Date:** 2025-12-15

## Context

Developing Mindster — a personal intelligent hub. Requirements:
- Self-hosted turnkey installation (first stage)
- SaaS in the future
- Clients: responsive web + Telegram bot
- AI-Driven Development (development using AI tools)
- Support for multiple AI providers, including custom ones

## Decisions

### Backend: Bun + Fastify

**Alternatives:** Node.js + Express, Node.js + Hono, Bun + Elysia, Python + FastAPI

**Rationale:**
- Bun is faster than Node.js, built-in TypeScript support
- Fastify is mature, rich plugin ecosystem
- LLMs know Fastify well — critical for AI-Driven Development
- Elysia rejected: LLMs often generate outdated syntax
- Python rejected: single language (TypeScript) for frontend and backend speeds up development

### Database: PostgreSQL + Drizzle

**Alternatives:** SQLite, PostgreSQL + Prisma

**Rationale:**
- PostgreSQL required for future SaaS (scaling, pgvector for RAG)
- SQLite simpler for self-hosted but limits growth
- Drizzle lighter than Prisma, no external engine — easier for self-hosted deployment
- Drizzle faster, closer to SQL, LLMs know it well enough

### Authentication: Better Auth

**Alternatives:** Lucia, custom JWT

**Rationale:**
- Lucia deprecated (January 2025)
- Better Auth: OAuth out of the box (useful for SaaS), good balance of features and flexibility
- Custom JWT — more work without clear advantages at start
- Migration from Better Auth to JWT if needed is straightforward (1-2 days)

### AI Providers: Vercel AI SDK

**Alternatives:** Custom abstraction

**Rationale:**
- Unified interface for multiple providers
- Streaming out of the box
- Custom model support via OpenAI-compatible adapter
- Saves significant development time

### Telegram: grammY

**Alternatives:** Telegraf

**Rationale:**
- Native TypeScript, better typing
- More actively developed
- Lighter in size
- Telegraf: development slowed down

### Frontend: React + Vite + Tailwind + shadcn/ui

**Alternatives:** Next.js, other UI frameworks

**Rationale:**
- SPA is sufficient (dashboard behind auth, SEO not needed)
- Next.js overkill: mixes backend and frontend, harder self-hosted deployment
- Vite faster in builds
- Tailwind + shadcn/ui: flexibility, LLMs know this combo very well

### Frontend Architecture: FSD

**Alternatives:** Classic type-based structure

**Rationale:**
- Better scalability
- Strict feature isolation
- Opportunity to gain practical FSD experience

### Backend Architecture: Feature-based Modular

**Alternatives:** Clean Architecture

**Rationale:**
- Faster for prototype, less boilerplate
- LLMs handle generation better
- Symmetry with FSD on frontend
- Clean Architecture can be introduced within modules on growth

### API: API First + OpenAPI + orval

**Alternatives:** Code First

**Rationale:**
- Contract fixed before implementation
- Auto-generation of types and React Query hooks — less desync
- API documentation out of the box
- Multiple clients (web, Telegram, future mobile) — single contract is critical

### Testing: Vitest + Unit/Integration

**Alternatives:** Jest, full suite with E2E

**Rationale:**
- Vitest natively integrated with Vite
- Faster than Jest
- Unit + Integration sufficient for prototype
- OpenAPI + TypeScript already provide contract testing for structure
- E2E/BDD — future, when complex scenarios emerge

### Deployment: Docker Compose

**Alternatives:** Separate deployment, managed services

**Rationale:**
- One file, one command for installation
- Ideal for self-hosted sales
- For SaaS easy to extract DB to managed service

## Consequences

**Positive:**
- Single language (TypeScript) for entire stack
- Fast prototype start
- Good AI-Driven Development support
- Ready for scaling (SaaS)

**Risks:**
- Bun younger than Node.js — edge cases possible
- FSD requires learning
- Better Auth newer — fewer community examples

**Risk Mitigation:**
- Fallback to Node.js on critical Bun issues
- Simplified FSD at start
- Better Auth documentation is quality, community growing
