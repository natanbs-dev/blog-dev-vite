import { useEffect, useRef, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  getAllPosts,
  getAllTags,
  getPostsByTag,
  normalize,
  searchPosts,
  shortDate,
  type PostMeta,
} from '../lib/posts';
import { INTRO_END, introPending } from '../lib/intro';
import { motionOn, setMotion } from '../lib/motion';
import { site } from '../lib/site';
import { setTheme, THEMES, useTheme } from '../lib/theme';

type Line =
  | { kind: 'cmd'; text: string }
  | { kind: 'out'; text: string; tone?: 'dim' | 'err' }
  | { kind: 'posts'; items: PostMeta[] }
  | { kind: 'tags' }
  | { kind: 'themes' }
  | { kind: 'help' }
  | { kind: 'fetch' };

const HELP: [string, string][] = [
  ['ls [tópico]', 'lista os artigos'],
  ['cat <n>', 'abre o artigo de número n'],
  ['grep <termo>', 'procura no texto dos artigos'],
  ['tags', 'lista os tópicos'],
  ['cd <lugar>', 'vai para artigos, topicos ou sobre'],
  ['random', 'abre um artigo ao acaso'],
  ['theme [nome]', 'mostra ou troca o tema'],
  ['cmatrix [on|off]', 'liga ou desliga a chuva ao fundo'],
  ['motion [on|off]', 'liga ou desliga as animações do site'],
  ['fastfetch', 'resumo do blog'],
  ['clear', 'limpa a tela'],
];

const COMMANDS = ['ls', 'cat', 'grep', 'tags', 'cd', 'random', 'theme', 'cmatrix', 'motion', 'fastfetch', 'clear', 'help', 'whoami', 'pwd', 'date', 'echo'];
const SHORTCUTS = ['ls', 'tags', 'random', 'theme', 'cmatrix', 'help'];
const PLACES: Record<string, string> = {
  '~': '/',
  '/': '/',
  inicio: '/',
  artigos: '/arquivo',
  arquivo: '/arquivo',
  topicos: '/tags',
  tags: '/tags',
  sobre: '/sobre',
};

// "❯_" em pixels: independe de a fonte ter os glifos de bloco.
const LOGO = ['#........', '.#.......', '..#......', '.#.......', '#...####.'];

const BOOT = 'fastfetch';

export default function Terminal({
  matrixOn,
  onMatrix,
}: {
  matrixOn: boolean;
  onMatrix: (on: boolean) => void;
}) {
  const navigate = useNavigate();
  const theme = useTheme();
  const posts = getAllPosts();
  const tags = getAllTags();

  const [lines, setLines] = useState<Line[]>([]);
  const [typed, setTyped] = useState('');
  const [booted, setBooted] = useState(false);
  const [input, setInput] = useState('');
  const [past, setPast] = useState<string[]>([]);
  const [pastIdx, setPastIdx] = useState(-1);

  const screenRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const stick = useRef(false);

  // Única animação da página: o comando de abertura é "digitado" uma vez.
  useEffect(() => {
    const finish = () => {
      setLines([{ kind: 'cmd', text: BOOT }, { kind: 'fetch' }]);
      setTyped('');
      setBooted(true);
    };
    if (!motionOn()) {
      finish();
      return;
    }
    let i = 0;
    let id = 0;
    let done = 0;
    const start = () => {
      id = window.setInterval(() => {
        i += 1;
        setTyped(BOOT.slice(0, i));
        if (i >= BOOT.length) {
          window.clearInterval(id);
          done = window.setTimeout(finish, 320);
        }
      }, 70);
    };
    // na primeira visita, espera a abertura do site sair da frente
    if (introPending()) window.addEventListener(INTRO_END, start, { once: true });
    else start();
    return () => {
      window.removeEventListener(INTRO_END, start);
      window.clearInterval(id);
      window.clearTimeout(done);
    };
  }, []);

  // Só acompanha o fim da tela depois de um comando do visitante.
  useEffect(() => {
    const el = screenRef.current;
    if (el && stick.current) el.scrollTop = el.scrollHeight;
  }, [lines]);

  const numberOf = (post: PostMeta) => posts.indexOf(post) + 1;

  function run(raw: string) {
    const text = raw.trim();
    if (!text) return;
    stick.current = true;
    setPast((h) => [text, ...h.filter((c) => c !== text)].slice(0, 50));
    setPastIdx(-1);

    const [bin, ...args] = text.split(/\s+/);
    const arg = args.join(' ');
    const print = (...out: Line[]) => setLines((l) => [...l, { kind: 'cmd', text }, ...out]);
    const say = (msg: string, tone?: 'dim' | 'err'): Line => ({ kind: 'out', text: msg, tone });

    switch (bin.toLowerCase()) {
      case 'help':
      case 'ajuda':
        print({ kind: 'help' });
        break;
      case 'ls':
      case 'll': {
        if (!arg) {
          print({ kind: 'posts', items: posts });
          break;
        }
        const tag = tags.find((t) => normalize(t.name) === normalize(arg) || t.slug === arg);
        if (tag) print({ kind: 'posts', items: getPostsByTag(tag.name) });
        else print(say(`ls: nenhum tópico chamado "${arg}". Use "tags" para ver os que existem.`, 'err'));
        break;
      }
      case 'cat':
      case 'open':
      case 'abrir': {
        const post = /^\d+$/.test(arg) ? posts[Number(arg) - 1] : posts.find((p) => p.slug === arg);
        if (post) {
          print(say(`abrindo "${post.title}"`, 'dim'));
          navigate(`/posts/${post.slug}`);
        } else {
          print(say(`cat: informe o número de um artigo, de 1 a ${posts.length}. "ls" mostra a lista.`, 'err'));
        }
        break;
      }
      case 'grep':
      case 'buscar': {
        if (!arg) {
          print(say('grep: informe um termo, por exemplo "grep ffmpeg".', 'err'));
          break;
        }
        const found = searchPosts(arg).map((d) => d.post);
        if (found.length) print({ kind: 'posts', items: found });
        else print(say(`grep: nenhum artigo menciona "${arg}".`, 'err'));
        break;
      }
      case 'tags':
      case 'topicos':
        print({ kind: 'tags' });
        break;
      case 'cd': {
        const key = normalize(arg || '~').replace(/\/+$/, '') || '/';
        const tag = tags.find((t) => t.slug === key.replace(/^(tags|topicos)\//, ''));
        const to = PLACES[key] ?? (tag ? `/tags/${tag.slug}` : null);
        if (to) {
          print();
          navigate(to);
        } else {
          print(say(`cd: "${arg}" não existe. Lugares: artigos, topicos, sobre.`, 'err'));
        }
        break;
      }
      case 'random':
      case 'sorteio': {
        const post = posts[Math.floor(Math.random() * posts.length)];
        if (post) {
          print(say(`abrindo "${post.title}"`, 'dim'));
          navigate(`/posts/${post.slug}`);
        }
        break;
      }
      case 'theme':
      case 'tema': {
        if (!arg) {
          print({ kind: 'themes' });
          break;
        }
        const wanted = normalize(arg);
        const found = THEMES.find((t) => t.id === wanted || normalize(t.label) === wanted);
        if (found) {
          setTheme(found.id);
          print(say(`tema trocado para ${found.label}.`));
        } else {
          print(say(`theme: não conheço "${arg}".`, 'err'), { kind: 'themes' });
        }
        break;
      }
      case 'cmatrix':
      case 'matrix': {
        const next = arg === 'on' ? true : arg === 'off' ? false : !matrixOn;
        onMatrix(next);
        print(say(next ? 'chuva ligada.' : 'chuva desligada.'));
        break;
      }
      case 'motion':
      case 'animacoes': {
        const next = arg === 'on' ? true : arg === 'off' ? false : !motionOn();
        setMotion(next);
        print(say(next ? 'animações ligadas.' : 'animações desligadas.'));
        break;
      }
      case 'fastfetch':
      case 'neofetch':
        print({ kind: 'fetch' });
        break;
      case 'clear':
      case 'limpar':
        setLines([]);
        break;
      case 'whoami':
        print(say('visitante'));
        break;
      case 'pwd':
        print(say('/home/visitante'));
        break;
      case 'date':
        print(say(new Date().toLocaleString('pt-BR', { dateStyle: 'full', timeStyle: 'short' })));
        break;
      case 'echo':
        print(say(arg));
        break;
      case 'sudo':
        print(say('visitante não está no arquivo sudoers. Este incidente será relatado.', 'err'));
        break;
      default:
        print(say(`${bin}: comando não encontrado. "help" lista os comandos.`, 'err'));
    }
  }

  function complete() {
    const parts = input.split(/\s+/);
    const last = normalize(parts[parts.length - 1]);
    const bin = parts[0].toLowerCase();
    let pool: string[] = COMMANDS;
    if (parts.length > 1) {
      if (bin === 'ls') pool = tags.map((t) => t.slug);
      else if (bin === 'cd') pool = ['artigos', 'topicos', 'sobre'];
      else if (bin === 'theme' || bin === 'tema') pool = THEMES.map((t) => t.id);
      else if (bin === 'cmatrix' || bin === 'motion') pool = ['on', 'off'];
      else if (bin === 'cat' || bin === 'open') pool = posts.map((p) => p.slug);
      else return;
    }
    const matches = pool.filter((c) => c.startsWith(last));
    if (matches.length === 1) {
      setInput([...parts.slice(0, -1), matches[0]].join(' ') + ' ');
    } else if (matches.length > 1) {
      stick.current = true;
      setLines((l) => [...l, { kind: 'out', text: matches.join('  '), tone: 'dim' }]);
    }
  }

  const onSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    run(input);
    setInput('');
  };

  const onKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Tab' && input) {
      e.preventDefault();
      complete();
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      const next = Math.min(pastIdx + 1, past.length - 1);
      if (past[next] !== undefined) {
        setPastIdx(next);
        setInput(past[next]);
      }
    } else if (e.key === 'ArrowDown') {
      e.preventDefault();
      const next = pastIdx - 1;
      setPastIdx(Math.max(next, -1));
      setInput(next < 0 ? '' : past[next]);
    } else if (e.key === 'l' && e.ctrlKey) {
      e.preventDefault();
      setLines([]);
    }
  };

  // Clicar na tela leva ao prompt, sem atrapalhar links nem seleção de texto.
  const onScreenClick = (e: React.MouseEvent) => {
    if ((e.target as HTMLElement).closest('a, button')) return;
    if (window.getSelection()?.toString()) return;
    inputRef.current?.focus({ preventScroll: true });
  };

  const themeLabel = THEMES.find((t) => t.id === theme)?.label ?? theme;
  const words = posts.reduce((sum, p) => sum + p.words, 0);

  return (
    <section className="term" aria-label="Terminal do blog">
      <header className="term__bar">
        <span className="term__title">visitante@{site.name}</span>
        <button
          type="button"
          className="term__switch"
          aria-pressed={matrixOn}
          onClick={() => onMatrix(!matrixOn)}
        >
          cmatrix
        </button>
      </header>

      <div ref={screenRef} className="term__screen" onClick={onScreenClick}>
        {!booted && (
          <div className="term__line">
            <Prompt />
            <span className="term__cmd">{typed}</span>
            <span className="term__caret" aria-hidden="true" />
          </div>
        )}

        {lines.map((line, i) => {
          switch (line.kind) {
            case 'cmd':
              return (
                <div key={i} className="term__line">
                  <Prompt />
                  <span className="term__cmd">{line.text}</span>
                </div>
              );
            case 'posts':
              return (
                <ol key={i} className="term__posts">
                  {line.items.map((post) => (
                    <li key={post.slug}>
                      <span className="term__n">{String(numberOf(post)).padStart(2, '0')}</span>
                      <Link to={`/posts/${post.slug}`}>{post.title}</Link>
                      <span className="term__date">{shortDate(post.date)}</span>
                    </li>
                  ))}
                </ol>
              );
            case 'tags':
              return (
                <p key={i} className="term__wrap">
                  {tags.map((t) => (
                    <Link key={t.slug} to={`/tags/${t.slug}`}>
                      {t.name}
                      <span className="term__dim"> {t.count}</span>
                    </Link>
                  ))}
                </p>
              );
            case 'themes':
              return (
                <p key={i} className="term__wrap">
                  {THEMES.map((t) => (
                    <button key={t.id} type="button" onClick={() => run(`theme ${t.id}`)}>
                      {t.id === theme ? `[${t.id}]` : t.id}
                    </button>
                  ))}
                </p>
              );
            case 'help':
              return (
                <div key={i} className="term__help">
                  <dl>
                    {HELP.map(([cmd, what]) => (
                      <div key={cmd}>
                        <dt>{cmd}</dt>
                        <dd>{what}</dd>
                      </div>
                    ))}
                  </dl>
                  <p className="term__dim">Tab completa, ↑ repete o último comando.</p>
                </div>
              );
            case 'fetch':
              return (
                <div key={i} className="term__fetch">
                  <svg className="term__logo" viewBox="0 0 9 5" aria-hidden="true">
                    {LOGO.flatMap((row, y) =>
                      [...row].map((c, x) =>
                        c === '#' ? <rect key={`${x}-${y}`} x={x + 0.06} y={y + 0.06} width="0.88" height="0.88" /> : null,
                      ),
                    )}
                  </svg>
                  <dl>
                    <div><dt>blog</dt><dd>{site.name}</dd></div>
                    <div><dt>autor</dt><dd>{site.author}</dd></div>
                    <div><dt>artigos</dt><dd>{posts.length}, com {words.toLocaleString('pt-BR')} palavras</dd></div>
                    <div><dt>tópicos</dt><dd>{tags.length}</dd></div>
                    <div><dt>atualizado</dt><dd>{posts[0] ? shortDate(posts[0].date) : 'ainda não'}</dd></div>
                    <div><dt>tema</dt><dd>{themeLabel}</dd></div>
                    <div><dt>feito com</dt><dd>markdown, react e vite</dd></div>
                  </dl>
                </div>
              );
            default:
              return (
                <div key={i} className={`term__line${line.tone ? ` term__line--${line.tone}` : ''}`}>
                  {line.text}
                </div>
              );
          }
        })}

        {booted && (
          <form className="term__line term__prompt" onSubmit={onSubmit}>
            <Prompt />
            <input
              ref={inputRef}
              className="term__input"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={onKeyDown}
              aria-label="Comando do terminal"
              placeholder="digite help"
              autoComplete="off"
              autoCapitalize="off"
              autoCorrect="off"
              spellCheck={false}
              enterKeyHint="go"
            />
          </form>
        )}
      </div>

      <div className="term__keys" role="group" aria-label="Atalhos de comandos">
        {SHORTCUTS.map((cmd) => (
          <button key={cmd} type="button" disabled={!booted} onClick={() => run(cmd)}>
            {cmd}
          </button>
        ))}
      </div>
    </section>
  );
}

function Prompt() {
  return (
    <span className="term__ps1" aria-hidden="true">
      ~ $
    </span>
  );
}
