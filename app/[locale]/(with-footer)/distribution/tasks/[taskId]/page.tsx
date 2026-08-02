import Link from 'next/link';
import { redirect } from 'next/navigation';
import { ArrowLeft, ArrowUpRight, CheckCircle2, Clock3, Send, Sparkles } from 'lucide-react';

import {
  getDistributionTaskStatusChoices,
  getDistributionTaskStatusDescription,
  getDistributionTaskStatusLabel,
} from '@/lib/services/distribution/taskStateMachine';
import {
  createDistributionFollowUpTask,
  generateDistributionPackage,
  getDistributionTaskDetail,
  recordDistributionResult,
  updateDistributionTaskStatus,
} from '@/app/actions/distribution';
import CopyField from '@/components/distribution/CopyField';

export default async function DistributionTaskDetailPage({ params }: { params: { locale: string; taskId: string } }) {
  const result = await getDistributionTaskDetail(params.taskId);
  if (!result.success) {
    if (result.error === 'Unauthorized')
      redirect(`/${params.locale}/login?redirect=/${params.locale}/distribution/tasks/${params.taskId}`);
    return <div className='mx-auto max-w-4xl px-5 py-16 text-slate-700'>{result.error}</div>;
  }
  if (!result.access || !result.data) {
    redirect(`/${params.locale}/login?redirect=/${params.locale}/distribution/tasks/${params.taskId}`);
  }

  const data = result.data;
  const statusChoices = getDistributionTaskStatusChoices();
  const quickStatuses = [
    'in_progress',
    'needs_assets',
    'ready_to_submit',
    'submitted',
    'waiting_review',
    'live',
    'follow_up',
    'done',
    'blocked',
  ] as const;

  return (
    <div className='mx-auto w-full max-w-6xl px-5 py-10 sm:px-8 lg:px-12'>
      <div className='mb-6 flex items-center justify-between gap-4'>
        <Link
          href={`/${params.locale}/distribution?project=${data.project.id}`}
          className='inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-bold text-slate-700 hover:border-cyan-300 hover:text-cyan-700'
        >
          <ArrowLeft className='h-4 w-4' /> Back to workspace
        </Link>
        <div className='text-xs text-slate-500'>Human-led action page</div>
      </div>

      <section className='rounded-3xl border border-slate-200 bg-white p-6 shadow-sm'>
        <div className='flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between'>
          <div className='space-y-3'>
            <div className='flex flex-wrap items-center gap-2 text-xs font-semibold uppercase tracking-wide text-slate-500'>
              <span className='rounded-full bg-slate-100 px-2.5 py-1'>{data.channel.name}</span>
              <span className='rounded-full bg-cyan-50 px-2.5 py-1 text-cyan-700'>
                {getDistributionTaskStatusLabel(data.task.status)}
              </span>
              <span className='rounded-full bg-amber-50 px-2.5 py-1 text-amber-700'>{data.task.priority}</span>
            </div>
            <h1 className='text-3xl font-bold tracking-tight text-slate-950'>{data.task.title}</h1>
            <p className='max-w-3xl text-sm leading-6 text-slate-600'>
              {getDistributionTaskStatusDescription(data.task.status)}
            </p>
            <div className='flex flex-wrap gap-3 text-sm text-slate-600'>
              <span>Due: {data.task.dueDate || 'not scheduled'}</span>
              <span>Type: {data.task.taskType}</span>
              <span>Updated: {data.task.updatedAt || '—'}</span>
            </div>
          </div>
          <div className='rounded-2xl border border-slate-200 bg-slate-50 p-4'>
            <div className='text-xs font-bold uppercase tracking-wide text-slate-500'>Current status</div>
            <div className='mt-2 text-lg font-bold text-slate-950'>
              {getDistributionTaskStatusLabel(data.task.status)}
            </div>
            <p className='mt-1 text-sm text-slate-600'>{getDistributionTaskStatusDescription(data.task.status)}</p>
          </div>
        </div>
      </section>

      {data.target ? (
        <section className='mt-6 rounded-2xl border border-cyan-200 bg-cyan-50/60 p-5'>
          <div className='flex flex-col justify-between gap-4 lg:flex-row lg:items-start'>
            <div>
              <div className='text-xs font-bold uppercase tracking-[0.16em] text-cyan-700'>Concrete target site</div>
              <h2 className='mt-1 text-xl font-bold text-slate-950'>{data.target.name}</h2>
              <div className='mt-3 flex flex-wrap gap-2 text-xs font-semibold text-slate-600'>
                <span className='rounded-full bg-white px-2.5 py-1'>Rule confidence {data.target.confidence}%</span>
                {data.target.requiresAccount ? (
                  <span className='rounded-full bg-white px-2.5 py-1'>Account required</span>
                ) : null}
                {data.target.requiresPayment ? (
                  <span className='rounded-full bg-white px-2.5 py-1'>Payment required</span>
                ) : null}
                {data.target.requiresCaptcha ? (
                  <span className='rounded-full bg-white px-2.5 py-1'>CAPTCHA</span>
                ) : null}
                {data.target.requiresBacklink ? (
                  <span className='rounded-full bg-white px-2.5 py-1'>Reciprocal link requested</span>
                ) : null}
                {data.target.editorialReview ? (
                  <span className='rounded-full bg-white px-2.5 py-1'>
                    Editorial review
                    {data.target.expectedReviewDays ? ` · about ${data.target.expectedReviewDays}d` : ''}
                  </span>
                ) : null}
              </div>
            </div>
            <div className='flex flex-wrap gap-2'>
              {data.target.registrationUrl ? (
                <a
                  href={data.target.registrationUrl}
                  target='_blank'
                  rel='noreferrer'
                  className='rounded-xl border border-cyan-200 bg-white px-4 py-2.5 text-sm font-bold text-cyan-800'
                >
                  Registration
                </a>
              ) : null}
              {data.target.pricingUrl ? (
                <a
                  href={data.target.pricingUrl}
                  target='_blank'
                  rel='noreferrer'
                  className='rounded-xl border border-cyan-200 bg-white px-4 py-2.5 text-sm font-bold text-cyan-800'
                >
                  Pricing rules
                </a>
              ) : null}
              <a
                href={data.target.submissionUrl || data.target.homepageUrl}
                target='_blank'
                rel='noreferrer'
                className='inline-flex items-center gap-2 rounded-xl bg-slate-950 px-4 py-2.5 text-sm font-bold text-white'
              >
                Open submission page <ArrowUpRight className='h-4 w-4' />
              </a>
            </div>
          </div>
        </section>
      ) : (
        <section className='mt-6 rounded-2xl border border-amber-200 bg-amber-50 p-5 text-sm text-amber-900'>
          This legacy task is channel-level only. Bind a concrete target site before moving it to ready to submit.
        </section>
      )}

      <section className='mt-6 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm'>
        <div className='flex flex-col justify-between gap-4 lg:flex-row lg:items-start'>
          <div>
            <div className='text-xs font-bold uppercase tracking-[0.16em] text-cyan-700'>Target submission package</div>
            <h2 className='mt-1 text-xl font-bold text-slate-950'>Everything needed for this target in one place</h2>
            <p className='mt-2 max-w-3xl text-sm leading-6 text-slate-600'>
              Generate from confirmed product facts, reusable assets, and the target site's known rules. You keep final
              review and submit manually on the target site.
            </p>
          </div>
          <form action={generateDistributionPackage}>
            <input type='hidden' name='taskId' value={data.task.id} />
            <button
              type='submit'
              disabled={!data.target}
              className='rounded-xl bg-cyan-700 px-4 py-2.5 text-sm font-bold text-white hover:bg-cyan-800 disabled:cursor-not-allowed disabled:bg-slate-300'
            >
              {data.package ? 'Regenerate package' : 'Generate target package'}
            </button>
          </form>
        </div>

        {data.package ? (
          <div className='mt-5'>
            <div
              className={`rounded-xl p-4 text-sm ${
                data.package.ready ? 'bg-emerald-50 text-emerald-900' : 'bg-amber-50 text-amber-900'
              }`}
            >
              <div className='font-bold'>
                {data.package.ready ? 'Ready for human submission' : 'Not ready yet: complete the items below'}
              </div>
              <div className='mt-1 text-xs'>
                Package status: {data.package.status} · Updated {data.package.updatedAt || 'just now'}
              </div>
            </div>
            {data.package.blockers.length > 0 ? (
              <div className='mt-4 rounded-xl border border-rose-200 bg-rose-50 p-4'>
                <div className='text-sm font-bold text-rose-900'>Blocking items</div>
                <ul className='mt-2 space-y-1 text-sm text-rose-800'>
                  {data.package.blockers.map((blocker) => (
                    <li key={blocker}>• {blocker}</li>
                  ))}
                </ul>
              </div>
            ) : null}
            {data.package.assetRequirements.length > 0 ? (
              <div className='mt-4 flex flex-wrap gap-2 text-xs font-semibold text-slate-600'>
                <span className='py-1'>Required assets:</span>
                {data.package.assetRequirements.map((asset) => (
                  <span
                    key={asset}
                    className={`rounded-full px-2.5 py-1 ${
                      data.package?.missingAssets.includes(asset)
                        ? 'bg-rose-50 text-rose-700'
                        : 'bg-emerald-50 text-emerald-700'
                    }`}
                  >
                    {asset.replaceAll('_', ' ')}
                  </span>
                ))}
              </div>
            ) : null}
            <div className='mt-4 grid gap-4 lg:grid-cols-2'>
              {data.package.fields.map((field) => (
                <CopyField
                  key={field.key}
                  label={`${field.label}${field.required ? ' *' : ''}`}
                  value={field.value}
                  characterLimit={field.characterLimit}
                />
              ))}
            </div>
          </div>
        ) : (
          <div className='mt-5 rounded-xl bg-slate-50 p-4 text-sm text-slate-600'>
            No saved package yet. Generate one after confirming the project profile and adding reusable assets.
          </div>
        )}
      </section>

      <section className='mt-6 grid gap-4 lg:grid-cols-3'>
        <div className='rounded-2xl border border-slate-200 bg-white p-5 shadow-sm lg:col-span-2'>
          <div className='flex items-center gap-2 text-sm font-bold text-slate-900'>
            <Sparkles className='h-4 w-4 text-cyan-700' /> Copy package
          </div>
          <div className='mt-4 grid gap-4 md:grid-cols-2'>
            <div className='rounded-xl bg-slate-50 p-4'>
              <div className='text-xs font-bold uppercase tracking-wide text-slate-500'>Title</div>
              <div className='mt-2 text-base font-semibold text-slate-950'>{data.copyPackage.title}</div>
              <div className='mt-3 text-xs text-slate-500'>Alternatives</div>
              <ul className='mt-1 space-y-1 text-sm text-slate-700'>
                {data.copyPackage.titleAlternatives.map((item) => (
                  <li key={item}>• {item}</li>
                ))}
              </ul>
            </div>
            <div className='rounded-xl bg-slate-50 p-4'>
              <div className='text-xs font-bold uppercase tracking-wide text-slate-500'>Description</div>
              <div className='mt-2 text-sm leading-6 text-slate-700'>{data.copyPackage.description}</div>
            </div>
            <div className='rounded-xl bg-slate-50 p-4'>
              <div className='text-xs font-bold uppercase tracking-wide text-slate-500'>Disclosure</div>
              <div className='mt-2 text-sm text-slate-700'>{data.copyPackage.disclosure}</div>
              <div className='mt-3 text-xs text-slate-500'>Proof points</div>
              <ul className='mt-1 space-y-1 text-sm text-slate-700'>
                {data.copyPackage.proofPoints.map((item) => (
                  <li key={item}>• {item}</li>
                ))}
              </ul>
            </div>
            <div className='rounded-xl bg-slate-50 p-4'>
              <div className='text-xs font-bold uppercase tracking-wide text-slate-500'>Follow-up prompt</div>
              <div className='mt-2 text-sm leading-6 text-slate-700'>{data.copyPackage.followUpPrompt}</div>
              <div className='mt-3 text-xs text-slate-500'>Required fields</div>
              <div className='mt-1 flex flex-wrap gap-2'>
                {data.copyPackage.requiredFields.map((field) => (
                  <span key={field} className='rounded-full bg-white px-2 py-1 text-xs font-semibold text-slate-600'>
                    {field}
                  </span>
                ))}
              </div>
            </div>
          </div>
        </div>

        <div className='space-y-4'>
          <div className='rounded-2xl border border-slate-200 bg-white p-5 shadow-sm'>
            <div className='flex items-center gap-2 text-sm font-bold text-slate-900'>
              <CheckCircle2 className='h-4 w-4 text-emerald-600' /> Preflight
            </div>
            <p className='mt-3 text-sm text-slate-600'>{data.preflight.summary}</p>
            <div className='mt-3 space-y-2 text-xs text-slate-600'>
              <div>
                Title length: {data.preflight.titleLength}
                {data.preflight.titleLimit ? ` / ${data.preflight.titleLimit}` : ''}
              </div>
              <div>
                Description length: {data.preflight.descriptionLength}
                {data.preflight.descriptionLimit ? ` / ${data.preflight.descriptionLimit}` : ''}
              </div>
              <div>Missing: {data.preflight.missingFields.join(', ') || '—'}</div>
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
            <div className='flex items-center gap-2 text-sm font-bold text-slate-900'>
              <ArrowUpRight className='h-4 w-4 text-cyan-700' /> Tracked destination
            </div>
            <p className='mt-3 text-sm text-slate-600'>{data.destination.summary}</p>
            <div className='mt-3 space-y-1 rounded-xl bg-slate-50 p-3 text-xs text-slate-700'>
              <div className='break-all'>Destination: {data.destination.destinationUrl}</div>
              <div>Source: {data.destination.utmSource}</div>
              <div>Campaign: {data.destination.utmCampaign}</div>
              <div>Content: {data.destination.utmContent || '—'}</div>
            </div>
          </div>
          <div className='rounded-2xl border border-slate-200 bg-white p-5 shadow-sm'>
            <div className='flex items-center gap-2 text-sm font-bold text-slate-900'>
              <Clock3 className='h-4 w-4 text-cyan-700' /> Suggested next tasks
            </div>
            <div className='mt-3 space-y-3'>
              {data.nextSuggestions.map((item, index) => (
                <div key={item.id} className='rounded-xl bg-slate-50 p-3'>
                  <div className='text-xs font-semibold uppercase tracking-wide text-slate-500'>
                    #{index + 1} · {item.channelName}
                  </div>
                  <div className='mt-1 text-sm font-semibold text-slate-900'>{item.title}</div>
                  <div className='mt-1 text-xs text-slate-600'>{item.reason}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section className='mt-6 grid gap-4 lg:grid-cols-2'>
        <div className='rounded-2xl border border-slate-200 bg-white p-5 shadow-sm'>
          <div className='text-xs font-bold uppercase tracking-[0.16em] text-cyan-700'>Execution history</div>
          <h2 className='mt-1 text-lg font-bold text-slate-950'>What happened and when</h2>
          <div className='mt-4 space-y-3'>
            {data.events.length > 0 ? (
              data.events.map((event) => (
                <div key={event.id} className='rounded-xl bg-slate-50 p-3'>
                  <div className='flex flex-wrap items-center justify-between gap-2'>
                    <div className='text-sm font-bold text-slate-900'>{event.eventType.replaceAll('_', ' ')}</div>
                    <div className='text-xs text-slate-500'>{event.createdAt}</div>
                  </div>
                  {event.fromStatus || event.toStatus ? (
                    <div className='mt-1 text-xs font-semibold text-cyan-700'>
                      {event.fromStatus || '—'} → {event.toStatus || '—'}
                    </div>
                  ) : null}
                  {event.reason ? <p className='mt-1 text-xs leading-5 text-slate-600'>{event.reason}</p> : null}
                </div>
              ))
            ) : (
              <div className='rounded-xl bg-slate-50 p-4 text-sm text-slate-600'>
                History starts when a package is generated or the task status changes.
              </div>
            )}
          </div>
        </div>
        <div className='rounded-2xl border border-slate-200 bg-white p-5 shadow-sm'>
          <div className='text-xs font-bold uppercase tracking-[0.16em] text-cyan-700'>Automatic follow-up</div>
          <h2 className='mt-1 text-lg font-bold text-slate-950'>Scheduled checks</h2>
          <p className='mt-2 text-sm leading-6 text-slate-600'>
            Submitted tasks get 3- and 7-day checks. Live links get 7-, 30-, and 90-day retention checks.
          </p>
          <div className='mt-4 space-y-3'>
            {data.reminders.length > 0 ? (
              data.reminders.map((reminder) => (
                <div key={reminder.id} className='flex items-center justify-between gap-3 rounded-xl bg-slate-50 p-3'>
                  <div>
                    <div className='text-sm font-bold text-slate-900'>
                      {reminder.reminderType.replaceAll('_', ' ')}
                    </div>
                    <div className='mt-1 text-xs text-slate-500'>{reminder.scheduledAt}</div>
                  </div>
                  <span className='rounded-full bg-white px-2.5 py-1 text-xs font-bold text-slate-600'>
                    {reminder.status}
                  </span>
                </div>
              ))
            ) : (
              <div className='rounded-xl bg-slate-50 p-4 text-sm text-slate-600'>
                No checks scheduled yet. Mark the task submitted or live to create them automatically.
              </div>
            )}
          </div>
        </div>
      </section>

      <section className='mt-6 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm'>
        <div className='flex flex-col gap-3 lg:flex-row lg:items-end lg:justify-between'>
          <div>
            <div className='text-xs font-bold uppercase tracking-[0.16em] text-cyan-700'>One-click update</div>
            <h2 className='mt-1 text-lg font-bold text-slate-950'>Move the task without leaving the page</h2>
          </div>
          <div className='text-xs text-slate-500'>Action buttons update the task immediately.</div>
        </div>

        <div className='mt-4 flex flex-wrap gap-2'>
          {quickStatuses.map((status) => (
            <form key={status} action={updateDistributionTaskStatus}>
              <input type='hidden' name='taskId' value={data.task.id} />
              <input type='hidden' name='status' value={status} />
              <button
                type='submit'
                className='rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-xs font-bold text-slate-700 hover:border-cyan-300 hover:text-cyan-700'
              >
                {getDistributionTaskStatusLabel(status)}
              </button>
            </form>
          ))}
        </div>

        <div className='mt-5 grid gap-4 md:grid-cols-2'>
          <form action={recordDistributionResult} className='rounded-xl bg-slate-50 p-4'>
            <div className='flex items-center gap-2 text-sm font-bold text-slate-900'>
              <Send className='h-4 w-4 text-cyan-700' /> Record live result
            </div>
            <input type='hidden' name='taskId' value={data.task.id} />
            <div className='mt-3 grid gap-3'>
              <input
                name='liveUrl'
                type='url'
                placeholder='https://live-url.example'
                className='rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-cyan-400'
              />
              <select
                name='linkStatus'
                defaultValue='pending'
                className='rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm'
              >
                <option value='pending'>Pending review</option>
                <option value='live'>Live</option>
                <option value='nofollow'>Nofollow</option>
                <option value='rejected'>Rejected</option>
                <option value='removed'>Removed</option>
              </select>
              <textarea
                name='notes'
                rows={3}
                placeholder='Evidence or next follow-up note'
                className='rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-cyan-400'
              />
              <button className='rounded-xl bg-cyan-700 px-4 py-2 text-sm font-bold text-white hover:bg-cyan-800'>
                Save result
              </button>
            </div>
          </form>

          <form action={createDistributionFollowUpTask} className='rounded-xl bg-slate-50 p-4'>
            <div className='flex items-center gap-2 text-sm font-bold text-slate-900'>
              <Clock3 className='h-4 w-4 text-amber-600' /> Auto create follow-up
            </div>
            <input type='hidden' name='taskId' value={data.task.id} />
            <div className='mt-3 grid gap-3'>
              <input
                name='days'
                type='number'
                min='1'
                defaultValue='3'
                className='rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-cyan-400'
              />
              <input
                name='reason'
                defaultValue='Follow up on the live listing and capture any updates.'
                className='rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-cyan-400'
              />
              <button className='rounded-xl border border-amber-200 bg-amber-50 px-4 py-2 text-sm font-bold text-amber-800 hover:bg-amber-100'>
                Create follow-up task
              </button>
            </div>
          </form>
        </div>
      </section>

      <section className='mt-6 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm'>
        <div className='text-xs font-bold uppercase tracking-[0.16em] text-cyan-700'>Status guide</div>
        <div className='mt-3 grid gap-2 md:grid-cols-2 xl:grid-cols-3'>
          {statusChoices.map((choice) => (
            <div key={choice.value} className='rounded-xl bg-slate-50 p-3'>
              <div className='text-sm font-bold text-slate-900'>{choice.label}</div>
              <p className='mt-1 text-xs leading-5 text-slate-600'>{choice.description}</p>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
