#!/usr/bin/env node

const fs = require('fs-extra');
const path = require('node:path');
const Handlebars = require('handlebars');
const MarkdownIt = require('markdown-it');

const md = new MarkdownIt();

// Directories
const CONTENT_DIR = path.join(__dirname, 'content');
const TEMPLATES_DIR = path.join(__dirname, 'templates');
const PUBLIC_DIR = path.join(__dirname, process.env.BUILD_DIR || 'public');
const SRC_DIR = path.join(__dirname, 'src');

// Initialize Handlebars helpers
Handlebars.registerHelper('eq', (a, b) => a === b);
Handlebars.registerHelper('json', (context) => JSON.stringify(context, null, 2));
Handlebars.registerHelper('markdown', (text) => md.render(text || ''));
Handlebars.registerHelper('substring', (str, start, end) => {
  if (!str) return '';
  return str.substring(start, end);
});
Handlebars.registerHelper('iconSrc', (icon) => {
  if (!icon) return '';
  if (icon.startsWith('http://') || icon.startsWith('https://')) return icon;
  return `./images/tools/${icon}`;
});

async function loadCategories() {
  const categoriesPath = path.join(CONTENT_DIR, 'categories.json');
  if (await fs.pathExists(categoriesPath)) {
    return await fs.readJSON(categoriesPath);
  }
  return { categories: [] };
}

async function loadTools() {
  const toolsDir = path.join(CONTENT_DIR, 'tools');
  if (!(await fs.pathExists(toolsDir))) {
    return [];
  }

  const files = await fs.readdir(toolsDir, { recursive: true });
  const tools = [];

  for (const file of files) {
    if (file.endsWith('.md')) {
      const content = await fs.readFile(path.join(toolsDir, file), 'utf-8');
      const tool = parseFrontmatter(content);
      tool.slug = path.basename(file, '.md');
      tools.push(tool);
    }
  }

  return tools;
}

function parseFrontmatter(content) {
  const frontmatterRegex = /^---\n([\s\S]+?)\n---\n([\s\S]*)$/;
  const match = content.match(frontmatterRegex);

  if (!match) {
    return { content: content };
  }

  const frontmatter = {};
  const yamlLines = match[1].split('\n');

  for (const line of yamlLines) {
    const [key, ...valueParts] = line.split(':');
    if (key && valueParts.length > 0) {
      let value = valueParts.join(':').trim();

      // Remove quotes
      if ((value.startsWith('"') && value.endsWith('"')) || (value.startsWith("'") && value.endsWith("'"))) {
        value = value.slice(1, -1);
      }

      // Parse arrays
      if (value.startsWith('[') && value.endsWith(']')) {
        value = value
          .slice(1, -1)
          .split(',')
          .map((v) => v.trim().replace(/["']/g, ''));
      }

      // Parse booleans
      if (value === 'true') value = true;
      if (value === 'false') value = false;

      frontmatter[key.trim()] = value;
    }
  }

  frontmatter.content = match[2].trim();
  return frontmatter;
}

async function registerPartials() {
  const partialsDir = path.join(TEMPLATES_DIR, 'partials');
  if (!(await fs.pathExists(partialsDir))) {
    return;
  }

  const files = await fs.readdir(partialsDir);
  for (const file of files) {
    if (file.endsWith('.hbs')) {
      const name = path.basename(file, '.hbs');
      const content = await fs.readFile(path.join(partialsDir, file), 'utf-8');
      Handlebars.registerPartial(name, content);
    }
  }
}

async function copyAssets() {
  // Copy CSS
  const srcStyles = path.join(SRC_DIR, 'styles');
  const publicStyles = path.join(PUBLIC_DIR, 'css');
  if (await fs.pathExists(srcStyles)) {
    await fs.copy(srcStyles, publicStyles);
  }

  // Copy JS
  const srcScripts = path.join(SRC_DIR, 'scripts');
  const publicScripts = path.join(PUBLIC_DIR, 'js');
  if (await fs.pathExists(srcScripts)) {
    await fs.copy(srcScripts, publicScripts);
  }

  // Copy images
  const srcImages = path.join(SRC_DIR, 'images');
  const publicImages = path.join(PUBLIC_DIR, 'images');
  if (await fs.pathExists(srcImages)) {
    await fs.copy(srcImages, publicImages);
  }
}

async function build() {
  console.log('🚀 Building tech stack website...\n');

  // Clean and create public directory
  await fs.remove(PUBLIC_DIR);
  await fs.ensureDir(PUBLIC_DIR);

  // Register Handlebars partials
  await registerPartials();

  // Load data
  console.log('📊 Loading content...');
  const { categories } = await loadCategories();
  const allTools = await loadTools();

  // Filter out tools with display: false
  const tools = allTools.filter((tool) => tool.display !== false);

  // Group tools by category and subcategory
  const toolsByCategory = {};
  const toolsBySubcategory = {};
  const retiredToolsByCategory = {};

  categories.forEach((cat) => {
    toolsByCategory[cat.id] = tools.filter((tool) => tool.category === cat.id);
    const retiredTools = tools.filter((tool) => tool.category === cat.id && tool.status === 'retired');
    if (retiredTools.length > 0) {
      retiredToolsByCategory[cat.id] = retiredTools;
    }

    // Group by subcategory within this category
    const categoryTools = tools.filter((tool) => tool.category === cat.id && tool.status !== 'retired');
    const subcategoryGroups = {};
    categoryTools.forEach((tool) => {
      const subcat = tool.subcategory || 'other';
      if (!subcategoryGroups[subcat]) {
        subcategoryGroups[subcat] = [];
      }
      subcategoryGroups[subcat].push(tool);
    });
    toolsBySubcategory[cat.id] = subcategoryGroups;
  });

  const activeTools = tools.filter((t) => t.status !== 'retired');
  const retiredTools = tools.filter((t) => t.status === 'retired');

  console.log(`   ✓ Loaded ${categories.length} categories`);
  console.log(`   ✓ Loaded ${activeTools.length} active tools`);
  console.log(`   ✓ Loaded ${retiredTools.length} retired tools\n`);

  // Load and compile template
  console.log('🎨 Compiling templates...');
  const templatePath = path.join(TEMPLATES_DIR, 'index.hbs');
  const templateContent = await fs.readFile(templatePath, 'utf-8');
  const template = Handlebars.compile(templateContent);

  // Render page
  const html = template({
    categories,
    tools,
    toolsByCategory,
    toolsBySubcategory,
    retiredToolsByCategory,
    site: {
      title: 'My Tech Stack',
      description: 'The tools and applications I use daily',
      url: process.env.SITE_URL || 'https://amlfi-tech-stack.netlify.app',
    },
  });

  // Write output
  await fs.writeFile(path.join(PUBLIC_DIR, 'index.html'), html);
  console.log('   ✓ Generated index.html\n');

  // Copy assets
  console.log('📦 Copying assets...');
  await copyAssets();
  console.log('   ✓ Copied CSS, JS, and images\n');

  console.log('✨ Build complete! Output in /public directory');
  console.log('   Run "npm run dev" to preview locally');
}

// Run build
build().catch((err) => {
  console.error('❌ Build failed:', err);
  process.exit(1);
});
