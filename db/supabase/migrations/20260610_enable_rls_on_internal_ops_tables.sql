-- Lock down operational/admin-only tables that should never be exposed via the public API.
-- These tables are used by server-side admin flows and internal schedulers only.

ALTER TABLE IF EXISTS public.email_test_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.collection_sources ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.collection_runs ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.collection_candidates ENABLE ROW LEVEL SECURITY;

-- Intentionally create no public policies for these tables.
-- They remain accessible to service-role / direct DB connections used by the admin runtime.
