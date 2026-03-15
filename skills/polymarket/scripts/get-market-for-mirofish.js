#!/usr/bin/env node
// get-market-for-mirofish.js - Gather complete context for MiroFish simulation seed

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

function parseOutcomePrices(pricesJson) {
  try {
    return JSON.parse(pricesJson);
  } catch {
    return [];
  }
}

function parseClobTokenIds(clobTokenIdsJson) {
  try {
    return JSON.parse(clobTokenIdsJson);
  } catch {
    return [];
  }
}

async function getMarketForMirofish(keyword) {
  try {
    // 1. Search for markets
    const searchResults = await fetchJson(
      `${GAMMA_API}/events?active=true&closed=false&search=${encodeURIComponent(keyword)}&limit=5`
    );
    
    const events = Array.isArray(searchResults) ? searchResults : (searchResults.data || []);
    
    if (!events.length) {
      throw new Error(`No markets found for keyword: ${keyword}`);
    }
    
    // Pick best match (highest volume)
    const bestMatch = events.sort((a, b) => {
      const volA = parseFloat(a.markets?.[0]?.volume) || 0;
      const volB = parseFloat(b.markets?.[0]?.volume) || 0;
      return volB - volA;
    })[0];
    
    const market = bestMatch.markets?.[0];
    const clobTokenIds = parseClobTokenIds(market.clobTokenIds);
    const tokenId = clobTokenIds[0];
    
    // 2. Get orderbook if token available
    let orderbook = null;
    if (tokenId) {
      try {
        orderbook = await fetchJson(`${CLOB_API}/book?token_id=${encodeURIComponent(tokenId)}`);
      } catch {}
    }
    
    // Parse prices
    const prices = parseOutcomePrices(market.outcomePrices);
    const currentPrice = prices[0] ? parseFloat(prices[0]) : 0;
    
    const bestBid = orderbook?.bids?.[0] ? parseFloat(orderbook.bids[0].price) : null;
    const bestAsk = orderbook?.asks?.[0] ? parseFloat(orderbook.asks[0].price) : null;
    
    // Determine trend
    let trend = 'stable';
    if (market.oneDayPriceChange > 0.01) trend = 'rising';
    else if (market.oneDayPriceChange < -0.01) trend = 'falling';
    
    let volatility = 'low';
    if (Math.abs(market.oneWeekPriceChange || 0) > 0.1) volatility = 'high';
    else if (Math.abs(market.oneWeekPriceChange || 0) > 0.05) volatility = 'medium';
    
    // Build MiroFish-ready context
    return {
      mirofishContext: {
        seedDocument: {
          title: bestMatch.title,
          question: market.question,
          description: market.description,
          category: bestMatch.tags?.[0]?.label || 'General',
          tags: bestMatch.tags?.map(t => t.label) || []
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
            volume24h: market.volume24hr || market.volume,
            totalVolume: bestMatch.volume,
            liquidity: market.liquidity
          },
          history: {
            trend,
            volatility,
            change24h: market.oneDayPriceChange ? parseFloat((market.oneDayPriceChange * 100).toFixed(2)) : null,
            change7d: market.oneWeekPriceChange ? parseFloat((market.oneWeekPriceChange * 100).toFixed(2)) : null
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
        marketId: market.id,
        conditionId: market.conditionId,
        slug: bestMatch.slug,
        tokenId,
        endDate: market.endDate,
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
  console.log('Example: get-market-for-mirofish.js bitcoin');
  process.exit(1);
}

getMarketForMirofish(keyword).then(result => {
  console.log(JSON.stringify(result, null, 2));
});
