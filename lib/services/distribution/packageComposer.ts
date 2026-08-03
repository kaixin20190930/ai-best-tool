import type { DistributionTaskDetail } from './taskDetail';

export interface DistributionTargetRequirementInput {
  requiredField: string;
  fieldType: string;
  characterLimit: number | null;
  requiredAsset: string | null;
  ruleText: string;
  sourceUrl: string;
}

export interface DistributionPackageField {
  key: string;
  label: string;
  value: string;
  required: boolean;
  manual: boolean;
  characterLimit: number | null;
  sourceUrl: string | null;
}

export interface DistributionPackageDraft {
  fields: DistributionPackageField[];
  assetRequirements: string[];
  missingAssets: string[];
  blockers: string[];
  warnings: string[];
  ready: boolean;
}

function normalizedKey(value: string): string {
  return value
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '_')
    .replace(/^_|_$/g, '');
}

function knownValue(key: string, detail: DistributionTaskDetail): string {
  if (['product_name', 'name', 'tool_name'].includes(key)) return detail.project.name;
  if (['product_url', 'website', 'website_url', 'url'].includes(key)) return detail.destination.destinationUrl;
  if (['title', 'headline', 'tagline'].includes(key)) return detail.copyPackage.title;
  if (['description', 'short_description', 'summary', 'pitch'].includes(key)) return detail.copyPackage.description;
  if (key === 'long_description') return detail.copyPackage.description;
  if (key === 'disclosure') return detail.copyPackage.disclosure;
  if (['proof_point', 'proof_points'].includes(key)) return detail.copyPackage.proofPoints.join('\n');
  return '';
}

function isManualTargetField(fieldType: string): boolean {
  return ['email', 'select', 'account', 'password', 'captcha', 'checkbox'].includes(normalizedKey(fieldType));
}

export function composeDistributionPackage(input: {
  detail: DistributionTaskDetail;
  requirements: DistributionTargetRequirementInput[];
  availableAssetTypes: string[];
}): DistributionPackageDraft {
  const baseFields: DistributionPackageField[] = [
    {
      key: 'title',
      label: 'Title',
      value: input.detail.copyPackage.title,
      required: true,
      manual: false,
      characterLimit: input.detail.copyPackage.maxTitleLength,
      sourceUrl: null,
    },
    {
      key: 'description',
      label: 'Description',
      value: input.detail.copyPackage.description,
      required: true,
      manual: false,
      characterLimit: input.detail.copyPackage.maxDescriptionLength,
      sourceUrl: null,
    },
    {
      key: 'product_url',
      label: 'Tracked product URL',
      value: input.detail.destination.destinationUrl,
      required: true,
      manual: false,
      characterLimit: null,
      sourceUrl: null,
    },
    {
      key: 'disclosure',
      label: 'Disclosure',
      value: input.detail.copyPackage.disclosure,
      required: false,
      manual: false,
      characterLimit: null,
      sourceUrl: null,
    },
    {
      key: 'proof_points',
      label: 'Proof points',
      value: input.detail.copyPackage.proofPoints.join('\n'),
      required: false,
      manual: false,
      characterLimit: null,
      sourceUrl: null,
    },
  ];
  const fieldMap = new Map(baseFields.map((field) => [field.key, field]));
  for (const requirement of input.requirements) {
    const key = normalizedKey(requirement.requiredField);
    const existing = fieldMap.get(key);
    if (existing) {
      existing.required = true;
      existing.characterLimit = requirement.characterLimit || existing.characterLimit;
      existing.sourceUrl = requirement.sourceUrl;
      continue;
    }
    fieldMap.set(key, {
      key,
      label: requirement.requiredField,
      value: knownValue(key, input.detail),
      required: true,
      manual: isManualTargetField(requirement.fieldType),
      characterLimit: requirement.characterLimit,
      sourceUrl: requirement.sourceUrl,
    });
  }
  const fields = Array.from(fieldMap.values());
  const assetRequirements = Array.from(
    new Set(input.requirements.map((item) => normalizedKey(item.requiredAsset || '')).filter(Boolean)),
  );
  const available = new Set(input.availableAssetTypes.map(normalizedKey));
  const missingAssets = assetRequirements.filter((asset) => !available.has(asset));
  const blockers = [...input.detail.preflight.blockers];
  const warnings = [...input.detail.preflight.warnings];
  for (const field of fields) {
    if (field.manual && !field.value.trim()) {
      warnings.push(`${field.label} must be completed manually on the target site.`);
    } else if (field.required && !field.value.trim()) blockers.push(`${field.label} is required by the target site.`);
    if (field.characterLimit && field.value.length > field.characterLimit)
      blockers.push(`${field.label} exceeds ${field.characterLimit} characters.`);
  }
  for (const asset of missingAssets) blockers.push(`Missing required asset: ${asset.replaceAll('_', ' ')}.`);
  return {
    fields,
    assetRequirements,
    missingAssets,
    blockers: Array.from(new Set(blockers)),
    warnings: Array.from(new Set(warnings)),
    ready: blockers.length === 0,
  };
}
