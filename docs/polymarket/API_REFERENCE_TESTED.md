# Polymarket API Reference (Tested & Updated)

Complete guide to Polymarket APIs based on actual testing. Includes working examples and known issues.

---

## API Overview

| API | URL | Purpose | Auth Required | Status |
|-----|-----|---------|---------------|--------|
| **Gamma API** | `https://gamma-api.polymarket.com` | Markets, events, tags | ❌ No | ✅ Working |
| **CLOB API** | `https://clob.polymarket.com` | Orderbook, prices | ❌ No (read) | ✅ Working |
| **Data API** | `https://data-api.polymarket.com` | Historical prices | ❌ No | ❌ Broken (non-JSON) |

---

## Key Learnings from Testing

### 1. Token ID Locations

The Gamma API returns token IDs in **two places**:

```json
{
  "markets": [{
    "tokens": [
      { "token_id": null, ... },           // Often null
      { "token_id": null, ... }
    ],
    "clobTokenIds": "[\"935929492...\", \"307453934...\"]"  // Use this!
  }]
}
```

**For CLOB API calls, use `clobTokenIds` (parsed from JSON string).**

### 2. Orderbook Availability

Not all markets have active orderbooks:
- Token IDs exist in Gamma
- CLOB returns: `{"error":"No orderbook exists for the requested token id"}`
- Markets need liquidity to have orderbooks

### 3. Working Token ID Example

```
33799186820745984796925628555218896548353763534512103584425851114581900224385
```

### 4. API Response Formats

**Gamma `/events`**: Returns array directly
**Gamma `/events/slug/{slug}`**: Returns single event object
**CLOB `/book`**: Returns orderbook object
**CLOB `/midpoint`**: Returns `{ mid, bid, ask, market, timestamp }`
**Data API**: Currently returns non-JSON (broken)

---

## Gamma API (Market Discovery)

### Get Markets by Search

**Endpoint:** `GET /events?active=true&closed=false&search={keyword}&limit={n}`

**Working Example:**
```bash
curl "https://gamma-api.polymarket.com/events?active=true&closed=false&search=bitcoin&limit=2"
```

**Response Schema:**
```json
[
  {
    "id": "16167",
    "title": "MicroStrategy sells any Bitcoin by ___ ?",
    "slug": "microstrategy-sell-any-bitcoin-in-2025",
    "description": "...",
    "active": true,
    "closed": false,
    "volume": 21250982.36,
    "liquidity": 150786.49,
    "markets": [{
      "id": "516926",
      "question": "MicroStrategy sells any Bitcoin in 2025?",
      "conditionId": "0x19ee98e348c0ccb341d1b9566fa14521566e9b2ea7aed34dc407a0ec56be36a2",
      "outcomes": "[\"Yes\", \"No\"]",
      "outcomePrices": "[\"0\", \"1\"]",
      "volume": "17976157.53",
      "liquidity": "151523.47",
      "bestBid": null,
      "bestAsk": "0.001",
      "lastTradePrice": "1",
      "clobTokenIds": "[\"935929492...\", \"307453934...\"]",
      "oneDayPriceChange": -0.001,
      "oneWeekPriceChange": -0.006,
      "negRisk": false
    }],
    "tags": [{ "id": "120", "label": "Finance" }]
  }
]
```

**Key Fields:**
| Field | Type | Description |
|-------|------|-------------|
| `markets[0].clobTokenIds` | JSON string | Token IDs for CLOB API |
| `markets[0].oneDayPriceChange` | number | 24h price change |
| `markets[0].oneWeekPriceChange` | number | 7d price change |
| `markets[0].conditionId` | string | For Data API (currently broken) |

---

### Get Market by Slug

**Endpoint:** `GET /events/slug/{slug}`

**Working Example:**
```bash
curl "https://gamma-api.polymarket.com/events/slug/microstrategy-sell-any-bitcoin-in-2025"
```

**Response:** Single event object (same schema as above)

---

## CLOB API (Orderbook & Prices)

### Get Orderbook

**Endpoint:** `GET /book?token_id={tokenId}`

**Working Example:**
```bash
curl "https://clob.polymarket.com/book?token_id=33799186820745984796925628555218896548353763534512103584425851114581900224385"
```

**Response Schema:**
```json
{
  "market": "0x9b3c3177fe473124c756b01e123b4b03e3a99880844ed8dea21b0a7879ca04aa",
  "asset_id": "33799186820745984796925628555218896548353763534512103584425851114581900224385",
  "timestamp": "1773596078108",
  "hash": "fb67ed13ea61c1fd1c4f80b7857b716f23a5b895",
  "bids": [
    { "price": "0.001", "size": "6535" },
    { "price": "0.002", "size": "5075.29" }
  ],
  "asks": [
    { "price": "0.999", "size": "1040.04" },
    { "price": "0.998", "size": "10.37" }
  ],
  "min_order_size": "5",
  "tick_size": "0.001",
  "neg_risk": false,
  "last_trade_price": "0.017"
}
```

**Key Fields:**
| Field | Type | Description |
|-------|------|-------------|
| `bids` | array | Buy orders (highest first) |
| `asks` | array | Sell orders (lowest first) |
| `last_trade_price` | string | Most recent trade |
| `min_order_size` | string | Minimum order size |
| `tick_size` | string | Price increment |

**Error Response:**
```json
{"error": "No orderbook exists for the requested token id"}
```

---

### Get Midpoint Price

**Endpoint:** `GET /midpoint?token_id={tokenId}`

**Working Example:**
```bash
curl "https://clob.polymarket.com/midpoint?token_id=33799186820745984796925628555218896548353763534512103584425851114581900224385"
```

**Response Schema:**
```json
{
  "mid": "0.0185",
  "bid": "0.001",
  "ask": "0.999",
  "market": "0x9b3c3177fe473124c756b01e123b4b03e3a99880844ed8dea21b0a7879ca04aa",
  "timestamp": "1773595483214"
}
```

**Key Fields:**
| Field | Type | Description |
|-------|------|-------------|
| `mid` | string | Midpoint price (fair value) |
| `bid` | string | Best bid price |
| `ask` | string | Best ask price |

---

## Data API (Currently Broken)

### Get Price History

**Endpoint:** `GET /prices-history?market={conditionId}&startTs={timestamp}&endTs={timestamp}&fidelity={1h|1d}`

**Status:** ❌ Returns non-JSON response

**Note:** This API was returning JSON during development but now returns malformed data. All compound scripts have been updated to skip this API and use Gamma API price change fields instead.

**Alternative:** Use `oneDayPriceChange`, `oneWeekPriceChange` from Gamma API market data.

---

## TypeScript Types (Tested)

```typescript
// Gamma API Types
interface GammaEvent {
  id: string;
  title: string;
  slug: string;
  description: string;
  active: boolean;
  closed: boolean;
  volume: number;
  liquidity: number;
  markets: GammaMarket[];
  tags: { id: string; label: string }[];
}

interface GammaMarket {
  id: string;
  question: string;
  conditionId: string;      // For Data API
  outcomes: string;         // JSON string
  outcomePrices: string;    // JSON string: "[\"0.35\", \"0.65\"]"
  volume: string;
  liquidity: string;
  bestBid: string | null;
  bestAsk: string | null;
  lastTradePrice: string | null;
  clobTokenIds: string;     // JSON string: "[\"token1\", \"token2\"]"
  oneDayPriceChange: number;
  oneWeekPriceChange: number;
  negRisk: boolean;
}

// CLOB API Types
interface OrderBook {
  market: string;           // Condition ID
  asset_id: string;         // Token ID
  timestamp: string;
  bids: OrderBookLevel[];
  asks: OrderBookLevel[];
  min_order_size: string;
  tick_size: string;
  neg_risk: boolean;
  last_trade_price: string;
}

interface OrderBookLevel {
  price: string;
  size: string;
}

interface Midpoint {
  mid: string;
  bid: string;
  ask: string;
  market: string;
  timestamp: string;
}
```

---

## Helper Functions

```typescript
// Parse JSON strings from Gamma API
function parseOutcomePrices(pricesJson: string): number[] {
  try {
    return JSON.parse(pricesJson);
  } catch {
    return [];
  }
}

function parseClobTokenIds(clobTokenIdsJson: string): string[] {
  try {
    return JSON.parse(clobTokenIdsJson);
  } catch {
    return [];
  }
}

// Usage
const event = await fetchGammaEvent(slug);
const market = event.markets[0];
const [yesTokenId, noTokenId] = parseClobTokenIds(market.clobTokenIds);
const [yesPrice, noPrice] = parseOutcomePrices(market.outcomePrices);
```

---

## Known Issues & Workarounds

| Issue | Workaround |
|-------|------------|
| Data API returns non-JSON | Use `oneDayPriceChange` from Gamma API |
| `tokens` array has null IDs | Use `clobTokenIds` JSON string instead |
| Many markets have no orderbook | Check for error response, skip if missing |
| `list-active.js` returns empty | API filter issue - use `search-markets.js` instead |
| Active markets filter broken | Search with keyword instead of filtering |

---

## Recommended Workflow

```typescript
// 1. Search for markets
const events = await searchMarkets("bitcoin");

// 2. Get full market details
const event = await getMarketBySlug(events[0].slug);
const market = event.markets[0];

// 3. Extract token IDs
const tokenIds = parseClobTokenIds(market.clobTokenIds);
const yesTokenId = tokenIds[0];

// 4. Get orderbook (if available)
try {
  const orderbook = await getOrderbook(yesTokenId);
} catch (e) {
  // Market has no orderbook
}

// 5. Use price changes from Gamma
const change24h = market.oneDayPriceChange;
const change7d = market.oneWeekPriceChange;
```
