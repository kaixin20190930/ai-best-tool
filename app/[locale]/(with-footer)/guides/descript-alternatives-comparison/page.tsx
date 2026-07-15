import TrackableCtaLink from '@/components/analytics/TrackableCtaLink';
import GuideEvidencePanel from '@/components/guides/GuideEvidencePanel';
import GuideSubmissionPath from '@/components/guides/GuideSubmissionPath';

import { buildComparisonMetadata, buildComparisonPageData, ComparisonPage } from '../comparison-template';

export async function generateMetadata({ params: { locale } }: { params: { locale: string } }) {
  return buildComparisonMetadata(
    locale,
    locale === 'cn' || locale === 'tw' ? 'Descript 替代方案对比' : 'Descript alternatives comparison',
    locale === 'cn' || locale === 'tw'
      ? '对比几款更常被拿来替代 Descript 的 AI 工具，帮你更快判断音频编辑、转写和播客工作流该怎么选。'
      : 'Compare AI tools that are commonly used as Descript alternatives so you can choose the right fit for audio editing, transcription, and podcast workflows.',
  );
}

export default async function Page({ params: { locale } }: { params: { locale: string } }) {
  const data = await buildComparisonPageData(locale, {
    categoryLabel: { cn: '语音工具', en: 'Voice tools' },
    comparisonLabel: { cn: 'Descript 替代方案对比', en: 'Descript alternatives comparison' },
    description: {
      cn: '如果你已经在比较 Descript 这类音频编辑与转写入口，这一页会把常见替代项放在一起看，帮助你判断是要播客工作台、会议转写，还是更纯粹的语音工具。',
      en: 'If you are already comparing Descript-style audio editing and transcription entry points, this page puts the common alternatives side by side so you can decide whether you need a podcast workbench, meeting transcription, or a more focused voice tool.',
    },
    searchQuery: 'descript',
    guideHref: '/guides/ai-tools-for-voice',
    rankingHref: '/best-ai-tools/ai-voice-tools',
    rankingLabel: { cn: '转去语音榜单页', en: 'Open the voice ranking' },
    backGuideLabel: { cn: '回到语音指南', en: 'Back to voice guide' },
    altBrowseHref: '/explore?search=descript&sort=popular',
    altBrowseLabel: { cn: '浏览更多 Descript 相关工具', en: 'Browse more Descript-related tools' },
    breadcrumbLabel: { cn: 'Descript 替代方案对比', en: 'Descript alternatives comparison' },
    compareTitle: {
      cn: '几款常见 Descript 替代项的快速对照',
      en: 'A quick side-by-side look at common Descript alternatives',
    },
    compareSubtitle: { cn: 'Descript', en: 'Descript' },
    preferredToolNames: ['descript', 'notta', 'elevenlabs', 'elevenlabs-conversational-ai'],
    decisionCards: [
      {
        title: { cn: '先看你是不是在做编辑', en: 'Editing first or not' },
        description: {
          cn: 'Descript 的强项往往在音频编辑、转写和内容整理；如果你只要简单配音，可能有更轻的选择。',
          en: 'Descript is strongest when audio editing, transcription, and content cleanup matter; if you only need simple voice output, lighter options may fit better.',
        },
      },
      {
        title: { cn: '再看转写和播客流程', en: 'Transcription and podcast flow' },
        description: {
          cn: '如果你的工作流包含录音、转写、剪辑和导出，候选项之间的差异会很明显。',
          en: 'If your workflow includes recording, transcription, editing, and export, the differences between tools become very clear.',
        },
      },
      {
        title: { cn: '最后看是否适合长期生产使用', en: 'Production readiness' },
        description: {
          cn: '价格、稳定性、协作能力和导出格式，通常比演示效果更能决定你会不会长期用。',
          en: 'Pricing, stability, collaboration, and export formats usually decide long-term adoption more than demo quality.',
        },
      },
    ],
    fitFor: [
      {
        title: { cn: '播客与内容团队', en: 'Podcast and content teams' },
        description: {
          cn: '适合需要把录音、转写和编辑串成一条线的人。',
          en: 'A good fit when you need recording, transcription, and editing in one workflow.',
        },
      },
      {
        title: { cn: '会议记录和知识整理', en: 'Meeting capture and knowledge cleanup' },
        description: {
          cn: '如果你更关注把音频变成可编辑文本，Descript 风格的工具会很有用。',
          en: 'If your goal is to turn audio into editable text, Descript-style tools are useful.',
        },
      },
    ],
    notFor: [
      {
        title: { cn: '只想做简单配音的人', en: 'People only wanting basic dubbing' },
        description: {
          cn: '如果你只需要简单语音输出，整套音频工作台可能会偏重。',
          en: 'If you only need simple voice output, a full audio workbench can feel heavier than necessary.',
        },
      },
      {
        title: { cn: '不碰音频编辑的人', en: 'People who do not edit audio' },
        description: {
          cn: '如果你的任务是写作、设计或代码，先看别的垂直页会更高效。',
          en: 'If your work is writing, design, or code, a different vertical page is probably a better first stop.',
        },
      },
    ],
    highIntentPaths: [
      {
        href: '/best-ai-tools/ai-voice-tools',
        title: { cn: '先看语音榜单', en: 'Start with the voice ranking' },
        description: {
          cn: '如果你已经明确在找音频编辑或播客工具，先用榜单收窄。',
          en: 'If audio editing or podcast tools are already the goal, use the ranking first to narrow candidates.',
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
        href: '/guides/notta-alternatives-comparison',
        title: { cn: '转去 Notta 替代方案对比', en: 'Go to Notta alternatives comparison' },
        description: {
          cn: '如果你更关心转写和会议整理，这条路径更高意图。',
          en: 'A higher-intent path when transcription and meeting cleanup matter more.',
        },
      },
      {
        href: '/guides/elevenlabs-alternatives-comparison',
        title: { cn: '转去 ElevenLabs 替代方案对比', en: 'Go to ElevenLabs alternatives comparison' },
        description: {
          cn: '如果你最终其实更在意高质量语音合成，这页更贴近。',
          en: 'Move here if high-quality voice synthesis is the real need.',
        },
      },
    ],
    nextPaths: [
      {
        href: '/guides/ai-tools-for-voice-comparison',
        title: { cn: '转去语音工具总对比', en: 'Go to voice tools comparison' },
        description: {
          cn: '如果你还在扩大候选池，这页能帮你继续筛选。',
          en: 'Use this to broaden the shortlist a bit more.',
        },
      },
      {
        href: '/guides/ai-tools-for-meeting-notes-comparison',
        title: { cn: '转去会议纪要对比', en: 'Go to meeting notes comparison' },
        description: {
          cn: '如果你更在意转写和会议整理，这页更贴近。',
          en: 'A better fit if transcription and meeting cleanup are the real job.',
        },
      },
      {
        href: '/guides/elevenlabs-alternatives-comparison',
        title: { cn: '转去 ElevenLabs 替代方案对比', en: 'Go to ElevenLabs alternatives comparison' },
        description: {
          cn: '如果你最终其实更关心语音合成和声音库，这条路径会更准。',
          en: 'Move here if your main concern is voice synthesis and voice libraries.',
        },
      },
    ],
    toolSelectionNotes: {
      descript: {
        bestFor: {
          cn: '需要音频编辑、转写和播客流程的人。',
          en: 'People who need audio editing, transcription, and podcast workflows.',
        },
        whyPickIt: {
          cn: '它更像一个音频工作台，而不只是单纯的声音输出工具。',
          en: 'It behaves more like an audio workbench than a simple voice output tool.',
        },
        watchOut: {
          cn: '如果你只要最轻量的语音输出，它可能比需求更重。',
          en: 'If you only need lightweight voice output, it may be heavier than necessary.',
        },
      },
      notta: {
        bestFor: {
          cn: '会议转写、录音整理和知识归档工作流。',
          en: 'Meeting transcription, recording organization, and knowledge archiving workflows.',
        },
        whyPickIt: {
          cn: '它把捕获和整理做得很直接，适合日常使用。',
          en: 'It keeps capture and organization straightforward, which is useful day to day.',
        },
        watchOut: {
          cn: '如果你的目标是音频编辑或高质量合成，它不是最接近的一类。',
          en: 'If your goal is editing or high-quality synthesis, it is not the closest match.',
        },
      },
      elevenlabs: {
        bestFor: {
          cn: '需要高质量语音合成和多语言声音库的内容团队。',
          en: 'Content teams that need high-quality voice synthesis and multilingual voice libraries.',
        },
        whyPickIt: {
          cn: '它的核心优势就是“听起来好”，适合用户可听见的输出。',
          en: 'Its core strength is sounding good, which is ideal for user-facing output.',
        },
        watchOut: {
          cn: '如果你主要做编辑和转写，Descript 系路线通常更贴近。',
          en: 'If you mainly edit and transcribe, a Descript-style route is usually closer.',
        },
      },
      'elevenlabs-conversational-ai': {
        bestFor: {
          cn: '想把语音对话接入客服、助手或交互式产品的人。',
          en: 'Teams bringing voice conversation into support, assistants, or interactive products.',
        },
        whyPickIt: {
          cn: '它把语音和对话体验拉到同一层，适合判断产品级接入。',
          en: 'It merges voice and conversation into one layer, which helps with product-grade integration decisions.',
        },
        watchOut: {
          cn: '如果你只是做录音转写或音频编辑，它会显得偏实时交互。',
          en: 'If you are only doing recording transcription or audio editing, it may feel too interaction-focused.',
        },
      },
    },
    tips: {
      cn: [
        '先分清你要的是编辑、转写、播客还是对话。',
        '如果你要长期使用，协作、导出和稳定性很关键。',
        '别只看演示效果，真实工作流更能暴露差异。',
      ],
      en: [
        'First separate editing, transcription, podcasting, and conversation.',
        'For long-term use, collaboration, export, and stability matter a lot.',
        'Do not rely only on demo quality; real workflows reveal the differences.',
      ],
    },
    faqs: [
      {
        question: { cn: '为什么单独做 Descript 替代方案页？', en: 'Why make a separate Descript alternatives page?' },
        answer: {
          cn: '因为 Descript 代表的是音频工作台和转写编辑这类决策层，不只是普通语音工具。',
          en: 'Because Descript represents an audio workbench and transcription-editing decision layer, not just a normal voice tool.',
        },
      },
      {
        question: { cn: '你们比较的依据是什么？', en: 'What do you compare?' },
        answer: {
          cn: '我们主要看工作流贴合度、编辑与转写能力、价格、稳定性和真实反馈。',
          en: 'We compare workflow fit, editing and transcription capability, pricing, stability, and real feedback.',
        },
      },
    ],
  });

  return (
    <>
      {ComparisonPage({ ...data, locale })}
      <GuideEvidencePanel
        locale={locale}
        checkedAt='2026-07-15'
        scope={
          locale === 'cn' || locale === 'tw'
            ? 'Descript 对比页现在强调“音频编辑是否真的能进入工作流”。'
            : 'This Descript comparison page now emphasizes whether audio editing really fits the workflow.'
        }
        decisionSteps={
          locale === 'cn' || locale === 'tw'
            ? ['先确认是转写、编辑还是播客', '再看导出和协作', '最后才决定是否继续对比']
            : [
                'Confirm transcription, editing, or podcast use first',
                'Then review export and collaboration',
                'Only then decide whether to keep comparing',
              ]
        }
        items={[
          {
            label: locale === 'cn' || locale === 'tw' ? '核心任务' : 'Core task',
            value: locale === 'cn' || locale === 'tw' ? '编辑 / 转写 / 播客' : 'Editing / transcription / podcasting',
            note:
              locale === 'cn' || locale === 'tw'
                ? '如果你的目标更偏会议纪要或一般语音工具，这页就不是终点。'
                : 'If your goal is more about meeting notes or general voice tools, this should not be the endpoint.',
          },
          {
            label: locale === 'cn' || locale === 'tw' ? '工作流' : 'Workflow',
            value: locale === 'cn' || locale === 'tw' ? '编辑 + 导出' : 'Editing + export',
            note:
              locale === 'cn' || locale === 'tw'
                ? '真正重要的是它能不能顺手接到你现有的剪辑流程里。'
                : 'What matters is whether it fits cleanly into your existing editing flow.',
          },
          {
            label: locale === 'cn' || locale === 'tw' ? '验证顺序' : 'Validation order',
            value: locale === 'cn' || locale === 'tw' ? '先 shortlist 再看官网' : 'Shortlist before the official site',
            note:
              locale === 'cn' || locale === 'tw'
                ? '先缩短候选，再验证官网是否适合你的流程。'
                : 'Narrow the shortlist first, then validate whether it fits your workflow.',
          },
        ]}
        signalCards={[
          {
            label: locale === 'cn' || locale === 'tw' ? '编辑信号' : 'Editing signal',
            value: locale === 'cn' || locale === 'tw' ? '能否真做音频编辑' : 'Can it really handle audio editing',
            note:
              locale === 'cn' || locale === 'tw'
                ? 'Descript 类工具的核心是编辑，不只是语音输出。'
                : 'Descript-style tools are about editing, not just voice output.',
          },
          {
            label: locale === 'cn' || locale === 'tw' ? '转写信号' : 'Transcription signal',
            value: locale === 'cn' || locale === 'tw' ? '录音到文本是否顺手' : 'Is audio-to-text flow smooth',
            note:
              locale === 'cn' || locale === 'tw'
                ? '如果转写和剪辑之间不顺，工作流价值会掉很多。'
                : 'If transcription and editing do not connect smoothly, the workflow value drops a lot.',
          },
          {
            label: locale === 'cn' || locale === 'tw' ? '导出信号' : 'Export signal',
            value:
              locale === 'cn' || locale === 'tw' ? '能否接播客和内容流程' : 'Can it feed podcast and content workflows',
            note:
              locale === 'cn' || locale === 'tw'
                ? '可用性最终要落在导出和协作上。'
                : 'Usability ultimately comes down to export and collaboration.',
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
              ? '先看榜单，再决定是继续看 Descript 替代还是切到相邻入口'
              : 'Start with the ranking, then decide whether to keep comparing Descript alternatives or switch to an adjacent path'}
          </h2>
          <p className='mt-2 max-w-3xl text-sm leading-6 text-slate-600'>
            {locale === 'cn' || locale === 'tw'
              ? '如果你已经明确要做音频编辑、转写或播客工作流，先收紧 shortlist 往往比继续横向浏览更有效。'
              : 'If audio editing, transcription, or podcast workflows are already the goal, narrowing the shortlist first is usually better than continuing to browse horizontally.'}
          </p>
          <div className='mt-5 grid gap-3 md:grid-cols-2 xl:grid-cols-4'>
            {[
              {
                href: '/guides/ai-tools-for-voice-comparison',
                title: locale === 'cn' || locale === 'tw' ? '语音工具对比' : 'Voice tools comparison',
                desc:
                  locale === 'cn' || locale === 'tw'
                    ? '如果你的需求更偏通用语音能力。'
                    : 'Useful when the need is broader voice capability rather than Descript-style editing.',
              },
              {
                href: '/guides/ai-tools-for-meeting-notes-comparison',
                title: locale === 'cn' || locale === 'tw' ? '会议纪要对比' : 'Meeting notes comparison',
                desc:
                  locale === 'cn' || locale === 'tw'
                    ? '当需求更偏会议录音和转写整理。'
                    : 'A better path when the real need is meeting capture and transcription organization.',
              },
              {
                href: '/guides/ai-video-tools-comparison',
                title: locale === 'cn' || locale === 'tw' ? '视频工具对比' : 'Video tools comparison',
                desc:
                  locale === 'cn' || locale === 'tw'
                    ? '如果你做的不只是音频，而是内容生产。'
                    : 'Useful when the workflow goes beyond audio into content production.',
              },
              {
                href: '/best-ai-tools/ai-voice-tools',
                title: locale === 'cn' || locale === 'tw' ? '语音榜单' : 'Voice ranking',
                desc:
                  locale === 'cn' || locale === 'tw'
                    ? '先收窄到更值得试用的候选。'
                    : 'Start with the most trial-worthy candidates first.',
              },
            ].map((item) => (
              <TrackableCtaLink
                key={item.href}
                href={item.href}
                ctaId={`descript_ranking_${item.href.split('/').pop()}`}
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
      <GuideSubmissionPath locale={locale} ctaPrefix='descript_alternatives_comparison' />
    </>
  );
}
