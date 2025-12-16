# ADR-002: OpenRouter as AI Gateway

**Status:** Accepted
**Date:** 2025-12-16
**Supersedes:** ADR-001 (AI Providers section)

## Context

Initial decision (ADR-001) selected Vercel AI SDK for AI provider integration. During implementation, we identified that:

1. Vercel AI SDK requires provider-specific packages (@ai-sdk/openai, @ai-sdk/anthropic)
2. Each provider has slightly different API formats (request/response structure)
3. Adding new providers requires code changes and new dependencies
4. Prototype needs quick access to multiple models without complexity

## Decision

Use **OpenRouter** as the unified AI gateway instead of Vercel AI SDK.

### What is OpenRouter?

OpenRouter (openrouter.ai) is an API gateway that provides:
- Single OpenAI-compatible API for 200+ models
- Access to OpenAI, Anthropic, Meta, Google, Mistral, and others
- Bring your own API keys OR use OpenRouter credits
- Single endpoint: `https://openrouter.ai/api/v1/chat/completions`

### Implementation

```typescript
// Single API call works for ANY model
const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
  method: 'POST',
  headers: {
    'Authorization': `Bearer ${apiKey}`,
    'Content-Type': 'application/json',
  },
  body: JSON.stringify({
    model: 'anthropic/claude-3-opus',  // or 'openai/gpt-4', 'meta-llama/llama-3-70b', etc.
    messages: [{ role: 'user', content: 'Hello' }],
    stream: true,
  }),
})
```

### Alternatives Considered

| Option | Pros | Cons |
|--------|------|------|
| Vercel AI SDK | Unified interface, good typing | Multiple dependencies, abstraction layer |
| Direct provider APIs | No dependencies, full control | Different APIs per provider, more code |
| OpenRouter | Single API, 200+ models, zero deps | Extra hop (latency), third-party dependency |

## Consequences

### Positive

- **Zero AI dependencies** — just native fetch()
- **Single adapter** — one code path for all models
- **Instant access to new models** — no code changes needed
- **Simpler provider management** — store only name, apiKey, baseUrl
- **Faster prototype development** — less code to write and maintain

### Negative

- **Third-party dependency** — reliance on OpenRouter availability
- **Latency** — extra network hop through OpenRouter
- **Cost** — small markup if using OpenRouter credits (avoidable with own keys)

### Risk Mitigation

- OpenRouter allows bringing your own API keys (no markup)
- Architecture supports custom baseUrl — can switch to direct APIs later
- OpenRouter has high uptime and is widely used

## Provider Schema Changes

Simplified from:
```typescript
// Before
{ name, type: 'openai' | 'anthropic' | 'openai-compatible', apiKey, baseUrl }
```

To:
```typescript
// After
{ name, apiKey, baseUrl: 'https://openrouter.ai/api/v1' }
```

The `type` field becomes unnecessary — all providers use OpenAI-compatible format.

## Migration Path

If direct provider APIs needed later:
1. Add `type` field back to providers
2. Create thin adapters per provider type
3. Route requests based on type

This is straightforward and can be done in 1-2 days if needed.
