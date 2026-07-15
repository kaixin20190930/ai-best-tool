import TrackableCtaLink from '@/components/analytics/TrackableCtaLink';
import GuideEvidencePanel from '@/components/guides/GuideEvidencePanel';
import GuideSubmissionPath from '@/components/guides/GuideSubmissionPath';

import { buildComparisonMetadata, buildComparisonPageData, ComparisonPage } from '../comparison-template';

export async function generateMetadata({ params: { locale } }: { params: { locale: string } }) {
  return buildComparisonMetadata(
    locale,
    locale === 'cn' || locale === 'tw' ? 'AI 学生工具对比' : 'AI tools for students comparison',
    locale === 'cn' || locale === 'tw'
      ? '对比几款常见的 AI 学生工具，帮你更快选出适合的一个。'
      : 'Compare common AI student tools to choose the one that fits you best.',
  );
}

export default async function Page({ params: { locale } }: { params: { locale: string } }) {
  const data = await buildComparisonPageData(locale, {
    categoryLabel: { cn: '学生工具', en: 'Student tools' },
    comparisonLabel: { cn: 'AI 学生工具对比', en: 'AI tools for students comparison' },
    description: {
      cn: '如果你已经知道自己是在做学习、作业或笔记整理，这一页会帮你把几款常见的学生工具放在一起看，减少反复试错。',
      en: 'If you already know you need student tools, this page helps you compare a few common ones side by side and reduce trial-and-error.',
    },
    searchQuery: 'student',
    guideHref: '/guides/ai-tools-for-students',
    rankingHref: '/best-ai-tools/ai-student-tools',
    rankingLabel: { cn: '转去学生榜单页', en: 'Open the student ranking' },
    backGuideLabel: { cn: '回到学生指南', en: 'Back to student guide' },
    altBrowseHref: '/explore?search=student&sort=popular',
    altBrowseLabel: { cn: '浏览更多学生工具', en: 'Browse more student tools' },
    breadcrumbLabel: { cn: '学生工具对比', en: 'Student tools comparison' },
    compareTitle: { cn: '几款常见学生工具的快速对照', en: 'A quick side-by-side look at common student tools' },
    compareSubtitle: { cn: '学生', en: 'students' },
    highIntentPaths: [
      {
        href: '/best-ai-tools/ai-student-tools',
        title: { cn: '先看学生榜单', en: 'Start with the student ranking' },
        description: {
          cn: '如果学生工具已经是明确目标，先用榜单缩小 shortlist。',
          en: 'If student tools are clearly the goal, narrow the shortlist with the ranking first.',
        },
      },
      {
        href: '/guides/ai-tools-for-students',
        title: { cn: '回到学生指南', en: 'Back to the student guide' },
        description: {
          cn: '如果你还想先理清学习、作业和笔记整理需求，可以回到指南页。',
          en: 'Go back if you still need to clarify study, homework, and note-organizing needs first.',
        },
      },
      {
        href: '/guides/ai-note-taking-tools-comparison',
        title: { cn: '转去记笔记工具对比', en: 'Go to note taking comparison' },
        description: {
          cn: '如果你的需求更偏笔记整理和知识沉淀，这页更高意图。',
          en: 'A higher-intent path when note organization and knowledge capture matter more.',
        },
      },
      {
        href: '/guides/ai-writing-tools-comparison',
        title: { cn: '转去写作工具对比', en: 'Go to writing tools comparison' },
        description: {
          cn: '如果你现在更关心作业写作和表达，这页更贴近。',
          en: 'Move there if writing quality and expression are the real focus.',
        },
      },
    ],
    tips: {
      cn: [
        '先看你是做学习总结、作业辅助、笔记整理还是论文写作，不同场景侧重点不一样。',
        '如果你想先试再买，优先看免费版本的限制和输出质量。',
        '更看重长期使用时，关注更新频率、评分和实际评论。',
      ],
      en: [
        'Start with your use case: summaries, homework help, note organization, or paper writing all need different things.',
        'If you want to try before paying, focus on free-tier limits and output quality.',
        'For long-term use, pay attention to freshness, ratings, and real comments.',
      ],
    },
    faqs: [
      {
        question: { cn: '你们比较的依据是什么？', en: 'What do you compare?' },
        answer: {
          cn: '我们主要看免费可用性、评分、更新情况、内容完整度和实际使用感。',
          en: 'We compare free usability, ratings, freshness, content completeness, and practical usefulness.',
        },
      },
      {
        question: { cn: '为什么只看学生工具？', en: 'Why only student tools?' },
        answer: {
          cn: '因为学生工具通常有很明确的学习、作业和总结需求，对比意图也更清晰。',
          en: 'Because student tools usually map to clear study, homework, and summary needs, which makes compare intent very clear.',
        },
      },
    ],
  });

  return (
    <>
      {ComparisonPage({ ...data, locale })}
      <GuideEvidencePanel
        locale={locale}
        scope={
          locale === 'cn' || locale === 'tw'
            ? '学生对比页要围绕学习、作业、笔记整理和论文写作来判断，不要只看输出是否“聪明”。它会继续保留索引，但把更窄的笔记和写作路径分层。'
            : 'This student comparison page should focus on study, homework, note organization, and paper writing instead of whether the output sounds clever. Keep it indexable, but separate narrower note-taking and writing paths.'
        }
        items={[
          {
            label: locale === 'cn' || locale === 'tw' ? '验证重点' : 'Validation focus',
            value: locale === 'cn' || locale === 'tw' ? '学习、作业、笔记' : 'Study, homework, notes',
            note:
              locale === 'cn' || locale === 'tw'
                ? '先确认它是不是能帮学生完成真实任务。'
                : 'Confirm it helps students finish real tasks.',
          },
          {
            label: locale === 'cn' || locale === 'tw' ? '合并策略' : 'Merge strategy',
            value: locale === 'cn' || locale === 'tw' ? '分流到笔记/写作' : 'Route to note-taking/writing',
            note:
              locale === 'cn' || locale === 'tw'
                ? '如果真实需要更偏记录或表达，就转到更窄页。'
                : 'If the real need is capture or expression, move to narrower pages.',
          },
          {
            label: locale === 'cn' || locale === 'tw' ? '后续增量' : 'Next increments',
            value: locale === 'cn' || locale === 'tw' ? '真实作业场景、反馈' : 'Real study cases, feedback',
            note: locale === 'cn' || locale === 'tw' ? '补学生真实使用痕迹。' : 'Add genuine student usage signals.',
          },
        ]}
      />
      <section className='mx-auto mt-8 max-w-6xl px-4 lg:px-6'>
        <div className='rounded-[20px] border border-cyan-200 bg-cyan-50/60 p-6 shadow-sm lg:p-8'>
          <p className='text-sm font-semibold uppercase tracking-wide text-cyan-700'>
            {locale === 'cn' || locale === 'tw' ? '高意图榜单' : 'High-intent ranking'}
          </p>
          <h2 className='mt-1 text-2xl font-bold text-slate-950'>
            {locale === 'cn' || locale === 'tw'
              ? '先看榜单，再决定是否继续看学生工具或切到相邻入口'
              : 'Start with the ranking, then decide whether to keep comparing student tools or switch to an adjacent path'}
          </h2>
          <p className='mt-2 max-w-3xl text-sm leading-6 text-slate-600'>
            {locale === 'cn' || locale === 'tw'
              ? '如果学生工具已经是明确目标，先收紧 shortlist 往往比继续横向浏览更多页面更有效。'
              : 'If student tools are already the goal, narrowing the shortlist first is usually better than continuing to browse more pages horizontally.'}
          </p>
          <div className='mt-5 grid gap-3 md:grid-cols-2 xl:grid-cols-4'>
            {[
              {
                href: '/best-ai-tools/ai-student-tools',
                title: locale === 'cn' || locale === 'tw' ? '学生榜单' : 'Student ranking',
                desc:
                  locale === 'cn' || locale === 'tw'
                    ? '先收窄到更高相关的候选。'
                    : 'Start with the most relevant candidates first.',
              },
              {
                href: '/guides/ai-tools-for-students',
                title: locale === 'cn' || locale === 'tw' ? '学生指南' : 'Student guide',
                desc:
                  locale === 'cn' || locale === 'tw'
                    ? '重新确认是学习、作业还是笔记整理。'
                    : 'Re-check whether the job is study, homework, or note organization.',
              },
              {
                href: '/guides/ai-note-taking-tools-comparison',
                title: locale === 'cn' || locale === 'tw' ? '记笔记对比' : 'Note taking comparison',
                desc:
                  locale === 'cn' || locale === 'tw'
                    ? '如果你的真实需求更偏知识整理。'
                    : 'Useful when knowledge capture and note organization are the real need.',
              },
              {
                href: '/guides/ai-writing-tools-comparison',
                title: locale === 'cn' || locale === 'tw' ? '写作对比' : 'Writing comparison',
                desc:
                  locale === 'cn' || locale === 'tw'
                    ? '如果你更关心作业写作和表达。'
                    : 'Better when writing quality and expression are the real focus.',
              },
            ].map((item) => (
              <TrackableCtaLink
                key={item.href}
                href={item.href}
                ctaId={`student_ranking_${item.href.split('/').pop()}`}
                ctaLabel={item.title}
                pageType='guide'
                className='rounded-xl border border-white bg-white p-4 shadow-sm hover:bg-slate-50'
              >
                <p className='text-sm font-semibold text-slate-950'>{item.title}</p>
                <p className='mt-2 text-sm leading-6 text-slate-600'>{item.desc}</p>
              </TrackableCtaLink>
            ))}
          </div>
        </div>
      </section>
      <section className='mt-6 grid gap-4 rounded-[18px] border border-cyan-200 bg-cyan-50/70 p-6 shadow-sm md:grid-cols-3'>
        <div>
          <p className='text-xs font-semibold uppercase tracking-wide text-cyan-700'>
            {locale === 'cn' || locale === 'tw' ? '最近验证' : 'Last checked'}
          </p>
          <p className='mt-2 text-lg font-bold text-slate-950'>2026-07-15</p>
          <p className='mt-2 text-sm leading-6 text-slate-600'>
            {locale === 'cn' || locale === 'tw'
              ? '这页已按当前比较页的判断标准重新核对。'
              : 'This page has been rechecked against the current comparison-page decision flow.'}
          </p>
        </div>
        <div>
          <p className='text-xs font-semibold uppercase tracking-wide text-cyan-700'>
            {locale === 'cn' || locale === 'tw' ? '当前判断' : 'Current judgment'}
          </p>
          <p className='mt-2 text-lg font-bold text-slate-950'>
            {locale === 'cn' || locale === 'tw' ? '保留索引，补真实证据' : 'Keep it indexable and add real evidence'}
          </p>
          <p className='mt-2 text-sm leading-6 text-slate-600'>
            {locale === 'cn' || locale === 'tw'
              ? '用评论、案例和 owner 认领把它和泛工具页区分开。'
              : 'Use comments, cases, and owner claims to distinguish it from generic tool pages.'}
          </p>
        </div>
        <div>
          <p className='text-xs font-semibold uppercase tracking-wide text-cyan-700'>
            {locale === 'cn' || locale === 'tw' ? '下一步' : 'Next step'}
          </p>
          <p className='mt-2 text-lg font-bold text-slate-950'>
            {locale === 'cn' || locale === 'tw' ? '补真实用例和反馈' : 'Add real use cases and feedback'}
          </p>
          <p className='mt-2 text-sm leading-6 text-slate-600'>
            {locale === 'cn' || locale === 'tw'
              ? '后续优先补案例、反馈和认领信息。'
              : 'Next, prioritize cases, feedback, and claim information.'}
          </p>
        </div>
      </section>
      <GuideSubmissionPath locale={locale} ctaPrefix='ai_tools_for_students_comparison' />
    </>
  );
}
