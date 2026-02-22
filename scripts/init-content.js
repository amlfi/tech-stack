#!/usr/bin/env node

const fs = require('fs-extra');
const path = require('node:path');

const CONTENT_DIR = path.join(__dirname, '..', 'content');
const TOOLS_DIR = path.join(CONTENT_DIR, 'tools');

// Sample categories
const categories = {
  categories: [
    {
      id: 'development',
      name: 'Development',
      icon: '💻',
      description: 'Code editors, IDEs, and development tools',
      order: 1,
    },
    {
      id: 'design',
      name: 'Design',
      icon: '🎨',
      description: 'Design and creative tools',
      order: 2,
    },
    {
      id: 'productivity',
      name: 'Productivity',
      icon: '⚡',
      description: 'Productivity and workflow tools',
      order: 3,
    },
    {
      id: 'communication',
      name: 'Communication',
      icon: '💬',
      description: 'Communication and collaboration tools',
      order: 4,
    },
    {
      id: 'devops',
      name: 'DevOps',
      icon: '🚀',
      description: 'Deployment and infrastructure tools',
      order: 5,
    },
    {
      id: 'database',
      name: 'Database',
      icon: '🗄️',
      description: 'Database management and tools',
      order: 6,
    },
  ],
};

// Sample tools
const tools = [
  {
    slug: 'vscode',
    content: `---
name: "Visual Studio Code"
category: "development"
description: "My primary code editor for all development work"
url: "https://code.visualstudio.com/"
tags: ["editor", "typescript", "javascript"]
featured: true
---

Visual Studio Code has been my go-to editor for years. The extension ecosystem is incredible, and the built-in Git integration saves me tons of time. I particularly love the Remote SSH feature for working on remote servers.

**Key Extensions:**
- GitHub Copilot
- ESLint
- Prettier
- GitLens
- Remote SSH`,
  },
  {
    slug: 'figma',
    content: `---
name: "Figma"
category: "design"
description: "Collaborative interface design tool"
url: "https://www.figma.com/"
tags: ["design", "ui", "prototyping"]
featured: true
---

Figma revolutionized how I approach design. The real-time collaboration features make it perfect for working with teams, and the component system helps maintain design consistency across projects.`,
  },
  {
    slug: 'notion',
    content: `---
name: "Notion"
category: "productivity"
description: "All-in-one workspace for notes, docs, and project management"
url: "https://www.notion.so/"
tags: ["notes", "documentation", "project-management"]
featured: false
---

Notion is my second brain. I use it for everything from meeting notes to personal knowledge management. The database features are surprisingly powerful.`,
  },
  {
    slug: 'docker',
    content: `---
name: "Docker"
category: "devops"
description: "Containerization platform for consistent development environments"
url: "https://www.docker.com/"
tags: ["containers", "devops", "infrastructure"]
featured: true
---

Docker ensures my development environment works the same everywhere. No more "works on my machine" problems. Docker Compose makes it easy to spin up complex multi-service applications locally.`,
  },
  {
    slug: 'github',
    content: `---
name: "GitHub"
category: "development"
description: "Version control and collaboration platform"
url: "https://github.com/"
tags: ["git", "collaboration", "ci-cd"]
featured: true
---

GitHub is where all my code lives. The Actions CI/CD pipeline is incredibly flexible, and GitHub Codespaces has changed how I work on projects from different machines.`,
  },
  {
    slug: 'slack',
    content: `---
name: "Slack"
category: "communication"
description: "Team communication and collaboration"
url: "https://slack.com/"
tags: ["chat", "collaboration", "team"]
featured: false
---

Slack keeps our team connected. The integrations with other tools make it a central hub for notifications and updates.`,
  },
];

// Sample settings
const settings = {
  title: 'My Tech Stack',
  description: 'The tools and applications I use daily for development and productivity',
  url: 'https://yourusername.github.io/tech-stack',
  author: 'Your Name',
  github: 'https://github.com/yourusername',
  twitter: 'https://twitter.com/yourusername',
  linkedin: 'https://linkedin.com/in/yourusername',
  theme: 'auto',
};

async function init() {
  console.log('🚀 Initializing tech stack content...\n');

  // Create directories
  await fs.ensureDir(TOOLS_DIR);
  console.log('✓ Created content directories');

  // Write categories
  await fs.writeJSON(path.join(CONTENT_DIR, 'categories.json'), categories, { spaces: 2 });
  console.log('✓ Created categories.json');

  // Write tools
  let toolCount = 0;
  for (const tool of tools) {
    await fs.writeFile(path.join(TOOLS_DIR, `${tool.slug}.md`), tool.content.trim());
    toolCount++;
  }
  console.log(`✓ Created ${toolCount} sample tools`);

  // Write settings
  await fs.writeJSON(path.join(CONTENT_DIR, 'settings.json'), settings, { spaces: 2 });
  console.log('✓ Created settings.json');

  console.log('\n✨ Content initialization complete!');
  console.log('\nNext steps:');
  console.log('1. Run "npm run build" to generate the site');
  console.log('2. Run "npm run dev" to preview locally');
  console.log('3. Edit content files in content/ directory');
  console.log('4. Add your own tools using TinaCMS at /admin/ or by creating .md files\n');
}

init().catch((err) => {
  console.error('❌ Initialization failed:', err);
  process.exit(1);
});
