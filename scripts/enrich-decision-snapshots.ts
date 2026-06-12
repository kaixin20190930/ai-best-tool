/* eslint-disable no-console */
import fs from 'node:fs';
import path from 'node:path';

import { closePool, query } from '@/db/neon/client';

type LocalizedText = {
  en: string;
  zh: string;
};

type DecisionSeed = {
  name: string;
  compareAxes: LocalizedText & { enList: string[]; zhList: string[] };
  officialSummary: LocalizedText;
  freshnessSummary: LocalizedText;
  pricingSummary: LocalizedText;
  mediaSummary: LocalizedText;
  communitySummary: LocalizedText;
};

const ROOT = '/Users/liukai/web/ai-best-tool';

const SEEDS: DecisionSeed[] = [
  {
    name: 'chatgpt',
    compareAxes: {
      en: 'Model quality, ecosystem breadth, and everyday workflow speed matter most.',
      zh: '重点比较模型质量、生态广度和日常工作流速度。',
      enList: ['Model quality and speed', 'Memory and workspace fit', 'Ecosystem breadth'],
      zhList: ['模型质量与速度', '记忆与工作区适配', '生态广度'],
    },
    officialSummary: {
      en: 'The official destination is stable and widely recognized, so this page is best used for fit judgment rather than basic trust validation.',
      zh: '官方入口稳定且辨识度很高，所以这页更适合帮助你判断“是否适合”，而不是只做基础可信度确认。',
    },
    freshnessSummary: {
      en: 'For ChatGPT, small product changes happen often, so treat this listing as a decision aid and confirm the latest plan differences on the official site.',
      zh: 'ChatGPT 的产品细节变化会比较频繁，所以这页更适合做选型辅助，最终套餐差异仍建议回官网确认。',
    },
    pricingSummary: {
      en: 'The practical pricing question is less about “is there a free tier?” and more about when heavier usage or team workflows push you past the free path.',
      zh: '实际的定价判断重点，不只是“有没有免费版”，而是当使用频率和团队协作上来之后，什么时候会被推到付费路径。',
    },
    mediaSummary: {
      en: 'Because the product surface evolves often, screenshots help with interface expectations but should not be treated as a permanent product spec.',
      zh: '由于产品界面会持续演进，截图更适合帮助你建立界面预期，而不应被当成永久不变的产品说明。',
    },
    communitySummary: {
      en: 'User feedback tends to be broad and mixed, so the strongest signal comes from matching comments to your actual workflow rather than treating popularity as a verdict.',
      zh: '这类工具的反馈通常很多也很杂，真正有价值的是把评论映射到你的具体工作流，而不是把热度本身当结论。',
    },
  },
  {
    name: 'perplexity',
    compareAxes: {
      en: 'Research speed, answer transparency, and how quickly you can move from question to source are the main things to compare.',
      zh: '重点比较研究速度、答案透明度，以及从问题走到来源的效率。',
      enList: ['Research speed', 'Source transparency', 'Question-to-source workflow'],
      zhList: ['研究速度', '来源透明度', '问题到来源的工作流'],
    },
    officialSummary: {
      en: 'The official site is easy to verify, but this page matters most when you are deciding whether you need a research assistant rather than a general chat companion.',
      zh: '官网本身很好验证，但这页真正的价值，是帮你判断你需要的是研究型助手，而不是泛聊天助手。',
    },
    freshnessSummary: {
      en: 'Research products keep evolving, so plan and feature details should still be verified on the official site, while the core decision logic here remains stable.',
      zh: '研究类产品会持续迭代，所以套餐和功能细节仍建议回官网复核，但这页的核心选型逻辑相对稳定。',
    },
    pricingSummary: {
      en: 'The practical pricing question is whether faster research and clearer source trails save enough time to justify using a dedicated tool repeatedly.',
      zh: '实际的价格判断在于：更快的研究速度和更清晰的来源链路，能不能持续帮你节省足够多的时间。',
    },
    mediaSummary: {
      en: 'Screenshots matter here because users often need to judge whether the answer-and-source layout feels trustworthy and efficient enough for real research.',
      zh: '这里的截图很重要，因为用户往往要通过界面判断“答案加来源”的布局是否足够可信、足够高效。',
    },
    communitySummary: {
      en: 'The most useful community feedback is about whether users actually rely on it for research, citation checks, and daily discovery instead of occasional curiosity.',
      zh: '最有价值的社区反馈，是看用户是否真的把它用于研究、引用核对和日常发现，而不只是偶尔尝鲜。',
    },
  },
  {
    name: 'claude',
    compareAxes: {
      en: 'Long-form quality, document handling, and calmer writing support are the main decision axes.',
      zh: '重点比较长文质量、文档处理和更稳定的写作支持。',
      enList: ['Long-form writing quality', 'Document reasoning', 'Tone stability'],
      zhList: ['长文写作质量', '文档推理', '语气稳定性'],
    },
    officialSummary: {
      en: 'The official site is a trustworthy checkpoint, but the real choice here is workflow fit: reading-heavy work versus broader all-purpose assistant use.',
      zh: '官网本身是可靠检查点，但这里真正要判断的是工作流适配度：你是偏阅读型工作，还是更需要广义通用助手。',
    },
    freshnessSummary: {
      en: 'Claude evolves steadily, so confirm current limits and plan details on the official site, but the core buying logic on this page stays relatively stable.',
      zh: 'Claude 会持续迭代，所以当前限制和套餐仍建议看官网，但这页的核心选型逻辑相对稳定。',
    },
    pricingSummary: {
      en: 'The pricing question is usually about whether writing and document workflows are valuable enough to justify stepping up from a general free assistant.',
      zh: '它的定价判断通常在于：写作和文档工作流的价值，是否足以让你从一般的免费助手升级过去。',
    },
    mediaSummary: {
      en: 'Interface previews are useful here mainly to gauge the reading and drafting experience, not because the product depends on heavy visual complexity.',
      zh: '这里的界面预览主要是帮助你感受阅读和起草体验，而不是因为产品本身依赖复杂视觉界面。',
    },
    communitySummary: {
      en: 'Comments and ratings matter most when they describe real document or writing workflows, not just generic “better or worse” opinions.',
      zh: '当评论是在讲真实文档或写作流程时，它们最有价值，而不是停留在泛泛的“好不好用”。',
    },
  },
  {
    name: 'notion-ai',
    compareAxes: {
      en: 'Workspace fit, note-to-draft speed, and whether AI feels native inside existing docs are the decision points that matter.',
      zh: '重点比较工作区适配、笔记到草稿的效率，以及 AI 是否真正融入已有文档流程。',
      enList: ['Workspace fit', 'Note-to-draft speed', 'Native document workflow'],
      zhList: ['工作区适配', '笔记到草稿效率', '原生文档工作流'],
    },
    officialSummary: {
      en: 'The official site is reliable, but the real evaluation happens when you test whether AI improves your existing workspace rather than adding another writing tab.',
      zh: '官网本身可靠，但真正的评估点在于：它是不是在增强你现有工作区，而不是再额外增加一个写作标签页。',
    },
    freshnessSummary: {
      en: 'Workspace products evolve through packaging and integrations, so confirm current plan details on the official site while treating this page as workflow guidance.',
      zh: '工作区产品常通过套餐和集成持续变化，所以当前版本细节建议看官网，而这页更适合做工作流判断。',
    },
    pricingSummary: {
      en: 'The upgrade question usually appears only when AI becomes part of repeatable team documentation and planning, not occasional personal drafting.',
      zh: '它的升级价值通常只有在 AI 已经进入团队文档和规划的日常流程时才会明显，而不是偶尔个人起草。',
    },
    mediaSummary: {
      en: 'Previews matter because users need to see whether AI is embedded naturally in pages, databases, and writing surfaces instead of feeling bolted on.',
      zh: '这里的预览很有价值，因为用户需要判断 AI 是不是自然嵌在页面、数据库和写作界面里，而不是硬加上去。',
    },
    communitySummary: {
      en: 'The strongest signal comes from people describing how it changed meeting notes, documentation, and collaboration habits, not just raw text quality.',
      zh: '最强的参考信号，是用户如何描述它改变了会议记录、文档协作和团队习惯，而不只是文本质量本身。',
    },
  },
  {
    name: 'cursor',
    compareAxes: {
      en: 'Editor fit, multi-file reliability, and implementation speed are the decision points that matter.',
      zh: '重点比较编辑器贴合度、多文件可靠性和真实实现速度。',
      enList: ['Editor-native flow', 'Multi-file reliability', 'Context and implementation speed'],
      zhList: ['编辑器内工作流', '多文件可靠性', '上下文与实现速度'],
    },
    officialSummary: {
      en: 'The official site is reliable, but the deeper evaluation happens inside your real coding loop rather than on a marketing page.',
      zh: '官网本身是可靠入口，但真正的评估要发生在你的真实编码循环里，而不是停留在介绍页上。',
    },
    freshnessSummary: {
      en: 'Coding tools shift quickly, so feature details should be rechecked on the official site, while this page should guide your evaluation criteria.',
      zh: '编程工具变化会比较快，所以功能细节要回官网确认，而这页更适合帮你确定评估标准。',
    },
    pricingSummary: {
      en: 'The main pricing decision is whether productivity gains inside the editor are large enough to replace some of the cost you currently pay in context switching.',
      zh: '核心定价判断是：编辑器里的效率提升，能不能抵消你现在付出的上下文切换成本。',
    },
    mediaSummary: {
      en: 'Visual previews help set expectations for the editor experience, but the decisive signal will still come from real implementation sessions.',
      zh: '界面预览能帮助建立编辑器体验预期，但决定性的信号还是来自真实实现过程。',
    },
    communitySummary: {
      en: 'Community signal is strongest when it talks about refactors, bug fixing, and multi-file work rather than one-shot code generation demos.',
      zh: '当社区反馈谈的是重构、修 bug 和多文件协作时，信号最强；一次性生成代码的演示意义反而有限。',
    },
  },
  {
    name: 'midjourney',
    compareAxes: {
      en: 'Image quality, style control, and how well the workflow fits iterative creative exploration are the main comparison axes.',
      zh: '重点比较画面质量、风格控制，以及工作流是否适合反复探索式创作。',
      enList: ['Image quality', 'Style control', 'Iterative creative workflow'],
      zhList: ['画面质量', '风格控制', '迭代式创作工作流'],
    },
    officialSummary: {
      en: 'The official destination is recognizable, but the deeper decision is whether its creation workflow matches your way of exploring and refining visual ideas.',
      zh: '官方入口辨识度很高，但更深层的判断是：它的创作工作流是否符合你探索和细化视觉想法的方式。',
    },
    freshnessSummary: {
      en: 'Visual generation tools change quickly, so model details and plan boundaries should be rechecked on the official site even when the broader decision logic still holds.',
      zh: '图像生成工具变化很快，所以模型和套餐边界最好回官网复核，即使整体选型逻辑本身没有太大变化。',
    },
    pricingSummary: {
      en: 'The real pricing question is whether your creative output and iteration frequency are high enough to justify paying for a specialized image workflow.',
      zh: '真正的价格判断在于：你的创作产出频率和迭代需求，是否已经高到值得为专门的图像工作流付费。',
    },
    mediaSummary: {
      en: 'Media matters a lot here because users judge these products heavily on output feel, visual consistency, and how polished example results appear.',
      zh: '这里的媒体预览非常关键，因为用户会强烈依赖生成结果的观感、一致性和案例完成度来做判断。',
    },
    communitySummary: {
      en: 'Community feedback is most useful when it talks about repeatable quality, prompt control, and workflow trade-offs rather than viral one-off samples.',
      zh: '最有价值的社区反馈，是在谈可重复的画质、提示词控制和工作流取舍，而不是单次爆款案例。',
    },
  },
  {
    name: 'grammarly',
    compareAxes: {
      en: 'Editing quality, tone control, and everyday surface coverage are the key trade-offs.',
      zh: '重点比较编辑质量、语气控制和日常写作界面的覆盖度。',
      enList: ['Editing quality', 'Tone control', 'Everyday writing surface coverage'],
      zhList: ['编辑质量', '语气控制', '日常写作界面覆盖'],
    },
    officialSummary: {
      en: 'The official site is mainly useful here for checking current plan boundaries, while the stronger decision question is whether you need editing or drafting.',
      zh: '官网最适合用来确认当前套餐边界，而更重要的判断是：你要的是编辑层，还是起草引擎。',
    },
    freshnessSummary: {
      en: 'Product packaging changes more often than the core use case, so the listing stays useful as long as you treat pricing details as the part to re-check.',
      zh: '产品包装会比核心用途变化得更快，所以只要把价格和套餐当作需要复核的部分，这个条目就仍然有判断价值。',
    },
    pricingSummary: {
      en: 'The pricing threshold usually matters only after editing becomes a repeated team habit rather than an occasional personal check.',
      zh: '它的付费门槛通常只有在“编辑已经成为重复性团队习惯”时才真正重要，而不是偶尔个人使用。',
    },
    mediaSummary: {
      en: 'Screenshots are less about product complexity here and more about where the assistant shows up in normal writing surfaces.',
      zh: '这里的截图意义，不在于展示复杂功能，而在于帮助你理解它会出现在哪些日常写作界面里。',
    },
    communitySummary: {
      en: 'Feedback is most useful when it talks about communication confidence, clarity, and workflow friction instead of only grammar accuracy.',
      zh: '当反馈谈的是沟通把握、清晰度和工作流摩擦时最有价值，而不只是语法准不准。',
    },
  },
  {
    name: 'runway',
    compareAxes: {
      en: 'Video generation quality, editing flexibility, and whether the product shortens real production loops should guide the comparison.',
      zh: '重点比较视频生成质量、编辑灵活性，以及它是否真的缩短了实际制作流程。',
      enList: ['Video output quality', 'Editing flexibility', 'Production loop speed'],
      zhList: ['视频输出质量', '编辑灵活性', '制作循环速度'],
    },
    officialSummary: {
      en: 'The official site is a reliable checkpoint, but the real decision is whether the product fits your production workflow rather than just creating demos.',
      zh: '官网本身是可靠检查点，但真正的决策点在于：它是否适合你的制作流程，而不只是适合做演示。',
    },
    freshnessSummary: {
      en: 'AI video tooling is changing fast, so current model and plan details should always be confirmed on the official site before committing.',
      zh: 'AI 视频工具变化非常快，所以当前模型能力和套餐边界在投入前都应该回官网确认。',
    },
    pricingSummary: {
      en: 'The key pricing question is whether faster ideation and editing reduce enough production effort to justify a dedicated video AI budget.',
      zh: '核心的价格判断是：更快的创意验证和剪辑效率，能不能显著减少制作成本，从而值得单独投入预算。',
    },
    mediaSummary: {
      en: 'Screenshots and previews matter because users need confidence in both interface complexity and the visual credibility of generated outputs.',
      zh: '这里的截图和预览很重要，因为用户既要判断界面复杂度，也要判断输出结果是否足够有说服力。',
    },
    communitySummary: {
      en: 'The best community feedback describes real editing, storyboarding, and production use instead of only showcasing polished final clips.',
      zh: '最有价值的社区反馈，是用户如何把它用于剪辑、分镜和真实制作流程，而不只是展示成片。',
    },
  },
  {
    name: 'gamma',
    compareAxes: {
      en: 'Presentation speed, visual polish, and whether it helps turn rough ideas into shareable decks quickly are the main comparison axes.',
      zh: '重点比较出稿速度、视觉完成度，以及它是否能快速把想法变成可分享的演示内容。',
      enList: ['Presentation speed', 'Visual polish', 'Idea-to-deck workflow'],
      zhList: ['出稿速度', '视觉完成度', '想法到演示稿工作流'],
    },
    officialSummary: {
      en: 'The official site is easy to trust, but the real question is whether Gamma improves communication workflows rather than simply generating nicer slides.',
      zh: '官网本身很好建立信任，但真正的问题是：Gamma 是否在改善你的表达工作流，而不只是生成更好看的幻灯片。',
    },
    freshnessSummary: {
      en: 'Presentation products evolve through templates and AI workflows, so current feature packaging should still be checked on the official site before relying on specifics.',
      zh: '演示类产品常通过模板和 AI 工作流持续演进，所以具体能力和包装方式仍建议回官网确认。',
    },
    pricingSummary: {
      en: 'The practical pricing decision is whether faster presentation output and better visual communication save enough time to justify regular use.',
      zh: '实际的价格判断在于：更快的演示产出和更好的视觉表达，能不能持续帮你节省足够多的时间。',
    },
    mediaSummary: {
      en: 'Media matters a lot here because users naturally judge these tools on layout polish, readability, and how finished the outputs look.',
      zh: '这里的媒体预览非常重要，因为用户会天然根据版式质量、可读性和成品感来判断这类工具。',
    },
    communitySummary: {
      en: 'The strongest feedback usually comes from people describing whether Gamma actually helped them ship decks, proposals, and polished documents faster.',
      zh: '最强的反馈通常来自用户是否真的用它更快做出了演示稿、提案和更完整的文档，而不只是觉得它“看起来不错”。',
    },
  },
  {
    name: 'fathom',
    compareAxes: {
      en: 'Meeting-summary quality, post-call follow-through, and whether it reduces recurring admin work are the main comparison axes.',
      zh: '重点比较会议总结质量、会后跟进能力，以及它是否真的减少了重复行政负担。',
      enList: ['Summary quality', 'Post-call follow-through', 'Meeting admin reduction'],
      zhList: ['总结质量', '会后跟进', '会议行政负担降低'],
    },
    officialSummary: {
      en: 'The official site is trustworthy, but the deeper question is whether the tool changes what happens after meetings, not just what gets transcribed during them.',
      zh: '官网本身值得信任，但更深层的问题是：它有没有改变会议之后发生的事情，而不只是记录了会议当下的内容。',
    },
    freshnessSummary: {
      en: 'Meeting assistants evolve through integrations and workflow packaging, so current feature edges should still be checked on the official site before adoption.',
      zh: '会议助手会随着集成和工作流包装持续变化，所以在真正采用前，当前能力边界仍建议回官网确认。',
    },
    pricingSummary: {
      en: 'The pricing threshold matters when meetings happen often enough that note-taking and follow-up are a repeated operational cost.',
      zh: '它的价格门槛只有在会议频率高到“记录和跟进本身已经成为重复运营成本”时才真正值得看重。',
    },
    mediaSummary: {
      en: 'Screenshots help because users want to judge whether the interface supports recap, sharing, and follow-through rather than just raw transcripts.',
      zh: '这里的截图很有帮助，因为用户会判断界面是不是在支持总结、分享和跟进，而不只是给一份原始转录。',
    },
    communitySummary: {
      en: 'The best community signal comes from users explaining whether Fathom actually changed team meeting habits and saved post-call time.',
      zh: '最有价值的社区信号，来自用户是否说明 Fathom 真的改变了团队开会习惯，并节省了会后时间。',
    },
  },
  {
    name: 'quillbot',
    compareAxes: {
      en: 'Rewrite quality, clarity improvement, and repeat-use usefulness are the main things to compare.',
      zh: '重点比较改写质量、清晰度提升，以及重复使用时是否足够有用。',
      enList: ['Rewrite quality', 'Clarity improvement', 'Repeat-use usefulness'],
      zhList: ['改写质量', '清晰度提升', '重复使用价值'],
    },
    officialSummary: {
      en: 'The official site is a reliable checkpoint, but the real decision is whether you need a rewriting layer rather than a broad drafting assistant.',
      zh: '官网本身是可靠检查点，但真正的判断在于：你需要的是一个改写层，而不是泛化的起草助手。',
    },
    freshnessSummary: {
      en: 'Writing-helper products evolve through packaging and workflow additions, so exact product boundaries should still be verified on the official site.',
      zh: '写作辅助产品会通过套餐和工作流扩展持续变化，所以具体产品边界仍建议回官网复核。',
    },
    pricingSummary: {
      en: 'The practical pricing question is whether repeated paraphrasing, rewriting, and cleanup save enough time to justify regular use.',
      zh: '实际的价格判断在于：重复性的释义、改写和清理工作，能不能持续省下足够多的时间。',
    },
    mediaSummary: {
      en: 'Screenshots matter mostly to show where the assistant appears in normal writing surfaces, not because the product depends on a complex visual interface.',
      zh: '这里的截图主要是帮助理解它会出现在哪些正常写作界面里，而不是因为产品依赖复杂视觉界面。',
    },
    communitySummary: {
      en: 'The strongest feedback comes from people describing whether QuillBot became part of their everyday revision habit rather than a one-off shortcut.',
      zh: '最强的反馈，来自用户是否说明 QuillBot 进入了他们日常修改习惯，而不是偶尔的一次性捷径。',
    },
  },
  {
    name: 'elevenlabs',
    compareAxes: {
      en: 'Voice naturalness, controllability, and whether the product fits repeated audio production rather than novelty generation are the key axes to compare.',
      zh: '重点比较语音自然度、可控性，以及它是否适合重复性的音频生产，而不只是新鲜感生成。',
      enList: ['Voice naturalness', 'Controllability', 'Repeatable audio production'],
      zhList: ['语音自然度', '可控性', '重复性音频生产'],
    },
    officialSummary: {
      en: 'The official site is easy to validate, but the real decision is whether voice quality and production usefulness are important enough to justify a dedicated tool.',
      zh: '官网本身很好验证，但真正的决策点是：语音质量和生产价值，是否已经重要到值得单独使用一款工具。',
    },
    freshnessSummary: {
      en: 'Voice products evolve through model quality and workflow packaging, so exact capabilities should still be checked on the official site when audio quality matters a lot.',
      zh: '语音产品会随着模型质量和工作流包装持续变化，所以当音频质量要求很高时，具体能力仍建议回官网确认。',
    },
    pricingSummary: {
      en: 'The pricing question usually becomes real only when voice output is part of repeatable content, product, or narration workflows rather than occasional experiments.',
      zh: '它的价格判断通常只有在语音输出已经进入重复性的内容、产品或旁白工作流时才真正成立，而不是偶尔试玩。',
    },
    mediaSummary: {
      en: 'Visual previews help less than examples and workflow cues here, so screenshots mainly need to set expectations around production surfaces and controls.',
      zh: '这里相比截图，示例音频和工作流线索更重要，所以界面预览的作用主要是帮助理解生产界面和控制方式。',
    },
    communitySummary: {
      en: 'The strongest feedback comes from users describing whether the product actually held up across narration, voice cloning, and repeated production tasks.',
      zh: '最有价值的反馈，来自用户是否描述它在旁白、声音克隆和重复性生产任务里真的稳定可用。',
    },
  },
  {
    name: 'phind',
    compareAxes: {
      en: 'Developer answer usefulness, search-backed reliability, and how quickly it moves from question to implementation are the core things to compare.',
      zh: '重点比较开发者答案的实用性、搜索支撑的可靠性，以及从问题走到实现的速度。',
      enList: ['Developer answer usefulness', 'Search-backed reliability', 'Question-to-implementation speed'],
      zhList: ['开发者答案实用性', '搜索支撑可靠性', '问题到实现速度'],
    },
    officialSummary: {
      en: 'The official site is trustworthy, but the more important question is whether you need a search-driven technical assistant rather than a broad general chatbot.',
      zh: '官网本身值得信任，但更重要的问题是：你需要的是一个搜索驱动的技术助手，还是一个泛化的通用聊天助手。',
    },
    freshnessSummary: {
      en: 'Developer assistants evolve quickly, so model and product details should be verified on the official site, while this page should guide the workflow judgment.',
      zh: '开发者助手变化很快，所以模型和产品细节最好回官网确认，而这页更适合帮助你判断工作流是否匹配。',
    },
    pricingSummary: {
      en: 'The practical value threshold is whether faster technical lookup and implementation support save enough time to earn a place in daily development work.',
      zh: '实际的价值门槛在于：更快的技术查找和实现支持，能不能节省足够多的开发时间，从而进入日常工作流。',
    },
    mediaSummary: {
      en: 'Screenshots matter here because developers want to judge whether the search and answer layout feels grounded enough for real debugging and implementation.',
      zh: '这里的截图有意义，因为开发者会想判断搜索和回答布局是否足够扎实，适合真实调试和实现任务。',
    },
    communitySummary: {
      en: 'The strongest signal comes from developers describing whether it improved debugging, code lookup, and technical question handling in real work.',
      zh: '最强的信号，来自开发者是否描述它真的提升了调试、代码查找和技术问题处理效率。',
    },
  },
  {
    name: 'lovable',
    compareAxes: {
      en: 'Idea-to-product speed, builder friendliness, and whether it helps founders move from concept to usable prototype are the main comparison axes.',
      zh: '重点比较想法到产品的速度、对构建者是否友好，以及它是否能帮助创始人把概念推进到可用原型。',
      enList: ['Idea-to-product speed', 'Builder friendliness', 'Concept-to-prototype workflow'],
      zhList: ['想法到产品速度', '构建者友好度', '概念到原型工作流'],
    },
    officialSummary: {
      en: 'The official site is easy to trust, but the real evaluation is whether Lovable helps you build and iterate faster rather than just demo ideas attractively.',
      zh: '官网本身很好建立信任，但真正的评估点在于：Lovable 是否能帮助你更快构建和迭代，而不只是把想法展示得更好看。',
    },
    freshnessSummary: {
      en: 'Builder products evolve quickly as workflows and output quality improve, so current boundaries should still be checked on the official site before serious use.',
      zh: 'Builder 类产品会随着工作流和输出质量快速迭代，所以在真正投入前，当前能力边界仍建议回官网确认。',
    },
    pricingSummary: {
      en: 'The pricing decision is usually about whether faster prototyping and validation save enough founder or product time to justify regular use.',
      zh: '它的价格判断通常在于：更快的原型验证和产品试错，能不能帮创始人或产品团队持续节省足够多的时间。',
    },
    mediaSummary: {
      en: 'Previews matter because users want to see whether the product feels like a real builder workflow instead of a thin concept generator.',
      zh: '这里的预览很重要，因为用户会想判断它更像一个真实的构建工作流，还是只是一层概念生成器。',
    },
    communitySummary: {
      en: 'The strongest feedback comes from builders describing whether Lovable actually helped them ship prototypes, experiments, and usable product loops faster.',
      zh: '最有价值的反馈，来自构建者是否描述它真的帮助他们更快做出了原型、实验和可用的产品闭环。',
    },
  },
  {
    name: 'bolt-new',
    compareAxes: {
      en: 'Prototype speed, browser-native building flow, and how quickly it turns prompts into usable app structure are the key axes to compare.',
      zh: '重点比较原型速度、浏览器内构建流程，以及它把提示词变成可用应用结构的效率。',
      enList: ['Prototype speed', 'Browser-native builder flow', 'Prompt-to-app structure'],
      zhList: ['原型速度', '浏览器内构建流程', '提示词到应用结构'],
    },
    officialSummary: {
      en: 'The official site is easy to trust, but the real question is whether Bolt fits your hands-on prototyping style better than other AI builders.',
      zh: '官网本身很好建立信任，但真正的问题是：Bolt 是否比其他 AI builder 更适合你这种偏动手的原型方式。',
    },
    freshnessSummary: {
      en: 'Builder tools change quickly as output quality and workflow depth improve, so exact product boundaries should still be checked on the official site.',
      zh: 'Builder 工具会随着输出质量和工作流深度快速变化，所以具体能力边界仍建议回官网确认。',
    },
    pricingSummary: {
      en: 'The practical pricing question is whether it saves enough prototype and validation time to justify becoming part of your regular build loop.',
      zh: '实际的价格判断在于：它能不能在原型和验证阶段稳定省下足够多的时间，从而进入你的固定构建流程。',
    },
    mediaSummary: {
      en: 'Screenshots matter here because users want to judge whether the builder surface feels capable enough for real iteration, not just flashy generation.',
      zh: '这里的截图很重要，因为用户会判断这个构建界面是否足够支撑真实迭代，而不只是“生成得很炫”。',
    },
    communitySummary: {
      en: 'The strongest feedback comes from builders describing whether Bolt actually helped them move from idea to prototype faster in repeatable product work.',
      zh: '最有价值的反馈，来自构建者是否描述 Bolt 真的帮助他们在重复性的产品工作里更快从想法走到原型。',
    },
  },
  {
    name: 'v0',
    compareAxes: {
      en: 'UI generation quality, frontend iteration speed, and how useful the outputs are for real product design or implementation are the main comparison axes.',
      zh: '重点比较 UI 生成质量、前端迭代速度，以及输出对真实产品设计和实现是否足够有用。',
      enList: ['UI generation quality', 'Frontend iteration speed', 'Design-to-implementation usefulness'],
      zhList: ['UI 生成质量', '前端迭代速度', '设计到实现的实用性'],
    },
    officialSummary: {
      en: 'The official site is a reliable checkpoint, but this page is more useful for deciding whether v0 belongs in your real UI workflow instead of staying a demo tool.',
      zh: '官网本身是可靠检查点，但这页更适合帮助判断：v0 是不是能真正进入你的 UI 工作流，而不只是一个演示工具。',
    },
    freshnessSummary: {
      en: 'Frontend generation tools evolve quickly, so exact output quality and capability boundaries should still be checked on the official site when they matter.',
      zh: '前端生成工具变化很快，所以当输出质量和能力边界对你很关键时，仍建议回官网确认。',
    },
    pricingSummary: {
      en: 'The value question is whether faster UI exploration and implementation handoff save enough design and frontend time to justify regular use.',
      zh: '真正的价值判断在于：更快的 UI 探索和实现衔接，能不能帮你节省足够多的设计和前端时间。',
    },
    mediaSummary: {
      en: 'Media matters a lot here because users judge these tools heavily on the polish, clarity, and realism of the generated interface output.',
      zh: '这里的媒体预览非常关键，因为用户会很强地根据生成界面的完成度、清晰度和真实感来做判断。',
    },
    communitySummary: {
      en: 'The strongest community signal comes from teams explaining whether v0 actually improved UI iteration and frontend collaboration rather than just making mockups faster.',
      zh: '最强的社区信号，来自团队是否说明 v0 真正改善了 UI 迭代和前端协作，而不只是更快做出 mockup。',
    },
  },
  {
    name: 'gemini',
    compareAxes: {
      en: 'Ecosystem fit, multimodal usefulness, and whether it works better as a Google-adjacent workflow assistant than a standalone chat destination are the key axes to compare.',
      zh: '重点比较生态适配、多模态实用性，以及它是否更适合作为 Google 工作流里的助手，而不是单独的聊天目的地。',
      enList: ['Ecosystem fit', 'Multimodal usefulness', 'Google-adjacent workflow fit'],
      zhList: ['生态适配', '多模态实用性', 'Google 工作流适配'],
    },
    officialSummary: {
      en: 'The official site is highly recognizable, but this page matters most when deciding whether Gemini fits your surrounding workflow better than other general assistants.',
      zh: '官网本身辨识度很高，但这页真正有用的地方，是帮助判断 Gemini 是否比其他通用助手更适合你周边的工作流。',
    },
    freshnessSummary: {
      en: 'Gemini changes frequently through model, package, and ecosystem updates, so current product details should always be rechecked on the official site.',
      zh: 'Gemini 会随着模型、套餐和生态更新频繁变化，所以当前产品细节最好始终回官网复核。',
    },
    pricingSummary: {
      en: 'The practical pricing question is whether ecosystem convenience and multimodal support are valuable enough to justify choosing Gemini over a more general free path.',
      zh: '实际的价格判断在于：生态便利性和多模态支持，是否已经有价值到足以让你优先选择 Gemini，而不是走更泛化的免费路径。',
    },
    mediaSummary: {
      en: 'Screenshots matter because users often judge whether the assistant feels like part of a broader workflow or just another chat interface.',
      zh: '这里的截图有意义，因为用户常会通过界面判断它更像是一个更大工作流的一部分，还是又一个单独的聊天框。',
    },
    communitySummary: {
      en: 'The strongest community signal comes from people describing how Gemini fits daily workflows, not just whether it performs well on isolated prompts.',
      zh: '最强的社区信号，来自用户如何描述 Gemini 融入日常工作流，而不只是单次 prompt 表现如何。',
    },
  },
  {
    name: 'grok',
    compareAxes: {
      en: 'Real-time context, answer style, and whether the product offers a meaningfully different general-assistant experience are the main comparison axes.',
      zh: '重点比较实时语境、回答风格，以及它是否提供了一个真正差异化的通用助手体验。',
      enList: ['Real-time context', 'Answer style', 'Differentiated assistant experience'],
      zhList: ['实时语境', '回答风格', '差异化助手体验'],
    },
    officialSummary: {
      en: 'The official destination is recognizable, but this page is more useful for judging whether Grok offers enough workflow or information advantage over other broad assistants.',
      zh: '官方入口本身辨识度很高，但这页更适合帮助判断：Grok 相比其他通用助手，是否真的提供了足够的工作流或信息优势。',
    },
    freshnessSummary: {
      en: 'General assistants like Grok can shift quickly in capability and positioning, so exact product boundaries should still be confirmed on the official site.',
      zh: '像 Grok 这样的通用助手，在能力和定位上都可能变化较快，所以具体产品边界仍建议回官网确认。',
    },
    pricingSummary: {
      en: 'The real pricing question is whether its differentiated context and experience are strong enough to earn a regular place beside other mainstream assistants.',
      zh: '真正的价格判断在于：它的差异化语境和体验，是否足够强到能在其他主流助手之外占据一个固定位置。',
    },
    mediaSummary: {
      en: 'Preview coverage helps because users often judge whether the interface and surrounding context feel meaningfully different from other general chat tools.',
      zh: '这里的预览很有帮助，因为用户常会判断它的界面和周边语境是否真的和其他通用聊天工具不一样。',
    },
    communitySummary: {
      en: 'The strongest signal comes from users explaining whether Grok changed their daily assistant habits rather than simply standing out as a novelty.',
      zh: '最有价值的信号，来自用户是否说明 Grok 改变了他们的日常助手使用习惯，而不只是因为它“看起来新鲜”。',
    },
  },
  {
    name: 'copilot',
    compareAxes: {
      en: 'Ecosystem fit, everyday productivity usefulness, and whether it works naturally inside Microsoft-style workflows are the main comparison axes.',
      zh: '重点比较生态适配、日常生产力实用性，以及它是否能自然融入偏微软生态的工作流。',
      enList: ['Ecosystem fit', 'Everyday productivity usefulness', 'Microsoft workflow fit'],
      zhList: ['生态适配', '日常生产力实用性', '微软工作流适配'],
    },
    officialSummary: {
      en: 'The official site is easy to validate, but the more useful question is whether Copilot fits your surrounding work stack better than other general assistants.',
      zh: '官网本身很好验证，但更重要的问题是：Copilot 是否比其他通用助手更适合你周边的工作栈。',
    },
    freshnessSummary: {
      en: 'Copilot packaging and surrounding integrations can move quickly, so current product details should still be rechecked on the official site.',
      zh: 'Copilot 的产品包装和周边集成变化可能比较快，所以当前细节仍建议回官网复核。',
    },
    pricingSummary: {
      en: 'The practical pricing decision is whether workflow convenience inside Microsoft-adjacent work is strong enough to justify giving it a regular place in the stack.',
      zh: '实际的价格判断在于：它在微软相关工作流里的便利性，是否足够强到值得放进你的固定工具栈。',
    },
    mediaSummary: {
      en: 'Screenshots help here because users often need to judge whether the assistant feels embedded in real work surfaces rather than isolated in one chat box.',
      zh: '这里的截图很有帮助，因为用户常常要判断它是不是嵌进了真实工作界面，而不是只停留在一个聊天框里。',
    },
    communitySummary: {
      en: 'The strongest feedback comes from users describing whether Copilot actually became part of their daily work habits rather than just another optional assistant.',
      zh: '最有价值的反馈，来自用户是否描述 Copilot 真的变成了日常工作习惯的一部分，而不只是另一个可选助手。',
    },
  },
  {
    name: 'dune',
    compareAxes: {
      en: 'Data flexibility, dashboard reuse, and query-driven workflow depth should drive the comparison.',
      zh: '重点比较数据灵活性、仪表盘复用和查询驱动工作流深度。',
      enList: ['Query flexibility', 'Dashboard reuse', 'Analytical workflow depth'],
      zhList: ['查询灵活性', '仪表盘复用', '分析工作流深度'],
    },
    officialSummary: {
      en: 'The official destination is a good trust checkpoint, but the real decision is whether your team wants direct data control rather than packaged intelligence.',
      zh: '官网是可靠的信任检查点，但真正要判断的是：你的团队要不要直接掌握数据，而不是只消费打包好的情报。',
    },
    freshnessSummary: {
      en: 'For data tools, current capabilities and templates can move quickly, so verify the latest data surface on the official site before committing.',
      zh: '对于数据工具来说，能力边界和模板生态可能变化较快，所以最终投入前仍要回官网确认最新的数据面。',
    },
    pricingSummary: {
      en: 'The pricing decision tends to come down to research depth and collaboration frequency rather than casual one-off analysis.',
      zh: '定价判断通常取决于研究深度和团队协作频率，而不是偶发性的一次分析。',
    },
    mediaSummary: {
      en: 'Media matters here because the interface shape tells you a lot about whether your team is ready for a more analytical workflow.',
      zh: '这里的媒体预览很有意义，因为界面形态本身就能帮助判断你的团队是否适合更分析型的工作流。',
    },
    communitySummary: {
      en: 'User signal is most useful when it describes dashboard reuse, analyst productivity, and how much SQL comfort the workflow really needs.',
      zh: '当用户反馈谈的是仪表盘复用、分析效率，以及这个工作流到底需要多少 SQL 熟悉度时，最有参考价值。',
    },
  },
  {
    name: 'the-graph',
    compareAxes: {
      en: 'Infrastructure fit, indexing model, and whether your need is application data access rather than end-user analytics are the real comparison axes.',
      zh: '重点比较基础设施适配、索引模型，以及你的需求到底是应用数据接入还是终端分析。',
      enList: ['Infrastructure fit', 'Indexing model', 'Application data access'],
      zhList: ['基础设施适配', '索引模型', '应用数据接入'],
    },
    officialSummary: {
      en: 'The official site is a solid trust checkpoint, but this page matters most when users need help separating developer infrastructure from research-facing analytics tools.',
      zh: '官网本身是很可靠的信任检查点，但这页真正有用的地方，是帮助用户区分开发基础设施和研究分析工具。',
    },
    freshnessSummary: {
      en: 'Infra products evolve more steadily than consumer AI apps, but ecosystem details and integrations should still be rechecked on the official site when they matter.',
      zh: '基础设施产品通常比消费级 AI 应用变化更稳一些，但生态细节和集成能力在关键场景里仍建议回官网复核。',
    },
    pricingSummary: {
      en: 'The value question is usually not casual usage cost, but whether structured blockchain data access is important enough to justify choosing an infrastructure-layer product.',
      zh: '它的价值判断通常不在于偶发使用成本，而在于结构化链上数据访问，是否已经重要到值得引入基础设施层产品。',
    },
    mediaSummary: {
      en: 'Screenshots help mainly to set expectations about developer-facing complexity rather than to sell visual polish.',
      zh: '这里的截图更多是帮助建立对开发者界面复杂度的预期，而不是靠视觉精致度说服用户。',
    },
    communitySummary: {
      en: 'The strongest community signal comes from builders describing how it supports apps, dashboards, and repeated blockchain data workflows in practice.',
      zh: '最强的社区信号，来自构建者如何描述它在应用、仪表盘和重复性链上数据工作流中的真实作用。',
    },
  },
  {
    name: 'alchemy',
    compareAxes: {
      en: 'Infrastructure breadth, developer workflow support, and whether it simplifies serious blockchain app building are the real comparison axes.',
      zh: '重点比较基础设施广度、开发者工作流支持，以及它是否真正简化了严肃的链上应用构建。',
      enList: ['Infrastructure breadth', 'Developer workflow support', 'Blockchain app building fit'],
      zhList: ['基础设施广度', '开发者工作流支持', '链上应用构建适配'],
    },
    officialSummary: {
      en: 'The official site is highly trustworthy, but this page matters most when users need help comparing serious Web3 infrastructure rather than end-user crypto tools.',
      zh: '官网本身非常可靠，但这页真正有价值的地方，是帮助用户比较严肃的 Web3 基础设施，而不是终端加密工具。',
    },
    freshnessSummary: {
      en: 'Infra platforms evolve through network support, tooling, and packaging, so exact capability details should still be checked on the official site.',
      zh: '基础设施平台会随着网络支持、工具链和套餐持续演进，所以具体能力细节仍建议回官网确认。',
    },
    pricingSummary: {
      en: 'The value question is usually not casual experimentation cost, but whether the platform reduces enough engineering effort to justify deeper adoption.',
      zh: '真正的价值判断通常不在于偶发实验成本，而在于它是否能减少足够多的工程投入，从而值得更深使用。',
    },
    mediaSummary: {
      en: 'Screenshots matter less for visual polish and more for helping developers gauge the shape of the tooling, dashboards, and integration surfaces.',
      zh: '这里的截图重点不在视觉精致度，而在于帮助开发者理解工具界面、控制台和集成入口大概长什么样。',
    },
    communitySummary: {
      en: 'The strongest signal comes from builders explaining whether Alchemy improved shipping speed, infrastructure confidence, and long-term developer workflow.',
      zh: '最强的信号，来自构建者是否说明 Alchemy 提升了交付速度、基础设施信心和长期开发工作流体验。',
    },
  },
  {
    name: 'thirdweb',
    compareAxes: {
      en: 'Developer speed, smart-contract workflow fit, and how directly it helps teams move from Web3 idea to shipped product are the key things to compare.',
      zh: '重点比较开发速度、智能合约工作流适配，以及它是否能直接帮助团队从 Web3 想法走到上线产品。',
      enList: ['Developer speed', 'Smart-contract workflow fit', 'Idea-to-shipped-Web3 product'],
      zhList: ['开发速度', '智能合约工作流适配', '想法到上线 Web3 产品'],
    },
    officialSummary: {
      en: 'The official site is easy to trust, but the real evaluation is whether thirdweb helps your team ship faster rather than only lowering the learning barrier.',
      zh: '官网本身很好建立信任，但真正的评估点在于：thirdweb 是否帮助你的团队更快上线，而不只是降低学习门槛。',
    },
    freshnessSummary: {
      en: 'Web3 developer platforms can change quickly as chains, tooling, and product layers evolve, so official capability details should still be rechecked.',
      zh: 'Web3 开发平台会随着链支持、工具链和产品层变化较快，所以官方能力细节仍建议回官网复核。',
    },
    pricingSummary: {
      en: 'The practical pricing question is whether faster development loops and easier productization save enough engineering time to justify using the platform regularly.',
      zh: '实际的价格判断在于：更快的开发闭环和更容易产品化，能不能节省足够多的工程时间，从而值得持续使用。',
    },
    mediaSummary: {
      en: 'Previews matter because teams want to see whether the product feels like a real shipping workflow for Web3 apps rather than a thin toolkit layer.',
      zh: '这里的预览很重要，因为团队会想判断它更像一个真实可上线的 Web3 构建工作流，还是只是一层薄工具包。',
    },
    communitySummary: {
      en: 'The strongest feedback comes from builders describing whether thirdweb actually accelerated launching, iteration, and smart-contract product work.',
      zh: '最有价值的反馈，来自构建者是否描述 thirdweb 真的加快了上线、迭代和智能合约产品工作。',
    },
  },
  {
    name: 'sigoo',
    compareAxes: {
      en: 'Keyword discovery depth, site-planning clarity, and whether the product improves SEO judgment before execution are the key axes to compare.',
      zh: '重点比较关键词发现深度、站点规划清晰度，以及它是否能在执行前提升 SEO 判断质量。',
      enList: ['Keyword discovery depth', 'Site-planning clarity', 'Pre-execution SEO judgment'],
      zhList: ['关键词发现深度', '站点规划清晰度', '执行前 SEO 判断'],
    },
    officialSummary: {
      en: 'The official product positioning is still early, so this page should help users judge whether Sigoo fits discovery-stage SEO work rather than production execution.',
      zh: '这个产品目前还在早期定位阶段，所以这页更适合帮助用户判断：Sigoo 是否适合“发现和规划阶段”的 SEO 工作，而不是直接做执行。',
    },
    freshnessSummary: {
      en: 'Because the product is still evolving toward MVP validation, workflow boundaries and packaging may change, so major updates should be reflected here more often.',
      zh: '由于产品仍处于 MVP 验证阶段，工作流边界和包装方式都可能继续变化，所以这里需要比成熟产品更频繁地更新。',
    },
    pricingSummary: {
      en: 'The practical pricing question is whether discovery, structure planning, and competitive clarity save enough founder time to justify recurring use.',
      zh: '实际的价格判断在于：关键词发现、结构规划和竞争格局判断，能不能持续帮独立开发者和 SaaS 创始人节省足够多的时间。',
    },
    mediaSummary: {
      en: 'Previews matter because users need to see whether the product feels like an intelligence workspace rather than another generic SEO dashboard.',
      zh: '这里的预览很重要，因为用户需要判断它更像“SEO intelligence workspace”，还是又一个泛化的 SEO 面板。',
    },
    communitySummary: {
      en: 'The strongest future signal will come from whether users return for repeated planning and research loops, not just first-time curiosity about SEO ideas.',
      zh: '未来最强的信号，会来自用户是否会反复回来做规划和研究，而不是第一次出于好奇来看看 SEO 点子。',
    },
  },
  {
    name: 'defillama',
    compareAxes: {
      en: 'Coverage breadth, monitoring utility, and how quickly you can scan the market are the main differences to compare.',
      zh: '重点比较覆盖广度、监控实用性和市场扫描效率。',
      enList: ['Coverage breadth', 'Monitoring utility', 'Market scanning speed'],
      zhList: ['覆盖广度', '监控实用性', '市场扫描速度'],
    },
    officialSummary: {
      en: 'The official site is reliable, but the stronger question is whether broad visibility is enough or whether you need deeper protocol analysis elsewhere.',
      zh: '官网本身可靠，但更重要的问题是：广覆盖可见性是否已经够用，还是你还需要更深的协议分析工具。',
    },
    freshnessSummary: {
      en: 'Coverage tools are useful precisely because they stay current, so confirm the latest chain and protocol coverage on the official site when it matters.',
      zh: '覆盖型工具的价值本来就来自“够新”，所以当链和协议覆盖对你很关键时，还是要回官网确认最新范围。',
    },
    pricingSummary: {
      en: 'The real value question is not the sticker price, but whether broad market visibility saves enough research time to justify continued use.',
      zh: '真正的价值问题不是表面价格，而是广覆盖市场可见性能不能帮你节省足够多的研究时间。',
    },
    mediaSummary: {
      en: 'Preview coverage is useful because this kind of product is often judged on scanning efficiency and information density.',
      zh: '这类产品的预览很重要，因为它常常就是靠扫描效率和信息密度来被判断的。',
    },
    communitySummary: {
      en: 'Community feedback matters most when it talks about coverage trust, monitoring habits, and what users still need to look up elsewhere.',
      zh: '当社区反馈谈到覆盖可信度、监控习惯以及用户还要去哪里补查资料时，最有参考价值。',
    },
  },
  {
    name: 'frase',
    compareAxes: {
      en: 'Search intent fit, brief workflow, and optimization support are the practical axes to compare.',
      zh: '重点比较搜索意图适配、brief 工作流和优化支持。',
      enList: ['Search intent fit', 'Brief workflow', 'Optimization support'],
      zhList: ['搜索意图适配', 'Brief 工作流', '优化支持'],
    },
    officialSummary: {
      en: 'The official site is mainly the place to confirm plan depth, but this page should help you decide whether you need SEO workflow structure at all.',
      zh: '官网更适合确认套餐深度，而这页更应该帮助你先判断：你到底需不需要一整套 SEO 内容工作流结构。',
    },
    freshnessSummary: {
      en: 'Search content tools change with product packaging and integrations, but the decision logic here stays stable: workflow depth matters more than feature count.',
      zh: '搜索内容工具的产品包装和集成会变，但这里的核心选型逻辑很稳定：工作流深度比功能数量更重要。',
    },
    pricingSummary: {
      en: 'The practical pricing threshold usually appears when content planning, optimization, and repeatable publishing become part of the same workflow.',
      zh: '当内容规划、优化和重复发布进入同一条工作流时，它的付费价值才会真正出现。',
    },
    mediaSummary: {
      en: 'Preview coverage is useful because SEO content products are often chosen on workflow clarity rather than raw model output alone.',
      zh: '这类产品的预览有价值，因为用户常常是根据工作流是否清晰来选，而不只是看模型输出本身。',
    },
    communitySummary: {
      en: 'The best feedback here usually comes from people describing article planning and optimization workflow, not isolated generation quality.',
      zh: '这里最有价值的反馈，通常来自用户如何描述文章规划和优化流程，而不是单次生成质量。',
    },
  },
  {
    name: 'n8n',
    compareAxes: {
      en: 'Workflow flexibility, logic control, and whether the product supports repeatable internal operations better than lighter trigger tools are the decision points that matter.',
      zh: '重点比较工作流灵活性、逻辑控制，以及它是否比轻量触发器工具更适合可重复的内部流程。',
      enList: ['Workflow flexibility', 'Logic control', 'Repeatable internal operations'],
      zhList: ['工作流灵活性', '逻辑控制', '可重复内部流程'],
    },
    officialSummary: {
      en: 'The official site is trustworthy, but the deeper decision is whether your automations have grown complex enough to need a more structured workflow layer.',
      zh: '官网本身值得信任，但更深层的决策点在于：你的自动化是否已经复杂到需要一个更结构化的工作流层。',
    },
    freshnessSummary: {
      en: 'Automation platforms evolve through integrations and workflow capabilities, so current connector depth should still be checked on the official site.',
      zh: '自动化平台常通过连接器和工作流能力持续变化，所以当前集成深度最好还是回官网确认。',
    },
    pricingSummary: {
      en: 'The pricing threshold usually appears when automation becomes an owned operational system rather than a handful of convenience shortcuts.',
      zh: '它的付费门槛通常出现在自动化已经变成一套被团队真正拥有的运营系统，而不只是几个省事小技巧的时候。',
    },
    mediaSummary: {
      en: 'Previews matter because users need to judge how complex workflows feel to build and maintain, not just whether the interface looks clean.',
      zh: '这里的预览很重要，因为用户需要判断复杂流程搭建和维护起来是什么感觉，而不只是界面看起来干不干净。',
    },
    communitySummary: {
      en: 'The most useful feedback describes real workflow ownership, maintenance burden, and how well n8n holds up as automations scale.',
      zh: '最有价值的反馈，是用户如何描述工作流归属、维护成本，以及随着流程变复杂后 n8n 是否还能扛得住。',
    },
  },
  {
    name: 'make',
    compareAxes: {
      en: 'Ease of use, visual workflow range, and whether it covers serious operations without becoming too technical are the practical axes to compare.',
      zh: '重点比较易用性、可视化工作流覆盖面，以及它是否能在不过度技术化的前提下支撑真正的运营流程。',
      enList: ['Ease of use', 'Visual workflow range', 'Operational coverage'],
      zhList: ['易用性', '可视化工作流覆盖', '运营流程覆盖面'],
    },
    officialSummary: {
      en: 'The official site is easy to validate, but the real comparison is whether your team wants approachable automation or deeper logic ownership.',
      zh: '官网本身很好验证，但真正的比较点是：你的团队更需要低门槛自动化，还是更深的逻辑控制权。',
    },
    freshnessSummary: {
      en: 'Visual automation tools shift through templates, connectors, and packaging, so exact capability details should still be checked on the official site.',
      zh: '可视化自动化工具常通过模板、连接器和套餐持续变化，所以具体能力边界仍建议回官网确认。',
    },
    pricingSummary: {
      en: 'The real pricing question is whether a more approachable workflow builder helps the team automate enough meaningful work to justify ongoing use.',
      zh: '真正的价格判断是：一个更容易上手的工作流搭建器，是否能帮团队自动化足够多的重要工作，从而值得持续使用。',
    },
    mediaSummary: {
      en: 'Screenshots matter because workflow tools are often judged on clarity, node complexity, and whether the visual model feels manageable at scale.',
      zh: '这里的截图很有意义，因为工作流工具经常会被拿来判断清晰度、节点复杂度，以及流程变大后是否还可控。',
    },
    communitySummary: {
      en: 'The strongest feedback usually comes from operators describing how far Make stretches before teams start wanting more ownership or logic depth.',
      zh: '最强的反馈通常来自运营团队：Make 能支撑到什么程度，什么时候团队开始想要更强的控制权或逻辑深度。',
    },
  },
  {
    name: 'openrouter',
    compareAxes: {
      en: 'Provider optionality, routing value, and whether your workflow needs infrastructure flexibility rather than a single end-user assistant are the key decision axes.',
      zh: '重点比较提供商可选性、路由价值，以及你的工作流是否需要基础设施层灵活性，而不是单一终端助手。',
      enList: ['Provider optionality', 'Routing value', 'Infrastructure flexibility'],
      zhList: ['提供商可选性', '路由价值', '基础设施灵活性'],
    },
    officialSummary: {
      en: 'The official site is a good trust checkpoint, but the bigger job of this page is to stop users from comparing OpenRouter against the wrong class of products.',
      zh: '官网本身是不错的信任检查点，但这页更重要的任务，是避免用户把 OpenRouter 和错误类别的产品放在一起比较。',
    },
    freshnessSummary: {
      en: 'Model access layers can change quickly as provider support evolves, so exact coverage and pricing details should be rechecked on the official site.',
      zh: '随着模型提供商支持不断变化，这类访问层产品的覆盖范围和定价细节也会较快变化，所以仍建议回官网复核。',
    },
    pricingSummary: {
      en: 'The real value question is whether model routing and provider flexibility are important enough to justify using an extra infrastructure layer in your stack.',
      zh: '真正的价值判断在于：模型路由和提供商灵活性，是否已经重要到值得在技术栈里增加一层基础设施。',
    },
    mediaSummary: {
      en: 'Previews matter less for visual polish here and more for helping developers understand the shape of the routing and access workflow.',
      zh: '这里的预览重点不在视觉精致度，而在于帮助开发者理解它的访问和路由工作流大致长什么样。',
    },
    communitySummary: {
      en: 'The most useful feedback comes from builders describing integration convenience, provider breadth, and how often routing flexibility mattered in production.',
      zh: '最有价值的反馈，来自构建者如何描述接入便利度、提供商广度，以及路由灵活性在生产里到底有多常用。',
    },
  },
  {
    name: 'sudowrite',
    compareAxes: {
      en: 'Creative momentum, tone preservation, and scene-level usefulness are the core things to compare.',
      zh: '重点比较创作推进力、语气保持和场景级实用性。',
      enList: ['Creative momentum', 'Tone preservation', 'Scene-level usefulness'],
      zhList: ['创作推进力', '语气保持', '场景级实用性'],
    },
    officialSummary: {
      en: 'The official site is reliable, but this category is usually decided by workflow fit: fiction and narrative work versus general business writing.',
      zh: '官网本身可靠，但这类工具真正的决策点通常在工作流适配：你是在做小说叙事，还是泛商业写作。',
    },
    freshnessSummary: {
      en: 'Creative products evolve, but the real decision logic here stays stable: does it help you keep writing with your voice intact?',
      zh: '创意写作产品会继续演进，但核心判断逻辑很稳定：它能不能让你保留自己的语气继续写下去。',
    },
    pricingSummary: {
      en: 'The real price question is whether creative unblock and drafting speed are valuable often enough to justify a dedicated tool.',
      zh: '真正的价格问题是：创作卡点突破和起草提速，是否已经高频到值得为专门工具付费。',
    },
    mediaSummary: {
      en: 'Screenshots matter less for visual complexity here and more for showing whether the drafting workflow feels focused or distracting.',
      zh: '这里的截图意义，不在于视觉复杂度，而在于帮助判断写作流程是聚焦的，还是容易分散注意力。',
    },
    communitySummary: {
      en: 'The strongest user feedback usually comes from people describing whether it actually rescued stuck drafts, not just whether outputs looked polished.',
      zh: '最有价值的用户反馈，通常来自它是否真的帮人把卡住的稿子写下去，而不只是输出看起来漂不漂亮。',
    },
  },
  {
    name: 'rytr',
    compareAxes: {
      en: 'Ease of use, template fit, and whether it speeds up routine writing should drive the comparison.',
      zh: '重点比较易用性、模板适配和它是否真的提速例行写作。',
      enList: ['Ease of use', 'Template fit', 'Routine writing speed'],
      zhList: ['易用性', '模板适配', '例行写作速度'],
    },
    officialSummary: {
      en: 'The official site is helpful for checking plan limits, but the real question is whether you want a simple helper or a deeper content system.',
      zh: '官网适合确认套餐限制，但真正的问题是：你要的是一个简单写作帮手，还是更深的内容系统。',
    },
    freshnessSummary: {
      en: 'This kind of lightweight writing product is less about constant feature novelty and more about whether the workflow stays friction-light over time.',
      zh: '这类轻量写作工具更重要的，不是功能一直更新，而是它的工作流能不能长期保持低摩擦。',
    },
    pricingSummary: {
      en: 'The pricing threshold matters mostly when routine writing becomes frequent enough that a lightweight assistant saves meaningful time every week.',
      zh: '它的付费门槛主要出现在：当例行写作已经足够频繁，一个轻量助手每周都能帮你节省明确时间。',
    },
    mediaSummary: {
      en: 'Media helps here mainly to show how simple the surface feels, which is often part of the buying decision for lightweight tools.',
      zh: '这里的媒体预览主要帮助你感受界面是否足够轻，这本身就是轻量工具的一部分购买判断。',
    },
    communitySummary: {
      en: 'User signal is strongest when it talks about repeatable daily writing, not when it judges the product against heavyweight publishing platforms.',
      zh: '当用户反馈讨论的是重复性的日常写作时，信号最强；拿它去和重量级内容平台硬比，参考价值反而没那么高。',
    },
  },
  {
    name: 'messari',
    compareAxes: {
      en: 'Research depth, protocol context, and sector-monitoring usefulness are the core comparison points.',
      zh: '重点比较研究深度、协议语境和赛道监控价值。',
      enList: ['Research depth', 'Protocol context', 'Sector monitoring'],
      zhList: ['研究深度', '协议语境', '赛道监控'],
    },
    officialSummary: {
      en: 'The official site is a trustable source checkpoint, but the more important question is whether you need real crypto research structure or just a surface dashboard.',
      zh: '官网当然是可靠来源，但更重要的问题是：你需要的是严肃加密研究结构，还是一个表层看板就够了。',
    },
    freshnessSummary: {
      en: 'Market research products should always be checked against the latest official coverage, but the buying logic here is usually more stable than daily market narratives.',
      zh: '市场研究产品始终要对照最新官网覆盖看，但这里的购买逻辑，往往比每天的市场叙事更稳定。',
    },
    pricingSummary: {
      en: 'The main pricing threshold is whether protocol diligence and research output are recurring enough to justify a more serious tool in the stack.',
      zh: '核心付费门槛在于：协议尽调和研究输出是否已经足够高频，值得你把它放进更正式的工具栈。',
    },
    mediaSummary: {
      en: 'Preview coverage helps because research tools are often judged on information structure and reading workflow as much as on raw data.',
      zh: '研究工具的预览很重要，因为它经常既要看原始数据，也要看信息结构和阅读工作流。',
    },
    communitySummary: {
      en: 'Community signal is most useful when it explains whether the product improves decision support, not just whether it has “a lot of information.”',
      zh: '当社区反馈解释它是否真正提升了决策支持，而不只是“信息很多”时，最有价值。',
    },
  },
  {
    name: 'nansen',
    compareAxes: {
      en: 'Wallet intelligence depth, monitoring usefulness, and entity context are the most important comparison points.',
      zh: '重点比较钱包情报深度、监控价值和实体语境。',
      enList: ['Wallet intelligence depth', 'Monitoring usefulness', 'Entity context'],
      zhList: ['钱包情报深度', '监控价值', '实体语境'],
    },
    officialSummary: {
      en: 'The official site is a reliable checkpoint, but the core decision is whether wallet-level intelligence is central enough to your workflow to justify a serious tool.',
      zh: '官网当然可靠，但核心问题是：钱包级情报对你的工作流是否已经足够重要，值得上更严肃的工具。',
    },
    freshnessSummary: {
      en: 'On-chain monitoring tools move with the market, so confirm current coverage and plan boundaries on the official site before committing.',
      zh: '链上监控工具会跟着市场一起变化，所以最终投入前，仍要回官网确认当前覆盖和套餐边界。',
    },
    pricingSummary: {
      en: 'The pricing threshold usually appears when wallet tracking becomes an ongoing research habit rather than occasional curiosity.',
      zh: '它的付费门槛通常出现在：钱包跟踪已经变成持续研究习惯，而不是偶尔出于好奇去看。',
    },
    mediaSummary: {
      en: 'Interface previews matter here because they reveal whether monitoring and wallet investigation feel readable enough for repeated use.',
      zh: '这里的界面预览很重要，因为它能帮助判断监控和钱包调查是否足够清晰，适合长期反复使用。',
    },
    communitySummary: {
      en: 'The strongest signal comes from users describing whether it improved wallet monitoring and capital-flow understanding in real research work.',
      zh: '最有价值的信号，来自用户是否描述它真的提升了钱包监控和资金流理解，而不是只觉得“数据多”。',
    },
  },
  {
    name: 'arkham',
    compareAxes: {
      en: 'Entity attribution, wallet investigation speed, and relationship mapping clarity matter most.',
      zh: '重点比较实体归因、钱包调查速度和关系映射清晰度。',
      enList: ['Entity attribution', 'Wallet investigation speed', 'Relationship mapping clarity'],
      zhList: ['实体归因', '钱包调查速度', '关系映射清晰度'],
    },
    officialSummary: {
      en: 'The official site is useful for trust and product scope, but the real evaluation is whether you need investigation workflow, not just market visibility.',
      zh: '官网适合确认可信度和产品范围，但真正的评估点是：你需不需要调查式工作流，而不只是市场可见性。',
    },
    freshnessSummary: {
      en: 'Investigation tools are always worth verifying against the latest official product scope, but the buying logic here stays centered on attribution and investigation depth.',
      zh: '调查类工具始终值得对照官网确认最新能力，但这里的购买逻辑始终围绕归因和调查深度。',
    },
    pricingSummary: {
      en: 'The price becomes easier to justify when attribution and investigative speed save time in repeated research or monitoring tasks.',
      zh: '当归因能力和调查速度能够在重复研究或监控任务里持续省时间时，它的价格才更容易成立。',
    },
    mediaSummary: {
      en: 'Media matters because visual relationship mapping is a core part of how the product proves its value.',
      zh: '这里的媒体预览很关键，因为关系可视化本来就是产品价值的一部分。',
    },
    communitySummary: {
      en: 'The best user signal comes from whether the product helped uncover relationships and suspicious patterns faster than standard dashboards.',
      zh: '最有价值的用户信号，是它是否真的比普通仪表盘更快帮人发现关系和异常模式。',
    },
  },
  {
    name: 'token-terminal',
    compareAxes: {
      en: 'Benchmark clarity, metric consistency, and protocol-comparison usefulness should drive the decision.',
      zh: '重点比较 benchmark 清晰度、指标一致性和协议比较价值。',
      enList: ['Benchmark clarity', 'Metric consistency', 'Protocol comparison usefulness'],
      zhList: ['Benchmark 清晰度', '指标一致性', '协议比较价值'],
    },
    officialSummary: {
      en: 'The official site is reliable, but the bigger question is whether you need structured protocol comparison rather than broader market browsing.',
      zh: '官网当然可靠，但更大的问题是：你需不需要结构化的协议比较，而不是更宽泛的市场浏览。',
    },
    freshnessSummary: {
      en: 'Protocol metrics products should always be checked against the current official coverage, but the core decision remains about comparison usefulness over time.',
      zh: '协议指标产品始终要回官网确认当前覆盖，但核心判断仍然是它的长期比较价值够不够强。',
    },
    pricingSummary: {
      en: 'The pricing threshold is usually justified when protocol benchmarking is recurring enough to affect research, investing, or strategic monitoring.',
      zh: '当协议 benchmarking 已经高频到会影响研究、投资或战略监控时，它的价格门槛才真正合理。',
    },
    mediaSummary: {
      en: 'Interface previews help because information density and comparison readability are central to whether this kind of product works for a team.',
      zh: '这里的界面预览很重要，因为信息密度和对比可读性，本来就是这类产品是否适合团队的重要判断点。',
    },
    communitySummary: {
      en: 'User feedback matters most when it describes whether the product really improved cross-protocol comparison rather than simply exposing more numbers.',
      zh: '当用户反馈谈的是它是否真的提升了跨协议比较，而不只是展示更多数字时，最有价值。',
    },
  },
  {
    name: 'zapper',
    compareAxes: {
      en: 'Wallet readability, portfolio visibility, and monitoring convenience are the main things to compare.',
      zh: '重点比较钱包可读性、组合可见性和监控便利度。',
      enList: ['Wallet readability', 'Portfolio visibility', 'Monitoring convenience'],
      zhList: ['钱包可读性', '组合可见性', '监控便利度'],
    },
    officialSummary: {
      en: 'The official site is a good checkpoint, but the real decision is whether you need a more approachable wallet view before deeper analytics tools.',
      zh: '官网是很好的检查点，但真正的决策点是：你是否需要一个更好上手的钱包视图，作为深入分析工具之前的第一层。',
    },
    freshnessSummary: {
      en: 'Portfolio tools are worth checking against the latest official coverage, but the core buying logic here remains about visibility and convenience.',
      zh: '投资组合工具当然要回官网确认最新覆盖，但这里最核心的购买逻辑还是可见性和便利度。',
    },
    pricingSummary: {
      en: 'The price becomes more reasonable when wallet monitoring and portfolio review are repeated habits instead of occasional checks.',
      zh: '当钱包监控和组合查看已经是重复性习惯，而不是偶尔看一眼时，它的价格才更容易被接受。',
    },
    mediaSummary: {
      en: 'Preview coverage matters here because interface clarity is a major part of whether users stick with a portfolio tool.',
      zh: '这里的媒体预览很关键，因为界面清晰度本来就是用户会不会长期使用组合工具的重要原因。',
    },
    communitySummary: {
      en: 'The best feedback usually explains whether the product made ongoing wallet tracking simpler, not just whether it looked good at first glance.',
      zh: '最有价值的反馈，通常在于它是否真的让持续钱包跟踪更简单，而不只是初看界面舒服。',
    },
  },
  {
    name: 'debank',
    compareAxes: {
      en: 'Wallet clarity, protocol exposure visibility, and everyday monitoring speed are the important differences to compare.',
      zh: '重点比较钱包清晰度、协议暴露可见性和日常监控速度。',
      enList: ['Wallet clarity', 'Protocol exposure visibility', 'Everyday monitoring speed'],
      zhList: ['钱包清晰度', '协议暴露可见性', '日常监控速度'],
    },
    officialSummary: {
      en: 'The official site is a trustworthy checkpoint, but the stronger question is whether a lighter wallet-visibility layer is all you need before heavier research tools.',
      zh: '官网当然是可靠检查点，但更重要的问题是：在更重的研究工具之前，一个轻量的钱包可见性层是不是已经够用。',
    },
    freshnessSummary: {
      en: 'Wallet products should always be checked against the latest supported chains and features, but the decision logic here stays centered on clarity and speed.',
      zh: '钱包产品当然要回官网确认最新支持的链和功能，但这里的判断逻辑始终围绕清晰度和速度。',
    },
    pricingSummary: {
      en: 'The pricing decision matters less than whether the product reliably reduces the time spent checking holdings and protocol exposure.',
      zh: '价格本身往往不是第一判断点，更重要的是它能不能稳定减少你查看持仓和协议暴露所花的时间。',
    },
    mediaSummary: {
      en: 'Preview coverage is useful because dashboard readability is a central part of the product value here.',
      zh: '这里的媒体预览很有意义，因为看板可读性本身就是产品价值的一部分。',
    },
    communitySummary: {
      en: 'The strongest user signal usually comes from whether the product made wallet monitoring feel simpler and more reliable over time.',
      zh: '最有价值的用户信号，通常来自它是否让钱包监控随着时间推移变得更简单、更稳定。',
    },
  },
  {
    name: 'bubblemaps',
    compareAxes: {
      en: 'Visual pattern clarity, cluster investigation speed, and token-distribution readability are the main comparison points.',
      zh: '重点比较模式可视化清晰度、集群调查速度和代币分布可读性。',
      enList: ['Visual pattern clarity', 'Cluster investigation speed', 'Distribution readability'],
      zhList: ['模式可视化清晰度', '集群调查速度', '分布可读性'],
    },
    officialSummary: {
      en: 'The official site is a reliable checkpoint, but the bigger question is whether visual investigation reveals things your usual tables and dashboards miss.',
      zh: '官网当然可靠，但更大的问题是：这种可视化调查，是否真的能看出你平时表格和仪表盘看不出来的东西。',
    },
    freshnessSummary: {
      en: 'Investigation products should be checked against current official scope, but the lasting value here is how quickly they surface patterns and anomalies.',
      zh: '调查产品当然要看当前官网范围，但它长期真正的价值，在于能多快暴露模式和异常。',
    },
    pricingSummary: {
      en: 'The price becomes easier to justify when relationship discovery and anomaly review are repeated parts of the workflow rather than occasional curiosity.',
      zh: '当关系发现和异常审查已经是重复性工作，而不是偶尔好奇看看时，它的价格就更容易站得住。',
    },
    mediaSummary: {
      en: 'Preview coverage matters a lot here because visualization is not just decoration; it is the product’s core decision-support surface.',
      zh: '这里的媒体预览非常重要，因为可视化不是装饰，而是产品核心的决策支持界面。',
    },
    communitySummary: {
      en: 'The strongest feedback usually explains whether the product exposed wallet relationships and suspicious flows faster than ordinary dashboards.',
      zh: '最有价值的反馈，通常在于它是否比普通仪表盘更快暴露钱包关系和异常资金流。',
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

async function main() {
  loadLocalEnv();
  let failed = 0;

  for (const seed of SEEDS) {
    try {
      const result = await query<{ id: string; features: unknown }>(
        'SELECT id, features FROM tools WHERE name = $1 LIMIT 1',
        [seed.name],
      );

      if (result.rowCount === 0) {
        console.log(`- skipped ${seed.name}: not found`);
        continue;
      }

      const row = result.rows[0];
      const features =
        row.features && typeof row.features === 'object'
          ? (row.features as Record<string, unknown>)
          : {};
      const existingDecision =
        features.decision && typeof features.decision === 'object'
          ? (features.decision as Record<string, unknown>)
          : {};

      const nextFeatures = {
        ...features,
        decision: {
          ...existingDecision,
          compareAxes: {
            en: seed.compareAxes.enList,
            zh: seed.compareAxes.zhList,
          },
          officialSummary: seed.officialSummary,
          freshnessSummary: seed.freshnessSummary,
          pricingSummary: seed.pricingSummary,
          mediaSummary: seed.mediaSummary,
          communitySummary: seed.communitySummary,
        },
      };

      await query('UPDATE tools SET features = $2::jsonb, updated_at = NOW() WHERE id = $1', [
        row.id,
        JSON.stringify(nextFeatures),
      ]);

      console.log(`- enriched decision snapshot for ${seed.name}`);
    } catch (error) {
      failed += 1;
      const message = error instanceof Error ? error.message : 'unknown error';
      console.error(`- failed ${seed.name}: ${message}`);
    }
  }

  await closePool();

  if (failed > 0) {
    throw new Error(`${failed} tool decision snapshots failed to update`);
  }
}

main().catch((error) => {
  console.error('\nFailed to enrich decision snapshots:', error);
  process.exit(1);
});
