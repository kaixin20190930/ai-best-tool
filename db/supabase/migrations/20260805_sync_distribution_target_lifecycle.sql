-- Keep target opportunity cards aligned with the latest target-bound task.
-- This repairs rows created before task lifecycle status was synchronized.
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
    WHEN 'skipped' THEN 'skipped'
    WHEN 'planned' THEN 'accepted'
    ELSE 'in_progress'
  END,
  last_submission_at = CASE
    WHEN latest_target_task.status IN ('submitted', 'waiting_review', 'live', 'follow_up', 'done') THEN NOW()
    ELSE project_target.last_submission_at
  END,
  updated_at = NOW()
FROM latest_target_task
WHERE project_target.project_id = latest_target_task.project_id
  AND project_target.target_id = latest_target_task.target_id
  AND project_target.owner_id = latest_target_task.owner_id;

-- A live listing should no longer request submission-stage follow-ups.
UPDATE distribution_reminders reminder
SET status = 'cancelled', updated_at = NOW()
FROM distribution_tasks task
WHERE reminder.task_id = task.id
  AND reminder.status = 'scheduled'
  AND reminder.reminder_type IN ('submission_check_3d', 'submission_check_7d')
  AND task.status IN ('live', 'done');
