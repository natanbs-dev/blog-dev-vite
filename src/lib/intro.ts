import { motionOn } from './motion';

/** A abertura toca uma vez por sessão, e nunca com as animações desligadas. */
export const INTRO_END = 'blog:intro-end';

function shouldPlay(): boolean {
  try {
    if (sessionStorage.getItem('intro')) return false;
  } catch {
    /* sessionStorage indisponível: toca mesmo assim */
  }
  return motionOn();
}

let pending = shouldPlay();
// o CSS segura as animações da página enquanto a abertura cobre a tela
if (pending) document.documentElement.setAttribute('data-intro', '');

export function introPending(): boolean {
  return pending;
}

export function endIntro(): void {
  if (!pending) return;
  pending = false;
  document.documentElement.removeAttribute('data-intro');
  try {
    sessionStorage.setItem('intro', '1');
  } catch {
    /* sem sessionStorage a abertura volta no próximo carregamento */
  }
  window.dispatchEvent(new Event(INTRO_END));
}
