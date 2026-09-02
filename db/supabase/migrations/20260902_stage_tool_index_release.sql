-- New public tool pages remain visible to users but do not enter Google's index
-- until an editor explicitly approves the page after the release review.
ALTER TABLE tools
  ALTER COLUMN page_quality_status SET DEFAULT 'monitor';

-- Prevent an older draft/rejected row from becoming indexable merely because
-- its publication status changes later.
UPDATE tools
SET page_quality_status = 'monitor'
WHERE status <> 'published'
  AND COALESCE(page_quality_status, 'continue_index') = 'continue_index';

-- Keep two verified pages in the first release cohort. Stage the remaining
-- 2026-09-01 imports for one-at-a-time editorial/index review.
UPDATE tools
SET
  page_quality_status = 'monitor',
  next_review_date = CASE name
    WHEN 'consensus' THEN DATE '2026-09-03'
    WHEN 'gamma' THEN DATE '2026-09-04'
    WHEN 'runway' THEN DATE '2026-09-05'
    WHEN 'luma-ai' THEN DATE '2026-09-06'
    WHEN 'pipedream' THEN DATE '2026-09-07'
    WHEN 'cursor' THEN DATE '2026-09-08'
    WHEN 'the-graph' THEN DATE '2026-09-09'
    WHEN 'perplexity' THEN DATE '2026-09-10'
    WHEN 'make' THEN DATE '2026-09-11'
    ELSE next_review_date
  END,
  updated_at = NOW()
WHERE name IN (
  'consensus',
  'gamma',
  'runway',
  'luma-ai',
  'pipedream',
  'cursor',
  'the-graph',
  'perplexity',
  'make'
)
  AND status = 'published';
