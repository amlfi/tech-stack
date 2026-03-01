#!/usr/bin/env node

/**
 * sync-airtable.js — Sync tool entries between markdown files and Airtable.
 *
 * Usage:
 *   node scripts/sync-airtable.js setup   # Create table + import all tools
 *   node scripts/sync-airtable.js push    # Markdown → Airtable (upsert)
 *   node scripts/sync-airtable.js pull    # Airtable → Markdown (update frontmatter)
 *   node scripts/sync-airtable.js status  # Show sync status / diff
 */

const http = require('http');
const https = require('https');
const fs = require('fs');
const path = require('path');

const CONTENT_DIR = path.join(__dirname, '..', 'content');
const TOOLS_DIR = path.join(CONTENT_DIR, 'tools');
const BASE_ID = 'appEXHu3lADOVK0HS';
const CONFIG_PATH = path.join(__dirname, '..', '.airtable-sync.json');

// ─── Secrets ─────────────────────────────────────────────────────────────────

function fetchSecret(itemName, field) {
  return new Promise((resolve, reject) => {
    const body = JSON.stringify({ item_name: itemName, vault: 'mcpassistant', field });
    const req = http.request({
      hostname: 'localhost', port: 9102,
      path: '/api/secrets/get',
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'Content-Length': Buffer.byteLength(body) },
      timeout: 5000,
    }, (res) => {
      let data = '';
      res.on('data', c => data += c);
      res.on('end', () => { try { resolve(JSON.parse(data)); } catch { reject(new Error('Bad JSON')); } });
    });
    req.on('error', reject);
    req.write(body);
    req.end();
  });
}

// ─── Airtable API ────────────────────────────────────────────────────────────

function airtableRequest(pat, method, apiPath, body) {
  return new Promise((resolve, reject) => {
    const bodyStr = body ? JSON.stringify(body) : null;
    const req = https.request({
      hostname: 'api.airtable.com',
      path: apiPath,
      method,
      headers: {
        'Authorization': 'Bearer ' + pat,
        'Content-Type': 'application/json',
        ...(bodyStr ? { 'Content-Length': Buffer.byteLength(bodyStr) } : {}),
      },
      timeout: 30000,
    }, (res) => {
      let data = '';
      res.on('data', c => data += c);
      res.on('end', () => {
        try { resolve({ status: res.statusCode, data: JSON.parse(data) }); }
        catch { resolve({ status: res.statusCode, data: { raw: data.slice(0, 500) } }); }
      });
    });
    req.on('error', reject);
    if (bodyStr) req.write(bodyStr);
    req.end();
  });
}

function delay(ms) { return new Promise(r => setTimeout(r, ms)); }

// ─── Markdown Parsing ────────────────────────────────────────────────────────

function parseFrontmatter(content) {
  const match = content.match(/^---\n([\s\S]*?)\n---\n?([\s\S]*)/);
  if (!match) return { fields: {}, body: content };

  const fields = {};
  const lines = match[1].split('\n');
  for (const line of lines) {
    const m = line.match(/^(\w+):\s*(.*)/);
    if (!m) continue;
    let [, key, val] = m;
    val = val.trim();

    // Parse arrays
    if (val.startsWith('[') && val.endsWith(']')) {
      val = val.slice(1, -1).split(',').map(s => s.trim().replace(/^["']|["']$/g, '')).filter(Boolean);
    }
    // Parse booleans
    else if (val === 'true') val = true;
    else if (val === 'false') val = false;
    // Strip quotes
    else if ((val.startsWith('"') && val.endsWith('"')) || (val.startsWith("'") && val.endsWith("'"))) {
      val = val.slice(1, -1);
    }

    fields[key] = val;
  }

  const body = match[2].trim();
  return { fields, body };
}

function generateMarkdown(fields, body) {
  const lines = ['---'];
  const fieldOrder = ['name', 'type', 'category', 'subcategory', 'description', 'url', 'icon',
    'tags', 'devices', 'display', 'status', 'featured', 'startedUsing', 'dateAdded',
    'previouslyUsed', 'replacedBy'];

  for (const key of fieldOrder) {
    if (fields[key] === undefined || fields[key] === null || fields[key] === '') continue;
    const val = fields[key];

    if (Array.isArray(val)) {
      lines.push(`${key}: [${val.map(v => `"${v}"`).join(', ')}]`);
    } else if (typeof val === 'boolean') {
      lines.push(`${key}: ${val}`);
    } else {
      lines.push(`${key}: "${val}"`);
    }
  }

  lines.push('---');
  lines.push('');
  lines.push(body || fields.description || '');
  lines.push('');
  return lines.join('\n');
}

function readAllTools() {
  const tools = [];
  const categories = fs.readdirSync(TOOLS_DIR);
  for (const cat of categories) {
    const catDir = path.join(TOOLS_DIR, cat);
    if (!fs.statSync(catDir).isDirectory()) continue;
    const files = fs.readdirSync(catDir).filter(f => f.endsWith('.md'));
    for (const file of files) {
      const slug = file.replace('.md', '');
      const content = fs.readFileSync(path.join(catDir, file), 'utf-8');
      const { fields, body } = parseFrontmatter(content);
      tools.push({ slug, category: cat, filePath: path.join(catDir, file), fields, body });
    }
  }
  return tools;
}

// ─── Config ──────────────────────────────────────────────────────────────────

function loadConfig() {
  if (fs.existsSync(CONFIG_PATH)) {
    return JSON.parse(fs.readFileSync(CONFIG_PATH, 'utf-8'));
  }
  return {};
}

function saveConfig(config) {
  fs.writeFileSync(CONFIG_PATH, JSON.stringify(config, null, 2) + '\n');
}

// ─── Commands ────────────────────────────────────────────────────────────────

async function setup(pat) {
  console.log('Creating Tools table in Airtable...\n');

  const allCategories = ['system', 'development', 'design', 'productivity', 'communication',
    'media', 'security', 'specialized', 'ai', 'finance', 'games'];

  const tableBody = {
    name: 'Tools',
    fields: [
      { name: 'slug', type: 'singleLineText' },
      { name: 'type', type: 'singleSelect', options: { choices: [{ name: 'mac' }, { name: 'ios' }, { name: 'web' }] } },
      { name: 'category', type: 'singleSelect', options: { choices: allCategories.map(c => ({ name: c })) } },
      { name: 'subcategory', type: 'singleLineText' },
      { name: 'description', type: 'singleLineText' },
      { name: 'url', type: 'url' },
      { name: 'icon', type: 'url' },
      { name: 'tags', type: 'multipleSelects', options: { choices: [] } },
      { name: 'devices', type: 'multipleSelects', options: { choices: [{ name: 'mbp' }, { name: 'studio' }, { name: 'ios' }] } },
      { name: 'display', type: 'checkbox', options: { color: 'greenBright', icon: 'check' } },
      { name: 'status', type: 'singleSelect', options: { choices: [{ name: 'active' }, { name: 'retired' }] } },
      { name: 'featured', type: 'checkbox', options: { color: 'yellowBright', icon: 'star' } },
      { name: 'body', type: 'multilineText' },
      { name: 'startedUsing', type: 'singleLineText' },
      { name: 'dateAdded', type: 'date', options: { dateFormat: { name: 'iso' } } },
      { name: 'previouslyUsed', type: 'singleLineText' },
      { name: 'replacedBy', type: 'singleLineText' },
    ],
  };

  // Note: Airtable auto-creates "Name" as the primary field, which we'll use for the tool name
  const result = await airtableRequest(pat, 'POST', `/v0/meta/bases/${BASE_ID}/tables`, tableBody);

  if (result.status !== 200) {
    console.error('Failed to create table:', JSON.stringify(result.data, null, 2));
    process.exit(1);
  }

  const tableId = result.data.id;
  console.log(`Table created: ${tableId}\n`);

  // Save config
  saveConfig({ tableId, baseId: BASE_ID });

  // Now push all tools
  await pushAll(pat, tableId);
}

async function pushAll(pat, tableId) {
  const tools = readAllTools();
  console.log(`Pushing ${tools.length} tools to Airtable...\n`);

  // Build records
  const records = tools.map(tool => {
    const f = tool.fields;
    const record = {
      fields: {
        'name': f.name || tool.slug,
        'slug': tool.slug,
        'type': f.type || 'mac',
        'category': f.category || tool.category,
        'subcategory': f.subcategory || '',
        'description': f.description || '',
        'url': f.url || '',
        'icon': f.icon || '',
        'display': f.display === true || f.display === 'true',
        'status': f.status || 'active',
        'featured': f.featured === true || f.featured === 'true',
        'startedUsing': f.startedUsing || '',
        'previouslyUsed': f.previouslyUsed || '',
        'replacedBy': f.replacedBy || '',
      },
    };

    // Tags — array for multipleSelects
    if (Array.isArray(f.tags) && f.tags.length > 0) {
      record.fields.tags = f.tags;
    }

    // Devices — array for multipleSelects
    if (Array.isArray(f.devices) && f.devices.length > 0) {
      record.fields.devices = f.devices;
    }

    // Body text
    if (tool.body) {
      record.fields.body = tool.body;
    }

    // dateAdded — must be ISO format for date field
    if (f.dateAdded) {
      record.fields.dateAdded = f.dateAdded;
    }

    return record;
  });

  // Batch create in groups of 10 (Airtable limit)
  let created = 0;
  for (let i = 0; i < records.length; i += 10) {
    const batch = records.slice(i, i + 10);
    const result = await airtableRequest(pat, 'POST', `/v0/${BASE_ID}/${tableId}`, {
      records: batch,
      typecast: true,
    });

    if (result.status !== 200) {
      console.error(`Batch ${Math.floor(i / 10) + 1} failed:`, JSON.stringify(result.data).slice(0, 300));
      continue;
    }

    created += result.data.records.length;
    const names = batch.map(r => r.fields.Name || r.fields.slug).join(', ');
    console.log(`  Batch ${Math.floor(i / 10) + 1}: ${names}`);

    // Rate limit: 5 requests/sec
    if (i + 10 < records.length) await delay(250);
  }

  console.log(`\nDone! ${created}/${records.length} records created.`);
}

async function pull(pat) {
  const config = loadConfig();
  if (!config.tableId) {
    console.error('No table ID found. Run setup first.');
    process.exit(1);
  }

  console.log('Pulling records from Airtable...\n');

  // Fetch all records (paginated)
  const allRecords = [];
  let offset = null;
  do {
    let apiPath = `/v0/${BASE_ID}/${config.tableId}?pageSize=100`;
    if (offset) apiPath += `&offset=${offset}`;
    const result = await airtableRequest(pat, 'GET', apiPath);

    if (result.status !== 200) {
      console.error('Failed to list records:', JSON.stringify(result.data).slice(0, 300));
      process.exit(1);
    }

    allRecords.push(...result.data.records);
    offset = result.data.offset || null;
  } while (offset);

  console.log(`  Fetched ${allRecords.length} records from Airtable\n`);

  // Read existing markdown files for comparison
  const localTools = readAllTools();
  const localBySlug = {};
  for (const t of localTools) {
    localBySlug[t.slug] = t;
  }

  let updated = 0;
  let created = 0;
  let unchanged = 0;

  for (const record of allRecords) {
    const f = record.fields;
    const slug = f.slug;
    if (!slug) continue;

    const category = f.category || 'specialized';
    const categoryDir = path.join(TOOLS_DIR, category);

    // Build fields object from Airtable record
    const fields = {
      name: f.name || slug,
      type: f.type || 'mac',
      category,
      subcategory: f.subcategory || '',
      description: f.description || '',
      url: f.url || '',
      icon: f.icon || '',
      tags: Array.isArray(f.tags) ? f.tags : [],
      devices: Array.isArray(f.devices) ? f.devices : [],
      display: f.display === true,
      status: f.status || 'active',
      featured: f.featured === true,
      startedUsing: f.startedUsing || '',
      dateAdded: f.dateAdded || '',
      previouslyUsed: f.previouslyUsed || '',
      replacedBy: f.replacedBy || '',
    };

    const body = f.body || fields.description || '';

    // Check if tool exists locally
    const local = localBySlug[slug];

    if (local) {
      // Check if category changed (file needs to move)
      if (local.category !== category) {
        // Delete old file
        if (fs.existsSync(local.filePath)) {
          fs.unlinkSync(local.filePath);
        }
        // Ensure new category dir exists
        if (!fs.existsSync(categoryDir)) {
          fs.mkdirSync(categoryDir, { recursive: true });
        }
      }
    }

    // Ensure category dir exists
    if (!fs.existsSync(categoryDir)) {
      fs.mkdirSync(categoryDir, { recursive: true });
    }

    const filePath = path.join(categoryDir, slug + '.md');
    const markdown = generateMarkdown(fields, body);

    if (local) {
      const existingContent = fs.readFileSync(local.filePath, 'utf-8');
      if (existingContent.trim() === markdown.trim()) {
        unchanged++;
        continue;
      }
      fs.writeFileSync(filePath, markdown);
      console.log(`  Updated: ${category}/${slug}.md`);
      updated++;
    } else {
      fs.writeFileSync(filePath, markdown);
      console.log(`  Created: ${category}/${slug}.md`);
      created++;
    }
  }

  console.log(`\nDone! ${updated} updated, ${created} created, ${unchanged} unchanged.`);
}

async function push(pat) {
  const config = loadConfig();
  if (!config.tableId) {
    console.error('No table ID found. Run setup first.');
    process.exit(1);
  }

  console.log('Fetching existing Airtable records...\n');

  // Get all existing records to find record IDs by slug
  const existingRecords = [];
  let offset = null;
  do {
    let apiPath = `/v0/${BASE_ID}/${config.tableId}?pageSize=100&fields[]=slug`;
    if (offset) apiPath += `&offset=${offset}`;
    const result = await airtableRequest(pat, 'GET', apiPath);

    if (result.status !== 200) {
      console.error('Failed to list records:', JSON.stringify(result.data).slice(0, 300));
      process.exit(1);
    }

    existingRecords.push(...result.data.records);
    offset = result.data.offset || null;
  } while (offset);

  const recordIdBySlug = {};
  for (const r of existingRecords) {
    if (r.fields.slug) recordIdBySlug[r.fields.slug] = r.id;
  }

  console.log(`  ${existingRecords.length} existing records in Airtable\n`);

  const tools = readAllTools();
  const toCreate = [];
  const toUpdate = [];

  for (const tool of tools) {
    const f = tool.fields;
    const record = {
      fields: {
        'name': f.name || tool.slug,
        'slug': tool.slug,
        'type': f.type || 'mac',
        'category': f.category || tool.category,
        'subcategory': f.subcategory || '',
        'description': f.description || '',
        'url': f.url || '',
        'icon': f.icon || '',
        'display': f.display === true || f.display === 'true',
        'status': f.status || 'active',
        'featured': f.featured === true || f.featured === 'true',
        'startedUsing': f.startedUsing || '',
        'previouslyUsed': f.previouslyUsed || '',
        'replacedBy': f.replacedBy || '',
      },
    };

    if (Array.isArray(f.tags) && f.tags.length > 0) record.fields.tags = f.tags;
    if (Array.isArray(f.devices) && f.devices.length > 0) record.fields.devices = f.devices;
    if (tool.body) record.fields.body = tool.body;
    if (f.dateAdded) record.fields.dateAdded = f.dateAdded;

    if (recordIdBySlug[tool.slug]) {
      record.id = recordIdBySlug[tool.slug];
      toUpdate.push(record);
    } else {
      toCreate.push(record);
    }
  }

  // Batch create new records
  if (toCreate.length > 0) {
    console.log(`Creating ${toCreate.length} new records...`);
    for (let i = 0; i < toCreate.length; i += 10) {
      const batch = toCreate.slice(i, i + 10);
      const result = await airtableRequest(pat, 'POST', `/v0/${BASE_ID}/${config.tableId}`, {
        records: batch,
        typecast: true,
      });
      if (result.status !== 200) {
        console.error(`  Create batch failed:`, JSON.stringify(result.data).slice(0, 300));
      } else {
        console.log(`  Created batch ${Math.floor(i / 10) + 1} (${batch.length} records)`);
      }
      if (i + 10 < toCreate.length) await delay(250);
    }
  }

  // Batch update existing records
  if (toUpdate.length > 0) {
    console.log(`Updating ${toUpdate.length} existing records...`);
    for (let i = 0; i < toUpdate.length; i += 10) {
      const batch = toUpdate.slice(i, i + 10);
      const result = await airtableRequest(pat, 'PATCH', `/v0/${BASE_ID}/${config.tableId}`, {
        records: batch,
        typecast: true,
      });
      if (result.status !== 200) {
        console.error(`  Update batch failed:`, JSON.stringify(result.data).slice(0, 300));
      } else {
        console.log(`  Updated batch ${Math.floor(i / 10) + 1} (${batch.length} records)`);
      }
      if (i + 10 < toUpdate.length) await delay(250);
    }
  }

  console.log(`\nDone! ${toCreate.length} created, ${toUpdate.length} updated.`);
}

async function status(pat) {
  const config = loadConfig();
  if (!config.tableId) {
    console.error('No table ID found. Run setup first.');
    process.exit(1);
  }

  // Count local tools
  const tools = readAllTools();
  const displayed = tools.filter(t => t.fields.display === true || t.fields.display === 'true');

  // Count Airtable records
  const result = await airtableRequest(pat, 'GET', `/v0/${BASE_ID}/${config.tableId}?pageSize=1`);
  const airtableNote = result.status === 200 ? 'connected' : 'error';

  console.log(`Local:    ${tools.length} tools (${displayed.length} displayed)`);
  console.log(`Airtable: ${airtableNote} (table: ${config.tableId})`);
  console.log(`Base:     ${BASE_ID}`);
}

// ─── Main ────────────────────────────────────────────────────────────────────

async function main() {
  const command = process.argv[2];
  if (!command || !['setup', 'push', 'pull', 'status'].includes(command)) {
    console.log('Usage: node scripts/sync-airtable.js <setup|push|pull|status>');
    process.exit(1);
  }

  // Get Airtable PAT
  const result = await fetchSecret('airtable.com_mcpassistant', 'credential');
  const pat = result.item?.value || result.value || result.item;
  if (!pat || typeof pat !== 'string') {
    console.error('Could not retrieve Airtable PAT from 1Password');
    process.exit(1);
  }

  switch (command) {
    case 'setup': return setup(pat);
    case 'push': return push(pat);
    case 'pull': return pull(pat);
    case 'status': return status(pat);
  }
}

main().catch(e => console.error('Failed:', e.message));
