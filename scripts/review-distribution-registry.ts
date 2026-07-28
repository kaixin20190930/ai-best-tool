#!/usr/bin/env tsx
/**
 * Batch review the seeded distribution target registry.
 *
 * This exercises the full target discovery + snapshot + requirement persistence flow
 * for the canonical 10 target fixtures.
 */

import { config } from 'dotenv';
import { Pool } from 'pg';

import { persistDistributionTargetReview } from '@/lib/services/intelligence/targetPersistence';

config({ path: '.env.local' });

const connectionString = process.env.DATABASE_URL || process.env.POSTGRES_URL || process.env.DATABASE_URL_UNPOOLED;

if (!connectionString) {
  console.error('❌ Missing DATABASE_URL / POSTGRES_URL / DATABASE_URL_UNPOOLED');
  process.exit(1);
}

const pool = new Pool({
  connectionString,
  ssl: connectionString.includes('supabase.com') || connectionString.includes('sslmode=require')
    ? { rejectUnauthorized: false }
    : false,
  max: 1,
  idleTimeoutMillis: 5_000,
  connectionTimeoutMillis: 30_000,
  allowExitOnIdle: true,
});

type RegistryTarget = {
  id: string;
  name: string;
  homepage_url: string;
  target_status: string;
};

async function main() {
  console.log('🔎 Batch reviewing distribution registry...');
  const { rows } = await pool.query<RegistryTarget>(
    `
      select id, name, homepage_url, target_status
      from distribution_targets
      order by created_at asc, name asc
      limit 10
    `,
  );

  if (rows.length === 0) {
    throw new Error('No distribution targets found.');
  }

  const results: Array<{
    name: string;
    homepageUrl: string;
    ok: boolean;
    obstacleStatus?: string;
    targetStatus?: string;
    snapshotId?: string | null;
    ruleVersion?: number;
    detail: string;
  }> = [];

  for (const target of rows) {
    try {
      const review = await persistDistributionTargetReview({
        targetId: target.id,
        homepageUrl: target.homepage_url,
        dryRun: false,
      });
      results.push({
        name: target.name,
        homepageUrl: target.homepage_url,
        ok: true,
        obstacleStatus: review.obstacleStatus,
        targetStatus: review.targetStatus,
        snapshotId: review.snapshotId,
        ruleVersion: review.ruleVersion,
        detail: review.versionChanged ? 'snapshot updated' : 'snapshot unchanged',
      });
      console.log(`✅ ${target.name} -> ${review.obstacleStatus}/${review.targetStatus}`);
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);
      const expectedBlockers = [
        'robots.txt',
        'response exceeded the configured limit',
        'fetch failed',
      ];
      if (expectedBlockers.some((pattern) => message.toLowerCase().includes(pattern.toLowerCase()))) {
        results.push({
          name: target.name,
          homepageUrl: target.homepage_url,
          ok: true,
          obstacleStatus: 'blocked',
          targetStatus: 'blocked',
          detail: `site-level block: ${message}`,
        });
        console.log(`⚠️ ${target.name} -> blocked (${message})`);
        continue;
      }

      results.push({
        name: target.name,
        homepageUrl: target.homepage_url,
        ok: false,
        detail: message,
      });
      console.log(`❌ ${target.name} -> ${message}`);
    }
  }

  const failed = results.filter((result) => !result.ok);
  console.table(
    results.map((result) => ({
      name: result.name,
      ok: result.ok ? 'yes' : 'no',
      obstacleStatus: result.obstacleStatus || '-',
      targetStatus: result.targetStatus || '-',
      snapshotId: result.snapshotId || '-',
      ruleVersion: result.ruleVersion || '-',
      detail: result.detail,
    })),
  );

  if (failed.length > 0) {
    throw new Error(`Batch review failed for ${failed.length} target(s).`);
  }

  console.log(`\n✅ Batch review passed for ${results.length} distribution targets.`);
}

main()
  .catch((error) => {
    console.error('❌ Batch review failed:', error instanceof Error ? error.message : error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await pool.end();
  });
