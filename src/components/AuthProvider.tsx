import { useCallback, useEffect, useMemo, useState, type ReactNode } from 'react';
import { ApiError, api, type User } from '../lib/api';
import { AuthContext, hasHint, setHint, type AuthStatus } from '../lib/auth';

export default function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [status, setStatus] = useState<AuthStatus>(hasHint() ? 'loading' : 'ready');

  const forget = useCallback(() => {
    setHint(false);
    setUser(null);
  }, []);

  const refresh = useCallback(async () => {
    try {
      const { user } = await api.me();
      setHint(true);
      setUser(user);
      setStatus('ready');
    } catch (err) {
      if (err instanceof ApiError && err.status === 401) {
        forget();
        setStatus('ready');
      } else {
        setStatus('offline');
      }
    }
  }, [forget]);

  // só quem já entrou neste navegador consulta /me ao abrir o site
  useEffect(() => {
    if (!hasHint()) return;
    let alive = true;
    api
      .me()
      .then(({ user }) => alive && (setUser(user), setStatus('ready')))
      .catch((err: unknown) => {
        if (!alive) return;
        if (err instanceof ApiError && err.status === 401) {
          setHint(false);
          setStatus('ready');
        } else setStatus('offline');
      });
    return () => {
      alive = false;
    };
  }, []);

  const signIn = useCallback((u: User) => {
    setHint(true);
    setUser(u);
    setStatus('ready');
  }, []);

  const signOut = useCallback(async () => {
    await api.logout().catch(() => {});
    forget();
  }, [forget]);

  const value = useMemo(
    () => ({ user, status, signIn, signOut, refresh, forget }),
    [user, status, signIn, signOut, refresh, forget],
  );
  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
