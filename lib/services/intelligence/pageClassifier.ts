import { JSDOM } from 'jsdom';

import type {
  IntelligenceClassificationSignal,
  IntelligenceClassificationSignalSource,
  IntelligencePageClassification,
  IntelligencePageType,
} from '@/lib/services/intelligence/types';

interface ClassificationRule {
  pageType: IntelligencePageType;
  urlPatterns: RegExp[];
  labelPatterns: RegExp[];
}

const classificationRules: ClassificationRule[] = [
  {
    pageType: 'pricing',
    urlPatterns: [/(?:^|\/)(?:pricing|prices|plans?)(?:\/|$)/i],
    labelPatterns: [/\bpricing\b/i, /\bplans? and pricing\b/i, /\bchoose (?:a|your) plan\b/i],
  },
  {
    pageType: 'documentation',
    urlPatterns: [
      /(?:^|\/)(?:docs?|documentation)(?:\/|$)/i,
      /(?:^|\/)(?:api-reference|developer-docs?|quickstart)(?:\/|$)/i,
    ],
    labelPatterns: [/\bdocumentation\b/i, /\bapi reference\b/i, /\bdeveloper docs?\b/i, /\bquick ?start\b/i],
  },
  {
    pageType: 'changelog',
    urlPatterns: [/(?:^|\/)(?:changelog|release-notes?|releases|whats-new)(?:\/|$)/i],
    labelPatterns: [/\bchangelog\b/i, /\brelease notes?\b/i, /\bwhat'?s new\b/i, /\bproduct updates?\b/i],
  },
  {
    pageType: 'features',
    urlPatterns: [/(?:^|\/)(?:features?|capabilities)(?:\/|$)/i],
    labelPatterns: [/\bfeatures\b/i, /\bcapabilities\b/i],
  },
  {
    pageType: 'use_case',
    urlPatterns: [/(?:^|\/)(?:use-cases?|solutions)(?:\/|$)/i, /(?:^|\/)for-[a-z0-9-]+(?:\/|$)/i],
    labelPatterns: [/\buse cases?\b/i, /\bwho (?:it'?s|this is) for\b/i, /\bbest for\b/i],
  },
  {
    pageType: 'security',
    urlPatterns: [/(?:^|\/)(?:security|trust|compliance)(?:\/|$)/i],
    labelPatterns: [/\bsecurity\b/i, /\btrust center\b/i, /\bcompliance\b/i],
  },
  {
    pageType: 'help',
    urlPatterns: [/(?:^|\/)(?:help|support|knowledge-base)(?:\/|$)/i],
    labelPatterns: [/\bhelp center\b/i, /\bsupport\b/i, /\bknowledge base\b/i],
  },
  {
    pageType: 'about',
    urlPatterns: [/(?:^|\/)(?:about|company)(?:\/|$)/i],
    labelPatterns: [/\babout us\b/i, /\bour company\b/i],
  },
  {
    pageType: 'license',
    urlPatterns: [/(?:^|\/)(?:license|licensing)(?:\/|$)/i],
    labelPatterns: [/\blicen[cs](?:e|ing)\b/i],
  },
  {
    pageType: 'terms',
    urlPatterns: [/(?:^|\/)(?:terms|terms-of-service|legal)(?:\/|$)/i],
    labelPatterns: [/\bterms of (?:service|use)\b/i, /\blegal terms\b/i],
  },
  {
    pageType: 'product',
    urlPatterns: [/(?:^|\/)(?:product|platform)(?:\/|$)/i],
    labelPatterns: [/\bproduct overview\b/i, /\bplatform overview\b/i],
  },
];

const bodyEvidence: Array<{
  pageType: IntelligencePageType;
  patterns: RegExp[];
  minimumMatches: number;
  weight: number;
}> = [
  {
    pageType: 'pricing',
    patterns: [
      /[$€£]\s?\d+(?:[.,]\d+)?/i,
      /\bper (?:month|year|user|seat)\b/i,
      /\/(?:mo|month|yr|year)\b/i,
      /\b(?:monthly|annual|yearly) billing\b/i,
      /\bfree trial\b/i,
    ],
    minimumMatches: 2,
    weight: 24,
  },
  {
    pageType: 'documentation',
    patterns: [
      /\bapi key\b/i,
      /\bendpoint\b/i,
      /\brequest headers?\b/i,
      /\bresponse body\b/i,
      /\binstallation\b/i,
      /\bquick ?start\b/i,
    ],
    minimumMatches: 2,
    weight: 22,
  },
  {
    pageType: 'changelog',
    patterns: [
      /\bv?\d+\.\d+(?:\.\d+)?\b/i,
      /\b(?:released|fixed|improved|added|deprecated)\b/i,
      /\b(?:jan(?:uary)?|feb(?:ruary)?|mar(?:ch)?|apr(?:il)?|may|jun(?:e)?|jul(?:y)?|aug(?:ust)?|sep(?:tember)?|oct(?:ober)?|nov(?:ember)?|dec(?:ember)?)\s+\d{1,2},?\s+\d{4}\b/i,
      /\b\d{4}-\d{2}-\d{2}\b/,
    ],
    minimumMatches: 2,
    weight: 22,
  },
  {
    pageType: 'security',
    patterns: [/\bsoc ?2\b/i, /\biso ?27001\b/i, /\bgdpr\b/i, /\bdata encryption\b/i],
    minimumMatches: 2,
    weight: 20,
  },
];

function normalizedText(value: string | null | undefined): string {
  return (value || '').replace(/\s+/g, ' ').trim().slice(0, 4_000);
}

function addSignal(
  signals: IntelligenceClassificationSignal[],
  pageType: IntelligencePageType,
  source: IntelligenceClassificationSignalSource,
  weight: number,
  value: string,
) {
  signals.push({ pageType, source, weight, value: normalizedText(value).slice(0, 240) });
}

function matchingRuleSignals(
  signals: IntelligenceClassificationSignal[],
  source: IntelligenceClassificationSignalSource,
  value: string,
  weight: number,
) {
  if (!value) return;
  for (const rule of classificationRules) {
    if (rule.labelPatterns.some((pattern) => pattern.test(value))) {
      addSignal(signals, rule.pageType, source, weight, value);
    }
  }
}

function extractStructuredTypes(document: Document): string[] {
  const types: string[] = [];
  for (const node of Array.from(document.querySelectorAll<HTMLScriptElement>('script[type="application/ld+json"]'))) {
    try {
      const parsed = JSON.parse(node.textContent || '{}') as unknown;
      const queue = Array.isArray(parsed) ? [...parsed] : [parsed];
      while (queue.length > 0) {
        const value = queue.shift();
        if (!value || typeof value !== 'object') continue;
        const record = value as Record<string, unknown>;
        const type = record['@type'];
        if (typeof type === 'string') types.push(type);
        if (Array.isArray(record['@graph'])) queue.push(...record['@graph']);
      }
    } catch {
      // Invalid structured data is ignored and does not become evidence.
    }
  }
  return types;
}

function addStructuredSignals(signals: IntelligenceClassificationSignal[], document: Document) {
  for (const type of extractStructuredTypes(document)) {
    if (/api|techarticle/i.test(type)) addSignal(signals, 'documentation', 'structured_data', 12, type);
    if (/softwareapplication|product/i.test(type)) addSignal(signals, 'product', 'structured_data', 8, type);
  }
}

function addBodySignals(signals: IntelligenceClassificationSignal[], bodyText: string, codeBlockCount: number) {
  for (const evidence of bodyEvidence) {
    const matches = evidence.patterns.filter((pattern) => pattern.test(bodyText));
    if (matches.length >= evidence.minimumMatches) {
      addSignal(signals, evidence.pageType, 'body', evidence.weight, `${matches.length} corroborating body markers`);
    }
  }
  if (codeBlockCount >= 2) {
    addSignal(signals, 'documentation', 'body', 18, `${codeBlockCount} code blocks`);
  }
}

function scoreSignals(signals: IntelligenceClassificationSignal[]): Array<{
  pageType: IntelligencePageType;
  score: number;
}> {
  const scores = new Map<IntelligencePageType, number>();
  for (const signal of signals) {
    scores.set(signal.pageType, Math.min(100, (scores.get(signal.pageType) || 0) + signal.weight));
  }
  return Array.from(scores.entries())
    .map(([pageType, score]) => ({ pageType, score }))
    .sort((left, right) => right.score - left.score || left.pageType.localeCompare(right.pageType));
}

export interface ClassifyProductPageInput {
  url: string;
  html: string;
}

export function classifyProductPage(input: ClassifyProductPageInput): IntelligencePageClassification {
  const url = new URL(input.url);
  if (url.pathname === '/' || url.pathname === '') {
    return {
      pageType: 'homepage',
      confidence: 1,
      score: 100,
      alternatives: [],
      signals: [{ pageType: 'homepage', source: 'url', weight: 100, value: '/' }],
    };
  }

  const { document } = new JSDOM(input.html, { url: url.toString() }).window;
  const signals: IntelligenceClassificationSignal[] = [];
  const pathSignal = decodeURIComponent(url.pathname).replace(/[-_/]+/g, ' ');

  for (const rule of classificationRules) {
    if (rule.urlPatterns.some((pattern) => pattern.test(url.pathname))) {
      addSignal(signals, rule.pageType, 'url', 62, pathSignal);
    }
  }

  const title = normalizedText(document.title);
  const description = normalizedText(
    document.querySelector<HTMLMetaElement>('meta[name="description"]')?.content ||
      document.querySelector<HTMLMetaElement>('meta[property="og:description"]')?.content,
  );
  matchingRuleSignals(signals, 'title', title, 30);
  matchingRuleSignals(signals, 'metadata', description, 10);
  addStructuredSignals(signals, document);

  for (const node of Array.from(document.querySelectorAll('script, style, nav, footer, noscript'))) node.remove();
  const main = document.querySelector('main, article, [role="main"]') || document.body;
  const primaryHeading = normalizedText(main?.querySelector('h1')?.textContent);
  const secondaryHeadings = normalizedText(
    Array.from(main?.querySelectorAll<HTMLHeadingElement>('h2') || [])
      .slice(0, 4)
      .map((heading) => heading.textContent)
      .join(' '),
  );
  matchingRuleSignals(signals, 'heading', primaryHeading, 24);
  matchingRuleSignals(signals, 'heading', secondaryHeadings, 8);
  const bodyText = normalizedText(main?.textContent);
  addBodySignals(signals, bodyText, main?.querySelectorAll('pre, code').length || 0);

  const ranked = scoreSignals(signals);
  if (ranked.length === 0 || ranked[0].score < 24) {
    return {
      pageType: 'other',
      confidence: 0.35,
      score: ranked[0]?.score || 0,
      alternatives: ranked.slice(0, 3),
      signals,
    };
  }

  const winner = ranked[0];
  const runnerUp = ranked[1]?.score || 0;
  const margin = winner.score - runnerUp;
  const confidence = Math.min(1, Math.max(0.4, winner.score / 125 + margin / 150));

  return {
    pageType: winner.pageType,
    confidence: Number(confidence.toFixed(2)),
    score: winner.score,
    alternatives: ranked.slice(1, 4),
    signals,
  };
}
