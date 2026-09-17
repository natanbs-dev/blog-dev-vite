import { site } from '../lib/site';

/** Masthead tipográfico — sem terminal, sem animação: manchete + linha de dados. */
export default function Masthead({
  postsCount,
  words,
  tags,
  updated,
}: {
  postsCount: number;
  words: number;
  tags: number;
  updated: string;
}) {
  return (
    <section className="masthead">
      <div className="wrap">
        <p className="kicker">❯_ {site.name} · caderno de engenharia</p>
        <h1 className="masthead__title">
          Notas sobre <em>código</em>, ferramentas e ofício.
        </h1>
        <p className="masthead__lede">
          {site.description} Cada texto nasce como um arquivo markdown em{' '}
          <code>content/posts/</code> — sem painel, sem banco, sem cerimônia.
        </p>
        <dl className="masthead__facts">
          <div>
            <dt>artigos</dt>
            <dd>{String(postsCount).padStart(2, '0')}</dd>
          </div>
          <div>
            <dt>palavras</dt>
            <dd>{words.toLocaleString('pt-BR')}</dd>
          </div>
          <div>
            <dt>tópicos</dt>
            <dd>{String(tags).padStart(2, '0')}</dd>
          </div>
          <div>
            <dt>atualizado</dt>
            <dd>{updated}</dd>
          </div>
        </dl>
      </div>
    </section>
  );
}
