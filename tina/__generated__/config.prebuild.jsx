// tina/config.ts
import { defineConfig } from "tinacms";
var branch = process.env.HEAD || process.env.VERCEL_GIT_COMMIT_REF || "main";
var config_default = defineConfig({
  branch,
  clientId: process.env.TINA_CLIENT_ID || null,
  // Get this from tina.io
  token: process.env.TINA_TOKEN || null,
  // Get this from tina.io
  build: {
    outputFolder: "admin",
    publicFolder: "public"
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
              "development",
              "design",
              "productivity",
              "infrastructure",
              "collaboration",
              "other"
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
            name: "content",
            label: "Content (Why I Use It)",
            isBody: true
          },
          {
            type: "rich-text",
            name: "notes",
            label: "Notes"
          },
          {
            type: "string",
            name: "previouslyUsed",
            label: "Previously Used"
          },
          {
            type: "string",
            name: "replacedBy",
            label: "Replaced By"
          }
        ]
      }
    ]
  }
});
export {
  config_default as default
};
