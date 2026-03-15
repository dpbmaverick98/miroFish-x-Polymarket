---
name: obul-clawapi-x
description: 'USE THIS SKILL WHEN: the user wants to access X/Twitter API data including
  tweets, users, timelines, search, communities, and direct messages through ClawAPIs.
  Provides pay-per-use X/Twitter data via x402 through the Obul proxy.'
endpoints:
- path: /x/2/tweets/search/recent
  method: GET
  price: $0.01
  description: Search recent tweets
- path: /x/2/tweets/:id
  method: GET
  price: $0.01
  description: Get tweet by ID
- path: /x/2/users/by/username/:username
  method: GET
  price: $0.01
  description: Get user profile by username
- path: /x/2/users/:id
  method: GET
  price: $0.01
  description: Get user profile by ID
- path: /x/2/users/:id/tweets
  method: GET
  price: $0.01
  description: Get user's recent tweets
- path: /x/2/users/:id/followers
  method: GET
  price: $0.01
  description: Get user's followers
- path: /x/2/users/:id/following
  method: GET
  price: $0.01
  description: Get accounts user follows
- path: /x/2/tweets
  method: POST
  price: $0.05
  description: Post a new tweet (OAuth required)
- path: /x/2/users/:id/following
  method: POST
  price: $0.05
  description: Follow a user (OAuth required)
- path: /x/2/tweets/:id/likes
  method: POST
  price: $0.05
  description: Like a tweet (OAuth required)
- path: /x/2/tweets/:id/retweeted_by
  method: GET
  price: $0.01
  description: Get users who retweeted
metadata:
  obul-skill:
    emoji: 🐦
    requires:
      env:
      - OBUL_API_KEY
    primaryEnv: OBUL_API_KEY
registries: {}
provider: clawapis
---

# ClawAPI X

Access X/Twitter data through ClawAPIs — search tweets, lookup users, browse timelines, explore communities, and manage interactions. Each request is paid individually through the Obul proxy with no X API key or developer account required.

## Authentication

All requests route through the Obul proxy. Include your Obul API key in every request:

```json
{
  "headers": {
    "Content-Type": "application/json",
    "x-obul-api-key": "{{OBUL_API_KEY}}"
  }
}
```

**Base URL:** `https://proxy.obul.ai/proxy/https/clawapis.com`

## Common Operations

### Search Tweets

Search recent tweets with keywords, phrases, hashtags, and filters.

**Pricing:** $0.01

```json
{
  "method": "GET",
  "url": "https://proxy.obul.ai/proxy/https/clawapis.com/x/2/tweets/search/recent?query=bitcoin&lang=en&max_results=10",
  "headers": {
    "Content-Type": "application/json",
    "x-obul-api-key": "{{OBUL_API_KEY}}"
  }
}
```

**Response:** Array of tweet objects with text, author info, engagement metrics (likes, retweets, replies), and timestamps.

### Get User Profile

Fetch a public X/Twitter profile by username with bio and metrics.

**Pricing:** $0.01

```json
{
  "method": "GET",
  "url": "https://proxy.obul.ai/proxy/https/clawapis.com/x/2/users/by/username/elonmusk?user.fields=description,public_metrics",
  "headers": {
    "Content-Type": "application/json",
    "x-obul-api-key": "{{OBUL_API_KEY}}"
  }
}
```

**Response:** JSON object with display name, username, bio, follower count, following count, tweet count, and profile image URL.

### Get Tweet

Retrieve a single tweet by ID with full content and engagement data.

**Pricing:** $0.01

```json
{
  "method": "GET",
  "url": "https://proxy.obul.ai/proxy/https/clawapis.com/x/2/tweets/123456789",
  "headers": {
    "Content-Type": "application/json",
    "x-obul-api-key": "{{OBUL_API_KEY}}"
  }
}
```

**Response:** JSON object with tweet text, author details, engagement metrics (likes, retweets, replies, views), timestamp, and media attachments.

### Get User Tweets

Fetch recent tweets from a specific user's timeline.

**Pricing:** $0.01

```json
{
  "method": "GET",
  "url": "https://proxy.obul.ai/proxy/https/clawapis.com/x/2/users/123456789/tweets?max_results=10",
  "headers": {
    "Content-Type": "application/json",
    "x-obul-api-key": "{{OBUL_API_KEY}}"
  }
}
```

**Response:** Array of recent tweets with text, engagement metrics, and timestamps. Use `pagination_token` to fetch older tweets.

### Get User Followers

Get a list of users who follow a specific account.

**Pricing:** $0.01

```json
{
  "method": "GET",
  "url": "https://proxy.obul.ai/proxy/https/clawapis.com/x/2/users/123456789/followers?max_results=100",
  "headers": {
    "Content-Type": "application/json",
    "x-obul-api-key": "{{OBUL_API_KEY}}"
  }
}
```

**Response:** Array of user objects with profile data and pagination token for more results.

### Post Tweet (OAuth Required)

Post a new tweet. Requires OAuth2 authentication via `X-Session-Id` or `X-User-Token` header.

**Pricing:** $0.05

```json
{
  "method": "POST",
  "url": "https://proxy.obul.ai/proxy/https/clawapis.com/x/2/tweets",
  "headers": {
    "Content-Type": "application/json",
    "x-obul-api-key": "{{OBUL_API_KEY}}",
    "X-Session-Id": "YOUR_OAUTH_SESSION_ID"
  },
  "body": {
    "text": "Hello from my agent!"
  }
}
```

**Response:** Posted tweet object with ID and text.

## Search Query Parameters

The `/x/2/tweets/search/recent` endpoint supports these query parameters:

| Parameter       | Description                                      |
|-----------------|--------------------------------------------------|
| `query`         | Search query (keywords, phrases, operators)      |
| `max_results`   | Number of tweets to return (10-100)              |
| `start_time`    | Start date (ISO 8601)                            |
| `end_time`      | End date (ISO 8601)                              |
| `tweet.fields`  | Fields to include (created_at,author_id,etc)     |
| `user.fields`   | User fields to include (public_metrics,etc)      |
| `next_token`    | Pagination token for next page                   |

**Search Operators:**
- `from:username` — Tweets from specific user
- `to:username` — Tweets mentioning specific user
- `#hashtag` — Filter by hashtag
- `"exact phrase"` — Exact phrase match
- `-keyword` — Exclude keyword

## When to Use

- **Real-time tweet search** — Find tweets about topics, tokens, or events with advanced query operators
- **User profile lookup** — Get public profile info, follower counts, and bio data
- **Timeline monitoring** — Track what specific accounts are posting
- **Social media research** — Analyze tweet engagement and user metrics
- **Content discovery** — Find tweets by keywords, hashtags, or date ranges
- **Community management** — Monitor mentions, replies, and follower growth
- **AI agent integration** — Give agents autonomous access to X/Twitter data at predictable per-call cost

## Best Practices

- **Use search operators** — Combine `from:`, `#hashtag`, `"phrases"` for precise results
- **Paginate with next_token** — All list endpoints return a token for fetching more results
- **Filter by fields** — Use `tweet.fields` and `user.fields` to get only the data you need
- **Cache user profiles** — Profile data doesn't change frequently; cache to reduce costs
- **OAuth for writes** — Reading public data needs no auth; posting/liking requires OAuth session
- **For errors** — See @skills/obul-api-errors/SKILL.md for complete error code reference and troubleshooting
