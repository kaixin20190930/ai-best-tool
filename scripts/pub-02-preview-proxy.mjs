// Local verification proxy: never forward analytics, monitor routes, or write requests.
import { appendFileSync } from 'node:fs';
import http from 'node:http';

const upstreamPort = Number(process.env.PUB02_UPSTREAM_PORT || 3026);
const port = Number(process.env.PUB02_PREVIEW_PORT || 3027);
const log = process.env.PUB02_BLOCK_LOG || '/tmp/pub-02-blocked-requests.jsonl';
http
  .createServer((req, res) => {
    const url = new URL(req.url, 'http://127.0.0.1');
    if (
      url.pathname.startsWith('/api/analytics/') ||
      url.pathname.startsWith('/api/monitor/') ||
      !['GET', 'HEAD'].includes(req.method)
    ) {
      appendFileSync(
        log,
        JSON.stringify({ time: new Date().toISOString(), method: req.method, path: url.pathname, forwarded: false }) +
          '\n',
      );
      res.writeHead(204, { 'x-pub02-blocked': 'true' });
      res.end();
      return;
    }
    const upstream = http.request(
      {
        host: '127.0.0.1',
        port: upstreamPort,
        path: req.url,
        method: req.method,
        headers: { ...req.headers, host: `127.0.0.1:${port}` },
      },
      (response) => {
        res.writeHead(response.statusCode, {
          ...response.headers,
          // QA only: prevent third-party analytics scripts and network beacons.
          'content-security-policy': "connect-src 'self'; script-src 'self' 'unsafe-inline' 'unsafe-eval'",
        });
        response.pipe(res);
      },
    );
    upstream.on('error', () => {
      res.writeHead(502);
      res.end('Local preview unavailable');
    });
    req.pipe(upstream);
  })
  .listen(port, '127.0.0.1', () =>
    console.log(`Read-only preview proxy on ${port}; upstream ${upstreamPort}; writes blocked before upstream.`),
  );
