import { useSyncExternalStore } from 'react';
import { motionOn } from './motion';

export const DEFAULT_THEME = 'gruvbox-dark';

export const THEMES = [
  { id: 'gruvbox-dark', label: 'Gruvbox', bg: '#1d2021', fg: '#fe8019' },
  { id: 'obsidianite', label: 'Obsidianite', bg: '#100e17', fg: '#0fb6d6' },
  { id: 'carbono', label: 'Carbono', bg: '#0a0a0b', fg: '#d9bf8c' },
  { id: 'dracula', label: 'Dracula', bg: '#1e1f29', fg: '#bd93f9' },
  { id: 'one-dark', label: 'One Dark', bg: '#16191f', fg: '#61afef' },
  { id: 'nord', label: 'Nord', bg: '#242933', fg: '#88c0d0' },
  { id: 'catppuccin-dark', label: 'Catppuccin', bg: '#181825', fg: '#cba6f7' },
  { id: 'light', label: 'Papel (claro)', bg: '#f5f1e8', fg: '#9c3d24' },
] as const;

const EVENT = 'blog:theme';

export function getTheme(): string {
  return document.documentElement.getAttribute('data-theme') || DEFAULT_THEME;
}

let swaps = 0;

/**
 * Mostra um tema sem salvar a escolha. O tema novo entra varrendo a tela
 * (ver .theme-wipe no CSS); sem suporte a View Transitions, ou com as
 * animações desligadas, troca na hora. `alongside` roda junto com a troca,
 * para o que precisa mudar no mesmo quadro.
 */
export function showTheme(id: string, alongside?: () => void, fast = false): Promise<void> {
  const root = document.documentElement;
  const apply = () => {
    root.setAttribute('data-theme', id);
    alongside?.();
    window.dispatchEvent(new Event(EVENT));
  };
  if (!motionOn() || !document.startViewTransition || id === getTheme()) {
    apply();
    return Promise.resolve();
  }
  const mine = ++swaps;
  root.classList.add('theme-wipe');
  root.classList.toggle('theme-wipe--fast', fast);
  return document
    .startViewTransition(apply)
    .finished.catch(() => {})
    .finally(() => {
      // uma troca mais nova pode ter atropelado esta: quem limpa é a última
      if (mine === swaps) root.classList.remove('theme-wipe', 'theme-wipe--fast');
    });
}

export function setTheme(id: string): void {
  try {
    localStorage.setItem('theme-v2', id);
  } catch {
    /* localStorage indisponível */
  }
  void showTheme(id);
}

function subscribe(onChange: () => void) {
  window.addEventListener(EVENT, onChange);
  return () => window.removeEventListener(EVENT, onChange);
}

/** Tema atual; quem usa re-renderiza quando ele muda, venha de onde vier. */
export function useTheme(): string {
  return useSyncExternalStore(subscribe, getTheme);
}
