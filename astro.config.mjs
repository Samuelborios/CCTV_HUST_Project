import { defineConfig } from 'astro/config';
import netlify from '@astro/adapters/netlify';

export default defineConfig({
  adapter: netlify(),
});