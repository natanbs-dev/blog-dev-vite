import { Link, NavLink } from 'react-router-dom';
import { useState } from 'react';
import ThemePicker from './ThemePicker';
import { SearchBox } from './Search';
import { site } from '../lib/site';

const LINKS = [
  { to: '/arquivo', label: 'Artigos' },
  { to: '/tags', label: 'Tópicos' },
  { to: '/sobre', label: 'Sobre' },
];

export default function Header() {
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <header className="topbar">
      <a href="#conteudo" className="skip-link" onClick={(e) => {
        // HashRouter: um href="#id" de verdade trocaria a rota.
        e.preventDefault();
        document.getElementById('conteudo')?.focus();
      }}>
        Pular para o conteúdo
      </a>
      <div className="wrap topbar__inner">
        <Link to="/" className="brand" aria-label={`${site.name}, página inicial`}>
          <span className="brand__mark" aria-hidden="true">❯</span>
          {site.name}
        </Link>

        <nav id="menu" className={`topnav${menuOpen ? ' is-open' : ''}`} aria-label="Navegação principal">
          {LINKS.map((l) => (
            <NavLink key={l.to} to={l.to} className="topnav__link" onClick={() => setMenuOpen(false)}>
              {l.label}
            </NavLink>
          ))}
        </nav>

        <div className="topbar__actions">
          <SearchBox />
          <ThemePicker />
          <button
            type="button"
            className="icon-btn menu-btn"
            aria-label={menuOpen ? 'Fechar menu' : 'Abrir menu'}
            aria-expanded={menuOpen}
            aria-controls="menu"
            onClick={() => setMenuOpen((v) => !v)}
          >
            <svg viewBox="0 0 24 24" aria-hidden="true">
              {menuOpen ? <path d="M6 6l12 12M18 6L6 18" /> : <path d="M4 7h16M4 12h16M4 17h16" />}
            </svg>
          </button>
        </div>
      </div>
    </header>
  );
}
