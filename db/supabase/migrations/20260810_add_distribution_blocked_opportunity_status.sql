-- A selected target can be temporarily blocked by payment, account, CAPTCHA,
-- or editorial requirements. Preserve that state instead of showing it as active.
ALTER TABLE distribution_project_targets
  DROP CONSTRAINT IF EXISTS distribution_project_targets_opportunity_status_check;

ALTER TABLE distribution_project_targets
  ADD CONSTRAINT distribution_project_targets_opportunity_status_check
  CHECK (
    opportunity_status IN (
      'recommended',
      'accepted',
      'later',
      'in_progress',
      'submitted',
      'live',
      'blocked',
      'rejected',
      'skipped'
    )
  );

-- Backfill each existing opportunity from its most recently updated target task.
WITH latest_target_task AS (
  SELECT DISTINCT ON (project_id, target_id, owner_id)
    project_id,
    target_id,
    owner_id,
    status
  FROM distribution_tasks
  WHERE target_id IS NOT NULL
  ORDER BY project_id, target_id, owner_id, updated_at DESC NULLS LAST, created_at DESC
)
UPDATE distribution_project_targets project_target
SET
  opportunity_status = CASE latest_target_task.status
    WHEN 'live' THEN 'live'
    WHEN 'done' THEN 'live'
    WHEN 'submitted' THEN 'submitted'
    WHEN 'waiting_review' THEN 'submitted'
    WHEN 'follow_up' THEN 'submitted'
    WHEN 'blocked' THEN 'blocked'
    WHEN 'skipped' THEN 'skipped'
    WHEN 'planned' THEN 'accepted'
    ELSE 'in_progress'
  END,
  updated_at = NOW()
FROM latest_target_task
WHERE project_target.project_id = latest_target_task.project_id
  AND project_target.target_id = latest_target_task.target_id
  AND project_target.owner_id = latest_target_task.owner_id;
