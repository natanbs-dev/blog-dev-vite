import { createContext, useContext } from 'react';
import type { User } from './api';

/* Quem nunca entrou não gera nenhuma chamada à API ao abrir o blog:
   só consultamos /me se este navegador já fez login antes. */
const HINT = 'conta';
export const hasHint = () => {
  try {
    return localStorage.getItem(HINT) === '1';
  } catch {
    return false;
  }
};
export const setHint = (on: boolean) => {
  try {
    if (on) localStorage.setItem(HINT, '1');
    else localStorage.removeItem(HINT);
  } catch {
    /* localStorage indisponível */
  }
};

export type AuthStatus = 'loading' | 'ready' | 'offline';

export interface Auth {
  user: User | null;
  status: AuthStatus;
  /** Guarda o usuário depois de login, cadastro ou edição de perfil. */
  signIn: (user: User) => void;
  signOut: () => Promise<void>;
  refresh: () => Promise<void>;
  /** Limpa o estado local quando a API diz que a sessão acabou. */
  forget: () => void;
}

export const AuthContext = createContext<Auth | null>(null);

export function useAuth(): Auth {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth fora do AuthProvider');
  return ctx;
}

/** Só aceita caminhos internos em ?voltar=, para não virar redirecionamento aberto. */
export function safeBack(value: string | null, fallback = '/'): string {
  return value && value.startsWith('/') && !value.startsWith('//') ? value : fallback;
}

export const initials = (name: string) =>
  name
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((w) => w[0]!.toUpperCase())
    .join('') || '?';
