# MiroFish Architecture Overview

## System Components

```
┌─────────────────────────────────────────────────────────────┐
│                        FRONTEND (Vue.js)                     │
│  • Upload documents                                          │
│  • Monitor simulation progress                               │
│  • View prediction reports                                   │
│  • Chat with simulated agents                                │
└─────────────────────────────────────────────────────────────┘
                              │
                              │ HTTP/WebSocket
                              ▼
┌─────────────────────────────────────────────────────────────┐
│                      BACKEND (Python/Flask)                  │
│                                                              │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐         │
│  │   Ontology  │  │    Graph    │  │ Simulation  │         │
│  │  Generator  │──▶│   Builder   │──▶│   Runner    │         │
│  │   (LLM)     │  │   (Zep)     │  │  (OASIS)    │         │
│  └─────────────┘  └─────────────┘  └─────────────┘         │
│         │                │                │                  │
│         │                │                │                  │
│         ▼                ▼                ▼                  │
│  ┌─────────────────────────────────────────────────────┐   │
│  │              EXTERNAL SERVICES                       │   │
│  │  • LLM API (OpenAI-compatible)                      │   │
│  │  • Zep Cloud (memory + graph)                       │   │
│  └─────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────┘
```

## Data Flow

### 1. Document Upload
```
User Document (PDF/TXT/MD)
    │
    ▼
Text Extraction (PyMuPDF)
    │
    ▼
Ontology Generation (LLM)
    │
    ▼
Entity/Relation Types
```

### 2. Knowledge Graph Building
```
Extracted Text
    │
    ▼
Chunking (500 chars, 50 overlap)
    │
    ▼
Zep Graph Creation
    │
    ▼
Episode Ingestion → Entity Extraction → Graph Population
```

### 3. Simulation
```
Agent Query → Zep Retrieval → LLM Decision → Action Log
    │                                            │
    └──────────────┬─────────────────────────────┘
                   │
                   ▼
           Collective Behavior
                   │
                   ▼
           Prediction Report
```

## Key Technologies

| Component | Technology | Purpose |
|-----------|------------|---------|
| Backend Framework | Flask 3.0 | HTTP API |
| Simulation Engine | OASIS (CAMEL-AI) | Multi-agent simulation |
| Memory/Graph | Zep Cloud | Persistent knowledge |
| LLM Integration | OpenAI SDK | Agent reasoning |
| Frontend | Vue 3 + Vite | User interface |
| Package Manager | uv | Python deps |

## File Structure

```
mirofish/
├── backend/
│   ├── app/
│   │   ├── api/              # Flask routes
│   │   │   ├── graph.py      # Ontology & graph APIs
│   │   │   ├── simulation.py # Simulation control
│   │   │   └── report.py     # Report generation
│   │   ├── services/         # Business logic
│   │   │   ├── ontology_generator.py
│   │   │   ├── graph_builder.py
│   │   │   ├── simulation_runner.py
│   │   │   └── report_agent.py
│   │   ├── models/           # Data models
│   │   └── config.py         # Configuration
│   ├── scripts/              # Simulation runners
│   └── pyproject.toml        # Python deps
│
├── frontend/
│   ├── src/
│   │   ├── components/       # Vue components
│   │   ├── views/            # Page views
│   │   └── api/              # API clients
│   └── package.json
│
└── package.json              # Root scripts
```

## Configuration Files

| File | Purpose |
|------|---------|
| `.env` | API keys, LLM config |
| `backend/pyproject.toml` | Python dependencies |
| `frontend/package.json` | Node dependencies |
| `docker-compose.yml` | Container orchestration |

## API Flow Example

### Create Prediction Project

```bash
# 1. Upload document → Returns project_id
POST /api/graph/ontology/generate
→ project_id: "proj_abc123"

# 2. Build graph (async)
POST /api/graph/build
{ "project_id": "proj_abc123" }
→ task_id: "task_xyz789"

# 3. Check progress
GET /api/graph/task/task_xyz789
→ status: "processing" → "completed"

# 4. Start simulation
POST /api/simulation/start
{ "project_id": "proj_abc123", "max_rounds": 40 }
→ simulation_id: "sim_def456"

# 5. Monitor
GET /api/simulation/sim_def456/status
→ { "status": "running", "current_round": 23 }

# 6. Get report
GET /api/report/sim_def456
→ { "prediction": "YES with 68% confidence", ... }
```

## Resource Limits

| Resource | Default | Configurable |
|----------|---------|--------------|
| Max file size | 50MB | `MAX_CONTENT_LENGTH` |
| Chunk size | 500 chars | `DEFAULT_CHUNK_SIZE` |
| Chunk overlap | 50 chars | `DEFAULT_CHUNK_OVERLAP` |
| Default rounds | 10 | `OASIS_DEFAULT_MAX_ROUNDS` |

## Scaling Considerations

| Bottleneck | Mitigation |
|------------|------------|
| LLM rate limits | Use boost LLM for simple tasks |
| Zep quota | Batch episodes, reduce rounds |
| Memory | Increase for large documents |
| Simulation time | Reduce max_rounds, use single platform |
