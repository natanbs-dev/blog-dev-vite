import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useMotion } from '../lib/motion';
import { site } from '../lib/site';
import type { PostMeta } from '../lib/posts';
import MatrixRain from './MatrixRain';
import Terminal from './Terminal';

const TITLE = 'Notas de quem resolve as coisas pelo terminal.';

function readMatrixPref(): boolean {
  try {
    return localStorage.getItem('cmatrix') !== 'off';
  } catch {
    return true;
  }
}

/** Abertura da home: manchete à esquerda, terminal sobre a chuva do cmatrix à direita. */
export default function Hero({ latest, total }: { latest?: PostMeta; total: number }) {
  const [matrixOn, setMatrixOn] = useState(readMatrixPref);
  const motion = useMotion();

  const onMatrix = (on: boolean) => {
    setMatrixOn(on);
    try {
      localStorage.setItem('cmatrix', on ? 'on' : 'off');
    } catch {
      /* localStorage indisponível */
    }
  };

  return (
    <section className="hero">
      <div className="wrap hero__grid">
        <div className="hero__copy">
          <h1 className="hero__title" aria-label={TITLE}>
            {TITLE.split(' ').map((word, i) => (
              <span key={i} aria-hidden="true">
                <span className="word">
                  <span style={{ '--i': i } as React.CSSProperties}>{word}</span>
                </span>{' '}
              </span>
            ))}
          </h1>
          <p className="hero__lede">{site.description}</p>
          <p className="hero__actions">
            {latest && (
              <Link to={`/posts/${latest.slug}`} className="btn btn--primary">
                Ler o artigo mais recente
              </Link>
            )}
            <Link to="/arquivo" className="btn btn--ghost">
              Ver os {total} artigos
            </Link>
          </p>
        </div>
        <div className="hero__stage">
          {matrixOn && <MatrixRain key={String(motion)} />}
          <Terminal matrixOn={matrixOn} onMatrix={onMatrix} />
        </div>
      </div>
    </section>
  );
}
