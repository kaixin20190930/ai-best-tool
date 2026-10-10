import assert from 'node:assert/strict';
import fs from 'node:fs';

type Candidate = { slug: string; verdict: string };
type Snapshot = { unit: string; candidates: Candidate[] };
type State = {
  kind: 'current_operational_overlay';
  historicalSnapshot: string;
  released: Record<string, { status: 'released_monitor_noindex'; evidence: string }>;
  independentReleasesOutsideSnapshot: Record<string, { status: 'released_monitor_noindex'; evidence: string }>;
  developmentCandidates: Record<string, { status: 'ready_monitor_local_only'; evidence: string }>;
};

export default function readCurrentCandidateQueue(
  stateFile = 'data/collection/mature-candidate-current-state-2026-10-10.json',
) {
  const state = JSON.parse(fs.readFileSync(stateFile, 'utf8')) as State;
  assert.equal(state.kind, 'current_operational_overlay');
  const snapshot = JSON.parse(fs.readFileSync(state.historicalSnapshot, 'utf8')) as Snapshot;
  assert.equal(snapshot.unit, 'OPS-RESET-01-CANDIDATE-BUFFER-AND-TASK-AUDIT');
  const slugs = new Set(snapshot.candidates.map((candidate) => candidate.slug));
  for (const slug of Object.keys(state.released))
    assert(slugs.has(slug), `${slug}: released overlay missing historical row`);
  for (const slug of Object.keys(state.independentReleasesOutsideSnapshot)) {
    assert(!slugs.has(slug), `${slug}: independent release must not be inserted into historical snapshot`);
  }
  const released = new Set([...Object.keys(state.released), ...Object.keys(state.independentReleasesOutsideSnapshot)]);
  return snapshot.candidates
    .filter((candidate) => !released.has(candidate.slug))
    .map((candidate) => ({
      slug: candidate.slug,
      status: state.developmentCandidates[candidate.slug]?.status || candidate.verdict,
      historicalVerdict: candidate.verdict,
      sourceKind: 'current_operational_overlay' as const,
    }));
}
