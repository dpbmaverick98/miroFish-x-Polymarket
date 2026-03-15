#!/usr/bin/env node
// get-midpoint.js - Get midpoint price for a token

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

async function getMidpoint(tokenId) {
  const url = `${CLOB_API}/midpoint?token_id=${encodeURIComponent(tokenId)}`;
  
  try {
    const data = await fetchJson(url);
    
    return {
      tokenId: data.market || tokenId,
      midpoint: data.mid,
      bid: data.bid,
      ask: data.ask,
      timestamp: data.timestamp,
      impliedProbability: data.mid ? Math.round(data.mid * 100) : null
    };
  } catch (error) {
    console.error(JSON.stringify({ error: error.message }, null, 2));
    process.exit(1);
  }
}

// CLI
const tokenId = process.argv[2];

if (!tokenId) {
  console.log('Usage: get-midpoint.js <token-id>');
  console.log('Example: get-midpoint.js 71321045679252212594626385532706912750332728571942532289631379312455583992563');
  process.exit(1);
}

getMidpoint(tokenId).then(result => {
  console.log(JSON.stringify(result, null, 2));
});
