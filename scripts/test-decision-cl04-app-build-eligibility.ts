import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';

const seed = readFileSync('db/supabase/manual/20260923_seed_decision_graph_first_batch.sql', 'utf8');
const packet = readFileSync('docs/DECISION_GRAPH_CL04_APP_BUILD_ELIGIBILITY_2026-09-27_CN.md', 'utf8');
const verifier = readFileSync('scripts/verify-decision-cl04-app-build-readonly.ts', 'utf8');

assert.match(seed, /'build-app-with-ai'[^\n]*'ai-assisted-app-development'[^\n]*'required'/);
assert.match(seed, /'build-app-with-ai'[^\n]*'developer-workflow-integration'[^\n]*'preferred'/);
assert.ok(/'build-app-with-ai'[^\n]*"output":"application"/.test(seed), 'Task output must remain an application');

const seededToolRelations = [...seed.matchAll(/'([0-9a-f-]{36})'::uuid, 'build-app-with-ai', '([^']+)'/g)];
assert.equal(seededToolRelations.length, 2, 'Only two existing app-build tool relations may be assessed');
assert.ok(seededToolRelations.every((match) => match[2] === 'developer-workflow-integration'));
assert.deepEqual(
  new Set(seededToolRelations.map((match) => match[1])),
  new Set(['23bb3601-a5ac-42c3-bff3-64b06a063959', 'f77fb817-e8dc-4c22-b7cd-8edc2e5b0a5e']),
);

assert.match(packet, /n8n \| \*\*`withdraw`\*\*/);
assert.match(packet, /OpenRouter \| \*\*`withdraw`\*\*/);
assert.match(packet, /`availability\/plan\/limitation`/);
assert.match(packet, /生产关系 HOLD、未发布/);
assert.match(packet, /Task Page 继续 404/);
assert.doesNotMatch(packet, /production manifest|发布清单\s*[:：]\s*\[/i);

assert.match(verifier, /BEGIN READ ONLY/);
assert.match(verifier, /productionWrites: 0/);
assert.doesNotMatch(verifier, /\.insert\(|\.update\(|\.delete\(|\.upsert\(|\.rpc\(/);

console.log('PASS CL-04 app-build eligibility boundaries and read-only verifier');
