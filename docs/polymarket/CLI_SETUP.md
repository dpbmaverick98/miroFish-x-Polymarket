# Polymarket CLI Setup

Official Rust CLI for Polymarket. More reliable than custom scripts.

## Install

```bash
curl -sSL https://raw.githubusercontent.com/Polymarket/polymarket-cli/main/install.sh | sh
```

Or via Homebrew:
```bash
brew tap Polymarket/polymarket-cli https://github.com/Polymarket/polymarket-cli
brew install polymarket
```

## Quick Commands

### Markets (No Auth Required)
```bash
# List active markets
polymarket markets list --active true --limit 10

# Search markets
polymarket markets search "bitcoin" --limit 5

# Get market details
polymarket markets get <slug>
polymarket markets get <market-id>

# JSON output for scripts
polymarket -o json markets list --active true --limit 5
```

### CLOB - Order Book & Prices (No Auth Required)
```bash
# Get market info (includes token IDs)
polymarket clob market <condition-id>

# Get orderbook
polymarket clob book <token-id>

# Get price
polymarket clob price <token-id> --side buy
polymarket clob price <token-id> --side sell

# Get midpoint
polymarket clob midpoint <token-id>

# Get spread
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
# Create wallet (generates new key)
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

## Common Workflows

### Get Market Data for MiroFish
```bash
# 1. Search for market
polymarket markets search "bitcoin" --limit 5

# 2. Get market details (includes token IDs)
polymarket markets get will-bitcoin-reach-100k-2025

# 3. Get orderbook
polymarket clob book <token-id-from-above>

# 4. Get price history
polymarket clob price-history <token-id> --interval 1d --fidelity 30
```

### Script with JSON
```bash
# Get market data for scripts
polymarket -o json markets list --active true --limit 100 | jq '.[].question'

# Get prices programmatically
polymarket -o json clob midpoint <token-id> | jq '.midpoint'
```

## Output Formats

- Default: table format
- JSON: `polymarket -o json <command>`
- Short: `-o json` or `-o table`

## Notes

- Most commands work without wallet
- Wallet needed for: trading, balances, orders
- JSON output ideal for scripts/automation
- API is more reliable than custom Node.js scripts
