/* Cliente da API de contas e comentários (repositório blog-dev-vite-api).
   Em produção o Cloudflare Pages repassa /api para a API; em dev, o proxy do Vite. */

export interface User {
  id: string;
  email: string;
  username: string;
  displayName: string;
  bio: string;
  website: string | null;
  role: 'USER' | 'ADMIN';
  emailVerified: boolean;
  createdAt: string;
}

export interface PublicUser {
  username: string;
  displayName: string;
  bio: string;
  website: string | null;
  createdAt: string;
}

export interface CommentItem {
  id: string;
  parentId: string | null;
  body: string;
  deleted: boolean;
  author: { username: string; displayName: string } | null;
  createdAt: string;
  editedAt: string | null;
  canEdit: boolean;
  canDelete: boolean;
  replies?: CommentItem[];
}

export interface CommentPage {
  items: CommentItem[];
  total: number;
  nextCursor: string | null;
}

export class ApiError extends Error {
  readonly status: number;
  readonly code: string;
  readonly fields: Record<string, string>;

  constructor(status: number, code: string, message: string, fields: Record<string, string> = {}) {
    super(message);
    this.status = status;
    this.code = code;
    this.fields = fields;
  }

  /** A API não respondeu (servidor de casa fora do ar, sem internet etc.). */
  get offline(): boolean {
    return this.status === 0 || this.status === 502 || this.status === 503 || this.status === 504;
  }
}

async function request<T>(method: string, path: string, body?: unknown): Promise<T> {
  let res: Response;
  try {
    res = await fetch(`/api${path}`, {
      method,
      credentials: 'same-origin',
      headers: body === undefined ? undefined : { 'content-type': 'application/json' },
      body: body === undefined ? undefined : JSON.stringify(body),
    });
  } catch {
    throw new ApiError(0, 'offline', 'Não foi possível falar com o servidor. Tente de novo em instantes.');
  }
  if (res.status === 204) return undefined as T;
  const data = (await res.json().catch(() => null)) as
    | (T & { error?: string; message?: string; fields?: Record<string, string> })
    | null;
  if (!res.ok) {
    const fallback = res.status >= 500 ? 'Serviço indisponível no momento.' : 'Algo deu errado.';
    throw new ApiError(res.status, data?.error ?? 'unknown', data?.message ?? fallback, data?.fields);
  }
  return data as T;
}

const enc = encodeURIComponent;

export const api = {
  me: () => request<{ user: User }>('GET', '/me'),
  register: (b: { email: string; username: string; displayName: string; password: string }) =>
    request<{ user: User }>('POST', '/auth/register', b),
  login: (b: { email: string; password: string }) => request<{ user: User }>('POST', '/auth/login', b),
  logout: () => request<void>('POST', '/auth/logout'),
  verify: (token: string) => request<void>('POST', '/auth/verify', { token }),
  resendVerify: () => request<void>('POST', '/auth/verify/resend'),
  forgot: (email: string) => request<void>('POST', '/auth/forgot', { email }),
  reset: (token: string, password: string) => request<void>('POST', '/auth/reset', { token, password }),

  updateProfile: (b: Partial<Pick<User, 'username' | 'displayName' | 'bio'>> & { website?: string }) =>
    request<{ user: User }>('PATCH', '/me', b),
  changePassword: (currentPassword: string, newPassword: string) =>
    request<void>('POST', '/me/password', { currentPassword, newPassword }),
  deleteAccount: (password: string) => request<void>('DELETE', '/me', { password }),
  profile: (username: string) =>
    request<{
      user: PublicUser;
      recentComments: { id: string; postSlug: string; body: string; createdAt: string }[];
    }>('GET', `/users/${enc(username)}`),

  comments: (slug: string, cursor?: string) =>
    request<CommentPage>('GET', `/posts/${enc(slug)}/comments${cursor ? `?cursor=${enc(cursor)}` : ''}`),
  addComment: (slug: string, body: string, parentId?: string) =>
    request<{ comment: CommentItem }>('POST', `/posts/${enc(slug)}/comments`, { body, parentId }),
  editComment: (id: string, body: string) => request<{ comment: CommentItem }>('PATCH', `/comments/${enc(id)}`, { body }),
  deleteComment: (id: string) => request<void>('DELETE', `/comments/${enc(id)}`),
};
