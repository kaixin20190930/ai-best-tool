-- Allow authenticated owners to append immutable execution history.
-- The closure migration originally exposed read-only events, which blocked package and status actions.

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
