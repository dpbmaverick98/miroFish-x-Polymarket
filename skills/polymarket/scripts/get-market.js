#!/usr/bin/env node
// get-market.js - Get market details by slug

const https = require('https');

const GAMMA_API = 'https://gamma-api.polymarket.com';

function fetchJson(url) {
  return new Promise((resolve, reject) => {
    https.get(url, (res) => {
      if (res.statusCode === 404) {
        reject(new Error('Market not found'));
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

function parseOutcomePrices(pricesJson) {
  try {
    return JSON.parse(pricesJson);
  } catch {
    return [];
  }
}

async function getMarket(slug) {
  const url = `${GAMMA_API}/events/slug/${encodeURIComponent(slug)}`;
  
  try {
    const event = await fetchJson(url);
    const market = event.markets?.[0];
    
    if (!market) {
      throw new Error('No market data found');
    }
    
    const prices = parseOutcomePrices(market.outcomePrices);
    const yesToken = market.tokens?.find(t => t.outcome === 'Yes');
    const noToken = market.tokens?.find(t => t.outcome === 'No');
    
    return {
      id: event.id,
      title: event.title,
      slug: event.slug,
      description: event.description,
      category: event.tags?.[0]?.label || 'General',
      tags: event.tags?.map(t => t.label) || [],
      active: event.active,
      closed: event.closed,
      resolved: event.resolved,
      startDate: event.startDate,
      endDate: event.endDate,
      volume: event.volume,
      liquidity: event.liquidity,
      market: {
        id: market.id,
        question: market.question,
        conditionId: market.conditionId,
        outcomes: market.outcomes,
        yesPrice: prices[0] ? parseFloat(prices[0]) : null,
        noPrice: prices[1] ? parseFloat(prices[1]) : null,
        bestBid: market.bestBid ? parseFloat(market.bestBid) : null,
        bestAsk: market.bestAsk ? parseFloat(market.bestAsk) : null,
        lastTradePrice: market.lastTradePrice ? parseFloat(market.lastTradePrice) : null,
        volume: market.volume,
        liquidity: market.liquidity,
        negRisk: market.negRisk || false
      },
      tokens: {
        yes: yesToken ? {
          token_id: yesToken.token_id,
          price: yesToken.price
        } : null,
        no: noToken ? {
          token_id: noToken.token_id,
          price: noToken.price
        } : null
      }
    };
  } catch (error) {
    console.error(JSON.stringify({ error: error.message }, null, 2));
    process.exit(1);
  }
}

// CLI
const slug = process.argv[2];

if (!slug) {
  console.log('Usage: get-market.js <slug>');
  console.log('Example: get-market.js will-bitcoin-hit-100k-2025');
  process.exit(1);
}

getMarket(slug).then(result => {
  console.log(JSON.stringify(result, null, 2));
});
