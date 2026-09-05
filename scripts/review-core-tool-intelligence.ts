import assert from 'node:assert/strict';
import { loadEnvConfig } from '@next/env';

import { createAdminClient } from '@/lib/supabase/admin';

loadEnvConfig(process.cwd());

type Decision = {
  id: string;
  type: string;
  value: unknown;
  sourceUrl: string;
  status: 'verified' | 'rejected';
  note: string;
  excerpt: string;
  scope?: string;
};

type Review = {
  profileId: string;
  ownerId: string;
  productName: string;
  reviewDueAt: string;
  officialHosts: string[];
  decisions: Decision[];
};

const reviews: Record<string, Review> = {
  gamma: {
    profileId: '63031451-a3eb-497d-9396-d6904aa2d3b3',
    ownerId: '6512aa61-8663-49f8-809d-2a2ab4e529ad',
    productName: 'Gamma',
    reviewDueAt: '2026-10-05T00:00:00.000Z',
    officialHosts: ['gamma.app'],
    decisions: [
      {
        id: 'd9b7a76f-30ae-4ace-8d85-2cd49faaa444',
        type: 'product_name',
        value: 'Gamma',
        sourceUrl: 'https://gamma.app/',
        status: 'verified',
        note: 'Owner-authorized assisted review: Gamma name confirmed on the official homepage and page title on 2026-09-05.',
        excerpt: 'Gamma | Best AI Presentation Maker & Website Builder',
        scope: 'official-product-identity',
      },
      {
        id: '252937c0-6e4c-4220-86b3-820cf8b67ea5',
        type: 'pricing_model',
        value: 'published_pricing_page',
        sourceUrl: 'https://gamma.app/pricing',
        status: 'verified',
        note: 'Owner-authorized assisted review: official pricing page showed Free, Plus, Pro and Ultra plans on 2026-09-05; no price amount was verified.',
        excerpt: "Choose the plan that's right for you; Free, Plus, Pro and Ultra plans are listed.",
        scope: 'pricing-page-presence-only',
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
    ],
  },
  luma: {
    profileId: '4501f2f9-4579-4675-9a16-0ef800fe8385',
    ownerId: '711df152-fdcf-4a19-930c-ab866b67605f',
    productName: 'Luma Dream Machine',
    reviewDueAt: '2026-10-05T00:00:00.000Z',
    officialHosts: ['dream-machine.lumalabs.ai'],
    decisions: [
      {
        id: '4cf9edb2-8b6d-49dd-bc36-ccbc32f7a939',
        type: 'one_line_positioning',
        value:
          'Ideate, visualize, create videos, and share your dreams with the world, using our most powerful image and video AI models.',
        sourceUrl: 'https://dream-machine.lumalabs.ai/',
        status: 'verified',
        note: 'Owner-authorized assisted review: positioning exactly matched the official homepage description on 2026-09-05.',
        excerpt:
          'Ideate, visualize, create videos, and share your dreams with the world, using our most powerful image and video AI models.',
        scope: 'official-product-positioning',
      },
      {
        id: 'ba3f00b1-cb72-4383-827e-685b0c18d2d8',
        type: 'product_name',
        value: 'Luma Dream Machine | AI Video Generator',
        sourceUrl: 'https://dream-machine.lumalabs.ai/',
        status: 'rejected',
        note: 'Rejected after official-page review on 2026-09-05: the extracted value includes a descriptive SEO title suffix, not only the product name.',
        excerpt: 'Luma Dream Machine | AI Video Generator',
      },
    ],
  },
  n8n: {
    profileId: '78427cbc-30df-43f4-99f1-ecbc2ae76c10',
    ownerId: '23bb3601-a5ac-42c3-bff3-64b06a063959',
    productName: 'n8n',
    reviewDueAt: '2026-10-05T00:00:00.000Z',
    officialHosts: ['n8n.io'],
    decisions: [
      {
        id: '2cb79bcc-be88-4d2a-b35c-e1b23b9ce1ab',
        type: 'product_name',
        value: 'n8n',
        sourceUrl: 'https://n8n.io/',
        status: 'verified',
        note: 'Owner-authorized assisted review: n8n name confirmed from the official homepage metadata on 2026-09-05.',
        excerpt: 'AI Workflow Automation Platform - n8n',
        scope: 'official-product-identity',
      },
      {
        id: '806bedca-c1e4-4fd1-ae57-e4db06567e47',
        type: 'one_line_positioning',
        value:
          'n8n is a workflow automation platform that uniquely combines AI capabilities with business process automation, giving technical teams the flexibility of code with the speed of no-code.',
        sourceUrl: 'https://n8n.io/',
        status: 'verified',
        note: 'Owner-authorized assisted review: positioning exactly matched the official homepage description on 2026-09-05.',
        excerpt:
          'n8n is a workflow automation platform that uniquely combines AI capabilities with business process automation, giving technical teams the flexibility of code with the speed of no-code.',
        scope: 'official-product-positioning',
      },
      {
        id: 'aa91e4f6-f8f4-4eea-9818-e5fb164a9338',
        type: 'pricing_model',
        value: 'published_pricing_page',
        sourceUrl: 'https://n8n.io/pricing/',
        status: 'verified',
        note: 'Owner-authorized assisted review: the official n8n pricing page published selectable plans on 2026-09-05; no plan amount was promoted from the dynamic page.',
        excerpt: 'Official n8n pricing page with published Cloud and self-hosted plan options.',
        scope: 'pricing-page-presence-only',
      },
      {
        id: '9e9d0bf6-a9d0-403e-ad9d-efbc8045dc28',
        type: 'free_trial',
        value: true,
        sourceUrl: 'https://n8n.io/pricing/',
        status: 'verified',
        note: 'Owner-authorized assisted review: the official pricing page explicitly displayed a free-trial CTA without a credit card on 2026-09-05.',
        excerpt: 'Start free trial. No credit card required.',
        scope: 'official-pricing-trial-availability',
      },
    ],
  },
  openrouter: {
    profileId: '2c4881f1-edf8-4b6a-9280-0ab88a006057',
    ownerId: 'f77fb817-e8dc-4c22-b7cd-8edc2e5b0a5e',
    productName: 'OpenRouter',
    reviewDueAt: '2026-10-05T00:00:00.000Z',
    officialHosts: ['openrouter.ai'],
    decisions: [
      {
        id: '31afa697-ce1e-45f6-9f37-08300bdcd68e',
        type: 'product_name',
        value: 'OpenRouter',
        sourceUrl: 'https://openrouter.ai/',
        status: 'verified',
        note: 'Owner-authorized assisted review: OpenRouter name confirmed from the official homepage metadata on 2026-09-05.',
        excerpt: 'OpenRouter',
        scope: 'official-product-identity',
      },
      {
        id: '76cf5413-ce8c-424d-9a6b-21584758cf72',
        type: 'one_line_positioning',
        value: 'The unified interface for every model. Find the best models & prices for your prompts',
        sourceUrl: 'https://openrouter.ai/',
        status: 'verified',
        note: 'Owner-authorized assisted review: positioning exactly matched the official homepage description on 2026-09-05.',
        excerpt: 'The unified interface for every model. Find the best models & prices for your prompts',
        scope: 'official-product-positioning',
      },
      {
        id: 'd7a18353-7813-40c8-a2f2-acb0063683e4',
        type: 'pricing_model',
        value: 'published_pricing_page',
        sourceUrl: 'https://openrouter.ai/pricing',
        status: 'verified',
        note: 'Owner-authorized assisted review: the official OpenRouter pricing page was available on 2026-09-05; no model or plan amount was verified from dynamic page content.',
        excerpt: 'Official OpenRouter pricing page for model and account pricing.',
        scope: 'pricing-page-presence-only',
      },
    ],
  },
};

function readTool(args: string[]) {
  const value = args.find((arg) => arg.startsWith('--tool='))?.slice('--tool='.length);
  assert(value && reviews[value], `Use --tool=${Object.keys(reviews).join('|')}`);
  return value;
}

async function main() {
  const args = process.argv.slice(2).filter((arg) => arg !== '--');
  const tool = readTool(args);
  const modeArgs = args.filter((arg) => !arg.startsWith('--tool='));
  assert(modeArgs.length <= 1 && modeArgs.every((arg) => ['--check', '--commit', '--status'].includes(arg)));
  const review = reviews[tool];
  for (const decision of review.decisions) {
    assert(/^[0-9a-f-]{36}$/i.test(decision.id));
    assert(review.officialHosts.includes(new URL(decision.sourceUrl).hostname));
    assert(decision.note.length >= 40);
  }
  if (modeArgs.includes('--check')) {
    console.log(`PASS ${tool} claim IDs, official domains, bounded decisions and review notes`);
    return;
  }

  const supabase = createAdminClient();
  const { data: profile, error: profileReadError } = await supabase
    .from('product_intelligence_profiles')
    .select('id, owner_type, owner_id, product_name')
    .eq('id', review.profileId)
    .maybeSingle();
  if (profileReadError) throw new Error(profileReadError.message);
  assert(profile, `${tool}: profile missing`);
  assert.equal(profile.owner_type, 'tool');
  assert.equal(profile.owner_id, review.ownerId);
  const { data: claims, error } = await supabase
    .from('product_intelligence_claims')
    .select('id, claim_type, claim_value, source_url, verification_status, conflict_status, source_excerpt')
    .eq('profile_id', review.profileId);
  if (error) throw new Error(error.message);
  assert.equal(
    claims?.length,
    review.decisions.length,
    `${tool}: candidate set changed; review instead of overwriting`,
  );
  for (const decision of review.decisions) {
    const claim = claims.find((item) => item.id === decision.id);
    assert(claim, `${decision.type}: fixed claim missing`);
    assert.equal(claim.claim_type, decision.type);
    assert.equal(claim.claim_value, decision.value);
    assert.equal(claim.source_url, decision.sourceUrl);
    assert.equal(claim.conflict_status, 'none');
    assert(['candidate', decision.status].includes(claim.verification_status));
  }

  if (modeArgs.includes('--status') || !modeArgs.includes('--commit')) {
    console.log(
      JSON.stringify(
        {
          success: true,
          tool,
          productName: { current: profile.product_name, next: review.productName },
          mode: modeArgs.includes('--status') ? 'status' : 'dry-run',
          decisions: review.decisions.map((decision) => ({
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
  for (const decision of review.decisions) {
    const current = claims.find((claim) => claim.id === decision.id);
    if (current?.verification_status === decision.status && current.source_excerpt === decision.excerpt) continue;
    const update = {
      source_type: 'official',
      verification_status: decision.status,
      verified_at: decision.status === 'verified' ? verifiedAt : null,
      verified_by: null,
      verification_note: decision.note,
      review_due_at: decision.status === 'verified' ? review.reviewDueAt : null,
      expires_at: null,
      invalidated_at: null,
      invalidation_reason: null,
      validity_scope: decision.status === 'verified' ? { scope: decision.scope } : {},
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
    .update({ product_name: review.productName, last_verified_at: verifiedAt, next_review_at: review.reviewDueAt })
    .eq('id', review.profileId);
  if (profileError) throw new Error(profileError.message);
  const { data: updatedProfile, error: updatedProfileError } = await supabase
    .from('product_intelligence_profiles')
    .select('owner_type, owner_id, product_name')
    .eq('id', review.profileId)
    .maybeSingle();
  if (updatedProfileError) throw new Error(updatedProfileError.message);
  assert.equal(updatedProfile?.owner_type, 'tool');
  assert.equal(updatedProfile?.owner_id, review.ownerId);
  assert.equal(updatedProfile?.product_name, review.productName);

  const { data: after, error: afterError } = await supabase
    .from('product_intelligence_claims')
    .select('id, verification_status, conflict_status, source_excerpt, verification_note, review_due_at')
    .eq('profile_id', review.profileId);
  if (afterError) throw new Error(afterError.message);
  for (const decision of review.decisions) {
    const claim = after?.find((item) => item.id === decision.id);
    assert.equal(claim?.verification_status, decision.status);
    assert.equal(claim?.conflict_status, 'none');
    assert.equal(claim?.source_excerpt, decision.excerpt);
    assert.equal(claim?.verification_note, decision.note);
    if (decision.status === 'verified') {
      assert.equal(new Date(String(claim?.review_due_at)).getTime(), new Date(review.reviewDueAt).getTime());
    } else {
      assert.equal(claim?.review_due_at, null);
    }
  }
  console.log(
    JSON.stringify(
      {
        success: true,
        tool,
        mode: 'commit',
        profileId: review.profileId,
        verified: review.decisions.filter((item) => item.status === 'verified').length,
        rejected: review.decisions.filter((item) => item.status === 'rejected').length,
        reviewDueAt: review.reviewDueAt,
      },
      null,
      2,
    ),
  );
}

main().catch((error) => {
  console.error(error instanceof Error ? error.message : error);
  process.exitCode = 1;
});
