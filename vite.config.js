import { fileURLToPath, URL } from 'node:url'
import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'

// SINGLE_FILE=true inlines the CSS and JS into index.html, producing one
// self-contained file that also opens straight from disk (file://).
// Browsers block *external* modules and stylesheets on file:// URLs via
// CORS, so inlining is what makes that case work.
const singleFile = process.env.SINGLE_FILE === 'true'

// Inline every emitted asset into the HTML and drop the separate files.
const inlineAssets = () => ({
  name: 'inline-assets',
  enforce: 'post',
  generateBundle(_options, bundle) {
    const html = Object.values(bundle).find((f) => f.fileName.endsWith('.html'))
    if (!html) return

    // Note: the replacements must use function replacers. Bundled code
    // routinely contains "$&" and similar sequences, which a string
    // replacement would interpret as substitution patterns and corrupt.
    for (const file of Object.values(bundle)) {
      const name = file.fileName.split('/').pop()

      if (file.fileName.endsWith('.js') && file.type === 'chunk') {
        html.source = html.source.replace(
          new RegExp(`<script[^>]*src="[^"]*${name}"[^>]*></script>`),
          () => `<script type="module">\n${file.code}\n</script>`
        )
        delete bundle[file.fileName]
      } else if (file.fileName.endsWith('.css')) {
        html.source = html.source.replace(
          new RegExp(`<link[^>]*href="[^"]*${name}"[^>]*>`),
          () => `<style>\n${file.source}\n</style>`
        )
        delete bundle[file.fileName]
      }
    }
  },
})

// Relative asset paths, so a normal build works both at the domain root and
// from a repository sub-path on GitHub Pages. This is safe because routing
// is hash-based, so the document URL never changes and relative URLs always
// resolve against the directory holding index.html.
// https://vite.dev/config/
export default defineConfig({
  base: './',
  plugins: [react(), ...(singleFile ? [inlineAssets()] : [])],
  resolve: {
    alias: { '@': fileURLToPath(new URL('./src', import.meta.url)) },
  },
  build: singleFile
    ? {
        outDir: 'dist-single',
        emptyOutDir: true,
        cssCodeSplit: false,
        assetsInlineLimit: 100 * 1024 * 1024,
        rollupOptions: { output: { inlineDynamicImports: true } },
      }
    : {},
})
