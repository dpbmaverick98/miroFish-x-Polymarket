# MiroFish Environment Setup

## Quick Copy-Paste

```bash
# LLM Configuration (Required)
# Get API key from: https://bailian.console.aliyun.com/
LLM_API_KEY=your_api_key_here
LLM_BASE_URL=https://dashscope.aliyuncs.com/compatible-mode/v1
LLM_MODEL_NAME=qwen-plus

# Zep Cloud Configuration (Required)
# Sign up at: https://app.getzep.com/
ZEP_API_KEY=your_zep_api_key_here

# Optional: Accelerated LLM for simpler tasks
# LLM_BOOST_API_KEY=your_boost_key
# LLM_BOOST_BASE_URL=your_boost_url
# LLM_BOOST_MODEL_NAME=your_boost_model
```

## Getting API Keys

### 1. Alibaba Bailian (LLM)

1. Visit https://bailian.console.aliyun.com/
2. Create account / sign in
3. Go to "API Keys" section
4. Create new key
5. Copy key to `LLM_API_KEY`

**Model recommendation:** `qwen-plus` (good balance of capability/cost)

### 2. Zep Cloud (Memory/Graph)

1. Visit https://app.getzep.com/
2. Sign up for free account
3. Create new project
4. Copy project API key to `ZEP_API_KEY`

**Free tier:** 1,000 episodes/month (enough for testing)

## Verification

After setting up `.env`:

```bash
cd mirofish
npm run setup:all
npm run dev
```

Check:
- Frontend loads at http://localhost:3000
- Backend responds at http://localhost:5001/health
