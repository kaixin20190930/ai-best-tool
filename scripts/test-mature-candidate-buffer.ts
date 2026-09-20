import assert from 'node:assert/strict';
import fs from 'node:fs';

type Candidate = {
  rank: number;
  slug: string;
  product: string;
  officialUrl: string;
  candidateClass: 'mature_high_demand' | 'fast_growth_evidenced' | 'differentiated_specialist';
  status: string;
  officialSources: string[];
  independentSources: string[];
  decisionAngles: string[];
  risks: string[];
  publicReleaseApproved: boolean;
  indexReleaseApproved: boolean;
};

const file = 'data/collection/mature-candidate-buffer-2026-09-20.json';
const payload = JSON.parse(fs.readFileSync(file, 'utf8')) as {
  generatedAt: string;
  productionBaseline: { duplicateCheck: string };
  composition: Record<Candidate['candidateClass'], number>;
  candidates: Candidate[];
  excluded: Array<{ product: string; reason: string; source: string }>;
};

assert.equal(payload.generatedAt, '2026-09-20');
assert.equal(payload.productionBaseline.duplicateCheck, 'passed');
assert(payload.candidates.length >= 14 && payload.candidates.length <= 21);

const slugs = new Set<string>();
const domains = new Set<string>();
const classCounts: Record<Candidate['candidateClass'], number> = {
  mature_high_demand: 0,
  fast_growth_evidenced: 0,
  differentiated_specialist: 0,
};

for (const [index, candidate] of payload.candidates.entries()) {
  assert.equal(candidate.rank, index + 1);
  assert(!slugs.has(candidate.slug), `duplicate slug: ${candidate.slug}`);
  slugs.add(candidate.slug);

  const domain = new URL(candidate.officialUrl).hostname.replace(/^www\./, '');
  assert(!domains.has(domain), `duplicate official domain: ${domain}`);
  domains.add(domain);

  assert.equal(candidate.status, 'screened_for_deep_review');
  assert(candidate.officialSources.length >= 2, `${candidate.slug}: official source gap`);
  assert(candidate.independentSources.length >= 1, `${candidate.slug}: independent source gap`);
  assert(candidate.decisionAngles.length >= 4, `${candidate.slug}: decision-angle gap`);
  assert(candidate.risks.length >= 2, `${candidate.slug}: risk disclosure gap`);
  assert.equal(candidate.publicReleaseApproved, false);
  assert.equal(candidate.indexReleaseApproved, false);
  classCounts[candidate.candidateClass] += 1;
}

assert.deepEqual(classCounts, payload.composition);
assert(payload.excluded.some((item) => item.product === 'Sourcegraph Cody'));
assert(payload.excluded.some((item) => item.product.includes('Amazon Q Developer')));

console.log(`PASS mature candidate buffer: ${payload.candidates.length} unique candidates, release and index gates closed`);
