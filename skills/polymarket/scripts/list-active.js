#!/usr/bin/env node
// list-active.js - List top active markets

const https = require('https');

const GAMMA_API = 'https://gamma-api.polymarket.com';

function fetchJson(url) {
  return new Promise((resolve, reject) => {
    https.get(url, (res) => {
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

async function listActive(limit = 20, orderBy = 'volume_24hr') {
  const url = `${GAMMA_API}/events?active=true&closed=false&limit=${limit}&order=${orderBy}&ascending=false`;
  
  try {
    const events = await fetchJson(url);
    
    return events.map((event, index) => {
      const market = event.markets?.[0];
      const prices = market ? parseOutcomePrices(market.outcomePrices) : [];
      const yesToken = market?.tokens?.find(t => t.outcome === 'Yes');
      
      return {
        rank: index + 1,
        id: event.id,
        title: event.title,
        slug: event.slug,
        category: event.tags?.[0]?.label || 'General',
        yesPrice: prices[0] ? parseFloat(prices[0]) : null,
        volume: market?.volume || '0',
        liquidity: market?.liquidity || '0',
        endDate: market?.endDate,
        tokenId: yesToken?.token_id || null
      };
    });
  } catch (error) {
    console.error(JSON.stringify({ error: error.message }, null, 2));
    process.exit(1);
  }
}

// CLI
const args = process.argv.slice(2);
const limitArg = args.find(arg => arg.startsWith('--limit='));
const orderArg = args.find(arg => arg.startsWith('--order='));

const limit = limitArg ? parseInt(limitArg.split('=')[1]) : 20;
const orderBy = orderArg ? orderArg.split('=')[1] : 'volume_24hr';

listActive(limit, orderBy).then(results => {
  console.log(JSON.stringify(results, null, 2));
});
