import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { FormMessage } from '../components/Form';
import { ApiError, api, type PublicUser } from '../lib/api';
import { initials } from '../lib/auth';
import { formatDate, getPost } from '../lib/posts';
import { useTitle } from '../lib/useTitle';
import NotFound from './NotFound';

type Data = Awaited<ReturnType<typeof api.profile>>;

export default function Profile() {
  const { username = '' } = useParams();
  const [data, setData] = useState<Data | null>(null);
  const [error, setError] = useState<ApiError | null>(null);
  useTitle(data ? `${data.user.displayName} (@${data.user.username})` : `@${username}`);

  useEffect(() => {
    let alive = true;
    api
      .profile(username)
      .then((d) => alive && setData(d))
      .catch((e: unknown) => alive && setError(e instanceof ApiError ? e : new ApiError(0, 'offline', 'Erro')));
    return () => {
      alive = false;
    };
  }, [username]);

  if (error?.status === 404) return <NotFound what="Perfil" />;
  if (error) {
    return (
      <div className="wrap account">
        <FormMessage kind="error">{error.message}</FormMessage>
      </div>
    );
  }
  if (!data) return <div className="wrap account" aria-busy="true" />;

  const u: PublicUser = data.user;
  const site = u.website ? new URL(u.website) : null;
  return (
    <div className="wrap profile">
      <header className="page-head profile__head">
        <span className="avatar avatar--lg" aria-hidden="true">
          {initials(u.displayName)}
        </span>
        <div>
          <h1>{u.displayName}</h1>
          <p className="profile__meta">
            <span>@{u.username}</span>
            <span>desde {formatDate(u.createdAt.slice(0, 10), 'medium')}</span>
            {site && (
              <a href={u.website!} rel="nofollow noopener noreferrer ugc" target="_blank">
                {site.host}
                {site.pathname !== '/' ? site.pathname : ''}
              </a>
            )}
          </p>
          {u.bio && <p className="profile__bio">{u.bio}</p>}
        </div>
      </header>

      <section className="profile__recent" aria-labelledby="recentes">
        <h2 id="recentes">Comentários recentes</h2>
        {data.recentComments.length === 0 ? (
          <p className="comments__empty">Nenhum comentário ainda.</p>
        ) : (
          <ol className="profile__list">
            {data.recentComments.map((c) => {
              const post = getPost(c.postSlug);
              return (
                <li key={c.id}>
                  <Link to={`/posts/${c.postSlug}`} className="profile__post">
                    {post?.title ?? c.postSlug}
                  </Link>
                  <time dateTime={c.createdAt}>{formatDate(c.createdAt.slice(0, 10), 'medium')}</time>
                  <p className="comment__body">{c.body.length > 280 ? `${c.body.slice(0, 280)}…` : c.body}</p>
                </li>
              );
            })}
          </ol>
        )}
      </section>
    </div>
  );
}
