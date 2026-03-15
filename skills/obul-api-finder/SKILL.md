---
name: obul-api-finder
description: 'USE THIS SKILL WHEN: the user wants to find, explore, or install Obul API skills. Searches the local api catalog, fetches skill metadata, and installs skills to .claude folder.'
metadata:
  obul-skill:
    emoji: 🔧
    requires:
      env:
      - OBUL_API_KEY
      primaryEnv: OBUL_API_KEY
provider: obul
---

# Obul API Finder

Manage Obul API skills - search, fetch, and install locally.

## Overview

This skill provides tools to:
- **Search** the API catalog by keyword or use case
- **Preview** skill details with "When to Use" extraction
- **Fetch** skill metadata and documentation
- **Install** skills to `~/.claude/skills/` for immediate use

## Commands

### Search APIs

Find APIs by keyword, category, or use case:

```bash
node skills/obul-api-finder/scripts/search.js "scrape website"
node skills/obul-api-finder/scripts/search.js "find email"
node skills/obul-api-finder/scripts/search.js "crypto price"
```

Returns: Matching APIs with name, category, description, and skill path.

### Preview Skill

Get structured preview with "When to Use" use cases:

```bash
node skills/obul-api-finder/scripts/preview.js obul-firecrawl
node skills/obul-api-finder/scripts/preview.js obul-apollo
```

Returns: JSON with name, description, and whenToUse array. Great for understanding when to invoke a skill.

### Fetch Skill Info

Get detailed skill metadata from SKILL.md:

```bash
node skills/obul-api-finder/scripts/fetch.js obul-firecrawl
node skills/obul-api-finder/scripts/fetch.js obul-apollo
```

Returns: YAML header (name, description, requirements) + documentation preview.

### Install Skill

Copy a skill to `~/.claude/skills/`:

```bash
node skills/obul-api-finder/scripts/install.js obul-firecrawl
node skills/obul-api-finder/scripts/install.js obul-apollo
```

After install, the skill is immediately available in Claude Code.

### List All Skills

Browse all available skills by category:

```bash
node skills/obul-api-finder/scripts/list.js
node skills/obul-api-finder/scripts/list.js "web-scraping"
```

## Example Workflow

```bash
# 1. Search for what you need
$ node skills/obul-api-finder/scripts/search.js "scrape"
[
  {
    "name": "firecrawl",
    "category": "web-scraping",
    "skill": "obul-firecrawl",
    "description": "Scrape URLs, crawl websites, extract structured data"
  }
]

# 2. Preview to see when to use it
$ node skills/obul-api-finder/scripts/preview.js obul-firecrawl
{
  "name": "obul-firecrawl",
  "description": "USE THIS SKILL WHEN: ...",
  "whenToUse": [
    "Web scraping — Scrape any URL to clean markdown...",
    "Site discovery — Map all URLs on a website...",
    "Bulk content ingestion — Crawl entire websites..."
  ]
}

# 3. Install it
$ node skills/obul-api-finder/scripts/install.js obul-firecrawl
✅ Installed: obul-firecrawl
   Location: ~/.claude/skills/obul-firecrawl
   Usage: /obul-firecrawl: <command>

# 4. Use in Claude
/obul-firecrawl:scrape https://example.com
```

## File Locations

| File | Purpose |
|------|---------|
| `scripts/search.js` | Search apis.json catalog |
| `scripts/preview.js` | Preview skill with When to Use extraction |
| `scripts/fetch.js` | Parse SKILL.md YAML header |
| `scripts/install.js` | Copy skill to ~/.claude/skills/ |
| `scripts/list.js` | List all skills by category |

## Data Sources

- **API Catalog**: `https://raw.githubusercontent.com/obulai/obul-apis/main/apis.json` (all 50+ APIs)
- **Skill Docs**: `https://raw.githubusercontent.com/obulai/obul-apis/main/skills/{skill-name}/SKILL.md`
- **Install Target**: `~/.claude/skills/{skill-name}/`

## Best Practices

- **For errors** — See @skills/obul-api-errors/SKILL.md for complete error code reference and troubleshooting
