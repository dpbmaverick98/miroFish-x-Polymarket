---
name: mirofish-zep-obul-setup
description: 'USE THIS SKILL WHEN: setting up MiroFish with Obul LLM, Zep memory, and needed API keys. Covers installation, Python version issues, Obul/Zep key setup, and available models.'
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

Complete setup guide for running MiroFish with Obul LLM (cheapest routing) and Zep memory.

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

### Obul API Key (LLM Access)

1. Go to https://my.obul.ai
2. Sign up with email or GitHub
3. Add payment method (Billing → Add Payment Method)
4. Generate key: API Keys → Create New Key
5. Copy and save the key

**Pricing:** Pay-per-use, cheapest routing to GPT-4o, Claude, Minimax, etc.

### Zep API Key (Memory)

1. Go to https://app.getzep.com
2. Sign up for free account
3. Get API key from dashboard
4. Free tier: 75K characters/month

---

## 3. Configure MiroFish

Edit `mirofish/.env`:

```bash
# LLM via Obul (Minimax-M2.5)
LLM_API_KEY=obul_live_YOUR_KEY_HERE
LLM_BASE_URL=https://proxy.obul.ai/proxy/c
LLM_MODEL_NAME=llm/minimax-m2.5

# Zep Memory
ZEP_API_KEY=your_zep_key_here
```

### Alternative: Direct Minimax (No Obul)

```bash
# Direct Minimax (your original key)
LLM_API_KEY=sk-cp-...
LLM_BASE_URL=https://api.minimax.io/v1
LLM_MODEL_NAME=MiniMax-M2.5
```

---

## 4. Available LLM Models via Obul

### List Available Models

```bash
curl -s https://proxy.obul.ai/proxy/c/llm | jq '.categories[].id'
```

### Current Available Models

| Category ID | Model | Best For |
|-------------|-------|----------|
| `llm/minimax-m2.5` | MiniMax M2.5 | Cheap, large context (200K) |
| `llm/gpt-4o` | GPT-4o | General purpose, best quality |
| `llm/claude-sonnet-4-6` | Claude Sonnet | Reasoning, writing |
| `llm/claude-opus-4-6` | Claude Opus | Best reasoning, long context |
| `llm/deepseek-v3.2` | DeepSeek V3 | Cheap, strong coding |
| `llm/gemini-3.1-pro` | Gemini Pro | Google's best model |
| `llm/gemini-3.1-flash-lite` | Gemini Flash Lite | Cheapest option |
| `llm/grok-4` | Grok 4 | X/Elon integration |

### Check Pricing

```bash
curl -s https://proxy.obul.ai/proxy/c/llm/minimax-m2.5/_pricing | jq
curl -s https://proxy.obul.ai/proxy/c/llm/gpt-4o/_pricing | jq
```

---

## 5. Start MiroFish

```bash
cd mirofish
npm run dev
```

Services:
- Frontend: http://localhost:3000
- Backend API: http://localhost:5001

---

## 6. Test Setup

### Test Obul LLM

```bash
curl -X POST "https://proxy.obul.ai/proxy/c/llm/minimax-m2.5/v1/chat/completions" \
  -H "Content-Type: application/json" \
  -H "x-obul-api-key: YOUR_OBUL_KEY" \
  -d '{
    "model": "minimax-m2.5",
    "messages": [{"role": "user", "content": "Say hi"}]
  }'
```

---

## Quick Reference

### Environment Variables

| Variable | Description | Required |
|----------|-------------|----------|
| `OBUL_API_KEY` | Obul API key | Yes (for LLM) |
| `LLM_BASE_URL` | LLM endpoint | Yes |
| `LLM_MODEL_NAME` | Model category | Yes |
| `ZEP_API_KEY` | Zep memory | Recommended |

### Common Issues

| Issue | Solution |
|-------|----------|
| Python 3.13 errors | Use Python 3.11 or 3.12 |
| tiktoken build failed | Use Python 3.12 with uv |
| Invalid API key | Check OBUL_API_KEY format |
| 402 Payment Required | Add payment method in Obul |
| 404 Model not found | Check category ID format |

---

## Migration: Original → Obul

| Setting | Original | Obul |
|---------|----------|------|
| API Key | Minimax key | Obul key |
| Base URL | api.minimax.io/v1 | proxy.obul.ai/proxy/c |
| Model | MiniMax-M2.5 | llm/minimax-m2.5 |
