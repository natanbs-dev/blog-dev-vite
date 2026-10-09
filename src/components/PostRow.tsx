import { Link } from 'react-router-dom';
import { shortDate, tagToSlug, type PostMeta } from '../lib/posts';

/** Linha da lista de artigos: data, título com resumo e tópicos, tempo de leitura. */
export default function PostRow({ post }: { post: PostMeta }) {
  return (
    <article className="row">
      <time className="row__date" dateTime={post.date}>
        {shortDate(post.date)}
      </time>
      <div className="row__body">
        <h3 className="row__title">
          <Link to={`/posts/${post.slug}`}>{post.title}</Link>
        </h3>
        {post.description && <p className="row__excerpt">{post.description}</p>}
        {post.tags.length > 0 && (
          <p className="row__tags">
            {post.tags.slice(0, 4).map((t) => (
              <Link key={t} to={`/tags/${tagToSlug(t)}`} className="tag">
                {t}
              </Link>
            ))}
          </p>
        )}
      </div>
      <span className="row__time">{post.readingTime}</span>
    </article>
  );
}
