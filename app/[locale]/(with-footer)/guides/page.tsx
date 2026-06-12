import { Metadata } from 'next';
import { getTranslations } from 'next-intl/server';
import { ArrowRight, BookOpen, CheckCircle2, Sparkles } from 'lucide-react';

import { Link } from '@/app/navigation';
import { StructuredDataServer } from '@/components/seo/StructuredData';
import { FEATURED_GUIDE_HREFS, GUIDE_PAGES } from '@/lib/content/guides';
import { generateBreadcrumbSchema } from '@/lib/seo/schema';

export async function generateMetadata({
  params: { locale },
}: {
  params: { locale: string };
}): Promise<Metadata> {
  const t = await getTranslations({
    locale,
    namespace: 'Metadata.home',
  });

  return {
    title: locale === 'cn' || locale === 'tw'
      ? 'AI 指南总览 | AI Best Tool'
      : `AI guides hub | ${t('title')}`,
    description:
      locale === 'cn' || locale === 'tw'
        ? '汇总 AI 工具选型、免费工具和各类场景指南。'
        : 'A hub for AI tool selection, free tools, and use-case guides.',
  };
}

export default async function Page({
  params: { locale },
}: {
  params: { locale: string };
}) {
  const isChinese = locale === 'cn' || locale === 'tw';
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000';
  const pickGuide = (href: string) => GUIDE_PAGES.find((item) => item.href === href);
  const featuredGuides = FEATURED_GUIDE_HREFS.map((href) => pickGuide(href)).filter(
    (item): item is (typeof GUIDE_PAGES)[number] => Boolean(item),
  );
  const startHereGuides = [
    '/guides/how-to-choose-ai-tools',
    '/guides/free-ai-tools',
    '/guides/best-free-ai-tools',
    '/guides/ai-productivity-tools',
  ]
    .map((href) => pickGuide(href))
    .filter((item): item is (typeof GUIDE_PAGES)[number] => Boolean(item));
  const operatorGuides = [
    '/guides/ai-writing-tools',
    '/guides/ai-seo-tools',
    '/guides/ai-note-taking-tools',
    '/guides/ai-tools-for-automation',
  ]
    .map((href) => pickGuide(href))
    .filter((item): item is (typeof GUIDE_PAGES)[number] => Boolean(item));
  const web3Guides = [
    '/guides/ai-tools-for-web3',
    '/guides/ai-tools-for-web3-analysis',
    '/guides/ai-tools-for-crypto-research',
    '/guides/ai-tools-for-on-chain-analysis',
  ]
    .map((href) => pickGuide(href))
    .filter((item): item is (typeof GUIDE_PAGES)[number] => Boolean(item));
  const breadcrumbSchema = generateBreadcrumbSchema([
    { name: 'Home', url: `${siteUrl}/${locale}` },
    { name: isChinese ? '指南总览' : 'Guides', url: `${siteUrl}/${locale}/guides` },
  ]);

  return (
    <>
      <StructuredDataServer data={breadcrumbSchema} />
      <div className='theme-page mx-auto max-w-6xl px-4 py-8 lg:px-6 lg:py-12'>
        <section className='rounded-[20px] border border-slate-200 bg-white p-6 shadow-sm lg:p-10'>
          <div className='flex flex-wrap items-center gap-2'>
            <span className='inline-flex items-center gap-2 rounded-full bg-cyan-50 px-3 py-1 text-sm font-semibold text-cyan-700'>
              <BookOpen className='size-4' />
              {isChinese ? '指南总览' : 'Guides hub'}
            </span>
            <span className='inline-flex items-center gap-2 rounded-full bg-slate-100 px-3 py-1 text-sm font-semibold text-slate-700'>
              <Sparkles className='size-4' />
              {isChinese ? '先看再选' : 'Read before you choose'}
            </span>
          </div>

          <h1 className='mt-4 max-w-4xl text-3xl font-bold tracking-tight text-slate-950 lg:text-5xl'>
            {isChinese ? 'AI 指南总览' : 'AI guides hub'}
          </h1>
          <p className='mt-4 max-w-3xl text-base leading-7 text-slate-600 lg:text-lg'>
            {isChinese
              ? '把选型、免费工具和各类场景指南收在一起，先帮助用户理清思路，再进入具体工具和分类。'
              : 'A single place for selection tips, free tools, and use-case guides so people can sort out their needs before diving into tools and categories.'}
          </p>

          <div className='mt-6 grid gap-3 md:grid-cols-2 xl:grid-cols-4'>
            <Link
              href='/guides/how-to-choose-ai-tools'
              className='rounded-lg border border-slate-200 bg-slate-50 p-4 transition hover:border-cyan-200 hover:bg-cyan-50/60'
            >
              <p className='text-sm font-semibold text-slate-950'>
                {isChinese ? '先看总选型指南' : 'Start with the selection guide'}
              </p>
              <p className='mt-2 text-sm leading-6 text-slate-600'>
                {isChinese
                  ? '如果你还没想清楚比较维度，先从这里建立判断。'
                  : 'Build your comparison criteria here before diving into tools.'}
              </p>
            </Link>
            <Link
              href='/new'
              className='rounded-lg border border-slate-200 bg-slate-50 p-4 transition hover:border-cyan-200 hover:bg-cyan-50/60'
            >
              <p className='text-sm font-semibold text-slate-950'>
                {isChinese ? '看本周新增' : 'See what is new this week'}
              </p>
              <p className='mt-2 text-sm leading-6 text-slate-600'>
                {isChinese
                  ? '先看最近补进来的真实内容，再决定往哪个分类走。'
                  : 'Check the freshest pages first, then decide which category deserves more time.'}
              </p>
            </Link>
            <Link
              href='/categories/productivity?sort=popular'
              className='rounded-lg border border-slate-200 bg-slate-50 p-4 transition hover:border-cyan-200 hover:bg-cyan-50/60'
            >
              <p className='text-sm font-semibold text-slate-950'>
                {isChinese ? '进入生产力分类' : 'Open productivity'}
              </p>
              <p className='mt-2 text-sm leading-6 text-slate-600'>
                {isChinese
                  ? '如果你想先从高频、实用型工具开始，这是最稳的入口。'
                  : 'A reliable next stop if you want practical, high-frequency workflows first.'}
              </p>
            </Link>
            <Link
              href='/categories/web3?sort=popular'
              className='rounded-lg border border-slate-200 bg-slate-50 p-4 transition hover:border-cyan-200 hover:bg-cyan-50/60'
            >
              <p className='text-sm font-semibold text-slate-950'>
                {isChinese ? '进入 Web3 分类' : 'Open Web3'}
              </p>
              <p className='mt-2 text-sm leading-6 text-slate-600'>
                {isChinese
                  ? '如果你更关心链上研究和分析，这里是最聚焦的入口。'
                  : 'The sharpest entry point for on-chain analysis, research, and infra workflows.'}
              </p>
            </Link>
          </div>
        </section>

        <section className='mt-8 rounded-[18px] border border-slate-200 bg-white p-6 shadow-sm lg:p-8'>
          <div className='flex items-start gap-3'>
            <CheckCircle2 className='mt-1 size-5 shrink-0 text-emerald-600' />
            <div>
              <h2 className='text-xl font-semibold text-slate-950'>
                {isChinese ? '推荐的阅读路径' : 'Suggested reading path'}
              </h2>
              <p className='mt-2 text-sm leading-6 text-slate-600'>
                {isChinese
                  ? '先看总选型，再按工作流或行业进入更具体的指南，最后回到分类页或工具详情页做真实比较。'
                  : 'Start with selection logic, move into workflow or industry-specific guides, then return to categories and tool pages for real comparisons.'}
              </p>
            </div>
          </div>

          <div className='mt-6 grid gap-4 xl:grid-cols-3'>
            {[
              {
                title: isChinese ? '第一步：建立判断标准' : 'Step 1: set your criteria',
                items: startHereGuides,
              },
              {
                title: isChinese ? '第二步：按工作流进入' : 'Step 2: go by workflow',
                items: operatorGuides,
              },
              {
                title: isChinese ? '第三步：专项看 Web3 / 研究' : 'Step 3: explore Web3 and research',
                items: web3Guides,
              },
            ].map((section) => (
              <div key={section.title} className='rounded-lg border border-slate-200 bg-slate-50 p-4'>
                <h3 className='text-sm font-semibold text-slate-950'>{section.title}</h3>
                <div className='mt-3 space-y-3'>
                  {section.items.map((item) => (
                    <Link
                      key={item.href}
                      href={item.href}
                      className='block rounded-lg border border-slate-200 bg-white p-3 transition hover:border-cyan-200 hover:bg-cyan-50/40'
                    >
                      <p className='text-sm font-semibold text-slate-900'>{item.title[isChinese ? 'cn' : 'en']}</p>
                      <p className='mt-1 text-sm leading-6 text-slate-600'>{item.desc[isChinese ? 'cn' : 'en']}</p>
                    </Link>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </section>

        <section className='mt-8'>
          <div className='mb-4 flex items-end justify-between gap-4'>
            <div>
              <h2 className='text-2xl font-bold text-slate-950'>
                {isChinese ? '优先阅读的代表指南' : 'Priority guides to read first'}
              </h2>
              <p className='mt-2 max-w-3xl text-sm leading-6 text-slate-600'>
                {isChinese
                  ? '这些页是当前目录里最值得先读的一批，适合作为 Google 和用户都能理解的核心入口。'
                  : 'These are the strongest editorial entry points in the directory right now and the best guides to lead both users and search crawlers deeper.'}
              </p>
            </div>
          </div>
          <div className='grid gap-4 md:grid-cols-2 xl:grid-cols-3'>
            {featuredGuides.slice(0, 9).map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className='group rounded-[18px] border border-slate-200 bg-white p-6 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md'
              >
                <div className='flex items-center justify-between gap-3'>
                  <div>
                    <h3 className='text-lg font-semibold text-slate-950'>
                      {item.title[isChinese ? 'cn' : 'en']}
                    </h3>
                    <p className='mt-2 text-sm leading-6 text-slate-600'>
                      {item.desc[isChinese ? 'cn' : 'en']}
                    </p>
                  </div>
                  <ArrowRight className='size-5 shrink-0 text-slate-400 transition group-hover:translate-x-0.5 group-hover:text-slate-700' />
                </div>
              </Link>
            ))}
          </div>
        </section>

        <section className='mt-8 grid gap-4 md:grid-cols-2 xl:grid-cols-3'>
          {GUIDE_PAGES.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className='group rounded-[18px] border border-slate-200 bg-white p-6 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md'
            >
              <div className='flex items-center justify-between gap-3'>
                <div>
                  <h2 className='text-lg font-semibold text-slate-950'>
                    {item.title[isChinese ? 'cn' : 'en']}
                  </h2>
                  <p className='mt-2 text-sm leading-6 text-slate-600'>
                    {item.desc[isChinese ? 'cn' : 'en']}
                  </p>
                </div>
                <ArrowRight className='size-5 shrink-0 text-slate-400 transition group-hover:translate-x-0.5 group-hover:text-slate-700' />
              </div>
            </Link>
          ))}
        </section>

        <section className='mt-8 rounded-[18px] border border-slate-200 bg-slate-50 p-6 shadow-sm lg:p-8'>
          <div className='flex items-start gap-3'>
            <CheckCircle2 className='mt-1 size-5 shrink-0 text-emerald-600' />
            <div>
              <h2 className='text-xl font-semibold text-slate-950'>
                {isChinese ? '读完指南后，下一步去哪' : 'Where to go after reading guides'}
              </h2>
              <p className='mt-2 text-sm leading-6 text-slate-600'>
                {isChinese
                  ? '如果你已经通过指南缩小了范围，就回到目录页、分类页和本周新增页继续做真实比较。'
                  : 'Once the guides help narrow your choices, move back into the directory, category pages, and weekly additions for real comparisons.'}
              </p>
            </div>
          </div>

          <div className='mt-6 grid gap-3 md:grid-cols-3'>
            <Link
              href='/explore?sort=popular'
              className='rounded-lg border border-slate-200 bg-white p-4 transition hover:border-cyan-200 hover:bg-cyan-50/40'
            >
              <p className='text-sm font-semibold text-slate-950'>{isChinese ? '进入 Explore' : 'Open Explore'}</p>
              <p className='mt-2 text-sm leading-6 text-slate-600'>
                {isChinese ? '带着已经想清楚的标准回到总目录继续筛。' : 'Return to the full directory with clearer criteria.'}
              </p>
            </Link>
            <Link
              href='/categories/productivity?sort=popular'
              className='rounded-lg border border-slate-200 bg-white p-4 transition hover:border-cyan-200 hover:bg-cyan-50/40'
            >
              <p className='text-sm font-semibold text-slate-950'>
                {isChinese ? '看生产力主分类' : 'Open the productivity category'}
              </p>
              <p className='mt-2 text-sm leading-6 text-slate-600'>
                {isChinese ? '从最成熟的一批工作流分类开始做比较。' : 'Start comparing inside one of the strongest workflow categories.'}
              </p>
            </Link>
            <Link
              href='/new'
              className='rounded-lg border border-slate-200 bg-white p-4 transition hover:border-cyan-200 hover:bg-cyan-50/40'
            >
              <p className='text-sm font-semibold text-slate-950'>{isChinese ? '回到本周新增' : 'Return to New this week'}</p>
              <p className='mt-2 text-sm leading-6 text-slate-600'>
                {isChinese ? '顺手看看最近新补进的内容有没有更合适的候选。' : 'Check whether recent additions introduced a better-fit candidate.'}
              </p>
            </Link>
          </div>
        </section>
      </div>
    </>
  );
}
