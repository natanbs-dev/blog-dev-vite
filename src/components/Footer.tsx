import { Link } from 'react-router-dom';
import { site } from '../lib/site';

export default function Footer() {
  const year = new Date().getFullYear();
  return (
    <footer className="footer">
      <div className="wrap footer__inner">
        <p className="footer__note">
          © {year} {site.author}. Escrito em markdown, publicado como site estático.
        </p>
        <nav className="footer__nav" aria-label="Rodapé">
          <Link to="/arquivo">Artigos</Link>
          <Link to="/tags">Tópicos</Link>
          <Link to="/sobre">Sobre</Link>
          <a href={`${import.meta.env.BASE_URL}feed.xml`}>RSS</a>
          <a href={site.github} rel="noreferrer">GitHub</a>
          <a href={`mailto:${site.email}`}>E-mail</a>
        </nav>
      </div>
    </footer>
  );
}
