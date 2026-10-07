import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';

const page = readFileSync('app/[locale]/(with-footer)/ai/[websiteName]/page.tsx', 'utf8');
const card = readFileSync('components/tools/PublicToolDecision.tsx', 'utf8');
assert.equal((page.match(/<PublicToolDecision\b/g) || []).length, 1);
assert.equal((card.match(/id=['"]decision-card['"]/g) || []).length, 1);
assert.equal((card.match(/data-tool-decision-card\b/g) || []).length, 1);
const decisionAnchor = card.indexOf("id='decision-card'");
const decisionSectionStart = card.lastIndexOf('<section', decisionAnchor);
const decisionSectionEnd = card.indexOf('</section>', decisionAnchor);
assert(decisionAnchor >= 0 && decisionSectionStart >= 0 && decisionSectionEnd > decisionAnchor);
const decisionSection = card.slice(decisionSectionStart, decisionSectionEnd);
assert.match(decisionSection, /<h2\b/);
assert.match(decisionSection, /Tool Intelligence\s*\/\s*Decision Card/);
assert.match(decisionSection, /工具决策情报\s*\/\s*选择判断卡/);
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
