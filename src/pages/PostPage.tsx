import { useEffect, useMemo } from 'react';
import { Link, useParams } from 'react-router-dom';
import Markdown from '../components/Markdown';
import { BackToTop, ReadingProgress, Toc } from '../components/PostChrome';
import { getAllPosts, getPost } from '../lib/posts';
import { tagToSlug } from '../lib/posts';
import { site } from '../lib/site';

export default function PostPage() {
  const { slug = '' } = useParams();

  useEffect(() => {
    window.scrollTo({ top: 0 });
  }, [slug]);

  const post = useMemo(() => getPost(slug), [slug]);
  const all = getAllPosts();
  const idx = all.findIndex((p) => p.slug === slug);
  const prev = idx > 0 ? all[idx - 1] : null;
  const next = idx >= 0 && idx < all.length - 1 ? all[idx + 1] : null;

  if (!post) {
    return (
      <div className="wrap">
        <div className="notfound">
          <div>
            <div className="notfound__code">404</div>
            <h1>Nota não encontrada</h1>
            <p>O verbete “{slug}” não existe em content/posts/.</p>
            <Link to="/" className="btn btn--primary">
              Voltar ao índice
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <>
      <ReadingProgress />
      <div className="wrap">
        <div className="article-head">
          <Link to="/" className="back-link">
            ← índice
          </Link>
          <p className="kicker">❯_ nota nº {String(all.length - idx).padStart(2, '0')}</p>
          <h1 className="article__title">{post.title}</h1>
          {post.description && <p className="article__standfirst">{post.description}</p>}
          <div className="byline">
            <span className="avatar" aria-hidden>
              {site.author.slice(0, 2)}
            </span>
            <div>
              <div className="byline__who">{site.author}</div>
              <div className="byline__role">caderno de engenharia</div>
            </div>
            <div className="byline__meta">
              {new Intl.DateTimeFormat('pt-BR', { dateStyle: 'medium', timeZone: 'UTC' }).format(
                new Date(post.date.includes('T') ? post.date : `${post.date}T12:00:00Z`),
              )}
              <br />
              {post.readingTime} de leitura
            </div>
          </div>
        </div>

        <div className="article-grid">
          <Markdown html={post.html} />
          <Toc items={post.toc} />
        </div>

        <div className="post-footer">
          {post.tags.length > 0 && (
            <div className="post-tags">
              {post.tags.map((t) => (
                <Link key={t} to={`/tags/${tagToSlug(t)}`} className="stamp">
                  {t}
                </Link>
              ))}
            </div>
          )}
          <div className="post-nav">
            {prev ? (
              <Link to={`/posts/${prev.slug}`} className="post-nav__link">
                <span className="post-nav__label">← anterior</span>
                <span className="post-nav__title">{prev.title}</span>
              </Link>
            ) : (
              <span />
            )}
            {next && (
              <Link to={`/posts/${next.slug}`} className="post-nav__link post-nav__link--next">
                <span className="post-nav__label">seguinte →</span>
                <span className="post-nav__title">{next.title}</span>
              </Link>
            )}
          </div>
        </div>
      </div>
      <BackToTop />
    </>
  );
}
