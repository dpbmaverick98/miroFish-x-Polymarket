# Polymarket TypeScript SDK Guide

Using `@polymarket/clob-client` for type-safe API interactions.

---

## Installation

```bash
npm install @polymarket/clob-client ethers
```

**Requirements:**
- Node.js >= 20.10 (required by SDK)
- TypeScript >= 5.0 (recommended)

---

## Client Initialization

### Read-Only Client (Market Data)

```typescript
import { ClobClient, Chain } from '@polymarket/clob-client';

// No authentication needed for market data
const client = new ClobClient(
  'https://clob.polymarket.com',
  Chain.POLYGON
);

// Use the client
const markets = await client.getMarkets();
```

### Authenticated Client (Trading)

```typescript
import { ClobClient, Chain } from '@polymarket/clob-client';
import { Wallet } from 'ethers';

const wallet = new Wallet(process.env.PRIVATE_KEY);

// Step 1: Create or derive API credentials
const tempClient = new ClobClient(
  'https://clob.polymarket.com',
  Chain.POLYGON,
  wallet
);

const apiCreds = await tempClient.createOrDeriveApiKey();
// Save these securely!
console.log(apiCreds);
// {
//   key: '550e8400-e29b-41d4-a716-446655440000',
//   secret: 'base64EncodedSecret...',
//   passphrase: 'randomPassphrase...'
// }

// Step 2: Create authenticated client
const client = new ClobClient(
  'https://clob.polymarket.com',
  Chain.POLYGON,
  wallet,
  apiCreds,
  1, // signatureType: 1 = Magic/Email, 0 = MetaMask
  process.env.FUNDER_ADDRESS // Your Polymarket deposit address
);
```

---

## Market Data Methods

### Get All Markets

```typescript
const markets = await client.getMarkets();
console.log(markets.data);
```

### Get Simplified Markets

```typescript
// Lighter weight response
const markets = await client.getSimplifiedMarkets();
```

### Get Specific Market

```typescript
const market = await client.getMarket('condition_id_here');
```

### Get Orderbook

```typescript
const YES_TOKEN = '71321045679252212594626385532706912750332728571942532289631379312455583992563';

const orderbook = await client.getOrderBook(YES_TOKEN);
console.log('Bids:', orderbook.bids);
console.log('Asks:', orderbook.asks);
```

### Get Price Data

```typescript
// Midpoint price
const midpoint = await client.getMidPoint(YES_TOKEN);

// Best price for side
const buyPrice = await client.getPrice(YES_TOKEN, Side.BUY);
const sellPrice = await client.getPrice(YES_TOKEN, Side.SELL);

// Last trade price
const lastPrice = await client.getLastTradePrice(YES_TOKEN);

// Multiple prices at once
const prices = await client.getPrices([YES_TOKEN], Side.BUY);
```

### Get Market Trades

```typescript
const trades = await client.getMarketTradesEvents(YES_TOKEN);
```

---

## Trading Methods (Authenticated)

### Create Limit Order

```typescript
import { OrderType, Side } from '@polymarket/clob-client';

const order = await client.createAndPostOrder(
  {
    tokenID: YES_TOKEN,
    price: 0.55,      // $0.55 per share
    size: 100,        // 100 shares
    side: Side.BUY,
  },
  { 
    tickSize: '0.01',  // From market data
    negRisk: false     // From market data
  },
  OrderType.GTC       // Good Till Canceled
);

console.log('Order ID:', order.orderId);
```

### Create Market Order

```typescript
const marketOrder = await client.createAndPostMarketOrder(
  {
    tokenID: YES_TOKEN,
    amount: 100,      // $100 worth
    side: Side.BUY,
    orderType: OrderType.FOK, // Fill Or Kill
  },
  { tickSize: '0.01' },
  OrderType.FOK
);
```

### Order Types

| Type | Description | Use Case |
|------|-------------|----------|
| `GTC` | Good Till Canceled | Standard limit orders |
| `FOK` | Fill Or Kill | All or nothing immediately |
| `FAK` | Fill And Kill | Fill what you can, cancel rest |
| `GTD` | Good Till Date | Expires at specific time |

### Manage Orders

```typescript
// Get open orders
const openOrders = await client.getOpenOrders();

// Cancel specific order
await client.cancel(orderId);

// Cancel all orders
await client.cancelAll();

// Cancel orders for specific market
await client.cancelMarketOrders(YES_TOKEN);
```

### Get Trade History

```typescript
const trades = await client.getTrades();
```

---

## Complete Trading Example

```typescript
import { ClobClient, Chain, OrderType, Side } from '@polymarket/clob-client';
import { Wallet } from 'ethers';

async function executeTrade() {
  // Setup
  const wallet = new Wallet(process.env.PRIVATE_KEY);
  const client = new ClobClient(
    'https://clob.polymarket.com',
    Chain.POLYGON,
    wallet,
    apiCreds,
    1,
    process.env.FUNDER_ADDRESS
  );

  // Market data
  const YES_TOKEN = '71321045679252212594626385532706912750332728571942532289631379312455583992563';
  const orderbook = await client.getOrderBook(YES_TOKEN);
  const midpoint = await client.getMidPoint(YES_TOKEN);
  
  console.log(`Current price: $${midpoint}`);
  
  // Decision logic
  const myPrediction = 0.72; // 72% confidence
  const marketPrice = midpoint || 0;
  const edge = myPrediction - marketPrice;
  
  if (edge > 0.10) { // 10% edge threshold
    console.log(`Edge detected: ${(edge * 100).toFixed(1)}%`);
    
    // Place buy order
    const order = await client.createAndPostOrder(
      {
        tokenID: YES_TOKEN,
        price: marketPrice + 0.005, // Slight premium
        size: 100,
        side: Side.BUY,
      },
      { tickSize: '0.01', negRisk: false },
      OrderType.GTC
    );
    
    console.log('Order placed:', order.orderId);
    
    // Monitor
    const openOrders = await client.getOpenOrders();
    console.log('Open orders:', openOrders.length);
  } else {
    console.log('No edge, skipping trade');
  }
}
```

---

## Error Handling

```typescript
import { ClobClient } from '@polymarket/clob-client';

try {
  const order = await client.createAndPostOrder(...);
} catch (error) {
  if (error.message.includes('INSUFFICIENT_BALANCE')) {
    console.error('Not enough USDC');
  } else if (error.message.includes('INVALID_SIGNATURE')) {
    console.error('Authentication failed');
  } else if (error.message.includes('RATE_LIMIT')) {
    console.error('Too many requests, slow down');
  } else {
    console.error('Unknown error:', error);
  }
}
```

---

## TypeScript Types Reference

```typescript
// From @polymarket/clob-client

interface ApiKeyCreds {
  key: string;
  secret: string;
  passphrase: string;
}

interface OrderArgs {
  tokenID: string;
  price: number;
  size: number;
  side: Side;
}

interface MarketOrderArgs {
  tokenID: string;
  amount: number;
  side: Side;
  orderType: OrderType;
}

interface OrderOptions {
  tickSize: string;
  negRisk: boolean;
}

enum Side {
  BUY = 'BUY',
  SELL = 'SELL',
}

enum OrderType {
  GTC = 'GTC',
  FOK = 'FOK',
  FAK = 'FAK',
  GTD = 'GTD',
}

enum Chain {
  POLYGON = 137,
  AMOY = 80002, // Testnet
}
```

---

## Best Practices

1. **Reuse API credentials** - Don't create new ones each time
2. **Cache market data** - Poll every 30-60s, not every request
3. **Handle rate limits** - Implement exponential backoff
4. **Validate before trading** - Always check orderbook before placing orders
5. **Log everything** - Track all API calls for debugging
