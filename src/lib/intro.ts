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
if (pending) {
  // o CSS segura as animações da página enquanto a abertura cobre a tela
  document.documentElement.setAttribute('data-intro', '');
  // e, neste carregamento, o cabeçalho já nasce no lugar: é nele que o nome pousa
  document.documentElement.setAttribute('data-intro-run', '');
}

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
