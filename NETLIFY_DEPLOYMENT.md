# Netlify Deployment Guide

This guide walks you through deploying your Tech Stack website to Netlify with Decap CMS integration.

## Prerequisites

- GitHub account with the `tech-stack` repository
- The repository should be public (or have a paid Netlify plan for private repos)

## Step 1: Create Netlify Account

1. Go to [netlify.com](https://www.netlify.com/)
2. Click "Sign Up" in the top right
3. Choose "Sign up with GitHub" for easiest integration
4. Authorize Netlify to access your GitHub account

## Step 2: Deploy Your Site

### Option A: Import from GitHub (Recommended)

1. Once logged into Netlify, click "Add new site" → "Import an existing project"
2. Choose "GitHub" as your Git provider
3. Search for and select your `tech-stack` repository
4. Configure build settings:
   - **Build command**: `BUILD_DIR=dist npm run build`
   - **Publish directory**: `dist`
   - Click "Show advanced" and add environment variable:
     - Key: `BUILD_DIR`
     - Value: `dist`
5. Click "Deploy site"

Netlify will now:
- Clone your repository
- Install dependencies (`npm install`)
- Run your build command
- Deploy the `dist` folder to their CDN

### Option B: Netlify CLI (Alternative)

```bash
# Install Netlify CLI globally
npm install -g netlify-cli

# Navigate to your project
cd /Users/moana/Dropbox\ (Personal)/DEV/txstack

# Login to Netlify
netlify login

# Initialize and deploy
netlify init

# Follow the prompts:
# - Create & configure a new site
# - Connect to GitHub repo
# - Build command: BUILD_DIR=dist npm run build
# - Publish directory: dist

# Deploy
netlify deploy --prod
```

## Step 3: Set Up GitHub OAuth Authentication

**Note**: Netlify Identity is deprecated. We'll use GitHub OAuth instead (simpler and more reliable).

### Create GitHub OAuth App

1. Go to GitHub: https://github.com/settings/developers
2. Click **"New OAuth App"**
3. Fill in:
   - **Application name**: Tech Stack CMS
   - **Homepage URL**: `https://your-site-name.netlify.app` (use your actual Netlify URL)
   - **Authorization callback URL**: `https://api.netlify.com/auth/done`
4. Click **"Register application"**
5. Copy your **Client ID**
6. Click **"Generate a new client secret"** and copy it

### Add OAuth to Netlify

1. In Netlify dashboard: **Site settings** → **Access control** → **OAuth**
2. Click **"Install provider"** → **"GitHub"**
3. Enter:
   - **Client ID**: (from GitHub)
   - **Client Secret**: (from GitHub)
4. Click **"Install"**

**📖 Detailed OAuth Guide**: See [GITHUB_OAUTH_SETUP.md](./GITHUB_OAUTH_SETUP.md)

## Step 4: Access Your CMS

Once deployed and OAuth is configured:

1. Visit `https://your-site-name.netlify.app/admin/`
2. Click **"Login with GitHub"**
3. Authorize the OAuth app when prompted
4. You should see the Decap CMS interface with:
   - **Tools** collection (to manage your tools)
   - **Categories** collection (to manage categories)
   - **Site Configuration** (to update site settings)

## Step 5: Update Your Repository Settings (Optional)

If you want to customize your Netlify domain:

1. Go to "Site settings" → "Domain management"
2. Click "Options" next to your netlify.app domain
3. Choose "Edit site name"
4. Enter a custom subdomain (e.g., `my-tech-stack.netlify.app`)

## Editing Content

### Through the CMS (Recommended)

1. Go to `https://your-site-name.netlify.app/admin/`
2. Click "Tools" → "New Tool"
3. Fill in the form (name, description, category, icon, etc.)
4. Click "Save" → "Publish"
5. Decap CMS will create a commit to your GitHub repo
6. Netlify will automatically rebuild and deploy your site

### Through GitHub (Advanced)

You can still edit JSON files directly in the `data/tools/` folder on GitHub:

1. Go to your repository on GitHub
2. Navigate to `data/tools/`
3. Click "Add file" → "Create new file"
4. Name it `tool-name.json`
5. Add JSON content following the schema
6. Commit the file
7. Netlify will auto-deploy

## Editorial Workflow (Optional)

The CMS is configured with an editorial workflow that allows:

- **Drafts**: Save work without publishing
- **Review**: Submit for review
- **Publish**: Deploy to production

To use this:

1. In the CMS, create or edit content
2. Instead of "Publish now", choose "Save as draft"
3. Your changes are saved in a Pull Request on GitHub
4. Review the PR, and when ready, merge it
5. Netlify auto-deploys the merged changes

## Troubleshooting

### Build Fails on Netlify

Check the deploy log in Netlify. Common issues:

- Missing dependencies: Make sure `package.json` includes all dependencies
- Node version: We're using Node 18, specified in `netlify.toml`
- Build command: Should be `BUILD_DIR=dist npm run build`

### Can't Log Into CMS

- Make sure GitHub OAuth is configured in Netlify (Site settings → Access control → OAuth)
- Verify Client ID and Secret are correct
- Check callback URL is exactly: `https://api.netlify.com/auth/done`
- Make sure your GitHub account has write access to the repo
- Try clearing browser cache and cookies

### Changes Not Appearing

- Check the deploy log - did the build succeed?
- Hard refresh your browser (Cmd+Shift+R on Mac)
- Check if you're in editorial workflow mode (changes might be in a draft PR)

## Next Steps

Once deployed, you can:

1. **Add a custom domain**: Configure DNS to point to Netlify
2. **Enable HTTPS**: Netlify provides free SSL certificates
3. **Set up form handling**: Netlify Forms for contact forms
4. **Configure redirects**: Edit `netlify.toml` for URL redirects
5. **Add analytics**: Netlify Analytics or Google Analytics

## Resources

- [Netlify Documentation](https://docs.netlify.com/)
- [Decap CMS Documentation](https://decapcms.org/docs/)
- [Decap CMS GitHub Backend](https://decapcms.org/docs/github-backend/)
- [GitHub OAuth Apps](https://docs.github.com/en/developers/apps/building-oauth-apps)

---

**Your site is now live and editable!** 🎉

Visit your site at the Netlify URL and your CMS admin panel at `https://your-site.netlify.app/admin/`
