import { defineConfig } from 'astro/config';
import { THEME_CONFIG } from "./src/theme.config";
import mdx from "@astrojs/mdx";
import vercel from "@astrojs/vercel/serverless";


// https://astro.build/config
export default defineConfig({
  site: THEME_CONFIG.siteConfig.website,
  output: "server",
  integrations: [mdx()],
  adapter: vercel({
    imageService: true
  })
});