import { fileURLToPath, URL } from 'node:url'
import base44 from "@base44/vite-plugin"
import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'

// The public GitHub Pages build is a standalone static site (the resource
// library only) served from a repository sub-path, e.g. /bodydouble/.
// PAGES_BASE lets the workflow derive that from the repo name.
const isStandalone = process.env.VITE_STANDALONE === 'true'
const pagesBase = process.env.PAGES_BASE || '/bodydouble/'

// Give the public static site its own document head without touching the
// shared index.html used by the Base44 app.
const standaloneHtml = () => ({
  name: 'standalone-html',
  transformIndexHtml(html) {
    return html
      .replace(
        /<title>.*?<\/title>/,
        '<title>The Neurodivergence Library</title>\n    <meta name="description" content="A calm, uncluttered collection of research and resources on neurodivergence — whitepapers, clinical studies, worksheets and toolkits." />'
      )
      // No web app manifest ships with the static build; the absolute
      // path would 404 under the Pages sub-path.
      .replace(/\s*<link rel="manifest"[^>]*>/, '')
      // Replace the Base44 favicon with an inline, on-theme mark so the
      // public site carries no external branding or third-party request.
      .replace(
        /<link rel="icon"[^>]*>/,
        `<link rel="icon" href="data:image/svg+xml,${encodeURIComponent(
          "<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 32 32'>" +
            "<rect width='32' height='32' rx='7' fill='#1d4d38'/>" +
            "<path d='M21 8c0 8-4.5 12-9 12' stroke='#7fd4c1' stroke-width='2.4' fill='none' stroke-linecap='round'/>" +
            "<path d='M12 24c0-6 3.5-9.5 9-11' stroke='#7fd4c1' stroke-width='2.4' fill='none' stroke-linecap='round'/>" +
            '</svg>'
        )}" />`
      )
  },
})

// https://vite.dev/config/
export default defineConfig({
  logLevel: 'error', // Suppress warnings, only show errors
  base: isStandalone ? pagesBase : '/',
  build: isStandalone ? { outDir: 'dist-pages', emptyOutDir: true } : {},
  // The Base44 plugin normally supplies the "@/" alias; the standalone
  // build runs without that plugin, so define it here.
  resolve: isStandalone
    ? { alias: { '@': fileURLToPath(new URL('./src', import.meta.url)) } }
    : {},
  plugins: [
    // The Base44 dev/runtime plugin is irrelevant to the static build.
    ...(isStandalone
      ? [standaloneHtml()]
      : [
          base44({
            // Support for legacy code that imports the base44 SDK with @/integrations, @/entities, etc.
            // can be removed if the code has been updated to use the new SDK imports from @base44/sdk
            legacySDKImports: process.env.BASE44_LEGACY_SDK_IMPORTS === 'true',
            hmrNotifier: true,
            navigationNotifier: true,
            analyticsTracker: true,
            visualEditAgent: true
          }),
        ]),
    react(),
  ]
});
