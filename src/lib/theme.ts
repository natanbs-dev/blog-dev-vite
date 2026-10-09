import { useSyncExternalStore } from 'react';

export const DEFAULT_THEME = 'gruvbox-dark';

export const THEMES = [
  { id: 'gruvbox-dark', label: 'Gruvbox', bg: '#1d2021', fg: '#fe8019' },
  { id: 'obsidianite', label: 'Obsidianite', bg: '#100e17', fg: '#0fb6d6' },
  { id: 'carbono', label: 'Carbono', bg: '#0a0a0b', fg: '#d9bf8c' },
  { id: 'dracula', label: 'Dracula', bg: '#1e1f29', fg: '#bd93f9' },
  { id: 'one-dark', label: 'One Dark', bg: '#16191f', fg: '#61afef' },
  { id: 'nord', label: 'Nord', bg: '#242933', fg: '#88c0d0' },
  { id: 'catppuccin-dark', label: 'Catppuccin', bg: '#181825', fg: '#cba6f7' },
  { id: 'light', label: 'Névoa (claro)', bg: '#eef2ee', fg: '#0a6b53' },
] as const;

const EVENT = 'blog:theme';

export function getTheme(): string {
  return document.documentElement.getAttribute('data-theme') || DEFAULT_THEME;
}

export function setTheme(id: string): void {
  document.documentElement.setAttribute('data-theme', id);
  try {
    localStorage.setItem('theme-v2', id);
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
