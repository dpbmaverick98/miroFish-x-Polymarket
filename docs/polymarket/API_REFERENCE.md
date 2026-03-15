# Polymarket API Reference (TypeScript)

> ⚠️ **WARNING: This documentation is based on the official SDK and may be outdated.**
> 
> For tested, working examples with real API responses, see:
> - **[API_REFERENCE_TESTED.md](./API_REFERENCE_TESTED.md)** - Updated schemas from actual testing
> - **[PENDING_TODOS.md](../../PENDING_TODOS.md)** - Known issues and workarounds
>
> **Key Issues Found:**
> - Data API currently returns non-JSON (broken)
> - Token IDs are in `clobTokenIds` JSON string, not `tokens` array
> - Many markets have no CLOB orderbook despite having token IDs

Complete guide to Polymarket APIs for market data collection.

---

## API Overview

| API | URL | Purpose | Auth Required | Status |
|-----|-----|---------|---------------|--------|
| **Gamma API** | `https://gamma-api.polymarket.com` | Markets, events, tags | ❌ No | ✅ Working |
| **Data API** | `https://data-api.polymarket.com` | Positions, trades, analytics | ❌ No | ❌ Broken |
| **CLOB API** | `https://clob.polymarket.com` | Orderbook, trading | ⚠️ Partial (trading only) | ✅ Working |

---

## TypeScript Setup

### Installation

```bash
npm install @polymarket/clob-client
# or
npm install axios  # For direct API calls
```

### Base Configuration

```typescript
// src/config/polymarket.ts
export const POLYMARKET_CONFIG = {
  gamma: {
    baseUrl: 'https://gamma-api.polymarket.com',
  },
  data: {
    baseUrl: 'https://data-api.polymarket.com',
  },
  clob: {
    baseUrl: 'https://clob.polymarket.com',
    chainId: 137, // Polygon mainnet
  },
} as const;

export type MarketStatus = 'active' | 'closed' | 'resolved';
export type Side = 'BUY' | 'SELL';
```

---

## Gamma API (Market Discovery)

### Get Active Markets

**Endpoint:** `GET /events`

**Purpose:** List all active prediction markets with metadata.

> ⚠️ **Note:** The `?active=true&closed=false` filter currently returns empty results. Use search instead.

```typescript
// src/apis/gamma.ts
import axios from 'axios';
import { POLYMARKET_CONFIG } from '../config/polymarket';

export interface GammaEvent {
  id: string;
  title: string;
  slug: string;
  description: string;
  active: boolean;
  closed: boolean;
  markets: GammaMarket[];
  tags: { id: string; label: string }[];
}

export interface GammaMarket {
  id: string;
  question: string;
  description: string;
  conditionId: string;
  slug: string;
  outcomes: string[];
  outcomePrices: string; // JSON string: "[\"0.35\", \"0.65\"]"
  volume: string;
  liquidity: string;
  startDate: string;
  endDate: string;
  bestBid: string | null;
  bestAsk: string | null;
  lastTradePrice: string | null;
  /** Token IDs for CLOB API - PARSE THIS JSON STRING */
  clobTokenIds: string; // "[\"token1\", \"token2\"]"
  /** 24h price change from Gamma */
  oneDayPriceChange: number;
  /** 7d price change from Gamma */
  oneWeekPriceChange: number;
  tokens: {
    outcome: string;
    price: number;
    token_id: string | null; // Often null, use clobTokenIds instead
  }[];
  /** Whether this is a negative risk market */
  negRisk?: boolean;
  /** Market rewards configuration */
  rewards?: {
    rate: number;
    minSize: number;
  };
}

export async function getActiveEvents(
  limit: number = 100,
  offset: number = 0
): Promise<GammaEvent[]> {
  const response = await axios.get(
    `${POLYMARKET_CONFIG.gamma.baseUrl}/events`,
    {
      params: {
        // Note: active=true filter may return empty - use search instead
        limit,
        offset,
        order: 'volume_24hr',
        ascending: false,
      },
    }
  );
  return response.data;
}
```

**Helper Functions:**

```typescript
// Parse the JSON strings from Gamma API
export function parseOutcomePrices(pricesJson: string): number[] {
  try {
    return JSON.parse(pricesJson);
  } catch {
    return [];
  }
}

export function parseClobTokenIds(clobTokenIdsJson: string): string[] {
  try {
    return JSON.parse(clobTokenIdsJson);
  } catch {
    return [];
  }
}

// Usage:
const market = event.markets[0];
const [yesTokenId, noTokenId] = parseClobTokenIds(market.clobTokenIds);
const [yesPrice, noPrice] = parseOutcomePrices(market.outcomePrices);
```

**Request:**
```typescript
const events = await getActiveEvents(50);
```

**Response:**
```json
[
  {
    "id": "1001234",
    "title": "Will Bitcoin hit $100k in 2025?",
    "slug": "will-bitcoin-hit-100k-2025",
    "description": "This market resolves to YES if...",
    "active": true,
    "closed": false,
    "markets": [
      {
        "id": "market-5678",
        "question": "Will Bitcoin hit $100k in 2025?",
        "conditionId": "0xabc123...",
        "slug": "will-bitcoin-hit-100k-2025",
        "outcomes": ["Yes", "No"],
        "outcomePrices": "[\"0.35\", \"0.65\"]",
        "volume": "1500000.50",
        "liquidity": "250000.00",
        "bestBid": "0.34",
        "bestAsk": "0.36",
        "lastTradePrice": "0.35",
        "clobTokenIds": "[\"7132104567925...\", \"4834343204537...\"]",
        "oneDayPriceChange": 0.02,
        "oneWeekPriceChange": -0.05,
        "tokens": [
          {
            "outcome": "Yes",
            "price": 0.35,
            "token_id": null  // Use clobTokenIds instead!
          }
        ]
      }
    ],
    "tags": [
      { "id": "100381", "label": "Crypto" },
      { "id": "100382", "label": "Bitcoin" }
    ]
  }
]
```

---

## Data API (Historical Prices)

> ⚠️ **STATUS: CURRENTLY BROKEN**
> 
> The Data API is returning non-JSON responses as of testing.
> 
> **Alternative:** Use `oneDayPriceChange` and `oneWeekPriceChange` from Gamma API market data.

### Get Market Prices History

**Endpoint:** `GET /prices-history`

**Status:** ❌ Not working - returns non-JSON

**Planned Usage:**
```typescript
// Currently broken - do not use
export async function getPriceHistory(
  marketId: string,
  startDate: string,
  endDate: string
): Promise<PricePoint[]> {
  // This will fail - API returns non-JSON
  const response = await axios.get(
    `${POLYMARKET_CONFIG.data.baseUrl}/prices-history`,
    {
      params: {
        market: marketId,
        startDate,
        endDate,
        fidelity: 'hourly',
      },
    }
  );
  return response.data;
}
```

**Workaround using Gamma API:**
```typescript
// Use price changes from Gamma instead
const market = await getMarketBySlug(slug);
const change24h = market.oneDayPriceChange;  // e.g., 0.02 (2%)
const change7d = market.oneWeekPriceChange;  // e.g., -0.05 (-5%)
```

---

## CLOB API (Orderbook & Prices)

### Get Orderbook

**Endpoint:** `GET /book?token_id={tokenId}`

**Purpose:** Full orderbook for a specific token.

> ⚠️ **Note:** Many markets return `{"error":"No orderbook exists..."}` even with valid token IDs. Markets need liquidity to have orderbooks.

```typescript
export interface OrderBook {
  market: string;        // Condition ID
  asset_id: string;      // Token ID
  timestamp: string;
  bids: OrderBookLevel[];
  asks: OrderBookLevel[];
  min_order_size: string;
  tick_size: string;
  neg_risk: boolean;
  last_trade_price: string;
}

export interface OrderBookLevel {
  price: string;
  size: string;
}

export async function getOrderBook(
  tokenId: string
): Promise<OrderBook> {
  const response = await axios.get(
    `${POLYMARKET_CONFIG.clob.baseUrl}/book`,
    {
      params: { token_id: tokenId },
    }
  );
  return response.data;
}
```

**Working Token ID Example:**
```
33799186820745984796925628555218896548353763534512103584425851114581900224385
```

**Response:**
```json
{
  "market": "0x9b3c3177fe473124c756b01e123b4b03e3a99880844ed8dea21b0a7879ca04aa",
  "asset_id": "33799186820745984796925628555218896548353763534512103584425851114581900224385",
  "timestamp": "1773596078108",
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

**Error Response:**
```json
{"error": "No orderbook exists for the requested token id"}
```

---

## Combined Market Data Fetcher

```typescript
// src/services/market-data.ts
import { getActiveEvents, parseClobTokenIds, parseOutcomePrices } from '../apis/gamma';
import { getOrderBook, getMidpoint } from '../apis/clob';

export interface EnrichedMarket {
  // From Gamma
  id: string;
  question: string;
  slug: string;
  category: string;
  
  // From CLOB (may be null if no orderbook)
  bestBid: number | null;
  bestAsk: number | null;
  midpoint: number | null;
  spread: number | null;
  
  // From Gamma (use instead of Data API)
  change24h: number | null;
  change7d: number | null;
  
  // Token IDs
  yesTokenId: string | null;
  noTokenId: string | null;
}

export async function getEnrichedMarkets(
  limit: number = 50
): Promise<EnrichedMarket[]> {
  const events = await getActiveEvents(limit);
  
  const enriched: EnrichedMarket[] = [];
  
  for (const event of events) {
    for (const market of event.markets) {
      const clobTokenIds = parseClobTokenIds(market.clobTokenIds);
      const yesTokenId = clobTokenIds[0];
      
      let bestBid = null;
      let bestAsk = null;
      let midpoint = null;
      
      // Try to get CLOB data (may fail if no orderbook)
      if (yesTokenId) {
        try {
          const [orderbook, midData] = await Promise.all([
            getOrderBook(yesTokenId),
            getMidpoint(yesTokenId)
          ]);
          
          bestBid = orderbook.bids[0] ? parseFloat(orderbook.bids[0].price) : null;
          bestAsk = orderbook.asks[0] ? parseFloat(orderbook.asks[0].price) : null;
          midpoint = parseFloat(midData.mid);
        } catch {
          // No orderbook for this market
        }
      }
      
      enriched.push({
        id: market.id,
        question: market.question,
        slug: market.slug,
        category: event.tags[0]?.label || 'General',
        bestBid,
        bestAsk,
        midpoint,
        spread: bestBid && bestAsk ? bestAsk - bestBid : null,
        change24h: market.oneDayPriceChange,
        change7d: market.oneWeekPriceChange,
        yesTokenId,
        noTokenId: clobTokenIds[1] || null
      });
    }
  }
  
  return enriched.sort((a, b) => Math.abs(b.change24h || 0) - Math.abs(a.change24h || 0));
}
```

---

## Rate Limits & Best Practices

| API | Limit | Strategy |
|-----|-------|----------|
| Gamma | Unknown | Cache results, poll every 60s |
| CLOB | Unknown | Poll active markets every 30s |
| Data | N/A | Currently broken - don't use |

### Error Handling

```typescript
import axios, { AxiosError } from 'axios';

export class PolymarketAPIError extends Error {
  constructor(
    message: string,
    public statusCode?: number,
    public endpoint?: string
  ) {
    super(message);
    this.name = 'PolymarketAPIError';
  }
}

export function handleAPIError(error: unknown, endpoint: string): never {
  if (axios.isAxiosError(error)) {
    const axiosError = error as AxiosError;
    
    // Handle specific error cases
    if (axiosError.response?.data?.error?.includes('No orderbook exists')) {
      throw new PolymarketAPIError(
        'Market has no CLOB orderbook (no liquidity)',
        404,
        endpoint
      );
    }
    
    throw new PolymarketAPIError(
      axiosError.response?.data?.message || axiosError.message,
      axiosError.response?.status,
      endpoint
    );
  }
  throw new PolymarketAPIError(String(error), undefined, endpoint);
}
```

---

## Next Steps

1. See **[API_REFERENCE_TESTED.md](./API_REFERENCE_TESTED.md)** for exact schemas from real testing
2. See **[PENDING_TODOS.md](../../PENDING_TODOS.md)** for known issues and planned fixes
3. Check the `skills/polymarket/scripts/` folder for working implementations
