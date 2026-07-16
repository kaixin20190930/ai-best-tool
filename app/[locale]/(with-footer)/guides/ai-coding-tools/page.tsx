import { Metadata } from 'next';
import { CheckCircle2, Code2, ExternalLink, Wrench } from 'lucide-react';
import { getTranslations } from 'next-intl/server';

import { generateBreadcrumbSchema, generateFAQSchema } from '@/lib/seo/schema';
import { getAllCategories, getLocalizedField } from '@/lib/services/categories';
import TrackableCtaLink from '@/components/analytics/TrackableCtaLink';
import GuideActionSection from '@/components/guides/GuideActionSection';
import GuideEvidencePanel from '@/components/guides/GuideEvidencePanel';
import GuideSubmissionPath from '@/components/guides/GuideSubmissionPath';
import { StructuredDataServer } from '@/components/seo/StructuredData';
import { Link } from '@/app/navigation';

export async function generateMetadata({ params: { locale } }: { params: { locale: string } }): Promise<Metadata> {
  const t = await getTranslations({
    locale,
    namespace: 'Metadata.home',
  });

  return {
    title:
      locale === 'cn' || locale === 'tw'
        ? 'AI 编程工具推荐 | AI Best Tool'
        : `AI coding tools recommendations | ${t('title')}`,
    description:
      locale === 'cn' || locale === 'tw'
        ? '面向代码补全、调试、生成和工作流自动化的 AI 编程工具选型指南，先看榜单再进对比。'
        : 'A practical guide to AI tools for code completion, debugging, generation, and workflow automation, with a path from guide to ranking and comparison.',
  };
}

export default async function Page({ params: { locale } }: { params: { locale: string } }) {
  const isChinese = locale === 'cn' || locale === 'tw';
  const categories = await getAllCategories(true).catch(() => []);
  const checkedAt = '2026-07-15';
  const categoryCount = categories.length;
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000';
  const breadcrumbSchema = generateBreadcrumbSchema([
    { name: 'Home', url: `${siteUrl}/${locale}` },
    { name: isChinese ? '选型指南' : 'Guides', url: `${siteUrl}/${locale}/guides/how-to-choose-ai-tools` },
    { name: isChinese ? '编程工具' : 'Coding tools', url: `${siteUrl}/${locale}/guides/ai-coding-tools` },
  ]);
  const faqs = [
    {
      question: isChinese ? 'AI 编程工具最适合做什么？' : 'What are AI coding tools best for?',
      answer: isChinese
        ? '最适合代码补全、重构、解释代码、生成脚手架、测试辅助和调试。它们能显著提速，但关键逻辑还是要人工把关。'
        : 'They are great for code completion, refactoring, code explanation, scaffolding, test assistance, and debugging. They speed things up a lot, but important logic still needs human review.',
    },
    {
      question: isChinese
        ? '我应该先看 IDE 插件还是聊天式工具？'
        : 'Should I start with IDE plugins or chat-style tools?',
      answer: isChinese
        ? '如果你主要在编辑器里写代码，先看 IDE 插件；如果你更常做方案设计、排查问题或生成脚手架，再重点看聊天式工具。'
        : 'If you mainly code in an editor, start with IDE plugins. If you spend more time designing solutions, debugging, or scaffolding, chat-style tools are a better first look.',
    },
    {
      question: isChinese ? '免费编程工具够用吗？' : 'Are free coding tools enough?',
      answer: isChinese
        ? '个人学习和轻量任务通常够用；但如果你要多文件改动、团队协作、私有仓库支持或更高调用量，往往会更快碰到限制。'
        : 'Free tiers can work for learning and lightweight tasks. If you need multi-file changes, team workflows, private repo support, or more usage, you will likely hit limits sooner.',
    },
    {
      question: isChinese ? '我可以直接从这里找到编程类工具吗？' : 'Can I find coding tools directly from here?',
      answer: isChinese
        ? '可以。你可以先从分类和搜索结果开始，再结合评论、截图和更新频率判断。'
        : 'Yes. Start from categories and search results, then use comments, screenshots, and update frequency to decide.',
    },
  ];
  const faqSchema = generateFAQSchema(faqs);
  const tips = isChinese
    ? [
        '先分清你的任务：补全、重构、调试、生成脚手架，需求差异很大。',
        '看它是否支持你的语言、编辑器和仓库工作流。',
        '如果你会长期使用，优先看上下文长度、团队协作和私有仓库支持。',
      ]
    : [
        'Start by separating your task: completion, refactoring, debugging, or scaffolding all need different features.',
        'Check language support, editor support, and repository workflow fit.',
        'If you plan to use it regularly, pay attention to context length, collaboration, and private repository support.',
      ];
  const quickStarts = [
    {
      href: '/best-ai-tools/ai-coding-tools',
      title: isChinese ? '编程榜单' : 'Coding ranking',
      desc: isChinese ? '先看 editor-native shortlist。' : 'Start with the editor-native shortlist.',
    },
    {
      href: '/guides/ai-coding-tools-comparison',
      title: isChinese ? '编程对比页' : 'Coding comparison',
      desc: isChinese ? '编辑器、补全和重构工作流。' : 'Compare editor, completion, and refactoring workflows.',
    },
    {
      href: '/ai/cursor',
      title: 'Cursor',
      desc: isChinese ? '适合编辑器内编码和重构。' : 'Great for editor-based coding and refactoring.',
    },
    {
      href: '/ai/github-copilot',
      title: 'GitHub Copilot',
      desc: isChinese ? '适合补全、解释和日常编码。' : 'Useful for completion, explanation, and daily coding.',
    },
  ];

  return (
    <>
      <StructuredDataServer data={breadcrumbSchema} />
      <StructuredDataServer data={faqSchema} />
      <div className='theme-page mx-auto max-w-6xl px-4 py-8 lg:px-6 lg:py-12'>
        <section className='rounded-[20px] border border-slate-200 bg-white p-6 shadow-sm lg:p-10'>
          <div className='flex flex-wrap items-center gap-2'>
            <span className='inline-flex items-center gap-2 rounded-full bg-cyan-50 px-3 py-1 text-sm font-semibold text-cyan-700'>
              <Code2 className='size-4' />
              {isChinese ? '编程工具推荐' : 'Coding tools recommendations'}
            </span>
            <span className='inline-flex items-center gap-2 rounded-full bg-slate-100 px-3 py-1 text-sm font-semibold text-slate-700'>
              <Wrench className='size-4' />
              {isChinese ? '开发者工作流' : 'Developer workflow'}
            </span>
          </div>

          <h1 className='mt-4 max-w-4xl text-3xl font-bold tracking-tight text-slate-950 lg:text-5xl'>
            {isChinese
              ? 'AI 编程工具推荐：怎么选更适合你的开发流程'
              : 'AI coding tools: how to choose one that fits your development workflow'}
          </h1>
          <p className='mt-4 max-w-3xl text-base leading-7 text-slate-600 lg:text-lg'>
            {isChinese
              ? '编程工具不只是“会不会补代码”，而是要看它能不能真正融入你的编辑器、仓库和发布流程。这个页面会从任务、语言、上下文和协作四个角度帮你判断。'
              : 'Coding tools are not just about "can it write code?" They need to fit your editor, repository, and release workflow. This page helps you judge by task, language, context, and collaboration.'}
          </p>

          <div className='mt-6 flex flex-wrap gap-3'>
            <Link
              href='/explore?search=coding&sort=popular'
              className='inline-flex items-center justify-center gap-2 rounded-lg bg-cyan-700 px-4 py-3 text-sm font-semibold text-white hover:bg-cyan-800'
            >
              {isChinese ? '看编程类工具' : 'Browse coding tools'}
              <ExternalLink className='size-4' />
            </Link>
            <Link
              href='/guides/how-to-choose-ai-tools'
              className='inline-flex items-center justify-center gap-2 rounded-lg border border-slate-200 bg-white px-4 py-3 text-sm font-semibold text-slate-700 hover:bg-slate-50'
            >
              {isChinese ? '回到选型指南' : 'Back to selection guide'}
            </Link>
            <Link
              href='/guides/ai-coding-tools-comparison'
              className='inline-flex items-center justify-center gap-2 rounded-lg border border-slate-200 bg-white px-4 py-3 text-sm font-semibold text-slate-700 hover:bg-slate-50'
            >
              {isChinese ? '看编程工具对比' : 'Compare coding tools'}
            </Link>
            <TrackableCtaLink
              href='/best-ai-tools/ai-coding-tools'
              ctaId='coding_guide_top_list'
              ctaLabel='Coding guide top list'
              pageType='guide'
              className='inline-flex items-center justify-center gap-2 rounded-lg border border-cyan-200 bg-cyan-50 px-4 py-3 text-sm font-semibold text-cyan-800 hover:bg-cyan-100'
            >
              {isChinese ? '看编程榜单' : 'Open coding ranking'}
            </TrackableCtaLink>
          </div>
          <div className='mt-5 grid gap-3 md:grid-cols-2 xl:grid-cols-4'>
            {quickStarts.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className='rounded-xl border border-white bg-white p-4 shadow-sm transition hover:bg-slate-50'
              >
                <p className='text-sm font-semibold text-slate-950'>{item.title}</p>
                <p className='mt-2 text-sm leading-6 text-slate-600'>{item.desc}</p>
              </Link>
            ))}
          </div>
        </section>

        <GuideEvidencePanel
          locale={locale}
          checkedAt={checkedAt}
          scope={
            isChinese
              ? '这页优先判断编程工具是否真的进入开发流程：编辑器支持、仓库上下文、多文件修改、测试调试、隐私和团队协作，并继续把代表性条目和榜单串起来。'
              : 'This page checks whether a coding tool actually fits the development workflow: editor support, repository context, multi-file edits, testing/debugging, privacy, and team collaboration, while tying representative listings back to rankings.'
          }
          decisionSteps={
            isChinese
              ? [
                  '先判断你要的是编辑器内补全，还是更偏聊天式的方案设计和调试。',
                  '如果目标明确，先去更窄的编程榜单或对比页缩小 shortlist。',
                  '如果还要给团队看证据，再回到这里看仓库支持、上下文和真实反馈。',
                ]
              : [
                  'First decide whether you need inline editor completion or a more chat-style solution for planning and debugging.',
                  'If the goal is already clear, move to a narrower coding ranking or comparison page to shrink the shortlist.',
                  'If you still need team evidence, come back here for repo support, context, and real feedback.',
                ]
          }
          items={[
            {
              label: isChinese ? '验证范围' : 'Checked scope',
              value: isChinese
                ? '编辑器、仓库、上下文、团队 + 榜单'
                : 'Editor, repository, context, team fit + rankings',
              note: isChinese
                ? `当前分类页里有 ${categories.length} 个分类信号可参考，继续把真实开发流程接进来。`
                : `${categories.length} category signals are available as context, and the page should keep reflecting real development flow.`,
            },
            {
              label: isChinese ? '代表工具' : 'Representative tools',
              value: 'Cursor, GitHub Copilot',
              note: isChinese
                ? '优先把代表性详情页补到可验证状态，再扩到更多开发者工具。'
                : 'Representative detail pages should be enriched first before expanding to more developer tools.',
            },
            {
              label: isChinese ? '下一步补强' : 'Next enrichment',
              value: isChinese ? '补充限制、团队适配、最近验证' : 'Add limits, team fit, and recent verification',
              note: isChinese
                ? `下一轮会补免费额度、私有仓库支持、团队协作和真实评论信号，并持续保留 ${checkedAt} 的核对记录。`
                : `Next pass should add free-tier limits, private repo support, team features, and real feedback signals while keeping the ${checkedAt} verification record.`,
            },
          ]}
        />

        <section className='mt-6 grid gap-4 rounded-[18px] border border-cyan-200 bg-cyan-50/70 p-6 shadow-sm md:grid-cols-3'>
          <div>
            <p className='text-xs font-semibold uppercase tracking-wide text-cyan-700'>
              {isChinese ? '最近验证' : 'Last checked'}
            </p>
            <p className='mt-2 text-lg font-bold text-slate-950'>{checkedAt}</p>
            <p className='mt-2 text-sm leading-6 text-slate-600'>
              {isChinese
                ? `编程入口已和榜单、对比页和真实条目连在一起，当前可参考分类信号 ${categoryCount} 个。`
                : `The coding entry now connects ranking, comparison, and real listings, with ${categoryCount} category signals available.`}
            </p>
          </div>
          <div>
            <p className='text-xs font-semibold uppercase tracking-wide text-cyan-700'>
              {isChinese ? '当前判断' : 'Current judgment'}
            </p>
            <p className='mt-2 text-sm leading-6 text-slate-700'>
              {isChinese
                ? '保留索引，继续补真实开发流程和团队信号。'
                : 'Keep indexable and continue adding real dev workflows and team signals.'}
            </p>
          </div>
          <div>
            <p className='text-xs font-semibold uppercase tracking-wide text-cyan-700'>
              {isChinese ? '下一步' : 'Next step'}
            </p>
            <p className='mt-2 text-sm leading-6 text-slate-700'>
              {isChinese
                ? `补一个真实多文件修改案例，并持续保留 ${checkedAt} 的核对记录。`
                : `Add one real multi-file edit case while keeping the ${checkedAt} verification record.`}
            </p>
          </div>
        </section>

        <section className='mt-8 grid gap-4 lg:grid-cols-[1fr_0.9fr]'>
          <div className='rounded-[18px] border border-slate-200 bg-white p-6 shadow-sm'>
            <p className='text-sm font-semibold uppercase tracking-wide text-cyan-700'>
              {isChinese ? '判断顺序' : 'How to judge'}
            </p>
            <h2 className='mt-1 text-2xl font-bold text-slate-950'>
              {isChinese ? '先看任务，再看工作流适配' : 'Start with the task, then workflow fit'}
            </h2>
            <div className='mt-4 space-y-3'>
              {tips.map((tip) => (
                <div key={tip} className='rounded-lg bg-slate-50 p-4 text-sm leading-6 text-slate-700'>
                  <div className='flex items-start gap-3'>
                    <CheckCircle2 className='mt-0.5 size-4 shrink-0 text-emerald-600' />
                    <span>{tip}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <aside className='rounded-[18px] border border-slate-200 bg-slate-50 p-6 shadow-sm'>
            <p className='text-sm font-semibold uppercase tracking-wide text-cyan-700'>
              {isChinese ? '先看这些分类' : 'Start here'}
            </p>
            <h2 className='mt-1 text-2xl font-bold text-slate-950'>
              {isChinese ? '编程类工具通常在这些分类里' : 'Coding tools often sit in these categories'}
            </h2>
            <div className='mt-4 grid gap-2'>
              {categories.slice(0, 6).map((category) => (
                <Link
                  key={category.id}
                  href={`/categories/${category.slug}`}
                  className='flex items-center justify-between rounded-lg border border-white bg-white px-4 py-3 text-sm text-slate-700 shadow-sm hover:bg-slate-100'
                >
                  <span>{getLocalizedField(category.name, locale)}</span>
                  <span className='text-xs text-slate-500'>
                    {'toolCount' in category && typeof category.toolCount === 'number' ? category.toolCount : ''}
                  </span>
                </Link>
              ))}
            </div>
          </aside>
        </section>

        <GuideActionSection
          locale={locale}
          eyebrow={isChinese ? '先看这些工具' : 'Recommended tools'}
          title={isChinese ? '更贴近真实编码工作的入口' : 'Real entry points for coding workflows'}
          description={
            isChinese
              ? '如果你要的是补全、重构、多文件修改和调试支持，这些工具会比泛开发者页更快进入正题。'
              : 'If completion, refactoring, multi-file edits, and debugging matter most, these tools get you to the real decision faster than a broad developer page.'
          }
          toolNames={['cursor', 'phind', 'openrouter', 'portkey']}
          compareEyebrow={isChinese ? '继续比较' : 'Compare next'}
          compareTitle={isChinese ? '编码意图更强的下一步入口' : 'Next paths for stronger coding intent'}
          compareDescription={
            isChinese
              ? '当你已经明确工作主要发生在编辑器和仓库里，继续进入更窄的对比页会更有效。'
              : 'Once the real work clearly happens in the editor and repository, narrower comparison pages work better.'
          }
          compareLinks={[
            {
              href: '/best-ai-tools/ai-coding-tools',
              title: isChinese ? '编程工具榜单' : 'Coding tools ranking',
              description: isChinese
                ? '先收窄到更高相关的编程候选，再决定要不要继续进入横向对比。'
                : 'Narrow to the highest-fit coding candidates first, then decide whether you need a deeper side-by-side comparison.',
            },
            {
              href: '/guides/ai-coding-tools-comparison',
              title: isChinese ? '编程工具总对比' : 'Coding tools comparison',
              description: isChinese
                ? '适合快速横向看常见 AI 编程工具。'
                : 'A fast side-by-side view of common AI coding tools.',
            },
            {
              href: '/guides/ai-tools-for-developers-comparison',
              title: isChinese ? '开发者工具对比' : 'Developer tools comparison',
              description: isChinese
                ? '如果你同时在看模型接入、日志和 API 工作流，这里更全。'
                : 'More useful if model access, logs, and API workflows are also part of the decision.',
            },
            {
              href: '/guides/ai-tools-for-automation-comparison',
              title: isChinese ? '自动化工具对比' : 'Automation tools comparison',
              description: isChinese
                ? '适合开始从“写代码”转向“跑工作流”的用户。'
                : 'Useful when the decision is shifting from writing code to running workflows.',
            },
          ]}
          nextEyebrow={isChinese ? '下一步入口' : 'Where to go next'}
          nextTitle={
            isChinese ? '编码方向确定后，继续这样缩小范围' : 'How to narrow the space after coding is clearly the lane'
          }
          nextDescription={
            isChinese
              ? '如果你已经明确要找编码类助手，下一步就看编程榜单、分类页和搜索结果里的真实候选。'
              : 'Once coding is clearly the right lane, the next step is to use the coding ranking, category page, and search results to compare real candidates.'
          }
          nextLinks={[
            {
              href: '/best-ai-tools/ai-coding-tools',
              title: isChinese ? '进入编程榜单' : 'Open the coding ranking',
              description: isChinese
                ? '先从更高相关的编程候选集合开始。'
                : 'Start with the highest-fit coding shortlist.',
            },
            {
              href: '/categories/developer-tools?sort=popular',
              title: isChinese ? '进入 Developer Tools 分类' : 'Open the developer tools category',
              description: isChinese
                ? '直接看开发者相关目录中的真实条目。'
                : 'Go straight into the developer category for real listings.',
            },
            {
              href: '/explore?search=coding&sort=popular',
              title: isChinese ? '搜索更多编程工具' : 'Search more coding tools',
              description: isChinese
                ? '回到 Explore，用更窄的编码关键词扩大 shortlist。'
                : 'Return to Explore and widen the shortlist with a coding-focused search.',
            },
          ]}
        />

        <section className='mt-8 rounded-[20px] border border-cyan-200 bg-cyan-50/60 p-6 shadow-sm lg:p-8'>
          <p className='text-sm font-semibold uppercase tracking-wide text-cyan-700'>
            {isChinese ? '高意图榜单' : 'High-intent ranking'}
          </p>
          <h2 className='mt-1 text-2xl font-bold text-slate-950'>
            {isChinese ? '先用榜单缩小 coding shortlist' : 'Use the ranking to narrow your coding shortlist first'}
          </h2>
          <p className='mt-2 max-w-3xl text-sm leading-6 text-slate-600'>
            {isChinese
              ? '如果你已经知道自己主要在找代码补全、重构或调试助手，榜单页会比泛目录更快进入决策。'
              : 'If you already know you need completion, refactoring, or debugging help, the ranking page gets to a decision faster than a broad directory.'}
          </p>
          <div className='mt-5 grid gap-3 md:grid-cols-2 xl:grid-cols-4'>
            {[
              {
                href: '/best-ai-tools/ai-coding-tools',
                title: isChinese ? '编程榜单' : 'Coding ranking',
                desc: isChinese
                  ? '先从 editor-native shortlist 开始。'
                  : 'Start with the editor-native shortlist first.',
              },
              {
                href: '/guides/ai-coding-tools-comparison',
                title: isChinese ? '编程对比页' : 'Coding comparison',
                desc: isChinese
                  ? '横向看补全、重构和调试。'
                  : 'Compare completion, refactoring, and debugging side by side.',
              },
              {
                href: '/categories/developer-tools?sort=popular',
                title: isChinese ? 'Developer Tools 分类' : 'Developer Tools category',
                desc: isChinese
                  ? '先看真实条目再收窄 shortlist。'
                  : 'Browse real listings before narrowing the shortlist.',
              },
              {
                href: '/guides/ai-tools-for-developers-comparison',
                title: isChinese ? '开发者工具对比' : 'Developer tools comparison',
                desc: isChinese
                  ? '如果你的范围已扩到 API 和工作流层。'
                  : 'A better fit if the scope includes API and workflow layers.',
              },
            ].map((item) => (
              <TrackableCtaLink
                key={item.href}
                href={item.href}
                ctaId={`coding_guide_${item.href.split('/').pop()}`}
                ctaLabel={item.title}
                pageType='guide'
                className='rounded-xl border border-white bg-white p-4 shadow-sm hover:bg-slate-50'
              >
                <p className='text-sm font-semibold text-slate-950'>{item.title}</p>
                <p className='mt-2 text-sm leading-6 text-slate-600'>{item.desc}</p>
              </TrackableCtaLink>
            ))}
          </div>
          <div className='mt-5 flex flex-wrap gap-3'>
            <TrackableCtaLink
              href='/best-ai-tools/ai-coding-tools'
              ctaId='coding_guide_top_list_secondary'
              ctaLabel='Coding guide top list secondary'
              pageType='guide'
              className='inline-flex items-center justify-center rounded-lg bg-cyan-700 px-4 py-3 text-sm font-semibold text-white hover:bg-cyan-800'
            >
              {isChinese ? '进入编程榜单' : 'Open the coding ranking'}
            </TrackableCtaLink>
            <TrackableCtaLink
              href='/submit'
              ctaId='coding_guide_submit'
              ctaLabel='Coding guide submit'
              pageType='guide'
              className='inline-flex items-center justify-center rounded-lg border border-cyan-200 bg-white px-4 py-3 text-sm font-semibold text-cyan-800 hover:bg-cyan-50'
            >
              {isChinese ? '提交你的工具' : 'Submit your tool'}
            </TrackableCtaLink>
          </div>
        </section>

        <section className='mt-8 grid gap-4 lg:grid-cols-[1fr_1fr]'>
          <div className='rounded-[18px] border border-slate-200 bg-white p-6 shadow-sm'>
            <p className='text-sm font-semibold uppercase tracking-wide text-cyan-700'>
              {isChinese ? '编程工具看什么' : 'What matters for coding tools'}
            </p>
            <h2 className='mt-1 text-2xl font-bold text-slate-950'>
              {isChinese ? '能不能真正减少你的开发摩擦' : 'Can it actually reduce development friction?'}
            </h2>
            <div className='mt-4 space-y-3 text-sm leading-6 text-slate-700'>
              <p>
                {isChinese
                  ? '编程工具最重要的是它是否能稳定地帮你完成日常任务，而不是只在演示里看起来聪明。你要特别看它能否嵌进你的编辑器、仓库和测试流程。'
                  : 'The key is whether it consistently helps with daily work, not only in demos. Check whether it fits your editor, repository, and testing flow.'}
              </p>
              <p>
                {isChinese
                  ? '如果你是个人开发者或团队成员，优先看上下文、隐私、协作和多文件修改能力。'
                  : 'If you are an individual developer or part of a team, focus on context, privacy, collaboration, and multi-file changes.'}
              </p>
            </div>
          </div>

          <div className='rounded-[18px] border border-slate-200 bg-white p-6 shadow-sm'>
            <p className='text-sm font-semibold uppercase tracking-wide text-cyan-700'>
              {isChinese ? '常见问题' : 'FAQ'}
            </p>
            <h2 className='mt-1 text-2xl font-bold text-slate-950'>
              {isChinese ? '编程工具最常见的问题' : 'Common questions about coding tools'}
            </h2>
            <div className='mt-4 space-y-4'>
              {faqs.map((faq) => (
                <div key={faq.question} className='rounded-lg border border-slate-200 bg-slate-50 p-4'>
                  <p className='text-sm font-semibold text-slate-900'>{faq.question}</p>
                  <p className='mt-2 text-sm leading-6 text-slate-600'>{faq.answer}</p>
                </div>
              ))}
            </div>
          </div>
        </section>
        <GuideSubmissionPath locale={locale} ctaPrefix='ai_coding_tools' />
      </div>
    </>
  );
}
