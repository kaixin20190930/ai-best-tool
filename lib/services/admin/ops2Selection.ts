import { createHash } from 'node:crypto';

const uuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
const locales = ['en', 'zh', 'cn'] as const;
type Locale = typeof locales[number];

export type Ops2Selection = {
  id: string;
  name: string;
  officialUrl: string;
  officialDomainGroup?: { canonicalProductDomain: string; parentBrandDomains: string[];
    identitySourceIds: string[] };
  categorySlug: string;
  cluster: { taskSlug?: string; role: 'anchor' | 'alternative' | 'gap_filler' };
  officialSources: { id: string; url: string; claimKeys: string[] }[];
  entityGate: { status: 'PASS'; aiCoreCapability: { status: 'PASS'; sourceIds: string[]; evidenceExcerpt: string };
    identityCanonical: { status: 'PASS'; sourceIds: string[]; evidenceExcerpt: string };
    duplicateIntent: { status: 'PASS'; checkedToolIds: string[]; rationale: string } };
  reviewedAt: string;
  nextReviewDate: string;
  media: ({ mode?: 'official_licensed'; url: string; sourceUrl: string; rightsSourceUrl: string;
    license: string; verifiedAt: string; rightsStatus: 'PASS'; rightsSourceIds: string[];
    rightsEvidenceExcerpt: string } | { mode: 'platform_owned_editorial'; assetPath: string; sha256: string;
    creator: 'AI Best Tool editorial'; createdAt: string; noVendorMarks: true });
  pricing: 'free' | 'freemium' | 'paid';
  tags: string[];
  localized: Record<Locale, {
    title: string; summary: string; detail: string; bestFor: string[];
    notIdealFor: string[]; limitations: string[]; compareAxes: string[]; pricingSummary: string;
  }>;
  claimGate: { status: 'PASS'; items: { key: string;
    status: 'verified_public' | 'verified_account' | 'conditional' | 'conflict' | 'unknown' | 'stale';
    boundary: string; sourceIds: string[]; nextReviewDate: string; accountEvidenceRef?: string }[] };
};

function text(value: unknown, label: string, min = 1): string {
  if (typeof value !== 'string' || value.trim().length < min) throw new Error(`Invalid ${label}`);
  return value.trim();
}

function date(value: unknown, label: string): string {
  const result = text(value, label);
  if (!/^\d{4}-\d{2}-\d{2}$/.test(result) || Number.isNaN(Date.parse(`${result}T00:00:00Z`)))
    throw new Error(`Invalid ${label}`);
  return result;
}

function url(value: unknown, label: string): string {
  const result = new URL(text(value, label));
  if (result.protocol !== 'https:' || !result.hostname.includes('.') || result.username || result.password)
    throw new Error(`Invalid ${label}`);
  result.hash = '';
  if (label === 'officialUrl' && result.search) throw new Error('Official canonical URL cannot contain a query');
  return result.toString();
}

function normalizedDomain(value: unknown, label: string): string {
  const result = text(value, label).toLowerCase().replace(/^www\./, '');
  if (!/^(?:[a-z0-9](?:[a-z0-9-]{0,61}[a-z0-9])?\.)+[a-z]{2,63}$/.test(result))
    throw new Error(`Invalid ${label}`);
  return result;
}

function officialHost(value: string, domains: string[]): boolean {
  const host = new URL(value).hostname.replace(/^www\./, '').toLowerCase();
  return domains.some((domain) => host === domain || host.endsWith(`.${domain}`));
}

function list(value: unknown, label: string, minLength = 1): string[] {
  if (!Array.isArray(value) || value.length < minLength) throw new Error(`Invalid ${label}`);
  return value.map((item, index) => text(item, `${label}[${index}]`, 3));
}

function sourceIds(value: unknown, label: string, available: Set<string>, min = 1): string[] {
  const ids = list(value, label, min);
  if (new Set(ids).size !== ids.length || ids.some((id) => !available.has(id)))
    throw new Error(`Invalid ${label}: unknown or duplicate source ID`);
  return ids;
}

export function parseOps2Selection(input: unknown): Ops2Selection {
  if (!input || typeof input !== 'object' || Array.isArray(input)) throw new Error('Selection must be an object');
  const raw = input as Record<string, any>;
  const id = text(raw.id, 'id');
  if (!uuid.test(id)) throw new Error('Invalid id');
  const officialUrl = url(raw.officialUrl, 'officialUrl');
  const canonicalHost = new URL(officialUrl).hostname.replace(/^www\./, '').toLowerCase();
  let officialDomainGroup: Ops2Selection['officialDomainGroup'];
  if (raw.officialDomainGroup !== undefined) {
    const canonicalProductDomain = normalizedDomain(raw.officialDomainGroup?.canonicalProductDomain,
      'officialDomainGroup.canonicalProductDomain');
    if (canonicalProductDomain !== canonicalHost)
      throw new Error('Official domain group canonical must match officialUrl');
    if (!Array.isArray(raw.officialDomainGroup?.parentBrandDomains))
      throw new Error('Parent brand domains are required');
    const parentBrandDomains = raw.officialDomainGroup.parentBrandDomains.map((value: unknown, index: number) =>
      normalizedDomain(value, `officialDomainGroup.parentBrandDomains[${index}]`));
    const domains = [canonicalProductDomain, ...parentBrandDomains];
    if (new Set(domains).size !== domains.length)
      throw new Error('Official domain group domains must be unique');
    officialDomainGroup = { canonicalProductDomain, parentBrandDomains,
      identitySourceIds: list(raw.officialDomainGroup?.identitySourceIds,
        'officialDomainGroup.identitySourceIds') };
  }
  const officialDomains = officialDomainGroup
    ? [officialDomainGroup.canonicalProductDomain, ...officialDomainGroup.parentBrandDomains]
    : [canonicalHost];
  const categorySlug = text(raw.categorySlug, 'categorySlug');
  if (!/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(categorySlug)) throw new Error('Invalid categorySlug');
  const taskSlug = raw.cluster?.taskSlug === undefined
    ? undefined : text(raw.cluster.taskSlug, 'cluster.taskSlug');
  const role = raw.cluster?.role;
  if ((taskSlug !== undefined && !/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(taskSlug)) ||
      !['anchor', 'alternative', 'gap_filler'].includes(role))
    throw new Error('Invalid cluster');
  const officialSources = raw.officialSources;
  if (!Array.isArray(officialSources) || officialSources.length < 2) throw new Error('Two official sources are required');
  const sources = officialSources.map((source: any, index: number) => ({
    id: text(source?.id, `officialSources[${index}].id`),
    url: url(source?.url, `officialSources[${index}].url`),
    claimKeys: list(source?.claimKeys, `officialSources[${index}].claimKeys`),
  }));
  if (sources.some((source) => !officialHost(source.url, officialDomains)) ||
      new Set(sources.map((source) => source.url)).size !== sources.length ||
      new Set(sources.map((source) => source.id)).size !== sources.length)
    throw new Error('Official sources must be distinct URLs in the declared official domain group');
  if (new Set(sources.flatMap((source) => source.claimKeys)).size < 2)
    throw new Error('Official sources must cover complementary facts');
  const availableSourceIds = new Set(sources.map((source) => source.id));
  const entityGate = raw.entityGate;
  if (entityGate?.status !== 'PASS' || entityGate.aiCoreCapability?.status !== 'PASS' ||
      entityGate.identityCanonical?.status !== 'PASS' || entityGate.duplicateIntent?.status !== 'PASS')
    throw new Error('Entity gate must explicitly PASS all three checks');
  const parsedEntityGate: Ops2Selection['entityGate'] = {
    status: 'PASS',
    aiCoreCapability: { status: 'PASS', sourceIds: sourceIds(entityGate.aiCoreCapability.sourceIds,
      'entityGate.aiCoreCapability.sourceIds', availableSourceIds),
      evidenceExcerpt: text(entityGate.aiCoreCapability.evidenceExcerpt,
        'entityGate.aiCoreCapability.evidenceExcerpt', 30) },
    identityCanonical: { status: 'PASS', sourceIds: sourceIds(entityGate.identityCanonical.sourceIds,
      'entityGate.identityCanonical.sourceIds', availableSourceIds),
      evidenceExcerpt: text(entityGate.identityCanonical.evidenceExcerpt,
        'entityGate.identityCanonical.evidenceExcerpt', 30) },
    duplicateIntent: { status: 'PASS',
      checkedToolIds: Array.isArray(entityGate.duplicateIntent.checkedToolIds)
        ? entityGate.duplicateIntent.checkedToolIds.map((value: unknown) => {
          const id = text(value, 'entityGate.duplicateIntent.checkedToolIds');
          if (!uuid.test(id)) throw new Error('Invalid checkedToolIds UUID');
          return id;
        }) : (() => { throw new Error('Duplicate-intent comparison list is required'); })(),
      rationale: text(entityGate.duplicateIntent.rationale, 'entityGate.duplicateIntent.rationale', 20) },
  };
  if (new Set(parsedEntityGate.duplicateIntent.checkedToolIds.map((id) => id.toLowerCase())).size !==
      parsedEntityGate.duplicateIntent.checkedToolIds.length)
    throw new Error('Duplicate checkedToolIds are not allowed');
  if (taskSlug === undefined && parsedEntityGate.duplicateIntent.checkedToolIds.length !== 0)
    throw new Error('Catalog-only selection cannot claim Task Fit checks');
  if (officialDomainGroup) {
    const identitySourceIds = sourceIds(officialDomainGroup.identitySourceIds,
      'officialDomainGroup.identitySourceIds', availableSourceIds);
    const identitySources = sources.filter((source) => identitySourceIds.includes(source.id));
    if (!identitySourceIds.every((sourceId) => parsedEntityGate.identityCanonical.sourceIds.includes(sourceId)) ||
        !identitySources.some((source) => source.claimKeys.includes('identity')))
      throw new Error('Official domain group needs an identity source used by the identity gate');
    if (officialDomainGroup.parentBrandDomains.length > 0 && !identitySources.some((source) =>
      officialHost(source.url, officialDomainGroup!.parentBrandDomains) &&
      source.claimKeys.includes('brand_relationship')))
      throw new Error('Parent brand domain needs an official brand-relationship identity source');
    officialDomainGroup = { ...officialDomainGroup, identitySourceIds };
  }
  let media: Ops2Selection['media'];
  if (raw.media?.mode === 'platform_owned_editorial') {
    const assetPath = text(raw.media?.assetPath, 'media.assetPath');
    if (!/^\/images\/tool-media\/[a-z0-9][a-z0-9._-]*\.(?:svg|png|jpe?g|webp)$/.test(assetPath))
      throw new Error('Platform-owned media must use a normalized tool-media asset path');
    const sha256 = text(raw.media?.sha256, 'media.sha256').toLowerCase();
    if (!/^[a-f0-9]{64}$/.test(sha256)) throw new Error('Invalid platform-owned media sha256');
    if (raw.media?.creator !== 'AI Best Tool editorial' || raw.media?.noVendorMarks !== true)
      throw new Error('Platform-owned media needs editorial ownership and noVendorMarks=true');
    media = { mode: 'platform_owned_editorial', assetPath, sha256,
      creator: 'AI Best Tool editorial', createdAt: date(raw.media?.createdAt, 'media.createdAt'),
      noVendorMarks: true };
  } else {
    const officialMedia = {
      ...(raw.media?.mode === 'official_licensed' ? { mode: 'official_licensed' as const } : {}),
      url: url(raw.media?.url, 'media.url'),
      sourceUrl: url(raw.media?.sourceUrl, 'media.sourceUrl'),
      rightsSourceUrl: url(raw.media?.rightsSourceUrl, 'media.rightsSourceUrl'),
      license: text(raw.media?.license, 'media.license', 8),
      verifiedAt: date(raw.media?.verifiedAt, 'media.verifiedAt'),
      rightsStatus: raw.media?.rightsStatus,
      rightsSourceIds: sourceIds(raw.media?.rightsSourceIds, 'media.rightsSourceIds', availableSourceIds),
      rightsEvidenceExcerpt: text(raw.media?.rightsEvidenceExcerpt, 'media.rightsEvidenceExcerpt', 30),
    };
    if (officialMedia.rightsStatus !== 'PASS' || !officialMedia.rightsSourceIds.some((sourceId) =>
      sources.some((source) => source.id === sourceId && source.url === officialMedia.rightsSourceUrl)))
      throw new Error('Media rights must PASS with matching official evidence');
    if (!officialHost(officialMedia.sourceUrl, officialDomains) ||
        !officialHost(officialMedia.rightsSourceUrl, officialDomains) ||
        !sources.some((source) => source.url === officialMedia.rightsSourceUrl))
      throw new Error('Media provenance must be in the declared official domain group');
    media = { ...officialMedia, rightsStatus: 'PASS' };
  }
  const reviewedAt = date(raw.reviewedAt, 'reviewedAt');
  const nextReviewDate = date(raw.nextReviewDate, 'nextReviewDate');
  if (nextReviewDate <= reviewedAt) throw new Error('Next review must follow review date');
  const today = new Date().toISOString().slice(0, 10);
  const mediaDate = media.mode === 'platform_owned_editorial' ? media.createdAt : media.verifiedAt;
  if (reviewedAt > today || mediaDate > today || nextReviewDate <= today)
    throw new Error('Review dates must describe a current, future-due snapshot');
  const pricing = raw.pricing;
  if (!['free', 'freemium', 'paid'].includes(pricing)) throw new Error('Invalid pricing');
  const localized = Object.fromEntries(locales.map((locale) => {
    const value = raw.localized?.[locale];
    return [locale, {
      title: text(value?.title, `${locale}.title`, 4),
      summary: text(value?.summary, `${locale}.summary`, 80),
      detail: text(value?.detail, `${locale}.detail`, 160),
      bestFor: list(value?.bestFor, `${locale}.bestFor`),
      notIdealFor: list(value?.notIdealFor, `${locale}.notIdealFor`),
      limitations: list(value?.limitations, `${locale}.limitations`),
      compareAxes: list(value?.compareAxes, `${locale}.compareAxes`),
      pricingSummary: text(value?.pricingSummary, `${locale}.pricingSummary`, 8),
    }];
  })) as Ops2Selection['localized'];
  if (raw.claimGate?.status !== 'PASS') throw new Error('Claim classification gate must PASS');
  const claims = raw.claimGate.items;
  if (!Array.isArray(claims) || claims.length === 0) throw new Error('Claims are required');
  const parsedClaims = claims.map((claim: any, index: number) => {
    const key = text(claim?.key, `claims[${index}].key`);
    const status = claim?.status;
    if (!['verified_public', 'verified_account', 'conditional', 'conflict', 'unknown', 'stale'].includes(status))
      throw new Error(`Invalid claims[${index}].status`);
    const claimSourceIds = sourceIds(claim?.sourceIds, `claims[${index}].sourceIds`, availableSourceIds, 0);
    if ((status === 'verified_public' || status === 'verified_account') && claimSourceIds.length === 0)
      throw new Error(`Verified claim ${key} needs a source`);
    if (claimSourceIds.some((id) => !sources.some((source) => source.id === id && source.claimKeys.includes(key))))
      throw new Error(`Claim ${key} cites an unlisted source`);
    const accountEvidenceRef = status === 'verified_account'
      ? text(claim?.accountEvidenceRef, `claims[${index}].accountEvidenceRef`, 8) : undefined;
    return { key, status, boundary: text(claim?.boundary, `claims[${index}].boundary`, 8),
      sourceIds: claimSourceIds, nextReviewDate: date(claim?.nextReviewDate, `claims[${index}].nextReviewDate`),
      ...(accountEvidenceRef ? { accountEvidenceRef } : {}) };
  });
  if (new Set(parsedClaims.map((claim) => claim.key)).size !== parsedClaims.length)
    throw new Error('Duplicate claim key');
  return { id, name: text(raw.name, 'name', 4), officialUrl,
    ...(officialDomainGroup ? { officialDomainGroup } : {}), categorySlug,
    cluster: { ...(taskSlug === undefined ? {} : { taskSlug }), role },
    officialSources: sources, entityGate: parsedEntityGate,
    reviewedAt, nextReviewDate, media,
    pricing, tags: list(raw.tags, 'tags'), localized, claimGate: { status: 'PASS', items: parsedClaims } };
}

export function selectionHash(selection: Ops2Selection): string {
  return createHash('sha256').update(JSON.stringify(selection)).digest('hex');
}

export function selectionRawPayload(selection: Ops2Selection) {
  const summary = selection.localized.en.summary;
  const imageUrl = selection.media.mode === 'platform_owned_editorial'
    ? selection.media.assetPath : selection.media.url;
  return {
    sourceType: 'ops2_selection',
    detailMetadata: { title: selection.name, description: summary,
      canonicalUrl: selection.officialUrl, externalUrl: selection.officialUrl, imageUrl },
    categorySlug: selection.categorySlug, tags: selection.tags, pricing: selection.pricing,
    useCases: selection.localized.en.bestFor,
    intakePlan: { evidenceUrls: selection.officialSources.map((source) => source.url), reviewedAt: selection.reviewedAt },
    decision: { reviewedAt: selection.reviewedAt, limitations: selection.localized.en.limitations,
      notIdealFor: selection.localized.en.notIdealFor, compareAxes: selection.localized.en.compareAxes },
    ops2Selection: selection,
    detail: selection.localized.en.detail,
  };
}
