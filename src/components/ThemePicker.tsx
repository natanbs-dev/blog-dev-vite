import { useEffect, useRef, useState } from 'react';

const THEMES = [
  { id: 'dark', label: 'Tinta', bg: '#14120f', fg: '#e39a2e' },
  { id: 'light', label: 'Papel', bg: '#f7f3ea', fg: '#b25a1d' },
  { id: 'gruvbox-dark', label: 'Gruvbox', bg: '#1d2021', fg: '#fe8019' },
  { id: 'dracula', label: 'Dracula', bg: '#282a36', fg: '#bd93f9' },
  { id: 'one-dark', label: 'One Dark', bg: '#282c34', fg: '#61afef' },
  { id: 'nord', label: 'Nord', bg: '#2e3440', fg: '#88c0d0' },
  { id: 'catppuccin-dark', label: 'Catppuccin', bg: '#1e1e2e', fg: '#cba6f7' },
];

export default function ThemePicker() {
  const [open, setOpen] = useState(false);
  const [current, setCurrent] = useState('dark');
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setCurrent(document.documentElement.getAttribute('data-theme') || 'dark');
  }, []);

  useEffect(() => {
    if (!open) return;
    const onClick = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setOpen(false);
    };
    document.addEventListener('mousedown', onClick);
    document.addEventListener('keydown', onKey);
    return () => {
      document.removeEventListener('mousedown', onClick);
      document.removeEventListener('keydown', onKey);
    };
  }, [open ]);

  function apply(id: string) {
    document.documentElement.setAttribute('data-theme', id);
    try {
      localStorage.setItem('theme', id);
    } catch {
      /* localStorage indisponível */
    }
    setCurrent(id);
    setOpen(false);
  }

  const core = THEMES.slice(0, 3);

  return (
    <div className="themes" ref={ref}>
      <button
        type="button"
        className="themes__btn"
        aria-haspopup="listbox"
        aria-expanded={open}
        aria-label={`Tema atual: ${current}. Escolher tema`}
        title="Escolher tema"
        onClick={() => setOpen((v) => !v)}
      >
        {core.map((t) => (
          <span
            key={t.id}
            className={`dot${t.id === current ? ' dot--on' : ''}`}
            style={{ background: t.id === current ? t.fg : 'transparent' }}
            title={t.label}
          />
        ))}
      </button>

      {open && (
        <div className="swatches" role="listbox" aria-label="Temas">
          {THEMES.map((t) => (
            <button
              key={t.id}
              type="button"
              role="option"
              aria-selected={t.id === current}
              className={`swatch${t.id === current ? ' is-active' : ''}`}
              onClick={() => apply(t.id)}
              title={t.label}
            >
              <span className="swatch__chip" style={{ background: t.bg, borderColor: t.fg }}>
                <span className="swatch__ink" style={{ background: t.fg }} />
              </span>
              <span className="swatch__name">{t.label}</span>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
