import React from 'react';
import { Metadata } from 'next';
import { BadgeCheck, CreditCard, FileSearch, Send } from 'lucide-react';
import { getTranslations } from 'next-intl/server';

import { getListingPaymentMailto, listingConfig } from '@/lib/config/listing';
import { getAllCategories } from '@/lib/services/categories';
import CommerceViewTracker from '@/components/analytics/CommerceViewTracker';
import TrackableCtaLink from '@/components/analytics/TrackableCtaLink';
import GuideEvidencePanel from '@/components/guides/GuideEvidencePanel';

import SubmitForm from './SubmitForm';

export async function generateMetadata({ params: { locale } }: { params: { locale: string } }): Promise<Metadata> {
  const t = await getTranslations({
    locale,
    namespace: 'Metadata.submit',
  });

  return {
    title: t('title'),
    robots: {
      index: false,
      follow: true,
    },
  };
}

export default async function Page({
  params: { locale },
  searchParams,
}: {
  params: { locale: string };
  searchParams?: { intent?: string };
}) {
  const t = await getTranslations({
    locale,
    namespace: 'Submit',
  });
  const categories = await getAllCategories();
  const isChinese = locale === 'cn' || locale === 'tw';
  const { free, priorityReview, featuredWindows, launchBundle } = listingConfig.pricingTiers;
  let initialIntent: 'default' | 'paid' | 'claim' = 'default';
  if (searchParams?.intent === 'paid') {
    initialIntent = 'paid';
  } else if (searchParams?.intent === 'claim') {
    initialIntent = 'claim';
  }

  return (
    <div className='theme-page mx-auto max-w-pc'>
      <CommerceViewTracker eventType='submit_view' pageType='submit' />
      <section className='mx-auto mt-6 max-w-pc px-3 lg:mt-10 lg:px-0'>
        <div className='rounded-[24px] border border-slate-200 bg-white p-6 shadow-sm lg:p-10'>
          <div className='inline-flex items-center gap-2 rounded-full bg-cyan-50 px-3 py-1 text-xs font-semibold text-cyan-800'>
            <CreditCard className='size-3.5' />
            {isChinese ? '提交与付费' : 'Submission and pricing'}
          </div>
          <div className='mt-4 max-w-4xl space-y-4'>
            <h1 className='text-3xl font-bold tracking-tight text-slate-950 lg:text-5xl'>{t('title')}</h1>
            <p className='text-base leading-7 text-slate-600 lg:text-lg'>
              {isChinese
                ? '先确认你要走免费提交、优先审核还是前排展示，再进入表单。付费不代表自动通过，只代表更快审核和固定曝光窗口。'
                : 'Decide first whether you want a free submission, priority review, or featured visibility, then fill out the form. Paid options speed up review and reserve visibility; they do not guarantee approval.'}
            </p>
            <p className='text-sm font-semibold text-slate-500'>{t('subTitle')}</p>
          </div>
        </div>
      </section>

      <section className='mx-auto mt-8 max-w-pc px-3 lg:px-0'>
        <div className='rounded-[20px] border border-cyan-100 bg-cyan-50/70 p-5 shadow-sm'>
          <div className='flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between'>
            <div>
              <p className='text-sm font-semibold uppercase tracking-wide text-cyan-700'>
                {isChinese ? '先判断路径' : 'Pick the right path first'}
              </p>
              <h2 className='mt-1 text-xl font-bold text-slate-950'>
                {isChinese
                  ? '如果目录里已经有你的工具，先去认领页'
                  : 'If the listing already exists, go claim it first'}
              </h2>
              <p className='mt-2 max-w-3xl text-sm leading-6 text-slate-600'>
                {isChinese
                  ? '重复提交会拖慢审核。认领适合已经在目录里的条目，提交适合新增条目。'
                  : 'Duplicate submissions slow down review. Claiming is for an existing listing; submitting is for a new one.'}
              </p>
            </div>
            <div className='flex flex-wrap gap-3'>
              <TrackableCtaLink
                href={`/${locale}/developer/listing?intent=claim`}
                ctaId='submit_banner_claim'
                ctaLabel='Submit page banner claim'
                pageType='submit'
                className='inline-flex items-center justify-center rounded-lg border border-slate-200 bg-white px-4 py-2.5 text-sm font-semibold text-slate-700 hover:bg-slate-50'
              >
                {isChinese ? '先去认领页' : 'Go to claim listing'}
              </TrackableCtaLink>
              <TrackableCtaLink
                href={`/${locale}/pricing`}
                ctaId='submit_banner_pricing'
                ctaLabel='Submit page banner pricing'
                pageType='submit'
                className='inline-flex items-center justify-center rounded-lg border border-slate-200 bg-white px-4 py-2.5 text-sm font-semibold text-slate-700 hover:bg-slate-50'
              >
                {isChinese ? '查看价格页' : 'View pricing'}
              </TrackableCtaLink>
            </div>
          </div>
        </div>

        <div className='mt-4 rounded-[20px] border border-slate-200 bg-white p-5 shadow-sm'>
          <p className='text-sm font-semibold uppercase tracking-wide text-cyan-700'>
            {isChinese ? '提交前清单' : 'Submission checklist'}
          </p>
          <div className='mt-3 grid gap-3 md:grid-cols-2 xl:grid-cols-4'>
            {[
              isChinese ? '官网可打开' : 'Website works',
              isChinese ? '分类选准确' : 'Category is correct',
              isChinese ? '一句能力描述' : 'One clear capability line',
              isChinese ? 'Logo / 截图可用' : 'Logo or screenshot ready',
            ].map((item) => (
              <div
                key={item}
                className='rounded-xl border border-slate-200 bg-slate-50 p-4 text-sm leading-6 text-slate-700'
              >
                {item}
              </div>
            ))}
          </div>
          <p className='mt-3 text-sm leading-6 text-slate-600'>
            {isChinese
              ? '如果这些还没准备好，先补齐再提交，能明显减少被退回或被卡审核的概率。'
              : 'If these are not ready yet, prep them first. It will reduce the chance of rejection or review delays.'}
          </p>
        </div>

        <div className='grid gap-3 md:grid-cols-2 xl:grid-cols-4'>
          <div className='rounded-2xl border border-slate-200 bg-white p-5 shadow-sm'>
            <p className='text-sm font-semibold text-slate-950'>{free.label}</p>
            <p className='mt-2 text-2xl font-bold text-slate-950'>{free.priceLabel}</p>
            <p className='mt-2 text-sm leading-6 text-slate-600'>{free.summary}</p>
            <p className='mt-3 text-xs font-semibold uppercase tracking-wide text-cyan-700'>{free.reviewWindow}</p>
            <ul className='mt-3 space-y-2 text-sm leading-6 text-slate-600'>
              {free.highlights.map((item) => (
                <li key={item} className='flex items-start gap-2'>
                  <span className='mt-1 h-1.5 w-1.5 rounded-full bg-cyan-600' />
                  <span>{item}</span>
                </li>
              ))}
            </ul>
          </div>
          <div className='rounded-2xl border border-cyan-200 bg-white p-5 shadow-sm'>
            <p className='text-sm font-semibold text-slate-950'>{priorityReview.label}</p>
            <p className='mt-2 text-2xl font-bold text-slate-950'>{priorityReview.priceLabel}</p>
            <p className='mt-2 text-sm leading-6 text-slate-600'>{priorityReview.summary}</p>
            <p className='mt-3 text-xs font-semibold uppercase tracking-wide text-cyan-700'>
              {priorityReview.reviewWindow}
            </p>
            <ul className='mt-3 space-y-2 text-sm leading-6 text-slate-600'>
              {priorityReview.highlights.map((item) => (
                <li key={item} className='flex items-start gap-2'>
                  <span className='mt-1 h-1.5 w-1.5 rounded-full bg-cyan-600' />
                  <span>{item}</span>
                </li>
              ))}
            </ul>
          </div>
          <div className='rounded-2xl border border-slate-200 bg-white p-5 shadow-sm'>
            <p className='text-sm font-semibold text-slate-950'>{featuredWindows[1].label}</p>
            <p className='mt-2 text-2xl font-bold text-slate-950'>{featuredWindows[1].priceLabel}</p>
            <p className='mt-2 text-sm leading-6 text-slate-600'>{featuredWindows[1].summary}</p>
            <p className='mt-3 text-xs font-semibold uppercase tracking-wide text-cyan-700'>
              {isChinese ? `${featuredWindows[1].days} 天窗口` : `${featuredWindows[1].days}-day window`}
            </p>
            <ul className='mt-3 space-y-2 text-sm leading-6 text-slate-600'>
              <li className='flex items-start gap-2'>
                <span className='mt-1 h-1.5 w-1.5 rounded-full bg-cyan-600' />
                <span>
                  {isChinese ? '到期自动回收，不会自动续费' : 'Expires automatically and does not renew on its own'}
                </span>
              </li>
              <li className='flex items-start gap-2'>
                <span className='mt-1 h-1.5 w-1.5 rounded-full bg-cyan-600' />
                <span>{isChinese ? '适合发布窗口和更新窗口' : 'Best for launch or update windows'}</span>
              </li>
            </ul>
          </div>
          <div className='rounded-2xl border border-slate-200 bg-white p-5 shadow-sm'>
            <p className='text-sm font-semibold text-slate-950'>{launchBundle.label}</p>
            <p className='mt-2 text-2xl font-bold text-slate-950'>{launchBundle.priceLabel}</p>
            <p className='mt-2 text-sm leading-6 text-slate-600'>{launchBundle.summary}</p>
            <p className='mt-3 text-xs font-semibold uppercase tracking-wide text-cyan-700'>
              {isChinese ? '优先审核 + 前排' : 'Priority review + featured'}
            </p>
            <ul className='mt-3 space-y-2 text-sm leading-6 text-slate-600'>
              {launchBundle.highlights.map((item) => (
                <li key={item} className='flex items-start gap-2'>
                  <span className='mt-1 h-1.5 w-1.5 rounded-full bg-cyan-600' />
                  <span>{item}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </section>

      <div className='flex-y-center my-3 flex lg:my-10'>
        <div className='grid w-full items-start gap-5 px-3 lg:grid-cols-[minmax(0,560px)_320px] lg:px-0'>
          <SubmitForm categories={categories} locale={locale} className='mx-0' initialIntent={initialIntent} />
          <aside className='theme-surface rounded-[12px] p-5 text-slate-900'>
            <p className='text-sm font-semibold uppercase tracking-wide text-cyan-700'>
              {isChinese ? '开发者入驻' : 'Developer listing'}
            </p>
            <h3 className='mt-2 text-xl font-bold text-slate-950'>
              {isChinese ? '先选审核路径，再决定是否加速' : 'Choose a review path before you submit'}
            </h3>
            <p className='mt-3 text-sm leading-6 text-slate-600'>
              {isChinese
                ? '免费提交适合常规收录；付费方案只会更快审核和提供固定展示窗口，不会自动通过审核。'
                : `${listingConfig.valueProposition} ${listingConfig.listingFeeLabel}.`}
            </p>
            <div className='mt-4 grid gap-3'>
              <div className='rounded-lg border border-slate-200 bg-slate-50 p-3'>
                <p className='text-sm font-semibold text-slate-900'>
                  {isChinese ? '免费提交' : listingConfig.plans.free.label}
                </p>
                <p className='mt-1 text-sm text-slate-600'>
                  {isChinese ? '进入标准审核队列，适合常规收录。' : `${listingConfig.plans.free.summary}`}
                </p>
              </div>
              <div className='rounded-lg border border-cyan-100 bg-cyan-50 p-3'>
                <p className='text-sm font-semibold text-cyan-900'>
                  {isChinese ? '付费入驻' : listingConfig.plans.standard_paid.label}
                </p>
                <p className='mt-1 text-sm text-cyan-900'>
                  {isChinese
                    ? '更短的审核周期，并可选择固定天数的前排展示。'
                    : `${listingConfig.plans.standard_paid.summary}`}
                </p>
              </div>
            </div>
            <div className='mt-4 rounded-lg border border-slate-200 bg-white p-3'>
              <p className='text-sm font-semibold text-slate-950'>
                {isChinese ? '你没有买到什么' : 'What you are not buying'}
              </p>
              <p className='mt-2 text-sm leading-6 text-slate-600'>
                {isChinese
                  ? '付费不是通过保证，也不是永久曝光。你买的是更快审核和固定窗口。'
                  : 'Paid submission is not approval and not permanent exposure. You are buying faster review and a fixed window.'}
              </p>
            </div>
            <div className='mt-4 rounded-lg border border-amber-200 bg-amber-50 p-3'>
              <p className='text-sm font-semibold text-amber-900'>{isChinese ? '适合什么场景' : 'Best for'}</p>
              <p className='mt-1 text-sm leading-6 text-amber-900'>
                {isChinese
                  ? '适合新品发布、活动期曝光，或希望更快完成审核并把更多访客引导到官网的团队。'
                  : 'New launches, campaign windows, faster turnaround, or when a team wants to send more visitors to its own site.'}
              </p>
            </div>
            <div className='mt-4 space-y-3 text-sm text-slate-700'>
              <div className='flex items-start gap-2'>
                <Send className='mt-0.5 size-4 text-cyan-700' />
                <p>{isChinese ? '填写基础信息并提交工具。' : 'Submit your tool details.'}</p>
              </div>
              <div className='flex items-start gap-2'>
                <FileSearch className='mt-0.5 size-4 text-cyan-700' />
                <p>
                  {isChinese ? '我们会审核链接、分类与内容质量。' : 'We review URL, category, and content quality.'}
                </p>
              </div>
              <div className='flex items-start gap-2'>
                <BadgeCheck className='mt-0.5 size-4 text-cyan-700' />
                <p>
                  {isChinese ? '通过后发布到目录并持续获取曝光。' : 'Approved tools are published in the directory.'}
                </p>
              </div>
            </div>
            <TrackableCtaLink
              href={getListingPaymentMailto('Paid AI tool listing')}
              ctaId='submit_contact_paid_listing'
              ctaLabel='Contact paid listing'
              pageType='submit'
              className='mt-5 inline-flex w-full items-center justify-center rounded-lg border border-slate-200 bg-white px-4 py-3 text-sm font-semibold text-slate-700 hover:bg-slate-50'
            >
              {isChinese ? '联系付费入驻' : 'Contact paid listing'}
            </TrackableCtaLink>
            <p className='mt-3 text-xs leading-5 text-slate-500'>
              {isChinese
                ? '付款会在“我的提交”里继续处理，不会在这里直接完成。'
                : 'Payment is completed from My Submissions after you submit, not directly on this page.'}
            </p>
            <TrackableCtaLink
              href={`/${locale}/developer/listing?intent=claim`}
              ctaId='submit_view_developer_listing'
              ctaLabel='View developer listing details'
              pageType='submit'
              className='mt-3 inline-flex w-full items-center justify-center rounded-lg border border-slate-200 bg-white px-4 py-3 text-sm font-semibold text-slate-700 hover:bg-slate-50'
            >
              {isChinese ? '查看开发者入驻说明' : 'View developer listing details'}
            </TrackableCtaLink>
          </aside>
        </div>
      </div>

      <section className='mx-auto mt-8 max-w-pc px-3 lg:px-0'>
        <div className='grid gap-4 lg:grid-cols-[1.05fr_0.95fr]'>
          <div className='rounded-[20px] border border-slate-200 bg-white p-6 shadow-sm'>
            <p className='text-sm font-semibold uppercase tracking-wide text-cyan-700'>
              {isChinese ? '审核标准' : 'Review standards'}
            </p>
            <h2 className='mt-1 text-2xl font-bold text-slate-950'>
              {isChinese ? '先看会不会被卡住' : 'Check what can stall the review'}
            </h2>
            <div className='mt-4 space-y-3 text-sm leading-6 text-slate-700'>
              <div className='rounded-xl bg-slate-50 p-4'>
                <p className='font-semibold text-slate-950'>{isChinese ? '基础信息完整' : 'Basic info is complete'}</p>
                <p className='mt-1'>
                  {isChinese
                    ? '官网、分类、描述、定价和视觉素材越完整，审核越顺。'
                    : 'Website, category, description, pricing, and visual assets make review much smoother.'}
                </p>
              </div>
              <div className='rounded-xl bg-slate-50 p-4'>
                <p className='font-semibold text-slate-950'>
                  {isChinese ? '内容和链接可验证' : 'Content and links are verifiable'}
                </p>
                <p className='mt-1'>
                  {isChinese
                    ? '如果链接打不开、页面空白或描述无法验证，通常会直接拖慢审核。'
                    : 'Broken links, empty pages, or unverifiable claims usually slow review immediately.'}
                </p>
              </div>
              <div className='rounded-xl bg-slate-50 p-4'>
                <p className='font-semibold text-slate-950'>
                  {isChinese ? '不是重复或垃圾条目' : 'It is not a duplicate or spam'}
                </p>
                <p className='mt-1'>
                  {isChinese
                    ? '重复提交、明显灌水、低质量截图或不相关分类都会被优先清理。'
                    : 'Duplicate entries, spammy submissions, poor screenshots, or mismatched categories are usually cleaned up first.'}
                </p>
              </div>
            </div>
          </div>

          <div className='rounded-[20px] border border-cyan-100 bg-cyan-50/70 p-6 shadow-sm'>
            <p className='text-sm font-semibold uppercase tracking-wide text-cyan-700'>
              {isChinese ? '付款说明' : 'Payment flow'}
            </p>
            <h2 className='mt-1 text-2xl font-bold text-slate-950'>
              {isChinese ? '付费会加速，但不会替你通过审核' : 'Payment speeds things up, but it does not auto-approve'}
            </h2>
            <div className='mt-4 space-y-3'>
              <div className='rounded-xl border border-white bg-white p-4 text-sm leading-6 text-slate-700'>
                <p className='font-semibold text-slate-950'>{isChinese ? '1. 先提交' : '1. Submit first'}</p>
                <p className='mt-1'>
                  {isChinese
                    ? '你先把条目提上来，我们再根据内容质量和审核路径处理。'
                    : 'Submit the listing first, then review is handled according to content quality and your chosen path.'}
                </p>
              </div>
              <div className='rounded-xl border border-white bg-white p-4 text-sm leading-6 text-slate-700'>
                <p className='font-semibold text-slate-950'>
                  {isChinese ? '2. 再决定是否付费' : '2. Decide whether to pay'}
                </p>
                <p className='mt-1'>
                  {isChinese
                    ? '如果你需要更快审核或固定前排窗口，再选择对应方案。'
                    : 'If you need faster review or a fixed featured window, choose the matching option.'}
                </p>
              </div>
              <div className='rounded-xl border border-white bg-white p-4 text-sm leading-6 text-slate-700'>
                <p className='font-semibold text-slate-950'>
                  {isChinese ? '3. 付款后生效' : '3. Payment activates the entitlement'}
                </p>
                <p className='mt-1'>
                  {isChinese
                    ? '付款只会让审核更快、前排窗口更清晰，不会自动通过条目。'
                    : 'Payment only makes the review faster and the visibility window clearer. It does not auto-approve the listing.'}
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className='mx-auto mt-8 max-w-pc px-3 lg:px-0'>
        <div className='rounded-[20px] border border-cyan-100 bg-cyan-50/60 p-6 shadow-sm lg:p-8'>
          <div className='flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between'>
            <div className='max-w-3xl'>
              <p className='text-sm font-semibold uppercase tracking-wide text-cyan-700'>
                {isChinese ? '提交后会发生什么' : 'What happens next'}
              </p>
              <h2 className='mt-1 text-2xl font-bold text-slate-950'>
                {isChinese
                  ? '把审核流程说清楚，减少反复确认'
                  : 'Make the review flow clear so nobody has to guess twice'}
              </h2>
              <p className='mt-2 text-sm leading-6 text-slate-600'>
                {isChinese
                  ? '提交之后，你可以在「我的提交」里继续看审核状态、付款链接和后续提示；如果是老条目，先认领再处理会更快。'
                  : 'After submitting, you can keep checking review status, payment links, and next steps in My Submissions. If it is an existing listing, claiming first is usually faster.'}
              </p>
            </div>
            <div className='flex flex-wrap gap-3'>
              <TrackableCtaLink
                href={`/${locale}/profile/submissions`}
                ctaId='submit_view_submissions_after'
                ctaLabel='View my submissions'
                pageType='submit'
                className='inline-flex items-center justify-center rounded-lg bg-cyan-700 px-4 py-2.5 text-sm font-semibold text-white hover:bg-cyan-800'
              >
                {isChinese ? '查看我的提交' : 'View my submissions'}
              </TrackableCtaLink>
              <TrackableCtaLink
                href={`/${locale}/pricing`}
                ctaId='submit_view_pricing_after'
                ctaLabel='View pricing'
                pageType='submit'
                className='inline-flex items-center justify-center rounded-lg border border-cyan-200 bg-white px-4 py-2.5 text-sm font-semibold text-cyan-800 hover:bg-cyan-50'
              >
                {isChinese ? '返回价格页' : 'View pricing'}
              </TrackableCtaLink>
            </div>
          </div>

          <div className='mt-6 grid gap-3 lg:grid-cols-4'>
            {[
              {
                title: isChinese ? '1. 先进入审核队列' : '1. Enter the review queue',
                text: isChinese
                  ? '免费提交会进入标准审核；付费提交会更快进入处理。'
                  : 'Free submissions go into the standard review queue; paid submissions move faster.',
              },
              {
                title: isChinese ? '2. 补齐缺失信息' : '2. Fill any missing details',
                text: isChinese
                  ? '如果官网、截图、分类或描述不完整，审核会更慢。'
                  : 'Missing website, screenshots, category, or descriptions will slow review down.',
              },
              {
                title: isChinese ? '3. 付款只锁定窗口' : '3. Payment only reserves a window',
                text: isChinese
                  ? '付费会记录权益和前排窗口，但不会自动通过审核。'
                  : 'Payment records the entitlement and reserves the featured window, but does not auto-approve.',
              },
              {
                title: isChinese ? '4. 通过后继续跟进' : '4. Follow up after approval',
                text: isChinese
                  ? '发布后继续看认领、评论和更新请求。'
                  : 'After publish, keep an eye on claims, comments, and update requests.',
              },
            ].map((step) => (
              <div key={step.title} className='rounded-xl border border-white bg-white p-4 shadow-sm'>
                <p className='text-sm font-semibold text-slate-950'>{step.title}</p>
                <p className='mt-2 text-sm leading-6 text-slate-600'>{step.text}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className='mx-auto mt-8 max-w-pc px-3 lg:px-0'>
        <div className='rounded-[20px] border border-slate-200 bg-white p-6 shadow-sm lg:p-8'>
          <p className='text-sm font-semibold uppercase tracking-wide text-cyan-700'>
            {isChinese ? '常见问题' : 'FAQ'}
          </p>
          <h2 className='mt-1 text-2xl font-bold text-slate-950'>
            {isChinese ? '提交前最重要的 4 条规则' : 'Four rules before you submit'}
          </h2>
          <div className='mt-4 grid gap-3 lg:grid-cols-2'>
            <div className='rounded-xl border border-slate-200 bg-slate-50 p-4'>
              <p className='text-sm font-semibold text-slate-950'>
                {isChinese ? '能先免费，再升级吗？' : 'Can I start free and upgrade later?'}
              </p>
              <p className='mt-2 text-sm leading-6 text-slate-600'>
                {isChinese
                  ? '可以。先免费最稳，后面再按发布时间升级。'
                  : 'Yes. Free first is the safest start, then upgrade when timing matters.'}
              </p>
            </div>
            <div className='rounded-xl border border-slate-200 bg-slate-50 p-4'>
              <p className='text-sm font-semibold text-slate-950'>
                {isChinese ? '为什么会被拒？' : 'Why can it get rejected?'}
              </p>
              <p className='mt-2 text-sm leading-6 text-slate-600'>
                {isChinese
                  ? '最常见的是信息不完整、链接打不开、重复条目，或者分类不对。'
                  : 'Usually because info is incomplete, links fail, entries duplicate, or the category is wrong.'}
              </p>
            </div>
            <div className='rounded-xl border border-slate-200 bg-slate-50 p-4'>
              <p className='text-sm font-semibold text-slate-950'>
                {isChinese ? '付费会自动通过吗？' : 'Does payment auto-approve?'}
              </p>
              <p className='mt-2 text-sm leading-6 text-slate-600'>
                {isChinese
                  ? '不会。付费只加快审核、锁定窗口，不保证通过。'
                  : 'No. Payment only speeds review and reserves the window, not approval.'}
              </p>
            </div>
            <div className='rounded-xl border border-slate-200 bg-slate-50 p-4'>
              <p className='text-sm font-semibold text-slate-950'>
                {isChinese ? '先认领还是先提交？' : 'Claim first or submit first?'}
              </p>
              <p className='mt-2 text-sm leading-6 text-slate-600'>
                {isChinese
                  ? '已有条目先认领；新条目先提交。'
                  : 'Existing listing, claim first. New listing, submit first.'}
              </p>
            </div>
          </div>
        </div>
      </section>

      <GuideEvidencePanel
        locale={locale}
        checkedAt='2026-07-18'
        scope={
          isChinese
            ? '提交页要把认领、提交、付费和后续跟进拆开，避免访客把它当成一个只有表单的页面。'
            : 'The submit page should separate claim, submission, payment, and follow-up so it does not feel like a plain form page.'
        }
        items={[
          {
            label: isChinese ? '页面定位' : 'Page role',
            value: isChinese ? '先判断认领还是提交' : 'Decide claim or submit first',
            note: isChinese
              ? '已有条目先认领，新条目再提交。'
              : 'Existing listings should be claimed first; new ones should be submitted.',
          },
          {
            label: isChinese ? '执行信号' : 'Execution signal',
            value: isChinese ? '付款后去“我的提交”' : 'Continue in My Submissions after payment',
            note: isChinese ? '把付款和后续动作放到同一条线上。' : 'Keeps payment and follow-up on the same path.',
          },
          {
            label: isChinese ? '质量信号' : 'Quality signal',
            value: isChinese ? '先准备素材再进入审核' : 'Prepare assets before review',
            note: isChinese ? '减少被退回和卡审核的概率。' : 'Reduces rejection and review delays.',
          },
        ]}
        decisionSteps={[
          isChinese ? '先看条目是否已经存在。' : 'Check whether the listing already exists.',
          isChinese ? '如果是新条目，直接提交。' : 'If it is new, submit it directly.',
          isChinese ? '需要加速时，再选付费。' : 'Choose paid review only when speed matters.',
        ]}
        signalCards={[
          {
            label: isChinese ? '分流信号' : 'Routing signal',
            value: isChinese ? '已有条目先认领' : 'Claim existing listings first',
            note: isChinese ? '避免重复提交导致审核更慢。' : 'Avoid duplicate submissions that slow review.',
          },
          {
            label: isChinese ? '动作信号' : 'Action signal',
            value: isChinese ? '提交后继续看状态' : 'Track status after submission',
            note: isChinese ? '让提交过程变成可追踪流程。' : 'Turns submission into a trackable workflow.',
          },
          {
            label: isChinese ? '风险信号' : 'Risk signal',
            value: isChinese ? '缺信息会拖慢审核' : 'Missing info slows review',
            note: isChinese
              ? '官网、分类、截图和描述都要先准备好。'
              : 'Website, category, screenshots, and description should be ready first.',
          },
        ]}
      />
    </div>
  );
}
