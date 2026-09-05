import assert from 'node:assert/strict';
import { loadEnvConfig } from '@next/env';

import { createAdminClient } from '@/lib/supabase/admin';

loadEnvConfig(process.cwd());

const profileId = '63031451-a3eb-497d-9396-d6904aa2d3b3';
const reviewDueAt = '2026-10-05T00:00:00.000Z';
const decisions = [
  {
    id: 'd9b7a76f-30ae-4ace-8d85-2cd49faaa444',
    type: 'product_name',
    value: 'Gamma',
    sourceUrl: 'https://gamma.app/',
    status: 'verified',
    note: 'Owner-authorized assisted review: Gamma name confirmed on the official homepage and page title on 2026-09-05.',
    excerpt: 'Gamma | Best AI Presentation Maker & Website Builder',
  },
  {
    id: '252937c0-6e4c-4220-86b3-820cf8b67ea5',
    type: 'pricing_model',
    value: 'published_pricing_page',
    sourceUrl: 'https://gamma.app/pricing',
    status: 'verified',
    note: 'Owner-authorized assisted review: official pricing page showed Free, Plus, Pro and Ultra plans on 2026-09-05; no price amount was verified.',
    excerpt: "Choose the plan that's right for you; Free, Plus, Pro and Ultra plans are listed.",
  },
  {
    id: '00f2b7cc-e0e4-4b88-b964-1d797af6606e',
    type: 'one_line_positioning',
    value:
      'Design stunning presentations, websites, and more with Gamma—your all-in-one AI-powered design partner. No code or design experience needed.',
    sourceUrl: 'https://gamma.app/',
    status: 'rejected',
    note: 'Rejected after official-page review on 2026-09-05: the captured wording was not visible as the current homepage positioning.',
    excerpt:
      'Design stunning presentations, websites, and more with Gamma—your all-in-one AI-powered design partner. No code or design experience needed.',
  },
] as const;

async function main() {
  const args = process.argv.slice(2).filter((arg) => arg !== '--');
  assert(args.length <= 1 && args.every((arg) => ['--check', '--commit', '--status'].includes(arg)));
  for (const decision of decisions) {
    assert(/^[0-9a-f-]{36}$/i.test(decision.id));
    assert(new URL(decision.sourceUrl).hostname === 'gamma.app');
    assert(decision.note.length >= 40);
  }
  if (args.includes('--check')) {
    console.log('PASS Gamma claim IDs, official domains, bounded decisions and review notes');
    return;
  }

  const supabase = createAdminClient();
  const { data: claims, error } = await supabase
    .from('product_intelligence_claims')
    .select('id, profile_id, claim_type, claim_value, source_url, verification_status, conflict_status, source_excerpt')
    .eq('profile_id', profileId);
  if (error) throw new Error(error.message);
  assert.equal(claims?.length, decisions.length, 'Gamma candidate set changed; review instead of overwriting');

  for (const decision of decisions) {
    const claim = claims.find((item) => item.id === decision.id);
    assert(claim, `${decision.type}: fixed claim missing`);
    assert.equal(claim.claim_type, decision.type);
    assert.equal(claim.claim_value, decision.value);
    assert.equal(claim.source_url, decision.sourceUrl);
    assert.equal(claim.conflict_status, 'none');
    assert(
      claim.verification_status === 'candidate' || claim.verification_status === decision.status,
      `${decision.type}: unexpected review status`,
    );
  }

  if (args.includes('--status') || !args.includes('--commit')) {
    console.log(
      JSON.stringify(
        {
          success: true,
          mode: args.includes('--status') ? 'status' : 'dry-run',
          decisions: decisions.map((decision) => ({
            type: decision.type,
            nextStatus: decision.status,
            currentStatus: claims.find((claim) => claim.id === decision.id)?.verification_status,
          })),
        },
        null,
        2,
      ),
    );
    return;
  }

  const verifiedAt = new Date().toISOString();
  for (const decision of decisions) {
    const current = claims.find((claim) => claim.id === decision.id);
    if (current?.verification_status === decision.status && current.source_excerpt === decision.excerpt) continue;
    const update = {
      source_type: 'official',
      verification_status: decision.status,
      verified_at: decision.status === 'verified' ? verifiedAt : null,
      verified_by: null,
      verification_note: decision.note,
      review_due_at: decision.status === 'verified' ? reviewDueAt : null,
      expires_at: null,
      invalidated_at: null,
      invalidation_reason: null,
      validity_scope:
        decision.status === 'verified'
          ? { scope: decision.type === 'pricing_model' ? 'pricing-page-presence-only' : 'official-product-identity' }
          : {},
      source_excerpt: decision.excerpt,
    };
    const { error: updateError } = await supabase
      .from('product_intelligence_claims')
      .update(update)
      .eq('id', decision.id)
      .eq('verification_status', current?.verification_status || 'candidate');
    if (updateError) throw new Error(updateError.message);
  }

  const { error: profileError } = await supabase
    .from('product_intelligence_profiles')
    .update({ last_verified_at: verifiedAt, next_review_at: reviewDueAt })
    .eq('id', profileId);
  if (profileError) throw new Error(profileError.message);

  const { data: after, error: afterError } = await supabase
    .from('product_intelligence_claims')
    .select('id, verification_status, conflict_status, source_excerpt, verification_note, review_due_at')
    .eq('profile_id', profileId);
  if (afterError) throw new Error(afterError.message);
  for (const decision of decisions) {
    const claim = after?.find((item) => item.id === decision.id);
    assert.equal(claim?.verification_status, decision.status);
    assert.equal(claim?.conflict_status, 'none');
    assert.equal(claim?.source_excerpt, decision.excerpt);
    assert.equal(claim?.verification_note, decision.note);
    if (decision.status === 'verified') {
      assert.equal(new Date(String(claim?.review_due_at)).getTime(), new Date(reviewDueAt).getTime());
    } else {
      assert.equal(claim?.review_due_at, null);
    }
  }
  console.log(
    JSON.stringify({ success: true, mode: 'commit', profileId, verified: 2, rejected: 1, reviewDueAt }, null, 2),
  );
}

main().catch((error) => {
  console.error(error instanceof Error ? error.message : error);
  process.exitCode = 1;
});
