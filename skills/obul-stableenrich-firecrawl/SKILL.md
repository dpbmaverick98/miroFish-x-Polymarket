---
name: obul-stableenrich-firecrawl
description: 'USE THIS SKILL WHEN: the user wants to scrape web pages, extract content
  from URLs, or search the web and get scraped results via the StableEnrich provider.'
endpoints:
- path: /api/firecrawl/scrape
  method: POST
  price: $0.0126
  description: Scrape and extract content from a URL
- path: /api/firecrawl/search
  method: POST
  price: $0.0252
  description: Search the web and get scraped results
metadata:
  obul-skill:
    emoji: 🕷️
    requires:
      env:
      - OBUL_API_KEY
    primaryEnv: OBUL_API_KEY
registries: {}
provider: stableenrich
---

# Firecrawl (StableEnrich)

Firecrawl provides web scraping and content extraction capabilities. It scrapes URLs and returns clean, structured markdown content, and also provides web search with scraped results through the Obul proxy via StableEnrich.

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

**Base URL:** `https://proxy.obul.ai/proxy/https/stableenrich.dev`

## Common Operations

### Scrape

Scrape and extract content from a URL. Returns clean markdown-formatted content with metadata.

**Pricing:** $0.0126

```json
{
  "method": "POST",
  "url": "https://proxy.obul.ai/proxy/https/stableenrich.dev/api/firecrawl/scrape",
  "headers": {
    "Content-Type": "application/json",
    "x-obul-api-key": "{{OBUL_API_KEY}}"
  },
  "body": {
    "url": "https://example.com"
  }
}
```

**Response:** JSON object with markdown content, title, description, and metadata.

### Search

Search the web and get scraped results. Returns search results with full page content for each result.

**Pricing:** $0.0252

```json
{
  "method": "POST",
  "url": "https://proxy.obul.ai/proxy/https/stableenrich.dev/api/firecrawl/search",
  "headers": {
    "Content-Type": "application/json",
    "x-obul-api-key": "{{OBUL_API_KEY}}"
  },
  "body": {
    "query": "best coffee shops",
    "limit": 5
  }
}
```

**Response:** JSON array of search results with scraped content for each URL.

## When to Use

- **Web scraping** — When you need to extract content from specific URLs
- **Content extraction** — When you need clean markdown from web pages
- **Web research** — When you want search results with full content extraction
- **Data collection** — When building datasets from web sources

## Best Practices

- **Use scrape for known URLs** — When you have specific URLs to extract from
- **Use search for discovery** — When you need to find and extract from multiple sources
- **Check for rate limits** — Firecrawl may have rate limits on high-volume requests
- **Compare providers** — For cheaper bulk extraction, consider Exa contents endpoint ($0.002/request)
- **For errors** — See @skills/obul-api-errors/SKILL.md for complete error code reference and troubleshooting
