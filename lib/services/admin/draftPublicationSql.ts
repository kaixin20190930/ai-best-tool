export const toolQualityScoreSql = `
  (
    (CASE WHEN category_id IS NOT NULL THEN 20 ELSE 0 END) +
    (CASE WHEN thumbnail_url IS NOT NULL AND thumbnail_url <> '' AND thumbnail_url NOT LIKE '%google.com/s2/favicons%' THEN 20 ELSE 0 END) +
    (CASE WHEN image_url IS NOT NULL AND image_url <> '' AND image_url NOT LIKE '%google.com/s2/favicons%' THEN 15 ELSE 0 END) +
    (CASE WHEN LENGTH(COALESCE(content->>'en', content->>'zh', content::text, '')) >= 80 THEN 20 ELSE 0 END) +
    (CASE WHEN LENGTH(COALESCE(detail->>'en', detail->>'zh', detail::text, '')) >= 160 THEN 15 ELSE 0 END) +
    (CASE WHEN pricing IS NOT NULL AND pricing <> '' THEN 5 ELSE 0 END) +
    (CASE WHEN array_length(tags, 1) > 0 THEN 5 ELSE 0 END)
  )
`;

export const mediaNeededSql = `
  (
    image_url IS NULL
    OR image_url = ''
    OR image_url LIKE '%google.com/s2/favicons%'
    OR thumbnail_url IS NULL
    OR thumbnail_url = ''
    OR thumbnail_url LIKE '%google.com/s2/favicons%'
    OR COALESCE(features->'mediaReview'->>'needed' = 'true', FALSE)
  )
`;

const localizedArrayCountSql = (path: string) => `GREATEST(
  CASE WHEN jsonb_typeof(${path}->'en') = 'array' THEN jsonb_array_length(${path}->'en') ELSE 0 END,
  CASE WHEN jsonb_typeof(${path}->'zh') = 'array' THEN jsonb_array_length(${path}->'zh') ELSE 0 END
)`;

export const evidenceCompleteSql = `
  NULLIF(BTRIM(features->'editorial'->>'reviewedAt'), '') IS NOT NULL
  AND COALESCE(NULLIF(BTRIM(features->'editorial'->>'sourceUrl'), '') ~* '^https?://', FALSE)
  AND (image_url IS NOT NULL OR thumbnail_url IS NOT NULL)
  AND ${localizedArrayCountSql("features->'decision'->'limitations'")} > 0
  AND ${localizedArrayCountSql("features->'bestFit'")} > 0
  AND ${localizedArrayCountSql("features->'notIdealFor'")} > 0
  AND ${localizedArrayCountSql("features->'decision'->'compareAxes'")} > 0`;

export const evidenceReadyDraftSql = `
  (
    status = 'draft'
    AND ${toolQualityScoreSql} >= 80
    AND NOT ${mediaNeededSql}
    AND ${evidenceCompleteSql}
  )
`;
