#!/usr/bin/env node

/**
 * generate-tools.js — Create tool markdown files for checked iOS apps and web services.
 * Fetches icons via iTunes Search API (iOS) and logo.dev (web), uploads to Cloudinary.
 *
 * Usage:
 *   node scripts/generate-tools.js           # Generate all checked entries
 *   node scripts/generate-tools.js --dry-run # Show what would be created without writing files
 */

const http = require('http');
const https = require('https');
const crypto = require('crypto');
const fs = require('fs');
const path = require('path');

const TOOLS_DIR = path.join(__dirname, '..', 'content', 'tools');
const TODAY = new Date().toISOString().slice(0, 10);

// ─── Tool Definitions ────────────────────────────────────────────────────────
// Each entry: { name, slug, type, category, subcategory, description, url, tags, devices, itunesSearch?, logoDomain? }

const IOS_TOOLS = [
  {
    name: 'Instagram',
    slug: 'instagram',
    type: 'ios',
    category: 'communication',
    subcategory: 'social-media',
    description: 'Photo and video social network',
    url: 'https://www.instagram.com/',
    tags: ['social', 'photos', 'video', 'stories'],
    devices: ['ios'],
    itunesSearch: 'Instagram',
  },
  {
    name: 'Facebook',
    slug: 'facebook',
    type: 'ios',
    category: 'communication',
    subcategory: 'social-media',
    description: 'Social networking platform',
    url: 'https://www.facebook.com/',
    tags: ['social', 'messaging', 'groups'],
    devices: ['ios'],
    itunesSearch: 'Facebook',
  },
  {
    name: 'Google Maps',
    slug: 'google-maps',
    type: 'ios',
    category: 'specialized',
    subcategory: 'navigation',
    description: 'Maps and navigation',
    url: 'https://maps.google.com/',
    tags: ['maps', 'navigation', 'directions', 'google'],
    devices: ['ios'],
    itunesSearch: 'Google Maps',
  },
  {
    name: 'Waze',
    slug: 'waze',
    type: 'ios',
    category: 'specialized',
    subcategory: 'navigation',
    description: 'Community-driven navigation',
    url: 'https://www.waze.com/',
    tags: ['navigation', 'traffic', 'driving'],
    devices: ['ios'],
    itunesSearch: 'Waze Navigation',
  },
  {
    name: '1Writer',
    slug: '1writer',
    type: 'ios',
    category: 'productivity',
    subcategory: 'notes',
    description: 'Markdown text editor for iOS',
    url: 'https://1writerapp.com/',
    tags: ['markdown', 'writing', 'text-editor'],
    devices: ['ios'],
    itunesSearch: '1Writer',
  },
  {
    name: 'Stake',
    slug: 'stake',
    type: 'ios',
    category: 'finance',
    subcategory: 'investing',
    description: 'Stock investing and shares trading',
    url: 'https://hellostake.com/',
    tags: ['investing', 'stocks', 'shares', 'trading'],
    devices: ['ios'],
    itunesSearch: 'Stake - Trade US Stocks',
  },
  {
    name: 'Wise',
    slug: 'wise',
    type: 'ios',
    category: 'finance',
    subcategory: 'banking',
    description: 'International money transfers',
    url: 'https://wise.com/',
    tags: ['money-transfer', 'currency', 'international', 'banking'],
    devices: ['ios'],
    itunesSearch: 'Wise',
  },
  {
    name: 'Coinbase',
    slug: 'coinbase',
    type: 'ios',
    category: 'finance',
    subcategory: 'investing',
    description: 'Cryptocurrency exchange',
    url: 'https://www.coinbase.com/',
    tags: ['crypto', 'bitcoin', 'investing', 'exchange'],
    devices: ['ios'],
    itunesSearch: 'Coinbase',
  },
  {
    name: 'Microsoft Authenticator',
    slug: 'microsoft-authenticator',
    type: 'ios',
    category: 'security',
    subcategory: 'authentication',
    description: 'Two-factor authentication for Microsoft',
    url: 'https://www.microsoft.com/en-us/security/mobile-authenticator-app',
    tags: ['2fa', 'authentication', 'microsoft', 'security'],
    devices: ['ios'],
    itunesSearch: 'Microsoft Authenticator',
  },
  {
    name: 'Authy',
    slug: 'authy',
    type: 'ios',
    category: 'security',
    subcategory: 'authentication',
    description: 'Two-factor authentication app',
    url: 'https://authy.com/',
    tags: ['2fa', 'authentication', 'totp', 'security'],
    devices: ['ios'],
    itunesSearch: 'Twilio Authy',
  },
  {
    name: 'Termius',
    slug: 'termius',
    type: 'ios',
    category: 'development',
    subcategory: 'remote-access',
    description: 'SSH client for mobile',
    url: 'https://termius.com/',
    tags: ['ssh', 'terminal', 'remote-access', 'server'],
    devices: ['ios'],
    itunesSearch: 'Termius',
  },
  {
    name: 'Downcast',
    slug: 'downcast',
    type: 'ios',
    category: 'media',
    subcategory: 'podcasts',
    description: 'Podcast player and manager',
    url: 'https://www.downcastapp.com/',
    tags: ['podcasts', 'audio', 'rss'],
    devices: ['ios'],
    itunesSearch: 'Downcast',
  },
  {
    name: 'SuperCards',
    slug: 'supercards',
    type: 'ios',
    category: 'specialized',
    subcategory: 'lifestyle',
    description: 'Store loyalty cards wallet',
    url: 'https://apps.apple.com/app/supercards/id1441498038',
    tags: ['loyalty', 'cards', 'wallet', 'rewards'],
    devices: ['ios'],
    itunesSearch: 'SuperCards',
  },
  {
    name: 'Huckleberry',
    slug: 'huckleberry',
    type: 'ios',
    category: 'specialized',
    subcategory: 'lifestyle',
    description: 'Baby sleep and feeding tracker',
    url: 'https://huckleberrycare.com/',
    tags: ['baby', 'sleep', 'feeding', 'parenting'],
    devices: ['ios'],
    itunesSearch: 'Huckleberry Baby Tracker',
  },
  {
    name: 'Polar Beat',
    slug: 'polar-beat',
    type: 'ios',
    category: 'specialized',
    subcategory: 'lifestyle',
    description: 'Fitness and heart rate tracker',
    url: 'https://www.polar.com/en/beat',
    tags: ['fitness', 'heart-rate', 'exercise', 'polar'],
    devices: ['ios'],
    itunesSearch: 'Polar Beat',
  },
  {
    name: 'My Measures PRO',
    slug: 'my-measures-pro',
    type: 'ios',
    category: 'design',
    subcategory: 'measurement',
    description: 'AR measurement and annotation tool',
    url: 'https://www.mymeasuresapp.com/',
    tags: ['measurement', 'ar', 'dimensions', 'annotation'],
    devices: ['ios'],
    itunesSearch: 'My Measures PRO',
  },
  {
    name: 'Battle of Polytopia',
    slug: 'battle-of-polytopia',
    type: 'ios',
    category: 'games',
    subcategory: 'strategy',
    description: 'Turn-based strategy game',
    url: 'https://polytopia.io/',
    tags: ['strategy', 'turn-based', 'civilization'],
    devices: ['ios'],
    itunesSearch: 'Battle of Polytopia',
  },
  {
    name: 'ChatGPT',
    slug: 'chatgpt',
    type: 'ios',
    category: 'ai',
    subcategory: 'ai-assistants',
    description: 'OpenAI AI assistant',
    url: 'https://chat.openai.com/',
    tags: ['ai', 'chat', 'openai', 'gpt'],
    devices: ['ios'],
    itunesSearch: 'ChatGPT',
  },
  {
    name: 'Google Photos',
    slug: 'google-photos',
    type: 'ios',
    category: 'media',
    subcategory: 'photos',
    description: 'Photo backup and gallery',
    url: 'https://photos.google.com/',
    tags: ['photos', 'backup', 'gallery', 'google'],
    devices: ['ios'],
    itunesSearch: 'Google Photos',
  },
];

const WEB_TOOLS = [
  {
    name: 'GitHub',
    slug: 'github',
    type: 'web',
    category: 'development',
    subcategory: 'version-control',
    description: 'Code hosting and version control platform',
    url: 'https://github.com/',
    tags: ['git', 'code-hosting', 'open-source', 'collaboration'],
    devices: ['mbp', 'studio'],
    logoDomain: 'github.com',
  },
  {
    name: 'Netlify',
    slug: 'netlify',
    type: 'web',
    category: 'development',
    subcategory: 'cloud-platforms',
    description: 'Web hosting and deployment platform',
    url: 'https://www.netlify.com/',
    tags: ['hosting', 'deployment', 'jamstack', 'ci-cd'],
    devices: ['mbp', 'studio'],
    logoDomain: 'netlify.com',
  },
  {
    name: 'Cloudinary',
    slug: 'cloudinary',
    type: 'web',
    category: 'development',
    subcategory: 'cloud-platforms',
    description: 'Image and video management CDN',
    url: 'https://cloudinary.com/',
    tags: ['images', 'cdn', 'media', 'optimization'],
    devices: ['mbp', 'studio'],
    logoDomain: 'cloudinary.com',
  },
  {
    name: 'Supabase',
    slug: 'supabase',
    type: 'web',
    category: 'development',
    subcategory: 'cloud-platforms',
    description: 'Open-source Postgres backend platform',
    url: 'https://supabase.com/',
    tags: ['database', 'postgres', 'backend', 'auth', 'realtime'],
    devices: ['mbp', 'studio'],
    logoDomain: 'supabase.com',
  },
  {
    name: 'TinaCMS',
    slug: 'tinacms',
    type: 'web',
    category: 'development',
    subcategory: 'cloud-platforms',
    description: 'Git-backed headless CMS',
    url: 'https://tina.io/',
    tags: ['cms', 'git', 'headless', 'markdown'],
    devices: ['mbp', 'studio'],
    logoDomain: 'tina.io',
  },
  {
    name: 'DWService',
    slug: 'dwservice',
    type: 'web',
    category: 'development',
    subcategory: 'remote-access',
    description: 'Browser-based remote access service',
    url: 'https://www.dwservice.net/',
    tags: ['remote-access', 'remote-desktop', 'browser'],
    devices: ['mbp', 'studio'],
    logoDomain: 'dwservice.net',
  },
  {
    name: 'Adobe Fonts',
    slug: 'adobe-fonts',
    type: 'web',
    category: 'design',
    subcategory: 'fonts',
    description: 'Font library from Adobe Creative Cloud',
    url: 'https://fonts.adobe.com/',
    tags: ['fonts', 'typography', 'adobe', 'creative-cloud'],
    devices: ['mbp', 'studio'],
    logoDomain: 'adobe.com',
  },
  {
    name: 'Google Earth',
    slug: 'google-earth',
    type: 'web',
    category: 'design',
    subcategory: 'mapping',
    description: '3D globe and satellite imagery',
    url: 'https://earth.google.com/',
    tags: ['maps', 'satellite', '3d', 'google', 'geography'],
    devices: ['mbp', 'studio'],
    logoDomain: 'earth.google.com',
  },
  {
    name: 'Xero',
    slug: 'xero',
    type: 'web',
    category: 'finance',
    subcategory: 'accounting',
    description: 'Cloud accounting software',
    url: 'https://www.xero.com/',
    tags: ['accounting', 'invoicing', 'bookkeeping', 'business'],
    devices: ['mbp', 'studio'],
    logoDomain: 'xero.com',
  },
  {
    name: 'Deputy',
    slug: 'deputy',
    type: 'web',
    category: 'productivity',
    subcategory: 'scheduling',
    description: 'Staff rostering and shift management',
    url: 'https://www.deputy.com/',
    tags: ['scheduling', 'roster', 'shifts', 'workforce'],
    devices: ['mbp', 'studio'],
    logoDomain: 'deputy.com',
  },
  {
    name: 'JotForm',
    slug: 'jotform',
    type: 'web',
    category: 'productivity',
    subcategory: 'forms',
    description: 'Online form builder',
    url: 'https://www.jotform.com/',
    tags: ['forms', 'surveys', 'data-collection'],
    devices: ['mbp', 'studio'],
    logoDomain: 'jotform.com',
  },
  {
    name: 'Reddit',
    slug: 'reddit',
    type: 'web',
    category: 'communication',
    subcategory: 'social-media',
    description: 'Forums and community discussions',
    url: 'https://www.reddit.com/',
    tags: ['forums', 'community', 'social', 'discussions'],
    devices: ['mbp', 'studio'],
    logoDomain: 'reddit.com',
  },
  {
    name: 'LinkedIn',
    slug: 'linkedin',
    type: 'web',
    category: 'communication',
    subcategory: 'social-media',
    description: 'Professional networking platform',
    url: 'https://www.linkedin.com/',
    tags: ['professional', 'networking', 'jobs', 'social'],
    devices: ['mbp', 'studio'],
    logoDomain: 'linkedin.com',
  },
];

// Note: Airtable is already in catalog as a Mac app — skip creating a duplicate.
// Instead we should update the existing entry's type or add web to devices.

// ─── HTTP Helpers ─────────────────────────────────────────────────────────────

function fetchSecretField(itemName, field) {
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

function httpGet(url, timeout = 15000) {
  return new Promise((resolve, reject) => {
    const mod = url.startsWith('https') ? https : http;
    mod.get(url, { timeout }, (res) => {
      if (res.statusCode >= 300 && res.statusCode < 400 && res.headers.location) {
        return httpGet(res.headers.location, timeout).then(resolve).catch(reject);
      }
      const chunks = [];
      res.on('data', c => chunks.push(c));
      res.on('end', () => resolve({ status: res.statusCode, body: Buffer.concat(chunks) }));
    }).on('error', reject);
  });
}

function httpGetJson(url) {
  return httpGet(url).then(r => JSON.parse(r.body.toString()));
}

function uploadToCloudinary(apiKey, apiSecret, imageBuffer, publicId) {
  return new Promise((resolve, reject) => {
    const timestamp = Math.floor(Date.now() / 1000);
    const paramsToSign = 'public_id=' + publicId + '&timestamp=' + timestamp;
    const signature = crypto.createHash('sha1').update(paramsToSign + apiSecret).digest('hex');

    const boundary = '----FormBoundary' + Date.now();
    const parts = [];
    function addField(name, value) {
      parts.push('--' + boundary + '\r\nContent-Disposition: form-data; name="' + name + '"\r\n\r\n' + value + '\r\n');
    }
    addField('api_key', apiKey);
    addField('timestamp', timestamp.toString());
    addField('signature', signature);
    addField('public_id', publicId);

    const fileHeader = '--' + boundary + '\r\nContent-Disposition: form-data; name="file"; filename="icon.png"\r\nContent-Type: image/png\r\n\r\n';
    const fileTail = '\r\n--' + boundary + '--\r\n';
    const bodyParts = Buffer.concat([
      Buffer.from(parts.join('')),
      Buffer.from(fileHeader),
      imageBuffer,
      Buffer.from(fileTail),
    ]);

    const req = https.request({
      hostname: 'api.cloudinary.com',
      path: '/v1_1/dk3rktqns/image/upload',
      method: 'POST',
      headers: {
        'Content-Type': 'multipart/form-data; boundary=' + boundary,
        'Content-Length': bodyParts.length,
      },
      timeout: 30000,
    }, (res) => {
      let data = '';
      res.on('data', c => data += c);
      res.on('end', () => { try { resolve(JSON.parse(data)); } catch { reject(new Error('Bad response')); } });
    });
    req.on('error', reject);
    req.write(bodyParts);
    req.end();
  });
}

function delay(ms) {
  return new Promise(r => setTimeout(r, ms));
}

// ─── Icon Fetchers ───────────────────────────────────────────────────────────

async function fetchiTunesIcon(searchTerm) {
  const encoded = encodeURIComponent(searchTerm);
  const url = `https://itunes.apple.com/search?term=${encoded}&entity=software&limit=3`;
  const data = await httpGetJson(url);
  if (data.results && data.results.length > 0) {
    // Get the highest res artwork — replace 100x100 with 512x512
    let artworkUrl = data.results[0].artworkUrl512 || data.results[0].artworkUrl100;
    if (artworkUrl && artworkUrl.includes('100x100')) {
      artworkUrl = artworkUrl.replace('100x100', '512x512');
    }
    return artworkUrl;
  }
  return null;
}

async function fetchLogoDevIcon(domain, token) {
  const url = `https://img.logo.dev/${domain}?token=${token}&format=png&size=256`;
  const result = await httpGet(url);
  if (result.status === 200 && result.body.length > 100) {
    return result.body;
  }
  return null;
}

// ─── Markdown Generator ──────────────────────────────────────────────────────

function generateMarkdown(tool, iconUrl) {
  const lines = [
    '---',
    `name: "${tool.name}"`,
    `type: "${tool.type}"`,
    `category: "${tool.category}"`,
    `subcategory: "${tool.subcategory}"`,
    `description: "${tool.description}"`,
    `url: "${tool.url}"`,
    `icon: "${iconUrl || ''}"`,
    `tags: [${tool.tags.map(t => `"${t}"`).join(', ')}]`,
    `devices: [${tool.devices.map(d => `"${d}"`).join(', ')}]`,
    'display: false',
    'status: "active"',
    `dateAdded: "${TODAY}"`,
    '---',
    '',
    tool.description,
    '',
  ];
  return lines.join('\n');
}

// ─── Main ────────────────────────────────────────────────────────────────────

async function main() {
  const dryRun = process.argv.includes('--dry-run');

  console.log('Fetching API credentials...');

  // Cloudinary credentials
  const cloudKeyResult = await fetchSecretField('Cloudinary_txstack', 'api_key');
  const cloudSecretResult = await fetchSecretField('Cloudinary_txstack', 'API_SECRET');
  const cloudKey = cloudKeyResult.item?.value || cloudKeyResult.value || cloudKeyResult.item;
  const cloudSecret = cloudSecretResult.item?.value || cloudSecretResult.value || cloudSecretResult.item;

  if (!cloudKey || !cloudSecret) {
    console.error('Could not retrieve Cloudinary credentials');
    process.exit(1);
  }
  console.log('  Cloudinary: OK');

  // logo.dev token
  const logoResult = await fetchSecretField('Logo.dev-txstack', 'publishable_key');
  const logoToken = logoResult.item?.value || logoResult.value || logoResult.item;

  if (!logoToken) {
    console.error('Could not retrieve logo.dev token');
    process.exit(1);
  }
  console.log('  logo.dev: OK\n');

  const allTools = [...IOS_TOOLS, ...WEB_TOOLS];
  let created = 0;
  let skipped = 0;
  let iconsFailed = 0;

  for (const tool of allTools) {
    // Ensure category folder exists
    const categoryDir = path.join(TOOLS_DIR, tool.category);
    if (!fs.existsSync(categoryDir)) {
      if (!dryRun) fs.mkdirSync(categoryDir, { recursive: true });
      console.log(`  Created folder: content/tools/${tool.category}/`);
    }

    const filePath = path.join(categoryDir, tool.slug + '.md');

    // Skip if file already exists
    if (fs.existsSync(filePath)) {
      console.log(`  SKIP (exists): ${tool.category}/${tool.slug}.md`);
      skipped++;
      continue;
    }

    let iconUrl = '';
    const cloudinaryId = tool.slug.replace(/-/g, '_') + '_icon';

    if (tool.itunesSearch) {
      // iOS: fetch from iTunes API
      console.log(`  [iOS] ${tool.name}: searching iTunes...`);
      try {
        const artworkUrl = await fetchiTunesIcon(tool.itunesSearch);
        if (artworkUrl) {
          console.log(`    Found artwork, downloading...`);
          const imgResult = await httpGet(artworkUrl);
          if (imgResult.status === 200 && imgResult.body.length > 100) {
            if (!dryRun) {
              const uploaded = await uploadToCloudinary(cloudKey, cloudSecret, imgResult.body, cloudinaryId);
              if (uploaded.secure_url) {
                iconUrl = uploaded.secure_url;
                console.log(`    Uploaded to Cloudinary: ${iconUrl}`);
              } else {
                console.log(`    Upload failed: ${uploaded.error?.message || 'unknown error'}`);
                iconsFailed++;
              }
            } else {
              console.log(`    [dry-run] Would upload ${imgResult.body.length} bytes as ${cloudinaryId}`);
            }
          }
        } else {
          console.log(`    No iTunes result`);
          iconsFailed++;
        }
      } catch (e) {
        console.log(`    iTunes error: ${e.message}`);
        iconsFailed++;
      }
      // Rate limit: iTunes API
      await delay(300);
    } else if (tool.logoDomain) {
      // Web: fetch from logo.dev
      console.log(`  [Web] ${tool.name}: fetching logo for ${tool.logoDomain}...`);
      try {
        const logoBuffer = await fetchLogoDevIcon(tool.logoDomain, logoToken);
        if (logoBuffer) {
          if (!dryRun) {
            const uploaded = await uploadToCloudinary(cloudKey, cloudSecret, logoBuffer, cloudinaryId);
            if (uploaded.secure_url) {
              iconUrl = uploaded.secure_url;
              console.log(`    Uploaded to Cloudinary: ${iconUrl}`);
            } else {
              console.log(`    Upload failed: ${uploaded.error?.message || 'unknown error'}`);
              iconsFailed++;
            }
          } else {
            console.log(`    [dry-run] Would upload ${logoBuffer.length} bytes as ${cloudinaryId}`);
          }
        } else {
          console.log(`    No logo found`);
          iconsFailed++;
        }
      } catch (e) {
        console.log(`    logo.dev error: ${e.message}`);
        iconsFailed++;
      }
      // Rate limit: logo.dev API
      await delay(200);
    }

    // Write markdown file
    const markdown = generateMarkdown(tool, iconUrl);
    if (!dryRun) {
      fs.writeFileSync(filePath, markdown);
    }
    console.log(`  ${dryRun ? '[dry-run] Would create' : 'Created'}: ${tool.category}/${tool.slug}.md${iconUrl ? '' : ' (no icon)'}\n`);
    created++;
  }

  console.log(`\nDone! ${created} created, ${skipped} skipped, ${iconsFailed} icons failed.`);
  console.log('All files created with display: false — review in Airtable before enabling.');

  // Reminder about Airtable
  console.log('\nNote: Airtable already exists as a Mac app. Consider updating its type or adding web to devices.');
}

main().catch(e => console.error('Failed:', e.message));
