# GitHub OAuth Setup for Decap CMS

Since Netlify Identity is deprecated, we'll use **GitHub OAuth** instead. This is simpler and more reliable.

## Step 1: Create GitHub OAuth App

1. Go to GitHub Settings → Developer settings → OAuth Apps:
   - Direct link: https://github.com/settings/developers

2. Click **"New OAuth App"**

3. Fill in the application details:
   ```
   Application name: Tech Stack CMS
   Homepage URL: https://your-site-name.netlify.app
   Application description: Decap CMS for Tech Stack website
   Authorization callback URL: https://api.netlify.com/auth/done
   ```

4. Click **"Register application"**

5. You'll see your **Client ID** - copy this

6. Click **"Generate a new client secret"** - copy the secret (you'll only see it once!)

## Step 2: Add OAuth to Netlify

1. In your Netlify site dashboard, go to:
   - **Site settings** → **Access control** → **OAuth**

2. Scroll to **"Authentication providers"**

3. Click **"Install provider"** → Select **"GitHub"**

4. Enter the credentials from Step 1:
   - **Client ID**: (paste from GitHub)
   - **Client Secret**: (paste from GitHub)

5. Click **"Install"**

## Step 3: Test the CMS

1. Build and deploy your site (should happen automatically)

2. Visit: `https://your-site-name.netlify.app/admin/`

3. Click **"Login with GitHub"**

4. Authorize the OAuth app when prompted

5. You should now be in the CMS!

## How It Works

- **GitHub OAuth** handles authentication
- **Netlify** acts as the OAuth proxy/handler
- **Decap CMS** uses GitHub API to commit changes directly to your repo
- Changes appear as commits from your GitHub account

## Benefits Over Netlify Identity

- ✅ Not deprecated
- ✅ No additional service to manage
- ✅ Works with your existing GitHub account
- ✅ Commits show your actual GitHub identity
- ✅ Free and simple

## Troubleshooting

### "Error: authentication failed"

- Double-check Client ID and Secret in Netlify
- Make sure callback URL is exactly: `https://api.netlify.com/auth/done`
- Try logging out and back in

### "repo not found"

- Check the repo name in `src/admin/config.yml` is correct
- Make sure your GitHub account has write access to the repo

### Changes not appearing

- Check if a Pull Request was created (editorial workflow mode)
- Look at recent commits on GitHub to see if the change was saved

## Alternative: Disable Editorial Workflow

If you want instant publishing without PR review:

1. Edit `src/admin/config.yml`
2. Remove or comment out:
   ```yaml
   # publish_mode: editorial_workflow
   ```
3. Rebuild and deploy
4. Changes now publish immediately instead of creating draft PRs

---

**That's it!** Much simpler than Auth0 or deprecated Identity.
