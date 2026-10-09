import https from 'node:https';

const READ_ONLY_METHODS = new Set(['GET', 'HEAD']);
const FALLBACK_HOST = 'aibesttool.com';

function requestMethod(input, init) {
  return String(init?.method || (input instanceof Request ? input.method : 'GET')).toUpperCase();
}

function requestUrl(input) {
  return new URL(input instanceof Request ? input.url : String(input));
}

export function createReadOnlyFetch(originalFetch, productionHostFetch = nativeReadOnlyGet, logRequest = () => {}) {
  return async (input, init) => {
    const method = requestMethod(input, init);
    const url = requestUrl(input);
    if (!READ_ONLY_METHODS.has(method) || url.pathname.startsWith('/rest/v1/rpc/')) {
      logRequest({ method, path: url.pathname, forwarded: false });
      throw new Error('PUB-03 read-only verification blocked an outgoing write request.');
    }
    if (url.pathname.startsWith('/rest/v1/')) logRequest({ method, path: url.pathname, forwarded: true });
    const signal = init?.signal || (input instanceof Request ? input.signal : null);
    if (signal?.aborted) throw signal.reason;
    if (url.protocol === 'https:' && url.hostname === FALLBACK_HOST) return productionHostFetch(input, init);
    return originalFetch(input, init);
  };
}

export async function nativeReadOnlyGet(input, init, redirects = 0) {
  const method = requestMethod(input, init);
  const url = requestUrl(input);
  if (!READ_ONLY_METHODS.has(method) || url.protocol !== 'https:' || url.hostname !== FALLBACK_HOST || url.pathname.startsWith('/rest/v1/rpc/')) {
    throw new Error('PUB-03 fallback only permits aibesttool.com GET/HEAD outside RPC.');
  }
  if (redirects > 5) throw new Error('PUB-03 fallback redirect limit exceeded.');
  const headers = new Headers(input instanceof Request ? input.headers : undefined);
  if (init?.headers) new Headers(init.headers).forEach((value, key) => headers.set(key, value));
  const signal = init?.signal || (input instanceof Request ? input.signal : undefined);
  return new Promise((resolve, reject) => {
    const request = https.request(url, {
      method,
      headers: Object.fromEntries(headers),
      family: 4,
      timeout: 30_000,
      signal,
    }, async (response) => {
      const chunks = [];
      response.on('data', (chunk) => chunks.push(chunk));
      response.on('error', reject);
      response.on('end', async () => {
        const status = response.statusCode || 0;
        const location = response.headers.location;
        if (location && [301, 302, 303, 307, 308].includes(status) && init?.redirect !== 'manual') {
          if (init?.redirect === 'error') return reject(new Error('PUB-03 fallback redirect rejected'));
          const next = new URL(location, url);
          if (next.protocol !== 'https:' || next.hostname !== FALLBACK_HOST) return reject(new Error('PUB-03 fallback cross-host redirect rejected'));
          try { return resolve(await nativeReadOnlyGet(next.href, { ...init, method, headers, signal }, redirects + 1)); }
          catch (error) { return reject(error); }
        }
        const responseHeaders = new Headers();
        for (const [key, value] of Object.entries(response.headers)) {
          if (Array.isArray(value)) value.forEach((part) => responseHeaders.append(key, part));
          else if (value !== undefined) responseHeaders.set(key, value);
        }
        resolve(new Response(method === 'HEAD' || [204, 205, 304].includes(status) ? null : Buffer.concat(chunks), { status, headers: responseHeaders }));
      });
    });
    request.on('timeout', () => request.destroy(new Error('PUB-03 fallback connection timed out')));
    request.on('error', reject);
    request.end();
  });
}
