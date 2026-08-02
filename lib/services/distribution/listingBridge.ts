export type DistributionProductType =
  | 'ai_saas'
  | 'developer_api'
  | 'open_source'
  | 'mobile_app'
  | 'content_newsletter'
  | 'agency_service'
  | 'web3'
  | 'other';

export interface DistributionListingCandidate {
  id: string;
  name: string;
  websiteUrl: string;
  description: string;
  categoryName: string | null;
  tags: string[];
  pricing: string | null;
  imageUrl: string | null;
  thumbnailUrl: string | null;
  screenshots: string[];
  productType: DistributionProductType;
  ownershipSource: 'submitted' | 'submission_email' | 'admin_domain';
  exactDomainMatch: boolean;
}

export function normalizeDistributionDomain(value: string | null | undefined): string {
  if (!value) return '';
  try {
    const url = new URL(/^https?:\/\//i.test(value) ? value : `https://${value}`);
    return url.hostname.toLowerCase().replace(/^www\./, '');
  } catch {
    return '';
  }
}

export function canReuseDistributionListing(input: {
  isAdmin: boolean;
  userId: string;
  email?: string | null;
  projectUrl?: string | null;
  listingUrl?: string | null;
  submittedBy?: string | null;
  submittedByEmail?: string | null;
}): boolean {
  const projectDomain = normalizeDistributionDomain(input.projectUrl);
  const listingDomain = normalizeDistributionDomain(input.listingUrl);
  if (input.isAdmin) return Boolean(projectDomain) && projectDomain === listingDomain;

  const email = String(input.email || '').trim().toLowerCase();
  const submittedByEmail = String(input.submittedByEmail || '').trim().toLowerCase();
  return input.submittedBy === input.userId || (Boolean(email) && email === submittedByEmail);
}

export function inferDistributionProductType(input: {
  categoryName?: string | null;
  tags?: string[] | null;
  name?: string | null;
  description?: string | null;
}): DistributionProductType {
  const text = [input.categoryName, input.name, input.description, ...(input.tags || [])]
    .filter(Boolean)
    .join(' ')
    .toLowerCase();
  if (/web3|crypto|blockchain|defi|wallet|on-chain|token/.test(text)) return 'web3';
  if (/open[ -]?source|github|self[ -]?host/.test(text)) return 'open_source';
  if (/api|sdk|developer|devtool|code|coding|observability/.test(text)) return 'developer_api';
  if (/mobile|ios|android|app store|google play/.test(text)) return 'mobile_app';
  if (/newsletter|publication|podcast|content creator|blog/.test(text)) return 'content_newsletter';
  if (/agency|consulting|service provider|studio/.test(text)) return 'agency_service';
  if (/ai|saas|automation|productivity|marketing|image|video|gif|voice|research/.test(text)) return 'ai_saas';
  return 'other';
}

export function getDistributionAssetGuidance(productType: DistributionProductType): Array<{
  key: string;
  label: string;
  required: boolean;
}> {
  const shared = [{ key: 'logo', label: 'Official logo or icon', required: true }];
  if (productType === 'developer_api')
    return [...shared, { key: 'screenshot', label: 'Documentation or code example', required: false }];
  if (productType === 'open_source')
    return [...shared, { key: 'screenshot', label: 'README, repository, or demo screenshot', required: false }];
  if (productType === 'mobile_app')
    return [...shared, { key: 'screenshot', label: 'App Store or product screenshots', required: true }];
  if (productType === 'content_newsletter')
    return [...shared, { key: 'screenshot', label: 'Publication or issue preview', required: false }];
  if (productType === 'agency_service')
    return [...shared, { key: 'screenshot', label: 'Verified case study or service example', required: false }];
  if (productType === 'web3')
    return [...shared, { key: 'screenshot', label: 'Product interface or protocol dashboard', required: false }];
  return [...shared, { key: 'screenshot', label: 'Product interface or output screenshot', required: false }];
}
