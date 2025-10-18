# ⚡ Quick Start - Tech Stack Showcase

Get your tech stack website live in 10 minutes!

## Step 1: Install & Initialize (2 min)

```bash
cd /Users/moana/Dropbox\ \(Personal\)/DEV/txstack
npm install
npm run init-content
npm run dev
```

Visit http://localhost:3000 to see your site!

## Step 2: Customize Content (3 min)

### Edit Site Info
Open `content/settings.json` and update:
- `title` - Your name's Tech Stack
- `author` - Your name
- `description` - What you do
- Social links (GitHub, Twitter, LinkedIn)

### Add Your First Tool
1. Copy `content/tools/vscode.md` to `content/tools/your-tool.md`
2. Edit the frontmatter:
   ```yaml
   ---
   name: "Your Tool Name"
   category: "development"
   description: "What it does"
   url: "https://tool-website.com"
   featured: true
   ---

   Why you use it...
   ```
3. Save and watch it auto-reload!

## Step 3: Deploy to GitHub (5 min)

### Create Repository
1. Go to https://github.com/new
2. Name: `tech-stack`
3. Public repository
4. Create!

### Push Your Code
```bash
git init
git add .
git commit -m "Initial commit"
git remote add origin https://github.com/YOURUSERNAME/tech-stack.git
git branch -M main
git push -u origin main
```

### Enable GitHub Pages
1. Go to repository **Settings**
2. Click **Pages** in sidebar
3. Source: **GitHub Actions**
4. Done!

### Update CMS Config
Edit `admin/config.yml` line 3:
```yaml
repo: YOURUSERNAME/tech-stack  # Your GitHub username and repo
```

```bash
git add admin/config.yml
git commit -m "Configure CMS"
git push
```

## Step 4: Watch It Deploy

1. Go to **Actions** tab in GitHub
2. Watch the green checkmark
3. Visit `https://YOURUSERNAME.github.io/tech-stack/`

## 🎉 You're Live!

Your tech stack is now online!

### What's Next?

**Add More Tools via CMS**
1. Visit `https://YOURUSERNAME.github.io/tech-stack/admin/`
2. Login with GitHub
3. Add tools through the visual editor

**Customize Appearance**
- Colors: Edit `src/styles/themes.css`
- Layout: Edit `templates/index.hbs`
- Categories: Edit `content/categories.json`

**Share It**
- Add to your LinkedIn profile
- Link from your resume
- Share on Twitter
- Add to your portfolio

## 🆘 Common Issues

**Port 3000 in use?**
```bash
PORT=3001 npm run dev
```

**Build failed?**
```bash
rm -rf node_modules
npm install
npm run build
```

**CMS won't load?**
- Check `admin/config.yml` has correct repo name
- Make sure you're logged into GitHub
- Clear browser cache

## 📚 Full Documentation

For detailed docs, see:
- `README.md` - Complete features and usage
- `SETUP.md` - Detailed setup instructions
- `content/tools/` - Sample tool examples

---

**Need help?** Open an issue on GitHub or check the documentation!

**Enjoying this?** ⭐ Star the repo and share with friends!
