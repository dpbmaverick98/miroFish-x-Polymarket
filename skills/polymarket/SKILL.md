---
name: polymarket
alias: pm
description: 'USE THIS SKILL WHEN: the user wants to find prediction markets, get market data, check prices, analyze odds, or trade on Polymarket'
metadata:
  openclaw:
    emoji: 📊
    requires:
      bins: [polymarket]
    category: finance
---

# Polymarket Skill

Use the official `polymarket` CLI for reliable market data. Fall back to Node scripts only if needed.

## Install CLI (One-time)

```bash
curl -sSL https://raw.githubusercontent.com/Polymarket/polymarket-cli/main/install.sh | sh
```

Verify: `polymarket --version`

## Recommended: CLI Commands

### Markets (No Auth Required)

```bash
# List active markets
polymarket markets list --active true --limit 10

# Search markets
polymarket markets search "bitcoin" --limit 5

# Get market details (includes token IDs)
polymarket markets get <slug>
polymarket markets get <market-id>

# JSON output for scripts
polymarket -o json markets list --active true --limit 5
```

### CLOB - Order Book & Prices (No Auth Required)

```bash
# Get market info (includes YES/NO token IDs)
polymarket clob market <condition-id>

# Get orderbook
polymarket clob book <token-id>

# Get price (buy or sell side)
polymarket clob price <token-id> --side buy
polymarket clob price <token-id> --side sell

# Get midpoint price
polymarket clob midpoint <token-id>

# Get bid-ask spread
polymarket clob spread <token-id>

# Get price history
polymarket clob price-history <token-id> --interval 1d --fidelity 30
```

### Events & Tags

```bash
polymarket events list --limit 10
polymarket events list --tag politics --active true
polymarket tags list
```

### Wallet (Requires Private Key)

```bash
# Create new wallet
polymarket wallet create

# Import existing key
polymarket wallet import 0xabc123...

# Check config
polymarket wallet show
```

### Trading (Requires Wallet)

```bash
# Place order
polymarket clob create-order --token <token-id> --side buy --price 0.50 --size 10

# Cancel orders
polymarket clob cancel-all

# Check balances
polymarket clob balance --asset-type collateral
```

## Workflow: Get Market Data for MiroFish

```bash
# 1. Search for market
polymarket markets search "bitcoin" --limit 5

# 2. Get full market details (includes token IDs for YES/NO)
polymarket markets get <slug>

# 3. Get orderbook for a specific outcome
polymarket clob book <token-id>

# 4. Get price history
polymarket clob price-history <token-id> --interval 1d --fidelity 30
```

## Script with JSON

```bash
# Get market list for scripts
polymarket -o json markets list --active true --limit 100 | jq '.[].question'

# Get prices programmatically
polymarket -o json clob midpoint <token-id> | jq '.midpoint'

# Error handling
if ! result=$(polymarket -o json clob book <token-id> 2>/dev/null); then
  echo "Failed to fetch orderbook"
fi
```

## Fallback: Node Scripts (Legacy)

Only use if CLI doesn't work for your use case.

### Single API Calls (need token ID)

| Script | Purpose | Input |
|--------|---------|-------|
| `search-markets.js` | Find markets | keyword |
| `get-market.js` | Market details by slug | slug |
| `get-orderbook.js` | Orderbook | token ID |
| `list-active.js` | Active markets | - |

### Compound Scripts (auto-fetch token ID)

| Script | Purpose | Input |
|--------|---------|-------|
| `analyze-market-full.js` | Full market snapshot | slug |
| `get-orderbook-by-slug.js` | Orderbook by slug | slug |
| `calculate-edge-by-slug.js` | Edge calculation | slug + prediction |

Usage:
```bash
node skills/polymarket/scripts/search-markets.js "bitcoin" --limit=5
node skills/polymarket/scripts/analyze-market-full.js <slug>
```

## Known Issues (Node Scripts)

- `list-active.js` returns empty (Polymarket API filter issue)
- Data API unstable - use CLI instead
- Many markets lack orderbooks - check liquidity first

## No Authentication Required

Most commands work without wallet. Only need wallet for:
- Placing/canceling orders
- Checking balances
- On-chain operations

See `docs/polymarket/CLI_SETUP.md` for more details.
