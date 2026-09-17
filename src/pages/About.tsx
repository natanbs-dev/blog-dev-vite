import { Link } from 'react-router-dom';
import { site } from '../lib/site';

export default function About() {
  return (
    <div className="wrap" style={{ paddingBottom: 88 }}>
      <div className="page-head">
        <p className="kicker">❯_ sobre</p>
        <h1>O caderno</h1>
        <p>
          {site.name} é um blog estático em Vite + React onde cada artigo é um arquivo markdown
          em <code>content/posts/</code>.
        </p>
      </div>

      <div className="about">
        <div className="about__head">
          <h2>
            Escrever primeiro<span className="accent">,</span> formatar depois<span className="accent">.</span>
          </h2>
          <p>{site.description}</p>
        </div>
        <div className="about__body">
          <h3>Como publicar</h3>
          <ol className="steps">
            <li>
              <h4>Anote em markdown</h4>
              <p>
                Crie <code>content/posts/minha-nota.md</code> com front-matter — título, resumo,
                data e tópicos.
              </p>
            </li>
            <li>
              <h4>Folheie no dev server</h4>
              <p>
                <code>npm run dev</code>: a nota entra no índice, no arquivo, nos tópicos e na
                busca instantaneamente.
              </p>
            </li>
            <li>
              <h4>Revise com a folha de busca</h4>
              <p>
                <code>ctrl k</code> encontra qualquer trecho; cada bloco de código traz botão de
                cópia; três temas (tinta, papel, gruvbox) + extras no canto do cabeçalho.
              </p>
            </li>
          </ol>
          <h3>Ficha técnica</h3>
          <div className="chips">
            {['vite', 'react', 'typescript', 'gfm', 'sumário automático', 'ctrl+k', 'copiar código', '7 temas'].map(
              (s) => (
                <span key={s} className="chip">
                  {s}
                </span>
              ),
            )}
          </div>
          <p style={{ marginTop: 28 }}>
            <Link to="/" className="btn btn--primary">
              Voltar ao índice →
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
