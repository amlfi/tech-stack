# Tech Stack Showcase - Setup Guide

Complete setup instructions for deploying your tech stack website.

## 📋 Prerequisites

- Node.js 18+ installed
- Git installed
- GitHub account
- Text editor (VS Code, Sublime, etc.)

## 🚀 Getting Started

### 1. Clone/Download This Repository

If starting from scratch:
```bash
cd /path/to/your/projects
git init tech-stack
cd tech-stack
# Copy all files from this directory
```

If you already have the files:
```bash
cd /Users/moana/Dropbox\ \(Personal\)/DEV/txstack
```

### 2. Install Dependencies

```bash
npm install
```

This installs:
- Handlebars (templating)
- fs-extra (file operations)
- Express (dev server)
- Chokidar (file watching)
- markdown-it (markdown processing)
- gh-pages (deployment)

### 3. Initialize Content

```bash
npm run init-content
```

This creates sample content:
- 6 example tools (VS Code, Figma, Notion, Docker, GitHub, Slack)
- 6 categories (Development, Design, Productivity, Communication, DevOps, Database)
- Site settings

### 4. Customize Your Content

#### Edit Site Settings

Edit `content/settings.json`:
```json
{
  "title": "Your Name's Tech Stack",
  "description": "The tools I use for [your profession]",
  "url": "https://yourusername.github.io/tech-stack",
  "author": "Your Name",
  "github": "https://github.com/yourusername",
  "twitter": "https://twitter.com/yourusername",
  "linkedin": "https://linkedin.com/in/yourusername"
}
```

#### Add Your Tools

Edit files in `content/tools/` or create new ones:

```markdown
---
name: "Tool Name"
category: "development"
description: "Brief description"
url: "https://tool-website.com"
tags: ["tag1", "tag2"]
featured: true
---

Why you use this tool and how it helps you...
```

### 5. Preview Locally

```bash
npm run dev
```

Opens at `http://localhost:3000`

The dev server watches for changes and automatically rebuilds.

## 🌐 Deploy to GitHub Pages

### Step 1: Create GitHub Repository

1. Go to https://github.com/new
2. Name: `tech-stack` (or any name you prefer)
3. Visibility: Public
4. Don't initialize with README

### Step 2: Configure Git

```bash
# Initialize git (if not already done)
git init

# Add all files
git add .

# Initial commit
git commit -m "Initial commit: Tech stack website"

# Add remote
git remote add origin https://github.com/YOURUSERNAME/tech-stack.git

# Push to GitHub
git branch -M main
git push -u origin main
```

### Step 3: Enable GitHub Pages

1. Go to your repository on GitHub
2. Click **Settings**
3. Click **Pages** in the sidebar
4. Under "Build and deployment":
   - Source: **GitHub Actions**
5. Save changes

### Step 4: Update Decap CMS Config

Edit `admin/config.yml`:

```yaml
backend:
  name: github
  repo: YOURUSERNAME/tech-stack  # Replace with your repo
  branch: main
```

Commit and push:
```bash
git add admin/config.yml
git commit -m "Configure Decap CMS"
git push
```

### Step 5: Wait for Deployment

1. Go to **Actions** tab in your GitHub repo
2. Watch the "Deploy to GitHub Pages" workflow
3. Once complete, your site is live at:
   `https://YOURUSERNAME.github.io/tech-stack/`

## 📝 Using Decap CMS

### First Time Setup

1. Visit `https://YOURUSERNAME.github.io/tech-stack/admin/`
2. Click "Login with GitHub"
3. Authorize the application
4. You're in!

### Adding Tools via CMS

1. Click **Tools** in the sidebar
2. Click **New Tool**
3. Fill in the form:
   - Tool Name
   - Category (dropdown)
   - Description
   - Website URL
   - Upload logo/icon
   - Tags (comma-separated)
   - Featured (toggle)
   - Why I Use It (markdown editor)
4. Click **Publish**

Changes are automatically committed to your repository and trigger a rebuild.

### Managing Categories

1. Click **Categories** in the sidebar
2. Add/edit/reorder categories
3. Each category needs:
   - ID (lowercase, no spaces)
   - Name (display name)
   - Icon (emoji or text)
   - Description
   - Order (number for sorting)

## 🎨 Customization

### Change Theme Colors

Edit `src/styles/themes.css`:

```css
:root {
  --color-primary: #YOUR_COLOR;
  --gradient-text: linear-gradient(135deg, #COLOR1, #COLOR2);
}
```

### Modify Layout

Edit templates in `templates/`:
- `index.hbs` - Main page structure
- `partials/tool-card.hbs` - Tool card component

### Add Custom Styles

Add to `src/styles/main.css`

### Add Custom Scripts

Add to `src/scripts/` and include in `index.hbs`

## 🔧 Advanced Configuration

### Custom Domain

1. Add a `CNAME` file to `public/` (or create it in build):
   ```
   yourdomain.com
   ```

2. Configure DNS:
   ```
   Type: CNAME
   Name: @
   Value: YOURUSERNAME.github.io
   ```

3. Enable in GitHub Settings → Pages → Custom domain

### Environment Variables

Set in GitHub:
1. Settings → Secrets and variables → Actions
2. Add secrets like:
   - `SITE_URL`
   - `GOOGLE_ANALYTICS_ID`

Access in `build.js`:
```javascript
const siteUrl = process.env.SITE_URL || 'default';
```

### Add Analytics

In `templates/index.hbs`, add before `</head>`:

```html
<!-- Google Analytics -->
<script async src="https://www.googletagmanager.com/gtag/js?id=GA_MEASUREMENT_ID"></script>
<script>
  window.dataLayer = window.dataLayer || [];
  function gtag(){dataLayer.push(arguments);}
  gtag('js', new Date());
  gtag('config', 'GA_MEASUREMENT_ID');
</script>
```

## 🐛 Troubleshooting

### Build Fails

**Problem**: `npm run build` errors

**Solutions**:
1. Delete `node_modules` and reinstall:
   ```bash
   rm -rf node_modules package-lock.json
   npm install
   ```

2. Check for syntax errors in content files
3. Verify all required files exist

### CMS Won't Load

**Problem**: Admin page shows error

**Solutions**:
1. Check `admin/config.yml` has correct repo name
2. Verify you're logged into GitHub
3. Clear browser cache
4. Check browser console for errors

### Site Not Updating

**Problem**: Changes don't appear on live site

**Solutions**:
1. Check GitHub Actions completed successfully
2. Clear browser cache (Cmd+Shift+R or Ctrl+Shift+R)
3. Wait a few minutes for GitHub Pages to update
4. Verify changes were committed to main branch

### Dev Server Won't Start

**Problem**: Port 3000 already in use

**Solutions**:
```bash
# Use different port
PORT=3001 npm run dev

# Or kill process on port 3000
lsof -ti:3000 | xargs kill -9
```

## 📊 Project Structure Reference

```
tech-stack/
├── content/              # Your content (edit these!)
│   ├── tools/           # Tool markdown files
│   ├── categories.json  # Category definitions
│   └── settings.json    # Site configuration
│
├── templates/           # HTML templates
│   ├── index.hbs       # Main template
│   └── partials/       # Components
│
├── src/                # Source files
│   ├── styles/         # CSS files (edit for design)
│   ├── scripts/        # JavaScript files
│   └── images/         # Static images
│
├── admin/              # Decap CMS (don't edit)
│   ├── config.yml      # CMS config (edit repo name)
│   └── index.html      # CMS entry
│
├── public/             # Build output (git-ignored)
│
├── scripts/            # Build scripts
├── .github/workflows/  # GitHub Actions
├── build.js            # Site generator
├── dev-server.js       # Development server
└── package.json        # Dependencies
```

## ✨ Tips for Success

1. **Start Simple** - Begin with 5-10 tools you actually use
2. **Be Honest** - Explain real reasons you chose each tool
3. **Use Quality Images** - High-res logos look professional
4. **Keep Updated** - Review and update quarterly
5. **Share It** - Link from resume, portfolio, LinkedIn
6. **Add Context** - Explain your workflow and why it works

## 🎯 Next Steps

- [ ] Customize site settings
- [ ] Add your actual tools
- [ ] Upload tool logos/icons
- [ ] Adjust theme colors
- [ ] Set up GitHub repository
- [ ] Deploy to GitHub Pages
- [ ] Configure Decap CMS
- [ ] Add custom domain (optional)
- [ ] Share with the world!

## 📞 Need Help?

- Check the main README.md for detailed documentation
- Review sample content in `content/tools/`
- Check GitHub Actions logs for deployment issues
- Open an issue on GitHub

---

**Remember**: This is YOUR tech stack. Make it personal, keep it updated, and use it to show others how you work!
