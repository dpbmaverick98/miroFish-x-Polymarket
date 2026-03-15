#!/usr/bin/env node
// fetch.js - Fetch skill metadata from SKILL.md YAML header

const https = require('https');
const path = require('path');

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

// CLI
const skillName = process.argv[2];
if (!skillName) {
  console.log('Usage: fetch.js <skill-name>');
  console.log('Example: fetch.js obul-firecrawl');
  process.exit(1);
}

const url = `${SKILL_URL_BASE}/${skillName}/SKILL.md`;

fetchUrl(url).then(content => {
  const header = parseYamlHeader(content);
  const body = content.replace(/^---\n[\s\S]*?\n---\n*/, '').trim();

  const result = {
    name: skillName,
    header,
    bodyPreview: body.substring(0, 500) + (body.length > 500 ? '...' : ''),
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
