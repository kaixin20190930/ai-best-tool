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
      <GuideSubmissionPath locale={locale} ctaPrefix='elevenlabs_alternatives_comparison' />
    </>
  );
}
