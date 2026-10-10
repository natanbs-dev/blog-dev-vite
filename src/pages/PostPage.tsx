import { useEffect } from 'react';
import { Link, useParams, useSearchParams } from 'react-router-dom';
import Markdown from '../components/Markdown';
import PostRow from '../components/PostRow';
import { BackToTop, ReadingProgress, Toc } from '../components/PostChrome';
import { formatDate, getAllPosts, getPost, getRelatedPosts, tagToSlug } from '../lib/posts';
import { site } from '../lib/site';
import { useTitle } from '../lib/useTitle';
import NotFound from './NotFound';

export default function PostPage() {
  const { slug = '' } = useParams();
  const [params] = useSearchParams();
  const post = getPost(slug);
  useTitle(post?.title);

  // Link direto para um título do artigo: /posts/slug?h=id
  const heading = params.get('h');
  useEffect(() => {
    if (heading) document.getElementById(heading)?.scrollIntoView({ behavior: 'instant', block: 'start' });
    // só na chegada ao artigo; depois quem rola é o useHeadingJump
  }, [slug]);

  if (!post) return <NotFound what="Artigo" />;

  // a lista vai do mais recente para o mais antigo
  const all = getAllPosts();
  const idx = all.findIndex((p) => p.slug === slug);
  const newer = idx > 0 ? all[idx - 1] : null;
  const older = idx < all.length - 1 ? all[idx + 1] : null;
  const related = getRelatedPosts(slug);

  return (
    <>
      <ReadingProgress />
      <article className="wrap article">
        <header className="article__head">
          <p className="page-head__back">
            <Link to="/arquivo">Todos os artigos</Link>
          </p>
          <h1 className="article__title">{post.title}</h1>
          {post.description && <p className="article__standfirst">{post.description}</p>}
          <p className="article__meta">
            <span>{site.author}</span>
            <time dateTime={post.date}>{formatDate(post.date)}</time>
            <span>{post.readingTime} de leitura</span>
          </p>
        </header>

        <div className="article__grid">
          <Toc items={post.toc} />
          <Markdown html={post.html} />
        </div>

        <footer className="article__foot">
          {post.tags.length > 0 && (
            <p className="row__tags">
              {post.tags.map((t) => (
                <Link key={t} to={`/tags/${tagToSlug(t)}`} className="tag">
                  {t}
                </Link>
              ))}
            </p>
          )}

          <nav className="post-nav" aria-label="Outros artigos">
            {older ? (
              <Link to={`/posts/${older.slug}`} className="post-nav__link">
                <span className="post-nav__label">Artigo anterior</span>
                <span className="post-nav__title">{older.title}</span>
              </Link>
            ) : (
              <span />
            )}
            {newer && (
              <Link to={`/posts/${newer.slug}`} className="post-nav__link post-nav__link--next">
                <span className="post-nav__label">Próximo artigo</span>
                <span className="post-nav__title">{newer.title}</span>
              </Link>
            )}
          </nav>
        </footer>
      </article>

      {related.length > 0 && (
        <section className="wrap related" aria-labelledby="relacionados">
          <h2 id="relacionados">Sobre os mesmos tópicos</h2>
          <div className="rows">
            {related.map((p) => (
              <PostRow key={p.slug} post={p} />
            ))}
          </div>
        </section>
      )}
      <BackToTop />
    </>
  );
}
