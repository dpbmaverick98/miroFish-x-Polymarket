---
name: obul-twit
description: 'USE THIS SKILL WHEN: the user wants to search X/Twitter, look up a Twitter
  user profile, read a specific tweet, browse a user''s timeline, explore communities,
  or check followers/following. Provides pay-per-use X/Twitter data through the Obul
  proxy.'
endpoints:
- path: /users/by/username
  method: GET
  price: $0.005
  description: User profile by username
- path: /users/by/id
  method: GET
  price: $0.005
  description: User profile by numeric ID
- path: /users/search
  method: GET
  price: $0.01
  description: Search users by keyword
- path: /users/followers
  method: GET
  price: $0.01
  description: User's followers (paginated)
- path: /users/following
  method: GET
  price: $0.01
  description: Accounts a user follows (paginated)
- path: /users
  method: GET
  price: $0.01
  description: Bulk lookup up to 50 users
- path: /tweets/by/id
  method: GET
  price: $0.0025
  description: Single tweet by ID
- path: /tweets/user
  method: GET
  price: $0.01
  description: User's recent tweets
- path: /tweets/search
  method: GET
  price: $0.01
  description: Full-archive tweet search with filters
- path: /tweets
  method: GET
  price: $0.01
  description: Bulk lookup up to 50 tweets
- path: /tweets/replies
  method: GET
  price: $0.01
  description: Replies to a tweet
- path: /tweets/quote_tweets
  method: GET
  price: $0.01
  description: Quote tweets for a tweet
- path: /tweets/retweeted_by
  method: GET
  price: $0.01
  description: Users who reposted a tweet
- path: /communities/by/id
  method: GET
  price: $0.0025
  description: Community details
- path: /communities/posts
  method: GET
  price: $0.01
  description: Community top posts
- path: /communities/members
  method: GET
  price: $0.01
  description: Community members with roles
metadata:
  obul-skill:
    emoji: 🐦
    requires:
      env:
      - OBUL_API_KEY
    primaryEnv: OBUL_API_KEY
registries: {}
provider: twit
---

# Twit

Twit's x402 API provides pay-per-use access to X/Twitter data — search tweets with advanced filters, look up user
profiles, read individual tweets, browse timelines, explore communities, and check followers/following. No X/Twitter API
key or developer account required — each request is paid individually through the Obul proxy.

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

**Base URL:** `https://proxy.obul.ai/proxy/https/x402.twit.sh`

## Common Operations

### Search Tweets

Full-archive tweet search with advanced filters. Supports keywords, phrases, hashtags, user filters, engagement
minimums, and date ranges.

**Pricing:** $0.01

```json
{
  "method": "GET",
  "url": "https://proxy.obul.ai/proxy/https/x402.twit.sh/tweets/search?words=bitcoin&since=2026-03-01",
  "headers": {
    "Content-Type": "application/json",
    "x-obul-api-key": "{{OBUL_API_KEY}}"
  }
}
```

**Response:** Array of tweet objects matching the query, each with tweet text, author info, engagement metrics (likes,
retweets, replies), and timestamps. Includes `next_token` for pagination.

### Get User Profile

Fetch a public X/Twitter profile by username, including bio, follower and following counts, and avatar.

**Pricing:** $0.005

```json
{
  "method": "GET",
  "url": "https://proxy.obul.ai/proxy/https/x402.twit.sh/users/by/username?username=elonmusk",
  "headers": {
    "Content-Type": "application/json",
    "x-obul-api-key": "{{OBUL_API_KEY}}"
  }
}
```

**Response:** JSON object with the user's display name, username, bio, follower count, following count, tweet count, and
profile image URL.

### Get Tweet

Retrieve a single tweet by its ID, including full text, author info, and engagement metrics.

**Pricing:** $0.0025

```json
{
  "method": "GET",
  "url": "https://proxy.obul.ai/proxy/https/x402.twit.sh/tweets/by/id?id=1234567890",
  "headers": {
    "Content-Type": "application/json",
    "x-obul-api-key": "{{OBUL_API_KEY}}"
  }
}
```

**Response:** JSON object with the tweet's full text, author details, engagement metrics (likes, retweets, replies,
views), timestamp, and any media attachments.

### Get User Tweets

Fetch recent tweets from a specific user's timeline by username.

**Pricing:** $0.01

```json
{
  "method": "GET",
  "url": "https://proxy.obul.ai/proxy/https/x402.twit.sh/tweets/user?username=vitalikbuterin",
  "headers": {
    "Content-Type": "application/json",
    "x-obul-api-key": "{{OBUL_API_KEY}}"
  }
}
```

**Response:** Array of the user's recent tweets, each with tweet text, engagement metrics, and timestamps. Use
`next_token` from the response to paginate through additional results.

### Get Tweet Replies

Retrieve replies to a specific tweet by its ID.

**Pricing:** $0.01

```json
{
  "method": "GET",
  "url": "https://proxy.obul.ai/proxy/https/x402.twit.sh/tweets/replies?id=1234567890",
  "headers": {
    "Content-Type": "application/json",
    "x-obul-api-key": "{{OBUL_API_KEY}}"
  }
}
```

**Response:** Array of reply tweets, each with tweet text, author info, engagement metrics, and timestamps. Use
`next_token` to paginate.

### Get List Members

Get members of a Twitter list by list ID.

**Pricing:** $0.01

```json
{
  "method": "GET",
  "url": "https://proxy.obul.ai/proxy/https/x402.twit.sh/lists/members?id=1234567890",
  "headers": {
    "Content-Type": "application/json",
    "x-obul-api-key": "{{OBUL_API_KEY}}"
  }
}
```

**Response:** Array of list members with their roles (Admin, Moderator, Member). Paginated.

### Get List Tweets

Get tweets from a Twitter list by list ID.

**Pricing:** $0.01

```json
{
  "method": "GET",
  "url": "https://proxy.obul.ai/proxy/https/x402.twit.sh/lists/tweets?id=1234567890",
  "headers": {
    "Content-Type": "application/json",
    "x-obul-api-key": "{{OBUL_API_KEY}}"
  }
}
```

**Response:** Array of tweets from list members. Paginated.

## Search Parameters

The `/tweets/search` endpoint supports these query parameters:

| Parameter     | Description                                      |
|---------------|--------------------------------------------------|
| `words`       | Match any of these words                         |
| `phrase`      | Exact phrase match                               |
| `anyWords`    | Match any of a set of words (OR logic)           |
| `noneWords`   | Exclude tweets containing these words            |
| `hashtags`    | Filter by hashtags                               |
| `from`        | Tweets from a specific user                      |
| `to`          | Tweets directed at a specific user               |
| `mentioning`  | Tweets mentioning a specific user                |
| `minReplies`  | Minimum number of replies                        |
| `minLikes`    | Minimum number of likes                          |
| `minReposts`  | Minimum number of reposts                        |
| `since`       | Start date (YYYY-MM-DD)                          |
| `until`       | End date (YYYY-MM-DD)                            |
| `next_token`  | Pagination token from previous response          |

## When to Use

- **Real-time tweet search** — Find tweets about a topic, token, event, or person with advanced filters and date ranges.
- **User research** — Look up public profiles to check follower counts, bios, and recent activity.
- **Individual tweet lookup** — Read a specific tweet's full text and engagement metrics by ID.
- **Timeline monitoring** — Track what specific accounts are posting by browsing their recent tweets.
- **Conversation threading** — Get all replies and quote tweets for a specific tweet.
- **Community analysis** — Explore X/Twitter communities, their posts, and member lists.
- **Follower/following analysis** — Check who follows a user or who they follow.
- **Bulk data retrieval** — Look up up to 50 users or tweets in a single request.
- **AI agent social monitoring** — Give autonomous agents on-demand access to X/Twitter data at a predictable per-call
  cost.

## Best Practices

- **Use advanced search filters** — Combine `words`, `phrase`, `from`, `minLikes`, and date ranges for precise results
  instead of broad keyword searches.
- **Paginate with next_token** — All list endpoints return a `next_token` when more results are available. Pass it as a
  query parameter to fetch the next page.
- **Use bulk endpoints** — When looking up multiple users or tweets, use `GET /users` or `GET /tweets` with comma-
  separated IDs instead of making individual requests.
- **Cache profile data** — User profiles don't change frequently. Cache profile lookups to reduce costs when freshness
  isn't critical.
- **Filter by engagement** — Use `minLikes`, `minReplies`, and `minReposts` to surface high-signal tweets and filter
  out noise.
- **For errors** — See @skills/obul-api-errors/SKILL.md for complete error code reference and troubleshooting
