import TrackableCtaLink from '@/components/analytics/TrackableCtaLink';
import GuideEvidencePanel from '@/components/guides/GuideEvidencePanel';
import GuideSubmissionPath from '@/components/guides/GuideSubmissionPath';

import { buildComparisonMetadata, buildComparisonPageData, ComparisonPage } from '../comparison-template';

export async function generateMetadata({ params: { locale } }: { params: { locale: string } }) {
  return buildComparisonMetadata(
    locale,
    locale === 'cn' || locale === 'tw' ? 'Sora 替代方案对比' : 'Sora alternatives comparison',
    locale === 'cn' || locale === 'tw'
      ? '对比几款更常被拿来替代 Sora 的 AI 工具，帮你更快判断视频生成、角色运动和多模态能力该怎么选。'
      : 'Compare AI tools that are commonly used as Sora alternatives so you can choose the right fit for video generation, character motion, and multimodal capability.',
  );
}

export default async function Page({ params: { locale } }: { params: { locale: string } }) {
  const data = await buildComparisonPageData(locale, {
    categoryLabel: { cn: '视频工具', en: 'Video tools' },
    comparisonLabel: { cn: 'Sora 替代方案对比', en: 'Sora alternatives comparison' },
    description: {
      cn: '如果你已经知道自己在找 Sora 的替代方案，这一页会把更常见的候选放在一起看，帮助你更快判断是要做文本生成视频、角色运动，还是更广的多模态工作流。',
      en: 'If you already know you are looking for a Sora alternative, this page puts the common candidates side by side so you can decide whether you need text-to-video generation, character motion, or a broader multimodal workflow.',
    },
    searchQuery: 'video',
    guideHref: '/guides/ai-video-tools',
    rankingHref: '/best-ai-tools/ai-video-tools',
    rankingLabel: { cn: '转去视频榜单页', en: 'Open the video ranking' },
    backGuideLabel: { cn: '回到视频工具指南', en: 'Back to video guide' },
    altBrowseHref: '/explore?search=video&sort=popular',
    altBrowseLabel: { cn: '浏览更多视频工具', en: 'Browse more video tools' },
    breadcrumbLabel: { cn: 'Sora 替代方案对比', en: 'Sora alternatives comparison' },
    compareTitle: {
      cn: '几款常见 Sora 替代项的快速对照',
      en: 'A quick side-by-side look at common Sora alternatives',
    },
    compareSubtitle: { cn: 'Sora', en: 'Sora' },
    preferredToolNames: ['sora', 'viggle', 'gpt_4o', 'adobe'],
    decisionCards: [
      {
        title: { cn: '先看你是要生成还是编辑', en: 'Generation or editing' },
        description: {
          cn: 'Sora 这类工具的核心是从文本生成视频；如果你更像是在编辑现有素材，比较标准就不同了。',
          en: 'Tools like Sora are mainly about generating video from text; if you are editing existing footage, the comparison changes.',
        },
      },
      {
        title: { cn: '再看角色运动和控制力', en: 'Character motion and control' },
        description: {
          cn: '如果你的创作重点是角色动作、风格控制和视觉一致性，替代项之间的差别会很明显。',
          en: 'If your focus is character motion, style control, and visual consistency, the differences between alternatives become very noticeable.',
        },
      },
      {
        title: { cn: '最后看输出能否接进工作流', en: 'Can it fit the workflow' },
        description: {
          cn: '真正值得长期用的工具，不只是能生成，还要能接进你的创作、营销或内容生产流程。',
          en: 'A tool is only truly useful long term if it fits into your creative, marketing, or content-production workflow.',
        },
      },
    ],
    fitFor: [
      {
        title: { cn: '做短视频和创意内容的人', en: 'Short-form video and creative content teams' },
        description: {
          cn: '适合你要把文本快速变成可用的视觉内容。',
          en: 'Best if you need to turn text into usable visual content quickly.',
        },
      },
      {
        title: { cn: '想看视频生成差异的人', en: 'People comparing video generation quality' },
        description: {
          cn: '如果你已经在比较视频生成质量，这个页会比泛工具页更聚焦。',
          en: 'If you are already comparing video generation quality, this page is more focused than a general tool page.',
        },
      },
    ],
    notFor: [
      {
        title: { cn: '只是在找剪辑工具的人', en: 'People only looking for editing tools' },
        description: {
          cn: '如果你主要想剪视频而不是生成视频，视频编辑工具页会更对口。',
          en: 'If your main task is editing rather than generating video, a video editing page will be more relevant.',
        },
      },
      {
        title: { cn: '还没确定视频方向的人', en: 'People still undecided on video workflows' },
        description: {
          cn: '如果你还不确定是生成、配音、剪辑还是营销视频，先回视频工具指南。',
          en: 'If you are still unsure whether the job is generation, voiceover, editing, or marketing video, start from the broader video guide.',
        },
      },
    ],
    highIntentPaths: [
      {
        href: '/best-ai-tools/ai-video-tools',
        title: { cn: '先看视频榜单', en: 'Start with the video ranking' },
        description: {
          cn: '如果你已经明确在找视频生成工具，先用榜单收口。',
          en: 'If video generation tools are already the goal, use the ranking first to narrow candidates.',
        },
      },
      {
        href: '/guides/ai-video-tools-comparison',
        title: { cn: '转去视频工具总对比', en: 'Go to video tools comparison' },
        description: {
          cn: '如果你要把候选范围再拉宽一点，这页更适合。',
          en: 'Use this when you want a broader shortlist.',
        },
      },
      {
        href: '/guides/adobe-alternatives-comparison',
        title: { cn: '转去 Adobe 替代方案对比', en: 'Go to Adobe alternatives comparison' },
        description: {
          cn: '如果你更看重完整创作和交付工作流，这条路径更高意图。',
          en: 'A higher-intent path when full creative and delivery workflow matters more.',
        },
      },
      {
        href: '/guides/ai-image-tools-comparison',
        title: { cn: '转去图像工具对比', en: 'Go to image tools comparison' },
        description: {
          cn: '如果你的最终产出更偏静态视觉素材，这页也值得继续看。',
          en: 'Move here if your output is more about static visual assets.',
        },
      },
    ],
    nextPaths: [
      {
        href: '/guides/ai-video-tools-comparison',
        title: { cn: '转去视频工具总对比', en: 'Go to video tools comparison' },
        description: {
          cn: '如果你想把候选范围再拉宽一点，这页更适合。',
          en: 'Use this when you want a broader shortlist.',
        },
      },
      {
        href: '/guides/ai-video-tools',
        title: { cn: '转去视频工具指南', en: 'Go to video guide' },
        description: {
          cn: '如果你还想重新按场景判断，再回指南页。',
          en: 'Go back to the guide if you want to re-check the use case framing.',
        },
      },
      {
        href: '/guides/ai-image-tools-comparison',
        title: { cn: '转去图像工具对比', en: 'Go to image tools comparison' },
        description: {
          cn: '如果你的输出其实更偏静态视觉素材，这条路径更合适。',
          en: 'Switch here if your output is actually more about static visual assets.',
        },
      },
    ],
    toolSelectionNotes: {
      sora: {
        bestFor: {
          cn: '想把文本直接变成更真实的视频场景的人。',
          en: 'People who want to turn text directly into realistic video scenes.',
        },
        whyPickIt: {
          cn: '它更适合做从文字到视频的核心生成任务。',
          en: 'It is more aligned with core text-to-video generation.',
        },
        watchOut: {
          cn: '如果你需要更强的角色动作控制或更完整的制作链路，别只看它一个。',
          en: 'If you need stronger character motion control or a fuller production chain, compare other tools too.',
        },
      },
      viggle: {
        bestFor: {
          cn: '更在意角色动作、运动控制和风格化视频的人。',
          en: 'People who care more about character motion, movement control, and stylized video.',
        },
        whyPickIt: {
          cn: '它在角色运动和视频操控感上有不同于纯文本生成的优势。',
          en: 'It has strengths around character motion and control that differ from pure text generation.',
        },
        watchOut: {
          cn: '如果你要的是通用的视频生成，不要把它和 Sora 直接画等号。',
          en: 'If you want broad video generation, do not treat it as a direct Sora clone.',
        },
      },
      gpt_4o: {
        bestFor: {
          cn: '想把文本、图像和更广的多模态能力放在一起用的人。',
          en: 'People who want text, image, and broader multimodal capability in one place.',
        },
        whyPickIt: {
          cn: '它更像一个多模态工作入口，而不是纯视频生成器。',
          en: 'It feels more like a multimodal work entry point than a pure video generator.',
        },
        watchOut: {
          cn: '如果你只关心视频产出，它不是最纯粹的对比对象。',
          en: 'If you only care about video output, it is not the purest comparison target.',
        },
      },
      adobe: {
        bestFor: {
          cn: '已经在 Adobe 工作流里做内容制作的人。',
          en: 'People already creating content inside Adobe workflows.',
        },
        whyPickIt: {
          cn: '它更适合把 AI 产出接进成熟的创作和编辑流程。',
          en: 'It is better when you want AI output to plug into an established creative and editing pipeline.',
        },
        watchOut: {
          cn: '如果你要的是纯文本到视频，它的定位和 Sora 不完全一样。',
          en: 'If you want pure text-to-video, its position is not identical to Sora.',
        },
      },
    },
    tips: {
      cn: [
        '先判断你是要生成视频，还是要接入更完整的制作流程。',
        '如果你看重角色控制，别只看画面“像不像”，也要看“能不能控”。',
        '视频类替代方案的关键不是谁更炫，而是谁更适合你的制作步骤。',
      ],
      en: [
        'First decide whether you are generating video or plugging into a fuller production workflow.',
        'If character control matters, do not only ask whether it looks good; ask whether it is controllable.',
        'The key for video alternatives is not who looks flashier, but who fits your production steps.',
      ],
    },
    faqs: [
      {
        question: { cn: '为什么单独做 Sora 替代方案页？', en: 'Why make a separate Sora alternatives page?' },
        answer: {
          cn: '因为视频生成的决策重点更明确，通常就是在生成、控制和工作流之间做选择。',
          en: 'Because video generation decisions are usually very specific, often centered on generation, control, and workflow fit.',
        },
      },
      {
        question: { cn: '你们比较的依据是什么？', en: 'What do you compare?' },
        answer: {
          cn: '我们主要看视频生成质量、角色控制、工作流贴合度、更新情况、价格和真实反馈。',
          en: 'We compare video quality, character control, workflow fit, freshness, pricing, and real feedback.',
        },
      },
    ],
  });

  return (
    <>
      {ComparisonPage({ ...data, locale })}
      <GuideEvidencePanel
        locale={locale}
        checkedAt='2026-07-18'
        scope={
          locale === 'cn' || locale === 'tw'
            ? 'Sora 对比页现在先判断“你到底要做视频生成还是更广的多模态创作”。'
            : 'This Sora comparison page now starts by asking whether you need video generation or broader multimodal creation.'
        }
        decisionSteps={
          locale === 'cn' || locale === 'tw'
            ? ['先确定是视频还是多模态创作', '再看角色运动与导出', '最后才决定是否继续对比']
            : [
                'Confirm whether you need video or multimodal creation first',
                'Then review motion and export',
                'Only then decide whether to keep comparing',
              ]
        }
        items={[
          {
            label: locale === 'cn' || locale === 'tw' ? '目标类型' : 'Target type',
            value: locale === 'cn' || locale === 'tw' ? '视频 / 多模态 / 创作' : 'Video / multimodal / creation',
            note:
              locale === 'cn' || locale === 'tw'
                ? '任务边界越清楚，对比页越有帮助。'
                : 'The clearer the task boundary, the more useful the comparison page becomes.',
          },
          {
            label: locale === 'cn' || locale === 'tw' ? '工作流' : 'Workflow',
            value: locale === 'cn' || locale === 'tw' ? '生成、动作、导出' : 'Generation, motion, export',
            note:
              locale === 'cn' || locale === 'tw'
                ? '如果需要反复改镜头和风格，这些流程会直接影响效率。'
                : 'If you keep revising shots and style, these flows directly affect efficiency.',
          },
          {
            label: locale === 'cn' || locale === 'tw' ? '验证顺序' : 'Validation order',
            value: locale === 'cn' || locale === 'tw' ? '先缩短 shortlist' : 'Shortlist first',
            note:
              locale === 'cn' || locale === 'tw'
                ? '先收窄候选，再去官网验证是否真适合。'
                : 'Narrow the shortlist first, then validate on the official site.',
          },
        ]}
        signalCards={[
          {
            label: locale === 'cn' || locale === 'tw' ? '目标信号' : 'Target signal',
            value: locale === 'cn' || locale === 'tw' ? '视频 / 多模态 / 创作' : 'Video / multimodal / creation',
            note:
              locale === 'cn' || locale === 'tw'
                ? '任务边界越清楚，对比页越有帮助。'
                : 'The clearer the task boundary, the more useful the comparison page becomes.',
          },
          {
            label: locale === 'cn' || locale === 'tw' ? '流程信号' : 'Workflow signal',
            value: locale === 'cn' || locale === 'tw' ? '生成、动作、导出' : 'Generation, motion, export',
            note:
              locale === 'cn' || locale === 'tw'
                ? '如果需要反复改镜头和风格，这些流程会直接影响效率。'
                : 'If you keep revising shots and style, these flows directly affect efficiency.',
          },
          {
            label: locale === 'cn' || locale === 'tw' ? '收口信号' : 'Shortlist signal',
            value: locale === 'cn' || locale === 'tw' ? '先缩短 shortlist' : 'Shortlist first',
            note:
              locale === 'cn' || locale === 'tw'
                ? '先收窄候选，再去官网验证是否真适合。'
                : 'Narrow the shortlist first, then validate on the official site.',
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
              ? '先看榜单，再决定是继续看 Sora 替代还是切到相邻入口'
              : 'Start with the ranking, then decide whether to keep comparing Sora alternatives or switch to an adjacent path'}
          </h2>
          <p className='mt-2 max-w-3xl text-sm leading-6 text-slate-600'>
            {locale === 'cn' || locale === 'tw'
              ? '如果你已经明确要做视频生成，先收紧 shortlist 往往比继续横向浏览更有效。'
              : 'If video generation is already the goal, narrowing the shortlist first is usually better than continuing to browse horizontally.'}
          </p>
          <div className='mt-5 grid gap-3 md:grid-cols-2 xl:grid-cols-4'>
            {[
              {
                href: '/best-ai-tools/ai-video-tools',
                title: locale === 'cn' || locale === 'tw' ? '视频榜单' : 'Video ranking',
                desc:
                  locale === 'cn' || locale === 'tw'
                    ? '先收窄到更值得试用的视频候选。'
                    : 'Narrow to the most trial-worthy video candidates first.',
              },
              {
                href: '/guides/ai-video-tools-comparison',
                title: locale === 'cn' || locale === 'tw' ? '视频工具对比' : 'Video tools comparison',
                desc:
                  locale === 'cn' || locale === 'tw'
                    ? '如果你要看更广的内容生成工作流。'
                    : 'Useful when you want to compare the broader content-generation workflow.',
              },
              {
                href: '/guides/ai-image-tools-comparison',
                title: locale === 'cn' || locale === 'tw' ? '图像工具对比' : 'Image tools comparison',
                desc:
                  locale === 'cn' || locale === 'tw'
                    ? '如果你的多模态流程也包含图片。'
                    : 'A better path when your multimodal workflow also includes images.',
              },
              {
                href: '/guides/ai-tools-for-creators-comparison',
                title: locale === 'cn' || locale === 'tw' ? '创作者工具对比' : 'Creator tools comparison',
                desc:
                  locale === 'cn' || locale === 'tw'
                    ? '如果 Sora 只是内容生产的一部分。'
                    : 'Useful when Sora is only one part of a broader creator workflow.',
              },
            ].map((item) => (
              <TrackableCtaLink
                key={item.href}
                href={item.href}
                ctaId={`sora_ranking_${item.href.split('/').pop()}`}
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
          <p className='mt-2 text-lg font-bold text-slate-950'>2026-07-18</p>
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
      <GuideSubmissionPath locale={locale} ctaPrefix='sora_alternatives_comparison' />
    </>
  );
}
