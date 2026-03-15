#!/usr/bin/env node
// find-opportunities.js - Scan top markets for trading edges

const https = require('https');

const GAMMA_API = 'https://gamma-api.polymarket.com';
const CLOB_API = 'https://clob.polymarket.com';

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

async function findOpportunities(limit = 20, minVolume = 100000, priceChangeThreshold = 0.05) {
  try {
    // 1. Get top active markets
    const marketsUrl = `${GAMMA_API}/events?active=true&closed=false&limit=${limit}&order=volume_24hr&ascending=false`;
    const events = await fetchJson(marketsUrl);
    
    // 2. Get current prices for each market
    const opportunities = [];
    
    for (const event of events) {
      const market = event.markets?.[0];
      if (!market) continue;
      
      // Filter by minimum volume
      if (parseFloat(market.volume) < minVolume) continue;
      
      const yesToken = market.tokens?.find(t => t.outcome === 'Yes');
      if (!yesToken?.token_id) continue;
      
      try {
        // Get midpoint
        const midpointUrl = `${CLOB_API}/midpoint?token_id=${encodeURIComponent(yesToken.token_id)}`;
        const midpointData = await fetchJson(midpointUrl);
        
        const currentPrice = midpointData.mid;
        if (!currentPrice) continue;
        
        // Parse outcome prices to get previous/reference price
        let previousPrice = currentPrice;
        try {
          const prices = JSON.parse(market.outcomePrices || '[]');
          previousPrice = parseFloat(prices[0]) || currentPrice;
        } catch {}
        
        const priceChange = currentPrice - previousPrice;
        const priceChangePercent = previousPrice ? (priceChange / previousPrice) * 100 : 0;
        
        // Only include if significant movement
        if (Math.abs(priceChangePercent) >= priceChangeThreshold * 100) {
          opportunities.push({
            rank: opportunities.length + 1,
            question: market.question,
            slug: event.slug,
            category: event.tags?.[0]?.label || 'General',
            volume24h: market.volume,
            liquidity: market.liquidity,
            currentPrice: parseFloat(currentPrice.toFixed(4)),
            impliedProbability: Math.round(currentPrice * 100),
            priceChange: {
              absolute: parseFloat(priceChange.toFixed(4)),
              percent: parseFloat(priceChangePercent.toFixed(2))
            },
            direction: priceChange > 0 ? 'up' : 'down',
            tokenId: yesToken.token_id,
            endDate: market.endDate
          });
        }
      } catch (e) {
        // Skip markets that fail
        continue;
      }
    }
    
    // Sort by absolute price change
    opportunities.sort((a, b) => Math.abs(b.priceChange.percent) - Math.abs(a.priceChange.percent));
    
    // Re-rank after sorting
    opportunities.forEach((opp, i) => opp.rank = i + 1);
    
    return {
      scanParameters: {
        marketsScanned: events.length,
        minVolume,
        priceChangeThreshold: `${priceChangeThreshold * 100}%`,
        timestamp: new Date().toISOString()
      },
      summary: {
        opportunitiesFound: opportunities.length,
        rising: opportunities.filter(o => o.direction === 'up').length,
        falling: opportunities.filter(o => o.direction === 'down').length
      },
      opportunities: opportunities.slice(0, 10) // Top 10
    };
  } catch (error) {
    console.error(JSON.stringify({ error: error.message }, null, 2));
    process.exit(1);
  }
}

// CLI
const args = process.argv.slice(2);
const limitArg = args.find(arg => arg.startsWith('--limit='));
const volumeArg = args.find(arg => arg.startsWith('--min-volume='));
const thresholdArg = args.find(arg => arg.startsWith('--threshold='));

const limit = limitArg ? parseInt(limitArg.split('=')[1]) : 20;
const minVolume = volumeArg ? parseInt(volumeArg.split('=')[1]) : 100000;
const threshold = thresholdArg ? parseFloat(thresholdArg.split('=')[1]) : 0.05;

findOpportunities(limit, minVolume, threshold).then(result => {
  console.log(JSON.stringify(result, null, 2));
});
