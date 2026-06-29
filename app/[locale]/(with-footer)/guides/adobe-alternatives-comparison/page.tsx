import GuideSubmissionPath from '@/components/guides/GuideSubmissionPath';

import { buildComparisonMetadata, buildComparisonPageData, ComparisonPage } from '../comparison-template';

export async function generateMetadata({ params: { locale } }: { params: { locale: string } }) {
  return buildComparisonMetadata(
    locale,
    locale === 'cn' || locale === 'tw' ? 'Adobe 替代方案对比' : 'Adobe alternatives comparison',
    locale === 'cn' || locale === 'tw'
      ? '对比几款更常被拿来替代 Adobe 的 AI 工具，帮你更快判断创作套件、视觉资产和内容生产流程该怎么选。'
      : 'Compare AI tools that are commonly used as Adobe alternatives so you can choose the right fit for creative suites, visual assets, and content-production workflows.',
  );
}

export default async function Page({ params: { locale } }: { params: { locale: string } }) {
  const data = await buildComparisonPageData(locale, {
    categoryLabel: { cn: '创作工具', en: 'Creative tools' },
    comparisonLabel: { cn: 'Adobe 替代方案对比', en: 'Adobe alternatives comparison' },
    description: {
      cn: '如果你已经在比较 Adobe 这类创作套件，这一页会把常见替代项放在一起看，帮助你判断是需要完整创作工作流，还是更轻量的单点工具。',
      en: 'If you are already comparing Adobe-style creative suites, this page puts the common alternatives side by side so you can decide whether you need a full creative workflow or a lighter point solution.',
    },
    searchQuery: 'adobe',
    guideHref: '/guides/ai-tools-for-creators',
    rankingHref: '/best-ai-tools/ai-image-tools',
    rankingLabel: { cn: '转去图像榜单页', en: 'Open the image ranking' },
    backGuideLabel: { cn: '回到创作者指南', en: 'Back to creators guide' },
    altBrowseHref: '/explore?search=creative&sort=popular',
    altBrowseLabel: { cn: '浏览更多创作工具', en: 'Browse more creative tools' },
    breadcrumbLabel: { cn: 'Adobe 替代方案对比', en: 'Adobe alternatives comparison' },
    compareTitle: {
      cn: '几款常见 Adobe 替代项的快速对照',
      en: 'A quick side-by-side look at common Adobe alternatives',
    },
    compareSubtitle: { cn: 'Adobe', en: 'Adobe' },
    preferredToolNames: ['adobe', 'shutterstock', 'sora', 'viggle'],
    decisionCards: [
      {
        title: { cn: '先看你是不是要整套创作流程', en: 'Full creative suite or point solution' },
        description: {
          cn: 'Adobe 的核心优势在于完整工作流；如果你只需要某个单点能力，替代项通常更轻。',
          en: 'Adobe’s value often comes from a full creative workflow; if you only need one point capability, a lighter alternative may fit better.',
        },
      },
      {
        title: { cn: '再看素材类型', en: 'What kind of assets do you make' },
        description: {
          cn: '你是在做图、视频、品牌素材，还是内容分发？不同资产类型会导向完全不同的选择。',
          en: 'Are you making images, video, brand assets, or content for distribution? The asset type changes the best choice.',
        },
      },
      {
        title: { cn: '最后看协作和交付', en: 'Collaboration and delivery' },
        description: {
          cn: '真正能替代 Adobe 的工具，往往要能接进团队协作、交付格式和复用流程。',
          en: 'A real Adobe alternative usually has to fit team collaboration, delivery formats, and reuse workflows.',
        },
      },
    ],
    fitFor: [
      {
        title: { cn: '内容和设计团队', en: 'Content and design teams' },
        description: {
          cn: '适合你同时要管品牌、素材、版式和交付流程。',
          en: 'Best if you need to manage branding, assets, layouts, and delivery flow together.',
        },
      },
      {
        title: { cn: '想要更轻工具的人', en: 'People who want lighter tools' },
        description: {
          cn: '如果你不想背一整套创作套件，替代项通常会更省。',
          en: 'If you do not want to carry a full creative suite, lighter alternatives are often more practical.',
        },
      },
    ],
    notFor: [
      {
        title: { cn: '只在找某个单点功能的人', en: 'People only looking for one feature' },
        description: {
          cn: '如果你只想做去背景、修图、生成图或做视频，专门工具页会更直接。',
          en: 'If you only need background removal, photo editing, image generation, or video, a dedicated tool page will be more direct.',
        },
      },
      {
        title: { cn: '还没决定自己要做什么的人', en: 'People still unsure of the output type' },
        description: {
          cn: '如果你还没想清楚是做图、做视频还是做内容资产，先回创作者指南。',
          en: 'If you are not yet sure whether the job is images, video, or content assets, start from the creators guide.',
        },
      },
    ],
    nextPaths: [
      {
        href: '/guides/ai-image-tools-comparison',
        title: { cn: '转去图像工具总对比', en: 'Go to image tools comparison' },
        description: {
          cn: '如果你更偏静态视觉资产，这页会更精确。',
          en: 'Use this if your work is more about static visual assets.',
        },
      },
      {
        href: '/guides/ai-video-tools-comparison',
        title: { cn: '转去视频工具总对比', en: 'Go to video tools comparison' },
        description: {
          cn: '如果你的产出更偏视频和动态内容，继续看这里。',
          en: 'Move here if your output is more about video and motion content.',
        },
      },
      {
        href: '/guides/ai-tools-for-creators-comparison',
        title: { cn: '转去创作者工具对比', en: 'Go to creators comparison' },
        description: {
          cn: '如果你还想把内容、图像和视频放回更宽的创作工作流里，再回这页。',
          en: 'Return here if you want to look at the broader content, image, and video workflow again.',
        },
      },
    ],
    toolSelectionNotes: {
      adobe: {
        bestFor: {
          cn: '已经在成熟创作流程里做内容、设计和交付的人。',
          en: 'People already working inside mature content, design, and delivery workflows.',
        },
        whyPickIt: {
          cn: '它的强项是完整创作套件，而不是某个单点 AI 功能。',
          en: 'Its strength is the full creative suite, not a single AI feature.',
        },
        watchOut: {
          cn: '如果你只需要轻量单点功能，Adobe 往往会显得偏重。',
          en: 'If you only need a lightweight point solution, Adobe may feel heavy.',
        },
      },
      shutterstock: {
        bestFor: {
          cn: '更在意素材库、授权和视觉资产获取的人。',
          en: 'People who care more about asset libraries, licensing, and visual asset sourcing.',
        },
        whyPickIt: {
          cn: '它更适合做素材和商业视觉资产的供给层。',
          en: 'It works better as a supply layer for stock and commercial visual assets.',
        },
        watchOut: {
          cn: '如果你要的是完整创作套件，它不是同一类产品。',
          en: 'It is not the same category if you need a full creative suite.',
        },
      },
      sora: {
        bestFor: {
          cn: '想把文字直接变成视频素材的人。',
          en: 'People who want to turn text directly into video assets.',
        },
        whyPickIt: {
          cn: '它更适合文本到视频生成，而不是通用创作套件。',
          en: 'It is better suited to text-to-video generation than a broad creative suite.',
        },
        watchOut: {
          cn: '如果你要的是全套设计、排版和交付流程，Sora 不是 Adobe 的同类替代。',
          en: 'If you need design, layout, and delivery workflows, Sora is not a like-for-like Adobe replacement.',
        },
      },
      viggle: {
        bestFor: {
          cn: '更在意角色运动和风格化视频的人。',
          en: 'People who care about character motion and stylized video.',
        },
        whyPickIt: {
          cn: '它更像一个视频操控工具，而不是通用创作平台。',
          en: 'It feels more like a video control tool than a general creative platform.',
        },
        watchOut: {
          cn: '如果你的目标是图文设计或品牌套件，它的定位就会偏离很多。',
          en: 'If your goal is image design or brand suites, its positioning is quite different.',
        },
      },
    },
    tips: {
      cn: [
        '先判断你要的是完整创作套件，还是单点生成/编辑能力。',
        '如果你做的是品牌和交付流程，整套工具往往更重要。',
        '如果你只要单点效率，轻量工具通常更合适。',
      ],
      en: [
        'Start by deciding whether you need a full creative suite or a single generation/editing capability.',
        'If you handle brand and delivery workflows, the full stack usually matters more.',
        'If you only need point efficiency, lighter tools are often the better fit.',
      ],
    },
    faqs: [
      {
        question: { cn: '为什么单独做 Adobe 替代方案页？', en: 'Why make a separate Adobe alternatives page?' },
        answer: {
          cn: '因为 Adobe 的决策通常不是单点功能，而是整个创作套件和团队工作流的替换。',
          en: 'Because Adobe decisions usually involve replacing an entire creative suite and team workflow, not just one feature.',
        },
      },
      {
        question: { cn: '你们比较的依据是什么？', en: 'What do you compare?' },
        answer: {
          cn: '我们主要看工作流完整性、资产类型、协作和交付方式、价格和真实反馈。',
          en: 'We compare workflow completeness, asset type, collaboration and delivery, pricing, and real feedback.',
        },
      },
    ],
  });

  return (
    <>
      {ComparisonPage({ ...data, locale })}
      <GuideSubmissionPath locale={locale} ctaPrefix='adobe_alternatives_comparison' />
    </>
  );
}
