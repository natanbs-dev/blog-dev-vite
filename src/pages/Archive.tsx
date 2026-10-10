import PostRow from '../components/PostRow';
import { getAllPosts, type PostMeta } from '../lib/posts';
import { useTitle } from '../lib/useTitle';

export default function Archive() {
  useTitle('Artigos');
  const posts = getAllPosts();
  const byYear = new Map<string, PostMeta[]>();
  for (const p of posts) {
    const year = p.date.slice(0, 4) || 'Sem data';
    byYear.set(year, [...(byYear.get(year) ?? []), p]);
  }

  return (
    <div className="wrap page">
      <header className="page-head">
        <h1>Artigos</h1>
        <p>
          {posts.length} {posts.length === 1 ? 'artigo' : 'artigos'}, do mais recente para o mais antigo.
        </p>
      </header>

      {[...byYear.entries()].map(([year, items]) => (
        <section key={year} className="year" aria-labelledby={`ano-${year}`}>
          <h2 id={`ano-${year}`} className="year__title">
            {year}
          </h2>
          <div className="rows">
            {items.map((p) => (
              <PostRow key={p.slug} post={p} />
            ))}
          </div>
        </section>
      ))}
    </div>
  );
}
