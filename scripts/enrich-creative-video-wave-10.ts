/* eslint-disable no-console */
import fs from 'node:fs';
import path from 'node:path';

import { closePool, query } from '@/db/neon/client';

type LocalizedText = {
  en: string;
  zh: string;
};

type LocalizedList = {
  en: string[];
  zh: string[];
};

type LocalizedFeatureEntry = {
  label: string;
  value: string;
};

type ToolSeed = {
  name: string;
  title: string;
  url: string;
  categorySlug: 'productivity' | 'chatbot' | 'design-art';
  pricing: 'free' | 'freemium' | 'paid';
  tags: string[];
  content: LocalizedText;
  detail: LocalizedText;
  useCases: LocalizedList;
  features: {
    en: LocalizedFeatureEntry[];
    zh: LocalizedFeatureEntry[];
  };
  audience: {
    bestFit: LocalizedList;
    notIdealFor: LocalizedList;
  };
  editorialSummary: LocalizedText;
  trustNote: LocalizedText;
  decision: {
    compareAxes: LocalizedList;
    officialSummary: LocalizedText;
    freshnessSummary: LocalizedText;
    pricingSummary: LocalizedText;
    mediaSummary: LocalizedText;
    communitySummary: LocalizedText;
  };
  media: {
    category: string;
    accent: string;
    accentSoft: string;
    accentStrong: string;
    surface: string;
    badge: string;
    summary: string;
    logoText: string;
  };
};

type TagSeed = {
  slug: string;
  en: string;
  zh: string;
};

const ROOT = '/Users/liukai/web/ai-best-tool';
const COVER_DIR = path.join(ROOT, 'public/images/tool-media');
const LOGO_DIR = path.join(ROOT, 'public/icons/tool-logos');

const TAGS: TagSeed[] = [
  { slug: 'video-generation', en: 'Video Generation', zh: '视频生成' },
  { slug: 'avatar-video', en: 'Avatar Video', zh: '数字人视频' },
  { slug: 'image-generation', en: 'Image Generation', zh: '图像生成' },
  { slug: 'design', en: 'Design', zh: '设计' },
  { slug: 'visual-content', en: 'Visual Content', zh: '视觉内容' },
  { slug: 'creative-suite', en: 'Creative Suite', zh: '创意套件' },
  { slug: 'workspace', en: 'Workspace', zh: '工作区' },
  { slug: 'note-taking', en: 'Note Taking', zh: '笔记' },
  { slug: 'knowledge-base', en: 'Knowledge Base', zh: '知识库' },
  { slug: 'memory', en: 'Memory', zh: '记忆管理' },
];

const TOOLS: ToolSeed[] = [
  {
    name: 'heygen',
    title: 'HeyGen',
    url: 'https://www.heygen.com',
    categorySlug: 'design-art',
    pricing: 'paid',
    tags: ['video-generation', 'avatar-video', 'visual-content'],
    content: {
      en: 'An AI video platform focused on avatar-led videos, quick presentation clips, and scalable talking-head production.',
      zh: '一个专注于数字人视频、快速讲解短片和可规模化口播内容制作的 AI 视频平台。',
    },
    detail: {
      en: `HeyGen matters when the goal is not open-ended video editing, but fast production of presentable spokesperson-style content. It sits in a practical corner of the creative stack where teams care about turnaround time, repeatability, and how quickly an idea becomes a publishable clip.

The real decision is whether avatar-first video creation saves enough time to justify another paid creative tool. If the workflow includes explainers, landing-page videos, onboarding clips, or lightweight campaign content, it deserves a real comparison.`,
      zh: `当目标不是开放式视频剪辑，而是快速产出“能发布的讲解型内容”时，HeyGen 就很有代表性。它处在创意栈里一个很务实的位置，团队真正关心的是交付速度、可重复性，以及一个想法能多快变成可用视频。

这页真正要帮助用户判断的是：数字人优先的视频生成，是否足够节省时间，值得再引入一个付费创意工具。如果你的流程里有讲解视频、落地页视频、入门引导短片或轻量营销内容，它值得认真比较。`,
    },
    useCases: {
      en: ['Avatar-led explainers', 'Landing-page videos', 'Onboarding clips', 'Fast marketing content'],
      zh: ['数字人讲解视频', '落地页视频', '入门引导短片', '快速营销内容'],
    },
    features: {
      en: [
        { label: 'Core focus', value: 'Turning scripts into presentable avatar-style videos with less production overhead.' },
        { label: 'Best for', value: 'Teams publishing repeat explainer or campaign videos at speed.' },
        { label: 'Decision angle', value: 'Compare on production speed, presentability, and repeat publishing fit.' },
      ],
      zh: [
        { label: '核心定位', value: '用更低制作成本把脚本快速转成可发布的数字人口播视频。' },
        { label: '更适合', value: '需要高频发布讲解或营销视频的团队。' },
        { label: '比较重点', value: '重点比较制作速度、成片观感和重复发布适配度。' },
      ],
    },
    audience: {
      bestFit: {
        en: ['Marketing teams', 'Growth operators', 'Founders making explainers quickly'],
        zh: ['营销团队', '增长运营者', '需要快速制作讲解视频的创始人'],
      },
      notIdealFor: {
        en: ['Studios wanting deep cinematic control', 'Teams only needing transcript summaries'],
        zh: ['需要深度影视控制的工作室', '只需要文字总结的团队'],
      },
    },
    editorialSummary: {
      en: 'Reviewed as a fast avatar-video production tool rather than a general editing suite.',
      zh: '已按“快速数字人视频生产工具”而不是通用剪辑套件来复核。',
    },
    trustNote: {
      en: 'This listing keeps the comparison anchored on speed-to-publish and operational usefulness, where HeyGen is most often judged.',
      zh: '本条目把比较锚点放在发布速度和运营实用性上，这也是 HeyGen 最常被判断的地方。',
    },
    decision: {
      compareAxes: {
        en: ['Production speed', 'Avatar presentation quality', 'Repeat publishing value'],
        zh: ['制作速度', '数字人呈现质量', '重复发布价值'],
      },
      officialSummary: {
        en: 'The official site is useful for trust, but the deeper question is whether the resulting videos are good enough to publish repeatedly without feeling gimmicky.',
        zh: '官网本身适合作为信任检查点，但更深层的问题是：产出的视频是否足够自然，能被反复发布，而不是只停留在噱头。',
      },
      freshnessSummary: {
        en: 'AI video products evolve quickly through templates and packaging, so final plan details should still be checked on the official site.',
        zh: 'AI 视频产品会随着模板和套餐快速变化，所以最终套餐细节仍建议回官网确认。',
      },
      pricingSummary: {
        en: 'The price is easiest to justify when you already know short-form video is a repeated growth channel.',
        zh: '只有当你已经明确短视频是重复性的增长渠道时，这类产品的价格才最容易成立。',
      },
      mediaSummary: {
        en: 'Preview coverage matters because users need to judge whether the visual output feels publishable instead of obviously synthetic.',
        zh: '这里的预览很关键，因为用户需要判断成片到底是“可发布”，还是一眼就显得太合成。',
      },
      communitySummary: {
        en: 'The best signal comes from teams explaining whether HeyGen actually reduced production bottlenecks for recurring video work.',
        zh: '最有价值的信号，来自团队是否说明 HeyGen 真的减少了重复性视频制作的瓶颈。',
      },
    },
    media: {
      category: 'Design & Art',
      accent: '#2563eb',
      accentSoft: '#dbeafe',
      accentStrong: '#1d4ed8',
      surface: '#f8fbff',
      badge: 'Avatar video workflow',
      summary: 'Produce explainers, onboarding clips, and campaign videos with less editing overhead.',
      logoText: 'Hg',
    },
  },
  {
    name: 'pika',
    title: 'Pika',
    url: 'https://pika.art',
    categorySlug: 'design-art',
    pricing: 'freemium',
    tags: ['video-generation', 'visual-content', 'design'],
    content: {
      en: 'A creative AI tool for generating short visual clips and experimenting with lightweight video ideas.',
      zh: '一个用于生成短视频片段、快速试验轻量视觉创意的 AI 工具。',
    },
    detail: {
      en: `Pika becomes relevant when the creative task is quick motion output rather than heavyweight video production. It belongs in the shortlist for users who want to test visual ideas, social clips, and short-form motion without committing to a full studio workflow.

The practical decision is whether Pika helps a team move from concept to motion fast enough to earn a slot in the tool stack. If the work is exploratory, social, and speed-sensitive, it is worth comparing on that basis.`,
      zh: `当创意任务更偏“快速动起来”，而不是重型视频制作时，Pika 就会更有意义。对于那些想快速测试视觉想法、社交短片和轻量动态内容的用户来说，它值得进入 shortlist，而不必一开始就进入完整工作室流程。

这里真正的判断点是：Pika 是否足够快地帮助团队把概念变成动态结果，值得进入工具栈。如果你的工作强调探索、社交传播和速度，它应该按这些维度来比较。`,
    },
    useCases: {
      en: ['Short motion clips', 'Social video experiments', 'Creative concept testing', 'Fast visual ideas'],
      zh: ['短动态视频', '社交视频试验', '创意概念测试', '快速视觉想法验证'],
    },
    features: {
      en: [
        { label: 'Core focus', value: 'Quick visual motion output instead of heavyweight production workflows.' },
        { label: 'Best for', value: 'Creators experimenting with short-form motion and fast creative iteration.' },
        { label: 'Decision angle', value: 'Compare on speed, idea-to-motion payoff, and lightweight creative usability.' },
      ],
      zh: [
        { label: '核心定位', value: '更偏快速动态产出，而不是重型视频制作工作流。' },
        { label: '更适合', value: '在做短动态内容和快速创意迭代的创作者。' },
        { label: '比较重点', value: '重点比较速度、概念到动态结果的回报，以及轻量创意可用性。' },
      ],
    },
    audience: {
      bestFit: {
        en: ['Creators making social clips', 'Teams testing visual ideas quickly', 'Designers exploring motion content'],
        zh: ['制作社交短片的创作者', '快速测试视觉想法的团队', '探索动态内容的设计师'],
      },
      notIdealFor: {
        en: ['Teams needing broadcast-grade control', 'Users only looking for static design tools'],
        zh: ['需要广播级控制能力的团队', '只在寻找静态设计工具的用户'],
      },
    },
    editorialSummary: {
      en: 'Reviewed as a fast motion-idea tool rather than a full professional editing environment.',
      zh: '已按“快速动态创意工具”而不是完整专业剪辑环境来复核。',
    },
    trustNote: {
      en: 'This listing keeps the comparison focused on short-form motion usefulness and iteration speed, where Pika is most meaningfully judged.',
      zh: '本条目把比较重点放在短动态实用性和迭代速度上，这也是 Pika 最值得被判断的地方。',
    },
    decision: {
      compareAxes: {
        en: ['Iteration speed', 'Motion output feel', 'Short-form creative fit'],
        zh: ['迭代速度', '动态成片质感', '短内容创意适配'],
      },
      officialSummary: {
        en: 'The official site is useful as a trust checkpoint, but the deeper question is whether the output quality is strong enough for real repeat use.',
        zh: '官网本身适合作为信任检查点，但更深层的问题是：输出质量是否足够稳定，能进入真实重复使用。',
      },
      freshnessSummary: {
        en: 'Short-form video products evolve rapidly, so exact capabilities and plan boundaries should still be confirmed on the official site.',
        zh: '短视频生成产品变化很快，所以具体能力和套餐边界仍建议回官网确认。',
      },
      pricingSummary: {
        en: 'The price is easiest to justify when motion experiments are already part of weekly content output.',
        zh: '只有当动态内容试验已经成为每周内容生产的一部分时，这类产品的价格才更容易证明合理。',
      },
      mediaSummary: {
        en: 'Preview coverage helps users judge whether Pika feels like a fun novelty or a real creative output tool.',
        zh: '这里的预览能帮助用户判断：Pika 更像新鲜玩具，还是一个真正能产出内容的创意工具。',
      },
      communitySummary: {
        en: 'The strongest signal comes from creators explaining whether Pika actually shortened their concept-to-content loop.',
        zh: '最强的信号，来自创作者是否说明 Pika 真的缩短了他们“概念到内容”的循环。',
      },
    },
    media: {
      category: 'Design & Art',
      accent: '#8b5cf6',
      accentSoft: '#ede9fe',
      accentStrong: '#7c3aed',
      surface: '#faf8ff',
      badge: 'Fast motion ideas',
      summary: 'Test social clips and lightweight video concepts without a heavy production stack.',
      logoText: 'Pk',
    },
  },
  {
    name: 'adobe-firefly',
    title: 'Adobe Firefly',
    url: 'https://firefly.adobe.com',
    categorySlug: 'design-art',
    pricing: 'freemium',
    tags: ['image-generation', 'design', 'creative-suite'],
    content: {
      en: 'A generative AI tool inside the Adobe ecosystem for image creation, variation, and design-adjacent content production.',
      zh: '一个处于 Adobe 生态中的生成式 AI 工具，用于图像创作、变体生成和设计相关内容生产。',
    },
    detail: {
      en: `Adobe Firefly matters because many teams are not choosing an isolated generator; they are choosing whether generative output fits into an existing creative suite. It is most relevant when workflow continuity, brand familiarity, and design-team adoption matter as much as raw generation novelty.

The real decision is whether Firefly adds enough everyday creative value inside a broader design stack. If your team already lives near Adobe-style workflows, it deserves a more serious comparison than standalone image toys.`,
      zh: `Adobe Firefly 之所以重要，是因为很多团队不是在选择一个孤立的生成器，而是在判断生成式输出是否能嵌入现有创意套件。它最有意义的场景，是工作流连续性、品牌熟悉度和设计团队采用成本，与“生成新奇感”同样重要的时候。

这里真正的判断点是：Firefly 是否在更大的设计栈里增加了足够多的日常价值。如果你的团队本来就接近 Adobe 式工作流，它值得比独立图像玩具更认真地比较。`,
    },
    useCases: {
      en: ['Image generation', 'Design variations', 'Creative ideation', 'Adobe-adjacent workflows'],
      zh: ['图像生成', '设计变体', '创意构思', 'Adobe 相关工作流'],
    },
    features: {
      en: [
        { label: 'Core focus', value: 'Generative image and design support inside a broader creative ecosystem.' },
        { label: 'Best for', value: 'Teams already close to Adobe workflows and repeat visual production.' },
        { label: 'Decision angle', value: 'Compare on ecosystem fit, design usefulness, and repeat creative value.' },
      ],
      zh: [
        { label: '核心定位', value: '在更大创意生态中提供图像生成和设计辅助。' },
        { label: '更适合', value: '已经接近 Adobe 工作流、并且有重复视觉产出的团队。' },
        { label: '比较重点', value: '重点比较生态适配、设计实用性和重复创作价值。' },
      ],
    },
    audience: {
      bestFit: {
        en: ['Design teams', 'Brand operators', 'Teams working in Adobe-adjacent stacks'],
        zh: ['设计团队', '品牌运营者', '工作在 Adobe 相关栈中的团队'],
      },
      notIdealFor: {
        en: ['Users only wanting the cheapest standalone image toy', 'Teams that never touch design workflows'],
        zh: ['只想找最便宜独立图像玩具的用户', '完全不进入设计工作流的团队'],
      },
    },
    editorialSummary: {
      en: 'Reviewed as an ecosystem design tool rather than a pure standalone image generator.',
      zh: '已按“生态型设计工具”而不是纯独立图像生成器来复核。',
    },
    trustNote: {
      en: 'This listing keeps the comparison focused on workflow fit and repeat design usefulness, which is where Firefly is most honestly judged.',
      zh: '本条目把比较重点放在工作流适配和重复设计实用性上，这也是 Firefly 最值得被诚实判断的地方。',
    },
    decision: {
      compareAxes: {
        en: ['Ecosystem fit', 'Design usefulness', 'Repeat creative value'],
        zh: ['生态适配', '设计实用性', '重复创意价值'],
      },
      officialSummary: {
        en: 'The official site is a strong trust checkpoint, but the deeper question is whether Firefly materially improves the team’s real design throughput.',
        zh: '官网本身是很强的信任检查点，但更深层的问题是：Firefly 是否真实提升了团队的设计吞吐量。',
      },
      freshnessSummary: {
        en: 'Creative-suite products evolve through packaging and integrations, so exact plan details should still be checked on the official site.',
        zh: '创意套件类产品会随着套餐和集成变化，所以具体方案细节仍建议回官网确认。',
      },
      pricingSummary: {
        en: 'The price is easiest to justify when generated assets plug directly into an already active design workflow.',
        zh: '只有当生成素材能直接进入已有的设计工作流时，这类产品的价格才最容易被证明合理。',
      },
      mediaSummary: {
        en: 'Preview coverage helps users judge whether Firefly feels embedded in a practical design flow instead of acting like a detached image demo.',
        zh: '这里的预览能帮助用户判断：Firefly 是不是嵌在实用设计流程里，而不是像一个孤立的图像演示页。',
      },
      communitySummary: {
        en: 'The strongest signal comes from designers explaining whether Firefly became part of routine asset production.',
        zh: '最强的信号，来自设计师是否说明 Firefly 已经进入日常素材生产流程。',
      },
    },
    media: {
      category: 'Design & Art',
      accent: '#f97316',
      accentSoft: '#ffedd5',
      accentStrong: '#ea580c',
      surface: '#fffaf5',
      badge: 'Creative suite AI',
      summary: 'Generate and vary design assets inside a workflow closer to an established creative stack.',
      logoText: 'Af',
    },
  },
  {
    name: 'synthesia',
    title: 'Synthesia',
    url: 'https://www.synthesia.io',
    categorySlug: 'design-art',
    pricing: 'paid',
    tags: ['video-generation', 'avatar-video', 'workspace'],
    content: {
      en: 'An AI video platform for scripted presenter-style videos, training content, and scalable internal communication assets.',
      zh: '一个用于脚本化讲解视频、培训内容和可规模化内部沟通素材的 AI 视频平台。',
    },
    detail: {
      en: `Synthesia is most relevant when the team’s job is not just making one-off creative clips, but producing repeatable training, onboarding, and internal communication videos. It belongs in a more operations-oriented part of the video category where consistency and workflow scale matter more than cinematic flexibility.

The decision on this page is whether Synthesia reduces enough production friction for repeat video communication. If the work involves enablement, training, or structured explainers, it deserves a serious comparison.`,
      zh: `当团队的任务不是做一次性的创意短片，而是要反复生产培训、入门引导和内部沟通视频时，Synthesia 就会更有相关性。它属于视频分类里更偏运营的一侧，关注点不是电影感灵活度，而是一致性和流程规模化。

这页真正要帮助用户判断的是：Synthesia 是否足够明显地降低了重复视频沟通的制作摩擦。如果你的工作涉及培训、赋能或结构化讲解，它值得被认真比较。`,
    },
    useCases: {
      en: ['Training videos', 'Onboarding content', 'Internal communication', 'Structured explainers'],
      zh: ['培训视频', '入门引导内容', '内部沟通', '结构化讲解'],
    },
    features: {
      en: [
        { label: 'Core focus', value: 'Scaling repeat presenter-style communication without traditional production overhead.' },
        { label: 'Best for', value: 'Teams producing recurring training and enablement video assets.' },
        { label: 'Decision angle', value: 'Compare on repeatability, communication clarity, and production efficiency.' },
      ],
      zh: [
        { label: '核心定位', value: '在不走传统制作流程的前提下规模化产出讲解型视频。' },
        { label: '更适合', value: '持续制作培训和赋能视频素材的团队。' },
        { label: '比较重点', value: '重点比较可重复性、沟通清晰度和制作效率。' },
      ],
    },
    audience: {
      bestFit: {
        en: ['Enablement teams', 'Training owners', 'Operations teams shipping repeat videos'],
        zh: ['赋能团队', '培训负责人', '高频发布重复视频的运营团队'],
      },
      notIdealFor: {
        en: ['Studios needing deep editing control', 'Users only wanting lightweight social experiments'],
        zh: ['需要深度剪辑控制的工作室', '只想做轻量社交试验的用户'],
      },
    },
    editorialSummary: {
      en: 'Reviewed as an operational video-production layer rather than a freeform creative editor.',
      zh: '已按“运营型视频生产层”而不是自由创意编辑器来复核。',
    },
    trustNote: {
      en: 'This listing keeps the comparison focused on repeat communication output, where Synthesia is most meaningfully judged.',
      zh: '本条目把比较重点放在重复沟通内容产出上，这也是 Synthesia 最值得被判断的地方。',
    },
    decision: {
      compareAxes: {
        en: ['Repeatability', 'Communication clarity', 'Production efficiency'],
        zh: ['可重复性', '沟通清晰度', '制作效率'],
      },
      officialSummary: {
        en: 'The official site is useful for trust, but the deeper question is whether the platform becomes a real internal content engine instead of a novelty demo.',
        zh: '官网本身适合作为信任检查点，但更深层的问题是：这个平台是否能成为真正的内部内容引擎，而不是演示级工具。',
      },
      freshnessSummary: {
        en: 'AI video platforms keep evolving, so exact plan boundaries and production details should still be checked on the official site.',
        zh: 'AI 视频平台会持续变化，所以具体套餐边界和制作细节仍建议回官网确认。',
      },
      pricingSummary: {
        en: 'The price becomes easier to defend when recurring training or enablement content already creates a visible production burden.',
        zh: '只有当重复性的培训或赋能内容已经形成明显制作负担时，这类产品的价格才更容易被证明合理。',
      },
      mediaSummary: {
        en: 'Preview coverage matters because users need to judge whether the output feels clear and credible enough for repeated business communication.',
        zh: '这里的预览很重要，因为用户需要判断成片是否足够清晰可信，能进入重复性的业务沟通。',
      },
      communitySummary: {
        en: 'The best signal comes from teams describing whether Synthesia actually improved internal video throughput.',
        zh: '最有价值的信号，来自团队是否说明 Synthesia 真的提升了内部视频产能。',
      },
    },
    media: {
      category: 'Design & Art',
      accent: '#0ea5e9',
      accentSoft: '#e0f2fe',
      accentStrong: '#0284c7',
      surface: '#f5fbff',
      badge: 'Operational video layer',
      summary: 'Scale training, onboarding, and structured explainer videos with less production friction.',
      logoText: 'Sy',
    },
  },
  {
    name: 'mem-ai',
    title: 'Mem',
    url: 'https://mem.ai',
    categorySlug: 'productivity',
    pricing: 'paid',
    tags: ['note-taking', 'knowledge-base', 'memory'],
    content: {
      en: 'A note and knowledge tool designed to help users capture, connect, and retrieve ideas without rigid manual organization.',
      zh: '一个帮助用户记录、关联和检索想法的笔记与知识工具，尽量减少僵硬的手工整理。',
    },
    detail: {
      en: `Mem becomes relevant when note-taking is not just about storing text, but about being able to resurface useful context later. It belongs in a more workflow-oriented knowledge category where users care about recall, connected thinking, and not having to babysit a folder structure all day.

The real decision is whether Mem gives enough retrieval and organization leverage to become part of a daily thinking workflow. If the work involves many fragmented notes and recurring context switching, it deserves a closer look.`,
      zh: `当笔记不只是“存下来”，而是要在之后重新找回有用上下文时，Mem 就会更有意义。它属于更偏工作流的知识工具类别，用户在意的是记忆召回、关联式思考，以及不想整天维护文件夹结构。

这页真正的判断点是：Mem 是否能提供足够多的检索和组织杠杆，进入日常思考工作流。如果你的工作里有大量碎片笔记和频繁上下文切换，它值得被更认真地看一眼。`,
    },
    useCases: {
      en: ['Knowledge capture', 'Daily note-taking', 'Context retrieval', 'Connected thinking'],
      zh: ['知识记录', '日常笔记', '上下文检索', '关联式思考'],
    },
    features: {
      en: [
        { label: 'Core focus', value: 'Helping users retrieve and connect notes instead of manually filing everything.' },
        { label: 'Best for', value: 'People managing lots of fragmented notes and recurring context shifts.' },
        { label: 'Decision angle', value: 'Compare on retrieval quality, workflow calmness, and daily thinking fit.' },
      ],
      zh: [
        { label: '核心定位', value: '帮助用户检索和关联笔记，而不是手工归档一切。' },
        { label: '更适合', value: '管理大量碎片笔记并频繁切换上下文的人。' },
        { label: '比较重点', value: '重点比较检索质量、流程轻松感和日常思考适配度。' },
      ],
    },
    audience: {
      bestFit: {
        en: ['Knowledge workers', 'Researchers with many notes', 'Operators juggling recurring context'],
        zh: ['知识工作者', '笔记很多的研究人员', '在重复上下文中切换的运营者'],
      },
      notIdealFor: {
        en: ['Teams wanting strict database-like structure', 'Users only needing a simple scratchpad'],
        zh: ['需要严格数据库式结构的团队', '只需要简单草稿本的用户'],
      },
    },
    editorialSummary: {
      en: 'Reviewed as a retrieval-first knowledge tool rather than a plain notebook.',
      zh: '已按“检索优先的知识工具”而不是普通笔记本来复核。',
    },
    trustNote: {
      en: 'This listing keeps the comparison focused on note recall and daily workflow usefulness, where Mem is most honestly judged.',
      zh: '本条目把比较重点放在笔记召回和日常工作流实用性上，这也是 Mem 最值得被诚实判断的地方。',
    },
    decision: {
      compareAxes: {
        en: ['Retrieval quality', 'Workflow calmness', 'Daily knowledge fit'],
        zh: ['检索质量', '流程轻松感', '日常知识工作适配'],
      },
      officialSummary: {
        en: 'The official site is useful as a trust checkpoint, but the deeper question is whether Mem actually helps users find and reuse knowledge later.',
        zh: '官网本身适合作为信任检查点，但更深层的问题是：Mem 是否真的帮助用户在之后找回并复用知识。',
      },
      freshnessSummary: {
        en: 'Knowledge tools evolve through workflows and packaging, so exact plan details should still be confirmed on the official site.',
        zh: '知识工具会随着工作流和套餐变化，所以具体方案细节仍建议回官网确认。',
      },
      pricingSummary: {
        en: 'The price is easiest to justify when note retrieval and repeated context switching are already real productivity costs.',
        zh: '只有当笔记检索和反复上下文切换已经成为真实效率成本时，这类产品的价格才最容易成立。',
      },
      mediaSummary: {
        en: 'Preview coverage helps users judge whether the workspace feels calm and usable enough for daily thinking rather than just aspirational.',
        zh: '这里的预览能帮助用户判断：这个工作区是否足够平静、足够可用，能进入日常思考，而不只是看起来理想化。',
      },
      communitySummary: {
        en: 'The strongest signal comes from users explaining whether Mem actually improved recall and reduced note-chaos over time.',
        zh: '最强的信号，来自用户是否说明 Mem 真的改善了知识召回，并随着时间减少了笔记混乱。',
      },
    },
    media: {
      category: 'Productivity',
      accent: '#14b8a6',
      accentSoft: '#ccfbf1',
      accentStrong: '#0f766e',
      surface: '#f4fffd',
      badge: 'Knowledge retrieval',
      summary: 'Capture ideas, reconnect context, and reduce note chaos in a calmer daily workspace.',
      logoText: 'Me',
    },
  },
];

function loadLocalEnv() {
  const envPath = path.join(ROOT, '.env.local');
  if (!fs.existsSync(envPath)) return;

  for (const line of fs.readFileSync(envPath, 'utf8').split('\n')) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith('#')) continue;
    const eq = trimmed.indexOf('=');
    if (eq === -1) continue;

    const key = trimmed.slice(0, eq).trim();
    const value = trimmed.slice(eq + 1).trim().replace(/^['"]|['"]$/g, '');
    if (!process.env[key]) {
      process.env[key] = value;
    }
  }
}

function normalizeStringArray(input: unknown) {
  if (!Array.isArray(input)) return [];
  return input.map((item) => (typeof item === 'string' ? item.trim() : '')).filter(Boolean);
}

function mergeTags(existing: unknown, next: string[]) {
  return Array.from(new Set([...normalizeStringArray(existing), ...next]));
}

function escapeXml(input: string) {
  return input
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;');
}

function createLogoSvg(seed: ToolSeed) {
  const { accent, accentSoft, accentStrong, logoText } = seed.media;
  return `<?xml version="1.0" encoding="UTF-8"?>
<svg width="256" height="256" viewBox="0 0 256 256" fill="none" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <linearGradient id="bg-${seed.name}" x1="24" y1="24" x2="224" y2="228" gradientUnits="userSpaceOnUse">
      <stop stop-color="${accentSoft}"/>
      <stop offset="1" stop-color="${accent}"/>
    </linearGradient>
  </defs>
  <rect width="256" height="256" rx="56" fill="url(#bg-${seed.name})"/>
  <rect x="24" y="24" width="208" height="208" rx="42" fill="rgba(255,255,255,0.84)"/>
  <rect x="46" y="46" width="164" height="164" rx="38" fill="${accentStrong}"/>
  <circle cx="78" cy="78" r="10" fill="rgba(255,255,255,0.24)"/>
  <circle cx="180" cy="182" r="12" fill="rgba(255,255,255,0.18)"/>
  <text x="128" y="146" text-anchor="middle" font-family="Inter, Arial, sans-serif" font-size="66" font-weight="800" fill="white">${escapeXml(logoText)}</text>
</svg>
`;
}

function createCoverSvg(seed: ToolSeed) {
  const { category, accent, accentSoft, accentStrong, surface, badge, summary, logoText } = seed.media;
  const title = escapeXml(seed.title);

  return `<?xml version="1.0" encoding="UTF-8"?>
<svg width="1400" height="800" viewBox="0 0 1400 800" fill="none" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <linearGradient id="canvas-${seed.name}" x1="80" y1="56" x2="1286" y2="748" gradientUnits="userSpaceOnUse">
      <stop stop-color="${surface}"/>
      <stop offset="1" stop-color="#ffffff"/>
    </linearGradient>
    <linearGradient id="panel-${seed.name}" x1="886" y1="148" x2="1238" y2="512" gradientUnits="userSpaceOnUse">
      <stop stop-color="${accentSoft}"/>
      <stop offset="1" stop-color="${accent}"/>
    </linearGradient>
  </defs>
  <rect width="1400" height="800" rx="44" fill="url(#canvas-${seed.name})"/>
  <circle cx="1246" cy="122" r="132" fill="${accentSoft}" fill-opacity="0.78"/>
  <circle cx="1134" cy="640" r="176" fill="${accentSoft}" fill-opacity="0.52"/>
  <rect x="64" y="64" width="1272" height="672" rx="34" fill="white" stroke="#e2e8f0" stroke-width="2"/>

  <rect x="118" y="126" width="236" height="46" rx="23" fill="${accentSoft}"/>
  <text x="236" y="155" text-anchor="middle" font-family="Inter, Arial, sans-serif" font-size="22" font-weight="700" fill="${accentStrong}">${escapeXml(category)}</text>

  <text x="118" y="252" font-family="Inter, Arial, sans-serif" font-size="82" font-weight="800" fill="#0f172a">${title}</text>
  <text x="118" y="320" font-family="Inter, Arial, sans-serif" font-size="28" font-weight="600" fill="${accentStrong}">${escapeXml(badge)}</text>
  <text x="118" y="394" font-family="Inter, Arial, sans-serif" font-size="34" font-weight="500" fill="#475569">${escapeXml(summary)}</text>

  <rect x="118" y="470" width="548" height="176" rx="30" fill="${surface}" stroke="${accentSoft}" stroke-width="2"/>
  <text x="160" y="532" font-family="Inter, Arial, sans-serif" font-size="24" font-weight="700" fill="#0f172a">Stable editorial preview</text>
  <text x="160" y="580" font-family="Inter, Arial, sans-serif" font-size="22" font-weight="500" fill="#475569">Local media keeps this page stable across deploys</text>
  <text x="160" y="614" font-family="Inter, Arial, sans-serif" font-size="22" font-weight="500" fill="#475569">and removes reliance on flaky external preview sources.</text>

  <rect x="874" y="142" width="360" height="360" rx="42" fill="url(#panel-${seed.name})"/>
  <rect x="914" y="182" width="280" height="280" rx="34" fill="rgba(255,255,255,0.9)"/>
  <text x="1054" y="344" text-anchor="middle" font-family="Inter, Arial, sans-serif" font-size="108" font-weight="800" fill="${accentStrong}">${escapeXml(logoText)}</text>

  <rect x="874" y="548" width="360" height="86" rx="28" fill="${accentSoft}"/>
  <text x="1054" y="602" text-anchor="middle" font-family="Inter, Arial, sans-serif" font-size="28" font-weight="700" fill="${accentStrong}">Editorial media ready</text>
</svg>
`;
}

async function upsertTags() {
  await Promise.all(
    TAGS.map((tag) =>
      query(
        `
          INSERT INTO tags (name, slug)
          VALUES ($1::jsonb, $2)
          ON CONFLICT (slug)
          DO UPDATE SET name = EXCLUDED.name
        `,
        [JSON.stringify({ en: tag.en, zh: tag.zh }), tag.slug],
      ),
    ),
  );
}

async function getCategoryIdMap() {
  const result = await query('SELECT id, slug FROM categories');
  return new Map<string, string>(result.rows.map((row) => [String(row.slug), String(row.id)]));
}

async function applySeed(seed: ToolSeed, categoryIdMap: Map<string, string>, reviewedAt: string) {
  const categoryId = categoryIdMap.get(seed.categorySlug);
  if (!categoryId) {
    throw new Error(`Missing category: ${seed.categorySlug}`);
  }

  const result = await query('SELECT id, tags, features FROM tools WHERE name = $1 LIMIT 1', [seed.name]);
  if (result.rowCount === 0) {
    console.log(`- skipped ${seed.name}: not found`);
    return false;
  }

  const row = result.rows[0];
  const features = row.features && typeof row.features === 'object' ? (row.features as Record<string, unknown>) : {};
  const existingDecision =
    features.decision && typeof features.decision === 'object'
      ? (features.decision as Record<string, unknown>)
      : {};
  const mediaReview =
    features.mediaReview && typeof features.mediaReview === 'object'
      ? (features.mediaReview as Record<string, unknown>)
      : {};

  const nextFeatures = {
    ...features,
    localized: {
      en: seed.features.en,
      zh: seed.features.zh,
    },
    audience: {
      bestFit: seed.audience.bestFit,
      notIdealFor: seed.audience.notIdealFor,
    },
    editorial: {
      reviewedAt,
      reviewedBy: 'AI Best Tool Editorial',
      summary: seed.editorialSummary,
      trustNote: seed.trustNote,
    },
    decision: {
      ...existingDecision,
      compareAxes: {
        en: seed.decision.compareAxes.en,
        zh: seed.decision.compareAxes.zh,
      },
      officialSummary: seed.decision.officialSummary,
      freshnessSummary: seed.decision.freshnessSummary,
      pricingSummary: seed.decision.pricingSummary,
      mediaSummary: seed.decision.mediaSummary,
      communitySummary: seed.decision.communitySummary,
    },
    mediaReview: {
      ...mediaReview,
      needed: false,
      reason: 'Locally hosted editorial media kit added for stable logo and preview coverage.',
      resolvedAt: reviewedAt,
      source: 'local-editorial-media',
    },
  };

  await query(
    `
      UPDATE tools
      SET
        title = $2::jsonb,
        content = $3::jsonb,
        detail = $4::jsonb,
        url = $5,
        image_url = $6,
        thumbnail_url = $7,
        category_id = $8,
        tags = $9::text[],
        pricing = $10,
        features = $11::jsonb,
        use_cases = $12::jsonb,
        updated_at = NOW()
      WHERE id = $1
    `,
    [
      row.id,
      JSON.stringify({ en: seed.title, zh: seed.title }),
      JSON.stringify(seed.content),
      JSON.stringify(seed.detail),
      new URL(seed.url).toString(),
      `/icons/tool-logos/${seed.name}.svg`,
      `/images/tool-media/${seed.name}-cover.svg`,
      categoryId,
      mergeTags(row.tags, seed.tags),
      seed.pricing,
      JSON.stringify(nextFeatures),
      JSON.stringify(seed.useCases),
    ],
  );

  console.log(`- updated ${seed.name}`);
  return true;
}

async function main() {
  loadLocalEnv();
  fs.mkdirSync(COVER_DIR, { recursive: true });
  fs.mkdirSync(LOGO_DIR, { recursive: true });

  for (const seed of TOOLS) {
    fs.writeFileSync(path.join(LOGO_DIR, `${seed.name}.svg`), createLogoSvg(seed), 'utf8');
    fs.writeFileSync(path.join(COVER_DIR, `${seed.name}-cover.svg`), createCoverSvg(seed), 'utf8');
  }

  await upsertTags();
  const categoryIdMap = await getCategoryIdMap();
  const reviewedAt = new Date().toISOString();

  let updatedCount = 0;
  for (const seed of TOOLS) {
    const updated = await applySeed(seed, categoryIdMap, reviewedAt);
    if (updated) updatedCount += 1;
  }

  console.log(`\nDone. Updated ${updatedCount} creative/video entries.`);
  await closePool();
}

main().catch(async (error) => {
  console.error('\nFailed to enrich creative/video wave 10:', error);
  await closePool();
  process.exit(1);
});
