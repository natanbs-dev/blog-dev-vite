import { useState } from 'react';
import { Link } from 'react-router-dom';
import Hero from '../components/Hero';
import PostRow from '../components/PostRow';
import { formatDate, getAllPosts, getAllTags, getFeaturedPost, getPostsByTag } from '../lib/posts';
import { useTitle } from '../lib/useTitle';

const FILTERS = 8;

export default function Home() {
  useTitle();
  const posts = getAllPosts();
  const tags = getAllTags().slice(0, FILTERS);
  const [filter, setFilter] = useState<string | null>(null);

  // Destaque: o artigo com `featured: true`; sem nenhum marcado, o mais recente.
  const featured = getFeaturedPost() ?? posts[0];
  const list = filter ? getPostsByTag(filter) : posts.filter((p) => p !== featured);

  return (
    <>
      <Hero latest={posts[0]} total={posts.length} />

      <div className="wrap home">
        {featured && (
          <section className="feature" aria-labelledby="destaque">
            <h2 id="destaque" className="feature__label">
              Em destaque
            </h2>
            <div>
              <h3 className="feature__title">
                <Link to={`/posts/${featured.slug}`}>{featured.title}</Link>
              </h3>
              <p className="feature__excerpt">{featured.description}</p>
              <p className="feature__meta">
                <time dateTime={featured.date}>{formatDate(featured.date)}</time>
                <span>{featured.readingTime} de leitura</span>
              </p>
            </div>
          </section>
        )}

        <section aria-labelledby="artigos">
          <div className="list-head">
            <h2 id="artigos">Artigos</h2>
            <div className="filters" role="group" aria-label="Filtrar por tópico">
              <button type="button" aria-pressed={filter === null} onClick={() => setFilter(null)}>
                todos
              </button>
              {tags.map((t) => (
                <button
                  key={t.slug}
                  type="button"
                  aria-pressed={filter === t.name}
                  onClick={() => setFilter(filter === t.name ? null : t.name)}
                >
                  {t.name}
                </button>
              ))}
              <Link to="/tags">todos os tópicos</Link>
            </div>
          </div>

          {list.length === 0 ? (
            <p className="empty">Ainda não há artigos publicados.</p>
          ) : (
            <div className="rows">
              {list.map((post) => (
                <PostRow key={post.slug} post={post} />
              ))}
            </div>
          )}
        </section>
      </div>
    </>
  );
}
