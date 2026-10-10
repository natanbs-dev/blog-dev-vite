import { Link, useParams } from 'react-router-dom';
import PostRow from '../components/PostRow';
import { findTagBySlug, getAllTags, getPostsByTag } from '../lib/posts';
import { useTitle } from '../lib/useTitle';

export function Tags() {
  useTitle('Tópicos');
  const tags = getAllTags();
  const max = tags[0]?.count ?? 1;
  return (
    <div className="wrap page">
      <header className="page-head">
        <h1>Tópicos</h1>
        <p>Os {tags.length} assuntos do blog, dos mais escritos para os menos.</p>
      </header>
      <ul className="topics">
        {tags.map((t) => (
          <li key={t.slug}>
            <Link to={`/tags/${t.slug}`} className="topic">
              <span className="topic__name">{t.name}</span>
              <span className="topic__bar" style={{ inlineSize: `${(t.count / max) * 100}%` }} aria-hidden="true" />
              <span className="topic__count">
                {t.count} {t.count === 1 ? 'artigo' : 'artigos'}
              </span>
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}

export function TagPage() {
  const { slug = '' } = useParams();
  const name = findTagBySlug(slug);
  const posts = name ? getPostsByTag(name) : [];
  useTitle(name ? `Tópico: ${name}` : 'Tópico não encontrado');
  return (
    <div className="wrap page">
      <header className="page-head">
        <p className="page-head__back">
          <Link to="/tags">Todos os tópicos</Link>
        </p>
        <h1>{name ?? slug}</h1>
        <p>
          {name
            ? `${posts.length} ${posts.length === 1 ? 'artigo' : 'artigos'} sobre este tópico.`
            : 'Nenhum artigo usa este tópico. Confira a lista completa de tópicos.'}
        </p>
      </header>
      <div className="rows">
        {posts.map((post) => (
          <PostRow key={post.slug} post={post} />
        ))}
      </div>
    </div>
  );
}
