import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { Field, FormMessage } from '../../components/Form';
import { formValues } from '../../lib/form';
import { api } from '../../lib/api';
import { safeBack, useAuth } from '../../lib/auth';
import { useSubmit } from '../../lib/useSubmit';
import { useTitle } from '../../lib/useTitle';
import AccountShell from './AccountShell';

export default function Register() {
  useTitle('Criar conta');
  const [params] = useSearchParams();
  const back = safeBack(params.get('voltar'), '/conta/perfil');
  const { signIn } = useAuth();
  const navigate = useNavigate();
  const { busy, error, fields, run } = useSubmit();

  return (
    <AccountShell title="Criar conta" lede="A conta serve só para comentar. Ler o blog continua livre.">
      <form
        className="form"
        noValidate
        onSubmit={(e) => {
          e.preventDefault();
          const v = formValues(e.currentTarget);
          void run(async () => {
            const { user } = await api.register({
              displayName: v.displayName ?? '',
              username: v.username ?? '',
              email: v.email ?? '',
              password: v.password ?? '',
            });
            signIn(user);
            navigate(back, { replace: true, state: { welcome: true } });
          });
        }}
      >
        {error && <FormMessage kind="error">{error}</FormMessage>}
        <Field label="Nome" name="displayName" autoComplete="name" maxLength={50} required error={fields.displayName} />
        <Field
          label="Nome de usuário"
          name="username"
          autoComplete="username"
          autoCapitalize="none"
          spellCheck={false}
          maxLength={20}
          required
          hint="3 a 20 caracteres: letras minúsculas, números e _. Aparece no seu perfil público."
          error={fields.username}
        />
        <Field label="E-mail" name="email" type="email" autoComplete="email" required error={fields.email} />
        <Field
          label="Senha"
          name="password"
          type="password"
          autoComplete="new-password"
          minLength={10}
          required
          hint="Pelo menos 10 caracteres."
          error={fields.password}
        />
        <button className="btn btn--primary" disabled={busy}>
          {busy ? 'Criando…' : 'Criar conta'}
        </button>
        <p className="field__hint">
          Ao criar a conta você concorda com a <Link to="/privacidade">política de privacidade</Link>.
        </p>
      </form>
      <p className="account__links">
        <Link to="/conta/entrar">Já tenho conta</Link>
      </p>
    </AccountShell>
  );
}
