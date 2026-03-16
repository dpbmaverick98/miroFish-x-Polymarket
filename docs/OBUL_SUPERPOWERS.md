# How Obul Gives MiroFish Superpowers

## The TL;DR

**One API key. 50+ services. Infinite context.**

Obul transforms MiroFish from a simulation engine into a **real-time intelligence platform** — connecting your agent swarm to live markets, breaking news, social sentiment, and web-scale research, all through a single unified gateway.

---

## The Problem MiroFish Solves

MiroFish generates artificial diversity: 100+ agents with different personas debate and explore edge cases that a single model would miss. But there's a catch:

> **Agents are only as good as their seed documents.**

Without fresh, relevant context, your agents are debating in a vacuum. They're arguing about yesterday's news with stale information.

---

## The Obul Solution

Obul is a **unified API gateway** that gives MiroFish instant access to:

| Category | Services | Use Case |
|----------|----------|----------|
| **Social Media** | X/Twitter, Grok X Search | Real-time sentiment, breaking news, insider chatter |
| **Web Intelligence** | Exa, Tavily, Firecrawl, Perplexity | Deep research, article scraping, semantic search |
| **LLMs** | GPT-4o, Claude, DeepSeek, Gemini, Grok | Cheapest routing, model diversity |
| **Prediction Markets** | Polymarket CLOB/Gamma | Live prices, orderbooks, market data |

**All with one API key.**

---

## What This Unlocks for MiroFish

### Before Obul

```
MiroFish Simulation
├── Seed docs: Static PDFs you uploaded
├── Market data: None (or manual entry)
├── News context: None
└── Result: Agents debate stale information
```

### After Obul

```
MiroFish Simulation
├── Seed docs: Live web scraping + news aggregation
├── Market data: Real-time Polymarket prices
├── News context: Breaking X/Twitter sentiment
├── Research: Deep web search on any topic
└── Result: Agents debate with current intelligence
```

---

## Real-World Example: BTC 5-Minute Market

### The Setup

**Market Question:** "Will Bitcoin be above $67,000 in 5 minutes?"

**Without Obul:**
- Agents debate based on generic Bitcoin knowledge
- No awareness of current price action
- Missing breaking news that just dropped

**With Obul:**

```bash
# 1. Fetch live market data
node skills/polymarket/scripts/get-market-for-mirofish.js \
  --slug "will-bitcoin-be-above-67000-at-1200-pm"

# 2. Scrape latest crypto news
node skills/obul-sybil/scripts/search-grok-web.js \
  --query "Bitcoin price analysis today March 2026"

# 3. Check X/Twitter sentiment
node skills/obul-sybil/scripts/search-grok-x.js \
  --query "Bitcoin BTC sentiment last hour"

# 4. Get whale wallet movements
node skills/obul-twit/scripts/search-tweets.js \
  --query "from:whale_alert bitcoin"
```

### The Result

Your seed documents now include:
- **Live orderbook data** (YES: $0.52, NO: $0.47, spread: 2%)
- **Breaking news** (SEC just announced ETF review)
- **Social sentiment** (72% bullish on X in last hour)
- **Whale alerts** ($50M BTC moved to exchange 10 min ago)

**Your agents now debate with real-time intelligence.**

---

## The Services Breakdown

### 1. X/Twitter Data (`obul-twit`)

**What:** Full Twitter/X API access — search, profiles, timelines, communities.

**Pricing:** $0.0025–$0.01 per call

**For MiroFish:**
- Track sentiment on any topic
- Monitor influential accounts
- Detect breaking news before it hits mainstream
- Follow whale wallets and smart money

```bash
# Search tweets about a market
node skills/obul-twit/scripts/search-tweets.js \
  --words "Bitcoin ETF approval" \
  --minLikes 100 \
  --since 2026-03-17
```

### 2. Unified Search (`obul-sybil`)

**What:** Exa (semantic web) + Grok (X + web) in one API.

**Pricing:** $0.05–$0.18 per search

**For MiroFish:**
- Deep research on any topic
- Structured JSON output (perfect for seed docs)
- Combined web + social context
- Reasoning mode for complex analysis

```bash
# Comprehensive research with structured output
curl -X POST "https://proxy.obul.ai/proxy/https/mavs-agent-army.fly.dev/api/sibyl/api/search/grok-combined" \
  -H "x-obul-api-key: $OBUL_API_KEY" \
  -d '{
    "query": "Analyze Bitcoin price drivers for next 24 hours",
    "outputSchema": {
      "type": "object",
      "properties": {
        "bullish_factors": {"type": "array", "items": {"type": "string"}},
        "bearish_factors": {"type": "array", "items": {"type": "string"}},
        "key_events": {"type": "array", "items": {"type": "string"}},
        "sentiment_score": {"type": "number"}
      }
    }
  }'
```

### 3. Web Scraping (`obul-firecrawl`, `obul-tavily`)

**What:** Extract clean article text from any URL.

**Pricing:** $0.001–$0.05 per scrape

**For MiroFish:**
- Turn news articles into seed documents
- Monitor specific sources (Bloomberg, Reuters)
- Extract structured data from reports

```bash
# Scrape a Bloomberg article
node skills/obul-firecrawl/scripts/scrape.js \
  --url "https://www.bloomberg.com/news/articles/..."
```

### 4. LLM Routing (`obul` core)

**What:** Access to 10+ LLMs with automatic cheapest routing.

**Pricing:** Pay-per-use, typically 20-50% cheaper than direct

**For MiroFish:**
- Run agents on different models (GPT-4o, Claude, DeepSeek)
- True model diversity (not just prompt diversity)
- Cost optimization for large simulations

```bash
# List available models
curl -s https://proxy.obul.ai/proxy/c/llm | jq '.categories[].id'

# Use MiniMax M2.5 (200K context, cheap)
llm/minimax-m2.5

# Use Claude Opus (best reasoning)
llm/claude-opus-4-6

# Use DeepSeek (coding/math)
llm/deepseek-v3.2
```

### 5. Polymarket Integration (`polymarket` skill)

**What:** Live market data via Gamma + CLOB APIs.

**Pricing:** Free (direct API)

**For MiroFish:**
- Real-time prices and orderbooks
- Market metadata and descriptions
- Historical price data

```bash
# Get complete market snapshot
node skills/polymarket/scripts/analyze-market-full.js \
  --slug "will-bitcoin-be-above-67000-at-1200-pm"
```

---

## The Workflow

```
┌─────────────────────────────────────────────────────────────────┐
│  MARKET DISCOVERY                                               │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐             │
│  │ Polymarket  │  │  Obul Twit  │  │  Obul Sybil │             │
│  │  API        │  │  Search     │  │  Web Search │             │
│  └──────┬──────┘  └──────┬──────┘  └──────┬──────┘             │
│         │                │                │                     │
│         └────────────────┼────────────────┘                     │
│                          ▼                                      │
│  ┌──────────────────────────────────────────────────────┐      │
│  │           SEED DOCUMENT GENERATOR                     │      │
│  │  • Market metadata (question, end date, volume)      │      │
│  │  • Current prices (YES/NO, spread, liquidity)        │      │
│  │  • News articles (scraped + summarized)              │      │
│  │  • Social sentiment (X/Twitter analysis)             │      │
│  │  • Research synthesis (web search results)           │      │
│  └────────────────────────┬─────────────────────────────┘      │
│                           │                                     │
│                           ▼                                     │
│  ┌──────────────────────────────────────────────────────┐      │
│  │              MIROFISH SIMULATION                      │      │
│  │                                                       │      │
│  │  100 agents with diverse personas:                    │      │
│  │  • News Trader reads breaking news section            │      │
│  │  • Technical Analyst sees price data                  │      │
│  │  • Sentiment Analyzer reviews X data                  │      │
│  │  • Whale Watcher checks on-chain signals              │      │
│  │                                                       │      │
│  │  They debate, explore edge cases, reach consensus     │      │
│  └────────────────────────┬─────────────────────────────┘      │
│                           │                                     │
│                           ▼                                     │
│  ┌──────────────────────────────────────────────────────┐      │
│  │              TRADE DECISION                          │      │
│  │  • Consensus confidence score                        │      │
│  │  • Position sizing (Kelly criterion)                 │      │
│  │  • Entry/exit strategy                               │      │
│  └──────────────────────────────────────────────────────┘      │
└─────────────────────────────────────────────────────────────────┘
```

---

## The Cost Reality

| Operation | Cost | Frequency |
|-----------|------|-----------|
| Polymarket market data | Free | Every scan |
| X/Twitter search | $0.01 | Per market |
| Web search (Grok) | $0.06 | Per market |
| Article scraping | $0.001 | Per article |
| LLM (MiniMax) | ~$0.002/1K tokens | Per agent |

**Example: Analyzing 50 markets with 100 agents each**

| Component | Calculation | Cost |
|-----------|-------------|------|
| Market data | 50 × free | $0 |
| X/Twitter search | 50 × $0.01 | $0.50 |
| Web research | 50 × $0.06 | $3.00 |
| Article scraping | 100 × $0.001 | $0.10 |
| LLM (100 agents × 50 markets) | 5,000 × $0.005 | $25.00 |
| **Total** | | **~$28.50** |

**For $28, you get 100 diverse perspectives on 50 markets with real-time data.**

---

## The Output Difference

### Without Obul (Static Context)

```
Agent 1: "Bitcoin has historically been volatile."
Agent 2: "Technical analysis suggests caution."
Agent 3: "I need more information about current conditions."

Consensus: UNCLEAR (low confidence)
```

### With Obul (Live Context)

```
Agent 1 (News Trader): "SEC ETF review announced 15 min ago. 
                        This is bullish catalyst. BUY YES."
                        
Agent 2 (Whale Watcher): "$50M just moved to exchange. 
                          Classic pre-dump pattern. SELL/SHORT."
                          
Agent 3 (Technical): "Price at $66,800, resistance at $67K.
                      Breakout likely on ETF news. BUY YES."
                      
Agent 4 (Contrarian): "72% bullish on X. Retail FOMO extreme.
                       Sell the news. BUY NO."

Consensus: MIXED (high confidence in disagreement = no trade)
```

**The difference:** Real context leads to real conviction (or real caution).

---

## Why This Matters

### 1. **Edge in Fast Markets**

Prediction markets move fast. By the time you manually research, the opportunity is gone. Obul gives MiroFish **sub-minute intelligence cycles**.

### 2. **Diversity of Information Sources**

No single data source tells the whole story. Obul gives you:
- **Markets** (what people are betting)
- **News** (what's actually happening)
- **Social** (what people are saying)
- **Research** (what experts think)

### 3. **Structured for Agents**

Obul's JSON output + schema support means seed documents are **machine-readable**. Agents don't parse HTML — they get structured data.

### 4. **One Key to Rule Them All**

No managing 10 API keys. No rate limit juggling. One Obul key, one billing dashboard, 50+ services.

---

## Getting Started

### 1. Get Your Obul Key

```bash
# Sign up at https://my.obul.ai
# Add payment method
# Generate API key
export OBUL_API_KEY=obul_live_...
```

### 2. Set Up MiroFish

```bash
git clone https://github.com/dpbmaverick98/miroFish-x-Polymarket.git
cd miroFish-x-Polymarket
git submodule update --init --recursive

# Configure .env
echo "LLM_API_KEY=$OBUL_API_KEY" >> mirofish/.env
echo "LLM_BASE_URL=https://proxy.obul.ai/proxy/c" >> mirofish/.env
echo "LLM_MODEL_NAME=llm/minimax-m2.5" >> mirofish/.env
```

### 3. Run Your First Live Simulation

```bash
# Collect data
node skills/polymarket/scripts/get-market-for-mirofish.js \
  --slug "your-market-slug" > seed_docs/market.json

node skills/obul-sybil/scripts/search-grok-combined.js \
  --query "Your market topic" > seed_docs/research.json

# Upload to MiroFish and run simulation
# ... (MiroFish upload steps)
```

---

## The Bottom Line

**Obul doesn't just give MiroFish data. It gives MiroFish *relevance*.**

Without Obul, your agents are debating with textbooks. With Obul, they're debating with **live intelligence** — market prices, breaking news, social sentiment, and deep research, all flowing in real-time.

That's the superpower.

---

## Resources

- **Obul Dashboard:** https://my.obul.ai
- **MiroFish + Obul Setup:** [SKILL.md](./skills/mirofish-zep-obul-setup/SKILL.md)
- **Obul API Finder:** [SKILL.md](./skills/obul-api-finder/SKILL.md)
- **X/Twitter Search:** [SKILL.md](./skills/obul-twit/SKILL.md)
- **Unified Search:** [SKILL.md](./skills/obul-sybil/SKILL.md)
- **Polymarket Data:** [SKILL.md](./skills/polymarket/SKILL.md)
