---
name: obul-api-finder
description: 'USE THIS SKILL WHEN: the user wants to find external APIs to search the web, gather news, scrape news sites, search Twitter/X, or use Grok X for prediction market data collection in MiroFish.'
metadata:
  openclaw:
    emoji: 🔧
    requires:
      bins: [node]
    category: tools
---

# Obul API Finder

Find external APIs for MiroFish prediction market data collection. Search web, news, Twitter/X, and more.

## When to Use

**Web Search & Discovery**
- Search the web for prediction market context — Use when you need to find relevant articles, analysis, or background information for a prediction market
- Discover news sources — Use when building a list of authoritative sources for ongoing market monitoring
- Find expert opinions — Use when seeking analyst predictions or expert commentary on market outcomes

**News & Content Scraping**
- Scrape news articles — Use when you need to extract full article text from financial news sites (Bloomberg, Reuters, etc.)
- Monitor news sites — Use when setting up automated monitoring of specific publications for market-moving events
- Extract structured data — Use when pulling specific data points (dates, figures, quotes) from unstructured news content

**Twitter/X Search**
- Search Twitter for sentiment — Use when gauging public opinion or insider chatter about a prediction market
- Track influential accounts — Use when monitoring key figures who might signal market-moving information
- Collect tweet threads — Use when gathering comprehensive discussions or debates about market outcomes

**Grok X Integration**
- Search X/Twitter with Grok — Use when you need AI-powered analysis of Twitter content for prediction insights
- Real-time X monitoring — Use when tracking breaking news or rumors that could affect market prices
- Cross-platform research — Use when combining X data with web search for comprehensive market analysis

**Data Collection for MiroFish**
- Gather seed documents — Use when collecting initial context documents to upload to MiroFish for simulation
- Build knowledge base — Use when assembling comprehensive background materials for ontology generation
- Monitor ongoing markets — Use when tracking active prediction markets for new developments that might affect outcomes

## Quick Start

```bash
# Find web scraping APIs
node skills/obul-api-finder/scripts/search.js "scrape news"

# Find Twitter/X search APIs
node skills/obul-api-finder/scripts/search.js "twitter search"

# Find Grok X API
node skills/obul-api-finder/scripts/search.js "grok x"

# List all search APIs
node skills/obul-api-finder/scripts/list.js "search"
```

## Commands

### Search APIs

Find APIs by keyword for prediction market data collection:

```bash
# Web scraping
node skills/obul-api-finder/scripts/search.js "scrape website"
node skills/obul-api-finder/scripts/search.js "crawl news"

# News & content
node skills/obul-api-finder/scripts/search.js "news api"
node skills/obul-api-finder/scripts/search.js "web search"

# Social media
node skills/obul-api-finder/scripts/search.js "twitter"
node skills/obul-api-finder/scripts/search.js "grok x"

# Research & analysis
node skills/obul-api-finder/scripts/search.js "deep research"
node skills/obul-api-finder/scripts/search.js "semantic search"
```

### Preview Skill

Check if an API fits your use case before installing:

```bash
node skills/obul-api-finder/scripts/preview.js obul-firecrawl
node skills/obul-api-finder/scripts/preview.js obul-sybil
node skills/obul-api-finder/scripts/preview.js obul-tavily
```

### Install Skill

Add API skill to your local skills folder:

```bash
node skills/obul-api-finder/scripts/install.js obul-firecrawl
node skills/obul-api-finder/scripts/install.js obul-sybil
```

### List Skills by Category

Browse available APIs:

```bash
# All categories
node skills/obul-api-finder/scripts/list.js

# Specific category
node skills/obul-api-finder/scripts/list.js "productivity"
node skills/obul-api-finder/scripts/list.js "search"
```

## MiroFish + Polymarket Workflow

```bash
# Step 1: Find APIs for data collection
$ node skills/obul-api-finder/scripts/search.js "scrape news"
[
  {
    "name": "firecrawl",
    "category": "productivity",
    "skill": "obul-firecrawl",
    "description": "Scrape URLs, crawl websites, extract structured data"
  },
  {
    "name": "tavily",
    "category": "productivity",
    "skill": "obul-tavily",
    "description": "Real-time search, web crawling, content extraction"
  }
]

# Step 2: Preview the best match
$ node skills/obul-api-finder/scripts/preview.js obul-tavily
{
  "name": "obul-tavily",
  "description": "USE THIS SKILL WHEN: you need real-time web search...",
  "whenToUse": [
    "Real-time search — Get current information...",
    "Research tasks — Comprehensive research..."
  ]
}

# Step 3: Install for use
$ node skills/obul-api-finder/scripts/install.js obul-tavily
✅ Installed: obul-tavily
   Location: ~/.claude/skills/obul-tavily
   Usage: /obul-tavily: <command>

# Step 4: Collect data for MiroFish
# Use the installed skill to gather seed documents
# Then upload to MiroFish for simulation
```

## Recommended APIs for Prediction Markets

| Use Case | Recommended API | Why |
|----------|----------------|-----|
| Web scraping | `obul-firecrawl` | Clean markdown extraction |
| News search | `obul-tavily` | Real-time + research mode |
| Twitter/X data | `obul-sybil` | Grok X + Exa combined |
| Deep research | `obul-perplexity` | AI with citations |
| Semantic search | `obul-exa` | Neural web search |
| SERP scraping | `obul-searchapi` | Google, YouTube, etc. |

## File Locations

| File | Purpose |
|------|---------|
| `scripts/search.js` | Search apis.json catalog |
| `scripts/preview.js` | Preview skill with When to Use extraction |
| `scripts/fetch.js` | Parse SKILL.md YAML header |
| `scripts/install.js` | Copy skill to ~/.claude/skills/ |
| `scripts/list.js` | List all skills by category |

## Data Sources

- **API Catalog**: `https://raw.githubusercontent.com/obulai/obul-apis/main/apis.json` (50+ APIs)
- **Skill Docs**: `https://raw.githubusercontent.com/obulai/obul-apis/main/skills/{skill-name}/SKILL.md`
- **Install Target**: `~/.claude/skills/{skill-name}/`
