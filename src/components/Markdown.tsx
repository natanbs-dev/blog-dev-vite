import { useEffect, useRef } from 'react';

const ICON_IDLE =
  '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><rect width="14" height="14" x="8" y="8" rx="2"/><path d="M4 16c-1.1 0-2-.9-2-2V4c0-1.1.9-2 2-2h10c1.1 0 2 .9 2 2"/></svg>';
const ICON_OK =
  '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M20 6 9 17l-5-5"/></svg>';

function copyText(text: string): Promise<void> {
  if (navigator.clipboard?.writeText) {
    return navigator.clipboard.writeText(text).catch(() => fallbackCopy(text));
  }
  return Promise.resolve(fallbackCopy(text));
}

function fallbackCopy(text: string): void {
  const ta = document.createElement('textarea');
  ta.value = text;
  ta.style.position = 'fixed';
  ta.style.opacity = '0';
  document.body.appendChild(ta);
  ta.select();
  try {
    document.execCommand('copy');
  } finally {
    document.body.removeChild(ta);
  }
}

function languageOf(code: HTMLElement): string {
  const cls = code.className || '';
  const match = /language-([\w-]+)/.exec(String(cls));
  const lang = match?.[1]?.toLowerCase() ?? '';
  if (!lang || lang === 'text' || lang === 'plaintext' || lang === 'plain') return '';
  return lang;
}

/**
 * Renderiza HTML gerado do markdown e injeta a barra de
 * linguagem + botão "Copiar" em cada <pre> (requisito do projeto).
 */
export default function Markdown({ html }: { html: string }) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const root = ref.current;
    if (!root) return;
    // Mesma causa do 404 do sumário: com HashRouter, <a href="#id">
    // trocaria a rota. Intercepta cliques em âncoras internas.
    const onClick = (e: MouseEvent) => {
      const a = (e.target as HTMLElement).closest?.('a[href^="#"]');
      if (!a || !root.contains(a)) return;
      const id = a.getAttribute('href')?.slice(1);
      if (!id) return;
      const el = document.getElementById(id);
      if (!el) return;
      e.preventDefault();
      el.scrollIntoView({ behavior: 'smooth', block: 'start' });
      history.replaceState(null, '', `${window.location.pathname}${window.location.search}#${id}`);
    };
    root.addEventListener('click', onClick);
    const pres = root.querySelectorAll<HTMLPreElement>('pre');

    pres.forEach((pre) => {
      if (pre.parentElement?.classList.contains('codeblock')) return;
      const code = pre.querySelector('code');
      const lang = code ? languageOf(code) : '';

      const wrapper = document.createElement('div');
      wrapper.className = 'codeblock';

      const bar = document.createElement('div');
      bar.className = 'codeblock__bar';

      const dots = document.createElement('span');
      dots.className = 'codeblock__dots';
      dots.setAttribute('aria-hidden', 'true');
      dots.innerHTML = '<i></i><i></i><i></i>';

      const langEl = document.createElement('span');
      langEl.className = 'codeblock__lang';
      langEl.textContent = lang || 'code';

      const btn = document.createElement('button');
      btn.type = 'button';
      btn.className = 'copy-btn';
      btn.setAttribute('aria-label', `Copiar código${lang ? ` (${lang})` : ''}`);

      const label = document.createElement('span');
      label.className = 'copy-btn__label';
      label.textContent = 'Copiar';
      btn.innerHTML = ICON_IDLE;
      btn.appendChild(label);

      btn.addEventListener('click', () => {
        const text = (code?.innerText ?? pre.innerText).replace(/\n$/, '');
        btn.classList.add('copy-btn--loading');
        copyText(text)
          .then(() => {
            btn.classList.remove('copy-btn--loading');
            btn.classList.add('copy-btn--done');
            btn.innerHTML = ICON_OK;
            label.textContent = 'Copiado!';
            btn.appendChild(label);
            setTimeout(() => {
              btn.classList.remove('copy-btn--done');
              btn.innerHTML = ICON_IDLE;
              label.textContent = 'Copiar';
              btn.appendChild(label);
            }, 1800);
          })
          .catch(() => {
            btn.classList.remove('copy-btn--loading');
            label.textContent = 'Erro';
          });
      });

      bar.appendChild(dots);
      bar.appendChild(langEl);
      bar.appendChild(btn);
      wrapper.appendChild(bar);
      pre.parentNode?.insertBefore(wrapper, pre);
      wrapper.appendChild(pre);
    });

    return () => root.removeEventListener('click', onClick);
  }, [html]);

  return <div ref={ref} className="prose" dangerouslySetInnerHTML={{ __html: html }} />;
}
