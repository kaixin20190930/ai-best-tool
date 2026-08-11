-- Ensure distribution_tasks.target_id maps to distribution_targets and is cacheable by PostgREST.
-- This also protects against orphaned target references that could cause join/query issues.

UPDATE distribution_tasks
SET target_id = NULL
WHERE target_id IS NOT NULL
  AND NOT EXISTS (
    SELECT 1
    FROM distribution_targets dt
    WHERE dt.id = distribution_tasks.target_id
  );

ALTER TABLE distribution_tasks
  DROP CONSTRAINT IF EXISTS distribution_tasks_target_id_fkey;

ALTER TABLE distribution_tasks
  ADD CONSTRAINT distribution_tasks_target_id_fkey
    FOREIGN KEY (target_id)
    REFERENCES distribution_targets(id)
    ON DELETE SET NULL;
