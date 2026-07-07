-- Lock down reminder log tables that are only used by server-side admin and scheduler flows.

ALTER TABLE IF EXISTS public.claim_invite_reminder_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.featured_renewal_reminder_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.profile_update_reminder_logs ENABLE ROW LEVEL SECURITY;

-- Intentionally create no public policies for these tables.
-- They remain accessible to service-role / direct DB connections used by the admin runtime.
