---
name: obul-llm
description: "USE THIS SKILL WHEN: the user wants to call an LLM (GPT-4o, Claude, etc.) through Obul's category routing. Obul automatically routes to the cheapest available provider with failover — no need to pick a provider or handle retries."
homepage: https://obul.ai
metadata:
  obul-skill:
    emoji: "🤖"
    requires:
      env: ["OBUL_API_KEY"]
      primaryEnv: "OBUL_API_KEY"
registries: {}
---

# LLM

Access LLM models (GPT-4o, Claude, etc.) through Obul's category-based routing. Obul automatically selects the cheapest available provider, handles failover between providers on errors, and manages all payment negotiation.

All LLM requests use the **OpenAI-compatible format** (`/v1/chat/completions`).

## Authentication

```json
{
  "headers": {
    "Content-Type": "application/json",
    "x-obul-api-key": "{{OBUL_API_KEY}}"
  }
}
```

Base URL: `https://proxy.obul.ai/proxy/c`

## Discovery

### List LLM Categories

```json
{
  "method": "GET",
  "url": "https://proxy.obul.ai/proxy/c/llm",
  "headers": {
    "Content-Type": "application/json"
  }
}
```

### Query Pricing

```json
{
  "method": "GET",
  "url": "https://proxy.obul.ai/proxy/c/llm/gpt-4o/_pricing",
  "headers": {
    "Content-Type": "application/json"
  }
}
```

## Chat Completion

### GPT-4o

```json
{
  "method": "POST",
  "url": "https://proxy.obul.ai/proxy/c/llm/gpt-4o/v1/chat/completions",
  "headers": {
    "Content-Type": "application/json",
    "x-obul-api-key": "{{OBUL_API_KEY}}"
  },
  "body": {
    "model": "gpt-4o",
    "messages": [
      {"role": "system", "content": "You are a helpful assistant."},
      {"role": "user", "content": "Explain quantum computing in simple terms."}
    ]
  }
}
```

### Claude Sonnet

```json
{
  "method": "POST",
  "url": "https://proxy.obul.ai/proxy/c/llm/claude-sonnet/v1/chat/completions",
  "headers": {
    "Content-Type": "application/json",
    "x-obul-api-key": "{{OBUL_API_KEY}}"
  },
  "body": {
    "model": "claude-sonnet",
    "messages": [
      {"role": "user", "content": "Write a haiku about programming."}
    ],
    "temperature": 0.7,
    "max_tokens": 100
  }
}
```

### Streaming

```json
{
  "method": "POST",
  "url": "https://proxy.obul.ai/proxy/c/llm/gpt-4o/v1/chat/completions",
  "headers": {
    "Content-Type": "application/json",
    "x-obul-api-key": "{{OBUL_API_KEY}}"
  },
  "body": {
    "model": "gpt-4o",
    "messages": [
      {"role": "user", "content": "Tell me a story."}
    ],
    "stream": true
  }
}
```

## URL Pattern

```
https://proxy.obul.ai/proxy/c/{category}/v1/chat/completions
```

Categories: `llm/gpt-4o`, `llm/claude-sonnet`, etc.

## Response Headers

| Header | Description |
|--------|-------------|
| `X-Obul-Provider` | Provider that served the request |
| `X-Obul-Category` | Category ID used |
| `X-Obul-Failover-Count` | Failover attempts (0 = first try) |

## Error Handling

| Error | Cause | Solution |
|-------|-------|----------|
| 401 | Invalid API key | Verify OBUL_API_KEY |
| 402 | Insufficient balance | Top up at https://my.obul.ai |
| 404 | Category not found | Check `GET /llm` |
| 429 | Rate limit | Add delay |
| 502 | All providers failed | Retry |
