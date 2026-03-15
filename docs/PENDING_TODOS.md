# Pending Todos - MiroFish x Polymarket

## Polymarket Skill Issues

### 🔴 High Priority

- [ ] **Fix Data API integration**
  - Issue: Data API (`https://data-api.polymarket.com`) returns non-JSON
  - Affected: `get-prices.js`, historical price features
  - Workaround: Using `oneDayPriceChange` from Gamma API
  - Action: Monitor API status or find alternative endpoint

- [ ] **Fix active markets filter**
  - Issue: `?active=true&closed=false` returns empty array
  - Affected: `list-active.js`, `find-opportunities.js`
  - Workaround: Use `search-markets.js` with keywords
  - Action: Test different query parameters or report to Polymarket

- [ ] **Handle markets without orderbooks**
  - Issue: Many markets have token IDs but no CLOB orderbook
  - Affected: All slug-based compound scripts
  - Current: Returns error "No orderbook exists"
  - Action: Add graceful fallback, use Gamma prices when CLOB unavailable

### 🟡 Medium Priority

- [ ] **Add caching for API calls**
  - Cache Gamma market data for 60 seconds
  - Cache CLOB orderbook for 30 seconds
  - Reduces API calls and improves performance

- [ ] **Add retry logic with exponential backoff**
  - Handle transient network failures
  - Max 3 retries with 1s, 2s, 4s delays

- [ ] **Create market discovery helper**
  - Find markets with active orderbooks
  - Filter by minimum liquidity threshold
  - Useful for `find-opportunities.js`

### 🟢 Low Priority

- [ ] **Add WebSocket support for real-time data**
  - CLOB API may support WebSocket connections
  - Better than polling for `watch-market.js`

- [ ] **Add trading functionality**
  - Requires authentication (private key)
  - Create orders, cancel orders
  - Higher complexity, lower priority

- [ ] **Add more compound scripts**
  - `get-all-markets.js`: Bulk fetch with pagination
  - `export-to-csv.js`: Export market data
  - `price-alerts.js`: Notify on price thresholds

---

## Documentation

- [ ] Add error handling guide
- [ ] Add rate limiting documentation
- [ ] Create troubleshooting FAQ
- [ ] Add screenshots of working script outputs

---

## Testing

- [ ] Create test suite with mock API responses
- [ ] Add integration tests for each script
- [ ] Test with different market types (sports, politics, crypto)
- [ ] Verify all scripts handle edge cases (empty results, errors)

---

## MiroFish Integration

- [ ] Create data bridge script
  - Convert Polymarket data to MiroFish seed format
  - Auto-upload to MiroFish API

- [ ] Add prediction comparison
  - Compare MiroFish simulation results to market prices
  - Calculate edge automatically

- [ ] Create monitoring dashboard
  - Track multiple markets
  - Alert on significant price movements
  - Log predictions vs outcomes

---

## Obul API Skills

- [ ] Test all installed Obul skills
  - obul-twit
  - obul-clawapi-x
  - obul-ortho-exa
  - obul-sybil
  - obul-x402endpoints-firecrawl
  - obul-stableenrich-firecrawl

- [ ] Create compound workflows
  - Search Twitter + Polymarket sentiment analysis
  - Web scrape news + compare to market odds

---

## Repository Maintenance

- [ ] Add CI/CD for automated testing
- [ ] Add linting (ESLint) for scripts
- [ ] Add pre-commit hooks
- [ ] Create release tags

---

## Blocked / Waiting

- [ ] **Data API fix** - Waiting for Polymarket
- [ ] **Active markets filter** - Waiting for Polymarket
- [ ] **OBUL_API_KEY setup** - Need user to configure

---

## Completed ✅

- [x] Create Polymarket skill with 8 single-call scripts
- [x] Create 5 compound scripts
- [x] Create 3 slug-based compound scripts
- [x] Fix get-market.js to extract clobTokenIds
- [x] Fix list-active.js array handling
- [x] Fix compound scripts to skip Data API
- [x] Test all scripts and document status
- [x] Create tested API reference documentation
- [x] Install 7 Obul API skills

---

## Notes

- Gamma API is stable and working
- CLOB API works but many markets lack orderbooks
- Data API is currently unreliable - avoid for production
- Token IDs are in `clobTokenIds` JSON string, not `tokens` array
- Use `oneDayPriceChange` and `oneWeekPriceChange` for price history
