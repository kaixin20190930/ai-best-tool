import { createHash, randomBytes, timingSafeEqual } from 'node:crypto';

export function hashDecisionInternalTrafficToken(token: string) {
  return createHash('sha256').update(token).digest('hex');
}

export function createDecisionInternalTrafficToken() {
  const token = randomBytes(32).toString('base64url');
  return { token, sha256Hash: hashDecisionInternalTrafficToken(token) };
}

export function decisionInternalTrafficTokenMatches(token: string, expectedHash: string) {
  if (!/^[0-9a-f]{64}$/.test(expectedHash)) return false;
  const actual = Buffer.from(hashDecisionInternalTrafficToken(token));
  const expected = Buffer.from(expectedHash);
  return actual.length === expected.length && timingSafeEqual(actual, expected);
}
