#!/usr/bin/env node
// watch-market.js - Poll market for price changes

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
  const data = await fetchJson(url);
  return {
    midpoint: data.mid,
    bid: data.bid,
    ask: data.ask,
    timestamp: data.timestamp
  };
}

async function watchMarket(tokenId, intervalSeconds = 30, maxPolls = 10) {
  console.log(JSON.stringify({
    event: 'watch_started',
    tokenId,
    intervalSeconds,
    maxPolls
  }));
  
  let previousPrice = null;
  let pollCount = 0;
  
  const poll = async () => {
    try {
      const data = await getMidpoint(tokenId);
      const currentPrice = data.midpoint;
      
      const change = previousPrice !== null ? currentPrice - previousPrice : null;
      const changePercent = change !== null ? (change / previousPrice) * 100 : null;
      
      const result = {
        poll: pollCount + 1,
        timestamp: new Date().toISOString(),
        price: currentPrice,
        impliedProbability: currentPrice ? Math.round(currentPrice * 100) : null,
        bid: data.bid,
        ask: data.ask,
        change: change !== null ? parseFloat(change.toFixed(4)) : null,
        changePercent: changePercent !== null ? parseFloat(changePercent.toFixed(2)) : null
      };
      
      console.log(JSON.stringify(result));
      
      previousPrice = currentPrice;
      pollCount++;
      
      if (pollCount < maxPolls) {
        setTimeout(poll, intervalSeconds * 1000);
      } else {
        console.log(JSON.stringify({ event: 'watch_complete', polls: pollCount }));
      }
    } catch (error) {
      console.error(JSON.stringify({ 
        event: 'error', 
        poll: pollCount + 1,
        error: error.message 
      }));
      pollCount++;
      if (pollCount < maxPolls) {
        setTimeout(poll, intervalSeconds * 1000);
      }
    }
  };
  
  poll();
}

// CLI
const args = process.argv.slice(2);
const tokenId = args.find(arg => !arg.startsWith('--'));
const intervalArg = args.find(arg => arg.startsWith('--interval='));
const maxArg = args.find(arg => arg.startsWith('--max='));

const intervalSeconds = intervalArg ? parseInt(intervalArg.split('=')[1]) : 30;
const maxPolls = maxArg ? parseInt(maxArg.split('=')[1]) : 10;

if (!tokenId) {
  console.log('Usage: watch-market.js <token-id> [--interval=SECONDS] [--max=POLL_COUNT]');
  console.log('Example: watch-market.js TOKEN_ID --interval=60 --max=5');
  process.exit(1);
}

watchMarket(tokenId, intervalSeconds, maxPolls);
