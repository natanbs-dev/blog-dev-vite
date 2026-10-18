import { Link } from 'react-router-dom';
import { site } from '../lib/site';
import { useTitle } from '../lib/useTitle';

export default function Privacy() {
  useTitle('Privacidade');
  return (
    <div className="wrap privacy">
      <header className="page-head">
        <h1>Privacidade</h1>
        <p>O que o {site.name} guarda quando você cria uma conta, e como apagar.</p>
      </header>
      <div className="prose privacy__body">
        <h2>Para ler, nada</h2>
        <p>
          Ler os artigos não exige conta e não usa cookies de rastreamento. O tema e a preferência de animações ficam só
          no seu navegador.
        </p>
        <h2>Com conta</h2>
        <p>A conta existe só para comentar. Guardamos:</p>
        <ul>
          <li>e-mail, para confirmar a conta e recuperar a senha;</li>
          <li>nome, nome de usuário, bio e link, que aparecem no seu perfil público;</li>
          <li>a senha, apenas como hash argon2id (nem o autor do blog consegue lê-la);</li>
          <li>os comentários que você escreve;</li>
          <li>a sessão de login: um cookie técnico, necessário para manter você conectado(a) por 30 dias.</li>
        </ul>
        <p>
          Os dados ficam num banco PostgreSQL num servidor do próprio autor. Não são vendidos nem compartilhados. Os
          e-mails de confirmação e de senha saem pelo serviço Brevo, que recebe apenas o seu endereço e o texto da
          mensagem.
        </p>
        <h2>Seus direitos (LGPD)</h2>
        <p>
          Você pode editar seus dados ou excluir a conta a qualquer momento em <Link to="/conta/perfil">Meu perfil</Link>.
          A exclusão apaga e-mail, nome, perfil e sessões na hora; os comentários permanecem sem autor, como “conta
          removida”. Dúvidas: <a href={`mailto:${site.email}`}>{site.email}</a>.
        </p>
      </div>
    </div>
  );
}
