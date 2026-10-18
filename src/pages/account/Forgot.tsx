import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Field, FormMessage } from '../../components/Form';
import { formValues } from '../../lib/form';
import { api } from '../../lib/api';
import { useSubmit } from '../../lib/useSubmit';
import { useTitle } from '../../lib/useTitle';
import AccountShell from './AccountShell';

export default function Forgot() {
  useTitle('Esqueci a senha');
  const { busy, error, fields, run } = useSubmit();
  const [sent, setSent] = useState('');

  return (
    <AccountShell title="Esqueci a senha" lede="Mandamos um link para você criar uma senha nova.">
      {sent ? (
        <FormMessage kind="ok">
          Se existir uma conta com <strong>{sent}</strong>, o link chega em alguns minutos. Confira também o spam. O
          link vale por 30 minutos.
        </FormMessage>
      ) : (
        <form
          className="form"
          noValidate
          onSubmit={(e) => {
            e.preventDefault();
            const email = formValues(e.currentTarget).email ?? '';
            void run(async () => {
              await api.forgot(email);
              setSent(email);
            });
          }}
        >
          {error && <FormMessage kind="error">{error}</FormMessage>}
          <Field label="E-mail da conta" name="email" type="email" autoComplete="email" required error={fields.email} />
          <button className="btn btn--primary" disabled={busy}>
            {busy ? 'Enviando…' : 'Enviar link'}
          </button>
        </form>
      )}
      <p className="account__links">
        <Link to="/conta/entrar">Voltar para entrar</Link>
      </p>
    </AccountShell>
  );
}
