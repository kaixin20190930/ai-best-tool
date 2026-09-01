import { loadEnvConfig } from '@next/env';

import { createAdminClient } from '@/lib/supabase/admin';

loadEnvConfig(process.cwd());

const PLATFORM_PROFILE_ID = 'eebdaf7a-cdb6-4981-b0af-f24120a42f40';

async function verifyIntelligenceOwnerMigration() {
  const supabase = createAdminClient();
  const [profileResult, verifiedResult] = await Promise.all([
    supabase
      .from('product_intelligence_profiles')
      .select('id, owner_type, owner_id, canonical_domain, metadata')
      .eq('id', PLATFORM_PROFILE_ID)
      .maybeSingle(),
    supabase
      .from('product_intelligence_claims')
      .select('id', { count: 'exact', head: true })
      .eq('profile_id', PLATFORM_PROFILE_ID)
      .eq('verification_status', 'verified'),
  ]);

  const error = profileResult.error || verifiedResult.error;
  if (error) throw new Error(`Intelligence owner migration is not ready: ${error.message}`);
  if (!profileResult.data) throw new Error('The AI Best Tool intelligence profile was not found.');
  if (profileResult.data.owner_type !== 'site') {
    throw new Error(`Expected the AI Best Tool profile owner_type to be site, got ${profileResult.data.owner_type}.`);
  }
  if ((verifiedResult.count || 0) < 1) {
    throw new Error('The verified evidence baseline was not preserved during identity migration.');
  }

  console.log(
    JSON.stringify(
      {
        success: true,
        profileId: profileResult.data.id,
        ownerType: profileResult.data.owner_type,
        canonicalDomain: profileResult.data.canonical_domain,
        verifiedClaims: verifiedResult.count || 0,
        identityMetadata: profileResult.data.metadata,
      },
      null,
      2,
    ),
  );
}

verifyIntelligenceOwnerMigration().catch((error) => {
  console.error(error instanceof Error ? error.message : error);
  process.exitCode = 1;
});
