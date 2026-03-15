#!/usr/bin/env node
// get-orderbook.js - Get orderbook for a token

const https = require('https');

const CLOB_API = 'https://clob.polymarket.com';

function fetchJson(url) {
  return new Promise((resolve, reject) => {
    https.get(url, (res) => {
      if (res.statusCode === 404) {
        reject(new Error('Token not found'));
        return;
      }
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        try {
          resolve(JSON.parse(data));
        } catch (e) {
          reject(new Error(`Invalid JSON: ${e.message}`));
        }
      });
    }).on('error', reject);
  });
}

async function getOrderbook(tokenId) {
  const url = `${CLOB_API}/book?token_id=${encodeURIComponent(tokenId)}`;
  
  try {
    const book = await fetchJson(url);
    
    const bestBid = book.bids?.[0] ? parseFloat(book.bids[0].price) : null;
    const bestAsk = book.asks?.[0] ? parseFloat(book.asks[0].price) : null;
    const spread = bestBid && bestAsk ? bestAsk - bestBid : null;
    const midpoint = bestBid && bestAsk ? (bestBid + bestAsk) / 2 : null;
    
    return {
      tokenId: book.asset_id || tokenId,
      timestamp: book.timestamp,
      summary: {
        bestBid,
        bestAsk,
        spread,
        spreadBps: spread ? Math.round(spread * 10000) : null, // spread in basis points
        midpoint,
        bidSize: book.bids?.[0] ? parseFloat(book.bids[0].size) : null,
        askSize: book.asks?.[0] ? parseFloat(book.asks[0].size) : null
      },
      orderbook: {
        bids: (book.bids || []).slice(0, 5).map(b => ({
          price: parseFloat(b.price),
          size: parseFloat(b.size)
        })),
        asks: (book.asks || []).slice(0, 5).map(a => ({
          price: parseFloat(a.price),
          size: parseFloat(a.size)
        }))
      },
      metadata: {
        minOrderSize: book.min_order_size,
        tickSize: book.tick_size,
        negRisk: book.neg_risk,
        lastTradePrice: book.last_trade_price ? parseFloat(book.last_trade_price) : null
      }
    };
  } catch (error) {
    console.error(JSON.stringify({ error: error.message }, null, 2));
    process.exit(1);
  }
}

// CLI
const tokenId = process.argv[2];

if (!tokenId) {
  console.log('Usage: get-orderbook.js <token-id>');
  console.log('Example: get-orderbook.js 71321045679252212594626385532706912750332728571942532289631379312455583992563');
  process.exit(1);
}

getOrderbook(tokenId).then(result => {
  console.log(JSON.stringify(result, null, 2));
});
