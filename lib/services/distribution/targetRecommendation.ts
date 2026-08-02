export interface DistributionTargetCandidate {
  id: string;
  channelId: string;
  name: string;
  channelName: string;
  channelType: string;
  homepageUrl: string;
  submissionUrl: string | null;
  registrationUrl: string | null;
  pricingUrl: string | null;
  audience: string | null;
  requiresAccount: boolean;
  requiresPayment: boolean;
  requiresCaptcha: boolean;
  requiresBacklink: boolean;
  editorialReview: boolean;
  expectedReviewDays: number | null;
  confidence: number;
}

export interface DistributionTargetRecommendation extends DistributionTargetCandidate {
  score: number;
  reasons: string[];
  estimatedMinutes: number;
  readiness: 'ready' | 'manual_step' | 'review';
}

function goalBonus(primaryGoal: string | null, channelType: string): number {
  if (primaryGoal === 'launch' && channelType === 'startup') return 15;
  if (primaryGoal === 'community_feedback' && ['community', 'reddit'].includes(channelType)) return 15;
  if (primaryGoal === 'editorial_mentions' && ['newsletter', 'blog'].includes(channelType)) return 15;
  if (primaryGoal === 'directory_coverage' && ['directory', 'alternative'].includes(channelType)) return 15;
  if (primaryGoal === 'referral_traffic' && ['directory', 'alternative', 'startup', 'newsletter'].includes(channelType))
    return 10;
  return 2;
}

function productTypeBonus(productType: DistributionProductType | null, channelType: string): number {
  if (!productType || productType === 'other') return 0;
  const preferredChannels: Partial<Record<DistributionProductType, string[]>> = {
    ai_saas: ['directory', 'alternative', 'startup'],
    developer_api: ['github', 'community', 'newsletter', 'startup'],
    open_source: ['github', 'community', 'reddit', 'newsletter'],
    mobile_app: ['directory', 'startup', 'community'],
    content_newsletter: ['newsletter', 'community', 'blog'],
    agency_service: ['directory', 'newsletter', 'blog'],
    web3: ['community', 'newsletter', 'blog', 'reddit'],
  };
  return preferredChannels[productType]?.includes(channelType) ? 10 : -2;
}

export function recommendDistributionTargets(
  targets: DistributionTargetCandidate[],
  input: {
    primaryGoal: string | null;
    budgetPreference: string | null;
    productType?: DistributionProductType | null;
    limit?: number;
  },
): DistributionTargetRecommendation[] {
  return targets
    .filter((target) => !(input.budgetPreference === 'free_only' && target.requiresPayment))
    .map((target) => {
      const reasons: string[] = [];
      const typeBonus = productTypeBonus(input.productType || null, target.channelType);
      let score = 45 + Math.round(target.confidence * 0.25) + goalBonus(input.primaryGoal, target.channelType) + typeBonus;
      if (target.submissionUrl) {
        score += 8;
        reasons.push('A verified submission entry is available.');
      } else {
        score -= 8;
        reasons.push('The submission entry still needs manual confirmation.');
      }
      if (target.requiresPayment) {
        score -= input.budgetPreference === 'paid_selective' ? 2 : 10;
        reasons.push('Payment is required before or during submission.');
      }
      if (target.requiresCaptcha) {
        score -= 5;
        reasons.push('A human CAPTCHA step is expected.');
      }
      if (target.requiresAccount) reasons.push('Create or reuse an account before submitting.');
      if (target.editorialReview)
        reasons.push(
          `Editorial review${target.expectedReviewDays ? ` usually takes about ${target.expectedReviewDays} days` : ' is required'}.`,
        );
      if (goalBonus(input.primaryGoal, target.channelType) >= 10)
        reasons.unshift('This channel matches the project primary goal.');
      if (typeBonus >= 10) reasons.unshift('This channel fits the product type.');
      const estimatedMinutes =
        10 + (target.requiresAccount ? 5 : 0) + (target.requiresCaptcha ? 3 : 0) + (target.requiresPayment ? 5 : 0);
      const readiness: DistributionTargetRecommendation['readiness'] = !target.submissionUrl
        ? 'review'
        : target.requiresAccount || target.requiresCaptcha || target.requiresPayment
          ? 'manual_step'
          : 'ready';
      return {
        ...target,
        score: Math.max(0, Math.min(100, score)),
        reasons: reasons.slice(0, 4),
        estimatedMinutes,
        readiness,
      };
    })
    .sort((a, b) => b.score - a.score || b.confidence - a.confidence || a.name.localeCompare(b.name))
    .slice(0, input.limit || 12);
}
import type { DistributionProductType } from './listingBridge';
