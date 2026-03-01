# Tech Stack Showcase

A personal tech stack website cataloging every tool, app, and service used for development and productivity. Built with Handlebars, managed via Airtable, deployed on Netlify.

## Features

- Clean, modern dark/light theme with auto system detection
- Live search with category and platform filtering
- Airtable CMS with two-way sync
- Fully responsive design
- Fast static output, no runtime server needed
- Keyboard shortcuts (Alt+0-9 for categories, Alt+A for all)

## Quick Start

### Local Development

```bash
npm install
npm run dev
```

Visit `http://localhost:3000` to see the site with live reload.

### Production Build (Netlify)

Netlify runs automatically on push to `main`:
```
BUILD_DIR=dist node build.js
```

## Project Structure

```
content/tools/<category>/  Tool entries organized by category subfolder
content/categories.json    11 categories with icons and subcategories
content/catalog.json       Auto-generated tool index (built by build.js)
content/settings.json      Site title, author, URLs
templates/index.hbs        Main page layout (Handlebars)
templates/partials/        Reusable components (tool-card.hbs)
src/styles/                main.css + themes.css
src/scripts/               theme.js, search.js, filter.js, modal.js
scripts/sync-airtable.js   Airtable two-way sync
scripts/scan-apps.js       Mac app scanner and tool generator
scripts/scan-usage.js      iOS/web usage scanner (queries Timing app)
scripts/generate-tools.js  Batch tool creator with icon fetching
build.js                   Custom static site generator
dev-server.js              Express + Chokidar dev server (port 3000)
```

## Content Management

### Using Airtable (Recommended)

1. Edit tools in the Airtable base (txstack)
2. Run `npm run sync:pull` to update local markdown files
3. Commit and push — Netlify auto-deploys

```bash
npm run sync:pull     # Airtable → markdown
npm run sync:push     # Markdown → Airtable
npm run sync:status   # Show sync status
```

### Manual Editing

Create a markdown file in `content/tools/<category>/`:

```markdown
---
name: "Tool Name"
type: "mac"
category: "development"
subcategory: "IDE"
url: "https://example.com"
icon: "https://res.cloudinary.com/..."
tags: ["tag1", "tag2"]
devices: ["mbp", "studio", "ios"]
display: true
status: "active"
featured: false
startedUsing: "2020"
dateAdded: "2026-02-26"
---

Why I use this tool (optional markdown body).
```

**Categories**: system, development, productivity, communication, media, security, specialized, ai, design, finance, games

**Types**: mac, ios, web

**Icons**: Hosted on Cloudinary CDN (`dk3rktqns`). Use any image URL in the `icon` field.

## App Scanner

Scan your Mac for installed apps and sync them into the catalog:

```bash
# Report only — see what's new and what's missing
node scripts/scan-apps.js

# Generate tool files for new apps (pre-filled, display: false)
node scripts/scan-apps.js --generate

# Query tools by date added
node scripts/scan-apps.js --recent 2026-02-26

# Show catalog tools not found on this Mac
node scripts/scan-apps.js --missing
```

Scans `/Applications`, `/Applications/Setapp`, and `~/Applications`. New entries are pre-filled with category, description, URL, and tags where known. All generated files start with `display: false` — review and enable in Airtable.

## Deployment

The site is deployed on **Netlify** with automatic builds on push to `main`. No environment variables required — the build only reads markdown files from git.

## Tech Stack

- **Handlebars** — Templating
- **Airtable** — Content management
- **Express** — Development server
- **Chokidar** — File watching
- **Markdown-it** — Markdown processing
- **Netlify** — Hosting and CI/CD

## License

MIT
