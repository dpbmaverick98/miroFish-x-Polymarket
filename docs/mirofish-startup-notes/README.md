# MiroFish Startup Notes (English)

Quick reference for setting up and running MiroFish.

> **Live Demo:** https://666ghj.github.io/mirofish-demo/
> 
> **Official Repo:** https://github.com/666ghj/MiroFish
> 
> **Original Docs:** [中文文档](https://github.com/666ghj/MiroFish/blob/main/README.md) | [English](https://github.com/666ghj/MiroFish/blob/main/README-EN.md)

---

## Prerequisites

| Tool | Version | Check Command |
|------|---------|---------------|
| Node.js | 18+ | `node -v` |
| Python | 3.11 - 3.12 | `python --version` |
| uv | Latest | `uv --version` |

### Install uv (Python Package Manager)
```bash
curl -LsSf https://astral.sh/uv/install.sh | sh
```

---

## Repository Structure

```
mirofish/
├── backend/          # Python Flask API
│   ├── app/         # Main application code
│   ├── scripts/     # Simulation runners
│   └── pyproject.toml
├── frontend/        # Vue.js + TypeScript UI
│   ├── src/
│   └── package.json
└── package.json     # Root package.json with scripts
```

---

## Configuration

### 1. Environment Variables

Copy the example config:
```bash
cd mirofish
cp .env.example .env
```

Edit `.env` with your API keys:

```bash
# Required: LLM API (OpenAI-compatible)
# Recommended: Alibaba Bailian with qwen-plus
LLM_API_KEY=your_api_key_here
LLM_BASE_URL=https://dashscope.aliyuncs.com/compatible-mode/v1
LLM_MODEL_NAME=qwen-plus

# Required: Zep Cloud (memory/graph)
# Get free tier at https://app.getzep.com/
ZEP_API_KEY=your_zep_api_key_here
```

### 2. Optional: Accelerated LLM

For faster/cheaper inference on simple tasks:
```bash
LLM_BOOST_API_KEY=your_key
LLM_BOOST_BASE_URL=your_url
LLM_BOOST_MODEL_NAME=your_model
```

---

## Installation

### One-Command Setup (Recommended)
```bash
cd mirofish
npm run setup:all
```

This installs:
- Root Node dependencies
- Frontend dependencies
- Backend Python dependencies (via uv)

### Manual Setup (If Needed)

```bash
# Node dependencies (root + frontend)
npm run setup

# Python dependencies (backend)
npm run setup:backend
```

---

## Running MiroFish

### Development Mode (Both Services)
```bash
cd mirofish
npm run dev
```

Services start at:
- Frontend: http://localhost:3000
- Backend API: http://localhost:5001

### Run Individually

```bash
# Backend only
npm run backend

# Frontend only  
npm run frontend
```

---

## Docker Deployment

```bash
cd mirofish
cp .env.example .env
# Edit .env with your keys

docker compose up -d
```

**Docker notes:**
- Frontend: http://localhost:3000
- Backend: http://localhost:5001
- Logs: `docker compose logs -f`
- Stop: `docker compose down`
- Mirror registry available in `docker-compose.yml` comments (for China users)

---

## First Use: Create a Prediction

### Step 1: Prepare Seed Document

Create a text file with market context:

```bash
cat > /tmp/btc_prediction.txt << 'EOF'
Bitcoin $100,000 Prediction Market Context

Current Market Data:
- BTC Price: $67,500
- Polymarket Probability: 35% YES
- Volume: $1.2M
- Liquidity: $250K

Recent Developments:
- Spot Bitcoin ETF approved January 2024
- BlackRock IBIT seeing record inflows
- Halving event scheduled April 2024
- Fed signaling potential rate cuts

Technical Analysis:
- Breaking above 2021 all-time high
- Strong support at $60K
- RSI showing bullish momentum

Macro Factors:
- Institutional adoption accelerating
- Regulatory clarity improving
- Global liquidity conditions easing
EOF
```

### Step 2: Upload to MiroFish

Via web UI:
1. Open http://localhost:3000
2. Click "New Project"
3. Upload `/tmp/btc_prediction.txt`
4. Enter simulation requirement:
   ```
   Predict whether Bitcoin will reach $100,000 by end of 2024.
   Consider ETF flows, halving impact, macro conditions, and technical levels.
   ```
5. Submit

Or via API:
```bash
curl -X POST http://localhost:5001/api/graph/ontology/generate \
  -F "files=@/tmp/btc_prediction.txt" \
  -F "simulation_requirement=Predict BTC $100k market outcome" \
  -F "project_name=BTC_100k_Prediction"
```

### Step 3: Build Knowledge Graph

MiroFish automatically:
1. Generates ontology from your document
2. Creates Zep graph
3. Extracts entities and relationships

Wait for completion (check task status).

### Step 4: Run Simulation

```bash
curl -X POST http://localhost:5001/api/simulation/start \
  -H "Content-Type: application/json" \
  -d '{
    "project_id": "proj_xxx",
    "platform": "parallel",
    "max_rounds": 40,
    "enable_graph_memory_update": true,
    "graph_id": "graph_xxx"
  }'
```

Monitor at: http://localhost:3000/simulation/{project_id}

### Step 5: View Report

After simulation completes:
- Visit http://localhost:3000/report/{project_id}
- Or query API: `GET /api/report/{project_id}`

---

## API Endpoints Reference

### Project Management
| Endpoint | Method | Description |
|----------|--------|-------------|
| `/api/graph/ontology/generate` | POST | Upload docs, generate ontology |
| `/api/graph/build` | POST | Build knowledge graph |
| `/api/graph/project/{id}` | GET | Get project details |
| `/api/graph/task/{id}` | GET | Check task status |

### Simulation
| Endpoint | Method | Description |
|----------|--------|-------------|
| `/api/simulation/start` | POST | Start simulation |
| `/api/simulation/{id}/status` | GET | Get simulation status |
| `/api/simulation/{id}/stop` | POST | Stop simulation |

### Report
| Endpoint | Method | Description |
|----------|--------|-------------|
| `/api/report/{id}` | GET | Get prediction report |
| `/api/report/{id}/chat` | POST | Chat with ReportAgent |

---

## Troubleshooting

### Port Already in Use
```bash
# Kill processes on port 3000 or 5001
lsof -ti:3000 | xargs kill -9
lsof -ti:5001 | xargs kill -9
```

### Python Version Issues
```bash
# Ensure Python 3.11-3.12
python3.11 --version

# If needed, install via pyenv
pyenv install 3.11.8
pyenv local 3.11.8
```

### Zep API Errors
- Verify `ZEP_API_KEY` is set correctly
- Check Zep dashboard for quota usage
- Free tier: 1,000 episodes/month

### LLM API Errors
- Verify `LLM_API_KEY` and `LLM_BASE_URL`
- Test API connectivity:
  ```bash
  curl $LLM_BASE_URL/models \
    -H "Authorization: Bearer $LLM_API_KEY"
  ```

---

## Cost Considerations

| Component | Free Tier | Paid |
|-----------|-----------|------|
| Zep Cloud | 1,000 episodes/mo | $25/mo (20k) |
| LLM (qwen-plus) | - | ~$5-20 per sim |
| Hosting | - | Your infra |

**Start small:** Test with <40 rounds to minimize LLM costs.

---

## Next Steps

Once MiroFish is running:
1. Test with sample prediction
2. Verify report generation works
3. Ready to integrate Polymarket data bridge

See `../prediction-bridge/` (future) for automated data collection.

---

## Resources

- MiroFish Repo: https://github.com/666ghj/MiroFish
- Zep Docs: https://help.getzep.com
- OASIS Docs: https://github.com/camel-ai/oasis
