import { useEffect } from 'react';
import { HashRouter, Route, Routes, useLocation } from 'react-router-dom';
import Footer from './components/Footer';
import Header from './components/Header';
import ErrorBoundary from './components/ErrorBoundary';
import { CommandPalette } from './components/Search';
import About from './pages/About';
import Archive from './pages/Archive';
import Home from './pages/Home';
import NotFound from './pages/NotFound';
import PostPage from './pages/PostPage';
import { TagPage, Tags } from './pages/Tags';

function ScrollToTop() {
  const { pathname } = useLocation();
  useEffect(() => {
    window.scrollTo({ top: 0 });
  }, [pathname]);
  return null;
}

function Shell() {
  return (
    <>
      <ScrollToTop />
      <Header />
      <main>
        <ErrorBoundary>
          <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/posts/:slug" element={<PostPage />} />
          <Route path="/arquivo" element={<Archive />} />
          <Route path="/tags" element={<Tags />} />
          <Route path="/tags/:slug" element={<TagPage />} />
          <Route path="/sobre" element={<About />} />
          <Route path="*" element={<NotFound />} />
        </Routes>
        </ErrorBoundary>
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
      <Shell />
    </HashRouter>
  );
}
