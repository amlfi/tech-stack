import { createClient } from "tinacms/dist/client";
import { queries } from "./types";
export const client = createClient({ url: 'https://content.tinajs.io/1.6/content/5589cd24-d8f4-4e0a-8c70-964f2bd5c3bf/github/main', token: process.env.TINA_TOKEN || '', queries });
export default client;
