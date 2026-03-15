#!/usr/bin/env node
// get-market-for-mirofish.js - Gather complete context for MiroFish simulation seed

const https = require('https');

const GAMMA_API = 'https://gamma-api.polymarket.com';
const CLOB_API = 'https://clob.polymarket.com';
const DATA_API = 'https://data-api.polymarket.com';

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

function parseOutcomePrices(pricesJson) {
  try {
    return JSON.parse(pricesJson);
  } catch {
    return [];
  }
}

async function getMarketForMirofish(keyword) {
  try {
    // 1. Search for markets
    const searchUrl = `${GAMMA_API}/events?active=true&closed=false&search=${encodeURIComponent(keyword)}&limit=5`;
    const searchResults = await fetchJson(searchUrl);
    
    if (!searchResults.length) {
      throw new Error(`No markets found for keyword: ${keyword}`);
    }
    
    // Pick best match (highest volume)
    const bestMatch = searchResults.sort((a, b) => {
      const volA = parseFloat(a.markets?.[0]?.volume) || 0;
      const volB = parseFloat(b.markets?.[0]?.volume) || 0;
      return volB - volA;
    })[0];
    
    const market = bestMatch.markets?.[0];
    const yesToken = market?.tokens?.find(t => t.outcome === 'Yes');
    const tokenId = yesToken?.token_id;
    
    // 2. Get full market details
    const event = await fetchJson(`${GAMMA_API}/events/slug/${encodeURIComponent(bestMatch.slug)}`);
    const fullMarket = event.markets?.[0];
    
    // 3. Get orderbook
    let orderbook = null;
    try {
      orderbook = await fetchJson(`${CLOB_API}/book?token_id=${encodeURIComponent(tokenId)}`);
    } catch {}
    
    // 4. Get 30-day price history
    let priceHistory = [];
    try {
      const endTs = Math.floor(Date.now() / 1000);
      const startTs = endTs - (30 * 24 * 60 * 60);
      priceHistory = await fetchJson(
        `${DATA_API}/prices-history?market=${encodeURIComponent(fullMarket.conditionId)}&startTs=${startTs}&endTs=${endTs}&fidelity=1d`
      );
    } catch {}
    
    // Parse and clean data
    const prices = parseOutcomePrices(fullMarket.outcomePrices);
    const currentPrice = prices[0] ? parseFloat(prices[0]) : 0;
    
    const bestBid = orderbook?.bids?.[0] ? parseFloat(orderbook.bids[0].price) : null;
    const bestAsk = orderbook?.asks?.[0] ? parseFloat(orderbook.asks[0].price) : null;
    
    // Calculate trend from price history
    let trend = 'stable';
    let volatility = 'low';
    if (Array.isArray(priceHistory) && priceHistory.length >= 7) {
      const firstWeek = priceHistory.slice(0, 7);
      const lastWeek = priceHistory.slice(-7);
      const avgFirst = firstWeek.reduce((a, b) => a + b.p, 0) / firstWeek.length;
      const avgLast = lastWeek.reduce((a, b) => a + b.p, 0) / lastWeek.length;
      
      if (avgLast > avgFirst * 1.1) trend = 'rising';
      else if (avgLast < avgFirst * 0.9) trend = 'falling';
      
      const priceRange = Math.max(...priceHistory.map(p => p.p)) - Math.min(...priceHistory.map(p => p.p));
      volatility = priceRange > 0.2 ? 'high' : priceRange > 0.1 ? 'medium' : 'low';
    }
    
    // Build MiroFish-ready context
    return {
      mirofishContext: {
        seedDocument: {
          title: event.title,
          question: fullMarket.question,
          description: fullMarket.description,
          category: event.tags?.[0]?.label || 'General',
          tags: event.tags?.map(t => t.label) || []
        },
        marketData: {
          currentOdds: {
            yes: currentPrice,
            no: prices[1] ? parseFloat(prices[1]) : 1 - currentPrice,
            impliedProbability: {
              yes: Math.round(currentPrice * 100),
              no: Math.round((prices[1] ? parseFloat(prices[1]) : 1 - currentPrice) * 100)
            }
          },
          trading: {
            bestBid,
            bestAsk,
            spread: bestBid && bestAsk ? parseFloat((bestAsk - bestBid).toFixed(4)) : null,
            volume24h: fullMarket.volume,
            totalVolume: event.volume,
            liquidity: fullMarket.liquidity
          },
          history: {
            trend,
            volatility,
            daysOfData: Array.isArray(priceHistory) ? priceHistory.length : 0,
            high30d: Array.isArray(priceHistory) ? Math.max(...priceHistory.map(p => p.p)) : currentPrice,
            low30d: Array.isArray(priceHistory) ? Math.min(...priceHistory.map(p => p.p)) : currentPrice
          }
        },
        simulationParameters: {
          suggestedRounds: trend === 'stable' ? 30 : 40,
          suggestedPlatforms: ['parallel'],
          enableGraphMemory: true,
          notes: `${trend === 'rising' ? 'Market sentiment improving' : trend === 'falling' ? 'Market sentiment declining' : 'Stable market sentiment'}. ${volatility === 'high' ? 'High volatility expected' : 'Moderate volatility expected'}.`
        }
      },
      metadata: {
        marketId: fullMarket.id,
        conditionId: fullMarket.conditionId,
        slug: bestMatch.slug,
        tokenId,
        endDate: fullMarket.endDate,
        dataCollected: new Date().toISOString()
      }
    };
  } catch (error) {
    console.error(JSON.stringify({ error: error.message }, null, 2));
    process.exit(1);
  }
}

// CLI
const keyword = process.argv.slice(2).join(' ');

if (!keyword) {
  console.log('Usage: get-market-for-mirofish.js <keyword>');
  console.log('Example: get-market-for-mirofish.js bitcoin 100k');
  process.exit(1);
}

getMarketForMirofish(keyword).then(result => {
  console.log(JSON.stringify(result, null, 2));
});
