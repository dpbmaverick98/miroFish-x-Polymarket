# MiroFish First Startup Guide - Sprite VM

This doc covers the initial setup of MiroFish on the Sprite VM, including issues encountered and solutions.

---

## Prerequisites

| Tool | Version Required | Version Used |
|------|------------------|--------------|
| Node.js | 18+ | v22.20.0 |
| Python | 3.11 - 3.12 | 3.12.0 |
| uv | Latest | 0.10.10 |

---

## Issues Encountered

### Issue 1: Python 3.13 Compatibility

**Problem:** System default Python was 3.13, but MiroFish dependencies (`tiktoken==0.7.0`, `pillow==10.3.0`) failed to build due to Rust/Python extension incompatibilities.

**Error:**
```
Failed to build `tiktoken==0.7.0`
KeyError: '__version__' (pillow build)
```

**Solution:** Use Python 3.12 instead. Sprite has pyenv with 3.12.0 available:

```bash
cd mirofish/backend
uv sync --python 3.12.0
```

---

### Issue 2: Git Submodule Not Initialized

**Problem:** The `mirofish` submodule was empty after clone.

**Solution:**
```bash
git submodule update --init --recursive
```

---

## Complete Setup Steps

### 1. Clone Repository

```bash
git clone https://github.com/dpbmaverick98/miroFish-x-Polymarket.git
cd miroFish-x-Polymarket
git submodule update --init --recursive
```

### 2. Install uv (Python Package Manager)

```bash
curl -LsSf https://astral.sh/uv/install.sh | sh
```

### 3. Install Node Dependencies

```bash
cd mirofish
npm install
cd frontend && npm install
```

### 4. Install Python Dependencies

```bash
cd mirofish/backend
uv sync --python 3.12.0
```

### 5. Configure Environment

```bash
cd mirofish
cp .env.example .env
```

Edit `.env` with your API keys:
- **LLM_API_KEY**: MiniMax key (recommended for cost/performance)
- **LLM_BASE_URL**: https://api.minimax.io/v1
- **LLM_MODEL_NAME**: MiniMax-M2.5
- **ZEP_API_KEY**: Get from https://app.getzep.com/

Example `.env`:
```bash
LLM_API_KEY=your_minimax_key
LLM_BASE_URL=https://api.minimax.io/v1
LLM_MODEL_NAME=MiniMax-M2.5
ZEP_API_KEY=your_zep_key
```

### 6. Start Development Server

```bash
cd mirofish
npm run dev
```

Services:
- Frontend: http://localhost:3000
- Backend API: http://localhost:5001

---

## Running First Prediction Test

Per MiroFish docs, start with 40 rounds to test the full pipeline:

1. Open http://localhost:3000
2. Create New Project
3. Upload a seed document with market context
4. Run simulation with `max_rounds: 40`

Cost estimate: ~$3-6 USD for 40 rounds with MiniMax.

---

## Notes

- Python 3.13 is NOT supported - must use 3.11 or 3.12
- Use `uv` for Python dependency management (faster than pip)
- MiniMax recommended over qwen-plus for larger context (200K vs 128K)
