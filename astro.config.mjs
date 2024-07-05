import { defineConfig } from 'astro/config';
import { THEME_CONFIG } from "./src/theme.config";
import mdx from "@astrojs/mdx";
import vercel from "@astrojs/vercel/serverless";

import node from "@astrojs/node";

// https://astro.build/config
export default defineConfig({
  site: THEME_CONFIG.siteConfig.website,
  image:{
    domains: ["nvme0n1p.dev","cdn.nvme0n1p.dev"]
  },
  output: "server",
  integrations: [mdx()],
  adapter: node({
    mode: "standalone"
  })
});