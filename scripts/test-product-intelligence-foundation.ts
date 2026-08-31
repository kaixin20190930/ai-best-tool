import assert from 'node:assert/strict';

import { detectIntelligenceClaimChanges, stableIntelligenceValue } from '@/lib/services/intelligence/changeDetector';
import { resolveProductIntelligenceConflicts } from '@/lib/services/intelligence/conflictResolver';
import { extractProductEvidence } from '@/lib/services/intelligence/evidenceExtractor';
import { DISTRIBUTION_TARGET_FIXTURES, INTELLIGENCE_PRODUCT_FIXTURES } from '@/lib/services/intelligence/fixtures';
import { classifyProductPage } from '@/lib/services/intelligence/pageClassifier';
import {
  buildCommonPathCandidates,
  classifyDiscoveredPage,
  extractHomepageCandidates,
  extractRobotsSitemaps,
  extractSitemapLocations,
} from '@/lib/services/intelligence/pageDiscovery';
import { normalizeIntelligenceConfidence } from '@/lib/services/intelligence/persistence';
import { buildProductIntelligenceSnapshot } from '@/lib/services/intelligence/productProfile';
import { buildContentQualityResult, CONTENT_QUALITY_WEIGHTS } from '@/lib/services/intelligence/qualityConfig';
import { assessContentQuality } from '@/lib/services/intelligence/qualityScorer';
import { buildIntelligenceReviewSchedule } from '@/lib/services/intelligence/reviewSchedule';
import {
  isEvidenceHtmlContentType,
  isPathAllowedByRobots,
  isPrivateAddress,
  isSuccessfulHttpStatus,
  parseRobotsRules,
} from '@/lib/services/intelligence/safeFetch';
import { buildIntelligenceSignalCandidates } from '@/lib/services/intelligence/signalPersistence';

function run() {
  const signals = buildIntelligenceSignalCandidates({
    profiles: [{ id: 'profile-1', owner_id: 'tool-1' }],
    claims: [
      {
        id: 'claim-1',
        tool_id: 'tool-1',
        listing_name: 'Example',
        claim_reason: 'profile_correction',
        note: 'The pricing shown on the listing is no longer current.',
        updated_at: '2026-08-31T00:00:00.000Z',
      },
    ],
    comments: [
      {
        id: 'comment-1',
        tool_id: 'tool-1',
        user_id: 'user-1',
        content: 'Exports worked well, but the free plan limit was reached quickly.',
        is_hidden: false,
        created_at: '2026-08-31T00:00:00.000Z',
      },
      {
        id: 'comment-hidden',
        tool_id: 'tool-1',
        content: 'This hidden comment must not enter review.',
        is_hidden: true,
      },
    ],
  });
  assert.deepEqual(
    signals.map(({ sourceType, signalType }) => ({ sourceType, signalType })),
    [
      { sourceType: 'profile_correction', signalType: 'correction' },
      { sourceType: 'comment', signalType: 'user_experience' },
    ],
  );
  const reviewSchedule = buildIntelligenceReviewSchedule({
    lastVerifiedAt: '2026-01-01T00:00:00.000Z',
    now: new Date('2026-01-20T00:00:00.000Z'),
  });
  assert.deepEqual(
    reviewSchedule.map(({ reviewType, cadenceDays, daysUntilDue }) => ({ reviewType, cadenceDays, daysUntilDue })),
    [
      { reviewType: 'fact', cadenceDays: 30, daysUntilDue: 11 },
      { reviewType: 'decision', cadenceDays: 90, daysUntilDue: 71 },
    ],
  );
  assert.equal(
    stableIntelligenceValue({ price: 19, interval: 'month' }),
    stableIntelligenceValue({ interval: 'month', price: 19 }),
  );
  const baselineClaim = {
    id: 'claim-baseline',
    profileId: 'profile-change',
    claimType: 'pricing_plan' as const,
    claimKey: 'pricing_plan:pro',
    claimValue: { name: 'Pro', price: 19 },
    sourceUrl: 'https://example.com/pricing',
    sourceExcerpt: 'Pro costs $19',
    observedAt: '2026-08-01T00:00:00.000Z',
    confidence: 95,
    conflictStatus: 'none' as const,
    expiresAt: null,
  };
  assert.equal(
    detectIntelligenceClaimChanges(
      [baselineClaim],
      [{ ...baselineClaim, claimValue: { price: 19, name: 'Pro' } }],
      baselineClaim.sourceUrl,
    ).length,
    0,
  );
  const changedClaims = detectIntelligenceClaimChanges(
    [baselineClaim],
    [
      { ...baselineClaim, claimValue: { name: 'Pro', price: 29 }, sourceExcerpt: 'Pro costs $29' },
      { ...baselineClaim, claimType: 'free_trial', claimKey: 'free_trial:available', claimValue: true },
    ],
    baselineClaim.sourceUrl,
  );
  assert.deepEqual(changedClaims.map((change) => change.changeType).sort(), ['added', 'changed']);
  assert.equal(detectIntelligenceClaimChanges([baselineClaim], [], baselineClaim.sourceUrl)[0]?.changeType, 'removed');

  assert.equal(
    Object.values(CONTENT_QUALITY_WEIGHTS).reduce((sum, weight) => sum + weight, 0),
    100,
  );
  assert.equal(INTELLIGENCE_PRODUCT_FIXTURES.length, 10);
  assert.equal(DISTRIBUTION_TARGET_FIXTURES.length, 10);
  assert.equal(new Set(INTELLIGENCE_PRODUCT_FIXTURES.map((item) => item.key)).size, 10);
  assert.equal(new Set(DISTRIBUTION_TARGET_FIXTURES.map((item) => item.key)).size, 10);
  assert.equal(normalizeIntelligenceConfidence(0.95), 95);
  assert.equal(normalizeIntelligenceConfidence(90), 90);
  assert.equal(normalizeIntelligenceConfidence(150), 100);
  assert.equal(normalizeIntelligenceConfidence(-10), 0);

  const qualityAssessment = assessContentQuality({
    profile: {
      id: 'profile-quality',
      ownerType: 'tool',
      ownerId: 'tool-quality',
      canonicalDomain: 'example.com',
      productName: 'Example',
      status: 'ready',
      version: 1,
      lastCrawledAt: new Date().toISOString(),
      lastVerifiedAt: new Date().toISOString(),
      nextReviewAt: null,
      metadata: {},
    },
    sources: [
      {
        id: 'source-quality',
        profileId: 'profile-quality',
        url: 'https://example.com/',
        pageType: 'homepage',
        httpStatus: 200,
        canonicalUrl: 'https://example.com/',
        contentHash: 'quality-hash',
        contentType: 'text/html',
        fetchedAt: new Date().toISOString(),
        fetchStatus: 'success',
        metadata: {},
      },
    ],
    claims: [
      {
        id: 'claim-quality-name',
        profileId: 'profile-quality',
        claimType: 'product_name',
        claimKey: 'product_name:quality',
        claimValue: 'Example',
        sourceUrl: 'https://example.com/',
        sourceExcerpt: 'Example',
        observedAt: new Date().toISOString(),
        confidence: 95,
        conflictStatus: 'none',
        expiresAt: null,
      },
      {
        id: 'claim-quality-positioning',
        profileId: 'profile-quality',
        claimType: 'one_line_positioning',
        claimKey: 'one_line_positioning:quality',
        claimValue: 'An evidence-backed example.',
        sourceUrl: 'https://example.com/',
        sourceExcerpt: 'An evidence-backed example.',
        observedAt: new Date().toISOString(),
        confidence: 90,
        conflictStatus: 'none',
        expiresAt: null,
      },
      {
        id: 'claim-quality-feature',
        profileId: 'profile-quality',
        claimType: 'feature',
        claimKey: 'feature:quality',
        claimValue: 'Evidence tracking',
        sourceUrl: 'https://example.com/',
        sourceExcerpt: 'Evidence tracking',
        observedAt: new Date().toISOString(),
        confidence: 85,
        conflictStatus: 'none',
        expiresAt: null,
      },
    ],
    assets: [
      {
        id: 'asset-quality',
        profileId: 'profile-quality',
        assetType: 'logo',
        sourceUrl: 'https://example.com/logo.png',
        storedUrl: null,
        width: 256,
        height: 256,
        isPlaceholder: false,
        evidenceStatus: 'verified',
      },
    ],
  });
  assert.equal(qualityAssessment.total, 60);
  assert.equal(qualityAssessment.breakdown.factualConsistency, 20);
  assert.equal(qualityAssessment.breakdown.mediaIntegrity, 3);
  assert.equal(qualityAssessment.decision, 'hold');
  assert.equal(qualityAssessment.blockers.length, 0);
  assert.equal(
    qualityAssessment.recommendations.some((item) => item.includes('QC-013')),
    true,
  );

  const publishReady = buildContentQualityResult({
    evidence: 20,
    factualConsistency: 20,
    decisionValue: 18,
    uniqueness: 14,
    searchAndCategoryFit: 9,
    freshness: 9,
    mediaIntegrity: 5,
  });
  assert.equal(publishReady.total, 95);
  assert.equal(publishReady.decision, 'publish_ready');

  const blocked = buildContentQualityResult(
    {
      evidence: 20,
      factualConsistency: 20,
      decisionValue: 20,
      uniqueness: 15,
      searchAndCategoryFit: 10,
      freshness: 10,
      mediaIntegrity: 5,
    },
    ['unresolved evidence conflict'],
  );
  assert.equal(blocked.total, 100);
  assert.equal(blocked.decision, 'hold');

  ['127.0.0.1', '10.0.0.1', '172.16.1.1', '192.168.1.1', '::1', 'fc00::1'].forEach((address) =>
    assert.equal(isPrivateAddress(address), true),
  );
  ['8.8.8.8', '1.1.1.1', '2606:4700:4700::1111'].forEach((address) => assert.equal(isPrivateAddress(address), false));
  assert.equal(isSuccessfulHttpStatus(200), true);
  assert.equal(isSuccessfulHttpStatus(299), true);
  assert.equal(isSuccessfulHttpStatus(404), false);
  assert.equal(isSuccessfulHttpStatus(500), false);
  assert.equal(isEvidenceHtmlContentType('text/html; charset=utf-8'), true);
  assert.equal(isEvidenceHtmlContentType('application/json'), false);

  const robots = parseRobotsRules(`
    User-agent: *
    Disallow: /private
    Allow: /private/public
  `);
  assert.equal(isPathAllowedByRobots('/pricing', robots), true);
  assert.equal(isPathAllowedByRobots('/private/report', robots), false);
  assert.equal(isPathAllowedByRobots('/private/public/example', robots), true);

  const homepageCandidates = extractHomepageCandidates(
    `
      <a href="/pricing?utm_source=nav">Pricing</a>
      <a href="/docs">Developer documentation</a>
      <a href="/changelog">Release notes</a>
      <a href="/login">Sign in</a>
      <a href="https://other.example/features">External</a>
    `,
    'https://example.com/',
  );
  assert.deepEqual(homepageCandidates.map(({ pageType }) => pageType).sort(), [
    'changelog',
    'documentation',
    'homepage',
    'pricing',
  ]);
  assert.equal(
    homepageCandidates.some(({ url }) => url.includes('utm_source')),
    false,
  );
  assert.equal(
    homepageCandidates.some(({ url }) => url.includes('/login')),
    false,
  );

  assert.deepEqual(extractRobotsSitemaps('Sitemap: https://example.com/sitemap.xml', 'https://example.com'), [
    'https://example.com/sitemap.xml',
  ]);
  assert.deepEqual(
    extractSitemapLocations(
      '<urlset><url><loc>https://example.com/pricing</loc></url><url><loc>https://other.example/docs</loc></url></urlset>',
      'https://example.com/sitemap.xml',
    ),
    ['https://example.com/pricing'],
  );
  assert.equal(classifyDiscoveredPage(new URL('https://example.com/api-reference')).pageType, 'documentation');
  assert.equal(buildCommonPathCandidates('https://example.com').length, 10);

  const pricingPage = classifyProductPage({
    url: 'https://example.com/pricing',
    html: `
      <title>Plans and pricing</title>
      <main><h1>Choose your plan</h1><p>Pro $19 per month</p><p>Annual billing available.</p></main>
    `,
  });
  assert.equal(pricingPage.pageType, 'pricing');
  assert.ok(pricingPage.confidence >= 0.8);

  const documentationPage = classifyProductPage({
    url: 'https://example.com/docs/quickstart',
    html: `
      <title>Developer documentation</title>
      <main><h1>Quickstart</h1><p>Install the SDK and create an API key.</p><pre>npm install example</pre></main>
    `,
  });
  assert.equal(documentationPage.pageType, 'documentation');

  const changelogPage = classifyProductPage({
    url: 'https://example.com/changelog',
    html: `
      <title>Product changelog</title>
      <main><h1>Release notes</h1><article><time>2026-07-27</time><p>v2.4.0 added exports and fixed login.</p></article></main>
    `,
  });
  assert.equal(changelogPage.pageType, 'changelog');

  const guideMentioningPricing = classifyProductPage({
    url: 'https://example.com/guides/ai-writing-tools',
    html: `
      <title>AI writing tools guide</title>
      <meta name="description" content="Compare writing workflows and output quality.">
      <main><h1>How to choose an AI writing tool</h1><p>Check pricing before choosing a tool.</p></main>
    `,
  });
  assert.notEqual(guideMentioningPricing.pageType, 'pricing');

  const extractedEvidence = extractProductEvidence({
    url: 'https://example.com/pricing',
    observedAt: '2026-07-27T00:00:00.000Z',
    html: `
      <title>Example | Pricing</title>
      <meta property="og:site_name" content="Example">
      <meta name="description" content="Example helps teams automate evidence-backed product research.">
      <meta property="og:image" content="/social-card.png">
      <main>
        <h1>Pricing</h1>
        <section class="pricing-plan">
          <h2>Pro</h2>
          <p>$19 per month</p>
          <p>Start with a free trial.</p>
        </section>
      </main>
    `,
  });
  assert.equal(extractedEvidence.pageType, 'pricing');
  assert.equal(extractedEvidence.claims.find(({ claimType }) => claimType === 'product_name')?.claimValue, 'Example');
  assert.deepEqual(extractedEvidence.claims.find(({ claimType }) => claimType === 'pricing_plan')?.claimValue, {
    name: 'Pro',
    priceText: '$19 per month',
  });
  assert.equal(
    extractedEvidence.claims.some(({ claimType }) => claimType === 'free_trial'),
    true,
  );
  assert.equal(
    extractedEvidence.claims.every(({ sourceUrl, sourceExcerpt }) => Boolean(sourceUrl && sourceExcerpt)),
    true,
  );
  assert.deepEqual(
    extractedEvidence.assets.map(({ sourceUrl }) => sourceUrl),
    ['https://example.com/social-card.png'],
  );

  const homepageTitleFallback = extractProductEvidence({
    url: 'https://aibesttool.com/',
    pageType: 'homepage',
    html: '<title>AI Best Tool - Explore curated AI tools and apps</title>',
  });
  assert.equal(
    homepageTitleFallback.claims.find(({ claimType }) => claimType === 'product_name')?.claimValue,
    'AI Best Tool',
  );

  const routeTitleIsNotAProductName = extractProductEvidence({
    url: 'https://aibesttool.com/guides/ai-writing-tools',
    pageType: 'other',
    html: '<title>Explore curated AI tools and apps</title><h1>AI writing tools</h1>',
  });
  assert.equal(
    routeTitleIsNotAProductName.claims.some(({ claimType }) => claimType === 'product_name'),
    false,
  );

  const errorPageIsNotEvidence = extractProductEvidence({
    url: 'https://aibesttool.com/broken',
    pageType: 'other',
    html: '<title>500: Internal Server Error</title><h1>Internal Server Error</h1>',
  });
  assert.equal(errorPageIsNotEvidence.claims.length, 0);

  const conflictResolution = resolveProductIntelligenceConflicts({
    sources: [
      {
        id: 'source-1',
        profileId: 'profile-1',
        url: 'https://example.com/',
        pageType: 'homepage',
        httpStatus: 200,
        canonicalUrl: 'https://example.com/',
        contentHash: 'hash-1',
        contentType: 'text/html',
        fetchedAt: '2026-07-27T00:00:00.000Z',
        fetchStatus: 'success',
        metadata: {},
      },
      {
        id: 'source-2',
        profileId: 'profile-1',
        url: 'https://example.com/pricing',
        pageType: 'pricing',
        httpStatus: 200,
        canonicalUrl: 'https://example.com/pricing',
        contentHash: 'hash-2',
        contentType: 'text/html',
        fetchedAt: '2026-07-27T00:00:00.000Z',
        fetchStatus: 'success',
        metadata: {},
      },
    ],
    claims: [
      {
        id: 'claim-1',
        profileId: 'profile-1',
        claimType: 'product_name',
        claimKey: 'product_name:1',
        claimValue: 'Example',
        sourceUrl: 'https://example.com/',
        sourceExcerpt: 'Example',
        observedAt: '2026-07-27T00:00:00.000Z',
        confidence: 90,
        conflictStatus: 'none',
        expiresAt: null,
      },
      {
        id: 'claim-2',
        profileId: 'profile-1',
        claimType: 'product_name',
        claimKey: 'product_name:2',
        claimValue: 'Example AI',
        sourceUrl: 'https://example.com/pricing',
        sourceExcerpt: 'Example AI',
        observedAt: '2026-07-27T00:00:00.000Z',
        confidence: 90,
        conflictStatus: 'none',
        expiresAt: null,
      },
    ],
  });
  assert.equal(conflictResolution.profileStatus, 'conflict');
  assert.equal(conflictResolution.conflicts.length, 2);
  assert.equal(
    conflictResolution.claims.every((claim) => claim.conflictStatus === 'confirmed'),
    true,
  );

  const snapshot = buildProductIntelligenceSnapshot({
    profile: {
      id: 'profile-1',
      ownerType: 'tool',
      ownerId: 'tool-1',
      canonicalDomain: 'example.com',
      productName: 'Example',
      status: 'pending',
      version: 1,
      lastCrawledAt: '2026-07-27T00:00:00.000Z',
      lastVerifiedAt: null,
      nextReviewAt: null,
      metadata: {},
    },
    sources: [
      {
        id: 'source-1',
        profileId: 'profile-1',
        url: 'https://example.com/',
        pageType: 'homepage',
        httpStatus: 200,
        canonicalUrl: 'https://example.com/',
        contentHash: 'hash-1',
        contentType: 'text/html',
        fetchedAt: '2026-07-27T00:00:00.000Z',
        fetchStatus: 'success',
        metadata: {},
      },
    ],
    claims: [
      {
        id: 'claim-1',
        profileId: 'profile-1',
        claimType: 'product_name',
        claimKey: 'product_name:1',
        claimValue: 'Example',
        sourceUrl: 'https://example.com/',
        sourceExcerpt: 'Example',
        observedAt: '2026-07-27T00:00:00.000Z',
        confidence: 90,
        conflictStatus: 'none',
        expiresAt: null,
      },
      {
        id: 'claim-2',
        profileId: 'profile-1',
        claimType: 'feature',
        claimKey: 'feature:1',
        claimValue: 'Team workflows',
        sourceUrl: 'https://example.com/',
        sourceExcerpt: 'Team workflows',
        observedAt: '2026-07-27T00:00:00.000Z',
        confidence: 70,
        conflictStatus: 'none',
        expiresAt: null,
      },
    ],
    assets: [],
  });
  assert.equal(snapshot.facts.productName, 'Example');
  assert.equal(snapshot.summary.claimCount, 2);
  assert.equal(snapshot.snapshotHash.length > 0, true);

  console.log('Product intelligence foundation checks passed.');
}

run();
