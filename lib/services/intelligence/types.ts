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

export interface ProductIntelligenceChange {
  id: string;
  profileId: string;
  sourceUrl: string;
  claimType: IntelligenceClaimType;
  claimKey: string;
  changeType: 'added' | 'changed' | 'removed';
  oldValue: unknown | null;
  newValue: unknown | null;
  oldExcerpt: string | null;
  newExcerpt: string | null;
  fingerprint: string;
  reviewStatus: 'pending' | 'accepted' | 'rejected';
  detectedAt: string;
  reviewedAt: string | null;
  reviewNote: string | null;
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

export type DistributionTargetPageType =
  | 'homepage'
  | 'submission'
  | 'registration'
  | 'pricing'
  | 'contact'
  | 'community'
  | 'documentation'
  | 'other';

export type DistributionTargetDiscoveryMethod = 'homepage_link' | 'sitemap' | 'common_path';

export interface DistributionTargetPageDiscovery {
  url: string;
  pageType: DistributionTargetPageType;
  discoveryMethod: DistributionTargetDiscoveryMethod;
  score: number;
  anchorText: string | null;
  title: string | null;
  excerpt: string | null;
  httpStatus: number | null;
  finalUrl: string;
  signals: string[];
}

export interface DistributionTargetRequirements {
  requiresAccount: boolean;
  requiresPayment: boolean;
  requiresCaptcha: boolean;
  requiresBacklink: boolean;
  editorialReview: boolean;
  expectedReviewDays: number | null;
}

export interface DistributionTargetDiscoveryResult {
  homepageUrl: string;
  finalUrl: string;
  targetStatus: DistributionTargetStatus;
  pages: DistributionTargetPageDiscovery[];
  sitemapUrls: string[];
  warnings: string[];
  signals: {
    homepageTitle: string | null;
    inspectedCount: number;
    blockedSignals: string[];
  };
  requirements: DistributionTargetRequirements;
  submissionUrl: string | null;
  registrationUrl: string | null;
  pricingUrl: string | null;
  contactUrl: string | null;
  communityUrl: string | null;
}

export type DistributionTargetRuleKind =
  | 'submission_entry'
  | 'registration_requirement'
  | 'payment_requirement'
  | 'captcha_requirement'
  | 'backlink_requirement'
  | 'editorial_review'
  | 'field_requirement'
  | 'asset_requirement'
  | 'manual_verification'
  | 'risk_note';

export type DistributionTargetRuleSeverity = 'info' | 'warn' | 'block';

export interface DistributionTargetRuleFinding {
  kind: DistributionTargetRuleKind;
  severity: DistributionTargetRuleSeverity;
  label: string;
  value: string | number | boolean | null;
  sourceUrl: string | null;
  evidence: string[];
  confidence: number;
}

export interface DistributionTargetFieldRequirement {
  fieldName: string;
  required: boolean;
  fieldType: 'text' | 'url' | 'email' | 'textarea' | 'select' | 'file' | 'checkbox' | 'unknown';
  characterLimit: number | null;
  allowedValues: string[];
  requiredAsset: string | null;
  sourceUrls: string[];
  evidence: string[];
  confidence: number;
}

export interface DistributionTargetAnalysisResult {
  homepageUrl: string;
  finalUrl: string;
  targetStatus: DistributionTargetStatus;
  pageCount: number;
  matchScore: DistributionTargetMatchScore;
  rules: DistributionTargetRuleFinding[];
  fieldRequirements: DistributionTargetFieldRequirement[];
  blockedReasons: string[];
  obstacles: DistributionTargetObstacleFinding[];
  obstacleStatus: 'clear' | 'needs_review' | 'blocked';
  nextAction: 'review' | 'retry' | 'manual' | 'ready';
  summary: string;
  snapshot: {
    visibleRules: Array<{ label: string; value: string; sourceUrl: string | null }>;
    pricingInfo: Array<{ label: string; value: string; sourceUrl: string | null }>;
    formFields: Array<{
      fieldName: string;
      fieldType: string;
      required: boolean;
      characterLimit: number | null;
      requiredAsset: string | null;
    }>;
    notes: string[];
  };
}

export interface DistributionTargetObstacleFinding {
  obstacle: DistributionObstacle;
  severity: 'info' | 'warn' | 'block';
  label: string;
  value: string | number | boolean | null;
  sourceUrl: string | null;
  evidence: string[];
  confidence: number;
}

export type DistributionTargetMatchGrade = 'excellent' | 'good' | 'moderate' | 'hard' | 'blocked';

export interface DistributionTargetMatchReason {
  label: string;
  impact: number;
  kind: 'bonus' | 'penalty';
  sourceUrl: string | null;
  detail: string;
}

export interface DistributionTargetMatchScore {
  score: number;
  maxScore: number;
  grade: DistributionTargetMatchGrade;
  summary: string;
  reasons: DistributionTargetMatchReason[];
}
