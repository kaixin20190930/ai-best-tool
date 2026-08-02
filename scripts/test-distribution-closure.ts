import assert from 'node:assert/strict';

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
