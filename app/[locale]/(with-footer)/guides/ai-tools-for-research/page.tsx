import { Metadata } from 'next';
import Link from 'next/link';
import { ArrowRight, ExternalLink, FileSearch, Search, ShieldCheck } from 'lucide-react';
import { getTranslations } from 'next-intl/server';

import { generateBreadcrumbSchema, generateFAQSchema } from '@/lib/seo/schema';
import { getAllCategories, getLocalizedField } from '@/lib/services/categories';
import GuideActionSection from '@/components/guides/GuideActionSection';
import { StructuredDataServer } from '@/components/seo/StructuredData';

export async function generateMetadata({ params: { locale } }: { params: { locale: string } }): Promise<Metadata> {
  const t = await getTranslations({ locale, namespace: 'Metadata.home' });

  return {
    title:
      locale === 'cn' || locale === 'tw' ? 'AI 研究工具推荐 | AI Best Tool' : `AI tools for research | ${t('title')}`,
    description:
      locale === 'cn' || locale === 'tw'
        ? '面向资料检索、信息核对、证据整理和研究工作流的 AI 工具指南。'
        : 'A practical guide to AI tools for research, evidence-checking, analysis, and information discovery.',
  };
}

export default async function Page({ params: { locale } }: { params: { locale: string } }) {
  const isChinese = locale === 'cn' || locale === 'tw';
  const categories = await getAllCategories(true).catch(() => []);
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000';
  const breadcrumbSchema = generateBreadcrumbSchema([
    { name: 'Home', url: `${siteUrl}/${locale}` },
    { name: isChinese ? '指南' : 'Guides', url: `${siteUrl}/${locale}/guides` },
    { name: isChinese ? '研究工具' : 'Research tools', url: `${siteUrl}/${locale}/guides/ai-tools-for-research` },
  ]);
  const faqs = [
    {
      question: isChinese ? 'AI 研究工具最适合做什么？' : 'What are AI research tools best for?',
      answer: isChinese
        ? '它们最适合做资料发现、快速概览、信息核对、竞品扫描、主题理解和建立研究起点。'
        : 'They are best for discovery, quick overviews, evidence-checking, competitive scanning, topic understanding, and building a research starting point.',
    },
    {
      question: isChinese ? '研究工具和聊天工具有什么区别？' : 'How are research tools different from chat tools?',
      answer: isChinese
        ? '研究工具更强调来源、证据、检索效率和信息发现；聊天工具更强调生成、对话和综合输出。'
        : 'Research tools emphasize sources, evidence, discovery, and retrieval speed, while chat tools focus more on generation, conversation, and synthesis.',
    },
    {
      question: isChinese ? '我应该先看什么？' : 'What should I check first?',
      answer: isChinese
        ? '先看它是否能帮你更快找到可靠信息，再看输出是否带来源、是否适合你的研究深度和工作流。'
        : 'Start with whether it helps you find reliable information faster, then check source visibility, depth, and workflow fit.',
    },
    {
      question: isChinese ? '免费版够用吗？' : 'Is a free tier enough?',
      answer: isChinese
        ? '轻量调研通常够用，但如果你做高频跟踪、深度分析或团队协作，通常会更快遇到限制。'
        : 'Free tiers can be enough for light research, but deeper analysis, frequent tracking, and team workflows usually hit limits faster.',
    },
  ];
  const tips = isChinese
    ? [
        '先分清你是做资料发现、证据核对，还是深度分析。',
        '优先看来源是否透明、信息是否能回溯，而不只是回答是否“像真的”。',
        '如果你会反复做研究，重点看收藏、导出、历史记录和后续整理能力。',
      ]
    : [
        'Separate discovery, evidence-checking, and deeper analysis before comparing tools.',
        'Prioritize source transparency and traceability, not only whether the answer sounds convincing.',
        'If research is repeatable work, focus on exports, saved history, and downstream organization.',
      ];

  return (
    <>
      <StructuredDataServer data={breadcrumbSchema} />
      <StructuredDataServer data={generateFAQSchema(faqs)} />
      <div className='theme-page mx-auto max-w-6xl px-4 py-8 lg:px-6 lg:py-12'>
        <section className='rounded-[20px] border border-slate-200 bg-white p-6 shadow-sm lg:p-10'>
          <div className='flex flex-wrap items-center gap-2'>
            <span className='inline-flex items-center gap-2 rounded-full bg-cyan-50 px-3 py-1 text-sm font-semibold text-cyan-700'>
              <Search className='size-4' />
              {isChinese ? '研究工具推荐' : 'Research tools'}
            </span>
            <span className='inline-flex items-center gap-2 rounded-full bg-slate-100 px-3 py-1 text-sm font-semibold text-slate-700'>
              <ShieldCheck className='size-4' />
              {isChinese ? '来源与证据优先' : 'Evidence-first'}
            </span>
          </div>

          <h1 className='mt-4 max-w-4xl text-3xl font-bold tracking-tight text-slate-950 lg:text-5xl'>
            {isChinese
              ? 'AI 研究工具推荐：怎么选更适合资料发现和证据核对'
              : 'AI tools for research: how to choose for discovery and evidence-checking'}
          </h1>
          <p className='mt-4 max-w-3xl text-base leading-7 text-slate-600 lg:text-lg'>
            {isChinese
              ? '研究工具的价值不只是“能回答问题”，而是能不能帮你更快发现信息、核对来源，并建立可继续深入的研究路径。'
              : 'The value of research tools is not only that they answer questions. It is whether they help you discover information faster, verify sources, and build a path for deeper analysis.'}
          </p>

          <div className='mt-6 flex flex-wrap gap-3'>
            <Link
              href='/explore?search=research&sort=popular'
              className='inline-flex items-center justify-center gap-2 rounded-lg bg-cyan-700 px-4 py-3 text-sm font-semibold text-white hover:bg-cyan-800'
            >
              {isChinese ? '看研究类工具' : 'Browse research tools'}
              <ExternalLink className='size-4' />
            </Link>
            <Link
              href='/guides/ai-seo-tools'
              className='inline-flex items-center justify-center gap-2 rounded-lg border border-slate-200 bg-white px-4 py-3 text-sm font-semibold text-slate-700 hover:bg-slate-50'
            >
              {isChinese ? '看 SEO 研究工具' : 'SEO research tools'}
            </Link>
            <Link
              href='/guides/ai-tools-for-crypto-research'
              className='inline-flex items-center justify-center gap-2 rounded-lg border border-slate-200 bg-white px-4 py-3 text-sm font-semibold text-slate-700 hover:bg-slate-50'
            >
              {isChinese ? '看 Crypto 研究工具' : 'Crypto research tools'}
            </Link>
          </div>
        </section>

        <section className='mt-8 grid gap-4 lg:grid-cols-[1fr_0.9fr]'>
          <div className='rounded-[18px] border border-slate-200 bg-white p-6 shadow-sm'>
            <p className='text-sm font-semibold uppercase tracking-wide text-cyan-700'>
              {isChinese ? '判断顺序' : 'How to judge'}
            </p>
            <h2 className='mt-1 text-2xl font-bold text-slate-950'>
              {isChinese ? '先看来源，再看输出' : 'Start with sources, then the output'}
            </h2>
            <div className='mt-4 space-y-3'>
              {tips.map((tip) => (
                <div key={tip} className='rounded-lg bg-slate-50 p-4 text-sm leading-6 text-slate-700'>
                  <div className='flex items-start gap-3'>
                    <FileSearch className='mt-0.5 size-4 shrink-0 text-emerald-600' />
                    <span>{tip}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <aside className='rounded-[18px] border border-slate-200 bg-slate-50 p-6 shadow-sm'>
            <p className='text-sm font-semibold uppercase tracking-wide text-cyan-700'>
              {isChinese ? '相关入口' : 'Start here'}
            </p>
            <h2 className='mt-1 text-2xl font-bold text-slate-950'>
              {isChinese ? '研究类工具通常在这些分类里' : 'Research tools often sit in these categories'}
            </h2>
            <div className='mt-4 grid gap-2'>
              {categories
                .filter((category) => ['research', 'web3', 'text-writing'].includes(String(category.slug)))
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

        <section className='mt-8 rounded-[18px] border border-slate-200 bg-white p-6 shadow-sm lg:p-8'>
          <p className='text-sm font-semibold uppercase tracking-wide text-cyan-700'>
            {isChinese ? '下一步怎么走' : 'Next step'}
          </p>
          <h2 className='mt-1 text-2xl font-bold text-slate-950'>
            {isChinese
              ? '把研究入口接到比较页和真实条目'
              : 'Move from the research guide into comparisons and real listings'}
          </h2>
          <div className='mt-4 grid gap-4 lg:grid-cols-3'>
            <Link
              href='/guides/ai-tools-for-research-comparison'
              className='group rounded-2xl border border-slate-200 bg-slate-50 p-4 transition hover:border-cyan-200 hover:bg-white hover:shadow-sm'
            >
              <div className='flex items-start justify-between gap-3'>
                <div>
                  <p className='text-base font-semibold text-slate-950 group-hover:text-cyan-700'>
                    {isChinese ? '看研究工具对比' : 'Compare research tools'}
                  </p>
                  <p className='mt-2 text-sm leading-6 text-slate-600'>
                    {isChinese
                      ? '如果你已经知道自己在找资料发现或证据核对工具，就直接进对比。'
                      : 'If discovery or evidence-checking is clear already, move straight into comparison.'}
                  </p>
                </div>
                <ArrowRight className='mt-1 size-4 shrink-0 text-slate-400 group-hover:text-cyan-700' />
              </div>
            </Link>
            <Link
              href='/categories/research?sort=popular'
              className='group rounded-2xl border border-slate-200 bg-slate-50 p-4 transition hover:border-cyan-200 hover:bg-white hover:shadow-sm'
            >
              <div className='flex items-start justify-between gap-3'>
                <div>
                  <p className='text-base font-semibold text-slate-950 group-hover:text-cyan-700'>
                    {isChinese ? '进入 Research 分类' : 'Open the research category'}
                  </p>
                  <p className='mt-2 text-sm leading-6 text-slate-600'>
                    {isChinese
                      ? '先看真实条目，再回来收敛到更窄的候选集。'
                      : 'Inspect real listings first, then come back to narrow the shortlist.'}
                  </p>
                </div>
                <ArrowRight className='mt-1 size-4 shrink-0 text-slate-400 group-hover:text-cyan-700' />
              </div>
            </Link>
            <Link
              href='/explore?search=research&sort=popular'
              className='group rounded-2xl border border-slate-200 bg-slate-50 p-4 transition hover:border-cyan-200 hover:bg-white hover:shadow-sm'
            >
              <div className='flex items-start justify-between gap-3'>
                <div>
                  <p className='text-base font-semibold text-slate-950 group-hover:text-cyan-700'>
                    {isChinese ? '搜索更多研究工具' : 'Search more research tools'}
                  </p>
                  <p className='mt-2 text-sm leading-6 text-slate-600'>
                    {isChinese
                      ? '如果你要扩大候选池，可以回到探索页继续找。'
                      : 'Use Explore to widen the shortlist a little further.'}
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
          title={isChinese ? '更适合研究型工作的工具入口' : 'Tool entry points that fit research-heavy work'}
          description={
            isChinese
              ? '如果你现在是为了资料发现、证据核对、竞品分析或信息整理而来，先从这几类真实工具开始更容易建立判断。'
              : 'If you are here for discovery, evidence-checking, competitor analysis, or information synthesis, these tools are the fastest way to build context.'
          }
          toolNames={['perplexity', 'consensus', 'scite', 'notebooklm']}
          compareEyebrow={isChinese ? '继续比较' : 'Compare next'}
          compareTitle={isChinese ? '再往下走的对比入口' : 'Next comparison paths'}
          compareDescription={
            isChinese
              ? '当你已经明确研究方向后，继续进入更窄的对比页，会比泛泛浏览更快。'
              : 'Once your research direction is clearer, narrower comparison pages are usually more useful than broad browsing.'
          }
          compareLinks={[
            {
              href: '/guides/ai-tools-for-research-comparison',
              title: isChinese ? '研究工具总对比' : 'Research tools comparison',
              description: isChinese
                ? '适合先快速横向看几款常见研究工具。'
                : 'A fast side-by-side entry for common research tools.',
            },
            {
              href: '/guides/ai-seo-tools-comparison',
              title: isChinese ? 'SEO 研究工具对比' : 'SEO research tools comparison',
              description: isChinese
                ? '适合关键词、SERP 和网站结构研究。'
                : 'Best for keywords, SERP analysis, and site structure research.',
            },
            {
              href: '/guides/ai-tools-for-crypto-research-comparison',
              title: isChinese ? 'Crypto 研究工具对比' : 'Crypto research tools comparison',
              description: isChinese
                ? '适合链上信息、项目和 narrative 跟踪。'
                : 'Best for on-chain, project, and narrative-driven research.',
            },
          ]}
          nextEyebrow={isChinese ? '下一步入口' : 'Where to go next'}
          nextTitle={isChinese ? '读完研究指南后，继续这样往下走' : 'How to continue after the research guide'}
          nextDescription={
            isChinese
              ? '如果你已经确认自己更偏资料发现和证据核对，下一步就回到研究分类、搜索页和本周新增。'
              : 'If discovery and evidence-checking are clearly your use case, move next into research categories, search results, and weekly additions.'
          }
          nextLinks={[
            {
              href: '/categories/research?sort=popular',
              title: isChinese ? '进入 Research 分类' : 'Open the research category',
              description: isChinese
                ? '直接进入研究类目录，继续看更贴合的真实工具。'
                : 'Open the research category to keep comparing better-matched tools.',
            },
            {
              href: '/explore?search=research&sort=popular',
              title: isChinese ? '搜索研究工具' : 'Search research tools',
              description: isChinese
                ? '用关键词回到 Explore 扩大候选范围。'
                : 'Use a research-focused query in Explore to widen the shortlist.',
            },
            {
              href: '/new',
              title: isChinese ? '看本周新增' : 'Check new this week',
              description: isChinese
                ? '看看最近补进站里的研究类工具有没有更新选择。'
                : 'See whether recent additions introduced better research-oriented options.',
            },
          ]}
        />

        <section className='mt-8 grid gap-4 lg:grid-cols-[1fr_1fr]'>
          <div className='rounded-[18px] border border-slate-200 bg-white p-6 shadow-sm'>
            <p className='text-sm font-semibold uppercase tracking-wide text-cyan-700'>
              {isChinese ? '研究工具看什么' : 'What matters for research tools'}
            </p>
            <h2 className='mt-1 text-2xl font-bold text-slate-950'>
              {isChinese ? '能不能帮你更快得到可信结论' : 'Can it help you reach trustworthy conclusions faster?'}
            </h2>
            <div className='mt-4 space-y-3 text-sm leading-6 text-slate-700'>
              <p>
                {isChinese
                  ? '研究型工具最重要的不是回答“像不像”，而是信息来源是否清楚、范围是否够广，以及后续能不能继续追下去。'
                  : 'The key is not whether the answer sounds convincing, but whether the source is clear, the coverage is broad enough, and the workflow lets you keep digging.'}
              </p>
              <p>
                {isChinese
                  ? '如果你做竞品、SEO、市场、Crypto 或知识型调研，优先看来源可回溯、收藏整理和导出能力。'
                  : 'For SEO, competitive, market, crypto, or knowledge-heavy research, prioritize traceable sources, saved context, and export paths.'}
              </p>
            </div>
          </div>

          <div className='rounded-[18px] border border-slate-200 bg-white p-6 shadow-sm'>
            <p className='text-sm font-semibold uppercase tracking-wide text-cyan-700'>
              {isChinese ? '常见问题' : 'FAQ'}
            </p>
            <h2 className='mt-1 text-2xl font-bold text-slate-950'>
              {isChinese ? '研究工具最常见的问题' : 'Common questions about research tools'}
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
