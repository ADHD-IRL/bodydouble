import { fileURLToPath, URL } from 'node:url'
import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'

// The site is published on GitHub Pages from a repository sub-path
// (e.g. /bodydouble/). PAGES_BASE lets CI derive that from the repo name;
// it defaults to "/" for local development and root-hosted deployments.
const base = process.env.PAGES_BASE || '/'

// https://vite.dev/config/
export default defineConfig({
  base,
  plugins: [react()],
  resolve: {
    alias: { '@': fileURLToPath(new URL('./src', import.meta.url)) },
  },
})
