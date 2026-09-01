import type {
  ProductIntelligenceAsset,
  ProductIntelligenceClaim,
  ProductIntelligenceProfile,
  ProductIntelligenceSource,
} from './types';
import isVerifiedIntelligenceClaim from './claimVerification';

export interface EvidenceBoundComposerBlock {
  id: string;
  title: string;
  paragraph: string;
  claimIds: string[];
  sourceUrls: string[];
  notes: string[];
}

export interface EvidenceBoundComposerResult {
  profileName: string;
  canonicalDomain: string;
  generatedAt: string;
  blocks: EvidenceBoundComposerBlock[];
  warnings: string[];
  traceability: {
    verifiedClaimCount: number;
    sourceCount: number;
    assetCount: number;
    blockCount: number;
  };
}

function claimValueToText(value: unknown): string {
  if (typeof value === 'string') return value.trim();
  if (typeof value === 'number' || typeof value === 'boolean') return String(value);
  if (Array.isArray(value)) {
    return value
      .map((entry) => claimValueToText(entry))
      .filter(Boolean)
      .join(', ');
  }
  if (value && typeof value === 'object') {
    return Object.entries(value as Record<string, unknown>)
      .map(([key, entry]) => `${key}: ${claimValueToText(entry)}`)
      .filter(Boolean)
      .join(', ');
  }
  return '';
}

function summarizeSourceExcerpt(excerpt: string | null) {
  if (!excerpt) return null;
  const trimmed = excerpt.trim().replace(/\s+/g, ' ');
  if (!trimmed) return null;
  return trimmed.length > 180 ? `${trimmed.slice(0, 177)}...` : trimmed;
}

function selectClaims(
  claims: ProductIntelligenceClaim[],
  ...claimTypes: ProductIntelligenceClaim['claimType'][]
) {
  return claims.filter(
    (claim) => claimTypes.includes(claim.claimType) && isVerifiedIntelligenceClaim(claim),
  );
}

function collectSourceUrls(claims: ProductIntelligenceClaim[]) {
  return Array.from(new Set(claims.map((claim) => claim.sourceUrl).filter(Boolean)));
}

function collectClaimIds(claims: ProductIntelligenceClaim[]) {
  return claims.map((claim) => claim.id);
}

function joinClaimValues(claims: ProductIntelligenceClaim[]) {
  return claims
    .map((claim) => claimValueToText(claim.claimValue))
    .filter(Boolean)
    .filter((value, index, array) => array.indexOf(value) === index);
}

function buildBlock(input: {
  id: string;
  title: string;
  claims: ProductIntelligenceClaim[];
  paragraph: string;
  notes?: string[];
}): EvidenceBoundComposerBlock | null {
  if (input.claims.length === 0) return null;
  return {
    id: input.id,
    title: input.title,
    paragraph: input.paragraph,
    claimIds: collectClaimIds(input.claims),
    sourceUrls: collectSourceUrls(input.claims),
    notes: Array.from(new Set(input.notes || [])),
  };
}

export function composeEvidenceBoundContent(input: {
  profile: Pick<ProductIntelligenceProfile, 'productName' | 'canonicalDomain'>;
  sources: ProductIntelligenceSource[];
  claims: ProductIntelligenceClaim[];
  assets: ProductIntelligenceAsset[];
}): EvidenceBoundComposerResult {
  const verifiedClaims = input.claims.filter(isVerifiedIntelligenceClaim);
  const now = new Date().toISOString();
  const warnings: string[] = [];

  const positioningClaims = selectClaims(
    input.claims,
    'product_name',
    'one_line_positioning',
    'target_audience',
    'use_case',
  );
  const capabilityClaims = selectClaims(input.claims, 'feature', 'integration', 'supported_platform');
  const pricingClaims = selectClaims(
    input.claims,
    'pricing_model',
    'pricing_plan',
    'free_trial',
    'free_limit',
    'export_limit',
    'license_limit',
  );
  const trustClaims = selectClaims(
    input.claims,
    'security_claim',
    'official_social',
    'official_repository',
    'changelog_update',
    'limitation',
  );

  const logoAssets = input.assets.filter(
    (asset) => asset.assetType === 'logo' && !asset.isPlaceholder && asset.evidenceStatus !== 'rejected',
  );
  const screenshotAssets = input.assets.filter(
    (asset) => asset.assetType === 'screenshot' && !asset.isPlaceholder && asset.evidenceStatus !== 'rejected',
  );

  const blocks = [
    buildBlock({
      id: 'positioning',
      title: 'What this product is',
      claims: positioningClaims,
      paragraph: (() => {
        const nameClaim = positioningClaims.find((claim) => claim.claimType === 'product_name');
        const positioningClaim = positioningClaims.find((claim) => claim.claimType === 'one_line_positioning');
        const audienceValues = joinClaimValues(selectClaims(input.claims, 'target_audience'));
        const useCaseValues = joinClaimValues(selectClaims(input.claims, 'use_case'));
        const leadName = claimValueToText(nameClaim?.claimValue) || input.profile.productName;
        const leadPositioning = claimValueToText(positioningClaim?.claimValue);
        const audience = audienceValues[0] || null;
        const useCase = useCaseValues[0] || null;

        const fragments = [leadName];
        if (leadPositioning) fragments.push(`is positioned as ${leadPositioning}`);
        if (audience) fragments.push(`for ${audience}`);
        if (useCase) fragments.push(`and is used for ${useCase}`);
        return `${fragments.join(' ')}.`;
      })(),
      notes: [
        positioningClaims.some((claim) => claim.claimType === 'one_line_positioning')
          ? 'Includes a sourced one-line positioning claim.'
          : 'Positioning falls back to audience and use-case claims.',
      ],
    }),
    buildBlock({
      id: 'capabilities',
      title: 'What it can do',
      claims: capabilityClaims,
      paragraph: (() => {
        const features = joinClaimValues(selectClaims(input.claims, 'feature'));
        const integrations = joinClaimValues(selectClaims(input.claims, 'integration'));
        const platforms = joinClaimValues(selectClaims(input.claims, 'supported_platform'));
        const fragments: string[] = [];
        if (features.length > 0) fragments.push(`Core capabilities include ${features.join(', ')}`);
        if (integrations.length > 0) fragments.push(`integrations cover ${integrations.join(', ')}`);
        if (platforms.length > 0) fragments.push(`supported platforms are ${platforms.join(', ')}`);
        return `${fragments.join('; ')}.`.replace(/;\s*\./, '.');
      })(),
      notes: ['Only verified feature, integration, and platform claims are used.'],
    }),
    buildBlock({
      id: 'pricing',
      title: 'Pricing and limits',
      claims: pricingClaims,
      paragraph: (() => {
        const pricingModel = joinClaimValues(selectClaims(input.claims, 'pricing_model'));
        const pricingPlans = joinClaimValues(selectClaims(input.claims, 'pricing_plan'));
        const freeTrial = joinClaimValues(selectClaims(input.claims, 'free_trial'));
        const limits = joinClaimValues(selectClaims(input.claims, 'free_limit', 'export_limit', 'license_limit'));
        const fragments: string[] = [];
        if (pricingModel.length > 0) fragments.push(`Pricing model: ${pricingModel.join(', ')}`);
        if (pricingPlans.length > 0) fragments.push(`plans: ${pricingPlans.join(', ')}`);
        if (freeTrial.length > 0) fragments.push(`free access: ${freeTrial.join(', ')}`);
        if (limits.length > 0) fragments.push(`limits: ${limits.join(', ')}`);
        return `${fragments.join('; ')}.`.replace(/;\s*\./, '.');
      })(),
      notes: ['Every price or limit phrase must come from a verified claim before publish use.'],
    }),
    buildBlock({
      id: 'trust',
      title: 'Trust signals and caveats',
      claims: trustClaims,
      paragraph: (() => {
        const security = joinClaimValues(selectClaims(input.claims, 'security_claim'));
        const socials = joinClaimValues(selectClaims(input.claims, 'official_social'));
        const repos = joinClaimValues(selectClaims(input.claims, 'official_repository'));
        const updates = joinClaimValues(selectClaims(input.claims, 'changelog_update'));
        const limitations = joinClaimValues(selectClaims(input.claims, 'limitation'));
        const fragments: string[] = [];
        if (security.length > 0) fragments.push(`Security notes: ${security.join(', ')}`);
        if (socials.length > 0) fragments.push(`official social profiles: ${socials.join(', ')}`);
        if (repos.length > 0) fragments.push(`official repositories: ${repos.join(', ')}`);
        if (updates.length > 0) fragments.push(`recent updates: ${updates.join(', ')}`);
        if (limitations.length > 0) fragments.push(`known limitations: ${limitations.join(', ')}`);
        return `${fragments.join('; ')}.`.replace(/;\s*\./, '.');
      })(),
      notes: ['Known limitations are kept alongside trust signals so the copy stays balanced.'],
    }),
    buildBlock({
      id: 'assets',
      title: 'Verified assets',
      claims: verifiedClaims.filter((claim) => ['product_name', 'one_line_positioning'].includes(claim.claimType)),
      paragraph: (() => {
        const parts: string[] = [];
        if (logoAssets.length > 0) parts.push(`${logoAssets.length} verified logo asset${logoAssets.length === 1 ? '' : 's'}`);
        if (screenshotAssets.length > 0)
          parts.push(`${screenshotAssets.length} verified screenshot${screenshotAssets.length === 1 ? '' : 's'}`);
        return parts.length > 0
          ? `Available assets include ${parts.join(' and ')}.`
          : 'No verified logo or screenshot assets are available yet.';
      })(),
      notes: ['Only non-placeholder assets are counted here.'],
    }),
  ].filter((block): block is EvidenceBoundComposerBlock => Boolean(block));

  if (blocks.length === 0) {
    warnings.push('No verified claims were available for evidence-bound composition.');
  }
  if (blocks.length < 4) {
    warnings.push('One or more standard content blocks are still missing verified evidence.');
  }
  if (verifiedClaims.length === 0) {
    warnings.push('Publishable content cannot be composed until at least one verified claim exists.');
  }
  if (input.sources.length === 0) {
    warnings.push('No source records are attached to this profile.');
  }

  return {
    profileName: input.profile.productName,
    canonicalDomain: input.profile.canonicalDomain,
    generatedAt: now,
    blocks,
    warnings: Array.from(new Set(warnings)),
    traceability: {
      verifiedClaimCount: verifiedClaims.length,
      sourceCount: input.sources.length,
      assetCount: input.assets.length,
      blockCount: blocks.length,
    },
  };
}
