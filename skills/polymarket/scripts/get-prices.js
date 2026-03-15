#!/usr/bin/env node
// get-prices.js - Get historical price data

const https = require('https');

const DATA_API = 'https://data-api.polymarket.com';

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

async function getPrices(marketId, days = 7, fidelity = '1h') {
  const endTs = Math.floor(Date.now() / 1000);
  const startTs = endTs - (days * 24 * 60 * 60);
  
  const url = `${DATA_API}/prices-history?market=${encodeURIComponent(marketId)}&startTs=${startTs}&endTs=${endTs}&fidelity=${fidelity}`;
  
  try {
    const prices = await fetchJson(url);
    
    if (!Array.isArray(prices)) {
      throw new Error('Invalid response format');
    }
    
    const pricesWithDate = prices.map(p => ({
      timestamp: p.t,
      date: new Date(p.t * 1000).toISOString(),
      price: p.p,
      impliedProbability: Math.round(p.p * 100)
    }));
    
    const currentPrice = pricesWithDate[pricesWithDate.length - 1]?.price;
    const startPrice = pricesWithDate[0]?.price;
    const change = currentPrice && startPrice ? currentPrice - startPrice : null;
    const changePercent = change ? (change / startPrice) * 100 : null;
    
    return {
      marketId,
      period: {
        days,
        fidelity,
        startDate: pricesWithDate[0]?.date,
        endDate: pricesWithDate[pricesWithDate.length - 1]?.date
      },
      summary: {
        currentPrice,
        startPrice,
        change,
        changePercent: changePercent ? parseFloat(changePercent.toFixed(2)) : null,
        high: Math.max(...prices.map(p => p.p)),
        low: Math.min(...prices.map(p => p.p)),
        dataPoints: prices.length
      },
      prices: pricesWithDate
    };
  } catch (error) {
    console.error(JSON.stringify({ error: error.message }, null, 2));
    process.exit(1);
  }
}

// CLI
const args = process.argv.slice(2);
const marketId = args.find(arg => !arg.startsWith('--'));
const daysArg = args.find(arg => arg.startsWith('--days='));
const fidelityArg = args.find(arg => arg.startsWith('--fidelity='));

const days = daysArg ? parseInt(daysArg.split('=')[1]) : 7;
const fidelity = fidelityArg ? fidelityArg.split('=')[1] : '1h';

if (!marketId) {
  console.log('Usage: get-prices.js <market-condition-id> [--days=N] [--fidelity=1h|1d]');
  console.log('Example: get-prices.js 0xabc123 --days=30');
  console.log('Example: get-prices.js 0xabc123 --days=7 --fidelity=1d');
  process.exit(1);
}

getPrices(marketId, days, fidelity).then(result => {
  console.log(JSON.stringify(result, null, 2));
});
