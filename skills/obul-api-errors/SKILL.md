---
name: obul-api-errors
description: Reference guide for HTTP error codes returned by the Obul proxy. Use
  to understand error causes and solutions when API requests fail.
metadata:
  obul-skill:
    emoji: ⚠️
    requires:
      env:
      - OBUL_API_KEY
    primaryEnv: OBUL_API_KEY
registries: {}
provider: dynamic
---

# API Errors

Comprehensive reference for HTTP error responses from the Obul proxy. Understand error codes, diagnose issues, and resolve failures quickly.

## Authentication

All error responses include standard HTTP status codes and JSON error bodies. Include your Obul API key in all requests:

```json
{
  "headers": {
    "Content-Type": "application/json",
    "x-obul-api-key": "{{OBUL_API_KEY}}"
  }
}
```

**Base URL:** `https://proxy.obul.ai/proxy/{scheme}/{host}`

## Common Operations

### Interpret Error Response

Parse an Obul error response to understand the cause and recommended fix.

**Pricing:** $0.00

```json
{
  "method": "GET",
  "url": "https://proxy.obul.ai/proxy/https/example.com/api/endpoint",
  "headers": {
    "Content-Type": "application/json",
    "x-obul-api-key": "{{OBUL_API_KEY}}"
  }
}
```

**Response:** Error response includes `code`, `message`, and context fields:

```json
{
  "error": {
    "code": "payment_required",
    "message": "Account missing billing state or default payment case",
    "pending_cents": 150,
    "limit_cents": 1000
  }
}
```

### Check Error Code Reference

Look up error codes by HTTP status to diagnose failures.

**Pricing:** $0.00

Reference this skill to decode any error response from Obul proxy requests.

## Error Codes by Status

### 400 Bad Request

| Code | Message | Cause |
|------|---------|-------|
| `invalid_headers` | Header preparation fails for upstream request | Proxy unable to forward headers |
| `invalid_requirements` | Invalid payment requirements received from upstream service | Upstream returns unparseable 402 requirements |

### 401 Unauthorized

| Code | Message | Cause |
|------|---------|-------|
| `unauthorized` | Invalid or missing authentication credentials | Missing or invalid claims in request |
| `invalid_token` | Token expired or invalid. Please refresh your token | Expired or invalid JWT |
| `jwks_unavailable` | Auth service unreachable for key validation | JWKS endpoint unreachable |

### 402 Payment Required

| Code | Message | Cause |
|------|---------|-------|
| `payment_required` | Account missing billing state or default payment case | No billing setup or payment method |
| `spend_limit_exceeded` | Account over spending limit (reason: over_limit) | Account exceeded configured limit |

### 403 Forbidden

| Code | Message | Cause |
|------|---------|-------|
| `endpoint_not_allowed` | Invalid scheme/host validation | Requested endpoint not in allowlist |
| `policy_violation` | Request violates account policy limits | Claims do not allow requested host |
| `payment_method_required` | Payment method required | No payment method on account |
| `spend_limit_exceeded` | Spend limit exceeded | Account limit exceeded |

### 404 Not Found

| Code | Message | Cause |
|------|---------|-------|
| `not_found` | Resource not found | Wallet screening blocked (sanctioned, invalid address, or config blocklist) |

### 408 Request Timeout

| Code | Message | Cause |
|------|---------|-------|
| `request_timeout` | Request timeout | Client request body read idle timeout |

### 413 Payload Too Large

| Code | Message | Cause |
|------|---------|-------|
| `body_too_large` | Body too large | Request body exceeds `max_request_body_bytes` |

### 429 Too Many Requests

| Code | Message | Cause |
|------|---------|-------|
| `upstream_rate_limit` | Rate limited by upstream service | Upstream service returned 429 |

### 500 Internal Server Error

| Code | Message | Cause |
|------|---------|-------|
| `something_went_wrong` | Something went wrong | Catch-all internal error |
| `misconfigured_upstream` | Upstream configuration error | Bad upstream configuration |
| `wallet_screening_failed` | Wallet screening failed | Screening API error (fail-closed) |

### 502 Bad Gateway

| Code | Message | Cause |
|------|---------|-------|
| `upstream_unavailable` | Upstream unavailable | DNS resolution fails or upstream unreachable |
| `upstream_body_error` | Upstream body error | Error reading client request body |
| `accounts_service_unavailable` | Accounts API was unable to be reached | Accounts API is down |
| `upstream_invalid_requirements` | Invalid payment requirements from upstream | Upstream returns malformed 402 requirements |
| `payment_failed` | Failed to process payment for this request | Payment build/signing failed |
| `proxy_error` | Proxy error | Response builder fails constructing proxy response |

### 503 Service Unavailable

| Code | Message | Cause |
|------|---------|-------|
| `payment_unavailable` | Payment failed: insufficient funds in Obul | Obul wallet has insufficient funds |
| `payment_unavailable` | Payment processing unavailable | Payment system temporarily down |

## When to Use

- **Debugging failures** — When an API request through Obul fails and you need to understand why
- **Payment issues** — When receiving 402 or 403 payment-related errors
- **Rate limiting** — When encountering 429 errors from upstream services
- **Connectivity problems** — When upstream services return 502 or 503 errors
- **Authentication errors** — When requests return 401 unauthorized

## Best Practices

1. **Check error details first** — Error responses include `code` and `message` fields that pinpoint the issue
2. **Handle 402 immediately** — Payment errors require adding funds or updating billing at my.obul.ai
3. **Retry on 502/503** — These are temporary upstream issues; implement exponential backoff
4. **Validate URLs** — 404 errors may indicate incorrect upstream host or path
5. **Check spend limits** — 403 with `spend_limit_exceeded` means your account hit its configured limit
6. **Monitor rate limits** — 429 indicates upstream throttling; reduce request frequency

## Error Handling

| Error | Cause | Solution |
|-------|-------|----------|
| 400 `invalid_headers` | Proxy header preparation failed | Verify request headers are well-formed |
| 401 `unauthorized` | Missing or invalid API key | Check `OBUL_API_KEY` is set and valid |
| 401 `invalid_token` | JWT expired or invalid | Refresh your authentication token |
| 402 `payment_required` | No billing setup | Add payment method at my.obul.ai |
| 402 `spend_limit_exceeded` | Account limit reached | Increase spend limit or wait for reset |
| 403 `endpoint_not_allowed` | Host not in allowlist | Contact support to enable this endpoint |
| 404 `not_found` | Wallet screening blocked | Check address is valid and not sanctioned |
| 429 `upstream_rate_limit` | Upstream throttling | Add delays between requests |
| 502 `upstream_unavailable` | Upstream service down | Retry after a short delay |
| 503 `payment_unavailable` | Insufficient Obul funds | Top up your Obul wallet |
