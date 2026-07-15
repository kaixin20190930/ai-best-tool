import type { Metadata } from 'next';
import { ArrowRight, CheckCircle2, Mail, ShieldCheck, Sparkles } from 'lucide-react';

import { getListingPaymentMailto } from '@/lib/config/listing';
import TrackableCtaLink from '@/components/analytics/TrackableCtaLink';
import ClaimListingForm from '@/components/developer/ClaimListingForm';
import GuideEvidencePanel from '@/components/guides/GuideEvidencePanel';

export async function generateMetadata({ params: { locale } }: { params: { locale: string } }): Promise<Metadata> {
  const isChinese = locale === 'cn' || locale === 'tw';

  return {
    title: isChinese ? 'Claim Listing | AI Best Tool' : 'Claim Listing | AI Best Tool',
    description: isChinese
      ? '认领你的工具条目，先留资，再决定是否需要更快审核或前排展示。'
      : 'Claim your tool listing, leave your details first, then decide whether you need faster review or featured placement.',
    robots: {
      index: false,
      follow: true,
    },
  };
}

export default function DeveloperListingPage({
  params: { locale },
  searchParams,
}: {
  params: { locale: string };
  searchParams?: { intent?: string };
}) {
  const isChinese = locale === 'cn' || locale === 'tw';
  const mailtoHref = getListingPaymentMailto('Claim listing interest');
  const sourcePath = `/${locale}/developer/listing`;
  const submitHref = `/${locale}/submit?intent=claim`;
  const pricingHref = `/${locale}/pricing`;
  let initialIntent: 'default' | 'claim' | 'paid' = 'default';
  if (searchParams?.intent === 'claim') {
    initialIntent = 'claim';
  } else if (searchParams?.intent === 'paid') {
    initialIntent = 'paid';
  }

  const points = isChinese
    ? [
        '先确认这条 listing 是不是你的。',
        '留下邮箱、公司和官网，方便后续人工跟进。',
        '需要时再讨论更快审核或前排窗口。',
      ]
    : [
        'Confirm whether this listing is yours.',
        'Leave your email, company, and website so we can follow up.',
        'Decide later whether you want faster review or a featured window.',
      ];
  let intentBanner: { title: string; body: string } | null = null;
  if (initialIntent === 'claim') {
    intentBanner = {
      title: isChinese ? '你是从提交页过来的' : 'You came from submit',
      body: isChinese
        ? '如果目录里已经有你的工具，认领通常比重新提交更省力。先留下信息，我们再决定后续是更新条目还是走付费加速。'
        : 'If your tool is already in the directory, claiming it is usually easier than submitting a duplicate. Leave your details first, then we can decide whether to update the listing or discuss paid acceleration.',
    };
  } else if (initialIntent === 'paid') {
    intentBanner = {
      title: isChinese ? '你是从价格页过来的' : 'You came from pricing',
      body: isChinese
        ? '认领适合“条目已经存在”的情况。如果目录里还没有你的工具，更适合先走提交流程。'
        : 'Claiming fits best when the listing already exists. If your tool is not in the directory yet, the submission path is usually the better first step.',
    };
  }

  return (
    <div className='theme-page mx-auto max-w-pc px-4 py-8 lg:px-0'>
      <section className='rounded-[24px] border border-slate-200 bg-white p-6 shadow-sm lg:p-10'>
        <div className='inline-flex items-center gap-2 rounded-full bg-cyan-50 px-3 py-1 text-xs font-semibold text-cyan-800'>
          <Sparkles className='size-3.5' />
          {isChinese ? '认领条目' : 'Claim listing'}
        </div>

        <div className='mt-5 grid gap-8 lg:grid-cols-[1.1fr_0.9fr] lg:items-center'>
          <div className='space-y-5'>
            {intentBanner && (
              <div className='rounded-2xl border border-cyan-200 bg-cyan-50 p-4 text-sm text-cyan-950'>
                <p className='font-semibold'>{intentBanner.title}</p>
                <p className='mt-1 leading-6 text-cyan-900/80'>{intentBanner.body}</p>
              </div>
            )}
            <h1 className='text-3xl font-bold tracking-tight text-slate-950 lg:text-5xl'>
              {isChinese ? '先认领，再决定要不要加速' : 'Claim first, then decide whether to speed things up'}
            </h1>
            <p className='max-w-2xl text-base leading-7 text-slate-600 lg:text-lg'>
              {isChinese
                ? '如果这个工具是你的，我们先把认领留资跑起来。后续要不要优先审核、前排展示，等信息确认清楚再谈。'
                : 'If this tool is yours, we start with a simple claim flow. Faster review and featured placement can come later once the details are clear.'}
            </p>

            <div className='grid gap-3 sm:grid-cols-3'>
              {[
                isChinese ? '先留联系方式' : 'Start with contact details',
                isChinese ? '人工核对 owner 身份' : 'Manual owner verification',
                isChinese ? '确认后再谈加速' : 'Discuss acceleration later',
              ].map((item) => (
                <div
                  key={item}
                  className='rounded-xl border border-slate-200 bg-slate-50 p-4 text-sm leading-6 text-slate-700'
                >
                  {item}
                </div>
              ))}
            </div>

            <div className='rounded-2xl border border-cyan-100 bg-cyan-50 p-4 text-sm leading-6 text-cyan-950'>
              <p className='font-semibold'>{isChinese ? '我们最先确认的 3 件事' : 'Three things we confirm first'}</p>
              <ul className='mt-2 space-y-2'>
                <li>{isChinese ? '这条 listing 是否真的是你的。' : 'Whether this listing actually belongs to you.'}</li>
                <li>
                  {isChinese
                    ? '你是要更新资料、合并重复项，还是接手 owner。'
                    : 'Whether you need an update, duplicate merge, or owner handoff.'}
                </li>
                <li>
                  {isChinese
                    ? '后面是否需要更快审核或固定曝光。'
                    : 'Whether faster review or fixed visibility is needed later.'}
                </li>
              </ul>
            </div>

            <div className='grid gap-3 sm:grid-cols-3'>
              {points.map((point) => (
                <div
                  key={point}
                  className='rounded-xl border border-slate-200 bg-slate-50 p-4 text-sm leading-6 text-slate-700'
                >
                  {point}
                </div>
              ))}
            </div>

            <div className='rounded-2xl border border-slate-200 bg-white p-4 shadow-sm'>
              <p className='text-sm font-semibold text-slate-950'>
                {isChinese ? '第一次发给我们的信息，最好包含什么' : 'What to include in the first message'}
              </p>
              <div className='mt-3 grid gap-3 md:grid-cols-2'>
                <div className='rounded-xl border border-slate-200 bg-slate-50 p-4 text-sm leading-6 text-slate-700'>
                  {isChinese
                    ? '官网地址、工具名称、你和这条 listing 的关系，以及你想更新什么。'
                    : 'Website, tool name, your relationship to the listing, and what you want to update.'}
                </div>
                <div className='rounded-xl border border-slate-200 bg-slate-50 p-4 text-sm leading-6 text-slate-700'>
                  {isChinese
                    ? '如果是重复收录，请直接说明要合并哪一条；如果是资料修正，请说明要改什么。'
                    : 'If it is a duplicate, say which entries should merge; if it is a correction, say what should change.'}
                </div>
              </div>
              <p className='mt-3 text-xs leading-5 text-slate-500'>
                {isChinese
                  ? '信息越具体，后面人工确认认领、更新 owner，或者决定是否需要提交 / 付费就越快。'
                  : 'The more specific the first message is, the faster we can confirm ownership, update the owner mapping, or decide whether submission or paid acceleration is the better path.'}
              </p>
            </div>

            <div className='grid gap-3 rounded-2xl border border-slate-200 bg-slate-50 p-4 sm:grid-cols-2'>
              <div className='rounded-xl border border-white bg-white p-4'>
                <p className='text-sm font-semibold text-slate-950'>{isChinese ? '适合认领' : 'Use claim when'}</p>
                <p className='mt-2 text-sm leading-6 text-slate-600'>
                  {isChinese
                    ? '目录里已经有你的工具，只是还没有把 owner 信息和后续更新路径建立起来。'
                    : 'Your tool is already in the directory, but owner details and update workflow are not connected yet.'}
                </p>
              </div>
              <div className='rounded-xl border border-white bg-white p-4'>
                <p className='text-sm font-semibold text-slate-950'>{isChinese ? '适合提交' : 'Use submit when'}</p>
                <p className='mt-2 text-sm leading-6 text-slate-600'>
                  {isChinese
                    ? '目录里还没有这个工具，或者你希望新增一个全新的条目。'
                    : 'The tool is not in the directory yet, or you want to create a completely new listing.'}
                </p>
              </div>
            </div>

            <div className='flex flex-wrap gap-3'>
              <a
                href='#claim-form'
                className='inline-flex items-center justify-center rounded-lg bg-cyan-700 px-5 py-3 text-sm font-semibold text-white hover:bg-cyan-800'
              >
                {isChinese ? '去填写认领表单' : 'Go to claim form'}
                <ArrowRight className='ml-2 size-4' />
              </a>
              <TrackableCtaLink
                href={submitHref}
                ctaId='developer_listing_go_submit'
                ctaLabel='Go to submit'
                pageType='developer_listing'
                className='inline-flex items-center justify-center rounded-lg bg-cyan-700 px-5 py-3 text-sm font-semibold text-white hover:bg-cyan-800'
              >
                {isChinese ? '去提交页' : 'Go to submit'}
                <ArrowRight className='ml-2 size-4' />
              </TrackableCtaLink>
              <TrackableCtaLink
                href={mailtoHref}
                ctaId='developer_listing_email_claim'
                ctaLabel='Claim by email'
                pageType='developer_listing'
                className='inline-flex items-center justify-center rounded-lg border border-cyan-200 bg-cyan-50 px-5 py-3 text-sm font-semibold text-cyan-800 hover:bg-cyan-100'
              >
                <Mail className='mr-2 size-4' />
                {isChinese ? '发邮件认领' : 'Claim by email'}
              </TrackableCtaLink>
              <TrackableCtaLink
                href={pricingHref}
                ctaId='developer_listing_view_pricing'
                ctaLabel='View pricing options'
                pageType='developer_listing'
                className='inline-flex items-center justify-center rounded-lg border border-slate-200 bg-white px-5 py-3 text-sm font-semibold text-slate-700 hover:bg-slate-50'
              >
                {isChinese ? '看价格方案' : 'View pricing'}
              </TrackableCtaLink>
            </div>
          </div>

          <div className='rounded-2xl border border-cyan-100 bg-cyan-50 p-5'>
            <div className='flex items-start gap-3'>
              <ShieldCheck className='mt-0.5 size-5 text-cyan-700' />
              <div>
                <p className='text-sm font-semibold text-slate-950'>
                  {isChinese ? '当前流程很轻' : 'The flow stays lightweight'}
                </p>
                <p className='mt-1 text-sm leading-6 text-slate-600'>
                  {isChinese
                    ? '现在先不做复杂 owner dashboard。只要确认邮箱和身份，后面人工就能继续处理。'
                    : 'We are not building a heavy owner dashboard yet. Email and identity are enough for a human follow-up.'}
                </p>
              </div>
            </div>

            <div className='mt-5 space-y-3 rounded-xl border border-white bg-white p-4 text-sm leading-6 text-slate-700'>
              <div className='flex items-start gap-2'>
                <CheckCircle2 className='mt-0.5 size-4 shrink-0 text-emerald-600' />
                <span>
                  {isChinese
                    ? '人工确认认领，不依赖复杂权限系统。'
                    : 'Claim is confirmed manually, not through a heavy permission system.'}
                </span>
              </div>
              <div className='flex items-start gap-2'>
                <CheckCircle2 className='mt-0.5 size-4 shrink-0 text-emerald-600' />
                <span>
                  {isChinese
                    ? '有需要时再升级到优先审核或前排。'
                    : 'Upgrade to priority review or featured placement only when needed.'}
                </span>
              </div>
              <div className='flex items-start gap-2'>
                <CheckCircle2 className='mt-0.5 size-4 shrink-0 text-emerald-600' />
                <span>
                  {isChinese ? '先验证留资，再验证付费。' : 'Validate lead capture before validating paid conversion.'}
                </span>
              </div>
            </div>

            <div className='mt-4 rounded-xl border border-amber-200 bg-amber-50 p-4 text-sm leading-6 text-amber-950'>
              <p className='font-semibold'>{isChinese ? '如果这不是你的条目' : 'If this is not your listing'}</p>
              <p className='mt-1'>
                {isChinese
                  ? '请直接去提交页，认领页只适合已经存在、并且你要接手或修正的条目。'
                  : 'Please go to the submission flow instead. This page is for listings that already exist and need ownership or profile updates.'}
              </p>
            </div>
          </div>
        </div>
      </section>

      <GuideEvidencePanel
        locale={locale}
        checkedAt='2026-07-15'
        scope={
          isChinese
            ? '认领页不是收件箱，而是确认 owner、更新路径和后续加速意愿的分流页。'
            : 'The claim page should not be an inbox. It should route ownership confirmation, update paths, and future acceleration intent.'
        }
        items={[
          {
            label: isChinese ? '页面定位' : 'Page role',
            value: isChinese ? '先确认 owner 再谈后续' : 'Confirm ownership before anything else',
            note: isChinese
              ? '避免把认领页做成无判断的留资页。'
              : 'Prevents the page from becoming a judgment-free lead form.',
          },
          {
            label: isChinese ? '执行信号' : 'Execution signal',
            value: isChinese ? '留下信息后人工跟进' : 'Leave details and follow up manually',
            note: isChinese
              ? '先拿到可核实线索，再决定更新或加速。'
              : 'First collect verifiable clues, then decide on updates or acceleration.',
          },
          {
            label: isChinese ? '边界信号' : 'Boundary signal',
            value: isChinese ? '认领不是直接付费通过' : 'Claiming is not automatic approval',
            note: isChinese
              ? '认领、提交和付费加速必须分开。'
              : 'Claiming, submitting, and paid acceleration should stay separate.',
          },
        ]}
        decisionSteps={[
          isChinese ? '先确认条目是否属于你。' : 'Confirm whether the listing belongs to you.',
          isChinese ? '再说明要更新什么。' : 'Then explain what needs updating.',
          isChinese ? '最后再决定是否加速或付费。' : 'Only then decide whether acceleration or payment is needed.',
        ]}
        signalCards={[
          {
            label: isChinese ? '认领信号' : 'Claim signal',
            value: isChinese ? '邮箱 + 公司 + 官网' : 'Email + company + website',
            note: isChinese ? '让人工更快确认身份。' : 'Helps humans verify identity faster.',
          },
          {
            label: isChinese ? '更新信号' : 'Update signal',
            value: isChinese ? '重复项先说明合并' : 'State duplicate merge needs up front',
            note: isChinese ? '明确是否存在重复收录。' : 'Clarifies whether duplicates already exist.',
          },
          {
            label: isChinese ? '风险信号' : 'Risk signal',
            value: isChinese ? '信息越少，人工越慢' : 'Less detail slows manual review',
            note: isChinese
              ? '把第一条信息做完整，能减少来回确认。'
              : 'A complete first message reduces back-and-forth.',
          },
        ]}
      />

      <section className='mt-8 grid gap-6 lg:grid-cols-[1.05fr_0.95fr]'>
        <div className='rounded-[20px] border border-slate-200 bg-slate-50 p-6 shadow-sm'>
          <p className='text-sm font-semibold uppercase tracking-wide text-cyan-700'>
            {isChinese ? '认领表单' : 'Claim form'}
          </p>
          <h2 className='mt-1 text-2xl font-bold text-slate-950'>
            {isChinese ? '留下信息，我们先人工核对' : 'Leave your details and we will review manually'}
          </h2>
          <p className='mt-2 max-w-2xl text-sm leading-6 text-slate-600'>
            {isChinese
              ? '先提交邮箱、公司和官网，方便我们确认这条 listing 是否属于你。确认后再决定是否需要优先审核或前排窗口。'
              : 'Leave your email, company, and website so we can verify whether the listing belongs to you. We can decide later whether priority review or a featured window makes sense.'}
          </p>

          <div className='mt-5 grid gap-3 text-sm text-slate-700 sm:grid-cols-2'>
            <div className='rounded-xl border border-white bg-white p-4'>
              <p className='font-semibold text-slate-950'>{isChinese ? '会记录什么' : 'What we save'}</p>
              <p className='mt-1 leading-6'>
                {isChinese
                  ? '邮箱、公司、官网、备注、来源页和提交时间。'
                  : 'Email, company, website, note, source page, and submission time.'}
              </p>
            </div>
            <div className='rounded-xl border border-white bg-white p-4'>
              <p className='font-semibold text-slate-950'>{isChinese ? '接下来做什么' : 'What happens next'}</p>
              <p className='mt-1 leading-6'>
                {isChinese
                  ? '我们会人工核对，再决定是否联系你或更新认领状态。'
                  : 'We will review it manually, then decide whether to follow up or update the claim status.'}
              </p>
            </div>
          </div>
        </div>

        <div>
          <div id='claim-form'>
            <ClaimListingForm locale={locale} sourcePath={sourcePath} initialIntent={initialIntent} />
          </div>
        </div>
      </section>
    </div>
  );
}
