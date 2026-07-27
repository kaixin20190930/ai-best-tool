import Link from 'next/link';
import { AlertTriangle, ArrowUpRight, Layers3, ListChecks, ShieldCheck, Sparkles } from 'lucide-react';
import { getTranslations } from 'next-intl/server';

import { getAdminIntelligenceOverview } from '@/lib/services/admin/intelligence';

export async function generateMetadata({ params }: { params: { locale: string } }) {
  const t = await getTranslations({ locale: params.locale, namespace: 'admin' });

  return {
    title: `${t('title')} - Intelligence`,
  };
}

function formatDate(value: string | null) {
  if (!value) return '—';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return '—';
  return date.toLocaleString();
}

function badgeClass(status: string) {
  if (status === 'ready') return 'bg-emerald-50 text-emerald-700';
  if (status === 'conflict') return 'bg-rose-50 text-rose-700';
  if (status === 'stale') return 'bg-orange-50 text-orange-700';
  return 'bg-amber-50 text-amber-700';
}

export default async function AdminIntelligencePage({
  searchParams,
}: {
  searchParams: {
    ownerType?: 'tool' | 'distribution_project' | 'all';
    status?: 'pending' | 'ready' | 'conflict' | 'stale' | 'all';
    profileId?: string;
  };
}) {
  const ownerType =
    searchParams.ownerType === 'tool' || searchParams.ownerType === 'distribution_project'
      ? searchParams.ownerType
      : 'all';
  const status =
    searchParams.status === 'pending' ||
    searchParams.status === 'ready' ||
    searchParams.status === 'conflict' ||
    searchParams.status === 'stale'
      ? searchParams.status
      : 'all';
  const overview = await getAdminIntelligenceOverview({
    ownerType,
    status,
    profileId: searchParams.profileId,
    limit: 30,
  });

  const selected = overview.selectedProfile;

  return (
    <div className='space-y-6'>
      <div className='flex flex-col justify-between gap-4 sm:flex-row sm:items-end'>
        <div>
          <p className='text-xs font-bold uppercase tracking-[0.18em] text-cyan-700'>Product intelligence</p>
          <h1 className='mt-2 text-3xl font-bold text-slate-950'>Evidence archive</h1>
          <p className='mt-2 max-w-2xl text-sm leading-6 text-slate-600'>
            Review the shared product facts that drive content, conflict detection, and distribution planning.
          </p>
        </div>
        <Link
          href='/admin/tools'
          className='inline-flex items-center gap-2 rounded-xl border border-slate-200 px-4 py-2.5 text-sm font-bold text-slate-700 hover:border-cyan-300 hover:text-cyan-700'
        >
          Back to tools <ArrowUpRight className='h-4 w-4' />
        </Link>
      </div>

      <section className='grid gap-3 sm:grid-cols-2 lg:grid-cols-6'>
        <div className='rounded-2xl border border-slate-200 bg-white p-4 shadow-sm'>
          <Sparkles className='h-5 w-5 text-cyan-700' />
          <div className='mt-3 text-2xl font-bold text-slate-950'>{overview.totals.profiles}</div>
          <div className='mt-1 text-xs text-slate-500'>Profiles</div>
        </div>
        <div className='rounded-2xl border border-slate-200 bg-white p-4 shadow-sm'>
          <ShieldCheck className='h-5 w-5 text-emerald-700' />
          <div className='mt-3 text-2xl font-bold text-slate-950'>{overview.totals.ready}</div>
          <div className='mt-1 text-xs text-slate-500'>Ready</div>
        </div>
        <div className='rounded-2xl border border-slate-200 bg-white p-4 shadow-sm'>
          <AlertTriangle className='h-5 w-5 text-amber-700' />
          <div className='mt-3 text-2xl font-bold text-slate-950'>{overview.totals.pending}</div>
          <div className='mt-1 text-xs text-slate-500'>Pending</div>
        </div>
        <div className='rounded-2xl border border-slate-200 bg-white p-4 shadow-sm'>
          <Layers3 className='h-5 w-5 text-rose-700' />
          <div className='mt-3 text-2xl font-bold text-slate-950'>{overview.totals.conflict}</div>
          <div className='mt-1 text-xs text-slate-500'>Conflict</div>
        </div>
        <div className='rounded-2xl border border-slate-200 bg-white p-4 shadow-sm'>
          <ListChecks className='h-5 w-5 text-slate-700' />
          <div className='mt-3 text-2xl font-bold text-slate-950'>{overview.totals.verifiedClaims}</div>
          <div className='mt-1 text-xs text-slate-500'>Verified claims</div>
        </div>
        <div className='rounded-2xl border border-slate-200 bg-white p-4 shadow-sm'>
          <AlertTriangle className='h-5 w-5 text-orange-700' />
          <div className='mt-3 text-2xl font-bold text-slate-950'>{overview.totals.conflicts}</div>
          <div className='mt-1 text-xs text-slate-500'>Conflict flags</div>
        </div>
      </section>

      <section className='grid gap-4 lg:grid-cols-[1.1fr_1.4fr]'>
        <div className='rounded-2xl border border-slate-200 bg-white p-5 shadow-sm'>
          <div className='flex items-center justify-between gap-3'>
            <h2 className='text-lg font-bold text-slate-950'>Profiles</h2>
            <span className='text-xs text-slate-500'>{overview.profiles.length} shown</span>
          </div>
          <div className='mt-4 space-y-3'>
            {overview.profiles.map((profile) => {
              const params = new URLSearchParams();
              if (ownerType !== 'all') params.set('ownerType', ownerType);
              if (status !== 'all') params.set('status', status);
              params.set('profileId', profile.id);
              return (
                <Link
                  key={profile.id}
                  href={`/admin/intelligence?${params.toString()}`}
                  className={`block rounded-xl border p-4 transition ${
                    selected?.id === profile.id
                      ? 'border-cyan-300 bg-cyan-50/60'
                      : 'border-slate-200 hover:border-cyan-200 hover:bg-slate-50'
                  }`}
                >
                  <div className='flex items-center justify-between gap-3'>
                    <div>
                      <div className='text-sm font-semibold text-slate-950'>{profile.productName}</div>
                      <div className='mt-1 text-xs text-slate-500'>
                        {profile.canonicalDomain} · {profile.ownerType}
                      </div>
                    </div>
                    <span className={`rounded-full px-2 py-1 text-xs font-semibold ${badgeClass(profile.status)}`}>
                      {profile.status}
                    </span>
                  </div>
                  <div className='mt-3 grid grid-cols-4 gap-2 text-xs text-slate-500'>
                    <div>
                      <span className='block font-semibold text-slate-900'>{profile.sourceCount}</span>
                      sources
                    </div>
                    <div>
                      <span className='block font-semibold text-slate-900'>{profile.claimCount}</span>
                      claims
                    </div>
                    <div>
                      <span className='block font-semibold text-slate-900'>{profile.assetCount}</span>
                      assets
                    </div>
                    <div>
                      <span className='block font-semibold text-slate-900'>{profile.conflictCount}</span>
                      conflicts
                    </div>
                  </div>
                </Link>
              );
            })}
          </div>
        </div>

        <div className='rounded-2xl border border-slate-200 bg-white p-5 shadow-sm'>
          {selected ? (
            <div className='space-y-5'>
              <div className='flex flex-col gap-3 lg:flex-row lg:items-start lg:justify-between'>
                <div>
                  <div className='inline-flex items-center rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-700'>
                    {selected.ownerType}
                  </div>
                  <h2 className='mt-3 text-2xl font-bold text-slate-950'>{selected.productName}</h2>
                  <p className='mt-2 text-sm text-slate-600'>{selected.canonicalDomain}</p>
                </div>
                <div className={`rounded-full px-3 py-1 text-xs font-semibold ${badgeClass(selected.status)}`}>
                  {selected.status}
                </div>
              </div>

              <div className='grid gap-3 sm:grid-cols-2 xl:grid-cols-4'>
                <div className='rounded-xl bg-slate-50 p-3'>
                  <div className='text-xs uppercase tracking-wide text-slate-500'>Version</div>
                  <div className='mt-1 text-lg font-semibold text-slate-950'>{selected.version}</div>
                </div>
                <div className='rounded-xl bg-slate-50 p-3'>
                  <div className='text-xs uppercase tracking-wide text-slate-500'>Last crawled</div>
                  <div className='mt-1 text-lg font-semibold text-slate-950'>{formatDate(selected.lastCrawledAt)}</div>
                </div>
                <div className='rounded-xl bg-slate-50 p-3'>
                  <div className='text-xs uppercase tracking-wide text-slate-500'>Last verified</div>
                  <div className='mt-1 text-lg font-semibold text-slate-950'>{formatDate(selected.lastVerifiedAt)}</div>
                </div>
                <div className='rounded-xl bg-slate-50 p-3'>
                  <div className='text-xs uppercase tracking-wide text-slate-500'>Next review</div>
                  <div className='mt-1 text-lg font-semibold text-slate-950'>{formatDate(selected.nextReviewAt)}</div>
                </div>
              </div>

              <div className='grid gap-4 xl:grid-cols-3'>
                <div className='rounded-xl border border-slate-200 p-4'>
                  <h3 className='text-sm font-bold text-slate-950'>Facts</h3>
                  <dl className='mt-3 space-y-3 text-sm'>
                    <div>
                      <dt className='text-slate-500'>Metadata</dt>
                      <dd className='mt-1 text-slate-900'>
                        {Object.keys(selected.metadata).length > 0 ? 'Present' : 'Empty'}
                      </dd>
                    </div>
                    <div>
                      <dt className='text-slate-500'>Source count</dt>
                      <dd className='mt-1 text-slate-900'>{selected.sourceCount}</dd>
                    </div>
                    <div>
                      <dt className='text-slate-500'>Claim count</dt>
                      <dd className='mt-1 text-slate-900'>{selected.claimCount}</dd>
                    </div>
                    <div>
                      <dt className='text-slate-500'>Asset count</dt>
                      <dd className='mt-1 text-slate-900'>{selected.assetCount}</dd>
                    </div>
                    <div>
                      <dt className='text-slate-500'>Conflict flags</dt>
                      <dd className='mt-1 text-slate-900'>{selected.conflictCount}</dd>
                    </div>
                  </dl>
                </div>

                <div className='rounded-xl border border-slate-200 p-4 xl:col-span-2'>
                  <h3 className='text-sm font-bold text-slate-950'>Claims</h3>
                  <div className='mt-3 space-y-3'>
                    {selected.claims.length > 0 ? (
                      selected.claims.map((claim) => (
                        <div key={claim.id} className='rounded-lg bg-slate-50 p-3'>
                          <div className='flex flex-wrap items-center gap-2 text-xs font-semibold text-slate-500'>
                            <span className='rounded-full bg-white px-2 py-1 text-slate-700'>{claim.claimType}</span>
                            <span className='rounded-full bg-white px-2 py-1 text-slate-700'>
                              {claim.conflictStatus}
                            </span>
                            <span className='rounded-full bg-white px-2 py-1 text-slate-700'>
                              conf:{claim.confidence}
                            </span>
                          </div>
                          <div className='mt-2 text-sm text-slate-900'>
                            {typeof claim.claimValue === 'string' ? claim.claimValue : JSON.stringify(claim.claimValue)}
                          </div>
                          <div className='mt-2 text-xs text-slate-500'>
                            {claim.sourceUrl}
                            {claim.sourceExcerpt ? (
                              <span className='mt-1 block text-slate-400'>{claim.sourceExcerpt}</span>
                            ) : null}
                          </div>
                        </div>
                      ))
                    ) : (
                      <p className='text-sm text-slate-500'>No claims recorded.</p>
                    )}
                  </div>
                </div>
              </div>

              <div className='grid gap-4 xl:grid-cols-2'>
                <div className='rounded-xl border border-slate-200 p-4'>
                  <h3 className='text-sm font-bold text-slate-950'>Sources</h3>
                  <div className='mt-3 space-y-3'>
                    {selected.sources.length > 0 ? (
                      selected.sources.map((source) => (
                        <div key={source.id} className='rounded-lg bg-slate-50 p-3 text-sm'>
                          <div className='flex items-center justify-between gap-3'>
                            <span className='font-semibold text-slate-900'>{source.pageType}</span>
                            <span className='rounded-full bg-white px-2 py-1 text-xs text-slate-600'>
                              {source.fetchStatus}
                            </span>
                          </div>
                          <a
                            href={source.url}
                            target='_blank'
                            rel='noreferrer'
                            className='mt-2 block truncate text-cyan-700 hover:underline'
                          >
                            {source.url}
                          </a>
                          <div className='mt-2 text-xs text-slate-500'>
                            status {source.httpStatus ?? '—'} · fetched {formatDate(source.fetchedAt)}
                          </div>
                        </div>
                      ))
                    ) : (
                      <p className='text-sm text-slate-500'>No sources recorded.</p>
                    )}
                  </div>
                </div>

                <div className='rounded-xl border border-slate-200 p-4'>
                  <h3 className='text-sm font-bold text-slate-950'>Assets</h3>
                  <div className='mt-3 space-y-3'>
                    {selected.assets.length > 0 ? (
                      selected.assets.map((asset) => (
                        <div key={asset.id} className='rounded-lg bg-slate-50 p-3 text-sm'>
                          <div className='flex items-center justify-between gap-3'>
                            <span className='font-semibold text-slate-900'>{asset.assetType}</span>
                            <span className='rounded-full bg-white px-2 py-1 text-xs text-slate-600'>
                              {asset.evidenceStatus}
                            </span>
                          </div>
                          <a
                            href={asset.sourceUrl}
                            target='_blank'
                            rel='noreferrer'
                            className='mt-2 block truncate text-cyan-700 hover:underline'
                          >
                            {asset.sourceUrl}
                          </a>
                          <div className='mt-2 text-xs text-slate-500'>
                            {asset.isPlaceholder ? 'placeholder' : 'real asset'}
                          </div>
                        </div>
                      ))
                    ) : (
                      <p className='text-sm text-slate-500'>No assets recorded.</p>
                    )}
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <div className='flex min-h-[420px] items-center justify-center rounded-xl border border-dashed border-slate-200 bg-slate-50 text-sm text-slate-500'>
              Select a profile to inspect its evidence, conflicts, and review timing.
            </div>
          )}
        </div>
      </section>
    </div>
  );
}
