import { Link } from 'react-router-dom';
import { formatDate, tagToSlug, type PostMeta } from '../lib/posts';
import Reveal from './Reveal';

/** Linha de ledger: data à esquerda, título serifado, carimbo de tópicos. */
export default function PostRow({ post, index }: { post: PostMeta; index: number }) {
  return (
    <Reveal delay={Math.min(index, 4) * 60}>
      <article className="row">
        <div className="row__date">
          <span className="row__day">{post.date.slice(8, 10) || '··'}</span>
          <span className="row__mon">{monthShort(post.date)}</span>
          <span className="row__year">{post.date.slice(0, 4)}</span>
        </div>
        <div className="row__body">
          <h3 className="row__title">
            <Link to={`/posts/${post.slug}`}>{post.title}</Link>
          </h3>
          <p className="row__excerpt">{post.description}</p>
          <div className="row__meta">
            {post.tags.slice(0, 3).map((t) => (
              <Link key={t} to={`/tags/${tagToSlug(t)}`} className="stamp">
                {t}
              </Link>
            ))}
            <span className="row__reading">{post.readingTime} de leitura</span>
          </div>
        </div>
        <Link to={`/posts/${post.slug}`} className="row__go" aria-label={`Ler: ${post.title}`}>
          →
        </Link>
      </article>
    </Reveal>
  );
}

function monthShort(date: string): string {
  const m = date.slice(5, 7);
  const names: Record<string, string> = {
    '01': 'jan', '02': 'fev', '03': 'mar', '04': 'abr', '05': 'mai', '06': 'jun',
    '07': 'jul', '08': 'ago', '09': 'set', '10': 'out', '11': 'nov', '12': 'dez',
  };
  return names[m] ?? formatDate(date, 'medium').slice(3, 6);
}
