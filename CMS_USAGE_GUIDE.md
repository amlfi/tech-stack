# Decap CMS Usage Guide

Quick reference for managing your Tech Stack website content.

## Accessing the CMS

1. Visit: `https://your-site-name.netlify.app/admin/`
2. Log in with your Netlify Identity credentials

## Managing Tools

### Add a New Tool

1. Click "Tools" in the left sidebar
2. Click "New Tool"
3. Fill in the required fields:

   **Required Fields:**
   - **Name**: Tool name (e.g., "Visual Studio Code")
   - **Description**: Brief description (e.g., "Code editor for modern development")
   - **Category**: Select from dropdown (development, design, productivity, etc.)
   - **URL**: Official website (e.g., "https://code.visualstudio.com")

   **Optional Fields:**
   - **Subcategory**: More specific classification (e.g., "Code Editor", "Terminal")
   - **Icon**: Upload a logo/icon image (PNG, SVG, JPG)
   - **Tags**: Keywords for search (e.g., ["editor", "microsoft", "typescript"])
   - **Status**: Active (default) or Retired
   - **Featured**: Toggle to highlight the tool
   - **Content**: Markdown text explaining why you use it
   - **Notes**: Additional notes or tips
   - **Previously Used**: What you used before this tool
   - **Replaced By**: What replaced this tool (if retired)

4. Click "Save" → "Publish now"
5. Your site will automatically rebuild and deploy

### Edit an Existing Tool

1. Click "Tools" in the left sidebar
2. Find the tool in the list
3. Click on it to edit
4. Make your changes
5. Click "Save" → "Publish now"

### Retire a Tool

1. Edit the tool
2. Change **Status** from "Active" to "Retired"
3. Optionally add **Replaced By** to show what you use now
4. Publish

Retired tools will appear in a collapsed "Previously Used" section.

### Delete a Tool

1. Edit the tool
2. Click "Delete unpublished entry" (or "Delete published entry")
3. Confirm deletion
4. Publish changes

## Managing Categories

### Add a New Category

1. Click "Categories" in the left sidebar
2. Click "New Category"
3. Fill in:
   - **ID**: Lowercase slug (e.g., "development")
   - **Name**: Display name (e.g., "Development")
   - **Icon**: Emoji or text icon (e.g., "💻")
   - **Order**: Number for sorting (0 = first, 99 = last)
4. Save and publish

### Edit Category Order

1. Edit the category
2. Change the **Order** number
3. Lower numbers appear first
4. Save and publish

## Site Configuration

### Update Site Title or Description

1. Click "Site Configuration" in the left sidebar
2. Click "Site Settings"
3. Edit:
   - **Site Title**: Your site's name
   - **Description**: Meta description
   - **URL**: Your site URL
   - **Author**: Your name
4. Save and publish

## Editorial Workflow

The CMS supports a draft → review → publish workflow:

### Create a Draft

1. When creating or editing content
2. Click "Save" → "Save as draft" (instead of "Publish now")
3. Your changes are saved but not published
4. A Pull Request is created on GitHub

### Review and Publish Drafts

**Option A: In the CMS**
1. Switch to "Workflow" view (top bar)
2. See columns: Drafts, In Review, Ready
3. Drag items between columns
4. Click "Publish" when ready

**Option B: On GitHub**
1. Go to your repository's Pull Requests
2. Review the changes
3. Merge the PR
4. Site auto-deploys

## Media Management

### Upload Images

When editing a tool:
1. Click the **Icon** field
2. Choose an image file (PNG, SVG, JPG recommended)
3. The CMS uploads it to `src/images/tools/`
4. The image is automatically optimized and deployed

### Image Guidelines

- **Format**: PNG with transparency or SVG (preferred)
- **Size**: 200x200px minimum, 512x512px recommended
- **File size**: Keep under 100KB for fast loading
- **Naming**: Use lowercase, hyphens (e.g., `vscode-logo.png`)

## Markdown Formatting

The **Content** and **Notes** fields support Markdown:

```markdown
# Heading 1
## Heading 2

**Bold text**
*Italic text*

- Bullet point
- Another point

1. Numbered list
2. Second item

[Link text](https://example.com)

`inline code`

> Blockquote
```

## Tips and Best Practices

### Tool Descriptions

- Keep under 160 characters for clean display
- Focus on what it does, not why (use Content field for "why")
- Be concise but informative

### Subcategories

Use subcategories to group similar tools:
- Development: "Code Editor", "Terminal", "Version Control"
- Design: "UI Design", "Prototyping", "Graphics"
- Productivity: "Note Taking", "Task Management", "Communication"

### Tags

Add 3-5 relevant tags per tool for better search:
- Company/creator name
- Technology/language
- Use case
- Platform (if specific)

### Featured Tools

- Mark 3-8 tools as featured (your favorites)
- Featured tools stand out visually
- Don't over-use it (defeats the purpose)

### Content Quality

For the "Why I Use It" section:
- Explain your specific use case
- Mention key features you rely on
- Compare to alternatives if relevant
- Keep it personal and authentic

## Workflow Examples

### Adding a New Development Tool

1. Access CMS → Tools → New Tool
2. Fill in:
   ```
   Name: Cursor
   Description: AI-powered code editor built on VSCode
   Category: development
   Subcategory: Code Editor
   URL: https://cursor.sh
   Tags: ["ai", "editor", "copilot", "vscode"]
   Status: active
   Featured: true
   Content: |
     I switched to Cursor for its native AI integration. The inline suggestions
     and chat interface make refactoring and learning new codebases much faster.

     Unlike GitHub Copilot, it understands the full context of my project and
     can suggest changes across multiple files.
   ```
3. Upload icon/logo
4. Save → Publish now
5. Wait 1-2 minutes for deployment
6. Refresh your site to see the new tool

### Retiring an Old Tool

1. Find the tool (e.g., "Atom Editor")
2. Edit it:
   ```
   Status: retired
   Replaced By: Visual Studio Code
   Notes: |
     Atom was great but GitHub archived it in 2022.
     VSCode has better performance and extension ecosystem.
   ```
3. Publish
4. Tool moves to "Previously Used" section

## Troubleshooting

### "Cannot publish" error

- Check if you're online
- Make sure you're logged in (session might have expired)
- Try saving as draft first, then publishing

### Image won't upload

- Check file size (under 5MB)
- Use supported formats (PNG, JPG, SVG, GIF)
- Try renaming the file (remove special characters)

### Changes not appearing on site

- Wait 2-3 minutes for Netlify to rebuild
- Check deploy status in Netlify dashboard
- Hard refresh browser (Cmd+Shift+R)

### Lost changes

- Check the "Workflow" view for drafts
- Check GitHub for uncommitted PRs
- CMS auto-saves drafts every few seconds

## Keyboard Shortcuts

- **Cmd/Ctrl + S**: Save draft
- **Cmd/Ctrl + P**: Publish
- **Cmd/Ctrl + E**: Edit mode
- **Esc**: Close dialogs

---

Happy editing! Your changes will be live within 1-2 minutes of publishing. 🚀
