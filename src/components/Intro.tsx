import { useEffect, useState } from 'react';
import { endIntro, introPending } from '../lib/intro';
import { site } from '../lib/site';

/** Abertura: o nome do site é digitado e a cortina sobe. Clique ou tecla pula. */
export default function Intro() {
  const [show, setShow] = useState(introPending);

  useEffect(() => {
    if (!show) return;
    const skip = () => {
      endIntro();
      setShow(false);
    };
    window.addEventListener('keydown', skip);
    window.addEventListener('pointerdown', skip);
    return () => {
      window.removeEventListener('keydown', skip);
      window.removeEventListener('pointerdown', skip);
    };
  }, [show]);

  if (!show) return null;

  return (
    <div
      className="intro"
      aria-hidden="true"
      onAnimationStart={(e) => {
        // a cortina começou a subir: o resto da página já pode se mexer
        if (e.animationName === 'wipe-out') endIntro();
      }}
      onAnimationEnd={(e) => {
        if (e.animationName === 'wipe-out') setShow(false);
      }}
    >
      <div className="intro__box">
        <p className="intro__name">
          <span className="intro__mark">❯</span>
          <span className="intro__type">{site.name}</span>
          <span className="intro__caret" />
        </p>
        <span className="intro__rule" />
        <p className="intro__tag">notas de terminal, código e arquitetura</p>
      </div>
    </div>
  );
}
