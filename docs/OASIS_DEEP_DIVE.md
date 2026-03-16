# How OASIS Actually Spawns Agents (Deep Dive)

## The Core Architecture

OASIS doesn't spawn 100 processes or threads. It creates **100 Python objects** that share a single LLM client.

---

## The Three Key Classes

### 1. `SocialAgent` — The Individual Agent

```python
# oasis/social_agent/agent.py

class SocialAgent(ChatAgent):
    def __init__(self, agent_id, user_info, model, ...):
        self.social_agent_id = agent_id  # Unique ID (0, 1, 2, ... 999999)
        self.user_info = user_info        # Profile (name, bio, persona)
        self.model = model                # SHARED LLM client
        
        # System message = the persona prompt
        system_message = BaseMessage.make_assistant_message(
            role_name="system",
            content=user_info.to_system_message()  # The persona!
        )
        
        # Each agent has its own memory (conversation history)
        self.memory = ChatAgentMemory()
```

**Key insight**: Each agent is just an object with:
- A unique ID
- A system prompt (persona)
- Its own memory buffer
- **Reference to shared LLM** (not its own LLM)

---

### 2. `AgentGraph` — The Container

```python
# oasis/social_agent/agent_graph.py

class AgentGraph:
    def __init__(self):
        # Uses igraph for social network structure
        self.graph = ig.Graph(directed=True)
        
        # Maps agent_id -> SocialAgent object
        self.agent_mappings: dict[int, SocialAgent] = {}
    
    def add_agent(self, agent: SocialAgent):
        # Add node to graph
        self.graph.add_vertex(agent.social_agent_id)
        
        # Store agent object
        self.agent_mappings[agent.social_agent_id] = agent
    
    def get_agents(self):
        # Return all (id, agent) pairs
        return [(node.index, self.agent_mappings[node.index]) 
                for node in self.graph.vs]
```

**Key insight**: AgentGraph is just a dictionary + social network graph. No processes, no threads.

---

### 3. `Environment` — The Simulation Loop

```python
# oasis/environment/environment.py (simplified)

class Environment:
    def __init__(self, agent_graph, platform):
        self.agent_graph = agent_graph
        self.platform = platform  # Twitter/Reddit simulation
        self.recsys = RecommendationSystem()  # What agents see
    
    async def step(self, actions=None):
        # 1. Decide which agents "wake up" this round
        active_agents = self.select_active_agents()
        
        # 2. Each active agent observes + decides
        for agent_id in active_agents:
            agent = self.agent_graph.get_agent(agent_id)
            
            # Get what this agent sees (recommendation feed)
            observation = await self.recsys.get_feed(agent_id)
            
            # Agent decides action using LLM
            action = await agent.perform_action_by_llm(observation)
            
            # Execute action in platform
            await self.platform.execute(action)
        
        # 3. Update platform state
        await self.platform.update()
```

---

## How 1 Million Agents Work

### Memory Efficiency

```python
# Each agent stores:
agent = {
    'id': 12345,                          # 4 bytes
    'system_prompt': "You are...",         # ~500 bytes
    'memory': [msg1, msg2, ...],          # ~2000 bytes (recent 10 msgs)
    'model': shared_llm_client,           # Reference only!
}

# Total per agent: ~2.5 KB
# 1 million agents: ~2.5 GB RAM
```

**The trick**: Only active agents call the LLM. Most are "sleeping" in memory.

---

## The Simulation Loop (Step by Step)

```python
async def run_simulation():
    # 1. CREATE 100 AGENTS (just objects, no LLM calls yet)
    agent_graph = AgentGraph()
    for i in range(100):
        profile = load_profile(f"agent_{i}.json")
        agent = SocialAgent(
            agent_id=i,
            user_info=profile,
            model=shared_openai_client  # Same LLM for all!
        )
        agent_graph.add_agent(agent)
    
    # 2. CREATE ENVIRONMENT
    env = Environment(agent_graph, platform="twitter")
    
    # 3. RUN ROUNDS
    for round_num in range(100):
        # Each round:
        # - 10-20 agents "wake up" (random selection)
        # - Each calls LLM once to decide action
        # - Actions executed in platform
        await env.step()
```

**Key insight**: Not all 100 agents act every round. Only a subset "wakes up" based on:
- Time of day (simulated)
- Activity level (from profile)
- Random probability

---

## The LLM Call Pattern

### What happens when an agent "wakes up":

```python
async def perform_action_by_llm(self):
    # 1. Build observation from environment
    env_prompt = await self.env.to_text_prompt()
    # "You see: Post from @alice: 'Bitcoin is pumping!'"
    
    # 2. Build full prompt
    user_msg = f"""
    {self.system_message.content}  # Your persona
    
    Current environment:
    {env_prompt}
    
    What do you want to do?
    """
    
    # 3. Call LLM (this is the expensive part!)
    response = await self.model.generate(user_msg)
    
    # 4. Parse action from response
    action = parse_action(response)
    return action
```

**Cost**: 1 LLM call per active agent per round.

**For 100 agents, 10 rounds, 10 active per round**:
- 100 LLM calls total
- ~$0.50-2.00 depending on model

---

## Scaling to 1 Million Agents

### The Secret: Sparse Activation

```python
# Not all 1M agents act every round!

class TimeEngine:
    def select_active_agents(self, all_agents):
        active = []
        for agent in all_agents:
            # Probability based on:
            # - Time of day (peak hours = higher chance)
            # - Agent's activity level (from profile)
            # - Random noise
            
            prob = self.calculate_activity_probability(agent)
            if random.random() < prob:
                active.append(agent.id)
        
        # Return only ~1-5% of all agents
        return active
```

**Reality**: 
- 1 million agents exist in memory
- Only ~10,000-50,000 are active per round
- ~10,000 LLM calls per round (not 1 million!)

---

## Parallelization Strategy

### Batched LLM Calls

```python
async def step(self):
    active_agents = self.select_active_agents()
    
    # Option 1: Sequential (simpler, slower)
    for agent_id in active_agents:
        agent = self.agent_graph.get_agent(agent_id)
        await agent.perform_action_by_llm()  # One at a time
    
    # Option 2: Parallel (faster, more complex)
    tasks = []
    for agent_id in active_agents:
        agent = self.agent_graph.get_agent(agent_id)
        tasks.append(agent.perform_action_by_llm())
    
    # Run all at once (limited by API rate limits)
    await asyncio.gather(*tasks)
```

**OASIS uses**: Batched parallel calls with rate limiting.

---

## For Polymarket: Simplified Version

You don't need full OASIS. Just this:

```python
import asyncio
from openai import AsyncOpenAI

class PolymarketAgent:
    def __init__(self, agent_id, persona, model):
        self.id = agent_id
        self.persona = persona  # The system prompt
        self.model = model      # Shared LLM
        self.memory = []        # Own memory
    
    async def analyze(self, market_data):
        prompt = f"""
        {self.persona}
        
        Market: {market_data['question']}
        Price: {market_data['price']}
        Volume: {market_data['volume']}
        
        Analyze and return: BUY, SELL, or HOLD?
        """
        
        response = await self.model.chat.completions.create(
            model="gpt-4",
            messages=[{"role": "user", "content": prompt}]
        )
        
        return {
            'agent_id': self.id,
            'decision': response.choices[0].message.content,
            'market': market_data['question']
        }

# Create 100 agents (just objects!)
async def main():
    client = AsyncOpenAI()
    
    personas = [
        "You are a news trader...",
        "You are a chartist...",
        # ... 98 more
    ]
    
    agents = [
        PolymarketAgent(i, persona, client)
        for i, persona in enumerate(personas)
    ]
    
    # Scan 50 markets
    markets = await fetch_polymarket_markets(limit=50)
    
    # Each agent analyzes each market
    for market in markets:
        tasks = [agent.analyze(market) for agent in agents]
        results = await asyncio.gather(*tasks)
        
        # Aggregate: Count BUY vs SELL vs HOLD
        buys = sum(1 for r in results if 'BUY' in r['decision'])
        sells = sum(1 for r in results if 'SELL' in r['decision'])
        
        if buys > 70:  # 70% consensus
            print(f"STRONG BUY: {market['question']} ({buys}/100)")

asyncio.run(main())
```

---

## Summary

| Question | Answer |
|----------|--------|
| How many processes? | **1** (single Python process) |
| How many LLMs? | **1** (shared client) |
| How many agents? | **100 objects** (or 1 million) |
| How do they "run"? | Sequential or batched LLM calls |
| Memory per agent? | ~2-5 KB (just prompt + memory buffer) |
| Cost for 100 agents? | ~$0.50-2.00 per round |

**The magic**: It's not parallel computing. It's **sparse activation** + **batched LLM calls** + **clever prompt engineering**.
