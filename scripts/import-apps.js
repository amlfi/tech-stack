#!/usr/bin/env node

const fs = require('fs-extra');
const path = require('node:path');

const TOOLS_DIR = path.join(__dirname, '..', 'content', 'tools');

// App data structure with major categories and subcategories
const apps = [
  // System & Utilities
  {
    name: 'Raycast',
    category: 'system',
    subcategory: 'launcher',
    description: 'Lightning-fast launcher and productivity tool',
    url: 'https://raycast.com/',
    devices: ['mbp'],
    display: true,
  },
  {
    name: 'Bartender 5',
    category: 'system',
    subcategory: 'menu-bar',
    description: 'Menu bar organization tool',
    url: 'https://www.macbartender.com/',
    devices: ['mbp'],
    display: true,
  },
  {
    name: 'Amphetamine',
    category: 'system',
    subcategory: 'utilities',
    description: 'Keep your Mac awake',
    url: 'https://apps.apple.com/app/amphetamine/id937984704',
    devices: ['mbp'],
    display: true,
  },
  {
    name: 'Setapp',
    category: 'system',
    subcategory: 'utilities',
    description: 'Mac app subscription platform',
    url: 'https://setapp.com/',
    devices: ['mbp'],
    display: true,
  },
  {
    name: 'iStat Menus',
    category: 'system',
    subcategory: 'monitoring',
    description: 'System monitoring in menu bar',
    url: 'https://bjango.com/mac/istatmenus/',
    devices: ['mbp'],
    display: true,
  },
  {
    name: 'Timing',
    category: 'system',
    subcategory: 'monitoring',
    description: 'Automatic time tracking',
    url: 'https://timingapp.com/',
    devices: ['mbp'],
    display: true,
  },
  {
    name: 'InYourFace',
    category: 'system',
    subcategory: 'utilities',
    description: 'Event reminders on screen',
    url: 'https://inyourface.app/',
    devices: ['mbp'],
    display: false,
  },
  {
    name: 'Keka',
    category: 'system',
    subcategory: 'compression',
    description: 'File archiver for macOS',
    url: 'https://www.keka.io/',
    devices: ['mbp'],
    display: true,
  },
  {
    name: 'Dropbox',
    category: 'system',
    subcategory: 'cloud-storage',
    description: 'Cloud file storage and sync',
    url: 'https://www.dropbox.com/',
    devices: ['mbp'],
    display: true,
  },
  {
    name: 'OneDrive',
    category: 'system',
    subcategory: 'cloud-storage',
    description: 'Microsoft cloud storage',
    url: 'https://www.microsoft.com/onedrive',
    devices: ['mbp'],
    display: true,
  },
  {
    name: 'A Better Finder Rename 12',
    category: 'system',
    subcategory: 'file-management',
    description: 'Batch file renaming tool',
    url: 'https://www.publicspace.net/ABetterFinderRename/',
    devices: ['mbp'],
    display: true,
  },
  {
    name: 'CleanShot X',
    category: 'system',
    subcategory: 'screenshots',
    description: 'Screenshot and screen recording tool',
    url: 'https://cleanshot.com/',
    devices: ['mbp'],
    display: true,
  },
  {
    name: 'CleanMyMac',
    category: 'system',
    subcategory: 'maintenance',
    description: 'Mac cleaning and optimization',
    url: 'https://macpaw.com/cleanmymac',
    devices: ['mbp'],
    display: true,
  },
  {
    name: 'DockFix',
    category: 'system',
    subcategory: 'utilities',
    description: 'Dock customization tool',
    url: '',
    devices: ['mbp'],
    display: false,
  },
  {
    name: 'NetSpot',
    category: 'system',
    subcategory: 'networking',
    description: 'WiFi analyzer and survey tool',
    url: 'https://www.netspotapp.com/',
    devices: ['mbp'],
    display: false,
  },
  {
    name: 'LookAway',
    category: 'system',
    subcategory: 'health',
    description: 'Break reminder for eye health',
    url: 'https://lookaway.app/',
    devices: ['mbp'],
    display: true,
  },

  // Development Tools
  {
    name: 'Sublime Text',
    category: 'development',
    subcategory: 'code-editor',
    description: 'Sophisticated text editor for code',
    url: 'https://www.sublimetext.com/',
    devices: ['mbp'],
    display: true,
  },
  {
    name: 'Sublime Merge',
    category: 'development',
    subcategory: 'version-control',
    description: 'Git client from Sublime',
    url: 'https://www.sublimemerge.com/',
    devices: ['mbp'],
    display: true,
  },
  {
    name: 'Typora',
    category: 'development',
    subcategory: 'markdown',
    description: 'Minimalist markdown editor',
    url: 'https://typora.io/',
    devices: ['mbp'],
    display: true,
  },
  {
    name: 'iTerm',
    category: 'development',
    subcategory: 'terminal',
    description: 'Terminal emulator for macOS',
    url: 'https://iterm2.com/',
    devices: ['mbp'],
    display: true,
  },
  {
    name: 'iTermAI',
    category: 'development',
    subcategory: 'terminal',
    description: 'AI-powered terminal assistant',
    url: '',
    devices: ['mbp'],
    display: false,
  },
  {
    name: 'iTermBrowserPlugin',
    category: 'development',
    subcategory: 'terminal',
    description: 'Browser integration for iTerm',
    url: '',
    devices: ['mbp'],
    display: false,
  },
  {
    name: 'SF Symbols',
    category: 'development',
    subcategory: 'design-tools',
    description: 'Apple icon and symbol library',
    url: 'https://developer.apple.com/sf-symbols/',
    devices: ['mbp'],
    display: true,
  },
  {
    name: 'Icon Composer',
    category: 'development',
    subcategory: 'design-tools',
    description: 'Mac icon creation tool',
    url: '',
    devices: ['mbp'],
    display: false,
  },
  {
    name: 'Tailscale',
    category: 'development',
    subcategory: 'networking',
    description: 'Secure network connectivity',
    url: 'https://tailscale.com/',
    devices: ['mbp'],
    display: true,
  },
  {
    name: 'RealVNC Connect',
    category: 'development',
    subcategory: 'remote-access',
    description: 'Remote desktop access',
    url: 'https://www.realvnc.com/',
    devices: ['mbp'],
    display: true,
  },
  {
    name: 'Remote Desktop',
    category: 'development',
    subcategory: 'remote-access',
    description: 'Microsoft Remote Desktop',
    url: 'https://apps.apple.com/app/microsoft-remote-desktop/id1295203466',
    devices: ['mbp'],
    display: true,
  },
  {
    name: 'Geekbench 6',
    category: 'development',
    subcategory: 'testing',
    description: 'Cross-platform benchmark tool',
    url: 'https://www.geekbench.com/',
    devices: ['mbp'],
    display: false,
  },
  {
    name: 'TestFlight',
    category: 'development',
    subcategory: 'testing',
    description: 'iOS beta testing platform',
    url: 'https://testflight.apple.com/',
    devices: ['mbp'],
    display: true,
  },

  // Productivity
  {
    name: 'Things 3',
    category: 'productivity',
    subcategory: 'task-management',
    description: 'Award-winning task manager',
    url: 'https://culturedcode.com/things/',
    devices: ['mbp', 'ios'],
    display: true,
  },
  {
    name: 'Agenda',
    category: 'productivity',
    subcategory: 'notes',
    description: 'Date-focused note taking',
    url: 'https://agenda.com/',
    devices: ['mbp'],
    display: true,
  },
  {
    name: 'Airtable',
    category: 'productivity',
    subcategory: 'database',
    description: 'Collaborative database platform',
    url: 'https://airtable.com/',
    devices: ['mbp'],
    display: true,
  },
  {
    name: 'Obsidian',
    category: 'productivity',
    subcategory: 'notes',
    description: 'Knowledge base and note-taking',
    url: 'https://obsidian.md/',
    devices: ['mbp'],
    display: true,
  },
  {
    name: 'SnappyNotes',
    category: 'productivity',
    subcategory: 'notes',
    description: 'Quick capture notes app',
    url: '',
    devices: ['mbp'],
    display: false,
  },
  {
    name: 'Fantastical',
    category: 'productivity',
    subcategory: 'calendar',
    description: 'Powerful calendar app',
    url: 'https://flexibits.com/fantastical',
    devices: ['mbp', 'ios'],
    display: true,
  },
  {
    name: 'Cardhop',
    category: 'productivity',
    subcategory: 'contacts',
    description: 'Contact management by Flexibits',
    url: 'https://flexibits.com/cardhop',
    devices: ['mbp'],
    display: true,
  },
  {
    name: 'Microsoft Word',
    category: 'productivity',
    subcategory: 'office-suite',
    description: 'Word processing application',
    url: 'https://www.microsoft.com/microsoft-365/word',
    devices: ['mbp'],
    display: true,
  },
  {
    name: 'Microsoft Excel',
    category: 'productivity',
    subcategory: 'office-suite',
    description: 'Spreadsheet application',
    url: 'https://www.microsoft.com/microsoft-365/excel',
    devices: ['mbp'],
    display: true,
  },
  {
    name: 'Microsoft Outlook',
    category: 'productivity',
    subcategory: 'email',
    description: 'Email and calendar client',
    url: 'https://www.microsoft.com/microsoft-365/outlook',
    devices: ['mbp'],
    display: true,
  },
  {
    name: 'Pages',
    category: 'productivity',
    subcategory: 'office-suite',
    description: 'Apple word processor',
    url: 'https://www.apple.com/pages/',
    devices: ['mbp'],
    display: false,
  },
  {
    name: 'Focus 2',
    category: 'productivity',
    subcategory: 'focus-tools',
    description: 'Focus and productivity timer',
    url: '',
    devices: ['mbp'],
    display: true,
  },
  {
    name: 'ForkLift',
    category: 'productivity',
    subcategory: 'file-management',
    description: 'Advanced file manager and FTP client',
    url: 'https://binarynights.com/',
    devices: ['mbp'],
    display: true,
  },

  // Communication
  {
    name: 'Safari',
    category: 'communication',
    subcategory: 'browsers',
    description: 'Apple web browser',
    url: 'https://www.apple.com/safari/',
    devices: ['mbp', 'ios'],
    display: true,
  },
  {
    name: 'Google Chrome',
    category: 'communication',
    subcategory: 'browsers',
    description: 'Google web browser',
    url: 'https://www.google.com/chrome/',
    devices: ['mbp'],
    display: true,
  },
  {
    name: 'Microsoft Teams',
    category: 'communication',
    subcategory: 'messaging',
    description: 'Team collaboration platform',
    url: 'https://www.microsoft.com/microsoft-teams',
    devices: ['mbp'],
    display: true,
  },
  {
    name: 'Zoom',
    category: 'communication',
    subcategory: 'video-conferencing',
    description: 'Video conferencing platform',
    url: 'https://zoom.us/',
    devices: ['mbp'],
    display: true,
  },
  {
    name: 'WhatsApp',
    category: 'communication',
    subcategory: 'messaging',
    description: 'Messaging application',
    url: 'https://www.whatsapp.com/',
    devices: ['mbp', 'ios'],
    display: true,
  },

  // Creative & Media
  {
    name: 'IINA',
    category: 'media',
    subcategory: 'video-players',
    description: 'Modern media player for macOS',
    url: 'https://iina.io/',
    devices: ['mbp'],
    display: true,
  },
  {
    name: 'Spotify',
    category: 'media',
    subcategory: 'music',
    description: 'Music streaming service',
    url: 'https://www.spotify.com/',
    devices: ['mbp', 'ios'],
    display: true,
  },
  {
    name: 'Sonos S1 Controller',
    category: 'media',
    subcategory: 'music',
    description: 'Sonos speaker control app',
    url: 'https://www.sonos.com/',
    devices: ['mbp'],
    display: false,
  },
  {
    name: 'ColorSlurp',
    category: 'media',
    subcategory: 'design-tools',
    description: 'Color picker and manager',
    url: 'https://colorslurp.com/',
    devices: ['mbp'],
    display: true,
  },
  {
    name: 'Vectorworks Cloud Services',
    category: 'media',
    subcategory: 'design-tools',
    description: 'CAD cloud collaboration',
    url: 'https://www.vectorworks.net/',
    devices: ['mbp'],
    display: false,
  },

  // Security
  {
    name: '1Password',
    category: 'security',
    subcategory: 'password-managers',
    description: 'Password manager and secure vault',
    url: 'https://1password.com/',
    devices: ['mbp', 'ios'],
    display: true,
  },
  {
    name: '1Password for Safari',
    category: 'security',
    subcategory: 'password-managers',
    description: 'Safari browser extension',
    url: 'https://1password.com/',
    devices: ['mbp'],
    display: false,
  },

  // Specialized
  {
    name: 'SteerMouse',
    category: 'specialized',
    subcategory: 'input-devices',
    description: 'Mouse customization utility',
    url: 'https://plentycom.jp/en/steermouse/',
    devices: ['mbp'],
    display: true,
  },
  {
    name: 'TouchPortal',
    category: 'specialized',
    subcategory: 'automation',
    description: 'Stream deck alternative',
    url: 'https://www.touch-portal.com/',
    devices: ['mbp'],
    display: false,
  },
  {
    name: 'Numi',
    category: 'specialized',
    subcategory: 'calculators',
    description: 'Beautiful calculator with text support',
    url: 'https://numi.app/',
    devices: ['mbp'],
    display: true,
  },
  {
    name: 'IconJar',
    category: 'specialized',
    subcategory: 'design-tools',
    description: 'Icon organizer and manager',
    url: 'https://geticonjar.com/',
    devices: ['mbp'],
    display: true,
  },
  {
    name: 'Nx Witness',
    category: 'specialized',
    subcategory: 'security-cameras',
    description: 'Video surveillance platform',
    url: 'https://www.networkoptix.com/',
    devices: ['mbp'],
    display: false,
  },
  {
    name: 'Copy Em',
    category: 'specialized',
    subcategory: 'clipboard',
    description: 'Clipboard manager',
    url: 'https://apprywhere.com/ce-mac.html',
    devices: ['mbp'],
    display: true,
  },

  // AI & Automation
  {
    name: 'Claude',
    category: 'ai',
    subcategory: 'ai-assistants',
    description: 'AI assistant by Anthropic',
    url: 'https://claude.ai/',
    devices: ['mbp'],
    display: true,
  },
];

// Categories structure with major categories and subcategories
const categories = {
  categories: [
    {
      id: 'system',
      name: 'System & Utilities',
      icon: '⚙️',
      description: 'System tools and utilities for macOS',
      order: 1,
      subcategories: [
        'launcher',
        'menu-bar',
        'utilities',
        'monitoring',
        'compression',
        'cloud-storage',
        'file-management',
        'screenshots',
        'maintenance',
        'networking',
        'health',
      ],
    },
    {
      id: 'development',
      name: 'Development',
      icon: '💻',
      description: 'Development tools and environments',
      order: 2,
      subcategories: [
        'code-editor',
        'version-control',
        'markdown',
        'terminal',
        'design-tools',
        'networking',
        'remote-access',
        'testing',
      ],
    },
    {
      id: 'productivity',
      name: 'Productivity',
      icon: '📝',
      description: 'Productivity and office applications',
      order: 3,
      subcategories: [
        'task-management',
        'notes',
        'database',
        'calendar',
        'contacts',
        'office-suite',
        'email',
        'focus-tools',
        'file-management',
      ],
    },
    {
      id: 'communication',
      name: 'Communication',
      icon: '💬',
      description: 'Browsers and communication tools',
      order: 4,
      subcategories: ['browsers', 'messaging', 'video-conferencing'],
    },
    {
      id: 'media',
      name: 'Creative & Media',
      icon: '🎨',
      description: 'Media players and creative tools',
      order: 5,
      subcategories: ['video-players', 'music', 'design-tools'],
    },
    {
      id: 'security',
      name: 'Security',
      icon: '🔒',
      description: 'Security and privacy tools',
      order: 6,
      subcategories: ['password-managers'],
    },
    {
      id: 'specialized',
      name: 'Specialized Tools',
      icon: '🔧',
      description: 'Specialized and niche applications',
      order: 7,
      subcategories: ['input-devices', 'automation', 'calculators', 'design-tools', 'security-cameras', 'clipboard'],
    },
    {
      id: 'ai',
      name: 'AI & Automation',
      icon: '🤖',
      description: 'AI assistants and automation tools',
      order: 8,
      subcategories: ['ai-assistants'],
    },
  ],
};

async function generateToolFiles() {
  console.log('🚀 Generating tool files...\n');

  // Ensure tools directory exists
  await fs.ensureDir(TOOLS_DIR);

  // Remove old tool files (except atom.md which is our example)
  const existingFiles = await fs.readdir(TOOLS_DIR);
  for (const file of existingFiles) {
    if (file !== 'atom.md' && file.endsWith('.md')) {
      await fs.remove(path.join(TOOLS_DIR, file));
    }
  }

  // Generate tool files
  let count = 0;
  for (const app of apps) {
    const slug = app.name
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-|-$/g, '');

    const devices = app.devices || [];
    const devicesStr = devices.length > 0 ? `\ndevices: [${devices.map((d) => `"${d}"`).join(', ')}]` : '';

    const content = `---
name: "${app.name}"
category: "${app.category}"
subcategory: "${app.subcategory}"
description: "${app.description}"
url: "${app.url}"${devicesStr}
display: ${app.display}
status: "active"
---

${app.description}
`;

    await fs.writeFile(path.join(TOOLS_DIR, `${slug}.md`), content);
    count++;
  }

  console.log(`✓ Generated ${count} tool files`);

  // Update categories.json
  const categoriesPath = path.join(__dirname, '..', 'content', 'categories.json');
  await fs.writeJSON(categoriesPath, categories, { spaces: 2 });
  console.log('✓ Updated categories.json');

  console.log('\n✨ Import complete!');
  console.log(`\nStats:`);
  console.log(`- Total apps: ${apps.length}`);
  console.log(`- Displayed apps: ${apps.filter((a) => a.display).length}`);
  console.log(`- Hidden apps: ${apps.filter((a) => !a.display).length}`);
  console.log(`- Categories: ${categories.categories.length}`);
}

generateToolFiles().catch((err) => {
  console.error('❌ Import failed:', err);
  process.exit(1);
});
