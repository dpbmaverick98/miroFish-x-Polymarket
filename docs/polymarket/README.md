# Polymarket Documentation

TypeScript-focused documentation for Polymarket APIs.

---

## Contents

| Document | Purpose |
|----------|---------|
| [API_REFERENCE.md](./API_REFERENCE.md) | Complete API reference with TypeScript examples |
| [TS_SDK_GUIDE.md](./TS_SDK_GUIDE.md) | Using `@polymarket/clob-client` SDK |
| [TYPES.md](./TYPES.md) | Complete TypeScript type definitions |
| [QUICK_REFERENCE.md](./QUICK_REFERENCE.md) | Quick lookup for common operations |

---

## API Overview

Polymarket provides three APIs for market data:

1. **Gamma API** - Market discovery, events, metadata
2. **CLOB API** - Orderbook, prices, trading
3. **Data API** - Historical data, analytics

All APIs are RESTful and return JSON.

---

## Quick Start

```typescript
import axios from 'axios';

// Get active markets
const { data: events } = await axios.get(
  'https://gamma-api.polymarket.com/events?active=true&closed=false'
);

// Extract token ID
const market = events[0].markets[0];
const yesToken = market.tokens.find(t => t.outcome === 'Yes');

// Get orderbook
const { data: book } = await axios.get(
  `https://clob.polymarket.com/book?token_id=${yesToken.token_id}`
);

console.log('Best bid:', book.bids[0]?.price);
console.log('Best ask:', book.asks[0]?.price);
```

---

## Authentication

| API | Public Endpoints | Authenticated Endpoints |
|-----|------------------|------------------------|
| Gamma | All | None |
| Data | All | None |
| CLOB | Orderbook, prices | Trading, orders |

For trading, see [TS_SDK_GUIDE.md](./TS_SDK_GUIDE.md) for authentication setup.

---

## Rate Limits

Polymarket doesn't publish specific rate limits. Best practices:

- Poll market data every 30-60 seconds
- Cache responses aggressively
- Implement exponential backoff on 429 errors
- Use bulk endpoints where available

---

## Support

- Docs: https://docs.polymarket.com
- GitHub: https://github.com/Polymarket
- Discord: Check Polymarket community
