// Installed before Next.js/Supabase. PostgREST writes and all other outgoing write fetches fail before network IO.
import { appendFileSync } from 'node:fs';
import { createReadOnlyFetch } from './pub-03-readonly-fetch-core.mjs';

const originalFetch = globalThis.fetch;
const log = process.env.PUB03_FETCH_LOG || '/tmp/pub-03-server-fetch.jsonl';
globalThis.fetch = createReadOnlyFetch(originalFetch, undefined, (entry) => {
  appendFileSync(log, JSON.stringify(entry) + '\n');
});
