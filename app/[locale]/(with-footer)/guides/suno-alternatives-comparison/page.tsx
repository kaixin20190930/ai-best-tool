import TrackableCtaLink from '@/components/analytics/TrackableCtaLink';
import GuideSubmissionPath from '@/components/guides/GuideSubmissionPath';

import { buildComparisonMetadata, buildComparisonPageData, ComparisonPage } from '../comparison-template';

export async function generateMetadata({ params: { locale } }: { params: { locale: string } }) {
  return buildComparisonMetadata(
    locale,
    locale === 'cn' || locale === 'tw' ? 'Suno 替代方案对比' : 'Suno alternatives comparison',
    locale === 'cn' || locale === 'tw'
      ? '对比几款更常被拿来替代 Suno 的 AI 工具，帮你更快判断音乐生成、歌曲创作和音频工作流该怎么选。'
      : 'Compare AI tools that are commonly used as Suno alternatives so you can choose the right fit for music generation, songwriting, and audio workflows.',
  );
}

export default async function Page({ params: { locale } }: { params: { locale: string } }) {
  const data = await buildComparisonPageData(locale, {
    categoryLabel: { cn: '创作工具', en: 'Creator tools' },
    comparisonLabel: { cn: 'Suno 替代方案对比', en: 'Suno alternatives comparison' },
    description: {
      cn: '如果你已经在比较 Suno 这类音乐生成入口，这一页会把常见替代项放在一起看，帮助你判断是要更纯粹的歌曲生成，还是更偏音频/创作工作流的工具。',
      en: 'If you are already comparing Suno-style music generation entry points, this page puts the common alternatives side by side so you can decide whether you need pure song generation or a broader audio and creative workflow.',
    },
    searchQuery: 'suno',
    guideHref: '/guides/ai-tools-for-creators',
    rankingHref: '/best-ai-tools/ai-creator-tools',
    rankingLabel: { cn: '转去创作者榜单页', en: 'Open the creator ranking' },
    backGuideLabel: { cn: '回到创作者指南', en: 'Back to creator guide' },
    altBrowseHref: '/explore?search=music&sort=popular',
    altBrowseLabel: { cn: '浏览更多音乐/创作工具', en: 'Browse more music and creator tools' },
    breadcrumbLabel: { cn: 'Suno 替代方案对比', en: 'Suno alternatives comparison' },
    compareTitle: {
      cn: '几款常见 Suno 替代项的快速对照',
      en: 'A quick side-by-side look at common Suno alternatives',
    },
    compareSubtitle: { cn: 'Suno', en: 'Suno' },
    preferredToolNames: ['suno_aI', 'gpt_4o', 'chatgpt-mac', 'character_ai'],
    decisionCards: [
      {
        title: { cn: '先看你要生成什么', en: 'What exactly are you generating' },
        description: {
          cn: 'Suno 的核心是音乐和歌曲生成；如果你只想做音频解释或对话，替代项可能更轻。',
          en: 'Suno’s core is music and song generation; if you only need audio explanation or conversation, a different tool may be lighter.',
        },
      },
      {
        title: { cn: '再看歌词和旋律工作流', en: 'Lyrics and melody workflow' },
        description: {
          cn: '如果你会反复改歌词、风格和旋律，工具是否顺手会直接影响产出速度。',
          en: 'If you keep iterating on lyrics, style, and melody, the workflow ergonomics will directly affect output speed.',
        },
      },
      {
        title: { cn: '最后看导出和可用性', en: 'Export and usability' },
        description: {
          cn: '音乐工具如果不能稳定导出、复用和接到下游创作流程，价值会打折。',
          en: 'If a music tool cannot reliably export, reuse, and connect to downstream creative workflows, its value drops quickly.',
        },
      },
    ],
    fitFor: [
      {
        title: { cn: '做歌曲/音乐创作的人', en: 'People making songs or music' },
        description: {
          cn: '适合你要直接从灵感生成到歌曲草稿。',
          en: 'Best if you want to go from idea to song draft quickly.',
        },
      },
      {
        title: { cn: '需要快速试风格的人', en: 'People testing styles quickly' },
        description: {
          cn: '如果你会频繁比较不同风格和版本，这种对比会更有帮助。',
          en: 'Useful if you regularly compare different styles and versions.',
        },
      },
    ],
    notFor: [
      {
        title: { cn: '只想做会议/配音的人', en: 'People who only need meetings or dubbing' },
        description: {
          cn: '如果你主要做转写或配音，语音工具页会更贴近。',
          en: 'If your main task is transcription or dubbing, the voice tools page is a better fit.',
        },
      },
      {
        title: { cn: '还没决定自己要做什么音乐的人', en: 'People still unsure what music they want to make' },
        description: {
          cn: '如果你还没明确是歌曲、配乐还是音频创作，先回创作者指南。',
          en: 'If you are not yet sure whether you need songs, background music, or audio creation, start from the creators guide.',
        },
      },
    ],
    highIntentPaths: [
      {
        href: '/best-ai-tools/ai-creator-tools',
        title: { cn: '先看创作者榜单', en: 'Start with the creator ranking' },
        description: {
          cn: '如果你已经明确要做音乐或创作工具选型，先用榜单收窄。',
          en: 'If music or creator tools are already the target, use the ranking first to narrow the shortlist.',
        },
      },
      {
        href: '/guides/ai-tools-for-voice-comparison',
        title: { cn: '转去语音工具对比', en: 'Go to voice tools comparison' },
        description: {
          cn: '如果你的需求其实更偏配音、转写或音频处理，这页更贴近。',
          en: 'Move here if dubbing, transcription, or audio handling is the real need.',
        },
      },
      {
        href: '/guides/ai-tools-for-creators-comparison',
        title: { cn: '转去创作者工具对比', en: 'Go to creators comparison' },
        description: {
          cn: '如果你想把音乐、视频和创作工作流放回更宽的入口，再看这页。',
          en: 'Use this when you want to place music, video, and creative workflows into a broader entry point.',
        },
      },
      {
        href: '/guides/ai-video-tools-comparison',
        title: { cn: '转去视频工具对比', en: 'Go to video tools comparison' },
        description: {
          cn: '如果你的最终产出会进入视频或多媒体内容，这条路径更高意图。',
          en: 'A higher-intent path when the output eventually feeds video or multimedia content.',
        },
      },
    ],
    nextPaths: [
      {
        href: '/guides/ai-tools-for-voice-comparison',
        title: { cn: '转去语音工具对比', en: 'Go to voice tools comparison' },
        description: {
          cn: '如果你的需求其实更偏音频处理和语音能力，这页更适合。',
          en: 'Switch here if your real need is more about audio processing and voice capability.',
        },
      },
      {
        href: '/guides/ai-tools-for-creators-comparison',
        title: { cn: '转去创作者工具对比', en: 'Go to creators comparison' },
        description: {
          cn: '如果你想把音乐、视频和内容生产放回更宽的创作工作流里，再看这页。',
          en: 'Return here if you want to place music, video, and content production back into a broader creative workflow.',
        },
      },
      {
        href: '/guides/ai-video-tools-comparison',
        title: { cn: '转去视频工具对比', en: 'Go to video tools comparison' },
        description: {
          cn: '如果你的音乐最终是要进入视频或多媒体内容，这条路径也值得看。',
          en: 'Move here if the music is ultimately feeding video or multimedia content.',
        },
      },
    ],
    toolSelectionNotes: {
      suno_aI: {
        bestFor: {
          cn: '想快速把灵感变成歌曲草稿和音乐创作的人。',
          en: 'People who want to turn ideas into song drafts and music quickly.',
        },
        whyPickIt: {
          cn: '它最适合直接从想法进入歌曲生成，而不是只做音频辅助。',
          en: 'It is best when you want to go straight from idea to generated song rather than audio assistance.',
        },
        watchOut: {
          cn: '如果你要的是更完整的音频编辑或播客流程，它不是同一类工具。',
          en: 'If you need fuller audio editing or podcast workflows, it is not the same kind of tool.',
        },
      },
      gpt_4o: {
        bestFor: {
          cn: '想把歌词、灵感和多模态讨论放在一个通用助手里的创作者。',
          en: 'Creators who want lyrics, ideas, and multimodal discussion in one general assistant.',
        },
        whyPickIt: {
          cn: '它更像创作辅助层，适合先把思路整理清楚。',
          en: 'It works more like a creative helper layer, useful for shaping ideas first.',
        },
        watchOut: {
          cn: '如果你要的是专门的歌曲生成，它不是最直接的替代项。',
          en: 'If you need dedicated song generation, it is not the most direct substitute.',
        },
      },
      'chatgpt-mac': {
        bestFor: {
          cn: '想快速写歌词、整理结构和反复迭代灵感的人。',
          en: 'People who want to draft lyrics, structure ideas, and iterate quickly.',
        },
        whyPickIt: {
          cn: '它更适合做创作前的梳理和草稿阶段。',
          en: 'It fits the pre-production brainstorming and drafting stage well.',
        },
        watchOut: {
          cn: '如果你要的是直接出歌，它的定位会更偏辅助。',
          en: 'If you want direct song generation, its role is more supportive.',
        },
      },
      character_ai: {
        bestFor: {
          cn: '喜欢角色、歌词叙事或创意互动的人。',
          en: 'People who like character-driven storytelling, lyrics, or creative interaction.',
        },
        whyPickIt: {
          cn: '它更适合把创意对话当成灵感来源。',
          en: 'It works better when creative conversation is part of the inspiration flow.',
        },
        watchOut: {
          cn: '如果你要的是成熟的音乐生成流程，它不是最直接的主工具。',
          en: 'If you want a mature music generation workflow, it is not the most direct primary tool.',
        },
      },
    },
    tips: {
      cn: [
        '先分清你是要出歌，还是只想辅助写歌。',
        '如果你会反复改歌词和风格，工作流顺手程度很重要。',
        '如果成品要继续进视频或内容发布，导出和复用要放前面看。',
      ],
      en: [
        'First decide whether you want to generate songs or just assist writing them.',
        'If you iterate on lyrics and style often, workflow ergonomics matter a lot.',
        'If the output needs to flow into video or content publishing, prioritize export and reuse.',
      ],
    },
    faqs: [
      {
        question: { cn: '为什么单独做 Suno 替代方案页？', en: 'Why make a separate Suno alternatives page?' },
        answer: {
          cn: '因为它的决策核心很明确，就是音乐/歌曲生成，不是泛创作工具。',
          en: 'Because the core decision is very specific: music and song generation, not a general creative tool.',
        },
      },
      {
        question: { cn: '你们比较的依据是什么？', en: 'What do you compare?' },
        answer: {
          cn: '我们主要看歌曲生成、风格控制、工作流顺手程度、导出、价格和真实反馈。',
          en: 'We compare song generation, style control, workflow fit, export, pricing, and real feedback.',
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
              ? '先收紧音乐创作入口，再决定要不要继续看更广的创作工具'
              : 'Tighten the music-creation entry first, then decide whether to keep browsing broader creator tools'}
          </h2>
          <p className='mt-2 max-w-3xl text-sm leading-6 text-slate-600'>
            {locale === 'cn' || locale === 'tw'
              ? '如果你已经明确是在找出歌、写歌或音频创作工具，先看更高意图入口通常更省时间。'
              : 'If the work is clearly about song generation, songwriting, or audio creation tools, starting with higher-intent entry points usually saves time.'}
          </p>
          <div className='mt-5 grid gap-3 md:grid-cols-2 xl:grid-cols-4'>
            {[
              {
                href: '/best-ai-tools/ai-creator-tools',
                title: locale === 'cn' || locale === 'tw' ? '创作者榜单' : 'Creator ranking',
                desc:
                  locale === 'cn' || locale === 'tw'
                    ? '先把候选范围收紧。'
                    : 'Use this to narrow the candidate set first.',
              },
              {
                href: '/guides/ai-tools-for-creators-comparison',
                title: locale === 'cn' || locale === 'tw' ? '创作者工具对比' : 'Creator tools comparison',
                desc:
                  locale === 'cn' || locale === 'tw'
                    ? '如果你还想继续扩大创作候选。'
                    : 'Use this when you want a broader creative shortlist.',
              },
              {
                href: '/guides/ai-tools-for-voice-comparison',
                title: locale === 'cn' || locale === 'tw' ? '语音工具对比' : 'Voice tools comparison',
                desc:
                  locale === 'cn' || locale === 'tw'
                    ? '如果你的需求其实更偏配音和音频处理。'
                    : 'Best when dubbing and audio processing are the real focus.',
              },
              {
                href: '/guides/ai-video-tools-comparison',
                title: locale === 'cn' || locale === 'tw' ? '视频工具对比' : 'Video tools comparison',
                desc:
                  locale === 'cn' || locale === 'tw'
                    ? '如果最终产出会进入视频或多媒体。'
                    : 'Choose this when output eventually feeds video or multimedia content.',
              },
            ].map((item) => (
              <TrackableCtaLink
                key={item.href}
                href={item.href}
                ctaId={`suno_ranking_${item.href.split('/').pop()}`}
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
      <GuideSubmissionPath locale={locale} ctaPrefix='suno_alternatives_comparison' />
    </>
  );
}
