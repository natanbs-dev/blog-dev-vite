import { useEffect, useRef } from 'react';
import { useHeadingJump } from './PostChrome';

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
 * Linha do tempo do artigo: um trilho vertical liga os títulos "##" e vai
 * sendo preenchido conforme a leitura avança; rolar para cima desfaz.
 * As cores vêm das variáveis do tema (ver .rail no CSS).
 */
function timeline(root: HTMLElement): () => void {
  const stops = Array.from(root.querySelectorAll<HTMLElement>(':scope > h2'));
  if (stops.length < 2) return () => {};

  const rail = document.createElement('span');
  rail.className = 'rail';
  rail.setAttribute('aria-hidden', 'true');
  const fill = document.createElement('span');
  fill.className = 'rail__fill';
  rail.appendChild(fill);
  root.classList.add('prose--rail');
  root.appendChild(rail);

  // altura de cada ponto dentro do artigo: o meio da primeira linha do título
  let centers: number[] = [];
  const layout = () => {
    centers = stops.map((h) => h.offsetTop + parseFloat(getComputedStyle(h).lineHeight) / 2);
    rail.style.top = `${centers[0]}px`;
    rail.style.height = `${centers[centers.length - 1] - centers[0]}px`;
  };

  const update = () => {
    const vh = window.innerHeight;
    // a "linha de leitura" fica a 45% da tela; perto do fim da página ela
    // desce até a base, para o último ponto sempre poder ser alcançado
    const left = Math.max(0, document.documentElement.scrollHeight - vh - window.scrollY);
    const line = vh - Math.min(vh * 0.55, left);
    const box = rail.getBoundingClientRect();
    const done = box.height > 0 ? Math.min(1, Math.max(0, (line - box.top) / box.height)) : 0;
    fill.style.transform = `scaleY(${done})`;
    let current = -1;
    centers.forEach((c, i) => {
      if (box.top + c - centers[0] <= line + 0.5) current = i;
    });
    stops.forEach((h, i) => {
      h.classList.toggle('is-passed', i <= current);
      h.classList.toggle('is-current', i === current);
    });
  };

  let raf = 0;
  const onScroll = () => {
    cancelAnimationFrame(raf);
    raf = requestAnimationFrame(update);
  };
  const onResize = () => {
    layout();
    onScroll();
  };
  // imagens e blocos de código mudam a altura do texto depois da montagem
  const ro = new ResizeObserver(onResize);
  ro.observe(root);
  layout();
  update();
  window.addEventListener('scroll', onScroll, { passive: true });
  window.addEventListener('resize', onResize);

  return () => {
    cancelAnimationFrame(raf);
    ro.disconnect();
    window.removeEventListener('scroll', onScroll);
    window.removeEventListener('resize', onResize);
    rail.remove();
    root.classList.remove('prose--rail');
    stops.forEach((h) => h.classList.remove('is-passed', 'is-current'));
  };
}

/**
 * Renderiza HTML gerado do markdown e injeta a barra de
 * linguagem + botão "Copiar" em cada <pre> (requisito do projeto),
 * além da linha do tempo que liga os títulos.
 */
export default function Markdown({ html }: { html: string }) {
  const ref = useRef<HTMLDivElement>(null);
  const jump = useHeadingJump();

  useEffect(() => {
    const root = ref.current;
    if (!root) return;
    // Âncoras internas passam pelo useHeadingJump (ver PostChrome).
    const onClick = (e: MouseEvent) => {
      const a = (e.target as HTMLElement).closest?.('a[href^="#"]');
      if (!a || !root.contains(a)) return;
      const id = decodeURIComponent(a.getAttribute('href')?.slice(1) ?? '');
      if (!id || !document.getElementById(id)) return;
      e.preventDefault();
      jump(id);
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

      const langEl = document.createElement('span');
      langEl.className = 'codeblock__lang';
      langEl.textContent = lang || 'texto';

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

      bar.appendChild(langEl);
      bar.appendChild(btn);
      wrapper.appendChild(bar);
      pre.parentNode?.insertBefore(wrapper, pre);
      wrapper.appendChild(pre);
    });

    const stopTimeline = timeline(root);

    return () => {
      root.removeEventListener('click', onClick);
      stopTimeline();
    };
  }, [html, jump]);

  return <div ref={ref} className="prose" dangerouslySetInnerHTML={{ __html: html }} />;
}
