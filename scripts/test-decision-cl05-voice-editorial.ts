import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';

const seed = readFileSync('db/supabase/manual/20260923_seed_decision_graph_first_batch.sql', 'utf8');
const packet = readFileSync('docs/DECISION_GRAPH_CL05_VOICE_EDITORIAL_PACKET_2026-09-27_CN.md', 'utf8');
const candidate = JSON.parse(
  readFileSync('docs/DECISION_GRAPH_CL05_VOICE_EVIDENCE_CANDIDATE_2026-09-28_CN.json', 'utf8'),
);
const verifier = readFileSync('scripts/verify-decision-cl05-voice-readonly.ts', 'utf8');

assert.match(seed, /'ai-voiceover'[^\n]*'text-to-speech-voice-generation'[^\n]*'required'/);
assert.match(seed, /'ai-voiceover'[^\n]*'voice-consent-and-export'[^\n]*'preferred'/);
assert.match(seed, /'ai-voiceover'[^\n]*"output":"voiceover"/);
assert.match(seed, /'ai-voiceover'[^\n]*"requiresConsentReview":true/);
assert.match(seed, /'ai-voiceover'[^\n]*"requiresExportReview":true/);

assert.match(packet, /两条 Task rationale 可供独立编辑 QA/);
assert.match(packet, /The deliverable must contain intelligible spoken narration/);
assert.match(packet, /When a real or cloned voice is used/);
assert.doesNotMatch(packet, /`importance=preferred`[^\n]*同意[^\n]*可选/);
assert.match(packet, /ElevenLabs `conditional`/);
assert.match(packet, /Descript `conditional`/);
assert.match(packet, /克隆声音模型本身不能导出为独立文件/);
assert.match(packet, /API 下载渲染文件须先发布为 web link/);
assert.match(packet, /不发布就直接下载渲染音频文件/);
assert.match(packet, /Free 的 TTS\/clone 有限/);
assert.equal((packet.match(/\*\*`unknown` \/ HOLD\*\*/g) || []).length, 2);
for (const purpose of ['support', 'availability', 'plan', 'limitation', 'fit']) {
  assert.ok(packet.includes('`' + purpose + '`'), `Missing evidence purpose ${purpose}`);
}
assert.match(packet, /不创建 Tool Capability\/Fit/);
assert.match(packet, /继续 404/);
assert.match(packet, /不改 sitemap、metadata 或索引/);
assert.doesNotMatch(packet, /"profileId"\s*:\s*"[0-9a-f-]{36}"/);
assert.equal(candidate.cluster, 'ai-voiceover');
assert.equal(candidate.productionWrites, 0);
assert.equal(candidate.scope.createEntities, false);
assert.equal(candidate.readOnlyBaseline.profileCount, 0);
assert.equal(candidate.readOnlyBaseline.linkCount, 0);
assert.equal(candidate.profileCandidates.length, 2);
assert.equal(candidate.evidenceIntakeCandidates.length, 16);
for (const profile of candidate.profileCandidates) {
  assert.equal(profile.profileId, null);
  assert.equal(profile.ownerType, 'tool');
  assert.equal(profile.status, 'pending_independent_qa');
}
for (const item of candidate.evidenceIntakeCandidates) {
  const domain = new URL(item.url).hostname.replace(/^www\./, '');
  assert.ok(
    domain === (item.owner === 'ElevenLabs' ? 'elevenlabs.io' : 'descript.com') ||
      (item.owner === 'Descript' && domain === 'help.descript.com'),
    `Wrong official owner for ${item.key}`,
  );
  assert.equal(item.checkedDate, '2026-09-28');
  assert.ok(item.surface && item.sourceMeaning && item.fieldUse.length && item.limitation);
}
for (const tool of ['ElevenLabs', 'Descript']) {
  const mapping = candidate.relationshipCandidates[tool];
  assert.equal(mapping['voice-consent-and-export'].availability, 'unknown');
  assert.equal(mapping['voice-consent-and-export'].missingPurpose, 'availability');
  assert.equal(mapping.fit.editorialDecision, 'HOLD');
}
assert.match(JSON.stringify(candidate.holdReasons), /commercial|商用/);
assert.match(JSON.stringify(candidate.holdReasons), /192 kbps/);

assert.match(verifier, /BEGIN READ ONLY/);
assert.match(verifier, /productionWrites: 0/);
assert.match(verifier, /assert\.equal\(toolCapabilities\.length, 0/);
assert.match(verifier, /assert\.equal\(fits\.length, 0/);
assert.match(verifier, /assert\.equal\(profiles\.length, 0/);
assert.doesNotMatch(verifier, /\.insert\(|\.update\(|\.delete\(|\.upsert\(|\.rpc\(/);

console.log('PASS CL-05 Voice editorial scope, evidence gates, and read-only verifier');
