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
# Single API calls
node skills/polymarket/scripts/search-markets.js "bitcoin 100k"
node skills/polymarket/scripts/get-market.js will-bitcoin-hit-100k-2025

# Compound API calls (multiple APIs, clean output)
node skills/polymarket/scripts/analyze-market-full.js will-bitcoin-hit-100k-2025
node skills/polymarket/scripts/get-market-for-mirofish.js "fed rate"
```

## Scripts

### Single API Calls (Atomic)

| Script | Purpose | APIs Called |
|--------|---------|-------------|
| `search-markets.js` | Find markets by keyword | 1x Gamma |
| `get-market.js` | Get market details by slug | 1x Gamma |
| `get-orderbook.js` | Get current orderbook | 1x CLOB |
| `get-midpoint.js` | Get current fair price | 1x CLOB |
| `get-prices.js` | Get historical prices | 1x Data |
| `list-active.js` | List top active markets | 1x Gamma |
| `calculate-edge.js` | Compare prediction to market | 1x CLOB |
| `watch-market.js` | Poll market for changes | 1x CLOB (repeated) |

### Compound API Calls (Multi-API, Clean Output)

| Script | Purpose | APIs Called | Use Case |
|--------|---------|-------------|----------|
| `analyze-market-full.js` | Complete market snapshot | Gamma + CLOB + Data | Trading analysis |
| `find-opportunities.js` | Scan for moving markets | 1x Gamma + Nx CLOB | Discover opportunities |
| `monitor-market.js` | Smart change detection | 2x CLOB (per poll) | Alert on significant moves |
| `compare-markets.js` | Compare related markets | Nx Gamma + Nx CLOB | Arbitrage analysis |
| `get-market-for-mirofish.js` | MiroFish-ready context | Gamma + CLOB + Data | Simulation setup |

## Data Sources

- **Gamma API**: `https://gamma-api.polymarket.com` (market discovery)
- **CLOB API**: `https://clob.polymarket.com` (orderbook, prices)
- **Data API**: `https://data-api.polymarket.com` (historical data)

## Output Philosophy

**Single calls:** Return raw API response (clean, minimal)

**Compound calls:** Transform multiple API responses into structured analysis:
- Remove redundant fields
- Calculate derived metrics (spreads, trends, correlations)
- Add interpretive analysis (trend direction, volatility, recommendations)
- Single coherent JSON output

## Example: Compound Script Output

### analyze-market-full.js
```json
{
  "summary": {
    "question": "Will Bitcoin hit $100k in 2025?",
    "category": "Crypto"
  },
  "pricing": {
    "current": 0.35,
    "impliedProbability": 35,
    "trend": "rising",
    "spread": 0.02
  },
  "analysis": {
    "liquidityScore": "high",
    "volatility": "medium",
    "tradingOpportunity": "wide_spread"
  }
}
```

### get-market-for-mirofish.js
```json
{
  "mirofishContext": {
    "seedDocument": {
      "title": "...",
      "question": "..."
    },
    "marketData": {
      "currentOdds": {...},
      "trading": {...},
      "history": {...}
    },
    "simulationParameters": {
      "suggestedRounds": 40,
      "notes": "Rising sentiment, high volatility"
    }
  }
}
```

## No Authentication Required

All scripts work without API keys for market data. Trading requires authentication (not implemented in this skill).
