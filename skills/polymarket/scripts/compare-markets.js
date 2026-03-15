#!/usr/bin/env node
// compare-markets.js - Compare related prediction markets

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

async function getMarketSummary(slug) {
  const event = await fetchJson(`${GAMMA_API}/events/slug/${encodeURIComponent(slug)}`);
  const market = event.markets?.[0];
  
  if (!market) return null;
  
  const yesToken = market.tokens?.find(t => t.outcome === 'Yes');
  let currentPrice = null;
  
  if (yesToken?.token_id) {
    try {
      const midpoint = await fetchJson(`${CLOB_API}/midpoint?token_id=${encodeURIComponent(yesToken.token_id)}`);
      currentPrice = midpoint.mid;
    } catch {}
  }
  
  // Parse outcome prices as fallback
  if (!currentPrice) {
    try {
      const prices = JSON.parse(market.outcomePrices || '[]');
      currentPrice = parseFloat(prices[0]) || 0;
    } catch {
      currentPrice = 0;
    }
  }
  
  return {
    question: market.question,
    slug,
    category: event.tags?.[0]?.label || 'General',
    currentPrice: parseFloat(currentPrice.toFixed(4)),
    impliedProbability: Math.round(currentPrice * 100),
    volume24h: market.volume,
    liquidity: market.liquidity,
    endDate: market.endDate,
    status: event.closed ? 'closed' : event.active ? 'active' : 'pending',
    tokenId: yesToken?.token_id
  };
}

async function compareMarkets(slugs) {
  try {
    // Fetch all markets
    const markets = [];
    for (const slug of slugs) {
      try {
        const market = await getMarketSummary(slug);
        if (market) markets.push(market);
      } catch (e) {
        console.error(JSON.stringify({ warning: `Failed to fetch ${slug}: ${e.message}` }));
      }
    }
    
    if (markets.length < 2) {
      throw new Error('Need at least 2 valid markets to compare');
    }
    
    // Calculate statistics
    const prices = markets.map(m => m.currentPrice);
    const avgPrice = prices.reduce((a, b) => a + b, 0) / prices.length;
    const maxPrice = Math.max(...prices);
    const minPrice = Math.min(...prices);
    const priceRange = maxPrice - minPrice;
    
    // Calculate correlations (simplified)
    const volumes = markets.map(m => parseFloat(m.volume24h) || 0);
    const avgVolume = volumes.reduce((a, b) => a + b, 0) / volumes.length;
    
    // Rank by various metrics
    const byPrice = [...markets].sort((a, b) => b.currentPrice - a.currentPrice);
    const byVolume = [...markets].sort((a, b) => parseFloat(b.volume24h) - parseFloat(a.volume24h));
    const byLiquidity = [...markets].sort((a, b) => parseFloat(b.liquidity) - parseFloat(a.liquidity));
    
    // Find price gaps (potential arbitrage or related opportunities)
    const gaps = [];
    for (let i = 0; i < markets.length; i++) {
      for (let j = i + 1; j < markets.length; j++) {
        const diff = Math.abs(markets[i].currentPrice - markets[j].currentPrice);
        const avg = (markets[i].currentPrice + markets[j].currentPrice) / 2;
        const diffPercent = avg > 0 ? (diff / avg) * 100 : 0;
        
        if (diffPercent > 10) { // Only significant gaps
          gaps.push({
            marketA: markets[i].slug,
            marketB: markets[j].slug,
            priceA: markets[i].currentPrice,
            priceB: markets[j].currentPrice,
            difference: parseFloat(diff.toFixed(4)),
            differencePercent: parseFloat(diffPercent.toFixed(2)),
            interpretation: diffPercent > 30 ? 'large_discrepancy' : diffPercent > 20 ? 'moderate_gap' : 'small_variance'
          });
        }
      }
    }
    
    return {
      comparison: {
        marketsCompared: markets.length,
        timestamp: new Date().toISOString()
      },
      statistics: {
        averagePrice: parseFloat(avgPrice.toFixed(4)),
        averageImpliedProbability: Math.round(avgPrice * 100),
        priceRange: parseFloat(priceRange.toFixed(4)),
        highestPrice: { slug: byPrice[0].slug, price: byPrice[0].currentPrice },
        lowestPrice: { slug: byPrice[byPrice.length - 1].slug, price: byPrice[byPrice.length - 1].currentPrice },
        totalVolume24h: volumes.reduce((a, b) => a + b, 0).toFixed(2),
        averageVolume24h: avgVolume.toFixed(2)
      },
      rankings: {
        byPrice: byPrice.map((m, i) => ({ rank: i + 1, slug: m.slug, price: m.currentPrice, probability: m.impliedProbability })),
        byVolume: byVolume.map((m, i) => ({ rank: i + 1, slug: m.slug, volume24h: m.volume24h })),
        byLiquidity: byLiquidity.map((m, i) => ({ rank: i + 1, slug: m.slug, liquidity: m.liquidity }))
      },
      priceGaps: gaps.sort((a, b) => b.differencePercent - a.differencePercent),
      markets: markets.map(m => ({
        question: m.question,
        slug: m.slug,
        category: m.category,
        currentPrice: m.currentPrice,
        impliedProbability: m.impliedProbability,
        volume24h: m.volume24h,
        liquidity: m.liquidity,
        endDate: m.endDate,
        status: m.status
      }))
    };
  } catch (error) {
    console.error(JSON.stringify({ error: error.message }, null, 2));
    process.exit(1);
  }
}

// CLI
const slugs = process.argv.slice(2).filter(arg => !arg.startsWith('--'));

if (slugs.length < 2) {
  console.log('Usage: compare-markets.js <slug1> <slug2> [slug3...]');
  console.log('Example: compare-markets.js will-bitcoin-hit-100k-2025 will-bitcoin-hit-150k-2025');
  process.exit(1);
}

compareMarkets(slugs).then(result => {
  console.log(JSON.stringify(result, null, 2));
});
