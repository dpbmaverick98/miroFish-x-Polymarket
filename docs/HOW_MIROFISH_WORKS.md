# How MiroFish Launches 100s of Agents (Simplified)

## The Core Architecture

MiroFish doesn't spawn 100 separate processes. It uses the **OASIS library** + **CAMEL-AI** framework to simulate agents within a single (or few) Python processes.

---

## Key Components

### 1. Agent Profiles (The "DNA")

```python
# oasis_profile_generator.py creates this:

agent_profile = {
    "user_id": 1,
    "username": "crypto_trader_42",
    "name": "Alex Chen",
    "bio": "Day trader, crypto enthusiast, skeptical of hype",
    "persona": "You are a 28-year-old software engineer who trades crypto...",
    "age": 28,
    "profession": "Software Engineer",
    "mbti": "INTJ",
    "interested_topics": ["bitcoin", "ethereum", "defi"],
    # ... more fields
}
```

**Key insight:** The `persona` field is a **detailed prompt** that defines how this agent behaves.

---

### 2. The Simulation Runner

```python
# run_twitter_simulation.py (simplified)

from oasis import generate_twitter_agent_graph
from camel.models import ModelFactory

# Step 1: Load 100 agent profiles from JSON
profiles = load_profiles("agents.json")  # 100 profiles

# Step 2: Create agent graph (this is where OASIS magic happens)
agent_graph = generate_twitter_agent_graph(
    agent_profiles=profiles,
    model=ModelFactory.create(
        model_platform=ModelPlatformType.OPENAI,
        model_type="gpt-4"
    ),
    num_agents=100
)

# Step 3: Run simulation round by round
for round_num in range(total_rounds):
    # Each round, some agents "wake up" and take actions
    actions = agent_graph.step()  # All agents act in this step
    
    # Actions could be: CREATE_POST, LIKE_POST, REPLY, etc.
    for action in actions:
        log_action(action.agent_id, action.type, action.content)
```

---

## How It Actually Works (The OASIS Library)

### Agent Graph Pattern

```
┌─────────────────────────────────────────────────────────────┐
│                    AGENT GRAPH                              │
│                                                             │
│  ┌─────────┐    ┌─────────┐    ┌─────────┐                 │
│  │ Agent 1 │◄──►│ Agent 2 │◄──►│ Agent 3 │    ... x100      │
│  │ (INTJ)  │    │ (ENFP)  │    │ (ISTP)  │                 │
│  └────┬────┘    └────┬────┘    └────┬────┘                 │
│       │              │              │                       │
│       └──────────────┼──────────────┘                       │
│                      ▼                                      │
│              ┌─────────────┐                                │
│              │ Environment │  ← Shared state (posts, likes) │
│              │  (Twitter)  │                                │
│              └─────────────┘                                │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

### Single Process, Multiple Agents

**Important:** All 100 agents run in **ONE Python process**. Not 100 separate processes.

```python
# OASIS internally manages this:

class AgentGraph:
    def __init__(self, profiles, model):
        self.agents = []
        for profile in profiles:
            # Each agent is an object, not a process
            agent = TwitterAgent(
                profile=profile,
                llm_model=model  # Shared LLM client
            )
            self.agents.append(agent)
    
    def step(self):
        # Each round, decide which agents act
        active_agents = self.select_active_agents()
        
        actions = []
        for agent in active_agents:
            # Agent decides what to do based on its persona
            action = agent.decide_action(self.environment)
            actions.append(action)
        
        return actions
```

---

## The Agent Decision Loop

```python
class TwitterAgent:
    def __init__(self, profile, llm_model):
        self.profile = profile  # The persona prompt
        self.model = llm_model
        self.memory = []  # What this agent has seen
    
    def decide_action(self, environment):
        # 1. Observe: What happened since last time?
        recent_posts = environment.get_recent_posts()
        
        # 2. Think: Build prompt with persona + context
        prompt = f"""
        You are: {self.profile['persona']}
        
        Your bio: {self.profile['bio']}
        Your interests: {self.profile['interested_topics']}
        
        Recent posts you see:
        {recent_posts}
        
        Based on your personality, what do you want to do?
        Options: CREATE_POST, LIKE_POST, REPLY, DO_NOTHING
        
        Respond in JSON:
        {{
            "action": "CREATE_POST",
            "content": "Your post content here",
            "reasoning": "Why you chose this"
        }}
        """
        
        # 3. Act: Call LLM to decide
        response = self.model.generate(prompt)
        return parse_action(response)
```

---

## Key Insight: It's All Prompt Engineering

The "100 agents" are really:
- **1 shared LLM** (GPT-4, Claude, etc.)
- **100 different prompts** (the personas)
- **1 environment** (shared state)

```python
# Same LLM, different prompts = different "agents"

agent_1_response = llm.generate("You are a skeptical economist...")
agent_2_response = llm.generate("You are an optimistic student...")
agent_3_response = llm.generate("You are a contrarian investor...")
# ... x100
```

---

## Parallelization Strategy

### Option 1: Sequential (Simpler, Slower)
```python
# One agent at a time
for agent in agents:
    action = agent.decide_action(env)
```

### Option 2: Batched (Faster)
```python
# Multiple agents in parallel API calls
import asyncio

async def batch_decide(agents, env):
    tasks = [agent.decide_async(env) for agent in agents]
    return await asyncio.gather(*tasks)
```

### Option 3: Threaded (MiroFish Approach)
```python
# Each platform runs in separate thread/process

# Thread 1: Twitter simulation
# Thread 2: Reddit simulation

# But within each: agents are sequential or batched
```

---

## How to Apply This to Polymarket

### The Pattern

```python
# 1. Define 100 trader personas
profiles = [
    {
        "id": 1,
        "name": "News Trader",
        "persona": "You trade based on breaking news. You scan Twitter..."
    },
    {
        "id": 2,
        "name": "Chartist", 
        "persona": "You believe in technical analysis. You look for patterns..."
    },
    # ... 98 more
]

# 2. Create environment (Polymarket markets)
env = PolymarketEnvironment(
    markets=fetch_all_markets(),
    news_feed=obul_twit_search(),
    price_history=subgraph_query()
)

# 3. Run simulation
for round in range(10):
    for agent in agents:
        # Agent observes market
        observation = env.get_state()
        
        # Agent decides: BUY, SELL, or HOLD?
        decision = agent.decide(observation)
        
        if decision.action == "BUY":
            env.place_order(agent.id, decision.market, decision.size)
    
    # After all agents act, update prices
    env.update_prices()
```

---

## Simplified Implementation

You don't need OASIS. Just do this:

```python
import asyncio
from openai import AsyncOpenAI

client = AsyncOpenAI()

# 100 different personas
PERSONAS = [
    "You are a news trader. You prioritize speed over accuracy...",
    "You are a value investor. You look for mispriced markets...",
    "You are a contrarian. You bet against the crowd...",
    # ... 97 more
]

async def run_agent(persona: str, market_data: dict):
    """Single agent decision"""
    response = await client.chat.completions.create(
        model="gpt-4",
        messages=[{
            "role": "system",
            "content": f"{persona}\n\nAnalyze this market: {market_data}"
        }]
    )
    return response.choices[0].message.content

async def run_all_agents(market_data: dict):
    """Run 100 agents in parallel batches"""
    # Batch into groups of 10 (rate limiting)
    batches = [PERSONAS[i:i+10] for i in range(0, 100, 10)]
    
    all_signals = []
    for batch in batches:
        tasks = [run_agent(p, market_data) for p in batch]
        results = await asyncio.gather(*tasks)
        all_signals.extend(results)
    
    return all_signals

# Usage
market = {"question": "Will BTC hit $100k?", "price": 0.65, "volume": "10M"}
signals = asyncio.run(run_all_agents(market))

# Aggregate: Count BUY vs SELL vs HOLD
buy_count = sum(1 for s in signals if "BUY" in s)
sell_count = sum(1 for s in signals if "SELL" in s)
print(f"Consensus: {buy_count} BUY, {sell_count} SELL")
```

---

## Bottom Line

| What MiroFish Does | How It Works |
|-------------------|--------------|
| 100 agents | 100 prompts, same LLM |
| Parallel | Async/batched API calls |
| Memory | Each agent stores own history |
| Interaction | Shared environment state |
| Cost | ~$0.01-0.10 per agent per round |

**You can replicate this with just:**
1. A list of 100 persona prompts
2. Async OpenAI/Claude API calls
3. A shared "environment" object
4. A loop that runs rounds
