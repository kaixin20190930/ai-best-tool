import { Metadata } from 'next';
import Link from 'next/link';
import { ExternalLink, GitPullRequest, Layers3, ShieldAlert } from 'lucide-react';
import { getTranslations } from 'next-intl/server';

import { generateBreadcrumbSchema, generateFAQSchema } from '@/lib/seo/schema';
import { getAllCategories, getLocalizedField } from '@/lib/services/categories';
import GuideActionSection from '@/components/guides/GuideActionSection';
import GuideSubmissionPath from '@/components/guides/GuideSubmissionPath';
import { StructuredDataServer } from '@/components/seo/StructuredData';

export async function generateMetadata({ params: { locale } }: { params: { locale: string } }): Promise<Metadata> {
  const t = await getTranslations({ locale, namespace: 'Metadata.home' });

  return {
    title:
      locale === 'cn' || locale === 'tw'
        ? 'AI 代码审查工具推荐 | AI Best Tool'
        : `AI tools for code review | ${t('title')}`,
    description:
      locale === 'cn' || locale === 'tw'
        ? '面向 PR 审查、变更解释、代码风险提示和团队反馈的 AI 工具选型指南。'
        : 'A practical guide to AI tools for PR review, change explanation, code risk checks, and team feedback.',
  };
}

export default async function Page({ params: { locale } }: { params: { locale: string } }) {
  const isChinese = locale === 'cn' || locale === 'tw';
  const categories = await getAllCategories(true).catch(() => []);
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000';
  const breadcrumbSchema = generateBreadcrumbSchema([
    { name: 'Home', url: `${siteUrl}/${locale}` },
    { name: isChinese ? '指南' : 'Guides', url: `${siteUrl}/${locale}/guides` },
    {
      name: isChinese ? '代码审查工具' : 'Code review tools',
      url: `${siteUrl}/${locale}/guides/ai-tools-for-code-review`,
    },
  ]);
  const faqs = [
    {
      question: isChinese ? '代码审查工具最适合做什么？' : 'What are code review tools best for?',
      answer: isChinese
        ? '适合 PR 初筛、变更总结、风险提示、review comment 草稿和帮助团队更快看懂改动。'
        : 'They work best for PR triage, change summaries, risk flags, draft review comments, and helping teams understand changes faster.',
    },
    {
      question: isChinese ? '我先看什么维度？' : 'What should I check first?',
      answer: isChinese
        ? '先看它能不能贴近真实代码上下文，再看 review 建议是否具体、是否会产生太多噪音。'
        : 'Start with how close it stays to real code context, then judge whether the review suggestions are specific without adding too much noise.',
    },
    {
      question: isChinese ? '它和普通 AI 编程工具有什么区别？' : 'How is this different from a generic coding tool?',
      answer: isChinese
        ? '重点不只是生成代码，而是能不能围绕差异、风险和团队协作给出可执行反馈。'
        : 'The focus is not just generating code, but whether the tool can give actionable feedback around diffs, risks, and team collaboration.',
    },
    {
      question: isChinese ? '适合个人开发者吗？' : 'Does this matter for solo developers too? ',
      answer: isChinese
        ? '适合，尤其当你想在提交前做一次“第二双眼睛”检查时。'
        : 'Yes, especially when you want a second set of eyes before merging or shipping.',
    },
  ];
  const tips = isChinese
    ? [
        '先分清你要的是 PR 解释、风险检查，还是团队协作反馈。',
        '看它是否能围绕 diff、文件上下文和项目结构给建议，而不是泛泛而谈。',
        '对团队来说，比“会不会说”更重要的是噪音控制和评论可执行性。',
      ]
    : [
        'Separate PR explanation, risk checking, and collaboration feedback before comparing tools.',
        'Look for suggestions grounded in diffs, file context, and project structure rather than generic advice.',
        'For teams, noise control and actionable comments matter more than flashy output.',
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
              {isChinese ? '代码审查工具推荐' : 'Code review tools'}
            </span>
            <span className='inline-flex items-center gap-2 rounded-full bg-slate-100 px-3 py-1 text-sm font-semibold text-slate-700'>
              <GitPullRequest className='size-4' />
              {isChinese ? 'PR 与风险优先' : 'PR and risk first'}
            </span>
          </div>

          <h1 className='mt-4 max-w-4xl text-3xl font-bold tracking-tight text-slate-950 lg:text-5xl'>
            {isChinese
              ? 'AI 代码审查工具推荐：从 PR 初筛到风险提示，怎么选更合适'
              : 'AI tools for code review: how to choose for PR triage and risk checks'}
          </h1>
          <p className='mt-4 max-w-3xl text-base leading-7 text-slate-600 lg:text-lg'>
            {isChinese
              ? '代码审查工具真正要解决的，不是“会不会写代码”，而是能不能更快帮助你看懂改动、发现风险并给出更稳的反馈。'
              : 'Code review tools are not mainly about writing code. The real job is helping you understand changes faster, spot risk, and give steadier feedback.'}
          </p>

          <div className='mt-6 flex flex-wrap gap-3'>
            <Link
              href='/explore?search=code%20review&sort=popular'
              className='inline-flex items-center justify-center gap-2 rounded-lg bg-cyan-700 px-4 py-3 text-sm font-semibold text-white hover:bg-cyan-800'
            >
              {isChinese ? '看代码审查工具' : 'Browse code review tools'}
              <ExternalLink className='size-4' />
            </Link>
            <Link
              href='/guides/ai-tools-for-developers'
              className='inline-flex items-center justify-center gap-2 rounded-lg border border-slate-200 bg-white px-4 py-3 text-sm font-semibold text-slate-700 hover:bg-slate-50'
            >
              {isChinese ? '回到开发者指南' : 'Back to developer guide'}
            </Link>
            <Link
              href='/guides/ai-tools-for-code-review-comparison'
              className='inline-flex items-center justify-center gap-2 rounded-lg border border-slate-200 bg-white px-4 py-3 text-sm font-semibold text-slate-700 hover:bg-slate-50'
            >
              {isChinese ? '看代码审查对比页' : 'Code review comparison'}
            </Link>
          </div>
        </section>

        <section className='mt-8 grid gap-4 lg:grid-cols-[1fr_0.9fr]'>
          <div className='rounded-[18px] border border-slate-200 bg-white p-6 shadow-sm'>
            <p className='text-sm font-semibold uppercase tracking-wide text-cyan-700'>
              {isChinese ? '判断顺序' : 'How to judge'}
            </p>
            <h2 className='mt-1 text-2xl font-bold text-slate-950'>
              {isChinese ? '先看上下文理解，再看反馈质量' : 'Start with context understanding, then feedback quality'}
            </h2>
            <div className='mt-4 space-y-3'>
              {tips.map((tip) => (
                <div key={tip} className='rounded-lg bg-slate-50 p-4 text-sm leading-6 text-slate-700'>
                  <div className='flex items-start gap-3'>
                    <ShieldAlert className='mt-0.5 size-4 shrink-0 text-emerald-600' />
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
              {isChinese ? '代码审查工具通常会落在这些分类里' : 'Code review tools often sit in these categories'}
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

        <GuideActionSection
          locale={locale}
          eyebrow={isChinese ? '先看这些工具' : 'Recommended tools'}
          title={isChinese ? '更贴近 PR 与 review 工作流的入口' : 'Real entry points for PR and review workflows'}
          description={
            isChinese
              ? '如果你关心的是变更理解、review 反馈和 merge 前检查，这几款工具会比泛编程页更快进入状态。'
              : 'If the real need is change understanding, review feedback, and pre-merge checks, these tools narrow the field faster than a broad coding page.'
          }
          toolNames={['cursor', 'claude', 'phind', 'chatgpt']}
          compareEyebrow={isChinese ? '继续比较' : 'Compare next'}
          compareTitle={isChinese ? '代码审查意图更强的下一步入口' : 'Next paths for stronger code-review intent'}
          compareDescription={
            isChinese
              ? '当你已经明确自己是在找 review 辅助，而不是泛编码助手，继续进入更窄的比较页会更有效。'
              : 'Once the job is clearly review assistance rather than broad coding help, narrower comparison pages work better.'
          }
          compareLinks={[
            {
              href: '/guides/ai-tools-for-code-review-comparison',
              title: isChinese ? '代码审查工具对比' : 'Code review comparison',
              description: isChinese
                ? '适合直接横向看 PR 理解、风险提示和反馈质量。'
                : 'A direct side-by-side path for PR understanding, risk checks, and feedback quality.',
            },
            {
              href: '/guides/ai-coding-tools-comparison',
              title: isChinese ? '编程工具对比' : 'Coding tools comparison',
              description: isChinese
                ? '如果你发现真正需求更偏实现速度，这页更合适。'
                : 'More useful if the real decision is shifting toward implementation speed.',
            },
            {
              href: '/guides/ai-tools-for-developers-comparison',
              title: isChinese ? '开发者工具总对比' : 'Developer tools comparison',
              description: isChinese
                ? '适合还没完全确定自己在选 review 还是更广的开发工作流工具。'
                : 'Good when you are not yet fully narrowed into review versus broader developer tooling.',
            },
          ]}
          nextEyebrow={isChinese ? '下一步入口' : 'Where to go next'}
          nextTitle={
            isChinese ? '确定 review 方向后，这样继续收窄' : 'How to narrow the space once review is clearly the lane'
          }
          nextDescription={
            isChinese
              ? '如果你已经确定是在找代码审查工具，下一步就回开发者分类、搜索结果和本周新增继续筛。'
              : 'Once code review is clearly the lane, the next step is to return to developer categories, search results, and weekly additions.'
          }
          nextLinks={[
            {
              href: '/categories/developer-tools?sort=popular',
              title: isChinese ? '进入开发者分类' : 'Open the developer category',
              description: isChinese
                ? '回到目录继续看真实 review 候选。'
                : 'Return to the directory for real review-oriented candidates.',
            },
            {
              href: '/explore?search=code%20review&sort=popular',
              title: isChinese ? '搜索更多代码审查工具' : 'Search more code review tools',
              description: isChinese
                ? '回到 Explore，用更窄的审查关键词继续扩大 shortlist。'
                : 'Return to Explore and widen the shortlist with more review-specific search.',
            },
            {
              href: '/new',
              title: isChinese ? '看本周新增' : 'Check new this week',
              description: isChinese
                ? '看看最近补进来的开发者工具里有没有更好的 review 候选。'
                : 'See whether recent developer additions brought in a better fit for review work.',
            },
          ]}
        />

        <section className='mt-8 grid gap-4 lg:grid-cols-[1fr_1fr]'>
          <div className='rounded-[18px] border border-slate-200 bg-white p-6 shadow-sm'>
            <p className='text-sm font-semibold uppercase tracking-wide text-cyan-700'>
              {isChinese ? '代码审查工具看什么' : 'What matters for code review tools'}
            </p>
            <h2 className='mt-1 text-2xl font-bold text-slate-950'>
              {isChinese ? '能不能真正帮你减少 review 成本' : 'Can it actually reduce review cost?'}
            </h2>
            <div className='mt-4 space-y-3 text-sm leading-6 text-slate-700'>
              <p>
                {isChinese
                  ? '最重要的是它能不能读懂差异、定位潜在风险，并且给出不会让 review 更吵的建议。'
                  : 'The key is whether the tool can understand diffs, surface real risk, and offer suggestions without making review noisier.'}
              </p>
              <p>
                {isChinese
                  ? '如果是团队使用，优先看 comment 是否具体、是否方便协作，以及是否能减少上下文切换。'
                  : 'For team use, prioritize concrete comments, collaboration fit, and whether it reduces context switching.'}
              </p>
            </div>
          </div>

          <div className='rounded-[18px] border border-slate-200 bg-white p-6 shadow-sm'>
            <p className='text-sm font-semibold uppercase tracking-wide text-cyan-700'>
              {isChinese ? '常见问题' : 'FAQ'}
            </p>
            <h2 className='mt-1 text-2xl font-bold text-slate-950'>
              {isChinese ? '代码审查工具最常见的问题' : 'Common questions about code review tools'}
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
        <GuideSubmissionPath locale={locale} ctaPrefix='ai_tools_for_code_review' />
      </div>
    </>
  );
}
