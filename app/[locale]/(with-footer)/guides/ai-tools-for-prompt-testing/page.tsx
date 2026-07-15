import { Metadata } from 'next';
import { ExternalLink, FlaskConical, Layers3, TestTube2 } from 'lucide-react';
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
  const t = await getTranslations({ locale, namespace: 'Metadata.home' });

  return {
    title:
      locale === 'cn' || locale === 'tw'
        ? 'AI Prompt 测试工具推荐 | AI Best Tool'
        : `AI tools for prompt testing | ${t('title')}`,
    description:
      locale === 'cn' || locale === 'tw'
        ? '面向提示词评估、A/B 测试、版本对比和质量验证的 AI 工具选型指南。'
        : 'A practical guide to AI tools for prompt evaluation, A/B testing, version comparison, and quality validation.',
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
    {
      name: isChinese ? 'Prompt 测试工具' : 'Prompt testing tools',
      url: `${siteUrl}/${locale}/guides/ai-tools-for-prompt-testing`,
    },
  ]);
  const faqs = [
    {
      question: isChinese ? 'Prompt 测试工具最适合做什么？' : 'What are prompt testing tools best for?',
      answer: isChinese
        ? '适合做提示词 A/B 测试、版本回归、输出质量验证、评价集对照和上线前验收。'
        : 'They are best for prompt A/B testing, version regression checks, output-quality validation, eval-set comparisons, and pre-release acceptance.',
    },
    {
      question: isChinese ? '我先看什么维度？' : 'What should I check first?',
      answer: isChinese
        ? '先看评估方式、版本管理、数据集支持和结果是否方便团队复盘。'
        : 'Start with evaluation style, versioning, dataset support, and how easily results can be reviewed by the team.',
    },
    {
      question: isChinese ? '它和可观测工具有什么区别？' : 'How is this different from observability tools?',
      answer: isChinese
        ? 'Prompt 测试更偏“上线前和迭代中的验证”，可观测更偏“上线后的请求和质量观察”。'
        : 'Prompt testing is more about validation before and during iteration, while observability leans more toward request and quality visibility after deployment.',
    },
    {
      question: isChinese ? '个人开发者需要吗？' : 'Does this matter for solo builders too?',
      answer: isChinese
        ? '需要，尤其当你开始反复改 prompt、模型和 workflow，却不想靠感觉做决定时。'
        : 'Yes, especially once you keep changing prompts, models, and workflow logic and do not want to rely on instinct alone.',
    },
  ];
  const tips = isChinese
    ? [
        '先分清你要的是 A/B 对比、回归验证，还是数据集级评估。',
        '看它是否能管理 prompt 版本，而不是只展示单次结果。',
        '如果是团队使用，优先看结果复盘、共享和评估流程是否顺手。',
      ]
    : [
        'Separate A/B comparison, regression validation, and dataset-level evaluation before comparing tools.',
        'Look for prompt version management instead of only single-run output views.',
        'For team use, prioritize how easy results are to review, share, and operationalize.',
      ];

  return (
    <>
      <StructuredDataServer data={breadcrumbSchema} />
      <StructuredDataServer data={generateFAQSchema(faqs)} />
      <div className='theme-page mx-auto max-w-6xl px-4 py-8 lg:px-6 lg:py-12'>
        <section className='rounded-[20px] border border-slate-200 bg-white p-6 shadow-sm lg:p-10'>
          <div className='flex flex-wrap items-center gap-2'>
            <span className='inline-flex items-center gap-2 rounded-full bg-cyan-50 px-3 py-1 text-sm font-semibold text-cyan-700'>
              <Layers3 className='size-4' />
              {isChinese ? 'Prompt 测试工具推荐' : 'Prompt testing tools'}
            </span>
            <span className='inline-flex items-center gap-2 rounded-full bg-slate-100 px-3 py-1 text-sm font-semibold text-slate-700'>
              <FlaskConical className='size-4' />
              {isChinese ? '验证与回归优先' : 'Validation and regression first'}
            </span>
          </div>

          <h1 className='mt-4 max-w-4xl text-3xl font-bold tracking-tight text-slate-950 lg:text-5xl'>
            {isChinese
              ? 'AI Prompt 测试工具推荐：从 A/B 对比到回归验证，怎么选更合适'
              : 'AI tools for prompt testing: how to choose for A/B tests and regression checks'}
          </h1>
          <p className='mt-4 max-w-3xl text-base leading-7 text-slate-600 lg:text-lg'>
            {isChinese
              ? 'Prompt 测试工具真正要解决的，不是“能不能跑一次结果”，而是能不能帮你系统地比较、复现和判断哪些 prompt 版本真的更好。'
              : 'Prompt testing tools are not mainly about running one output once. The real job is helping you compare, reproduce, and judge which prompt versions are actually better.'}
          </p>

          <div className='mt-6 flex flex-wrap gap-3'>
            <TrackableCtaLink
              href='/explore?search=prompt&sort=popular'
              ctaId='prompt_testing_guide_browse_tools'
              ctaLabel='Prompt testing guide browse tools'
              pageType='guide'
              className='inline-flex items-center justify-center gap-2 rounded-lg bg-cyan-700 px-4 py-3 text-sm font-semibold text-white hover:bg-cyan-800'
            >
              {isChinese ? '看 prompt 测试工具' : 'Browse prompt testing tools'}
              <ExternalLink className='size-4' />
            </TrackableCtaLink>
            <TrackableCtaLink
              href='/guides/ai-tools-for-developers'
              ctaId='prompt_testing_guide_developers'
              ctaLabel='Prompt testing guide developers'
              pageType='guide'
              className='inline-flex items-center justify-center gap-2 rounded-lg border border-slate-200 bg-white px-4 py-3 text-sm font-semibold text-slate-700 hover:bg-slate-50'
            >
              {isChinese ? '回到开发者指南' : 'Back to developer guide'}
            </TrackableCtaLink>
            <TrackableCtaLink
              href='/guides/ai-tools-for-prompt-testing-comparison'
              ctaId='prompt_testing_guide_comparison'
              ctaLabel='Prompt testing guide comparison'
              pageType='guide'
              className='inline-flex items-center justify-center gap-2 rounded-lg border border-slate-200 bg-white px-4 py-3 text-sm font-semibold text-slate-700 hover:bg-slate-50'
            >
              {isChinese ? '看 prompt 测试对比页' : 'Prompt testing comparison'}
            </TrackableCtaLink>
            <TrackableCtaLink
              href='/best-ai-tools/ai-prompt-testing-tools'
              ctaId='prompt_testing_guide_top_list'
              ctaLabel='Prompt testing guide top list'
              pageType='guide'
              className='inline-flex items-center justify-center gap-2 rounded-lg border border-cyan-200 bg-cyan-50 px-4 py-3 text-sm font-semibold text-cyan-800 hover:bg-cyan-100'
            >
              {isChinese ? '看 prompt 测试榜单' : 'Open prompt testing ranking'}
            </TrackableCtaLink>
          </div>
        </section>

        <section className='mt-8 grid gap-4 lg:grid-cols-[1fr_0.9fr]'>
          <div className='rounded-[18px] border border-slate-200 bg-white p-6 shadow-sm'>
            <p className='text-sm font-semibold uppercase tracking-wide text-cyan-700'>
              {isChinese ? '判断顺序' : 'How to judge'}
            </p>
            <h2 className='mt-1 text-2xl font-bold text-slate-950'>
              {isChinese ? '先看评估能力，再看版本管理' : 'Start with eval capability, then version control'}
            </h2>
            <div className='mt-4 space-y-3'>
              {tips.map((tip) => (
                <div key={tip} className='rounded-lg bg-slate-50 p-4 text-sm leading-6 text-slate-700'>
                  <div className='flex items-start gap-3'>
                    <TestTube2 className='mt-0.5 size-4 shrink-0 text-emerald-600' />
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
              {isChinese ? 'Prompt 测试工具通常会落在这些分类里' : 'Prompt testing tools often sit in these categories'}
            </h2>
            <div className='mt-4 grid gap-2'>
              {categories
                .filter((category) => ['developer-tools', 'research', 'automation'].includes(String(category.slug)))
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

        <GuideEvidencePanel
          locale={locale}
          checkedAt={checkedAt}
          scope={
            isChinese
              ? '这页优先检查页面是否能帮助用户完成真实 prompt 测试判断：版本对比、评估数据集、回归验证和团队复盘，而不是只看单次输出。'
              : 'This page prioritizes whether the guide helps with a real prompt-testing decision: version comparison, eval datasets, regression checks, and team retros rather than a single output.'
          }
          items={[
            {
              label: isChinese ? '判断维度' : 'Decision signals',
              value: isChinese ? '版本、数据集、回归、复盘' : 'Versioning, datasets, regression, retros',
              note: isChinese
                ? `重点看是否能把 prompt 测试变成可复现、可讨论的流程。当前可用分类数：${categoryCount}。`
                : `We care about whether prompt testing becomes repeatable and reviewable. Current category count: ${categoryCount}.`,
            },
            {
              label: isChinese ? '索引策略' : 'Indexing strategy',
              value: isChinese ? '保留可索引' : 'Keep it indexable',
              note: isChinese
                ? '让 prompt 测试意图清楚，避免和可观测页抢相似意图。'
                : 'Make the prompt-testing intent explicit so it overlaps less with observability pages.',
            },
            {
              label: isChinese ? '下一步补强' : 'Next enrichment',
              value: isChinese ? '补真实测试样本' : 'Add real test samples',
              note: isChinese
                ? `后续优先补 prompt 版本、评分案例和复盘记录，并保持 ${checkedAt} 的核对记录。`
                : `Next, priority additions are prompt versions, scoring examples, and retrospective notes while keeping the ${checkedAt} verification record.`,
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
                ? `这页已按真实 prompt 测试决策重新核对，优先保留版本、数据集和回归入口，目前覆盖 ${categoryCount} 个分类。`
                : `This page has been rechecked against a real prompt-testing decision and keeps versions, datasets, and regression entry points visible across ${categoryCount} categories.`}
            </p>
          </div>
          <div>
            <p className='text-xs font-semibold uppercase tracking-wide text-cyan-700'>
              {isChinese ? '当前判断' : 'Current judgment'}
            </p>
            <p className='mt-2 text-lg font-bold text-slate-950'>
              {isChinese ? '保留索引，强化评估流程证据' : 'Keep it indexable and strengthen eval workflow evidence'}
            </p>
            <p className='mt-2 text-sm leading-6 text-slate-600'>
              {isChinese
                ? '用版本对比、评分样例和复盘记录区分它与可观测页。'
                : 'Use version comparisons, scoring examples, and retrospective notes to distinguish it from observability pages.'}
            </p>
          </div>
          <div>
            <p className='text-xs font-semibold uppercase tracking-wide text-cyan-700'>
              {isChinese ? '下一步' : 'Next step'}
            </p>
            <p className='mt-2 text-lg font-bold text-slate-950'>
              {isChinese ? '补真实测试样本和复盘' : 'Add real test samples and retros'}
            </p>
            <p className='mt-2 text-sm leading-6 text-slate-600'>
              {isChinese
                ? '后续优先补 prompt 版本、评分案例和团队复盘。'
                : 'Next, prioritize prompt versions, scoring cases, and team retros.'}
            </p>
          </div>
        </section>

        <GuideActionSection
          locale={locale}
          eyebrow={isChinese ? '先看这些工具' : 'Recommended tools'}
          title={
            isChinese ? '更贴近 prompt 验证与评估工作流的入口' : 'Real entry points for prompt validation workflows'
          }
          description={
            isChinese
              ? '如果你关心的是 prompt 版本、评估数据集和回归验证，这几款工具会比泛开发者页更快进入正题。'
              : 'If prompt versions, eval datasets, and regression checks matter most, these tools narrow the field faster than a broad developer page.'
          }
          toolNames={['langfuse', 'langsmith', 'helicone', 'portkey']}
          compareEyebrow={isChinese ? '继续比较' : 'Compare next'}
          compareTitle={isChinese ? 'Prompt 测试意图更强的下一步入口' : 'Next paths for stronger prompt-testing intent'}
          compareDescription={
            isChinese
              ? '当你已经明确自己在找 prompt 验证工具，而不是泛 API 或调试工具，继续进入更窄的比较页会更有效。'
              : 'Once the real job is prompt validation rather than broad API or debugging tooling, narrower comparison pages work better.'
          }
          compareLinks={[
            {
              href: '/guides/ai-tools-for-prompt-testing-comparison',
              title: isChinese ? 'Prompt 测试工具对比' : 'Prompt testing comparison',
              description: isChinese
                ? '适合直接横向看评估、版本和回归能力。'
                : 'A direct side-by-side path for evals, versioning, and regression capability.',
            },
            {
              href: '/best-ai-tools/ai-prompt-testing-tools',
              title: isChinese ? 'Prompt 测试榜单' : 'Prompt testing ranking',
              description: isChinese
                ? '适合已经确认方向、只想快速缩小 shortlist 的用户。'
                : 'Useful when the direction is clear and the goal is to narrow the shortlist faster.',
            },
            {
              href: '/guides/ai-tools-for-api-observability-comparison',
              title: isChinese ? 'API 可观测工具对比' : 'API observability comparison',
              description: isChinese
                ? '如果你发现真正需求更偏请求日志和质量观察，这页更合适。'
                : 'More useful if the real decision shifts toward request logs and quality visibility.',
            },
            {
              href: '/guides/ai-tools-for-model-routing-comparison',
              title: isChinese ? '模型路由工具对比' : 'Model routing comparison',
              description: isChinese
                ? '如果你发现问题在模型切换与成本治理，这页更贴近目标。'
                : 'Move there if the real decision is more about model switching and cost governance.',
            },
          ]}
        />

        <section className='mt-8 rounded-[20px] border border-cyan-200 bg-cyan-50/60 p-6 shadow-sm lg:p-8'>
          <p className='text-sm font-semibold uppercase tracking-wide text-cyan-700'>
            {isChinese ? '高意图榜单' : 'High-intent ranking'}
          </p>
          <h2 className='mt-1 text-2xl font-bold text-slate-950'>
            {isChinese
              ? '先用榜单缩小 prompt testing shortlist'
              : 'Use the ranking to narrow your prompt testing shortlist first'}
          </h2>
          <p className='mt-2 max-w-3xl text-sm leading-6 text-slate-600'>
            {isChinese
              ? '如果你已经知道自己要比的是 prompt 版本、回归和评估流程，榜单页会比泛目录更快进入决策。'
              : 'If the decision is already about prompt versions, regression checks, and eval workflow, the ranking page gets to a decision faster than a broad directory.'}
          </p>
          <div className='mt-5 flex flex-wrap gap-3'>
            <TrackableCtaLink
              href='/best-ai-tools/ai-prompt-testing-tools'
              ctaId='prompt_testing_guide_ranking_primary'
              ctaLabel='Prompt testing guide ranking primary'
              pageType='guide'
              className='inline-flex items-center justify-center rounded-lg bg-cyan-700 px-4 py-3 text-sm font-semibold text-white hover:bg-cyan-800'
            >
              {isChinese ? '进入 prompt 测试榜单' : 'Open prompt testing ranking'}
            </TrackableCtaLink>
            <TrackableCtaLink
              href='/guides/ai-tools-for-prompt-testing-comparison'
              ctaId='prompt_testing_guide_ranking_secondary'
              ctaLabel='Prompt testing guide ranking secondary'
              pageType='guide'
              className='inline-flex items-center justify-center rounded-lg border border-cyan-200 bg-white px-4 py-3 text-sm font-semibold text-cyan-800 hover:bg-cyan-50'
            >
              {isChinese ? '继续看对比页' : 'Continue to comparison'}
            </TrackableCtaLink>
          </div>
        </section>

        <section className='mt-8 rounded-[18px] border border-cyan-200 bg-cyan-50/60 p-6 shadow-sm lg:p-8'>
          <p className='text-sm font-semibold uppercase tracking-wide text-cyan-700'>
            {isChinese ? '高意图榜单' : 'High-intent ranking'}
          </p>
          <h2 className='mt-1 text-2xl font-bold text-slate-950'>
            {isChinese
              ? '先用榜单缩小 prompt testing shortlist'
              : 'Use the ranking to narrow your prompt testing shortlist first'}
          </h2>
          <p className='mt-2 max-w-3xl text-sm leading-6 text-slate-600'>
            {isChinese
              ? '如果你已经知道自己要比的是 prompt 版本、回归和评估流程，榜单页会比泛目录更快进入决策。'
              : 'If the decision is already about prompt versions, regression checks, and eval workflow, the ranking page gets to a decision faster than a broad directory.'}
          </p>
          <div className='mt-5 flex flex-wrap gap-3'>
            <TrackableCtaLink
              href='/best-ai-tools/ai-prompt-testing-tools'
              ctaId='prompt_testing_guide_ranking_primary'
              ctaLabel='Prompt testing guide ranking primary'
              pageType='guide'
              className='inline-flex items-center justify-center rounded-lg bg-cyan-700 px-4 py-3 text-sm font-semibold text-white hover:bg-cyan-800'
            >
              {isChinese ? '进入 prompt 测试榜单' : 'Open prompt testing ranking'}
            </TrackableCtaLink>
            <TrackableCtaLink
              href='/guides/ai-tools-for-prompt-testing-comparison'
              ctaId='prompt_testing_guide_ranking_secondary'
              ctaLabel='Prompt testing guide ranking secondary'
              pageType='guide'
              className='inline-flex items-center justify-center rounded-lg border border-cyan-200 bg-white px-4 py-3 text-sm font-semibold text-cyan-800 hover:bg-cyan-50'
            >
              {isChinese ? '继续看对比页' : 'Continue to comparison'}
            </TrackableCtaLink>
          </div>
        </section>

        <section className='mt-8 grid gap-4 lg:grid-cols-[1fr_1fr]'>
          <div className='rounded-[18px] border border-slate-200 bg-white p-6 shadow-sm'>
            <p className='text-sm font-semibold uppercase tracking-wide text-cyan-700'>
              {isChinese ? 'Prompt 测试工具看什么' : 'What matters for prompt testing tools'}
            </p>
            <h2 className='mt-1 text-2xl font-bold text-slate-950'>
              {isChinese ? '能不能稳定比较 prompt 版本' : 'Can it reliably compare prompt versions?'}
            </h2>
            <div className='mt-4 space-y-3 text-sm leading-6 text-slate-700'>
              <p>
                {isChinese
                  ? '最重要的是它能不能把 prompt、模型、数据集和结果绑定起来，而不是只展示一堆分散输出。'
                  : 'The key is whether the tool can bind prompts, models, datasets, and results together instead of only showing scattered outputs.'}
              </p>
              <p>
                {isChinese
                  ? '如果是团队使用，优先看版本管理、复盘流程和评估结果共享。'
                  : 'For team use, prioritize version control, result review workflows, and sharing of eval outcomes.'}
              </p>
            </div>
          </div>

          <div className='rounded-[18px] border border-slate-200 bg-white p-6 shadow-sm'>
            <p className='text-sm font-semibold uppercase tracking-wide text-cyan-700'>
              {isChinese ? '常见问题' : 'FAQ'}
            </p>
            <h2 className='mt-1 text-2xl font-bold text-slate-950'>
              {isChinese ? 'Prompt 测试工具最常见的问题' : 'Common questions about prompt testing tools'}
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
        <GuideSubmissionPath locale={locale} ctaPrefix='ai_tools_for_prompt_testing' />
      </div>
    </>
  );
}
