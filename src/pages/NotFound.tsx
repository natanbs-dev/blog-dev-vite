import { Link, useLocation } from 'react-router-dom';
import { useTitle } from '../lib/useTitle';

export default function NotFound({ what = 'Página' }: { what?: string }) {
  useTitle(`${what} não encontrada`);
  const { pathname } = useLocation();
  return (
    <div className="wrap notfound">
      <p className="notfound__shell">cat: {pathname}: arquivo ou diretório não encontrado</p>
      <h1>Este endereço não existe no blog</h1>
      <p>O link pode estar errado ou o artigo pode ter mudado de nome.</p>
      <p className="notfound__actions">
        <Link to="/arquivo" className="btn btn--primary">
          Ver todos os artigos
        </Link>
        <Link to="/" className="btn btn--ghost">
          Ir para o início
        </Link>
      </p>
    </div>
  );
}
