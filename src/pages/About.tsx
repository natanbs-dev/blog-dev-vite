import { Link } from 'react-router-dom';
import Reveal from '../components/Reveal';
import { site } from '../lib/site';
import { getAllPosts, getAllTags } from '../lib/posts';

/* ================================================================
   MINICURRÍCULO — edite livremente: perfil, skills e trajetória.
   ================================================================ */

const profile = {
  name: 'Natan Barbosa',
  initials: 'NB',
  role: 'Desenvolvedor de software · criador deste blog',
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
    when: '2023 — presente',
    desc: 'Construção de aplicações web com React e Node.js, do protótipo ao deploy — APIs, bancos relacionais e automação pelo terminal.',
  },
  {
    role: 'Aprofundamento em engenharia de software',
    when: '2021 — 2023',
    desc: 'Base sólida em JavaScript/TypeScript, SQL, testes automatizados e boas práticas de código legível e revisões que ensinam.',
  },
  {
    role: 'Primeiros passos no código',
    when: '2020 — 2021',
    desc: 'Fundamentos de programação, lógica e web — e o hábito de documentar tudo, que mais tarde virou este blog.',
  },
];

export default function About() {
  const posts = getAllPosts();
  const tags = getAllTags();

  return (
    <div className="wrap" style={{ paddingBottom: 88 }}>
      <div className="page-head">
        <p className="kicker">❯_ sobre</p>
        <h1>Olá, eu sou o {profile.name}.</h1>
        <p>
          Desenvolvedor de software que acredita em código legível, interfaces
          rápidas e em documentar o próprio aprendizado.
        </p>
        <p className="whoami">
          <span className="whoami__ps1">natan@barbosa.md:~$</span> whoami
          <span className="whoami__out">→ {profile.name.toLowerCase().replace(/\s+/g, '.')}</span>
        </p>
      </div>

      <div className="about-grid">
        <div className="about-main">
          <Reveal>
            <section className="about-panel about-identity">
              <div className="avatar avatar--lg" aria-hidden="true">
                {profile.initials}
              </div>
              <div>
                <h2>{profile.name}</h2>
                <p className="about-identity__role">{profile.role}</p>
                <p className="about-identity__bio">{profile.bio}</p>
              </div>
            </section>
          </Reveal>

          <Reveal delay={80}>
            <section className="about-panel">
              <h3 className="about-panel__title">No que acredito</h3>
              <ul className="values">
                {principles.map((v, i) => (
                  <li key={v.title}>
                    <span className="values__n">{String(i + 1).padStart(2, '0')}</span>
                    <h4>{v.title}</h4>
                    <p>{v.desc}</p>
                  </li>
                ))}
              </ul>
            </section>
          </Reveal>

          <Reveal delay={120}>
            <section className="about-panel">
              <h3 className="about-panel__title">Trajetória</h3>
              <ul className="timeline">
                {timeline.map((item) => (
                  <li key={item.role}>
                    <h4>{item.role}</h4>
                    <span className="when">{item.when}</span>
                    <p>{item.desc}</p>
                  </li>
                ))}
              </ul>
            </section>
          </Reveal>
        </div>

        <aside className="about-side">
          <Reveal delay={100}>
            <section className="about-panel">
              <h3 className="about-panel__title">Ficha</h3>
              <dl className="facts">
                <div>
                  <dt>nome</dt>
                  <dd>{profile.name}</dd>
                </div>
                <div>
                  <dt>base</dt>
                  <dd>JavaScript · TypeScript</dd>
                </div>
                <div>
                  <dt>foco</dt>
                  <dd>React · Node · SQL</dd>
                </div>
                <div>
                  <dt>artigos</dt>
                  <dd>
                    {posts.length} em {tags.length} tópicos
                  </dd>
                </div>
              </dl>
            </section>
          </Reveal>

          <Reveal delay={160}>
            <section className="about-panel">
              <h3 className="about-panel__title">Stack do dia a dia</h3>
              {skillGroups.map((g) => (
                <div key={g.label} className="skill-group">
                  <h4>{g.label}</h4>
                  <div className="skills">
                    {g.items.map((s) => (
                      <span className="skill-chip" key={s}>
                        {s}
                      </span>
                    ))}
                  </div>
                </div>
              ))}
            </section>
          </Reveal>

          <Reveal delay={220}>
            <section className="about-panel about-contact">
              <h3 className="about-panel__title">Vamos conversar</h3>
              <p>
                Troco ideia sobre tecnologia, carreira e produtividade. Me chame
                por e-mail ou acompanhe as publicações.
              </p>
              <p className="about-section__actions">
                <a className="btn btn--primary" href={`mailto:${site.email}`}>
                  Enviar e-mail
                </a>
                <Link to="/" className="btn btn--ghost">
                  Ler o blog →
                </Link>
              </p>
            </section>
          </Reveal>
        </aside>
      </div>
    </div>
  );
}
