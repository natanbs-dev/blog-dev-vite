import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { Field, FormMessage } from '../../components/Form';
import { formValues } from '../../lib/form';
import { api } from '../../lib/api';
import { safeBack, useAuth } from '../../lib/auth';
import { useSubmit } from '../../lib/useSubmit';
import { useTitle } from '../../lib/useTitle';
import AccountShell from './AccountShell';

export default function Login() {
  useTitle('Entrar');
  const [params] = useSearchParams();
  const back = safeBack(params.get('voltar'));
  const { signIn } = useAuth();
  const navigate = useNavigate();
  const { busy, error, fields, run } = useSubmit();
  const reset = params.get('redefinida') === '1';

  return (
    <AccountShell title="Entrar" lede="Entre para comentar nos artigos.">
      {reset && <FormMessage kind="ok">Senha redefinida. Entre com a nova senha.</FormMessage>}
      <form
        className="form"
        noValidate
        onSubmit={(e) => {
          e.preventDefault();
          const v = formValues(e.currentTarget);
          void run(async () => {
            const { user } = await api.login({ email: v.email ?? '', password: v.password ?? '' });
            signIn(user);
            navigate(back, { replace: true });
          });
        }}
      >
        {error && <FormMessage kind="error">{error}</FormMessage>}
        <Field label="E-mail" name="email" type="email" autoComplete="email" required error={fields.email} />
        <Field
          label="Senha"
          name="password"
          type="password"
          autoComplete="current-password"
          required
          error={fields.password}
        />
        <button className="btn btn--primary" disabled={busy}>
          {busy ? 'Entrando…' : 'Entrar'}
        </button>
      </form>
      <p className="account__links">
        <Link to="/conta/esqueci">Esqueci a senha</Link>
        <Link to={`/conta/criar${back !== '/' ? `?voltar=${encodeURIComponent(back)}` : ''}`}>Criar conta</Link>
      </p>
    </AccountShell>
  );
}
