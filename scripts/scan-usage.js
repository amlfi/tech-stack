#!/usr/bin/env node

const fs = require('fs-extra');
const path = require('node:path');
const { execSync } = require('node:child_process');

const CONTENT_DIR = path.join(__dirname, '..', 'content');
const TOOLS_DIR = path.join(CONTENT_DIR, 'tools');
const CATALOG_PATH = path.join(CONTENT_DIR, 'catalog.json');
const REPORT_PATH = path.join(CONTENT_DIR, 'usage-report.json');

const TIMING_DB = path.join(
  process.env.HOME,
  'Library/Application Support/info.eurocomp.Timing2/SQLite.db',
);

// Device IDs in Timing DB
const IPHONE_DEVICE_ID = 2;
const MAC_DEVICE_IDS = '1, 3'; // Studio, MacBookPro

// Minimum hours to include in results
const MIN_HOURS_IOS = 0.5;
const MIN_HOURS_WEB = 0.1;

// Apps to skip (system/built-in iOS apps not worth tracking as separate tools)
const SKIP_IOS = new Set([
  'com.apple.mobilephone',
  'com.apple.camera',
  'com.apple.mobilesafari',
  'com.apple.Safari',
  'com.apple.AppStore',
  'com.apple.Preferences', // Settings
  'com.apple.systempreferences',
  'com.apple.MobileSMS', // Messages — already tracked as Mac app
  'com.apple.mail', // Mail — already tracked as Mac app
  'com.apple.Music', // Music — already tracked as Mac app
  'com.apple.Photos',
  'com.apple.weather',
  'com.apple.mobiletimer', // Clock
  'com.apple.Bridge', // Watch
  'com.apple.findmy',
  'com.apple.shortcuts',
  'com.apple.tv',
  'com.apple.Fitness',
  'com.apple.Health',
  'com.apple.reminders',
  'com.apple.iBooks',
  'com.apple.news',
  'com.apple.Maps',
  'com.apple.calculator',
  'com.apple.compass',
  'com.apple.measure',
  'com.apple.tips',
  'com.apple.VoiceMemos',
  'com.apple.stocks',
  'com.apple.Magnifier',
  'com.apple.Translate',
  'com.apple.Home',
  'com.apple.podcasts',
  'com.apple.Notes',
  'com.apple.freeform',
]);

// Domains to skip (not web services/SaaS — just sites you browse)
const SKIP_DOMAINS = new Set([
  'www.google.com',
  'www.google.co.uk',
  'www.google.com.au',
  'accounts.google.com',
  'login.microsoftonline.com',
  'localhost',
  '', // empty
]);

// Known iOS app metadata for pre-filling generated entries
const IOS_APP_INFO = {
  'com.burbn.instagram': {
    category: 'communication',
    subcategory: 'social',
    description: 'Photo and video sharing social network',
    url: 'https://www.instagram.com/',
    tags: ['social', 'photos', 'video', 'stories', 'messaging'],
  },
  'com.netflix.Netflix': {
    category: 'media',
    subcategory: 'streaming',
    description: 'Movie and TV show streaming service',
    url: 'https://www.netflix.com/',
    tags: ['streaming', 'movies', 'tv-shows', 'entertainment'],
  },
  'com.google.Maps': {
    category: 'productivity',
    subcategory: 'navigation',
    description: 'Maps, navigation, and local search',
    url: 'https://maps.google.com/',
    tags: ['maps', 'navigation', 'directions', 'local-search'],
  },
  'net.whatsapp.WhatsApp': {
    category: 'communication',
    subcategory: 'messaging',
    description: 'Cross-platform messaging and calling',
    url: 'https://www.whatsapp.com/',
    tags: ['messaging', 'chat', 'voice-calls', 'video-calls', 'groups'],
  },
  'com.anthropic.claude': {
    category: 'ai',
    subcategory: 'assistant',
    description: 'AI assistant by Anthropic',
    url: 'https://claude.ai/',
    tags: ['ai', 'assistant', 'writing', 'coding', 'research'],
  },
  'com.hindsightlabs.paprika.ios.v3': {
    category: 'specialized',
    subcategory: 'lifestyle',
    description: 'Recipe manager and meal planner',
    url: 'https://www.paprikaapp.com/',
    tags: ['recipes', 'cooking', 'meal-planning', 'grocery-list'],
  },
  'com.facebook.Facebook': {
    category: 'communication',
    subcategory: 'social',
    description: 'Social networking platform',
    url: 'https://www.facebook.com/',
    tags: ['social', 'news-feed', 'groups', 'marketplace'],
  },
  'com.spotify.client': {
    category: 'media',
    subcategory: 'music',
    description: 'Music and podcast streaming',
    url: 'https://www.spotify.com/',
    tags: ['music', 'streaming', 'podcasts', 'playlists'],
  },
  'com.disney.disneyplus': {
    category: 'media',
    subcategory: 'streaming',
    description: 'Disney, Pixar, Marvel, Star Wars streaming',
    url: 'https://www.disneyplus.com/',
    tags: ['streaming', 'movies', 'tv-shows', 'disney', 'entertainment'],
  },
  'com.crystalnix.ServerAuditor': {
    category: 'development',
    subcategory: 'remote-access',
    description: 'SSH client and terminal for mobile',
    url: 'https://termius.com/',
    tags: ['ssh', 'terminal', 'remote-access', 'servers'],
  },
  'com.jamawkinaw.downcast': {
    category: 'media',
    subcategory: 'podcasts',
    description: 'Podcast player and manager',
    url: 'https://downcast.fm/',
    tags: ['podcasts', 'audio', 'subscriptions', 'offline'],
  },
  'com.realvnc.VNCViewer': {
    category: 'development',
    subcategory: 'remote-access',
    description: 'Remote desktop access via VNC',
    url: 'https://www.realvnc.com/',
    tags: ['remote-desktop', 'vnc', 'screen-sharing', 'remote-access'],
  },
  'com.facebook.Messenger': {
    category: 'communication',
    subcategory: 'messaging',
    description: 'Facebook Messenger for chat and calls',
    url: 'https://www.messenger.com/',
    tags: ['messaging', 'chat', 'video-calls', 'facebook'],
  },
  'com.microsoft.azureauthenticator': {
    category: 'security',
    subcategory: 'authentication',
    description: 'Two-factor authentication for Microsoft accounts',
    url: 'https://www.microsoft.com/en-us/security/mobile-authenticator-app',
    tags: ['2fa', 'authentication', 'security', 'microsoft'],
  },
  'com.microsoft.skype.teams': {
    category: 'communication',
    subcategory: 'collaboration',
    description: 'Team collaboration and video conferencing',
    url: 'https://www.microsoft.com/en-us/microsoft-teams/',
    tags: ['collaboration', 'video-conferencing', 'chat', 'microsoft'],
  },
  'au.com.stan': {
    category: 'media',
    subcategory: 'streaming',
    description: 'Australian streaming service',
    url: 'https://www.stan.com.au/',
    tags: ['streaming', 'movies', 'tv-shows', 'australian'],
  },
  'com.amazon.aiv.AIVApp': {
    category: 'media',
    subcategory: 'streaming',
    description: 'Amazon Prime Video streaming',
    url: 'https://www.amazon.com/prime-video',
    tags: ['streaming', 'movies', 'tv-shows', 'amazon', 'entertainment'],
  },
  'com.wbd.stream': {
    category: 'media',
    subcategory: 'streaming',
    description: 'HBO and Max streaming content',
    url: 'https://www.max.com/',
    tags: ['streaming', 'movies', 'tv-shows', 'hbo', 'entertainment'],
  },
  'com.amazon.Amazon': {
    category: 'specialized',
    subcategory: 'shopping',
    description: 'Online shopping and delivery',
    url: 'https://www.amazon.com/',
    tags: ['shopping', 'delivery', 'marketplace', 'prime'],
  },
  'com.waze.iphone': {
    category: 'productivity',
    subcategory: 'navigation',
    description: 'Community-driven navigation with real-time traffic',
    url: 'https://www.waze.com/',
    tags: ['navigation', 'traffic', 'driving', 'community', 'maps'],
  },
  'com.booking.BookingApp': {
    category: 'specialized',
    subcategory: 'travel',
    description: 'Hotel and travel booking',
    url: 'https://www.booking.com/',
    tags: ['travel', 'hotels', 'booking', 'accommodation'],
  },
  'com.google.ios.youtube': {
    category: 'media',
    subcategory: 'video',
    description: 'Video streaming and sharing platform',
    url: 'https://www.youtube.com/',
    tags: ['video', 'streaming', 'creators', 'entertainment'],
  },
  'com.flexibits.fantastical2.iphone': {
    category: 'productivity',
    subcategory: 'calendar',
    description: 'Calendar app with natural language input',
    url: 'https://flexibits.com/fantastical',
    tags: ['calendar', 'scheduling', 'reminders', 'natural-language'],
  },
  'com.culturedcode.ThingsiPhone': {
    category: 'productivity',
    subcategory: 'task-management',
    description: 'Personal task manager and to-do list',
    url: 'https://culturedcode.com/things/',
    tags: ['tasks', 'to-do', 'productivity', 'gtd', 'planning'],
  },
  'us.zoom.videomeetings': {
    category: 'communication',
    subcategory: 'video-conferencing',
    description: 'Video conferencing and virtual meetings',
    url: 'https://zoom.us/',
    tags: ['video-conferencing', 'meetings', 'webinars', 'collaboration'],
  },
  'com.reddit.Reddit': {
    category: 'communication',
    subcategory: 'social',
    description: 'Community discussion and content sharing',
    url: 'https://www.reddit.com/',
    tags: ['social', 'forums', 'communities', 'discussions', 'news'],
  },
  'com.getdropbox.Dropbox': {
    category: 'productivity',
    subcategory: 'cloud-storage',
    description: 'Cloud file storage and sync',
    url: 'https://www.dropbox.com/',
    tags: ['cloud-storage', 'file-sync', 'sharing', 'backup'],
  },
  'com.linkedin.LinkedIn': {
    category: 'communication',
    subcategory: 'social',
    description: 'Professional networking and job search',
    url: 'https://www.linkedin.com/',
    tags: ['networking', 'professional', 'jobs', 'career', 'social'],
  },
  'com.authy': {
    category: 'security',
    subcategory: 'authentication',
    description: 'Two-factor authentication app',
    url: 'https://authy.com/',
    tags: ['2fa', 'authentication', 'security', 'totp'],
  },
  'com.flexibits.cardhop.ios': {
    category: 'productivity',
    subcategory: 'contacts',
    description: 'Contacts manager with smart actions',
    url: 'https://flexibits.com/cardhop',
    tags: ['contacts', 'address-book', 'communication', 'organization'],
  },
  'com.1password.1password': {
    category: 'security',
    subcategory: 'passwords',
    description: 'Password manager and digital vault',
    url: 'https://1password.com/',
    tags: ['passwords', 'security', 'vault', 'autofill'],
  },
  'com.google.Sheets': {
    category: 'productivity',
    subcategory: 'spreadsheets',
    description: 'Online spreadsheets and data analysis',
    url: 'https://sheets.google.com/',
    tags: ['spreadsheets', 'data', 'collaboration', 'google'],
  },
  'com.airbnb.app': {
    category: 'specialized',
    subcategory: 'travel',
    description: 'Vacation rentals and experiences',
    url: 'https://www.airbnb.com/',
    tags: ['travel', 'accommodation', 'vacation-rentals', 'experiences'],
  },
  'com.aoitek.lollipop': {
    category: 'specialized',
    subcategory: 'lifestyle',
    description: 'Smart baby monitor with camera',
    url: 'https://www.lollipop.camera/',
    tags: ['baby-monitor', 'camera', 'parenting', 'smart-home'],
  },
  'com.huckleberry-labs.app': {
    category: 'specialized',
    subcategory: 'lifestyle',
    description: 'Baby sleep and feeding tracker',
    url: 'https://huckleberrycare.com/',
    tags: ['baby-tracker', 'sleep', 'feeding', 'parenting'],
  },
  'com.rils.touchportal': {
    category: 'specialized',
    subcategory: 'streaming-tools',
    description: 'Macro launcher and stream deck alternative',
    url: 'https://www.touch-portal.com/',
    tags: ['macros', 'stream-deck', 'automation', 'remote-control'],
  },
  'com.einnovation.temu': {
    category: 'specialized',
    subcategory: 'shopping',
    description: 'Online marketplace for affordable goods',
    url: 'https://www.temu.com/',
    tags: ['shopping', 'marketplace', 'deals', 'delivery'],
  },
  'com.ngocluu.onewriter': {
    category: 'productivity',
    subcategory: 'writing',
    description: 'Markdown text editor for iOS',
    url: 'https://1writerapp.com/',
    tags: ['markdown', 'writing', 'text-editor', 'notes'],
  },
  'fi.polar.polarbeat': {
    category: 'specialized',
    subcategory: 'fitness',
    description: 'Running and fitness tracker for Polar devices',
    url: 'https://www.polar.com/en/beat',
    tags: ['fitness', 'running', 'heart-rate', 'training', 'polar'],
  },
  'com.sonos.SonosController': {
    category: 'specialized',
    subcategory: 'audio',
    description: 'Sonos speaker system controller',
    url: 'https://www.sonos.com/',
    tags: ['speakers', 'audio', 'multi-room', 'smart-home', 'music'],
  },
};

// Known web service metadata for pre-filling generated entries
const WEB_APP_INFO = {
  'github.com': {
    name: 'GitHub',
    category: 'development',
    subcategory: 'version-control',
    description: 'Code hosting, version control, and collaboration',
    url: 'https://github.com/',
    tags: ['git', 'code', 'collaboration', 'open-source', 'repositories'],
  },
  'app.netlify.com': {
    name: 'Netlify',
    category: 'development',
    subcategory: 'hosting',
    description: 'Web hosting and deployment platform',
    url: 'https://www.netlify.com/',
    tags: ['hosting', 'deployment', 'cdn', 'serverless', 'jamstack'],
  },
  'console.cloudinary.com': {
    name: 'Cloudinary',
    category: 'development',
    subcategory: 'media',
    description: 'Cloud-based image and video management',
    url: 'https://cloudinary.com/',
    tags: ['images', 'media', 'cdn', 'optimization', 'upload'],
  },
  'supabase.com': {
    name: 'Supabase',
    category: 'development',
    subcategory: 'backend',
    description: 'Open-source Firebase alternative with Postgres',
    url: 'https://supabase.com/',
    tags: ['database', 'postgres', 'auth', 'realtime', 'backend'],
  },
  'claude.ai': {
    name: 'Claude AI',
    category: 'ai',
    subcategory: 'assistant',
    description: 'AI assistant web interface by Anthropic',
    url: 'https://claude.ai/',
    tags: ['ai', 'assistant', 'writing', 'coding', 'research'],
  },
  'airtable.com': {
    name: 'Airtable',
    category: 'productivity',
    subcategory: 'database',
    description: 'Spreadsheet-database hybrid for organizing anything',
    url: 'https://airtable.com/',
    tags: ['database', 'spreadsheet', 'project-management', 'collaboration'],
  },
  'go.xero.com': {
    name: 'Xero',
    category: 'productivity',
    subcategory: 'finance',
    description: 'Online accounting software for small business',
    url: 'https://www.xero.com/',
    tags: ['accounting', 'invoicing', 'finance', 'bookkeeping'],
  },
  'admin.cloud.microsoft': {
    name: 'Microsoft 365 Admin',
    category: 'productivity',
    subcategory: 'admin',
    description: 'Microsoft 365 administration portal',
    url: 'https://admin.microsoft.com/',
    tags: ['admin', 'microsoft-365', 'management', 'users'],
  },
  'console.cloud.google.com': {
    name: 'Google Cloud Console',
    category: 'development',
    subcategory: 'cloud',
    description: 'Google Cloud Platform management console',
    url: 'https://console.cloud.google.com/',
    tags: ['cloud', 'infrastructure', 'google', 'devops'],
  },
  'earth.google.com': {
    name: 'Google Earth',
    category: 'specialized',
    subcategory: 'mapping',
    description: '3D globe and satellite imagery explorer',
    url: 'https://earth.google.com/',
    tags: ['maps', 'satellite', 'geography', 'exploration'],
  },
  'www.reddit.com': {
    name: 'Reddit',
    category: 'communication',
    subcategory: 'social',
    description: 'Community discussion and content sharing',
    url: 'https://www.reddit.com/',
    tags: ['social', 'forums', 'communities', 'discussions'],
  },
  'www.dropbox.com': {
    name: 'Dropbox',
    category: 'productivity',
    subcategory: 'cloud-storage',
    description: 'Cloud file storage and sync',
    url: 'https://www.dropbox.com/',
    tags: ['cloud-storage', 'file-sync', 'sharing'],
  },
  'fonts.adobe.com': {
    name: 'Adobe Fonts',
    category: 'design',
    subcategory: 'fonts',
    description: 'Font library included with Creative Cloud',
    url: 'https://fonts.adobe.com/',
    tags: ['fonts', 'typography', 'design', 'adobe'],
  },
  'app.tina.io': {
    name: 'TinaCMS',
    category: 'development',
    subcategory: 'cms',
    description: 'Git-backed headless CMS',
    url: 'https://tina.io/',
    tags: ['cms', 'headless', 'git', 'content-management'],
  },
  'customers.vectorworks.net': {
    name: 'Vectorworks Portal',
    category: 'design',
    subcategory: 'architecture',
    description: 'Vectorworks customer portal and resources',
    url: 'https://www.vectorworks.net/',
    tags: ['cad', 'architecture', 'design', 'bim'],
  },
};

function queryTimingDB(sql) {
  try {
    const result = execSync(`sqlite3 "${TIMING_DB}" "${sql}"`, {
      encoding: 'utf-8',
      maxBuffer: 10 * 1024 * 1024,
    });
    return result
      .trim()
      .split('\n')
      .filter((l) => l);
  } catch (err) {
    if (err.stderr && err.stderr.includes('no such table')) {
      console.error('Timing database not found or has unexpected schema.');
      process.exit(1);
    }
    return [];
  }
}

function loadCatalog() {
  if (!fs.existsSync(CATALOG_PATH)) {
    console.error('No catalog.json found. Run "node build.js" first.');
    process.exit(1);
  }
  return fs.readJSONSync(CATALOG_PATH);
}

function slugify(name) {
  return name
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '');
}

function fuzzyMatch(a, b) {
  const na = a.toLowerCase().replace(/[^a-z0-9]/g, '');
  const nb = b.toLowerCase().replace(/[^a-z0-9]/g, '');
  return na === nb || na.includes(nb) || nb.includes(na);
}

function scanIosApps() {
  console.log('Querying Timing database for iPhone app usage...\n');

  const rows = queryTimingDB(`
    SELECT a.title, a.bundleIdentifier,
      ROUND(SUM(aa.endDate - aa.startDate) / 3600, 1) as hours,
      COUNT(*) as sessions
    FROM AppActivity aa
    JOIN Application a ON aa.applicationID = a.id
    WHERE aa.localDeviceID = ${IPHONE_DEVICE_ID} AND aa.isDeleted = 0
    GROUP BY a.id
    HAVING hours >= ${MIN_HOURS_IOS}
    ORDER BY hours DESC;
  `);

  const apps = [];
  for (const row of rows) {
    const parts = row.split('|');
    if (parts.length < 4) continue;
    const [name, bundleId, hours, sessions] = parts;
    if (SKIP_IOS.has(bundleId)) continue;
    apps.push({
      name: name || bundleId,
      bundleId,
      hours: parseFloat(hours),
      sessions: parseInt(sessions, 10),
      type: 'ios',
    });
  }

  return apps;
}

function scanWebServices() {
  console.log('Querying Timing database for web service usage (Safari URLs)...\n');

  const rows = queryTimingDB(`
    SELECT
      REPLACE(REPLACE(
        SUBSTR(p.stringValue, 1,
          CASE WHEN INSTR(SUBSTR(p.stringValue, 9), '/') > 0
            THEN INSTR(SUBSTR(p.stringValue, 9), '/') + 7
            ELSE LENGTH(p.stringValue)
          END
        ), 'https://', ''), 'http://', '') as domain,
      ROUND(SUM(aa.endDate - aa.startDate) / 3600, 2) as hours,
      COUNT(*) as sessions
    FROM AppActivity aa
    JOIN Application a ON aa.applicationID = a.id
    JOIN Path p ON aa.pathID = p.id
    WHERE a.bundleIdentifier IN ('com.apple.Safari', 'com.google.Chrome')
      AND aa.isDeleted = 0
      AND p.stringValue LIKE 'http%'
    GROUP BY domain
    HAVING hours >= ${MIN_HOURS_WEB}
    ORDER BY hours DESC;
  `);

  const services = [];
  for (const row of rows) {
    const parts = row.split('|');
    if (parts.length < 3) continue;
    const [domain, hours, sessions] = parts;
    if (SKIP_DOMAINS.has(domain)) continue;
    if (domain.startsWith('localhost')) continue;
    services.push({
      domain,
      hours: parseFloat(hours),
      sessions: parseInt(sessions, 10),
      type: 'web',
    });
  }

  return services;
}

function formatHours(h) {
  if (h >= 10) return `${Math.round(h)}h`;
  return `${h.toFixed(1)}h`;
}

function generateMarkdown(entry, today) {
  const slug = slugify(entry.name);
  const tags = entry.tags.length > 0 ? entry.tags.map((t) => `"${t}"`).join(', ') : '';
  const devices =
    entry.type === 'ios' ? '["ios"]' : entry.type === 'web' ? '["mbp", "studio"]' : '["mbp"]';

  return {
    slug,
    category: entry.category || '',
    content: `---
name: "${entry.name}"
type: "${entry.type}"
category: "${entry.category || ''}"
subcategory: "${entry.subcategory || ''}"
description: "${entry.description || ''}"
url: "${entry.url || ''}"
tags: [${tags}]
devices: ${devices}
display: false
status: "active"
startedUsing: ""
dateAdded: "${today}"
---

${entry.description || ''}
`,
  };
}

async function main() {
  const args = process.argv.slice(2);
  const doGenerate = args.includes('--generate');
  const showIos = args.includes('--ios') || (!args.includes('--web') && !args.includes('--ios'));
  const showWeb = args.includes('--web') || (!args.includes('--web') && !args.includes('--ios'));
  const today = new Date().toISOString().split('T')[0];

  // Check Timing DB exists
  if (!fs.existsSync(TIMING_DB)) {
    console.error('Timing database not found at:', TIMING_DB);
    console.error('Timing app must be installed with Screen Time sync enabled for iPhone data.');
    process.exit(1);
  }

  const catalog = loadCatalog();
  const catalogNames = catalog.tools.map((t) => t.name);

  let iosApps = [];
  let webServices = [];

  if (showIos) {
    iosApps = scanIosApps();
    // Filter out apps already in catalog
    const newIos = iosApps.filter(
      (app) =>
        !catalogNames.some((cn) => fuzzyMatch(app.name, cn)) &&
        !catalogNames.some((cn) => {
          const info = IOS_APP_INFO[app.bundleId];
          return info && fuzzyMatch(info.description || '', cn);
        }),
    );

    console.log(`--- iOS APPS (${newIos.length} new / ${iosApps.length} total) ---\n`);
    if (newIos.length === 0) {
      console.log('  All tracked iOS apps are already in the catalog.\n');
    } else {
      for (const app of newIos) {
        const known = IOS_APP_INFO[app.bundleId] ? ' *' : '';
        console.log(
          `  ${formatHours(app.hours).padStart(6)} | ${app.sessions.toString().padStart(5)} sessions | ${app.name}${known}`,
        );
      }
      console.log('\n  (* = metadata will be pre-filled)\n');
    }

    // Show existing catalog tools that also appear on iPhone
    const existing = iosApps.filter((app) => catalogNames.some((cn) => fuzzyMatch(app.name, cn)));
    if (existing.length > 0) {
      console.log(`--- ALSO ON iPHONE (${existing.length} catalog tools) ---\n`);
      for (const app of existing.slice(0, 15)) {
        console.log(`  ${formatHours(app.hours).padStart(6)} | ${app.name}`);
      }
      if (existing.length > 15) console.log(`  ... and ${existing.length - 15} more`);
      console.log('');
    }

    iosApps = newIos; // Only new apps from here on
  }

  if (showWeb) {
    webServices = scanWebServices();
    // Filter out domains already in catalog
    const newWeb = webServices.filter((svc) => {
      const info = WEB_APP_INFO[svc.domain];
      const name = info ? info.name : svc.domain;
      return !catalogNames.some((cn) => fuzzyMatch(name, cn));
    });

    console.log(`--- WEB SERVICES (${newWeb.length} new / ${webServices.length} total) ---\n`);
    if (newWeb.length === 0) {
      console.log('  All tracked web services are already in the catalog.\n');
    } else {
      for (const svc of newWeb) {
        const info = WEB_APP_INFO[svc.domain];
        const name = info ? `${info.name} (${svc.domain})` : svc.domain;
        const known = info ? ' *' : '';
        console.log(
          `  ${formatHours(svc.hours).padStart(6)} | ${svc.sessions.toString().padStart(5)} sessions | ${name}${known}`,
        );
      }
      console.log('\n  (* = metadata will be pre-filled)\n');
    }

    webServices = newWeb;
  }

  // Save report
  const report = {
    scannedAt: new Date().toISOString(),
    source: 'Timing App (Screen Time sync)',
    timingDB: TIMING_DB,
    iosApps: iosApps.map((a) => ({
      name: a.name,
      bundleId: a.bundleId,
      hours: a.hours,
      sessions: a.sessions,
      knownMetadata: !!IOS_APP_INFO[a.bundleId],
    })),
    webServices: webServices.map((s) => ({
      domain: s.domain,
      hours: s.hours,
      sessions: s.sessions,
      knownMetadata: !!WEB_APP_INFO[s.domain],
    })),
  };
  await fs.writeJSON(REPORT_PATH, report, { spaces: 2 });
  console.log(`Usage report saved to content/usage-report.json\n`);

  // Generate mode
  if (doGenerate) {
    const toGenerate = [];

    // iOS apps with known metadata
    for (const app of iosApps) {
      const info = IOS_APP_INFO[app.bundleId];
      if (!info) continue;
      toGenerate.push({
        name: app.name,
        type: 'ios',
        category: info.category,
        subcategory: info.subcategory,
        description: info.description,
        url: info.url,
        tags: info.tags || [],
        hours: app.hours,
      });
    }

    // Web services with known metadata
    for (const svc of webServices) {
      const info = WEB_APP_INFO[svc.domain];
      if (!info) continue;
      toGenerate.push({
        name: info.name,
        type: 'web',
        category: info.category,
        subcategory: info.subcategory,
        description: info.description,
        url: info.url,
        tags: info.tags || [],
        hours: svc.hours,
      });
    }

    if (toGenerate.length === 0) {
      console.log('No entries with pre-filled metadata to generate.');
      console.log('Add metadata to IOS_APP_INFO or WEB_APP_INFO in scan-usage.js first.\n');
      return;
    }

    console.log(`Generating ${toGenerate.length} files (dateAdded: ${today})...\n`);

    let count = 0;
    for (const entry of toGenerate) {
      const { slug, category, content } = generateMarkdown(entry, today);
      const folder = category || 'uncategorized';
      const destDir = path.join(TOOLS_DIR, folder);
      await fs.ensureDir(destDir);

      const filePath = path.join(destDir, `${slug}.md`);
      if (await fs.pathExists(filePath)) {
        console.log(`  skip ${folder}/${slug}.md (already exists)`);
        continue;
      }

      await fs.writeFile(filePath, content);
      console.log(`  created ${folder}/${slug}.md (${entry.type}, ${formatHours(entry.hours)})`);
      count++;
    }

    console.log(`\nGenerated ${count} files. All have display: false.`);
    console.log('Edit in Airtable to review, add icons, and enable.\n');
  } else if (iosApps.length > 0 || webServices.length > 0) {
    const knownIos = iosApps.filter((a) => IOS_APP_INFO[a.bundleId]).length;
    const knownWeb = webServices.filter((s) => WEB_APP_INFO[s.domain]).length;
    console.log('--- To generate files for known entries, run: ---');
    console.log('  node scripts/scan-usage.js --generate');
    if (knownIos + knownWeb > 0) {
      console.log(`  (${knownIos} iOS + ${knownWeb} web with pre-filled metadata)\n`);
    }
    console.log('\nUnknown apps need metadata added to IOS_APP_INFO or WEB_APP_INFO first.');
    console.log('Or create entries manually in Airtable.\n');
  }
}

main().catch((err) => {
  console.error('Scan failed:', err);
  process.exit(1);
});
