import { Link } from 'react-router-dom';
import { site } from '../lib/site';

export default function Footer() {
  const year = new Date().getFullYear();
  return (
    <footer className="footer">
      <div className="wrap">
        <p className="footer__word">
          {site.name}
          <span className="footer__cursor">_</span>
        </p>
        <nav className="footer__nav" aria-label="Rodapé">
          <Link to="/">Início</Link>
          <Link to="/arquivo">Artigos</Link>
          <Link to="/tags">Tópicos</Link>
          <Link to="/sobre">Sobre</Link>
          <a href={`mailto:${site.email}`}>Contato</a>
        </nav>
        <p className="footer__colophon">
          © {year} {site.author} · composto em markdown · temas: tinta, papel & gruvbox
        </p>
      </div>
    </footer>
  );
}
