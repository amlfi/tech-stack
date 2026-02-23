# txstack - Working Notes

## What This Project Is

**txstack** is a static website that catalogs and showcases Moana's personal tech stack — every tool, app, and service used daily for development and productivity. Built as a single-page site with category filtering, search, theme switching, and modal detail views.

Inspired by `calebleigh_stack.html` (a reference design included in the repo).

## Tech Stack & Why

| Layer | Choice | Rationale |
|-------|--------|-----------|
| **Templating** | Handlebars | Logic-less, partials support, simple to maintain |
| **Build** | Custom `build.js` (Node.js) | Reads markdown frontmatter → compiles Handlebars → outputs static HTML. No framework overhead |
| **Dev Server** | Custom `dev-server.js` (Express + Chokidar) | Hot reload on file changes, serves on port 3000 |
| **Content** | Markdown files with YAML frontmatter | Git-friendly, easy to version, works with CMS or manual editing |
| **CMS** | TinaCMS (Tina Cloud) | Visual editing via cloud dashboard. Replaced Decap CMS |
| **Styling** | Vanilla CSS with custom properties | Theme switching (light/dark/auto) without preprocessors |
| **JS** | Vanilla ES6 | No framework needed — search, filter, modal, and theme toggle are simple interactions |
| **Hosting** | Netlify (primary), GitHub Pages (alt) | Free static hosting with CI/CD |

## Site Structure

```
content/tools/<category>/*.md → 60+ tool entries organized by category subfolder
content/categories.json       → 8 categories with icons and subcategories
content/settings.json   → Site title, author, theme preference
templates/index.hbs     → Main page layout
templates/partials/     → Reusable components (tool-card.hbs)
src/styles/            → main.css (layout) + themes.css (color schemes)
src/scripts/           → theme.js, search.js, filter.js, modal.js
tina/                  → TinaCMS config (Tina Cloud mode)
```

**8 Categories**: System & Utilities, Development, Productivity, Communication, Creative & Media, Security, Specialized Tools, AI & Automation

**47 active tools** across these categories, plus retired tools in a collapsible "Previously Used" section.

## Challenges & Solutions

### Dropbox path breaks native modules
- **Problem**: Project lives at `~/Dropbox (Personal)/DEV/txstack` — parentheses in the path cause `better-sqlite3` (a TinaCMS dependency) to fail during compilation
- **What we tried**: Running `tinacms dev` directly — failed with native module build errors
- **Solution**: Skip `tinacms dev` for local preview. Run `node build.js && node dev-server.js` directly, bypassing the native module. TinaCMS build is only needed for production/Netlify deploys
- **Impact**: No CMS editing UI locally, but the site itself builds and serves fine

### npm install failures
- **Problem**: `node_modules` got wiped during troubleshooting; reinstall pulled `better-sqlite3` which failed again
- **Solution**: Install deps needed for build only, skip the problematic native module

### Dev server port conflicts
- **Problem**: Multiple attempts to start dev server caused port 3000 conflicts
- **Solution**: Checked for existing process on port 3000; original server was still running fine. No restart needed

### Tina config was incomplete for Tina Cloud
- **Problem**: `tina/config.ts` was missing `clientId` and `token` env var references — Tina Cloud wouldn't authenticate without them. Categories in the config didn't match the actual 8 categories used on the site. Several frontmatter fields present in markdown files (notes, display, devices, previouslyUsed, replacedBy) had no corresponding Tina schema fields.
- **Solution**: Added `clientId: process.env.TINA_PUBLIC_CLIENT_ID` and `token: process.env.TINA_TOKEN` to config. Fixed category options to match actual 8 categories (system, development, productivity, communication, media, security, specialized, ai). Added all missing fields to the schema.

### Decap CMS remnants causing confusion
- **Problem**: Old Decap CMS files (`admin/config.yml`, `admin/index.html`, `src/admin/`) still present after migration to TinaCMS. Dev server was also watching the old admin directory.
- **Solution**: Deleted all Decap files, removed admin watch path from `dev-server.js`, verified build still passes.

### Env var name mismatch between config and Netlify
- **Problem**: Config referenced `TINA_PUBLIC_CLIENT_ID` but Netlify had the var saved as `TINA_CLIENT_ID` (set 4 months ago). Deploy would fail silently with no client ID.
- **Solution**: Changed `tina/config.ts` to use `process.env.TINA_CLIENT_ID` to match what Netlify already had.

### Git push failed — HTTPS auth not cached
- **Problem**: Remote was set to HTTPS (`https://github.com/...`) and credentials weren't cached, so `git push` failed with authentication error.
- **Solution**: Switched remote URL to SSH (`git@github.com:...`) since user has SSH keys configured. Push succeeded.

### Netlify deploy failed — Tina Cloud schema stale
- **Problem**: After pushing and triggering a Netlify build, `tinacms build` failed because Tina Cloud's remote schema was last indexed in Oct 2025. It didn't know about the new `devices` field added in session 3. The GitHub webhook that triggers Tina Cloud re-indexing was broken.
- **What we tried**: Pushing a commit to trigger rebuild — same error because Tina Cloud hadn't re-indexed.
- **Solution**: User went to Tina Cloud dashboard → Configuration → clicked "Refresh Webhooks" to force re-indexing. Then refreshed branches to confirm re-index happened.

### Tina Cloud "Path to Tina Config" confusion
- **Problem**: After refreshing webhooks, Tina Cloud still showed stale index. The "Path to Tina Config" field in Advanced Settings was empty — Tina Cloud didn't know where to find the config.
- **What we tried**: Entering `tina` → error said "path should not include tina". Entering `/` → didn't resolve.
- **Solution**: Left the field blank (cleared it) and used "Refresh Branches" instead. The main branch timestamp updated successfully, confirming re-indexing worked.

### Tina Cloud schema checks still failing despite re-index
- **Problem**: Even after Tina Cloud branch re-indexing (session 5), the Netlify build still failed with schema validation errors. The Tina Cloud remote schema timestamp hadn't actually updated.
- **What we tried**: Multiple empty commit pushes to trigger rebuilds — all failed on schema checks.
- **Solution**: Added `--skip-cloud-checks` flag to the `tinacms build` command in `netlify.toml`. This bypasses remote schema validation while still building the Tina client and generated files. The admin panel still works at runtime.

### Hardcoded TINA_TOKEN in committed generated file
- **Problem**: After the build passed, Netlify's secrets scanner flagged the `TINA_TOKEN` value hardcoded in the committed `tina/__generated__/client.ts`. The local `tinacms build` had baked the actual token and local cache path into this file.
- **Solution**: Replaced the hardcoded token with `process.env.TINA_TOKEN` reference and removed the local cache path from the committed file. Since `tinacms build` regenerates this file during the Netlify build, the committed version just needs to be secret-free.

### Netlify secrets scanner flagging build-generated files
- **Problem**: Even after cleaning the committed file, `tinacms build` regenerates `client.ts` with the `TINA_TOKEN` value baked in during the Netlify build process. Netlify's post-build secrets scanner detects this in the build output and flags the deploy.
- **Status**: Build succeeds but deploy is blocked/flagged by the secrets scanner. This is a known TinaCMS behavior — the token is a read-only content token meant to be in the client. Needs resolution via Netlify dashboard (dismiss the finding or configure scanner exclusions).

### Stale tina-lock.json breaking Tina Cloud schema sync
- **Problem**: `tina-lock.json` had the old schema — field named `content` instead of `body`, old category values, missing `devices`/`display` fields. This caused a mismatch between the local lock file and what Tina Cloud expected.
- **What we tried**: Running `tinacms build` to regenerate it — the lock file was not updated (build doesn't regenerate the lock file).
- **Solution**: Ran `tinacms dev` instead, which does regenerate `tina-lock.json`. Used a symlink path outside Dropbox to avoid the `better-sqlite3` native module issue. The lock file was regenerated with all correct fields (new categories, `devices`, `display`, `body` instead of `content`). Committed and pushed.
- **Result**: Tina Cloud editing confirmed working — user successfully edited content through the CMS.

## Key Decisions

1. **Static site generator over frameworks** — No React/Next.js/Gatsby. The site is a single page with category filtering; a custom build script is simpler and faster
2. **TinaCMS (Tina Cloud) over self-hosted** — Originally configured as self-hosted, switched to Tina Cloud for production CMS editing. Requires `TINA_CLIENT_ID` and `TINA_TOKEN` env vars on Netlify
3. **TinaCMS replaces Decap CMS** — Fully migrated. All Decap files removed. No going back
4. **Vanilla JS over libraries** — Search, filtering, modals, and theme switching are all hand-written (~200 lines total). No jQuery, Alpine, or other dependencies
5. **Markdown with frontmatter** — Each tool is a `.md` file with structured YAML fields (name, category, subcategory, icon, url, tags, status, featured, devices, previouslyUsed, replacedBy, display, notes). Allows both CMS and manual editing
6. **Secrets via env vars, not .env files** — User manages secrets through 1Password/Secrets Assistant. Tina credentials go in Netlify env vars, not committed `.env` files
7. **SSH over HTTPS for Git remote** — Switched to `git@github.com` to avoid credential caching issues with HTTPS
8. **Skip Tina Cloud schema checks** — Added `--skip-cloud-checks` to bypass stale remote schema validation. CMS admin still works at runtime; only the build-time validation is skipped
9. **Regenerate lock file with `tinacms dev`, not `tinacms build`** — Only `tinacms dev` regenerates `tina-lock.json`. `tinacms build` consumes the lock file but doesn't update it

## Learnings

- **Dropbox paths with special characters** are a recurring issue for native Node modules — any project using `better-sqlite3`, `sharp`, etc. will break. Consider symlinking or moving the project outside Dropbox for full TinaCMS local dev support
- **TinaCMS requires both `clientId` and `token`** in config.ts for Tina Cloud to work — these are not optional. Without them, the CMS admin won't authenticate
- **Tina schema must mirror frontmatter exactly** — any field in your markdown frontmatter that isn't in the Tina schema won't be editable in the CMS and could be stripped on save
- **Dev server resilience** — the Express-based dev server stays alive even when other processes fail; always check port occupancy before starting a new one
- **Tina Cloud indexes schema via GitHub webhooks** — if the webhook breaks or isn't set up, Tina Cloud won't know about schema changes. The remote schema can go stale for months. Fix: Tina Cloud dashboard → Configuration → Refresh Webhooks
- **Check existing Netlify env vars before adding new ones** — user had `TINA_CLIENT_ID` already set from 4 months ago. Config was referencing a different name (`TINA_PUBLIC_CLIENT_ID`). Always check what's already there first
- **HTTPS git remotes require credential caching on macOS** — if not set up, switch to SSH which uses existing keys
- **Tina Cloud "Path to Tina Config"** — leave this blank; entering `tina` causes a validation error ("path should not include tina"). Tina Cloud auto-discovers the `tina/` folder. Use "Refresh Branches" to force re-indexing instead
- **`--skip-cloud-checks` is safe for production** — it only skips build-time schema validation against Tina Cloud's remote schema. The CMS admin panel still works at runtime because it connects to Tina Cloud directly
- **TinaCMS bakes tokens into generated client code** — `tinacms build` writes the `TINA_TOKEN` value directly into `tina/__generated__/client.ts`. This is by design (it's a read-only content token for the client), but it triggers Netlify's secrets scanner. Don't commit this file with real tokens; `tinacms build` regenerates it during deploy
- **Netlify secrets scanner catches build artifacts** — even if the committed code is clean, the scanner runs post-build and detects secrets in generated files. For TinaCMS projects, you may need to dismiss the finding in Netlify's dashboard since the token is intentionally embedded by the build process
- **`tina-lock.json` is only regenerated by `tinacms dev`** — `tinacms build` reads the lock file but does not update it. If your schema changes, you must run `tinacms dev` to regenerate the lock file before committing and pushing
- **Lock file schema drift causes silent failures** — if `tina-lock.json` doesn't match `tina/config.ts`, Tina Cloud will see a mismatch. The lock file acts as the source of truth for Tina Cloud's schema expectations

## Current Status

- **Site live and editable** — deployed on Netlify, Tina Cloud CMS editing confirmed working
- **47 active tools** across 8 categories, organized into category subfolders
- **Build works** locally via `node build.js` and on Netlify via `node build.js && tinacms build`
- **Tina config synced** — `tina/config.ts`, `tina-lock.json`, and Tina Cloud schema all in agreement
- **TinaCMS search enabled** — search bar works in admin, indexed via `TINA_SEARCH_TOKEN`
- **Icons via macosicons.com CDN** — 46 tools have macOS-style icons loaded from external CDN, no files in repo
- **Category folders** — tools organized into `content/tools/<category>/` subfolders, browsable in TinaCMS admin
- **Category labels** — TinaCMS dropdown shows friendly names (e.g. "Creative & Media") while storing short IDs
- **All Decap CMS references removed** — code, docs, package metadata all cleaned up
- **Netlify env vars set** — `TINA_CLIENT_ID`, `TINA_TOKEN`, `TINA_SEARCH_TOKEN` configured
- **Biome linting** — configured with `biome.json`, available via `npm run lint` / `npm run lint:fix`

## TODO (Next Session)

- [x] ~~Remove Decap CMS files~~ — Done session 3
- [x] ~~Clean up netlify.toml~~ — Decap references removed session 3
- [x] ~~Fix Tina config missing fields and categories~~ — Done session 3
- [x] ~~Set Netlify env vars~~ — Already existed from 4 months ago (session 4)
- [x] ~~Fix env var name mismatch~~ — Changed config from `TINA_PUBLIC_CLIENT_ID` to `TINA_CLIENT_ID` to match Netlify (session 4)
- [x] ~~Push to GitHub~~ — Switched remote to SSH, pushed successfully (session 4)
- [x] ~~Verify Tina Cloud re-index~~ — Branch refreshed, timestamp updated (session 5)
- [x] ~~Retry Netlify deploy~~ — Triggered via empty commit push (session 5)
- [x] ~~Skip Tina Cloud schema checks~~ — Added `--skip-cloud-checks` to netlify.toml build command (session 6)
- [x] ~~Remove hardcoded token from committed client.ts~~ — Replaced with env var reference (session 6)
- [x] ~~Regenerate tina-lock.json~~ — Ran `tinacms dev` to regenerate with correct schema (session 7)
- [x] ~~Test Tina Cloud editing~~ — User confirmed CMS editing works (session 7)
- [x] ~~Update package.json metadata~~ — Fixed description and keywords to reference TinaCMS (session 8)
- [x] ~~Remove `--skip-cloud-checks`~~ — Lock file is in sync, removed the flag (session 8)
- [x] ~~Clean up dead CSS/JS~~ — Removed console.logs from filter.js, removed 5 unused CSS classes (session 8)
- [x] ~~Fix placeholder URLs~~ — Updated settings.json with real URLs, updated build.js fallback (session 8)
- [x] ~~Rewrite documentation~~ — README rewritten for TinaCMS, deleted 4 obsolete Decap-focused docs (session 8)
- [x] ~~Fix dev-server error handling~~ — process.exit(1) on initial build failure (session 8)
- [ ] **Fetch remaining 12 tool icons** — run `MACOSICONS_API_KEY=... npm run fetch-icons` when API quota resets (50/month limit). Missing: steermouse, sublime-merge, sublime-text, tailscale, testflight, things-3, timing, touchportal, typora, vectorworks-cloud-services, whatsapp, zoom
- [ ] **4 tools not in macosicons.com** — inyourface, itermai, itermbrowserplugin, snappynotes (manually find icons or keep placeholders)
- [ ] **Review site content** for accuracy across all 47 tools

---

## Session Log

### 2026-02-22 — Session 1: Project Orientation & Local Dev

- Re-familiarized with project structure after a break
- Attempted `npm run dev` (TinaCMS + dev server) — failed due to Dropbox parentheses path breaking `better-sqlite3`
- Workaround: ran `node build.js` and `node dev-server.js` directly
- Site successfully serving at `localhost:3000` with full content
- Identified CMS transition in progress (Decap → TinaCMS self-hosted)

### 2026-02-22 — Session 2: Review & CMS Cleanup Planning

- User confirmed site looks good at localhost:3000
- Full project review: summarised architecture, tech choices, and rationale
- User requested removal of all Decap CMS files (migration to TinaCMS is final)
- User shared TinaCMS admin screenshots — needs review for completeness
- Identified leftover Decap files: `admin/`, `src/admin/`, `public/admin/`, Decap references in `netlify.toml`
- Updated _WORKING.md with structured summary and TODO list

### 2026-02-22 — Session 3: Decap Cleanup & Tina Config Fix

**Summary**: Removed all Decap CMS remnants, fixed TinaCMS config for Tina Cloud production use, and verified the build still works.

**Challenges & Solutions**:
- **Tina config missing auth credentials** — `tina/config.ts` had no `clientId` or `token` references. Added `process.env.TINA_PUBLIC_CLIENT_ID` and `process.env.TINA_TOKEN` so Tina Cloud can authenticate
- **Category mismatch** — Tina schema categories didn't match the site's actual 8 categories. Fixed to: system, development, productivity, communication, media, security, specialized, ai
- **Missing schema fields** — Frontmatter fields `notes`, `display`, `devices`, `previouslyUsed`, `replacedBy` existed in markdown but not in Tina schema. Added all missing fields with proper types (textarea, boolean, list with options)
- **Decap leftovers** — Deleted `admin/config.yml`, `admin/index.html`, `src/admin/config.yml`, `src/admin/index.html`. Removed admin watch path from `dev-server.js`
- **Secrets management** — User doesn't use `.env` files (uses 1Password/Secrets Assistant). Env vars need to be set in Netlify dashboard instead

**Key Decisions**:
- Moved from self-hosted TinaCMS to Tina Cloud mode (requires env vars on hosting platform)
- Secrets go in Netlify dashboard env vars, not `.env` files

**Learnings**:
- Tina Cloud requires `clientId` + `token` in config — these are the bridge between your repo and Tina's cloud service
- Tina schema must exactly mirror your frontmatter fields or the CMS won't show them / may strip them on save
- User's next step: set `TINA_PUBLIC_CLIENT_ID` and `TINA_TOKEN` in Netlify → Site settings → Environment variables

### 2026-02-22 — Session 4: Deploy to Netlify & Tina Cloud Sync

**Summary**: Fixed env var naming mismatch, switched git remote to SSH, pushed to GitHub, and triggered Netlify deploy. Deploy failed due to stale Tina Cloud schema — refreshed webhooks to force re-indexing.

**Challenges & Solutions**:
- **Env var name mismatch** — Config used `TINA_PUBLIC_CLIENT_ID` but Netlify already had `TINA_CLIENT_ID` set from 4 months ago. Fixed config to match existing Netlify var name
- **Git push auth failure** — HTTPS remote had no cached credentials. Switched remote to SSH (`git@github.com`) since user has SSH keys configured
- **Netlify build failed — stale Tina Cloud schema** — Tina Cloud last indexed the repo in Oct 2025 and didn't know about the `devices` field added in session 3. The GitHub webhook that triggers re-indexing was broken/stale
- **Attempted fix**: User refreshed webhooks in Tina Cloud dashboard (Configuration → Refresh Webhooks). Awaiting re-index before retrying deploy

**Key Decisions**:
- Match config env var names to what's already in Netlify rather than changing Netlify
- Use SSH for git remote to avoid HTTPS credential issues
- Trigger Tina Cloud webhook refresh rather than trying to work around the schema mismatch

**Learnings**:
- Tina Cloud schema can silently go stale for months if the GitHub webhook breaks — always check Tina Cloud dashboard when `tinacms build` fails with unknown field errors
- Always check existing Netlify env vars before assuming new ones need to be created — saves time and avoids naming conflicts
- HTTPS git remotes on macOS require credential helper setup; SSH with existing keys is the path of least resistance

### 2026-02-22 — Session 5: Tina Cloud Re-index & Deploy Retry

**Summary**: Resolved Tina Cloud re-indexing by configuring the "Path to Tina Config" setting and refreshing branches. Triggered a new Netlify deploy after confirming the branch was re-indexed with an updated timestamp.

**Challenges & Solutions**:
- **Tina Cloud still stale after webhook refresh** — Despite refreshing webhooks in session 4, the schema still showed "Last indexed at: Oct 2025". The "Path to Tina Config" field in Advanced Settings was empty
- **"Path to Tina Config" validation confusion** — Entering `tina` in the field produced an error: "path should not include tina". Entering `/` also didn't work
- **Solution**: Left the config path field blank and clicked "Refresh Branches" — main branch timestamp updated, confirming re-indexing succeeded
- **Deploy trigger** — Pushed empty commits to trigger Netlify rebuilds

**Key Decisions**:
- Leave "Path to Tina Config" blank — Tina Cloud auto-discovers the `tina/` folder
- Use "Refresh Branches" as the reliable way to force re-indexing, not just "Refresh Webhooks"

**Learnings**:
- Tina Cloud's "Path to Tina Config" field has counterintuitive validation — it rejects the value `tina` even though that's the folder name. Leaving it blank works because Tina auto-discovers the config
- "Refresh Webhooks" and "Refresh Branches" are different operations — webhooks sets up the GitHub integration, but "Refresh Branches" is what actually triggers a re-index of the branch content and schema
- When troubleshooting Tina Cloud indexing: check the branch timestamp in the dashboard to confirm re-indexing actually happened

### 2026-02-22 — Session 6: Build Fix & Secrets Scanner

**Summary**: Got the Netlify build to succeed by bypassing Tina Cloud schema checks and cleaning hardcoded tokens from committed files. Build completes but Netlify's post-build secrets scanner flags the `TINA_TOKEN` that `tinacms build` embeds in generated client code.

**Challenges & Solutions**:
- **Tina Cloud schema checks still failing** — Despite re-indexing in session 5, schema validation continued to fail during `tinacms build` on Netlify. Tina Cloud's re-index may not have fully propagated, or the remote schema remained out of sync.
  - **Solution**: Added `--skip-cloud-checks` to the build command in `netlify.toml`. This skips build-time schema validation while preserving runtime CMS functionality.
- **Hardcoded `TINA_TOKEN` in committed `client.ts`** — Running `tinacms build` locally baked the actual token value and local file paths into `tina/__generated__/client.ts`, which was committed. Netlify's secrets scanner immediately caught it.
  - **Solution**: Replaced the hardcoded token with a `process.env.TINA_TOKEN` reference and removed local cache paths from the committed file. Since `tinacms build` regenerates this file during Netlify deploy, the committed version just needs to be clean.
- **Secrets scanner flagging build output** — Even with the committed file clean, `tinacms build` on Netlify regenerates `client.ts` with the token embedded. Netlify's post-build scanner detects this in the build artifacts and flags the deploy.
  - **Status**: Unresolved. The build succeeds but the deploy is flagged. This is expected TinaCMS behavior — the token is a read-only content token meant to be in the client-side code.

**Key Decisions**:
- Use `--skip-cloud-checks` rather than continuing to fight Tina Cloud re-indexing — pragmatic workaround that doesn't affect CMS runtime functionality
- Clean committed generated files but accept that `tinacms build` will embed the token at build time — this is by design

**Learnings**:
- `tinacms build --skip-cloud-checks` is the escape hatch for stale Tina Cloud schemas — safe for production since CMS connects to Tina Cloud directly at runtime
- TinaCMS intentionally embeds the content token in generated client code — it's a read-only token for fetching content from Tina Cloud's GraphQL API, similar to how Contentful delivery tokens work
- Netlify's secrets scanner runs post-build and inspects all output files, not just committed code — any build tool that embeds env vars into output will trigger it
- For TinaCMS + Netlify projects: expect to dismiss the secrets scanner finding or configure an exclusion, since token embedding is the intended architecture

### 2026-02-22 — Session 7: Lock File Regeneration & CMS Confirmed Working

**Summary**: Identified and fixed stale `tina-lock.json` as the root cause of the Tina Cloud schema mismatch. Regenerated the lock file, pushed to GitHub, and confirmed CMS editing works end-to-end.

**Challenges & Solutions**:
- **`tina-lock.json` had old schema** — The lock file still referenced `content` instead of `body`, had old category values, and was missing `devices`/`display` fields. This was the actual source of truth that Tina Cloud compared against, causing the persistent schema mismatch across sessions 4-6.
- **`tinacms build` doesn't regenerate the lock file** — Ran `tinacms build` expecting it to update `tina-lock.json`, but the file timestamp didn't change. `tinacms build` only reads the lock file; it doesn't write it.
  - **Solution**: Ran `tinacms dev` instead (via a symlink path to avoid the Dropbox parentheses issue with `better-sqlite3`). This successfully regenerated `tina-lock.json` with the correct schema.
- **Kept `--skip-cloud-checks` as safety net** — Even though the lock file is now correct, retained the flag in `netlify.toml` as a precaution against future Tina Cloud sync delays.

**Key Decisions**:
- Use `tinacms dev` (not `build`) to regenerate lock files — this is the only command that writes `tina-lock.json`
- Keep `--skip-cloud-checks` even after fixing the lock file — defensive measure against Tina Cloud re-indexing lag

**Learnings**:
- **`tina-lock.json` is the critical schema contract** — it's what Tina Cloud uses to validate your schema. If this file is stale, no amount of config changes or Tina Cloud dashboard refreshes will fix the mismatch
- **Only `tinacms dev` regenerates the lock file** — `tinacms build` consumes it but never updates it. This was the missing piece across 3 sessions of troubleshooting
- **The entire sessions 4-6 schema mismatch saga** was caused by a stale lock file — the config was correct, Tina Cloud re-indexing was working, but the lock file was the bottleneck

### 2026-02-22 — Session 8: Full Project Cleanup

**Summary**: Comprehensive cleanup of the entire project — removed all Decap CMS references from docs and metadata, deleted 4 obsolete documentation files, rewrote README for TinaCMS, fixed dead CSS/JS, updated placeholder URLs with real values, improved dev-server error handling, and removed `--skip-cloud-checks` from the build command.

**Changes Made**:
- `content/settings.json` — replaced placeholder URLs with real ones (amlfi GitHub, LinkedIn, Netlify site URL)
- `build.js` — updated fallback URL from GitHub Pages placeholder to Netlify URL
- `package.json` — updated description and keywords from Decap to TinaCMS
- `src/scripts/filter.js` — removed 2 console.log debug statements
- `src/styles/main.css` — removed 5 dead CSS classes (`.external-link-icon`, `.tool-description`, `.tool-details`, `.tool-tags`, `.featured-badge`)
- `dev-server.js` — added `process.exit(1)` on initial build failure instead of silently continuing
- `scripts/init-content.js` — updated Decap reference to TinaCMS
- `netlify.toml` — removed `--skip-cloud-checks` (lock file is now in sync)
- `README.md` — complete rewrite for TinaCMS (was 100% Decap-focused)
- Deleted: `SETUP.md`, `QUICKSTART.md`, `NETLIFY_DEPLOYMENT.md`, `PROJECT-SUMMARY.md`

**Key Decisions**:
- Kept the `@media (prefers-color-scheme: dark)` block in themes.css — it prevents a flash of light theme before JavaScript loads on dark-mode systems
- Kept the `body`/`content` naming as-is — TinaCMS `isBody: true` writes to the markdown body, build.js captures it as `content`. The names differ but the data flows correctly
- Removed `--skip-cloud-checks` since `tina-lock.json` is now in sync — if the deploy fails, we'll add it back

**Learnings**:
- The CSS media query for dark theme is not duplicate code — it's FOUC prevention. The JS-based theme system sets `data-theme` but there's a brief window before JS runs where only CSS applies
- `isBody: true` in TinaCMS means the field maps to the markdown body (after `---`), not a frontmatter key. So it doesn't matter that the field is named `body` in Tina while build.js calls it `content` — they both refer to the same chunk of text

### 2026-02-23 — Session 9: Icons, Search, and Content Organization

**Summary**: Set up tool icons via macosicons.com CDN (no files in repo), enabled TinaCMS search, organized tools into category subfolders, and added friendly category labels to the CMS dropdown.

**Changes Made**:
- `scripts/fetch-icons.js` — rewritten to use macosicons.com API instead of logo.dev; stores CDN URLs in frontmatter
- `build.js` — added `iconSrc` Handlebars helper (handles both URLs and local paths); changed `readdir` to recursive for subfolder support
- `templates/partials/tool-card.hbs` — updated to use `{{iconSrc icon}}` for both card and modal icons
- `src/styles/main.css` — removed `border-radius`, `box-shadow`, `padding`, `background` from `.tool-icon` and `.tool-modal-icon` (macOS icons have their own squircle shape); moved `border-radius` to `.tool-icon-placeholder` only
- `tina/config.ts` — changed icon field from `type: 'image'` to `type: 'string'` (text input for URLs); added search config with indexer token; added `value`/`label` pairs to category options for friendly names
- `content/tools/` — moved 62 files into 8 category subfolders (ai, communication, development, media, productivity, security, specialized, system)
- `netlify.toml` — temporarily added then removed `--skip-cloud-checks` for breaking schema change
- Deleted: `scripts/extract-macos-icons.sh`, all `src/images/tools/*.png` files (56 icons removed from repo)

**Challenges & Solutions**:
- **Copyright concern with bundled icons** — initially extracted macOS app icons via `sips` (51 icons), but distributing Apple's app artwork in the repo raises copyright issues. Switched to macosicons.com CDN — icons load from their servers at runtime, no files in repo
- **macosicons.com API rate limit** — free tier allows 50 queries/month. Got 46 icons before hitting the limit. Remaining 12 need to wait for quota reset. Increased delay to 2s between requests
- **Breaking schema change** — changing icon from `image` to `string` removed `ImageFilter` type. Tina Cloud rejected the build until the new schema was synced. Temporarily used `--skip-cloud-checks`, then removed after Tina Cloud re-indexed
- **logo.dev icons looked wrong** — they're website logos (small brand marks on transparent backgrounds), not macOS app icons. Didn't fill the rounded container consistently

**Key Decisions**:
- **CDN over local files** — macosicons.com CDN URLs stored in frontmatter; browser fetches icons at runtime. API only called once to discover URLs, not on every page load
- **Category subfolders** — tools organized by category for easier browsing in TinaCMS admin. `build.js` and `fetch-icons.js` updated to read recursively
- **Friendly category labels** — TinaCMS dropdown shows "System & Utilities", "Creative & Media" etc. while storing short IDs (`system`, `media`) in frontmatter

**Learnings**:
- macosicons.com API is separate from CDN — the API (50/month limit) returns S3 URLs; the CDN images are public and unlimited
- TinaCMS `type: 'image'` is for file uploads; use `type: 'string'` for external URLs
- TinaCMS options support `{ value, label }` pairs for friendly dropdown labels while keeping short stored values
- TinaCMS search requires a separate indexer token from the dashboard (different from `TINA_TOKEN`)
- `fs.readdir({ recursive: true })` (Node 18+) works for reading subdirectories without additional dependencies
- Changing a field type in TinaCMS is a breaking schema change — requires `--skip-cloud-checks` or manual Tina Cloud re-index before the next build passes

### 2026-02-23 — Session 10: Add Use-Case Tags to All Tools

**Summary**: Added activity-based keyword tags to all 62 tool markdown files across 8 category subfolders. Tags enable search by what users DO with each tool (e.g. "write", "code", "terminal", "calendar") rather than just the tool name.

**Changes Made**:
- All 62 files in `content/tools/*/` — added `tags` field after `url` in frontmatter with 3-6 use-case keywords each
- `atom.md` (only file with pre-existing tags) — expanded from 2 tags to 5, keeping original "editor" and "deprecated" tags
- Tags are lowercase, hyphenated for multi-word (e.g. "video-conferencing", "screen-recording", "knowledge-base")
- Build verified passing after all changes

**Tag Design Approach**:
- Activity-based: what the user DOES with the tool ("write", "code", "streaming", "scheduling")
- Function-based: what kind of tool it IS ("browser", "terminal", "launcher", "editor")
- Domain-based: what field it belongs to ("office", "security", "networking")
- Avoided: generic tags like "app" or "software"; tool names as tags; redundant category names

**Key Decisions**:
- Tags placed after `url` field in frontmatter for consistency across all 62 files
- 3-6 tags per tool — enough for searchability without tag inflation
- Existing tags on atom.md preserved and augmented rather than replaced

**Files Modified**: All 62 files in `content/tools/{ai,communication,development,media,productivity,security,specialized,system}/`

### 2026-02-23 — Session 11: TinaCMS Upgrade v2.9.0 → v3.5.0

**Summary**: Upgraded TinaCMS from v2.9.0 to v3.5.0 (major version bump through v3.0.0). Updated both `tinacms` and `@tinacms/cli` packages. Build verified passing.

**Changes Made**:
- `package.json` — `tinacms`: `^2.9.0` → `^3.5.0`, `@tinacms/cli`: `^1.11.0` → `^2.1.6`
- `tina/config.ts` — added `telemetry: false` to opt out of anonymous telemetry (new in v3.5.0)

**Challenges & Solutions**:
- **Peer dependency warning** — `@tinacms/metrics@2.0.1` wants `fs-extra@^9` but project has `^11`. npm resolved it automatically; warning only, no functional issue

**Key Decisions**:
- Opted out of telemetry by default
- No config schema changes needed — `defineConfig`, collections, fields API unchanged between v2 and v3
- Build scripts unaffected — `build.js` reads markdown directly, doesn't use TinaCMS GraphQL API

**Risk Assessment**:
- Low risk because `build.js` bypasses TinaCMS's GraphQL layer (the main breaking change area)
- `tina-lock.json` will need regeneration via `tinacms dev` (Dropbox symlink workaround) before Tina Cloud editing works with v3

**Note**: `tina-lock.json` was NOT regenerated in this session (requires `tinacms dev` which needs the symlink workaround). CMS editing via Tina Cloud may not work until the lock file is regenerated with the v3 schema format. The static site build is unaffected.
