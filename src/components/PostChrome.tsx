import { useEffect, useState } from 'react';
import type { TocItem } from '../lib/posts';

export function Toc({ items }: { items: TocItem[] }) {
  if (!items.length) return null;
  const go = (e: React.MouseEvent<HTMLAnchorElement>, id: string) => {
    e.preventDefault();
    // HashRouter usa o location.hash para rota — um <a href="#id">
    // puro trocaria a rota para /id e cairia no NotFound (404).
    // Por isso fazemos scroll manual sem tocar na rota.
    document.getElementById(id)?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    history.replaceState(null, '', `${window.location.pathname}${window.location.search}#${id}`);
  };
  return (
    <aside className="tocbox" aria-label="Sumário do artigo">
      <p className="tocbox__title">Sumário</p>
      <ol className="tocbox__list">
        {items.map((item) => (
          <li key={item.id} className={item.depth === 3 ? 'tocbox__sub' : undefined}>
            <a href={`#${item.id}`} onClick={(e) => go(e, item.id)}>
              {item.text}
            </a>
          </li>
        ))}
      </ol>
    </aside>
  );
}

export function ReadingProgress() {
  const [width, setWidth] = useState(0);
  useEffect(() => {
    const onScroll = () => {
      const total = document.documentElement.scrollHeight - window.innerHeight;
      setWidth(total > 0 ? Math.min(100, (window.scrollY / total) * 100) : 0);
    };
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);
  return <div className="progress" style={{ width: `${width}%` }} aria-hidden />;
}

export function BackToTop() {
  const [show, setShow] = useState(false);
  useEffect(() => {
    const onScroll = () => setShow(window.scrollY > 600);
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);
  if (!show) return null;
  return (
    <button
      type="button"
      className="to-top is-visible"
      aria-label="Voltar ao topo"
      onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
    >
      ↑<span>topo</span>
    </button>
  );
}
