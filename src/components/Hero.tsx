import { site } from '../lib/site';
import Terminal from './Terminal';

/** Masthead — manchete editorial à esquerda + terminal tecnológico à direita. */
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
      <div className="wrap masthead__grid">
        <div className="masthead__copy">
          <p className="kicker">❯_ {site.name} · caderno de engenharia</p>
          <h1 className="masthead__title">
            Escrevo sobre <em>códigos</em> que resolvem problemas reais.
          </h1>
          <p className="masthead__lede">
            {site.description} Cada texto nasce direto no editor — sem painel, sem banco,
            sem cerimônia.
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
        <div className="masthead__term">
          <Terminal postsCount={postsCount} words={words} tags={tags} />
        </div>
      </div>
    </section>
  );
}
