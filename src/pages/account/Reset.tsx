import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { Field, FormMessage } from '../../components/Form';
import { formValues } from '../../lib/form';
import { api } from '../../lib/api';
import { useAuth } from '../../lib/auth';
import { useSubmit } from '../../lib/useSubmit';
import { useTitle } from '../../lib/useTitle';
import AccountShell from './AccountShell';

export default function Reset() {
  useTitle('Nova senha');
  const [params] = useSearchParams();
  const token = params.get('token') ?? '';
  const navigate = useNavigate();
  const { forget } = useAuth();
  const { busy, error, fields, run, setError } = useSubmit();

  if (!token) {
    return (
      <AccountShell title="Link incompleto" lede="Abra o link exatamente como chegou no e-mail.">
        <p className="account__links">
          <Link to="/conta/esqueci">Pedir um link novo</Link>
        </p>
      </AccountShell>
    );
  }

  return (
    <AccountShell title="Criar nova senha" lede="Depois disso, todas as sessões abertas são encerradas.">
      <form
        className="form"
        noValidate
        onSubmit={(e) => {
          e.preventDefault();
          const v = formValues(e.currentTarget);
          if (v.password !== v.confirm) {
            setError('As duas senhas não são iguais.');
            return;
          }
          void run(async () => {
            await api.reset(token, v.password ?? '');
            forget();
            navigate('/conta/entrar?redefinida=1', { replace: true });
          });
        }}
      >
        {error && (
          <FormMessage kind="error">
            {error} {error.includes('expirado') && <Link to="/conta/esqueci">Pedir outro link</Link>}
          </FormMessage>
        )}
        <Field
          label="Nova senha"
          name="password"
          type="password"
          autoComplete="new-password"
          minLength={10}
          required
          hint="Pelo menos 10 caracteres."
          error={fields.password}
        />
        <Field label="Repita a senha" name="confirm" type="password" autoComplete="new-password" required />
        <button className="btn btn--primary" disabled={busy}>
          {busy ? 'Salvando…' : 'Salvar nova senha'}
        </button>
      </form>
    </AccountShell>
  );
}
