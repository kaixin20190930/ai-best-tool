import assert from 'node:assert/strict';

import { clusters, verifyClusterSnapshot } from './verify-decision-cl07-closeout-readonly';

for (const cluster of clusters) {
  const baseline = {
    task: { id: cluster.taskId, status: 'active' },
    taskCapabilities: Array.from({ length: 2 }, (_, index) => ({
      capability_id: `cap-${index}`,
      status: cluster.expected.task,
    })),
    toolCapabilities: Array.from({ length: cluster.expected.toolCount }, (_, index) => ({
      tool_id: cluster.tools[index],
      status: cluster.expected.tool,
    })),
    fits: Array.from({ length: cluster.expected.fitCount }, (_, index) => ({
      tool_id: cluster.tools[index],
      status: cluster.expected.fit,
    })),
  };
  verifyClusterSnapshot(cluster, baseline);
  assert.throws(
    () => verifyClusterSnapshot(cluster, { ...baseline, taskCapabilities: baseline.taskCapabilities.slice(0, 1) }),
    /Task Capability count/,
  );
  assert.throws(
    () =>
      verifyClusterSnapshot(cluster, {
        ...baseline,
        taskCapabilities: baseline.taskCapabilities.map((row) => ({
          ...row,
          status: row.status === 'published' ? 'reviewed' : 'published',
        })),
      }),
    /Task Capability status/,
  );
  if (cluster.expected.fitCount) {
    assert.throws(
      () =>
        verifyClusterSnapshot(cluster, {
          ...baseline,
          fits: baseline.fits.map((row) => ({ ...row, status: row.status === 'published' ? 'reviewed' : 'published' })),
        }),
      /Fit status/,
    );
  } else {
    assert.throws(
      () => verifyClusterSnapshot(cluster, { ...baseline, fits: [{ tool_id: cluster.tools[0], status: 'reviewed' }] }),
      /Fit count/,
    );
  }
}

console.log('CL-07 closeout status and zero-relation regression tests passed');
