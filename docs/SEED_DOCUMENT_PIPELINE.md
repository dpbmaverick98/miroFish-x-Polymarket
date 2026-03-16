# How Seed Documents Are Made: The Complete Pipeline

## Overview

Seed documents are the fuel that powers MiroFish simulations. They're not just text files—they're structured intelligence that gives each agent the context it needs to debate effectively. This document explains the complete pipeline: how data flows from raw sources into formatted seed documents that agents can actually use.

---

## The Philosophy

**Bad seed documents:**
- Long, unstructured text dumps
- Generic information agents already "know"
- Static PDFs that never update
- No clear sections for different agent types

**Good seed documents:**
- Structured, scannable sections
- Real-time, market-specific intelligence
- Multiple data sources synthesized
- Formatted for different agent personas

---

## The Data Pipeline

```
┌─────────────────────────────────────────────────────────────────────────┐
│                         RAW DATA SOURCES                                 │
├──────────────┬──────────────┬──────────────┬──────────────┬─────────────┤
│ Polymarket   │   X/Twitter  │  Web Search  │   News/API   │  On-Chain   │
│   API        │   (Obul)     │   (Obul)     │   Scraping   │   Data      │
└──────┬───────┴──────┬───────┴──────┬───────┴──────┬───────┴──────┬──────┘
       │              │              │              │              │
       └──────────────┴──────────────┼──────────────┴──────────────┘
                                    ▼
                    ┌───────────────────────────────┐
                    │     DATA TRANSFORMATION        │
                    │  • Normalize formats           │
                    │  • Extract key insights        │
                    │  • Score relevance             │
                    │  • Structure for agents        │
                    └───────────────┬───────────────┘
                                    │
                                    ▼
                    ┌───────────────────────────────┐
                    │      SKILL ORCHESTRATION       │
                    │  • Polymarket skill            │
                    │  • Obul-twit skill             │
                    │  • Obul-sybil skill            │
                    │  • Obul-firecrawl skill        │
                    └───────────────┬───────────────┘
                                    │
                                    ▼
                    ┌───────────────────────────────┐
                    │      SEED DOCUMENT BUILDER     │
                    │  • Merge all sources           │
                    │  • Add metadata                │
                    │  • Format sections             │
                    │  • Validate structure          │
                    └───────────────┬───────────────┘
                                    │
                                    ▼
                    ┌───────────────────────────────┐
                    │      MIROFISH SIMULATION       │
                    │  • 100 agents read sections    │
                    │  • Each persona focuses on     │
                    │    relevant parts              │
                    │  • Debate and consensus        │
                    └───────────────────────────────┘
```

---

## The Skill Architecture

Each data source is wrapped as a **skill**—a self-contained module with:
- Clear input/output contracts
- Standardized JSON output
- Error handling and retries
- Cost tracking

### Skill Structure

```
skills/
├── polymarket/              # Market data from Polymarket
│   ├── SKILL.md            # Documentation + usage
│   └── scripts/
│       ├── get-market.js           # Basic market info
│       ├── get-orderbook.js        # Live orderbook
│       ├── analyze-market-full.js  # Complete snapshot
│       └── get-market-for-mirofish.js  # Seed doc format
│
├── obul-twit/              # X/Twitter data via Obul
│   ├── SKILL.md
│   └── scripts/
│       ├── search-tweets.js        # Tweet search
│       ├── get-user.js             # Profile data
│       └── analyze-sentiment.js    # Sentiment extraction
│
├── obul-sybil/             # Unified search (Exa + Grok)
│   ├── SKILL.md
│   └── scripts/
│       ├── search-grok-web.js      # Web search
│       ├── search-grok-x.js        # X search
│       └── search-grok-combined.js # Both + synthesis
│
└── obul-firecrawl/         # Web scraping
    ├── SKILL.md
    └── scripts/
        ├── scrape.js               # Single URL
        └── crawl.js                # Multi-page
```

---

## Skill 1: Polymarket Data

### What It Does

Fetches live market data from Polymarket's Gamma and CLOB APIs. Returns structured market intelligence including prices, volume, liquidity, and orderbook depth.

### Key Scripts

**`get-market-for-mirofish.js`** — The main seed doc generator

```javascript
// Input: Market slug
const slug = "will-bitcoin-be-above-67000-at-1200-pm";

// Output: Structured seed document
{
  "market": {
    "question": "Will Bitcoin be above $67,000 at 12:00 PM ET?",
    "description": "This market resolves to YES if...",
    "end_date": "2026-03-17T17:00:00Z",
    "category": "Crypto",
    "volume": 1250000,
    "liquidity": 45000
  },
  "current_prices": {
    "yes": 0.52,
    "no": 0.47,
    "spread": 0.01,
    "implied_probability": 0.52
  },
  "orderbook": {
    "yes_bids": [{"price": 0.51, "size": 5000}, ...],
    "yes_asks": [{"price": 0.53, "size": 3200}, ...],
    "depth": "shallow_above_55"
  },
  "recent_activity": {
    "last_trade": "2026-03-17T11:45:00Z",
    "trade_size": 1200,
    "price_movement_1h": 0.03,
    "volume_1h": 45000
  },
  "for_agents": {
    "technical_analyst": "Price consolidating at 0.52 resistance...",
    "liquidity_watcher": "Shallow orderbook above 0.55...",
    "momentum_trader": "+3% in last hour on increased volume..."
  }
}
```

### How Agents Use It

| Agent Type | Reads Section | Uses For |
|------------|---------------|----------|
| Technical Analyst | `orderbook`, `recent_activity` | Support/resistance levels |
| Liquidity Watcher | `orderbook.depth` | Slippage estimation |
| Momentum Trader | `recent_activity` | Trend confirmation |
| Value Bettor | `current_prices`, `market.volume` | Fair value estimation |

---

## Skill 2: X/Twitter Data (obul-twit)

### What It Does

Searches X/Twitter for market-relevant conversations. Extracts sentiment, tracks influential accounts, and identifies breaking news before it hits mainstream sources.

### Key Scripts

**`search-tweets.js`** — Tweet search with filters

```javascript
// Input: Search parameters
{
  "words": "Bitcoin ETF SEC",
  "minLikes": 50,
  "minReposts": 10,
  "since": "2026-03-17",
  "from": "elonmusk,vitalikbuterin"
}

// Output: Structured tweet data
{
  "query": "Bitcoin ETF SEC",
  "total_results": 147,
  "tweets": [
    {
      "id": "1234567890",
      "author": "@crypto_analyst",
      "text": "SEC just filed notice for ETF review...",
      "likes": 234,
      "reposts": 89,
      "timestamp": "2026-03-17T11:30:00Z",
      "sentiment": "bullish",
      "relevance_score": 0.94
    }
  ],
  "sentiment_summary": {
    "bullish": 67,
    "bearish": 23,
    "neutral": 57,
    "bullish_ratio": 0.55
  },
  "key_accounts_mentioned": ["@SECGov", "@BlackRock"],
  "trending_hashtags": ["#BitcoinETF", "#SEC"],
  "for_agents": {
    "news_trader": "SEC filing detected 30 min ago...",
    "sentiment_analyzer": "55% bullish, up from 42%...",
    "whale_watcher": "Large accounts posting about ETF..."
  }
}
```

**`analyze-sentiment.js`** — Sentiment extraction

```javascript
// Processes raw tweets into sentiment signals
{
  "overall_sentiment": 0.73,  // -1 to 1
  "confidence": 0.85,
  "key_themes": [
    {"theme": "ETF approval", "sentiment": 0.82, "mentions": 45},
    {"theme": "regulation", "sentiment": -0.15, "mentions": 23}
  ],
  "influencer_opinions": [
    {"account": "@crypto_analyst", "stance": "bullish", "reach": 500000}
  ],
  "time_series": [
    {"hour": "11:00", "sentiment": 0.42},
    {"hour": "12:00", "sentiment": 0.73}  // Spike detected
  ]
}
```

### How Agents Use It

| Agent Type | Reads Section | Uses For |
|------------|---------------|----------|
| News Trader | `tweets` (filtered by recency) | Breaking news detection |
| Sentiment Analyzer | `sentiment_summary` | Crowd psychology |
| Whale Watcher | `influencer_opinions` | Smart money signals |
| Contrarian | `bullish_ratio` | Extreme sentiment detection |

---

## Skill 3: Unified Search (obul-sybil)

### What It Does

Combines Exa (semantic web search) and Grok (X/Twitter + web) into unified research. Returns synthesized answers with citations—perfect for comprehensive market research.

### Key Scripts

**`search-grok-combined.js`** — Web + X synthesis

```javascript
// Input: Research query
{
  "query": "Bitcoin ETF approval timeline March 2026",
  "systemPrompt": "Analyze regulatory timeline and market impact",
  "outputSchema": {
    "type": "object",
    "properties": {
      "key_events": {"type": "array", "items": {"type": "string"}},
      "timeline": {"type": "string"},
      "market_impact": {"type": "string"},
      "confidence": {"type": "number"}
    }
  }
}

// Output: Structured research
{
  "content": {
    "key_events": [
      "SEC filed review notice March 15",
      "Comment period ends March 22",
      "Decision expected March 29"
    ],
    "timeline": "Final decision within 14 days of comment close",
    "market_impact": "Historical ETF approvals saw 15-25% price moves",
    "confidence": 0.78
  },
  "citations": [
    {
      "id": "1",
      "title": "SEC Notice of Review",
      "url": "https://sec.gov/...",
      "source": "web"
    },
    {
      "id": "2",
      "title": "@SEC_News tweet thread",
      "url": "https://x.com/...",
      "source": "x"
    }
  ],
  "for_agents": {
    "fundamentals": "Regulatory timeline is 14 days...",
    "event_trader": "March 29 decision date is key catalyst...",
    "historian": "Previous ETF approvals: +15-25%..."
  }
}
```

**`search-grok-web.js`** — Deep web research

```javascript
// For technical analysis, whitepapers, expert opinions
{
  "query": "Bitcoin technical analysis support resistance March 2026",
  "options": {
    "domains": {
      "allow": ["bloomberg.com", "reuters.com", "coindesk.com"]
    }
  }
}
```

**`search-grok-x.js`** — X/Twitter deep dive

```javascript
// For sentiment, insider chatter, community mood
{
  "query": "Bitcoin trader sentiment whale alerts",
  "options": {
    "dateRange": {"from": "2026-03-16", "to": "2026-03-17"}
  }
}
```

### How Agents Use It

| Agent Type | Reads Section | Uses For |
|------------|---------------|----------|
| Fundamentals | `content.key_events` | Catalyst timeline |
| Event Trader | `content.timeline` | Entry/exit timing |
| Historian | `market_impact` | Pattern matching |
| Researcher | `citations` | Source verification |

---

## Skill 4: Web Scraping (obul-firecrawl)

### What It Does

Extracts clean, structured text from any URL. Turns news articles, blog posts, and reports into seed document sections.

### Key Scripts

**`scrape.js`** — Single URL extraction

```javascript
// Input: URL to scrape
const url = "https://www.bloomberg.com/news/articles/2026-03-17/bitcoin-etf";

// Output: Clean article content
{
  "url": "https://www.bloomberg.com/...",
  "title": "SEC Reviews Bitcoin ETF Applications",
  "author": "Jane Smith",
  "published": "2026-03-17T10:00:00Z",
  "content": "The Securities and Exchange Commission on Monday...",
  "summary": "SEC initiated review of 3 Bitcoin ETF applications...",
  "key_quotes": [
    "\"The review process typically takes 2-3 weeks,\" said the spokesperson",
    "Analysts expect approval by end of March"
  ],
  "for_agents": {
    "news_trader": "SEC review initiated, 2-3 week timeline...",
    "analyst": "3 applications under review, approval expected..."
  }
}
```

**`crawl.js`** — Multi-page extraction

```javascript
// Crawl a site for comprehensive research
{
  "startUrl": "https://sec.gov/news",
  "maxPages": 10,
  "includePaths": ["/news/press-release/*"],
  "excludePaths": ["/news/archive/*"]
}
```

### How Agents Use It

| Agent Type | Reads Section | Uses For |
|------------|---------------|----------|
| News Trader | `published`, `content` | Freshness check |
| Analyst | `key_quotes` | Expert opinions |
| Fact Checker | `url`, `author` | Source verification |

---

## The Seed Document Builder

### Merging All Sources

The `build-seed-doc.js` script orchestrates all skills:

```javascript
async function buildSeedDocument(marketSlug) {
  // 1. Fetch market data
  const marketData = await polymarket.getMarketForMirofish(marketSlug);
  
  // 2. Search X/Twitter
  const keyword = extractKeyword(marketData.question);
  const tweets = await obulTwit.searchTweets({
    words: keyword,
    minLikes: 50,
    since: hoursAgo(6)
  });
  
  // 3. Deep research
  const research = await obulSybil.searchGrokCombined({
    query: `${keyword} latest news analysis`,
    outputSchema: researchSchema
  });
  
  // 4. Scrape key articles
  const articles = await Promise.all(
    research.citations
      .filter(c => c.source === 'web')
      .slice(0, 3)
      .map(c => obulFirecrawl.scrape(c.url))
  );
  
  // 5. Build final document
  return {
    metadata: {
      generated_at: new Date().toISOString(),
      market_slug: marketSlug,
      sources_count: 4,
      data_freshness: 'real-time'
    },
    
    market_overview: marketData.market,
    
    price_action: {
      current: marketData.current_prices,
      orderbook: marketData.orderbook,
      recent: marketData.recent_activity
    },
    
    social_sentiment: {
      x_summary: tweets.sentiment_summary,
      key_tweets: tweets.tweets.slice(0, 5),
      trending: tweets.trending_hashtags
    },
    
    research_synthesis: {
      findings: research.content,
      sources: research.citations,
      confidence: research.content.confidence
    },
    
    news_articles: articles.map(a => ({
      title: a.title,
      source: a.url,
      summary: a.summary,
      published: a.published
    })),
    
    agent_sections: {
      technical_analyst: buildTechnicalSection(marketData),
      news_trader: buildNewsSection(tweets, articles),
      sentiment_analyzer: buildSentimentSection(tweets),
      fundamentals: buildFundamentalsSection(research),
      whale_watcher: buildWhaleSection(tweets, marketData),
      contrarian: buildContrarianSection(tweets, marketData)
    }
  };
}
```

### Output Format

```json
{
  "metadata": {
    "generated_at": "2026-03-17T12:00:00Z",
    "market_slug": "will-bitcoin-be-above-67000-at-1200-pm",
    "sources_count": 4,
    "data_freshness": "real-time"
  },
  
  "market_overview": {
    "question": "Will Bitcoin be above $67,000 at 12:00 PM ET?",
    "description": "...",
    "end_date": "2026-03-17T17:00:00Z",
    "category": "Crypto",
    "volume_usd": 1250000,
    "liquidity_usd": 45000
  },
  
  "price_action": {
    "current": {
      "yes": 0.52,
      "no": 0.47,
      "spread": 0.01,
      "implied_probability": 0.52
    },
    "orderbook": {
      "yes_bids": [...],
      "yes_asks": [...],
      "depth_assessment": "shallow_above_55"
    },
    "recent_activity": {
      "last_trade": "2026-03-17T11:45:00Z",
      "price_movement_1h": 0.03,
      "volume_1h": 45000
    }
  },
  
  "social_sentiment": {
    "x_summary": {
      "bullish": 67,
      "bearish": 23,
      "neutral": 57,
      "bullish_ratio": 0.55
    },
    "key_tweets": [...],
    "trending_hashtags": ["#BitcoinETF", "#SEC"]
  },
  
  "research_synthesis": {
    "findings": {
      "key_events": [...],
      "timeline": "...",
      "market_impact": "...",
      "confidence": 0.78
    },
    "sources": [...],
    "confidence": 0.78
  },
  
  "news_articles": [...],
  
  "agent_sections": {
    "technical_analyst": {
      "summary": "Price consolidating at 0.52 resistance...",
      "key_levels": {"support": 0.48, "resistance": 0.55},
      "volume_analysis": "Above-average volume on upward moves...",
      "pattern": "Ascending triangle forming..."
    },
    
    "news_trader": {
      "breaking_news": "SEC ETF review announced 30 min ago...",
      "catalyst_timeline": "Comment period ends March 22...",
      "historical_precedent": "Previous ETF announcements: +15-25%...",
      "urgency": "high"
    },
    
    "sentiment_analyzer": {
      "overall": 0.73,
      "trend": "increasing",
      "retail_sentiment": "55% bullish, up from 42%...",
      "smart_money_signals": "Whale wallets accumulating..."
    },
    
    "fundamentals": {
      "regulatory_status": "SEC review in progress...",
      "macro_context": "Fed policy supportive...",
      "adoption_metrics": "ETF inflows at record highs..."
    },
    
    "whale_watcher": {
      "on_chain_signals": "$50M moved to exchange...",
      "large_trades": "Block trade at 0.52 for $25K...",
      "wallet_clustering": "Smart money positioning for..."
    },
    
    "contrarian": {
      "crowd_extremes": "55% bullish nearing euphoria...",
      "divergences": "Price up but funding rates flat...",
      "risk_factors": "Shallow orderbook above 0.55..."
    }
  }
}
```

---

## How Agents Consume Seed Documents

Each agent persona is configured to read specific sections:

```python
AGENT_CONFIGS = {
    "technical_analyst": {
        "reads_sections": [
            "price_action",
            "agent_sections.technical_analyst"
        ],
        "system_prompt": "You are a technical analyst..."
    },
    
    "news_trader": {
        "reads_sections": [
            "news_articles",
            "agent_sections.news_trader",
            "social_sentiment.key_tweets"
        ],
        "system_prompt": "You trade on breaking news..."
    },
    
    "sentiment_analyzer": {
        "reads_sections": [
            "social_sentiment",
            "agent_sections.sentiment_analyzer"
        ],
        "system_prompt": "You analyze crowd psychology..."
    },
    
    "fundamentals": {
        "reads_sections": [
            "research_synthesis",
            "agent_sections.fundamentals"
        ],
        "system_prompt": "You focus on long-term value..."
    },
    
    "whale_watcher": {
        "reads_sections": [
            "agent_sections.whale_watcher",
            "price_action.recent_activity"
        ],
        "system_prompt": "You track smart money..."
    },
    
    "contrarian": {
        "reads_sections": [
            "agent_sections.contrarian",
            "social_sentiment.x_summary"
        ],
        "system_prompt": "You bet against the crowd..."
    }
}
```

---

## The Complete Command

One command builds everything:

```bash
node scripts/build-seed-doc.js \
  --market "will-bitcoin-be-above-67000-at-1200-pm" \
  --output "seed_docs/btc_67k_1200.json" \
  --include-x \
  --include-research \
  --include-news

# Output:
# ✓ Fetched Polymarket data (1.2s)
# ✓ Searched X/Twitter (2.4s)
# ✓ Deep research via Grok (4.1s)
# ✓ Scraped 3 articles (1.8s)
# ✓ Built seed document (0.3s)
# 
# Total: 9.8s
# Cost: $0.23
# Sources: 4 APIs, 147 tweets, 3 articles
```

---

## Why This Matters

**Without structured skills:**
- Manual data gathering (30+ minutes per market)
- Inconsistent formatting
- Missing sources
- Agents confused by unstructured text

**With skill-based pipeline:**
- One command (10 seconds)
- Standardized JSON
- Full source tracking
- Each agent gets relevant, structured context

**The result:** Agents that actually understand the market they're debating.

---

## Next Steps

1. **Configure your Obul API key:** `export OBUL_API_KEY=...`
2. **Pick a market:** Find a slug on Polymarket
3. **Run the builder:** `node scripts/build-seed-doc.js --market ...`
4. **Upload to MiroFish:** Use the generated seed document
5. **Run simulation:** Watch 100 agents debate with real intelligence

The future of prediction market analysis isn't single models—it's orchestrated swarms with live data. This pipeline makes that accessible.
