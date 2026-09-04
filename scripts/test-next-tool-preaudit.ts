import fs from 'node:fs';
import path from 'node:path';

type ReleaseBoundary = {
  label: string;
  releaseGuard: string;
  restrictedSummary?: string;
  summary?: string;
};

type Preaudit = {
  action: string;
  decisionAngles: string[];
  existingRoute: string;
  licenseBoundary?: ReleaseBoundary;
  limitations: string[];
  marketValidation: {
    recurringUserFriction: string[];
    score: number;
    strongSignals: string[];
    verdict: string;
  };
  nextSlotChecklist: string[];
  policyBoundaries?: ReleaseBoundary[];
  pricingSnapshot: {
    billingUnit: string;
    checkedAt: string;
    releaseGuard: string;
    volatileFields: string[];
  };
  productionWriteApproved: boolean;
  publishNotBefore: string;
  releasedAt?: string;
  reviewedAt: string;
  sitemapChangeApproved: boolean;
  slug: string;
  sources: {
    independent: string[];
    official: string[];
  };
  status: string;
};

const collectionDir = path.join(process.cwd(), 'data', 'collection');
const preauditPaths = fs
  .readdirSync(collectionDir)
  .filter((file) => file.endsWith('.json') && file.includes('-preaudit-'))
  .sort()
  .map((file) => path.join(collectionDir, file));

if (preauditPaths.length === 0) {
  throw new Error('At least one controlled tool preaudit is required.');
}

for (const preauditPath of preauditPaths) {
  const preaudit = JSON.parse(fs.readFileSync(preauditPath, 'utf8')) as Preaudit;
  const label = preaudit.slug || path.basename(preauditPath);

  if (!preaudit.slug || preaudit.existingRoute !== `/ai/${preaudit.slug}`) {
    throw new Error(`${label}: preaudit must target its existing canonical fallback route.`);
  }

  if (
    preaudit.action !== 'migrate_existing_fallback' ||
    !['ready_for_next_slot', 'released'].includes(preaudit.status)
  ) {
    throw new Error(`${label}: preaudit must remain a controlled migration candidate.`);
  }

  if (preaudit.publishNotBefore <= preaudit.reviewedAt) {
    throw new Error(`${label}: the publication guard must reserve a later release slot.`);
  }

  if (preaudit.status === 'ready_for_next_slot') {
    if (preaudit.productionWriteApproved || preaudit.sitemapChangeApproved || preaudit.releasedAt) {
      throw new Error(`${label}: an unreleased preaudit cannot approve production changes.`);
    }
  } else if (
    !preaudit.productionWriteApproved ||
    !preaudit.sitemapChangeApproved ||
    !preaudit.releasedAt ||
    preaudit.releasedAt < preaudit.publishNotBefore
  ) {
    throw new Error(`${label}: a released migration needs dated production and sitemap approval.`);
  }

  if (preaudit.sources.official.length < 5 || preaudit.sources.independent.length < 2) {
    throw new Error(`${label}: at least five official and two independent sources are required.`);
  }

  const allSources = [...preaudit.sources.official, ...preaudit.sources.independent];
  if (new Set(allSources).size !== allSources.length || allSources.some((url) => !url.startsWith('https://'))) {
    throw new Error(`${label}: sources must be unique HTTPS URLs.`);
  }

  if (preaudit.decisionAngles.length < 5 || preaudit.limitations.length < 5 || preaudit.nextSlotChecklist.length < 5) {
    throw new Error(`${label}: decision, limitation, or release-gate depth is incomplete.`);
  }

  if (
    preaudit.marketValidation.score < 85 ||
    preaudit.marketValidation.verdict !== 'validated' ||
    preaudit.marketValidation.strongSignals.length < 3 ||
    preaudit.marketValidation.recurringUserFriction.length < 2
  ) {
    throw new Error(`${label}: market validation is incomplete or inconsistent.`);
  }

  const boundaries = [preaudit.licenseBoundary, ...(preaudit.policyBoundaries || [])].filter(
    (boundary): boundary is ReleaseBoundary => Boolean(boundary),
  );
  if (
    boundaries.length === 0 ||
    boundaries.some(
      (boundary) => !boundary.label || !boundary.releaseGuard || !(boundary.summary || boundary.restrictedSummary),
    )
  ) {
    throw new Error(`${label}: at least one explicit release boundary is required.`);
  }

  if (preaudit.licenseBoundary) {
    const licenseText = [
      preaudit.licenseBoundary.label,
      preaudit.licenseBoundary.restrictedSummary,
      preaudit.licenseBoundary.releaseGuard,
    ].join(' ');
    if (!/Sustainable Use License/i.test(licenseText) || !/not OSI open source|Never describe/i.test(licenseText)) {
      throw new Error(`${label}: the source-available license boundary must be explicit.`);
    }
  }

  if (
    !preaudit.pricingSnapshot.billingUnit.trim() ||
    preaudit.pricingSnapshot.volatileFields.length < 2 ||
    !/recheck/i.test(preaudit.pricingSnapshot.releaseGuard)
  ) {
    throw new Error(`${label}: pricing-unit and volatility safeguards are required.`);
  }

  console.log(
    `✅ ${label} preaudit passed: evidence complete, ${
      preaudit.status === 'released' ? `released ${preaudit.releasedAt}` : 'release guarded'
    }.`,
  );
}
