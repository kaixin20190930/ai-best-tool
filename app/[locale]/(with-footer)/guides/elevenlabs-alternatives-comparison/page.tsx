import TrackableCtaLink from '@/components/analytics/TrackableCtaLink';
import GuideEvidencePanel from '@/components/guides/GuideEvidencePanel';
import GuideSubmissionPath from '@/components/guides/GuideSubmissionPath';

import { buildComparisonMetadata, buildComparisonPageData, ComparisonPage } from '../comparison-template';

export async function generateMetadata({ params: { locale } }: { params: { locale: string } }) {
  return buildComparisonMetadata(
    locale,
    locale === 'cn' || locale === 'tw' ? 'ElevenLabs 替代方案对比' : 'ElevenLabs alternatives comparison',
    locale === 'cn' || locale === 'tw'
      ? '对比几款更常被拿来替代 ElevenLabs 的 AI 工具，帮你更快判断语音合成、声音库和音频工作流该怎么选。'
      : 'Compare AI tools that are commonly used as ElevenLabs alternatives so you can choose the right fit for voice synthesis, voice libraries, and audio workflows.',
  );
}

export default async function Page({ params: { locale } }: { params: { locale: string } }) {
  const data = await buildComparisonPageData(locale, {
    categoryLabel: { cn: '语音工具', en: 'Voice tools' },
    comparisonLabel: { cn: 'ElevenLabs 替代方案对比', en: 'ElevenLabs alternatives comparison' },
    description: {
      cn: '如果你已经在比较 ElevenLabs 这类语音合成入口，这一页会把常见替代项放在一起看，帮助你判断是要高质量语音、音频工作台，还是实时对话能力。',
      en: 'If you are already comparing ElevenLabs-style voice synthesis entry points, this page puts the common alternatives side by side so you can decide whether you need high-quality voices, an audio workbench, or real-time conversation.',
    },
    searchQuery: 'voice',
    guideHref: '/guides/ai-tools-for-voice',
    rankingHref: '/best-ai-tools/ai-voice-tools',
    rankingLabel: { cn: '转去语音榜单页', en: 'Open the voice ranking' },
    backGuideLabel: { cn: '回到语音指南', en: 'Back to voice guide' },
    altBrowseHref: '/explore?search=voice&sort=popular',
    altBrowseLabel: { cn: '浏览更多语音工具', en: 'Browse more voice tools' },
    breadcrumbLabel: { cn: 'ElevenLabs 替代方案对比', en: 'ElevenLabs alternatives comparison' },
    compareTitle: {
      cn: '几款常见 ElevenLabs 替代项的快速对照',
      en: 'A quick side-by-side look at common ElevenLabs alternatives',
    },
    compareSubtitle: { cn: 'ElevenLabs', en: 'ElevenLabs' },
    preferredToolNames: ['elevenlabs', 'descript', 'notta', 'elevenlabs-conversational-ai'],
    decisionCards: [
      {
        title: { cn: '先看你要合成还是编辑', en: 'Synthesis or editing' },
        description: {
          cn: 'ElevenLabs 最核心的是语音合成；如果你需要的是音频编辑或会议转写，替代项可能更合适。',
          en: 'ElevenLabs is mainly about voice synthesis; if you need audio editing or meeting transcription, a different tool may fit better.',
        },
      },
      {
        title: { cn: '再看声音库和语言覆盖', en: 'Voice library and language coverage' },
        description: {
          cn: '如果你面向多语言、品牌声音或大量内容输出，声音库与覆盖范围会直接影响结果。',
          en: 'If you work across languages, branded voices, or high-volume content, the voice library and language coverage matter a lot.',
        },
      },
      {
        title: { cn: '最后看能不能接进产品或工作流', en: 'Can it fit into product or workflow' },
        description: {
          cn: '语音工具能不能接入你的内容、客服或产品流程，往往比单次试听更重要。',
          en: 'Whether the voice tool fits into content, support, or product workflows is often more important than a one-off demo.',
        },
      },
    ],
    fitFor: [
      {
        title: { cn: '内容团队和播客制作人', en: 'Content teams and podcast makers' },
        description: {
          cn: '适合需要高质量配音、声音库和多语言输出的人。',
          en: 'Best for people who need high-quality narration, a voice library, and multilingual output.',
        },
      },
      {
        title: { cn: '做语音产品的人', en: 'Teams shipping voice products' },
        description: {
          cn: '如果语音是产品本身，接入、延迟和稳定性就会成为主问题。',
          en: 'If voice itself is the product, integration, latency, and reliability become the main concerns.',
        },
      },
    ],
    notFor: [
      {
        title: { cn: '只做写作或设计的人', en: 'People only doing writing or design' },
        description: {
          cn: '如果你的问题不需要声音输出，语音页就不该是第一层。',
          en: 'If your problem does not need voice output, the voice page should not be the first layer to evaluate.',
        },
      },
      {
        title: { cn: '只想找会议记录的人', en: 'People only looking for meeting notes' },
        description: {
          cn: '如果你主要做转写和会议记录，记笔记或会议助手页会更贴近。',
          en: 'If your main use case is transcription and meeting capture, note-taking or meeting notes pages are closer.',
        },
      },
    ],
    highIntentPaths: [
      {
        href: '/best-ai-tools/ai-voice-tools',
        title: { cn: '先看语音榜单', en: 'Start with the voice ranking' },
        description: {
          cn: '如果你已经明确在找语音合成工具，先用榜单收窄。',
          en: 'If voice synthesis tools are already the goal, use the ranking first to narrow candidates.',
        },
      },
      {
        href: '/guides/ai-tools-for-voice-comparison',
        title: { cn: '转去语音工具总对比', en: 'Go to voice tools comparison' },
        description: {
          cn: '如果你要把候选范围再拉宽一点，这页更适合。',
          en: 'Use this when you want a broader shortlist.',
        },
      },
      {
        href: '/guides/descript-alternatives-comparison',
        title: { cn: '转去 Descript 替代方案对比', en: 'Go to Descript alternatives comparison' },
        description: {
          cn: '如果你更在意音频编辑和转写，这条路径更高意图。',
          en: 'A higher-intent path when audio editing and transcription matter more.',
        },
      },
      {
        href: '/guides/notta-alternatives-comparison',
        title: { cn: '转去 Notta 替代方案对比', en: 'Go to Notta alternatives comparison' },
        description: {
          cn: '如果你同时也在看会议记录和知识归档，这页也值得继续看。',
          en: 'Move here if meeting capture and knowledge archiving are also part of the decision.',
        },
      },
    ],
    nextPaths: [
      {
        href: '/guides/ai-tools-for-voice-comparison',
        title: { cn: '转去语音工具总对比', en: 'Go to voice tools comparison' },
        description: {
          cn: '如果你想把候选范围再拉宽一点，这页更适合。',
          en: 'Use this when you want a broader shortlist.',
        },
      },
      {
        href: '/guides/ai-tools-for-meeting-notes-comparison',
        title: { cn: '转去会议纪要对比', en: 'Go to meeting notes comparison' },
        description: {
          cn: '如果你的真实问题是转写和会议记录，这条路径更贴近。',
          en: 'Switch here if your real problem is transcription and meeting capture.',
        },
      },
      {
        href: '/guides/suno-alternatives-comparison',
        title: { cn: '转去 Suno 替代方案对比', en: 'Go to Suno alternatives comparison' },
        description: {
          cn: '如果你更在意音乐创作而不是语音合成，这页更合适。',
          en: 'Move here if music creation matters more than voice synthesis.',
        },
      },
    ],
    toolSelectionNotes: {
      elevenlabs: {
        bestFor: {
          cn: '需要高质量语音合成和多语言声音库的内容团队。',
          en: 'Content teams that need high-quality voice synthesis and multilingual voice libraries.',
        },
        whyPickIt: {
          cn: '它的核心优势就是“听起来好”，非常适合输出面向用户的语音。',
          en: 'Its core strength is sounding good, which makes it great for user-facing voice output.',
        },
        watchOut: {
          cn: '如果你需要的是音频编辑、转写或播客工作台，可能还要看别的工具。',
          en: 'If you need an audio editor, transcription, or a podcast workbench, compare other tools too.',
        },
      },
      descript: {
        bestFor: {
          cn: '需要音频编辑、转写和播客工作流的人。',
          en: 'People who need audio editing, transcription, and podcast workflows.',
        },
        whyPickIt: {
          cn: '它更像音频工作台，不只是单纯的声音生成器。',
          en: 'It behaves more like an audio workbench than a plain voice generator.',
        },
        watchOut: {
          cn: '如果你只要单纯的语音合成，它可能比需求更重。',
          en: 'If you only need basic voice synthesis, it may be heavier than necessary.',
        },
      },
      notta: {
        bestFor: {
          cn: '会议转写、录音整理和知识归档工作流。',
          en: 'Meeting transcription, recording organization, and knowledge archiving workflows.',
        },
        whyPickIt: {
          cn: '它把捕获和整理做得很直接，适合日常使用。',
          en: 'It makes capture and organization straightforward, which is useful day to day.',
        },
        watchOut: {
          cn: '如果你的目标是高质量语音合成，这不是最接近的一类。',
          en: 'If your goal is high-quality voice synthesis, this is not the closest match.',
        },
      },
      'elevenlabs-conversational-ai': {
        bestFor: {
          cn: '要把语音对话接入客服、助手或交互式产品的人。',
          en: 'Teams bringing voice conversation into support, assistants, or interactive products.',
        },
        whyPickIt: {
          cn: '它把语音和对话拉到同一层，适合评估产品级接入。',
          en: 'It merges voice and conversation into one layer, which is useful for product-grade integration.',
        },
        watchOut: {
          cn: '如果你只关心静态合成，它会显得更偏实时交互。',
          en: 'It may feel too interaction-focused if you only care about static synthesis.',
        },
      },
    },
    tips: {
      cn: [
        '先分清你要的是合成、编辑、转写还是对话。',
        '如果你要商用或大批量输出，音质、稳定性和导出优先看。',
        '如果要接入产品，延迟、权限和接口才是关键。',
      ],
      en: [
        'First separate synthesis, editing, transcription, and conversation.',
        'For commercial or bulk output, prioritize quality, stability, and export.',
        'For product integration, latency, permissions, and the API are the real keys.',
      ],
    },
    faqs: [
      {
        question: {
          cn: '为什么单独做 ElevenLabs 替代方案页？',
          en: 'Why make a separate ElevenLabs alternatives page?',
        },
        answer: {
          cn: '因为语音合成、音频编辑和语音对话是不同决策层，单独拆开更清楚。',
          en: 'Because synthesis, audio editing, and voice conversation are different decision layers, so splitting them makes the choice clearer.',
        },
      },
      {
        question: { cn: '你们比较的依据是什么？', en: 'What do you compare?' },
        answer: {
          cn: '我们主要看音质、语言覆盖、工作流贴合度、延迟、价格和真实反馈。',
          en: 'We compare quality, language coverage, workflow fit, latency, pricing, and real feedback.',
        },
      },
    ],
  });

  return (
    <>
      {ComparisonPage({ ...data, locale })}
      <section className='mx-auto mt-8 max-w-6xl px-4 lg:px-6'>
        <div className='rounded-[20px] border border-cyan-200 bg-cyan-50/60 p-6 shadow-sm lg:p-8'>
          <p className='text-sm font-semibold uppercase tracking-wide text-cyan-700'>
            {locale === 'cn' || locale === 'tw' ? '高意图榜单' : 'High-intent ranking'}
          </p>
          <h2 className='mt-1 text-2xl font-bold text-slate-950'>
            {locale === 'cn' || locale === 'tw'
              ? '先看榜单，再决定是继续看 ElevenLabs 替代还是切到相邻入口'
              : 'Start with the ranking, then decide whether to keep comparing ElevenLabs alternatives or switch to an adjacent path'}
          </h2>
          <p className='mt-2 max-w-3xl text-sm leading-6 text-slate-600'>
            {locale === 'cn' || locale === 'tw'
              ? '如果你已经明确要做语音合成或音频工作流，先收紧 shortlist 往往比继续横向浏览更有效。'
              : 'If voice synthesis or audio workflow is already the goal, narrowing the shortlist first is usually better than continuing to browse horizontally.'}
          </p>
          <div className='mt-5 grid gap-3 md:grid-cols-2 xl:grid-cols-4'>
            {[
              {
                href: '/best-ai-tools/ai-voice-tools',
                title: locale === 'cn' || locale === 'tw' ? '语音榜单' : 'Voice ranking',
                desc:
                  locale === 'cn' || locale === 'tw'
                    ? '先收窄到更值得试用的语音候选。'
                    : 'Narrow to the most trial-worthy voice candidates first.',
              },
              {
                href: '/guides/ai-tools-for-voice-comparison',
                title: locale === 'cn' || locale === 'tw' ? '语音工具对比' : 'Voice tools comparison',
                desc:
                  locale === 'cn' || locale === 'tw'
                    ? '如果你要看更广的语音工作流。'
                    : 'Useful when you want to compare the broader voice workflow.',
              },
              {
                href: '/guides/notta-alternatives-comparison',
                title: locale === 'cn' || locale === 'tw' ? 'Notta 替代方案' : 'Notta alternatives',
                desc:
                  locale === 'cn' || locale === 'tw'
                    ? '如果你的场景更偏转写和会议整理。'
                    : 'A better path when transcription and meeting cleanup are the real need.',
              },
              {
                href: '/guides/ai-video-tools-comparison',
                title: locale === 'cn' || locale === 'tw' ? '视频工具对比' : 'Video tools comparison',
                desc:
                  locale === 'cn' || locale === 'tw'
                    ? '如果语音只是更大内容流程的一部分。'
                    : 'Useful when voice is only one part of a bigger content workflow.',
              },
            ].map((item) => (
              <TrackableCtaLink
                key={item.href}
                href={item.href}
                ctaId={`elevenlabs_ranking_${item.href.split('/').pop()}`}
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
      <GuideEvidencePanel
        locale={locale}
        scope={
          locale === 'cn' || locale === 'tw'
            ? 'ElevenLabs 替代页要先看语音合成、声音库和工作流接入，不要只看试听效果。'
            : 'ElevenLabs alternatives should be judged around synthesis, voice library breadth, and workflow integration instead of demo quality alone.'
        }
        decisionSteps={
          locale === 'cn' || locale === 'tw'
            ? [
                '先确认你要的是合成、编辑还是实时对话。',
                '再看声音库、语言覆盖和稳定性。',
                '最后结合真实项目和反馈判断是否值得长期索引。',
              ]
            : [
                'First confirm whether you need synthesis, editing, or real-time conversation.',
                'Then check voice library depth, language coverage, and stability.',
                'Finally use real projects and feedback to decide whether it deserves indexing.',
              ]
        }
        items={[
          {
            label: locale === 'cn' || locale === 'tw' ? '语音合成' : 'Synthesis',
            value: locale === 'cn' || locale === 'tw' ? '先看声音是否自然' : 'Check naturalness first',
            note:
              locale === 'cn' || locale === 'tw'
                ? '如果声音本身不自然，后面的功能意义不大。'
                : 'If the voice does not sound natural, the rest matters far less.',
          },
          {
            label: locale === 'cn' || locale === 'tw' ? '声音库与覆盖' : 'Voice library and coverage',
            value: locale === 'cn' || locale === 'tw' ? '是否够你长期用' : 'Enough for long-term use',
            note:
              locale === 'cn' || locale === 'tw'
                ? '多语言和品牌声音场景要优先看。'
                : 'Prioritize multilingual and branded-voice scenarios.',
          },
          {
            label: locale === 'cn' || locale === 'tw' ? '工作流接入' : 'Workflow integration',
            value: locale === 'cn' || locale === 'tw' ? '能不能进产品' : 'Can it ship into products',
            note:
              locale === 'cn' || locale === 'tw'
                ? '最后要看能不能接入你的内容或产品流程。'
                : 'Ultimately, it has to fit your content or product workflow.',
          },
        ]}
      />
      <GuideSubmissionPath locale={locale} ctaPrefix='elevenlabs_alternatives_comparison' />
    </>
  );
}
