# Polymarket API Reference (TypeScript)

Complete guide to Polymarket APIs for market data collection.

---

## API Overview

Polymarket provides three main APIs:

| API | URL | Purpose | Auth Required |
|-----|-----|---------|---------------|
| **Gamma API** | `https://gamma-api.polymarket.com` | Markets, events, tags | ❌ No |
| **Data API** | `https://data-api.polymarket.com` | Positions, trades, analytics | ❌ No |
| **CLOB API** | `https://clob.polymarket.com` | Orderbook, trading | ⚠️ Partial (trading only) |

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
  outcomePrices: string[]; // JSON array of prices
  volume: string;
  liquidity: string;
  startDate: string;
  endDate: string;
  bestBid: string | null;
  bestAsk: string | null;
  lastTradePrice: string | null;
  tokens: {
    outcome: string;
    price: number;
    token_id: string;
  }[];
}

export async function getActiveEvents(
  limit: number = 100,
  offset: number = 0
): Promise<GammaEvent[]> {
  const response = await axios.get(
    `${POLYMARKET_CONFIG.gamma.baseUrl}/events`,
    {
      params: {
        active: true,
        closed: false,
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
        "tokens": [
          {
            "outcome": "Yes",
            "price": 0.35,
            "token_id": "71321045679252212594626385532706912750332728571942532289631379312455583992563"
          },
          {
            "outcome": "No",
            "price": 0.65,
            "token_id": "48343432045371682931373849999999999999999999999999999999999999999999999999999"
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

### Get Market by Slug

**Endpoint:** `GET /events/slug/{slug}`

**Purpose:** Fetch specific market by URL slug.

```typescript
export async function getMarketBySlug(
  slug: string
): Promise<GammaEvent | null> {
  try {
    const response = await axios.get(
      `${POLYMARKET_CONFIG.gamma.baseUrl}/events/slug/${slug}`
    );
    return response.data;
  } catch (error) {
    if (axios.isAxiosError(error) && error.response?.status === 404) {
      return null;
    }
    throw error;
  }
}
```

**Request:**
```typescript
const market = await getMarketBySlug('will-bitcoin-hit-100k-2025');
```

**Response:** Single `GammaEvent` object (same structure as above).

---

### Search Markets

**Endpoint:** `GET /events`

**Purpose:** Find markets by keyword.

```typescript
export async function searchMarkets(
  query: string,
  limit: number = 20
): Promise<GammaEvent[]> {
  const response = await axios.get(
    `${POLYMARKET_CONFIG.gamma.baseUrl}/events`,
    {
      params: {
        active: true,
        closed: false,
        search: query,
        limit,
      },
    }
  );
  return response.data;
}
```

**Request:**
```typescript
const results = await searchMarkets('fed rate', 10);
```

---

### Get Markets by Tag

**Endpoint:** `GET /events`

**Purpose:** Filter markets by category tag.

```typescript
export async function getMarketsByTag(
  tagId: string,
  limit: number = 50
): Promise<GammaEvent[]> {
  const response = await axios.get(
    `${POLYMARKET_CONFIG.gamma.baseUrl}/events`,
    {
      params: {
        active: true,
        closed: false,
        tag_id: tagId,
        limit,
      },
    }
  );
  return response.data;
}

// Get available tags
export async function getTags(): Promise<{ id: string; label: string }[]> {
  const response = await axios.get(
    `${POLYMARKET_CONFIG.gamma.baseUrl}/tags`
  );
  return response.data;
}
```

---

## CLOB API (Orderbook & Prices)

### Get Orderbook

**Endpoint:** `GET /book`

**Purpose:** Full orderbook for a specific token.

```typescript
// src/apis/clob.ts
import axios from 'axios';
import { POLYMARKET_CONFIG } from '../config/polymarket';

export interface OrderBook {
  market: string; // token_id
  bids: OrderBookLevel[];
  asks: OrderBookLevel[];
  timestamp: string;
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

**Request:**
```typescript
const book = await getOrderBook(
  '71321045679252212594626385532706912750332728571942532289631379312455583992563'
);
```

**Response:**
```json
{
  "market": "71321045679252212594626385532706912750332728571942532289631379312455583992563",
  "bids": [
    { "price": "0.34", "size": "1500.50" },
    { "price": "0.33", "size": "2500.00" },
    { "price": "0.32", "size": "5000.00" }
  ],
  "asks": [
    { "price": "0.36", "size": "800.25" },
    { "price": "0.37", "size": "1200.00" },
    { "price": "0.38", "size": "3000.00" }
  ],
  "timestamp": "2024-03-15T10:30:00.000Z"
}
```

**Semantics:**
- `bids`: Orders to BUY (you sell at these prices)
- `asks`: Orders to SELL (you buy at these prices)
- Prices are in USDC (0.34 = $0.34 per share)
- Size is number of shares

---

### Get Midpoint Price

**Endpoint:** `GET /midpoint`

**Purpose:** Current fair price (average of best bid/ask).

```typescript
export async function getMidpoint(tokenId: string): Promise<number | null> {
  const response = await axios.get(
    `${POLYMARKET_CONFIG.clob.baseUrl}/midpoint`,
    {
      params: { token_id: tokenId },
    }
  );
  return response.data.mid ?? null;
}
```

**Request:**
```typescript
const mid = await getMidpoint(tokenId);
// Returns: 0.35 (or null if no orders)
```

---

### Get Price for Side

**Endpoint:** `GET /price`

**Purpose:** Best available price for BUY or SELL.

```typescript
export async function getPrice(
  tokenId: string,
  side: 'BUY' | 'SELL'
): Promise<number | null> {
  const response = await axios.get(
    `${POLYMARKET_CONFIG.clob.baseUrl}/price`,
    {
      params: { 
        token_id: tokenId,
        side: side,
      },
    }
  );
  return response.data.price ?? null;
}

// Usage
const buyPrice = await getPrice(tokenId, 'BUY');  // Best ask
const sellPrice = await getPrice(tokenId, 'SELL'); // Best bid
```

---

### Get Last Trade Price

**Endpoint:** `GET /last_trade_price`

**Purpose:** Most recent trade price.

```typescript
export async function getLastTradePrice(
  tokenId: string
): Promise<number | null> {
  const response = await axios.get(
    `${POLYMARKET_CONFIG.clob.baseUrl}/last_trade_price`,
    {
      params: { token_id: tokenId },
    }
  );
  return response.data.price ?? null;
}
```

---

### Get Market Trades

**Endpoint:** `GET /trades`

**Purpose:** Recent trades for a market.

```typescript
export interface Trade {
  transaction_hash: string;
  timestamp: string;
  price: string;
  size: string;
  side: 'BUY' | 'SELL';
  maker_address: string;
  taker_address: string;
}

export async function getRecentTrades(
  tokenId: string,
  limit: number = 20
): Promise<Trade[]> {
  const response = await axios.get(
    `${POLYMARKET_CONFIG.clob.baseUrl}/trades`,
    {
      params: { 
        token_id: tokenId,
        limit,
      },
    }
  );
  return response.data.trades;
}
```

---

## Data API (Analytics)

### Get Market Prices History

**Endpoint:** `GET /prices-history`

**Purpose:** Historical price data for charting.

```typescript
// src/apis/data.ts
import axios from 'axios';
import { POLYMARKET_CONFIG } from '../config/polymarket';

export interface PricePoint {
  timestamp: string;
  price: number;
  volume: number;
}

export async function getPriceHistory(
  marketId: string,
  startDate: string, // ISO 8601
  endDate: string
): Promise<PricePoint[]> {
  const response = await axios.get(
    `${POLYMARKET_CONFIG.data.baseUrl}/prices-history`,
    {
      params: {
        market: marketId,
        startDate,
        endDate,
        fidelity: 'hourly', // or 'daily', 'weekly'
      },
    }
  );
  return response.data;
}
```

---

## Combined Market Data Fetcher

```typescript
// src/services/market-data.ts
import { getActiveEvents, GammaMarket } from '../apis/gamma';
import { getOrderBook, getMidpoint, getRecentTrades } from '../apis/clob';

export interface EnrichedMarket {
  // From Gamma
  id: string;
  question: string;
  slug: string;
  description: string;
  category: string;
  
  // From CLOB
  bestBid: number | null;
  bestAsk: number | null;
  midpoint: number | null;
  spread: number | null;
  volume24h: number;
  liquidity: number;
  
  // Token IDs for trading
  yesTokenId: string;
  noTokenId: string;
  
  // Recent activity
  recentTrades: number;
  lastTradePrice: number | null;
  
  // Metadata
  endDate: string;
  active: boolean;
}

export async function getEnrichedMarkets(
  limit: number = 50
): Promise<EnrichedMarket[]> {
  const events = await getActiveEvents(limit);
  
  const enriched: EnrichedMarket[] = [];
  
  for (const event of events) {
    for (const market of event.markets) {
      const yesToken = market.tokens.find(t => t.outcome === 'Yes');
      if (!yesToken) continue;
      
      // Fetch CLOB data
      const [midpoint, orderbook] = await Promise.all([
        getMidpoint(yesToken.token_id).catch(() => null),
        getOrderBook(yesToken.token_id).catch(() => null),
      ]);
      
      const bestBid = orderbook?.bids[0] 
        ? parseFloat(orderbook.bids[0].price) 
        : null;
      const bestAsk = orderbook?.asks[0] 
        ? parseFloat(orderbook.asks[0].price) 
        : null;
      
      enriched.push({
        id: market.id,
        question: market.question,
        slug: market.slug,
        description: market.description,
        category: event.tags[0]?.label || 'General',
        bestBid,
        bestAsk,
        midpoint,
        spread: bestBid && bestAsk ? bestAsk - bestBid : null,
        volume24h: parseFloat(market.volume),
        liquidity: parseFloat(market.liquidity),
        yesTokenId: yesToken.token_id,
        noTokenId: market.tokens.find(t => t.outcome === 'No')?.token_id || '',
        recentTrades: 0, // Would need separate call
        lastTradePrice: market.lastTradePrice 
          ? parseFloat(market.lastTradePrice) 
          : null,
        endDate: market.endDate,
        active: event.active,
      });
    }
  }
  
  return enriched.sort((a, b) => b.volume24h - a.volume24h);
}
```

---

## Rate Limits & Best Practices

| API | Limit | Strategy |
|-----|-------|----------|
| Gamma | Unknown | Cache results, poll every 60s |
| CLOB | Unknown | Poll active markets every 30s |
| Data | Unknown | Use for historical, not realtime |

### Caching Pattern

```typescript
import NodeCache from 'node-cache';

const cache = new NodeCache({ stdTTL: 30 }); // 30 seconds

export async function getCachedMarkets(): Promise<EnrichedMarket[]> {
  const cached = cache.get<EnrichedMarket[]>('markets');
  if (cached) return cached;
  
  const markets = await getEnrichedMarkets();
  cache.set('markets', markets);
  return markets;
}
```

---

## Error Handling

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

See `TRADING.md` for authenticated endpoints (placing orders, managing positions).
