import { useSyncExternalStore } from 'react';

export const THEMES = [
  { id: 'dark', label: 'Fósforo', bg: '#0d1a1f', fg: '#5ef0b0' },
  { id: 'light', label: 'Névoa', bg: '#eef2ee', fg: '#0a6b53' },
  { id: 'gruvbox-dark', label: 'Gruvbox', bg: '#1d2021', fg: '#fe8019' },
  { id: 'dracula', label: 'Dracula', bg: '#282a36', fg: '#bd93f9' },
  { id: 'one-dark', label: 'One Dark', bg: '#1b1f27', fg: '#61afef' },
  { id: 'nord', label: 'Nord', bg: '#2e3440', fg: '#88c0d0' },
  { id: 'catppuccin-dark', label: 'Catppuccin', bg: '#1e1e2e', fg: '#cba6f7' },
] as const;

const EVENT = 'blog:theme';

export function getTheme(): string {
  return document.documentElement.getAttribute('data-theme') || 'dark';
}

export function setTheme(id: string): void {
  document.documentElement.setAttribute('data-theme', id);
  try {
    localStorage.setItem('theme', id);
  } catch {
    /* localStorage indisponível */
  }
  window.dispatchEvent(new Event(EVENT));
}

function subscribe(onChange: () => void) {
  window.addEventListener(EVENT, onChange);
  return () => window.removeEventListener(EVENT, onChange);
}

/** Tema atual; quem usa re-renderiza quando ele muda, venha de onde vier. */
export function useTheme(): string {
  return useSyncExternalStore(subscribe, getTheme);
}
