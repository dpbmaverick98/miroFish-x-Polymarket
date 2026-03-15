#!/usr/bin/env node
// analyze-market-full.js - Complete market snapshot for trading decisions

const https = require('https');

const GAMMA_API = 'https://gamma-api.polymarket.com';
const CLOB_API = 'https://clob.polymarket.com';
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

function parseOutcomePrices(pricesJson) {
  try {
    return JSON.parse(pricesJson);
  } catch {
    return [];
  }
}

async function analyzeMarket(slug) {
  try {
    // 1. Get market details
    const marketUrl = `${GAMMA_API}/events/slug/${encodeURIComponent(slug)}`;
    const event = await fetchJson(marketUrl);
    const market = event.markets?.[0];
    
    if (!market) {
      throw new Error('Market not found');
    }
    
    const yesToken = market.tokens?.find(t => t.outcome === 'Yes');
    const tokenId = yesToken?.token_id;
    
    // 2. Get orderbook
    const orderbookUrl = `${CLOB_API}/book?token_id=${encodeURIComponent(tokenId)}`;
    const orderbook = await fetchJson(orderbookUrl);
    
    // 3. Get midpoint
    const midpointUrl = `${CLOB_API}/midpoint?token_id=${encodeURIComponent(tokenId)}`;
    const midpointData = await fetchJson(midpointUrl);
    
    // 4. Get 7-day price history
    const endTs = Math.floor(Date.now() / 1000);
    const startTs = endTs - (7 * 24 * 60 * 60);
    const pricesUrl = `${DATA_API}/prices-history?market=${encodeURIComponent(market.conditionId)}&startTs=${startTs}&endTs=${endTs}&fidelity=1d`;
    const prices = await fetchJson(pricesUrl);
    
    // Clean and structure the output
    const pricesParsed = Array.isArray(prices) ? prices : [];
    const currentPrice = midpointData.mid || parseOutcomePrices(market.outcomePrices)[0] || 0;
    const startPrice = pricesParsed[0]?.p || currentPrice;
    const priceChange = currentPrice - startPrice;
    const priceChangePercent = startPrice ? (priceChange / startPrice) * 100 : 0;
    
    const bestBid = orderbook.bids?.[0] ? parseFloat(orderbook.bids[0].price) : null;
    const bestAsk = orderbook.asks?.[0] ? parseFloat(orderbook.asks[0].price) : null;
    const spread = bestBid && bestAsk ? bestAsk - bestBid : null;
    
    // Calculate trend direction
    let trend = 'stable';
    if (pricesParsed.length >= 3) {
      const recent = pricesParsed.slice(-3);
      const avgRecent = recent.reduce((a, b) => a + b.p, 0) / recent.length;
      const older = pricesParsed.slice(0, Math.min(3, pricesParsed.length));
      const avgOlder = older.reduce((a, b) => a + b.p, 0) / older.length;
      trend = avgRecent > avgOlder * 1.05 ? 'rising' : avgRecent < avgOlder * 0.95 ? 'falling' : 'stable';
    }
    
    return {
      summary: {
        question: market.question,
        slug: slug,
        category: event.tags?.[0]?.label || 'General',
        status: event.closed ? 'closed' : event.active ? 'active' : 'pending',
        endDate: market.endDate
      },
      pricing: {
        current: currentPrice,
        impliedProbability: Math.round(currentPrice * 100),
        change7d: {
          absolute: parseFloat(priceChange.toFixed(4)),
          percent: parseFloat(priceChangePercent.toFixed(2))
        },
        trend,
        bestBid,
        bestAsk,
        spread: spread ? parseFloat(spread.toFixed(4)) : null,
        spreadBps: spread ? Math.round(spread * 10000) : null
      },
      liquidity: {
        volume24h: market.volume,
        totalVolume: event.volume,
        liquidity: market.liquidity,
        bestBidSize: orderbook.bids?.[0] ? parseFloat(orderbook.bids[0].size) : null,
        bestAskSize: orderbook.asks?.[0] ? parseFloat(orderbook.asks[0].size) : null
      },
      tokens: {
        yes: {
          tokenId: yesToken?.token_id,
          price: yesToken?.price
        },
        no: {
          tokenId: market.tokens?.find(t => t.outcome === 'No')?.token_id,
          price: market.tokens?.find(t => t.outcome === 'No')?.price
        }
      },
      history: {
        dataPoints: pricesParsed.length,
        high7d: pricesParsed.length ? Math.max(...pricesParsed.map(p => p.p)) : currentPrice,
        low7d: pricesParsed.length ? Math.min(...pricesParsed.map(p => p.p)) : currentPrice
      },
      analysis: {
        liquidityScore: parseFloat(market.liquidity) > 100000 ? 'high' : parseFloat(market.liquidity) > 50000 ? 'medium' : 'low',
        volatility: Math.abs(priceChangePercent) > 20 ? 'high' : Math.abs(priceChangePercent) > 10 ? 'medium' : 'low',
        tradingOpportunity: spread && spread > 0.02 ? 'wide_spread' : spread && spread < 0.005 ? 'tight_spread' : 'normal'
      }
    };
  } catch (error) {
    console.error(JSON.stringify({ error: error.message }, null, 2));
    process.exit(1);
  }
}

// CLI
const slug = process.argv[2];

if (!slug) {
  console.log('Usage: analyze-market-full.js <slug>');
  console.log('Example: analyze-market-full.js will-bitcoin-hit-100k-2025');
  process.exit(1);
}

analyzeMarket(slug).then(result => {
  console.log(JSON.stringify(result, null, 2));
});
