import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { motionOn } from '../lib/motion';
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
  { label: 'Linguagens', items: ['JavaScript', 'TypeScript', 'Java', 'Python'] },
  { label: 'Front & back', items: ['React', 'Node.js', 'Java'] },
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
    role: 'Desenvolvedor Full Stack | Compass Uol',
    when: '2023 a 2024',
    desc: 'Desenvolvimento de gateway de pagamento — e o hábito de documentar tudo, que mais tarde virou este blog.',
  },
  {
    role: 'Análise e Desenvolvimento de Sistema | Estácio',
    when: '2019 a 2023',
    desc: 'Fundamentos de lógica de programação, paradigmas de linguagens de programação e inciação na área da técnologia.',
  },
];

/** Número que conta de zero até o valor ao entrar na página. */
function Count({ to }: { to: number }) {
  const [n, setN] = useState(() => (motionOn() ? 0 : to));
  useEffect(() => {
    if (!motionOn()) return;
    let raf = 0;
    const start = performance.now();
    const step = (t: number) => {
      const p = Math.min(1, (t - start) / 1100);
      setN(Math.round(to * (1 - (1 - p) ** 3)));
      if (p < 1) raf = requestAnimationFrame(step);
    };
    raf = requestAnimationFrame(step);
    // aba em segundo plano não roda requestAnimationFrame: garante o valor final
    const done = window.setTimeout(() => setN(to), 1600);
    return () => {
      cancelAnimationFrame(raf);
      window.clearTimeout(done);
    };
  }, [to]);
  return <>{n.toLocaleString('pt-BR')}</>;
}

export default function About() {
  useTitle('Sobre');
  const posts = getAllPosts();
  const tags = getAllTags();
  const words = posts.reduce((sum, p) => sum + p.words, 0);
  const user = profile.name.split(' ')[0].toLowerCase();

  return (
    <div className="wrap page about">
      <header className="about-hero">
        <div>
          <p className="about-hero__cmd">
            <span>~ $</span>whoami
          </p>
          <h1>{profile.name}</h1>
          <p className="about-hero__role">{profile.role}</p>
          <p className="about__actions">
            <a className="btn btn--primary" href={`mailto:${site.email}`}>
              Enviar e-mail
            </a>
            <a className="btn btn--ghost" href={site.github} rel="noreferrer">
              Abrir o GitHub
            </a>
          </p>
        </div>

        <aside className="about-card" aria-label="Ficha">
          <p className="about-card__bar">
            {user}@{site.name}: ~/sobre
          </p>
          <dl>
            <div>
              <dt>nome</dt>
              <dd>{profile.name}</dd>
            </div>
            {skillGroups.map((g) => (
              <div key={g.label}>
                <dt>{g.label.toLowerCase()}</dt>
                <dd>{g.items.join(', ')}</dd>
              </div>
            ))}
            <div>
              <dt>escreve em</dt>
              <dd>markdown</dd>
            </div>
          </dl>
          <p className="about-card__prompt" aria-hidden="true">
            ~ $<i />
          </p>
        </aside>
      </header>

      <dl className="stats">
        <div>
          <dt>artigos publicados</dt>
          <dd><Count to={posts.length} /></dd>
        </div>
        <div>
          <dt>tópicos cobertos</dt>
          <dd><Count to={tags.length} /></dd>
        </div>
        <div>
          <dt>minutos de leitura</dt>
          <dd><Count to={Math.round(words / 200)} /></dd>
        </div>
      </dl>

      <section className="about-sec" aria-labelledby="bio">
        <h2 id="bio">Sobre</h2>
        <p className="about__bio">{profile.bio}</p>
      </section>

      <section className="about-sec" aria-labelledby="principios">
        <h2 id="principios">No que acredito</h2>
        <ul className="values">
          {principles.map((v) => (
            <li key={v.title}>
              <h3>{v.title}</h3>
              <p>{v.desc}</p>
            </li>
          ))}
        </ul>
      </section>

      <section className="about-sec" aria-labelledby="trajetoria">
        <h2 id="trajetoria">Trajetória</h2>
        <ol className="timeline">
          {timeline.map((item) => (
            <li key={item.role}>
              <span className="timeline__when">{item.when}</span>
              <div className="timeline__body">
                <h3>{item.role}</h3>
                <p>{item.desc}</p>
              </div>
            </li>
          ))}
        </ol>
      </section>

      <section className="about-sec" aria-labelledby="stack">
        <h2 id="stack">Stack do dia a dia</h2>
        <dl className="stack">
          {skillGroups.map((g) => (
            <div key={g.label}>
              <dt>{g.label}</dt>
              <dd>
                {g.items.map((item) => (
                  <span key={item}>{item}</span>
                ))}
              </dd>
            </div>
          ))}
        </dl>
      </section>

      <section className="about-cta" aria-labelledby="contato">
        <h2 id="contato">Vamos conversar</h2>
        <p>Troco ideia sobre tecnologia, carreira e produtividade.</p>
        <p className="about__actions">
          <a className="btn btn--primary" href={`mailto:${site.email}`}>
            Enviar e-mail
          </a>
          <Link to="/arquivo" className="btn btn--ghost">
            Ler os artigos
          </Link>
        </p>
      </section>
    </div>
  );
}
