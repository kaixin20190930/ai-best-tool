import assert from 'node:assert/strict';
import { hasVerifiedFastTrackEligibility, indexEvidencePostimageMatches, mergeIndexEvidence, selectIndexReleaseTrack,
  validateDuplicateIntentSnapshot } from '../lib/services/indexFastTrackEvidence';

const oldOfficial = { url: 'https://x.ai/news/grok-voice-3', reviewedAt: '2026-10-16', claimKeys: ['old'] };
const oldIndependent = { url: 'https://artificialanalysis.ai/speech-to-speech/arena', reviewedAt: '2026-10-16' };
const merged = mergeIndexEvidence({ evidence: { official: [oldOfficial], independent: [oldIndependent], note: 'keep' },
  audience: { bestFit: ['old'] } }, { evidence: {
  official: [{ url: 'https://www.x.ai/news/grok-voice-3/?utm_source=test', claimKeys: ['replace'] },
    { url: 'https://x.ai/api/voice' }],
  independent: [{ url: 'https://artificialanalysis.ai/speech-to-speech/arena#rank' },
    { url: 'https://siliconangle.com/voice' }],
}, audience: { notIdealFor: ['new'] } });
assert.deepEqual(merged.evidence.official, [oldOfficial, { url: 'https://x.ai/api/voice' }]);
assert.deepEqual(merged.evidence.independent, [oldIndependent, { url: 'https://siliconangle.com/voice' }]);
assert.equal(merged.evidence.note, 'keep');
assert.deepEqual(merged.audience, { bestFit: ['old'], notIdealFor: ['new'] });
assert.deepEqual(mergeIndexEvidence(merged, { evidence: { official: [{ url: 'https://x.ai/api/voice' }] } }), merged);
assert.deepEqual(mergeIndexEvidence({ evidence: { official: [{ legacy: true }] } },
  { evidence: { official: [{ url: 'https://x.ai/api/voice' }] } }).evidence.official,
[{ legacy: true }, { url: 'https://x.ai/api/voice' }]);
assert.throws(() => mergeIndexEvidence({}, { evidence: { independent: [{ claim: 'no url' }] } }));
const jsonbOrder = { marketValidation: { score: 80, verdict: 'validated' },
  evidence: { official: [{ reviewedAt: '2026-10-17', url: 'https://x.ai/api/voice' }], independent: [] } };
const patchOrder = { evidence: { official: [{ url: 'https://x.ai/api/voice', reviewedAt: '2026-10-17' }] },
  marketValidation: { verdict: 'validated', score: 80 } };
const reordered = mergeIndexEvidence(jsonbOrder, patchOrder);
const pgRoundTrip = { evidence: { independent: [], official: [{ url: 'https://x.ai/api/voice', reviewedAt: '2026-10-17' }] },
  marketValidation: { verdict: 'validated', score: 80 } };
assert.notEqual(JSON.stringify(reordered), JSON.stringify(pgRoundTrip));
assert.equal(indexEvidencePostimageMatches(reordered, pgRoundTrip), true);
assert.equal(indexEvidencePostimageMatches({ ...reordered, marketValidation: { score: 81, verdict: 'validated' } }, jsonbOrder), false);
assert.equal(indexEvidencePostimageMatches({ ...reordered, evidence: { ...reordered.evidence, official: [] } }, jsonbOrder), false);

const fastTrack = {
  status: 'PASS', basis: 'brand_decision_signals', checkedAt: '2026-10-17',
  brand: { established: true, url: 'https://x.ai/news/grok-voice-3', checkedAt: '2026-10-17' },
  decisionIntents: ['api', 'pricing'],
  independentSignals: [
    { type: 'independent_benchmark', url: 'https://artificialanalysis.ai/speech-to-speech/arena',
      checkedAt: '2026-10-17', scope: '637 Speech Agent Arena samples for this model',
      nonDuplication: 'Primary independent benchmark, not a publisher retest.' },
    { type: 'editorial_buyer_coverage', url: 'https://www.eesel.ai/blog/grok-voice-3-review',
      checkedAt: '2026-10-17', scope: 'Buyer and deployment decision coverage, no direct retest',
      nonDuplication: 'Editorial attention citing the primary benchmark.', independentRetest: false },
    { type: 'editorial_buyer_coverage', url: 'https://siliconangle.com/grok-voice-3',
      checkedAt: '2026-10-17', scope: 'Another publisher discussing API pricing and usage',
      nonDuplication: 'Separate publisher, no independent reproduction.', independentRetest: false },
  ],
  nonDuplication: 'One benchmark plus two different editorial publishers; no search volume asserted.',
};
assert.equal(hasVerifiedFastTrackEligibility(fastTrack, '2026-10-17'), true);
assert.deepEqual(selectIndexReleaseTrack({ fastTrackEligibility: fastTrack }, '2026-10-17'),
  { releaseTrack: 'mature_high_demand', observationComplete: false });
assert.deepEqual(selectIndexReleaseTrack({ score: 100, observationComplete: false }, '2026-10-17'),
  { releaseTrack: 'standard', observationComplete: false });
assert.deepEqual(selectIndexReleaseTrack({ score: 100, ownerDirection: 'fast', observationComplete: true }, '2026-10-17'),
  { releaseTrack: 'standard', observationComplete: true });
assert.equal(hasVerifiedFastTrackEligibility(undefined, '2026-10-17'), false);
assert.equal(hasVerifiedFastTrackEligibility({ ...fastTrack, independentSignals: fastTrack.independentSignals.slice(0, 2) }, '2026-10-17'), false);
assert.equal(hasVerifiedFastTrackEligibility({ ...fastTrack, decisionIntents: ['api'] }, '2026-10-17'), false);
assert.equal(hasVerifiedFastTrackEligibility({ ...fastTrack, checkedAt: '2026-09-01' }, '2026-10-17'), false);
const scope = { nameQuery: 'grok voice', officialUrl: 'https://docs.x.ai/developers/models/grok-voice-3.0', taskMode: 'published_fits' };
const duplicate = { status: 'PASS', checkedAt: '2026-10-17', checkedScope: scope,
  checkedToolIds: [], productionMatchCount: 0 };
const empty = { toolIds: [], candidateIds: [], taskFitToolIds: [] };
assert.equal(validateDuplicateIntentSnapshot(duplicate, scope, empty, '2026-10-17'), true);
assert.equal(validateDuplicateIntentSnapshot({ ...duplicate, checkedScope: undefined }, scope, empty, '2026-10-17'), false);
assert.equal(validateDuplicateIntentSnapshot({ ...duplicate, productionMatchCount: 1 }, scope, empty, '2026-10-17'), false);
assert.equal(validateDuplicateIntentSnapshot(duplicate, scope, { ...empty, candidateIds: ['one'] }, '2026-10-17'), false);
console.log('index fast-track evidence tests passed');
