import assert from 'node:assert/strict';
import { spawnSync } from 'node:child_process';
import fs from 'node:fs';

import readCurrentCandidateQueue from './mature-candidate-current-state';

const queue = readCurrentCandidateQueue();
const snapshot = JSON.parse(fs.readFileSync('data/collection/mature-candidate-buffer-2026-10-06.json', 'utf8'));
const state = JSON.parse(fs.readFileSync('data/collection/mature-candidate-current-state-2026-10-10.json', 'utf8'));
assert.equal(snapshot.candidates.length, 15);
assert.equal(queue.length, 11);
for (const slug of ['elicit', 'murf', 'pika', 'scite', 'chatgpt']) {
  assert(!queue.some((candidate) => candidate.slug === slug), `${slug} reentered new-tool queue`);
}
assert.deepEqual(Object.keys(state.released).sort(), ['elicit', 'murf', 'pika', 'scite']);
assert.deepEqual(Object.keys(state.independentReleasesOutsideSnapshot), ['chatgpt']);
assert.equal(
  queue.find((candidate) => candidate.slug === 'scite'),
  undefined,
);
assert.equal(
  snapshot.candidates.find((candidate: { slug: string }) => candidate.slug === 'scite')?.verdict,
  'HOLD_EVIDENCE',
);
const command = spawnSync('pnpm', ['--silent', 'run', 'collection:current-mature-queue'], { encoding: 'utf8' });
assert.equal(command.status, 0, command.stderr || command.stdout);
const operational = JSON.parse(command.stdout);
assert.equal(operational.source, 'current_operational_overlay');
assert.equal(operational.nextDevelopmentCandidate, null, 'no remaining candidate has passed the current release gate');
assert.deepEqual(operational.newToolCandidates, queue);
for (const slug of ['elicit', 'murf', 'pika', 'scite', 'chatgpt']) {
  assert(!operational.newToolCandidates.some((candidate: { slug: string }) => candidate.slug === slug));
}
console.log('PASS current candidate overlay preserves historical snapshot and excludes released entities');
