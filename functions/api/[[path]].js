const BACKEND_URL = 'https://calendariobrasil.onrender.com';

const ROTAS_PUBLICAS = new Set([
  '/api/v1/feriados',
  '/api/v1/feriados/nacionais/fixos',
  '/api/v1/datas-moveis',
  '/api/v1/eventos',
  '/api/v1/cobertura-estadual',
  '/api/v1/databricks/status'
]);

export async function onRequest({ request }) {
  if (request.method !== 'GET') {
    return new Response('Método não permitido.', {
      status: 405,
      headers: { 'Allow': 'GET' }
    });
  }

  const url = new URL(request.url);

  if (!ROTAS_PUBLICAS.has(url.pathname)) {
    return new Response('Endpoint não encontrado.', { status: 404 });
  }

  const destino = new URL(url.pathname + url.search, BACKEND_URL);

  try {
    const resposta = await fetch(destino.toString(), {
      method: 'GET',
      headers: { 'Accept': 'application/json' },
      redirect: 'manual'
    });

    if (resposta.status >= 300 && resposta.status < 400) {
      return Response.json(
        { mensagem: 'O backend retornou um redirecionamento inesperado.' },
        { status: 502 }
      );
    }

    const headers = new Headers({
      'Content-Type': resposta.headers.get('Content-Type') ?? 'application/json',
      'Cache-Control': 'no-store',
      'X-Content-Type-Options': 'nosniff'
    });

    return new Response(resposta.body, {
      status: resposta.status,
      headers
    });
  } catch {
    return Response.json(
      { mensagem: 'Não foi possível comunicar com a API CalendarioBrasil. O serviço pode estar iniciando.' },
      { status: 502, headers: { 'Cache-Control': 'no-store' } }
    );
  }
}