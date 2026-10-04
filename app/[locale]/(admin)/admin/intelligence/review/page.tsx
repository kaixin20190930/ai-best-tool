import Link from 'next/link';

import { requireAdmin } from '@/lib/auth/middleware';
import { createAdminClient } from '@/lib/supabase/admin';
import {
  EvidenceReviewControls,
  GeminiLinkReviewButton,
  GeminiPlanPurposeLinkButton,
  PerplexityLinkReviewButton,
} from '@/components/admin/EvidenceReviewControls';

const GEMINI_PROFILE = 'c7890701-0000-4000-8000-000000000001';
const PERPLEXITY_PROFILE = 'd0186230-0000-4000-8000-000000000001';

export default async function EvidenceReviewQueue({
  searchParams,
}: {
  searchParams: {
    profileId?: string;
    state?: string;
  };
}) {
  await requireAdmin();
  const db = createAdminClient();
  const { data: profiles, error: profileError } = await db
    .from('product_intelligence_profiles')
    .select('id, owner_type, owner_id, product_name, canonical_domain, profile_status')
    .eq('owner_type', 'tool')
    .order('product_name')
    .limit(200);
  if (profileError) throw new Error(profileError.message);
  const selectedId =
    searchParams.profileId && profiles?.some((p) => p.id === searchParams.profileId)
      ? searchParams.profileId
      : undefined;
  let query = db.from('product_intelligence_claims').select('*').order('observed_at', { ascending: false }).limit(200);
  if (selectedId) query = query.eq('profile_id', selectedId);
  const { data: claims, error: claimError } = await query;
  if (claimError) throw new Error(claimError.message);
  const sourceIds = Array.from(new Set((claims || []).map((claim) => claim.source_id).filter(Boolean)));
  const { data: sources, error: sourceError } = sourceIds.length
    ? await db
        .from('product_intelligence_sources')
        .select('id, profile_id, url, source_type, fetch_status')
        .in('id', sourceIds)
    : { data: [], error: null };
  if (sourceError) throw new Error(sourceError.message);
  const sourceById = new Map((sources || []).map((source) => [source.id, source]));
  const profileById = new Map((profiles || []).map((profile) => [profile.id, profile]));
  const claimIds = (claims || []).map((claim) => claim.id);
  const { data: audits, error: auditError } = claimIds.length
    ? await db
        .from('admin_evidence_review_audit')
        .select('claim_id, action, created_at')
        .in('claim_id', claimIds)
        .order('created_at', { ascending: false })
        .limit(500)
    : { data: [], error: null };
  if (auditError) throw new Error(`Evidence review migration required: ${auditError.message}`);
  const lastDecision = new Map<string, string>();
  (audits || []).forEach((audit) => {
    if (audit.claim_id && !lastDecision.has(audit.claim_id)) lastDecision.set(audit.claim_id, audit.action);
  });
  const today = Date.now();
  const stateOf = (claim: NonNullable<typeof claims>[number]) => {
    if (claim.verification_status === 'verified')
      return claim.review_due_at && Date.parse(claim.review_due_at) <= today ? 'overdue' : 'reviewed';
    return 'candidate';
  };
  const state = ['all', 'pending', 'candidate', 'reviewed', 'overdue'].includes(searchParams.state || '')
    ? searchParams.state
    : 'all';
  const shown = (claims || []).filter(
    (claim) =>
      state === 'all' ||
      (state === 'pending'
        ? profileById.get(claim.profile_id)?.profile_status === 'pending'
        : stateOf(claim) === state),
  );
  const selected = selectedId ? profileById.get(selectedId) : undefined;
  return (
    <div className='space-y-5'>
      <div>
        <Link href='/admin/intelligence' className='text-sm text-cyan-700'>
          ← Evidence archive
        </Link>
        <h1 className='mt-2 text-2xl font-bold'>Evidence Review Queue</h1>
        <p className='mt-1 text-sm text-slate-600'>
          Open each official source, check the claim and scope, paste a real excerpt, then choose PASS or HOLD.
          Candidate evidence remains unpublished until review.
        </p>
      </div>
      <div className='flex flex-wrap gap-2'>
        <Link href='/admin/intelligence/review?state=all' className='rounded bg-slate-100 px-3 py-2 text-sm'>
          All tools
        </Link>
        {(profiles || []).map((profile) => (
          <Link
            key={profile.id}
            href={`/admin/intelligence/review?profileId=${profile.id}&state=${state}`}
            className={`rounded px-3 py-2 text-sm ${selectedId === profile.id ? 'bg-cyan-700 text-white' : 'bg-slate-100'}`}
          >
            {profile.product_name}
          </Link>
        ))}
      </div>
      <div className='flex gap-2'>
        {['all', 'pending', 'candidate', 'reviewed', 'overdue'].map((item) => (
          <Link
            key={item}
            href={`/admin/intelligence/review?${selectedId ? `profileId=${selectedId}&` : ''}state=${item}`}
            className={`rounded px-3 py-2 text-xs font-bold ${state === item ? 'bg-slate-950 text-white' : 'bg-slate-100'}`}
          >
            {item}
          </Link>
        ))}
      </div>
      {selected?.id === GEMINI_PROFILE && (
        <section className='rounded-xl border border-cyan-200 bg-cyan-50 p-4'>
          <h2 className='font-bold'>Gemini Notebook Stage 2</h2>
          <p className='my-2 text-sm'>
            After all ten official claims individually PASS, this action reviews only the existing draft Decision, two
            Capabilities and Fit, and creates its original 5/9/6 same-owner links. It does not publish relations or a
            Task Page, or change index/sitemap.
          </p>
          <GeminiLinkReviewButton />
          <p className='my-2 text-xs text-slate-700'>
            Use the repair control only when the reviewed citation-traceability Capability has exactly the existing four
            links and needs its verified plan-purpose claim. The RPC rejects any other partial or drifted state.
          </p>
          <GeminiPlanPurposeLinkButton />
        </section>
      )}
      {selected?.id === PERPLEXITY_PROFILE && (
        <section className='rounded-xl border border-cyan-200 bg-cyan-50 p-4'>
          <h2 className='font-bold'>Perplexity Stage 2</h2>
          <p className='my-2 text-sm'>
            After all seven official claims are verified and current, this action reviews only the existing draft
            Decision, two Capabilities and conditional Fit, then creates the predefined 6/10/7 same-owner links. It does
            not publish a relation or Task Page, or change tool and index state.
          </p>
          <PerplexityLinkReviewButton />
        </section>
      )}
      <div className='grid gap-4 xl:grid-cols-2'>
        {shown.map((claim) => {
          const source = sourceById.get(claim.source_id);
          const profile = profileById.get(claim.profile_id);
          return (
            <article key={claim.id} className='rounded-xl border border-slate-200 bg-white p-4'>
              <div className='flex flex-wrap gap-2 text-xs font-bold text-slate-600'>
                <span>{profile?.product_name || claim.profile_id}</span>
                <span>profile: {profile?.profile_status || 'unknown'}</span>
                <span>{stateOf(claim)}</span>
                <span>Last decision: {lastDecision.get(claim.id) || 'none'}</span>
                <span>{claim.conflict_status}</span>
              </div>
              <h2 className='mt-2 font-semibold'>
                {claim.claim_key}:{' '}
                {typeof claim.claim_value === 'string' ? claim.claim_value : JSON.stringify(claim.claim_value)}
              </h2>
              <div className='mt-2 text-xs text-slate-600'>
                Source: {source?.source_type || 'unmatched'} · {source?.fetch_status || 'missing'} · Claim URL:{' '}
                {claim.source_url}
              </div>
              {source?.url?.startsWith('https://') && (
                <a
                  href={source.url}
                  target='_blank'
                  rel='noreferrer'
                  className='mt-1 block break-all text-xs text-cyan-700 underline'
                >
                  Open official source ↗ {source.url}
                </a>
              )}
              <div className='mt-2 text-xs text-slate-500'>Scope: {JSON.stringify(claim.validity_scope || {})}</div>
              <div className='text-xs text-slate-500'>
                Verified: {claim.verified_at || '—'} · Next review: {claim.review_due_at || '—'} · Expires:{' '}
                {claim.expires_at || '—'}
              </div>
              <EvidenceReviewControls
                claim={{
                  id: claim.id,
                  sourceExcerpt: claim.source_excerpt,
                  verificationNote: claim.verification_note,
                  validityScope: claim.validity_scope || {},
                  reviewDueAt: claim.review_due_at,
                }}
              />
            </article>
          );
        })}
      </div>
      {!shown.length && <p className='rounded-lg bg-slate-50 p-4 text-sm'>No claims in this queue state.</p>}
    </div>
  );
}
