import assert from 'node:assert/strict';
import { shutterstockDecisionPayload, validateShutterstockDecisionEvidence } from './refresh-shutterstock-decision-evidence';

validateShutterstockDecisionEvidence();
assert.equal(shutterstockDecisionPayload.features.marketValidation.verdict, 'validated');
assert(shutterstockDecisionPayload.features.decision.limitations.en.some((item) => item.includes('Indemnification')));
assert(shutterstockDecisionPayload.features.editorial.trustNote.en.includes('different protections'));
console.log('PASS Shutterstock licensing, evidence, audience, and decision contracts');
