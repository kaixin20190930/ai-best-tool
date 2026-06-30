import { Metadata } from 'next';
import { ArrowRight, BookOpen, CheckCircle2, Sparkles } from 'lucide-react';
import { getTranslations } from 'next-intl/server';

import { FEATURED_GUIDE_HREFS, GUIDE_PAGES } from '@/lib/content/guides';
import { topListTopics } from '@/lib/data/topLists';
import { generateBreadcrumbSchema } from '@/lib/seo/schema';
import TrackableCtaLink from '@/components/analytics/TrackableCtaLink';
import { StructuredDataServer } from '@/components/seo/StructuredData';
import { Link } from '@/app/navigation';

export async function generateMetadata({ params: { locale } }: { params: { locale: string } }): Promise<Metadata> {
  const t = await getTranslations({
    locale,
    namespace: 'Metadata.home',
  });

  return {
    title: locale === 'cn' || locale === 'tw' ? 'AI 指南总览 | AI Best Tool' : `AI guides hub | ${t('title')}`,
    description:
      locale === 'cn' || locale === 'tw'
        ? '汇总 AI 工具选型、免费工具和各类场景指南。'
        : 'A hub for AI tool selection, free tools, and use-case guides.',
  };
}

export default async function Page({ params: { locale } }: { params: { locale: string } }) {
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
    '/guides/ai-tools-for-marketing',
    '/guides/ai-tools-for-marketing-comparison',
    '/guides/ai-tools-for-voice',
    '/guides/ai-tools-for-voice-comparison',
    '/guides/ai-tools-for-automation',
    '/guides/ai-tools-for-agents',
    '/guides/ai-tools-for-agents-comparison',
    '/guides/ai-tools-for-lead-generation',
    '/guides/ai-tools-for-sales-prospecting',
  ]
    .map((href) => pickGuide(href))
    .filter((item): item is (typeof GUIDE_PAGES)[number] => Boolean(item));
  const web3Guides = [
    '/guides/ai-tools-for-web3',
    '/guides/ai-tools-for-web3-analysis',
    '/guides/ai-tools-for-crypto-research',
    '/guides/ai-tools-for-token-research',
    '/guides/ai-tools-for-on-chain-analysis',
  ]
    .map((href) => pickGuide(href))
    .filter((item): item is (typeof GUIDE_PAGES)[number] => Boolean(item));
  const commercialGuides = [
    '/guides/ai-tools-for-content-creation',
    '/guides/ai-tools-for-content-creation-comparison',
    '/guides/ai-tools-for-marketing',
    '/guides/ai-tools-for-marketing-comparison',
    '/guides/ai-tools-for-sales',
    '/guides/ai-tools-for-sales-comparison',
    '/guides/ai-tools-for-lead-generation',
    '/guides/ai-tools-for-lead-generation-comparison',
    '/guides/ai-tools-for-sales-prospecting',
    '/guides/ai-tools-for-sales-prospecting-comparison',
    '/guides/ai-tools-for-prompt-testing',
    '/guides/ai-tools-for-prompt-testing-comparison',
    '/guides/ai-tools-for-evals',
    '/guides/ai-tools-for-evals-comparison',
  ]
    .map((href) => pickGuide(href))
    .filter((item): item is (typeof GUIDE_PAGES)[number] => Boolean(item));
  const supportGuides = [
    '/guides/ai-tools-for-customer-support',
    '/guides/ai-tools-for-customer-support-comparison',
    '/guides/ai-chatbot-tools-comparison',
    '/guides/ai-tools-for-automation-comparison',
  ]
    .map((href) => pickGuide(href))
    .filter((item): item is (typeof GUIDE_PAGES)[number] => Boolean(item));
  const meetingVoiceGuides = [
    '/guides/ai-tools-for-meeting-notes',
    '/guides/ai-tools-for-meeting-notes-comparison',
    '/guides/ai-tools-for-voice',
    '/guides/ai-tools-for-voice-comparison',
  ]
    .map((href) => pickGuide(href))
    .filter((item): item is (typeof GUIDE_PAGES)[number] => Boolean(item));
  const growthGuides = [
    '/guides/ai-tools-for-marketing',
    '/guides/ai-tools-for-marketing-comparison',
    '/guides/ai-tools-for-sales',
    '/guides/ai-tools-for-sales-comparison',
    '/guides/ai-tools-for-lead-generation',
    '/guides/ai-tools-for-lead-generation-comparison',
  ]
    .map((href) => pickGuide(href))
    .filter((item): item is (typeof GUIDE_PAGES)[number] => Boolean(item));
  const researchDevGuides = [
    '/guides/ai-tools-for-research',
    '/guides/ai-tools-for-research-comparison',
    '/guides/ai-tools-for-developers',
    '/guides/ai-tools-for-developers-comparison',
    '/guides/ai-tools-for-api-observability',
    '/guides/ai-tools-for-api-observability-comparison',
    '/guides/ai-tools-for-model-routing',
    '/guides/ai-tools-for-model-routing-comparison',
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

          <div className='mt-6 flex flex-wrap gap-3'>
            <TrackableCtaLink
              href='/guides/ai-coding-tools-comparison'
              ctaId='guides_hub_coding_comparison'
              ctaLabel='Guides hub coding comparison'
              pageType='guide'
              className='inline-flex items-center justify-center gap-2 rounded-lg bg-cyan-700 px-4 py-3 text-sm font-semibold text-white hover:bg-cyan-800'
            >
              {isChinese ? '先看编程对比' : 'Start with coding comparison'}
              <ArrowRight className='size-4' />
            </TrackableCtaLink>
            <TrackableCtaLink
              href='/guides/ai-tools-for-research-comparison'
              ctaId='guides_hub_research_comparison'
              ctaLabel='Guides hub research comparison'
              pageType='guide'
              className='inline-flex items-center justify-center gap-2 rounded-lg border border-slate-200 bg-white px-4 py-3 text-sm font-semibold text-slate-700 hover:bg-slate-50'
            >
              {isChinese ? '看研究对比' : 'Open research comparison'}
              <ArrowRight className='size-4' />
            </TrackableCtaLink>
            <TrackableCtaLink
              href='/submit'
              ctaId='guides_hub_submit'
              ctaLabel='Guides hub submit'
              pageType='guide'
              className='inline-flex items-center justify-center gap-2 rounded-lg border border-cyan-200 bg-cyan-50 px-4 py-3 text-sm font-semibold text-cyan-800 hover:bg-cyan-100'
            >
              {isChinese ? '提交你的工具' : 'Submit your tool'}
              <ArrowRight className='size-4' />
            </TrackableCtaLink>
            <TrackableCtaLink
              href='/developer/listing'
              ctaId='guides_hub_claim'
              ctaLabel='Guides hub claim'
              pageType='guide'
              className='inline-flex items-center justify-center gap-2 rounded-lg border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm font-semibold text-emerald-800 hover:bg-emerald-100'
            >
              {isChinese ? '认领条目' : 'Claim listing'}
              <ArrowRight className='size-4' />
            </TrackableCtaLink>
          </div>

          <div className='mt-6 rounded-2xl border border-cyan-100 bg-cyan-50/70 p-5'>
            <div className='flex flex-col gap-2 lg:flex-row lg:items-end lg:justify-between'>
              <div>
                <p className='text-sm font-semibold uppercase tracking-wide text-cyan-800'>
                  {isChinese ? '优先对比入口' : 'Priority comparison paths'}
                </p>
                <h2 className='mt-1 text-xl font-bold text-slate-950'>
                  {isChinese
                    ? '先看这四个最容易转化的比较页'
                    : 'Start with the four most conversion-friendly comparisons'}
                </h2>
              </div>
              <p className='max-w-2xl text-sm leading-6 text-slate-600'>
                {isChinese
                  ? '如果用户已经有明确方向，先看对比页通常比先看总指南更快接近决策。'
                  : 'When the user already has a direction, comparison pages usually get to a decision faster than a broad guide.'}
              </p>
            </div>
            <div className='mt-4 grid gap-3 md:grid-cols-2 xl:grid-cols-4'>
              {[
                {
                  href: '/guides/ai-tools-for-content-creation-comparison',
                  title: isChinese ? 'AI 内容创作工具对比' : 'AI content creation tools comparison',
                  desc: isChinese
                    ? '适合先看脚本、封面和多渠道发布差异。'
                    : 'Best for scripts, thumbnails, and multi-channel publishing differences.',
                },
                {
                  href: '/guides/ai-coding-tools-comparison',
                  title: isChinese ? 'AI 编程工具对比' : 'AI coding tools comparison',
                  desc: isChinese
                    ? '适合先看编码、调试和重构差异。'
                    : 'Best for coding, debugging, and refactoring differences.',
                },
                {
                  href: '/guides/ai-tools-for-agents-comparison',
                  title: isChinese ? 'AI Agent 工具对比' : 'AI agent tools comparison',
                  desc: isChinese
                    ? '适合看执行、调用和控制差异。'
                    : 'Best for execution, tool use, and control differences.',
                },
                {
                  href: '/guides/ai-tools-for-api-observability-comparison',
                  title: isChinese ? 'AI API 可观测性工具对比' : 'AI API observability tools comparison',
                  desc: isChinese ? '适合看日志、追踪和成本可见度。' : 'Best for logs, tracing, and cost visibility.',
                },
                {
                  href: '/guides/ai-tools-for-model-routing-comparison',
                  title: isChinese ? 'AI 模型路由工具对比' : 'AI model routing tools comparison',
                  desc: isChinese
                    ? '适合看多模型接入、回退与治理。'
                    : 'Best for model access, fallbacks, and governance.',
                },
                {
                  href: '/guides/ai-video-tools-comparison',
                  title: isChinese ? 'AI 视频工具对比' : 'AI video tools comparison',
                  desc: isChinese
                    ? '适合看生成、剪辑和成片流程。'
                    : 'Best for generation, editing, and final output workflows.',
                },
                {
                  href: '/guides/ai-tools-for-research-comparison',
                  title: isChinese ? 'AI 研究工具对比' : 'AI research tools comparison',
                  desc: isChinese ? '适合先看来源、证据和检索。' : 'Best for sources, evidence, and retrieval.',
                },
                {
                  href: '/guides/ai-writing-tools-comparison',
                  title: isChinese ? 'AI 写作工具对比' : 'AI writing tools comparison',
                  desc: isChinese ? '适合先看起草、改写和编辑。' : 'Best for drafting, rewriting, and editing.',
                },
              ].map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  className='rounded-xl border border-cyan-100 bg-white p-4 transition hover:border-cyan-300 hover:bg-white hover:shadow-sm'
                >
                  <p className='text-sm font-semibold text-slate-950'>{item.title}</p>
                  <p className='mt-2 text-sm leading-6 text-slate-600'>{item.desc}</p>
                </Link>
              ))}
            </div>
          </div>

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
              <p className='text-sm font-semibold text-slate-950'>{isChinese ? '进入 Web3 分类' : 'Open Web3'}</p>
              <p className='mt-2 text-sm leading-6 text-slate-600'>
                {isChinese
                  ? '如果你更关心链上研究和分析，这里是最聚焦的入口。'
                  : 'The sharpest entry point for on-chain analysis, research, and infra workflows.'}
              </p>
            </Link>
          </div>
        </section>

        <section className='mt-8 rounded-[18px] border border-slate-200 bg-white p-6 shadow-sm lg:p-8'>
          <div className='flex flex-col gap-2 lg:flex-row lg:items-end lg:justify-between'>
            <div>
              <p className='text-sm font-semibold uppercase tracking-wide text-cyan-700'>
                {isChinese ? '客服与运营路径' : 'Support and operations paths'}
              </p>
              <h2 className='mt-1 text-2xl font-bold text-slate-950'>
                {isChinese
                  ? '如果你的业务里有客服和分流，这几页最值得先看'
                  : 'If support and triage matter in your business, start with these pages'}
              </h2>
            </div>
            <p className='max-w-3xl text-sm leading-6 text-slate-600'>
              {isChinese
                ? '客服场景通常和知识库、自动化和团队协作一起出现，单独看一页往往不够。'
                : 'Support work usually shows up alongside knowledge bases, automation, and team collaboration, so one page is rarely enough.'}
            </p>
          </div>

          <div className='mt-5 grid gap-3 md:grid-cols-2 xl:grid-cols-4'>
            {supportGuides.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className='group rounded-lg border border-slate-200 bg-slate-50 p-4 transition hover:border-cyan-200 hover:bg-cyan-50/60'
              >
                <div className='flex items-start justify-between gap-3'>
                  <div>
                    <p className='text-sm font-semibold text-slate-950'>{item.title[isChinese ? 'cn' : 'en']}</p>
                    <p className='mt-2 text-sm leading-6 text-slate-600'>{item.desc[isChinese ? 'cn' : 'en']}</p>
                  </div>
                  <ArrowRight className='mt-1 size-4 shrink-0 text-slate-400 transition group-hover:translate-x-0.5 group-hover:text-slate-700' />
                </div>
              </Link>
            ))}
          </div>
        </section>

        <section className='mt-8 rounded-[18px] border border-slate-200 bg-white p-6 shadow-sm lg:p-8'>
          <div className='flex flex-col gap-2 lg:flex-row lg:items-end lg:justify-between'>
            <div>
              <p className='text-sm font-semibold uppercase tracking-wide text-cyan-700'>
                {isChinese ? '会议与语音路径' : 'Meeting and voice paths'}
              </p>
              <h2 className='mt-1 text-2xl font-bold text-slate-950'>
                {isChinese
                  ? '如果你的工作围绕会议和声音，这几页最值得先看'
                  : 'If your work revolves around meetings and voice, start with these pages'}
              </h2>
            </div>
            <p className='max-w-3xl text-sm leading-6 text-slate-600'>
              {isChinese
                ? '会议记录和语音工具经常一起出现，先把这条链路补齐能更快把用户送到对比和榜单。'
                : 'Meeting notes and voice tools often show up together, and wiring this path helps move users faster into comparisons and rankings.'}
            </p>
          </div>

          <div className='mt-5 grid gap-3 md:grid-cols-2 xl:grid-cols-4'>
            {meetingVoiceGuides.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className='group rounded-lg border border-slate-200 bg-slate-50 p-4 transition hover:border-cyan-200 hover:bg-cyan-50/60'
              >
                <div className='flex items-start justify-between gap-3'>
                  <div>
                    <p className='text-sm font-semibold text-slate-950'>{item.title[isChinese ? 'cn' : 'en']}</p>
                    <p className='mt-2 text-sm leading-6 text-slate-600'>{item.desc[isChinese ? 'cn' : 'en']}</p>
                  </div>
                  <ArrowRight className='mt-1 size-4 shrink-0 text-slate-400 transition group-hover:translate-x-0.5 group-hover:text-slate-700' />
                </div>
              </Link>
            ))}
          </div>
        </section>

        <section className='mt-8 rounded-[18px] border border-slate-200 bg-white p-6 shadow-sm lg:p-8'>
          <div className='flex flex-col gap-2 lg:flex-row lg:items-end lg:justify-between'>
            <div>
              <p className='text-sm font-semibold uppercase tracking-wide text-cyan-700'>
                {isChinese ? '营销与销售路径' : 'Marketing and sales paths'}
              </p>
              <h2 className='mt-1 text-2xl font-bold text-slate-950'>
                {isChinese
                  ? '如果你的目标是增长和转化，这几页值得先看'
                  : 'If growth and conversion are the goal, start with these pages'}
              </h2>
            </div>
            <p className='max-w-3xl text-sm leading-6 text-slate-600'>
              {isChinese
                ? '营销、销售和获客通常连在一起，先把这几页放前面，用户更容易走到对比页和榜单页。'
                : 'Marketing, sales, and lead generation usually work together, and surfacing them early makes it easier to move users into comparison and ranking pages.'}
            </p>
          </div>

          <div className='mt-5 grid gap-3 md:grid-cols-2 xl:grid-cols-3'>
            {growthGuides.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className='group rounded-lg border border-slate-200 bg-slate-50 p-4 transition hover:border-cyan-200 hover:bg-cyan-50/60'
              >
                <div className='flex items-start justify-between gap-3'>
                  <div>
                    <p className='text-sm font-semibold text-slate-950'>{item.title[isChinese ? 'cn' : 'en']}</p>
                    <p className='mt-2 text-sm leading-6 text-slate-600'>{item.desc[isChinese ? 'cn' : 'en']}</p>
                  </div>
                  <ArrowRight className='mt-1 size-4 shrink-0 text-slate-400 transition group-hover:translate-x-0.5 group-hover:text-slate-700' />
                </div>
              </Link>
            ))}
          </div>
        </section>

        <section className='mt-8 rounded-[18px] border border-slate-200 bg-white p-6 shadow-sm lg:p-8'>
          <div className='flex flex-col gap-2 lg:flex-row lg:items-end lg:justify-between'>
            <div>
              <p className='text-sm font-semibold uppercase tracking-wide text-cyan-700'>
                {isChinese ? '研究与开发者路径' : 'Research and developer paths'}
              </p>
              <h2 className='mt-1 text-2xl font-bold text-slate-950'>
                {isChinese
                  ? '如果你的工作更偏研究和构建，这几页最值得先看'
                  : 'If your work is more about research and building, start with these pages'}
              </h2>
            </div>
            <p className='max-w-3xl text-sm leading-6 text-slate-600'>
              {isChinese
                ? '研究、API 可观测、模型路由和开发者工具通常一起出现，先把这条路径前置能更快引流到对比页。'
                : 'Research, API observability, model routing, and developer tools often show up together, and surfacing them early helps move users into comparison pages faster.'}
            </p>
          </div>

          <div className='mt-5 grid gap-3 md:grid-cols-2 xl:grid-cols-4'>
            {researchDevGuides.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className='group rounded-lg border border-slate-200 bg-slate-50 p-4 transition hover:border-cyan-200 hover:bg-cyan-50/60'
              >
                <div className='flex items-start justify-between gap-3'>
                  <div>
                    <p className='text-sm font-semibold text-slate-950'>{item.title[isChinese ? 'cn' : 'en']}</p>
                    <p className='mt-2 text-sm leading-6 text-slate-600'>{item.desc[isChinese ? 'cn' : 'en']}</p>
                  </div>
                  <ArrowRight className='mt-1 size-4 shrink-0 text-slate-400 transition group-hover:translate-x-0.5 group-hover:text-slate-700' />
                </div>
              </Link>
            ))}
          </div>
        </section>

        <section className='mt-8 rounded-[18px] border border-slate-200 bg-white p-6 shadow-sm lg:p-8'>
          <div className='flex flex-col gap-2 lg:flex-row lg:items-end lg:justify-between'>
            <div>
              <p className='text-sm font-semibold uppercase tracking-wide text-cyan-700'>
                {isChinese ? '优先收录入口' : 'Priority indexing paths'}
              </p>
              <h2 className='mt-1 text-2xl font-bold text-slate-950'>
                {isChinese
                  ? '先看最值得被搜索引擎理解的几页'
                  : 'Start with the pages search engines should understand first'}
              </h2>
            </div>
            <p className='max-w-3xl text-sm leading-6 text-slate-600'>
              {isChinese
                ? '这些页更适合作为目录站的主干信号：总选型、写作、SEO、开发者和 Web3。'
                : 'These pages are the strongest backbone signals for the directory: selection, writing, SEO, developers, and Web3.'}
            </p>
          </div>

          <div className='mt-5 grid gap-3 md:grid-cols-2 xl:grid-cols-4'>
            {[
              '/guides/how-to-choose-ai-tools',
              '/guides/ai-writing-tools',
              '/guides/ai-tools-for-content-creation',
              '/guides/ai-seo-tools',
              '/guides/ai-tools-for-developers',
              '/guides/ai-tools-for-agents',
              '/guides/ai-tools-for-web3',
              '/guides/ai-tools-for-research',
              '/guides/ai-tools-for-automation',
              '/guides/ai-tools-for-sales',
            ]
              .map((href) => pickGuide(href))
              .filter((item): item is (typeof GUIDE_PAGES)[number] => Boolean(item))
              .map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  className='group rounded-lg border border-slate-200 bg-slate-50 p-4 transition hover:border-cyan-200 hover:bg-cyan-50/60'
                >
                  <div className='flex items-start justify-between gap-3'>
                    <div>
                      <p className='text-sm font-semibold text-slate-950'>{item.title[isChinese ? 'cn' : 'en']}</p>
                      <p className='mt-2 text-sm leading-6 text-slate-600'>{item.desc[isChinese ? 'cn' : 'en']}</p>
                    </div>
                    <ArrowRight className='mt-1 size-4 shrink-0 text-slate-400 transition group-hover:translate-x-0.5 group-hover:text-slate-700' />
                  </div>
                </Link>
              ))}
          </div>
        </section>

        <section className='mt-8 rounded-[18px] border border-slate-200 bg-white p-6 shadow-sm lg:p-8'>
          <div className='flex flex-col gap-2 lg:flex-row lg:items-end lg:justify-between'>
            <div>
              <p className='text-sm font-semibold uppercase tracking-wide text-cyan-700'>
                {isChinese ? '高意图榜单' : 'High-intent top lists'}
              </p>
              <h2 className='mt-1 text-2xl font-bold text-slate-950'>
                {isChinese
                  ? '先用榜单缩小范围，再进入详情和提交'
                  : 'Use ranked lists to narrow the field before detail and submission'}
              </h2>
            </div>
            <p className='max-w-3xl text-sm leading-6 text-slate-600'>
              {isChinese
                ? '这几页更适合已经明确要找编程、视频、研究或写作工具的人，能更快把流量送进下一步。'
                : 'These pages fit visitors who already know they need coding, video, research, or writing tools and are ready to narrow down faster.'}
            </p>
          </div>

          <div className='mt-5 grid gap-3 md:grid-cols-2 xl:grid-cols-4'>
            {topListTopics.map((topic) => (
              <TrackableCtaLink
                key={topic.key}
                href={`/best-ai-tools/${topic.key}`}
                ctaId={`guides_hub_top_list_${topic.key}`}
                ctaLabel={topic.title}
                pageType='guide'
                className='rounded-lg border border-slate-200 bg-slate-50 p-4 text-left transition hover:border-cyan-200 hover:bg-cyan-50/60'
              >
                <p className='text-sm font-semibold text-slate-950'>{topic.title}</p>
                <p className='mt-2 text-sm leading-6 text-slate-600'>{topic.summary}</p>
                <p className='mt-3 inline-flex items-center gap-1 text-sm font-semibold text-cyan-700'>
                  {isChinese ? '进入榜单' : topic.ctaLabel}
                  <ArrowRight className='size-4' />
                </p>
              </TrackableCtaLink>
            ))}
          </div>
        </section>

        <section className='mt-8 rounded-[18px] border border-slate-200 bg-white p-6 shadow-sm lg:p-8'>
          <div className='flex flex-col gap-2 lg:flex-row lg:items-end lg:justify-between'>
            <div>
              <p className='text-sm font-semibold uppercase tracking-wide text-cyan-700'>
                {isChinese ? '核心分类入口' : 'Core category paths'}
              </p>
              <h2 className='mt-1 text-2xl font-bold text-slate-950'>
                {isChinese ? '先把最重要的分类页连起来' : 'Connect the most important category pages first'}
              </h2>
            </div>
            <p className='max-w-3xl text-sm leading-6 text-slate-600'>
              {isChinese
                ? '这些分类页是目录站的骨架，适合从指南页继续往下导。'
                : 'These category pages are the skeleton of the directory and the best place to send users after the guides.'}
            </p>
          </div>

          <div className='mt-5 grid gap-3 md:grid-cols-2 xl:grid-cols-3'>
            {[
              {
                href: '/categories/productivity?sort=popular',
                title: isChinese ? '生产力' : 'Productivity',
                desc: isChinese
                  ? '先从会议、计划、协作和日常效率类工具开始。'
                  : 'Start with meeting, planning, collaboration, and daily productivity tools.',
              },
              {
                href: '/categories/writing?sort=popular',
                title: isChinese ? '写作' : 'Writing',
                desc: isChinese
                  ? '适合内容创作、SEO、营销和编辑工作流。'
                  : 'A strong fit for content creation, SEO, marketing, and editing workflows.',
              },
              {
                href: '/categories/research?sort=popular',
                title: isChinese ? '研究' : 'Research',
                desc: isChinese
                  ? '适合资料检索、来源整理和更重研究型任务。'
                  : 'A better fit for source gathering, synthesis, and deeper research tasks.',
              },
              {
                href: '/categories/web3?sort=popular',
                title: 'Web3',
                desc: isChinese
                  ? '适合链上分析、协议研究和基础设施探索。'
                  : 'Best for on-chain analysis, protocol research, and infrastructure discovery.',
              },
              {
                href: '/categories/voice?sort=popular',
                title: isChinese ? '语音' : 'Voice',
                desc: isChinese
                  ? '适合转录、播客、配音和音频优先场景。'
                  : 'A better fit for transcription, podcasting, dubbing, and audio-first workflows.',
              },
              {
                href: '/categories/developer-tools?sort=popular',
                title: isChinese ? '开发者工具' : 'Developer tools',
                desc: isChinese
                  ? '适合 API、模型接入、调试和自动化。'
                  : 'A better fit for APIs, model access, debugging, and automation.',
              },
            ].map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className='group rounded-lg border border-slate-200 bg-slate-50 p-4 transition hover:border-cyan-200 hover:bg-cyan-50/60'
              >
                <div className='flex items-start justify-between gap-3'>
                  <div>
                    <p className='text-sm font-semibold text-slate-950'>{item.title}</p>
                    <p className='mt-2 text-sm leading-6 text-slate-600'>{item.desc}</p>
                  </div>
                  <ArrowRight className='mt-1 size-4 shrink-0 text-slate-400 transition group-hover:translate-x-0.5 group-hover:text-slate-700' />
                </div>
              </Link>
            ))}
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
                  ? '先看总选型，再按工作流或行业进入更具体的指南，最后回到分类页、榜单页或工具详情页做真实比较。'
                  : 'Start with selection logic, move into workflow or industry-specific guides, then return to categories, ranked lists, and tool pages for real comparisons.'}
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

        <section className='mt-8 grid gap-4 xl:grid-cols-2'>
          <div className='rounded-[18px] border border-slate-200 bg-white p-6 shadow-sm'>
            <p className='text-sm font-semibold uppercase tracking-wide text-cyan-700'>
              {isChinese ? 'Developer 高意图入口' : 'High-intent developer paths'}
            </p>
            <h2 className='mt-1 text-2xl font-bold text-slate-950'>
              {isChinese ? '开发者类流量，先导去这些页' : 'Best entry points for developer traffic'}
            </h2>
            <div className='mt-4 grid gap-3'>
              {[
                {
                  href: '/guides/ai-tools-for-developers-comparison',
                  title: isChinese ? '开发者工具总对比' : 'Developer tools comparison',
                  desc: isChinese
                    ? '适合还没确定自己更偏编辑器、API 还是基础设施的人。'
                    : 'Best when the user has not yet decided between editor, API, or infrastructure paths.',
                },
                {
                  href: '/guides/ai-coding-tools-comparison',
                  title: isChinese ? '编程工具对比' : 'Coding tools comparison',
                  desc: isChinese
                    ? '更适合补全、重构、调试和真实代码实现意图。'
                    : 'Higher intent for completion, refactoring, debugging, and real implementation work.',
                },
                {
                  href: '/guides/cursor-alternatives-comparison',
                  title: isChinese ? 'Cursor 替代方案对比' : 'Cursor alternatives comparison',
                  desc: isChinese
                    ? '更贴近编辑器内补全、重构和上下文协作。'
                    : 'Closer to editor-first completion, refactoring, and context-aware collaboration.',
                },
                {
                  href: '/guides/chatgpt-alternatives-comparison',
                  title: isChinese ? 'ChatGPT 替代方案对比' : 'ChatGPT alternatives comparison',
                  desc: isChinese
                    ? '更适合聊天、写作、研究和多模型切换的候选。'
                    : 'Better for chat, writing, research, and multi-model switching candidates.',
                },
                {
                  href: '/guides/claude-alternatives-comparison',
                  title: isChinese ? 'Claude 替代方案对比' : 'Claude alternatives comparison',
                  desc: isChinese
                    ? '更适合长上下文、分析和代码理解。'
                    : 'Better for long context, analysis, and code understanding.',
                },
                {
                  href: '/guides/gemini-alternatives-comparison',
                  title: isChinese ? 'Gemini 替代方案对比' : 'Gemini alternatives comparison',
                  desc: isChinese
                    ? '更适合 Google 生态、移动入口和多设备切换。'
                    : 'Better for Google ecosystem, mobile entry, and multi-device switching.',
                },
                {
                  href: '/guides/poe-alternatives-comparison',
                  title: isChinese ? 'Poe 替代方案对比' : 'Poe alternatives comparison',
                  desc: isChinese
                    ? '更适合多模型聚合和并排比较。'
                    : 'Better for multi-model aggregation and side-by-side comparison.',
                },
                {
                  href: '/guides/sora-alternatives-comparison',
                  title: isChinese ? 'Sora 替代方案对比' : 'Sora alternatives comparison',
                  desc: isChinese
                    ? '更适合视频生成、角色运动和多模态工作流。'
                    : 'Better for video generation, character motion, and multimodal workflows.',
                },
                {
                  href: '/guides/adobe-alternatives-comparison',
                  title: isChinese ? 'Adobe 替代方案对比' : 'Adobe alternatives comparison',
                  desc: isChinese
                    ? '更适合创作套件、视觉资产和内容生产。'
                    : 'Better for creative suites, visual assets, and content production.',
                },
                {
                  href: '/guides/notion-alternatives-comparison',
                  title: isChinese ? 'Notion 替代方案对比' : 'Notion alternatives comparison',
                  desc: isChinese
                    ? '更适合知识库、文档协作和工作区管理。'
                    : 'Better for knowledge bases, document collaboration, and workspace management.',
                },
                {
                  href: '/guides/character-ai-alternatives-comparison',
                  title: isChinese ? 'Character AI 替代方案对比' : 'Character AI alternatives comparison',
                  desc: isChinese
                    ? '更适合角色对话、沉浸式互动和通用聊天。'
                    : 'Better for character chat, immersive interaction, and general conversation.',
                },
                {
                  href: '/guides/ai-tools-for-code-review-comparison',
                  title: isChinese ? '代码审查工具对比' : 'Code review tools comparison',
                  desc: isChinese
                    ? '适合 PR 审查、风险提示和 review 反馈场景。'
                    : 'A sharper path for PR review, risk checks, and review feedback.',
                },
                {
                  href: '/guides/ai-tools-for-prompt-testing-comparison',
                  title: isChinese ? 'Prompt 测试工具对比' : 'Prompt testing tools comparison',
                  desc: isChinese
                    ? '适合提示词评估、A/B 测试和回归验证场景。'
                    : 'A sharper path for prompt evaluation, A/B tests, and regression checks.',
                },
                {
                  href: '/guides/ai-tools-for-evals-comparison',
                  title: isChinese ? 'Evals 工具对比' : 'Evals tools comparison',
                  desc: isChinese
                    ? '适合结果评分、验收标准和质量验证场景。'
                    : 'A sharper path for output scoring, acceptance standards, and quality validation.',
                },
                {
                  href: '/guides/ai-tools-for-lead-generation-comparison',
                  title: isChinese ? '获客工具对比' : 'Lead generation comparison',
                  desc: isChinese
                    ? '适合名单发现、补全和初步筛选场景。'
                    : 'A sharper path for list discovery, enrichment, and early qualification.',
                },
                {
                  href: '/guides/ai-tools-for-sales-prospecting-comparison',
                  title: isChinese ? '销售拓客工具对比' : 'Sales prospecting comparison',
                  desc: isChinese
                    ? '适合个性化触达、外联准备和 prospecting。'
                    : 'A sharper path for personalized outreach, outbound prep, and prospecting.',
                },
                {
                  href: '/guides/salesforce-einstein-alternatives-comparison',
                  title: isChinese ? 'Salesforce Einstein 替代方案对比' : 'Salesforce Einstein alternatives comparison',
                  desc: isChinese
                    ? '更适合 CRM、销售自动化和企业工作流。'
                    : 'Better for CRM, sales automation, and enterprise workflows.',
                },
                {
                  href: '/guides/ai-tools-for-automation-comparison',
                  title: isChinese ? '自动化工具对比' : 'Automation tools comparison',
                  desc: isChinese
                    ? '适合连接器、工作流编排和自动执行场景。'
                    : 'A sharper path for connectors, orchestration, and workflow execution.',
                },
                {
                  href: '/guides/zapier-alternatives-comparison',
                  title: isChinese ? 'Zapier 替代方案对比' : 'Zapier alternatives comparison',
                  desc: isChinese
                    ? '更适合连接器、工作流编排和自动化。'
                    : 'Better for connectors, orchestration, and automation workflows.',
                },
                {
                  href: '/guides/make-alternatives-comparison',
                  title: isChinese ? 'Make 替代方案对比' : 'Make alternatives comparison',
                  desc: isChinese
                    ? '更适合可视化编排和中等复杂度流程。'
                    : 'Better for visual orchestration and medium-complexity workflows.',
                },
                {
                  href: '/guides/n8n-alternatives-comparison',
                  title: isChinese ? 'n8n 替代方案对比' : 'n8n alternatives comparison',
                  desc: isChinese
                    ? '更适合可控、自建和开发者导向的工作流。'
                    : 'Better for controllable, self-hosted, and developer-oriented workflows.',
                },
              ].map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  className='group rounded-lg border border-slate-200 bg-slate-50 p-4 transition hover:border-cyan-200 hover:bg-cyan-50/40'
                >
                  <div className='flex items-start justify-between gap-3'>
                    <div>
                      <p className='text-sm font-semibold text-slate-950'>{item.title}</p>
                      <p className='mt-2 text-sm leading-6 text-slate-600'>{item.desc}</p>
                    </div>
                    <ArrowRight className='size-4 shrink-0 text-slate-400 transition group-hover:translate-x-0.5 group-hover:text-slate-700' />
                  </div>
                </Link>
              ))}
            </div>
          </div>

          <div className='rounded-[18px] border border-slate-200 bg-white p-6 shadow-sm'>
            <p className='text-sm font-semibold uppercase tracking-wide text-cyan-700'>
              {isChinese ? 'Web3 高意图入口' : 'High-intent Web3 paths'}
            </p>
            <h2 className='mt-1 text-2xl font-bold text-slate-950'>
              {isChinese ? '链上与研究类流量，优先导去这些页' : 'Best entry points for Web3 and on-chain traffic'}
            </h2>
            <div className='mt-4 grid gap-3'>
              {[
                {
                  href: '/guides/ai-tools-for-web3-comparison',
                  title: isChinese ? 'Web3 工具总对比' : 'Web3 tools comparison',
                  desc: isChinese
                    ? '适合还没确定自己更偏研究、钱包还是协议分析的人。'
                    : 'Best when the user has not yet narrowed into research, wallets, or protocol analytics.',
                },
                {
                  href: '/guides/ai-tools-for-on-chain-analysis-comparison',
                  title: isChinese ? '链上分析工具对比' : 'On-chain analysis comparison',
                  desc: isChinese
                    ? '更适合地址、资金流向和链上行为分析意图。'
                    : 'Higher intent for address analysis, fund flow, and on-chain behavior work.',
                },
                {
                  href: '/guides/ai-tools-for-crypto-research-comparison',
                  title: isChinese ? 'Crypto 研究工具对比' : 'Crypto research comparison',
                  desc: isChinese
                    ? '适合项目调研、叙事跟踪和信息整合场景。'
                    : 'A tighter fit for project research, narrative tracking, and information synthesis.',
                },
                {
                  href: '/guides/ai-tools-for-crypto-portfolio-tracking-comparison',
                  title: isChinese ? 'Crypto 资产追踪工具对比' : 'Crypto portfolio tracking comparison',
                  desc: isChinese
                    ? '适合持仓看板、多钱包归集和组合观察。'
                    : 'A tighter fit for dashboards, multi-wallet rollups, and portfolio monitoring.',
                },
                {
                  href: '/guides/ai-tools-for-token-research-comparison',
                  title: isChinese ? '代币研究工具对比' : 'Token research comparison',
                  desc: isChinese
                    ? '更适合项目比较、叙事判断和 token 基本面研究。'
                    : 'A tighter fit for project comparison, token narratives, and fundamentals research.',
                },
                {
                  href: '/guides/ai-tools-for-wallet-research-comparison',
                  title: isChinese ? '钱包研究工具对比' : 'Wallet research comparison',
                  desc: isChinese
                    ? '适合地址画像、链上线索和行为研究。'
                    : 'A tighter fit for address profiles, on-chain clues, and wallet behavior research.',
                },
                {
                  href: '/guides/ai-tools-for-protocol-analytics-comparison',
                  title: isChinese ? '协议分析工具对比' : 'Protocol analytics comparison',
                  desc: isChinese
                    ? '适合协议健康、使用量和趋势研究。'
                    : 'A tighter fit for protocol health, usage, and trend research.',
                },
              ].map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  className='group rounded-lg border border-slate-200 bg-slate-50 p-4 transition hover:border-cyan-200 hover:bg-cyan-50/40'
                >
                  <div className='flex items-start justify-between gap-3'>
                    <div>
                      <p className='text-sm font-semibold text-slate-950'>{item.title}</p>
                      <p className='mt-2 text-sm leading-6 text-slate-600'>{item.desc}</p>
                    </div>
                    <ArrowRight className='size-4 shrink-0 text-slate-400 transition group-hover:translate-x-0.5 group-hover:text-slate-700' />
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </section>

        <section className='mt-8 rounded-[18px] border border-slate-200 bg-white p-6 shadow-sm lg:p-8'>
          <p className='text-sm font-semibold uppercase tracking-wide text-cyan-700'>
            {isChinese ? '商业与验证入口' : 'Commercial and validation paths'}
          </p>
          <h2 className='mt-1 text-2xl font-bold text-slate-950'>
            {isChinese
              ? '更接近付费意图、转化和实验验证的入口'
              : 'Paths closer to paid intent, conversion, and validation'}
          </h2>
          <p className='mt-2 max-w-3xl text-sm leading-6 text-slate-600'>
            {isChinese
              ? '如果用户已经在考虑获客、销售、验证、评估或投放，这一组页会比泛工具页更容易把搜索流量导向真实决策。'
              : 'If a user is already thinking about acquisition, sales, validation, evaluation, or distribution, these pages turn search traffic into actual decision-making faster than broad tool pages.'}
          </p>
          <div className='mt-5 grid gap-3 md:grid-cols-2 xl:grid-cols-3'>
            {commercialGuides.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className='rounded-lg border border-slate-200 bg-slate-50 p-4 transition hover:border-cyan-200 hover:bg-cyan-50/40'
              >
                <p className='text-sm font-semibold text-slate-950'>{item.title[isChinese ? 'cn' : 'en']}</p>
                <p className='mt-2 text-sm leading-6 text-slate-600'>{item.desc[isChinese ? 'cn' : 'en']}</p>
              </Link>
            ))}
          </div>
        </section>

        <section className='mt-8 rounded-[18px] border border-slate-200 bg-white p-6 shadow-sm lg:p-8'>
          <p className='text-sm font-semibold uppercase tracking-wide text-cyan-700'>
            {isChinese ? '执行层入口' : 'Execution layer paths'}
          </p>
          <h2 className='mt-1 text-2xl font-bold text-slate-950'>
            {isChinese
              ? '模型路由、可观测性和开发流程先放在一起看'
              : 'Model routing, observability, and dev workflows belong together'}
          </h2>
          <p className='mt-2 max-w-3xl text-sm leading-6 text-slate-600'>
            {isChinese
              ? '如果用户已经走到“我要把 AI 真正接进产品或生产流程”这一步，就应该给他一个比泛开发者页更窄、更高意图的入口。'
              : 'Once a user is at the stage of putting AI into product or production workflows, they deserve a narrower, higher-intent entry point than a broad developer page.'}
          </p>
          <div className='mt-5 grid gap-3 md:grid-cols-2 xl:grid-cols-3'>
            {[
              {
                href: '/guides/ai-tools-for-developers',
                title: isChinese ? '开发者工具指南' : 'Developer tools guide',
                desc: isChinese
                  ? '先看编辑器、API、自动化和基础设施这一层。'
                  : 'Start with the editor, API, automation, and infrastructure layer.',
              },
              {
                href: '/guides/ai-tools-for-agents',
                title: isChinese ? 'Agent 工具指南' : 'Agent tools guide',
                desc: isChinese
                  ? '适合任务编排、工具调用和执行闭环。'
                  : 'Best for task orchestration, tool use, and execution loops.',
              },
              {
                href: '/guides/ai-tools-for-model-routing',
                title: isChinese ? '模型路由指南' : 'Model routing guide',
                desc: isChinese
                  ? '当多模型接入、回退和成本治理是重点时，这页更合适。'
                  : 'Best when multi-model access, fallbacks, and cost governance are the real focus.',
              },
              {
                href: '/guides/ai-tools-for-api-observability',
                title: isChinese ? 'API 可观测指南' : 'API observability guide',
                desc: isChinese
                  ? '如果你关心日志、追踪、成本和质量信号，这页更高意图。'
                  : 'A sharper path when logs, tracing, cost, and quality signals are the priority.',
              },
            ].map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className='rounded-lg border border-slate-200 bg-slate-50 p-4 transition hover:border-cyan-200 hover:bg-cyan-50/40'
              >
                <p className='text-sm font-semibold text-slate-950'>{item.title}</p>
                <p className='mt-2 text-sm leading-6 text-slate-600'>{item.desc}</p>
              </Link>
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
                    <h3 className='text-lg font-semibold text-slate-950'>{item.title[isChinese ? 'cn' : 'en']}</h3>
                    <p className='mt-2 text-sm leading-6 text-slate-600'>{item.desc[isChinese ? 'cn' : 'en']}</p>
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
                  <h2 className='text-lg font-semibold text-slate-950'>{item.title[isChinese ? 'cn' : 'en']}</h2>
                  <p className='mt-2 text-sm leading-6 text-slate-600'>{item.desc[isChinese ? 'cn' : 'en']}</p>
                </div>
                <ArrowRight className='size-5 shrink-0 text-slate-400 transition group-hover:translate-x-0.5 group-hover:text-slate-700' />
              </div>
            </Link>
          ))}
        </section>

        <section className='mt-8 rounded-[18px] border border-cyan-200 bg-cyan-50/60 p-6 shadow-sm lg:p-8'>
          <p className='text-sm font-semibold uppercase tracking-wide text-cyan-700'>
            {isChinese ? '先看高意图对比页' : 'High-intent comparison pages'}
          </p>
          <h2 className='mt-1 text-2xl font-bold text-slate-950'>
            {isChinese
              ? '优先进入最容易推动决策的 comparison 页'
              : 'Start with the comparison pages that move decisions fastest'}
          </h2>
          <p className='mt-2 max-w-3xl text-sm leading-6 text-slate-600'>
            {isChinese
              ? '如果用户已经知道自己要比什么，就不要再绕路去泛指南，直接给他更窄、更高意图的入口。'
              : 'If a user already knows what they are comparing, do not send them back to broad guides. Give them a narrower, higher-intent path.'}
          </p>
          <div className='mt-5 grid gap-3 md:grid-cols-2 xl:grid-cols-4'>
            {[
              {
                href: '/guides/ai-coding-tools-comparison',
                title: isChinese ? '编程工具对比' : 'Coding tools comparison',
                desc: isChinese
                  ? '补全、重构、调试和代码工作流。'
                  : 'Completion, refactoring, debugging, and code workflows.',
              },
              {
                href: '/guides/ai-tools-for-research-comparison',
                title: isChinese ? '研究工具对比' : 'Research tools comparison',
                desc: isChinese ? '资料发现、证据核对和分析整理。' : 'Discovery, evidence-checking, and synthesis.',
              },
              {
                href: '/guides/perplexity-alternatives-comparison',
                title: isChinese ? 'Perplexity 替代方案对比' : 'Perplexity alternatives comparison',
                desc: isChinese
                  ? '更适合资料发现、证据核对和研究工作流。'
                  : 'Better for discovery, evidence-checking, and research workflows.',
              },
              {
                href: '/guides/ai-video-tools-comparison',
                title: isChinese ? '视频工具对比' : 'Video tools comparison',
                desc: isChinese
                  ? '剪辑、生成、配音和短视频流程。'
                  : 'Editing, generation, voiceover, and short-form workflows.',
              },
              {
                href: '/guides/ai-tools-for-meeting-notes-comparison',
                title: isChinese ? '会议纪要工具对比' : 'Meeting notes tools comparison',
                desc: isChinese
                  ? '转写、纪要整理和行动项提取。'
                  : 'Transcription, note cleanup, and action-item extraction.',
              },
              {
                href: '/guides/ai-note-taking-tools-comparison',
                title: isChinese ? '记笔记工具对比' : 'Note taking tools comparison',
                desc: isChinese
                  ? '记录、整理和知识归档工作流。'
                  : 'Capture, organization, and knowledge archiving workflows.',
              },
              {
                href: '/guides/ai-tools-for-voice-comparison',
                title: isChinese ? '语音工具对比' : 'Voice tools comparison',
                desc: isChinese
                  ? '语音合成、转写和对话入口。'
                  : 'Voice synthesis, transcription, and conversational entry points.',
              },
              {
                href: '/guides/suno-alternatives-comparison',
                title: isChinese ? 'Suno 替代方案对比' : 'Suno alternatives comparison',
                desc: isChinese
                  ? '更适合音乐生成、歌曲创作和音频工作流。'
                  : 'Better for music generation, songwriting, and audio workflows.',
              },
              {
                href: '/guides/elevenlabs-alternatives-comparison',
                title: isChinese ? 'ElevenLabs 替代方案对比' : 'ElevenLabs alternatives comparison',
                desc: isChinese
                  ? '更适合语音合成、声音库和音频工作流。'
                  : 'Better for voice synthesis, voice libraries, and audio workflows.',
              },
              {
                href: '/guides/descript-alternatives-comparison',
                title: isChinese ? 'Descript 替代方案对比' : 'Descript alternatives comparison',
                desc: isChinese
                  ? '更适合音频编辑、转写和播客流程。'
                  : 'Better for audio editing, transcription, and podcast workflows.',
              },
              {
                href: '/guides/notta-alternatives-comparison',
                title: isChinese ? 'Notta 替代方案对比' : 'Notta alternatives comparison',
                desc: isChinese
                  ? '更适合会议转写、录音整理和知识归档。'
                  : 'Better for meeting transcription, recording cleanup, and knowledge archiving.',
              },
              {
                href: '/guides/ai-writing-tools-comparison',
                title: isChinese ? '写作工具对比' : 'Writing tools comparison',
                desc: isChinese ? '内容、SEO、营销和编辑工作流。' : 'Content, SEO, marketing, and editing workflows.',
              },
              {
                href: '/guides/ai-tools-for-content-creation-comparison',
                title: isChinese ? '内容创作工具对比' : 'Content creation tools comparison',
                desc: isChinese
                  ? '脚本、封面、批量发布和品牌一致性。'
                  : 'Scripts, covers, batch publishing, and brand consistency.',
              },
              {
                href: '/guides/grammarly-alternatives-comparison',
                title: isChinese ? 'Grammarly 替代方案对比' : 'Grammarly alternatives comparison',
                desc: isChinese
                  ? '更适合改写、润色和日常写作。'
                  : 'Better for rewriting, polishing, and everyday writing.',
              },
              {
                href: '/guides/jasper-alternatives-comparison',
                title: isChinese ? 'Jasper 替代方案对比' : 'Jasper alternatives comparison',
                desc: isChinese
                  ? '更适合品牌文案、活动素材和营销写作。'
                  : 'Better for brand copy, campaign assets, and marketing writing.',
              },
              {
                href: '/guides/copy-ai-alternatives-comparison',
                title: isChinese ? 'Copy.ai 替代方案对比' : 'Copy.ai alternatives comparison',
                desc: isChinese
                  ? '更适合快速起稿、批量变体和营销内容。'
                  : 'Better for fast drafting, bulk variations, and marketing content.',
              },
              {
                href: '/guides/mailchimp-alternatives-comparison',
                title: isChinese ? 'Mailchimp 替代方案对比' : 'Mailchimp alternatives comparison',
                desc: isChinese
                  ? '更适合邮件营销、自动化和受众管理。'
                  : 'Better for email marketing, automation, and audience management.',
              },
              {
                href: '/guides/hubspot-alternatives-comparison',
                title: isChinese ? 'HubSpot 替代方案对比' : 'HubSpot alternatives comparison',
                desc: isChinese
                  ? '更适合 CRM、营销自动化和流程编排。'
                  : 'Better for CRM, marketing automation, and workflow orchestration.',
              },
            ].map((item) => (
              <TrackableCtaLink
                key={item.href}
                href={item.href}
                ctaId={`guides_hub_${item.href.split('/').pop()}`}
                ctaLabel={item.title}
                pageType='guide'
                className='rounded-lg border border-white bg-white p-4 transition hover:border-cyan-200 hover:bg-white'
              >
                <p className='text-sm font-semibold text-slate-950'>{item.title}</p>
                <p className='mt-2 text-sm leading-6 text-slate-600'>{item.desc}</p>
              </TrackableCtaLink>
            ))}
          </div>
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
                {isChinese
                  ? '带着已经想清楚的标准回到总目录继续筛。'
                  : 'Return to the full directory with clearer criteria.'}
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
                {isChinese
                  ? '从最成熟的一批工作流分类开始做比较。'
                  : 'Start comparing inside one of the strongest workflow categories.'}
              </p>
            </Link>
            <Link
              href='/new'
              className='rounded-lg border border-slate-200 bg-white p-4 transition hover:border-cyan-200 hover:bg-cyan-50/40'
            >
              <p className='text-sm font-semibold text-slate-950'>
                {isChinese ? '回到本周新增' : 'Return to New this week'}
              </p>
              <p className='mt-2 text-sm leading-6 text-slate-600'>
                {isChinese
                  ? '顺手看看最近新补进的内容有没有更合适的候选。'
                  : 'Check whether recent additions introduced a better-fit candidate.'}
              </p>
            </Link>
          </div>

          <div className='mt-5 flex flex-wrap gap-3'>
            <TrackableCtaLink
              href='/submit'
              ctaId='guides_hub_submit_footer'
              ctaLabel='Guides hub submit footer'
              pageType='guide'
              className='inline-flex items-center justify-center rounded-lg bg-cyan-700 px-4 py-3 text-sm font-semibold text-white hover:bg-cyan-800'
            >
              {isChinese ? '提交你的工具' : 'Submit your tool'}
            </TrackableCtaLink>
            <TrackableCtaLink
              href='/developer/listing'
              ctaId='guides_hub_claim_footer'
              ctaLabel='Guides hub claim footer'
              pageType='guide'
              className='inline-flex items-center justify-center rounded-lg border border-emerald-200 bg-white px-4 py-3 text-sm font-semibold text-emerald-800 hover:bg-emerald-50'
            >
              {isChinese ? '认领条目' : 'Claim listing'}
            </TrackableCtaLink>
          </div>
        </section>
      </div>
    </>
  );
}
