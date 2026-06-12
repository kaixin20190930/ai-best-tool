/* eslint-disable no-console, no-restricted-syntax, no-continue, no-await-in-loop */
import fs from 'node:fs';
import path from 'node:path';

import { getPool } from '@/db/neon/client';

type LocalizedFeatureEntry = {
  label: string;
  value: string;
};

type TagSeed = {
  slug: string;
  en: string;
  zh: string;
};

type ToolSeed = {
  name: string;
  title: string;
  url: string;
  categorySlug: 'voice' | 'life-assistant';
  pricing: 'free' | 'freemium' | 'paid';
  tags: string[];
  content: {
    en: string;
    zh: string;
  };
  detail: {
    en: string;
    zh: string;
  };
  useCases: {
    en: string[];
    zh: string[];
  };
  features: {
    en: LocalizedFeatureEntry[];
    zh: LocalizedFeatureEntry[];
  };
  audience: {
    bestFit: {
      en: string[];
      zh: string[];
    };
    notIdealFor: {
      en: string[];
      zh: string[];
    };
  };
  editorialSummary: {
    en: string;
    zh: string;
  };
  trustNote: {
    en: string;
    zh: string;
  };
  media: {
    accent: string;
    accentSoft: string;
    accentStrong: string;
    surface: string;
    badge: string;
    summary: string;
    logoText: string;
  };
};

const ROOT = '/Users/liukai/web/ai-best-tool';
const COVER_DIR = path.join(ROOT, 'public/images/tool-media');
const LOGO_DIR = path.join(ROOT, 'public/icons/tool-logos');

const TAGS: TagSeed[] = [
  { slug: 'voice', en: 'Voice', zh: '语音' },
  { slug: 'speech-to-text', en: 'Speech to Text', zh: '语音转文字' },
  { slug: 'text-to-speech', en: 'Text to Speech', zh: '文字转语音' },
  { slug: 'voice-ai', en: 'Voice AI', zh: '语音 AI' },
  { slug: 'real-time-audio', en: 'Real-time Audio', zh: '实时音频' },
  { slug: 'scheduling', en: 'Scheduling', zh: '日程安排' },
  { slug: 'calendar-assistant', en: 'Calendar Assistant', zh: '日历助手' },
  { slug: 'meeting-productivity', en: 'Meeting Productivity', zh: '会议效率' },
  { slug: 'life-assistant', en: 'Life Assistant', zh: '生活助手' },
  { slug: 'productivity', en: 'Productivity', zh: '生产力' },
];

const TOOLS: ToolSeed[] = [
  {
    name: 'playht',
    title: 'PlayHT',
    url: 'https://play.ht',
    categorySlug: 'voice',
    pricing: 'freemium',
    tags: ['voice', 'voice-ai', 'text-to-speech'],
    content: {
      en: 'An AI voice platform for text-to-speech, synthetic voice generation, and production-ready narration workflows.',
      zh: '一个用于文字转语音、合成语音和成品级旁白工作流的 AI 语音平台。',
    },
    detail: {
      en: `PlayHT is most relevant when the question is not only “can this read text aloud?” but “can this produce audio that feels polished enough for product, content, or customer-facing use?” It sits in the voice category as a practical text-to-speech option for teams that need speed and quality at the same time.

In practice, PlayHT is worth shortlisting when voice output is part of the product experience or content workflow. The real comparison point is not generic AI output, but whether the voices, controls, and delivery workflow feel production-ready enough for repeat use.`,
      zh: `PlayHT 的价值，不只是“能不能把文字念出来”，而是“能不能产出足够像成品、可以用于内容、产品或客户场景的音频”。它在语音分类里，属于比较实用的文字转语音工具，适合既在意速度又在意成品感的团队。

在实战里，如果语音输出本身就是产品体验或内容工作流的一部分，PlayHT 很值得进入 shortlist。真正要比较的不是泛泛的 AI 生成能力，而是它的声音质量、控制能力，以及整条交付链路是否足够稳定。`,
    },
    useCases: {
      en: ['Narration workflows', 'Voice content production', 'Product voice experiences', 'Synthetic voice publishing'],
      zh: ['旁白工作流', '语音内容生产', '产品语音体验', '合成语音发布'],
    },
    features: {
      en: [
        { label: 'Core focus', value: 'Production-oriented text-to-speech and voice generation.' },
        { label: 'Best for', value: 'Teams turning text into polished audio assets.' },
        { label: 'Decision angle', value: 'Compare on output quality, voice control, and whether the workflow feels publishable.' },
      ],
      zh: [
        { label: '核心定位', value: '偏向成品交付的文字转语音与语音生成。' },
        { label: '更适合', value: '需要把文本变成可发布音频素材的团队。' },
        { label: '比较重点', value: '重点看成品质量、声音控制，以及整体工作流是否能直接交付。' },
      ],
    },
    audience: {
      bestFit: {
        en: ['Content teams', 'Product teams adding voice output', 'Creators publishing narrated media'],
        zh: ['内容团队', '需要语音输出的产品团队', '发布有声内容的创作者'],
      },
      notIdealFor: {
        en: ['Teams only needing raw transcription', 'Users who want a basic free reader without production controls'],
        zh: ['只需要原始转录的团队', '只想找基础免费朗读工具、无需成品控制的用户'],
      },
    },
    editorialSummary: {
      en: 'Reviewed as a production-facing text-to-speech option inside the voice category.',
      zh: '已按“面向成品交付的文字转语音工具”来复核。',
    },
    trustNote: {
      en: 'This listing emphasizes PlayHT where it matters most: usable voice output and delivery workflow, not just demo quality.',
      zh: '本条目强调 PlayHT 最关键的价值：可用的成品语音输出和交付流程，而不只是演示效果。',
    },
    media: {
      accent: '#2563eb',
      accentSoft: '#dbeafe',
      accentStrong: '#1d4ed8',
      surface: '#f7fbff',
      badge: 'TTS production',
      summary: 'Turn text into polished voice output for content and product use',
      logoText: 'PH',
    },
  },
  {
    name: 'cartesia',
    title: 'Cartesia',
    url: 'https://cartesia.ai',
    categorySlug: 'voice',
    pricing: 'freemium',
    tags: ['voice', 'voice-ai', 'real-time-audio'],
    content: {
      en: 'A real-time voice AI platform focused on low-latency speech generation and conversational audio experiences.',
      zh: '一个聚焦低延迟语音生成和实时对话音频体验的语音 AI 平台。',
    },
    detail: {
      en: `Cartesia is relevant when latency becomes part of the product decision. In the voice category, it belongs less to offline audio publishing and more to products that need fast back-and-forth speech behavior.

That makes it especially interesting for builders working on real-time assistants, voice interfaces, or live conversational systems. The key question is whether the speed and interaction quality are good enough for an experience that feels immediate instead of delayed.`,
      zh: `当“延迟”本身就是产品判断因素时，Cartesia 就很有相关性。它在语音分类里，不太像离线音频生产工具，更偏向那些需要快速来回语音交互的产品。

这让它特别适合做实时助手、语音界面或实时对话系统的开发者。真正要判断的是：它的速度和交互质量，能不能让体验足够即时，而不是有明显延迟感。`,
    },
    useCases: {
      en: ['Real-time voice assistants', 'Conversational products', 'Low-latency audio interfaces', 'Voice-native applications'],
      zh: ['实时语音助手', '对话型产品', '低延迟音频界面', '语音原生应用'],
    },
    features: {
      en: [
        { label: 'Core focus', value: 'Low-latency voice generation for interactive products.' },
        { label: 'Best for', value: 'Builders who care about real-time speech behavior, not just static output.' },
        { label: 'Decision angle', value: 'Compare on latency, conversational feel, and whether it fits live product experiences.' },
      ],
      zh: [
        { label: '核心定位', value: '用于交互式产品的低延迟语音生成。' },
        { label: '更适合', value: '在意实时语音交互，而不只是静态音频输出的开发者。' },
        { label: '比较重点', value: '重点看延迟、对话体验，以及它是否适合直播式产品场景。' },
      ],
    },
    audience: {
      bestFit: {
        en: ['Voice product builders', 'Teams shipping conversational agents', 'Developers optimizing real-time UX'],
        zh: ['语音产品开发者', '在做对话 Agent 的团队', '优化实时体验的开发者'],
      },
      notIdealFor: {
        en: ['Users only producing long-form narration', 'Teams that do not need live interaction'],
        zh: ['只做长篇旁白内容的用户', '不需要实时交互的团队'],
      },
    },
    editorialSummary: {
      en: 'Reviewed as a real-time voice infrastructure option rather than a generic audio tool.',
      zh: '已按“实时语音基础设施选项”而不是通用音频工具来复核。',
    },
    trustNote: {
      en: 'This listing focuses on Cartesia as a speed-sensitive voice layer for product builders.',
      zh: '本条目强调 Cartesia 作为面向产品构建者的低延迟语音层。',
    },
    media: {
      accent: '#7c3aed',
      accentSoft: '#ede9fe',
      accentStrong: '#6d28d9',
      surface: '#faf7ff',
      badge: 'Real-time voice',
      summary: 'Low-latency speech generation for live conversational products',
      logoText: 'Ca',
    },
  },
  {
    name: 'hume',
    title: 'Hume AI',
    url: 'https://www.hume.ai',
    categorySlug: 'voice',
    pricing: 'freemium',
    tags: ['voice', 'voice-ai', 'real-time-audio'],
    content: {
      en: 'A voice AI platform centered on expressive speech, emotional nuance, and more natural conversational output.',
      zh: '一个强调表达力、情绪细节和更自然对话输出的语音 AI 平台。',
    },
    detail: {
      en: `Hume AI becomes more interesting when “natural feel” matters as much as raw functionality. In the voice category, it stands out by pushing the conversation beyond plain synthetic audio into something more expressive and human-centered.

For teams building assistants, coaching tools, or voice experiences where tone matters, Hume is worth comparing carefully. The real question is whether the emotional and conversational layer creates a noticeably better experience for the user.`,
      zh: `当“自然感”本身和功能同样重要时，Hume AI 会更有吸引力。它在语音分类里比较特别的一点，是它试图把对话从“普通合成音频”推进到更有表达力、更贴近人的交互。

如果你在做助手、教练型工具，或者任何“语气和表达方式”很重要的语音体验，Hume 很值得认真比较。真正的问题是：情绪层和对话层，能不能给用户带来明显更好的体验。`,
    },
    useCases: {
      en: ['Expressive AI assistants', 'Voice coaching', 'Human-like conversational UX', 'Emotion-aware voice products'],
      zh: ['有表达力的 AI 助手', '语音教练', '更像人的对话体验', '带情绪感知的语音产品'],
    },
    features: {
      en: [
        { label: 'Core focus', value: 'Expressive, emotionally richer conversational voice.' },
        { label: 'Best for', value: 'Teams where voice tone and user comfort matter, not only speed.' },
        { label: 'Decision angle', value: 'Compare on conversational warmth, expressiveness, and whether the voice feels more human.' },
      ],
      zh: [
        { label: '核心定位', value: '更有表达力、更重情绪细节的对话语音。' },
        { label: '更适合', value: '在意语气和用户感受，而不只在意速度的团队。' },
        { label: '比较重点', value: '重点看对话自然度、表达力，以及声音是否更像人。' },
      ],
    },
    audience: {
      bestFit: {
        en: ['Conversation designers', 'Assistant builders', 'Teams focused on human-centered voice UX'],
        zh: ['对话设计者', '助手产品开发者', '重视人性化语音体验的团队'],
      },
      notIdealFor: {
        en: ['Users needing plain transcription only', 'Teams optimizing for cheapest possible audio layer'],
        zh: ['只需要纯转录的用户', '只追求最便宜音频层的团队'],
      },
    },
    editorialSummary: {
      en: 'Reviewed as a voice product choice where expressiveness matters as much as infrastructure.',
      zh: '已按“表达力与基础设施同样重要的语音产品选择”来复核。',
    },
    trustNote: {
      en: 'This listing emphasizes Hume where it is most distinctive: emotional nuance and conversational feel.',
      zh: '本条目强调 Hume 最有辨识度的点：情绪细节和对话自然感。',
    },
    media: {
      accent: '#ec4899',
      accentSoft: '#fce7f3',
      accentStrong: '#db2777',
      surface: '#fff8fc',
      badge: 'Expressive voice',
      summary: 'Natural-feeling conversational audio with richer tone and nuance',
      logoText: 'Hu',
    },
  },
  {
    name: 'speechify',
    title: 'Speechify',
    url: 'https://speechify.com',
    categorySlug: 'voice',
    pricing: 'freemium',
    tags: ['voice', 'text-to-speech', 'productivity'],
    content: {
      en: 'A text-to-speech product aimed at everyday reading, listening, and turning written content into audio quickly.',
      zh: '一个面向日常阅读和听读场景的文字转语音产品，适合快速把文本变成音频。',
    },
    detail: {
      en: `Speechify sits in the voice category with a more everyday and accessibility-oriented angle. Compared with developer-heavy voice tooling, it is easier to understand as a user-facing product for listening to written material rather than building voice systems.

Its relevance is strongest when the user wants to consume content faster or reduce reading friction. The main comparison point is less about infrastructure depth and more about whether the listening workflow becomes easy and repeatable enough to stick.`,
      zh: `Speechify 在语音分类里，走的是更日常、也更偏可访问性的路线。和面向开发者的语音基础设施工具相比，它更像一个直接给用户使用的产品，用来把文字内容更轻松地听完，而不是去构建语音系统。

它最相关的场景，是用户想更快消费内容、或降低阅读负担的时候。主要比较点，不在于基础设施深度，而在于听读工作流是否足够顺手，能不能变成可持续使用的习惯。`,
    },
    useCases: {
      en: ['Listen to articles', 'Reading support', 'Audio-first learning', 'Daily text consumption'],
      zh: ['听文章', '阅读辅助', '音频优先学习', '日常文本消费'],
    },
    features: {
      en: [
        { label: 'Core focus', value: 'Accessible listening workflows for written content.' },
        { label: 'Best for', value: 'Users who want to turn reading into a faster audio habit.' },
        { label: 'Decision angle', value: 'Compare on ease of use, listening comfort, and whether it helps people consume more content consistently.' },
      ],
      zh: [
        { label: '核心定位', value: '降低文字内容消费门槛的听读工作流。' },
        { label: '更适合', value: '想把阅读变成更高效听读习惯的用户。' },
        { label: '比较重点', value: '重点看易用性、听感，以及它能否帮助用户更稳定地消费内容。' },
      ],
    },
    audience: {
      bestFit: {
        en: ['Heavy readers', 'Students', 'Knowledge workers who prefer listening'],
        zh: ['重度阅读者', '学生', '偏好听读的知识工作者'],
      },
      notIdealFor: {
        en: ['Teams building custom voice infrastructure', 'Users evaluating real-time conversational AI stacks'],
        zh: ['要自建语音基础设施的团队', '在评估实时对话语音栈的用户'],
      },
    },
    editorialSummary: {
      en: 'Reviewed as a user-facing listening product rather than a developer voice platform.',
      zh: '已按“面向用户的听读产品”而不是开发者语音平台来复核。',
    },
    trustNote: {
      en: 'This listing frames Speechify around listening comfort and repeat usage, which is where its everyday value shows up.',
      zh: '本条目把 Speechify 放在“听感与持续使用”这个角度来看，这也是它最日常的价值所在。',
    },
    media: {
      accent: '#f97316',
      accentSoft: '#ffedd5',
      accentStrong: '#ea580c',
      surface: '#fff8f3',
      badge: 'Listening workflow',
      summary: 'Turn reading into a smoother, more repeatable audio habit',
      logoText: 'Sp',
    },
  },
  {
    name: 'motion',
    title: 'Motion',
    url: 'https://www.usemotion.com',
    categorySlug: 'life-assistant',
    pricing: 'paid',
    tags: ['life-assistant', 'scheduling', 'calendar-assistant', 'productivity'],
    content: {
      en: 'An AI scheduling and planning tool for organizing tasks, calendar blocks, and time-aware personal workflows.',
      zh: '一个用于任务安排、日历时间块管理和个人时间规划的 AI 日程工具。',
    },
    detail: {
      en: `Motion is useful when the problem is less “I need another to-do list” and more “my calendar and task load are fighting each other.” In the life assistant category, it belongs to tools that try to actively organize time, not just store tasks.

That makes it relevant for founders, operators, and busy individuals who want planning support that reacts to calendar reality. The main decision is whether automatic scheduling actually reduces mental load instead of becoming yet another layer to maintain.`,
      zh: `当问题不是“我还需要一个待办工具”，而是“我的任务和日历一直互相打架”时，Motion 就会比较有用。它在生活助手分类里，不是单纯存任务，而是试图主动帮你整理时间。

这让它对创业者、运营人员和时间非常碎片化的人更有意义。真正的判断点是：自动排程到底能不能减轻心智负担，而不是再多加一层需要维护的系统。`,
    },
    useCases: {
      en: ['Automatic scheduling', 'Task-to-calendar planning', 'Time-block management', 'Founder workload organization'],
      zh: ['自动排程', '任务到日历的规划', '时间块管理', '创业者工作负载整理'],
    },
    features: {
      en: [
        { label: 'Core focus', value: 'Actively scheduling tasks into real calendar time.' },
        { label: 'Best for', value: 'Users whose calendar pressure is as important as their task list.' },
        { label: 'Decision angle', value: 'Compare on planning relief, calendar fit, and whether auto-scheduling actually saves time.' },
      ],
      zh: [
        { label: '核心定位', value: '把任务主动安排进真实日历时间。' },
        { label: '更适合', value: '日历压力和任务压力同样重的用户。' },
        { label: '比较重点', value: '重点看它是否真的减轻规划压力，以及自动排程是否节省时间。' },
      ],
    },
    audience: {
      bestFit: {
        en: ['Founders', 'Operators', 'Busy knowledge workers'],
        zh: ['创业者', '运营人员', '忙碌的知识工作者'],
      },
      notIdealFor: {
        en: ['Users who only want a simple task tracker', 'People who dislike automated calendar changes'],
        zh: ['只想要简单任务清单的用户', '不喜欢自动改动日历的用户'],
      },
    },
    editorialSummary: {
      en: 'Reviewed as an active planning assistant rather than a passive task manager.',
      zh: '已按“主动规划助手”而不是被动任务管理器来复核。',
    },
    trustNote: {
      en: 'This listing emphasizes Motion where it should be judged: whether it reduces planning overhead in real calendars.',
      zh: '本条目重点放在 Motion 最该被判断的地方：它是否真的降低了真实日历中的规划负担。',
    },
    media: {
      accent: '#0ea5e9',
      accentSoft: '#e0f2fe',
      accentStrong: '#0369a1',
      surface: '#f5fbff',
      badge: 'AI scheduling',
      summary: 'Organize tasks into calendar time with less planning overhead',
      logoText: 'Mo',
    },
  },
  {
    name: 'reclaim',
    title: 'Reclaim AI',
    url: 'https://reclaim.ai',
    categorySlug: 'life-assistant',
    pricing: 'freemium',
    tags: ['life-assistant', 'scheduling', 'calendar-assistant', 'productivity'],
    content: {
      en: 'A calendar assistant for protecting focus time, balancing meetings, and making schedules more resilient.',
      zh: '一个用于保护专注时间、平衡会议并让日程更有弹性的日历助手。',
    },
    detail: {
      en: `Reclaim AI fits the life assistant category because it tackles a very practical problem: schedules that look full before real work even starts. Rather than acting like a generic productivity layer, it is more specifically about defending time and making calendars less fragile.

That gives it a different role from classic to-do tools. The important comparison point is whether it helps preserve focus, habits, and realistic planning once the week becomes crowded.`,
      zh: `Reclaim AI 很适合放在生活助手分类里，因为它解决的是一个非常现实的问题：日程还没开始工作，就已经被排满了。它不像通用生产力层，更像是在帮助用户守住时间，让日历没有那么脆弱。

这让它和传统待办工具的角色不太一样。最重要的比较点，是当一周越来越拥挤时，它是否还能帮用户保住专注时间、习惯时间和更现实的安排。`,
    },
    useCases: {
      en: ['Focus-time protection', 'Calendar balancing', 'Habit scheduling', 'Meeting-heavy workload management'],
      zh: ['保护专注时间', '日历平衡', '习惯安排', '高会议负载管理'],
    },
    features: {
      en: [
        { label: 'Core focus', value: 'Protecting focus and habit time inside crowded calendars.' },
        { label: 'Best for', value: 'Users who struggle to preserve real work time once meetings expand.' },
        { label: 'Decision angle', value: 'Compare on calendar resilience, focus protection, and whether schedules feel more realistic.' },
      ],
      zh: [
        { label: '核心定位', value: '在拥挤日历里保护专注时间和习惯时间。' },
        { label: '更适合', value: '会议一多就很难保住真正工作时间的用户。' },
        { label: '比较重点', value: '重点看它是否让日历更有韧性、更能保住专注时间，也更现实。' },
      ],
    },
    audience: {
      bestFit: {
        en: ['Managers', 'ICs in meeting-heavy teams', 'Users protecting deep work time'],
        zh: ['管理者', '会议很多的团队成员', '需要保护深度工作时间的用户'],
      },
      notIdealFor: {
        en: ['Users without calendar complexity', 'People who plan everything manually and prefer no automation'],
        zh: ['日历并不复杂的用户', '所有事情都手动安排且不喜欢自动化的人'],
      },
    },
    editorialSummary: {
      en: 'Reviewed as a calendar-defense layer for real work time, not just a scheduling add-on.',
      zh: '已按“保护真实工作时间的日历防御层”而不是普通排程附加功能来复核。',
    },
    trustNote: {
      en: 'This listing focuses on Reclaim AI as a tool for protecting time quality, which is where its value usually shows up.',
      zh: '本条目强调 Reclaim AI 在“保护时间质量”上的价值，这通常也是它最容易体现差异的地方。',
    },
    media: {
      accent: '#14b8a6',
      accentSoft: '#ccfbf1',
      accentStrong: '#0f766e',
      surface: '#f2fffc',
      badge: 'Calendar defense',
      summary: 'Protect focus time and keep overloaded schedules more realistic',
      logoText: 'Re',
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
    const value = trimmed
      .slice(eq + 1)
      .trim()
      .replace(/^['"]|['"]$/g, '');

    if (!process.env[key]) {
      process.env[key] = value;
    }
  }
}

function escapeXml(input: string) {
  return input
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;');
}

function mergeTags(existing: unknown, additions: string[]) {
  const existingTags = Array.isArray(existing) ? existing.filter((item): item is string => typeof item === 'string') : [];
  return Array.from(new Set([...existingTags, ...additions]));
}

function createLogoSvg(seed: ToolSeed) {
  const { media } = seed;
  return `<?xml version="1.0" encoding="UTF-8"?>
<svg width="256" height="256" viewBox="0 0 256 256" fill="none" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <linearGradient id="bg-${seed.name}" x1="28" y1="24" x2="226" y2="228" gradientUnits="userSpaceOnUse">
      <stop stop-color="${media.accentSoft}"/>
      <stop offset="1" stop-color="${media.accent}"/>
    </linearGradient>
  </defs>
  <rect width="256" height="256" rx="56" fill="url(#bg-${seed.name})"/>
  <rect x="24" y="24" width="208" height="208" rx="42" fill="rgba(255,255,255,0.78)"/>
  <rect x="48" y="48" width="160" height="160" rx="36" fill="${media.accentStrong}"/>
  <circle cx="74" cy="74" r="10" fill="rgba(255,255,255,0.28)"/>
  <circle cx="186" cy="182" r="12" fill="rgba(255,255,255,0.18)"/>
  <text x="128" y="144" text-anchor="middle" font-family="Inter, Arial, sans-serif" font-size="68" font-weight="800" fill="white">${escapeXml(media.logoText)}</text>
</svg>
`;
}

function createCoverSvg(seed: ToolSeed) {
  const { media } = seed;
  const categoryLabel = seed.categorySlug === 'voice' ? 'Voice' : 'Life Assistant';

  return `<?xml version="1.0" encoding="UTF-8"?>
<svg width="1400" height="800" viewBox="0 0 1400 800" fill="none" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <linearGradient id="canvas-${seed.name}" x1="64" y1="48" x2="1288" y2="748" gradientUnits="userSpaceOnUse">
      <stop stop-color="${media.surface}"/>
      <stop offset="1" stop-color="#ffffff"/>
    </linearGradient>
    <linearGradient id="panel-${seed.name}" x1="910" y1="148" x2="1248" y2="520" gradientUnits="userSpaceOnUse">
      <stop stop-color="${media.accentSoft}"/>
      <stop offset="1" stop-color="${media.accent}"/>
    </linearGradient>
  </defs>
  <rect width="1400" height="800" rx="44" fill="url(#canvas-${seed.name})"/>
  <circle cx="1238" cy="128" r="132" fill="${media.accentSoft}" fill-opacity="0.78"/>
  <circle cx="1140" cy="632" r="172" fill="${media.accentSoft}" fill-opacity="0.55"/>
  <rect x="64" y="64" width="1272" height="672" rx="34" fill="white" stroke="#e2e8f0" stroke-width="2"/>

  <rect x="118" y="126" width="236" height="44" rx="22" fill="${media.accentSoft}"/>
  <text x="236" y="154" text-anchor="middle" font-family="Inter, Arial, sans-serif" font-size="22" font-weight="700" fill="${media.accentStrong}">${escapeXml(categoryLabel)}</text>

  <text x="118" y="258" font-family="Inter, Arial, sans-serif" font-size="84" font-weight="800" fill="#0f172a">${escapeXml(seed.title)}</text>
  <text x="118" y="324" font-family="Inter, Arial, sans-serif" font-size="28" font-weight="600" fill="${media.accentStrong}">${escapeXml(media.badge)}</text>
  <text x="118" y="400" font-family="Inter, Arial, sans-serif" font-size="34" font-weight="500" fill="#475569">${escapeXml(media.summary)}</text>

  <rect x="118" y="468" width="508" height="164" rx="28" fill="${media.surface}" stroke="${media.accentSoft}" stroke-width="2"/>
  <text x="160" y="534" font-family="Inter, Arial, sans-serif" font-size="24" font-weight="700" fill="#0f172a">Published seed</text>
  <text x="160" y="582" font-family="Inter, Arial, sans-serif" font-size="22" font-weight="500" fill="#475569">Localized summary, fit signals,</text>
  <text x="160" y="616" font-family="Inter, Arial, sans-serif" font-size="22" font-weight="500" fill="#475569">and stable local media are ready.</text>

  <rect x="874" y="142" width="360" height="360" rx="42" fill="url(#panel-${seed.name})"/>
  <rect x="914" y="182" width="280" height="280" rx="34" fill="rgba(255,255,255,0.88)"/>
  <text x="1054" y="344" text-anchor="middle" font-family="Inter, Arial, sans-serif" font-size="108" font-weight="800" fill="${media.accentStrong}">${escapeXml(media.logoText)}</text>

  <rect x="874" y="546" width="360" height="86" rx="28" fill="${media.accentSoft}"/>
  <text x="1054" y="600" text-anchor="middle" font-family="Inter, Arial, sans-serif" font-size="28" font-weight="700" fill="${media.accentStrong}">Editorial media</text>
</svg>
`;
}

async function upsertTags() {
  const pool = getPool();
  await Promise.all(
    TAGS.map((tag) =>
      pool.query(
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
  const pool = getPool();
  const result = await pool.query('SELECT id, slug FROM categories');
  return new Map<string, string>(result.rows.map((row) => [String(row.slug), String(row.id)]));
}

async function upsertTool(seed: ToolSeed, categoryIdMap: Map<string, string>, reviewedAt: string) {
  const pool = getPool();
  const categoryId = categoryIdMap.get(seed.categorySlug);

  if (!categoryId) {
    throw new Error(`Missing category: ${seed.categorySlug}`);
  }

  const existingResult = await pool.query('SELECT tags, features FROM tools WHERE name = $1 LIMIT 1', [seed.name]);
  const existing = existingResult.rows[0];
  const existingTags = existing ? existing.tags : [];
  const existingFeatures =
    existing?.features && typeof existing.features === 'object' ? (existing.features as Record<string, unknown>) : {};
  const mediaReview =
    existingFeatures.mediaReview && typeof existingFeatures.mediaReview === 'object'
      ? (existingFeatures.mediaReview as Record<string, unknown>)
      : {};

  const features = {
    ...existingFeatures,
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
    mediaReview: {
      ...mediaReview,
      needed: false,
      reason: 'Locally hosted editorial media kit added for stable preview coverage.',
      resolvedAt: reviewedAt,
      source: 'local-editorial-media',
    },
  };

  await pool.query(
    `
      INSERT INTO tools (
        name, title, content, detail, url, image_url, thumbnail_url, category_id, tags, pricing, status, features, use_cases
      )
      VALUES ($1, $2::jsonb, $3::jsonb, $4::jsonb, $5, $6, $7, $8, $9::text[], $10, 'published', $11::jsonb, $12::jsonb)
      ON CONFLICT (name)
      DO UPDATE SET
        title = EXCLUDED.title,
        content = EXCLUDED.content,
        detail = EXCLUDED.detail,
        url = EXCLUDED.url,
        image_url = EXCLUDED.image_url,
        thumbnail_url = EXCLUDED.thumbnail_url,
        category_id = EXCLUDED.category_id,
        tags = EXCLUDED.tags,
        pricing = EXCLUDED.pricing,
        status = 'published',
        features = EXCLUDED.features,
        use_cases = EXCLUDED.use_cases,
        updated_at = NOW()
    `,
    [
      seed.name,
      JSON.stringify({ en: seed.title, zh: seed.title }),
      JSON.stringify(seed.content),
      JSON.stringify(seed.detail),
      new URL(seed.url).toString(),
      `/icons/tool-logos/${seed.name}.svg`,
      `/images/tool-media/${seed.name}-cover.svg`,
      categoryId,
      mergeTags(existingTags, seed.tags),
      seed.pricing,
      JSON.stringify(features),
      JSON.stringify(seed.useCases),
    ],
  );

  console.log(`- upserted ${seed.name}`);
}

async function main() {
  loadLocalEnv();
  fs.mkdirSync(COVER_DIR, { recursive: true });
  fs.mkdirSync(LOGO_DIR, { recursive: true });

  for (const seed of TOOLS) {
    fs.writeFileSync(path.join(COVER_DIR, `${seed.name}-cover.svg`), createCoverSvg(seed), 'utf8');
    fs.writeFileSync(path.join(LOGO_DIR, `${seed.name}.svg`), createLogoSvg(seed), 'utf8');
  }

  await upsertTags();
  const categoryIdMap = await getCategoryIdMap();
  const reviewedAt = new Date().toISOString();

  for (const seed of TOOLS) {
    await upsertTool(seed, categoryIdMap, reviewedAt);
  }

  const pool = getPool();
  const counts = await pool.query(`
    SELECT
      COUNT(*)::int AS total,
      COUNT(*) FILTER (WHERE status = 'published')::int AS published
    FROM tools
  `);

  console.log(
    JSON.stringify(
      {
        insertedNames: TOOLS.map((tool) => tool.name),
        summary: counts.rows[0],
      },
      null,
      2,
    ),
  );

  await pool.end();
}

main().catch((error) => {
  console.error('\nFailed to bootstrap voice/life wave 5:', error);
  process.exit(1);
});
