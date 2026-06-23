import type { ComponentType } from 'react';
import type { Metadata } from 'next';
import { ArrowRight, Clock3, CreditCard, Megaphone, Rocket, Sparkles } from 'lucide-react';
import { getTranslations } from 'next-intl/server';

import TrackableCtaLink from '@/components/analytics/TrackableCtaLink';
import { getListingPaymentMailto, listingConfig } from '@/lib/config/listing';

function PricingMiniCard({
  title,
  price,
  note,
  accent = false,
}: {
  title: string;
  price: string;
  note: string;
  accent?: boolean;
}) {
  return (
    <div
      className={`rounded-2xl border p-4 ${
        accent ? 'border-cyan-200 bg-white shadow-sm' : 'border-slate-200 bg-slate-50'
      }`}
    >
      <p className='text-sm font-semibold text-slate-950'>{title}</p>
      <p className='mt-2 text-2xl font-bold text-slate-950'>{price}</p>
      <p className='mt-1 text-sm leading-6 text-slate-600'>{note}</p>
    </div>
  );
}

function PricingCard({
  icon: Icon,
  title,
  price,
  badge,
  bullets,
  description,
  highlighted = false,
}: {
  icon: ComponentType<{ className?: string }>;
  title: string;
  price: string;
  badge: string;
  bullets: string[];
  description: string;
  highlighted?: boolean;
}) {
  return (
    <div
      className={`rounded-2xl border p-4 ${
        highlighted ? 'border-cyan-200 bg-white shadow-sm' : 'border-slate-200 bg-white'
      }`}
    >
      <div className='flex items-start justify-between gap-3'>
        <div className='flex items-start gap-3'>
          <span className='inline-flex rounded-lg bg-cyan-50 p-2 text-cyan-700 ring-1 ring-cyan-100'>
            <Icon className='size-4' />
          </span>
          <div>
            <p className='text-sm font-semibold text-slate-950'>{title}</p>
            <p className='mt-1 text-2xl font-bold text-slate-950'>{price}</p>
          </div>
        </div>
        <span className='rounded-full bg-slate-100 px-2.5 py-1 text-xs font-semibold text-slate-600'>{badge}</span>
      </div>
      <p className='mt-3 text-sm leading-6 text-slate-600'>{description}</p>
      <ul className='mt-3 space-y-2 text-sm text-slate-600'>
        {bullets.map((item) => (
          <li key={item} className='flex items-start gap-2'>
            <span className='mt-1 h-1.5 w-1.5 rounded-full bg-cyan-600' />
            <span>{item}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}

function StepRow({ index, text }: { index: string; text: string }) {
  return (
    <div className='flex items-start gap-3'>
      <span className='inline-flex size-6 shrink-0 items-center justify-center rounded-full bg-cyan-700 text-xs font-semibold text-white'>
        {index}
      </span>
      <p>{text}</p>
    </div>
  );
}

function FaqCard({ q, a }: { q: string; a: string }) {
  return (
    <div className='rounded-xl border border-slate-200 bg-white p-5 shadow-sm'>
      <p className='text-sm font-semibold text-slate-950'>{q}</p>
      <p className='mt-2 text-sm leading-6 text-slate-600'>{a}</p>
    </div>
  );
}

export async function generateMetadata({ params: { locale } }: { params: { locale: string } }): Promise<Metadata> {
  const isChinese = locale === 'cn' || locale === 'tw';
  const t = await getTranslations({ locale, namespace: 'Metadata.submit' });

  return {
    title: isChinese ? 'Pricing | AI Best Tool' : `Pricing | ${t('title')}`,
    description: isChinese
      ? '查看 AI Best Tool 的免费提交、加速审核和固定前排展示定价。'
      : 'See pricing for free submissions, faster review, and fixed featured placement windows.',
    robots: {
      index: false,
      follow: true,
    },
  };
}

export default function PricingPage({ params: { locale } }: { params: { locale: string } }) {
  const isChinese = locale === 'cn' || locale === 'tw';
  const submitHref = '/submit';
  const paymentHref = getListingPaymentMailto('AI Best Tool pricing');
  const { free, priorityReview, featuredWindows, launchBundle } = listingConfig.pricingTiers;

  return (
    <div className='theme-page mx-auto max-w-pc px-4 py-8 lg:px-0'>
      <section className='overflow-hidden rounded-[24px] border border-slate-200 bg-white shadow-sm'>
        <div className='grid gap-0 lg:grid-cols-[1.1fr_0.9fr]'>
          <div className='space-y-6 p-6 lg:p-10'>
            <div className='inline-flex items-center gap-2 rounded-full bg-cyan-50 px-3 py-1 text-xs font-semibold text-cyan-800'>
              <CreditCard className='size-3.5' />
              {isChinese ? '价格方案' : 'Pricing'}
            </div>

            <div className='space-y-4'>
              <h1 className='max-w-3xl text-3xl font-bold tracking-tight text-slate-950 lg:text-5xl'>
                {isChinese
                  ? '更快审核，更清楚曝光，按你的发布时间付费'
                  : 'Get reviewed faster and reserve visibility when timing matters'}
              </h1>
              <p className='max-w-2xl text-base leading-7 text-slate-600 lg:text-lg'>
                {isChinese
                  ? '免费提交继续开放；付费只买更快审核和固定曝光窗口，不买保证通过或保证流量。'
                  : 'Free submissions stay open. Paid options buy faster review and a fixed visibility window, not guaranteed approval or traffic.'}
              </p>
            </div>

            <div className='grid gap-3 sm:grid-cols-3'>
              {listingConfig.salesBullets.map((bullet) => (
                <div key={bullet} className='rounded-xl border border-slate-200 bg-slate-50 p-4'>
                  <p className='text-sm leading-6 text-slate-700'>{bullet}</p>
                </div>
              ))}
            </div>

            <div className='flex flex-wrap gap-3'>
              <TrackableCtaLink
                href={submitHref}
                ctaId='pricing_submit'
                ctaLabel='Go to submit page'
                pageType='pricing'
                className='inline-flex items-center justify-center rounded-lg bg-cyan-700 px-5 py-3 text-sm font-semibold text-white hover:bg-cyan-800'
              >
                {isChinese ? '先去提交页' : 'Go to submit page'}
              </TrackableCtaLink>
              <TrackableCtaLink
                href={`/${locale}/developer/listing`}
                ctaId='pricing_claim'
                ctaLabel='Claim listing'
                pageType='pricing'
                className='inline-flex items-center justify-center rounded-lg border border-slate-200 bg-white px-5 py-3 text-sm font-semibold text-slate-700 hover:bg-slate-50'
              >
                {isChinese ? '认领条目' : 'Claim listing'}
              </TrackableCtaLink>
              <TrackableCtaLink
                href={paymentHref}
                ctaId='pricing_contact_paid_options'
                ctaLabel='Contact paid options'
                pageType='pricing'
                className='inline-flex items-center justify-center rounded-lg border border-cyan-200 bg-cyan-50 px-5 py-3 text-sm font-semibold text-cyan-800 hover:bg-cyan-100'
              >
                {isChinese ? '联系付费方案' : 'Contact paid options'}
              </TrackableCtaLink>
            </div>

            <div className='rounded-2xl border border-slate-200 bg-slate-50 p-5'>
              <p className='text-sm font-semibold text-slate-950'>
                {isChinese ? '付款如何发生' : 'How checkout works'}
              </p>
              <p className='mt-2 text-sm leading-6 text-slate-600'>
                {isChinese
                  ? '先在提交页选择免费或付费方案；提交后，系统会在「我的提交」里生成 Stripe 结账链接。'
                  : 'Choose free or paid on the submit page first; after submission, the system generates a Stripe checkout link inside My Submissions.'}
              </p>
              <div className='mt-4 flex flex-wrap gap-3'>
                <TrackableCtaLink
                  href='/profile/submissions'
                  ctaId='pricing_view_submissions'
                  ctaLabel='View my submissions'
                  pageType='pricing'
                  className='inline-flex items-center justify-center rounded-lg border border-slate-200 bg-white px-4 py-2.5 text-sm font-semibold text-slate-700 hover:bg-slate-50'
                >
                  {isChinese ? '查看我的提交' : 'View my submissions'}
                </TrackableCtaLink>
                <TrackableCtaLink
                  href={submitHref}
                  ctaId='pricing_submit_again'
                  ctaLabel='Submit a tool'
                  pageType='pricing'
                  className='inline-flex items-center justify-center rounded-lg bg-slate-950 px-4 py-2.5 text-sm font-semibold text-white hover:bg-slate-800'
                >
                  {isChinese ? '去提交工具' : 'Submit a tool'}
                </TrackableCtaLink>
              </div>
            </div>

            <div className='rounded-2xl border border-cyan-100 bg-cyan-50/70 p-5'>
              <div className='flex flex-wrap items-center justify-between gap-3'>
                <div>
                  <p className='text-xs font-semibold uppercase tracking-wide text-cyan-800'>
                    {isChinese ? '常见购买原因' : 'Why people pay'}
                  </p>
                  <h2 className='mt-1 text-xl font-bold text-slate-950'>
                    {isChinese ? '三个最常见的购买场景' : 'Three common purchase scenarios'}
                  </h2>
                </div>
              </div>

              <div className='mt-4 grid gap-3 md:grid-cols-3'>
                <PricingMiniCard title={free.label} price={free.priceLabel} note={free.summary} />
                <PricingMiniCard
                  title={priorityReview.label}
                  price={priorityReview.priceLabel}
                  note={priorityReview.summary}
                />
                <PricingMiniCard
                  title={launchBundle.label}
                  price={launchBundle.priceLabel}
                  note={launchBundle.summary}
                  accent
                />
              </div>
            </div>
          </div>

          <aside className='border-t border-slate-200 bg-slate-50 p-6 lg:border-l lg:border-t-0 lg:p-10'>
            <div className='space-y-4'>
              <h2 className='text-xl font-bold text-slate-950'>
                {isChinese ? '入驻与曝光方案' : 'Listing and visibility options'}
              </h2>

              <PricingCard
                icon={Sparkles}
                title={free.label}
                price={free.priceLabel}
                badge={free.reviewWindow}
                bullets={free.highlights}
                description={free.summary}
              />
              <PricingCard
                icon={Clock3}
                title={priorityReview.label}
                price={priorityReview.priceLabel}
                badge={priorityReview.reviewWindow}
                bullets={priorityReview.highlights}
                description={priorityReview.summary}
              />
              {featuredWindows.map((item) => (
                <PricingCard
                  key={item.days}
                  icon={Megaphone}
                  title={item.label}
                  price={item.priceLabel}
                  badge={`${item.days} ${isChinese ? '天' : 'days'}`}
                  bullets={[
                    item.summary,
                    isChinese ? '到期自动回收' : 'Automatically expires after the window',
                    isChinese ? '适合活动期和更新期' : 'Best for launches and updates',
                  ]}
                  description={item.summary}
                  highlighted={item.days === 7}
                />
              ))}
              <PricingCard
                icon={Rocket}
                title={launchBundle.label}
                price={launchBundle.priceLabel}
                badge={isChinese ? '组合包' : 'Bundle'}
                bullets={launchBundle.highlights}
                description={launchBundle.summary}
                highlighted
              />
            </div>
          </aside>
        </div>
      </section>

      <section className='mt-8 grid gap-4 lg:grid-cols-[1fr_360px]'>
        <div className='rounded-[20px] border border-slate-200 bg-white p-6 shadow-sm'>
          <p className='text-sm font-semibold uppercase tracking-wide text-cyan-700'>
            {isChinese ? '你买到什么' : 'What you actually get'}
          </p>
          <h2 className='mt-1 text-2xl font-bold text-slate-950'>
            {isChinese ? '每个方案对应一个明确结果' : 'Each option maps to a concrete outcome'}
          </h2>

          <div className='mt-4 overflow-x-auto'>
            <table className='min-w-full border-separate border-spacing-0 text-left text-sm'>
              <thead>
                <tr className='text-slate-500'>
                  <th className='border-b border-slate-200 px-4 py-3 font-medium'>{isChinese ? '结果' : 'Outcome'}</th>
                  <th className='border-b border-slate-200 px-4 py-3 font-medium'>{free.label}</th>
                  <th className='border-b border-slate-200 px-4 py-3 font-medium'>{priorityReview.label}</th>
                  <th className='border-b border-slate-200 px-4 py-3 font-medium'>{featuredWindows[1].label}</th>
                  <th className='border-b border-slate-200 px-4 py-3 font-medium'>{launchBundle.label}</th>
                </tr>
              </thead>
              <tbody>
                {[
                  [
                    isChinese ? '价格' : 'Price',
                    free.priceLabel,
                    priorityReview.priceLabel,
                    featuredWindows[1].priceLabel,
                    launchBundle.priceLabel,
                  ],
                  [
                    isChinese ? '审核速度' : 'Review speed',
                    free.reviewWindow,
                    priorityReview.reviewWindow,
                    featuredWindows[1].summary,
                    isChinese ? 'Priority review + featured window' : 'Priority review + featured window',
                  ],
                  [isChinese ? '前排展示' : 'Featured slot', 'No', 'Optional add-on', 'Yes', 'Yes'],
                  [
                    isChinese ? '更适合' : 'Best for',
                    isChinese ? '先免费提交' : 'Free submission first',
                    isChinese ? '需要更快审核' : 'Need faster review',
                    isChinese ? '需要固定前排窗口' : 'Need a fixed featured window',
                    isChinese ? '审核 + 前排一起要' : 'Need review plus visibility',
                  ],
                ].map((row) => (
                  <tr key={row[0]}>
                    <th className='border-b border-slate-100 px-4 py-3 font-medium text-slate-700'>{row[0]}</th>
                    {row.slice(1).map((cell) => (
                      <td key={String(cell)} className='border-b border-slate-100 px-4 py-3 text-slate-600'>
                        {cell}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        <div className='rounded-[20px] border border-cyan-100 bg-cyan-50 p-6 shadow-sm'>
          <p className='text-sm font-semibold uppercase tracking-wide text-cyan-800'>
            {isChinese ? '流程' : 'Workflow'}
          </p>
          <h2 className='mt-1 text-2xl font-bold text-slate-950'>
            {isChinese ? '提交、审核、付款、展示都能对应上' : 'Submission, review, payment, and placement stay clear'}
          </h2>
          <div className='mt-4 space-y-3 text-sm text-slate-700'>
            <StepRow
              index='1'
              text={isChinese ? '免费提交先进入审核队列。' : 'Free submission enters the queue first.'}
            />
            <StepRow
              index='2'
              text={isChinese ? '需要更快审核时，选择优先审核。' : 'Choose priority review when timing matters.'}
            />
            <StepRow
              index='3'
              text={
                isChinese
                  ? '需要更强曝光时，加上前排展示窗口。'
                  : 'Add a featured window when you want more visibility.'
              }
            />
            <StepRow
              index='4'
              text={
                isChinese
                  ? '支付确认后，系统会把权益写入提交状态。'
                  : 'Payment confirmation is written back into your submission status.'
              }
            />
          </div>
        </div>
      </section>

      <section className='mt-8 grid gap-4'>
        <div className='flex items-end justify-between gap-3'>
          <div>
            <p className='text-sm font-semibold uppercase tracking-wide text-cyan-700'>
              {isChinese ? '常见问题' : 'FAQ'}
            </p>
            <h2 className='mt-1 text-2xl font-bold text-slate-950'>
              {isChinese ? '怎么买最划算' : 'Choose the right option'}
            </h2>
          </div>
        </div>

        <div className='grid gap-3 lg:grid-cols-2'>
          <FaqCard
            q={isChinese ? '付费方案包含什么？' : 'What is included in a paid listing?'}
            a={
              isChinese
                ? '付费方案通常包含更快审核、固定天数前排展示，或两者一起打包。你拿到的是明确的审核时效和可预期的曝光窗口。'
                : 'Paid listings typically include faster review, a fixed featured window, or both bundled together. You get a clear review timeline and a predictable visibility window.'
            }
          />
          <FaqCard
            q={isChinese ? '前排会自动续期吗？' : 'Does featured placement renew automatically?'}
            a={
              isChinese
                ? '不会。每次前排都是明确的天数窗口，到期后自动回收。'
                : 'No. Each featured window has a fixed number of days and expires automatically.'
            }
          />
          <FaqCard
            q={isChinese ? '可以先免费提交，再升级吗？' : 'Can I upgrade after a free submission?'}
            a={
              isChinese
                ? '可以。先免费提交，后续再根据发布节奏升级为优先审核或前排。'
                : 'Yes. Start with a free submission, then upgrade to priority review or featured placement when the timing makes sense.'
            }
          />
          <FaqCard
            q={isChinese ? '老工具还能再次买前排吗？' : 'Can an existing listing buy featured placement again?'}
            a={
              isChinese
                ? '可以。前排是按固定窗口计费的，已经收录的工具也能在后续重新购买新的前排窗口。'
                : 'Yes. Featured placement is sold as a fixed window, so an existing listing can purchase a new featured window later.'
            }
          />
          <FaqCard
            q={isChinese ? '支付成功后如何确认？' : 'How is payment confirmed?'}
            a={
              isChinese
                ? '支付成功后，回调接口会写入记录。如果工具已发布，前排会立即开始；如果还在审核中，会先保留权益，发布后再开始计时。'
                : 'After payment succeeds, the callback endpoint writes a record. If the tool is already published, the featured window starts immediately. If it is still under review, the entitlement is reserved and the timer starts after publish.'
            }
          />
        </div>
      </section>

      <section className='mt-8 rounded-[20px] border border-slate-200 bg-white p-6 shadow-sm'>
        <div className='flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between'>
          <div>
            <p className='text-sm font-semibold uppercase tracking-wide text-cyan-700'>
              {isChinese ? '开始入驻' : 'Get started'}
            </p>
            <h2 className='mt-1 text-2xl font-bold text-slate-950'>
              {isChinese ? '准备好后就可以提交' : 'Submit your tool when you are ready'}
            </h2>
            <p className='mt-2 max-w-2xl text-sm leading-6 text-slate-600'>
              {isChinese
                ? '先免费提交，或根据发布时间和曝光需求选择更合适的付费方案。'
                : 'Start with a free submission, or choose a paid option based on your timeline and visibility goals.'}
            </p>
          </div>
          <div className='flex flex-col gap-3 sm:flex-row'>
            <TrackableCtaLink
              href={submitHref}
              ctaId='pricing_submit_footer'
              ctaLabel='Go to submit page'
              pageType='pricing'
              className='inline-flex items-center justify-center rounded-lg bg-cyan-700 px-4 py-3 text-sm font-semibold text-white hover:bg-cyan-800'
            >
              {isChinese ? '去提交页' : 'Go to submit page'}
              <ArrowRight className='ml-2 size-4' />
            </TrackableCtaLink>
            <TrackableCtaLink
              href={paymentHref}
              ctaId='pricing_contact_footer'
              ctaLabel='Contact us'
              pageType='pricing'
              className='inline-flex items-center justify-center rounded-lg border border-cyan-200 bg-cyan-50 px-4 py-3 text-sm font-semibold text-cyan-800 hover:bg-cyan-100'
            >
              {isChinese ? '联系商务' : 'Contact us'}
            </TrackableCtaLink>
          </div>
        </div>
      </section>
    </div>
  );
}
