#!/usr/bin/env node
// preview.js - Fetch skill preview with When to Use extraction

const https = require('https');

const SKILL_URL_BASE = 'https://raw.githubusercontent.com/obulai/obul-apis/main/skills';

function fetchUrl(url) {
  return new Promise((resolve, reject) => {
    https.get(url, (res) => {
      if (res.statusCode === 404) {
        reject(new Error('404'));
        return;
      }
      if (res.statusCode !== 200) {
        reject(new Error(`HTTP ${res.statusCode}`));
        return;
      }
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => resolve(data));
    }).on('error', reject);
  });
}

function parseYamlHeader(content) {
  const match = content.match(/^---\n([\s\S]*?)\n---/);
  if (!match) return null;
  
  const yaml = match[1];
  const metadata = {};
  let currentKey = null;
  let currentObj = metadata;
  const stack = [];
  
  yaml.split('\n').forEach(line => {
    // Check for nested object start
    if (line.trim().endsWith(':')) {
      const key = line.trim().slice(0, -1);
      currentObj[key] = {};
      stack.push({ obj: currentObj, key });
      currentObj = currentObj[key];
      return;
    }
    
    // Check for key-value pair
    const colonIndex = line.indexOf(':');
    if (colonIndex > 0) {
      const key = line.slice(0, colonIndex).trim();
      let value = line.slice(colonIndex + 1).trim();
      
      // Remove quotes if present
      if ((value.startsWith('"') && value.endsWith('"')) ||
          (value.startsWith("'") && value.endsWith("'"))) {
        value = value.slice(1, -1);
      }
      
      currentObj[key] = value;
    }
  });
  
  return metadata;
}

function extractWhenToUse(body) {
  // Find the "## When to Use" section
  const sectionMatch = body.match(/## When to Use\n([\s\S]*?)(?=\n## |$)/);
  
  if (!sectionMatch) {
    return null;
  }
  
  const sectionContent = sectionMatch[1].trim();
  if (!sectionContent) {
    return [];
  }
  
  // Extract bullet points (lines starting with - or *)
  const bullets = [];
  const lines = sectionContent.split('\n');
  let currentBullet = '';
  
  for (const line of lines) {
    const trimmed = line.trim();
    
    // Check if this is a new bullet point
    if (trimmed.startsWith('- ') || trimmed.startsWith('* ')) {
      // Save previous bullet if exists
      if (currentBullet) {
        bullets.push(cleanBullet(currentBullet));
      }
      // Start new bullet (remove the bullet marker)
      currentBullet = trimmed.slice(2);
    } else if (trimmed && currentBullet) {
      // Continuation of previous bullet (indented content)
      currentBullet += ' ' + trimmed;
    }
  }
  
  // Don't forget the last bullet
  if (currentBullet) {
    bullets.push(cleanBullet(currentBullet));
  }
  
  return bullets.length > 0 ? bullets : [];
}

function cleanBullet(text) {
  return text
    .replace(/\*\*/g, '')  // Remove bold markers
    .replace(/\s+/g, ' ')   // Normalize whitespace
    .trim();
}

// CLI
const skillName = process.argv[2];
if (!skillName) {
  console.log('Usage: preview.js <skill-name>');
  console.log('Example: preview.js obul-firecrawl');
  process.exit(1);
}

const url = `${SKILL_URL_BASE}/${skillName}/SKILL.md`;

fetchUrl(url).then(content => {
  const header = parseYamlHeader(content);
  const body = content.replace(/^---\n[\s\S]*?\n---\n*/, '').trim();
  
  // Extract When to Use section
  const whenToUse = extractWhenToUse(body);
  
  const result = {
    name: skillName,
    description: header?.description || null,
    whenToUse: whenToUse,
    url
  };

  console.log(JSON.stringify(result, null, 2));
}).catch(err => {
  if (err.message === '404') {
    console.error(`Skill not found: ${skillName}`);
    console.error(`Looking for: ${url}`);
  } else {
    console.error('Error fetching skill:', err.message);
  }
  process.exit(1);
});
