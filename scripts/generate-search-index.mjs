/* Gera public/search-index.json a partir dos Markdowns em content/posts/.
   Equivalente Vite do script do Next: permite busca Ctrl+K 100% estática. */

import fs from 'node:fs';
import path from 'node:path';
import matter from 'gray-matter';

const CONTENT_DIR = path.join(process.cwd(), 'content', 'posts');
const OUT = path.join(process.cwd(), 'public', 'search-index.json');

if (!fs.existsSync(CONTENT_DIR)) {
  console.error('content/posts não encontrado');
  process.exit(1);
}

const files = fs
  .readdirSync(CONTENT_DIR)
  .filter((f) => f.toLowerCase().endsWith('.md'));

const posts = files
  .map((file) => {
    const slug = file.replace(/\.md$/i, '');
    const raw = fs.readFileSync(path.join(CONTENT_DIR, file), 'utf-8');
    const { data, content } = matter(raw);
    const published = data.published === undefined ? true : Boolean(data.published);
    if (!published) return null;
    return {
      slug,
      title: data.title ?? slug,
      desc: data.description ?? '',
      tags: Array.isArray(data.tags) ? data.tags : [],
      date: data.date ?? '',
      content: content.slice(0, 8000),
    };
  })
  .filter((p) => p !== null)
  .sort((a, b) => (a.date < b.date ? 1 : a.date > b.date ? -1 : 0));

fs.mkdirSync(path.dirname(OUT), { recursive: true });
fs.writeFileSync(OUT, JSON.stringify({ posts }));

console.log(`search-index.json gerado com ${posts.length} artigos`);
