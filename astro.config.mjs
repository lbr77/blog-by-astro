import { defineConfig } from 'astro/config';
import react from '@astrojs/react';
import { THEME_CONFIG } from "./src/theme.config";
import mdx from "@astrojs/mdx";
import sitemap from "@astrojs/sitemap";

import vercel from "@astrojs/vercel/serverless";

// https://astro.build/config
export default defineConfig({
  site: THEME_CONFIG.siteConfig.website,
  output: "server",
  integrations: [react(), mdx(), sitemap()],
  adapter: vercel()
});