import fs from 'node:fs/promises';
import path from 'node:path';

import { config } from 'dotenv';

import { getPool } from '@/db/neon/client';
import { evaluateCollectionAdmission } from '@/lib/services/admin/collectionAdmission';
import {
  CandidatePoolEntry,
  isDifferentExistingTool,
  validateThreeDayCandidatePool,
} from '@/lib/services/admin/collectionPlanning';
import {
  importCollectionCandidateToDraft,
  scoreCollectionCandidate,
} from '@/lib/services/admin/collection';

config({ path: '.env.local' });

const apply = process.argv.includes('--apply');
const createReadyDrafts = process.argv.includes('--create-ready-drafts');
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
        SELECT id, title, normalized_url, status, tool_id
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

      const isExistingDifferentTool = isDifferentExistingTool(
        duplicate.rows[0]?.id,
        candidate.rows[0].tool_id
      );
      const effectivePlan = isExistingDifferentTool
        ? {
            ...entry,
            decision: 'duplicate' as const,
            decisionReason: `Existing tool ${duplicate.rows[0].name} already uses this official domain.`,
            gaps: [],
          }
        : entry;
      const evidencePayload = {
        categorySlug: entry.categorySlug,
        decision: {
          compareAxes: entry.compareAxes || [],
          limitations: entry.limitations || [],
          notIdealFor: entry.notIdealFor || [],
          reviewedAt: entry.reviewedAt,
        },
        detailMetadata: {
          canonicalUrl: entry.officialUrl,
          description: entry.detail || entry.summary,
          externalUrl: entry.officialUrl,
          imageUrl: entry.imageUrl,
          title: entry.title,
        },
        intakePlan: effectivePlan,
        pricingSnapshot: entry.pricingSnapshot || '',
        tags: entry.tags,
        useCases: entry.useCases,
      };
      const score = scoreCollectionCandidate({
        rawPayload: evidencePayload,
        summary: entry.summary,
        title: entry.title,
        url: entry.officialUrl,
      });
      const admission = evaluateCollectionAdmission({
        quality_score: score.qualityScore,
        raw_payload: evidencePayload,
        relevance_score: score.relevanceScore,
        status: candidate.rows[0].status,
        summary: entry.summary,
      });

      if (apply) {
        await pool.query(
          `
          UPDATE collection_candidates
          SET summary = $2,
              raw_payload = raw_payload || $3::jsonb,
              relevance_score = $4,
              quality_score = $5,
              score_reason = $6,
              updated_at = NOW()
          WHERE id = $1
        `,
          [
            candidate.rows[0].id,
            entry.summary,
            JSON.stringify({
              ...evidencePayload,
              admission: {
                coreGaps: admission.coreGaps,
                decision: admission.publishReady
                  ? 'publication_ready'
                  : admission.draftReady
                    ? 'draft_requires_evidence'
                    : 'candidate_requires_enrichment',
                decisionGaps: admission.decisionGaps,
                draftReady: admission.draftReady,
                evaluatedAt: new Date().toISOString(),
                publishReady: admission.publishReady,
              },
            }),
            score.relevanceScore,
            score.qualityScore,
            score.reason,
          ]
        );
      }

      const draftResult =
        apply && createReadyDrafts && admission.publishReady && effectivePlan.decision !== 'duplicate'
          ? await importCollectionCandidateToDraft(candidate.rows[0].id)
          : null;

      results.push({
        title: entry.title,
        plannedFor: entry.plannedFor.slice(0, 10),
        decision: effectivePlan.decision,
        coreGaps: admission.coreGaps.length,
        decisionGaps: admission.decisionGaps.length,
        draftReady: admission.draftReady,
        draftToolId: draftResult?.toolId || '',
        publishReady: admission.publishReady,
        outcome: draftResult ? 'draft_created' : apply ? 'updated' : 'dry_run',
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
