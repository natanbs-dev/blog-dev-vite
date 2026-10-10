import { useEffect, useRef, useState } from 'react';
import { setTheme, THEMES, useTheme } from '../lib/theme';

export default function ThemePicker() {
  const [open, setOpen] = useState(false);
  const current = useTheme();
  const ref = useRef<HTMLDivElement>(null);
  const active = THEMES.find((t) => t.id === current) ?? THEMES[0];

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
  }, [open]);

  return (
    <div className="themes" ref={ref}>
      <button
        type="button"
        className="icon-btn"
        aria-haspopup="true"
        aria-expanded={open}
        aria-label={`Trocar tema. Atual: ${active.label}`}
        onClick={() => setOpen((v) => !v)}
      >
        <span className="chip" style={{ background: active.bg, color: active.fg }} />
      </button>

      {open && (
        <div className="themes__menu">
          {THEMES.map((t) => (
            <button
              key={t.id}
              type="button"
              className="themes__item"
              aria-pressed={t.id === current}
              onClick={() => {
                setTheme(t.id);
                setOpen(false);
              }}
            >
              <span className="chip" style={{ background: t.bg, color: t.fg }} />
              {t.label}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
