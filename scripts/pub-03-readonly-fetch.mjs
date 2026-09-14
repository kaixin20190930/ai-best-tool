// Installed before Next.js/Supabase. PostgREST writes and all other outgoing write fetches fail before network IO.
import { appendFileSync } from 'node:fs';

const originalFetch = globalThis.fetch;
const log = process.env.PUB03_FETCH_LOG || '/tmp/pub-03-server-fetch.jsonl';
globalThis.fetch = async (input, init) => {
  const method = String(init?.method || (input instanceof Request ? input.method : 'GET')).toUpperCase();
  const url = new URL(input instanceof Request ? input.url : String(input));
  if (!['GET', 'HEAD'].includes(method) || url.pathname.startsWith('/rest/v1/rpc/')) {
    appendFileSync(log, JSON.stringify({ method, path: url.pathname, forwarded: false }) + '\n');
    throw new Error('PUB-03 read-only verification blocked an outgoing write request.');
  }
  if (url.pathname.startsWith('/rest/v1/'))
    appendFileSync(log, JSON.stringify({ method, path: url.pathname, forwarded: true }) + '\n');
  return originalFetch(input, init);
};
