import { useState } from 'react';
import { Link, Navigate, useLocation, useNavigate } from 'react-router-dom';
import { Field, FormMessage, TextArea } from '../../components/Form';
import { formValues } from '../../lib/form';
import { api } from '../../lib/api';
import { useAuth } from '../../lib/auth';
import { useSubmit } from '../../lib/useSubmit';
import { useTitle } from '../../lib/useTitle';
import AccountShell from './AccountShell';

function VerifyNotice() {
  const [sent, setSent] = useState(false);
  const { busy, error, run } = useSubmit();
  if (sent) return <FormMessage kind="ok">Enviamos um novo link. Confira a caixa de entrada e o spam.</FormMessage>;
  return (
    <div className="form-msg form-msg--info account__verify" role="status">
      <span>Confirme seu e-mail para poder comentar. O link chegou quando você criou a conta.</span>
      <button
        type="button"
        className="btn btn--ghost"
        disabled={busy}
        onClick={() =>
          void run(async () => {
            await api.resendVerify();
            setSent(true);
          })
        }
      >
        Reenviar link
      </button>
      {error && <span className="field__error">{error}</span>}
    </div>
  );
}

function ProfileForm() {
  const { user, signIn } = useAuth();
  const { busy, error, fields, run } = useSubmit();
  const [saved, setSaved] = useState(false);
  if (!user) return null;
  return (
    <form
      className="form"
      noValidate
      onSubmit={(e) => {
        e.preventDefault();
        const v = formValues(e.currentTarget);
        setSaved(false);
        void run(async () => {
          const { user } = await api.updateProfile({
            displayName: v.displayName,
            username: v.username,
            bio: v.bio,
            website: v.website,
          });
          signIn(user);
          setSaved(true);
        });
      }}
    >
      {error && <FormMessage kind="error">{error}</FormMessage>}
      {saved && <FormMessage kind="ok">Perfil salvo.</FormMessage>}
      <Field label="Nome" name="displayName" defaultValue={user.displayName} maxLength={50} error={fields.displayName} />
      <Field
        label="Nome de usuário"
        name="username"
        defaultValue={user.username}
        autoCapitalize="none"
        spellCheck={false}
        maxLength={20}
        error={fields.username}
        hint={`Seu perfil público: /u/${user.username}`}
      />
      <TextArea label="Bio" name="bio" defaultValue={user.bio} maxLength={280} rows={3} error={fields.bio} />
      <Field
        label="Site ou GitHub"
        name="website"
        type="url"
        defaultValue={user.website ?? ''}
        placeholder="https://"
        error={fields.website}
      />
      <button className="btn btn--primary" disabled={busy}>
        {busy ? 'Salvando…' : 'Salvar perfil'}
      </button>
    </form>
  );
}

function PasswordForm() {
  const { busy, error, fields, run, setError } = useSubmit();
  const [saved, setSaved] = useState(false);
  return (
    <form
      className="form"
      noValidate
      onSubmit={(e) => {
        e.preventDefault();
        const form = e.currentTarget;
        const v = formValues(form);
        setSaved(false);
        if (v.newPassword !== v.confirm) {
          setError('As duas senhas novas não são iguais.');
          return;
        }
        void run(async () => {
          await api.changePassword(v.currentPassword ?? '', v.newPassword ?? '');
          form.reset();
          setSaved(true);
        });
      }}
    >
      {error && <FormMessage kind="error">{error}</FormMessage>}
      {saved && <FormMessage kind="ok">Senha trocada. As sessões em outros aparelhos foram encerradas.</FormMessage>}
      <Field
        label="Senha atual"
        name="currentPassword"
        type="password"
        autoComplete="current-password"
        error={fields.currentPassword}
      />
      <Field
        label="Nova senha"
        name="newPassword"
        type="password"
        autoComplete="new-password"
        hint="Pelo menos 10 caracteres."
        error={fields.newPassword}
      />
      <Field label="Repita a nova senha" name="confirm" type="password" autoComplete="new-password" />
      <button className="btn btn--ghost" disabled={busy}>
        {busy ? 'Trocando…' : 'Trocar senha'}
      </button>
    </form>
  );
}

function DeleteForm() {
  const { forget } = useAuth();
  const navigate = useNavigate();
  const { busy, error, fields, run } = useSubmit();
  return (
    <form
      className="form"
      noValidate
      onSubmit={(e) => {
        e.preventDefault();
        const password = formValues(e.currentTarget).password ?? '';
        if (!window.confirm('Excluir a conta de vez? Isso não pode ser desfeito.')) return;
        void run(async () => {
          await api.deleteAccount(password);
          forget();
          navigate('/', { replace: true });
        });
      }}
    >
      <p className="field__hint">
        Apaga seu e-mail, nome, perfil e sessões. Os comentários continuam nos artigos, sem autor, como “conta
        removida”. Se quiser que algum suma, apague antes.
      </p>
      {error && <FormMessage kind="error">{error}</FormMessage>}
      <Field label="Confirme com sua senha" name="password" type="password" autoComplete="current-password" error={fields.password} />
      <button className="btn btn--danger" disabled={busy}>
        {busy ? 'Excluindo…' : 'Excluir minha conta'}
      </button>
    </form>
  );
}

export default function MyProfile() {
  useTitle('Meu perfil');
  const { user, status, signOut } = useAuth();
  const navigate = useNavigate();
  const welcome = (useLocation().state as { welcome?: boolean } | null)?.welcome;

  if (status === 'loading') return <AccountShell title="Meu perfil">{null}</AccountShell>;
  if (status === 'offline' && !user) {
    return (
      <AccountShell title="Meu perfil">
        <FormMessage kind="error">As contas estão fora do ar no momento. Tente mais tarde.</FormMessage>
      </AccountShell>
    );
  }
  if (!user) return <Navigate to="/conta/entrar?voltar=/conta/perfil" replace />;

  return (
    <AccountShell title={user.displayName} lede={`@${user.username} · ${user.email}`}>
      {welcome && <FormMessage kind="ok">Conta criada. Bem-vindo(a) ao barbosa.md!</FormMessage>}
      {!user.emailVerified && <VerifyNotice />}

      <section className="account__sec" aria-labelledby="sec-perfil">
        <h2 id="sec-perfil">Perfil</h2>
        <ProfileForm />
      </section>
      <section className="account__sec" aria-labelledby="sec-senha">
        <h2 id="sec-senha">Senha</h2>
        <PasswordForm />
      </section>
      <section className="account__sec" aria-labelledby="sec-sessao">
        <h2 id="sec-sessao">Sessão</h2>
        <p className="account__links">
          <Link to={`/u/${user.username}`}>Ver perfil público</Link>
          <button
            type="button"
            className="linklike"
            onClick={() => void signOut().then(() => navigate('/', { replace: true }))}
          >
            Sair da conta
          </button>
        </p>
      </section>
      <section className="account__sec account__sec--danger" aria-labelledby="sec-excluir">
        <h2 id="sec-excluir">Excluir conta</h2>
        <DeleteForm />
      </section>
    </AccountShell>
  );
}
