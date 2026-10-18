import { useEffect, useRef, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { FormMessage } from '../../components/Form';
import { ApiError, api } from '../../lib/api';
import { useAuth } from '../../lib/auth';
import { useTitle } from '../../lib/useTitle';
import AccountShell from './AccountShell';

export default function Confirm() {
  useTitle('Confirmar e-mail');
  const [params] = useSearchParams();
  const token = params.get('token') ?? '';
  const { user, refresh } = useAuth();
  const [state, setState] = useState<'working' | 'ok' | 'error'>(token ? 'working' : 'error');
  const [message, setMessage] = useState('Link incompleto. Abra o link exatamente como chegou no e-mail.');
  const once = useRef(false);

  useEffect(() => {
    // o token é de uso único: o StrictMode do React não pode mandar duas vezes
    if (!token || once.current) return;
    once.current = true;
    api
      .verify(token)
      .then(() => {
        setState('ok');
        void refresh();
      })
      .catch((err: unknown) => {
        setState('error');
        setMessage(err instanceof ApiError ? err.message : 'Não foi possível confirmar agora.');
      });
  }, [token, refresh]);

  return (
    <AccountShell title="Confirmar e-mail">
      {state === 'working' && <FormMessage kind="info">Confirmando…</FormMessage>}
      {state === 'ok' && (
        <>
          <FormMessage kind="ok">E-mail confirmado. Agora você já pode comentar.</FormMessage>
          <p className="account__links">
            <Link to="/arquivo">Ver os artigos</Link>
            {user ? <Link to="/conta/perfil">Meu perfil</Link> : <Link to="/conta/entrar">Entrar</Link>}
          </p>
        </>
      )}
      {state === 'error' && (
        <>
          <FormMessage kind="error">{message}</FormMessage>
          <p className="account__links">
            {user ? <Link to="/conta/perfil">Reenviar pelo perfil</Link> : <Link to="/conta/entrar">Entrar</Link>}
          </p>
        </>
      )}
    </AccountShell>
  );
}
