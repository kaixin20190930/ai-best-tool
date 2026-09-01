import type { ProductIntelligenceClaim } from './types';

export default function isVerifiedIntelligenceClaim(claim: ProductIntelligenceClaim): boolean {
  return claim.verificationStatus === 'verified' && claim.conflictStatus === 'none' && Boolean(claim.claimValue);
}
