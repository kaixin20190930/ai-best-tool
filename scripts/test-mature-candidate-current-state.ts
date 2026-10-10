import assert from 'node:assert/strict';
import fs from 'node:fs';

import readCurrentCandidateQueue from './mature-candidate-current-state';

const queue = readCurrentCandidateQueue();
const snapshot = JSON.parse(fs.readFileSync('data/collection/mature-candidate-buffer-2026-10-06.json', 'utf8'));
const state = JSON.parse(fs.readFileSync('data/collection/mature-candidate-current-state-2026-10-10.json', 'utf8'));
assert.equal(snapshot.candidates.length, 15);
assert.equal(queue.length, 12);
for (const slug of ['elicit', 'murf', 'pika', 'chatgpt']) {
  assert(!queue.some((candidate) => candidate.slug === slug), `${slug} reentered new-tool queue`);
}
assert.deepEqual(Object.keys(state.released).sort(), ['elicit', 'murf', 'pika']);
assert.deepEqual(Object.keys(state.independentReleasesOutsideSnapshot), ['chatgpt']);
assert.equal(queue.find((candidate) => candidate.slug === 'scite')?.status, 'ready_monitor_local_only');
assert.equal(
  snapshot.candidates.find((candidate: { slug: string }) => candidate.slug === 'scite')?.verdict,
  'HOLD_EVIDENCE',
);
console.log('PASS current candidate overlay preserves historical snapshot and excludes released entities');
