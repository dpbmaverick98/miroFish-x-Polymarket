# Polymarket Data Types Reference

Complete TypeScript type definitions for Polymarket API responses.

---

## Gamma API Types

### Core Event Types

```typescript
/**
 * A prediction market event on Polymarket
 * Events can contain multiple markets (e.g., multiple outcomes)
 */
export interface GammaEvent {
  /** Unique event ID */
  id: string;
  
  /** Human-readable title */
  title: string;
  
  /** URL-friendly identifier */
  slug: string;
  
  /** Full description of what the event covers */
  description: string;
  
  /** Start time of the event (ISO 8601) */
  startDate: string;
  
  /** End time / resolution time (ISO 8601) */
  endDate: string;
  
  /** Whether the event is currently active */
  active: boolean;
  
  /** Whether the event has closed */
  closed: boolean;
  
  /** Whether the event has been resolved */
  resolved: boolean;
  
  /** Resolution source URL */
  resolutionSource?: string;
  
  /** Category tags */
  tags: Tag[];
  
  /** Associated prediction markets */
  markets: GammaMarket[];
  
  /** Event image URL */
  image?: string;
  
  /** Volume in USDC */
  volume: string;
  
  /** Liquidity in USDC */
  liquidity: string;
  
  /** Comment count */
  commentCount: number;
}

/**
 * Category tag for filtering markets
 */
export interface Tag {
  id: string;
  label: string;
  slug?: string;
}
```

### Market Types

```typescript
/**
 * Individual prediction market within an event
 * Most events have one market, some have multiple (e.g., multiple choice)
 */
export interface GammaMarket {
  /** Unique market ID */
  id: string;
  
  /** The prediction question */
  question: string;
  
  /** Detailed description */
  description: string;
  
  /** Unique condition ID for CLOB */
  conditionId: string;
  
  /** URL slug */
  slug: string;
  
  /** Market start time */
  startDate: string;
  
  /** Market end time */
  endDate: string;
  
  /** Outcome labels (e.g., ["Yes", "No"]) */
  outcomes: string[];
  
  /** Current prices as JSON string: "[\"0.35\", \"0.65\"]" */
  outcomePrices: string;
  
  /** Total volume traded */
  volume: string;
  
  /** Available liquidity */
  liquidity: string;
  
  /** Best bid price (highest buyer) */
  bestBid: string | null;
  
  /** Best ask price (lowest seller) */
  bestAsk: string | null;
  
  /** Last traded price */
  lastTradePrice: string | null;
  
  /** Spread between best bid and ask */
  spread?: string;
  
  /** Number of trades */
  tradesCount?: number;
  
  /** Unique tokens for each outcome */
  tokens: MarketToken[];
  
  /** Minimum price increment */
  minIncentiveSize?: string;
  
  /** Max limit order size */
  maxLimitOrderSize?: string;
  
  /** Max floor order size */
  maxFloorOrderSize?: string;
  
  /** Whether this is a negative risk market */
  negRisk?: boolean;
  
  /** Related markets */
  relatedMarkets?: RelatedMarket[];
}

/**
 * Token representing one outcome of a market
 * Used for trading via CLOB API
 */
export interface MarketToken {
  /** Outcome label */
  outcome: string;
  
  /** Current price (0-1) */
  price: number;
  
  /** Unique token ID for CLOB */
  token_id: string;
  
  /** Winner status (if resolved) */
  winner?: boolean;
}

/**
 * Simplified market reference
 */
export interface RelatedMarket {
  id: string;
  question: string;
  slug: string;
}
```

### Query Parameters

```typescript
/**
 * Parameters for /events endpoint
 */
export interface EventsQueryParams {
  /** Filter by active status */
  active?: boolean;
  
  /** Filter by closed status */
  closed?: boolean;
  
  /** Filter by resolved status */
  resolved?: boolean;
  
  /** Filter by tag ID */
  tag_id?: string;
  
  /** Include related tags */
  related_tags?: boolean;
  
  /** Exclude specific tag */
  exclude_tag_id?: string;
  
  /** Search query string */
  search?: string;
  
  /** Field to order by */
  order?: 'volume_24hr' | 'volume' | 'liquidity' | 'start_date' | 'end_date' | 'competitive' | 'closed_time';
  
  /** Sort direction */
  ascending?: boolean;
  
  /** Results per page (max 100) */
  limit?: number;
  
  /** Pagination offset */
  offset?: number;
}
```

---

## CLOB API Types

### Orderbook Types

```typescript
/**
 * Full orderbook for a token
 */
export interface OrderBook {
  /** Token ID */
  market: string;
  
  /** Buy orders (bidders) - sorted highest first */
  bids: OrderBookLevel[];
  
  /** Sell orders (askers) - sorted lowest first */
  asks: OrderBookLevel[];
  
  /** Timestamp of snapshot */
  timestamp: string;
}

/**
 * Single price level in orderbook
 */
export interface OrderBookLevel {
  /** Price in USDC */
  price: string;
  
  /** Size (number of shares) */
  size: string;
}

/**
 * Simplified orderbook (top N levels)
 */
export interface SimplifiedOrderBook {
  market: string;
  bids: OrderBookLevel[];
  asks: OrderBookLevel[];
  timestamp: string;
}
```

### Trade Types

```typescript
/**
 * Individual trade record
 */
export interface Trade {
  /** Transaction hash on Polygon */
  transaction_hash: string;
  
  /** Block number */
  block_number?: number;
  
  /** Trade timestamp */
  timestamp: string;
  
  /** Trade price */
  price: string;
  
  /** Trade size */
  size: string;
  
  /** Side that initiated (taker) */
  side: 'BUY' | 'SELL';
  
  /** Maker address (passive side) */
  maker_address: string;
  
  /** Taker address (aggressive side) */
  taker_address: string;
}

/**
 * Trades response
 */
export interface TradesResponse {
  trades: Trade[];
  count: number;
  cursor?: string; // For pagination
}
```

### Price Types

```typescript
/**
 * Midpoint price response
 */
export interface MidpointResponse {
  /** Midpoint price (average of best bid/ask) */
  mid: number | null;
  
  /** Best bid */
  bid: number | null;
  
  /** Best ask */
  ask: number | null;
  
  /** Token ID */
  market: string;
  
  /** Timestamp */
  timestamp: string;
}

/**
 * Price for specific side
 */
export interface PriceResponse {
  /** Best available price */
  price: number | null;
  
  /** Side queried */
  side: 'BUY' | 'SELL';
  
  /** Token ID */
  market: string;
  
  /** Timestamp */
  timestamp: string;
}

/**
 * Last trade price
 */
export interface LastTradePriceResponse {
  /** Last traded price */
  price: number | null;
  
  /** Token ID */
  market: string;
  
  /** Timestamp */
  timestamp: string;
}

/**
 * Multiple prices response
 */
export interface PricesResponse {
  /** Map of token_id -> price */
  prices: Record<string, number | null>;
  
  /** Side queried */
  side: 'BUY' | 'SELL';
  
  /** Timestamp */
  timestamp: string;
}
```

### Market Metadata Types

```typescript
/**
 * Market info from CLOB
 */
export interface ClobMarket {
  /** Condition ID */
  condition_id: string;
  
  /** Market question */
  question: string;
  
  /** Market slug */
  slug: string;
  
  /** Market description */
  description: string;
  
  /** Active status */
  active: boolean;
  
  /** Closed status */
  closed: boolean;
  
  /** Minimum tick size */
  min_incentive_size: string;
  
  /** Max limit order size */
  max_limit_order_size: string;
  
  /** Max floor order size */
  max_floor_order_size: string;
  
  /** Risk management params */
  risk_params?: RiskParams;
  
  /** Tokens */
  tokens: ClobToken[];
}

export interface ClobToken {
  /** Token ID */
  token_id: string;
  
  /** Outcome name */
  outcome: string;
  
  /** Current price */
  price: number;
}

export interface RiskParams {
  /** Maximum position size */
  max_position: string;
  
  /** Minimum collateral */
  min_collateral: string;
}
```

---

## Data API Types

### Price History

```typescript
/**
 * Historical price point
 */
export interface PriceHistoryPoint {
  /** Timestamp */
  t: number; // Unix timestamp
  
  /** Price */
  p: number;
  
  /** Volume */
  v: number;
}

/**
 * Price history query params
 */
export interface PriceHistoryParams {
  /** Market condition ID */
  market: string;
  
  /** Start date (ISO 8601) */
  startDate: string;
  
  /** End date (ISO 8601) */
  endDate: string;
  
  /** Time granularity */
  fidelity: '1m' | '5m' | '15m' | '1h' | '4h' | '1d';
}
```

### Market Analytics

```typescript
/**
 * Market statistics
 */
export interface MarketStats {
  /** Market ID */
  marketId: string;
  
  /** 24h volume */
  volume24h: number;
  
  /** Total volume */
  totalVolume: number;
  
  /** 24h price change */
  change24h: number;
  
  /** Number of traders */
  traderCount: number;
  
  /** Open interest */
  openInterest: number;
}

/**
 * Leaderboard entry
 */
export interface LeaderboardEntry {
  /** User address */
  address: string;
  
  /** Profit/loss */
  pnl: number;
  
  /** Win rate */
  winRate: number;
  
  /** Total trades */
  tradeCount: number;
  
  /** Volume traded */
  volume: number;
}
```

---

## Trading Types (Authenticated)

### Order Types

```typescript
/**
 * Limit order parameters
 */
export interface LimitOrderParams {
  /** Token ID to trade */
  tokenID: string;
  
  /** Price per share (0-1) */
  price: number;
  
  /** Number of shares */
  size: number;
  
  /** Buy or Sell */
  side: Side;
}

/**
 * Market order parameters
 */
export interface MarketOrderParams {
  /** Token ID to trade */
  tokenID: string;
  
  /** USDC amount to spend */
  amount: number;
  
  /** Buy or Sell */
  side: Side;
  
  /** Fill type */
  orderType: OrderType.FOK | OrderType.FAK;
}

/**
 * Order options
 */
export interface OrderOptions {
  /** Minimum price increment */
  tickSize: string;
  
  /** Whether market has negative risk */
  negRisk: boolean;
}

/**
 * Created order (before signing)
 */
export interface Order {
  /** Order ID */
  id?: string;
  
  /** Token ID */
  tokenID: string;
  
  /** Price */
  price: string;
  
  /** Size */
  size: string;
  
  /** Side */
  side: Side;
  
  /** Order type */
  type: OrderType;
  
  /** Timestamp */
  timestamp?: string;
  
  /** Expiration */
  expiration?: string;
  
  /** Signature (added after signing) */
  signature?: string;
  
  /** Maker address */
  maker?: string;
  
  /** Taker address (for specific fills) */
  taker?: string;
}

/**
 * Order response from API
 */
export interface OrderResponse {
  /** Order ID */
  orderId: string;
  
  /** Transaction hash (if filled) */
  transactionHash?: string;
  
  /** Status */
  status: 'pending' | 'filled' | 'partially_filled' | 'cancelled';
  
  /** Filled size */
  filledSize?: string;
  
  /** Remaining size */
  remainingSize?: string;
  
  /** Average fill price */
  avgPrice?: string;
}
```

### Account Types

```typescript
/**
 * API credentials
 */
export interface ApiCredentials {
  /** API key */
  key: string;
  
  /** API secret */
  secret: string;
  
  /** Passphrase */
  passphrase: string;
}

/**
 * Account balance
 */
export interface Balance {
  /** Asset (USDC) */
  asset: string;
  
  /** Available balance */
  available: string;
  
  /** Balance locked in orders */
  locked: string;
  
  /** Total balance */
  total: string;
}

/**
 * Position in a market
 */
export interface Position {
  /** Token ID */
  token_id: string;
  
  /** Market question */
  market: string;
  
  /** Position size (positive = long, negative = short) */
  size: string;
  
  /** Average entry price */
  avg_price: string;
  
  /** Unrealized P&L */
  unrealized_pnl: string;
  
  /** Realized P&L */
  realized_pnl: string;
}
```

---

## Utility Types

```typescript
/**
 * Pagination params
 */
export interface PaginationParams {
  limit?: number;
  offset?: number;
  cursor?: string;
}

/**
 * API error response
 */
export interface ApiError {
  error: string;
  message: string;
  code?: string;
  details?: Record<string, unknown>;
}

/**
 * Time range for queries
 */
export interface TimeRange {
  start: string; // ISO 8601
  end: string;   // ISO 8601
}

/**
 * Price point (generic)
 */
export interface PricePoint {
  timestamp: string;
  price: number;
  volume?: number;
}
```

---

## Type Guards

```typescript
/**
 * Check if value is a valid GammaEvent
 */
export function isGammaEvent(value: unknown): value is GammaEvent {
  return (
    typeof value === 'object' &&
    value !== null &&
    'id' in value &&
    'title' in value &&
    'markets' in value
  );
}

/**
 * Check if value is a valid OrderBook
 */
export function isOrderBook(value: unknown): value is OrderBook {
  return (
    typeof value === 'object' &&
    value !== null &&
    'market' in value &&
    'bids' in value &&
    'asks' in value &&
    Array.isArray((value as OrderBook).bids) &&
    Array.isArray((value as OrderBook).asks)
  );
}

/**
 * Parse outcome prices from JSON string
 */
export function parseOutcomePrices(pricesJson: string): number[] {
  try {
    return JSON.parse(pricesJson) as number[];
  } catch {
    return [];
  }
}
```

---

## Enums

```typescript
/**
 * Market outcome side
 */
export enum Side {
  BUY = 'BUY',
  SELL = 'SELL',
}

/**
 * Order types
 */
export enum OrderType {
  /** Good Till Canceled */
  GTC = 'GTC',
  
  /** Fill Or Kill */
  FOK = 'FOK',
  
  /** Fill And Kill */
  FAK = 'FAK',
  
  /** Good Till Date */
  GTD = 'GTD',
}

/**
 * Blockchain networks
 */
export enum Chain {
  POLYGON = 137,
  AMOY = 80002, // Testnet
}

/**
 * Signature types for wallet
 */
export enum SignatureType {
  /** Externally Owned Account (MetaMask, etc.) */
  EOA = 0,
  
  /** Magic Link / Email wallet */
  POLY_PROXY = 1,
  
  /** Gnosis Safe multisig */
  GNOSIS_SAFE = 2,
}

/**
 * Order status
 */
export enum OrderStatus {
  PENDING = 'pending',
  OPEN = 'open',
  FILLED = 'filled',
  PARTIALLY_FILLED = 'partially_filled',
  CANCELLED = 'cancelled',
  EXPIRED = 'expired',
}

/**
 * Market status
 */
export enum MarketStatus {
  ACTIVE = 'active',
  CLOSED = 'closed',
  RESOLVED = 'resolved',
  CANCELLED = 'cancelled',
}
```
