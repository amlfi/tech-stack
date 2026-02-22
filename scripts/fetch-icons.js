#!/usr/bin/env node

const fs = require('fs-extra');
const path = require('node:path');
const https = require('node:https');
const http = require('node:http');

const TOOLS_DIR = path.join(__dirname, '..', 'content', 'tools');
const ICONS_DIR = path.join(__dirname, '..', 'src', 'images', 'tools');
const LOGO_DEV_TOKEN = process.env.LOGO_DEV_TOKEN || 'pk_fctNp1NYTZmRknBPTNcziA';

function extractDomain(url) {
  try {
    const parsed = new URL(url);
    return parsed.hostname.replace(/^www\./, '');
  } catch {
    return null;
  }
}

function fetchFile(url) {
  return new Promise((resolve, reject) => {
    const client = url.startsWith('https') ? https : http;
    client
      .get(url, { headers: { 'User-Agent': 'txstack-icon-fetcher/1.0' } }, (res) => {
        if (res.statusCode >= 300 && res.statusCode < 400 && res.headers.location) {
          return fetchFile(res.headers.location).then(resolve).catch(reject);
        }
        if (res.statusCode !== 200) {
          return reject(new Error(`HTTP ${res.statusCode} for ${url}`));
        }
        const chunks = [];
        res.on('data', (chunk) => chunks.push(chunk));
        res.on('end', () => resolve(Buffer.concat(chunks)));
        res.on('error', reject);
      })
      .on('error', reject);
  });
}

function parseFrontmatter(content) {
  const match = content.match(/^---\n([\s\S]+?)\n---\n([\s\S]*)$/);
  if (!match) return null;
  return { yaml: match[1], body: match[2], raw: content };
}

function addIconToFrontmatter(yaml, iconFilename) {
  if (/^icon:/m.test(yaml)) {
    return yaml.replace(/^icon:.*$/m, `icon: "${iconFilename}"`);
  }
  // Add after url field
  return yaml.replace(/^(url:.*$)/m, `$1\nicon: "${iconFilename}"`);
}

async function main() {
  await fs.ensureDir(ICONS_DIR);

  const files = (await fs.readdir(TOOLS_DIR)).filter((f) => f.endsWith('.md'));
  console.log(`Found ${files.length} tool files\n`);

  let fetched = 0;
  let skipped = 0;
  let failed = 0;

  for (const file of files) {
    const slug = path.basename(file, '.md');
    const filePath = path.join(TOOLS_DIR, file);
    const content = await fs.readFile(filePath, 'utf-8');
    const parsed = parseFrontmatter(content);

    if (!parsed) {
      console.log(`  ⚠ ${slug}: no frontmatter, skipping`);
      skipped++;
      continue;
    }

    // Check if icon already exists locally
    const iconPath = path.join(ICONS_DIR, `${slug}.png`);
    if (await fs.pathExists(iconPath)) {
      console.log(`  ✓ ${slug}: icon already exists`);
      skipped++;
      continue;
    }

    // Extract domain from url field
    const urlMatch = parsed.yaml.match(/^url:\s*['"]?([^'"\n]+)['"]?/m);
    if (!urlMatch) {
      console.log(`  ⚠ ${slug}: no URL field, skipping`);
      skipped++;
      continue;
    }

    const domain = extractDomain(urlMatch[1].trim());
    if (!domain) {
      console.log(`  ⚠ ${slug}: invalid URL, skipping`);
      skipped++;
      continue;
    }

    // Fetch from logo.dev
    const logoUrl = `https://img.logo.dev/${domain}?token=${LOGO_DEV_TOKEN}&size=128&format=png`;

    try {
      const buffer = await fetchFile(logoUrl);

      // Check we got a real image (not an error page)
      if (buffer.length < 100) {
        console.log(`  ✗ ${slug}: response too small (${buffer.length} bytes), skipping`);
        failed++;
        continue;
      }

      await fs.writeFile(iconPath, buffer);

      // Update frontmatter with icon field
      const updatedYaml = addIconToFrontmatter(parsed.yaml, `${slug}.png`);
      const updatedContent = `---\n${updatedYaml}\n---\n${parsed.body}`;
      await fs.writeFile(filePath, updatedContent);

      console.log(`  ✓ ${slug}: fetched from ${domain}`);
      fetched++;

      // Rate limit: small delay between requests
      await new Promise((r) => setTimeout(r, 200));
    } catch (err) {
      console.log(`  ✗ ${slug}: ${err.message}`);
      failed++;
    }
  }

  console.log(`\nDone: ${fetched} fetched, ${skipped} skipped, ${failed} failed`);
}

main().catch((err) => {
  console.error('Script failed:', err);
  process.exit(1);
});
