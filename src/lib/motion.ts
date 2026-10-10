import { useSyncExternalStore } from 'react';

/**
 * Animações do site. Sem escolha salva, segue o sistema ("reduzir movimento"
 * desliga); a escolha feita no rodapé ou no terminal vale mais que o sistema.
 * O valor fica em <html data-motion>, aplicado antes da primeira pintura
 * pelo script do index.html.
 */
const EVENT = 'blog:motion';

export function motionOn(): boolean {
  return document.documentElement.getAttribute('data-motion') !== 'off';
}

export function setMotion(on: boolean): void {
  document.documentElement.setAttribute('data-motion', on ? 'on' : 'off');
  try {
    localStorage.setItem('motion', on ? 'on' : 'off');
  } catch {
    /* localStorage indisponível */
  }
  window.dispatchEvent(new Event(EVENT));
}

function subscribe(onChange: () => void) {
  window.addEventListener(EVENT, onChange);
  return () => window.removeEventListener(EVENT, onChange);
}

export function useMotion(): boolean {
  return useSyncExternalStore(subscribe, motionOn);
}
