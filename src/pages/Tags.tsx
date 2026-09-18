import { Link, useParams } from 'react-router-dom';
import PostRow from '../components/PostCard';
import { findTagBySlug, getAllTags, getPostsByTag } from '../lib/posts';

export function Tags() {
  const tags = getAllTags();
  return (
    <div className="wrap" style={{ paddingBottom: 88 }}>
      <div className="page-head">
        <p className="kicker">❯_ tópicos</p>
        <h1>Assuntos do caderno</h1>
        <p>Cada carimbo agrupa as notas por tema. Escolha um para folhear.</p>
      </div>
      <div className="tag-grid">
        {tags.map((t) => (
          <Link key={t.slug} to={`/tags/${t.slug}`} className="tag-card">
            <span className="tag-card__name">{t.name}</span>
            <span className="tag-card__count">
              {t.count} {t.count === 1 ? 'nota' : 'notas'}
            </span>
            <span className="tag-card__arrow">→</span>
          </Link>
        ))}
      </div>
    </div>
  );
}

export function TagPage() {
  const { slug = '' } = useParams();
  const name = findTagBySlug(slug);
  const posts = name ? getPostsByTag(name) : [];
  return (
    <div className="wrap" style={{ paddingBottom: 88 }}>
      <div className="page-head">
        <p className="kicker">❯_ tópico</p>
        <h1>#{name ?? slug}</h1>
        <p>
          {posts.length} {posts.length === 1 ? 'nota carimbada' : 'notas carimbadas'} com este
          assunto. <Link to="/tags">← todos os tópicos</Link>
        </p>
      </div>
      <div className="rows" style={{ marginTop: 32 }}>
        {posts.map((post, i) => (
          <PostRow key={post.slug} post={post} index={i} />
        ))}
      </div>
    </div>
  );
}
