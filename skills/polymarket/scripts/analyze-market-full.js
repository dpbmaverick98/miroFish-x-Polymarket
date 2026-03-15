#!/usr/bin/env node
// analyze-market-full.js - Complete market snapshot for trading decisions

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

async function analyzeMarket(slug) {
  try {
    // 1. Get market details
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
    
    // 2. Get orderbook and midpoint in parallel
    const [orderbook, midpointData] = await Promise.all([
      fetchJson(`${CLOB_API}/book?token_id=${encodeURIComponent(tokenId)}`),
      fetchJson(`${CLOB_API}/midpoint?token_id=${encodeURIComponent(tokenId)}`)
    ]);
    
    // Use prices from outcomePrices as fallback
    const outcomePrices = parseOutcomePrices(market.outcomePrices);
    const currentPrice = parseFloat(midpointData.mid) || outcomePrices[0] || 0;
    
    const bestBid = orderbook.bids?.[0] ? parseFloat(orderbook.bids[0].price) : null;
    const bestAsk = orderbook.asks?.[0] ? parseFloat(orderbook.asks[0].price) : null;
    const spread = bestBid && bestAsk ? bestAsk - bestBid : null;
    
    // Calculate price change from outcomePrices history if available
    const startPrice = outcomePrices[0] || currentPrice;
    const priceChange = currentPrice - startPrice;
    const priceChangePercent = startPrice ? (priceChange / startPrice) * 100 : 0;
    
    // Determine trend from oneDay/oneWeek price changes if available
    let trend = 'stable';
    if (market.oneDayPriceChange > 0.01) trend = 'rising';
    else if (market.oneDayPriceChange < -0.01) trend = 'falling';
    
    return {
      summary: {
        question: market.question,
        slug: slug,
        category: event.tags?.[0]?.label || 'General',
        status: market.closed ? 'closed' : market.active ? 'active' : 'pending',
        endDate: market.endDate
      },
      pricing: {
        current: currentPrice,
        impliedProbability: Math.round(currentPrice * 100),
        change24h: market.oneDayPriceChange ? parseFloat((market.oneDayPriceChange * 100).toFixed(2)) : null,
        change7d: market.oneWeekPriceChange ? parseFloat((market.oneWeekPriceChange * 100).toFixed(2)) : null,
        bestBid,
        bestAsk,
        spread: spread ? parseFloat(spread.toFixed(4)) : null,
        spreadBps: spread ? Math.round(spread * 10000) : null,
        lastTradePrice: orderbook.last_trade_price ? parseFloat(orderbook.last_trade_price) : null
      },
      liquidity: {
        volume24h: market.volume24hr || market.volume,
        totalVolume: event.volume,
        liquidity: market.liquidity,
        openInterest: market.openInterest,
        bestBidSize: orderbook.bids?.[0] ? parseFloat(orderbook.bids[0].size) : null,
        bestAskSize: orderbook.asks?.[0] ? parseFloat(orderbook.asks[0].size) : null
      },
      orderbook: {
        bids: (orderbook.bids || []).slice(0, 5).map(b => ({
          price: parseFloat(b.price),
          size: parseFloat(b.size)
        })),
        asks: (orderbook.asks || []).slice(0, 5).map(a => ({
          price: parseFloat(a.price),
          size: parseFloat(a.size)
        }))
      },
      analysis: {
        liquidityScore: parseFloat(market.liquidity) > 100000 ? 'high' : parseFloat(market.liquidity) > 50000 ? 'medium' : 'low',
        spreadQuality: spread && spread < 0.01 ? 'tight' : spread && spread < 0.05 ? 'normal' : 'wide',
        tradingOpportunity: spread && spread > 0.02 ? 'arbitrage_potential' : 'standard'
      },
      tokenId
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
  console.log('Example: analyze-market-full.js microstrategy-sell-any-bitcoin-in-2025');
  process.exit(1);
}

analyzeMarket(slug).then(result => {
  console.log(JSON.stringify(result, null, 2));
});
