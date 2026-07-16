import { Metadata } from 'next';
import { ArrowRight, Code2, ExternalLink, Layers3, Workflow } from 'lucide-react';
import { getTranslations } from 'next-intl/server';

import { generateBreadcrumbSchema, generateFAQSchema } from '@/lib/seo/schema';
import { getAllCategories, getLocalizedField } from '@/lib/services/categories';
import TrackableCtaLink from '@/components/analytics/TrackableCtaLink';
import GuideActionSection from '@/components/guides/GuideActionSection';
import GuideEvidencePanel from '@/components/guides/GuideEvidencePanel';
import { StructuredDataServer } from '@/components/seo/StructuredData';
import { Link } from '@/app/navigation';

export async function generateMetadata({ params: { locale } }: { params: { locale: string } }): Promise<Metadata> {
  const t = await getTranslations({ locale, namespace: 'Metadata.home' });

  return {
    title:
      locale === 'cn' || locale === 'tw'
        ? 'AI 开发者工具推荐 | AI Best Tool'
        : `AI tools for developers | ${t('title')}`,
    description:
      locale === 'cn' || locale === 'tw'
        ? '面向编码、模型接入、API 工作流、调试和自动化的 AI 开发者工具指南，先看榜单再进对比。'
        : 'A practical guide to AI tools for developers, including coding, model access, APIs, debugging, and automation, with a path from guide to ranking and comparison.',
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
    { name: isChinese ? '指南' : 'Guides', url: `${siteUrl}/${locale}/guides` },
    { name: isChinese ? '开发者工具' : 'Developer tools', url: `${siteUrl}/${locale}/guides/ai-tools-for-developers` },
  ]);
  const faqs = [
    {
      question: isChinese ? 'AI 开发者工具最适合做什么？' : 'What are AI tools for developers best for?',
      answer: isChinese
        ? '最适合编码辅助、模型接入、调试、API 工作流、提示词实验和把 AI 接进真实产品。'
        : 'They are best for coding support, model access, debugging, API workflows, prompt experimentation, and integrating AI into real products.',
    },
    {
      question: isChinese ? '它和单纯的编程工具有什么区别？' : 'How is this different from just coding tools?',
      answer: isChinese
        ? '开发者工具不只包含 IDE 辅助，也包括模型访问层、数据基础设施、自动化编排和开发侧工作流。'
        : 'Developer tools go beyond IDE assistance and also include model access, infrastructure, workflow orchestration, and developer-facing operations.',
    },
    {
      question: isChinese ? '我应该先看什么？' : 'What should I check first?',
      answer: isChinese
        ? '先看你的工作发生在编辑器里、API 层、自动化层还是数据层，再比较上下文、集成方式和团队使用成本。'
        : 'Start by deciding whether your work happens in the editor, API layer, automation layer, or data layer, then compare context, integrations, and team cost.',
    },
    {
      question: isChinese ? '免费版够用吗？' : 'Is a free tier enough?',
      answer: isChinese
        ? '试用通常够用，但当你进入多成员、多项目、私有仓库或生产接入时，通常会更快碰到限制。'
        : 'Free tiers can be enough for trials, but private repositories, production use, and team access usually hit plan limits faster.',
    },
  ];
  const tips = isChinese
    ? [
        '先分清你是在找编码辅助、模型接入，还是自动化和基础设施能力。',
        '优先看是否适配现有编辑器、仓库、API 和部署方式。',
        '如果是团队长期使用，重点看权限、可观测性和集成维护成本。',
      ]
    : [
        'Separate coding, model access, automation, and infrastructure needs before comparing tools.',
        'Check fit with your editor, repository, API surface, and deployment path.',
        'For team use, focus on permissions, observability, and integration maintenance cost.',
      ];
  const quickStarts = [
    {
      href: '/best-ai-tools/ai-coding-tools',
      title: isChinese ? '编程榜单' : 'Coding ranking',
      desc: isChinese ? '先看 editor-native shortlist。' : 'Start with the editor-native shortlist.',
    },
    {
      href: '/guides/ai-tools-for-developers-comparison',
      title: isChinese ? '开发者对比页' : 'Developer comparison',
      desc: isChinese ? '模型、API、执行层一起看。' : 'Compare model, API, and execution layers.',
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
      <StructuredDataServer data={generateFAQSchema(faqs)} />
      <div className='theme-page mx-auto max-w-6xl px-4 py-8 lg:px-6 lg:py-12'>
        <section className='rounded-[20px] border border-slate-200 bg-white p-6 shadow-sm lg:p-10'>
          <div className='flex flex-wrap items-center gap-2'>
            <span className='inline-flex items-center gap-2 rounded-full bg-cyan-50 px-3 py-1 text-sm font-semibold text-cyan-700'>
              <Code2 className='size-4' />
              {isChinese ? '开发者工具推荐' : 'Developer tools'}
            </span>
            <span className='inline-flex items-center gap-2 rounded-full bg-slate-100 px-3 py-1 text-sm font-semibold text-slate-700'>
              <Layers3 className='size-4' />
              {isChinese ? '代码 + API + 工作流' : 'Code + API + workflow'}
            </span>
          </div>

          <h1 className='mt-4 max-w-4xl text-3xl font-bold tracking-tight text-slate-950 lg:text-5xl'>
            {isChinese
              ? 'AI 开发者工具推荐：怎么选更适合你的构建工作流'
              : 'AI tools for developers: how to choose for your build workflow'}
          </h1>
          <p className='mt-4 max-w-3xl text-base leading-7 text-slate-600 lg:text-lg'>
            {isChinese
              ? '开发者工具不只是“能写代码”，而是要看它能不能接进你的编辑器、API、自动化和发布流程。这个页面帮你按工作位置而不是按热度来判断。'
              : 'Developer tools are not only about writing code. The real question is whether they fit your editor, APIs, automation, and release path. This page helps you judge by workflow position, not by hype.'}
          </p>

          <div className='mt-6 flex flex-wrap gap-3'>
            <TrackableCtaLink
              href='/explore?search=developer&sort=popular'
              ctaId='developer_guide_browse_tools'
              ctaLabel='Developer guide browse tools'
              pageType='guide'
              className='inline-flex items-center justify-center gap-2 rounded-lg bg-cyan-700 px-4 py-3 text-sm font-semibold text-white hover:bg-cyan-800'
            >
              {isChinese ? '看开发者工具' : 'Browse developer tools'}
              <ExternalLink className='size-4' />
            </TrackableCtaLink>
            <TrackableCtaLink
              href='/guides/ai-coding-tools'
              ctaId='developer_guide_coding'
              ctaLabel='Developer guide coding'
              pageType='guide'
              className='inline-flex items-center justify-center gap-2 rounded-lg border border-slate-200 bg-white px-4 py-3 text-sm font-semibold text-slate-700 hover:bg-slate-50'
            >
              {isChinese ? '看编程工具' : 'Coding tools'}
            </TrackableCtaLink>
            <TrackableCtaLink
              href='/guides/ai-tools-for-automation'
              ctaId='developer_guide_automation'
              ctaLabel='Developer guide automation'
              pageType='guide'
              className='inline-flex items-center justify-center gap-2 rounded-lg border border-slate-200 bg-white px-4 py-3 text-sm font-semibold text-slate-700 hover:bg-slate-50'
            >
              {isChinese ? '看自动化工具' : 'Automation tools'}
            </TrackableCtaLink>
            <TrackableCtaLink
              href='/submit'
              ctaId='developer_guide_submit'
              ctaLabel='Developer guide submit'
              pageType='guide'
              className='inline-flex items-center justify-center gap-2 rounded-lg border border-cyan-200 bg-cyan-50 px-4 py-3 text-sm font-semibold text-cyan-800 hover:bg-cyan-100'
            >
              {isChinese ? '提交你的工具' : 'Submit your tool'}
            </TrackableCtaLink>
            <TrackableCtaLink
              href='/best-ai-tools/ai-coding-tools'
              ctaId='developer_guide_coding_ranking'
              ctaLabel='Developer guide coding ranking'
              pageType='guide'
              className='inline-flex items-center justify-center gap-2 rounded-lg border border-cyan-200 bg-cyan-50 px-4 py-3 text-sm font-semibold text-cyan-800 hover:bg-cyan-100'
            >
              {isChinese ? '看开发者相关榜单' : 'Open developer rankings'}
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
              ? '这页优先判断开发者工具是否真的能融入编辑器、API、自动化和发布流程，而不是只看“能写代码”的表面能力。'
              : 'This page checks whether a developer tool truly fits the editor, APIs, automation, and release path rather than only claiming it can write code.'
          }
          signalCards={[
            {
              label: isChinese ? '价格信号' : 'Pricing signal',
              value: isChinese ? '先看试用和席位' : 'Check trial and seat limits',
              note: isChinese
                ? '开发者工具常在团队席位和高级能力上分层。'
                : 'Developer tools often split value across seats and advanced capabilities.',
            },
            {
              label: isChinese ? '更新信号' : 'Freshness signal',
              value: isChinese ? '看是否还在持续迭代' : 'See whether it is still iterating',
              note: isChinese
                ? '如果连 release path 都停了，通常也不太适合长期接入。'
                : 'If the release path has stalled, it is usually not ideal for long-term integration either.',
            },
            {
              label: isChinese ? '风险信号' : 'Risk signal',
              value: isChinese ? '只会说能写代码不够' : 'Can-write-code alone is not enough',
              note: isChinese
                ? '如果没有真实仓库、调试或自动化案例，就先保留判断。'
                : 'If there are no real repo, debugging, or automation cases, hold off on the conclusion.',
            },
          ]}
          items={[
            {
              label: isChinese ? '验证范围' : 'Checked scope',
              value: isChinese ? '编辑器、API、自动化、发布' : 'Editor, API, automation, release',
              note: isChinese
                ? `先看它是否适配真实构建流程，并保留 ${checkedAt} 的核对痕迹。`
                : `First check whether it fits the real build workflow while preserving the ${checkedAt} check trail.`,
            },
            {
              label: isChinese ? '索引策略' : 'Indexing strategy',
              value: isChinese ? '保留索引，接榜单与对比页' : 'Indexable with ranking and comparison paths',
              note: isChinese
                ? `当前可参考分类信号有 ${categoryCount} 个，让用户从总览走向更具体的选择。`
                : `${categoryCount} category signals are available, helping users move from overview to more specific choices.`,
            },
            {
              label: isChinese ? '下一步增强' : 'Next enrichment',
              value: isChinese ? '补真实工作流、仓库与调试案例' : 'Add real workflows, repos, and debugging cases',
              note: isChinese
                ? `这页已于 ${checkedAt} 重新核对，用可执行证据替代泛泛的卖点。`
                : `This page was rechecked on ${checkedAt}, replacing generic selling points with executable evidence.`,
            },
          ]}
          decisionSteps={[
            isChinese
              ? '先判断你的工作发生在编辑器、API 还是自动化层。'
              : 'First decide whether your work sits in the editor, API, or automation layer.',
            isChinese
              ? '如果已经有方向，直接去对应的对比页。'
              : 'If you already have a direction, jump to the matching comparison page.',
            isChinese
              ? '如果是团队落地，再回来补仓库、权限和调试证据。'
              : 'If this is for a team rollout, come back for repo, permissions, and debugging evidence.',
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
                ? `开发者入口已和编码、自动化和部署路径收口，当前可参考分类信号 ${categoryCount} 个。`
                : `The developer entry now aligns with coding, automation, and deployment paths, with ${categoryCount} category signals available.`}
            </p>
          </div>
          <div>
            <p className='text-xs font-semibold uppercase tracking-wide text-cyan-700'>
              {isChinese ? '当前判断' : 'Current judgment'}
            </p>
            <p className='mt-2 text-lg font-bold text-slate-950'>
              {isChinese
                ? '保留索引，继续补真实工作流证据'
                : 'Keep it indexable and keep adding real workflow evidence'}
            </p>
            <p className='mt-2 text-sm leading-6 text-slate-600'>
              {isChinese
                ? '用仓库、调试和集成案例把它从泛开发页里拉出来。'
                : 'Use repo, debugging, and integration cases to separate it from generic developer pages.'}
            </p>
          </div>
          <div>
            <p className='text-xs font-semibold uppercase tracking-wide text-cyan-700'>
              {isChinese ? '下一步' : 'Next step'}
            </p>
            <p className='mt-2 text-lg font-bold text-slate-950'>
              {isChinese ? '补真实仓库协作案例' : 'Add a real repo collaboration case'}
            </p>
            <p className='mt-2 text-sm leading-6 text-slate-600'>
              {isChinese
                ? `先补编辑器、API 和调试三段式案例，并持续保留 ${checkedAt} 的核对记录。`
                : `Start with editor, API, and debugging cases while keeping the ${checkedAt} verification record.`}
            </p>
          </div>
        </section>

        <section className='mt-8 rounded-[20px] border border-cyan-200 bg-cyan-50/60 p-6 shadow-sm lg:p-8'>
          <p className='text-sm font-semibold uppercase tracking-wide text-cyan-700'>
            {isChinese ? '高意图路径' : 'High-intent path'}
          </p>
          <h2 className='mt-1 text-2xl font-bold text-slate-950'>
            {isChinese ? '先看对比，再回到工具页和提交页' : 'Compare first, then move into tool pages and submission'}
          </h2>
          <p className='mt-2 max-w-3xl text-sm leading-6 text-slate-600'>
            {isChinese
              ? '如果你已经知道自己在找编辑器、模型接入、自动化或可观测性，这里不要停留太久，直接去更窄的比较页。'
              : 'If you already know you are looking for editor, model-access, automation, or observability tools, do not linger here. Move straight into the narrower comparison pages.'}
          </p>
          <div className='mt-5 grid gap-3 md:grid-cols-2 xl:grid-cols-4'>
            {[
              {
                href: '/guides/ai-coding-tools-comparison',
                title: isChinese ? '编程工具对比' : 'Coding tools comparison',
                desc: isChinese ? '编辑器内工作流优先。' : 'Prioritize editor-native workflows.',
              },
              {
                href: '/guides/ai-tools-for-developers-comparison',
                title: isChinese ? '开发者工具总对比' : 'Developer tools comparison',
                desc: isChinese ? '模型、API、执行层一起看。' : 'Compare model, API, and execution layers together.',
              },
              {
                href: '/guides/ai-tools-for-automation-comparison',
                title: isChinese ? '自动化工具对比' : 'Automation tools comparison',
                desc: isChinese ? '流程编排和长期维护。' : 'Workflow orchestration and long-term maintenance.',
              },
              {
                href: '/guides/ai-tools-for-api-observability-comparison',
                title: isChinese ? 'API 可观测对比' : 'API observability comparison',
                desc: isChinese ? '日志、成本和质量治理。' : 'Logs, cost, and quality governance.',
              },
            ].map((item) => (
              <TrackableCtaLink
                key={item.href}
                href={item.href}
                ctaId={`developer_guide_${item.href.split('/').pop()}`}
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
              href='/submit'
              ctaId='developer_guide_submit_secondary'
              ctaLabel='Developer guide submit secondary'
              pageType='guide'
              className='inline-flex items-center justify-center rounded-lg bg-cyan-700 px-4 py-3 text-sm font-semibold text-white hover:bg-cyan-800'
            >
              {isChinese ? '提交你的工具' : 'Submit your tool'}
            </TrackableCtaLink>
            <TrackableCtaLink
              href='/developer/listing'
              ctaId='developer_guide_claim'
              ctaLabel='Developer guide claim'
              pageType='guide'
              className='inline-flex items-center justify-center rounded-lg border border-emerald-200 bg-white px-4 py-3 text-sm font-semibold text-emerald-800 hover:bg-emerald-50'
            >
              {isChinese ? '认领条目' : 'Claim listing'}
            </TrackableCtaLink>
          </div>
        </section>

        <section className='mt-8 grid gap-4 lg:grid-cols-[1fr_0.9fr]'>
          <div className='rounded-[18px] border border-slate-200 bg-white p-6 shadow-sm'>
            <p className='text-sm font-semibold uppercase tracking-wide text-cyan-700'>
              {isChinese ? '判断顺序' : 'How to judge'}
            </p>
            <h2 className='mt-1 text-2xl font-bold text-slate-950'>
              {isChinese ? '先看工作发生在哪一层' : 'Start with where the work actually happens'}
            </h2>
            <div className='mt-4 space-y-3'>
              {tips.map((tip) => (
                <div key={tip} className='rounded-lg bg-slate-50 p-4 text-sm leading-6 text-slate-700'>
                  <div className='flex items-start gap-3'>
                    <Workflow className='mt-0.5 size-4 shrink-0 text-emerald-600' />
                    <span>{tip}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <aside className='rounded-[18px] border border-slate-200 bg-slate-50 p-6 shadow-sm'>
            <p className='text-sm font-semibold uppercase tracking-wide text-cyan-700'>
              {isChinese ? '相关分类' : 'Start here'}
            </p>
            <h2 className='mt-1 text-2xl font-bold text-slate-950'>
              {isChinese ? '开发者工具通常在这些分类里' : 'Developer tools often sit in these categories'}
            </h2>
            <div className='mt-4 grid gap-2'>
              {categories
                .filter((category) => ['developer-tools', 'automation', 'research'].includes(String(category.slug)))
                .slice(0, 6)
                .map((category) => (
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

        <section className='mt-8 rounded-[20px] border border-cyan-200 bg-cyan-50/60 p-6 shadow-sm lg:p-8'>
          <p className='text-sm font-semibold uppercase tracking-wide text-cyan-700'>
            {isChinese ? '高意图榜单' : 'High-intent rankings'}
          </p>
          <h2 className='mt-1 text-2xl font-bold text-slate-950'>
            {isChinese
              ? '方向已明确时，直接进更窄的榜单页'
              : 'When the lane is clear, jump straight into the narrower ranking pages'}
          </h2>
          <p className='mt-2 max-w-3xl text-sm leading-6 text-slate-600'>
            {isChinese
              ? '如果你已经知道自己在比编码、审查、日志、路由、评估或 agent 工作流，榜单页会比泛开发者目录更快进入决策。'
              : 'If the decision is already about coding, review, logs, routing, evals, or agent workflow, the ranking pages get to a decision faster than a broad developer directory.'}
          </p>
          <div className='mt-5 grid gap-3 md:grid-cols-2 xl:grid-cols-3'>
            {[
              {
                href: '/best-ai-tools/ai-coding-tools',
                title: isChinese ? '编程工具榜单' : 'Coding ranking',
                desc: isChinese ? '编辑器、调试和实现效率。' : 'Editor workflows, debugging, and implementation speed.',
              },
              {
                href: '/best-ai-tools/ai-code-review-tools',
                title: isChinese ? '代码审查榜单' : 'Code review ranking',
                desc: isChinese
                  ? 'PR 理解、风险提示和 review 反馈。'
                  : 'PR understanding, risk checks, and review feedback.',
              },
              {
                href: '/best-ai-tools/ai-api-observability-tools',
                title: isChinese ? '可观测榜单' : 'Observability ranking',
                desc: isChinese ? '日志、追踪、成本和质量治理。' : 'Logs, tracing, cost, and quality governance.',
              },
              {
                href: '/best-ai-tools/ai-model-routing-tools',
                title: isChinese ? '模型路由榜单' : 'Model routing ranking',
                desc: isChinese ? '网关、回退和多模型治理。' : 'Gateways, fallbacks, and multi-model governance.',
              },
              {
                href: '/best-ai-tools/ai-prompt-testing-tools',
                title: isChinese ? 'Prompt 测试榜单' : 'Prompt testing ranking',
                desc: isChinese
                  ? '版本对比、A/B 测试和回归检查。'
                  : 'Version comparison, A/B tests, and regression checks.',
              },
              {
                href: '/best-ai-tools/ai-evals-tools',
                title: isChinese ? 'Evals 榜单' : 'Evals ranking',
                desc: isChinese
                  ? '输出评分、数据集验证和上线验收。'
                  : 'Output scoring, dataset validation, and release acceptance.',
              },
              {
                href: '/best-ai-tools/ai-agent-tools',
                title: isChinese ? 'Agent 榜单' : 'Agent ranking',
                desc: isChinese
                  ? '工具调用、执行循环和自动化控制。'
                  : 'Tool use, execution loops, and automation control.',
              },
            ].map((item) => (
              <TrackableCtaLink
                key={item.href}
                href={item.href}
                ctaId={`developer_guide_ranking_${item.href.split('/').pop()}`}
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
              href='/best-ai-tools'
              ctaId='developer_guide_rankings_hub'
              ctaLabel='Developer guide rankings hub'
              pageType='guide'
              className='inline-flex items-center justify-center rounded-lg bg-cyan-700 px-4 py-3 text-sm font-semibold text-white hover:bg-cyan-800'
            >
              {isChinese ? '打开榜单总页' : 'Open rankings hub'}
            </TrackableCtaLink>
            <TrackableCtaLink
              href='/guides/ai-tools-for-developers-comparison'
              ctaId='developer_guide_rankings_comparison'
              ctaLabel='Developer guide rankings comparison'
              pageType='guide'
              className='inline-flex items-center justify-center rounded-lg border border-cyan-200 bg-white px-4 py-3 text-sm font-semibold text-cyan-800 hover:bg-cyan-50'
            >
              {isChinese ? '继续看总对比页' : 'Continue to comparison'}
            </TrackableCtaLink>
          </div>
        </section>

        <section className='mt-8 rounded-[20px] border border-cyan-200 bg-cyan-50/60 p-6 shadow-sm lg:p-8'>
          <p className='text-sm font-semibold uppercase tracking-wide text-cyan-700'>
            {isChinese ? '直接进入对比' : 'Jump into comparison'}
          </p>
          <h2 className='mt-1 text-2xl font-bold text-slate-950'>
            {isChinese
              ? '如果你已经知道自己的工作层，就直接进下一页'
              : 'If you already know your workflow layer, go straight to the next page'}
          </h2>
          <div className='mt-4 grid gap-3 md:grid-cols-3'>
            <Link
              href='/guides/ai-tools-for-developers-comparison'
              className='rounded-xl border border-white bg-white p-4 shadow-sm hover:bg-slate-50'
            >
              <p className='text-sm font-semibold text-slate-950'>
                {isChinese ? '开发者总对比' : 'Developer comparison'}
              </p>
              <p className='mt-2 text-sm leading-6 text-slate-600'>
                {isChinese
                  ? '适合还没完全确定自己是在找编码、模型接入还是运维层工具。'
                  : 'Best if you still need a broad view across coding, model access, and ops tooling.'}
              </p>
            </Link>
            <Link
              href='/guides/ai-coding-tools-comparison'
              className='rounded-xl border border-white bg-white p-4 shadow-sm hover:bg-slate-50'
            >
              <p className='text-sm font-semibold text-slate-950'>
                {isChinese ? '编程工具对比' : 'Coding tools comparison'}
              </p>
              <p className='mt-2 text-sm leading-6 text-slate-600'>
                {isChinese
                  ? '当你的主要动作发生在编辑器里，这页更高意图。'
                  : 'A better fit when most of the work happens inside the editor.'}
              </p>
            </Link>
            <Link
              href='/categories/developer-tools?sort=popular'
              className='rounded-xl border border-white bg-white p-4 shadow-sm hover:bg-slate-50'
            >
              <p className='text-sm font-semibold text-slate-950'>{isChinese ? '开发者分类' : 'Developer category'}</p>
              <p className='mt-2 text-sm leading-6 text-slate-600'>
                {isChinese
                  ? '如果你想先浏览真实条目，再回头比较，就从这里开始。'
                  : 'Browse real listings first, then come back and compare when ready.'}
              </p>
            </Link>
          </div>
        </section>

        <section className='mt-8 rounded-[20px] border border-slate-200 bg-white p-6 shadow-sm lg:p-8'>
          <p className='text-sm font-semibold uppercase tracking-wide text-cyan-700'>
            {isChinese ? '先看这些决策点' : 'Start with these decision points'}
          </p>
          <h2 className='mt-1 text-2xl font-bold text-slate-950'>
            {isChinese ? '先判断你真实的开发工作发生在哪一层' : 'First locate where your real development work happens'}
          </h2>
          <div className='mt-4 grid gap-3 lg:grid-cols-3'>
            <div className='rounded-xl border border-slate-200 bg-slate-50 p-4'>
              <p className='text-sm font-semibold text-slate-950'>
                {isChinese ? '编辑器内编程' : 'Editor-native coding'}
              </p>
              <p className='mt-2 text-sm leading-6 text-slate-600'>
                {isChinese
                  ? '如果你的主要动作发生在 IDE 里，先看编码和重构体验，再进更窄的编程对比。'
                  : 'If your main work happens inside the IDE, start with coding and refactoring experience before narrowing down.'}
              </p>
            </div>
            <div className='rounded-xl border border-slate-200 bg-slate-50 p-4'>
              <p className='text-sm font-semibold text-slate-950'>
                {isChinese ? '模型接入与路由' : 'Model access and routing'}
              </p>
              <p className='mt-2 text-sm leading-6 text-slate-600'>
                {isChinese
                  ? '如果你要统一多模型、控成本或做切换，优先进入模型路由相关入口。'
                  : 'If you are unifying models, controlling cost, or switching providers, move first into model routing paths.'}
              </p>
            </div>
            <div className='rounded-xl border border-slate-200 bg-slate-50 p-4'>
              <p className='text-sm font-semibold text-slate-950'>
                {isChinese ? '生产与可观测性' : 'Production and observability'}
              </p>
              <p className='mt-2 text-sm leading-6 text-slate-600'>
                {isChinese
                  ? '如果已经上线，就该看日志、追踪、权限和失败处理这类真正会影响交付的东西。'
                  : 'If you are already in production, focus on logs, tracing, permissions, and failure handling.'}
              </p>
            </div>
          </div>
          <div className='mt-5 flex flex-wrap gap-3'>
            <Link
              href='/guides/ai-tools-for-developers-comparison'
              className='inline-flex items-center justify-center gap-2 rounded-lg bg-cyan-700 px-4 py-3 text-sm font-semibold text-white hover:bg-cyan-800'
            >
              {isChinese ? '进入开发者对比页' : 'Open developer comparison'}
              <ExternalLink className='size-4' />
            </Link>
            <Link
              href='/guides/ai-coding-tools-comparison'
              className='inline-flex items-center justify-center gap-2 rounded-lg border border-slate-200 bg-white px-4 py-3 text-sm font-semibold text-slate-700 hover:bg-slate-50'
            >
              {isChinese ? '看编程工具对比' : 'Coding tools comparison'}
            </Link>
            <Link
              href='/guides/ai-tools-for-model-routing-comparison'
              className='inline-flex items-center justify-center gap-2 rounded-lg border border-slate-200 bg-white px-4 py-3 text-sm font-semibold text-slate-700 hover:bg-slate-50'
            >
              {isChinese ? '看模型路由对比' : 'Model routing comparison'}
            </Link>
          </div>
        </section>

        <section className='mt-8 rounded-[18px] border border-slate-200 bg-white p-6 shadow-sm lg:p-8'>
          <p className='text-sm font-semibold uppercase tracking-wide text-cyan-700'>
            {isChinese ? '下一步怎么走' : 'Next step'}
          </p>
          <h2 className='mt-1 text-2xl font-bold text-slate-950'>
            {isChinese
              ? '把开发者入口接到比较页和真实条目'
              : 'Move from the developer guide into comparisons and real listings'}
          </h2>
          <div className='mt-4 grid gap-4 lg:grid-cols-3'>
            <Link
              href='/guides/ai-tools-for-developers-comparison'
              className='group rounded-2xl border border-slate-200 bg-slate-50 p-4 transition hover:border-cyan-200 hover:bg-white hover:shadow-sm'
            >
              <div className='flex items-start justify-between gap-3'>
                <div>
                  <p className='text-base font-semibold text-slate-950 group-hover:text-cyan-700'>
                    {isChinese ? '看开发者对比页' : 'Compare developer tools'}
                  </p>
                  <p className='mt-2 text-sm leading-6 text-slate-600'>
                    {isChinese
                      ? '如果你已经知道自己偏编码、模型接入还是可观测性，就直接对比。'
                      : 'If coding, model access, or observability is already clear, move straight into comparison.'}
                  </p>
                </div>
                <ArrowRight className='mt-1 size-4 shrink-0 text-slate-400 group-hover:text-cyan-700' />
              </div>
            </Link>
            <Link
              href='/categories/developer-tools?sort=popular'
              className='group rounded-2xl border border-slate-200 bg-slate-50 p-4 transition hover:border-cyan-200 hover:bg-white hover:shadow-sm'
            >
              <div className='flex items-start justify-between gap-3'>
                <div>
                  <p className='text-base font-semibold text-slate-950 group-hover:text-cyan-700'>
                    {isChinese ? '进入 Developer 分类' : 'Open the developer category'}
                  </p>
                  <p className='mt-2 text-sm leading-6 text-slate-600'>
                    {isChinese
                      ? '先浏览真实条目，再回来缩小候选。'
                      : 'Browse real listings first, then come back to narrow the shortlist.'}
                  </p>
                </div>
                <ArrowRight className='mt-1 size-4 shrink-0 text-slate-400 group-hover:text-cyan-700' />
              </div>
            </Link>
            <Link
              href='/explore?search=developer&sort=popular'
              className='group rounded-2xl border border-slate-200 bg-slate-50 p-4 transition hover:border-cyan-200 hover:bg-white hover:shadow-sm'
            >
              <div className='flex items-start justify-between gap-3'>
                <div>
                  <p className='text-base font-semibold text-slate-950 group-hover:text-cyan-700'>
                    {isChinese ? '搜索更多开发者工具' : 'Search more developer tools'}
                  </p>
                  <p className='mt-2 text-sm leading-6 text-slate-600'>
                    {isChinese
                      ? '如果你想扩大候选池，可以回到探索页继续看。'
                      : 'Use Explore to widen the shortlist a bit further.'}
                  </p>
                </div>
                <ArrowRight className='mt-1 size-4 shrink-0 text-slate-400 group-hover:text-cyan-700' />
              </div>
            </Link>
          </div>
        </section>

        <GuideActionSection
          locale={locale}
          eyebrow={isChinese ? '先看这些工具' : 'Recommended tools'}
          title={isChinese ? '更贴近开发者工作流的真实入口' : 'Real entry points for developer workflows'}
          description={
            isChinese
              ? '如果你要的是编码、模型接入、调试或 API 组合，这几款工具会比泛搜索更快把范围收窄。'
              : 'If your need is coding, model access, debugging, or API composition, these tools narrow the space much faster than broad search.'
          }
          toolNames={['cursor', 'openrouter', 'langfuse', 'portkey']}
          compareEyebrow={isChinese ? '继续比较' : 'Compare next'}
          compareTitle={isChinese ? '再往下的决策入口' : 'Next decision paths'}
          compareDescription={
            isChinese
              ? '开发者通常不是只选一个工具，而是先明确主要工作位置，再进入相应的对比页。'
              : 'Developers rarely choose by brand alone. It works better to pick the main workflow layer, then compare inside it.'
          }
          compareLinks={[
            {
              href: '/guides/ai-tools-for-developers-comparison',
              title: isChinese ? '开发者工具总对比' : 'Developer tools comparison',
              description: isChinese
                ? '适合先横向看编码、模型接入和 API 工具。'
                : 'A broad side-by-side look across coding, model access, and API tools.',
            },
            {
              href: '/guides/ai-coding-tools-comparison',
              title: isChinese ? '编程工具对比' : 'Coding tools comparison',
              description: isChinese
                ? '更适合编辑器内补全、重构和调试。'
                : 'Best for editor-native completion, refactoring, and debugging.',
            },
            {
              href: '/guides/ai-tools-for-model-routing-comparison',
              title: isChinese ? '模型路由工具对比' : 'Model routing comparison',
              description: isChinese
                ? '如果你真正关心的是模型切换、成本控制和 API 调度，这页更贴开发流程。'
                : 'A better fit when model switching, cost control, and API routing are the real workflow concerns.',
            },
            {
              href: '/guides/ai-tools-for-api-observability-comparison',
              title: isChinese ? 'API 可观测性工具对比' : 'API observability comparison',
              description: isChinese
                ? '更适合日志、追踪、调试和线上模型调用可见性。'
                : 'More useful for logs, tracing, debugging, and production visibility of model calls.',
            },
          ]}
          nextEyebrow={isChinese ? '下一步入口' : 'Where to go next'}
          nextTitle={isChinese ? '开发者方向确定后，下一步看这里' : 'Where to go once the developer workflow is clear'}
          nextDescription={
            isChinese
              ? '如果你已经知道自己更偏开发、接入和调试，下一步就进入开发者分类、搜索页和本周新增。'
              : 'If integration, coding, and debugging are clearly the main workflow, the next step is to enter the developer category, search results, and weekly additions.'
          }
          nextLinks={[
            {
              href: '/categories/developer-tools?sort=popular',
              title: isChinese ? '进入 Developer Tools 分类' : 'Open the developer tools category',
              description: isChinese
                ? '直接看开发者类目录中的真实候选。'
                : 'Go straight into the developer tools category for real candidates.',
            },
            {
              href: '/explore?search=developer&sort=popular',
              title: isChinese ? '搜索开发者工具' : 'Search developer tools',
              description: isChinese
                ? '回到 Explore，用更窄的开发者关键词继续找。'
                : 'Return to Explore and keep narrowing the list with developer-focused search.',
            },
            {
              href: '/new',
              title: isChinese ? '看本周新增' : 'Check new this week',
              description: isChinese
                ? '顺手看看最近补进来的开发者工具。'
                : 'See which recently added tools may fit modern developer workflows better.',
            },
          ]}
        />

        <section className='mt-8 grid gap-4 lg:grid-cols-[1fr_1fr]'>
          <div className='rounded-[18px] border border-slate-200 bg-white p-6 shadow-sm'>
            <p className='text-sm font-semibold uppercase tracking-wide text-cyan-700'>
              {isChinese ? '开发者工具看什么' : 'What matters for developer tools'}
            </p>
            <h2 className='mt-1 text-2xl font-bold text-slate-950'>
              {isChinese ? '能不能真正接进你的产品与流程' : 'Can it actually plug into your product and workflow?'}
            </h2>
            <div className='mt-4 space-y-3 text-sm leading-6 text-slate-700'>
              <p>
                {isChinese
                  ? '开发者工具真正的价值，不是“单点能力看起来很强”，而是它是否减少上下文切换、缩短接入时间，并且能长期维护。'
                  : 'The real value is not whether a single feature looks impressive, but whether it reduces context switching, shortens integration time, and stays maintainable.'}
              </p>
              <p>
                {isChinese
                  ? '如果你做的是长期产品或团队工作流，优先看模型可选性、权限、日志、可观测性和稳定接入方式。'
                  : 'For long-term products and team workflows, prioritize model optionality, permissions, logs, observability, and stable integration paths.'}
              </p>
            </div>
          </div>

          <div className='rounded-[18px] border border-slate-200 bg-white p-6 shadow-sm'>
            <p className='text-sm font-semibold uppercase tracking-wide text-cyan-700'>
              {isChinese ? '常见问题' : 'FAQ'}
            </p>
            <h2 className='mt-1 text-2xl font-bold text-slate-950'>
              {isChinese ? '开发者工具最常见的问题' : 'Common questions about developer tools'}
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
      </div>
    </>
  );
}
