import { loadEnvConfig } from '@next/env';

import { createAdminClient } from '@/lib/supabase/admin';

loadEnvConfig(process.cwd());

async function verifyEvidenceLedgerMigration() {
  const supabase = createAdminClient();
  const [sourcesResult, claimsResult, candidateCountResult] = await Promise.all([
    supabase
      .from('product_intelligence_sources')
      .select('id, source_type, source_label, publisher_name, last_verified_at')
      .limit(1),
    supabase
      .from('product_intelligence_claims')
      .select(
        'id, source_id, source_type, verification_status, verified_at, verification_note, review_due_at, expires_at, invalidated_at, invalidation_reason, validity_scope',
      )
      .limit(1),
    supabase
      .from('product_intelligence_claims')
      .select('id', { count: 'exact', head: true })
      .eq('verification_status', 'candidate'),
  ]);

  const error = sourcesResult.error || claimsResult.error || candidateCountResult.error;
  if (error) {
    throw new Error(`Evidence Ledger migration is not ready: ${error.message}`);
  }

  console.log(
    JSON.stringify(
      {
        success: true,
        candidateClaims: candidateCountResult.count || 0,
        sourceSchemaReadable: true,
        claimSchemaReadable: true,
      },
      null,
      2,
    ),
  );
}

verifyEvidenceLedgerMigration().catch((error) => {
  console.error(error instanceof Error ? error.message : error);
  process.exitCode = 1;
});
