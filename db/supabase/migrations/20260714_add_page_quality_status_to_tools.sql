ALTER TABLE tools
  ADD COLUMN IF NOT EXISTS page_quality_status VARCHAR(40) DEFAULT 'continue_index';

ALTER TABLE tools
  ADD COLUMN IF NOT EXISTS next_review_date DATE;
