import type { ComponentType } from 'react';
import type { Metadata } from 'next';
import { ArrowRight, Clock3, CreditCard, Megaphone, Rocket, Sparkles } from 'lucide-react';
import { getTranslations } from 'next-intl/server';

import { getListingPaymentMailto, listingConfig } from '@/lib/config/listing';
import CommerceViewTracker from '@/components/analytics/CommerceViewTracker';
import TrackableCtaLink from '@/components/analytics/TrackableCtaLink';
import GuideEvidencePanel from '@/components/guides/GuideEvidencePanel';

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
        accent ? 'border-slate-200 bg-white shadow-sm' : 'border-slate-200 bg-slate-50'
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

function PathCard({
  title,
  summary,
  ctaLabel,
  href,
  ctaId,
  accent = false,
}: {
  title: string;
  summary: string;
  ctaLabel: string;
  href: string;
  ctaId: string;
  accent?: boolean;
}) {
  return (
    <div
      className={`rounded-2xl border p-4 ${
        accent ? 'border-cyan-200 bg-cyan-50 shadow-sm' : 'border-slate-200 bg-white'
      }`}
    >
      <p className='text-sm font-semibold text-slate-950'>{title}</p>
      <p className='mt-2 text-sm leading-6 text-slate-600'>{summary}</p>
      <TrackableCtaLink
        href={href}
        ctaId={ctaId}
        ctaLabel={ctaLabel}
        pageType='pricing'
        className={`mt-4 inline-flex items-center justify-center rounded-lg px-4 py-2.5 text-sm font-semibold ${
          accent
            ? 'border border-slate-200 bg-white text-slate-700 hover:bg-slate-50'
            : 'border border-slate-200 bg-white text-slate-700 hover:bg-slate-50'
        }`}
      >
        {ctaLabel}
        <ArrowRight className='ml-2 size-4' />
      </TrackableCtaLink>
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
      ? '查看 AI Best Tool 的免费提交、加速审核和固定前排展示定价。我们只卖审核速度和固定窗口，不卖保证流量。'
      : 'See pricing for free submissions, faster review, and fixed featured placement windows.',
    robots: {
      index: false,
      follow: true,
    },
  };
}

export default function PricingPage({ params: { locale } }: { params: { locale: string } }) {
  const isChinese = locale === 'cn' || locale === 'tw';
  const submitHref = `/${locale}/submit?intent=paid`;
  const claimHref = `/${locale}/developer/listing?intent=claim`;
  const paymentHref = getListingPaymentMailto('AI Best Tool pricing');
  const { free, priorityReview, featuredWindows, launchBundle } = listingConfig.pricingTiers;

  return (
    <div className='theme-page mx-auto max-w-pc px-4 py-8 lg:px-0'>
      <CommerceViewTracker eventType='pricing_view' pageType='pricing' />
      <section className='overflow-hidden rounded-[24px] border border-slate-200 bg-white shadow-sm'>
        <div className='grid gap-0 lg:grid-cols-[1.1fr_0.9fr]'>
          <div className='space-y-6 p-6 lg:p-10'>
            <div className='inline-flex items-center gap-2 rounded-full bg-cyan-50 px-3 py-1 text-xs font-semibold text-cyan-800'>
              <CreditCard className='size-3.5' />
              {isChinese ? '价格方案' : 'Pricing'}
            </div>

            <div className='space-y-4'>
              <div className='rounded-2xl border border-cyan-200 bg-cyan-50 p-4 text-sm leading-6 text-cyan-950'>
                <p className='font-semibold'>{isChinese ? '先分流，再付费' : 'Pick the right path first'}</p>
                <p className='mt-1 text-cyan-900/85'>
                  {isChinese
                    ? '如果目录里已经有你的工具，先去认领页；如果是新条目，先去提交页。付费只买更快审核和固定曝光窗口，不是广告位。'
                    : 'If the listing already exists, claim it first. If it is a new listing, go through submit first. Paid options only buy faster review and a fixed visibility window.'}
                </p>
              </div>

              <h1 className='max-w-3xl text-3xl font-bold tracking-tight text-slate-950 lg:text-5xl'>
                {isChinese
                  ? '更快审核，更清楚曝光，按你的发布时间付费'
                  : 'Get reviewed faster and reserve visibility when timing matters'}
              </h1>
              <p className='max-w-2xl text-base leading-7 text-slate-600 lg:text-lg'>
                {isChinese
                  ? '免费提交继续开放；付费只买更快审核和固定曝光窗口，不买保证通过、保证流量或长期广告位。'
                  : 'Free submissions stay open. Paid options buy faster review and a fixed visibility window, not guaranteed approval or traffic.'}
              </p>
              <div className='rounded-2xl border border-amber-200 bg-amber-50 p-4 text-sm leading-6 text-amber-950'>
                <p className='font-semibold'>{isChinese ? '前排提醒' : 'Featured reminder'}</p>
                <p className='mt-1'>
                  {isChinese
                    ? '前排展示是固定天数窗口，不会自动续期，也不是按点击或按曝光计费的广告位。接近到期时，请回到“我的提交”查看续期提示。'
                    : 'Featured placement is a fixed-day window and does not renew automatically. When it nears expiry, check My Submissions for renewal prompts.'}
                </p>
              </div>
            </div>

            <div className='rounded-2xl border border-slate-200 bg-slate-50 p-5'>
              <div className='flex flex-wrap items-center justify-between gap-3'>
                <div>
                  <p className='text-xs font-semibold uppercase tracking-wide text-cyan-800'>
                    {isChinese ? '先选路径' : 'Choose your path first'}
                  </p>
                  <h2 className='mt-1 text-xl font-bold text-slate-950'>
                    {isChinese ? '三种动作，直接对应三条入口' : 'Three actions, three direct entry points'}
                  </h2>
                </div>
              </div>

              <div className='mt-4 grid gap-3 md:grid-cols-3'>
                <PathCard
                  title={isChinese ? '我已经被收录了' : 'I am already listed'}
                  summary={
                    isChinese
                      ? '先去认领页，把工具归到你的账号，再继续处理审核、更新和前排。'
                      : 'Claim the listing first, then continue with review, updates, and featured placement.'
                  }
                  ctaLabel={isChinese ? '去认领' : 'Claim listing'}
                  href={claimHref}
                  ctaId='pricing_path_claim'
                />
                <PathCard
                  title={isChinese ? '我是新提交' : 'I need a new submission'}
                  summary={
                    isChinese
                      ? '先走提交页，免费提交继续开放；如果要更快审核，可以在同一流程里选择付费。'
                      : 'Start from the submit page. Free submissions stay open, and paid review is available in the same flow.'
                  }
                  ctaLabel={isChinese ? '去提交' : 'Submit tool'}
                  href={submitHref}
                  ctaId='pricing_path_submit'
                />
                <PathCard
                  title={isChinese ? '我有时间敏感的发布' : 'My launch is time-sensitive'}
                  summary={
                    isChinese
                      ? '直接走提交页的付费方案，选择优先审核或固定前排窗口，适合发布和活动节点。'
                      : 'Use the paid path on submit to choose priority review or a fixed featured window for launches and campaigns.'
                  }
                  ctaLabel={isChinese ? '看付费方案' : 'View paid options'}
                  href={submitHref}
                  ctaId='pricing_path_paid'
                />
              </div>
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
                className='inline-flex items-center justify-center rounded-lg border border-slate-200 bg-white px-5 py-3 text-sm font-semibold text-slate-700 hover:bg-slate-50'
              >
                {isChinese ? '先去提交页' : 'Go to submit page'}
              </TrackableCtaLink>
              <TrackableCtaLink
                href={claimHref}
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
                className='inline-flex items-center justify-center rounded-lg border border-slate-200 bg-white px-5 py-3 text-sm font-semibold text-slate-700 hover:bg-slate-50'
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
                  href={`/${locale}/profile/submissions`}
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
                  className='inline-flex items-center justify-center rounded-lg border border-slate-200 bg-white px-4 py-2.5 text-sm font-semibold text-slate-700 hover:bg-slate-50'
                >
                  {isChinese ? '去提交工具' : 'Submit a tool'}
                </TrackableCtaLink>
              </div>
            </div>

            <div className='rounded-2xl border border-slate-200 bg-white p-5 shadow-sm'>
              <p className='text-sm font-semibold text-slate-950'>
                {isChinese ? '这次没有买到什么' : 'What this is not'}
              </p>
              <div className='mt-3 grid gap-3 sm:grid-cols-3'>
                {[
                  isChinese ? '不是永久广告位' : 'Not a permanent ad slot',
                  isChinese ? '不是保证通过' : 'Not guaranteed approval',
                  isChinese ? '不是保证流量' : 'Not guaranteed traffic',
                ].map((item) => (
                  <div
                    key={item}
                    className='rounded-xl border border-slate-200 bg-slate-50 p-4 text-sm leading-6 text-slate-700'
                  >
                    {item}
                  </div>
                ))}
              </div>
              <p className='mt-3 text-xs leading-5 text-slate-500'>
                {isChinese
                  ? '我们卖的是更快审核和固定窗口，不是广告位、长期包量，或任何形式的流量保证。'
                  : 'The product here is faster review and a fixed window, not an ad slot, a long-term bundle, or any traffic guarantee.'}
              </p>
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
                {isChinese ? '这些方案各自买到什么' : 'What each plan buys'}
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

      <GuideEvidencePanel
        locale={locale}
        checkedAt='2026-07-15'
        scope={
          isChinese
            ? '价格页的作用不是让人停在这里，而是帮访客快速判断：先认领、先提交，还是直接走付费加速。'
            : 'The pricing page should not trap visitors. It should help them decide whether to claim, submit, or use paid acceleration first.'
        }
        items={[
          {
            label: isChinese ? '页面定位' : 'Page role',
            value: isChinese ? '先判断路径，再决定是否付费' : 'Decide the path before you pay',
            note: isChinese
              ? '认领、提交、付费三条入口都能直接跳转。'
              : 'Claim, submit, and paid paths all link out directly.',
          },
          {
            label: isChinese ? '付费边界' : 'Payment boundary',
            value: isChinese ? '只买审核速度和固定窗口' : 'Only faster review and a fixed window',
            note: isChinese
              ? '明确说明不买保证通过、保证流量或永久曝光。'
              : 'It clearly says this does not buy approval, traffic, or permanent exposure.',
          },
          {
            label: isChinese ? '后续动作' : 'Next action',
            value: isChinese ? '去提交页或我的提交' : 'Go to submit or My Submissions',
            note: isChinese
              ? '把价格页变成可执行的分流页，而不是纯说明页。'
              : 'Turn the pricing page into an executable routing page, not just an explainer.',
          },
        ]}
        decisionSteps={[
          isChinese ? '先判断已有条目还是新提交。' : 'Check whether it is already listed or needs a new submission.',
          isChinese ? '需要更快审核时再选付费。' : 'Choose paid review only when timing matters.',
          isChinese ? '在「我的提交」里跟进付款与窗口。' : 'Follow payment and window status in My Submissions.',
        ]}
        signalCards={[
          {
            label: isChinese ? '决策信号' : 'Decision signal',
            value: isChinese ? '先认领，后提交，再考虑付费' : 'Claim first, submit second, pay last',
            note: isChinese
              ? '这能减少重复提交和无效付款。'
              : 'This reduces duplicate submissions and unnecessary payment.',
          },
          {
            label: isChinese ? '流程信号' : 'Flow signal',
            value: isChinese ? '付款后去“我的提交”查看' : 'Check My Submissions after payment',
            note: isChinese ? '让访客知道下一步在哪里发生。' : 'Shows visitors exactly where the next step happens.',
          },
          {
            label: isChinese ? '风险信号' : 'Risk signal',
            value: isChinese ? '不保证通过，也不保证流量' : 'No approval guarantee and no traffic guarantee',
            note: isChinese ? '把边界讲清楚，避免误解。' : 'Clear boundaries reduce confusion.',
          },
        ]}
      />

      <section className='mt-8 grid gap-4 lg:grid-cols-[1fr_360px]'>
        <div className='rounded-[20px] border border-slate-200 bg-white p-6 shadow-sm'>
          <p className='text-sm font-semibold uppercase tracking-wide text-cyan-700'>
            {isChinese ? '你买到什么' : 'What you actually get'}
          </p>
          <h2 className='mt-1 text-2xl font-bold text-slate-950'>
            {isChinese ? '每个方案只对应一个明确结果' : 'Each option buys one concrete outcome'}
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
                  [isChinese ? '是否自动通过' : 'Auto-approval', 'No', 'No', 'No', 'No'],
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
            {isChinese ? '付款后会发生什么' : 'What happens after you pay'}
          </p>
          <h2 className='mt-1 text-2xl font-bold text-slate-950'>
            {isChinese ? '每一步都能对应到明确结果' : 'Each step maps to a clear outcome'}
          </h2>
          <div className='mt-4 space-y-3 text-sm text-slate-700'>
            <StepRow
              index='1'
              text={
                isChinese
                  ? '先在提交页选方案，系统会记录你的付费意图。'
                  : 'Choose a plan on the submit page and the system records your intent.'
              }
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
                  ? '支付确认后，权益会写回提交状态，不会自动通过审核。'
                  : 'Payment confirmation is written back into your submission status, but it does not auto-approve the listing.'
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
                ? '付费方案包含更快审核、固定天数前排展示，或两者打包。你买到的是更明确的审核时效和曝光窗口，不是广告位、通过保证或流量保证。'
                : 'Paid listings include faster review, a fixed featured window, or both bundled together. You get a clearer review timeline and visibility window, not an ad slot, guaranteed approval, or guaranteed traffic.'
            }
          />
          <FaqCard
            q={isChinese ? '前排会自动续期吗？' : 'Does featured placement renew automatically?'}
            a={
              isChinese
                ? '不会。每次前排都是明确的天数窗口，到期后自动回收。接近到期时可以回到“我的提交”查看续期提醒。'
                : 'No. Each featured window has a fixed number of days and expires automatically. When it nears expiry, check My Submissions for renewal prompts.'
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
              className='inline-flex items-center justify-center rounded-lg border border-slate-200 bg-white px-4 py-3 text-sm font-semibold text-slate-700 hover:bg-slate-50'
            >
              {isChinese ? '去提交页' : 'Go to submit page'}
              <ArrowRight className='ml-2 size-4' />
            </TrackableCtaLink>
            <TrackableCtaLink
              href={paymentHref}
              ctaId='pricing_contact_footer'
              ctaLabel='Contact us'
              pageType='pricing'
              className='inline-flex items-center justify-center rounded-lg border border-slate-200 bg-white px-4 py-3 text-sm font-semibold text-slate-700 hover:bg-slate-50'
            >
              {isChinese ? '联系商务' : 'Contact us'}
            </TrackableCtaLink>
          </div>
        </div>
      </section>
    </div>
  );
}
