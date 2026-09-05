import { createHash } from 'node:crypto';

import { classifyProductPage } from '@/lib/services/intelligence/pageClassifier';
import type {
  ExtractedIntelligenceAsset,
  ExtractedIntelligenceClaim,
  IntelligenceClaimType,
  IntelligencePageType,
  ProductEvidenceExtraction,
} from '@/lib/services/intelligence/types';

import createIntelligenceDom from './dom';

const MAX_EXCERPT_LENGTH = 500;
const MAX_FEATURES_PER_PAGE = 12;
const MAX_PRICING_PLANS_PER_PAGE = 8;

function normalizedText(value: string | null | undefined, maxLength = MAX_EXCERPT_LENGTH): string {
  return (value || '').replace(/\s+/g, ' ').trim().slice(0, maxLength);
}

function claimKey(type: IntelligenceClaimType, value: unknown): string {
  const digest = createHash('sha256').update(JSON.stringify(value)).digest('hex').slice(0, 16);
  return `${type}:${digest}`;
}

function addClaim(claims: ExtractedIntelligenceClaim[], input: Omit<ExtractedIntelligenceClaim, 'claimKey'>) {
  const next = { ...input, claimKey: claimKey(input.claimType, input.claimValue) };
  if (!claims.some((claim) => claim.claimKey === next.claimKey)) claims.push(next);
}

function resolvePublicAssetUrl(value: string | null | undefined, pageUrl: URL): string | null {
  if (!value) return null;
  try {
    const url = new URL(value, pageUrl);
    if (!['http:', 'https:'].includes(url.protocol) || url.username || url.password) return null;
    return url.toString();
  } catch {
    return null;
  }
}

function isErrorPageTitle(value: string): boolean {
  return /\b(?:4\d{2}|5\d{2})\b.*\b(?:error|not found|server error)\b|\b(?:error|not found|server error)\b.*\b(?:4\d{2}|5\d{2})\b/i.test(
    value,
  );
}

function extractProductName(
  document: Document,
  pageType: IntelligencePageType,
  pageUrl: URL,
): { value: string; excerpt: string; confidence: number } | null {
  // Product identity is profile-level evidence. Route-specific site names and
  // titles (for example, "OpenRouter Documentation") must not redefine it.
  if (pageType !== 'homepage') return null;

  const candidates = [
    document.querySelector<HTMLMetaElement>('meta[property="og:site_name"]')?.content,
    document.querySelector<HTMLMetaElement>('meta[name="application-name"]')?.content,
  ];
  for (const candidate of candidates) {
    const value = normalizedText(candidate, 120);
    if (value && !isErrorPageTitle(value)) return { value, excerpt: value, confidence: 0.95 };
  }

  const title = normalizedText(document.title, 200);
  if (!title || isErrorPageTitle(title)) return null;
  const genericPageTitle =
    /^(?:pricing|prices|plans?|features?|documentation|docs?|changelog|release notes?|help|support|about|security)$/i;
  const domainLabel =
    pageUrl.hostname
      .replace(/^www\./, '')
      .split('.')[0]
      ?.replace(/[^a-z0-9]/gi, '')
      .toLowerCase() || '';
  const titleParts = title
    .split(/\s(?:\||—|–|-)\s/)
    .map((part) => part.trim())
    .filter(
      (part) =>
        part.length >= 2 &&
        part.length <= 80 &&
        part.split(/\s+/).length <= 8 &&
        !genericPageTitle.test(part) &&
        !isErrorPageTitle(part),
    );
  const value = titleParts
    .map((part, index) => {
      const compact = part.replace(/[^a-z0-9]/gi, '').toLowerCase();
      const domainMatch = Boolean(domainLabel && (compact === domainLabel || compact.includes(domainLabel)));
      const wordCount = part.split(/\s+/).length;
      const score = (domainMatch ? 100 : 0) + (wordCount <= 5 ? 20 : 0) + (part.length <= 40 ? 10 : 0) - index;
      return { part, score };
    })
    .sort((left, right) => right.score - left.score)[0]?.part;
  return value ? { value, excerpt: title, confidence: 0.72 } : null;
}

function extractPositioning(document: Document): { value: string; excerpt: string; confidence: number } | null {
  const description =
    document.querySelector<HTMLMetaElement>('meta[name="description"]')?.content ||
    document.querySelector<HTMLMetaElement>('meta[property="og:description"]')?.content;
  const value = normalizedText(description, 320);
  if (!value || value.length < 25) return null;
  return { value, excerpt: value, confidence: 0.86 };
}

function extractFeatureCandidates(document: Document): Array<{ value: string; excerpt: string }> {
  const values: Array<{ value: string; excerpt: string }> = [];
  const headings = Array.from(document.querySelectorAll<HTMLHeadingElement>('h1, h2')).filter((heading) =>
    /\b(?:features?|capabilities|what you can do)\b/i.test(normalizedText(heading.textContent)),
  );

  for (const heading of headings) {
    const container = heading.closest('section, article') || heading.parentElement;
    if (!container) continue;
    const candidates = Array.from(container.querySelectorAll<HTMLElement>('h3, li, [data-feature]'));
    for (const candidate of candidates) {
      const value = normalizedText(candidate.textContent, 180);
      if (value.length < 4 || value.length > 180) continue;
      values.push({ value, excerpt: normalizedText(container.textContent) });
      if (values.length >= MAX_FEATURES_PER_PAGE) return values;
    }
  }

  return values;
}

function extractPricingPlans(document: Document): Array<{
  name: string;
  priceText: string;
  excerpt: string;
}> {
  const plans: Array<{ name: string; priceText: string; excerpt: string }> = [];
  const headings = Array.from(document.querySelectorAll<HTMLHeadingElement>('h2, h3'));

  for (const heading of headings) {
    const name = normalizedText(heading.textContent, 80);
    if (
      !name ||
      name.includes('?') ||
      name.split(/\s+/).length > 6 ||
      /^(?:pricing|plans?|what|why|how|when|where|who|which|can|could|do|does|did|is|are|will|would|should|choose|get|three|each|keep|submit|start|pick|compare)\b/i.test(
        name,
      )
    ) {
      continue;
    }

    let container: HTMLElement | null = heading.parentElement;
    let depth = 0;
    while (container && depth < 4) {
      const localHeadings = container.querySelectorAll('h2, h3');
      const localText = normalizedText(container.textContent, 700);
      const hasNumericPrice = /[$€£]\s?\d+(?:[.,]\d+)?/i.test(localText);
      const isExplicitFreePlan = /^free(?:\s+(?:plan|tier))?$/i.test(name);
      if (
        localHeadings.length === 1 &&
        (hasNumericPrice || isExplicitFreePlan) &&
        (isExplicitFreePlan ||
          /(?:\bper\s+(?:month|year|user|seat)\b|\/(?:mo|month|yr|year)\b|\bone[- ]time\b)/i.test(localText))
      ) {
        break;
      }
      container = container.parentElement;
      depth += 1;
    }
    if (!container) continue;
    const text = normalizedText(container.textContent, 700);
    const numericPriceMatch = text.match(
      /[$€£]\s?\d+(?:[.,]\d+)?(?:\s*\/\s*(?:mo|month|yr|year))?(?:\s+per\s+(?:month|year|user|seat))?/i,
    );
    const priceText = numericPriceMatch?.[0] || (/^free(?:\s+(?:plan|tier))?$/i.test(name) ? name : null);
    if (!priceText) continue;
    plans.push({ name, priceText, excerpt: text });
    if (plans.length >= MAX_PRICING_PLANS_PER_PAGE) break;
  }

  return plans.filter(
    (plan, index) =>
      plans.findIndex(
        (candidate) =>
          candidate.name.toLowerCase() === plan.name.toLowerCase() &&
          candidate.priceText.toLowerCase() === plan.priceText.toLowerCase(),
      ) === index,
  );
}

function extractAssets(document: Document, pageUrl: URL): ExtractedIntelligenceAsset[] {
  const assets: ExtractedIntelligenceAsset[] = [];
  const imageCandidates: Array<{ selector: string; type: ExtractedIntelligenceAsset['assetType'] }> = [
    { selector: 'meta[property="og:image"]', type: 'social' },
    { selector: 'meta[name="twitter:image"]', type: 'social' },
    { selector: 'link[rel~="icon"]', type: 'logo' },
    { selector: 'link[rel="apple-touch-icon"]', type: 'logo' },
  ];

  for (const candidate of imageCandidates) {
    const element = document.querySelector<HTMLMetaElement | HTMLLinkElement>(candidate.selector);
    const value =
      element instanceof document.defaultView!.HTMLMetaElement
        ? element.content
        : element instanceof document.defaultView!.HTMLLinkElement
          ? element.href
          : null;
    const sourceUrl = resolvePublicAssetUrl(value, pageUrl);
    if (!sourceUrl || assets.some((asset) => asset.sourceUrl === sourceUrl)) continue;
    assets.push({
      assetType: candidate.type,
      sourceUrl,
      width: null,
      height: null,
      isPlaceholder: false,
      evidenceStatus: 'candidate',
    });
  }

  return assets;
}

export interface ExtractProductEvidenceInput {
  url: string;
  html: string;
  observedAt?: string;
  pageType?: IntelligencePageType;
}

export function extractProductEvidence(input: ExtractProductEvidenceInput): ProductEvidenceExtraction {
  const pageUrl = new URL(input.url);
  const { document } = createIntelligenceDom(input.html, pageUrl.toString()).window;
  const observedAt = input.observedAt || new Date().toISOString();
  const pageType = input.pageType || classifyProductPage({ url: input.url, html: input.html }).pageType;
  const claims: ExtractedIntelligenceClaim[] = [];
  const warnings: string[] = [];

  const productName = extractProductName(document, pageType, pageUrl);
  if (productName) {
    addClaim(claims, {
      claimType: 'product_name',
      claimValue: productName.value,
      sourceUrl: pageUrl.toString(),
      sourceExcerpt: productName.excerpt,
      observedAt,
      confidence: productName.confidence,
      expiresAt: null,
    });
  } else if (pageType === 'homepage') {
    warnings.push('product_name_not_found');
  }

  const positioning = extractPositioning(document);
  // A profile has one canonical positioning statement. Product subpages can
  // contribute feature evidence, but their page descriptions are not the
  // company's global one-line positioning.
  if (positioning && pageType === 'homepage') {
    addClaim(claims, {
      claimType: 'one_line_positioning',
      claimValue: positioning.value,
      sourceUrl: pageUrl.toString(),
      sourceExcerpt: positioning.excerpt,
      observedAt,
      confidence: positioning.confidence,
      expiresAt: null,
    });
  }

  if (['homepage', 'features', 'product'].includes(pageType)) {
    for (const feature of extractFeatureCandidates(document)) {
      addClaim(claims, {
        claimType: 'feature',
        claimValue: feature.value,
        sourceUrl: pageUrl.toString(),
        sourceExcerpt: feature.excerpt,
        observedAt,
        confidence: 0.72,
        expiresAt: null,
      });
    }
  }

  if (pageType === 'pricing') {
    addClaim(claims, {
      claimType: 'pricing_model',
      claimValue: 'published_pricing_page',
      sourceUrl: pageUrl.toString(),
      sourceExcerpt: normalizedText(document.querySelector('main, article, body')?.textContent),
      observedAt,
      confidence: 0.9,
      expiresAt: null,
    });
    for (const plan of extractPricingPlans(document)) {
      addClaim(claims, {
        claimType: 'pricing_plan',
        claimValue: { name: plan.name, priceText: plan.priceText },
        sourceUrl: pageUrl.toString(),
        sourceExcerpt: plan.excerpt,
        observedAt,
        confidence: 0.82,
        expiresAt: null,
      });
    }
    const pageText = normalizedText(document.querySelector('main, article, body')?.textContent, 8_000);
    if (/\bfree trial\b/i.test(pageText)) {
      addClaim(claims, {
        claimType: 'free_trial',
        claimValue: true,
        sourceUrl: pageUrl.toString(),
        sourceExcerpt: normalizedText(pageText.match(/.{0,100}\bfree trial\b.{0,140}/i)?.[0]),
        observedAt,
        confidence: 0.8,
        expiresAt: null,
      });
    }
  }

  return {
    pageType,
    claims,
    assets: extractAssets(document, pageUrl),
    warnings,
  };
}
