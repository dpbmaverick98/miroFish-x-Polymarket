---
name: obul-ortho-exa
description: 'USE THIS SKILL WHEN: the user wants AI-powered web search with semantic
  understanding, neural search, content extraction, and research capabilities. Provides
  AI search via Exa through the Obul proxy.'
endpoints:
- path: /search
  method: POST
  price: $0.01
  description: Neural web search
- path: /answer
  method: POST
  price: $0.01
  description: LLM answers with citations
- path: /findSimilar
  method: POST
  price: $0.01
  description: Find similar content
- path: /contents
  method: POST
  price: $0.01
  description: Extract URL contents
- path: /research/v1
  method: POST
  price: $0.01
  description: Async research tasks
- path: /research/v1
  method: GET
  price: $0.01
  description: List research tasks
- path: /research/v1/{id}
  method: GET
  price: $0.01
  description: Get research results
metadata:
  obul-skill:
    emoji: 🧠
    requires:
      env:
      - OBUL_API_KEY
    primaryEnv: OBUL_API_KEY
registries: {}
provider: orthogonal
---

# Exa (x402.orth.sh)

Exa is a search engine made for AIs. It provides semantic web search, neural embeddings-based search, content extraction, and AI-powered research with citations through the Obul proxy via x402.orth.sh.

## Authentication

All requests route through the Obul proxy. Include your Obul API key in every request:

```json
{
  "headers": {
    "Content-Type": "application/json",
    "x-obul-api-key": "{{OBUL_API_KEY}}"
  }
}
```

**Base URL:** `https://proxy.obul.ai/proxy/https/x402.orth.sh/exa`

## Common Operations

### Search

Intelligent web search with neural embeddings and semantic understanding.

**Pricing:** $0.01

```json
{
  "method": "POST",
  "url": "https://proxy.obul.ai/proxy/https/x402.orth.sh/exa/search",
  "headers": {
    "Content-Type": "application/json",
    "x-obul-api-key": "{{OBUL_API_KEY}}"
  },
  "body": {
    "query": "latest developments in quantum computing",
    "numResults": 10,
    "type": "neural",
    "text": true
  }
}
```

**Response:** Search results with URLs, titles, snippets, and full text content.

### Answer

Get an LLM answer to a question informed by Exa search results.

**Pricing:** $0.01

```json
{
  "method": "POST",
  "url": "https://proxy.obul.ai/proxy/https/x402.orth.sh/exa/answer",
  "headers": {
    "Content-Type": "application/json",
    "x-obul-api-key": "{{OBUL_API_KEY}}"
  },
  "body": {
    "query": "What is the capital of France?",
    "text": true,
    "stream": false
  }
}
```

**Response:** Generated answer with source citations and reference URLs.

### Find Similar

Find similar links to a given URL.

**Pricing:** $0.01

```json
{
  "method": "POST",
  "url": "https://proxy.obul.ai/proxy/https/x402.orth.sh/exa/findSimilar",
  "headers": {
    "Content-Type": "application/json",
    "x-obul-api-key": "{{OBUL_API_KEY}}"
  },
  "body": {
    "url": "https://example.com/article",
    "numResults": 10,
    "text": true
  }
}
```

### Get Contents

Extract full page contents, summaries, and metadata from URLs.

**Pricing:** $0.01

```json
{
  "method": "POST",
  "url": "https://proxy.obul.ai/proxy/https/x402.orth.sh/exa/contents",
  "headers": {
    "Content-Type": "application/json",
    "x-obul-api-key": "{{OBUL_API_KEY}}"
  },
  "body": {
    "urls": ["https://example.com/article1", "https://example.com/article2"],
    "text": true,
    "summary": true,
    "highlights": true
  }
}
```

### Research

Create an asynchronous research task that explores the web and synthesizes findings.

**Pricing:** $0.01

```json
{
  "method": "POST",
  "url": "https://proxy.obul.ai/proxy/https/x402.orth.sh/exa/research/v1",
  "headers": {
    "Content-Type": "application/json",
    "x-obul-api-key": "{{OBUL_API_KEY}}"
  },
  "body": {
    "instructions": "Research the current state of AI regulation in the EU and US",
    "model": "exa-research"
  }
}
```

## Search Types

- **neural** — Embeddings-based semantic search (best quality)
- **auto** — Intelligently combines neural and other methods (default)
- **fast** — Streamlined search for speed
- **deep** — Comprehensive search with query expansion

## When to Use

- **Semantic search** — Find conceptually related content, not just keyword matches
- **AI answers** — Get direct answers with source citations
- **Content extraction** — Extract full text, summaries, and highlights from URLs
- **Research automation** — Create async research tasks with synthesized reports
- **Similar content discovery** — Find related articles and resources
- **RAG applications** — Use context mode to combine results into LLM-ready strings

## Best Practices

- **Choose search type** — Use "neural" for quality, "fast" for speed, "deep" for comprehensive results
- **Enable text extraction** — Set text: true to get full page content for analysis
- **Use highlights** — Extract the most relevant text snippets from pages
- **Include summaries** — Get AI-generated summaries of page content
- **Domain filtering** — Use includeDomains/excludeDomains to control sources
- **Date filtering** — Use startPublishedDate/endPublishedDate for recent content
- **For errors** — See @skills/obul-api-errors/SKILL.md for complete error code reference and troubleshooting
