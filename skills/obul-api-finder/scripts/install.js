#!/usr/bin/env node
// install.js - Install skill to ~/.claude/skills/

const https = require('https');
const fs = require('fs');
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

async function installSkill(skillName, silent = false) {
  const targetDir = path.join(process.env.HOME, '.claude', 'skills', skillName);
  const url = `${SKILL_URL_BASE}/${skillName}/SKILL.md`;
  
  try {
    const content = await fetchUrl(url);
    
    // Create target directory
    fs.mkdirSync(targetDir, { recursive: true });
    
    // Write SKILL.md
    fs.writeFileSync(path.join(targetDir, 'SKILL.md'), content);
    
    if (!silent) {
      console.log(`✅ Installed: ${skillName}`);
      console.log(`   Location: ${targetDir}`);
      console.log(`   Usage: /${skillName}: <command>`);
    }
    return true;
  } catch (err) {
    if (err.message === '404') {
      if (!silent) {
        console.error(`❌ Skill not found: ${skillName}`);
        console.error(`   Looking for: ${url}`);
      }
    } else {
      if (!silent) {
        console.error(`❌ Error installing skill: ${err.message}`);
      }
    }
    return false;
  }
}

async function ensureErrorsSkill() {
  const errorsDir = path.join(process.env.HOME, '.claude', 'skills', 'obul-api-errors');
  
  // Check if already installed
  if (fs.existsSync(errorsDir)) {
    return;
  }
  
  console.log('');
  console.log('📦 Installing obul-api-errors (companion skill)...');
  
  const installed = await installSkill('obul-api-errors', true);
  
  if (installed) {
    console.log(`✅ Installed: obul-api-errors`);
    console.log(`   Location: ${errorsDir}`);
    console.log(`   Purpose: Reference guide for HTTP error codes from Obul proxy`);
  } else {
    console.log(`⚠️  Failed to install obul-api-errors (optional)`);
  }
}

// CLI
const skillName = process.argv[2];
if (!skillName) {
  console.log('Usage: install.js <skill-name>');
  console.log('Example: install.js obul-firecrawl');
  process.exit(1);
}

// Install requested skill and ensure obul-api-errors is also installed
installSkill(skillName).then(success => {
  if (success && skillName !== 'obul-api-errors') {
    return ensureErrorsSkill();
  }
}).catch(err => {
  console.error(`❌ Unexpected error: ${err.message}`);
  process.exit(1);
});
