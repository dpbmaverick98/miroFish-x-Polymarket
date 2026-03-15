#!/usr/bin/env node
// search.js - Search APIs by keyword or use case

const https = require('https');

const APIS_JSON_URL = 'https://raw.githubusercontent.com/obulai/obul-apis/main/apis.json';

function fetchJson(url) {
  return new Promise((resolve, reject) => {
    https.get(url, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => resolve(JSON.parse(data)));
    }).on('error', reject);
  });
}

async function search(query) {
  const q = query.toLowerCase();
  const apis = await fetchJson(APIS_JSON_URL);
  
  return apis.apis.filter(api => {
    const text = `${api.name} ${api.description} ${api.category}`.toLowerCase();
    return text.includes(q);
  });
}

// CLI
const query = process.argv.slice(2).join(' ');
if (!query) {
  console.log('Usage: search.js <query>');
  console.log('Example: search.js "scrape website"');
  process.exit(1);
}

search(query).then(results => console.log(JSON.stringify(results, null, 2)));
