-- Production patch for interaction, commercial listing, and Google Search Console features.
-- Safe to run more than once in Supabase SQL Editor.

BEGIN;

-- Comments moderation fields.
ALTER TABLE comments
  ADD COLUMN IF NOT EXISTS is_hidden BOOLEAN NOT NULL DEFAULT FALSE;

ALTER TABLE comments
  ADD COLUMN IF NOT EXISTS hidden_reason TEXT;

-- Comment likes: one like per user per comment.
CREATE TABLE IF NOT EXISTS comment_likes (
  comment_id UUID NOT NULL REFERENCES comments(id) ON DELETE CASCADE,
  user_id UUID NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  PRIMARY KEY (comment_id, user_id)
);

CREATE INDEX IF NOT EXISTS idx_comment_likes_user
  ON comment_likes(user_id);

-- Comment reports: one report per user per comment.
CREATE TABLE IF NOT EXISTS comment_reports (
  comment_id UUID NOT NULL REFERENCES comments(id) ON DELETE CASCADE,
  user_id UUID NOT NULL,
  reason TEXT,
  resolved_at TIMESTAMP WITH TIME ZONE,
  resolved_by UUID,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  PRIMARY KEY (comment_id, user_id)
);

CREATE INDEX IF NOT EXISTS idx_comment_reports_created_at
  ON comment_reports(created_at DESC);

-- Comment moderation audit log.
CREATE TABLE IF NOT EXISTS comment_moderation_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  admin_user_id UUID,
  action TEXT NOT NULL,
  target_count INTEGER NOT NULL DEFAULT 1,
  metadata JSONB,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_comment_moderation_logs_created_at
  ON comment_moderation_logs(created_at DESC);

-- Commercial payment callback audit log.
CREATE TABLE IF NOT EXISTS payment_callback_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tool_id UUID,
  transaction_id TEXT,
  status TEXT NOT NULL CHECK (status IN ('success', 'failed')),
  source TEXT,
  error_message TEXT,
  payload JSONB,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_payment_callback_logs_created_at
  ON payment_callback_logs(created_at DESC);

CREATE INDEX IF NOT EXISTS idx_payment_callback_logs_status
  ON payment_callback_logs(status);

CREATE INDEX IF NOT EXISTS idx_payment_callback_logs_tool_id
  ON payment_callback_logs(tool_id);

CREATE UNIQUE INDEX IF NOT EXISTS uq_payment_callback_logs_success_tx
  ON payment_callback_logs(transaction_id)
  WHERE transaction_id IS NOT NULL AND status = 'success';

-- Google Search Console request log.
CREATE TABLE IF NOT EXISTS google_search_console_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  operation TEXT NOT NULL CHECK (operation IN ('submit_sitemap', 'inspect_url')),
  property_url TEXT NOT NULL,
  target_url TEXT NOT NULL,
  status TEXT NOT NULL CHECK (status IN ('success', 'failed')),
  source TEXT,
  response JSONB,
  error_message TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_google_search_console_logs_created_at
  ON google_search_console_logs(created_at DESC);

CREATE INDEX IF NOT EXISTS idx_google_search_console_logs_operation
  ON google_search_console_logs(operation);

CREATE INDEX IF NOT EXISTS idx_google_search_console_logs_status
  ON google_search_console_logs(status);

COMMIT;
