import { useEffect, useRef } from 'react';

const GLYPHS = 'ｱｲｳｴｵｶｷｸｹｺｻｼｽｾｿﾀﾁﾂﾃﾄﾅﾆﾇﾈﾉﾊﾋﾌﾍﾎﾏﾐﾑﾒﾓﾔﾕﾖﾗﾘﾙﾚﾛﾜﾝ0123456789<>=*+-$#'.split('');
const CELL = 16;
const TICK_MS = 55;

interface Column {
  y: number;
  speed: number;
  glyph: string;
}

function cssVar(name: string, fallback: string): string {
  return getComputedStyle(document.documentElement).getPropertyValue(name).trim() || fallback;
}

/**
 * Chuva de caracteres no estilo cmatrix. O canvas é transparente (o rastro
 * some por `destination-out`), então funciona sobre qualquer tema.
 * Pausa fora da tela e em aba oculta; com "reduzir movimento" vira um quadro fixo.
 */
export default function MatrixRain() {
  const ref = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = ref.current;
    const ctx = canvas?.getContext('2d');
    if (!canvas || !ctx) return;

    let columns: Column[] = [];
    let width = 0;
    let height = 0;
    let accent = '';
    let head = '';

    const readColors = () => {
      accent = cssVar('--accent', '#5ef0b0');
      head = cssVar('--ink', '#e4eeea');
    };

    const newColumn = (startAbove: boolean): Column => ({
      y: startAbove ? -Math.random() * 30 : Math.random() * (height / CELL),
      speed: 0.35 + Math.random() * 0.65,
      glyph: '',
    });

    const resize = () => {
      const rect = canvas.getBoundingClientRect();
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      width = rect.width;
      height = rect.height;
      canvas.width = Math.max(1, Math.round(width * dpr));
      canvas.height = Math.max(1, Math.round(height * dpr));
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      ctx.font = `${CELL - 2}px ui-monospace, "Cascadia Code", Menlo, Consolas, monospace`;
      ctx.textBaseline = 'top';
      columns = Array.from({ length: Math.ceil(width / CELL) }, () => newColumn(false));
    };

    const tick = () => {
      ctx.globalCompositeOperation = 'destination-out';
      ctx.fillStyle = 'rgba(0, 0, 0, 0.085)';
      ctx.fillRect(0, 0, width, height);
      ctx.globalCompositeOperation = 'source-over';

      columns.forEach((col, i) => {
        const before = Math.floor(col.y);
        col.y += col.speed;
        const row = Math.floor(col.y);
        if (row === before || row < 0) return;
        const x = i * CELL;
        // a cabeça anterior vira rastro na cor do tema
        if (col.glyph) {
          ctx.clearRect(x, before * CELL, CELL, CELL);
          ctx.fillStyle = accent;
          ctx.fillText(col.glyph, x, before * CELL);
        }
        col.glyph = GLYPHS[Math.floor(Math.random() * GLYPHS.length)];
        ctx.fillStyle = head;
        ctx.fillText(col.glyph, x, row * CELL);
        if (row * CELL > height && Math.random() > 0.94) columns[i] = newColumn(true);
      });
    };

    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    // quadro fixo: redesenhado a cada redimensionamento, que limpa o canvas
    const render = () => {
      resize();
      if (reduced) for (let i = 0; i < 26; i++) tick();
    };

    readColors();
    render();

    let raf = 0;
    let last = 0;
    let visible = true;
    const loop = (t: number) => {
      raf = requestAnimationFrame(loop);
      if (!visible || document.hidden || t - last < TICK_MS) return;
      last = t;
      tick();
    };
    if (!reduced) raf = requestAnimationFrame(loop);

    const ro = new ResizeObserver(render);
    ro.observe(canvas);
    const io = new IntersectionObserver(([entry]) => {
      visible = entry.isIntersecting;
    });
    io.observe(canvas);
    const onTheme = () => {
      readColors();
      if (reduced) render();
    };
    window.addEventListener('blog:theme', onTheme);

    return () => {
      cancelAnimationFrame(raf);
      ro.disconnect();
      io.disconnect();
      window.removeEventListener('blog:theme', onTheme);
    };
  }, []);

  return <canvas ref={ref} className="rain" aria-hidden="true" />;
}
