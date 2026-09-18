import { Link, NavLink } from 'react-router-dom';
import { useState } from 'react';
import ThemePicker from './ThemePicker';
import { SearchBox } from './Search';
import { site } from '../lib/site';

export default function Header() {
  const [menuOpen, setMenuOpen] = useState(false);
  const linkClass = ({ isActive }: { isActive: boolean }) =>
    `topnav__link${isActive ? ' is-active' : ''}`;

  return (
    <header className="topbar">
      <div className="wrap topbar__inner">
        <Link to="/" className="brand" aria-label={`${site.name} — início`}>
          <span className="brand__mark">❯_</span>
          <span className="brand__name">{site.name}</span>
        </Link>

        <nav className={`topnav${menuOpen ? ' is-open' : ''}`} aria-label="Navegação principal">
          <NavLink to="/" end className={linkClass} onClick={() => setMenuOpen(false)}>
            Início
          </NavLink>
          <NavLink to="/arquivo" className={linkClass} onClick={() => setMenuOpen(false)}>
            Artigos
          </NavLink>
          <NavLink to="/tags" className={linkClass} onClick={() => setMenuOpen(false)}>
            Tópicos
          </NavLink>
          <NavLink to="/sobre" className={linkClass} onClick={() => setMenuOpen(false)}>
            Sobre
          </NavLink>
        </nav>

        <div className="topbar__actions">
          <SearchBox />
          <ThemePicker />
          <button
            type="button"
            className="menu-btn"
            aria-label="Abrir menu"
            aria-expanded={menuOpen}
            onClick={() => setMenuOpen((v) => !v)}
          >
            {menuOpen ? '✕' : '☰'}
          </button>
        </div>
      </div>
    </header>
  );
}
