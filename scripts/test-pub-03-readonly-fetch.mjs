import assert from 'node:assert/strict';

import { assertProductionOrigin, createReadOnlyFetch, nativeReadOnlyGet } from './pub-03-readonly-fetch-core.mjs';

const timeout = Object.assign(new Error('fetch failed'), { cause: { code: 'UND_ERR_CONNECT_TIMEOUT' } });
const logs = [];
const calls = [];
const original = async (input, init) => {
  calls.push({ input, init });
  if ((input instanceof Request ? input.url : String(input)).includes('aibesttool.com')) throw timeout;
  return new Response('original', { status: 200 });
};
const fallback = async (input, init) => {
  calls.push({ fallback: true, input, init });
  return new Response('fallback', { status: 200 });
};
const guarded = createReadOnlyFetch(original, fallback, (entry) => logs.push(entry));

for (const method of ['GET', 'HEAD']) {
  const result = await guarded('https://aibesttool.com/ai/chatgpt', { method });
  assert.equal(await result.text(), 'fallback');
}
assert.equal(calls.filter((call) => call.fallback).length, 2);
assert.equal(calls.filter((call) => !call.fallback).length, 0, 'Production host must avoid Undici connect timeout path');
assert.equal(await (await guarded('https://example.com/other')).text(), 'original');
const callsBeforeBadPort = calls.length;
for (const method of ['GET', 'HEAD']) {
  await assert.rejects(guarded('https://aibesttool.com:8443/ai/chatgpt', { method }), /exact https:\/\/aibesttool\.com origin/);
}
assert.equal(calls.length, callsBeforeBadPort, 'Non-default port must fail before either transport');
assertProductionOrigin(new URL('https://aibesttool.com:443/ai/chatgpt'));
assert.throws(() => assertProductionOrigin(new URL('https://aibesttool.com:8443/ai/chatgpt', 'https://aibesttool.com/ai/chatgpt')), /exact https:\/\/aibesttool\.com origin/, 'Redirect to a non-default port must fail');
for (const method of ['POST', 'PUT', 'PATCH', 'DELETE']) {
  await assert.rejects(guarded('https://aibesttool.com/ai/chatgpt', { method }), /blocked an outgoing write/);
}
for (const method of ['GET', 'HEAD']) {
  await assert.rejects(guarded('https://aibesttool.com/rest/v1/rpc/audit', { method }), /blocked an outgoing write/);
}
const request = new Request('https://aibesttool.com/rest/v1/tools', { method: 'HEAD' });
assert.equal(await (await guarded(request)).text(), 'fallback');
assert.deepEqual(logs.at(-1), { method: 'HEAD', path: '/rest/v1/tools', forwarded: true });
assert.equal(logs.filter((entry) => entry.forwarded === false).length, 6);

let fallbackCount = 0;
const noFallback = createReadOnlyFetch(async () => { throw timeout; }, async () => { fallbackCount += 1; });
await assert.rejects(noFallback('https://other.example/ai/chatgpt'), (error) => error === timeout);
await assert.rejects(noFallback('http://aibesttool.com/ai/chatgpt'), (error) => error === timeout);
const abort = new AbortController();
abort.abort();
await assert.rejects(noFallback('https://aibesttool.com/ai/chatgpt', { signal: abort.signal }), (error) => error === abort.signal.reason);
assert.equal(fallbackCount, 0, 'Production transport may only run for active HTTPS GET/HEAD to the exact production host');

for (const [url, method] of [
  ['https://aibesttool.com/rest/v1/rpc/audit', 'GET'],
  ['https://aibesttool.com/ai/chatgpt', 'POST'],
]) await assert.rejects(nativeReadOnlyGet(url, { method }), /fallback only permits/);
await assert.rejects(nativeReadOnlyGet('https://example.com/ai/chatgpt', { method: 'GET' }), /exact https:\/\/aibesttool\.com origin/);
await assert.rejects(nativeReadOnlyGet('https://aibesttool.com:8443/ai/chatgpt', { method: 'GET' }), /exact https:\/\/aibesttool\.com origin/);

if (process.argv.includes('--online')) {
  const productionGuard = createReadOnlyFetch(async () => { throw timeout; });
  for (const [url, method] of [
    ['https://aibesttool.com/robots.txt', 'GET'],
    ['https://aibesttool.com/ai/chatgpt', 'HEAD'],
  ]) {
    const response = await productionGuard(url, { method, signal: AbortSignal.timeout(30_000) });
    assert.equal(response.status, 200, `${method} ${url} protected host transport failed`);
  }
}

console.log('✅ PUB-03 guarded fetch routes only production GET/HEAD through native HTTPS; writes and RPC remain blocked');
