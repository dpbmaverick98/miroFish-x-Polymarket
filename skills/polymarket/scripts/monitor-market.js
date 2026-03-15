#!/usr/bin/env node
// monitor-market.js - Continuous market tracking with change detection

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

async function getMarketData(tokenId) {
  const [orderbook, midpoint] = await Promise.all([
    fetchJson(`${CLOB_API}/book?token_id=${encodeURIComponent(tokenId)}`),
    fetchJson(`${CLOB_API}/midpoint?token_id=${encodeURIComponent(tokenId)}`)
  ]);
  
  const bestBid = orderbook.bids?.[0] ? parseFloat(orderbook.bids[0].price) : null;
  const bestAsk = orderbook.asks?.[0] ? parseFloat(orderbook.asks[0].price) : null;
  
  return {
    price: midpoint.mid,
    impliedProbability: midpoint.mid ? Math.round(midpoint.mid * 100) : null,
    bestBid,
    bestAsk,
    spread: bestBid && bestAsk ? parseFloat((bestAsk - bestBid).toFixed(4)) : null,
    bidSize: orderbook.bids?.[0] ? parseFloat(orderbook.bids[0].size) : null,
    askSize: orderbook.asks?.[0] ? parseFloat(orderbook.asks[0].size) : null,
    timestamp: new Date().toISOString()
  };
}

async function monitorMarket(tokenId, intervalSeconds = 30, maxPolls = 10, changeThreshold = 0.01) {
  console.log(JSON.stringify({
    event: 'monitor_started',
    tokenId,
    intervalSeconds,
    maxPolls,
    changeThreshold: `${changeThreshold * 100}%`,
    timestamp: new Date().toISOString()
  }));
  
  let previousData = null;
  let pollCount = 0;
  let significantChanges = 0;
  
  const poll = async () => {
    try {
      const data = await getMarketData(tokenId);
      
      // Calculate changes
      const changes = {};
      if (previousData) {
        if (data.price !== previousData.price) {
          const priceChange = data.price - previousData.price;
          const priceChangePercent = previousData.price ? (priceChange / previousData.price) * 100 : 0;
          changes.price = {
            from: previousData.price,
            to: data.price,
            change: parseFloat(priceChange.toFixed(4)),
            changePercent: parseFloat(priceChangePercent.toFixed(2))
          };
        }
        
        if (data.spread !== previousData.spread) {
          changes.spread = { from: previousData.spread, to: data.spread };
        }
        
        // Check if significant
        const isSignificant = changes.price?.changePercent && Math.abs(changes.price.changePercent) >= changeThreshold * 100;
        
        if (isSignificant || pollCount === 0) {
          significantChanges++;
          const result = {
            poll: pollCount + 1,
            significant: isSignificant,
            data,
            changes: Object.keys(changes).length > 0 ? changes : undefined,
            summary: {
              totalPolls: pollCount + 1,
              significantChanges,
              uptime: `${(pollCount * intervalSeconds / 60).toFixed(1)} minutes`
            }
          };
          console.log(JSON.stringify(result));
        }
      } else {
        // First poll
        console.log(JSON.stringify({
          poll: 1,
          significant: true,
          data,
          note: 'initial_reading'
        }));
      }
      
      previousData = data;
      pollCount++;
      
      if (pollCount < maxPolls) {
        setTimeout(poll, intervalSeconds * 1000);
      } else {
        console.log(JSON.stringify({
          event: 'monitor_complete',
          totalPolls: pollCount,
          significantChanges,
          duration: `${(pollCount * intervalSeconds / 60).toFixed(1)} minutes`,
          timestamp: new Date().toISOString()
        }));
      }
    } catch (error) {
      console.error(JSON.stringify({
        event: 'error',
        poll: pollCount + 1,
        error: error.message,
        timestamp: new Date().toISOString()
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
const thresholdArg = args.find(arg => arg.startsWith('--threshold='));

const intervalSeconds = intervalArg ? parseInt(intervalArg.split('=')[1]) : 30;
const maxPolls = maxArg ? parseInt(maxArg.split('=')[1]) : 10;
const changeThreshold = thresholdArg ? parseFloat(thresholdArg.split('=')[1]) : 0.01;

if (!tokenId) {
  console.log('Usage: monitor-market.js <token-id> [--interval=SECONDS] [--max=POLL_COUNT] [--threshold=0.01]');
  console.log('Example: monitor-market.js TOKEN_ID --interval=60 --max=20 --threshold=0.02');
  process.exit(1);
}

monitorMarket(tokenId, intervalSeconds, maxPolls, changeThreshold);
