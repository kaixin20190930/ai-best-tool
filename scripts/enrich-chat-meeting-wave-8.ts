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
  categorySlug: 'chatbot' | 'productivity';
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
  { slug: 'chat', en: 'Chat', zh: '对话' },
  { slug: 'reasoning', en: 'Reasoning', zh: '推理' },
  { slug: 'coding', en: 'Coding', zh: '编码' },
  { slug: 'meeting-notes', en: 'Meeting Notes', zh: '会议纪要' },
  { slug: 'note-taking', en: 'Note Taking', zh: '笔记' },
  { slug: 'recording', en: 'Recording', zh: '录制' },
  { slug: 'summary', en: 'Summary', zh: '总结' },
  { slug: 'workflow', en: 'Workflow', zh: '工作流' },
  { slug: 'analytics', en: 'Analytics', zh: '分析' },
];

const TOOLS: ToolSeed[] = [
  {
    name: 'deepseek',
    title: 'DeepSeek',
    url: 'https://www.deepseek.com',
    categorySlug: 'chatbot',
    pricing: 'freemium',
    tags: ['chat', 'reasoning', 'coding'],
    content: {
      en: 'A general AI assistant often compared for coding help, reasoning-heavy prompts, and everyday question answering.',
      zh: '一个常被拿来比较编码辅助、推理型提问和日常问答能力的通用 AI 助手。',
    },
    detail: {
      en: `DeepSeek becomes relevant when users are comparing mainstream assistants not only for chat, but for how well they handle technical questions, structured reasoning, and practical implementation support. It is less about brand familiarity and more about whether the output holds up under real tasks.

The key decision on this page is whether DeepSeek deserves a regular slot in the assistant stack for problem-solving and coding-adjacent work. If users care about reasoning quality and technical usefulness, it belongs in the comparison set.`,
      zh: `当用户比较主流助手时，如果关注点不只是聊天，而是它对技术问题、结构化推理和实际实现辅助的处理能力，DeepSeek 就会很有相关性。它真正被比较的地方，不在品牌熟悉度，而在输出是否能扛住真实任务。

这页真正的判断点在于：DeepSeek 是否值得在“问题求解 + 编码相关工作”里占据一个常驻位置。如果用户更看重推理质量和技术实用性，它就应该进入比较集合。`,
    },
    useCases: {
      en: ['Reasoning-heavy prompts', 'Coding assistance', 'General question answering', 'Technical exploration'],
      zh: ['推理型提问', '编码辅助', '通用问答', '技术探索'],
    },
    features: {
      en: [
        { label: 'Core focus', value: 'Helping with reasoning, problem-solving, and coding-adjacent work.' },
        { label: 'Best for', value: 'Users comparing mainstream assistants for practical technical usefulness.' },
        { label: 'Decision angle', value: 'Compare on reasoning quality, technical help, and everyday assistant fit.' },
      ],
      zh: [
        { label: '核心定位', value: '帮助完成推理、问题求解和编码相关工作。' },
        { label: '更适合', value: '在比较主流助手真实技术实用性的用户。' },
        { label: '比较重点', value: '重点比较推理质量、技术帮助能力和日常助手适配度。' },
      ],
    },
    audience: {
      bestFit: {
        en: ['Builders comparing assistant quality', 'Users with frequent technical questions', 'People wanting one general assistant with stronger reasoning'],
        zh: ['比较助手质量的构建者', '有大量技术问题的用户', '想要兼顾通用性和推理能力的人'],
      },
      notIdealFor: {
        en: ['Teams shopping for a narrow vertical workflow product', 'Users only needing meeting or content operations tools'],
        zh: ['在选购垂直工作流产品的团队', '只需要会议或内容运营工具的用户'],
      },
    },
    editorialSummary: {
      en: 'Reviewed as a reasoning-first mainstream assistant option rather than a novelty chatbot.',
      zh: '已按“推理优先的主流助手选项”而不是新奇聊天机器人来复核。',
    },
    trustNote: {
      en: 'This listing keeps the comparison anchored on practical reasoning and coding usefulness, which is where DeepSeek is usually judged.',
      zh: '本条目把比较锚点放在真实推理和编码实用性上，这也是 DeepSeek 最常被判断的地方。',
    },
    decision: {
      compareAxes: {
        en: ['Reasoning quality', 'Coding usefulness', 'Everyday assistant fit'],
        zh: ['推理质量', '编码实用性', '日常助手适配'],
      },
      officialSummary: {
        en: 'The official site is useful as a trust checkpoint, but the deeper decision is whether the assistant performs well enough under real reasoning and implementation tasks.',
        zh: '官网本身适合作为信任检查点，但更深层的判断是：它在真实推理和实现任务下是否表现得足够好。',
      },
      freshnessSummary: {
        en: 'General assistants evolve quickly, so exact plan and capability edges should still be checked on the official site before adoption.',
        zh: '通用助手变化很快，所以在正式采用前，具体套餐和能力边界仍建议回官网确认。',
      },
      pricingSummary: {
        en: 'The price matters only if the tool becomes part of repeated reasoning or coding work instead of staying a curiosity test.',
        zh: '只有当这个工具进入重复性的推理或编码工作，而不只是尝鲜测试时，它的价格才真正值得判断。',
      },
      mediaSummary: {
        en: 'Preview coverage helps users decide whether the product feels like a practical assistant surface instead of just another generic prompt box.',
        zh: '这里的预览能帮助用户判断：它是不是一个真正可用的助手界面，而不只是另一个通用输入框。',
      },
      communitySummary: {
        en: 'The best signal comes from people describing whether DeepSeek actually held up in repeated technical and reasoning-heavy use.',
        zh: '最有价值的信号，来自用户是否说明 DeepSeek 在重复性的技术和推理任务中真的站得住。',
      },
    },
    media: {
      category: 'Chatbot',
      accent: '#111827',
      accentSoft: '#e5e7eb',
      accentStrong: '#111827',
      surface: '#f8fafc',
      badge: 'Reasoning assistant',
      summary: 'Compare reasoning quality, coding help, and practical assistant usefulness.',
      logoText: 'Ds',
    },
  },
  {
    name: 'granola',
    title: 'Granola',
    url: 'https://www.granola.ai',
    categorySlug: 'productivity',
    pricing: 'freemium',
    tags: ['note-taking', 'meeting-notes', 'workflow'],
    content: {
      en: 'A note-taking app that helps turn meetings into cleaner, more usable notes with less manual friction.',
      zh: '一个帮助把会议变成更干净、更可用笔记的工具，尽量减少手工整理摩擦。',
    },
    detail: {
      en: `Granola is most relevant when the user cares about low-friction note capture more than heavyweight meeting ops. It sits in the meeting-notes space as a calmer, cleaner tool for people who want usable notes without turning the workflow into a big system.

The real decision is whether Granola gives enough structure and usefulness while still staying light. If the job is keeping notes clean without adding operational overhead, it is worth comparing.`,
      zh: `当用户更在意“低摩擦笔记记录”，而不是重型会议运营系统时，Granola 会更有价值。它在会议笔记空间里，更像一个安静、干净的工具，适合那些想获得可用笔记，但又不想把流程做得过于复杂的人。

这里真正的判断点是：Granola 是否在保持轻量的同时，又提供了足够的结构和可用性。如果你的任务是把笔记做好，又不想增加运营负担，它值得被比较。`,
    },
    useCases: {
      en: ['Meeting notes', 'Personal note capture', 'Low-friction summaries', 'Conversation organization'],
      zh: ['会议笔记', '个人笔记记录', '低摩擦总结', '对话整理'],
    },
    features: {
      en: [
        { label: 'Core focus', value: 'Keeping note capture light while still producing usable outputs.' },
        { label: 'Best for', value: 'People who want cleaner notes without a heavyweight meeting system.' },
        { label: 'Decision angle', value: 'Compare on note clarity, workflow lightness, and everyday usability.' },
      ],
      zh: [
        { label: '核心定位', value: '在保持轻量的同时产出真正可用的笔记。' },
        { label: '更适合', value: '希望获得更干净笔记、又不想引入重型会议系统的人。' },
        { label: '比较重点', value: '重点比较笔记清晰度、流程轻量感和日常易用性。' },
      ],
    },
    audience: {
      bestFit: {
        en: ['Individuals in many meetings', 'Teams preferring a simpler notes layer', 'Users wanting low-friction capture'],
        zh: ['会议很多的个人用户', '偏好更简单笔记层的团队', '想要低摩擦记录的人'],
      },
      notIdealFor: {
        en: ['Teams wanting heavy meeting intelligence dashboards', 'Users only looking for raw transcription archives'],
        zh: ['需要重型会议智能看板的团队', '只在寻找原始转录归档的用户'],
      },
    },
    editorialSummary: {
      en: 'Reviewed as a light, workflow-friendly meeting-notes tool rather than a full meeting ops platform.',
      zh: '已按“轻量、工作流友好的会议笔记工具”而不是完整会议运营平台来复核。',
    },
    trustNote: {
      en: 'This listing keeps the focus on low-friction usability, which is where Granola is easiest to judge honestly.',
      zh: '本条目把重点放在低摩擦易用性上，这也是 Granola 最容易被诚实判断的地方。',
    },
    decision: {
      compareAxes: {
        en: ['Workflow lightness', 'Note clarity', 'Everyday usability'],
        zh: ['流程轻量感', '笔记清晰度', '日常易用性'],
      },
      officialSummary: {
        en: 'The official site is trustworthy, but the deeper question is whether the product stays light without becoming too shallow to be useful.',
        zh: '官网本身值得信任，但更深的问题是：这个产品是否能保持轻量，而不至于轻到失去实用性。',
      },
      freshnessSummary: {
        en: 'Meeting tools keep evolving, so exact packaging should be checked on the official site, while the core evaluation logic here remains stable.',
        zh: '会议工具会持续演进，所以具体套餐仍建议回官网确认，但这里的核心判断逻辑相对稳定。',
      },
      pricingSummary: {
        en: 'The price makes sense only if lighter note capture actually saves repeated mental overhead week after week.',
        zh: '只有当更轻的笔记记录真的每周都在持续减少心智负担时，这类产品的价格才更说得通。',
      },
      mediaSummary: {
        en: 'Preview coverage matters because users want to feel whether the interface is calm and usable, not overloaded.',
        zh: '这里的预览很重要，因为用户想感受界面是不是安静、顺手，而不是堆满复杂功能。',
      },
      communitySummary: {
        en: 'The strongest feedback comes from people explaining whether Granola actually made note-taking feel easier in real meetings.',
        zh: '最强的反馈，来自用户是否说明 Granola 真的让真实会议中的记笔记变得更轻松。',
      },
    },
    media: {
      category: 'Productivity',
      accent: '#16a34a',
      accentSoft: '#dcfce7',
      accentStrong: '#15803d',
      surface: '#f5fff8',
      badge: 'Light note capture',
      summary: 'Keep meeting notes clean and useful without adding heavy workflow overhead.',
      logoText: 'Gr',
    },
  },
  {
    name: 'supernormal',
    title: 'Supernormal',
    url: 'https://supernormal.com',
    categorySlug: 'productivity',
    pricing: 'freemium',
    tags: ['meeting-notes', 'summary', 'workflow'],
    content: {
      en: 'An AI assistant for meeting notes, action items, and lightweight follow-up workflows.',
      zh: '一个用于会议纪要、行动项和轻量跟进工作流的 AI 助手。',
    },
    detail: {
      en: `Supernormal is useful when the team wants generated meeting output that can move directly into action. It fits organizations that care about what happens after the conversation and want notes to feed follow-up without too much cleanup.

The decision here is whether Supernormal creates enough momentum after meetings to justify a place in the stack. If the workflow is summary plus action rather than storage plus archive, it is worth a look.`,
      zh: `当团队希望会议输出能直接走向行动时，Supernormal 会更有价值。它适合那些在意“会议之后发生什么”的组织，希望笔记能自然进入后续跟进，而不是还要额外清理和改写。

这里真正的判断点是：Supernormal 是否能在会议之后带来足够的推进力，值得占据工具栈里的一个位置。如果你的工作流更像“总结 + 行动”，而不是“存档 + 归档”，它值得被认真看一眼。`,
    },
    useCases: {
      en: ['Meeting notes', 'Action items', 'Follow-up workflows', 'Team recap sharing'],
      zh: ['会议纪要', '行动项', '后续跟进工作流', '团队回顾共享'],
    },
    features: {
      en: [
        { label: 'Core focus', value: 'Helping meeting output move faster into action and follow-through.' },
        { label: 'Best for', value: 'Teams that want notes to drive next steps without lots of cleanup.' },
        { label: 'Decision angle', value: 'Compare on actionability, follow-up fit, and workflow momentum.' },
      ],
      zh: [
        { label: '核心定位', value: '帮助会议输出更快转化为行动和后续推进。' },
        { label: '更适合', value: '希望笔记能直接推动下一步，而不是还要大量整理的团队。' },
        { label: '比较重点', value: '重点比较可执行性、跟进适配度和流程推进力。' },
      ],
    },
    audience: {
      bestFit: {
        en: ['Action-oriented teams', 'Operators managing many follow-ups', 'Teams wanting lighter meeting ops'],
        zh: ['行动导向的团队', '管理大量后续跟进的运营人员', '希望会议运营更轻的团队'],
      },
      notIdealFor: {
        en: ['Users only wanting an audio record', 'Teams that do not rely on meeting action items'],
        zh: ['只想要音频记录的用户', '并不依赖会议行动项的团队'],
      },
    },
    editorialSummary: {
      en: 'Reviewed as an action-oriented meeting assistant rather than a passive note repository.',
      zh: '已按“行动导向的会议助手”而不是被动笔记仓库来复核。',
    },
    trustNote: {
      en: 'This listing focuses on whether the product creates follow-up momentum, which is usually the real buying question.',
      zh: '本条目聚焦这个产品是否带来后续推进力，因为这通常才是真正的购买判断点。',
    },
    decision: {
      compareAxes: {
        en: ['Actionability', 'Follow-up workflow', 'Meeting momentum'],
        zh: ['可执行性', '后续跟进工作流', '会议推进力'],
      },
      officialSummary: {
        en: 'The official site is reliable, but the deeper decision is whether the product helps teams move from discussion to action faster.',
        zh: '官网本身可靠，但更深层的判断是：这个产品是否能帮助团队更快从讨论走向行动。',
      },
      freshnessSummary: {
        en: 'Meeting assistants evolve through integrations and packaging, so exact plan differences should still be checked on the official site.',
        zh: '会议助手会随着集成和套餐变化，所以具体套餐差异仍建议回官网确认。',
      },
      pricingSummary: {
        en: 'The price is justified only if meeting output regularly creates enough follow-up work that automation saves real time.',
        zh: '只有当会议输出经常制造足够多的后续工作，而自动化又能真实省时，这类产品的价格才更容易成立。',
      },
      mediaSummary: {
        en: 'Preview coverage helps users judge whether the product shows notes as action-ready output rather than static recap text.',
        zh: '这里的预览能帮助用户判断：它呈现的是可行动的输出，还是静态的总结文本。',
      },
      communitySummary: {
        en: 'The best feedback comes from teams explaining whether Supernormal really improved post-meeting execution.',
        zh: '最有价值的反馈，来自团队是否说明 Supernormal 真的改善了会后执行。',
      },
    },
    media: {
      category: 'Productivity',
      accent: '#f97316',
      accentSoft: '#ffedd5',
      accentStrong: '#ea580c',
      surface: '#fff9f5',
      badge: 'Action-ready notes',
      summary: 'Turn meeting output into action items and follow-through with less cleanup.',
      logoText: 'Sn',
    },
  },
  {
    name: 'tldv',
    title: 'tl;dv',
    url: 'https://tldv.io',
    categorySlug: 'productivity',
    pricing: 'freemium',
    tags: ['meeting-notes', 'recording', 'summary'],
    content: {
      en: 'A meeting recorder and note assistant for capturing, clipping, and sharing important conversation moments.',
      zh: '一个用于记录、裁剪并分享关键对话片段的会议记录与笔记助手。',
    },
    detail: {
      en: `tl;dv is most useful when the team needs more than a transcript and wants reusable meeting moments. It sits between recording and recap, which makes it relevant for organizations that want to highlight and circulate specific pieces of conversation.

The real decision is whether tl;dv improves how teams revisit and share important moments from calls. If your workflow depends on recap clips and selective sharing, it belongs in the shortlist.`,
      zh: `当团队需要的不只是转录，而是“可复用的会议片段”时，tl;dv 会更有价值。它介于录制和回顾之间，所以对于那些希望高亮并流转关键对话片段的组织会很有相关性。

这里真正的判断点是：tl;dv 是否改善了团队回看和分享通话关键时刻的方式。如果你的工作流依赖总结片段和选择性分享，它值得进入 shortlist。`,
    },
    useCases: {
      en: ['Meeting recording', 'Clip sharing', 'Conversation recap', 'Highlight-based follow-up'],
      zh: ['会议录制', '片段分享', '对话回顾', '基于重点片段的后续跟进'],
    },
    features: {
      en: [
        { label: 'Core focus', value: 'Making important meeting moments easier to capture, revisit, and share.' },
        { label: 'Best for', value: 'Teams that care about recap clips and selective conversation sharing.' },
        { label: 'Decision angle', value: 'Compare on clip usefulness, sharing workflow, and recap value.' },
      ],
      zh: [
        { label: '核心定位', value: '让重要会议时刻更容易被捕捉、回看和分享。' },
        { label: '更适合', value: '重视总结片段和选择性对话分享的团队。' },
        { label: '比较重点', value: '重点比较片段价值、分享工作流和回顾体验。' },
      ],
    },
    audience: {
      bestFit: {
        en: ['Teams sharing call highlights', 'Customer-facing orgs', 'People reviewing specific moments later'],
        zh: ['需要分享通话重点的团队', '面向客户的组织', '会事后回看特定片段的人'],
      },
      notIdealFor: {
        en: ['Teams only wanting a plain text transcript', 'Users who do not reuse recorded conversations'],
        zh: ['只想要纯文本转录的团队', '不会复用录制对话的用户'],
      },
    },
    editorialSummary: {
      en: 'Reviewed as a highlight-and-sharing meeting tool rather than a plain recorder.',
      zh: '已按“重点片段与分享型会议工具”而不是纯录音器来复核。',
    },
    trustNote: {
      en: 'This listing focuses on recap and sharing value, which is usually where tl;dv is most clearly differentiated.',
      zh: '本条目强调的是回顾与分享价值，这通常也是 tl;dv 最清晰的差异点。',
    },
    decision: {
      compareAxes: {
        en: ['Clip usefulness', 'Sharing workflow', 'Recap value'],
        zh: ['片段价值', '分享工作流', '回顾价值'],
      },
      officialSummary: {
        en: 'The official site is trustworthy, but the deeper decision is whether the product helps teams do more with conversations after they end.',
        zh: '官网本身值得信任，但更深层的判断是：这个产品是否让团队在对话结束后能做更多事情。',
      },
      freshnessSummary: {
        en: 'Meeting tools evolve through integrations and packaging, so exact plan details should still be checked on the official site.',
        zh: '会议工具会随着集成和套餐演进，所以具体套餐细节仍建议回官网确认。',
      },
      pricingSummary: {
        en: 'The price is easiest to justify when meeting highlights and replay moments are part of repeat weekly workflows.',
        zh: '只有当会议重点和回放片段已经成为每周重复工作流的一部分时，这类产品的价格才最容易被证明合理。',
      },
      mediaSummary: {
        en: 'Preview coverage helps users judge whether the interface supports clips, highlights, and team sharing instead of only storing recordings.',
        zh: '这里的预览能帮助用户判断：界面是否支持片段、高亮和团队分享，而不只是存放录音。',
      },
      communitySummary: {
        en: 'The strongest feedback comes from teams explaining whether tl;dv improved how they shared and revisited important call moments.',
        zh: '最强的反馈，来自团队是否说明 tl;dv 改善了他们分享和回看关键通话时刻的方式。',
      },
    },
    media: {
      category: 'Productivity',
      accent: '#8b5cf6',
      accentSoft: '#ede9fe',
      accentStrong: '#7c3aed',
      surface: '#faf8ff',
      badge: 'Highlight sharing',
      summary: 'Capture and share the most important moments from meetings and calls.',
      logoText: 'Td',
    },
  },
  {
    name: 'read-ai',
    title: 'Read AI',
    url: 'https://www.read.ai',
    categorySlug: 'productivity',
    pricing: 'freemium',
    tags: ['meeting-notes', 'summary', 'analytics'],
    content: {
      en: 'An AI meeting assistant that summarizes calls and surfaces engagement and participation signals.',
      zh: '一个会总结通话，并提供参与度与互动信号的 AI 会议助手。',
    },
    detail: {
      en: `Read AI becomes more relevant when a team wants not only notes, but also more visibility into how meetings are running. It sits closer to the performance-and-insight side of the meeting tool stack, which makes it useful for teams that care about follow-through and conversation quality together.

The practical decision is whether these extra signals are meaningful enough to improve meeting quality, not just create more data. If the team wants recap plus visibility, Read AI is worth comparing.`,
      zh: `当团队不只想要笔记，而是还想看清会议本身是怎么运作的时候，Read AI 就会更有价值。它更靠近“会议表现与洞察”这一侧，所以对那些同时在意后续跟进和对话质量的团队会更有意义。

这里真正的判断点是：这些额外信号是否足够有意义，真的能改善会议质量，而不是只是增加更多数据。如果团队需要“总结 + 可见性”，Read AI 值得被比较。`,
    },
    useCases: {
      en: ['Meeting summaries', 'Participation signals', 'Conversation quality review', 'Follow-up visibility'],
      zh: ['会议总结', '参与度信号', '对话质量回顾', '后续可见性'],
    },
    features: {
      en: [
        { label: 'Core focus', value: 'Combining meeting recap with extra visibility into conversation quality and participation.' },
        { label: 'Best for', value: 'Teams that want more signal around how meetings are running, not just what was said.' },
        { label: 'Decision angle', value: 'Compare on recap value, signal usefulness, and whether extra analytics improve decisions.' },
      ],
      zh: [
        { label: '核心定位', value: '把会议总结与对话质量、参与度可见性结合起来。' },
        { label: '更适合', value: '不只想知道“说了什么”，还想知道“会议跑得怎么样”的团队。' },
        { label: '比较重点', value: '重点比较总结价值、信号可用性，以及这些分析是否真的改善判断。' },
      ],
    },
    audience: {
      bestFit: {
        en: ['Teams reviewing meeting quality', 'Managers wanting more conversation visibility', 'Ops teams with many recurring calls'],
        zh: ['回看会议质量的团队', '想获得更多对话可见性的管理者', '有大量重复通话的运营团队'],
      },
      notIdealFor: {
        en: ['Users only wanting a simple note helper', 'Teams uninterested in meeting analytics or participation signals'],
        zh: ['只想要简单笔记助手的用户', '对会议分析和参与度信号没有兴趣的团队'],
      },
    },
    editorialSummary: {
      en: 'Reviewed as a recap-plus-visibility meeting tool rather than a basic transcription assistant.',
      zh: '已按“总结 + 可见性”的会议工具来复核，而不是基础转录助手。',
    },
    trustNote: {
      en: 'This listing focuses on whether the extra meeting signals are actually useful, which is the real question for Read AI.',
      zh: '本条目把重点放在这些额外会议信号是否真的有用上，这才是 Read AI 的真实判断点。',
    },
    decision: {
      compareAxes: {
        en: ['Recap value', 'Meeting visibility', 'Signal usefulness'],
        zh: ['总结价值', '会议可见性', '信号可用性'],
      },
      officialSummary: {
        en: 'The official site is reliable, but the bigger decision is whether the product adds insight that teams will actually act on after meetings.',
        zh: '官网本身可靠，但更大的判断是：这个产品是否增加了团队真的会在会后采取行动的洞察。',
      },
      freshnessSummary: {
        en: 'Meeting products evolve through packaging and integrations, so exact plan boundaries should still be checked on the official site.',
        zh: '会议产品会通过集成和套餐持续演进，所以具体套餐边界仍建议回官网确认。',
      },
      pricingSummary: {
        en: 'The price is justified only if recap plus meeting-quality signals save time or improve follow-through often enough to matter.',
        zh: '只有当“总结 + 会议质量信号”足够频繁地节省时间或改善跟进，这类产品的价格才更容易被证明合理。',
      },
      mediaSummary: {
        en: 'Preview coverage helps users judge whether the interface presents the extra signals clearly enough to be worth paying attention to.',
        zh: '这里的预览能帮助用户判断：这些额外信号在界面里是否呈现得足够清楚，值得被重视。',
      },
      communitySummary: {
        en: 'The strongest feedback comes from teams explaining whether Read AI improved meeting quality or only produced more metrics.',
        zh: '最强的反馈，来自团队是否说明 Read AI 真的改善了会议质量，而不只是多生成了一些指标。',
      },
    },
    media: {
      category: 'Productivity',
      accent: '#0ea5e9',
      accentSoft: '#e0f2fe',
      accentStrong: '#0284c7',
      surface: '#f4fbff',
      badge: 'Meeting visibility',
      summary: 'Combine recap with clearer signals around conversation quality and participation.',
      logoText: 'Ra',
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
  <text x="160" y="580" font-family="Inter, Arial, sans-serif" font-size="22" font-weight="500" fill="#475569">Local media keeps the card trustworthy and consistent</text>
  <text x="160" y="614" font-family="Inter, Arial, sans-serif" font-size="22" font-weight="500" fill="#475569">without relying on fragile external preview sources.</text>

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

  console.log(`\nDone. Updated ${updatedCount} chat/meeting entries.`);
  await closePool();
}

main().catch(async (error) => {
  console.error('\nFailed to enrich chat/meeting wave 8:', error);
  await closePool();
  process.exit(1);
});
