import { Link } from 'react-router-dom';
import Masthead from '../components/Hero';
import PostRow from '../components/PostCard';
import Reveal from '../components/Reveal';
import { formatDate, getAllPosts, getAllTags, tagToSlug } from '../lib/posts';

export default function Home() {
  const posts = getAllPosts();
  const tags = getAllTags();
  const words = posts.reduce((acc, p) => acc + p.words, 0);
  const [featured, ...rest] = posts;
  const latest = posts.length > 1 ? posts[1].date : posts[0]?.date;

  return (
    <>
      <Masthead
        postsCount={posts.length}
        words={words}
        tags={tags.length}
        updated={latest ? formatDate(latest, 'medium') : '—'}
      />

      <div className="wrap layout">
        <div>
          {featured && (
            <Reveal>
              <article className="feature">
                <p className="feature__kicker">✎ destaque do caderno</p>
                <h2 className="feature__title">
                  <Link to={`/posts/${featured.slug}`}>{featured.title}</Link>
                </h2>
                <p className="feature__excerpt">{featured.description}</p>
                <div className="feature__meta">
                  <span>{formatDate(featured.date)}</span>
                  <span>·</span>
                  <span>{featured.readingTime} de leitura</span>
                  <span>·</span>
                  {featured.tags.slice(0, 2).map((t) => (
                    <Link key={t} to={`/tags/${tagToSlug(t)}`} className="stamp stamp--sm">
                      {t}
                    </Link>
                  ))}
                </div>
              </article>
            </Reveal>
          )}

          <h2 className="section-label">
            Índice de notas <Link to="/arquivo">ver tudo →</Link>
          </h2>
          <div className="rows">
            {rest.length === 0 && !featured ? (
              <p style={{ color: 'var(--muted)' }}>Caderno vazio. Em breve, novas notas por aqui.</p>
            ) : (
              rest.map((post, i) => <PostRow key={post.slug} post={post} index={i} />)
            )}
          </div>
        </div>

        <aside className="side">
          <Reveal delay={80}>
            <section className="side-box">
              <h2 className="side-box__title">Tópicos</h2>
              {tags.slice(0, 6).map((t) => (
                <Link key={t.slug} to={`/tags/${t.slug}`} className="topic">
                  <span className="topic__name">{t.name}</span>
                  <span className="topic__count">({t.count})</span>
                </Link>
              ))}
            </section>
          </Reveal>
          <Reveal delay={140}>
            <section className="side-box">
              <h2 className="side-box__title">Publicar</h2>
              <p>
                Nova nota publicada — o caderno indexa sozinho. Busca em <code>ctrl k</code>,
                cópia em cada bloco de código.
              </p>
              <Link to="/sobre" className="btn btn--ghost">
                Como funciona
              </Link>
            </section>
          </Reveal>
        </aside>
      </div>
    </>
  );
}
