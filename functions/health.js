const BACKEND_URL = 'https://calendariobrasil.onrender.com/health';

export async function onRequestGet() {
  const headers = { 'Cache-Control': 'no-store' };

  try {
    const resposta = await fetch(BACKEND_URL, {
      method: 'GET',
      headers: { 'Accept': 'application/json' },
      redirect: 'manual'
    });

    if (resposta.status === 429) {
      return Response.json({ status: 'rate_limited' }, { status: 429, headers });
    }

    if (!resposta.ok) {
      return Response.json({ status: 'starting' }, { status: 503, headers });
    }

    const dados = await resposta.json().catch(() => null);

    if (dados?.status !== 'healthy') {
      return Response.json({ status: 'starting' }, { status: 503, headers });
    }

    return Response.json({ status: 'healthy' }, { status: 200, headers });
  } catch {
    return Response.json({ status: 'starting' }, { status: 503, headers });
  }
}