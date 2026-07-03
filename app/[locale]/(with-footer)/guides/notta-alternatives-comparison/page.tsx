import GuideSubmissionPath from '@/components/guides/GuideSubmissionPath';

import { buildComparisonMetadata, buildComparisonPageData, ComparisonPage } from '../comparison-template';

export async function generateMetadata({ params: { locale } }: { params: { locale: string } }) {
  return buildComparisonMetadata(
    locale,
    locale === 'cn' || locale === 'tw' ? 'Notta 替代方案对比' : 'Notta alternatives comparison',
    locale === 'cn' || locale === 'tw'
      ? '对比几款更常被拿来替代 Notta 的 AI 工具，帮你更快判断会议转写、录音整理和知识归档该怎么选。'
      : 'Compare AI tools that are commonly used as Notta alternatives so you can choose the right fit for meeting transcription, recording cleanup, and knowledge archiving.',
  );
}

export default async function Page({ params: { locale } }: { params: { locale: string } }) {
  const data = await buildComparisonPageData(locale, {
    categoryLabel: { cn: '会议纪要工具', en: 'Meeting notes tools' },
    comparisonLabel: { cn: 'Notta 替代方案对比', en: 'Notta alternatives comparison' },
    description: {
      cn: '如果你已经在比较 Notta 这类会议转写和录音整理入口，这一页会把常见替代项放在一起看，帮助你判断是要会议纪要、播客转写，还是更重的音频工作流。',
      en: 'If you are already comparing Notta-style meeting transcription and recording cleanup entry points, this page puts the common alternatives side by side so you can decide whether you need meeting notes, podcast transcription, or a heavier audio workflow.',
    },
    searchQuery: 'notta',
    guideHref: '/guides/ai-tools-for-meeting-notes',
    rankingHref: '/best-ai-tools/ai-meeting-notes-tools',
    rankingLabel: { cn: '转去会议纪要榜单页', en: 'Open the meeting notes ranking' },
    backGuideLabel: { cn: '回到会议指南', en: 'Back to meeting guide' },
    altBrowseHref: '/explore?search=notta&sort=popular',
    altBrowseLabel: { cn: '浏览更多 Notta 相关工具', en: 'Browse more Notta-related tools' },
    breadcrumbLabel: { cn: 'Notta 替代方案对比', en: 'Notta alternatives comparison' },
    compareTitle: {
      cn: '几款常见 Notta 替代项的快速对照',
      en: 'A quick side-by-side look at common Notta alternatives',
    },
    compareSubtitle: { cn: 'Notta', en: 'Notta' },
    preferredToolNames: ['notta', 'descript', 'elevenlabs-conversational-ai', 'elevenlabs'],
    decisionCards: [
      {
        title: { cn: '先看转写还是编辑', en: 'Transcription or editing' },
        description: {
          cn: 'Notta 的核心通常是会议转写和整理；如果你要的是编辑型工作台，Descript 路线会更接近。',
          en: 'Notta usually centers on transcription and cleanup; if you want an editing workbench, a Descript-style route is closer.',
        },
      },
      {
        title: { cn: '再看会议和知识工作流', en: 'Meeting and knowledge workflow' },
        description: {
          cn: '如果你需要把录音变成可搜索、可整理、可归档的内容，工具之间的差异会很明显。',
          en: 'If your job is to turn recordings into searchable, organized, and archivable content, the differences become obvious.',
        },
      },
      {
        title: { cn: '最后看是否适合长期团队使用', en: 'Team readiness' },
        description: {
          cn: '共享、权限、导出和稳定性，通常比演示效果更能决定团队会不会真的用起来。',
          en: 'Sharing, permissions, exports, and stability usually matter more than demo quality when teams adopt the tool.',
        },
      },
    ],
    fitFor: [
      {
        title: { cn: '经常开会的人', en: 'Frequent meeting users' },
        description: {
          cn: '适合需要把会议内容快速转成笔记和行动项的人。',
          en: 'A good fit when you need to turn meetings into notes and action items fast.',
        },
      },
      {
        title: { cn: '做知识管理的人', en: 'Knowledge managers' },
        description: {
          cn: '如果你想让录音变成可检索资产，这类工具很有价值。',
          en: 'Useful when you want recordings to become searchable knowledge assets.',
        },
      },
    ],
    notFor: [
      {
        title: { cn: '只做高质量语音合成的人', en: 'People only needing voice synthesis' },
        description: {
          cn: '如果你主要目标是配音或合成声音，Notta 不是最贴近的入口。',
          en: 'If your main goal is dubbing or voice synthesis, Notta is not the closest entry point.',
        },
      },
      {
        title: { cn: '不碰会议记录的人', en: 'People who do not do meeting capture' },
        description: {
          cn: '如果你不需要把音频变成笔记，这一页的优先级就不高。',
          en: 'If you do not need to turn audio into notes, this page is lower priority.',
        },
      },
    ],
    highIntentPaths: [
      {
        href: '/best-ai-tools/ai-meeting-notes-tools',
        title: { cn: '先看会议纪要榜单', en: 'Start with the meeting notes ranking' },
        description: {
          cn: '如果你已经明确在找会议转写工具，先用榜单收窄。',
          en: 'If meeting transcription tools are already the goal, use the ranking first to narrow candidates.',
        },
      },
      {
        href: '/guides/ai-tools-for-meeting-notes-comparison',
        title: { cn: '转去会议纪要总对比', en: 'Go to meeting notes comparison' },
        description: {
          cn: '如果你要把候选范围再拉宽一点，这页更适合。',
          en: 'Use this when you want a broader shortlist.',
        },
      },
      {
        href: '/guides/descript-alternatives-comparison',
        title: { cn: '转去 Descript 替代方案对比', en: 'Go to Descript alternatives comparison' },
        description: {
          cn: '如果你更在意音频编辑和播客工作台，这条路径更高意图。',
          en: 'A higher-intent path when audio editing and podcast workflows matter more.',
        },
      },
      {
        href: '/guides/elevenlabs-alternatives-comparison',
        title: { cn: '转去 ElevenLabs 替代方案对比', en: 'Go to ElevenLabs alternatives comparison' },
        description: {
          cn: '如果你最终其实更需要高质量语音合成，这页也值得继续看。',
          en: 'Move here if high-quality voice synthesis is also part of the decision.',
        },
      },
    ],
    nextPaths: [
      {
        href: '/guides/ai-tools-for-meeting-notes-comparison',
        title: { cn: '转去会议纪要总对比', en: 'Go to meeting notes comparison' },
        description: {
          cn: '如果你要把候选范围再拉宽一点，这页更合适。',
          en: 'Use this when you want a broader shortlist.',
        },
      },
      {
        href: '/guides/descript-alternatives-comparison',
        title: { cn: '转去 Descript 替代方案对比', en: 'Go to Descript alternatives comparison' },
        description: {
          cn: '如果你其实更想看音频编辑和播客工作台，这页更贴近。',
          en: 'Move here if you care more about audio editing and podcast workflows.',
        },
      },
      {
        href: '/guides/ai-note-taking-tools-comparison',
        title: { cn: '转去记笔记工具对比', en: 'Go to note-taking tools comparison' },
        description: {
          cn: '如果你更关心记录、整理和知识归档，这条路径也很合适。',
          en: 'A useful next stop if recording, organization, and archiving are the real job.',
        },
      },
    ],
    toolSelectionNotes: {
      notta: {
        bestFor: {
          cn: '会议转写、录音整理和知识归档工作流。',
          en: 'Meeting transcription, recording cleanup, and knowledge archiving workflows.',
        },
        whyPickIt: {
          cn: '它把捕获和整理做得很直接，适合日常会议使用。',
          en: 'It keeps capture and organization straightforward, which is handy for everyday meetings.',
        },
        watchOut: {
          cn: '如果你需要深度音频编辑或高质量合成，它不是最强那一层。',
          en: 'If you need deep audio editing or high-quality synthesis, it is not the strongest layer.',
        },
      },
      descript: {
        bestFor: {
          cn: '需要音频编辑、转写和播客流程的人。',
          en: 'People who need audio editing, transcription, and podcast workflows.',
        },
        whyPickIt: {
          cn: '它更像一个音频工作台，而不是单纯的记录工具。',
          en: 'It behaves more like an audio workbench than a plain recording tool.',
        },
        watchOut: {
          cn: '如果你只想要最轻的会议记录入口，它可能有点重。',
          en: 'If you only want the lightest meeting notes entry point, it may feel heavy.',
        },
      },
      'elevenlabs-conversational-ai': {
        bestFor: {
          cn: '想把语音对话接入客服、助手或交互式产品的人。',
          en: 'Teams bringing voice conversation into support, assistants, or interactive products.',
        },
        whyPickIt: {
          cn: '它把语音和对话体验拉到一层，适合产品级接入判断。',
          en: 'It merges voice and conversation into one layer, which helps with product-grade integration decisions.',
        },
        watchOut: {
          cn: '如果你只关心转写和会议整理，它会偏实时交互。',
          en: 'If you only care about transcription and meeting cleanup, it may feel too interaction-focused.',
        },
      },
      elevenlabs: {
        bestFor: {
          cn: '需要高质量语音合成和多语言声音库的内容团队。',
          en: 'Content teams that need high-quality voice synthesis and multilingual voice libraries.',
        },
        whyPickIt: {
          cn: '它的核心优势是输出好听的语音，不是做会议记录。',
          en: 'Its core strength is high-quality voice output, not meeting capture.',
        },
        watchOut: {
          cn: '如果你的主要任务是转写和整理，Notta 路线会更贴近。',
          en: 'If your main job is transcription and cleanup, the Notta route is closer.',
        },
      },
    },
    tips: {
      cn: [
        '先分清你是在找会议纪要，还是在找音频编辑。',
        '如果你要团队用，协作、权限和导出会比演示更重要。',
        '要长期用的话，真实评论和近期更新值得先看。',
      ],
      en: [
        'First separate meeting notes from audio editing.',
        'For team use, collaboration, permissions, and exports matter more than the demo.',
        'For long-term use, real reviews and recent updates are worth checking first.',
      ],
    },
    faqs: [
      {
        question: { cn: '为什么单独做 Notta 替代方案页？', en: 'Why make a separate Notta alternatives page?' },
        answer: {
          cn: '因为很多用户已经明确在找会议转写和整理工具，这个意图很接近转化。',
          en: 'Because many users are explicitly looking for meeting transcription and cleanup tools, which is very close to conversion intent.',
        },
      },
      {
        question: { cn: '你们比较的依据是什么？', en: 'What do you compare?' },
        answer: {
          cn: '我们主要看转写准确度、整理速度、团队协作、导出和真实反馈。',
          en: 'We compare transcription accuracy, cleanup speed, team collaboration, exports, and real feedback.',
        },
      },
    ],
  });

  return (
    <>
      {ComparisonPage({ ...data, locale })}
      <GuideSubmissionPath locale={locale} ctaPrefix='notta_alternatives_comparison' />
    </>
  );
}
