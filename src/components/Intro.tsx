import { useEffect, useRef, useState, type CSSProperties } from 'react';
import { endIntro, introPending } from '../lib/intro';
import { getAllPosts } from '../lib/posts';
import { site } from '../lib/site';

const HOLD_MS = 3250; // digitação, régua, legenda e pipeline
// o caminho real de um artigo: do arquivo em content/posts até a tela (ver renderMarkdown)
const PIPELINE = ['.md', 'remark', 'gfm', 'rehype', 'highlight', 'react'];
const DOCK_MS = 950;

/**
 * Abertura: o nome do site é digitado em tela cheia, o pipeline de markdown
 * acende etapa por etapa, e então o nome encolhe até pousar no logotipo do
 * cabeçalho, enquanto o fundo se desfaz e a página entra por trás.
 * Clique ou tecla adianta.
 */
export default function Intro() {
  const [show, setShow] = useState(introPending);
  const [dock, setDock] = useState<CSSProperties | null>(null);
  const nameRef = useRef<HTMLParagraphElement>(null);
  // tempo de verdade: do início do carregamento até o app montar
  const [bootMs] = useState(() => Math.round(performance.now()));

  useEffect(() => {
    if (!show) return;
    const root = document.documentElement;
    let docking = false;
    let timer = 0;

    const finish = () => {
      root.removeAttribute('data-docking');
      endIntro();
      setShow(false);
    };
    const leave = () => {
      window.clearTimeout(timer);
      // segundo toque durante o pouso: termina na hora
      if (docking) return finish();
      const name = nameRef.current;
      const mark = name?.querySelector('.intro__mark');
      const brand = document.querySelector('.brand');
      const brandMark = brand?.querySelector('.brand__mark');
      if (!name || !mark || !brand || !brandMark || !brand.getClientRects().length) return finish();

      // leva o "❯" da abertura para cima do "❯" do cabeçalho, na escala das duas fontes
      const n = name.getBoundingClientRect();
      const m = mark.getBoundingClientRect();
      const b = brandMark.getBoundingClientRect();
      const s = parseFloat(getComputedStyle(brand).fontSize) / parseFloat(getComputedStyle(name).fontSize);
      const dx = b.left - n.left - s * (m.left - n.left);
      const dy = b.top + b.height / 2 - n.top - s * (m.top + m.height / 2 - n.top);
      docking = true;
      // a largura fica travada: a fonte muda no caminho e não pode recentralizar a caixa
      const w = name.parentElement!.getBoundingClientRect().width;
      setDock({ '--dx': `${dx}px`, '--dy': `${dy}px`, '--s': s, '--w': `${w}px` } as CSSProperties);
      // o logotipo de verdade some até o nome pousar; o resto da página já pode entrar
      root.setAttribute('data-docking', '');
      endIntro();
      timer = window.setTimeout(finish, DOCK_MS);
    };

    timer = window.setTimeout(leave, HOLD_MS);
    window.addEventListener('keydown', leave);
    window.addEventListener('pointerdown', leave);
    return () => {
      window.clearTimeout(timer);
      window.removeEventListener('keydown', leave);
      window.removeEventListener('pointerdown', leave);
      root.removeAttribute('data-docking');
    };
  }, [show]);

  if (!show) return null;

  return (
    <div className={`intro${dock ? ' is-docking' : ''}`} style={dock ?? undefined} aria-hidden="true">
      <span className="intro__grid" />
      <div className="intro__hud">
        <span>~/content/posts</span>
        <span>{getAllPosts().length} arquivos .md</span>
        <span>utf-8 · markdown</span>
        <span className="intro__ready">✓ pronto em {bootMs}ms</span>
      </div>
      <div className="intro__box">
        <p className="intro__name" ref={nameRef}>
          <span className="intro__mark">❯</span>
          <span className="intro__type">{site.name}</span>
          <span className="intro__caret" />
        </p>
        <span className="intro__rule" />
        <p className="intro__tag">notas de terminal, código e arquitetura</p>
        <p className="intro__pipe">
          {PIPELINE.map((step, i) => (
            <span key={step} style={{ '--i': i } as CSSProperties}>
              {step}
            </span>
          ))}
        </p>
      </div>
    </div>
  );
}
