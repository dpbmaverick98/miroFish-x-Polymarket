# Using MiniMax LLMs in MiroFish

MiroFish supports MiniMax models as an alternative LLM provider. MiniMax offers high-performance models with competitive pricing and OpenAI-compatible API.

---

## Why MiniMax?

| Feature | MiniMax | Typical OpenAI |
|---------|---------|----------------|
| Context Window | 204,800 tokens | 128K (GPT-4) |
| Output Speed | 60-100 tps | 20-40 tps |
| Pricing | Competitive | Premium |
| Reasoning | Interleaved thinking | Separate |
| Chinese | Native optimization | Translation layer |

**Recommended for:**
- Long document processing (200K context)
- High-throughput simulations
- Chinese language predictions
- Cost-sensitive deployments

---

## Configuration

### 1. Get API Key

1. Visit https://platform.minimax.io/
2. Create account and verify
3. Generate API key from dashboard
4. Copy key for configuration

### 2. Configure MiroFish

Edit `mirofish/.env`:

```bash
# Option A: Replace default LLM entirely
LLM_API_KEY=your_minimax_key_here
LLM_BASE_URL=https://api.minimax.io/v1
LLM_MODEL_NAME=MiniMax-M2.5

# Option B: Use MiniMax as boost LLM (faster/cheaper for simple tasks)
LLM_BOOST_API_KEY=your_minimax_key_here
LLM_BOOST_BASE_URL=https://api.minimax.io/v1
LLM_BOOST_MODEL_NAME=MiniMax-M2.5-highspeed
```

### 3. Verify Setup

```bash
cd mirofish
npm run backend

# Check logs for successful LLM connection
# Should show: "LLM configured: MiniMax-M2.5"
```

---

## Available Models

| Model | Speed | Best For |
|-------|-------|----------|
| `MiniMax-M2.5` | ~60 tps | Complex reasoning, agent simulation |
| `MiniMax-M2.5-highspeed` | ~100 tps | Fast responses, high throughput |
| `MiniMax-M2.1` | ~60 tps | Multi-language, programming |
| `MiniMax-M2.1-highspeed` | ~100 tps | Balanced speed/quality |
| `MiniMax-M2` | ~60 tps | Agentic capabilities |

**Recommendation for MiroFish:**
- **Simulation engine**: `MiniMax-M2.5` (best reasoning)
- **Report generation**: `MiniMax-M2.5` or `MiniMax-M2.1`
- **Simple queries**: `MiniMax-M2.5-highspeed` (as boost)

---

## Testing the Connection

### Quick Test Script

```bash
# Test MiniMax API directly
curl https://api.minimax.io/v1/chat/completions \
  -H "Authorization: Bearer $LLM_API_KEY" \
  -H "Content-Type: application/json" \
  -d '{
    "model": "MiniMax-M2.5",
    "messages": [
      {"role": "system", "content": "You are a prediction market analyst."},
      {"role": "user", "content": "Analyze: Will Bitcoin reach $100k by end of 2025? Current price: $67k, market odds: 35%"}
    ],
    "temperature": 1.0
  }'
```

### MiroFish Integration Test

```bash
# Create a simple test prediction
curl -X POST http://localhost:5001/api/graph/ontology/generate \
  -F "files=@test.txt" \
  -F "simulation_requirement=Test MiniMax integration" \
  -F "project_name=MiniMax_Test"

# Check backend logs for LLM calls
```

---

## Advanced: Interleaved Thinking

MiniMax supports separating reasoning from final output:

```python
# Example Python setup for reasoning_split
response = client.chat.completions.create(
    model="MiniMax-M2.5",
    messages=[...],
    extra_body={"reasoning_split": True},  # Separate thinking
)

# Access reasoning
reasoning = response.choices[0].message.reasoning_details[0]['text']
# Access final answer
answer = response.choices[0].message.content
```

**Note:** MiroFish's OASIS engine handles this automatically. No code changes needed.

---

## Cost Estimation

MiniMax pricing (check https://platform.minimax.io/pricing for current rates):

| Operation | Typical Tokens | Estimated Cost |
|-----------|---------------|----------------|
| Ontology generation | 50K input / 5K output | ~$0.15 |
| Single agent turn | 10K input / 2K output | ~$0.03 |
| 40-round simulation | 800K total | ~$2-4 |
| Report generation | 100K input / 20K output | ~$0.30 |

**Full prediction (40 rounds):** ~$3-6 USD

Compare to qwen-plus: Similar pricing, but MiniMax offers larger context window.

---

## Troubleshooting

### Issue: "Invalid API key"
```bash
# Verify key format (should start with specific prefix)
echo $LLM_API_KEY | head -c 20

# Test with direct curl
curl https://api.minimax.io/v1/models \
  -H "Authorization: Bearer $LLM_API_KEY"
```

### Issue: "Model not found"
- Check model name spelling: `MiniMax-M2.5` (not `minimax-m2.5`)
- Verify model is available in your region
- Check https://platform.minimax.io/docs for latest models

### Issue: Temperature errors
```bash
# MiniMax requires temperature in (0.0, 1.0]
# MiroFish default is usually fine, but if customizing:
# Valid: 0.1, 0.5, 0.7, 1.0
# Invalid: 0.0 (exclusive)
```

### Issue: Slow responses
- Switch to `-highspeed` variant
- Check your network to MiniMax servers
- Consider using as `LLM_BOOST` for simple tasks only

---

## Migration from qwen-plus

If switching from Alibaba Bailian:

| Before (qwen-plus) | After (MiniMax) |
|-------------------|-----------------|
| `LLM_BASE_URL=https://dashscope...` | `LLM_BASE_URL=https://api.minimax.io/v1` |
| `LLM_MODEL_NAME=qwen-plus` | `LLM_MODEL_NAME=MiniMax-M2.5` |
| Context: 128K | Context: 204K (more room for documents) |

No code changes required in MiroFish — just update `.env`.

---

## Resources

- **MiniMax Platform**: https://platform.minimax.io/
- **API Documentation**: https://platform.minimax.io/docs/
- **Model Overview**: https://platform.minimax.io/docs/models
- **Pricing**: https://platform.minimax.io/pricing

---

## Next Steps

1. Get API key from MiniMax platform
2. Update `mirofish/.env` with credentials
3. Run a test prediction
4. Compare results with previous LLM provider
5. Adjust model selection based on speed/quality needs
