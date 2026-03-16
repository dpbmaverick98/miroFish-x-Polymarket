---
name: mirofish-predict
alias: mfp
description: 'USE THIS SKILL WHEN: user wants to find prediction market opportunities on Polymarket, research topics via Obul services, prepare a seed document, and run MiroFish predictions. Workflow: Find Markets → Research → Seed Doc → Predict'
metadata:
  openclaw:
    emoji: 🎯
    requires:
      bins: [polymarket]
      env:
      - OBUL_API_KEY
    category: ai-agents
---

# MiroFish Predict Workflow

A step-by-step workflow to find markets, research topics, and generate MiroFish predictions.

## Workflow Overview

| Step | Action | Tool/Service |
|------|--------|--------------|
| **1** | Find Markets | polymarket CLI |
| **2** | Research Topics | Obul Services (pick as needed) |
| **3** | Prepare Seed Doc | (manual compilation) |
| **4** | Run Prediction | MiroFish API |

---

## Step 1: Find Markets

**Tool:** polymarket CLI (installed)

```bash
# Search markets by topic
polymarket markets search "bitcoin" --limit 10

# List active markets
polymarket markets list --active true --limit 20

# Get specific market details (includes token IDs)
polymarket markets get <slug>
polymarket clob market <condition-id>
```

**You confirm:** Which markets to research? (select 1-3)

---

## Step 2: Research Topics

Use these Obul services for each selected market:

### Web Search & AI

#### A) Exa Neural Search - `obul-ortho-exa`
Best for: Semantic web search, finding conceptually related content

```json
{
  "method": "POST",
  "url": "https://proxy.obul.ai/proxy/https://x402.orth.sh/exa/search",
  "headers": {
    "Content-Type": "application/json",
    "x-obul-api-key": "{{OBUL_API_KEY}}"
  },
  "body": {
    "query": "<topic> latest news 2025",
    "numResults": 5,
    "type": "neural",
    "text": true
  }
}
```

#### B) Exa Answer - `obul-ortho-exa`
Best for: AI-generated answer with source citations

```json
{
  "method": "POST",
  "url": "https://proxy.obul.ai/proxy/https://x402.orth.sh/exa/answer",
  "headers": {
    "Content-Type": "application/json",
    "x-obul-api-key": "{{OBUL_API_KEY}}"
  },
  "body": {
    "query": "<prediction_question>",
    "text": true
  }
}
```

#### C) Sybil Unified Search - `obul-sybil`
Best for: Combined web + Twitter search, Grok reasoning

**Grok Web Search (fast):**
```json
{
  "method": "POST",
  "url": "https://proxy.obul.ai/proxy/https://x402.sybil.ai/api/search/grok-web",
  "headers": {
    "Content-Type": "application/json",
    "x-obul-api-key": "{{OBUL_API_KEY}}"
  },
  "body": {
    "query": "<topic>"
  }
}
```

**Grok Web + Reasoning:**
```json
{
  "method": "POST",
  "url": "https://proxy.obul.ai/proxy/https://x402.sybil.ai/api/search/grok-web/thinking",
  "headers": {
    "Content-Type": "application/json",
    "x-obul-api-key": "{{OBUL_API_KEY}}"
  },
  "body": {
    "query": "<topic>"
  }
}
```

**Combined Web + X (fast):**
```json
{
  "method": "POST",
  "url": "https://proxy.obul.ai/proxy/https://x402.sybil.ai/api/search/grok-combined",
  "headers": {
    "Content-Type": "application/json",
    "x-obul-api-key": "{{OBUL_API_KEY}}"
  },
  "body": {
    "query": "<topic>"
  }
}
```

---

### Web Scraping

#### D) Firecrawl Scrape - `obul-stableenrich-firecrawl`
Best for: Extract full content from URLs found in search

```json
{
  "method": "POST",
  "url": "https://proxy.obul.ai/proxy/https://stableenrich.dev/api/firecrawl/scrape",
  "headers": {
    "Content-Type": "application/json",
    "x-obul-api-key": "{{OBUL_API_KEY}}"
  },
  "body": {
    "url": "<article_url>",
    "markdown": true
  }
}
```

#### E) Firecrawl Search - `obul-stableenrich-firecrawl`
Best for: Search the web and get scraped results

```json
{
  "method": "POST",
  "url": "https://proxy.obul.ai/proxy/https://stableenrich.dev/api/firecrawl/search",
  "headers": {
    "Content-Type": "application/json",
    "x-obul-api-key": "{{OBUL_API_KEY}}"
  },
  "body": {
    "query": "<topic>",
    "limit": 5
  }
}
```

#### F) Firecrawl via x402 - `obul-x402endpoints-firecrawl`
Alternative Firecrawl endpoint via x402

```json
{
  "method": "POST",
  "url": "https://proxy.obul.ai/proxy/https://x402.firecrawl.dev/scrape",
  "headers": {
    "Content-Type": "application/json",
    "x-obul-api-key": "{{OBUL_API_KEY}}"
  },
  "body": {
    "url": "<article_url>"
  }
}
```

---

### Twitter / X

#### G) Twit Search - `obul-twit`
Best for: Search tweets with advanced filters

```json
{
  "method": "GET",
  "url": "https://proxy.obul.ai/proxy/https://x402.twit.sh/tweets/search?words=<topic>&since=2026-03-01&limit=10",
  "headers": {
    "Content-Type": "application/json",
    "x-obul-api-key": "{{OBUL_API_KEY}}"
  }
}
```

#### H) ClawAPI X - `obul-clawapi-x`
Alternative Twitter API (official Twitter API)

**Search Recent Tweets:**
```json
{
  "method": "GET",
  "url": "https://proxy.obul.ai/proxy/https://x402.clawapi.com/x/2/tweets/search/recent?query=<topic>&max_results=10",
  "headers": {
    "Content-Type": "application/json",
    "x-obul-api-key": "{{OBUL_API_KEY}}"
  }
}
```

**Get User Profile:**
```json
{
  "method": "GET",
  "url": "https://proxy.obul.ai/proxy/https://x402.clawapi.com/x/2/users/by/username/<username>",
  "headers": {
    "Content-Type": "application/json",
    "x-obul-api-key": "{{OBUL_API_KEY}}"
  }
}
```

---

### API Discovery

#### I) API Finder - `obul-api-finder`
Find available APIs for a topic

```json
{
  "method": "GET",
  "url": "https://proxy.obul.ai/proxy/https://api.obul.dev/apis?category=<topic>",
  "headers": {
    "x-obul-api-key": "{{OBUL_API_KEY}}"
  }
}
```

---

**You confirm:** Is research sufficient?

---

## Step 3: Prepare Seed Doc

Compile findings into markdown:

```markdown
# Prediction: [Market Question]

## Polymarket Data
- Question: [from polymarket]
- Current Price: [X%]
- Volume: [$X]
- Liquidity: [$X]
- End Date: [YYYY-MM-DD]
- Condition ID: [xxx]
- Token ID (Yes): [xxx]
- Token ID (No): [xxx]

## Research Findings

### Web Search (Exa)
- [Title 1]: [Summary]
- [Title 2]: [Summary]

### AI Answer (Exa)
[Generated answer with citations]

### Web Scraped (Firecrawl)
- [Source URL]: [Key points]

### Twitter Sentiment (Twit/ClawAPI)
- [Tweet 1]
- [Tweet 2]
- Overall: Bullish/Bearish/Neutral

### Unified Search (Sybil)
[Results from Grok combined search]

## Prediction Question
[Exact question for MiroFish simulation]
```

**You confirm:** Proceed to prediction?

---

## Step 4: Run Prediction - MiroFish API

**Base URL:** http://localhost:5001

### 4.1 Create Project & Generate Ontology

```bash
curl -X POST http://localhost:5001/api/graph/ontology/generate \
  -F "files=@/path/to/seed.md" \
  -F "simulation_requirement=[prediction_question]" \
  -F "project_name=[project_name]"
```

**Response:** `{ "task_id": "xxx", "project_id": "proj_xxx" }`

### 4.2 Check Task Status

```bash
curl http://localhost:5001/api/graph/task/{task_id}
```

Wait for status: `completed`

### 4.3 Get Project Details (includes graph_id)

```bash
curl http://localhost:5001/api/graph/project/{project_id}
```

### 4.4 Start Simulation

```bash
curl -X POST http://localhost:5001/api/simulation/start \
  -H "Content-Type: application/json" \
  -d '{
    "project_id": "proj_xxx",
    "graph_id": "graph_xxx",
    "platform": "parallel",
    "max_rounds": 40,
    "enable_graph_memory_update": true
  }'
```

**Response:** `{ "simulation_id": "sim_xxx" }`

### 4.5 Check Simulation Status

```bash
curl http://localhost:5001/api/simulation/{simulation_id}/status
```

### 4.6 Get Report

```bash
curl http://localhost:5001/api/report/{project_id}
```

---

## Environment Variables

| Variable | Required | Default | Description |
|----------|----------|---------|-------------|
| `OBUL_API_KEY` | Yes | - | Get from https://obul.ai |
| `MIROFISH_API_URL` | No | http://localhost:5001 | MiroFish API base |

---

## Quick Reference

### Polymarket CLI
```bash
polymarket markets search "<topic>" --limit 10
polymarket markets list --active true --limit 20
polymarket markets get <slug>
polymarket clob market <condition-id>
polymarket clob book <token-id>
```

### Obul Services Available

| Skill | Provider | Purpose | Best For |
|-------|----------|---------|----------|
| `obul-ortho-exa` | Exa | Neural search + AI answer | Web research, semantic search |
| `obul-sybil` | Sybil | Exa + Grok combined | Web + X, reasoning |
| `obul-stableenrich-firecrawl` | Firecrawl | Web scraping | Extract article content |
| `obul-x402endpoints-firecrawl` | Firecrawl | Web scraping | Alternative scrape endpoint |
| `obul-twit` | Twit | Twitter search | Tweet search with filters |
| `obul-clawapi-x` | ClawAPI | Twitter API | Official Twitter data |
| `obul-api-finder` | Obul | API discovery | Find APIs for topic |
| `obul-api-errors` | Obul | Error reference | Troubleshooting |

### MiroFish API

| Endpoint | Method | Purpose |
|----------|--------|---------|
| `/api/graph/ontology/generate` | POST | Create project from seed |
| `/api/graph/task/{id}` | GET | Check task status |
| `/api/graph/project/{id}` | GET | Get project, graph_id |
| `/api/simulation/start` | POST | Start simulation |
| `/api/simulation/{id}/status` | GET | Check simulation |
| `/api/report/{id}` | GET | Get prediction report |

---

## Usage Flow

1. **Start:** Tell me a topic (e.g., "bitcoin", "AI", "election")
2. **Step 1:** I run polymarket CLI, you select markets
3. **Step 2:** I run Obul services, you confirm research
4. **Step 3:** I compile seed doc, you review
5. **Step 4:** I call MiroFish API, you get prediction
