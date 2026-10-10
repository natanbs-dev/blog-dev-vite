import { useEffect, useMemo, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { getAllPosts, normalize, searchPosts, shortDate, type SearchDoc } from '../lib/posts';

const OPEN_EVENT = 'blog:open-search';
const MAX_HITS = 8;

function esc(s: string): string {
  return s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
}

/** Trecho do texto em volta do primeiro termo encontrado, com os termos em <mark>. */
function snippet(doc: SearchDoc, tokens: string[]): string {
  const flat = normalize(doc.text);
  // normalize() pode mudar o comprimento em casos raros; só destaca se os índices batem
  if (!tokens.length || flat.length !== doc.text.length) return esc(doc.post.description);
  const at = Math.min(...tokens.map((t) => flat.indexOf(t)).filter((i) => i >= 0), Infinity);
  if (at === Infinity) return esc(doc.post.description);
  const start = Math.max(0, at - 40);
  const end = Math.min(doc.text.length, at + 110);
  const raw = doc.text.slice(start, end);
  const low = flat.slice(start, end);
  let out = start > 0 ? '…' : '';
  let cursor = 0;
  while (cursor < raw.length) {
    const hit = tokens.find((t) => low.startsWith(t, cursor));
    if (hit) {
      out += `<mark>${esc(raw.slice(cursor, cursor + hit.length))}</mark>`;
      cursor += hit.length;
    } else {
      out += esc(raw[cursor]);
      cursor += 1;
    }
  }
  return out + (end < doc.text.length ? '…' : '');
}

/** Botão do cabeçalho que abre a busca. */
export function SearchBox() {
  return (
    <button
      type="button"
      className="searchbox"
      aria-label="Buscar artigos"
      aria-keyshortcuts="Control+K"
      onClick={() => window.dispatchEvent(new CustomEvent(OPEN_EVENT))}
    >
      <svg viewBox="0 0 24 24" aria-hidden="true">
        <circle cx="11" cy="11" r="6.5" />
        <path d="M16 16l4.5 4.5" />
      </svg>
      <span className="searchbox__label">Buscar</span>
      <kbd>Ctrl K</kbd>
    </button>
  );
}

export function CommandPalette() {
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState('');
  const [active, setActive] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);
  const listRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      const typing = /^(INPUT|TEXTAREA|SELECT)$/.test((e.target as HTMLElement).tagName);
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        setOpen((v) => !v);
      } else if (e.key === '/' && !typing) {
        e.preventDefault();
        setOpen(true);
      } else if (e.key === 'Escape') {
        setOpen(false);
      }
    };
    const onOpen = () => setOpen(true);
    window.addEventListener('keydown', onKey);
    window.addEventListener(OPEN_EVENT, onOpen);
    return () => {
      window.removeEventListener('keydown', onKey);
      window.removeEventListener(OPEN_EVENT, onOpen);
    };
  }, []);

  // aberta: foca o campo e trava a rolagem da página; fechada: devolve o foco
  useEffect(() => {
    if (!open) return;
    const previous = document.activeElement as HTMLElement | null;
    document.body.style.overflow = 'hidden';
    inputRef.current?.focus();
    return () => {
      document.body.style.overflow = '';
      setQuery('');
      setActive(0);
      previous?.focus?.();
    };
  }, [open]);

  const tokens = useMemo(() => normalize(query).split(/\s+/).filter(Boolean), [query]);
  const hits = useMemo(() => searchPosts(query).slice(0, MAX_HITS), [query]);

  useEffect(() => {
    listRef.current?.querySelector('.is-active')?.scrollIntoView({ block: 'nearest' });
  }, [active]);

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
    } else if (e.key === 'Tab') {
      // o campo é o único ponto de foco: os resultados se escolhem com as setas
      e.preventDefault();
    }
  };

  const total = getAllPosts().length;
  const searching = query.trim() !== '';

  return (
    <div
      className="sheet-backdrop"
      onMouseDown={(e) => {
        if (e.target === e.currentTarget) setOpen(false);
      }}
    >
      <div className="sheet" role="dialog" aria-modal="true" aria-label="Buscar artigos">
        <div className="sheet__head">
          <svg viewBox="0 0 24 24" aria-hidden="true">
            <circle cx="11" cy="11" r="6.5" />
            <path d="M16 16l4.5 4.5" />
          </svg>
          <input
            ref={inputRef}
            type="search"
            value={query}
            onChange={(e) => {
              setQuery(e.target.value);
              setActive(0);
            }}
            onKeyDown={onInputKey}
            placeholder="Buscar por título, tópico ou trecho"
            aria-label="Buscar artigos"
            autoComplete="off"
            spellCheck={false}
          />
          <button type="button" className="sheet__close" aria-label="Fechar busca" onClick={() => setOpen(false)}>
            <kbd>Esc</kbd>
          </button>
        </div>

        <div className="sheet__body" ref={listRef}>
          {hits.length === 0 ? (
            <p className="sheet__hint">
              <strong>Nenhum artigo menciona “{query.trim()}”</strong>
              Tente um termo mais curto ou o nome de um tópico.
            </p>
          ) : (
            <>
              <p className="sheet__label">{searching ? 'Resultados' : 'Artigos recentes'}</p>
              {hits.map((hit, i) => (
                <button
                  type="button"
                  key={hit.post.slug}
                  tabIndex={-1}
                  className={`sheet__row${i === active ? ' is-active' : ''}`}
                  onMouseMove={() => setActive(i)}
                  onClick={() => go(hit.post.slug)}
                >
                  <span className="sheet__title">{hit.post.title}</span>
                  <span className="sheet__date">{shortDate(hit.post.date)}</span>
                  <span className="sheet__snippet" dangerouslySetInnerHTML={{ __html: snippet(hit, tokens) }} />
                  <span className="sheet__meta">
                    {hit.post.tags.slice(0, 3).map((t) => (
                      <span key={t} className="tag">
                        {t}
                      </span>
                    ))}
                  </span>
                  <kbd className="sheet__enter" aria-hidden="true">
                    ↵
                  </kbd>
                </button>
              ))}
            </>
          )}
        </div>

        <p className="sheet__foot">
          <span>
            <kbd>↑</kbd>
            <kbd>↓</kbd> escolher
          </span>
          <span>
            <kbd>↵</kbd> abrir
          </span>
          <span>
            <kbd>Esc</kbd> fechar
          </span>
          <span className="sheet__count" aria-live="polite">
            {searching ? `${hits.length} de ${total} artigos` : `${total} artigos`}
          </span>
        </p>
      </div>
    </div>
  );
}
