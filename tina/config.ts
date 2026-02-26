import { defineConfig } from 'tinacms';

const branch = process.env.HEAD || process.env.VERCEL_GIT_COMMIT_REF || 'main';

export default defineConfig({
  branch,
  clientId: process.env.TINA_CLIENT_ID,
  token: process.env.TINA_TOKEN,
  telemetry: false,

  build: {
    outputFolder: 'admin',
    publicFolder: process.env.BUILD_DIR || 'public',
  },
  media: {
    tina: {
      mediaRoot: 'images/tools',
      publicFolder: 'src',
    },
  },
  search: {
    tina: {
      indexerToken: process.env.TINA_SEARCH_TOKEN,
      stopwordLanguages: ['eng'],
    },
    indexBatchSize: 100,
    maxSearchIndexFieldLength: 100,
  },
  schema: {
    collections: [
      {
        name: 'tool',
        label: 'Tools',
        path: 'content/tools',
        format: 'md',
        ui: {
          filename: {
            slugify: (values) => {
              return `${values?.name?.toLowerCase().replace(/ /g, '-')}`;
            },
          },
        },
        fields: [
          {
            type: 'string',
            name: 'name',
            label: 'Name',
            isTitle: true,
            required: true,
          },
          {
            type: 'string',
            name: 'description',
            label: 'Description',
            required: true,
            ui: {
              component: 'textarea',
            },
          },
          {
            type: 'string',
            name: 'category',
            label: 'Category',
            required: true,
            options: [
              { value: 'system', label: 'System & Utilities' },
              { value: 'development', label: 'Development' },
              { value: 'design', label: 'Design & Architecture' },
              { value: 'productivity', label: 'Productivity' },
              { value: 'communication', label: 'Communication' },
              { value: 'media', label: 'Media' },
              { value: 'security', label: 'Security' },
              { value: 'specialized', label: 'Specialized Tools' },
              { value: 'ai', label: 'AI & Automation' },
            ],
          },
          {
            type: 'string',
            name: 'subcategory',
            label: 'Subcategory',
          },
          {
            type: 'string',
            name: 'icon',
            label: 'Icon URL',
            description: 'macOS icon URL from macosicons.com (paste the image URL)',
            searchable: false,
          },
          {
            type: 'string',
            name: 'url',
            label: 'URL',
            required: true,
          },
          {
            type: 'string',
            name: 'tags',
            label: 'Tags',
            list: true,
          },
          {
            type: 'string',
            name: 'devices',
            label: 'Devices',
            list: true,
            options: ['mbp', 'studio', 'ios'],
            description: 'Which devices do you use this on?',
          },
          {
            type: 'boolean',
            name: 'display',
            label: 'Display on Site',
            description: 'Show this tool on the site?',
          },
          {
            type: 'string',
            name: 'status',
            label: 'Status',
            options: ['active', 'retired'],
          },
          {
            type: 'boolean',
            name: 'featured',
            label: 'Featured',
          },
          {
            type: 'rich-text',
            name: 'body',
            label: 'Why I Use It',
            isBody: true,
          },
          {
            type: 'string',
            name: 'notes',
            label: 'Notes',
            ui: {
              component: 'textarea',
            },
            description: 'Additional details shown in modal (supports markdown)',
          },
          {
            type: 'string',
            name: 'previouslyUsed',
            label: 'Previously Used',
            description: 'What tool did you use before this one?',
          },
          {
            type: 'string',
            name: 'replacedBy',
            label: 'Replaced By',
            description: 'If retired, what tool replaced this?',
          },
          {
            type: 'string',
            name: 'startedUsing',
            label: 'Started Using',
            description: 'Year you started using this tool (e.g. 2012)',
          },
          {
            type: 'datetime',
            name: 'dateAdded',
            label: 'Date Added',
            description: 'When this tool was added to the stack',
            ui: {
              dateFormat: 'YYYY-MM-DD',
            },
          },
        ],
      },
    ],
  },
});
