# Polymarket Quick Reference

Quick lookup for common API operations.

---

## Common API Calls

### Get Active Markets
```typescript
const events = await axios.get(
  'https://gamma-api.polymarket.com/events?active=true&closed=false&limit=50'
);
```

### Get Market by Slug
```typescript
const market = await axios.get(
  'https://gamma-api.polymarket.com/events/slug/will-bitcoin-hit-100k-2025'
);
```

### Get Orderbook
```typescript
const book = await axios.get(
  'https://clob.polymarket.com/book?token_id=TOKEN_ID'
);
```

### Get Midpoint Price
```typescript
const { data } = await axios.get(
  'https://clob.polymarket.com/midpoint?token_id=TOKEN_ID'
);
const price = data.mid;
```

---

## Token ID Extraction

```typescript
// From Gamma API response
const yesToken = market.tokens.find(t => t.outcome === 'Yes');
const tokenId = yesToken.token_id;
```

---

## Price Calculations

```typescript
// Spread
const spread = bestAsk - bestBid;

// Midpoint
const midpoint = (bestBid + bestAsk) / 2;

// Edge (prediction vs market)
const edge = myPrediction - marketPrice;

// Expected value
const ev = (probability * payoff) - (1 - probability) * loss;
```

---

## Rate Limit Handling

```typescript
import axios from 'axios';

const client = axios.create({
  baseURL: 'https://gamma-api.polymarket.com',
});

// Retry with exponential backoff
client.interceptors.response.use(
  (response) => response,
  async (error) => {
    if (error.response?.status === 429) {
      const delay = Math.pow(2, error.config.retryCount || 0) * 1000;
      await new Promise(r => setTimeout(r, delay));
      error.config.retryCount = (error.config.retryCount || 0) + 1;
      return client(error.config);
    }
    return Promise.reject(error);
  }
);
```

---

## Error Codes

| Code | Meaning | Action |
|------|---------|--------|
| 400 | Bad Request | Check parameters |
| 404 | Not Found | Market doesn't exist |
| 429 | Rate Limited | Slow down, retry |
| 500 | Server Error | Retry later |

---

## Useful URLs

| Resource | URL |
|----------|-----|
| Gamma API | `https://gamma-api.polymarket.com` |
| CLOB API | `https://clob.polymarket.com` |
| Data API | `https://data-api.polymarket.com` |
| Web App | `https://polymarket.com` |
| Docs | `https://docs.polymarket.com` |
| GitHub | `https://github.com/Polymarket` |

---

## Environment Variables

```bash
# Required for trading
POLYMARKET_PRIVATE_KEY=0x...
POLYMARKET_FUNDER_ADDRESS=0x...

# For API clients
GAMMA_API_URL=https://gamma-api.polymarket.com
CLOB_API_URL=https://clob.polymarket.com
```
