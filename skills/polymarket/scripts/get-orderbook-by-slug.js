#!/usr/bin/env node
// get-orderbook-by-slug.js - Get orderbook using market slug (auto-fetches token ID)

const https = require('https');

const GAMMA_API = 'https://gamma-api.polymarket.com';
const CLOB_API = 'https://clob.polymarket.com';

function fetchJson(url) {
  return new Promise((resolve, reject) => {
    https.get(url, (res) => {
      if (res.statusCode === 404) {
        reject(new Error('Not found'));
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

function parseClobTokenIds(clobTokenIdsJson) {
  try {
    return JSON.parse(clobTokenIdsJson);
  } catch {
    return [];
  }
}

async function getOrderbookBySlug(slug) {
  try {
    // 1. Get market to find token ID
    const event = await fetchJson(`${GAMMA_API}/events/slug/${encodeURIComponent(slug)}`);
    const market = event.markets?.[0];
    
    if (!market) {
      throw new Error('Market not found');
    }
    
    const clobTokenIds = parseClobTokenIds(market.clobTokenIds);
    const tokenId = clobTokenIds[0]; // Yes token
    
    if (!tokenId) {
      throw new Error('No CLOB token ID found for this market');
    }
    
    // 2. Get orderbook
    const book = await fetchJson(`${CLOB_API}/book?token_id=${encodeURIComponent(tokenId)}`);
    
    const bestBid = book.bids?.[0] ? parseFloat(book.bids[0].price) : null;
    const bestAsk = book.asks?.[0] ? parseFloat(book.asks[0].price) : null;
    const spread = bestBid && bestAsk ? bestAsk - bestBid : null;
    
    return {
      market: {
        question: market.question,
        slug: slug
      },
      orderbook: {
        bestBid,
        bestAsk,
        spread: spread ? parseFloat(spread.toFixed(4)) : null,
        spreadBps: spread ? Math.round(spread * 10000) : null,
        midpoint: bestBid && bestAsk ? parseFloat(((bestBid + bestAsk) / 2).toFixed(4)) : null,
        bidSize: book.bids?.[0] ? parseFloat(book.bids[0].size) : null,
        askSize: book.asks?.[0] ? parseFloat(book.asks[0].size) : null,
        lastTradePrice: book.last_trade_price ? parseFloat(book.last_trade_price) : null
      },
      bids: (book.bids || []).slice(0, 5).map(b => ({
        price: parseFloat(b.price),
        size: parseFloat(b.size)
      })),
      asks: (book.asks || []).slice(0, 5).map(a => ({
        price: parseFloat(a.price),
        size: parseFloat(a.size)
      })),
      tokenId
    };
  } catch (error) {
    console.error(JSON.stringify({ error: error.message }, null, 2));
    process.exit(1);
  }
}

// CLI
const slug = process.argv[2];

if (!slug) {
  console.log('Usage: get-orderbook-by-slug.js <slug>');
  console.log('Example: get-orderbook-by-slug.js microstrategy-sell-any-bitcoin-in-2025');
  process.exit(1);
}

getOrderbookBySlug(slug).then(result => {
  console.log(JSON.stringify(result, null, 2));
});
