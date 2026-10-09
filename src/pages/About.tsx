import { site } from '../lib/site';
import { getAllPosts, getAllTags } from '../lib/posts';
import { useTitle } from '../lib/useTitle';

/* ================================================================
   MINICURRÍCULO — edite livremente: perfil, skills e trajetória.
   ================================================================ */

const profile = {
  name: 'Natan Barbosa',
  role: 'Desenvolvedor de software e autor deste blog.',
  bio: 'Escrevo código e escrevo sobre código. Este blog nasceu da vontade de transformar as anotações soltas do meu dia a dia em conteúdo útil para outros desenvolvedores e desenvolvedoras.',
};

const principles = [
  { title: 'Código legível', desc: 'Clareza antes de esperteza — o próximo leitor agradece.' },
  { title: 'Interfaces rápidas', desc: 'Performance é funcionalidade, não detalhe.' },
  { title: 'Aprender documentando', desc: 'Quem escreve o que aprende, aprende duas vezes.' },
];

const skillGroups = [
  { label: 'Linguagens', items: ['JavaScript', 'TypeScript'] },
  { label: 'Front & back', items: ['React', 'Node.js'] },
  { label: 'Dados & ops', items: ['SQL', 'Docker', 'Terminal / Linux'] },
];

/* EDITE COM SUA TRAJETÓRIA REAL: cargo/fase + período + 1 frase. */
const timeline = [
  {
    role: 'Desenvolvedor de software',
    when: '2023 até hoje',
    desc: 'Construção de aplicações web com React e Node.js, do protótipo ao deploy — APIs, bancos relacionais e automação pelo terminal.',
  },
  {
    role: 'Aprofundamento em engenharia de software',
    when: '2021 a 2023',
    desc: 'Base sólida em JavaScript/TypeScript, SQL, testes automatizados e boas práticas de código legível e revisões que ensinam.',
  },
  {
    role: 'Primeiros passos no código',
    when: '2020 a 2021',
    desc: 'Fundamentos de programação, lógica e web — e o hábito de documentar tudo, que mais tarde virou este blog.',
  },
];

export default function About() {
  useTitle('Sobre');
  const posts = getAllPosts();
  const tags = getAllTags();

  return (
    <div className="wrap page about">
      <header className="page-head">
        <h1>{profile.name}</h1>
        <p>{profile.role}</p>
      </header>

      <div className="about__grid">
        <div className="about__main">
          <p className="about__bio">{profile.bio}</p>

          <section aria-labelledby="principios">
            <h2 id="principios">No que acredito</h2>
            <dl className="values">
              {principles.map((v) => (
                <div key={v.title}>
                  <dt>{v.title}</dt>
                  <dd>{v.desc}</dd>
                </div>
              ))}
            </dl>
          </section>

          <section aria-labelledby="trajetoria">
            <h2 id="trajetoria">Trajetória</h2>
            <ol className="timeline">
              {timeline.map((item) => (
                <li key={item.role}>
                  <span className="timeline__when">{item.when}</span>
                  <h3>{item.role}</h3>
                  <p>{item.desc}</p>
                </li>
              ))}
            </ol>
          </section>
        </div>

        <aside className="about__side">
          <section aria-labelledby="stack">
            <h2 id="stack">Stack do dia a dia</h2>
            <dl className="facts">
              {skillGroups.map((g) => (
                <div key={g.label}>
                  <dt>{g.label}</dt>
                  <dd>{g.items.join(', ')}</dd>
                </div>
              ))}
              <div>
                <dt>Neste blog</dt>
                <dd>
                  {posts.length} artigos em {tags.length} tópicos
                </dd>
              </div>
            </dl>
          </section>

          <section aria-labelledby="contato">
            <h2 id="contato">Contato</h2>
            <p>Troco ideia sobre tecnologia, carreira e produtividade.</p>
            <p className="about__actions">
              <a className="btn btn--primary" href={`mailto:${site.email}`}>
                Enviar e-mail
              </a>
              <a className="btn btn--ghost" href={site.github} rel="noreferrer">
                Abrir o GitHub
              </a>
            </p>
          </section>
        </aside>
      </div>
    </div>
  );
}
