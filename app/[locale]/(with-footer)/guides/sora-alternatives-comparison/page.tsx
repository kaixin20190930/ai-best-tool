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
      <GuideSubmissionPath locale={locale} ctaPrefix='sora_alternatives_comparison' />
    </>
  );
}
