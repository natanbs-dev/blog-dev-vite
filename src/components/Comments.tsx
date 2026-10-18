import { useCallback, useEffect, useId, useRef, useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { ApiError, api, type CommentItem, type CommentPage } from '../lib/api';
import { initials, useAuth } from '../lib/auth';
import { FormMessage } from './Form';

const MAX = 2000;

const when = (iso: string) =>
  new Intl.DateTimeFormat('pt-BR', { dateStyle: 'medium', timeStyle: 'short' }).format(new Date(iso));

/** Caixa de texto com contador. Usada para comentar, responder e editar. */
function Composer({
  initial = '',
  label,
  submitLabel,
  onSubmit,
  onCancel,
  autoFocus,
}: {
  initial?: string;
  label: string;
  submitLabel: string;
  onSubmit: (body: string) => Promise<void>;
  onCancel?: () => void;
  autoFocus?: boolean;
}) {
  const id = useId();
  const [body, setBody] = useState(initial);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const left = MAX - body.length;

  return (
    <form
      className="composer"
      onSubmit={(e) => {
        e.preventDefault();
        if (!body.trim()) return;
        setBusy(true);
        setError('');
        onSubmit(body)
          .then(() => setBody(''))
          .catch((err: unknown) => setError(err instanceof ApiError ? err.message : 'Não foi possível enviar.'))
          .finally(() => setBusy(false));
      }}
    >
      <label className="sr-only" htmlFor={id}>
        {label}
      </label>
      <textarea
        id={id}
        value={body}
        onChange={(e) => setBody(e.target.value)}
        onKeyDown={(e) => {
          if (e.key === 'Enter' && (e.ctrlKey || e.metaKey)) e.currentTarget.form?.requestSubmit();
          if (e.key === 'Escape' && onCancel) onCancel();
        }}
        placeholder={label}
        rows={3}
        maxLength={MAX}
        autoFocus={autoFocus}
        disabled={busy}
      />
      {error && <FormMessage kind="error">{error}</FormMessage>}
      <div className="composer__bar">
        <span className={`composer__count${left < 100 ? ' is-low' : ''}`} aria-live="polite">
          {left < 300 ? `${left} restantes` : 'Texto puro · Ctrl+Enter envia'}
        </span>
        {onCancel && (
          <button type="button" className="btn btn--ghost btn--sm" onClick={onCancel}>
            Cancelar
          </button>
        )}
        <button className="btn btn--primary btn--sm" disabled={busy || !body.trim()}>
          {busy ? 'Enviando…' : submitLabel}
        </button>
      </div>
    </form>
  );
}

function Comment({
  c,
  canReply,
  onReply,
  onChange,
  onRemove,
}: {
  c: CommentItem;
  canReply: boolean;
  onReply?: (body: string) => Promise<void>;
  onChange: (c: CommentItem) => void;
  onRemove: (id: string) => void;
}) {
  const [mode, setMode] = useState<'view' | 'edit' | 'reply'>('view');
  const [error, setError] = useState('');

  return (
    <li className={`comment${c.deleted ? ' comment--deleted' : ''}`} id={`comentario-${c.id}`}>
      <span className="avatar" aria-hidden="true">
        {c.author ? initials(c.author.displayName) : '∅'}
      </span>
      <div className="comment__main">
        <p className="comment__head">
          {c.author ? (
            <Link to={`/u/${c.author.username}`} className="comment__author">
              {c.author.displayName}
            </Link>
          ) : (
            <span className="comment__author comment__author--gone">{c.deleted ? 'comentário removido' : 'conta removida'}</span>
          )}
          <time dateTime={c.createdAt}>{when(c.createdAt)}</time>
          {c.editedAt && <span className="comment__edited">(editado)</span>}
        </p>

        {mode === 'edit' ? (
          <Composer
            initial={c.body}
            label="Editar comentário"
            submitLabel="Salvar"
            autoFocus
            onCancel={() => setMode('view')}
            onSubmit={async (body) => {
              const { comment } = await api.editComment(c.id, body);
              onChange({ ...comment, replies: c.replies });
              setMode('view');
            }}
          />
        ) : (
          !c.deleted && <p className="comment__body">{c.body}</p>
        )}

        {mode === 'view' && !c.deleted && (canReply || c.canEdit || c.canDelete) && (
          <p className="comment__actions">
            {canReply && onReply && (
              <button type="button" onClick={() => setMode('reply')}>
                Responder
              </button>
            )}
            {c.canEdit && (
              <button type="button" onClick={() => setMode('edit')}>
                Editar
              </button>
            )}
            {c.canDelete && (
              <button
                type="button"
                onClick={() => {
                  if (!window.confirm('Apagar este comentário?')) return;
                  api
                    .deleteComment(c.id)
                    .then(() => onRemove(c.id))
                    .catch((err: unknown) => setError(err instanceof ApiError ? err.message : 'Não foi possível apagar.'));
                }}
              >
                Apagar
              </button>
            )}
          </p>
        )}
        {error && <FormMessage kind="error">{error}</FormMessage>}

        {mode === 'reply' && onReply && (
          <Composer
            label={`Responder a ${c.author?.displayName ?? 'comentário'}`}
            submitLabel="Responder"
            autoFocus
            onCancel={() => setMode('view')}
            onSubmit={async (body) => {
              await onReply(body);
              setMode('view');
            }}
          />
        )}

        {c.replies && c.replies.length > 0 && (
          <ol className="comments__replies">
            {c.replies.map((r) => (
              <Comment
                key={r.id}
                c={r}
                canReply={false}
                onChange={(next) => onChange({ ...c, replies: c.replies!.map((x) => (x.id === next.id ? next : x)) })}
                onRemove={(id) => onChange({ ...c, replies: c.replies!.filter((x) => x.id !== id) })}
              />
            ))}
          </ol>
        )}
      </div>
    </li>
  );
}

/** Comentários no fim do artigo. Carrega só quando a seção chega perto da tela. */
export default function Comments({ slug }: { slug: string }) {
  const { user, status, forget } = useAuth();
  const { pathname } = useLocation();
  const [page, setPage] = useState<CommentPage | null>(null);
  const [state, setState] = useState<'idle' | 'ready' | 'offline'>('idle');
  const [more, setMore] = useState(false);
  const ref = useRef<HTMLElement>(null);

  const load = useCallback(async () => {
    try {
      setPage(await api.comments(slug));
      setState('ready');
    } catch {
      setState('offline');
    }
  }, [slug]);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const io = new IntersectionObserver(
      ([entry]) => {
        if (entry?.isIntersecting) {
          io.disconnect();
          void load();
        }
      },
      { rootMargin: '600px 0px' },
    );
    io.observe(el);
    return () => io.disconnect();
    // recarrega também quando a pessoa entra ou sai (muda canEdit/canDelete)
  }, [load, user?.id]);

  const handleAuthError = (err: unknown) => {
    if (err instanceof ApiError && err.status === 401) forget();
    throw err;
  };

  const add = async (body: string, parentId?: string) => {
    const { comment } = await api.addComment(slug, body, parentId).catch(handleAuthError);
    setPage((p) => {
      if (!p) return p;
      const items = parentId
        ? p.items.map((c) => (c.id === parentId ? { ...c, replies: [...(c.replies ?? []), comment] } : c))
        : [...p.items, { ...comment, replies: [] }];
      return { ...p, items, total: p.total + 1 };
    });
  };

  const replace = (next: CommentItem) =>
    setPage((p) => {
      if (!p) return p;
      const before = p.items.find((c) => c.id === next.id);
      const delta = (next.replies?.length ?? 0) - (before?.replies?.length ?? 0);
      return { ...p, items: p.items.map((c) => (c.id === next.id ? next : c)), total: p.total + delta };
    });

  const remove = (id: string) =>
    setPage((p) => {
      if (!p) return p;
      // com respostas, o principal fica como "removido" para manter a conversa
      const items = p.items.flatMap((c) =>
        c.id !== id ? [c] : c.replies?.length ? [{ ...c, deleted: true, body: '', author: null, canEdit: false, canDelete: false }] : [],
      );
      return { ...p, items, total: p.total - 1 };
    });

  const back = `?voltar=${encodeURIComponent(pathname)}`;
  const canWrite = !!user?.emailVerified;

  return (
    <section className="comments" aria-labelledby="comentarios" ref={ref}>
      <h2 id="comentarios">
        Comentários{page && page.total > 0 && <span className="comments__count">{page.total}</span>}
      </h2>

      {state === 'offline' ? (
        <FormMessage kind="info">
          Os comentários estão indisponíveis no momento.{' '}
          <button type="button" className="linklike" onClick={() => void load()}>
            Tentar de novo
          </button>
        </FormMessage>
      ) : (
        <>
          {status === 'loading' ? null : !user ? (
            <p className="comments__gate">
              <Link to={`/conta/entrar${back}`} className="btn btn--primary btn--sm">
                Entrar para comentar
              </Link>
              <span>
                ou <Link to={`/conta/criar${back}`}>criar uma conta</Link>. Ler continua livre.
              </span>
            </p>
          ) : !user.emailVerified ? (
            <FormMessage kind="info">
              Confirme seu e-mail para comentar. <Link to="/conta/perfil">Reenviar o link</Link>
            </FormMessage>
          ) : (
            <Composer label="Escreva um comentário" submitLabel="Comentar" onSubmit={(b) => add(b)} />
          )}

          {state === 'idle' && <p className="comments__empty">Carregando comentários…</p>}
          {page && page.items.length === 0 && <p className="comments__empty">Ninguém comentou ainda. Seja a primeira pessoa.</p>}

          {page && page.items.length > 0 && (
            <ol className="comments__list">
              {page.items.map((c) => (
                <Comment
                  key={c.id}
                  c={c}
                  canReply={canWrite}
                  onReply={(body) => add(body, c.id)}
                  onChange={replace}
                  onRemove={remove}
                />
              ))}
            </ol>
          )}

          {page?.nextCursor && (
            <button
              type="button"
              className="btn btn--ghost comments__more"
              disabled={more}
              onClick={() => {
                setMore(true);
                api
                  .comments(slug, page.nextCursor!)
                  .then((next) => setPage((p) => (p ? { ...next, items: [...p.items, ...next.items] } : next)))
                  .catch(() => setState('offline'))
                  .finally(() => setMore(false));
              }}
            >
              {more ? 'Carregando…' : 'Carregar mais comentários'}
            </button>
          )}
        </>
      )}
    </section>
  );
}
