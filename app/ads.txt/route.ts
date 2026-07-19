const ADS_TXT = 'google.com, pub-5252543031076112, DIRECT, f08c47fec0942fa0\n';

export const dynamic = 'force-static';

export function GET() {
  return new Response(ADS_TXT, {
    headers: {
      'Content-Type': 'text/plain; charset=utf-8',
      'Cache-Control': 'public, max-age=300, s-maxage=3600',
    },
  });
}
