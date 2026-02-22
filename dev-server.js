#!/usr/bin/env node

const express = require('express');
const path = require('node:path');
const chokidar = require('chokidar');
const { exec } = require('node:child_process');

const app = express();
const PORT = process.env.PORT || 3000;
const PUBLIC_DIR = path.join(__dirname, 'public');

// Serve static files
app.use(express.static(PUBLIC_DIR));

// Serve index.html for all routes (SPA support)
app.get('*', (_req, res) => {
  res.sendFile(path.join(PUBLIC_DIR, 'index.html'));
});

// Initial build
console.log('🔨 Running initial build...\n');
exec('node build.js', (error, stdout, stderr) => {
  if (error) {
    console.error('Build error:', error);
    process.exit(1);
  }
  console.log(stdout);
  if (stderr) console.error(stderr);

  // Start server
  app.listen(PORT, () => {
    console.log(`\n🌐 Dev server running at http://localhost:${PORT}`);
    console.log('👀 Watching for changes...\n');
  });

  // Watch for changes
  const watcher = chokidar.watch(['content/**/*', 'templates/**/*', 'src/**/*'], {
    ignored: /(^|[/\\])\../, // ignore dotfiles
    persistent: true,
  });

  let buildTimeout;
  watcher.on('change', (filepath) => {
    console.log(`📝 Changed: ${filepath}`);

    // Debounce builds
    clearTimeout(buildTimeout);
    buildTimeout = setTimeout(() => {
      console.log('🔨 Rebuilding...\n');
      exec('node build.js', (error, stdout, stderr) => {
        if (error) {
          console.error('Build error:', error);
          return;
        }
        console.log(stdout);
        if (stderr) console.error(stderr);
        console.log('✅ Rebuild complete!\n');
      });
    }, 300);
  });
});
