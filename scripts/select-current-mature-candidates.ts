import readCurrentCandidateQueue from './mature-candidate-current-state';

const queue = readCurrentCandidateQueue();
const nextDevelopmentCandidate =
  queue.find((candidate) => candidate.status === 'ready_monitor_local_only')?.slug || null;

process.stdout.write(
  `${JSON.stringify(
    {
      source: 'current_operational_overlay',
      nextDevelopmentCandidate,
      newToolCandidates: queue,
    },
    null,
    2,
  )}\n`,
);
