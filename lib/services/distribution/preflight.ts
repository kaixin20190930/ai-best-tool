import type { DistributionCopyPackage } from './composer';

export interface DistributionPreflightResult {
  ready: boolean;
  blockers: string[];
  warnings: string[];
  requiredFields: string[];
  missingFields: string[];
  titleLength: number;
  titleLimit: number | null;
  descriptionLength: number;
  descriptionLimit: number | null;
  summary: string;
}

function normalizeFieldName(value: string): string {
  return value.trim().toLowerCase();
}

export function buildDistributionPreflight(input: {
  copyPackage: DistributionCopyPackage;
  projectUrl: string | null;
  projectDescription: string | null;
  channelName: string;
  channelType: string;
}): DistributionPreflightResult {
  const requiredFields = Array.from(new Set(input.copyPackage.requiredFields.map(normalizeFieldName)));
  const missingFields: string[] = [];
  const blockers: string[] = [];
  const warnings: string[] = [];

  if (!input.projectUrl) {
    blockers.push('Project website URL is missing.');
    missingFields.push('product_url');
  }

  if (requiredFields.includes('product_url') && !input.projectUrl) {
    blockers.push('The target requires a product URL, but the project does not have one.');
  }

  if (requiredFields.includes('disclosure') && !input.copyPackage.disclosure) {
    blockers.push('Disclosure text is required for this channel.');
    missingFields.push('disclosure');
  }

  if (input.copyPackage.title.length === 0) {
    blockers.push('A title is required.');
  }

  if (input.copyPackage.description.length === 0) {
    blockers.push('A description is required.');
  }

  if (input.copyPackage.titleAlternatives.length === 0) {
    warnings.push('No title alternatives generated yet.');
  }

  if (input.copyPackage.proofPoints.length === 0) {
    warnings.push('No proof points were generated.');
  }

  if (input.projectDescription && input.projectDescription.length < 20) {
    warnings.push('Project description is quite short, so the pitch may feel thin.');
  }

  const titleLength = input.copyPackage.title.length;
  const descriptionLength = input.copyPackage.description.length;
  if (input.copyPackage.maxTitleLength && titleLength > input.copyPackage.maxTitleLength) {
    blockers.push(`Title exceeds ${input.copyPackage.maxTitleLength} characters.`);
  }
  if (input.copyPackage.maxDescriptionLength && descriptionLength > input.copyPackage.maxDescriptionLength) {
    blockers.push(`Description exceeds ${input.copyPackage.maxDescriptionLength} characters.`);
  }

  if (input.channelType === 'community' || input.channelType === 'reddit') {
    if (!input.copyPackage.disclosure.toLowerCase().includes('disclosure')) {
      blockers.push('Community channels need explicit disclosure.');
    }
  }

  const ready = blockers.length === 0;

  return {
    ready,
    blockers,
    warnings,
    requiredFields,
    missingFields,
    titleLength,
    titleLimit: input.copyPackage.maxTitleLength,
    descriptionLength,
    descriptionLimit: input.copyPackage.maxDescriptionLength,
    summary: ready
      ? `Preflight passed for ${input.channelName}.`
      : `Preflight blocked for ${input.channelName}: ${blockers.join(' ')}`,
  };
}
