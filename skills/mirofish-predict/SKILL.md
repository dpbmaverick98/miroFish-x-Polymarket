---
name: mirofish-predict
alias: mfp
description: 'USE THIS SKILL WHEN: user wants to find prediction market opportunities on Polymarket, research topics via Obul services, prepare seed documents (news, twitter, web), and run MiroFish predictions. Workflow: Find Markets → Research (multiple docs) → Upload All Docs → Predict'
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

A step-by-step workflow to find markets, research topics, and generate MiroFish predictions using multi-document seed strategy.

## Workflow Overview

| Step | Action | Tool/Service |
|------|--------|--------------|
| **1** | Find Markets | polymarket CLI (just to identify topics) |
| **2** | Research & Create Seed Docs | Obul Services → `seed_news.md`, `seed_twitter.md`, `seed_web.md` |
| **3** | Upload All Docs to MiroFish | Multiple files via API |
| **4** | Run Prediction | MiroFish API |

⚠️ **Key Principle:** Seed documents should contain ONLY real-world facts, quotes, and incidents. Do NOT include prediction market prices/odds/volumes - this biases the simulation.

---

## Step 1: Find Markets

**Tool:** polymarket CLI (installed)

```bash
# Search markets by topic
polymarket markets search "bitcoin" --limit 10

# List active markets
polymarket markets list --active true --limit 20

# Get specific market details
polymarket markets get <slug>
polymarket clob market <condition-id>
```

**You confirm:** Which markets to research? (select 1-3)

---

## Step 2: Research Topics & Create Seed Docs

**User specifies:** What search types to run? (e.g., "news + twitter", "web search only", "twitter for @realDonaldTrump")

Create these documents in `docs/seeds/`:

### docs/seeds/seed_news.md
```markdown
# News Research

## [Article Title]
- **URL:** https://example.com/article
- **Date:** 2026-03-15T14:30:00Z
- **Source:** [Publisher Name]
- **Content:** [Exact excerpts with quotes, key facts]

## [Next Article]
...
```

### docs/seeds/seed_twitter.md
```markdown
# Twitter/X Research

## @username
- **Timestamp:** 2026-03-15T14:30:00Z
- **Content:** [Exact tweet text]
- **Engagement:** 1234 likes, 567 retweets, 89 replies
- **URL:** https://x.com/username/status/123456789

## @next_user
...
```

### docs/seeds/seed_web.md
```markdown
# Web Search Results

## [Source Title]
- **URL:** https://example.com
- **Summary:** [Factual summary - no opinions]

## [Next Result]
...
```

### Obul Services for Research

#### News / Web Scraping

**Firecrawl Search:**
```json
{
  "method": "POST",
  "url": "https://proxy.obul.ai/proxy/https/stableenrich.dev/api/firecrawl/search",
  "headers": {
    "Content-Type": "application/json",
    "x-obul-api-key": "{{OBUL_API_KEY}}"
  },
  "body": {
    "query": "<topic>",
    "limit": 10
  }
}
```

**Firecrawl Scrape (for full articles):**
```json
{
  "method": "POST",
  "url": "https://proxy.obul.ai/proxy/https/stableenrich.dev/api/firecrawl/scrape",
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

#### Twitter / X

**Twit Search:**
```json
{
  "method": "GET",
  "url": "https://proxy.obul.ai/proxy/https/x402.twit.sh/tweets/search?words=<topic>&since=2026-03-01&limit=20",
  "headers": {
    "x-obul-api-key": "{{OBUL_API_KEY}}"
  }
}
```

**Search Specific User (e.g., Trump, Elon):**
```json
{
  "method": "GET",
  "url": "https://proxy.obul.ai/proxy/https/x402.twit.sh/tweets/search?words=from:<username>&since=2026-03-01&limit=20",
  "headers": {
    "x-obul-api-key": "{{OBUL_API_KEY}}"
  }
}
```

**ClawAPI X (Official Twitter API):**
```json
{
  "method": "GET",
  "url": "https://proxy.obul.ai/proxy/https/x402.clawapi.com/x/2/tweets/search/recent?query=<topic>&max_results=20",
  "headers": {
    "x-obul-api-key": "{{OBUL_API_KEY}}"
  }
}
```

#### Web Search

**Exa Neural Search:**
```json
{
  "method": "POST",
  "url": "https://proxy.obul.ai/proxy/https/x402.orth.sh/exa/search",
  "headers": {
    "Content-Type": "application/json",
    "x-obul-api-key": "{{OBUL_API_KEY}}"
  },
  "body": {
    "query": "<topic> latest news 2026",
    "numResults": 10,
    "type": "neural",
    "text": true
  }
}
```

**Exa Answer (AI with citations):**
```json
{
  "method": "POST",
  "url": "https://proxy.obul.ai/proxy/https/x402.orth.sh/exa/answer",
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

**Sybil Grok Combined (Web + X):**
```json
{
  "method": "POST",
  "url": "https://proxy.obul.ai/proxy/https/x402.sybil.ai/api/search/grok-combined",
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

### Topic-Specific Search Examples

**Trump-related:**
- Twitter: `from:realDonaldTrump` or `from:Trump`
- News: Trump administration policies, statements

**Elon-related:**
- Twitter: `from:elonmusk`
- News: Tesla, SpaceX, xAI announcements

**Bitcoin/Crypto:**
- News: Regulatory, institutional adoption
- Twitter: Key crypto influencers

---

**You confirm:** Research complete. Proceed to seed docs?

---

## Step 3: Upload All Seed Docs to MiroFish

**Base URL:** http://localhost:5001

```bash
curl -X POST http://localhost:5001/api/graph/ontology/generate \
  -F "files=@docs/seeds/seed_news.md" \
  -F "files=@docs/seeds/seed_twitter.md" \
  -F "files=@docs/seeds/seed_web.md" \
  -F "simulation_requirement=<prediction_question>" \
  -F "project_name=<project_name>" \
  -F "additional_context=<optional_system_prompt>"
```

**Response:**
```json
{
  "success": true,
  "data": {
    "project_id": "proj_xxx",
    "task_id": "task_xxx"
  }
}
```

**Wait for task completion:**
```bash
curl http://localhost:5001/api/graph/task/{task_id}
```

Status: `completed`

**Get project details:**
```bash
curl http://localhost:5001/api/graph/project/{project_id}
```

---

## Step 4: Run Prediction

### 4.1 Start Simulation

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

**Response:**
```json
{
  "success": true,
  "data": {
    "simulation_id": "sim_xxx"
  }
}
```

### 4.2 Check Simulation Status

```bash
curl http://localhost:5001/api/simulation/{simulation_id}/status
```

### 4.3 Generate Report

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
```

### Obul Services

| Service | Purpose | Best For |
|---------|---------|----------|
| Firecrawl Search | Web search + scrape | News articles |
| Firecrawl Scrape | Full article extraction | Deep dive on URL |
| Twit | Tweet search | Twitter with filters |
| ClawAPI X | Official Twitter API | Twitter data |
| Exa Search | Neural web search | Semantic search |
| Exa Answer | AI with citations | Summarized answers |
| Sybil Grok | Web + X + reasoning | Combined research |

### MiroFish API

| Endpoint | Method | Purpose |
|----------|--------|---------|
| `/api/graph/ontology/generate` | POST | Upload seed docs, create project |
| `/api/graph/task/{id}` | GET | Check task status |
| `/api/graph/project/{id}` | Get project + graph_id |
| `/api/simulation/start` | POST | Start simulation |
| `/api/simulation/{id}/status` | GET | Check simulation |
| `/api/report/{id}` | GET | Get prediction report |

---

## Usage Flow

1. **Start:** User provides topic (e.g., "bitcoin", "trump")
2. **Step 1:** Run polymarket CLI, user selects markets
3. **Step 2:** User specifies search types (news, twitter, web), create 3 seed docs
4. **Step 3:** Upload all docs to MiroFish
5. **Step 4:** Run simulation, get prediction
