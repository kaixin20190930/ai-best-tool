import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';

const page = readFileSync('app/[locale]/(with-footer)/ai/[websiteName]/page.tsx', 'utf8');
const card = readFileSync('components/tools/PublicToolDecision.tsx', 'utf8');
assert.equal((page.match(/<PublicToolDecision\b/g) || []).length, 1);
assert.equal((card.match(/id='decision-card'/g) || []).length, 1);
assert.equal((card.match(/'Decision Card'/g) || []).length, 1);
assert.equal((page.match(/<EvidenceLedgerPanel\b/g) || []).length, 1);
assert.equal((page.match(/<ChangeTimelinePanel\b/g) || []).length, 1);
assert(page.includes('buildToolDecisionCard({'));
assert(card.includes('model={model}') && card.includes('embedded'));
for (const text of [
  'data-decision-evidence-status',
  'evidenceCompleteness.score',
  'nextFactReviewAt',
  'nextDecisionReviewAt',
  'GuideEvidencePanel',
]) {
  assert(!page.includes(text) && !card.includes(text), `Internal or duplicate decision UI: ${text}`);
}
assert(page.indexOf('<PublicToolDecision') < page.indexOf("t('introduction')"));
console.log(
  'PASS: one primary decision area before introduction; sources and timeline preserved; no quality scores or review queue.',
);
