import { defineConfig } from 'astro/config';
import react from '@astrojs/react';
import {THEME_CONFIG} from "./src/theme.config";
// https://astro.build/config
export default defineConfig({
    output: "server",
    integrations: [
        react()
    ],
});
