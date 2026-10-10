import { useCallback, useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import type { TocItem } from '../lib/posts';

/**
 * Rola até um título do artigo e guarda o destino em `?h=`.
 * Com HashRouter o hash da URL é a própria rota, então um `#id` comum
 * levaria ao 404; o parâmetro mantém o link compartilhável.
 */
export function useHeadingJump() {
  const [, setParams] = useSearchParams();
  return useCallback(
    (id: string) => {
      const el = document.getElementById(id);
      if (!el) return;
      el.scrollIntoView({ block: 'start' });
      setParams({ h: id }, { replace: true });
    },
    [setParams],
  );
}

function useActiveHeading(ids: string[]): string {
  const [active, setActive] = useState('');
  const key = ids.join('|');
  useEffect(() => {
    const els = key
      .split('|')
      .map((id) => document.getElementById(id))
      .filter((el): el is HTMLElement => el !== null);
    if (!els.length) return;
    const onScroll = () => {
      // o título "atual" é o último que já passou do topo da área de leitura
      const line = 120;
      let current = '';
      for (const el of els) {
        if (el.getBoundingClientRect().top <= line) current = el.id;
        else break;
      }
      setActive(current);
    };
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, [key]);
  return active;
}

export function Toc({ items }: { items: TocItem[] }) {
  const jump = useHeadingJump();
  const active = useActiveHeading(items.map((i) => i.id));
  // aberto ao lado do texto em telas largas; recolhido acima dele nas estreitas
  const [open] = useState(() => window.matchMedia('(min-width: 1080px)').matches);
  if (!items.length) return null;
  return (
    <details className="toc" open={open}>
      <summary className="toc__title">Neste artigo</summary>
      <nav aria-label="Sumário do artigo">
        <ol className="toc__list">
          {items.map((item) => (
            <li key={item.id} className={item.depth === 3 ? 'toc__sub' : undefined}>
              <a
                href={`#${item.id}`}
                aria-current={item.id === active ? 'location' : undefined}
                onClick={(e) => {
                  e.preventDefault();
                  jump(item.id);
                }}
              >
                {item.text}
              </a>
            </li>
          ))}
        </ol>
      </nav>
    </details>
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
    const onScroll = () => setShow(window.scrollY > 900);
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);
  if (!show) return null;
  return (
    <button type="button" className="to-top" onClick={() => window.scrollTo({ top: 0 })}>
      Voltar ao topo
    </button>
  );
}
