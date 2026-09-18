import { useCallback, useEffect, useMemo, useRef, useState } from 'react';

type Line =
  | { kind: 'cmd'; text: string }
  | { kind: 'out'; text: string; accent?: boolean }
  | { kind: 'fastfetch' }
  | { kind: 'uptime-live' };

const MATRIX_CHARS = 'アイカサタナハマヤラワ0123456789ABCDEF$#*+=<>ﾊﾐﾋｰｳｼﾅﾓﾆｻﾜﾂｵﾘｱﾎﾃﾏｹﾒｴｶｷﾑﾕﾙｾﾈﾙﾀﾇﾇﾎ'.split('');

const ASCII_LOGO = [
  '       ██████╗ ██╗      ██████╗  ██████╗ ',
  '       ██╔══██╗██║     ██╔═══██╗██╔════╝ ',
  '       ██████╔╝██║     ██║   ██║██║  ███╗',
  '       ██╔══██╗██║     ██║   ██║██║   ██║',
  '       ██████╔╝███████╗╚██████╔╝╚██████╔╝',
  '       ╚═════╝ ╚══════╝ ╚═════╝  ╚═════╝ ',
  '            ❯_ blog-dev',
];

function pad(n: number) {
  return String(n).padStart(2, '0');
}

function formatUptime(ms: number) {
  const s = Math.floor(ms / 1000);
  const d = Math.floor(s / 86400);
  const h = Math.floor((s % 86400) / 3600);
  const m = Math.floor((s % 3600) / 60);
  const sec = s % 60;
  if (d > 0) return `up ${d} day${d > 1 ? 's' : ''}, ${pad(h)}:${pad(m)}:${pad(sec)}`;
  return `up ${pad(h)}:${pad(m)}:${pad(sec)}`;
}

function useNow(intervalMs = 1000) {
  const [now, setNow] = useState(() => Date.now());
  useEffect(() => {
    const id = window.setInterval(() => setNow(Date.now()), intervalMs);
    return () => window.clearInterval(id);
  }, [intervalMs]);
  return now;
}

export default function Terminal({
  postsCount = 0,
  words = 0,
  tags = 0,
}: {
  postsCount?: number;
  words?: number;
  tags?: number;
}) {
  const bootTime = useRef(Date.now());
  const now = useNow(1000);
  const uptime = useMemo(() => formatUptime(now - bootTime.current), [now]);

  const [matrixOn, setMatrixOn] = useState(true);
  const [booted, setBooted] = useState(false);
  const [history, setHistory] = useState<Line[]>([]);
  const [input, setInput] = useState('');
  const [cmdHistory, setCmdHistory] = useState<string[]>([]);
  const [histIdx, setHistIdx] = useState(-1);

  const canvasRef = useRef<HTMLCanvasElement>(null);
  const bodyRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const theme =
    typeof document === 'undefined'
      ? 'dark'
      : document.documentElement.getAttribute('data-theme') ?? 'dark';

  // ---------- sequencia de boot: fastfetch + uptime ----------
  useEffect(() => {
    const seq: Line[] = [{ kind: 'cmd', text: 'fastfetch' }, { kind: 'fastfetch' }];
    let i = 0;
    setHistory([]);
    setBooted(false);
    const reduced = window.matchMedia?.('(prefers-reduced-motion: reduce)').matches;
    if (reduced) {
      setHistory([...seq, { kind: 'cmd', text: 'uptime -p' }, { kind: 'uptime-live' }]);
      setBooted(true);
      return;
    }
    const id = window.setInterval(() => {
      i += 1;
      setHistory(seq.slice(0, i));
      if (i >= seq.length) {
        window.clearInterval(id);
        window.setTimeout(() => {
          setHistory((h) => [...h, { kind: 'cmd', text: 'uptime -p' }, { kind: 'uptime-live' }]);
          setBooted(true);
        }, 550);
      }
    }, 420);
    return () => window.clearInterval(id);
  }, []);

  // ---------- autoscroll ----------
  useEffect(() => {
    const el = bodyRef.current;
    if (el) el.scrollTop = el.scrollHeight;
  }, [history, booted]);

  // ---------- cmatrix no background ----------
  useEffect(() => {
    if (!matrixOn) return;
    if (window.matchMedia?.('(prefers-reduced-motion: reduce)').matches) return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let raf = 0;
    let cols = 0;
    let drops: number[] = [];
    const fontSize = 13;

    const resize = () => {
      const parent = canvas.parentElement;
      if (!parent) return;
      const rect = parent.getBoundingClientRect();
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      canvas.width = Math.max(1, Math.floor(rect.width * dpr));
      canvas.height = Math.max(1, Math.floor(rect.height * dpr));
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      cols = Math.floor(rect.width / fontSize);
      drops = Array.from({ length: cols }, () => Math.random() * -40);
    };
    resize();
    const ro = new ResizeObserver(resize);
    if (canvas.parentElement) ro.observe(canvas.parentElement);

    const accent = () =>
      getComputedStyle(document.documentElement).getPropertyValue('--accent').trim() || '#e09a2b';

    let last = 0;
    const draw = (t: number) => {
      raf = requestAnimationFrame(draw);
      if (t - last < 66) return;
      last = t;
      const w = canvas.width;
      const h = canvas.height;
      // fade — deixa rastro
      ctx.fillStyle = 'rgba(0, 0, 0, 0.14)';
      const cssW = canvas.parentElement?.getBoundingClientRect().width ?? 400;
      const cssH = canvas.parentElement?.getBoundingClientRect().height ?? 300;
      ctx.fillRect(0, 0, cssW, cssH);
      ctx.font = `${fontSize}px ui-monospace, Menlo, Consolas, monospace`;
      const color = accent();
      ctx.fillStyle = color;
      ctx.globalAlpha = 0.5;
      for (let c = 0; c < cols; c++) {
        const ch = MATRIX_CHARS[Math.floor(Math.random() * MATRIX_CHARS.length)];
        const x = c * fontSize;
        const y = drops[c] * fontSize;
        // cabeça brilhante
        if (Math.random() > 0.975) {
          ctx.globalAlpha = 0.9;
          ctx.fillStyle = '#ffffff';
          ctx.fillText(ch, x, y);
          ctx.fillStyle = color;
          ctx.globalAlpha = 0.5;
        } else {
          ctx.fillText(ch, x, y);
        }
        if (y > cssH && Math.random() > 0.976) drops[c] = 0;
        drops[c]++;
      }
      ctx.globalAlpha = 1;
      void w;
      void h;
    };
    raf = requestAnimationFrame(draw);
    return () => {
      cancelAnimationFrame(raf);
      ro.disconnect();
    };
  }, [matrixOn]);

  const runCommand = useCallback(
    (raw: string) => {
      const cmd = raw.trim();
      const base: Line[] = cmd ? [{ kind: 'cmd', text: cmd }] : [];
      if (!cmd) {
        setHistory((h) => [...h, ...base]);
        return;
      }
      const [bin, ...args] = cmd.split(/\s+/);
      const push = (lines: Line[]) => setHistory((h) => [...h, ...base, ...lines]);

      switch (bin.toLowerCase()) {
        case 'fastfetch':
        case 'neofetch':
          push([{ kind: 'fastfetch' }]);
          break;
        case 'uptime':
          push([{ kind: 'uptime-live' }]);
          break;
        case 'whoami':
          push([{ kind: 'out', text: 'visitor — leitor do blog-dev' }]);
          break;
        case 'ls':
          push([{ kind: 'out', text: 'arquivo/  tags/  sobre/  buscar/' }]);
          break;
        case 'help':
        case 'ajuda':
          push([
            { kind: 'out', text: 'comandos: fastfetch · uptime · whoami · ls · theme · matrix · clear · help', accent: true },
          ]);
          break;
        case 'theme':
          push([{ kind: 'out', text: `theme: ${theme} (troque no seletor do topo ☾)` }]);
          break;
        case 'matrix':
          if (args[0] === 'off') {
            setMatrixOn(false);
            push([{ kind: 'out', text: 'cmatrix desativado.' }]);
          } else if (args[0] === 'on') {
            setMatrixOn(true);
            push([{ kind: 'out', text: 'cmatrix ativado. welcome to the grid.' }]);
          } else {
            setMatrixOn((v) => !v);
            push([{ kind: 'out', text: matrixOn ? 'cmatrix desativado.' : 'cmatrix ativado.' }]);
          }
          break;
        case 'clear':
        case 'limpar':
          setHistory([]);
          break;
        case 'sudo':
          push([{ kind: 'out', text: 'visitor is not in the sudoers file. this incident will be reported. 😏' }]);
          break;
        default:
          push([{ kind: 'out', text: `command not found: ${bin} — tente "help"` }]);
      }
    },
    [matrixOn, theme],
  );

  const onSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    runCommand(input);
    if (input.trim()) {
      setCmdHistory((h) => [input, ...h].slice(0, 50));
      setHistIdx(-1);
    }
    setInput('');
    inputRef.current?.focus();
  };

  const onKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'ArrowUp') {
      e.preventDefault();
      const next = Math.min(histIdx + 1, cmdHistory.length - 1);
      if (cmdHistory[next]) {
        setHistIdx(next);
        setInput(cmdHistory[next]);
      }
    } else if (e.key === 'ArrowDown') {
      e.preventDefault();
      const next = histIdx - 1;
      if (next < 0) {
        setHistIdx(-1);
        setInput('');
      } else {
        setHistIdx(next);
        setInput(cmdHistory[next]);
      }
    } else if (e.key === 'l' && e.ctrlKey) {
      e.preventDefault();
      setHistory([]);
    }
  };

  const focusInput = () => inputRef.current?.focus();

  return (
    <div className="term" role="region" aria-label="Terminal do blog — fastfetch, cmatrix e uptime">
      <div className="term__bar">
        <span className="term__dots" aria-hidden="true">
          <i />
          <i />
          <i />
        </span>
        <span className="term__title">visitor@blog-dev: ~</span>
        <span className="term__badges">
          <span className={`term__pulse${matrixOn ? ' is-on' : ''}`} title="cmatrix">
            <span className="term__pulse-dot" />
            matrix
          </span>
          <button
            type="button"
            className="term__toggle"
            onClick={() => setMatrixOn((v) => !v)}
            aria-pressed={matrixOn}
            title=" alternar cmatrix"
          >
            {matrixOn ? '◉' : '○'}
          </button>
        </span>
      </div>

      <div className="term__screen" onClick={focusInput}>
        {matrixOn && <canvas ref={canvasRef} className="term__matrix" aria-hidden="true" />}
        <div className="term__veil" aria-hidden="true" />
        <div ref={bodyRef} className="term__body">
          <p className="term__bootline">
            <span className="term__ok">●</span> blog-dev shell v1.0 — cmatrix <em>on</em> · fastfetch · uptime
          </p>

          {history.map((line, i) => {
            if (line.kind === 'cmd') {
              return (
                <div key={i} className="term__line">
                  <span className="term__ps1">visitor@blog-dev</span>
                  <span className="term__sep">:</span>
                  <span className="term__path">~</span>
                  <span className="term__sep">$</span>
                  <span className="term__cmd">{line.text}</span>
                </div>
              );
            }
            if (line.kind === 'fastfetch') {
              return (
                <div key={i} className="term__fetch">
                  <pre className="term__ascii" aria-hidden="true">
                    {ASCII_LOGO.join('\n')}
                  </pre>
                  <dl className="term__specs">
                    <div><dt>os</dt><dd>blog-devOS 1.0 x86_64</dd></div>
                    <div><dt>kernel</dt><dd>6.9.0-vite</dd></div>
                    <div><dt>uptime</dt><dd className="term__live">{uptime}</dd></div>
                    <div><dt>shell</dt><dd>blog-sh (interactive)</dd></div>
                    <div><dt>theme</dt><dd>{theme}</dd></div>
                    <div><dt>posts</dt><dd>{postsCount} · {words.toLocaleString('pt-BR')} palavras · {tags} tópicos</dd></div>
                    <div><dt>de</dt><dd>react + vite + markdown</dd></div>
                    <div className="term__palette" aria-hidden="true">
                      <i style={{ background: 'var(--accent)' }} />
                      <i style={{ background: '#7ab87a' }} />
                      <i style={{ background: '#61afef' }} />
                      <i style={{ background: '#c678dd' }} />
                      <i style={{ background: '#e0655a' }} />
                      <i style={{ background: 'var(--ink-2)' }} />
                    </div>
                  </dl>
                </div>
              );
            }
            if (line.kind === 'uptime-live') {
              return (
                <div key={i} className="term__line term__uptime">
                  <span className="term__dim">{new Date().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit', second: '2-digit' })}</span>
                  {'  '}
                  <span>up {uptime}</span>
                  {'  '}
                  <span className="term__dim">load 0.42 0.31 0.27 · shell live ●</span>
                </div>
              );
            }
            return (
              <div key={i} className={`term__line${line.accent ? ' term__accent-line' : ''}`}>
                {line.text}
              </div>
            );
          })}

          {booted && (
            <form className="term__line term__prompt" onSubmit={onSubmit}>
              <span className="term__ps1">visitor@blog-dev</span>
              <span className="term__sep">:</span>
              <span className="term__path">~</span>
              <span className="term__sep">$</span>
              <input
                ref={inputRef}
                className="term__input"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={onKeyDown}
                aria-label="Digite um comando: help, fastfetch, uptime…"
                placeholder="digite “help”…"
                autoComplete="off"
                autoCapitalize="off"
                spellCheck={false}
              />
              <span className="term__caret" aria-hidden="true" />
            </form>
          )}
        </div>
      </div>

      <div className="term__foot">
        <span>⌨ interativo — help · fastfetch · uptime · matrix</span>
        <span className="term__clock" title="uptime da sessão">{uptime}</span>
      </div>
    </div>
  );
}
