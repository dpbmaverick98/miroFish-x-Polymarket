---
name: mirofish-zep-obul-setup
description: 'USE THIS SKILL WHEN: setting up MiroFish with Zep memory, Obul research services, and Minimax LLM. Covers installation, Python version issues, API key setup, and configuration.'
metadata:
  openclaw:
    emoji: ⚙️
    requires:
      bins: [polymarket, python3]
      env:
      - OBUL_API_KEY
    category: setup
---

# MiroFish + Zep + Obul Setup Guide

Complete setup guide for running MiroFish with Minimax LLM, Zep memory, and Obul research services.

---

## Prerequisites

| Tool | Version | Status |
|------|---------|--------|
| Node.js | 18+ | Required |
| Python | 3.11 or 3.12 | Required (NOT 3.13) |
| uv | Latest | Recommended |
| polymarket | CLI | Optional |

---

## 1. Clone & Install MiroFish

```bash
# Clone repo
git clone https://github.com/dpbmaverick98/miroFish-x-Polymarket.git
cd miroFish-x-Polymarket

# Initialize submodule
git submodule update --init --recursive

# Install uv (Python package manager)
curl -LsSf https://astral.sh/uv/install.sh | sh

# Install Node dependencies
cd mirofish
npm install
cd frontend && npm install

# Install Python dependencies (MUST use Python 3.11 or 3.12)
cd backend
uv sync --python 3.12.0
```

---

## ⚠️ Python Version Critical

**MiroFish does NOT support Python 3.13!**

### The Problem

Python 3.13 breaks some dependencies:
- `tiktoken==0.7.0` - Rust compilation error
- `pillow==10.3.0` - KeyError: '__version__'

### The Fix

Use Python 3.11 or 3.12:

```bash
# Check available Python versions
pyenv versions

# Install 3.12 if needed
pyenv install 3.12.0

# Use with uv
uv sync --python 3.12.0
```

---

## 2. Get API Keys

### Minimax API Key (LLM - Required)

MiroFish uses Minimax for LLM. Get your key:

1. Go to https://platform.minimax.io
2. Sign up for an account
3. Create an API key
4. Copy and save the key

**Note:** Obul LLM does NOT work with MiroFish because it requires header-based authentication which the OpenAI client doesn't support. Use direct Minimax instead.

### Obul API Key (Research Services - Required)

Obul provides research services used in the mirofish-predict workflow:

1. Go to https://my.obul.ai
2. Sign up with email or GitHub
3. Add payment method (Billing → Add Payment Method)
4. Generate key: API Keys → Create New Key
5. Copy and save the key

**Services available:**
- Firecrawl (web scraping)
- Twit (Twitter search)
- Exa (neural web search)
- Sybil (combined search + reasoning)

### Zep API Key (Memory - Recommended)

1. Go to https://app.getzep.com
2. Sign up for free account
3. Get API key from dashboard
4. Free tier: 75K characters/month

---

## 3. Configure MiroFish

Edit `mirofish/.env`:

```bash
# ===== LLM Configuration (Required) =====
# Use direct Minimax - Obul LLM does NOT work with MiroFish
LLM_API_KEY=sk-cp-YOUR_MINIMAX_KEY_HERE
LLM_BASE_URL=https://api.minimax.io/v1
LLM_MODEL_NAME=MiniMax-M2.5

# ===== Obul Services (Research) =====
OBUL_API_KEY=obul_live_YOUR_OBUL_KEY_HERE

# ===== Zep Memory (Recommended) =====
ZEP_API_KEY=your_zep_key_here
```

---

## 4. Start MiroFish

```bash
cd mirofish
npm run dev
```

Services:
- Frontend: http://localhost:3000
- Backend API: http://localhost:5001

---

## 5. Test Setup

### Test Minimax LLM

```bash
curl -X POST "https://api.minimax.io/v1/chat/completions" \
  -H "Authorization: Bearer YOUR_MINIMAX_KEY" \
  -H "Content-Type: application/json" \
  -d '{
    "model": "MiniMax-M2.5",
    "messages": [{"role": "user", "content": "Say hi"}]
  }'
```

---

## Quick Reference

### Environment Variables

| Variable | Description | Required |
|----------|-------------|----------|
| `LLM_API_KEY` | Minimax API key | Yes |
| `LLM_BASE_URL` | https://api.minimax.io/v1 | Yes |
| `LLM_MODEL_NAME` | MiniMax-M2.5 | Yes |
| `OBUL_API_KEY` | Obul for research (Firecrawl, Twit, Exa, Sybil) | Yes |
| `ZEP_API_KEY` | Zep memory | Recommended |

### Common Issues

| Issue | Solution |
|-------|----------|
| Python 3.13 errors | Use Python 3.11 or 3.12 |
| tiktoken build failed | Use Python 3.12 with uv |
| Invalid API key | Check key format |
| 402 Payment Required | Add payment method in Obul |

### What Obul is Used For

In the mirofish-predict workflow, Obul provides:
- **Firecrawl** - Web scraping for news articles
- **Twit** - Twitter/X search for tweets
- **Exa** - Neural web search
- **Sybil** - Combined web + X search with reasoning

---

## Architecture Overview

```
┌─────────────────────────────────────────────────────────┐
│                    mirofish-predict                      │
├─────────────────────────────────────────────────────────┤
│  Step 1: Polymarket CLI (find markets)                 │
│  Step 2: Obul Services (research)                       │
│    - Firecrawl → seed_news.md                          │
│    - Twit → seed_twitter.md                           │
│    - Exa/Sybil → seed_web.md                          │
│  Step 3: MiroFish (predict)                            │
│    - LLM: Minimax (direct, NOT Obul)                  │
│    - Memory: Zep                                       │
└─────────────────────────────────────────────────────────┘
```
