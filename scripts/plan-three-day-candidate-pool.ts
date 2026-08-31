import fs from 'node:fs/promises';
import path from 'node:path';

import { config } from 'dotenv';

import { getPool } from '@/db/neon/client';
import {
  CandidatePoolEntry,
  validateThreeDayCandidatePool,
} from '@/lib/services/admin/collectionPlanning';

config({ path: '.env.local' });

const apply = process.argv.includes('--apply');
const fileArgument = process.argv.find((argument) => argument.startsWith('--file='));
const filePath = path.resolve(
  fileArgument?.slice('--file='.length) ||
    'data/collection/candidate-pool-2026-09-01.json'
);
async function main() {
  const entries = JSON.parse(await fs.readFile(filePath, 'utf8')) as CandidatePoolEntry[];
  const validationErrors = validateThreeDayCandidatePool(entries);

  if (validationErrors.length > 0) {
    throw new Error(`Invalid candidate pool:\n- ${validationErrors.join('\n- ')}`);
  }

  const pool = getPool();
  const results: Array<Record<string, unknown>> = [];

  try {
    for (const entry of entries) {
      const candidate = await pool.query(
        `
        SELECT id, title, normalized_url, status
        FROM collection_candidates
        WHERE RTRIM(normalized_url, '/') = RTRIM($1, '/')
        LIMIT 1
      `,
        [entry.candidateUrl]
      );

      if (!candidate.rows[0]) {
        results.push({ title: entry.title, outcome: 'missing_candidate' });
        continue;
      }

      const officialHost = new URL(entry.officialUrl).hostname.replace(/^www\./, '');
      const duplicate = await pool.query(
        `
        SELECT id, name, status, url
        FROM tools
        WHERE LOWER(REGEXP_REPLACE(SPLIT_PART(SPLIT_PART(url, '://', 2), '/', 1), '^www\\.', '')) = $1
        LIMIT 1
      `,
        [officialHost]
      );

      const effectivePlan = duplicate.rows[0]
        ? {
            ...entry,
            decision: 'duplicate' as const,
            decisionReason: `Existing tool ${duplicate.rows[0].name} already uses this official domain.`,
            gaps: [],
          }
        : entry;

      if (apply) {
        await pool.query(
          `
          UPDATE collection_candidates
          SET raw_payload = raw_payload || $2::jsonb,
              updated_at = NOW()
          WHERE id = $1
        `,
          [
            candidate.rows[0].id,
            JSON.stringify({
              categorySlug: entry.categorySlug,
              decision: {
                reviewedAt: entry.reviewedAt,
              },
              detailMetadata: {
                canonicalUrl: entry.officialUrl,
                description: entry.summary,
                externalUrl: entry.officialUrl,
                title: entry.title,
              },
              intakePlan: effectivePlan,
              tags: entry.tags,
              useCases: entry.useCases,
            }),
          ]
        );
      }

      results.push({
        title: entry.title,
        plannedFor: entry.plannedFor.slice(0, 10),
        decision: effectivePlan.decision,
        outcome: apply ? 'updated' : 'dry_run',
      });
    }

    const failures = results.filter((result) => result.outcome === 'missing_candidate');
    console.table(results);

    if (failures.length > 0) {
      throw new Error(`${failures.length} planned candidates were not found in collection_candidates.`);
    }

    console.log(
      apply
        ? `Applied ${results.length} candidates to the three-day intake pool.`
        : `Validated ${results.length} candidates. Re-run with --apply to persist the plan.`
    );
  } finally {
    await pool.end();
  }
}

void main();
