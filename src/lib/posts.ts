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
import type { Heading, Image, PhrasingContent, Root as MdRoot, Text } from 'mdast';
import type { Element, Root as HRoot } from 'hast';

/** Imagem já processada no build: endereço final e dimensões reais. */
export interface Picture {
  src: string;
  width?: number;
  height?: number;
}

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
  /** Capa (`cover:` no front-matter), até 1600px de largura. */
  cover?: Picture;
  /** Miniatura da capa, recortada em 16:9, para listas e destaque. */
  thumb?: Picture;
  coverAlt: string;
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

/* ------------------------------------------------------------------ */
/* imagens: qualquer foto dentro de content/ é otimizada no build pelo */
/* vite-imagetools. O markdown aponta para ela com caminho relativo ao  */
/* .md (ex.: ![alt](./img/foto.jpg)); foto grande vira WebP de até     */
/* 1600px, e a capa ganha ainda uma miniatura 640x360.                 */
/* ------------------------------------------------------------------ */

const fullImages = import.meta.glob<Picture>('../../content/**/*.{png,jpg,jpeg,webp,avif,PNG,JPG,JPEG,WEBP,AVIF}', {
  query: '?w=1600&withoutEnlargement&format=webp&as=metadata',
  import: 'default',
  eager: true,
});
const thumbImages = import.meta.glob<Picture>('../../content/**/*.{png,jpg,jpeg,webp,avif,PNG,JPG,JPEG,WEBP,AVIF}', {
  query: '?w=640&h=360&fit=cover&format=webp&as=metadata',
  import: 'default',
  eager: true,
});
// GIF (pode ser animado) e SVG passam sem conversão
const plainImages = import.meta.glob<string>('../../content/**/*.{gif,svg,GIF,SVG}', {
  query: '?url',
  import: 'default',
  eager: true,
});

/** '../../content/posts/a.md' → '/content/posts/a.md' */
const fromRoot = (key: string) => key.replace(/^(\.\.\/)+/, '/');
const byPath = <T>(mods: Record<string, T>) => new Map(Object.entries(mods).map(([k, v]) => [fromRoot(k), v]));
const fullByPath = byPath(fullImages);
const thumbByPath = byPath(thumbImages);
const plainByPath = byPath(plainImages);

/** Caminho do arquivo que `src` aponta, visto a partir do .md em `from`. */
function resolveLocal(from: string, src: string): string | null {
  // endereços externos e `data:` ficam como estão
  if (!src || /^[a-z][a-z0-9+.-]*:/i.test(src) || src.startsWith('//') || src.startsWith('#')) return null;
  try {
    return decodeURIComponent(new URL(src, `https://x${from}`).pathname);
  } catch {
    return null;
  }
}

function findImage(from: string, src: string, size: 'full' | 'thumb' = 'full'): Picture | null {
  // "/foto.png" ainda procura em public/; o resto é relativo ao .md
  if (src.startsWith('/') && !src.startsWith('//')) return null;
  const at = resolveLocal(from, src);
  if (!at) return null;
  const pic = (size === 'thumb' ? thumbByPath : fullByPath).get(at);
  if (pic) return pic;
  const plain = plainByPath.get(at);
  return plain ? { src: plain } : null;
}

/** Caminho relativo de `fromFile` até `to` (ambos a partir da raiz do projeto). */
function relativePath(fromFile: string, to: string): string {
  const from = fromFile.split('/').slice(0, -1);
  const target = to.split('/');
  let same = 0;
  while (same < from.length && same < target.length - 1 && from[same] === target[same]) same++;
  return [...Array(from.length - same).fill('..'), ...target.slice(same)].join('/').replace(/^(?!\.)/, './');
}

/** Acha a imagem de um `![[nome.jpg]]` como o Obsidian: pelo caminho, ou só pelo nome do arquivo. */
function findEmbed(link: string): string | null {
  const want = decodeURIComponent(link.trim().replace(/^\.?\//, ''));
  const all = [...fullByPath.keys(), ...plainByPath.keys()];
  const hits = all.filter((p) => p === `/${want}` || p.endsWith(`/${want}`));
  // mais de um com o mesmo nome: o de caminho mais curto, como o Obsidian faz
  return hits.sort((a, b) => a.length - b.length)[0] ?? null;
}

const EMBED = /!\[\[([^\]|]+?)(?:\|([^\]]*))?\]\]/g;

/**
 * Aceita a sintaxe de imagem do Obsidian, `![[foto.jpg]]` ou
 * `![[foto.jpg|descrição]]`, e transforma em imagem markdown comum. Assim o
 * artigo escrito no Obsidian aparece igual no site.
 */
function remarkObsidianEmbeds(from: string) {
  return (tree: MdRoot) => {
    visit(tree, 'text', (node: Text, index, parent) => {
      if (!parent || typeof index !== 'number' || !node.value.includes('![[')) return;
      const parts: PhrasingContent[] = [];
      let last = 0;
      for (const m of node.value.matchAll(EMBED)) {
        const found = findEmbed(m[1]);
        if (!found) {
          if (import.meta.env.DEV) console.warn(`[imagens] "${m[0]}" não existe (em ${from})`);
          continue;
        }
        if (m.index > last) parts.push({ type: 'text', value: node.value.slice(last, m.index) });
        // "|300" no Obsidian é largura, não descrição
        const label = m[2]?.trim() ?? '';
        const alt = label && !/^\d+(x\d+)?$/.test(label) ? label : '';
        parts.push({ type: 'image', url: relativePath(from, found), alt } satisfies Image);
        last = m.index + m[0].length;
      }
      if (!parts.length) return;
      if (last < node.value.length) parts.push({ type: 'text', value: node.value.slice(last) });
      parent.children.splice(index, 1, ...parts);
      return index + parts.length;
    });
  };
}

interface ParsedFile {
  /** '/content/posts/slug.md', base para os caminhos relativos das imagens */
  path: string;
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
  return { path: fromRoot(filePath), slug, data, content: stripLeadingTitle(content) };
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

/** Liga cada <img> do artigo à versão otimizada; carrega só quando chega perto da tela. */
function rehypeImages(from: string) {
  return (tree: HRoot) => {
    visit(tree, 'element', (node: Element) => {
      if (node.tagName !== 'img') return;
      const props = (node.properties ??= {});
      const src = typeof props.src === 'string' ? props.src : '';
      const pic = findImage(from, src);
      if (pic) {
        props.src = pic.src;
        if (pic.width && pic.height) {
          // reserva o espaço antes de a foto chegar: o texto não pula
          props.width = pic.width;
          props.height = pic.height;
        }
      } else if (src.startsWith('/') && !src.startsWith('//')) {
        // public/: relativo à raiz do site, que no GitHub Pages é uma subpasta
        props.src = import.meta.env.BASE_URL + src.slice(1);
      } else if (resolveLocal(from, src) && import.meta.env.DEV) {
        console.warn(`[imagens] "${src}" não existe (em ${from})`);
      }
      props.loading = 'lazy';
      props.decoding = 'async';
    });
  };
}

export function renderMarkdown(content: string, from = '/content/posts/'): string {
  const file = unified()
    .use(remarkParse)
    .use(remarkGfm)
    .use(remarkObsidianEmbeds, from)
    .use(remarkRehype)
    .use(rehypeSlug)
    .use(rehypeAddAnchors)
    .use(rehypeWrapTables)
    .use(rehypeImages, from)
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

function toMeta({ path, slug, data, content }: ParsedFile): PostMeta {
  const coverSrc = typeof data.cover === 'string' ? data.cover : '';
  const cover = coverSrc ? findImage(path, coverSrc) : null;
  if (coverSrc && !cover && import.meta.env.DEV) console.warn(`[imagens] capa "${coverSrc}" não existe (em ${path})`);
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
    cover: cover ?? undefined,
    thumb: cover ? (findImage(path, coverSrc, 'thumb') ?? cover) : undefined,
    coverAlt: typeof data.coverAlt === 'string' ? data.coverAlt : '',
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
    html: renderMarkdown(file.content, file.path),
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
