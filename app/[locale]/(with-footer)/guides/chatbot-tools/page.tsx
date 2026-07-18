import type { Metadata } from 'next';

import { getNoindexMetadata } from '@/lib/seo/indexing';
import GuideEvidencePanel from '@/components/guides/GuideEvidencePanel';

import ChatbotToolsPage, { generateMetadata as generateChatbotToolsMetadata } from '../ai-chatbot-tools/page';

export async function generateMetadata({ params: { locale } }: { params: { locale: string } }): Promise<Metadata> {
  const metadata = await generateChatbotToolsMetadata({ params: { locale } });
  return {
    ...metadata,
    ...getNoindexMetadata(),
    alternates: {
      ...metadata.alternates,
      canonical: `/${locale}/guides/ai-chatbot-tools`,
    },
  };
}

export default async function Page({ params: { locale } }: { params: { locale: string } }) {
  const checkedAt = '2026-07-18';
  return (
    <>
      {ChatbotToolsPage({ params: { locale } })}
      <GuideEvidencePanel
        locale={locale}
        checkedAt={checkedAt}
        scope={
          locale === 'cn' || locale === 'tw'
            ? 'Chatbot 工具页要先判断是做对话、问答还是客服入口，不要只看模型名字。'
            : 'Chatbot tool pages should start by deciding whether the job is conversation, Q&A, or support entry rather than focusing on the model name.'
        }
        decisionSteps={
          locale === 'cn' || locale === 'tw'
            ? [
                '先确认你要的是对话、问答还是客服入口。',
                '再看上下文、记忆和输出稳定性。',
                '最后回到真实使用案例和反馈判断是否长期使用。',
              ]
            : [
                'First confirm whether you need conversation, Q&A, or a support entry point.',
                'Then check context handling, memory, and output stability.',
                'Finally use real cases and feedback to judge long-term use.',
              ]
        }
        items={[
          {
            label: locale === 'cn' || locale === 'tw' ? '对话入口' : 'Conversation entry',
            value: locale === 'cn' || locale === 'tw' ? '先看交互是否顺手' : 'Check interaction fit first',
            note:
              locale === 'cn' || locale === 'tw'
                ? '如果只是简单问答，别把页面做得过重。'
                : 'If it is only simple Q&A, the page should stay lightweight.',
          },
          {
            label: locale === 'cn' || locale === 'tw' ? '上下文与记忆' : 'Context and memory',
            value: locale === 'cn' || locale === 'tw' ? '连续追问是否稳定' : 'Stable follow-up handling',
            note:
              locale === 'cn' || locale === 'tw'
                ? '真正决定能不能用下去的是持续对话能力。'
                : 'The real adoption driver is the ability to sustain a conversation.',
          },
          {
            label: locale === 'cn' || locale === 'tw' ? '真实反馈' : 'Real feedback',
            value: locale === 'cn' || locale === 'tw' ? '案例比演示更重要' : 'Cases matter more than demos',
            note:
              locale === 'cn' || locale === 'tw'
                ? '最后看评论和案例，而不是只看能力表。'
                : 'Use comments and cases, not just capability tables.',
          },
        ]}
      />

      <section className='mt-6 grid gap-4 rounded-[18px] border border-cyan-200 bg-cyan-50/70 p-6 shadow-sm md:grid-cols-3'>
        <div>
          <p className='text-xs font-semibold uppercase tracking-wide text-cyan-700'>
            {locale === 'cn' || locale === 'tw' ? '最近验证' : 'Last checked'}
          </p>
          <p className='mt-2 text-lg font-bold text-slate-950'>{checkedAt}</p>
          <p className='mt-2 text-sm leading-6 text-slate-600'>
            {locale === 'cn' || locale === 'tw'
              ? `这页已按当前比较页的判断标准重新核对（${checkedAt}）。`
              : `This page has been rechecked against the current comparison-page decision flow (${checkedAt}).`}
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
    </>
  );
}
