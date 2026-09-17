import { useCallback, useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';

interface IndexPost {
  slug: string;
  title: string;
  desc: string;
  tags: string[];
  date: string;
  content: string;
}

let cachePosts: IndexPost[] | null = null;
let cacheAt = 0;
let inflight: Promise<IndexPost[]> | null = null;
const TTL = 60_000;

function getIndex(): Promise<IndexPost[]> {
  if (cachePosts && Date.now() - cacheAt < TTL) return Promise.resolve(cachePosts);
  if (!inflight) {
    inflight = fetch(`${import.meta.env.BASE_URL}search-index.json`)
      .then((r) => r.json())
      .then((d) => {
        cachePosts = (d.posts as IndexPost[]) ?? [];
        cacheAt = Date.now();
        return cachePosts;
      })
      .catch(() => {
        cachePosts = [];
        cacheAt = Date.now();
        return cachePosts;
      })
      .finally(() => {
        inflight = null;
      });
  }
  return inflight;
}

function norm(s: string): string {
  return s
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .toLowerCase();
}

function shortDate(d: string): string {
  if (!d) return '';
  const [y, m, dd] = d.split('-');
  if (!y || !m || !dd) return d;
  return `${dd}/${m}/${y}`;
}

interface Hit {
  post: IndexPost;
  snippet: string;
}

function esc(s: string): string {
  return s
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

function buildSnippet(content: string, tokens: string[]): string {
  const low = content.toLowerCase();
  const nrm = norm(content);
  let pos = -1;
  for (const tok of tokens) {
    const i = low.indexOf(tok);
    if (i >= 0) {
      pos = i;
      break;
    }
    const j = nrm.indexOf(tok);
    if (j >= 0) {
      pos = j;
      break;
    }
  }
  if (pos < 0) pos = 0;
  const start = Math.max(0, pos - 38);
  const end = Math.min(content.length, pos + 120);
  let raw = content.slice(start, end).replace(/\s+/g, ' ');
  if (start > 0) raw = '…' + raw;
  if (end < content.length) raw = raw + '…';
  const clean = raw.toLowerCase();
  const matches: { at: number; len: number }[] = [];
  const seen = new Set<string>();
  for (const tok of tokens) {
    if (seen.has(tok)) continue;
    seen.add(tok);
    const at = clean.indexOf(tok);
    if (at >= 0) matches.push({ at, len: tok.length });
  }
  matches.sort((a, b) => a.at - b.at);
  let out = '';
  let cursor = 0;
  for (const m of matches) {
    if (m.at < cursor) continue;
    out += esc(raw.slice(cursor, m.at)) + '<b>' + esc(raw.slice(m.at, m.at + m.len)) + '</b>';
    cursor = m.at + m.len;
  }
  out += esc(raw.slice(cursor));
  return out;
}

/** Campo de busca visível no header — clica (ou Ctrl+K) e abre a folha. */
export function SearchBox() {
  return (
    <button
      type="button"
      className="searchbox"
      aria-label="Buscar no caderno (Ctrl+K)"
      title="Buscar (Ctrl+K)"
      onClick={() => window.dispatchEvent(new CustomEvent('blog:open-search'))}
    >
      <span className="searchbox__icon">⌕</span>
      <span className="searchbox__ph">Buscar notas…</span>
      <kbd className="searchbox__kbd">ctrl k</kbd>
    </button>
  );
}

export function CommandPalette() {
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState('');
  const [hits, setHits] = useState<Hit[]>([]);
  const [active, setActive] = useState(0);
  const [loading, setLoading] = useState(false);
  const [total, setTotal] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);
  const debounce = useRef<number | null>(null);

  const toggle = useCallback((next?: boolean) => {
    setOpen((prev) => {
      const value = next ?? !prev;
      if (!value) setQuery('');
      return value;
    });
  }, []);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        toggle();
      }
      if (e.key === 'Escape') toggle(false);
    };
    const onOpen = () => toggle(true);
    window.addEventListener('keydown', onKey);
    window.addEventListener('blog:open-search', onOpen);
    return () => {
      window.removeEventListener('keydown', onKey);
      window.removeEventListener('blog:open-search', onOpen);
    };
  }, [toggle]);

  useEffect(() => {
    if (open) setTimeout(() => inputRef.current?.focus(), 30);
  }, [open ]);

  useEffect(() => {
    if (debounce.current) window.clearTimeout(debounce.current);
    debounce.current = window.setTimeout(async () => {
      if (!open) return;
      setLoading(true);
      const posts = await getIndex();
      setTotal(posts.length);
      const q = query.trim();
      if (!q) {
        setHits(posts.map((p) => ({ post: p, snippet: p.desc || '' })));
        setActive(0);
        setLoading(false);
        return;
      }
      const tokens = norm(q).split(/\s+/).filter(Boolean);
      const found: { post: IndexPost; score: number; snippet: string }[] = [];
      for (const p of posts) {
        const hay = [norm(p.title), norm(p.desc), norm(p.tags.join(' ')), norm(p.content)].join(' ');
        if (!tokens.every((t) => hay.includes(t))) continue;
        const titleHits = tokens.filter((t) => norm(p.title).includes(t)).length;
        const score = titleHits * 10 + (titleHits > 0 ? 0 : 1);
        found.push({ post: p, score, snippet: buildSnippet(p.content, tokens) });
      }
      found.sort(
        (a, b) => b.score - a.score || (a.post.date < b.post.date ? 1 : a.post.date > b.post.date ? -1 : 0),
      );
      setHits(found.slice(0, 14).map((f) => ({ post: f.post, snippet: f.snippet })));
      setActive(0);
      setLoading(false);
    }, 130);
    return () => {
      if (debounce.current) window.clearTimeout(debounce.current);
    };
  }, [query, open ]);

  if (!open) return null;

  const go = (slug: string) => {
    setOpen(false);
    navigate(`/posts/${slug}`);
  };

  const onInputKey = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setActive((v) => Math.min(v + 1, hits.length - 1));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setActive((v) => Math.max(v - 1, 0));
    } else if (e.key === 'Enter') {
      e.preventDefault();
      const hit = hits[active];
      if (hit) go(hit.post.slug);
    }
  };

  return (
    <div
      className="sheet-backdrop"
      onMouseDown={(e) => {
        if (e.target === e.currentTarget) setOpen(false);
      }}
    >
      <div className="sheet" role="dialog" aria-modal="true" aria-label="Buscar notas">
        <div className="sheet__head">
          <span className="sheet__icon">⌕</span>
          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyDown={onInputKey}
            placeholder="Título, trecho ou tópico…"
            autoComplete="off"
            spellCheck={false}
          />
          <kbd>esc</kbd>
        </div>

        <div className="sheet__body">
          {loading ? (
            <p className="sheet__hint">folheando o caderno…</p>
          ) : query.trim() && hits.length === 0 ? (
            <p className="sheet__hint">
              Nada anotado sobre “{query.trim()}”.
            </p>
          ) : (
            hits.map((hit, i) => (
              <button
                type="button"
                key={hit.post.slug}
                className={`sheet__row${i === active ? ' is-active' : ''}`}
                onMouseEnter={() => setActive(i)}
                onClick={() => go(hit.post.slug)}
              >
                <span className="sheet__n">{String(i + 1).padStart(2, '0')}</span>
                <span className="sheet__main">
                  <span className="sheet__title">{hit.post.title}</span>
                  {hit.snippet && (
                    <span className="sheet__snippet" dangerouslySetInnerHTML={{ __html: hit.snippet }} />
                  )}
                  <span className="sheet__meta">
                    {hit.post.tags.slice(0, 3).map((t) => (
                      <span className="stamp stamp--sm" key={t}>
                        {t}
                      </span>
                    ))}
                    <span>{shortDate(hit.post.date)}</span>
                  </span>
                </span>
              </button>
            ))
          )}
        </div>

        <div className="sheet__foot">
          <span>↑↓ escolher</span>
          <span>↵ abrir</span>
          <span className="right">{total} notas no caderno</span>
        </div>
      </div>
    </div>
  );
}
