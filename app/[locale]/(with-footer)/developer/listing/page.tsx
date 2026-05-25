import type { ComponentType } from 'react';
import Link from 'next/link';
import { Metadata } from 'next';
import { getTranslations } from 'next-intl/server';
import { BadgeCheck, Clock3, CreditCard, Megaphone, ReceiptText, Rocket, ShieldCheck } from 'lucide-react';

import { getListingPaymentMailto, listingConfig } from '@/lib/config/listing';

export async function generateMetadata({
  params: { locale },
}: {
  params: { locale: string };
}): Promise<Metadata> {
  const t = await getTranslations({
    locale,
    namespace: 'Metadata.submit',
  });

  return {
    title: locale === 'cn' || locale === 'tw'
      ? '开发者入驻 | AI Best Tool'
      : `Developer Listing | ${t('title')}`,
    description:
      locale === 'cn' || locale === 'tw'
        ? '了解 AI Best Tool 的付费入驻、优先审核、前排展示和支付回调流程。'
        : 'Learn about paid listing, priority review, featured placement, and payment callback flow.',
  };
}

export default async function DeveloperListingPage({
  params: { locale },
}: {
  params: { locale: string };
}) {
  const isChinese = locale === 'cn' || locale === 'tw';
  const submitHref = '/submit';
  const paymentHref = getListingPaymentMailto('Paid AI tool listing');
  const paidHighlights = [
    isChinese ? '优先审核，减少等待' : listingConfig.plans.standard_paid.highlights[0],
    isChinese ? '可选前排展示，适合发布期' : listingConfig.plans.standard_paid.highlights[1],
    isChinese ? '支付后自动回调确认' : listingConfig.plans.standard_paid.highlights[2],
  ];

  return (
    <div className='theme-page mx-auto max-w-pc px-4 py-8 lg:px-0'>
      <section className='overflow-hidden rounded-[20px] border border-slate-200 bg-white shadow-sm'>
        <div className='grid gap-0 lg:grid-cols-[1.15fr_0.85fr]'>
          <div className='space-y-6 p-6 lg:p-10'>
            <div className='inline-flex items-center gap-2 rounded-full bg-cyan-50 px-3 py-1 text-xs font-semibold text-cyan-800'>
              <ReceiptText className='size-3.5' />
              {isChinese ? '开发者入驻选项' : 'Developer listing options'}
            </div>
            <div className='space-y-4'>
              <h1 className='max-w-3xl text-3xl font-bold tracking-tight text-slate-950 lg:text-5xl'>
                {isChinese
                  ? '免费提交之外，还有可选的优先审核和前排展示'
                  : 'Beyond free submission: optional priority review and featured placement'}
              </h1>
              <p className='max-w-2xl text-base leading-7 text-slate-600 lg:text-lg'>
                {isChinese
                  ? '免费提交负责覆盖面；如果你在意上线节奏或活动曝光，可以再选择付费入驻。'
                  : listingConfig.valueProposition}
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
              <Link
                href={submitHref}
                className='inline-flex items-center justify-center rounded-lg bg-cyan-700 px-5 py-3 text-sm font-semibold text-white hover:bg-cyan-800'
              >
                {isChinese ? '先去提交' : 'Start free submission'}
              </Link>
              <a
                href={paymentHref}
                className='inline-flex items-center justify-center rounded-lg border border-cyan-200 bg-cyan-50 px-5 py-3 text-sm font-semibold text-cyan-800 hover:bg-cyan-100'
              >
                {isChinese ? '查看可选付费方案' : 'View paid options'}
              </a>
            </div>

            <div className='grid gap-3 md:grid-cols-2'>
              <InfoCard
                icon={CreditCard}
                title={listingConfig.listingFeeLabel}
                text={
                  isChinese
                    ? '一次性上架服务费，适合需要额外曝光的团队。'
                    : 'A one-time fee for teams that want extra exposure.'
                }
              />
              <InfoCard
                icon={Clock3}
                title={listingConfig.plans.standard_paid.reviewWindow}
                text={
                  isChinese
                    ? '优先审核队列，适合发布期或需要更快处理的时候。'
                    : 'Priority review when timing matters.'
                }
              />
              <InfoCard
                icon={Megaphone}
                title={listingConfig.plans.standard_paid.featuredLabel}
                text={
                  isChinese
                    ? '可配置前排展示窗口，适合新品、活动和版本更新。'
                    : 'Configurable featured windows for launches, campaigns, and updates.'
                }
              />
              <InfoCard
                icon={ShieldCheck}
                title={isChinese ? '支付后自动确认' : 'Automatic payment confirmation'}
                text={
                  isChinese
                    ? '支付成功后，系统回调会自动留痕并激活对应服务。'
                    : 'Callbacks keep the record and activate the selected option.'
                }
              />
            </div>
          </div>

          <aside className='border-t border-slate-200 bg-slate-50 p-6 lg:border-l lg:border-t-0 lg:p-10'>
            <div className='space-y-4'>
              <h2 className='text-xl font-bold text-slate-950'>
                {isChinese ? '可选的入驻方式' : 'Available listing paths'}
              </h2>
              <PlanBlock
                title={isChinese ? '免费提交' : listingConfig.plans.free.label}
                badge={listingConfig.plans.free.reviewWindow}
                bullets={[
                  isChinese ? '标准队列审核' : listingConfig.plans.free.summary,
                  isChinese ? '先把覆盖面做起来' : listingConfig.plans.free.highlights[0],
                  isChinese ? '不包含前排资源' : listingConfig.plans.free.highlights[1],
                ]}
              />
              <PlanBlock
                title={isChinese ? '优先审核' : listingConfig.plans.standard_paid.label}
                badge={listingConfig.plans.standard_paid.reviewWindow}
                bullets={paidHighlights}
              />
              <PlanBlock
                title={isChinese ? '前排展示' : listingConfig.plans.standard_paid.featuredLabel}
                badge={listingConfig.plans.standard_paid.launchWindowLabel}
                bullets={[
                  isChinese ? '适合新品发布和活动期' : 'Best for launches and campaign windows',
                  isChinese ? '天数窗口可配置' : 'Window length can be configured',
                  isChinese ? '到期后自动回收' : 'Automatically expires after the window',
                ]}
              />

              <div className='rounded-xl border border-cyan-100 bg-white p-4'>
                <p className='text-sm font-semibold text-slate-900'>
                  {isChinese ? '处理流程' : 'How it works'}
                </p>
                <div className='mt-3 space-y-3 text-sm text-slate-600'>
                  <StepRow
                    index='1'
                    text={isChinese ? '先提交，保留自然收录。' : 'Submit first and keep organic discovery open.'}
                  />
                  <StepRow
                    index='2'
                    text={isChinese ? '如有需要，再选择优先审核或前排。' : 'If needed, add priority review or featured placement later.'}
                  />
                  <StepRow
                    index='3'
                    text={isChinese ? '支付后系统自动确认并记录。' : 'Payment is confirmed and recorded automatically.'}
                  />
                </div>
              </div>
            </div>
          </aside>
        </div>
      </section>

      <section className='mt-8 grid gap-4 lg:grid-cols-[1fr_360px]'>
        <div className='rounded-[18px] border border-slate-200 bg-white p-6 shadow-sm'>
          <p className='text-sm font-semibold uppercase tracking-wide text-cyan-700'>
            {isChinese ? '什么时候会用到付费选项' : 'When paid options help'}
          </p>
          <h2 className='mt-1 text-2xl font-bold text-slate-950'>
            {isChinese ? '在需要节奏和曝光时，再启用付费选项' : 'Use paid options when timing or visibility matters'}
          </h2>
          <div className='mt-4 grid gap-3 md:grid-cols-3'>
            <InfoCard
              icon={Rocket}
              title={isChinese ? '发布期更稳' : 'Launch timing'}
              text={
                isChinese
                  ? '新品上线、版本更新时，优先审核更适合赶节奏。'
                  : 'Priority review helps when a release needs to stay on schedule.'
              }
            />
            <InfoCard
              icon={Megaphone}
              title={isChinese ? '前排曝光' : 'Featured placement'}
              text={
                isChinese
                  ? '活动期把曝光集中到一个窗口里，会更容易被看见。'
                  : 'A time-boxed window can make a product easier to notice.'
              }
            />
            <InfoCard
              icon={BadgeCheck}
              title={isChinese ? '流程清晰' : 'Clear process'}
              text={
                isChinese
                  ? '从提交、付款到回调确认，全链路都清楚。'
                  : 'Submission, payment, and callback confirmation stay easy to follow.'
              }
            />
          </div>
        </div>

        <div className='rounded-[18px] border border-cyan-100 bg-cyan-50 p-6 shadow-sm'>
          <p className='text-sm font-semibold uppercase tracking-wide text-cyan-800'>
            {isChinese ? '下一步' : 'Next step'}
          </p>
          <h2 className='mt-1 text-2xl font-bold text-slate-950'>
            {isChinese ? '现在就能开始，但不用急着打扰用户' : 'You can start now without pushing too hard'}
          </h2>
          <p className='mt-3 text-sm leading-6 text-slate-700'>
            {isChinese
              ? '先把免费提交作为基础，再把真正需要节奏和曝光的开发者引到可选付费路径。'
              : 'Use free submissions as the base, and offer paid options only to teams that need faster timing or more visibility.'}
          </p>
          <div className='mt-5 flex flex-col gap-3'>
            <Link
              href={submitHref}
              className='inline-flex items-center justify-center rounded-lg bg-cyan-700 px-4 py-3 text-sm font-semibold text-white hover:bg-cyan-800'
            >
              {isChinese ? '去提交页' : 'Go to submit page'}
            </Link>
            <a
              href={paymentHref}
              className='inline-flex items-center justify-center rounded-lg border border-cyan-200 bg-white px-4 py-3 text-sm font-semibold text-cyan-800 hover:bg-cyan-100'
            >
              {isChinese ? '查看可选方案' : 'View optional plan'}
            </a>
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
              {isChinese ? '开发者最常问的几个问题' : 'Common questions from developers'}
            </h2>
          </div>
        </div>

        <div className='grid gap-3 lg:grid-cols-2'>
          <FaqCard
            q={isChinese ? '付费入驻一定会更快上线吗？' : 'Will paid listing always go live faster?'}
            a={
              isChinese
                ? '付费会进入优先审核队列，但仍需要满足内容、链接和媒体质量要求。'
                : 'Paid listings enter the priority queue, but they still need to pass content, URL, and media checks.'
            }
          />
          <FaqCard
            q={isChinese ? '前排展示会自动续期吗？' : 'Does featured placement renew automatically?'}
            a={
              isChinese
                ? '不会。每次前排展示都有明确的天数窗口，到期后会自动回收。'
                : 'No. Each featured window has a clear duration and is reclaimed after expiration.'
            }
          />
          <FaqCard
            q={isChinese ? '支付后怎么确认？' : 'How is payment confirmed?'}
            a={
              isChinese
                ? '支付成功后，回调接口会把状态写入系统，并在管理端留存日志。'
                : 'After payment succeeds, the callback endpoint writes status into the system and keeps an admin log.'
            }
          />
          <FaqCard
            q={isChinese ? '我可以先免费提交，再升级付费吗？' : 'Can I start free and upgrade later?'}
            a={
              isChinese
                ? '可以。你先提交，后续在管理沟通或付款链接确认后再激活付费服务。'
                : 'Yes. You can submit first and upgrade later through the admin flow or payment confirmation link.'
            }
          />
        </div>
      </section>
    </div>
  );
}

function InfoCard({
  icon: Icon,
  title,
  text,
}: {
  icon: ComponentType<{ className?: string }>;
  title: string;
  text: string;
}) {
  return (
    <div className='rounded-xl border border-slate-200 bg-slate-50 p-4'>
      <div className='flex items-start gap-3'>
        <span className='inline-flex rounded-lg bg-white p-2 text-cyan-700 ring-1 ring-slate-200'>
          <Icon className='size-4' />
        </span>
        <div>
          <p className='text-sm font-semibold text-slate-950'>{title}</p>
          <p className='mt-1 text-sm leading-6 text-slate-600'>{text}</p>
        </div>
      </div>
    </div>
  );
}

function PlanBlock({
  title,
  badge,
  bullets,
}: {
  title: string;
  badge: string;
  bullets: string[];
}) {
  return (
    <div className='rounded-xl border border-slate-200 bg-white p-4'>
      <div className='flex items-center justify-between gap-2'>
        <p className='text-sm font-semibold text-slate-950'>{title}</p>
        <span className='rounded-full bg-slate-100 px-2.5 py-1 text-xs font-semibold text-slate-600'>
          {badge}
        </span>
      </div>
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
