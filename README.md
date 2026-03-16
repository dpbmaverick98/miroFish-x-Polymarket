# miroFish-x-Polymarket

Prediction market analysis with MiroFish simulation and Obul research services.

## Features

- **Polymarket Integration** - Find and track prediction markets
- **Seed Doc Enrichment** - Research topics using Obul services (news, Twitter, web search)
- **MiroFish Simulation** - Run agent-based predictions
- **All-in-One Setup** - One skill to set up everything

## Quick Start

```bash
# Clone and setup
git clone https://github.com/dpbmaverick98/miroFish-x-Polymarket.git
cd miroFish-x-Polymarket

# Use the setup skill (mirofish-zep-obul-setup)
# This will:
#   - Install MiroFish with Python 3.12
#   - Configure Minimax LLM
#   - Set up Zep memory
#   - Configure Obul for research
```

## What's Included

| Component | Description |
|-----------|-------------|
| **MiroFish** | Agent-based prediction simulation |
| **Polymarket CLI** | Find prediction markets |
| **Obul Research** | News, Twitter, web search for seed docs |
| **Skills** | Pre-built workflows for predict, setup, and more |

## Architecture

```
┌─────────────────────────────────────────────────────┐
│                  mirofish-predict                   │
├─────────────────────────────────────────────────────┤
│  1. Polymarket CLI → Find markets                   │
│  2. Obul Services → Enrich seed docs               │
│     - seed_news.md (Firecrawl)                    │
│     - seed_twitter.md (Twit)                      │
│     - seed_web.md (Exa/Sybil)                     │
│  3. MiroFish → Run prediction simulation           │
└─────────────────────────────────────────────────────┘
```

## Documentation

- [Setup Guide](./skills/mirofish-zep-obul-setup/SKILL.md) - Complete setup instructions
- [Predict Workflow](./skills/mirofish-predict/SKILL.md) - How to run predictions
- [Skills](./skills/) - All available skills

## API Keys Needed

| Service | Purpose | Get Key |
|---------|---------|---------|
| **Minimax** | LLM for MiroFish | https://platform.minimax.io |
| **Obul** | Research (Firecrawl, Twit, Exa) | https://my.obul.ai |
| **Zep** | Memory (optional) | https://app.getzep.com |
| **Polymarket** | Markets (optional) | https://polymarket.com |

## Requirements

- Node.js 18+
- Python 3.11 or 3.12 (NOT 3.13)
- uv (recommended)

## License

MIT
