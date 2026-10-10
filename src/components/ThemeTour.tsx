import { useEffect, useState } from 'react';
import { flushSync } from 'react-dom';
import { INTRO_END, introPending } from '../lib/intro';
import { motionOn } from '../lib/motion';
import { getTheme, showTheme, THEMES } from '../lib/theme';

const SEEN = 'theme-tour';
const HOLD_MS = 320;

function alreadySeen(): boolean {
  try {
    return localStorage.getItem(SEEN) !== null;
  } catch {
    // sem localStorage o passeio voltaria a cada visita: melhor não tocar
    return true;
  }
}

/**
 * Passeio pelos temas: na primeira visita, depois da abertura, cada tema
 * varre a tela uma vez e o passeio termina no tema em que começou.
 * Nada é salvo como escolha; clique ou tecla interrompe.
 */
export default function ThemeTour() {
  const [step, setStep] = useState<number | null>(null);
  // começa no tema seguinte ao atual e dá a volta, terminando no atual
  const [order] = useState(() => {
    const at = Math.max(0, THEMES.findIndex((t) => t.id === getTheme()));
    return THEMES.map((_, i) => THEMES[(at + 1 + i) % THEMES.length]);
  });

  useEffect(() => {
    if (!motionOn() || !document.startViewTransition || alreadySeen()) return;
    const home = order[order.length - 1].id;
    let live = true;
    let timer = 0;
    const wait = (ms: number) => new Promise<void>((done) => (timer = window.setTimeout(done, ms)));
    const show = (id: string, next: number | null) => showTheme(id, () => flushSync(() => setStep(next)), true);

    const stop = () => {
      if (!live) return;
      end();
      void show(home, null);
    };
    const end = () => {
      live = false;
      window.clearTimeout(timer);
      window.removeEventListener(INTRO_END, start);
      window.removeEventListener('keydown', stop);
      window.removeEventListener('pointerdown', stop);
    };

    const run = async () => {
      try {
        localStorage.setItem(SEEN, '1');
      } catch {
        /* localStorage indisponível */
      }
      window.addEventListener('keydown', stop);
      window.addEventListener('pointerdown', stop);
      for (let i = 0; i < order.length && live; i++) {
        await show(order[i].id, i);
        if (live) await wait(HOLD_MS);
      }
      if (!live) return;
      end();
      setStep(null);
    };
    // espera o nome pousar no cabeçalho e a entrada da página terminar
    function start() {
      timer = window.setTimeout(run, 1700);
    }

    if (introPending()) window.addEventListener(INTRO_END, start);
    else start();
    return end;
  }, [order]);

  if (step === null) return null;

  return (
    <p className="tour" aria-hidden="true">
      <span className="tour__mark">❯</span>
      theme {order[step].id}
      <span className="tour__count">
        {step + 1}/{order.length}
      </span>
    </p>
  );
}
