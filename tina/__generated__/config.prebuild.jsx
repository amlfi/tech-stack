// tina/config.ts
import { defineConfig } from "tinacms";
var branch = process.env.HEAD || process.env.VERCEL_GIT_COMMIT_REF || "main";
var config_default = defineConfig({
  branch,
  clientId: process.env.TINA_CLIENT_ID,
  token: process.env.TINA_TOKEN,
  build: {
    outputFolder: "admin",
    publicFolder: process.env.BUILD_DIR || "public"
  },
  media: {
    tina: {
      mediaRoot: "images/tools",
      publicFolder: "src"
    }
  },
  schema: {
    collections: [
      {
        name: "tool",
        label: "Tools",
        path: "content/tools",
        format: "md",
        ui: {
          filename: {
            slugify: (values) => {
              return `${values?.name?.toLowerCase().replace(/ /g, "-")}`;
            }
          }
        },
        fields: [
          {
            type: "string",
            name: "name",
            label: "Name",
            isTitle: true,
            required: true
          },
          {
            type: "string",
            name: "description",
            label: "Description",
            required: true,
            ui: {
              component: "textarea"
            }
          },
          {
            type: "string",
            name: "category",
            label: "Category",
            required: true,
            options: [
              "system",
              "development",
              "productivity",
              "communication",
              "media",
              "security",
              "specialized",
              "ai"
            ]
          },
          {
            type: "string",
            name: "subcategory",
            label: "Subcategory"
          },
          {
            type: "image",
            name: "icon",
            label: "Icon"
          },
          {
            type: "string",
            name: "url",
            label: "URL",
            required: true
          },
          {
            type: "string",
            name: "tags",
            label: "Tags",
            list: true
          },
          {
            type: "string",
            name: "devices",
            label: "Devices",
            list: true,
            options: ["mbp", "studio", "ios"],
            description: "Which devices do you use this on?"
          },
          {
            type: "boolean",
            name: "display",
            label: "Display on Site",
            description: "Show this tool on the site?"
          },
          {
            type: "string",
            name: "status",
            label: "Status",
            options: ["active", "retired"]
          },
          {
            type: "boolean",
            name: "featured",
            label: "Featured"
          },
          {
            type: "rich-text",
            name: "body",
            label: "Why I Use It",
            isBody: true
          },
          {
            type: "string",
            name: "notes",
            label: "Notes",
            ui: {
              component: "textarea"
            },
            description: "Additional details shown in modal (supports markdown)"
          },
          {
            type: "string",
            name: "previouslyUsed",
            label: "Previously Used",
            description: "What tool did you use before this one?"
          },
          {
            type: "string",
            name: "replacedBy",
            label: "Replaced By",
            description: "If retired, what tool replaced this?"
          }
        ]
      }
    ]
  }
});
export {
  config_default as default
};
