import { Metadata } from 'next';
import { ArrowRight, CheckCircle2, Columns3, ExternalLink, Sparkles } from 'lucide-react';
import { getTranslations } from 'next-intl/server';

import { BASE_URL } from '@/lib/env';
import { getNoindexMetadata } from '@/lib/seo/indexing';
import { generateBreadcrumbSchema, generateFAQSchema, generateItemListSchema } from '@/lib/seo/schema';
import { getAllCategories, getLocalizedField } from '@/lib/services/categories';
import { toolToListRow } from '@/lib/services/toolPresenter';
import { getTools } from '@/lib/services/tools';
import TrackableCtaLink from '@/components/analytics/TrackableCtaLink';
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
        ? 'AI 聊天机器人对比 | AI Best Tool'
        : `AI chatbot tools comparison | ${t('title')}`,
    description:
      locale === 'cn' || locale === 'tw'
        ? '对比几款常见的 AI 聊天机器人，帮你更快选出适合的一个。'
        : 'Compare common AI chatbots to choose the one that fits you best.',
    ...getNoindexMetadata(),
  };
}

export default async function Page({ params: { locale } }: { params: { locale: string } }) {
  const isChinese = locale === 'cn' || locale === 'tw';
  const checkedAt = '2026-07-18';
  const siteUrl = BASE_URL;
  const breadcrumbSchema = generateBreadcrumbSchema([
    { name: 'Home', url: `${siteUrl}/${locale}` },
    { name: isChinese ? '指南' : 'Guides', url: `${siteUrl}/${locale}/guides` },
    {
      name: isChinese ? '聊天机器人对比' : 'Chatbot comparison',
      url: `${siteUrl}/${locale}/guides/ai-chatbot-tools-comparison`,
    },
  ]);

  const faqSchema = generateFAQSchema([
    {
      question: isChinese ? '你们比较的依据是什么？' : 'What do you compare?',
      answer: isChinese
        ? '我们主要看免费可用性、评分、更新情况、内容完整度和实际使用感。'
        : 'We compare free usability, ratings, freshness, content completeness, and practical usefulness.',
    },
    {
      question: isChinese ? '为什么只看聊天机器人？' : 'Why only chatbots?',
      answer: isChinese
        ? '因为聊天机器人是高频入口型工具，对比意图清晰，也最容易影响用户决策。'
        : 'Because chatbots are high-frequency entry tools with very clear compare intent and strong decision impact.',
    },
  ]);

  const [toolsResult, categoriesResult] = await Promise.allSettled([
    getTools({ search: 'chat', status: 'published' }, { page: 1, pageSize: 4 }, 'popular'),
    getAllCategories(true),
  ]);

  const categories = categoriesResult.status === 'fulfilled' ? categoriesResult.value : [];
  const categoryMap = new Map(categories.map((category) => [category.id, category]));
  const tools = toolsResult.status === 'fulfilled' ? toolsResult.value.data : [];
  const toolRows = tools.map((tool, index) => {
    const row = toolToListRow(tool, locale);
    return {
      ...row,
      rank: index + 1,
      pricing: tool.pricing,
      categoryLabel:
        tool.categoryId && categoryMap.has(tool.categoryId)
          ? getLocalizedField(categoryMap.get(tool.categoryId)!.name, locale)
          : '',
      averageRating: tool.averageRating,
      ratingCount: tool.ratingCount,
      summary: row.content,
    };
  });

  const itemListSchema = generateItemListSchema(
    toolRows.map((tool) => ({
      name: tool.title,
      url: `${siteUrl}/${locale}/ai/${tool.name}`,
    })),
    isChinese ? 'AI chatbot comparison' : 'AI chatbot comparison',
  );

  const tips = isChinese
    ? [
        '先看你是用来问答、写作、知识库还是团队协作，不同场景侧重点不一样。',
        '如果你想先试再买，优先看免费版本的限制和回答稳定性。',
        '更看重长期使用时，关注更新频率、评分和实际评论。',
      ]
    : [
        'Start with your use case: Q&A, writing, knowledge base, or collaboration all need different things.',
        'If you want to try before paying, focus on free-tier limits and answer reliability.',
        'For long-term use, pay attention to freshness, ratings, and real comments.',
      ];
  const quickStarts = [
    {
      href: '/best-ai-tools/ai-chatbot-tools',
      title: isChinese ? '聊天榜单' : 'Chatbot ranking',
      desc: isChinese ? '先看 shortlist，再决定最终候选。' : 'Start with the shortlist before finalizing candidates.',
    },
    {
      href: '/guides/ai-chatbot-tools',
      title: isChinese ? '聊天指南' : 'Chatbot guide',
      desc: isChinese ? '重新确认用途和判断顺序。' : 'Re-check use case and selection order.',
    },
    {
      href: '/ai/chatgpt',
      title: 'ChatGPT',
      desc: isChinese ? '通用问答和写作入口。' : 'General Q&A and writing entry point.',
    },
    {
      href: '/ai/claude',
      title: 'Claude',
      desc: isChinese ? '更适合长文档和协作写作。' : 'Good for long documents and collaborative writing.',
    },
  ];

  return (
    <>
      <StructuredDataServer data={breadcrumbSchema} />
      <StructuredDataServer data={faqSchema} />
      <StructuredDataServer data={itemListSchema} />

      <div className='theme-page mx-auto max-w-6xl px-4 py-8 lg:px-6 lg:py-12'>
        <section className='rounded-[20px] border border-slate-200 bg-white p-6 shadow-sm lg:p-10'>
          <div className='flex flex-wrap items-center gap-2'>
            <span className='inline-flex items-center gap-2 rounded-full bg-cyan-50 px-3 py-1 text-sm font-semibold text-cyan-700'>
              <Columns3 className='size-4' />
              {isChinese ? '聊天机器人对比' : 'Chatbot comparison'}
            </span>
            <span className='inline-flex items-center gap-2 rounded-full bg-slate-100 px-3 py-1 text-sm font-semibold text-slate-700'>
              <Sparkles className='size-4' />
              {isChinese ? '快速对照' : 'Quick compare'}
            </span>
          </div>

          <h1 className='mt-4 max-w-4xl text-3xl font-bold tracking-tight text-slate-950 lg:text-5xl'>
            {isChinese ? 'AI 聊天机器人对比' : 'AI chatbot comparison'}
          </h1>
          <p className='mt-4 max-w-3xl text-base leading-7 text-slate-600 lg:text-lg'>
            {isChinese
              ? '如果你已经知道自己想用聊天机器人，这一页会帮你把几款常见产品放在一起看，减少来回试错。'
              : 'If you already know you need a chatbot, this page helps you compare a few common products side by side and reduce trial-and-error.'}
          </p>

          <div className='mt-6 flex flex-wrap gap-3'>
            <TrackableCtaLink
              href='/guides/ai-chatbot-tools'
              ctaId='chatbot_comparison_guide'
              ctaLabel='Chatbot comparison guide'
              pageType='guide'
              className='inline-flex items-center justify-center gap-2 rounded-lg bg-cyan-700 px-4 py-3 text-sm font-semibold text-white hover:bg-cyan-800'
            >
              {isChinese ? '回到聊天机器人指南' : 'Back to chatbot guide'}
              <ExternalLink className='size-4' />
            </TrackableCtaLink>
            <TrackableCtaLink
              href='/best-ai-tools/ai-chatbot-tools'
              ctaId='chatbot_comparison_ranking'
              ctaLabel='Chatbot comparison ranking'
              pageType='guide'
              className='inline-flex items-center justify-center gap-2 rounded-lg border border-cyan-200 bg-cyan-50 px-4 py-3 text-sm font-semibold text-cyan-800 hover:bg-cyan-100'
            >
              {isChinese ? '看聊天榜单' : 'Open chatbot ranking'}
            </TrackableCtaLink>
            <TrackableCtaLink
              href='/explore?search=chatbot&sort=popular'
              ctaId='chatbot_comparison_browse'
              ctaLabel='Chatbot comparison browse'
              pageType='guide'
              className='inline-flex items-center justify-center gap-2 rounded-lg border border-slate-200 bg-white px-4 py-3 text-sm font-semibold text-slate-700 hover:bg-slate-50'
            >
              {isChinese ? '浏览更多聊天机器人' : 'Browse more chatbots'}
              <ArrowRight className='size-4' />
            </TrackableCtaLink>
          </div>
        </section>

        <section className='mt-8 rounded-[20px] border border-cyan-200 bg-cyan-50/60 p-6 shadow-sm lg:p-8'>
          <p className='text-sm font-semibold uppercase tracking-wide text-cyan-700'>
            {isChinese ? '高意图入口' : 'High-intent path'}
          </p>
          <h2 className='mt-1 text-2xl font-bold text-slate-950'>
            {isChinese
              ? '对比之后，回到榜单和真实候选继续收窄'
              : 'After the comparison, narrow down through the ranking and real candidates'}
          </h2>
          <div className='mt-4 grid gap-3 md:grid-cols-3'>
            <Link
              href='/best-ai-tools/ai-chatbot-tools'
              className='rounded-xl border border-white bg-white p-4 shadow-sm hover:bg-slate-50'
            >
              <p className='text-sm font-semibold text-slate-950'>{isChinese ? '聊天榜单' : 'Chatbot ranking'}</p>
              <p className='mt-2 text-sm leading-6 text-slate-600'>
                {isChinese
                  ? '先回到高相关榜单，再决定最终 shortlist。'
                  : 'Return to the highest-fit ranking before deciding on the final shortlist.'}
              </p>
            </Link>
            <Link
              href='/guides/ai-chatbot-tools'
              className='rounded-xl border border-white bg-white p-4 shadow-sm hover:bg-slate-50'
            >
              <p className='text-sm font-semibold text-slate-950'>{isChinese ? '聊天指南' : 'Chatbot guide'}</p>
              <p className='mt-2 text-sm leading-6 text-slate-600'>
                {isChinese
                  ? '如果你还想重新按场景判断，再回指南页。'
                  : 'If you want to re-check the use case framing, go back to the guide.'}
              </p>
            </Link>
            <Link
              href='/explore?search=chatbot&sort=popular'
              className='rounded-xl border border-white bg-white p-4 shadow-sm hover:bg-slate-50'
            >
              <p className='text-sm font-semibold text-slate-950'>{isChinese ? '更多候选' : 'More candidates'}</p>
              <p className='mt-2 text-sm leading-6 text-slate-600'>
                {isChinese
                  ? '如果榜单还不够，就继续在 Explore 里扩候选。'
                  : 'If the ranking is still too narrow, widen the shortlist in Explore.'}
              </p>
            </Link>
          </div>
        </section>

        <section className='mt-8 rounded-[20px] border border-cyan-200 bg-cyan-50/60 p-6 shadow-sm lg:p-8'>
          <p className='text-sm font-semibold uppercase tracking-wide text-cyan-700'>
            {isChinese ? '先看这些入口' : 'Start here'}
          </p>
          <h2 className='mt-1 text-2xl font-bold text-slate-950'>
            {isChinese ? '从榜单、指南和代表工具开始收窄' : 'Narrow from ranking, guide, and representative tools'}
          </h2>
          <div className='mt-4 grid gap-3 md:grid-cols-2 xl:grid-cols-4'>
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

        <section className='mt-8 grid gap-4 lg:grid-cols-[1fr_0.9fr]'>
          <div className='rounded-[18px] border border-slate-200 bg-white p-6 shadow-sm'>
            <p className='text-sm font-semibold uppercase tracking-wide text-cyan-700'>
              {isChinese ? '比较顺序' : 'How to compare'}
            </p>
            <h2 className='mt-1 text-2xl font-bold text-slate-950'>
              {isChinese ? '先看用途，再看知识和稳定性' : 'Start with the use case, then knowledge and reliability'}
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
              {isChinese ? '可直接进入' : 'Quick links'}
            </p>
            <h2 className='mt-1 text-2xl font-bold text-slate-950'>
              {isChinese ? '聊天机器人相关入口' : 'Chatbot-related entry points'}
            </h2>
            <div className='mt-4 grid gap-2'>
              <Link
                href='/guides'
                className='flex items-center justify-between rounded-lg border border-white bg-white px-4 py-3 text-sm text-slate-700 shadow-sm hover:bg-slate-100'
              >
                <span>{isChinese ? '指南总览' : 'Guides hub'}</span>
                <ArrowRight className='size-4 text-slate-400' />
              </Link>
              <Link
                href='/guides/best-free-ai-tools'
                className='flex items-center justify-between rounded-lg border border-white bg-white px-4 py-3 text-sm text-slate-700 shadow-sm hover:bg-slate-100'
              >
                <span>{isChinese ? '最佳免费 AI 工具' : 'Best free AI tools'}</span>
                <ArrowRight className='size-4 text-slate-400' />
              </Link>
            </div>
          </aside>
        </section>

        <GuideEvidencePanel
          locale={locale}
          checkedAt={checkedAt}
          scope={
            isChinese
              ? '先确认聊天机器人在问答、写作、知识库和协作里的真实覆盖，再继续比较。'
              : 'Check whether these chatbots truly cover Q&A, writing, knowledge base, and collaboration before continuing.'
          }
          decisionSteps={
            isChinese
              ? [
                  '先确认它是不是你真正会用的入口，而不是只会聊天。',
                  '再看知识库、写作和协作是否顺手。',
                  '最后回到真实聊天场景和评论，判断值不值得长期用。',
                ]
              : [
                  'First confirm it is a real entry point for your workflow instead of only a chat surface.',
                  'Then check knowledge base, writing, and collaboration fit.',
                  'Finally return to real chat scenarios and comments to judge long-term use.',
                ]
          }
          items={[
            {
              label: isChinese ? '主用途' : 'Primary use',
              value: isChinese ? '问答、写作、协作' : 'Q&A, writing, collaboration',
              note: isChinese
                ? '先看它是不是你真正会用的入口。'
                : 'Check whether it is a real entry point for your workflow.',
            },
            {
              label: isChinese ? '长期价值' : 'Long-term value',
              value: isChinese ? '回答稳定性、更新、评论' : 'Answer reliability, freshness, comments',
              note: isChinese ? '别只看一次回答。' : 'Do not optimize for one good answer.',
            },
            {
              label: isChinese ? '真实增量' : 'Real increments',
              value: isChinese ? '案例、场景、owner 认领' : 'Cases, use cases, owner claims',
              note: isChinese ? '把页面补成可验证的内容。' : 'Make the page more verifiable.',
            },
          ]}
          signalCards={[
            {
              label: isChinese ? '回复信号' : 'Reply signal',
              value: isChinese ? '先看回答是否稳妥清晰' : 'Check whether replies are safe and clear',
              note: isChinese ? '聊天机器人最怕答非所问。' : 'Chatbots fail when answers are off-target.',
            },
            {
              label: isChinese ? '上下文信号' : 'Context signal',
              value: isChinese ? '看能否接住对话上下文' : 'See whether it can carry the conversation context',
              note: isChinese ? '上下文接得住，体验才像真的能用。' : 'Context support is what makes it feel usable.',
            },
            {
              label: isChinese ? '协作信号' : 'Collaboration signal',
              value: isChinese ? '看知识库和人工接手是否顺手' : 'Check whether KB and human handoff are smooth',
              note: isChinese ? '真正落地常常取决于流程。' : 'Real adoption usually depends on workflow fit.',
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
                ? `这页已按真实聊天决策路径重新核对（${checkedAt}），保留问答、写作、知识库和协作入口。`
                : `This page has been rechecked against a real chatbot decision path (${checkedAt}) and keeps Q&A, writing, knowledge base, and collaboration entry points visible.`}
            </p>
          </div>
          <div>
            <p className='text-xs font-semibold uppercase tracking-wide text-cyan-700'>
              {isChinese ? '当前判断' : 'Current judgment'}
            </p>
            <p className='mt-2 text-lg font-bold text-slate-950'>
              {isChinese ? '保留索引，补真实聊天证据' : 'Keep it indexable and add real chatbot evidence'}
            </p>
            <p className='mt-2 text-sm leading-6 text-slate-600'>
              {isChinese
                ? '用场景、评论和认领信息把它和泛聊天页区分开。'
                : 'Use scenarios, comments, and claim signals to differentiate it from generic chat pages.'}
            </p>
          </div>
          <div>
            <p className='text-xs font-semibold uppercase tracking-wide text-cyan-700'>
              {isChinese ? '下一步' : 'Next step'}
            </p>
            <p className='mt-2 text-lg font-bold text-slate-950'>
              {isChinese ? '补真实对话和反馈' : 'Add real conversation examples and feedback'}
            </p>
            <p className='mt-2 text-sm leading-6 text-slate-600'>
              {isChinese
                ? '后续优先补真实问答样例、知识库接入和人工接手流程。'
                : 'Next, prioritize real Q&A examples, knowledge-base integration, and human handoff workflows.'}
            </p>
          </div>
        </section>

        <section className='mt-8'>
          <div className='mb-4 flex items-end justify-between gap-3'>
            <div>
              <p className='text-sm font-semibold uppercase tracking-wide text-cyan-700'>
                {isChinese ? '对比列表' : 'Comparison list'}
              </p>
              <h2 className='mt-1 text-2xl font-bold text-slate-950'>
                {isChinese ? '几款常见聊天机器人的快速对照' : 'A quick side-by-side look at common chatbots'}
              </h2>
            </div>
            <p className='text-sm text-slate-500'>{isChinese ? `${tools.length} 个工具` : `${tools.length} tools`}</p>
          </div>

          <div className='grid gap-4'>
            {toolRows.map((tool, index) => {
              let pricingLabel = isChinese ? '付费' : 'Paid';
              if (tool.pricing === 'free') {
                pricingLabel = isChinese ? '免费' : 'Free';
              } else if (tool.pricing === 'freemium') {
                pricingLabel = isChinese ? '免费增值' : 'Freemium';
              }
              let ratingLabel = 'N/A';
              if (isChinese) {
                ratingLabel = '暂无';
              }
              if (tool.averageRating) {
                ratingLabel = `${tool.averageRating.toFixed(1)}★`;
              }
              return (
                <div key={tool.id} className='rounded-[18px] border border-slate-200 bg-white p-5 shadow-sm'>
                  <div className='flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between'>
                    <div className='min-w-0 flex-1'>
                      <div className='flex flex-wrap items-center gap-2'>
                        <span className='inline-flex size-8 items-center justify-center rounded-full bg-cyan-50 text-sm font-bold text-cyan-700'>
                          {index + 1}
                        </span>
                        <Link
                          href={`/ai/${tool.name}`}
                          className='text-lg font-semibold text-slate-950 hover:text-cyan-700'
                        >
                          {tool.title}
                        </Link>
                        <span className='rounded-full bg-emerald-50 px-2 py-0.5 text-xs font-semibold text-emerald-700'>
                          {pricingLabel}
                        </span>
                      </div>
                      <p className='mt-2 text-sm leading-6 text-slate-600'>{tool.summary}</p>
                    </div>

                    <div className='grid gap-3 text-sm text-slate-600 lg:w-[320px] lg:grid-cols-2'>
                      <div className='rounded-xl bg-slate-50 p-3'>
                        <div className='text-xs uppercase tracking-wide text-slate-500'>
                          {isChinese ? '评分' : 'Rating'}
                        </div>
                        <div className='mt-1 font-semibold text-slate-900'>{ratingLabel}</div>
                      </div>
                      <div className='rounded-xl bg-slate-50 p-3'>
                        <div className='text-xs uppercase tracking-wide text-slate-500'>
                          {isChinese ? '评分数' : 'Reviews'}
                        </div>
                        <div className='mt-1 font-semibold text-slate-900'>{tool.ratingCount || 0}</div>
                      </div>
                      <div className='rounded-xl bg-slate-50 p-3 lg:col-span-2'>
                        <div className='text-xs uppercase tracking-wide text-slate-500'>
                          {isChinese ? '分类' : 'Category'}
                        </div>
                        <div className='mt-1 font-semibold text-slate-900'>
                          {tool.categoryLabel || (isChinese ? '未分类' : 'Uncategorized')}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </section>
        <section className='mt-8 rounded-[20px] border border-cyan-200 bg-cyan-50/60 p-6 shadow-sm lg:p-8'>
          <p className='text-sm font-semibold uppercase tracking-wide text-cyan-700'>
            {isChinese ? '高意图榜单' : 'High-intent ranking'}
          </p>
          <h2 className='mt-1 text-2xl font-bold text-slate-950'>
            {isChinese
              ? '先回榜单，再决定是否继续看聊天机器人或切到相邻入口'
              : 'Return to the ranking first, then decide whether to keep comparing chatbots or switch to an adjacent path'}
          </h2>
          <p className='mt-2 max-w-3xl text-sm leading-6 text-slate-600'>
            {isChinese
              ? '如果你已经明确要选聊天机器人，先收紧 shortlist 往往比继续横向浏览更多页面更有效。'
              : 'If chatbots are already the goal, narrowing the shortlist first is usually better than browsing more pages horizontally.'}
          </p>
          <div className='mt-5 grid gap-3 md:grid-cols-2 xl:grid-cols-4'>
            {[
              {
                href: '/best-ai-tools/ai-chatbot-tools',
                title: isChinese ? '聊天榜单' : 'Chatbot ranking',
                desc: isChinese ? '先收窄到更高相关的候选。' : 'Start with the most relevant candidates first.',
              },
              {
                href: '/guides/ai-chatbot-tools',
                title: isChinese ? '聊天指南' : 'Chatbot guide',
                desc: isChinese
                  ? '重新确认是问答、写作还是协作。'
                  : 'Re-check whether the job is Q&A, writing, or collaboration.',
              },
              {
                href: '/guides/ai-tools-for-agents-comparison',
                title: isChinese ? 'Agent 对比' : 'Agent comparison',
                desc: isChinese
                  ? '如果你要的是更偏执行和自动化的入口。'
                  : 'Useful when execution and automation matter more than plain chat.',
              },
              {
                href: '/guides/ai-writing-tools-comparison',
                title: isChinese ? '写作对比' : 'Writing comparison',
                desc: isChinese
                  ? '如果你的真实需求更偏写作和润色。'
                  : 'Better when writing and editing are the real need.',
              },
            ].map((item) => (
              <TrackableCtaLink
                key={item.href}
                href={item.href}
                ctaId={`chatbot_comparison_ranking_${item.href.split('/').pop()}`}
                ctaLabel={item.title}
                pageType='guide'
                className='rounded-xl border border-white bg-white p-4 shadow-sm hover:bg-slate-50'
              >
                <p className='text-sm font-semibold text-slate-950'>{item.title}</p>
                <p className='mt-2 text-sm leading-6 text-slate-600'>{item.desc}</p>
              </TrackableCtaLink>
            ))}
          </div>
        </section>
        <GuideSubmissionPath locale={locale} ctaPrefix='ai_chatbot_tools_comparison' />
      </div>
    </>
  );
}
