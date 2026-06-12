/* eslint-disable no-console */
import fs from 'node:fs';
import path from 'node:path';

import { closePool, query } from '@/db/neon/client';

const ROOT = '/Users/liukai/web/ai-best-tool';
const COVER_DIR = path.join(ROOT, 'public/images/tool-media');
const LOGO_DIR = path.join(ROOT, 'public/icons/tool-logos');

const SEED = {
  name: 'assemblyai',
  title: 'AssemblyAI',
  url: 'https://www.assemblyai.com',
  categorySlug: 'voice',
  pricing: 'freemium',
  tags: ['speech-to-text', 'transcription', 'voice-ai'],
  content: {
    en: 'A speech AI platform for transcription, summarization, audio understanding, and production-ready voice APIs.',
    zh: '一个面向转录、摘要、音频理解和生产级语音 API 的 Speech AI 平台。',
  },
  detail: {
    en: `AssemblyAI is most relevant when a team needs speech tooling that feels product-ready instead of merely experimental. It helps turn raw audio into structured outputs that can power summaries, call workflows, and voice-based product experiences.

The real decision is whether AssemblyAI improves audio understanding enough to justify becoming part of the stack. If the work involves transcription, speech summaries, or production voice features, it deserves a serious comparison.`,
    zh: `当团队需要的是“产品可用”的语音能力，而不只是实验性质的音频处理时，AssemblyAI 就会更有意义。它帮助把原始音频转成结构化输出，进一步支撑摘要、通话流程和语音驱动的产品体验。

这页真正要帮助用户判断的是：AssemblyAI 是否足够提升音频理解能力，值得进入你的技术栈。如果你的工作涉及转录、语音摘要或生产级语音功能，它值得被认真比较。`,
  },
  useCases: {
    en: ['Transcription APIs', 'Speech summaries', 'Call intelligence', 'Voice product workflows'],
    zh: ['转录 API', '语音摘要', '通话智能', '语音产品工作流'],
  },
  features: {
    en: [
      { label: 'Core focus', value: 'Turning real-world audio into structured product outputs through transcription and voice intelligence APIs.' },
      { label: 'Best for', value: 'Teams building transcription-heavy workflows, summaries, and audio-native product features.' },
      { label: 'Decision angle', value: 'Compare on transcription quality, voice workflow depth, and production readiness.' },
    ],
    zh: [
      { label: '核心定位', value: '通过转录和语音智能 API，把真实音频转成结构化产品输出。' },
      { label: '更适合', value: '构建重转录流程、语音摘要和音频原生产品功能的团队。' },
      { label: '比较重点', value: '重点比较转录质量、语音工作流深度和生产就绪度。' },
    ],
  },
  audience: {
    bestFit: {
      en: ['Voice product teams', 'Developers building audio workflows', 'Teams shipping speech summaries'],
      zh: ['语音产品团队', '构建音频工作流的开发者', '上线语音摘要能力的团队'],
    },
    notIdealFor: {
      en: ['Users only needing AI narration', 'Teams without recurring audio input'],
      zh: ['只需要 AI 配音的用户', '没有持续音频输入场景的团队'],
    },
  },
  editorialSummary: {
    en: 'Reviewed as a production-ready speech and transcription layer rather than a lightweight voice demo.',
    zh: '已按“生产级语音与转录层”而不是轻量语音 Demo 来复核。',
  },
  trustNote: {
    en: 'This listing keeps the comparison centered on production audio workflows, which is where AssemblyAI is most honestly judged.',
    zh: '本条目把比较重点放在生产级音频工作流上，这也是 AssemblyAI 最值得被诚实判断的地方。',
  },
  decision: {
    compareAxes: {
      en: ['Transcription quality', 'Voice workflow depth', 'Production readiness'],
      zh: ['转录质量', '语音工作流深度', '生产就绪度'],
    },
    officialSummary: {
      en: 'The official site frames the product well, but the deeper question is whether it reliably turns raw audio into useful downstream product signals.',
      zh: '官网能帮助理解定位，但更深层的问题是：它是否能稳定把原始音频转成对下游产品真正有用的信号。',
    },
    freshnessSummary: {
      en: 'Speech APIs evolve quickly with models and features, so exact coverage should always be checked live on the official site.',
      zh: '语音 API 会随着模型和功能快速变化，所以具体覆盖始终建议以官网实时状态为准。',
    },
    pricingSummary: {
      en: 'Pricing is easiest to justify when the platform reduces repeated manual review or support work around audio.',
      zh: '只有当平台持续减少围绕音频的人工复核或支持成本时，这类产品的价格才最容易成立。',
    },
    mediaSummary: {
      en: 'Preview coverage matters because teams need to judge whether the product feels like real audio infrastructure rather than a shallow feature layer.',
      zh: '这里的预览很重要，因为团队需要判断这个产品更像真实音频基础设施，而不是一层浅表功能。',
    },
    communitySummary: {
      en: 'The strongest signal comes from whether teams keep using it after the first integration, once audio becomes a repeated workflow.',
      zh: '最强的信号，来自团队在完成第一次接入后，是否还会在反复出现的音频工作流里继续使用它。',
    },
  },
  media: {
    category: 'Voice',
    accent: '#0f766e',
    accentSoft: '#ccfbf1',
    accentStrong: '#0f766e',
    surface: '#f4fffd',
    badge: 'Speech understanding APIs',
    summary: 'Build transcription, summaries, and audio intelligence workflows on top of a production-ready speech layer.',
    logoText: 'As',
  },
};

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

function createLogoSvg() {
  const { accent, accentSoft, accentStrong, logoText } = SEED.media;
  return `<?xml version="1.0" encoding="UTF-8"?>
<svg width="256" height="256" viewBox="0 0 256 256" fill="none" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <linearGradient id="bg-${SEED.name}" x1="24" y1="24" x2="224" y2="228" gradientUnits="userSpaceOnUse">
      <stop stop-color="${accentSoft}"/>
      <stop offset="1" stop-color="${accent}"/>
    </linearGradient>
  </defs>
  <rect width="256" height="256" rx="56" fill="url(#bg-${SEED.name})"/>
  <rect x="24" y="24" width="208" height="208" rx="42" fill="rgba(255,255,255,0.84)"/>
  <rect x="46" y="46" width="164" height="164" rx="38" fill="${accentStrong}"/>
  <circle cx="78" cy="78" r="10" fill="rgba(255,255,255,0.24)"/>
  <circle cx="180" cy="182" r="12" fill="rgba(255,255,255,0.18)"/>
  <text x="128" y="146" text-anchor="middle" font-family="Inter, Arial, sans-serif" font-size="66" font-weight="800" fill="white">${escapeXml(logoText)}</text>
</svg>
`;
}

function createCoverSvg() {
  const { category, accent, accentSoft, accentStrong, surface, badge, summary, logoText } = SEED.media;
  return `<?xml version="1.0" encoding="UTF-8"?>
<svg width="1400" height="800" viewBox="0 0 1400 800" fill="none" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <linearGradient id="canvas-${SEED.name}" x1="80" y1="56" x2="1286" y2="748" gradientUnits="userSpaceOnUse">
      <stop stop-color="${surface}"/>
      <stop offset="1" stop-color="#ffffff"/>
    </linearGradient>
    <linearGradient id="panel-${SEED.name}" x1="886" y1="148" x2="1238" y2="512" gradientUnits="userSpaceOnUse">
      <stop stop-color="${accentSoft}"/>
      <stop offset="1" stop-color="${accent}"/>
    </linearGradient>
  </defs>
  <rect width="1400" height="800" rx="44" fill="url(#canvas-${SEED.name})"/>
  <circle cx="1246" cy="122" r="132" fill="${accentSoft}" fill-opacity="0.78"/>
  <circle cx="1134" cy="640" r="176" fill="${accentSoft}" fill-opacity="0.52"/>
  <rect x="64" y="64" width="1272" height="672" rx="34" fill="white" stroke="#e2e8f0" stroke-width="2"/>

  <rect x="118" y="126" width="236" height="46" rx="23" fill="${accentSoft}"/>
  <text x="236" y="155" text-anchor="middle" font-family="Inter, Arial, sans-serif" font-size="22" font-weight="700" fill="${accentStrong}">${escapeXml(category)}</text>

  <text x="118" y="252" font-family="Inter, Arial, sans-serif" font-size="82" font-weight="800" fill="#0f172a">${escapeXml(SEED.title)}</text>
  <text x="118" y="320" font-family="Inter, Arial, sans-serif" font-size="28" font-weight="600" fill="${accentStrong}">${escapeXml(badge)}</text>
  <text x="118" y="394" font-family="Inter, Arial, sans-serif" font-size="34" font-weight="500" fill="#475569">${escapeXml(summary)}</text>

  <rect x="118" y="470" width="548" height="176" rx="30" fill="${surface}" stroke="${accentSoft}" stroke-width="2"/>
  <text x="160" y="532" font-family="Inter, Arial, sans-serif" font-size="24" font-weight="700" fill="#0f172a">Stable editorial preview</text>
  <text x="160" y="580" font-family="Inter, Arial, sans-serif" font-size="22" font-weight="500" fill="#475569">Local media keeps this page stable across deploys</text>
  <text x="160" y="614" font-family="Inter, Arial, sans-serif" font-size="22" font-weight="500" fill="#475569">and removes reliance on flaky external preview sources.</text>

  <rect x="874" y="142" width="360" height="360" rx="42" fill="url(#panel-${SEED.name})"/>
  <rect x="914" y="182" width="280" height="280" rx="34" fill="rgba(255,255,255,0.9)"/>
  <text x="1054" y="344" text-anchor="middle" font-family="Inter, Arial, sans-serif" font-size="108" font-weight="800" fill="${accentStrong}">${escapeXml(logoText)}</text>

  <rect x="874" y="548" width="360" height="86" rx="28" fill="${accentSoft}"/>
  <text x="1054" y="602" text-anchor="middle" font-family="Inter, Arial, sans-serif" font-size="28" font-weight="700" fill="${accentStrong}">Editorial media ready</text>
</svg>
`;
}

async function getCategoryIdMap() {
  const result = await query('SELECT id, slug FROM categories');
  return new Map<string, string>(result.rows.map((row) => [String(row.slug), String(row.id)]));
}

async function applySeed(categoryIdMap: Map<string, string>, reviewedAt: string) {
  const categoryId = categoryIdMap.get(SEED.categorySlug);
  if (!categoryId) {
    throw new Error(`Missing category: ${SEED.categorySlug}`);
  }

  await query(
    `
      INSERT INTO tags (name, slug)
      VALUES ($1::jsonb, 'speech-to-text'), ($2::jsonb, 'transcription'), ($3::jsonb, 'voice-ai')
      ON CONFLICT (slug)
      DO UPDATE SET name = EXCLUDED.name
    `,
    [
      JSON.stringify({ en: 'Speech to Text', zh: '语音转文字' }),
      JSON.stringify({ en: 'Transcription', zh: '转录' }),
      JSON.stringify({ en: 'Voice AI', zh: '语音 AI' }),
    ],
  );

  const result = await query('SELECT id, tags, features FROM tools WHERE name = $1 LIMIT 1', [SEED.name]);
  if (result.rowCount === 0) {
    throw new Error('assemblyai not found in tools table');
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
      en: SEED.features.en,
      zh: SEED.features.zh,
    },
    audience: SEED.audience,
    editorial: {
      reviewedAt,
      reviewedBy: 'AI Best Tool Editorial',
      summary: SEED.editorialSummary,
      trustNote: SEED.trustNote,
    },
    decision: {
      ...existingDecision,
      compareAxes: SEED.decision.compareAxes,
      officialSummary: SEED.decision.officialSummary,
      freshnessSummary: SEED.decision.freshnessSummary,
      pricingSummary: SEED.decision.pricingSummary,
      mediaSummary: SEED.decision.mediaSummary,
      communitySummary: SEED.decision.communitySummary,
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
      JSON.stringify({ en: SEED.title, zh: SEED.title }),
      JSON.stringify(SEED.content),
      JSON.stringify(SEED.detail),
      new URL(SEED.url).toString(),
      `/icons/tool-logos/${SEED.name}.svg`,
      `/images/tool-media/${SEED.name}-cover.svg`,
      categoryId,
      mergeTags(row.tags, SEED.tags),
      SEED.pricing,
      JSON.stringify(nextFeatures),
      JSON.stringify(SEED.useCases),
    ],
  );
}

async function main() {
  loadLocalEnv();
  fs.mkdirSync(COVER_DIR, { recursive: true });
  fs.mkdirSync(LOGO_DIR, { recursive: true });

  fs.writeFileSync(path.join(LOGO_DIR, `${SEED.name}.svg`), createLogoSvg(), 'utf8');
  fs.writeFileSync(path.join(COVER_DIR, `${SEED.name}-cover.svg`), createCoverSvg(), 'utf8');

  const categoryIdMap = await getCategoryIdMap();
  const reviewedAt = new Date().toISOString();
  await applySeed(categoryIdMap, reviewedAt);

  console.log('Done. Updated assemblyai voice entry.');
  await closePool();
}

main().catch(async (error) => {
  console.error('\nFailed to enrich voice wave 14:', error);
  await closePool();
  process.exit(1);
});
