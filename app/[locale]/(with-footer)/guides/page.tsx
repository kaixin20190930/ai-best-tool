import type { Metadata } from 'next';
import Link from 'next/link';
import { ArrowRight, BookOpen, CheckCircle2, Compass, GitCompareArrows, Sparkles } from 'lucide-react';

import { INDEXABLE_GUIDE_PAGES, type GuidePageConfig } from '@/lib/content/guides';
import { topListTopics } from '@/lib/data/topLists';
import { BASE_URL } from '@/lib/env';
import { buildLocalizedPageMetadata, generateLocalizedPath } from '@/lib/seo/metadata';
import TrackableCtaLink from '@/components/analytics/TrackableCtaLink';
import GuideEvidencePanel from '@/components/guides/GuideEvidencePanel';
import SeoBreadcrumbs from '@/components/seo/SeoBreadcrumbs';

export async function generateMetadata({ params: { locale } }: { params: { locale: string } }): Promise<Metadata> {
  const isChinese = locale === 'cn' || locale === 'tw';

  return buildLocalizedPageMetadata({
    locale,
    path: '/guides',
    title: isChinese ? 'AI 工具选择指南 | AI Best Tool' : 'AI Tool Selection Guides | AI Best Tool',
    description: isChinese
      ? '按任务阅读经过筛选的 AI 工具指南，再进入可索引榜单、分类和工具详情页完成判断。'
      : 'Read curated AI tool guides by task, then continue into indexable rankings, categories, and tool profiles to make a decision.',
    baseUrl: BASE_URL,
  });
}

function GuideCard({ guide, isChinese, locale }: { guide: GuidePageConfig; isChinese: boolean; locale: string }) {
  return (
    <Link
      href={generateLocalizedPath(guide.href, locale)}
      className='group rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition hover:-translate-y-0.5 hover:border-cyan-200 hover:shadow-md'
    >
      <p className='text-base font-semibold text-slate-950'>{guide.title[isChinese ? 'cn' : 'en']}</p>
      <p className='mt-2 text-sm leading-6 text-slate-600'>{guide.desc[isChinese ? 'cn' : 'en']}</p>
      <span className='mt-4 inline-flex items-center gap-1 text-sm font-semibold text-cyan-700'>
        {isChinese ? '阅读指南' : 'Read guide'}
        <ArrowRight className='size-4 transition group-hover:translate-x-0.5' />
      </span>
    </Link>
  );
}

export default function GuidesPage({ params: { locale } }: { params: { locale: string } }) {
  const isChinese = locale === 'cn' || locale === 'tw';
  const guideByHref = new Map(INDEXABLE_GUIDE_PAGES.map((guide) => [guide.href, guide]));
  const pickGuides = (hrefs: string[]) =>
    hrefs.map((href) => guideByHref.get(href)).filter((guide): guide is GuidePageConfig => Boolean(guide));
  const startHere = pickGuides([
    '/guides/how-to-choose-ai-tools',
    '/guides/free-ai-tools',
    '/guides/best-free-ai-tools',
    '/guides/ai-productivity-tools',
  ]);
  const guideGroups = [
    {
      title: isChinese ? '写作与创作' : 'Writing and creation',
      description: isChinese ? '从写作、图像到视频工作流。' : 'From writing and images to video workflows.',
      guides: pickGuides([
        '/guides/ai-writing-tools',
        '/guides/ai-image-tools',
        '/guides/ai-video-tools',
        '/guides/ai-note-taking-tools',
      ]),
    },
    {
      title: isChinese ? '开发与自动化' : 'Development and automation',
      description: isChinese ? '面向编码、API 和重复流程。' : 'For coding, APIs, and repeatable workflows.',
      guides: pickGuides([
        '/guides/ai-coding-tools',
        '/guides/ai-tools-for-developers',
        '/guides/ai-tools-for-automation',
        '/guides/ai-chatbot-tools',
      ]),
    },
    {
      title: isChinese ? '研究与 Web3' : 'Research and Web3',
      description: isChinese ? '面向资料发现、证据与链上研究。' : 'For discovery, evidence, and on-chain research.',
      guides: pickGuides(['/guides/ai-tools-for-research', '/guides/ai-tools-for-web3', '/guides/ai-tools-for-voice']),
    },
    {
      title: isChinese ? '增长与商业' : 'Growth and business',
      description: isChinese ? '面向 SEO、营销、销售和效率。' : 'For SEO, marketing, sales, and productivity.',
      guides: pickGuides([
        '/guides/ai-seo-tools',
        '/guides/ai-tools-for-marketing',
        '/guides/ai-tools-for-sales',
        '/guides/ai-productivity-tools',
      ]),
    },
  ];
  const priorityTopicKeys = [
    'ai-coding-tools',
    'ai-agent-tools',
    'ai-research-tools',
    'ai-automation-tools',
    'ai-content-creation-tools',
    'ai-video-tools',
  ];
  const priorityTopics = priorityTopicKeys
    .map((key) => topListTopics.find((topic) => topic.key === key))
    .filter((topic): topic is (typeof topListTopics)[number] => Boolean(topic));
  const categoryPaths = [
    {
      href: '/categories/productivity',
      title: isChinese ? '生产力工具' : 'Productivity tools',
      description: isChinese
        ? '会议、计划、协作和日常效率。'
        : 'Meetings, planning, collaboration, and daily efficiency.',
    },
    {
      href: '/categories/developer-tools',
      title: isChinese ? '开发者工具' : 'Developer tools',
      description: isChinese ? 'API、模型接入、调试和自动化。' : 'APIs, model access, debugging, and automation.',
    },
    {
      href: '/categories/research',
      title: isChinese ? '研究工具' : 'Research tools',
      description: isChinese
        ? '资料发现、来源整理和证据核对。'
        : 'Discovery, source organization, and evidence checks.',
    },
    {
      href: '/categories/web3',
      title: 'Web3',
      description: isChinese
        ? '链上分析、协议研究和基础设施。'
        : 'On-chain analysis, protocol research, and infrastructure.',
    },
  ];

  return (
    <div className='theme-page mx-auto max-w-6xl px-4 py-8 lg:px-6 lg:py-12'>
      <SeoBreadcrumbs
        locale={locale}
        items={[
          { name: isChinese ? '首页' : 'Home', path: '/' },
          { name: isChinese ? '指南总览' : 'Guides', path: '/guides' },
        ]}
        className='mb-5'
      />

      <section className='overflow-hidden rounded-[28px] border border-slate-200 bg-white shadow-sm'>
        <div className='grid lg:grid-cols-[1.08fr_0.92fr]'>
          <div className='bg-gradient-to-br from-slate-950 via-slate-900 to-cyan-950 p-7 text-white lg:p-10'>
            <div className='inline-flex items-center gap-2 rounded-full bg-white/10 px-3 py-1 text-sm font-semibold text-cyan-100 ring-1 ring-white/10'>
              <BookOpen className='size-4' />
              {isChinese ? '任务型选择指南' : 'Task-led selection guides'}
            </div>
            <h1 className='mt-5 max-w-3xl text-3xl font-bold tracking-tight lg:text-5xl'>
              {isChinese ? '先建立判断标准，再打开工具列表' : 'Set your decision criteria before opening a tool list'}
            </h1>
            <p className='mt-4 max-w-2xl text-base leading-7 text-slate-200 lg:text-lg'>
              {isChinese
                ? '这里不再把几十个相似对比页堆在第一层。先选任务，再进入可索引指南、榜单、分类和真实工具详情。'
                : 'This hub no longer puts dozens of similar comparison pages at the first layer. Choose the task, then continue into indexable guides, rankings, categories, and real tool profiles.'}
            </p>
            <div className='mt-7 flex flex-wrap gap-3'>
              <TrackableCtaLink
                href={generateLocalizedPath('/guides/how-to-choose-ai-tools', locale)}
                ctaId='guides_hub_choose_method'
                ctaLabel='Guides hub selection method'
                pageType='guide'
                className='inline-flex items-center gap-2 rounded-lg bg-cyan-400 px-5 py-3 text-sm font-semibold text-slate-950 hover:bg-cyan-300'
              >
                {isChinese ? '先看怎么选' : 'Start with how to choose'}
                <ArrowRight className='size-4' />
              </TrackableCtaLink>
              <TrackableCtaLink
                href={generateLocalizedPath('/explore', locale)}
                ctaId='guides_hub_explore'
                ctaLabel='Guides hub explore directory'
                pageType='guide'
                className='inline-flex items-center gap-2 rounded-lg border border-white/20 bg-white/10 px-5 py-3 text-sm font-semibold text-white hover:bg-white/15'
              >
                {isChinese ? '直接探索目录' : 'Explore the directory'}
                <Compass className='size-4' />
              </TrackableCtaLink>
            </div>
          </div>

          <div className='bg-slate-50 p-7 lg:p-10'>
            <p className='text-sm font-semibold uppercase tracking-wide text-cyan-700'>
              {isChinese ? '推荐顺序' : 'Recommended order'}
            </p>
            <div className='mt-4 space-y-3'>
              {[
                isChinese ? '1. 明确任务和不能接受的限制' : '1. Define the task and unacceptable limits',
                isChinese ? '2. 用指南建立选择标准' : '2. Use a guide to set criteria',
                isChinese ? '3. 用榜单或分类缩小候选' : '3. Narrow candidates with a ranking or category',
                isChinese
                  ? '4. 在工具详情核对价格、证据和变化'
                  : '4. Verify pricing, evidence, and changes on tool profiles',
              ].map((step) => (
                <div key={step} className='flex gap-3 rounded-xl border border-slate-200 bg-white p-4'>
                  <CheckCircle2 className='mt-0.5 size-5 shrink-0 text-emerald-600' />
                  <p className='text-sm font-medium leading-6 text-slate-700'>{step}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      <GuideEvidencePanel
        locale={locale}
        checkedAt='2026-09-02'
        scope={
          isChinese
            ? '总入口只把可索引指南、榜单、分类和工具实体放在主路径；noindex comparison 仅保留一个明确的次级入口。'
            : 'Primary paths now use only indexable guides, rankings, categories, and tool entities; one clearly secondary noindex comparison path remains.'
        }
        items={[
          {
            label: isChinese ? '可索引指南' : 'Indexable guides',
            value: `${INDEXABLE_GUIDE_PAGES.length}`,
            note: isChinese ? '与 sitemap 使用同一份白名单。' : 'Uses the same allowlist as the sitemap.',
          },
          {
            label: isChinese ? '首要 comparison' : 'Primary comparison links',
            value: '0',
            note: isChinese
              ? '首屏和主要卡片不再导向 noindex 页面。'
              : 'Hero and primary cards no longer point to noindex pages.',
          },
          {
            label: isChinese ? '次级 comparison' : 'Secondary comparison links',
            value: '1',
            note: isChinese
              ? '只作为用户明确需要并排比较时的辅助入口。'
              : 'Kept only for an explicit side-by-side need.',
          },
        ]}
        decisionSteps={[
          isChinese ? '先从任务指南建立标准。' : 'Start with a task guide to set criteria.',
          isChinese ? '再进入榜单或分类缩小候选。' : 'Then narrow candidates through a ranking or category.',
          isChinese ? '最后到工具页核对真实信息。' : 'Finally verify real information on tool profiles.',
        ]}
      />

      <section className='mt-8'>
        <p className='text-sm font-semibold uppercase tracking-wide text-cyan-700'>
          {isChinese ? '从这里开始' : 'Start here'}
        </p>
        <h2 className='mt-1 text-2xl font-bold text-slate-950'>
          {isChinese ? '先解决最常见的选择问题' : 'Solve the most common selection questions first'}
        </h2>
        <div className='mt-5 grid gap-4 md:grid-cols-2 xl:grid-cols-4'>
          {startHere.map((guide) => (
            <GuideCard key={guide.href} guide={guide} isChinese={isChinese} locale={locale} />
          ))}
        </div>
      </section>

      <section className='mt-10 space-y-6'>
        {guideGroups.map((group) => (
          <div key={group.title} className='rounded-[20px] border border-slate-200 bg-slate-50 p-5 lg:p-6'>
            <h2 className='text-xl font-bold text-slate-950'>{group.title}</h2>
            <p className='mt-1 text-sm leading-6 text-slate-600'>{group.description}</p>
            <div className='mt-4 grid gap-4 md:grid-cols-2 xl:grid-cols-4'>
              {group.guides.map((guide) => (
                <GuideCard key={guide.href} guide={guide} isChinese={isChinese} locale={locale} />
              ))}
            </div>
          </div>
        ))}
      </section>

      <section className='mt-10 rounded-[20px] border border-cyan-100 bg-cyan-50/70 p-6'>
        <p className='text-sm font-semibold uppercase tracking-wide text-cyan-800'>
          {isChinese ? '进入榜单' : 'Continue to rankings'}
        </p>
        <h2 className='mt-1 text-2xl font-bold text-slate-950'>
          {isChinese
            ? '任务已经明确时，用榜单快速缩小范围'
            : 'When the task is clear, use rankings to narrow the field'}
        </h2>
        <div className='mt-5 grid gap-3 md:grid-cols-2 xl:grid-cols-3'>
          {priorityTopics.map((topic) => (
            <Link
              key={topic.key}
              href={generateLocalizedPath(`/best-ai-tools/${topic.key}`, locale)}
              className='rounded-xl border border-white bg-white p-4 shadow-sm hover:border-cyan-200'
            >
              <p className='font-semibold text-slate-950'>{topic.title}</p>
              <p className='mt-2 text-sm leading-6 text-slate-600'>{topic.summary}</p>
              <span className='mt-3 inline-flex items-center gap-1 text-sm font-semibold text-cyan-700'>
                {isChinese ? '打开榜单' : 'Open ranking'} <ArrowRight className='size-4' />
              </span>
            </Link>
          ))}
        </div>
      </section>

      <section className='mt-10 rounded-[20px] border border-slate-200 bg-white p-6 shadow-sm'>
        <p className='text-sm font-semibold uppercase tracking-wide text-cyan-700'>
          {isChinese ? '进入分类' : 'Continue to categories'}
        </p>
        <h2 className='mt-1 text-2xl font-bold text-slate-950'>
          {isChinese ? '按稳定分类浏览真实工具实体' : 'Browse real tool entities through stable categories'}
        </h2>
        <div className='mt-5 grid gap-4 md:grid-cols-2 xl:grid-cols-4'>
          {categoryPaths.map((category) => (
            <Link
              key={category.href}
              href={generateLocalizedPath(category.href, locale)}
              className='rounded-xl border border-slate-200 bg-slate-50 p-4 hover:border-cyan-200 hover:bg-cyan-50/50'
            >
              <p className='font-semibold text-slate-950'>{category.title}</p>
              <p className='mt-2 text-sm leading-6 text-slate-600'>{category.description}</p>
            </Link>
          ))}
        </div>
      </section>

      <section className='mt-8 flex flex-col gap-4 rounded-[18px] border border-slate-200 bg-slate-50 p-5 sm:flex-row sm:items-center sm:justify-between'>
        <div className='flex gap-3'>
          <GitCompareArrows className='mt-1 size-5 shrink-0 text-slate-500' />
          <div>
            <h2 className='font-semibold text-slate-950'>
              {isChinese ? '已经明确要并排比较编程工具？' : 'Already need a side-by-side coding comparison?'}
            </h2>
            <p className='mt-1 text-sm leading-6 text-slate-600'>
              {isChinese
                ? '这是辅助决策入口，不是搜索主干；看完后请回到工具详情核对事实。'
                : 'This is a secondary decision aid, not a search backbone. Return to tool profiles to verify facts.'}
            </p>
          </div>
        </div>
        <Link
          href={generateLocalizedPath('/guides/ai-coding-tools-comparison', locale)}
          className='inline-flex shrink-0 items-center justify-center gap-2 rounded-lg border border-slate-300 bg-white px-4 py-2.5 text-sm font-semibold text-slate-700 hover:border-cyan-300'
        >
          {isChinese ? '打开次级对比' : 'Open secondary comparison'}
          <ArrowRight className='size-4' />
        </Link>
      </section>

      <section className='mt-8 rounded-[18px] border border-slate-200 bg-white p-6 shadow-sm'>
        <div className='flex items-start gap-3'>
          <Sparkles className='mt-1 size-5 shrink-0 text-cyan-700' />
          <div>
            <h2 className='text-xl font-semibold text-slate-950'>
              {isChinese ? '你在维护自己的 AI 工具？' : 'Maintaining your own AI tool?'}
            </h2>
            <p className='mt-2 text-sm leading-6 text-slate-600'>
              {isChinese
                ? '先查看收录标准，再提交真实定价、限制、截图和更新记录。'
                : 'Review the listing standard, then submit real pricing, limits, screenshots, and update history.'}
            </p>
            <TrackableCtaLink
              href={generateLocalizedPath('/submit', locale)}
              ctaId='guides_hub_submit'
              ctaLabel='Guides hub submit tool'
              pageType='guide'
              className='mt-4 inline-flex items-center gap-2 rounded-lg bg-slate-950 px-4 py-3 text-sm font-semibold text-white hover:bg-slate-800'
            >
              {isChinese ? '提交工具' : 'Submit a tool'}
              <ArrowRight className='size-4' />
            </TrackableCtaLink>
          </div>
        </div>
      </section>
    </div>
  );
}
