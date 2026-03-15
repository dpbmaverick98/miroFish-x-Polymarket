---
name: polymarket
alias: pm
description: 'USE THIS SKILL WHEN: the user wants to find prediction markets, get market data, check prices, analyze odds, or trade on Polymarket'
metadata:
  openclaw:
    emoji: 📊
    requires:
      bins: [node]
    category: finance
---

# Polymarket Skill

Access prediction market data from Polymarket without bloating context.

## Quick Start

```bash
# Search for markets
node skills/polymarket/scripts/search-markets.js "bitcoin" --limit=5

# Get full market analysis (compound - auto-fetches token ID)
node skills/polymarket/scripts/analyze-market-full.js microstrategy-sell-any-bitcoin-in-2025

# Get orderbook by slug (compound - auto-fetches token ID)
node skills/polymarket/scripts/get-orderbook-by-slug.js microstrategy-sell-any-bitcoin-in-2025

# Calculate edge by slug (compound - auto-fetches token ID)
node skills/polymarket/scripts/calculate-edge-by-slug.js microstrategy-sell-any-bitcoin-in-2025 --prediction=0.75
```

## Scripts

### Single API Calls (Atomic - need token ID)

| Script | Purpose | Input | APIs Called |
|--------|---------|-------|-------------|
| `search-markets.js` | Find markets by keyword | keyword | 1x Gamma |
| `get-market.js` | Get market details by slug | slug | 1x Gamma |
| `get-orderbook.js` | Get orderbook | token ID | 1x CLOB |
| `get-midpoint.js` | Get fair price | token ID | 1x CLOB |
| `get-prices.js` | Get historical prices | condition ID | 1x Data |
| `list-active.js` | List top active markets | - | 1x Gamma |
| `calculate-edge.js` | Compare prediction to market | token ID | 1x CLOB |
| `watch-market.js` | Poll market for changes | token ID | 1x CLOB |

### Compound API Calls (Slug-based - auto-fetches token ID)

| Script | Purpose | Input | APIs Called |
|--------|---------|-------|-------------|
| `analyze-market-full.js` | Complete market snapshot | slug | Gamma + CLOB |
| `get-orderbook-by-slug.js` | Get orderbook by slug | slug | Gamma + CLOB |
| `get-midpoint-by-slug.js` | Get midpoint by slug | slug | Gamma + CLOB |
| `calculate-edge-by-slug.js` | Calculate edge by slug | slug + prediction | Gamma + CLOB |
| `find-opportunities.js` | Scan for moving markets | - | Gamma + Nx CLOB |
| `monitor-market.js` | Smart change detection | token ID | 2x CLOB (per poll) |
| `compare-markets.js` | Compare related markets | multiple slugs | Nx Gamma + Nx CLOB |
| `get-market-for-mirofish.js` | MiroFish-ready context | keyword | Gamma + CLOB |

## Data Sources

- **Gamma API**: `https://gamma-api.polymarket.com` (market discovery)
- **CLOB API**: `https://clob.polymarket.com` (orderbook, prices)
- **Data API**: `https://data-api.polymarket.com` (historical data - currently unstable)

## Token ID Flow

```
User provides slug
        ↓
  Gamma API lookup
        ↓
  Extract clobTokenIds
        ↓
  Use with CLOB API
```

## Output Philosophy

**Single calls:** Return raw API response (clean, minimal)

**Compound calls:** Transform multiple API responses into structured analysis:
- Remove redundant fields
- Calculate derived metrics (spreads, trends)
- Add interpretive analysis
- Single coherent JSON output

## Example: Compound Script Output

### analyze-market-full.js
```json
{
  "summary": {
    "question": "Will Bitcoin hit $100k in 2025?",
    "slug": "will-bitcoin-hit-100k-2025",
    "category": "Crypto"
  },
  "pricing": {
    "current": 0.35,
    "impliedProbability": 35,
    "change24h": -0.1,
    "bestBid": 0.34,
    "bestAsk": 0.36,
    "spread": 0.02
  },
  "analysis": {
    "liquidityScore": "high",
    "spreadQuality": "tight"
  }
}
```

## No Authentication Required

All scripts work without API keys for market data. Trading requires authentication (not implemented in this skill).
