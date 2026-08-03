-- Repair installations that applied the distribution workspace migration
-- without the expanded task lifecycle and writable event policy.

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

DROP POLICY IF EXISTS "Users can view own distribution task events" ON distribution_task_events;
DROP POLICY IF EXISTS "Users can manage own distribution task events" ON distribution_task_events;
CREATE POLICY "Users can manage own distribution task events" ON distribution_task_events
  FOR ALL
  USING (
    auth.uid() = owner_id
    AND EXISTS (
      SELECT 1
      FROM distribution_projects project
      WHERE project.id = project_id AND project.owner_id = auth.uid()
    )
  )
  WITH CHECK (
    auth.uid() = owner_id
    AND EXISTS (
      SELECT 1
      FROM distribution_projects project
      WHERE project.id = project_id AND project.owner_id = auth.uid()
    )
  );

-- Recover packages that were saved before the legacy status constraint rejected
-- the corresponding task transition.
UPDATE distribution_tasks task
SET
  status = 'ready_to_submit',
  blocked_reason = NULL,
  updated_at = NOW()
WHERE task.status IN ('planned', 'in_progress', 'needs_assets')
  AND EXISTS (
    SELECT 1
    FROM distribution_packages package
    WHERE package.task_id = task.id
      AND package.owner_id = task.owner_id
      AND package.generation_status = 'ready'
  );

COMMENT ON COLUMN distribution_tasks.status IS
  'Human-led distribution lifecycle: planned, in_progress, needs_assets, ready_to_submit, submitted, waiting_review, live, follow_up, blocked, done, skipped.';
