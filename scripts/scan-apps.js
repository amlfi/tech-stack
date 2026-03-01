#!/usr/bin/env node

const fs = require('fs-extra');
const path = require('node:path');
const { execSync } = require('node:child_process');

const CONTENT_DIR = path.join(__dirname, '..', 'content');
const TOOLS_DIR = path.join(CONTENT_DIR, 'tools');
const CATALOG_PATH = path.join(CONTENT_DIR, 'catalog.json');
const REPORT_PATH = path.join(CONTENT_DIR, 'scan-report.json');

const SCAN_DIRS = ['/Applications', '/Applications/Setapp', path.join(process.env.HOME, 'Applications')];

// Apps to ignore (system/Apple built-ins that aren't worth tracking)
const IGNORE = new Set([
  'Automator', 'Books', 'Calculator', 'Calendar', 'Chess', 'Clock',
  'Contacts', 'Dictionary', 'FaceTime', 'Finder', 'Font Book', 'Freeform',
  'Home', 'Image Capture', 'Launchpad', 'Mail', 'Maps', 'Messages',
  'Migration Assistant', 'Mission Control', 'Music', 'News', 'Notes',
  'Photo Booth', 'Photos', 'Podcasts', 'Preview', 'QuickTime Player',
  'Reminders', 'Screenshot', 'Shortcuts', 'Siri', 'Stickies', 'Stocks',
  'System Preferences', 'System Settings', 'TextEdit', 'Time Machine',
  'Tips', 'TV', 'Utilities', 'Voice Memos', 'Weather', 'iPhone Mirroring',
]);

// Known app metadata for pre-filling generated entries
const APP_INFO = {
  'AnkerWork': {
    category: 'specialized', subcategory: 'peripherals',
    description: 'Anker webcam and accessory management',
    url: 'https://www.anker.com/pages/ankerwork-software',
    tags: ['webcam', 'peripherals', 'video', 'settings'],
  },
  'BetterTouchTool': {
    category: 'specialized', subcategory: 'input-devices',
    description: 'Input device customization and automation',
    url: 'https://folivora.ai/',
    tags: ['trackpad', 'keyboard', 'shortcuts', 'automation', 'gestures'],
  },
  'HEIC Converter': {
    category: 'system', subcategory: 'utilities',
    description: 'Convert HEIC images to JPEG or PNG',
    url: 'https://imazing.com/heic',
    tags: ['image-conversion', 'heic', 'photos', 'utility'],
  },
  'iMazing': {
    category: 'system', subcategory: 'utilities',
    description: 'iOS device manager and backup tool',
    url: 'https://imazing.com/',
    tags: ['ios', 'backup', 'device-management', 'iphone', 'transfer'],
  },
  'MetaImage': {
    category: 'design', subcategory: 'image-editing',
    description: 'Image metadata editor',
    url: 'https://neededapps.com/metaimage/',
    tags: ['metadata', 'exif', 'photos', 'batch-editing'],
  },
  'MsgFiler 4': {
    category: 'productivity', subcategory: 'email',
    description: 'Quick email filing for Apple Mail',
    url: 'https://www.mothersruin.com/software/msgfiler/',
    tags: ['email', 'filing', 'organization', 'apple-mail'],
  },
  'NordVPN': {
    category: 'security', subcategory: 'vpn',
    description: 'VPN service for privacy and security',
    url: 'https://nordvpn.com/',
    tags: ['vpn', 'privacy', 'security', 'networking', 'encryption'],
  },
  'Paprika Recipe Manager 3': {
    category: 'specialized', subcategory: 'lifestyle',
    description: 'Recipe manager and meal planner',
    url: 'https://www.paprikaapp.com/',
    tags: ['recipes', 'cooking', 'meal-planning', 'grocery-list'],
  },
  'PixelSnap': {
    category: 'design', subcategory: 'measurement',
    description: 'Measure anything on screen',
    url: 'https://getpixelsnap.com/',
    tags: ['measurement', 'design', 'ui-design', 'pixel-perfect'],
  },
  'Typeface': {
    category: 'design', subcategory: 'fonts',
    description: 'Font manager and preview tool',
    url: 'https://typefaceapp.com/',
    tags: ['fonts', 'typography', 'design', 'font-management'],
  },
  'UTM': {
    category: 'development', subcategory: 'virtualization',
    description: 'Virtual machines for macOS',
    url: 'https://mac.getutm.app/',
    tags: ['virtual-machines', 'emulation', 'linux', 'windows'],
  },
  'Yoink': {
    category: 'system', subcategory: 'utilities',
    description: 'Drag-and-drop shelf for files',
    url: 'https://eternalstorms.at/yoink/mac/',
    tags: ['drag-drop', 'file-management', 'shelf', 'utility'],
  },
};

function scanInstalledApps() {
  const apps = [];

  for (const dir of SCAN_DIRS) {
    if (!fs.existsSync(dir)) continue;

    const entries = fs.readdirSync(dir);
    for (const entry of entries) {
      if (!entry.endsWith('.app')) continue;
      const name = entry.replace(/\.app$/, '');
      if (IGNORE.has(name)) continue;

      const appPath = path.join(dir, entry);
      let version = null;
      try {
        const plist = path.join(appPath, 'Contents', 'Info.plist');
        if (fs.existsSync(plist)) {
          version = execSync(`defaults read "${plist}" CFBundleShortVersionString 2>/dev/null`, { encoding: 'utf-8' }).trim();
        }
      } catch {}

      apps.push({ name, version, source: dir });
    }
  }

  return apps.sort((a, b) => a.name.localeCompare(b.name));
}

function loadCatalog() {
  if (!fs.existsSync(CATALOG_PATH)) {
    console.error('No catalog.json found. Run "node build.js" first to generate it.');
    process.exit(1);
  }
  return fs.readJSONSync(CATALOG_PATH);
}

function slugify(name) {
  return name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
}

function fuzzyMatch(installed, catalogName) {
  const a = installed.toLowerCase().replace(/[^a-z0-9]/g, '');
  const b = catalogName.toLowerCase().replace(/[^a-z0-9]/g, '');
  return a === b || a.includes(b) || b.includes(a);
}

function generateMarkdown(app, today) {
  const slug = slugify(app.name);
  const info = APP_INFO[app.name] || {};
  const isSetapp = app.source.includes('Setapp');
  const tags = [...(info.tags || [])];
  if (isSetapp && !tags.includes('setapp')) tags.push('setapp');
  const tagsStr = tags.length > 0 ? tags.map((t) => `"${t}"`).join(', ') : '';

  return {
    slug,
    category: info.category || '',
    content: `---
name: "${app.name}"
type: "mac"
category: "${info.category || ''}"
subcategory: "${info.subcategory || ''}"
description: "${info.description || ''}"
url: "${info.url || ''}"
tags: [${tagsStr}]
devices: ["mbp"]
display: false
status: "active"
startedUsing: ""
dateAdded: "${today}"
---

${info.description || ''}
`,
  };
}

async function main() {
  const args = process.argv.slice(2);
  const doGenerate = args.includes('--generate');
  const showRecent = args.includes('--recent');
  const showMissing = args.includes('--missing');
  const today = new Date().toISOString().split('T')[0];

  const catalog = loadCatalog();

  // --recent: show tools added after a date (or all with dateAdded)
  if (showRecent) {
    const dateArg = args[args.indexOf('--recent') + 1] || '';
    const withDates = catalog.tools.filter((t) => t.dateAdded);

    if (dateArg && /^\d{4}-\d{2}-\d{2}$/.test(dateArg)) {
      const filtered = withDates.filter((t) => t.dateAdded >= dateArg);
      console.log(`Tools added since ${dateArg}:\n`);
      if (filtered.length === 0) {
        console.log('  None found.');
      } else {
        for (const t of filtered) {
          console.log(`  ${t.dateAdded}  ${t.name} [${t.category || 'uncategorized'}/${t.subcategory || '?'}] display:${t.display}`);
        }
      }
    } else {
      console.log('All tools with dateAdded:\n');
      if (withDates.length === 0) {
        console.log('  None found. Run --generate to create entries with dates.');
      } else {
        for (const t of withDates) {
          console.log(`  ${t.dateAdded}  ${t.name} [${t.category || 'uncategorized'}/${t.subcategory || '?'}] display:${t.display}`);
        }
      }
    }
    console.log('');
    return;
  }

  // --missing: show catalog tools not found on this Mac
  if (showMissing) {
    console.log('Scanning installed applications...\n');
    const installed = scanInstalledApps();
    const installedNames = installed.map((a) => a.name);
    const missing = catalog.tools.filter(
      (t) => !installedNames.some((iname) => fuzzyMatch(iname, t.name))
    );

    console.log(`Not found on this Mac (${missing.length}):\n`);
    for (const t of missing) {
      const flags = [t.display ? 'visible' : 'hidden', t.status].join(', ');
      console.log(`  ${t.name} [${t.category}/${t.subcategory}] (${flags})`);
    }
    console.log('');
    return;
  }

  // Default: full scan
  console.log('Scanning installed applications...\n');

  const installed = scanInstalledApps();
  const catalogNames = catalog.tools.map((t) => t.name);

  const newApps = installed.filter((app) => !catalogNames.some((cn) => fuzzyMatch(app.name, cn)));
  const setappApps = installed.filter((app) => app.source.includes('Setapp'));

  const installedNames = installed.map((a) => a.name);
  const missing = catalog.tools.filter(
    (t) => t.display && !installedNames.some((iname) => fuzzyMatch(iname, t.name))
  );

  // Report
  console.log(`Found ${installed.length} apps installed on this Mac (${setappApps.length} via Setapp)`);
  console.log(`Catalog has ${catalog.tools.length} tools tracked\n`);

  if (newApps.length > 0) {
    console.log(`--- NEW APPS (${newApps.length}) - installed but not in txstack ---\n`);
    for (const app of newApps) {
      const ver = app.version ? ` (v${app.version})` : '';
      const src = app.source.includes('Setapp') ? ' [Setapp]' : '';
      const known = APP_INFO[app.name] ? ' *' : '';
      console.log(`  + ${app.name}${ver}${src}${known}`);
    }
    console.log('');
    console.log('  (* = metadata will be pre-filled)\n');
  } else {
    console.log('No new apps found — catalog is up to date.\n');
  }

  if (missing.length > 0) {
    console.log(`--- MISSING (${missing.length}) - in txstack but not found on this Mac ---\n`);
    for (const tool of missing) {
      console.log(`  - ${tool.name} [${tool.category}/${tool.subcategory}]`);
    }
    console.log('');
    console.log('  (These may be on other devices, or uninstalled.)\n');
  }

  // Save scan report
  const report = {
    scannedAt: new Date().toISOString(),
    installedCount: installed.length,
    setappCount: setappApps.length,
    catalogCount: catalog.tools.length,
    newApps: newApps.map((a) => ({
      name: a.name,
      version: a.version,
      source: a.source.includes('Setapp') ? 'setapp' : 'applications',
      knownMetadata: !!APP_INFO[a.name],
    })),
    missing: missing.map((t) => ({
      name: t.name,
      category: t.category,
      subcategory: t.subcategory,
      status: t.status,
    })),
  };
  await fs.writeJSON(REPORT_PATH, report, { spaces: 2 });
  console.log(`Scan report saved to content/scan-report.json\n`);

  // Generate mode
  if (doGenerate && newApps.length > 0) {
    const knownCount = newApps.filter((a) => APP_INFO[a.name]).length;
    console.log(`Generating ${newApps.length} files (${knownCount} pre-filled, dateAdded: ${today})...\n`);

    let count = 0;
    for (const app of newApps) {
      const { slug, category, content } = generateMarkdown(app, today);

      // Place in category folder if known, otherwise uncategorized
      const folder = category || 'uncategorized';
      const destDir = path.join(TOOLS_DIR, folder);
      await fs.ensureDir(destDir);

      const filePath = path.join(destDir, `${slug}.md`);
      if (await fs.pathExists(filePath)) {
        console.log(`  skip ${folder}/${slug}.md (already exists)`);
        continue;
      }

      await fs.writeFile(filePath, content);
      const prefilled = APP_INFO[app.name] ? ' (pre-filled)' : ' (needs metadata)';
      console.log(`  created ${folder}/${slug}.md${prefilled}`);
      count++;
    }

    console.log(`\nGenerated ${count} files. All have display: false.`);
    console.log('Edit in Airtable to review, tweak, and enable.\n');
    console.log('Useful commands:');
    console.log(`  node scripts/scan-apps.js --recent ${today}   # see this batch`);
    console.log('  node scripts/scan-apps.js --missing           # what\'s not installed');
  } else if (!doGenerate && newApps.length > 0) {
    console.log('--- To generate files for new apps, run: ---');
    console.log('  node scripts/scan-apps.js --generate\n');
  }
}

main().catch((err) => {
  console.error('Scan failed:', err);
  process.exit(1);
});
