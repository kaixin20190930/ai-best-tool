-- Idempotent in-app reminder cursor for private 7-day trial scorecards.
ALTER TABLE trial_scorecards
  ADD COLUMN IF NOT EXISTS reminder_sent_at TIMESTAMPTZ;

CREATE INDEX IF NOT EXISTS idx_trial_scorecards_due_reminder
  ON trial_scorecards(status, reminder_enabled, ends_at, renewal_at)
  WHERE reminder_sent_at IS NULL AND status IN ('planned', 'active');

COMMENT ON COLUMN trial_scorecards.reminder_sent_at IS
  'Set only after a reminder job claims this scorecard; reset to NULL if notification delivery fails.';
