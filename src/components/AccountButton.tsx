import { Link, useLocation } from 'react-router-dom';
import { initials, useAuth } from '../lib/auth';

/** No topo: ícone para entrar, ou as iniciais de quem está logado (leva ao perfil). */
export default function AccountButton() {
  const { user } = useAuth();
  const { pathname } = useLocation();

  if (user) {
    return (
      <Link to="/conta/perfil" className="icon-btn account-btn" aria-label={`Meu perfil (${user.displayName})`}>
        <span className="avatar avatar--sm" aria-hidden="true">
          {initials(user.displayName)}
        </span>
      </Link>
    );
  }
  const back = pathname.startsWith('/conta') ? '' : `?voltar=${encodeURIComponent(pathname)}`;
  return (
    <Link to={`/conta/entrar${back}`} className="icon-btn account-btn" aria-label="Entrar ou criar conta">
      <svg viewBox="0 0 24 24" aria-hidden="true">
        <circle cx="12" cy="8.5" r="3.5" />
        <path d="M5 19.5c1.2-3.3 3.9-5 7-5s5.8 1.7 7 5" />
      </svg>
    </Link>
  );
}
