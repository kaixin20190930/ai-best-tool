import TrackableCtaLink from '@/components/analytics/TrackableCtaLink';

import { buildComparisonMetadata, buildComparisonPageData, ComparisonPage } from '../comparison-template';

export async function generateMetadata({ params: { locale } }: { params: { locale: string } }) {
  return buildComparisonMetadata(
    locale,
    locale === 'cn' || locale === 'tw' ? 'AI 语音工具对比' : 'AI voice tools comparison',
    locale === 'cn' || locale === 'tw'
      ? '对比几款常见的语音 AI 工具，帮你更快选出适合配音、转写或对话的一个。'
      : 'Compare common voice AI tools to choose the one that fits dubbing, transcription, or conversational use best.',
  );
}

export default async function Page({ params: { locale } }: { params: { locale: string } }) {
  const data = await buildComparisonPageData(locale, {
    categoryLabel: { cn: '语音工具', en: 'Voice tools' },
    comparisonLabel: { cn: 'AI 语音工具对比', en: 'AI voice tools comparison' },
    description: {
      cn: '如果你已经知道自己要做转写、配音、声音克隆或语音对话，这一页会帮你把几款常见工具放在一起看。',
      en: 'If you already know you need transcription, dubbing, voice cloning, or conversational voice, this page helps you compare a few common tools side by side.',
    },
    searchQuery: 'voice',
    guideHref: '/guides/ai-tools-for-voice',
    rankingHref: '/best-ai-tools/ai-voice-tools',
    rankingLabel: { cn: '转去语音榜单页', en: 'Open the voice ranking' },
    backGuideLabel: { cn: '回到语音指南', en: 'Back to voice guide' },
    altBrowseHref: '/explore?search=voice&sort=popular',
    altBrowseLabel: { cn: '浏览更多语音工具', en: 'Browse more voice tools' },
    breadcrumbLabel: { cn: '语音工具对比', en: 'Voice tools comparison' },
    compareTitle: { cn: '几款常见语音工具的快速对照', en: 'A quick side-by-side look at common voice tools' },
    compareSubtitle: { cn: '语音工具', en: 'Voice tools' },
    preferredToolNames: ['elevenlabs', 'descript', 'notta', 'elevenlabs-conversational-ai'],
    highIntentPaths: [
      {
        href: '/best-ai-tools/ai-voice-tools',
        title: { cn: '先看语音榜单', en: 'Start with the voice ranking' },
        description: {
          cn: '如果语音已经是明确目标，先用榜单缩小 shortlist。',
          en: 'If voice is clearly the goal, narrow the shortlist with the ranking first.',
        },
      },
      {
        href: '/guides/ai-tools-for-voice',
        title: { cn: '回到语音指南', en: 'Back to the voice guide' },
        description: {
          cn: '如果你还想先理清配音、转写和对话场景，可以回到指南页。',
          en: 'Go back if you still need to clarify dubbing, transcription, and conversational use cases first.',
        },
      },
      {
        href: '/guides/ai-tools-for-meeting-notes-comparison',
        title: { cn: '转去会议纪要对比', en: 'Go to meeting notes comparison' },
        description: {
          cn: '如果你现在更关心转写和会议整理，这页更高意图。',
          en: 'A higher-intent path when transcription and meeting cleanup are the real need.',
        },
      },
      {
        href: '/guides/ai-note-taking-tools-comparison',
        title: { cn: '转去记笔记工具对比', en: 'Go to note taking comparison' },
        description: {
          cn: '如果你的目标是捕捉和整理，而不是纯语音输出，这页更贴近。',
          en: 'Move there if capture and organization matter more than pure voice output.',
        },
      },
    ],
    comparisonDimensions: [
      {
        title: { cn: '音质与自然度', en: 'Quality and naturalness' },
        description: {
          cn: '如果你要对外输出，音质和自然度通常会比单纯功能数量更重要。',
          en: 'For outward-facing output, quality and naturalness usually matter more than a long feature list.',
        },
      },
      {
        title: { cn: '准确度与语言覆盖', en: 'Accuracy and language coverage' },
        description: {
          cn: '转写和配音工具都要看语言、口音、专有名词和场景适配。',
          en: 'Transcription and dubbing tools should be judged by language support, accents, proper nouns, and use-case fit.',
        },
      },
      {
        title: { cn: '延迟与批量能力', en: 'Latency and bulk use' },
        description: {
          cn: '实时对话和大批量处理对速度的要求不同，别把这两个需求混在一起看。',
          en: 'Real-time conversation and bulk generation have very different speed requirements, so do not compare them as the same thing.',
        },
      },
      {
        title: { cn: '导出与工作流接入', en: 'Export and workflow fit' },
        description: {
          cn: '如果它要接入你的内容生产链路，导出格式、团队权限和稳定性就会变成关键。',
          en: 'If it needs to fit into a content production pipeline, export formats, team permissions, and stability become critical.',
        },
      },
    ],
    decisionCards: [
      {
        title: { cn: '做配音/合成', en: 'Dubbing / synthesis' },
        description: {
          cn: '先看音质、声音库和语言覆盖，再看价格。',
          en: 'Start with voice quality, voice library depth, and language support, then check pricing.',
        },
      },
      {
        title: { cn: '做转写/会议记录', en: 'Transcription / meeting capture' },
        description: {
          cn: '准确率、时间戳和多说话人识别通常更重要。',
          en: 'Accuracy, timestamps, and speaker separation usually matter most.',
        },
      },
      {
        title: { cn: '做语音对话助手', en: 'Conversational assistants' },
        description: {
          cn: '延迟、稳定性和接入方式决定它能不能真正上线。',
          en: 'Latency, reliability, and integration model decide whether it can ship.',
        },
      },
    ],
    fitFor: [
      {
        title: { cn: '内容团队 / 播客 / 视频创作者', en: 'Content teams, podcasts, and video creators' },
        description: {
          cn: '适合需要持续生成声音素材或转写内容的人。',
          en: 'A strong fit for people who regularly generate voice assets or transcriptions.',
        },
      },
      {
        title: { cn: '把语音作为产品能力的人', en: 'Teams shipping voice as a product feature' },
        description: {
          cn: '如果语音是你产品的一部分，接入、延迟和质量会比“能不能用”更关键。',
          en: 'If voice is part of the product, integration, latency, and quality matter more than simple usability.',
        },
      },
    ],
    notFor: [
      {
        title: { cn: '只是在找泛 AI 工具的人', en: 'People browsing broad AI lists' },
        description: {
          cn: '如果你还不确定要不要做语音工作流，这页会比较垂直。',
          en: 'If you are still unsure whether you need a voice workflow, this page is intentionally specialized.',
        },
      },
      {
        title: { cn: '不需要声音输出的工作', en: 'Work that does not need voice output' },
        description: {
          cn: '如果你的问题主要是写作、设计或代码，语音工具不是最先看的一层。',
          en: 'If your main problem is writing, design, or code, voice tools are probably not the first layer to evaluate.',
        },
      },
    ],
    nextPaths: [
      {
        href: '/guides/ai-tools-for-meeting-notes-comparison',
        title: { cn: '转去会议纪要对比', en: 'Go to meeting notes comparison' },
        description: {
          cn: '如果你主要在找会议转写与纪要，这页更贴近真实需求。',
          en: 'A better fit when the real need is meeting transcription and note-taking.',
        },
      },
      {
        href: '/guides/ai-note-taking-tools-comparison',
        title: { cn: '转去记笔记工具对比', en: 'Go to note taking comparison' },
        description: {
          cn: '如果你更关注记录和整理，而不是纯语音输出，这页更合适。',
          en: 'Better when capture and organization matter more than pure voice generation.',
        },
      },
      {
        href: '/guides/ai-video-tools-comparison',
        title: { cn: '转去视频工具对比', en: 'Go to video tools comparison' },
        description: {
          cn: '如果你是在做视频配音或多媒体输出，这里也值得继续看。',
          en: 'A useful next stop if your voice workflow is tied to video or multimedia output.',
        },
      },
      {
        href: '/categories/voice?sort=popular',
        title: { cn: '转去 Voice 分类', en: 'Go to the Voice category' },
        description: {
          cn: '先看真实条目，再回到对比页做决定。',
          en: 'Browse real listings first, then come back to compare when ready.',
        },
      },
    ],
    toolSelectionNotes: {
      elevenlabs: {
        bestFor: {
          cn: '需要高质量语音合成、声音库和多语言输出的内容团队。',
          en: 'Content teams that need high-quality synthesis, voice libraries, and multilingual output.',
        },
        whyPickIt: {
          cn: '它是典型的“先听效果再判断”的语音产品，最容易看出音质差异。',
          en: 'It is a classic "listen first" voice product where quality differences are immediately obvious.',
        },
        watchOut: {
          cn: '如果你主要做转写或会议记录，它可能不是最贴近的入口。',
          en: 'If your main job is transcription or meeting capture, it may not be the closest fit.',
        },
      },
      descript: {
        bestFor: {
          cn: '需要音频编辑、转写和播客流程的人。',
          en: 'People who need audio editing, transcription, and podcast workflows.',
        },
        whyPickIt: {
          cn: '它更像一个音频工作台，而不是只给你一段声音输出。',
          en: 'It behaves more like an audio workbench than a single-purpose output tool.',
        },
        watchOut: {
          cn: '如果你只要简单配音，它可能显得比需求更重。',
          en: 'It may feel heavier than needed if you only want simple dubbing.',
        },
      },
      notta: {
        bestFor: {
          cn: '会议记录、转写和知识整理工作流。',
          en: 'Meeting capture, transcription, and knowledge organization workflows.',
        },
        whyPickIt: {
          cn: '它把转写和记录做得很直接，适合日常使用。',
          en: 'It makes transcription and capture straightforward, which is useful for daily use.',
        },
        watchOut: {
          cn: '如果你想做更深的语音合成，它不是最强的那一层。',
          en: 'It is not the deepest layer if your goal is advanced synthesis.',
        },
      },
      'elevenlabs-conversational-ai': {
        bestFor: {
          cn: '想把语音对话接入客服、助手或交互式产品的人。',
          en: 'Teams bringing conversational voice into support, assistants, or interactive products.',
        },
        whyPickIt: {
          cn: '它把语音和对话体验拉到同一层，适合判断产品级接入能力。',
          en: 'It merges voice and conversation into one layer, which is useful for product-grade integration decisions.',
        },
        watchOut: {
          cn: '如果你只关心静态转写或配音，它会显得偏实时交互。',
          en: 'It can feel too interaction-heavy if you only care about static transcription or dubbing.',
        },
      },
    },
    tips: {
      cn: [
        '先分清你要的是合成、转写、配音还是实时对话。',
        '再看语言覆盖、延迟和批量能力，别只看试听效果。',
        '如果要长期用，重点看导出、稳定性和团队权限。',
        '更看重生产用途时，真实评论和最近更新尤其重要。',
      ],
      en: [
        'First separate synthesis, transcription, dubbing, and real-time conversation.',
        'Then compare language coverage, latency, and bulk use, not just demo quality.',
        'For long-term use, focus on exports, stability, and team permissions.',
        'For production use, real comments and fresh updates matter a lot.',
      ],
    },
    faqs: [
      {
        question: {
          cn: '语音工具最适合哪些人？',
          en: 'Who are voice tools best for?',
        },
        answer: {
          cn: '做内容、会议记录、转写、配音或语音产品的人，通常最容易受益。',
          en: 'Content teams, meeting capture users, transcription workflows, dubbing use cases, and voice product teams usually benefit the most.',
        },
      },
      {
        question: {
          cn: '我应该先比什么？',
          en: 'What should I compare first?',
        },
        answer: {
          cn: '先看你的真实任务，再看音质/准确度、语言覆盖、延迟和导出能力。',
          en: 'Start with your real job, then compare quality/accuracy, language coverage, latency, and export ability.',
        },
      },
      {
        question: {
          cn: '付费版值不值？',
          en: 'Is paid worth it?',
        },
        answer: {
          cn: '如果你要批量、商用或团队协作，通常比免费版更稳定；如果只是试用，免费版往往先够。',
          en: 'If you need bulk generation, commercial usage, or collaboration, paid plans are usually much more stable; for testing, free tiers often suffice.',
        },
      },
      {
        question: {
          cn: '我可以从这里直接继续找工具吗？',
          en: 'Can I keep browsing tools from here?',
        },
        answer: {
          cn: '可以，先看分类，再看对比，最后再进单个工具页，会更快收敛。',
          en: 'Yes. Category first, then comparison, then individual tool pages is usually the fastest way to narrow down.',
        },
      },
    ],
  });

  const isChinese = locale === 'cn' || locale === 'tw';

  return (
    <>
      <ComparisonPage
        isChinese={data.isChinese}
        breadcrumbSchema={data.breadcrumbSchema}
        faqSchema={data.faqSchema}
        itemListSchema={data.itemListSchema}
        tools={data.tools}
        tips={data.tips}
        decisionCards={data.decisionCards}
        comparisonDimensions={data.comparisonDimensions}
        fitFor={data.fitFor}
        notFor={data.notFor}
        nextPaths={data.nextPaths}
        categories={data.categories}
        config={data.config}
        siteUrl={data.siteUrl}
        locale={locale}
      />
      <div className='mx-auto mt-8 max-w-6xl px-4 lg:px-6'>
        <section className='rounded-[20px] border border-cyan-200 bg-cyan-50/60 p-6 shadow-sm lg:p-8'>
          <p className='text-sm font-semibold uppercase tracking-wide text-cyan-700'>
            {isChinese ? '高意图路径' : 'High-intent path'}
          </p>
          <h2 className='mt-1 text-2xl font-bold text-slate-950'>
            {isChinese
              ? '如果这是你的工具，下一步就去提交或认领'
              : 'If this is your tool, the next step is submission or claiming'}
          </h2>
          <p className='mt-2 max-w-3xl text-sm leading-6 text-slate-600'>
            {isChinese
              ? '已经比较到这一步，说明你多半是认真在筛选或准备上架。把工具提交进来，或者先认领条目，后面再看要不要加速审核。'
              : 'If you are this far into comparison, you are likely filtering seriously or preparing a listing. Submit your tool, or claim the listing first and decide later whether faster review is needed.'}
          </p>
          <div className='mt-5 flex flex-wrap gap-3'>
            <TrackableCtaLink
              href='/submit'
              ctaId='voice_comparison_submit'
              ctaLabel='Voice comparison submit'
              pageType='guide'
              className='inline-flex items-center justify-center rounded-lg bg-cyan-700 px-4 py-3 text-sm font-semibold text-white hover:bg-cyan-800'
            >
              {isChinese ? '提交你的工具' : 'Submit your tool'}
            </TrackableCtaLink>
            <TrackableCtaLink
              href='/developer/listing'
              ctaId='voice_comparison_claim'
              ctaLabel='Voice comparison claim'
              pageType='guide'
              className='inline-flex items-center justify-center rounded-lg border border-emerald-200 bg-white px-4 py-3 text-sm font-semibold text-emerald-800 hover:bg-emerald-50'
            >
              {isChinese ? '认领条目' : 'Claim listing'}
            </TrackableCtaLink>
          </div>
        </section>
      </div>
    </>
  );
}
