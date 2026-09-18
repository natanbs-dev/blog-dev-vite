import { Link } from 'react-router-dom';
import { formatDate, getAllPosts } from '../lib/posts';

export default function Archive() {
  const posts = getAllPosts();
  const byYear = new Map<string, typeof posts>();
  for (const p of posts) {
    const year = (p.date || '').slice(0, 4) || 's.d.';
    if (!byYear.has(year)) byYear.set(year, []);
    byYear.get(year)!.push(p);
  }

  return (
    <div className="wrap" style={{ paddingBottom: 88 }}>
      <div className="page-head">
        <p className="kicker">❯_ arquivo</p>
        <h1>Todas as notas</h1>
        <p>
          {posts.length} verbetes, em ordem cronológica inversa.
        </p>
      </div>

      {[...byYear.entries()].map(([year, items]) => (
        <section key={year} className="year">
          <h2 className="year__title">— {year}</h2>
          <div className="ledger">
            {items.map((p) => (
              <Link key={p.slug} to={`/posts/${p.slug}`} className="ledger__item">
                <span className="ledger__date">{formatDate(p.date, 'medium')}</span>
                <span className="ledger__title">{p.title}</span>
                <span className="ledger__dots" aria-hidden />
                <span className="ledger__arrow">→</span>
              </Link>
            ))}
          </div>
        </section>
      ))}
    </div>
  );
}
