import { loadEnvConfig } from '@next/env';

import { createAdminClient } from '@/lib/supabase/admin';

loadEnvConfig(process.cwd());

async function repairIntelligenceVerificationSummaries() {
  const supabase = createAdminClient();
  const { data: profiles, error: profilesError } = await supabase
    .from('product_intelligence_profiles')
    .select('id, product_name, metadata')
    .order('updated_at', { ascending: false });

  if (profilesError) throw new Error(profilesError.message);

  const repaired: Array<{
    profileId: string;
    productName: string;
    verifiedClaimCount: number;
    candidateClaimCount: number;
  }> = [];

  for (const profile of profiles || []) {
    const { data: claims, error: claimsError } = await supabase
      .from('product_intelligence_claims')
      .select('verification_status, conflict_status')
      .eq('profile_id', profile.id);
    if (claimsError) throw new Error(claimsError.message);

    const verifiedClaimCount = (claims || []).filter(
      (claim) => claim.verification_status === 'verified' && claim.conflict_status === 'none',
    ).length;
    const candidateClaimCount = (claims || []).filter(
      (claim) => !claim.verification_status || claim.verification_status === 'candidate',
    ).length;
    const metadata = (profile.metadata || {}) as Record<string, unknown>;
    const { facts: legacyFacts, ...metadataWithoutLegacyFacts } = metadata;
    const previousSummary =
      metadata.summary && typeof metadata.summary === 'object' && !Array.isArray(metadata.summary)
        ? (metadata.summary as Record<string, unknown>)
        : {};

    const { error: updateError } = await supabase
      .from('product_intelligence_profiles')
      .update({
        metadata: {
          ...metadataWithoutLegacyFacts,
          candidateFacts: metadata.candidateFacts || legacyFacts || {},
          factsSemantics: 'machine_extracted_candidates',
          summary: {
            ...previousSummary,
            verifiedClaimCount,
            candidateClaimCount,
          },
          verificationSummarySemantics: 'explicit_verified_without_conflict',
          verificationSummaryRepairedAt: new Date().toISOString(),
        },
      })
      .eq('id', profile.id);
    if (updateError) throw new Error(updateError.message);

    repaired.push({
      profileId: String(profile.id),
      productName: String(profile.product_name || ''),
      verifiedClaimCount,
      candidateClaimCount,
    });
  }

  console.log(JSON.stringify({ success: true, repairedProfiles: repaired.length, profiles: repaired }, null, 2));
}

repairIntelligenceVerificationSummaries().catch((error) => {
  console.error(error instanceof Error ? error.message : error);
  process.exitCode = 1;
});
