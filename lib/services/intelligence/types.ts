export type IntelligenceOwnerType = 'tool' | 'distribution_project';

export type IntelligenceProfileStatus = 'pending' | 'ready' | 'conflict' | 'stale';

export type IntelligencePageType =
  | 'homepage'
  | 'pricing'
  | 'features'
  | 'product'
  | 'use_case'
  | 'documentation'
  | 'changelog'
  | 'about'
  | 'security'
  | 'terms'
  | 'license'
  | 'repository'
  | 'help'
  | 'other';

export type IntelligenceFetchStatus = 'pending' | 'success' | 'blocked' | 'failed';

export type IntelligenceDiscoveryMethod = 'homepage_link' | 'sitemap' | 'common_path';

export type IntelligenceConflictStatus = 'none' | 'possible' | 'confirmed';

export type IntelligenceAssetType = 'logo' | 'screenshot' | 'social' | 'video';

export type IntelligenceEvidenceStatus = 'candidate' | 'verified' | 'rejected';

export type IntelligenceClaimType =
  | 'product_name'
  | 'one_line_positioning'
  | 'target_audience'
  | 'use_case'
  | 'feature'
  | 'integration'
  | 'supported_platform'
  | 'pricing_model'
  | 'pricing_plan'
  | 'free_trial'
  | 'free_limit'
  | 'export_limit'
  | 'license_limit'
  | 'security_claim'
  | 'official_social'
  | 'official_repository'
  | 'changelog_update'
  | 'limitation';

export interface ProductIntelligenceProfile {
  id: string;
  ownerType: IntelligenceOwnerType;
  ownerId: string;
  canonicalDomain: string;
  productName: string;
  status: IntelligenceProfileStatus;
  version: number;
  lastCrawledAt: string | null;
  lastVerifiedAt: string | null;
  nextReviewAt: string | null;
  metadata: Record<string, unknown>;
}

export interface ProductIntelligenceSource {
  id: string;
  profileId: string;
  url: string;
  pageType: IntelligencePageType;
  httpStatus: number | null;
  canonicalUrl: string | null;
  contentHash: string | null;
  contentType: string | null;
  fetchedAt: string | null;
  fetchStatus: IntelligenceFetchStatus;
  metadata: Record<string, unknown>;
}

export interface DiscoveredIntelligencePage {
  url: string;
  pageType: IntelligencePageType;
  discoveryMethod: IntelligenceDiscoveryMethod;
  score: number;
  anchorText: string | null;
}

export type IntelligenceClassificationSignalSource =
  | 'url'
  | 'title'
  | 'metadata'
  | 'heading'
  | 'structured_data'
  | 'body';

export interface IntelligenceClassificationSignal {
  pageType: IntelligencePageType;
  source: IntelligenceClassificationSignalSource;
  weight: number;
  value: string;
}

export interface IntelligencePageClassification {
  pageType: IntelligencePageType;
  confidence: number;
  score: number;
  alternatives: Array<{ pageType: IntelligencePageType; score: number }>;
  signals: IntelligenceClassificationSignal[];
}

export interface ProductIntelligenceClaim {
  id: string;
  profileId: string;
  claimType: IntelligenceClaimType;
  claimKey: string;
  claimValue: unknown;
  sourceUrl: string;
  sourceExcerpt: string | null;
  observedAt: string;
  confidence: number;
  conflictStatus: IntelligenceConflictStatus;
  expiresAt: string | null;
}

export interface ProductIntelligenceAsset {
  id: string;
  profileId: string;
  assetType: IntelligenceAssetType;
  sourceUrl: string;
  storedUrl: string | null;
  width: number | null;
  height: number | null;
  isPlaceholder: boolean;
  evidenceStatus: IntelligenceEvidenceStatus;
}

export interface ExtractedIntelligenceClaim {
  claimType: IntelligenceClaimType;
  claimKey: string;
  claimValue: unknown;
  sourceUrl: string;
  sourceExcerpt: string | null;
  observedAt: string;
  confidence: number;
  expiresAt: string | null;
}

export interface ExtractedIntelligenceAsset {
  assetType: IntelligenceAssetType;
  sourceUrl: string;
  width: number | null;
  height: number | null;
  isPlaceholder: boolean;
  evidenceStatus: IntelligenceEvidenceStatus;
}

export interface ProductEvidenceExtraction {
  pageType: IntelligencePageType;
  claims: ExtractedIntelligenceClaim[];
  assets: ExtractedIntelligenceAsset[];
  warnings: string[];
}

export type ContentQualityDimension =
  | 'evidence'
  | 'factualConsistency'
  | 'decisionValue'
  | 'uniqueness'
  | 'searchAndCategoryFit'
  | 'freshness'
  | 'mediaIntegrity';

export interface ContentQualityBreakdown {
  evidence: number;
  factualConsistency: number;
  decisionValue: number;
  uniqueness: number;
  searchAndCategoryFit: number;
  freshness: number;
  mediaIntegrity: number;
}

export type ContentPublishDecision = 'publish_ready' | 'review_required' | 'enrich' | 'hold';

export interface ContentQualityResult {
  total: number;
  breakdown: ContentQualityBreakdown;
  decision: ContentPublishDecision;
  blockers: string[];
}

export type DistributionTargetStatus = 'active' | 'stale' | 'blocked' | 'retired';

export type DistributionObstacle =
  | 'paid_required'
  | 'account_required'
  | 'captcha_blocked'
  | 'missing_asset'
  | 'manual_verification_required'
  | 'rule_conflict';

export interface DistributionTargetProfile {
  id: string;
  channelId: string;
  name: string;
  homepageUrl: string;
  submissionUrl: string | null;
  registrationUrl: string | null;
  pricingUrl: string | null;
  audience: string | null;
  status: DistributionTargetStatus;
  requiresAccount: boolean | null;
  requiresPayment: boolean | null;
  requiresCaptcha: boolean | null;
  requiresBacklink: boolean | null;
  editorialReview: boolean | null;
  expectedReviewDays: number | null;
  lastCheckedAt: string | null;
  nextCheckAt: string | null;
  confidence: number;
}
