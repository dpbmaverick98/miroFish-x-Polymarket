#!/usr/bin/env node
// search-markets.js - Search prediction markets by keyword

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

async function searchMarkets(query, limit = 10) {
  const url = `${GAMMA_API}/events?active=true&closed=false&search=${encodeURIComponent(query)}&limit=${limit}`;
  
  try {
    const events = await fetchJson(url);
    
    return events.map(event => {
      const market = event.markets?.[0];
      const prices = market ? parseOutcomePrices(market.outcomePrices) : [];
      const yesToken = market?.tokens?.find(t => t.outcome === 'Yes');
      const noToken = market?.tokens?.find(t => t.outcome === 'No');
      
      return {
        id: event.id,
        title: event.title,
        slug: event.slug,
        description: event.description?.substring(0, 200) + (event.description?.length > 200 ? '...' : ''),
        category: event.tags?.[0]?.label || 'General',
        volume: market?.volume || '0',
        liquidity: market?.liquidity || '0',
        yesPrice: prices[0] ? parseFloat(prices[0]) : null,
        noPrice: prices[1] ? parseFloat(prices[1]) : null,
        endDate: market?.endDate,
        tokenIds: {
          yes: yesToken?.token_id || null,
          no: noToken?.token_id || null
        }
      };
    });
  } catch (error) {
    console.error(JSON.stringify({ error: error.message }, null, 2));
    process.exit(1);
  }
}

// CLI
const args = process.argv.slice(2);
const queryIndex = args.findIndex(arg => !arg.startsWith('--'));
const query = queryIndex >= 0 ? args.slice(queryIndex).join(' ') : '';
const limitArg = args.find(arg => arg.startsWith('--limit='));
const limit = limitArg ? parseInt(limitArg.split('=')[1]) : 10;

if (!query) {
  console.log('Usage: search-markets.js <query> [--limit=N]');
  console.log('Example: search-markets.js "bitcoin 100k"');
  console.log('Example: search-markets.js "fed rate" --limit=5');
  process.exit(1);
}

searchMarkets(query, limit).then(results => {
  console.log(JSON.stringify(results, null, 2));
});
