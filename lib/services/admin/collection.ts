import { getPool } from '@/db/neon/client';

const collectionSchemaSql = `
CREATE TABLE IF NOT EXISTS collection_sources (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(160) NOT NULL,
  url VARCHAR(1000) NOT NULL,
  source_type VARCHAR(40) NOT NULL DEFAULT 'html',
  frequency VARCHAR(40) NOT NULL DEFAULT 'daily',
  enabled BOOLEAN NOT NULL DEFAULT TRUE,
  notes TEXT,
  last_run_at TIMESTAMP WITH TIME ZONE,
  next_run_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  CONSTRAINT collection_sources_type_check
    CHECK (source_type IN ('rss', 'html', 'api', 'manual')),
  CONSTRAINT collection_sources_frequency_check
    CHECK (frequency IN ('manual', 'daily', 'weekly'))
);

CREATE UNIQUE INDEX IF NOT EXISTS idx_collection_sources_url
  ON collection_sources(url);

CREATE INDEX IF NOT EXISTS idx_collection_sources_enabled_next_run
  ON collection_sources(enabled, next_run_at);

CREATE TABLE IF NOT EXISTS collection_runs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  source_id UUID REFERENCES collection_sources(id) ON DELETE SET NULL,
  status VARCHAR(40) NOT NULL DEFAULT 'queued',
  trigger_type VARCHAR(40) NOT NULL DEFAULT 'manual',
  started_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  finished_at TIMESTAMP WITH TIME ZONE,
  found_count INTEGER NOT NULL DEFAULT 0,
  imported_count INTEGER NOT NULL DEFAULT 0,
  skipped_count INTEGER NOT NULL DEFAULT 0,
  error_message TEXT,
  metadata JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  CONSTRAINT collection_runs_status_check
    CHECK (status IN ('queued', 'running', 'completed', 'failed')),
  CONSTRAINT collection_runs_trigger_check
    CHECK (trigger_type IN ('manual', 'scheduled'))
);

CREATE INDEX IF NOT EXISTS idx_collection_runs_source_created
  ON collection_runs(source_id, created_at DESC);

CREATE INDEX IF NOT EXISTS idx_collection_runs_status
  ON collection_runs(status);

CREATE TABLE IF NOT EXISTS collection_candidates (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  source_id UUID REFERENCES collection_sources(id) ON DELETE SET NULL,
  run_id UUID REFERENCES collection_runs(id) ON DELETE SET NULL,
  tool_id UUID REFERENCES tools(id) ON DELETE SET NULL,
  url VARCHAR(1000) NOT NULL,
  normalized_url VARCHAR(1000) NOT NULL,
  title TEXT,
  summary TEXT,
  raw_payload JSONB DEFAULT '{}'::jsonb,
  relevance_score INTEGER NOT NULL DEFAULT 50,
  quality_score INTEGER NOT NULL DEFAULT 50,
  score_reason TEXT,
  status VARCHAR(40) NOT NULL DEFAULT 'new',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  CONSTRAINT collection_candidates_status_check
    CHECK (status IN ('new', 'imported', 'skipped', 'rejected'))
);

ALTER TABLE collection_candidates
  ADD COLUMN IF NOT EXISTS relevance_score INTEGER NOT NULL DEFAULT 50,
  ADD COLUMN IF NOT EXISTS quality_score INTEGER NOT NULL DEFAULT 50,
  ADD COLUMN IF NOT EXISTS score_reason TEXT;

CREATE UNIQUE INDEX IF NOT EXISTS idx_collection_candidates_normalized_url
  ON collection_candidates(normalized_url);

CREATE INDEX IF NOT EXISTS idx_collection_candidates_status_created
  ON collection_candidates(status, created_at DESC);

CREATE INDEX IF NOT EXISTS idx_collection_candidates_status_scores
  ON collection_candidates(status, relevance_score DESC, quality_score DESC, created_at DESC);

ALTER TABLE collection_sources ENABLE ROW LEVEL SECURITY;
ALTER TABLE collection_runs ENABLE ROW LEVEL SECURITY;
ALTER TABLE collection_candidates ENABLE ROW LEVEL SECURITY;
`;

let schemaReady = false;
let schemaReadyPromise: Promise<void> | null = null;

export type CollectionSourceType = 'rss' | 'html' | 'api' | 'manual';
export type CollectionFrequency = 'manual' | 'daily' | 'weekly';

export interface CollectionSource {
  id: string;
  name: string;
  url: string;
  source_type: CollectionSourceType;
  frequency: CollectionFrequency;
  enabled: boolean;
  notes: string | null;
  last_run_at: Date | null;
  next_run_at: Date | null;
  created_at: Date;
  updated_at: Date;
}

export interface CollectionRun {
  id: string;
  source_id: string | null;
  source_name: string | null;
  status: 'queued' | 'running' | 'completed' | 'failed';
  trigger_type: 'manual' | 'scheduled';
  started_at: Date | null;
  finished_at: Date | null;
  found_count: number;
  imported_count: number;
  skipped_count: number;
  error_message: string | null;
  metadata: Record<string, unknown>;
  created_at: Date;
}

export type CollectionRunTrigger = 'manual' | 'scheduled';

export interface CollectionCandidate {
  id: string;
  source_id: string | null;
  source_name: string | null;
  run_id: string | null;
  tool_id: string | null;
  url: string;
  normalized_url: string;
  title: string | null;
  summary: string | null;
  raw_payload: Record<string, unknown>;
  relevance_score: number;
  quality_score: number;
  score_reason: string | null;
  status: 'new' | 'imported' | 'skipped' | 'rejected';
  created_at: Date;
  updated_at: Date;
}

export type CollectionCandidateStatus = CollectionCandidate['status'];
export type CollectionCandidateScoreFilter = 'all' | 'promising' | 'low';

interface ScrapedCandidate {
  url: string;
  title: string;
  summary?: string;
  rawPayload?: Record<string, unknown>;
}

interface CandidateDetailMetadata {
  canonicalUrl?: string;
  title?: string;
  description?: string;
  imageUrl?: string;
  externalUrl?: string;
}

interface CandidateScore {
  relevanceScore: number;
  qualityScore: number;
  reason: string;
}

interface CandidateEnrichmentResult {
  checkedCount: number;
  enrichedCount: number;
}

interface DraftClassification {
  categorySlug: string;
  tags: string[];
  pricing: 'free' | 'freemium' | 'paid';
  useCases: string[];
}

export function normalizeCollectionUrl(url: string): string {
  const trimmed = url.trim();
  const withProtocol = /^https?:\/\//i.test(trimmed) ? trimmed : `https://${trimmed}`;
  const parsed = new URL(withProtocol);

  parsed.hash = '';
  return parsed.toString();
}

function stripHtml(value: string): string {
  return value
    .replace(/<script[\s\S]*?<\/script>/gi, ' ')
    .replace(/<style[\s\S]*?<\/style>/gi, ' ')
    .replace(/<[^>]+>/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

function decodeHtmlEntities(value: string): string {
  const entities: Record<string, string> = {
    amp: '&',
    lt: '<',
    gt: '>',
    quot: '"',
    apos: "'",
    nbsp: ' ',
  };

  return value.replace(/&(#x?[0-9a-f]+|[a-z]+);/gi, (match, entity: string) => {
    if (entity[0] === '#') {
      const isHex = entity[1]?.toLowerCase() === 'x';
      const codePoint = Number.parseInt(entity.slice(isHex ? 2 : 1), isHex ? 16 : 10);
      return Number.isFinite(codePoint) ? String.fromCodePoint(codePoint) : match;
    }

    return entities[entity.toLowerCase()] || match;
  });
}

function cleanText(value: string): string {
  return decodeHtmlEntities(stripHtml(value)).replace(/\s+/g, ' ').trim();
}

function getStringValue(value: unknown): string | undefined {
  return typeof value === 'string' && value.trim() ? value.trim() : undefined;
}

function getStoredDetailMetadata(
  rawPayload: Record<string, unknown> | null | undefined
): CandidateDetailMetadata {
  const detailMetadata = rawPayload?.detailMetadata;

  if (!detailMetadata || typeof detailMetadata !== 'object') {
    return {};
  }

  const metadata = detailMetadata as Record<string, unknown>;

  return {
    canonicalUrl: getStringValue(metadata.canonicalUrl),
    title: getStringValue(metadata.title),
    description: getStringValue(metadata.description),
    imageUrl: getStringValue(metadata.imageUrl),
    externalUrl: getStringValue(metadata.externalUrl),
  };
}

function getStoredProductHuntRedirectUrl(
  rawPayload: Record<string, unknown> | null | undefined
): string | undefined {
  return getStringValue(rawPayload?.productHuntRedirectUrl);
}

function buildCandidateText(input: {
  title?: string | null;
  summary?: string | null;
  url?: string | null;
  rawPayload?: Record<string, unknown> | null;
}) {
  return [input.title, input.summary, input.url, JSON.stringify(input.rawPayload || {})]
    .filter(Boolean)
    .join(' ')
    .toLowerCase();
}

function clampScore(value: number): number {
  return Math.max(0, Math.min(100, Math.round(value)));
}

function uniqueMatches(text: string, terms: string[]): string[] {
  return terms.filter((term) => {
    const escaped = term.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    return new RegExp(`(^|[^a-z0-9])${escaped}([^a-z0-9]|$)`, 'i').test(text);
  });
}

export function scoreCollectionCandidate(input: {
  title?: string | null;
  summary?: string | null;
  url: string;
  rawPayload?: Record<string, unknown> | null;
}): CandidateScore {
  const text = buildCandidateText(input);
  const host = (() => {
    try {
      return new URL(input.url).hostname.replace(/^www\./, '');
    } catch {
      return '';
    }
  })();

  const strongAiTerms = [
    'ai',
    'artificial intelligence',
    'llm',
    'gpt',
    'generative',
    'agent',
    'copilot',
    'chatbot',
    'prompt',
    'model',
    'machine learning',
    'text to speech',
    'image generation',
    'video generation',
  ];
  const workflowTerms = [
    'automation',
    'workflow',
    'assistant',
    'summarizer',
    'transcription',
    'voice',
    'search',
    'analytics',
    'code',
    'developer',
    'data',
    'marketing',
    'design',
    'productivity',
  ];
  const noiseTerms = [
    'wallpaper',
    'theme',
    'game',
    'dating',
    'recipe',
    'fitness',
    'crypto',
    'weather',
    'music album',
    'merch',
    'ecommerce store',
    'travel guide',
  ];
  const aiMatches = uniqueMatches(text, strongAiTerms);
  const workflowMatches = uniqueMatches(text, workflowTerms);
  const noiseMatches = uniqueMatches(text, noiseTerms);

  let relevanceScore = 35 + aiMatches.length * 12 + workflowMatches.length * 5;

  if (/producthunt\.com|theresanaiforthat|futurepedia|aitools|toolify/i.test(host)) {
    relevanceScore += 8;
  }

  if (noiseMatches.length > 0) {
    relevanceScore -= noiseMatches.length * 12;
  }

  let qualityScore = 45;
  const title = input.title?.trim() || '';
  const summary = input.summary?.trim() || '';

  if (title.length >= 4 && title.length <= 90) {
    qualityScore += 14;
  } else if (title.length > 0) {
    qualityScore += 6;
  } else {
    qualityScore -= 15;
  }

  if (summary.length >= 40) {
    qualityScore += 18;
  } else if (summary.length > 0) {
    qualityScore += 8;
  } else {
    qualityScore -= 10;
  }

  if (/^https?:\/\//i.test(input.url)) {
    qualityScore += 8;
  }

  if (host && !/producthunt\.com|reddit\.com|x\.com|twitter\.com|linkedin\.com/i.test(host)) {
    qualityScore += 6;
  }

  if (/untitled|coming soon|homepage|website/i.test(title)) {
    qualityScore -= 12;
  }

  const signalReason = aiMatches.length
    ? `AI signals: ${aiMatches.slice(0, 4).join(', ')}`
    : 'AI signals: weak';
  const workflowReason = workflowMatches.length
    ? `workflow signals: ${workflowMatches.slice(0, 3).join(', ')}`
    : 'workflow signals: none';
  const noiseReason = noiseMatches.length
    ? `noise: ${noiseMatches.slice(0, 3).join(', ')}`
    : 'noise: none';
  const qualityReason = summary ? 'has summary' : 'missing summary';

  return {
    relevanceScore: clampScore(relevanceScore),
    qualityScore: clampScore(qualityScore),
    reason: `${signalReason}; ${workflowReason}; ${noiseReason}; ${qualityReason}.`,
  };
}

function inferDraftClassification(input: {
  title?: string | null;
  summary?: string | null;
  url?: string | null;
  rawPayload?: Record<string, unknown> | null;
}): DraftClassification {
  const text = buildCandidateText(input);
  const tags = new Set<string>(['ai-tool']);
  const useCases = new Set<string>();
  let categorySlug = 'other';

  const addTag = (tag: string) => tags.add(tag);
  const addUseCase = (useCase: string) => useCases.add(useCase);

  if (/(chatbot|chat bot|support|customer|docs|knowledge base)/i.test(text)) {
    categorySlug = 'chatbot';
    addTag('chatbot');
    addTag('ai-agent');
    addUseCase('Customer support and conversational automation');
  }

  if (/(write|writing|copy|content|blog|article|email|caption|seo|long form|co-write)/i.test(text)) {
    categorySlug = 'text-writing';
    addTag('writing');
    addTag('content-generation');
    addUseCase('Drafting, editing, or improving written content');
  }

  if (/(design|image|video|photo|screen recorder|graphics|creative|canvas|art|visual)/i.test(text)) {
    categorySlug = 'design-art';
    addTag('creative');
    addTag(/video/i.test(text) ? 'video' : 'design');
    addUseCase('Creating or editing visual assets');
  }

  if (/(productivity|workflow|automation|dashboard|analytics|product teams?|calendar|task|search|local|mac|recordings|metadata|developer|code|coding|cli)/i.test(text)) {
    categorySlug = 'productivity';
    addTag('productivity');
    addUseCase('Improving daily workflows and team productivity');
  }

  if (/(life|personal|companion|language|learning|vocab|fitness|habit)/i.test(text)) {
    categorySlug = categorySlug === 'other' ? 'life-assistant' : categorySlug;
    addTag('personal-assistant');
    addUseCase('Personal assistance and everyday learning');
  }

  if (/(free|open-source|open source|github)/i.test(text)) {
    addTag('open-source');
  }

  if (/(agent|agents)/i.test(text)) {
    addTag('agents');
  }

  if (/(search|retrieval|knowledge)/i.test(text)) {
    addTag('search');
  }

  if (/(voice|audio|speech|transcription|text-to-speech|text to speech)/i.test(text)) {
    addTag('audio');
  }

  if (/(marketing|landing|ads|sales)/i.test(text)) {
    addTag('marketing');
  }

  return {
    categorySlug,
    tags: Array.from(tags).slice(0, 6),
    pricing: 'freemium',
    useCases: Array.from(useCases).slice(0, 4),
  };
}

async function getCategoryIdBySlug(slug: string): Promise<string | null> {
  const pool = getPool();
  const result = await pool.query('SELECT id FROM categories WHERE slug = $1 LIMIT 1', [
    slug,
  ]);

  return result.rows[0]?.id || null;
}

function buildDraftDetail(input: {
  summary: string;
  classification: DraftClassification;
  officialUrl: string;
  sourceUrl: string;
  sourceName?: string | null;
  score: CandidateScore;
}) {
  const useCases = input.classification.useCases.length
    ? input.classification.useCases
    : ['Review the product and refine positioning before publishing'];

  return [
    input.summary,
    '',
    'Suggested use cases:',
    ...useCases.map((useCase) => `- ${useCase}`),
    '',
    `Suggested category: ${input.classification.categorySlug}`,
    `Suggested tags: ${input.classification.tags.join(', ')}`,
    `Collection score: AI ${input.score.relevanceScore}/100, quality ${input.score.qualityScore}/100`,
    `Score reason: ${input.score.reason}`,
    '',
    `Official URL: ${input.officialUrl}`,
    `Source URL: ${input.sourceUrl}`,
    input.sourceName ? `Source name: ${input.sourceName}` : '',
  ]
    .filter(Boolean)
    .join('\n');
}

function getAttributeValue(tag: string, attribute: string): string {
  const match = tag.match(new RegExp(`${attribute}=["']([^"']+)["']`, 'i'));
  return match ? decodeHtmlEntities(match[1].trim()) : '';
}

function getMetaContent(html: string, key: string): string {
  const escapedKey = key.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  const propertyMatch = html.match(
    new RegExp(`<meta\\b[^>]*(?:property|name)=["']${escapedKey}["'][^>]*>`, 'i')
  );
  const content = propertyMatch ? getAttributeValue(propertyMatch[0], 'content') : '';

  if (content) {
    return cleanText(content);
  }

  const reversedMatch = html.match(
    new RegExp(`<meta\\b[^>]*content=["'][^"']+["'][^>]*(?:property|name)=["']${escapedKey}["'][^>]*>`, 'i')
  );

  return reversedMatch ? cleanText(getAttributeValue(reversedMatch[0], 'content')) : '';
}

function getHtmlTitle(html: string): string {
  const match = html.match(/<title[^>]*>([\s\S]*?)<\/title>/i);
  return match ? cleanText(match[1]) : '';
}

function getCanonicalUrl(html: string, pageUrl: string): string | undefined {
  const match = html.match(/<link\b[^>]*rel=["'][^"']*canonical[^"']*["'][^>]*>/i);
  const href = match ? getAttributeValue(match[0], 'href') : '';
  return href ? toAbsoluteUrl(href, pageUrl) || undefined : undefined;
}

function getOgImageUrl(html: string, pageUrl: string): string | undefined {
  const image = getMetaContent(html, 'og:image') || getMetaContent(html, 'twitter:image');
  return image ? toAbsoluteUrl(image, pageUrl) || undefined : undefined;
}

function extractLikelyExternalUrl(html: string, pageUrl: string): string | undefined {
  const page = new URL(pageUrl);
  const anchors = Array.from(html.matchAll(/<a\b[^>]*href=["']([^"']+)["'][^>]*>([\s\S]*?)<\/a>/gi));
  const preferredText = /(visit|website|official|launch|open|try|go to|learn more|get started)/i;
  let firstExternal: string | undefined;

  for (const match of anchors) {
    const url = toAbsoluteUrl(match[1], pageUrl);

    if (!url) {
      continue;
    }

    const parsed = new URL(url);

    if (parsed.hostname === page.hostname || !isUsefulCandidateUrl(url, pageUrl)) {
      continue;
    }

    const label = cleanText(match[2]);

    if (preferredText.test(label)) {
      return url;
    }

    firstExternal ||= url;
  }

  return firstExternal;
}

async function fetchCandidateDetailMetadata(url: string): Promise<CandidateDetailMetadata> {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 15000);

  try {
    const response = await fetch(url, {
      headers: {
        accept: 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
        'user-agent':
          'AI Best Tool Collector/1.0 (+https://ai-best-tool.local; editorial discovery bot)',
      },
      signal: controller.signal,
    });

    if (!response.ok) {
      return {};
    }

    const html = await response.text();
    const canonicalUrl = getCanonicalUrl(html, url);
    const title =
      getMetaContent(html, 'og:title') ||
      getMetaContent(html, 'twitter:title') ||
      getHtmlTitle(html);
    const description =
      getMetaContent(html, 'og:description') ||
      getMetaContent(html, 'twitter:description') ||
      getMetaContent(html, 'description');

    return {
      canonicalUrl,
      title: title || undefined,
      description: description || undefined,
      imageUrl: getOgImageUrl(html, url),
      externalUrl: extractLikelyExternalUrl(html, url),
    };
  } catch {
    return {};
  } finally {
    clearTimeout(timeout);
  }
}

function slugify(value: string): string {
  return value
    .trim()
    .toLowerCase()
    .replace(/^https?:\/\//, '')
    .replace(/^www\./, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 80);
}

async function createUniqueToolSlug(base: string): Promise<string> {
  const pool = getPool();
  const normalizedBase = slugify(base) || 'ai-tool';
  let candidate = normalizedBase;
  let suffix = 2;

  while (true) {
    const existing = await pool.query('SELECT 1 FROM tools WHERE name = $1 LIMIT 1', [
      candidate,
    ]);

    if (existing.rows.length === 0) {
      return candidate;
    }

    candidate = `${normalizedBase}-${suffix}`;
    suffix += 1;
  }
}

function getXmlTag(block: string, tag: string): string {
  const match = block.match(new RegExp(`<${tag}[^>]*>([\\s\\S]*?)<\\/${tag}>`, 'i'));
  return match ? cleanText(match[1]) : '';
}

function getXmlTagRaw(block: string, tag: string): string {
  const match = block.match(new RegExp(`<${tag}[^>]*>([\\s\\S]*?)<\\/${tag}>`, 'i'));
  return match ? decodeHtmlEntities(match[1]).trim() : '';
}

function getXmlLink(block: string): string {
  const href = block.match(/<link[^>]+href=["']([^"']+)["'][^>]*>/i);
  if (href?.[1]) {
    return decodeHtmlEntities(href[1].trim());
  }

  return getXmlTag(block, 'link');
}

function getProductHuntRedirectUrl(block: string, sourceUrl: string): string | undefined {
  const content = getXmlTagRaw(block, 'content') || getXmlTagRaw(block, 'content:encoded');
  const anchors = Array.from(content.matchAll(/<a\b[^>]*href=["']([^"']+)["'][^>]*>([\s\S]*?)<\/a>/gi));

  for (const match of anchors) {
    const label = cleanText(match[2]);
    const url = toAbsoluteUrl(match[1], sourceUrl);

    if (label.toLowerCase() === 'link' && url) {
      return url;
    }
  }

  return undefined;
}

function getRssSummary(block: string): string {
  const rawContent =
    getXmlTagRaw(block, 'description') ||
    getXmlTagRaw(block, 'summary') ||
    getXmlTagRaw(block, 'content:encoded') ||
    getXmlTagRaw(block, 'content');
  const summary = cleanText(rawContent)
    .replace(/\s*Discussion\s*\|\s*Link\s*$/i, '')
    .replace(/\s*Discussion\s*$/i, '')
    .trim();

  return summary.slice(0, 500);
}

function toAbsoluteUrl(url: string, baseUrl: string): string | null {
  try {
    if (!url || url.startsWith('mailto:') || url.startsWith('tel:') || url.startsWith('#')) {
      return null;
    }

    return normalizeCollectionUrl(new URL(decodeHtmlEntities(url), baseUrl).toString());
  } catch {
    return null;
  }
}

function isUsefulCandidateUrl(url: string, sourceUrl: string): boolean {
  const parsed = new URL(url);
  const source = new URL(sourceUrl);
  const path = parsed.pathname.toLowerCase();
  const blockedPathParts = [
    '/login',
    '/signup',
    '/privacy',
    '/terms',
    '/about',
    '/contact',
    '/pricing',
    '/advertise',
    '/newsletter',
    '/jobs',
  ];

  if (!['http:', 'https:'].includes(parsed.protocol)) {
    return false;
  }

  if (blockedPathParts.some((part) => path.includes(part))) {
    return false;
  }

  if (/\.(png|jpe?g|gif|svg|webp|css|js|pdf|zip)$/i.test(path)) {
    return false;
  }

  if (parsed.hostname === source.hostname && ['/', ''].includes(path)) {
    return false;
  }

  return true;
}

function parseRssCandidates(xml: string, sourceUrl: string): ScrapedCandidate[] {
  const blocks = [
    ...Array.from(xml.matchAll(/<item[\s\S]*?<\/item>/gi)),
    ...Array.from(xml.matchAll(/<entry[\s\S]*?<\/entry>/gi)),
  ].map((match) => match[0]);

  const candidates: ScrapedCandidate[] = [];

  for (const block of blocks) {
      const link = toAbsoluteUrl(getXmlLink(block), sourceUrl);
      const title = getXmlTag(block, 'title');
      const summary = getRssSummary(block);
      const productHuntRedirectUrl = getProductHuntRedirectUrl(block, sourceUrl);
      const publishedAt = getXmlTag(block, 'published');
      const updatedAt = getXmlTag(block, 'updated');
      const authorName = getXmlTag(block, 'name');

      if (!link || !title || !isUsefulCandidateUrl(link, sourceUrl)) {
        continue;
      }

      candidates.push({
        url: link,
        title,
        summary,
        rawPayload: {
          parser: 'rss',
          productHuntRedirectUrl,
          publishedAt,
          updatedAt,
          authorName,
        },
      });
  }

  return candidates;
}

function parseHtmlCandidates(html: string, sourceUrl: string): ScrapedCandidate[] {
  const candidates = new Map<string, ScrapedCandidate>();
  const source = new URL(sourceUrl);
  const anchorPattern = /<a\b[^>]*href=["']([^"']+)["'][^>]*>([\s\S]*?)<\/a>/gi;

  for (const match of Array.from(html.matchAll(anchorPattern))) {
    const url = toAbsoluteUrl(match[1], sourceUrl);
    const title = cleanText(match[2]);

    if (!url || !title || title.length < 2 || !isUsefulCandidateUrl(url, sourceUrl)) {
      continue;
    }

    const parsed = new URL(url);
    const isDirectoryDetail =
      parsed.hostname === source.hostname &&
      /\/(posts?|products?|tool|tools|ai|apps?)\//i.test(parsed.pathname);
    const isExternal = parsed.hostname !== source.hostname;

    if (!isDirectoryDetail && !isExternal) {
      continue;
    }

    if (!candidates.has(url)) {
      candidates.set(url, {
        url,
        title: title.slice(0, 180),
        rawPayload: {
          parser: 'html',
          sourceHost: source.hostname,
        },
      });
    }

    if (candidates.size >= 50) {
      break;
    }
  }

  return Array.from(candidates.values());
}

async function fetchSourceCandidates(source: CollectionSource): Promise<ScrapedCandidate[]> {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 15000);

  try {
    let response: Response;

    try {
      response = await fetch(source.url, {
      headers: {
        accept:
          source.source_type === 'rss'
            ? 'application/rss+xml, application/atom+xml, application/xml, text/xml;q=0.9, */*;q=0.8'
            : 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
        'user-agent':
          'AI Best Tool Collector/1.0 (+https://ai-best-tool.local; editorial discovery bot)',
      },
      signal: controller.signal,
      });
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Unknown fetch error';
      throw new Error(`Failed to fetch source: ${message}`);
    }

    if (!response.ok) {
      throw new Error(`Source returned ${response.status}`);
    }

    const body = await response.text();
    const contentType = response.headers.get('content-type') || '';
    const shouldParseAsRss =
      source.source_type === 'rss' ||
      contentType.includes('xml') ||
      /<(rss|feed)\b/i.test(body.slice(0, 1000));

    return shouldParseAsRss
      ? parseRssCandidates(body, source.url)
      : parseHtmlCandidates(body, source.url);
  } finally {
    clearTimeout(timeout);
  }
}

export function getNextRunExpression(frequency: CollectionFrequency): string | null {
  if (frequency === 'daily') {
    return "NOW() + INTERVAL '1 day'";
  }

  if (frequency === 'weekly') {
    return "NOW() + INTERVAL '7 days'";
  }

  return null;
}

export async function ensureCollectionSchema() {
  if (schemaReady) {
    return;
  }

  if (!schemaReadyPromise) {
    schemaReadyPromise = (async () => {
      const pool = getPool();
      await pool.query(collectionSchemaSql);
      schemaReady = true;
    })().finally(() => {
      schemaReadyPromise = null;
    });
  }

  await schemaReadyPromise;
}

export async function listCollectionSources(): Promise<CollectionSource[]> {
  await ensureCollectionSchema();

  const pool = getPool();
  const result = await pool.query(`
    SELECT *
    FROM collection_sources
    ORDER BY enabled DESC, next_run_at ASC NULLS LAST, created_at DESC
  `);

  return result.rows;
}

export async function listDueCollectionSources(limit = 10): Promise<CollectionSource[]> {
  await ensureCollectionSchema();

  const pool = getPool();
  const result = await pool.query(
    `
      SELECT *
      FROM collection_sources
      WHERE enabled = TRUE
        AND frequency <> 'manual'
        AND next_run_at IS NOT NULL
        AND next_run_at <= NOW()
      ORDER BY next_run_at ASC, created_at ASC
      LIMIT $1
    `,
    [limit]
  );

  return result.rows;
}

export async function listCollectionRuns(limit = 20): Promise<CollectionRun[]> {
  await ensureCollectionSchema();

  const pool = getPool();
  const result = await pool.query(
    `
      SELECT
        r.*,
        s.name as source_name
      FROM collection_runs r
      LEFT JOIN collection_sources s ON s.id = r.source_id
      ORDER BY r.created_at DESC
      LIMIT $1
    `,
    [limit]
  );

  return result.rows;
}

export async function listCollectionCandidates(
  limit = 50,
  status?: CollectionCandidateStatus | 'all',
  page = 1,
  scoreFilter: CollectionCandidateScoreFilter = 'all'
): Promise<{
  candidates: CollectionCandidate[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
}> {
  await ensureCollectionSchema();

  const pool = getPool();
  const filters: string[] = [];
  const filterParams: unknown[] = [];

  if (status && status !== 'all') {
    filterParams.push(status);
    filters.push(`c.status = $${filterParams.length}`);
  }

  if (scoreFilter === 'promising') {
    filters.push('c.relevance_score >= 50');
  }

  if (scoreFilter === 'low') {
    filters.push('c.relevance_score < 50');
  }

  const whereClause = filters.length > 0 ? `WHERE ${filters.join(' AND ')}` : '';
  const offset = (Math.max(page, 1) - 1) * limit;
  const listParams = [...filterParams, limit, offset];
  const limitParam = filterParams.length + 1;
  const offsetParam = filterParams.length + 2;
  const countResult = await pool.query(
    `
      SELECT COUNT(*)::int AS total
      FROM collection_candidates c
      ${whereClause}
    `,
    filterParams
  );
  const total = Number(countResult.rows[0]?.total || 0);
  const result = await pool.query(
    `
      SELECT
        c.*,
        s.name as source_name
      FROM collection_candidates c
      LEFT JOIN collection_sources s ON s.id = c.source_id
      ${whereClause}
      ORDER BY
        CASE c.status
          WHEN 'new' THEN 0
          WHEN 'imported' THEN 1
          WHEN 'skipped' THEN 2
          ELSE 3
        END,
        c.relevance_score DESC,
        c.quality_score DESC,
        c.created_at DESC
      LIMIT $${limitParam} OFFSET $${offsetParam}
    `,
    listParams
  );

  return {
    candidates: result.rows,
    total,
    page: Math.max(page, 1),
    pageSize: limit,
    totalPages: Math.max(Math.ceil(total / limit), 1),
  };
}

export async function getCollectionCandidateStats(): Promise<
  Record<CollectionCandidateStatus, number>
> {
  await ensureCollectionSchema();

  const pool = getPool();
  const result = await pool.query(`
    SELECT status, COUNT(*)::int AS count
    FROM collection_candidates
    GROUP BY status
  `);
  const stats: Record<CollectionCandidateStatus, number> = {
    new: 0,
    imported: 0,
    skipped: 0,
    rejected: 0,
  };

  for (const row of result.rows) {
    if (row.status in stats) {
      stats[row.status as CollectionCandidateStatus] = Number(row.count);
    }
  }

  return stats;
}

export async function rejectCollectionCandidates(candidateIds: string[]) {
  await ensureCollectionSchema();

  if (candidateIds.length === 0) {
    return { updatedCount: 0 };
  }

  const pool = getPool();
  const result = await pool.query(
    `
      UPDATE collection_candidates
      SET status = 'rejected'
      WHERE id = ANY($1::uuid[])
        AND status = 'new'
    `,
    [candidateIds]
  );

  return { updatedCount: result.rowCount || 0 };
}

export async function rejectLowScoreCollectionCandidates(maxRelevanceScore = 49) {
  await ensureCollectionSchema();

  const pool = getPool();
  const result = await pool.query(
    `
      UPDATE collection_candidates
      SET status = 'rejected'
      WHERE status = 'new'
        AND relevance_score <= $1
    `,
    [maxRelevanceScore]
  );

  return { updatedCount: result.rowCount || 0 };
}

export async function rescoreCollectionCandidates(limit = 500) {
  await ensureCollectionSchema();

  const pool = getPool();
  const candidates = await pool.query(
    `
      SELECT id, title, summary, normalized_url, raw_payload
      FROM collection_candidates
      ORDER BY created_at DESC
      LIMIT $1
    `,
    [limit]
  );

  let updatedCount = 0;

  for (const candidate of candidates.rows) {
    const score = scoreCollectionCandidate({
      title: candidate.title,
      summary: candidate.summary,
      url: candidate.normalized_url,
      rawPayload: candidate.raw_payload,
    });

    const result = await pool.query(
      `
        UPDATE collection_candidates
        SET relevance_score = $2,
            quality_score = $3,
            score_reason = $4
        WHERE id = $1
      `,
      [candidate.id, score.relevanceScore, score.qualityScore, score.reason]
    );

    updatedCount += result.rowCount || 0;
  }

  return { updatedCount };
}

export async function enrichCollectionCandidates(limit = 10): Promise<CandidateEnrichmentResult> {
  await ensureCollectionSchema();

  const pool = getPool();
  const candidates = await pool.query(
    `
      SELECT id, title, summary, normalized_url, raw_payload
      FROM collection_candidates
      WHERE status = 'new'
        AND (
          summary IS NULL
          OR LENGTH(summary) < 80
          OR quality_score < 70
          OR NOT (raw_payload ? 'detailMetadata')
        )
      ORDER BY relevance_score DESC, quality_score ASC, created_at DESC
      LIMIT $1
    `,
    [limit]
  );

  let enrichedCount = 0;

  for (const candidate of candidates.rows) {
    const detailMetadata = await fetchCandidateDetailMetadata(candidate.normalized_url);
    const enrichedTitle = detailMetadata.title || candidate.title;
    const enrichedSummary = detailMetadata.description || candidate.summary;
    const hasUsefulMetadata = Boolean(
      detailMetadata.title ||
        detailMetadata.description ||
        detailMetadata.imageUrl ||
        detailMetadata.externalUrl ||
        detailMetadata.canonicalUrl
    );

    if (!hasUsefulMetadata) {
      const unchangedScore = scoreCollectionCandidate({
        title: candidate.title,
        summary: candidate.summary,
        url: candidate.normalized_url,
        rawPayload: {
          ...candidate.raw_payload,
          detailMetadata,
          enrichedAt: new Date().toISOString(),
          enrichmentStatus: 'empty',
        },
      });

      await pool.query(
        `
          UPDATE collection_candidates
          SET raw_payload = raw_payload || $2::jsonb,
              relevance_score = $3,
              quality_score = $4,
              score_reason = $5
          WHERE id = $1
        `,
        [
          candidate.id,
          JSON.stringify({
            detailMetadata,
            enrichedAt: new Date().toISOString(),
            enrichmentStatus: 'empty',
          }),
          unchangedScore.relevanceScore,
          unchangedScore.qualityScore,
          unchangedScore.reason,
        ]
      );

      continue;
    }

    const score = scoreCollectionCandidate({
      title: enrichedTitle,
      summary: enrichedSummary,
      url: detailMetadata.externalUrl || detailMetadata.canonicalUrl || candidate.normalized_url,
      rawPayload: {
        ...candidate.raw_payload,
        detailMetadata,
      },
    });

    const result = await pool.query(
      `
        UPDATE collection_candidates
        SET title = COALESCE($2, title),
            summary = COALESCE($3, summary),
            raw_payload = raw_payload || $4::jsonb,
            relevance_score = $5,
            quality_score = $6,
            score_reason = $7
        WHERE id = $1
      `,
      [
        candidate.id,
        enrichedTitle || null,
        enrichedSummary || null,
        JSON.stringify({
          detailMetadata,
          enrichedAt: new Date().toISOString(),
          enrichmentStatus: 'completed',
        }),
        score.relevanceScore,
        score.qualityScore,
        score.reason,
      ]
    );

    enrichedCount += result.rowCount || 0;
  }

  return {
    checkedCount: candidates.rows.length,
    enrichedCount,
  };
}

export async function importCollectionCandidateToDraft(
  candidateId: string
): Promise<{ toolId: string }> {
  await ensureCollectionSchema();

  const pool = getPool();
  const candidateResult = await pool.query(
    'SELECT * FROM collection_candidates WHERE id = $1',
    [candidateId]
  );
  const candidate = candidateResult.rows[0] as CollectionCandidate | undefined;

  if (!candidate) {
    throw new Error('Collection candidate not found');
  }

  if (candidate.status === 'imported' && candidate.tool_id) {
    return { toolId: candidate.tool_id };
  }

  const parsed = new URL(candidate.normalized_url);
  const storedDetailMetadata = getStoredDetailMetadata(candidate.raw_payload);
  const detailMetadata =
    storedDetailMetadata.title ||
    storedDetailMetadata.description ||
    storedDetailMetadata.externalUrl ||
    storedDetailMetadata.imageUrl ||
    storedDetailMetadata.canonicalUrl
      ? storedDetailMetadata
      : await fetchCandidateDetailMetadata(candidate.normalized_url);
  const officialUrl =
    detailMetadata.externalUrl ||
    getStoredProductHuntRedirectUrl(candidate.raw_payload) ||
    detailMetadata.canonicalUrl ||
    candidate.normalized_url;
  const titleText =
    detailMetadata.title?.trim() ||
    candidate.title?.trim() ||
    parsed.hostname.replace(/^www\./, '') ||
    'Collected AI tool';
  const slug = await createUniqueToolSlug(titleText);
  const summary =
    detailMetadata.description ||
    candidate.summary ||
    `Collected from ${candidate.source_name || 'an automated source'} and waiting for editorial review.`;
  const classification = inferDraftClassification({
    title: titleText,
    summary,
    url: officialUrl,
    rawPayload: candidate.raw_payload,
  });
  const categoryId = await getCategoryIdBySlug(classification.categorySlug);
  const updatedScore = scoreCollectionCandidate({
    title: titleText,
    summary,
    url: officialUrl,
    rawPayload: {
      ...candidate.raw_payload,
      detailMetadata,
    },
  });
  const title = { en: titleText, zh: titleText };
  const content = {
    en: summary,
    zh: summary,
  };
  const draftDetail = buildDraftDetail({
    summary,
    classification,
    officialUrl,
    sourceUrl: candidate.normalized_url,
    sourceName: candidate.source_name,
    score: updatedScore,
  });
  const detail = {
    en: draftDetail,
    zh: draftDetail,
  };

  const toolResult = await pool.query(
    `
      INSERT INTO tools (
        name, title, content, detail, url, image_url, thumbnail_url,
        category_id, tags, pricing, status, features
      )
      VALUES ($1, $2, $3, $4, $5, $6, $6, $7, $8, $9, 'draft', $10)
      RETURNING id
    `,
    [
      slug,
      JSON.stringify(title),
      JSON.stringify(content),
      JSON.stringify(detail),
      officialUrl,
      detailMetadata.imageUrl || null,
      categoryId,
      classification.tags,
      classification.pricing,
      JSON.stringify({
        collection: {
          sourceUrl: candidate.normalized_url,
          sourceName: candidate.source_name,
          canonicalUrl: detailMetadata.canonicalUrl,
          externalUrl: detailMetadata.externalUrl,
          productHuntRedirectUrl: getStoredProductHuntRedirectUrl(candidate.raw_payload),
          relevanceScore: updatedScore.relevanceScore,
          qualityScore: updatedScore.qualityScore,
          scoreReason: updatedScore.reason,
        },
        suggestedCategorySlug: classification.categorySlug,
        suggestedUseCases: classification.useCases,
      }),
    ]
  );
  const toolId = toolResult.rows[0].id as string;

  await pool.query(
    `
      UPDATE collection_candidates
      SET status = 'imported',
          tool_id = $2,
          raw_payload = raw_payload || $3::jsonb,
          relevance_score = $4,
          quality_score = $5,
          score_reason = $6
      WHERE id = $1
    `,
    [
      candidateId,
      toolId,
      JSON.stringify({
        detailMetadata,
        importedToolUrl: officialUrl,
      }),
      updatedScore.relevanceScore,
      updatedScore.qualityScore,
      updatedScore.reason,
    ]
  );

  return { toolId };
}

export async function createCollectionSource(input: {
  name: string;
  url: string;
  sourceType: CollectionSourceType;
  frequency: CollectionFrequency;
  enabled: boolean;
  notes?: string;
}): Promise<CollectionSource> {
  await ensureCollectionSchema();

  const pool = getPool();
  const normalizedUrl = normalizeCollectionUrl(input.url);
  const nextRunExpression = getNextRunExpression(input.frequency);
  const result = await pool.query(
    `
      INSERT INTO collection_sources (
        name, url, source_type, frequency, enabled, notes, next_run_at
      )
      VALUES ($1, $2, $3, $4, $5, $6, ${nextRunExpression || 'NULL'})
      ON CONFLICT (url)
      DO UPDATE SET
        name = EXCLUDED.name,
        source_type = EXCLUDED.source_type,
        frequency = EXCLUDED.frequency,
        enabled = EXCLUDED.enabled,
        notes = EXCLUDED.notes,
        next_run_at = EXCLUDED.next_run_at
      RETURNING *
    `,
    [
      input.name.trim(),
      normalizedUrl,
      input.sourceType,
      input.frequency,
      input.enabled,
      input.notes?.trim() || null,
    ]
  );

  return result.rows[0];
}

export async function setCollectionSourceEnabled(id: string, enabled: boolean) {
  await ensureCollectionSchema();

  const pool = getPool();
  await pool.query('UPDATE collection_sources SET enabled = $1 WHERE id = $2', [
    enabled,
    id,
  ]);
}

export async function runCollectionSourceNow(
  sourceId: string,
  triggerType: CollectionRunTrigger = 'manual'
): Promise<CollectionRun> {
  await ensureCollectionSchema();

  const pool = getPool();
  const sourceResult = await pool.query(
    'SELECT * FROM collection_sources WHERE id = $1',
    [sourceId]
  );
  const source = sourceResult.rows[0] as CollectionSource | undefined;

  if (!source) {
    throw new Error('Collection source not found');
  }

  const runResult = await pool.query(
    `
      INSERT INTO collection_runs (
        source_id, status, trigger_type, started_at, metadata
      )
      VALUES ($1, 'running', $2, NOW(), $3)
      RETURNING *
    `,
    [
      sourceId,
      triggerType,
      JSON.stringify({
        note: 'Collection run started.',
        sourceType: source.source_type,
        url: source.url,
      }),
    ]
  );
  const runId = runResult.rows[0].id as string;

  try {
    const scrapedCandidates = await fetchSourceCandidates(source);
    let importedCount = 0;
    let skippedCount = 0;

    for (const candidate of scrapedCandidates) {
      const normalizedUrl = normalizeCollectionUrl(candidate.url);
      const score = scoreCollectionCandidate({
        title: candidate.title,
        summary: candidate.summary,
        url: normalizedUrl,
        rawPayload: candidate.rawPayload,
      });
      const existingTool = await pool.query(
        'SELECT id FROM tools WHERE url = $1 LIMIT 1',
        [normalizedUrl]
      );

      if (existingTool.rows.length > 0) {
        skippedCount += 1;
        await pool.query(
          `
            INSERT INTO collection_candidates (
              source_id, run_id, tool_id, url, normalized_url, title, summary, raw_payload,
              relevance_score, quality_score, score_reason, status
            )
            VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, 'skipped')
            ON CONFLICT (normalized_url)
            DO UPDATE SET
              run_id = EXCLUDED.run_id,
              source_id = EXCLUDED.source_id,
              tool_id = EXCLUDED.tool_id,
              raw_payload = collection_candidates.raw_payload || EXCLUDED.raw_payload,
              relevance_score = EXCLUDED.relevance_score,
              quality_score = EXCLUDED.quality_score,
              score_reason = EXCLUDED.score_reason
          `,
          [
            sourceId,
            runId,
            existingTool.rows[0].id,
            candidate.url,
            normalizedUrl,
            candidate.title,
            candidate.summary || null,
            JSON.stringify(candidate.rawPayload || {}),
            score.relevanceScore,
            score.qualityScore,
            score.reason,
          ]
        );
        continue;
      }

      const insertResult = await pool.query(
        `
          INSERT INTO collection_candidates (
            source_id, run_id, url, normalized_url, title, summary, raw_payload,
            relevance_score, quality_score, score_reason, status
          )
          VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, 'new')
          ON CONFLICT (normalized_url)
          DO UPDATE SET
            run_id = EXCLUDED.run_id,
            source_id = EXCLUDED.source_id,
            title = COALESCE(collection_candidates.title, EXCLUDED.title),
            summary = COALESCE(collection_candidates.summary, EXCLUDED.summary),
            raw_payload = collection_candidates.raw_payload || EXCLUDED.raw_payload,
            relevance_score = EXCLUDED.relevance_score,
            quality_score = EXCLUDED.quality_score,
            score_reason = EXCLUDED.score_reason
          WHERE collection_candidates.status = 'new'
          RETURNING id
        `,
        [
          sourceId,
          runId,
          candidate.url,
          normalizedUrl,
          candidate.title,
          candidate.summary || null,
          JSON.stringify(candidate.rawPayload || {}),
          score.relevanceScore,
          score.qualityScore,
          score.reason,
        ]
      );

      if (insertResult.rowCount && insertResult.rowCount > 0) {
        importedCount += 1;
      } else {
        skippedCount += 1;
      }
    }

    const completedRun = await pool.query(
      `
        UPDATE collection_runs
        SET status = 'completed',
            finished_at = NOW(),
            found_count = $2,
            imported_count = $3,
            skipped_count = $4,
            metadata = metadata || $5::jsonb
        WHERE id = $1
        RETURNING *
      `,
      [
        runId,
        scrapedCandidates.length,
        importedCount,
        skippedCount,
        JSON.stringify({ parserStatus: 'completed' }),
      ]
    );

    const nextRunExpression = getNextRunExpression(source.frequency);
    await pool.query(
      `
        UPDATE collection_sources
        SET last_run_at = NOW(),
            next_run_at = ${nextRunExpression || 'NULL'}
        WHERE id = $1
      `,
      [sourceId]
    );

    return completedRun.rows[0];
  } catch (error) {
    const failedRun = await pool.query(
      `
        UPDATE collection_runs
        SET status = 'failed',
            finished_at = NOW(),
            error_message = $2,
            metadata = metadata || $3::jsonb
        WHERE id = $1
        RETURNING *
      `,
      [
        runId,
        error instanceof Error ? error.message : 'Unknown collection error',
        JSON.stringify({ parserStatus: 'failed' }),
      ]
    );

    throw new Error(
      failedRun.rows[0]?.error_message || 'Collection run failed.'
    );
  }
}
