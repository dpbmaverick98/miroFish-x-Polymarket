#!/usr/bin/env node
// calculate-edge-by-slug.js - Calculate trading edge using market slug (auto-fetches token ID)

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

async function calculateEdgeBySlug(slug, prediction) {
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
    
    // 2. Get midpoint price
    const data = await fetchJson(`${CLOB_API}/midpoint?token_id=${encodeURIComponent(tokenId)}`);
    const marketPrice = parseFloat(data.mid);
    
    if (!marketPrice) {
      throw new Error('No market price available');
    }
    
    // 3. Calculate edge
    const edge = prediction - marketPrice;
    const edgePercent = edge * 100;
    const edgeBps = Math.round(edge * 10000);
    
    // Kelly criterion
    const b = (1 - marketPrice) / marketPrice;
    const p = prediction;
    const q = 1 - p;
    const kellyFraction = (b * p - q) / b;
    
    // Recommendation
    let recommendation = 'HOLD';
    if (edge > 0.05) recommendation = 'STRONG_BUY';
    else if (edge > 0.02) recommendation = 'BUY';
    else if (edge < -0.05) recommendation = 'STRONG_SELL';
    else if (edge < -0.02) recommendation = 'SELL';
    
    return {
      market: {
        question: market.question,
        slug: slug
      },
      prediction: {
        probability: prediction,
        percent: Math.round(prediction * 100)
      },
      marketPrice: {
        price: marketPrice,
        percent: Math.round(marketPrice * 100)
      },
      edge: {
        value: parseFloat(edge.toFixed(4)),
        percent: parseFloat(edgePercent.toFixed(2)),
        basisPoints: edgeBps
      },
      kelly: {
        fraction: parseFloat(kellyFraction.toFixed(4)),
        percent: Math.round(kellyFraction * 100),
        interpretation: kellyFraction > 0.1 ? 'Aggressive' : kellyFraction > 0 ? 'Conservative' : 'No edge'
      },
      recommendation,
      tokenId
    };
  } catch (error) {
    console.error(JSON.stringify({ error: error.message }, null, 2));
    process.exit(1);
  }
}

// CLI
const args = process.argv.slice(2);
const slug = args.find(arg => !arg.startsWith('--') && !arg.startsWith('-'));
const predictionArg = args.find(arg => arg.startsWith('--prediction=') || arg.startsWith('-p='));

if (!slug || !predictionArg) {
  console.log('Usage: calculate-edge-by-slug.js <slug> --prediction=<0-1>');
  console.log('Example: calculate-edge-by-slug.js microstrategy-sell-any-bitcoin-in-2025 --prediction=0.75');
  process.exit(1);
}

const prediction = parseFloat(predictionArg.split('=')[1]);

if (isNaN(prediction) || prediction < 0 || prediction > 1) {
  console.error('Error: Prediction must be between 0 and 1');
  process.exit(1);
}

calculateEdgeBySlug(slug, prediction).then(result => {
  console.log(JSON.stringify(result, null, 2));
});
