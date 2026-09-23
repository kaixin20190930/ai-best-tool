import getPublicTaskPage from '@/lib/services/decision/taskPage';

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

async function check(request: Request, { params }: { params: { slug: string } }) {
  if (request.method !== 'GET' && request.method !== 'HEAD') {
    return new Response(null, { status: 405, headers: { Allow: 'GET, HEAD' } });
  }
  const eligible = await getPublicTaskPage(params.slug, 'en');
  return new Response(null, {
    status: eligible ? 204 : 404,
    headers: { 'Cache-Control': 'private, no-store', 'X-Robots-Tag': 'noindex, follow' },
  });
}

export const GET = check;
export const HEAD = check;
