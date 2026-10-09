import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import react from '@vitejs/plugin-react'
import matter from 'gray-matter'
import { defineConfig, type Plugin } from 'vite'
import { site } from './src/lib/site.ts'

const root = fileURLToPath(new URL('.', import.meta.url))

const xml = (s: string) =>
  s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;')

/** Gera dist/feed.xml (RSS 2.0) a partir do front-matter de content/posts. */
function rssFeed(): Plugin {
  return {
    name: 'rss-feed',
    apply: 'build',
    generateBundle() {
      const dir = path.join(root, 'content', 'posts')
      const items = fs
        .readdirSync(dir)
        .filter((f) => f.toLowerCase().endsWith('.md'))
        .map((f) => ({ slug: f.replace(/\.md$/i, ''), ...matter(fs.readFileSync(path.join(dir, f), 'utf-8')).data }) as Record<string, unknown>)
        .filter((p) => p.published !== false)
        .sort((a, b) => String(b.date).localeCompare(String(a.date)))
        .map((p) => {
          const link = `${site.url}/#/posts/${p.slug}`
          return `<item><title>${xml(String(p.title ?? p.slug))}</title><link>${link}</link><guid>${link}</guid><pubDate>${new Date(`${p.date}T12:00:00Z`).toUTCString()}</pubDate><description>${xml(String(p.description ?? ''))}</description></item>`
        })
      this.emitFile({
        type: 'asset',
        fileName: 'feed.xml',
        source: `<?xml version="1.0" encoding="UTF-8"?>\n<rss version="2.0"><channel><title>${site.name}</title><link>${site.url}/</link><description>${xml(site.description)}</description><language>pt-BR</language>${items.join('')}</channel></rss>\n`,
      })
    },
  }
}

// https://vite.dev/config/
export default defineConfig({
  // base relativa: o build funciona em qualquer subpasta ou até file://
  base: './',
  plugins: [react(), rssFeed()],
  resolve: {
    alias: {
      '@': path.join(root, 'src'),
    },
  },
})
