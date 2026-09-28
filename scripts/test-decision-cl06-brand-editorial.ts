import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';

const seed = readFileSync('db/supabase/manual/20260923_seed_decision_graph_first_batch.sql', 'utf8');
const packet = readFileSync('docs/DECISION_GRAPH_CL06_BRAND_EDITORIAL_PACKET_2026-09-27_CN.md', 'utf8');
const plan = readFileSync('docs/DECISION_GRAPH_REMAINING_CLUSTER_REMEDIATION_PLAN_CN.md', 'utf8');
const verifier = readFileSync('scripts/verify-decision-cl06-brand-readonly.ts', 'utf8');
const candidate = JSON.parse(
  readFileSync('docs/DECISION_GRAPH_CL06_BRAND_EVIDENCE_CANDIDATE_2026-09-28_CN.json', 'utf8'),
);

assert.match(seed, /'brand-constrained-marketing-content'[^\n]*'brand-guided-content-generation'[^\n]*'required'/);
assert.match(seed, /'brand-constrained-marketing-content'[^\n]*'brand-controls-and-style-guidance'[^\n]*'preferred'/);
for (const constraint of ['"output":"marketing_draft"', '"needsBrandGuidance":true', '"requiresReview":true']) {
  assert.ok(seed.includes(constraint), `Missing Task constraint ${constraint}`);
}

assert.match(packet, /两条 Task rationale 为 `publishable` 编辑候选/);
assert.match(packet, /The draft must use the supplied brand voice/);
assert.match(packet, /Style and terminology guidance helps reviewers/);
assert.match(packet, /`importance=preferred`[^\n]*`status=reviewed` 暂保持/);
assert.match(packet, /不取消.*`requiresReview=true`/);
assert.match(packet, /Jasper.*`conditional`/);
assert.match(packet, /Grammarly.*`conditional`/);
assert.match(packet, /Claude.*`contextual`/);
assert.match(packet, /官方套餐表述有冲突/);
assert.match(packet, /不能解释为强制锁定/);
assert.match(packet, /并非自动强制执行品牌政策或审批/);
assert.match(packet, /不提 Tool Capability\/Fit 可写候选/);
assert.match(packet, /`conflict`/);
for (const purpose of ['support', 'availability', 'plan', 'limitation', 'fit']) {
  assert.ok(packet.includes('`' + purpose + '`'), `Missing evidence purpose ${purpose}`);
}
assert.match(packet, /不创建 Tool Capability\/Fit/);
assert.match(packet, /继续 404/);
assert.match(packet, /不改 sitemap、metadata 或索引/);
assert.doesNotMatch(packet, /"profileId"\s*:\s*"[0-9a-f-]{36}"/);
assert.match(plan, /CL-06 Brand[^\n]*本地编辑候选完成[^\n]*生产关系 HOLD/);
assert.match(plan, /CL-06 Brand 官方证据候选增量/);
assert.match(packet, /Grammarly.*`support_level` 在新候选包中改为无可写值/);

assert.equal(candidate.cluster, 'brand-constrained-marketing-content');
assert.equal(candidate.productionWrites, 0);
assert.equal(candidate.scope.createEntities, false);
assert.equal(candidate.readOnlyBaseline.toolCapabilityCount, 0);
assert.equal(candidate.readOnlyBaseline.fitCount, 0);
assert.equal(candidate.readOnlyBaseline.claudeProfileStatus, 'conflict');
assert.equal(candidate.readOnlyBaseline.toolCapabilityClaimLinkCount, 0);
assert.equal(candidate.scope.taskCapabilities['brand-guided-content-generation'].editorialDecision, 'publishable');
assert.equal(candidate.scope.taskCapabilities['brand-controls-and-style-guidance'].editorialDecision, 'publishable');
assert.equal(candidate.scope.tools.Jasper.decision, 'conditional');
assert.equal(candidate.scope.tools.Grammarly.decision, 'conditional');
assert.equal(candidate.scope.tools.Claude.decision, 'contextual');
assert.equal(candidate.relationshipCandidates.Jasper['brand-guided-content-generation'].availability, 'unknown');
assert.equal(candidate.relationshipCandidates.Grammarly['brand-guided-content-generation'].supportLevel, null);
assert.equal(candidate.relationshipCandidates.Grammarly['brand-guided-content-generation'].availability, 'unknown');
assert.equal(candidate.relationshipCandidates.Claude.fit, null);
assert.ok(candidate.evidenceIntakeCandidates.length >= 10);
const officialDomains: Record<string, string> = {
  Jasper: 'jasper.ai',
  Grammarly: 'grammarly.com',
  Claude: 'claude.com',
};
for (const evidence of candidate.evidenceIntakeCandidates) {
  assert.equal(evidence.checkedDate, '2026-09-28');
  assert.ok(evidence.key && evidence.surface && evidence.sourceMeaning && evidence.limitation);
  assert.ok(evidence.fieldUse.length > 0);
  const hostname = new URL(evidence.url).hostname;
  assert.ok(
    hostname.endsWith(officialDomains[evidence.owner] || '#unknown'),
    `Non-official evidence domain: ${evidence.url}`,
  );
}
assert.ok(candidate.holdReasons.some((reason: string) => reason.includes('marketing')));
assert.ok(candidate.operatorGuards.some((guard: string) => guard.includes('not an executable production manifest')));

assert.match(verifier, /BEGIN READ ONLY/);
assert.match(verifier, /productionWrites: 0/);
assert.match(verifier, /assert\.equal\(toolCapabilities\.length, 0/);
assert.match(verifier, /assert\.equal\(fits\.length, 0/);
assert.match(verifier, /assert\.equal\(profiles\[0\]\.profile_status, 'conflict'\)/);
assert.match(verifier, /tool_capability_claims/);
assert.match(verifier, /tool_task_fit_claims/);
assert.doesNotMatch(verifier, /\.insert\(|\.update\(|\.delete\(|\.upsert\(|\.rpc\(/);

console.log('PASS CL-06 Brand editorial scope, governance boundaries, and read-only verifier');
