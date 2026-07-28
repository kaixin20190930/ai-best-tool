-- Expand distribution task lifecycle to cover the real human workflow.

ALTER TABLE distribution_tasks DROP CONSTRAINT IF EXISTS distribution_tasks_status_check;
ALTER TABLE distribution_tasks
  ADD CONSTRAINT distribution_tasks_status_check
  CHECK (
    status IN (
      'planned',
      'in_progress',
      'needs_assets',
      'ready_to_submit',
      'submitted',
      'waiting_review',
      'live',
      'follow_up',
      'blocked',
      'done',
      'skipped'
    )
  );

COMMENT ON COLUMN distribution_tasks.status IS 'Human-led distribution lifecycle: planned, in_progress, needs_assets, ready_to_submit, submitted, waiting_review, live, follow_up, blocked, done, skipped.';
