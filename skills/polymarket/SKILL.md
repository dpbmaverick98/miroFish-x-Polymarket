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
node skills/polymarket/scripts/search-markets.js "bitcoin 100k"

# Get market by slug
node skills/polymarket/scripts/get-market.js will-bitcoin-hit-100k-2025

# Get orderbook
node skills/polymarket/scripts/get-orderbook.js TOKEN_ID

# Get price history
node skills/polymarket/scripts/get-prices.js TOKEN_ID --days 7

# Calculate trading edge
node skills/polymarket/scripts/calculate-edge.js TOKEN_ID --prediction 0.75
```

## Scripts

| Script | Purpose | Example |
|--------|---------|---------|
| `search-markets.js` | Find markets by keyword | `search-markets.js "fed rate"` |
| `get-market.js` | Get market details by slug | `get-market.js will-bitcoin-hit-100k-2025` |
| `get-orderbook.js` | Get current orderbook | `get-orderbook.js TOKEN_ID` |
| `get-prices.js` | Get historical prices | `get-prices.js TOKEN_ID --days 30` |
| `get-midpoint.js` | Get current fair price | `get-midpoint.js TOKEN_ID` |
| `list-active.js` | List top active markets | `list-active.js --limit 20` |
| `calculate-edge.js` | Compare prediction to market | `calculate-edge.js TOKEN_ID -p 0.65` |
| `watch-market.js` | Poll market for changes | `watch-market.js TOKEN_ID --interval 30` |

## Data Sources

- **Gamma API**: `https://gamma-api.polymarket.com` (market discovery)
- **CLOB API**: `https://clob.polymarket.com` (orderbook, prices)
- **Data API**: `https://data-api.polymarket.com` (historical data)

## Output Format

All scripts output clean JSON for easy parsing:

```json
{
  "market": "Will Bitcoin hit $100k in 2025?",
  "yesPrice": 0.35,
  "noPrice": 0.65,
  "volume": "1500000.50",
  "liquidity": "250000.00",
  "tokenId": "71321045679252212594626385532706912750332728571942532289631379312455583992563"
}
```

## No Authentication Required

All scripts work without API keys for market data. Trading requires authentication (not implemented in this skill).
