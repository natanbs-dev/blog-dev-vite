/**
 * Cloudflare Pages Function: repassa /api/* para a API no notebook (Tailscale Funnel).
 * Assim o blog e a API ficam no mesmo endereço e o cookie de login é de primeira parte.
 *
 * Variáveis no painel do Cloudflare Pages (Settings → Variables and Secrets):
 *   API_ORIGIN   = https://<maquina>.<tailnet>.ts.net
 *   PROXY_SECRET = o mesmo PROXY_SECRET da API (tipo "Secret")
 */
interface Env {
  API_ORIGIN: string;
  PROXY_SECRET: string;
}

const unavailable = () =>
  Response.json(
    { error: 'unavailable', message: 'Contas e comentários estão fora do ar no momento. Tente mais tarde.' },
    { status: 503, headers: { 'cache-control': 'no-store' } },
  );

export async function onRequest({ request, env }: { request: Request; env: Env }): Promise<Response> {
  if (!env.API_ORIGIN || !env.PROXY_SECRET) return unavailable();

  const url = new URL(request.url);
  const target = new URL(url.pathname + url.search, env.API_ORIGIN);

  const headers = new Headers(request.headers);
  // o cliente não pode forjar estes dois: sempre sobrescritos aqui
  headers.set('x-proxy-secret', env.PROXY_SECRET);
  headers.set('x-real-ip', request.headers.get('cf-connecting-ip') ?? 'unknown');
  headers.delete('host');

  try {
    const res = await fetch(target, {
      method: request.method,
      headers,
      body: request.method === 'GET' || request.method === 'HEAD' ? undefined : request.body,
      redirect: 'manual',
      signal: AbortSignal.timeout(8000),
    });
    // a API respondeu: devolve como veio (inclusive Set-Cookie)
    return new Response(res.body, res);
  } catch {
    return unavailable();
  }
}
