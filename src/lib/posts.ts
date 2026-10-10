import { parseFrontmatter } from './frontmatter';
import { unified } from 'unified';
import remarkParse from 'remark-parse';
import remarkGfm from 'remark-gfm';
import remarkRehype from 'remark-rehype';
import rehypeSlug from 'rehype-slug';
import rehypeHighlight from 'rehype-highlight';
import rehypeStringify from 'rehype-stringify';
import { visit } from 'unist-util-visit';
import Slugger from 'github-slugger';
import type { Heading, Root as MdRoot } from 'mdast';
import type { Element, Root as HRoot } from 'hast';

export interface PostMeta {
  slug: string;
  title: string;
  description: string;
  date: string;
  tags: string[];
  published: boolean;
  featured: boolean;
  words: number;
  readingTime: string;
}

export interface TocItem {
  depth: number;
  text: string;
  id: string;
}

export interface Post extends PostMeta {
  content: string;
  html: string;
  toc: TocItem[];
}

export interface TagInfo {
  name: string;
  slug: string;
  count: number;
}

/* ------------------------------------------------------------------ */
/* fonte: content/posts/*.md via import.meta.glob (Vite, ?raw, eager)  */
/* Adicionar um .md na pasta faz o post aparecer automaticamente.      */
/* ------------------------------------------------------------------ */

const rawModules = import.meta.glob('../../content/posts/*.md', {
  query: '?raw',
  import: 'default',
  eager: true,
}) as Record<string, string>;

interface ParsedFile {
  slug: string;
  data: Record<string, unknown>;
  content: string;
}

// O título já aparece no cabeçalho do artigo: um "# Título" no topo do
// markdown viraria um segundo título na página.
function stripLeadingTitle(content: string): string {
  return content.replace(/^\s*#\s+.+\r?\n+/, '');
}

const files: ParsedFile[] = Object.entries(rawModules).map(([filePath, raw]) => {
  const file = filePath.split('/').pop() ?? filePath;
  const slug = file.replace(/\.md$/i, '');
  const { data, content } = parseFrontmatter(raw);
  return { slug, data, content: stripLeadingTitle(content) };
});

/* ------------------------------------------------------------------ */
/* helpers                                                             */
/* ------------------------------------------------------------------ */

function parseDateUTC(date: string): Date {
  if (date.includes('T') || date.includes(' ')) return new Date(date);
  const [y, m, d] = date.split('-').map(Number);
  return new Date(Date.UTC(y, m - 1, d, 12));
}

const MONTHS = ['jan', 'fev', 'mar', 'abr', 'mai', 'jun', 'jul', 'ago', 'set', 'out', 'nov', 'dez'];

/** "18 set 2026" — forma compacta usada nas listas. */
export function shortDate(date: string): string {
  if (!date) return '';
  const d = parseDateUTC(date);
  if (Number.isNaN(d.getTime())) return date;
  return `${String(d.getUTCDate()).padStart(2, '0')} ${MONTHS[d.getUTCMonth()]} ${d.getUTCFullYear()}`;
}

export function formatDate(date: string, style: 'long' | 'medium' = 'long'): string {
  if (!date) return '';
  return new Intl.DateTimeFormat('pt-BR', {
    dateStyle: style,
    timeZone: 'UTC',
  }).format(parseDateUTC(date));
}

export function countWords(text: string): number {
  return text.trim().split(/\s+/).filter(Boolean).length;
}

export function humanReadingTime(text: string): string {
  const minutes = Math.max(1, Math.round(countWords(text) / 200));
  return `${minutes} min`;
}

/* ------------------------------------------------------------------ */
/* markdown pipeline (igual ao Next: GFM + slug + anchors + highlight) */
/* ------------------------------------------------------------------ */

function rehypeAddAnchors() {
  return (tree: HRoot) => {
    visit(tree, 'element', (node: Element) => {
      if (node.tagName !== 'h2' && node.tagName !== 'h3') return;
      const id = node.properties?.id;
      if (!id || typeof id !== 'string') return;
      node.children.unshift({
        type: 'element',
        tagName: 'a',
        properties: { href: `#${id}`, className: ['anchor'], 'aria-hidden': 'true' },
        children: [{ type: 'text', value: '#' }],
      });
    });
  };
}

function rehypeWrapTables() {
  return (tree: HRoot) => {
    visit(tree, 'element', (node: Element, index, parent) => {
      if (node.tagName !== 'table') return;
      if (!parent || Array.isArray(parent.children) === false || typeof index !== 'number') return;
      const wrapper: Element = {
        type: 'element',
        tagName: 'div',
        properties: { className: ['table-scroll'] },
        children: [node],
      };
      parent.children[index] = wrapper;
    });
  };
}

export function renderMarkdown(content: string): string {
  const file = unified()
    .use(remarkParse)
    .use(remarkGfm)
    .use(remarkRehype)
    .use(rehypeSlug)
    .use(rehypeAddAnchors)
    .use(rehypeWrapTables)
    .use(rehypeHighlight)
    .use(rehypeStringify)
    .processSync(content);
  return String(file.value);
}

function flattenedHeadingText(node: Heading): string {
  const parts: string[] = [];
  const walk = (children: readonly unknown[]) => {
    for (const child of children) {
      if (typeof child === 'string') {
        parts.push(child);
      } else if (child && typeof child === 'object') {
        const c = child as { type?: string; value?: unknown; children?: unknown[] };
        if (c.type === 'heading') continue;
        if (c.value !== undefined) parts.push(String(c.value));
        if (c.children) walk(c.children);
      }
    }
  };
  walk(node.children);
  return parts.join('').trim();
}

export function extractToc(content: string): TocItem[] {
  const tree = unified().use(remarkParse).parse(content) as MdRoot;
  const slugger = new Slugger();
  const toc: TocItem[] = [];
  visit(tree, 'heading', (node: Heading) => {
    if (node.depth < 2 || node.depth > 3) return;
    const text = flattenedHeadingText(node);
    if (!text) return;
    toc.push({ depth: node.depth, text, id: slugger.slug(text) });
  });
  return toc;
}


/* ------------------------------------------------------------------ */
/* data access                                                         */
/* ------------------------------------------------------------------ */

function toMeta({ slug, data, content }: ParsedFile): PostMeta {
  return {
    slug,
    title: (data.title as string) ?? slug,
    description: (data.description as string) ?? '',
    date: (data.date as string | undefined) ?? '',
    tags: Array.isArray(data.tags) ? (data.tags as string[]) : [],
    published: data.published === undefined ? true : Boolean(data.published),
    featured: Boolean(data.featured),
    words: countWords(content),
    readingTime: humanReadingTime(content),
  };
}

const posts: PostMeta[] = files
  .map(toMeta)
  .filter((p) => p.published)
  .sort((a, b) => (a.date < b.date ? 1 : a.date > b.date ? -1 : 0));

const rendered = new Map<string, Post>();

/** Artigos publicados, do mais recente para o mais antigo. */
export function getAllPosts(): PostMeta[] {
  return posts;
}

export function getFeaturedPost(): PostMeta | null {
  return posts.find((p) => p.featured) ?? null;
}

export function getPost(slug: string): Post | null {
  const cached = rendered.get(slug);
  if (cached) return cached;
  const meta = posts.find((p) => p.slug === slug);
  const file = files.find((f) => f.slug === slug);
  if (!meta || !file) return null;
  const post: Post = {
    ...meta,
    content: file.content,
    html: renderMarkdown(file.content),
    toc: extractToc(file.content),
  };
  rendered.set(slug, post);
  return post;
}

/** Artigos que dividem tópicos com `slug`, dos mais parecidos para os menos. */
export function getRelatedPosts(slug: string, limit = 3): PostMeta[] {
  const current = posts.find((p) => p.slug === slug);
  if (!current) return [];
  const mine = new Set(current.tags.map((t) => t.trim().toLowerCase()));
  return posts
    .filter((p) => p.slug !== slug)
    .map((p) => ({ post: p, shared: p.tags.filter((t) => mine.has(t.trim().toLowerCase())).length }))
    .filter((r) => r.shared > 0)
    .sort((a, b) => b.shared - a.shared)
    .slice(0, limit)
    .map((r) => r.post);
}

/* ------------------------------------------------------------------ */
/* busca                                                               */
/* ------------------------------------------------------------------ */

export interface SearchDoc {
  post: PostMeta;
  /** Texto do artigo sem a marcação do markdown. */
  text: string;
}

function toPlainText(markdown: string): string {
  return markdown
    .replace(/^```.*$/gm, ' ')
    .replace(/!?\[([^\]]*)\]\([^)]*\)/g, '$1')
    .replace(/^\s*(#{1,6}|>|[-*+]|\d+\.)\s+/gm, '')
    .replace(/[*_`~|]/g, '')
    .replace(/\s+/g, ' ')
    .trim();
}

let searchDocs: SearchDoc[] | null = null;

export function getSearchDocs(): SearchDoc[] {
  if (!searchDocs) {
    searchDocs = posts.map((post) => ({
      post,
      text: toPlainText(files.find((f) => f.slug === post.slug)?.content ?? ''),
    }));
  }
  return searchDocs;
}

/** Minúsculas e sem acentos, para comparar "audio" com "áudio". */
export function normalize(text: string): string {
  return text
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .toLowerCase();
}

/** Artigos em que todos os termos aparecem; título pesa mais que o corpo. */
export function searchPosts(query: string): SearchDoc[] {
  const tokens = normalize(query).split(/\s+/).filter(Boolean);
  if (!tokens.length) return getSearchDocs();
  return getSearchDocs()
    .map((doc) => {
      const title = normalize(doc.post.title);
      const hay = `${title} ${normalize(doc.post.description)} ${normalize(doc.post.tags.join(' '))} ${normalize(doc.text)}`;
      if (!tokens.every((t) => hay.includes(t))) return null;
      return { doc, score: tokens.filter((t) => title.includes(t)).length };
    })
    .filter((r) => r !== null)
    .sort((a, b) => b.score - a.score)
    .map((r) => r.doc);
}

/* ------------------------------------------------------------------ */
/* tags                                                                */
/* ------------------------------------------------------------------ */

export function tagToSlug(name: string): string {
  return new Slugger().slug(name.trim());
}

let tagList: TagInfo[] | null = null;

export function getAllTags(): TagInfo[] {
  if (tagList) return tagList;
  const map = new Map<string, { name: string; count: number }>();
  for (const post of posts) {
    for (const rawTag of post.tags) {
      const name = rawTag.trim();
      if (!name) continue;
      const key = name.toLowerCase();
      const existing = map.get(key);
      if (existing) existing.count += 1;
      else map.set(key, { name, count: 1 });
    }
  }
  tagList = Array.from(map.values())
    .map((t) => ({ name: t.name, slug: tagToSlug(t.name), count: t.count }))
    .sort((a, b) => b.count - a.count || a.name.localeCompare(b.name, 'pt-BR'));
  return tagList;
}

export function getPostsByTag(name: string): PostMeta[] {
  const needle = name.trim().toLowerCase();
  return posts.filter((p) => p.tags.some((t) => t.trim().toLowerCase() === needle));
}

export function findTagBySlug(slug: string): string | null {
  return getAllTags().find((t) => t.slug === slug)?.name ?? null;
}
