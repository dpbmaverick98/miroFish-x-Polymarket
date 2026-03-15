#!/usr/bin/env node
// get-midpoint-by-slug.js - Get midpoint price using market slug (auto-fetches token ID)

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

async function getMidpointBySlug(slug) {
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
    
    // 2. Get midpoint
    const data = await fetchJson(`${CLOB_API}/midpoint?token_id=${encodeURIComponent(tokenId)}`);
    
    const price = data.mid;
    
    return {
      market: {
        question: market.question,
        slug: slug
      },
      price: {
        midpoint: price,
        bid: data.bid,
        ask: data.ask,
        impliedProbability: price ? Math.round(price * 100) : null
      },
      tokenId,
      timestamp: data.timestamp
    };
  } catch (error) {
    console.error(JSON.stringify({ error: error.message }, null, 2));
    process.exit(1);
  }
}

// CLI
const slug = process.argv[2];

if (!slug) {
  console.log('Usage: get-midpoint-by-slug.js <slug>');
  console.log('Example: get-midpoint-by-slug.js microstrategy-sell-any-bitcoin-in-2025');
  process.exit(1);
}

getMidpointBySlug(slug).then(result => {
  console.log(JSON.stringify(result, null, 2));
});
