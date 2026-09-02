import { loadEnvConfig } from '@next/env';

import { prepareTimelineEventInsert } from '@/lib/services/intelligence/changeTimeline';
import type { IntelligenceClaimType } from '@/lib/services/intelligence/types';
import { createAdminClient } from '@/lib/supabase/admin';

loadEnvConfig(process.cwd());

function readFlag(name: string): string | null {
  const prefix = `--${name}=`;
  const value = process.argv.find((argument) => argument.startsWith(prefix));
  return value ? value.slice(prefix.length).trim() : null;
}

async function seedTimelineBaseline() {
  const ownerId = readFlag('owner-id');
  const dryRun = process.argv.includes('--dry-run');
  if (!ownerId || !/^[0-9a-f-]{36}$/i.test(ownerId)) {
    throw new Error('Provide a real directory tool UUID with --owner-id=<uuid>.');
  }

  const supabase = createAdminClient();
  const { data: profile, error: profileError } = await supabase
    .from('product_intelligence_profiles')
    .select('id, owner_type, owner_id, product_name, last_verified_at')
    .eq('owner_type', 'tool')
    .eq('owner_id', ownerId)
    .maybeSingle();
  if (profileError) throw new Error(profileError.message);
  if (!profile) throw new Error('No tool intelligence profile was found for that directory UUID.');
  if (!profile.last_verified_at) throw new Error('The profile has no completed verification date.');

  const { data: claims, error: claimsError } = await supabase
    .from('product_intelligence_claims')
    .select('id, profile_id, claim_type, claim_key, source_url, source_excerpt')
    .eq('profile_id', profile.id)
    .eq('verification_status', 'verified')
    .eq('conflict_status', 'none')
    .order('verified_at', { ascending: false });
  if (claimsError) throw new Error(claimsError.message);
  if (!claims?.length) throw new Error('A baseline requires at least one verified, conflict-free claim.');

  const { data: existing, error: existingError } = await supabase
    .from('product_intelligence_timeline_events')
    .select('id')
    .eq('profile_id', profile.id)
    .eq('event_type', 'reviewed_no_change')
    .eq('occurred_at', profile.last_verified_at)
    .limit(1);
  if (existingError) throw new Error(existingError.message);
  if (existing?.length) {
    console.log(JSON.stringify({ success: true, created: false, reason: 'baseline_already_exists' }, null, 2));
    return;
  }

  const primaryClaim = claims[0];
  const insert = prepareTimelineEventInsert(
    {
      profileId: String(profile.id),
      profileOwnerType: 'tool',
      eventType: 'reviewed_no_change',
      reviewScope: 'full',
      title: 'Evidence baseline established',
      summary: `${profile.product_name} received an editorial evidence review. The verified official claim remains the current baseline, with no additional confirmed fact change recorded.`,
      sourceUrl: String(primaryClaim.source_url || ''),
      sourceExcerpt: String(primaryClaim.source_excerpt || ''),
      visibility: 'public',
      occurredAt: String(profile.last_verified_at),
      reviewNote: 'Created from an existing manually verified, conflict-free claim. Machine candidates were excluded.',
    },
    null,
  );
  insert.metadata = {
    ...insert.metadata,
    entryMethod: 'verified_claim_baseline',
    verifiedClaimCount: claims.length,
    primaryClaimId: String(primaryClaim.id),
    primaryClaimType: primaryClaim.claim_type as IntelligenceClaimType,
    primaryClaimKey: String(primaryClaim.claim_key),
  };

  if (dryRun) {
    console.log(JSON.stringify({ success: true, created: false, dryRun: true, insert }, null, 2));
    return;
  }

  const { data: created, error: insertError } = await supabase
    .from('product_intelligence_timeline_events')
    .insert(insert)
    .select('id, profile_id, event_type, visibility, occurred_at')
    .single();
  if (insertError) throw new Error(insertError.message);
  console.log(JSON.stringify({ success: true, created: true, event: created }, null, 2));
}

seedTimelineBaseline().catch((error) => {
  console.error(error instanceof Error ? error.message : error);
  process.exitCode = 1;
});
