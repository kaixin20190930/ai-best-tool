-- Enable RLS across public tables and lock internal/sensitive tables down.
-- This closes Supabase advisor findings such as:
-- - rls_disabled_in_public
-- - sensitive_columns_exposed

-- Enable RLS
ALTER TABLE IF EXISTS public.categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.tags ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.tools ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.favorites ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.ratings ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.comments ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.comment_likes ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.comment_reports ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.comment_moderation_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.payment_callback_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.google_search_console_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.analytics ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.user_preferences ENABLE ROW LEVEL SECURITY;

-- Drop legacy policies if they exist so the migration stays idempotent.
DROP POLICY IF EXISTS "Anyone can view categories" ON public.categories;
DROP POLICY IF EXISTS "Anyone can view tags" ON public.tags;
DROP POLICY IF EXISTS "Anyone can view published tools" ON public.tools;
DROP POLICY IF EXISTS "Authenticated users can insert tools" ON public.tools;
DROP POLICY IF EXISTS "Users can update their own tools" ON public.tools;
DROP POLICY IF EXISTS "Users can delete their own tools" ON public.tools;
DROP POLICY IF EXISTS "Users can view their own favorites" ON public.favorites;
DROP POLICY IF EXISTS "Users can insert their own favorites" ON public.favorites;
DROP POLICY IF EXISTS "Users can delete their own favorites" ON public.favorites;
DROP POLICY IF EXISTS "Users can view their own ratings" ON public.ratings;
DROP POLICY IF EXISTS "Users can insert their own ratings" ON public.ratings;
DROP POLICY IF EXISTS "Users can update their own ratings" ON public.ratings;
DROP POLICY IF EXISTS "Users can delete their own ratings" ON public.ratings;
DROP POLICY IF EXISTS "Anyone can view comments" ON public.comments;
DROP POLICY IF EXISTS "Authenticated users can insert comments" ON public.comments;
DROP POLICY IF EXISTS "Users can update their own comments" ON public.comments;
DROP POLICY IF EXISTS "Users can delete their own comments" ON public.comments;
DROP POLICY IF EXISTS "Users can view their own comment likes" ON public.comment_likes;
DROP POLICY IF EXISTS "Users can insert their own comment likes" ON public.comment_likes;
DROP POLICY IF EXISTS "Users can delete their own comment likes" ON public.comment_likes;
DROP POLICY IF EXISTS "Users can view their own notifications" ON public.notifications;
DROP POLICY IF EXISTS "Users can update their own notifications" ON public.notifications;
DROP POLICY IF EXISTS "Users can view their own preferences" ON public.user_preferences;
DROP POLICY IF EXISTS "Users can insert their own preferences" ON public.user_preferences;
DROP POLICY IF EXISTS "Users can update their own preferences" ON public.user_preferences;

-- Public browseable reference tables
CREATE POLICY "Anyone can view categories"
  ON public.categories FOR SELECT
  USING (true);

CREATE POLICY "Anyone can view tags"
  ON public.tags FOR SELECT
  USING (true);

-- Tools: published tools are public, unpublished tools remain private to the submitter.
CREATE POLICY "Anyone can view published tools"
  ON public.tools FOR SELECT
  USING (status = 'published' OR auth.uid() = submitted_by);

CREATE POLICY "Authenticated users can insert tools"
  ON public.tools FOR INSERT
  WITH CHECK (auth.uid() = submitted_by);

CREATE POLICY "Users can update their own tools"
  ON public.tools FOR UPDATE
  USING (auth.uid() = submitted_by)
  WITH CHECK (auth.uid() = submitted_by);

CREATE POLICY "Users can delete their own tools"
  ON public.tools FOR DELETE
  USING (auth.uid() = submitted_by);

-- Favorites: only the owner may read/write them.
CREATE POLICY "Users can view their own favorites"
  ON public.favorites FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own favorites"
  ON public.favorites FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete their own favorites"
  ON public.favorites FOR DELETE
  USING (auth.uid() = user_id);

-- Ratings: only the owner may read/write individual rows. Public aggregates live on tools.
CREATE POLICY "Users can view their own ratings"
  ON public.ratings FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own ratings"
  ON public.ratings FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own ratings"
  ON public.ratings FOR UPDATE
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete their own ratings"
  ON public.ratings FOR DELETE
  USING (auth.uid() = user_id);

-- Comments: visible comments are public; hidden comments remain visible to their author.
CREATE POLICY "Anyone can view comments"
  ON public.comments FOR SELECT
  USING (COALESCE(is_hidden, false) = false OR auth.uid() = user_id);

CREATE POLICY "Authenticated users can insert comments"
  ON public.comments FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own comments"
  ON public.comments FOR UPDATE
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete their own comments"
  ON public.comments FOR DELETE
  USING (auth.uid() = user_id);

-- Comment likes: only the actor may see/mutate their own like rows.
CREATE POLICY "Users can view their own comment likes"
  ON public.comment_likes FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own comment likes"
  ON public.comment_likes FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete their own comment likes"
  ON public.comment_likes FOR DELETE
  USING (auth.uid() = user_id);

-- Notifications and preferences are user-private.
CREATE POLICY "Users can view their own notifications"
  ON public.notifications FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can update their own notifications"
  ON public.notifications FOR UPDATE
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can view their own preferences"
  ON public.user_preferences FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own preferences"
  ON public.user_preferences FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own preferences"
  ON public.user_preferences FOR UPDATE
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Internal and sensitive operational tables intentionally get no public policies:
-- comment_reports
-- comment_moderation_logs
-- payment_callback_logs
-- google_search_console_logs
-- analytics
