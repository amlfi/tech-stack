# Tech Stack Showcase

A modern, CMS-powered tech stack website for showcasing your development tools and applications. Built with Handlebars, Decap CMS, and optimized for GitHub Pages deployment.

## ✨ Features

- 🎨 **Clean, Modern Design** - Inspired by contemporary portfolio sites
- 📝 **Decap CMS Integration** - Easy content management through a visual interface
- 🌙 **Dark/Light Themes** - Automatic theme switching with manual override
- 🔍 **Search & Filter** - Find tools quickly with live search and category filters
- 📱 **Fully Responsive** - Perfect on desktop, tablet, and mobile
- 🚀 **GitHub Pages Ready** - Automated deployment with GitHub Actions
- ⚡ **Fast & Static** - No server required, blazing fast load times
- ♿ **Accessible** - Semantic HTML and keyboard navigation

## 🚀 Quick Start

### 1. Install Dependencies

```bash
npm install
```

### 2. Initialize Sample Content

```bash
npm run init-content
```

This creates:
- Sample tool entries in `content/tools/`
- Categories configuration in `content/categories.json`
- Site settings in `content/settings.json`

### 3. Start Development Server

```bash
npm run dev
```

Visit `http://localhost:3000` to see your site with live reload.

### 4. Build for Production

```bash
npm run build
```

Static files are generated in the `public/` directory.

## 📁 Project Structure

```
tech-stack-showcase/
├── content/                 # Content managed by CMS
│   ├── tools/              # Tool entries (markdown)
│   │   ├── vscode.md
│   │   ├── figma.md
│   │   └── ...
│   ├── categories.json     # Tool categories
│   └── settings.json       # Site configuration
│
├── templates/              # Handlebars templates
│   ├── index.hbs          # Main page template
│   └── partials/          # Reusable components
│       └── tool-card.hbs  # Tool card component
│
├── src/                    # Source files
│   ├── styles/            # CSS stylesheets
│   │   ├── main.css       # Main styles
│   │   └── themes.css     # Theme variables
│   ├── scripts/           # JavaScript
│   │   ├── theme.js       # Theme switcher
│   │   ├── search.js      # Search functionality
│   │   └── filter.js      # Category filter
│   └── images/            # Images and icons
│
├── admin/                  # Decap CMS admin interface
│   ├── config.yml         # CMS configuration
│   └── index.html         # CMS entry point
│
├── public/                 # Generated site (git-ignored)
│
├── scripts/               # Build scripts
│   └── init-content.js    # Content initialization
│
├── .github/
│   └── workflows/
│       └── deploy.yml     # GitHub Actions workflow
│
├── build.js               # Static site generator
├── dev-server.js          # Development server
└── package.json
```

## 📝 Content Management

### Using Decap CMS (Recommended)

1. **Deploy your site** to GitHub Pages first
2. **Access the CMS** at `https://yourusername.github.io/your-repo/admin/`
3. **Authenticate** with your GitHub account
4. **Add/Edit tools** through the visual interface

The CMS provides:
- Rich text editor for tool descriptions
- Image upload for tool logos
- Category selection dropdown
- Tag management
- Featured tool toggle

### Manual Content Management

#### Adding a New Tool

Create a markdown file in `content/tools/`:

```markdown
---
name: "Tool Name"
category: "development"
description: "Short description of the tool"
url: "https://example.com"
icon: "logo.png"
tags: ["tag1", "tag2", "tag3"]
featured: true
---

Extended description in markdown format.

You can include:
- Bullet points
- **Bold text**
- Code blocks
- Links
```

#### Updating Categories

Edit `content/categories.json`:

```json
{
  "categories": [
    {
      "id": "development",
      "name": "Development",
      "icon": "💻",
      "description": "Code editors, IDEs, and dev tools",
      "order": 1
    }
  ]
}
```

#### Site Settings

Edit `content/settings.json`:

```json
{
  "title": "My Tech Stack",
  "description": "The tools I use daily",
  "url": "https://yourusername.github.io/tech-stack",
  "author": "Your Name",
  "theme": "auto"
}
```

## 🚀 Deployment

### GitHub Pages (Recommended)

1. **Create a GitHub repository**
2. **Push your code** to the repository
3. **Enable GitHub Pages** in repository settings:
   - Go to Settings → Pages
   - Source: "GitHub Actions"
4. **Update CMS config** in `admin/config.yml`:
   ```yaml
   backend:
     name: github
     repo: yourusername/your-repo
     branch: main
   ```
5. **Push changes** - GitHub Actions will automatically build and deploy

Your site will be live at: `https://yourusername.github.io/your-repo/`

### Manual Deployment

```bash
npm run build
npm run deploy  # Uses gh-pages package
```

## 🎨 Customization

### Themes

The site includes three built-in themes:

- **Light** - Clean light theme
- **Dark** - Modern dark theme
- **Auto** - Follows system preference (default)

#### Custom Colors

Edit `src/styles/themes.css` to customize colors:

```css
:root {
  --color-primary: #2563eb;
  --color-bg: #ffffff;
  --color-text: #171717;
  /* ... */
}
```

### Styling

All styles are in `src/styles/`:
- `main.css` - Layout, components, responsive design
- `themes.css` - Color schemes and theme variables

### Adding Categories

1. Update `content/categories.json`
2. Add the category ID to CMS config in `admin/config.yml`
3. Rebuild the site

### Custom Domain

1. Add a `CNAME` file to `public/` with your domain
2. Configure DNS to point to GitHub Pages
3. Enable custom domain in GitHub repository settings

## ⌨️ Keyboard Shortcuts

- `Alt + 0-9` - Switch between category filters
- `Alt + A` - Show all categories
- `Escape` - Clear search (when focused)

## 🔧 Development

### Watch Mode

```bash
npm run dev
```

Automatically rebuilds when files change in:
- `content/`
- `templates/`
- `src/`
- `admin/`

### Build Only

```bash
npm run build
```

### Clean Build

```bash
rm -rf public/
npm run build
```

## 📦 Tech Stack

This project itself is built with:

- **Handlebars** - Templating
- **Decap CMS** - Content management
- **Express** - Development server
- **Chokidar** - File watching
- **Markdown-it** - Markdown processing
- **GitHub Actions** - CI/CD
- **GitHub Pages** - Hosting

## 🤝 Contributing

Feel free to:
- Fork this repo
- Create your tech stack site
- Submit improvements via PR
- Share your customizations

## 📄 License

MIT License - use this for your own tech stack showcase!

## 💡 Tips

- **Start Simple** - Add a few tools, then expand
- **Use Good Images** - High-quality tool logos look professional
- **Write Why** - Explain why you chose each tool
- **Keep Updated** - Review and update your stack regularly
- **Share It** - Link to your stack in your resume/portfolio

## 🐛 Troubleshooting

### Build Fails

```bash
rm -rf node_modules package-lock.json
npm install
npm run build
```

### CMS Won't Load

1. Check `admin/config.yml` has correct repo
2. Verify GitHub authentication is enabled
3. Clear browser cache and cookies

### Styles Not Loading

1. Check build output includes `/css` folder
2. Verify paths in `index.hbs` are correct
3. Clear browser cache

## 📞 Support

- Open an issue on GitHub
- Check the documentation
- Review sample content in `content/`

---

Built with ❤️ for developers who want to showcase their tools
