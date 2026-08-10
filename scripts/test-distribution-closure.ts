import assert from 'node:assert/strict';
import { existsSync, readFileSync } from 'node:fs';

function assertContains(source: string, pattern: RegExp | string, message: string) {
  const matcher = typeof pattern === 'string' ? new RegExp(pattern.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'i') : pattern;
  assert.match(source, matcher, message);
}

import {
  recommendDistributionTargets,
  type DistributionTargetCandidate,
} from '@/lib/services/distribution/targetRecommendation';
import { composeDistributionPackage } from '@/lib/services/distribution/packageComposer';
import {
  canReuseDistributionListing,
  getDistributionAssetGuidance,
  inferDistributionProductType,
  normalizeDistributionDomain,
} from '@/lib/services/distribution/listingBridge';
import { buildDistributionTaskDetail } from '@/lib/services/distribution/taskDetail';

const distributionActionsSource = readFileSync(
  new URL('../app/actions/distribution.ts', import.meta.url),
  'utf8',
);
assert.equal(
  distributionActionsSource.includes('distribution_targets(id, name)'),
  false,
  'Dashboard task queries must not rely on an implicit distribution_tasks-to-targets PostgREST relationship.',
);
assert.equal(
  distributionActionsSource.includes(".from('distribution_targets')"),
  false,
  'The Neon-backed target registry must not be queried through the Supabase client.',
);
assert.equal(
  distributionActionsSource.includes(".from('distribution_target_snapshots')"),
  false,
  'Workspace feedback must be written to the Neon-backed target registry.',
);

const distributionWorkspaceSource = readFileSync(
  new URL('../components/distribution/DistributionWorkspaceChrome.tsx', import.meta.url),
  'utf8',
);
const distributionLayoutSource = readFileSync(
  new URL('../app/[locale]/(with-footer)/distribution/layout.tsx', import.meta.url),
  'utf8',
);
const distributionActionCenterSource = readFileSync(
  new URL('../components/distribution/DistributionActionCenter.tsx', import.meta.url),
  'utf8',
);
const distributionTasksPageSource = readFileSync(
  new URL('../app/[locale]/(with-footer)/distribution/tasks/page.tsx', import.meta.url),
  'utf8',
);
const distributionTaskDetailSource = readFileSync(
  new URL('../app/[locale]/(with-footer)/distribution/tasks/[taskId]/page.tsx', import.meta.url),
  'utf8',
);
const distributionOpportunitiesSource = readFileSync(
  new URL('../app/[locale]/(with-footer)/distribution/opportunities/page.tsx', import.meta.url),
  'utf8',
);
const distributionMonitoringSource = readFileSync(
  new URL('../app/[locale]/(with-footer)/distribution/monitoring/page.tsx', import.meta.url),
  'utf8',
);
const distributionProductsSource = readFileSync(
  new URL('../app/[locale]/(with-footer)/distribution/products/page.tsx', import.meta.url),
  'utf8',
);
const distributionReportsSource = readFileSync(
  new URL('../app/[locale]/(with-footer)/distribution/reports/page.tsx', import.meta.url),
  'utf8',
);
const distributionSettingsSource = readFileSync(
  new URL('../app/[locale]/(with-footer)/distribution/settings/page.tsx', import.meta.url),
  'utf8',
);
const distributionLandingSource = readFileSync(
  new URL('../app/[locale]/(with-footer)/distribution/page.tsx', import.meta.url),
  'utf8',
);

const distributionRouteSources = {
  '/distribution': distributionLandingSource,
  '/distribution/products': distributionProductsSource,
  '/distribution/opportunities': distributionOpportunitiesSource,
  '/distribution/tasks': distributionTasksPageSource,
  '/distribution/tasks/[taskId]': distributionTaskDetailSource,
  '/distribution/monitoring': distributionMonitoringSource,
  '/distribution/reports': distributionReportsSource,
  '/distribution/settings': distributionSettingsSource,
};

const requiredDistributionPages = [
  'app/[locale]/(with-footer)/distribution/page.tsx',
  'app/[locale]/(with-footer)/distribution/products/page.tsx',
  'app/[locale]/(with-footer)/distribution/opportunities/page.tsx',
  'app/[locale]/(with-footer)/distribution/tasks/page.tsx',
  'app/[locale]/(with-footer)/distribution/tasks/[taskId]/page.tsx',
  'app/[locale]/(with-footer)/distribution/monitoring/page.tsx',
  'app/[locale]/(with-footer)/distribution/reports/page.tsx',
  'app/[locale]/(with-footer)/distribution/settings/page.tsx',
  'components/distribution/DistributionWorkspaceChrome.tsx',
  'components/distribution/DistributionActionCenter.tsx',
].map((relativePath) => new URL(`../${relativePath}`, import.meta.url).pathname);

for (const absPath of requiredDistributionPages) {
  assert.equal(
    existsSync(absPath),
    true,
    `Distribution route or component must exist: ${absPath}`,
  );
}

assertContains(distributionLayoutSource, 'DistributionActionCenter', 'Distribution layout must mount the global action center.');
assertContains(distributionWorkspaceSource, 'const workspaceItems =', 'Workspace must define stable primary navigation.');
assertContains(distributionWorkspaceSource, "href: '/distribution'", 'Workspace must include Today route entry.');
assertContains(distributionWorkspaceSource, "href: '/distribution/products'", 'Workspace must include Product Profile route entry.');
assertContains(distributionWorkspaceSource, "href: '/distribution/opportunities'", 'Workspace must include Opportunities route entry.');
assertContains(distributionWorkspaceSource, "href: '/distribution/tasks'", 'Workspace must include Execution Tasks route entry.');
assertContains(distributionWorkspaceSource, "href: '/distribution/monitoring'", 'Workspace must include Monitoring route entry.');
assertContains(distributionWorkspaceSource, "href: '/distribution/reports'", 'Workspace must include Reports route entry.');
assertContains(distributionActionCenterSource, 'distribution:action-center', 'Action Center events must be emitted under the standard name.');
assertContains(distributionTasksPageSource, 'renderQuickStatusForm', 'Task queue page should expose quick status actions.');
assertContains(distributionTasksPageSource, 'DistributionActionForm', 'Task queue page should use shared action form wrapper.');
assertContains(distributionTasksPageSource, 'DistributionSubmitButton', 'Task queue page should expose submit-state buttons.');

assertContains(distributionTaskDetailSource, 'DistributionActionForm', 'Task detail page should use shared action form wrapper.');
assertContains(distributionTaskDetailSource, 'DistributionSubmitButton', 'Task detail page should expose pending-state buttons.');
assertContains(distributionTaskDetailSource, 'DistributionActionButton', 'Task detail page should support primary action button standardization.');

assertContains(distributionOpportunitiesSource, 'DistributionActionForm', 'Opportunities page should use shared action form for target acceptance.');
assertContains(distributionOpportunitiesSource, 'acceptDistributionTarget', 'Opportunities page should call target acceptance workflow.');

assertContains(distributionMonitoringSource, 'recheckDistributionTaskResult', 'Monitoring page should provide recheck action for links.');
assertContains(distributionMonitoringSource, 'deriveDistributionPresentationState', 'Monitoring page should use presentation-state selector.');

assertContains(distributionLandingSource, 'buildTodayList', 'Today workspace should include 1-3 priority action list.');
assertContains(distributionLandingSource, 'deriveDistributionPresentationState', 'Today workspace should use presentation-state selector.');
assertContains(distributionProductsSource, 'getDistributionDashboard', 'Product profile page should be fed by dashboard data.');
assertContains(distributionProductsSource, 'updateDistributionProjectProfile', 'Product profile page should support updating project profile facts.');
assertContains(distributionProductsSource, 'createDistributionProjectAsset', 'Product profile page should support adding reusable assets.');
assertContains(distributionProductsSource, 'importDistributionCatalogListing', 'Product profile page should support importing listing-backed data.');
assertContains(distributionReportsSource, 'data.metrics', 'Reports page should expose operational metrics.');
assertContains(distributionReportsSource, 'Attribution signals', 'Reports page should expose attribution signal section.');
assertContains(distributionSettingsSource, 'getDistributionPriceId', 'Settings page should expose pricing entrypoints.');

const localeAwareDistributionHref = /\/\$\{(?:locale|currentLocale|params\.locale)\}\/distribution/;
for (const route of requiredDistributionPages) {
  const source = readFileSync(route).toString();
  if (!route.includes('components/')) {
    assert.equal(
      localeAwareDistributionHref.test(source),
      true,
      `Route ${route} should preserve locale path usage.`,
    );
  }
}

const targets: DistributionTargetCandidate[] = [
  {
    id: 'startup',
    channelId: 'startup-channel',
    name: 'Launch Site',
    channelName: 'Startup launches',
    channelType: 'startup',
    homepageUrl: 'https://launch.example',
    submissionUrl: 'https://launch.example/submit',
    registrationUrl: 'https://launch.example/register',
    pricingUrl: null,
    audience: 'Founders',
    requiresAccount: true,
    requiresPayment: false,
    requiresCaptcha: false,
    requiresBacklink: false,
    editorialReview: true,
    expectedReviewDays: 3,
    confidence: 90,
  },
  {
    id: 'paid-directory',
    channelId: 'directory-channel',
    name: 'Paid Directory',
    channelName: 'AI directories',
    channelType: 'directory',
    homepageUrl: 'https://paid.example',
    submissionUrl: 'https://paid.example/submit',
    registrationUrl: null,
    pricingUrl: 'https://paid.example/pricing',
    audience: 'AI buyers',
    requiresAccount: false,
    requiresPayment: true,
    requiresCaptcha: false,
    requiresBacklink: false,
    editorialReview: false,
    expectedReviewDays: null,
    confidence: 100,
  },
  {
    id: 'unclear-community',
    channelId: 'community-channel',
    name: 'Unclear Community',
    channelName: 'Communities',
    channelType: 'community',
    homepageUrl: 'https://community.example',
    submissionUrl: null,
    registrationUrl: null,
    pricingUrl: null,
    audience: 'Operators',
    requiresAccount: false,
    requiresPayment: false,
    requiresCaptcha: false,
    requiresBacklink: false,
    editorialReview: false,
    expectedReviewDays: null,
    confidence: 60,
  },
];

const freeLaunchRecommendations = recommendDistributionTargets(targets, {
  primaryGoal: 'launch',
  budgetPreference: 'free_only',
});

assert.equal(
  freeLaunchRecommendations.some((target) => target.id === 'paid-directory'),
  false,
  'Free-only projects must exclude paid targets.',
);
assert.equal(freeLaunchRecommendations[0]?.id, 'startup', 'Launch goals should prioritize a qualified startup target.');
assert.equal(
  freeLaunchRecommendations[0]?.readiness,
  'manual_step',
  'Account requirements must remain visible as a manual step.',
);

const communityRecommendations = recommendDistributionTargets(targets, {
  primaryGoal: 'community_feedback',
  budgetPreference: 'paid_selective',
  limit: 2,
});

assert.equal(communityRecommendations.length, 2, 'Recommendation limits must be respected.');
const unclearCommunity = recommendDistributionTargets([targets[2]], {
  primaryGoal: 'community_feedback',
  budgetPreference: 'free_first',
})[0];
assert.equal(unclearCommunity.readiness, 'review', 'Targets without a verified submission entry must require review.');
assert.ok(
  unclearCommunity.reasons.some((reason) => reason.includes('manual confirmation')),
  'Unverified entry points need an explicit reason.',
);

const detail = buildDistributionTaskDetail({
  task: {
    id: 'task-1',
    title: 'Submit to Launch Site',
    status: 'in_progress',
    priority: 'p0',
    taskType: 'submit',
    dueDate: null,
    instructions: null,
    notes: null,
    liveUrl: null,
    linkStatus: null,
    updatedAt: null,
  },
  project: {
    id: 'project-1',
    name: 'Example Product',
    websiteUrl: 'https://example.com',
    description: 'A verified product description that explains the real user outcome clearly.',
  },
  channel: {
    id: 'startup-channel',
    name: 'Startup launches',
    channelType: 'startup',
    instructions: null,
    template: null,
  },
  target: {
    id: 'startup',
    name: 'Launch Site',
    homepageUrl: 'https://launch.example',
    submissionUrl: 'https://launch.example/submit',
    registrationUrl: null,
    pricingUrl: null,
    requiresAccount: true,
    requiresPayment: false,
    requiresCaptcha: false,
    requiresBacklink: false,
    editorialReview: true,
    expectedReviewDays: 3,
    confidence: 90,
  },
  recentResult: null,
  queue: [],
});

const blockedPackage = composeDistributionPackage({
  detail,
  requirements: [
    {
      requiredField: 'Logo',
      fieldType: 'asset',
      characterLimit: null,
      requiredAsset: 'logo',
      ruleText: 'A logo is required.',
      sourceUrl: 'https://launch.example/submit',
    },
  ],
  availableAssetTypes: [],
});
assert.equal(blockedPackage.ready, false, 'A missing required asset must block submission readiness.');
assert.deepEqual(blockedPackage.missingAssets, ['logo']);

const readyPackage = composeDistributionPackage({
  detail,
  requirements: [],
  availableAssetTypes: ['logo'],
});
assert.equal(readyPackage.ready, true, 'A complete base package should be ready for human submission.');

const packageWithManualTargetFields = composeDistributionPackage({
  detail,
  requirements: [
    {
      requiredField: 'email',
      fieldType: 'email',
      characterLimit: null,
      requiredAsset: null,
      ruleText: 'Sign in with an account email.',
      sourceUrl: 'https://launch.example/register',
    },
    {
      requiredField: 'category',
      fieldType: 'select',
      characterLimit: null,
      requiredAsset: null,
      ruleText: 'Choose the closest category.',
      sourceUrl: 'https://launch.example/submit',
    },
  ],
  availableAssetTypes: ['logo'],
});
assert.equal(
  packageWithManualTargetFields.ready,
  true,
  'Account and select fields completed on the target site must not block package readiness.',
);
assert.equal(packageWithManualTargetFields.fields.find((field) => field.key === 'email')?.manual, true);
assert.equal(packageWithManualTargetFields.fields.find((field) => field.key === 'category')?.manual, true);
assert.equal(packageWithManualTargetFields.warnings.length, 2);

assert.equal(normalizeDistributionDomain('https://www.Moxion.ai/path'), 'moxion.ai');
assert.equal(
  canReuseDistributionListing({
    isAdmin: true,
    userId: 'admin-user',
    projectUrl: 'https://moxion.ai',
    listingUrl: 'https://www.moxion.ai/',
    submittedBy: 'another-user',
  }),
  true,
  'Admins may connect a listing only when its official domain exactly matches the project.',
);
assert.equal(
  canReuseDistributionListing({
    isAdmin: true,
    userId: 'admin-user',
    projectUrl: 'https://moxion.ai',
    listingUrl: 'https://example.com',
    submittedBy: 'another-user',
  }),
  false,
  'Admin access must not bypass the exact-domain requirement.',
);
assert.equal(
  canReuseDistributionListing({
    isAdmin: false,
    userId: 'owner-user',
    email: 'owner@example.com',
    projectUrl: 'https://moxion.ai',
    listingUrl: 'https://moxion.ai',
    submittedBy: 'owner-user',
  }),
  true,
  'The original submitter may reuse their listing.',
);
assert.equal(
  canReuseDistributionListing({
    isAdmin: false,
    userId: 'owner-user',
    email: 'Owner@Example.com',
    projectUrl: 'https://moxion.ai',
    listingUrl: 'https://moxion.ai',
    submittedBy: 'another-user',
    submittedByEmail: 'owner@example.com',
  }),
  true,
  'A verified submission email match may reuse the listing.',
);
assert.equal(
  canReuseDistributionListing({
    isAdmin: false,
    userId: 'unrelated-user',
    email: 'unrelated@example.com',
    projectUrl: 'https://moxion.ai',
    listingUrl: 'https://moxion.ai',
    submittedBy: 'another-user',
    submittedByEmail: 'owner@example.com',
  }),
  false,
  'An unrelated account cannot import a listing even when the project domain matches.',
);
assert.equal(
  inferDistributionProductType({ categoryName: 'Developer Tools', tags: ['api', 'sdk'] }),
  'developer_api',
  'Developer listings should receive developer-specific guidance.',
);
assert.equal(
  inferDistributionProductType({ categoryName: 'Web3', tags: ['defi'] }),
  'web3',
  'Web3 must take precedence over generic AI terminology.',
);
assert.equal(
  getDistributionAssetGuidance('mobile_app').find((item) => item.key === 'screenshot')?.required,
  true,
  'Mobile app screenshots are a required distribution asset.',
);

const developerRecommendations = recommendDistributionTargets(targets, {
  primaryGoal: 'directory_coverage',
  budgetPreference: 'free_first',
  productType: 'developer_api',
});
assert.ok(developerRecommendations.length > 0, 'Product-type scoring must preserve eligible recommendations.');

console.log('✅ Distribution closure recommendation tests passed.');
