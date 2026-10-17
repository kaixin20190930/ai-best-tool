-- Raise the shared approval guard to five per Shanghai day and 25 per ISO week.
-- Keep the trigger and ledger authoritative; no tool row changes here.
ALTER TABLE public.tool_index_release_policy
  DROP CONSTRAINT IF EXISTS tool_index_release_policy_daily_limit_check;
ALTER TABLE public.tool_index_release_policy
  ADD CONSTRAINT tool_index_release_policy_daily_limit_check
  CHECK (daily_limit BETWEEN 1 AND 5);
ALTER TABLE public.tool_index_release_policy
  DROP CONSTRAINT IF EXISTS tool_index_release_policy_weekly_limit_check;
ALTER TABLE public.tool_index_release_policy
  ADD CONSTRAINT tool_index_release_policy_weekly_limit_check
  CHECK (weekly_limit BETWEEN 1 AND 25);

UPDATE public.tool_index_release_policy
SET daily_limit = 5,
    weekly_limit = 25,
    pause_reason = 'Owner-authorized A-grade fast track: up to five per day and 25 per week; all quality gates remain mandatory.',
    updated_at = now()
WHERE singleton = true;
