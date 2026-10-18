import { useEffect } from 'react';
import { HashRouter, Route, Routes, useLocation, useNavigationType, useParams } from 'react-router-dom';
import Footer from './components/Footer';
import Header from './components/Header';
import Intro from './components/Intro';
import ErrorBoundary from './components/ErrorBoundary';
import { CommandPalette } from './components/Search';
import AuthProvider from './components/AuthProvider';
import About from './pages/About';
import Archive from './pages/Archive';
import Home from './pages/Home';
import NotFound from './pages/NotFound';
import PostPage from './pages/PostPage';
import Privacy from './pages/Privacy';
import Profile from './pages/Profile';
import Confirm from './pages/account/Confirm';
import Forgot from './pages/account/Forgot';
import Login from './pages/account/Login';
import MyProfile from './pages/account/MyProfile';
import Register from './pages/account/Register';
import Reset from './pages/account/Reset';
import { TagPage, Tags } from './pages/Tags';

function ScrollToTop() {
  const { pathname } = useLocation();
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'instant' });
  }, [pathname]);
  return null;
}

/** Perfil remonta ao trocar de usuário: estado novo, sem reset manual. */
function ProfileRoute() {
  const { username = '' } = useParams();
  return <Profile key={username} />;
}

function Shell() {
  const { pathname } = useLocation();
  // voltar no histórico desliza no sentido contrário
  const back = useNavigationType() === 'POP';
  return (
    <>
      <Intro />
      <ScrollToTop />
      <Header />
      <main id="conteudo" tabIndex={-1}>
        {/* a key reinicia o deslize e o ErrorBoundary a cada página */}
        <div key={pathname} className={`page-slide${back ? ' page-slide--back' : ''}`}>
        <ErrorBoundary>
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/posts/:slug" element={<PostPage />} />
            <Route path="/arquivo" element={<Archive />} />
            <Route path="/tags" element={<Tags />} />
            <Route path="/tags/:slug" element={<TagPage />} />
            <Route path="/sobre" element={<About />} />
            <Route path="/conta/entrar" element={<Login />} />
            <Route path="/conta/criar" element={<Register />} />
            <Route path="/conta/esqueci" element={<Forgot />} />
            <Route path="/conta/redefinir" element={<Reset />} />
            <Route path="/conta/confirmar" element={<Confirm />} />
            <Route path="/conta/perfil" element={<MyProfile />} />
            <Route path="/u/:username" element={<ProfileRoute />} />
            <Route path="/privacidade" element={<Privacy />} />
            <Route path="*" element={<NotFound />} />
          </Routes>
        </ErrorBoundary>
        </div>
      </main>
      <Footer />
      <CommandPalette />
    </>
  );
}

// HashRouter: funciona em qualquer hospedagem estática sem rewrite (file://, GitHub Pages, etc).
export default function App() {
  return (
    <HashRouter>
      <AuthProvider>
        <Shell />
      </AuthProvider>
    </HashRouter>
  );
}
