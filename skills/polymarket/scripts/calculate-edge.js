#!/usr/bin/env node
// calculate-edge.js - Calculate trading edge vs market price

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

async function calculateEdge(tokenId, prediction) {
  const url = `${CLOB_API}/midpoint?token_id=${encodeURIComponent(tokenId)}`;
  
  try {
    const data = await fetchJson(url);
    const marketPrice = data.mid;
    
    if (!marketPrice) {
      throw new Error('No market price available');
    }
    
    const edge = prediction - marketPrice;
    const edgePercent = edge * 100;
    const edgeBps = Math.round(edge * 10000); // basis points
    
    // Kelly criterion (simplified)
    // f* = (bp - q) / b
    // where b = odds, p = probability of win, q = probability of loss
    const b = (1 - marketPrice) / marketPrice; // implied odds
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
      tokenId,
      prediction: {
        probability: prediction,
        percent: Math.round(prediction * 100)
      },
      market: {
        price: marketPrice,
        percent: Math.round(marketPrice * 100),
        bid: data.bid,
        ask: data.ask
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
      timestamp: data.timestamp
    };
  } catch (error) {
    console.error(JSON.stringify({ error: error.message }, null, 2));
    process.exit(1);
  }
}

// CLI
const args = process.argv.slice(2);
const tokenId = args.find(arg => !arg.startsWith('--') && !arg.startsWith('-'));
const predictionArg = args.find(arg => arg.startsWith('--prediction=') || arg.startsWith('-p='));

if (!tokenId || !predictionArg) {
  console.log('Usage: calculate-edge.js <token-id> --prediction=<0-1>');
  console.log('Example: calculate-edge.js TOKEN_ID --prediction=0.75');
  console.log('Example: calculate-edge.js TOKEN_ID -p=0.65');
  process.exit(1);
}

const prediction = parseFloat(predictionArg.split('=')[1]);

if (isNaN(prediction) || prediction < 0 || prediction > 1) {
  console.error('Error: Prediction must be between 0 and 1');
  process.exit(1);
}

calculateEdge(tokenId, prediction).then(result => {
  console.log(JSON.stringify(result, null, 2));
});
