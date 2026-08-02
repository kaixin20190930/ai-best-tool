'use client';

import { useEffect, useState } from 'react';
import { useFormStatus } from 'react-dom';
import Link from 'next/link';
import {
  ArrowRight,
  ArrowUpRight,
  CheckCircle2,
  Circle,
  ExternalLink,
  Link2,
  LoaderCircle,
  Plus,
  Radar,
  Send,
  ShieldCheck,
} from 'lucide-react';

import {
  DISTRIBUTION_TASK_STATUS_META,
  getDistributionTaskStatusChoices,
  getDistributionTaskStatusLabel,
  type DistributionTaskStatus,
} from '@/lib/services/distribution/taskStateMachine';
import {
  acceptDistributionTarget,
  createDistributionProjectAsset,
  createDistributionProject,
  createDistributionTask,
  createDistributionUtmLink,
  importDistributionIntelligenceAssets,
  importDistributionCatalogListing,
  recordDistributionResult,
  seedDistributionStarterTasks,
  updateDistributionProjectProfile,
  updateDistributionTaskStatus,
  type DistributionDashboard as DistributionDashboardData,
} from '@/app/actions/distribution';
import { getDistributionAssetGuidance } from '@/lib/services/distribution/listingBridge';

const statusOptions = getDistributionTaskStatusChoices();

function ImportListingButton({
  disabled,
  linked,
}: {
  disabled: boolean;
  linked: boolean;
}) {
  const { pending } = useFormStatus();
  const [stage, setStage] = useState(0);
  const messages = linked
    ? ['Refreshing listing data...', 'Updating product facts...', 'Syncing reusable assets...']
    : ['Connecting product listing...', 'Filling product facts...', 'Saving reusable assets...'];

  useEffect(() => {
    if (!pending) {
      setStage(0);
      return;
    }
    const timer = window.setInterval(() => setStage((current) => Math.min(current + 1, messages.length - 1)), 700);
    return () => window.clearInterval(timer);
  }, [messages.length, pending]);

  return (
    <button
      disabled={disabled || pending}
      aria-live='polite'
      className='inline-flex min-w-36 items-center justify-center gap-2 rounded-lg bg-cyan-700 px-3 py-2 text-xs font-bold text-white hover:bg-cyan-800 disabled:cursor-not-allowed disabled:bg-slate-200 disabled:text-slate-500'
    >
      {pending ? <LoaderCircle className='h-4 w-4 animate-spin' /> : null}
      {pending ? messages[stage] : disabled ? 'Different project domain' : linked ? 'Refresh listing data' : 'Import and review'}
    </button>
  );
}

function ImportAssetsButton() {
  const { pending } = useFormStatus();
  return (
    <button
      disabled={pending}
      aria-live='polite'
      className='inline-flex items-center justify-center gap-2 rounded-xl border border-cyan-200 bg-cyan-50 px-4 py-2.5 text-xs font-bold text-cyan-800 hover:bg-cyan-100 disabled:cursor-wait disabled:opacity-70'
    >
      {pending ? <LoaderCircle className='h-4 w-4 animate-spin' /> : null}
      {pending ? 'Importing discovered assets...' : 'Import discovered assets'}
    </button>
  );
}

function statusToneClass(status: DistributionTaskStatus) {
  const tone = DISTRIBUTION_TASK_STATUS_META[status].tone;
  if (tone === 'success') return 'bg-emerald-100 text-emerald-800';
  if (tone === 'warning') return 'bg-amber-100 text-amber-800';
  if (tone === 'danger') return 'bg-rose-100 text-rose-800';
  if (tone === 'info') return 'bg-cyan-100 text-cyan-800';
  return 'bg-slate-100 text-slate-700';
}

export default function DistributionDashboard({ data, locale }: { data: DistributionDashboardData; locale: string }) {
  const [showForm, setShowForm] = useState(false);
  const [showProjectForm, setShowProjectForm] = useState(false);
  const [showLinkForm, setShowLinkForm] = useState(false);
  const activeProjectId = data.project?.id || '';
  const activeProjectWebsiteUrl = data.project?.websiteUrl || null;
  const activeProjectSourceToolId = data.project?.sourceToolId || null;
  const profileComplete = Boolean(
    data.project?.factsConfirmedAt && data.project.websiteUrl && (data.project.description?.length || 0) >= 20,
  );
  const productType = data.project?.productType || 'other';
  const assetGuidance = getDistributionAssetGuidance(productType);
  const hasLogo = data.assets.some((asset) => ['logo', 'icon'].includes(asset.assetType));
  const targetTask = data.tasks.find((task) => Boolean(task.targetId));
  const targetTaskByTargetId = new Map(
    data.tasks.filter((task) => task.targetId).map((task) => [String(task.targetId), task]),
  );
  const packageGenerated = Boolean(targetTask?.packageStatus);
  const submitted = Boolean(
    targetTask && ['submitted', 'waiting_review', 'live', 'follow_up', 'done'].includes(targetTask.status),
  );
  const onboardingSteps = [
    {
      number: 1,
      title: 'Confirm product facts',
      description: 'Add a specific description, goal, capacity, and budget. Confirm only facts you can verify.',
      complete: profileComplete,
      href: '#distribution-profile',
      action: 'Complete profile',
    },
    {
      number: 2,
      title: 'Add reusable assets',
      description: 'Add at least one official logo. A product screenshot is strongly recommended.',
      complete: hasLogo,
      href: '#distribution-assets',
      action: 'Add logo',
    },
    {
      number: 3,
      title: 'Choose one target site',
      description: 'Review fit, cost, account requirements, and submission rules before accepting.',
      complete: Boolean(targetTask),
      href: '#distribution-targets',
      action: 'Review targets',
    },
    {
      number: 4,
      title: 'Generate the target package',
      description: 'The task combines verified facts, target rules, copy, UTM, and asset requirements.',
      complete: packageGenerated,
      href: targetTask ? `/${locale}/distribution/tasks/${targetTask.id}` : '#distribution-targets',
      action: 'Open target task',
    },
    {
      number: 5,
      title: 'Submit manually and record evidence',
      description: 'Submit on the target site, then save the review state or live URL here.',
      complete: submitted,
      href: targetTask ? `/${locale}/distribution/tasks/${targetTask.id}` : '#distribution-targets',
      action: 'Record result',
    },
  ];
  const nextStep = onboardingSteps.find((step) => !step.complete) || null;
  const completedStepCount = onboardingSteps.filter((step) => step.complete).length;
  const listingAssetCount = data.assets.filter(
    (asset) => asset.source === 'aibesttool_listing' && asset.sourceToolId === activeProjectSourceToolId,
  ).length;

  return (
    <div className='space-y-8'>
      <section className='flex flex-col gap-4 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm sm:flex-row sm:items-end sm:justify-between'>
        <label className='block min-w-0 flex-1 text-xs font-bold uppercase tracking-[0.16em] text-slate-500'>
          Product being distributed
          <select
            value={data.project?.id || ''}
            onChange={(event) => {
              const url = new URL(window.location.href);
              url.searchParams.set('project', event.target.value);
              window.location.href = url.toString();
            }}
            className='mt-2 block w-full max-w-xl rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm font-semibold normal-case tracking-normal text-slate-800 outline-none ring-cyan-400 focus:ring-2'
          >
            {data.projects.map((project) => (
              <option key={project.id} value={project.id}>
                {project.name}
                {project.websiteUrl ? ` · ${project.websiteUrl}` : ''}
              </option>
            ))}
          </select>
        </label>
        <button
          type='button'
          onClick={() => setShowProjectForm((visible) => !visible)}
          className='rounded-xl border border-slate-200 px-4 py-2.5 text-sm font-bold text-slate-700 hover:border-cyan-300 hover:text-cyan-700'
        >
          + New project
        </button>
      </section>

      <section className='overflow-hidden rounded-3xl border border-cyan-200 bg-white shadow-sm'>
        <div className='bg-gradient-to-r from-cyan-50 via-white to-amber-50 p-6 sm:p-8'>
          <div className='flex flex-col justify-between gap-5 lg:flex-row lg:items-start'>
            <div>
              <div className='text-xs font-bold uppercase tracking-[0.18em] text-cyan-700'>Start here</div>
              <h1 className='mt-2 text-2xl font-bold tracking-tight text-slate-950'>
                Launch {data.project?.name || 'this product'} in five guided steps
              </h1>
              <p className='mt-2 max-w-2xl text-sm leading-6 text-slate-600'>
                You only need this workspace and the target website. We prepare and track the work; you keep final
                control and submit manually.
              </p>
            </div>
            <div className='min-w-52 rounded-2xl border border-white bg-white/90 p-4 shadow-sm'>
              <div className='flex items-end justify-between gap-4'>
                <span className='text-sm font-bold text-slate-900'>Setup progress</span>
                <span className='text-2xl font-bold text-cyan-700'>{completedStepCount}/5</span>
              </div>
              <div className='mt-3 h-2 overflow-hidden rounded-full bg-slate-100'>
                <div
                  className='h-full rounded-full bg-cyan-600 transition-all'
                  style={{ width: `${completedStepCount * 20}%` }}
                />
              </div>
            </div>
          </div>
          <div className='mt-6 grid gap-3 lg:grid-cols-5'>
            {onboardingSteps.map((step) => (
              <a
                key={step.number}
                href={step.href}
                className={`rounded-2xl border p-4 transition hover:-translate-y-0.5 hover:shadow-sm ${
                  step.complete
                    ? 'border-emerald-200 bg-emerald-50/70'
                    : nextStep?.number === step.number
                      ? 'border-cyan-300 bg-white ring-2 ring-cyan-100'
                      : 'border-slate-200 bg-white/70'
                }`}
              >
                <div className='flex items-center justify-between gap-2'>
                  <span className='text-xs font-bold uppercase tracking-wide text-slate-500'>Step {step.number}</span>
                  {step.complete ? (
                    <CheckCircle2 className='h-5 w-5 text-emerald-600' />
                  ) : (
                    <Circle className='h-5 w-5 text-slate-300' />
                  )}
                </div>
                <div className='mt-3 text-sm font-bold text-slate-950'>{step.title}</div>
                <p className='mt-1 text-xs leading-5 text-slate-600'>{step.description}</p>
              </a>
            ))}
          </div>
          {nextStep ? (
            <div className='mt-5 flex flex-col justify-between gap-3 rounded-2xl bg-slate-950 p-4 text-white sm:flex-row sm:items-center'>
              <div>
                <div className='text-xs font-bold uppercase tracking-wide text-cyan-300'>Your next action</div>
                <div className='mt-1 text-sm font-bold'>{nextStep.title}</div>
              </div>
              <a
                href={nextStep.href}
                className='inline-flex items-center justify-center gap-2 rounded-xl bg-cyan-300 px-4 py-2.5 text-sm font-bold text-slate-950 hover:bg-cyan-200'
              >
                {nextStep.action} <ArrowRight className='h-4 w-4' />
              </a>
            </div>
          ) : (
            <div className='mt-5 rounded-2xl bg-emerald-50 p-4 text-sm font-bold text-emerald-900'>
              First distribution cycle complete. Continue with the next recommended target and scheduled follow-ups.
            </div>
          )}
        </div>
      </section>

      <section className='rounded-3xl bg-slate-950 p-6 text-white shadow-xl shadow-slate-200/60 sm:p-8'>
        <div className='flex flex-col justify-between gap-6 lg:flex-row lg:items-end'>
          <div className='max-w-2xl'>
            <div className='mb-4 flex items-center gap-2 text-sm font-semibold text-cyan-300'>
              <Radar className='h-4 w-4' /> Distribution control room
            </div>
            <h1 className='text-3xl font-bold tracking-tight sm:text-4xl'>Know where to promote today.</h1>
            <p className='mt-3 text-sm leading-6 text-slate-300 sm:text-base'>
              Plan human-led distribution across directories, communities, content, and launch channels. Record the
              evidence, next follow-up, and link quality in one place.
            </p>
            {data.project?.description ? (
              <p className='mt-3 max-w-2xl text-sm leading-6 text-cyan-100'>{data.project.description}</p>
            ) : null}
          </div>
          <button
            type='button'
            onClick={() => setShowForm((visible) => !visible)}
            className='inline-flex items-center justify-center gap-2 rounded-xl bg-cyan-300 px-4 py-3 text-sm font-bold text-slate-950 transition hover:bg-cyan-200'
          >
            <Plus className='h-4 w-4' /> Add custom task
          </button>
        </div>
        <div className='mt-8 grid gap-3 sm:grid-cols-4'>
          {[
            ['Tasks tracked', data.metrics.total],
            ['Due today', data.metrics.dueToday],
            ['Ready to submit', data.metrics.readyToSubmit],
            ['Waiting review', data.metrics.waitingReview],
          ].map(([label, value]) => (
            <div key={String(label)} className='rounded-2xl border border-white/10 bg-white/5 p-4'>
              <div className='text-2xl font-bold'>{value}</div>
              <div className='mt-1 text-xs text-slate-400'>{label}</div>
            </div>
          ))}
          <div className='rounded-2xl border border-white/10 bg-white/5 p-4'>
            <div className='text-2xl font-bold'>{data.metrics.live}</div>
            <div className='mt-1 text-xs text-slate-400'>Live mentions</div>
          </div>
          <div className='rounded-2xl border border-white/10 bg-white/5 p-4'>
            <div className='text-2xl font-bold'>{data.metrics.blocked}</div>
            <div className='mt-1 text-xs text-slate-400'>Blocked tasks</div>
          </div>
        </div>
      </section>

      <section className='grid gap-4 lg:grid-cols-3'>
        <div className='rounded-2xl border border-slate-200 bg-white p-5 shadow-sm lg:col-span-2'>
          <div className='flex items-center justify-between gap-3'>
            <div>
              <div className='text-xs font-bold uppercase tracking-[0.16em] text-cyan-700'>Today&apos;s queue</div>
              <h2 className='mt-1 text-xl font-bold text-slate-950'>Top priorities</h2>
            </div>
            <span className='text-xs text-slate-500'>Sorted by leverage and urgency</span>
          </div>
          <div className='mt-4 space-y-3'>
            {data.recommendations.length > 0 ? (
              data.recommendations.map((item, index) => (
                <div key={item.id} className='rounded-xl border border-slate-200 bg-slate-50 p-4'>
                  <div className='flex items-start justify-between gap-3'>
                    <div>
                      <div className='flex flex-wrap items-center gap-2 text-xs font-semibold uppercase tracking-wide text-slate-500'>
                        <span>#{index + 1}</span>
                        <span className='rounded-full bg-white px-2 py-1 text-slate-600'>{item.channelName}</span>
                        <span className='rounded-full bg-white px-2 py-1 text-slate-600'>{item.priority || 'p1'}</span>
                      </div>
                      <div className='mt-2 text-sm font-bold text-slate-950'>{item.title}</div>
                      <p className='mt-1 text-xs leading-5 text-slate-600'>{item.reason}</p>
                    </div>
                    <Link
                      href={`/${locale}/distribution/tasks/${item.id}`}
                      className='inline-flex items-center gap-1 rounded-lg border border-slate-200 bg-white px-3 py-2 text-xs font-semibold text-slate-700 hover:border-cyan-300 hover:text-cyan-700'
                    >
                      Open <ArrowUpRight className='h-3.5 w-3.5' />
                    </Link>
                  </div>
                </div>
              ))
            ) : (
              <div className='rounded-xl border border-dashed border-slate-300 bg-slate-50 p-4 text-sm text-slate-500'>
                No ranked tasks yet.
              </div>
            )}
          </div>
        </div>
        <div className='space-y-4'>
          <div className='rounded-2xl border border-slate-200 bg-white p-5 shadow-sm'>
            <div className='text-xs font-bold uppercase tracking-[0.16em] text-cyan-700'>Preflight</div>
            <h2 className='mt-1 text-lg font-bold text-slate-950'>Copy readiness</h2>
            <p className='mt-2 text-sm text-slate-600'>{data.preflight.summary}</p>
            <div className='mt-3 space-y-2 text-xs text-slate-600'>
              <div>
                Title: {data.preflight.titleLength}
                {data.preflight.titleLimit ? ` / ${data.preflight.titleLimit}` : ''}
              </div>
              <div>
                Description: {data.preflight.descriptionLength}
                {data.preflight.descriptionLimit ? ` / ${data.preflight.descriptionLimit}` : ''}
              </div>
              <div>Required fields: {data.preflight.requiredFields.join(', ') || '—'}</div>
              <div>Missing fields: {data.preflight.missingFields.join(', ') || '—'}</div>
            </div>
            {data.preflight.blockers.length > 0 ? (
              <div className='mt-3 rounded-xl bg-rose-50 p-3 text-xs text-rose-800'>
                {data.preflight.blockers.join(' · ')}
              </div>
            ) : null}
            {data.preflight.warnings.length > 0 ? (
              <div className='mt-2 rounded-xl bg-amber-50 p-3 text-xs text-amber-800'>
                {data.preflight.warnings.join(' · ')}
              </div>
            ) : null}
          </div>
          <div className='rounded-2xl border border-slate-200 bg-white p-5 shadow-sm'>
            <div className='text-xs font-bold uppercase tracking-[0.16em] text-cyan-700'>Tracked destination</div>
            <h2 className='mt-1 text-lg font-bold text-slate-950'>UTM suggestion</h2>
            <p className='mt-2 text-sm text-slate-600'>{data.destinationSuggestion.summary}</p>
            <div className='mt-3 space-y-2 text-xs text-slate-600'>
              <div className='break-all'>Destination: {data.destinationSuggestion.destinationUrl}</div>
              <div>Source: {data.destinationSuggestion.utmSource}</div>
              <div>Campaign: {data.destinationSuggestion.utmCampaign}</div>
              <div>Content: {data.destinationSuggestion.utmContent || '—'}</div>
            </div>
          </div>
        </div>
      </section>

      <section id='distribution-targets' className='scroll-mt-24 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm'>
        <div className='flex flex-col justify-between gap-2 sm:flex-row sm:items-end'>
          <div>
            <div className='text-xs font-bold uppercase tracking-[0.16em] text-cyan-700'>Concrete target sites</div>
            <h2 className='mt-1 text-xl font-bold text-slate-950'>Recommended next opportunities</h2>
            <p className='mt-1 text-sm text-slate-600'>
              Recommendations account for the project goal, budget preference, verified entry points, and manual
              obstacles.
            </p>
          </div>
          <span className='text-xs text-slate-500'>Accepting a target creates one target-bound task.</span>
        </div>
        {!profileComplete ? (
          <div className='mt-5 rounded-xl border border-amber-200 bg-amber-50 p-5 text-sm text-amber-900'>
            Complete Step 1 and confirm the product facts before selecting a target. This prevents generic or
            inaccurate submissions.
          </div>
        ) : data.targetRecommendations.length ? (
          <div className='mt-5 grid gap-4 lg:grid-cols-2 xl:grid-cols-3'>
            {data.targetRecommendations.map((target) => {
              const acceptedTask = targetTaskByTargetId.get(target.id);
              return (
              <article key={target.id} className='rounded-2xl border border-slate-200 bg-slate-50 p-4'>
                <div className='flex items-start justify-between gap-3'>
                  <div>
                    <div className='text-xs font-bold uppercase tracking-wide text-cyan-700'>{target.channelName}</div>
                    <h3 className='mt-1 text-lg font-bold text-slate-950'>{target.name}</h3>
                  </div>
                  <span className='rounded-full bg-white px-2.5 py-1 text-xs font-bold text-slate-700'>
                    Score {target.score}
                  </span>
                </div>
                <div className='mt-3 flex flex-wrap gap-2 text-[11px] font-semibold text-slate-600'>
                  <span className='rounded-full bg-white px-2 py-1'>{target.estimatedMinutes} min</span>
                  <span className='rounded-full bg-white px-2 py-1'>
                    {target.requiresPayment ? 'Paid' : 'No public payment requirement'}
                  </span>
                  {target.requiresAccount ? <span className='rounded-full bg-white px-2 py-1'>Account</span> : null}
                  {target.requiresCaptcha ? <span className='rounded-full bg-white px-2 py-1'>CAPTCHA</span> : null}
                  {target.editorialReview ? (
                    <span className='rounded-full bg-white px-2 py-1'>Editorial review</span>
                  ) : null}
                </div>
                <ul className='mt-3 space-y-1 text-xs leading-5 text-slate-600'>
                  {target.reasons.slice(0, 3).map((reason) => (
                    <li key={reason}>• {reason}</li>
                  ))}
                </ul>
                <div className='mt-4 flex flex-wrap items-center gap-2'>
                  <a
                    href={target.submissionUrl || target.homepageUrl}
                    target='_blank'
                    rel='noreferrer'
                    className='inline-flex items-center gap-1 rounded-lg border border-slate-200 bg-white px-3 py-2 text-xs font-bold text-slate-700 hover:border-cyan-300 hover:text-cyan-700'
                  >
                    Inspect site <ExternalLink className='h-3.5 w-3.5' />
                  </a>
                  {target.opportunityStatus ? (
                    <>
                      <span className='rounded-lg bg-emerald-50 px-3 py-2 text-xs font-bold text-emerald-700'>
                        {target.opportunityStatus.replaceAll('_', ' ')}
                      </span>
                      {acceptedTask ? (
                        <Link
                          href={`/${locale}/distribution/tasks/${acceptedTask.id}`}
                          className='inline-flex items-center gap-1 rounded-lg bg-cyan-700 px-3 py-2 text-xs font-bold text-white hover:bg-cyan-800'
                        >
                          Continue task <ArrowRight className='h-3.5 w-3.5' />
                        </Link>
                      ) : null}
                    </>
                  ) : (
                    <form action={acceptDistributionTarget}>
                      <input type='hidden' name='projectId' value={data.project?.id || ''} />
                      <input type='hidden' name='targetId' value={target.id} />
                      <input type='hidden' name='score' value={target.score} />
                      <input type='hidden' name='estimatedMinutes' value={target.estimatedMinutes} />
                      <button className='rounded-lg bg-slate-950 px-3 py-2 text-xs font-bold text-white hover:bg-slate-800'>
                        Choose this target
                      </button>
                    </form>
                  )}
                </div>
              </article>
              );
            })}
          </div>
        ) : (
          <div className='mt-5 rounded-xl border border-dashed border-slate-300 bg-slate-50 p-5 text-sm text-slate-500'>
            No eligible target sites match the current project and budget settings.
          </div>
        )}
      </section>

      <section className='rounded-2xl border border-cyan-100 bg-cyan-50/60 p-5'>
        <div className='flex flex-col justify-between gap-2 sm:flex-row sm:items-end'>
          <div>
            <div className='text-xs font-bold uppercase tracking-[0.16em] text-cyan-700'>Last 30 days</div>
            <h2 className='mt-1 text-xl font-bold text-slate-950'>Attribution snapshot</h2>
            <p className='mt-1 text-sm text-slate-600'>
              See whether distribution activity produces visits, signups, claims, and paid workspaces.
            </p>
          </div>
          <span className='text-xs text-slate-500'>Tracked links only</span>
        </div>
        <div className='mt-4 grid gap-3 sm:grid-cols-3 lg:grid-cols-6'>
          {[
            ['Visits', data.metrics.attribution.visits],
            ['Signups', data.metrics.attribution.signups],
            ['Submissions', data.metrics.attribution.submissions],
            ['Claims', data.metrics.attribution.claims],
            ['Checkouts', data.metrics.attribution.checkouts],
            ['Payments', data.metrics.attribution.payments],
          ].map(([label, value]) => (
            <div key={String(label)} className='rounded-xl border border-cyan-100 bg-white p-3'>
              <div className='text-xl font-bold text-slate-950'>{value}</div>
              <div className='mt-1 text-xs text-slate-500'>{label}</div>
            </div>
          ))}
        </div>
      </section>

      {showProjectForm ? (
        <form action={createDistributionProject} className='rounded-2xl border border-cyan-200 bg-cyan-50/60 p-5'>
          <div className='grid gap-4 sm:grid-cols-2'>
            <label className='text-sm font-semibold text-slate-700'>
              Project name
              <input
                required
                name='name'
                placeholder='Client or product name'
                className='mt-2 w-full rounded-xl border border-slate-200 bg-white px-3 py-2.5 font-normal outline-none focus:ring-2 focus:ring-cyan-400'
              />
            </label>
            <label className='text-sm font-semibold text-slate-700'>
              Website URL
              <input
                name='websiteUrl'
                type='url'
                placeholder='https://example.com'
                className='mt-2 w-full rounded-xl border border-slate-200 bg-white px-3 py-2.5 font-normal outline-none focus:ring-2 focus:ring-cyan-400'
              />
            </label>
            <label className='text-sm font-semibold text-slate-700 sm:col-span-2'>
              Specific product description
              <textarea
                name='description'
                rows={3}
                placeholder='What it does, for whom, and the clearest verified difference.'
                className='mt-2 w-full rounded-xl border border-slate-200 bg-white px-3 py-2.5 font-normal outline-none focus:ring-2 focus:ring-cyan-400'
              />
            </label>
            <label className='text-sm font-semibold text-slate-700'>
              Primary goal
              <select
                name='primaryGoal'
                defaultValue='directory_coverage'
                className='mt-2 w-full rounded-xl border border-slate-200 bg-white px-3 py-2.5 font-normal'
              >
                <option value='directory_coverage'>Directory coverage</option>
                <option value='launch'>Product launch</option>
                <option value='referral_traffic'>Referral traffic</option>
                <option value='community_feedback'>Community feedback</option>
                <option value='editorial_mentions'>Editorial mentions</option>
              </select>
            </label>
            <label className='text-sm font-semibold text-slate-700'>
              Weekly task capacity
              <input
                name='weeklyCapacity'
                type='number'
                min='1'
                max='50'
                defaultValue='3'
                className='mt-2 w-full rounded-xl border border-slate-200 bg-white px-3 py-2.5 font-normal outline-none focus:ring-2 focus:ring-cyan-400'
              />
            </label>
            <label className='text-sm font-semibold text-slate-700'>
              Budget preference
              <select
                name='budgetPreference'
                defaultValue='free_first'
                className='mt-2 w-full rounded-xl border border-slate-200 bg-white px-3 py-2.5 font-normal'
              >
                <option value='free_only'>Free only</option>
                <option value='free_first'>Free first</option>
                <option value='paid_selective'>Selective paid placements</option>
              </select>
            </label>
          </div>
          <input type='hidden' name='locale' value={locale} />
          <button className='mt-4 rounded-xl bg-slate-950 px-4 py-2.5 text-sm font-bold text-white hover:bg-slate-800'>
            Create project
          </button>
        </form>
      ) : null}

      {data.project ? (
        <details
          id='distribution-profile'
          className='scroll-mt-24 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm'
          open={!profileComplete}
        >
          <summary className='cursor-pointer text-sm font-bold text-slate-950'>
            Product distribution profile{' '}
            <span className='ml-2 rounded-full bg-slate-100 px-2 py-1 text-xs font-semibold text-slate-600'>
              {data.project.onboardingStatus.replaceAll('_', ' ')}
            </span>
          </summary>
          <p className='mt-2 text-sm text-slate-600'>
            Maintain the product facts once so every target-specific package can reuse them.
          </p>
          {data.listingCandidates.length > 0 ? (
            <div className='mt-4 rounded-2xl border border-cyan-200 bg-cyan-50/60 p-4'>
              <div className='flex flex-col justify-between gap-2 sm:flex-row sm:items-start'>
                <div>
                  <div className='text-xs font-bold uppercase tracking-[0.16em] text-cyan-700'>AI Best Tool connection</div>
                  <h3 className='mt-1 text-base font-bold text-slate-950'>Reuse a linked AI Best Tool listing</h3>
                  <p className='mt-1 text-xs leading-5 text-slate-600'>
                    Import name, website, description, category, pricing context, logo, and screenshots. Imported
                    facts remain unconfirmed until you review and save this profile.
                  </p>
                </div>
                {data.project.sourceToolId ? (
                  <span className='rounded-full bg-emerald-100 px-3 py-1 text-xs font-bold text-emerald-700'>
                    Listing linked
                  </span>
                ) : null}
              </div>
              {data.project.sourceToolId ? (
                <div className='mt-3 rounded-xl border border-emerald-200 bg-emerald-50 px-3 py-2 text-xs leading-5 text-emerald-800'>
                  The linked {data.project.name} listing has populated the product fields below. {listingAssetCount}{' '}
                  reusable{' '}
                  {listingAssetCount === 1 ? 'asset is' : 'assets are'} saved in the Product media and proof assets
                  section.
                </div>
              ) : null}
              <div className='mt-3 grid gap-3 lg:grid-cols-2'>
                {data.listingCandidates.map((listing) => (
                  <div key={listing.id} className='rounded-xl border border-cyan-100 bg-white p-3'>
                    <div className='flex items-start justify-between gap-3'>
                      <div>
                        <div className='text-sm font-bold text-slate-950'>{listing.name}</div>
                        <div className='mt-1 break-all text-xs text-slate-500'>{listing.websiteUrl}</div>
                      </div>
                      {listing.exactDomainMatch ? (
                        <span className='rounded-full bg-cyan-100 px-2 py-1 text-[10px] font-bold text-cyan-700'>
                          Domain match
                        </span>
                      ) : null}
                    </div>
                    <div className='mt-2 flex flex-wrap gap-2 text-[10px] font-semibold uppercase tracking-wide text-slate-500'>
                      <span>{listing.productType.replaceAll('_', ' ')}</span>
                      <span>{listing.ownershipSource.replaceAll('_', ' ')}</span>
                      {listing.categoryName ? <span>{listing.categoryName}</span> : null}
                    </div>
                    <p className='mt-2 line-clamp-2 text-xs leading-5 text-slate-600'>
                      {listing.description || 'No reusable listing description is available.'}
                    </p>
                    <form action={importDistributionCatalogListing} className='mt-3'>
                      <input type='hidden' name='projectId' value={activeProjectId} />
                      <input type='hidden' name='toolId' value={listing.id} />
                      <ImportListingButton
                        disabled={Boolean(activeProjectWebsiteUrl) && !listing.exactDomainMatch}
                        linked={activeProjectSourceToolId === listing.id}
                      />
                    </form>
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <div className='mt-4 rounded-xl border border-dashed border-slate-300 bg-slate-50 p-4 text-xs leading-5 text-slate-600'>
              No reusable AI Best Tool listing matches this project. Submitted listings are matched to their account;
              platform admins can also connect an exact-domain listing. You can continue manually.
            </div>
          )}
          <form action={updateDistributionProjectProfile} className='mt-4 grid gap-4 sm:grid-cols-2'>
            <input type='hidden' name='projectId' value={data.project.id} />
            <label className='text-sm font-semibold text-slate-700'>
              Product name
              <input
                required
                name='name'
                defaultValue={data.project.name}
                className='mt-2 w-full rounded-xl border border-slate-200 px-3 py-2.5 font-normal outline-none focus:ring-2 focus:ring-cyan-400'
              />
            </label>
            <label className='text-sm font-semibold text-slate-700'>
              Website URL
              <input
                required
                name='websiteUrl'
                defaultValue={data.project.websiteUrl || ''}
                className='mt-2 w-full rounded-xl border border-slate-200 px-3 py-2.5 font-normal outline-none focus:ring-2 focus:ring-cyan-400'
              />
            </label>
            <label className='text-sm font-semibold text-slate-700 sm:col-span-2'>
              Verified description
              <textarea
                required
                minLength={20}
                name='description'
                rows={3}
                defaultValue={data.project.description || ''}
                className='mt-2 w-full rounded-xl border border-slate-200 px-3 py-2.5 font-normal outline-none focus:ring-2 focus:ring-cyan-400'
              />
              <span className='mt-2 block text-xs font-normal leading-5 text-slate-500'>
                Use: “For [audience], [product] helps [job] by [specific capability].” Avoid rankings, invented usage
                numbers, and unverified superlatives.
              </span>
            </label>
            <label className='text-sm font-semibold text-slate-700'>
              Product type
              <select
                name='productType'
                defaultValue={productType}
                className='mt-2 w-full rounded-xl border border-slate-200 px-3 py-2.5 font-normal'
              >
                <option value='ai_saas'>AI SaaS</option>
                <option value='developer_api'>Developer tool or API</option>
                <option value='open_source'>Open-source product</option>
                <option value='mobile_app'>Mobile app</option>
                <option value='content_newsletter'>Content or newsletter</option>
                <option value='agency_service'>Agency or service</option>
                <option value='web3'>Web3 product</option>
                <option value='other'>Other</option>
              </select>
            </label>
            <label className='text-sm font-semibold text-slate-700'>
              Primary goal
              <select
                name='primaryGoal'
                defaultValue={data.project.primaryGoal || 'directory_coverage'}
                className='mt-2 w-full rounded-xl border border-slate-200 px-3 py-2.5 font-normal'
              >
                <option value='directory_coverage'>Directory coverage</option>
                <option value='launch'>Product launch</option>
                <option value='referral_traffic'>Referral traffic</option>
                <option value='community_feedback'>Community feedback</option>
                <option value='editorial_mentions'>Editorial mentions</option>
              </select>
            </label>
            <label className='text-sm font-semibold text-slate-700'>
              Weekly capacity
              <input
                name='weeklyCapacity'
                type='number'
                min='1'
                max='50'
                defaultValue={data.project.weeklyCapacity || 3}
                className='mt-2 w-full rounded-xl border border-slate-200 px-3 py-2.5 font-normal outline-none focus:ring-2 focus:ring-cyan-400'
              />
            </label>
            <label className='text-sm font-semibold text-slate-700'>
              Budget preference
              <select
                name='budgetPreference'
                defaultValue={data.project.budgetPreference || 'free_first'}
                className='mt-2 w-full rounded-xl border border-slate-200 px-3 py-2.5 font-normal'
              >
                <option value='free_only'>Free only</option>
                <option value='free_first'>Free first</option>
                <option value='paid_selective'>Selective paid placements</option>
              </select>
            </label>
            <label className='flex items-center gap-2 self-end rounded-xl border border-slate-200 px-3 py-2.5 text-sm font-semibold text-slate-700'>
              <input type='checkbox' name='factsConfirmed' defaultChecked={Boolean(data.project.factsConfirmedAt)} />{' '}
              Facts reviewed and confirmed
            </label>
            <button className='w-fit rounded-xl bg-slate-950 px-4 py-2.5 text-sm font-bold text-white sm:col-span-2'>
              Save and continue to assets
            </button>
          </form>
        </details>
      ) : null}

      <section id='distribution-assets' className='scroll-mt-24 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm'>
        <div className='flex flex-col justify-between gap-3 sm:flex-row sm:items-end'>
          <div>
            <div className='text-xs font-bold uppercase tracking-[0.16em] text-cyan-700'>Reusable asset center</div>
            <h2 className='mt-1 text-xl font-bold text-slate-950'>Product media and proof assets</h2>
            <p className='mt-1 text-sm text-slate-600'>Maintain assets once, then reuse them in every target-specific submission package.</p>
            <div className='mt-3 flex flex-wrap gap-2 text-xs font-semibold'>
              {assetGuidance.map((requirement) => {
                const ready = requirement.key === 'logo'
                  ? data.assets.some((asset) => ['logo', 'icon'].includes(asset.assetType))
                  : data.assets.some((asset) => asset.assetType === requirement.key);
                return (
                  <span
                    key={requirement.key}
                    className={`rounded-full px-2.5 py-1 ${
                      ready
                        ? 'bg-emerald-100 text-emerald-700'
                        : requirement.required
                          ? 'bg-rose-100 text-rose-700'
                          : 'bg-amber-100 text-amber-700'
                    }`}
                  >
                    {ready ? `${requirement.label} ready` : `${requirement.label} ${requirement.required ? 'required' : 'recommended'}`}
                  </span>
                );
              })}
            </div>
          </div>
          <form action={importDistributionIntelligenceAssets}>
            <input type='hidden' name='projectId' value={data.project?.id || ''} />
            <ImportAssetsButton />
          </form>
        </div>
        {data.assets.length ? (
          <div className='mt-5 grid gap-3 sm:grid-cols-2 lg:grid-cols-4'>
            {data.assets.map((asset) => (
              <a key={asset.id} href={asset.url} target='_blank' rel='noreferrer' className='overflow-hidden rounded-xl border border-slate-200 bg-white hover:border-cyan-300 hover:shadow-sm'>
                <div className='flex h-36 items-center justify-center border-b border-slate-100 bg-[linear-gradient(45deg,#f1f5f9_25%,transparent_25%),linear-gradient(-45deg,#f1f5f9_25%,transparent_25%),linear-gradient(45deg,transparent_75%,#f1f5f9_75%),linear-gradient(-45deg,transparent_75%,#f1f5f9_75%)] bg-[length:16px_16px] bg-[position:0_0,0_8px,8px_-8px,-8px_0px] p-3'>
                  <img
                    src={asset.url}
                    alt={`${data.project?.name || 'Product'} ${asset.assetType}`}
                    className='h-full w-full object-contain'
                    loading='lazy'
                  />
                </div>
                <div className='p-3'>
                <div className='flex items-center justify-between gap-2'>
                  <span className='text-xs font-bold uppercase text-cyan-700'>{asset.assetType.replaceAll('_', ' ')}</span>
                  <span className={`rounded-full px-2 py-0.5 text-[10px] font-bold ${asset.status === 'verified' ? 'bg-emerald-100 text-emerald-700' : 'bg-amber-100 text-amber-700'}`}>{asset.status}</span>
                </div>
                <div className='mt-2 truncate text-sm font-bold text-slate-900'>
                  {asset.source === 'aibesttool_listing'
                    ? `${data.project?.name || 'Product'} imported ${asset.assetType}`
                    : asset.name}
                </div>
                {asset.source === 'aibesttool_listing' ? (
                  <div className='mt-1 text-[11px] font-semibold text-emerald-700'>From the linked product listing</div>
                ) : null}
                <div className='mt-1 text-xs text-slate-500'>{asset.width && asset.height ? `${asset.width} × ${asset.height}` : 'Dimensions not recorded'}</div>
                <div className='mt-2 truncate text-[10px] text-slate-400'>{asset.url}</div>
                </div>
              </a>
            ))}
          </div>
        ) : <div className='mt-5 rounded-xl border border-dashed border-slate-300 bg-slate-50 p-4 text-sm text-slate-500'>No reusable assets yet. Import discovered assets or add a public asset URL below.</div>}
        <details className='mt-4 rounded-xl border border-slate-200 bg-slate-50 p-4'>
          <summary className='cursor-pointer text-sm font-bold text-slate-800'>+ Add asset by URL</summary>
          <form action={createDistributionProjectAsset} className='mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-4'>
            <input type='hidden' name='projectId' value={data.project?.id || ''} />
            <label className='text-xs font-bold text-slate-600'>Type<select name='assetType' defaultValue='logo' className='mt-1 w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm font-normal'><option value='logo'>Logo</option><option value='icon'>Icon</option><option value='screenshot'>Screenshot</option><option value='video'>Video</option><option value='founder_photo'>Founder photo</option><option value='social'>Social image</option></select></label>
            <label className='text-xs font-bold text-slate-600'>Name<input required name='name' placeholder='Square logo' className='mt-1 w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm font-normal' /></label>
            <label className='text-xs font-bold text-slate-600 sm:col-span-2'>Public URL<input required name='sourceUrl' type='url' placeholder='https://...' className='mt-1 w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm font-normal' /><span className='mt-1 block font-normal leading-5 text-slate-500'>Use the direct HTTPS URL of an official image that a target site can open without login.</span></label>
            <label className='text-xs font-bold text-slate-600'>Width<input name='width' type='number' min='1' className='mt-1 w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm font-normal' /></label>
            <label className='text-xs font-bold text-slate-600'>Height<input name='height' type='number' min='1' className='mt-1 w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm font-normal' /></label>
            <label className='flex items-center gap-2 self-end rounded-lg border border-slate-200 bg-white px-3 py-2 text-xs font-bold text-slate-600'><input type='checkbox' name='verified' /> Verified first-party asset</label>
            <button className='self-end rounded-lg bg-slate-950 px-4 py-2.5 text-sm font-bold text-white'>Save asset</button>
          </form>
        </details>
      </section>

      <section className='rounded-2xl border border-slate-200 bg-white p-5 shadow-sm'>
        <div className='flex flex-col justify-between gap-3 sm:flex-row sm:items-center'>
          <div>
            <div className='text-xs font-bold uppercase tracking-[0.16em] text-cyan-700'>Attribution layer</div>
            <h2 className='mt-1 text-xl font-bold text-slate-950'>Tracked distribution links</h2>
            <p className='mt-1 text-sm text-slate-500'>
              Create one UTM link per channel so visits and conversions can be compared later.
            </p>
          </div>
          <button
            type='button'
            onClick={() => setShowLinkForm((visible) => !visible)}
            className='rounded-xl bg-cyan-700 px-4 py-2.5 text-sm font-bold text-white hover:bg-cyan-800'
          >
            + Create UTM link
          </button>
        </div>
        {showLinkForm ? (
          <form
            action={createDistributionUtmLink}
            className='mt-5 grid gap-4 rounded-xl bg-slate-50 p-4 sm:grid-cols-2'
          >
            <input type='hidden' name='projectId' value={data.project?.id || ''} />
            <label className='text-sm font-semibold text-slate-700'>
              Link name
              <input
                required
                name='name'
                placeholder='Product Hunt launch'
                className='mt-2 w-full rounded-lg border border-slate-200 bg-white px-3 py-2.5 font-normal outline-none focus:ring-2 focus:ring-cyan-400'
              />
            </label>
            <label className='text-sm font-semibold text-slate-700'>
              Channel
              <select
                required
                name='channelId'
                className='mt-2 w-full rounded-lg border border-slate-200 bg-white px-3 py-2.5 font-normal'
              >
                <option value=''>Choose a channel</option>
                {data.channels.map((channel) => (
                  <option key={channel.id} value={channel.id}>
                    {channel.name}
                  </option>
                ))}
              </select>
            </label>
            <label className='text-sm font-semibold text-slate-700'>
              Campaign
              <input
                required
                name='campaign'
                defaultValue='launch'
                placeholder='launch-2026'
                className='mt-2 w-full rounded-lg border border-slate-200 bg-white px-3 py-2.5 font-normal outline-none focus:ring-2 focus:ring-cyan-400'
              />
            </label>
            <label className='text-sm font-semibold text-slate-700'>
              Content variant
              <input
                name='content'
                placeholder='founder-post-a'
                className='mt-2 w-full rounded-lg border border-slate-200 bg-white px-3 py-2.5 font-normal outline-none focus:ring-2 focus:ring-cyan-400'
              />
            </label>
            <button className='w-fit rounded-lg bg-slate-950 px-4 py-2.5 text-sm font-bold text-white hover:bg-slate-800 sm:col-span-2'>
              Generate tracked link
            </button>
          </form>
        ) : null}
        {data.links.length > 0 ? (
          <div className='mt-5 space-y-2'>
            {data.links.map((link) => (
              <div
                key={link.id}
                className='flex flex-col gap-2 rounded-xl border border-slate-200 px-3 py-2.5 text-xs sm:flex-row sm:items-center sm:justify-between'
              >
                <div>
                  <span className='font-bold text-slate-800'>{link.name}</span>
                  <span className='ml-2 rounded-full bg-slate-100 px-2 py-1 text-slate-500'>{link.channelName}</span>
                </div>
                <a
                  href={link.fullUrl}
                  target='_blank'
                  rel='noreferrer'
                  className='max-w-full truncate font-mono text-cyan-700 hover:underline'
                >
                  {link.fullUrl}
                </a>
              </div>
            ))}
          </div>
        ) : (
          <div className='mt-5 rounded-xl border border-dashed border-slate-300 bg-slate-50 p-4 text-sm text-slate-500'>
            No tracked links yet. Start with one channel and one campaign.
          </div>
        )}
      </section>

      {showForm ? (
        <form action={createDistributionTask} className='rounded-2xl border border-cyan-200 bg-cyan-50/60 p-5'>
          <input type='hidden' name='projectId' value={data.project?.id || ''} />
          <div className='mb-4 flex items-center gap-2 text-sm font-bold text-slate-900'>
            <Send className='h-4 w-4 text-cyan-700' /> Create a focused next action
          </div>
          <div className='grid gap-4 md:grid-cols-2'>
            <label className='text-sm font-semibold text-slate-700 md:col-span-2'>
              Task title
              <input
                name='title'
                required
                placeholder='Pitch the product to a relevant newsletter'
                className='mt-2 w-full rounded-xl border border-slate-200 bg-white px-3 py-2.5 font-normal outline-none ring-cyan-400 focus:ring-2'
              />
            </label>
            <label className='text-sm font-semibold text-slate-700'>
              Channel
              <select
                name='channelId'
                required
                className='mt-2 w-full rounded-xl border border-slate-200 bg-white px-3 py-2.5 font-normal outline-none ring-cyan-400 focus:ring-2'
              >
                <option value=''>Choose a channel</option>
                {data.channels.map((channel) => (
                  <option key={channel.id} value={channel.id}>
                    {channel.name}
                  </option>
                ))}
              </select>
            </label>
            <label className='text-sm font-semibold text-slate-700'>
              Priority
              <select
                name='priority'
                defaultValue='p1'
                className='mt-2 w-full rounded-xl border border-slate-200 bg-white px-3 py-2.5 font-normal outline-none ring-cyan-400 focus:ring-2'
              >
                <option value='p0'>P0: high leverage</option>
                <option value='p1'>P1: important</option>
                <option value='p2'>P2: experiment</option>
              </select>
            </label>
            <label className='text-sm font-semibold text-slate-700'>
              Due date
              <input
                name='dueDate'
                type='date'
                className='mt-2 w-full rounded-xl border border-slate-200 bg-white px-3 py-2.5 font-normal outline-none ring-cyan-400 focus:ring-2'
              />
            </label>
            <label className='text-sm font-semibold text-slate-700'>
              Preparation note
              <input
                name='instructions'
                placeholder='What proof or copy is needed?'
                className='mt-2 w-full rounded-xl border border-slate-200 bg-white px-3 py-2.5 font-normal outline-none ring-cyan-400 focus:ring-2'
              />
            </label>
          </div>
          <p className='mt-4 text-xs leading-5 text-slate-500'>
            No automatic posting. The workspace keeps the human decision and evidence trail visible.
          </p>
          <button className='mt-4 rounded-xl bg-slate-950 px-4 py-2.5 text-sm font-bold text-white hover:bg-slate-800'>
            Save task
          </button>
        </form>
      ) : null}

      <section className='rounded-2xl border border-slate-200 bg-white p-5 shadow-sm'>
        <div className='flex flex-col justify-between gap-2 sm:flex-row sm:items-center'>
          <div>
            <div className='text-xs font-bold uppercase tracking-[0.18em] text-cyan-700'>
              Today&apos;s operating board
            </div>
            <h2 className='mt-1 text-xl font-bold text-slate-950'>
              {data.project?.name || 'Product'}{' '}
              <span className='font-normal text-slate-400'>/ {data.workspace?.name || 'Workspace'}</span>
            </h2>
          </div>
          <div className='flex flex-wrap items-center gap-3 text-xs text-slate-500'>
            <span>Keep one task tied to one channel and one next action.</span>
            {data.tasks.length === 0 ? (
              <form action={seedDistributionStarterTasks}>
                <input type='hidden' name='projectId' value={data.project?.id || ''} />
                <button className='rounded-lg border border-cyan-200 bg-cyan-50 px-3 py-2 font-bold text-cyan-800 hover:bg-cyan-100'>
                  Initialize project queue
                </button>
              </form>
            ) : null}
          </div>
        </div>

        {data.tasks.length === 0 ? (
          <div className='mt-6 rounded-2xl border border-dashed border-slate-300 bg-slate-50 p-8 text-center text-sm text-slate-500'>
            Add the first promotion task to start the daily queue.
          </div>
        ) : (
          <div className='mt-6 space-y-3'>
            {data.tasks.map((task) => (
              <article
                key={task.id}
                className='rounded-2xl border border-slate-200 p-4 transition hover:border-cyan-300 hover:shadow-sm'
              >
                <div className='flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between'>
                  <div className='min-w-0'>
                    <div className='flex flex-wrap items-center gap-2 text-xs font-bold uppercase tracking-wide'>
                      <span className='rounded-full bg-slate-100 px-2.5 py-1 text-slate-600'>{task.channelName}</span>
                      <span
                        className={`rounded-full px-2.5 py-1 ${task.priority === 'p0' ? 'bg-rose-50 text-rose-700' : 'bg-cyan-50 text-cyan-700'}`}
                      >
                        {task.priority}
                      </span>
                      <span className={`rounded-full px-2.5 py-1 ${statusToneClass(task.status)}`}>
                        {getDistributionTaskStatusLabel(task.status)}
                      </span>
                    </div>
                    <h3 className='mt-3 text-base font-bold text-slate-950'>{task.title}</h3>
                    {task.instructions ? (
                      <p className='mt-1 text-sm leading-5 text-slate-600'>{task.instructions}</p>
                    ) : null}
                    <div className='mt-3 flex flex-wrap items-center gap-3 text-xs text-slate-500'>
                      <span>Due: {task.dueDate || 'not scheduled'}</span>
                      {task.liveUrl ? (
                        <a
                          href={task.liveUrl}
                          target='_blank'
                          rel='noreferrer'
                          className='inline-flex items-center gap-1 font-semibold text-cyan-700 hover:underline'
                        >
                          <ExternalLink className='h-3 w-3' /> Live result
                        </a>
                      ) : null}
                      {task.linkStatus ? (
                        <span className='inline-flex items-center gap-1'>
                          <Link2 className='h-3 w-3' /> {task.linkStatus}
                        </span>
                      ) : null}
                      <Link
                        href={`/${locale}/distribution/tasks/${task.id}`}
                        className='inline-flex items-center gap-1 font-semibold text-slate-700 hover:text-cyan-700 hover:underline'
                      >
                        Open task
                        <ArrowUpRight className='h-3 w-3' />
                      </Link>
                    </div>
                  </div>
                  <div className='flex flex-wrap gap-2 lg:justify-end'>
                    <form action={updateDistributionTaskStatus}>
                      <input type='hidden' name='taskId' value={task.id} />
                      <select
                        name='status'
                        defaultValue={task.status}
                        className='rounded-lg border border-slate-200 bg-white px-2.5 py-2 text-xs font-semibold text-slate-700'
                      >
                        {statusOptions.map((option) => (
                          <option key={option.value} value={option.value}>
                            {option.label}
                          </option>
                        ))}
                      </select>
                      <button className='ml-2 rounded-lg bg-slate-100 px-2.5 py-2 text-xs font-bold text-slate-700 hover:bg-slate-200'>
                        Update
                      </button>
                    </form>
                    <details className='rounded-lg border border-slate-200 px-2.5 py-2 text-xs'>
                      <summary className='cursor-pointer font-bold text-slate-700'>Record result</summary>
                      <form action={recordDistributionResult} className='mt-3 w-64 space-y-2'>
                        <input type='hidden' name='taskId' value={task.id} />
                        <input
                          name='liveUrl'
                          type='url'
                          placeholder='https://...'
                          className='w-full rounded-lg border border-slate-200 px-2.5 py-2 outline-none focus:ring-2 focus:ring-cyan-400'
                        />
                        <select
                          name='linkStatus'
                          defaultValue='pending'
                          className='w-full rounded-lg border border-slate-200 px-2.5 py-2'
                        >
                          <option value='pending'>Pending review</option>
                          <option value='live'>Live</option>
                          <option value='nofollow'>Nofollow</option>
                          <option value='rejected'>Rejected</option>
                          <option value='removed'>Removed</option>
                        </select>
                        <input
                          name='notes'
                          placeholder='Evidence or next follow-up'
                          className='w-full rounded-lg border border-slate-200 px-2.5 py-2 outline-none focus:ring-2 focus:ring-cyan-400'
                        />
                        <button className='w-full rounded-lg bg-cyan-700 px-2.5 py-2 font-bold text-white hover:bg-cyan-800'>
                          Save result
                        </button>
                      </form>
                    </details>
                  </div>
                </div>
              </article>
            ))}
          </div>
        )}
      </section>

      <section className='grid gap-4 md:grid-cols-2'>
        <div className='rounded-2xl border border-slate-200 bg-white p-5'>
          <div className='flex items-center gap-2 text-sm font-bold text-slate-900'>
            <ShieldCheck className='h-4 w-4 text-emerald-600' /> Quality guardrails
          </div>
          <ul className='mt-3 space-y-2 text-sm leading-5 text-slate-600'>
            <li>Use the right channel for the right audience.</li>
            <li>Record disclosure and link status.</li>
            <li>Do not duplicate promotional copy or automate community posting.</li>
          </ul>
        </div>
        <div className='rounded-2xl border border-slate-200 bg-white p-5'>
          <div className='text-sm font-bold text-slate-900'>Channel playbook</div>
          <div className='mt-3 grid gap-3 md:grid-cols-2 xl:grid-cols-4'>
            {data.channels.map((channel) => {
              const template = data.templates.find((item) => item.channelId === channel.id);
              return (
                <details key={channel.id} className='rounded-xl border border-slate-200 bg-slate-50 p-3'>
                  <summary className='cursor-pointer text-xs font-semibold text-slate-900'>
                    {channel.name}
                    <span className='ml-2 rounded-full bg-white px-2 py-0.5 text-[10px] uppercase tracking-wide text-slate-500'>
                      {channel.channelType}
                    </span>
                  </summary>
                  <div className='mt-3 space-y-2 text-xs text-slate-600'>
                    <div className='rounded-lg bg-white p-2'>
                      <div className='font-semibold text-slate-700'>Title</div>
                      <div className='mt-1 text-slate-900'>{channel.copyPackage.title}</div>
                    </div>
                    <div className='rounded-lg bg-white p-2'>
                      <div className='font-semibold text-slate-700'>Description</div>
                      <div className='mt-1 leading-5 text-slate-700'>{channel.copyPackage.description}</div>
                    </div>
                    <div className='rounded-lg bg-white p-2'>
                      <div className='font-semibold text-slate-700'>Disclosure</div>
                      <div className='mt-1 text-slate-700'>{channel.copyPackage.disclosure}</div>
                    </div>
                    <div className='rounded-lg bg-white p-2'>
                      <div className='font-semibold text-slate-700'>Proof points</div>
                      <ul className='mt-1 list-disc space-y-1 pl-4 text-slate-700'>
                        {channel.copyPackage.proofPoints.slice(0, 3).map((point) => (
                          <li key={point}>{point}</li>
                        ))}
                      </ul>
                    </div>
                    <div className='rounded-lg bg-white p-2'>
                      <div className='font-semibold text-slate-700'>Required fields</div>
                      <div className='mt-1 flex flex-wrap gap-1'>
                        {channel.copyPackage.requiredFields.map((field) => (
                          <span
                            key={field}
                            className='rounded-full bg-slate-100 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-slate-600'
                          >
                            {field}
                          </span>
                        ))}
                      </div>
                    </div>
                    <div className='rounded-lg bg-white p-2'>
                      <div className='font-semibold text-slate-700'>Follow up</div>
                      <div className='mt-1 leading-5 text-slate-700'>{channel.copyPackage.followUpPrompt}</div>
                    </div>
                    <div
                      className='text-[11px] text-slate-500'
                      title={template?.descriptionTemplate || channel.instructions || ''}
                    >
                      {channel.copyPackage.handoffNotes[0]}
                    </div>
                  </div>
                </details>
              );
            })}
          </div>
          <p className='mt-3 text-xs text-slate-500'>
            Open a channel to review the generated copy package. Templates guide human editing; they do not
            auto-publish.
          </p>
        </div>
      </section>
    </div>
  );
}
