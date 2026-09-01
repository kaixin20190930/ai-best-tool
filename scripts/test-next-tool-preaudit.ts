import fs from 'node:fs';
import path from 'node:path';

type Preaudit = {
  action: string;
  decisionAngles: string[];
  existingRoute: string;
  licenseBoundary: {
    label: string;
    releaseGuard: string;
    restrictedSummary: string;
  };
  limitations: string[];
  marketValidation: {
    recurringUserFriction: string[];
    score: number;
    strongSignals: string[];
    verdict: string;
  };
  nextSlotChecklist: string[];
  pricingSnapshot: {
    billingUnit: string;
    checkedAt: string;
    releaseGuard: string;
    volatileFields: string[];
  };
  productionWriteApproved: boolean;
  publishNotBefore: string;
  reviewedAt: string;
  sitemapChangeApproved: boolean;
  slug: string;
  sources: {
    independent: string[];
    official: string[];
  };
  status: string;
};

const preauditPath = path.join(process.cwd(), 'data', 'collection', 'n8n-preaudit-2026-09-01.json');
const preaudit = JSON.parse(fs.readFileSync(preauditPath, 'utf8')) as Preaudit;

if (preaudit.slug !== 'n8n' || preaudit.existingRoute !== '/ai/n8n') {
  throw new Error('n8n preaudit must target the existing canonical fallback route.');
}

if (preaudit.action !== 'migrate_existing_fallback' || preaudit.status !== 'ready_for_next_slot') {
  throw new Error('n8n preaudit must remain a controlled migration candidate.');
}

if (preaudit.productionWriteApproved || preaudit.sitemapChangeApproved) {
  throw new Error('A preaudit cannot approve a production write or sitemap expansion.');
}

if (preaudit.publishNotBefore <= preaudit.reviewedAt) {
  throw new Error('The publication guard must reserve a later release slot.');
}

if (preaudit.sources.official.length < 5 || preaudit.sources.independent.length < 2) {
  throw new Error('n8n requires at least five official and two independent sources.');
}

const allSources = [...preaudit.sources.official, ...preaudit.sources.independent];
if (new Set(allSources).size !== allSources.length || allSources.some((url) => !url.startsWith('https://'))) {
  throw new Error('Preaudit sources must be unique HTTPS URLs.');
}

if (
  preaudit.decisionAngles.length < 5 ||
  preaudit.limitations.length < 5 ||
  preaudit.nextSlotChecklist.length < 5
) {
  throw new Error('n8n preaudit is missing decision, limitation, or release-gate depth.');
}

if (
  preaudit.marketValidation.score < 85 ||
  preaudit.marketValidation.verdict !== 'validated' ||
  preaudit.marketValidation.strongSignals.length < 3 ||
  preaudit.marketValidation.recurringUserFriction.length < 2
) {
  throw new Error('n8n market validation is incomplete or inconsistent.');
}

const licenseText = [
  preaudit.licenseBoundary.label,
  preaudit.licenseBoundary.restrictedSummary,
  preaudit.licenseBoundary.releaseGuard,
].join(' ');
if (!/Sustainable Use License/i.test(licenseText) || !/not OSI open source|Never describe/i.test(licenseText)) {
  throw new Error('The source-available license boundary must be explicit.');
}

if (
  !/workflow run|execution/i.test(preaudit.pricingSnapshot.billingUnit) ||
  preaudit.pricingSnapshot.volatileFields.length < 2 ||
  !/recheck/i.test(preaudit.pricingSnapshot.releaseGuard)
) {
  throw new Error('Pricing-unit and volatility safeguards are required.');
}

console.log('✅ n8n preaudit passed: evidence complete, release guarded, no production expansion approved.');
