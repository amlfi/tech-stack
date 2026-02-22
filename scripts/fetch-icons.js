#!/usr/bin/env node

const fs = require('fs-extra');
const path = require('node:path');
const https = require('node:https');

const TOOLS_DIR = path.join(__dirname, '..', 'content', 'tools');
const API_KEY = process.env.MACOSICONS_API_KEY;

if (!API_KEY) {
  console.error('Error: MACOSICONS_API_KEY environment variable is required');
  console.error('Get your key at https://macosicons.com (sign in → API Management)');
  process.exit(1);
}

function postJSON(url, data, headers) {
  return new Promise((resolve, reject) => {
    const body = JSON.stringify(data);
    const parsed = new URL(url);
    const req = https.request(
      {
        hostname: parsed.hostname,
        path: parsed.pathname,
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Content-Length': Buffer.byteLength(body),
          ...headers,
        },
      },
      (res) => {
        const chunks = [];
        res.on('data', (chunk) => chunks.push(chunk));
        res.on('end', () => {
          const text = Buffer.concat(chunks).toString();
          if (res.statusCode !== 200) {
            return reject(new Error(`HTTP ${res.statusCode}: ${text}`));
          }
          try {
            resolve(JSON.parse(text));
          } catch {
            reject(new Error(`Invalid JSON: ${text.slice(0, 200)}`));
          }
        });
        res.on('error', reject);
      },
    );
    req.on('error', reject);
    req.write(body);
    req.end();
  });
}

function parseFrontmatter(content) {
  const match = content.match(/^---\n([\s\S]+?)\n---\n([\s\S]*)$/);
  if (!match) return null;
  return { yaml: match[1], body: match[2] };
}

function setIconInFrontmatter(yaml, iconUrl) {
  if (/^icon:/m.test(yaml)) {
    return yaml.replace(/^icon:.*$/m, `icon: "${iconUrl}"`);
  }
  return yaml.replace(/^(url:.*$)/m, `$1\nicon: "${iconUrl}"`);
}

async function main() {
  const files = (await fs.readdir(TOOLS_DIR, { recursive: true })).filter((f) => f.endsWith('.md'));
  console.log(`Found ${files.length} tool files\n`);

  let updated = 0;
  let skipped = 0;
  let failed = 0;

  for (const file of files) {
    const slug = path.basename(file, '.md');
    const filePath = path.join(TOOLS_DIR, file);
    const content = await fs.readFile(filePath, 'utf-8');
    const parsed = parseFrontmatter(content);

    if (!parsed) {
      console.log(`  - ${slug}: no frontmatter, skipping`);
      skipped++;
      continue;
    }

    // Check if icon already set to a URL
    const existingIcon = parsed.yaml.match(/^icon:\s*['"]?(https?:\/\/[^'"\n]+)['"]?/m);
    if (existingIcon) {
      console.log(`  . ${slug}: already has CDN URL`);
      skipped++;
      continue;
    }

    // Get app name from frontmatter
    const nameMatch = parsed.yaml.match(/^name:\s*['"]?([^'"\n]+)['"]?/m);
    if (!nameMatch) {
      console.log(`  - ${slug}: no name field, skipping`);
      skipped++;
      continue;
    }

    const appName = nameMatch[1].trim();

    try {
      const result = await postJSON(
        'https://api.macosicons.com/api/search',
        { query: appName },
        { 'x-api-key': API_KEY },
      );

      // Find best match - prefer exact name match
      const hits = Array.isArray(result) ? result : result.hits || result.results || [];
      if (!hits.length) {
        console.log(`  x ${slug}: no results for "${appName}"`);
        failed++;
        continue;
      }

      // Pick the best result (first match, highest downloads)
      const best =
        hits.find((h) => h.appName?.toLowerCase() === appName.toLowerCase()) || hits[0];
      const iconUrl = best.lowResPngUrl || best.iOSUrl || best.icnsUrl;

      if (!iconUrl) {
        console.log(`  x ${slug}: no icon URL in result for "${appName}"`);
        failed++;
        continue;
      }

      // Update frontmatter with CDN URL
      const updatedYaml = setIconInFrontmatter(parsed.yaml, iconUrl);
      const updatedContent = `---\n${updatedYaml}\n---\n${parsed.body}`;
      await fs.writeFile(filePath, updatedContent);

      console.log(`  + ${slug}: ${iconUrl.slice(0, 80)}...`);
      updated++;

      // Rate limit — macosicons.com free tier has strict limits
      await new Promise((r) => setTimeout(r, 2000));
    } catch (err) {
      console.log(`  x ${slug}: ${err.message}`);
      failed++;
    }
  }

  console.log(`\nDone: ${updated} updated, ${skipped} skipped, ${failed} failed`);
}

main().catch((err) => {
  console.error('Script failed:', err);
  process.exit(1);
});
