import { Link } from 'react-router-dom';

export default function NotFound() {
  return (
    <div className="container">
      <div className="notfound">
        <div>
          <div className="notfound__code">404</div>
          <h1>Página não encontrada</h1>
          <p>O endereço acessado não existe neste blog.</p>
          <Link to="/" className="btn btn--primary">
            Voltar ao início
          </Link>
        </div>
      </div>
    </div>
  );
}
