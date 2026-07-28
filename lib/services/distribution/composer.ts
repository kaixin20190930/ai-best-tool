export interface DistributionChannelTemplateInput {
  titleTemplate: string | null;
  descriptionTemplate: string | null;
  maxTitleLength: number | null;
  maxDescriptionLength: number | null;
  requiredFields: string[];
}

export interface DistributionCopyPackage {
  title: string;
  titleAlternatives: string[];
  description: string;
  disclosure: string;
  proofPoints: string[];
  requiredFields: string[];
  handoffNotes: string[];
  followUpPrompt: string;
  maxTitleLength: number | null;
  maxDescriptionLength: number | null;
}

function normalizeText(value: string | null | undefined): string {
  return (value || '').replace(/\s+/g, ' ').trim();
}

function uniqueStrings(values: Array<string | null | undefined>): string[] {
  return Array.from(new Set(values.map((value) => normalizeText(value)).filter(Boolean)));
}

function truncate(value: string, limit: number | null): string {
  const cleaned = normalizeText(value);
  if (!limit || cleaned.length <= limit) return cleaned;
  return `${cleaned.slice(0, Math.max(0, limit - 1)).trimEnd()}…`;
}

function buildTitle(input: {
  productName: string;
  channelType: string;
  audience: string;
  valueProp: string;
}): string {
  const name = input.productName || 'this product';
  if (input.channelType === 'community') return `${name}: answering a real ${input.audience} problem`;
  if (input.channelType === 'github') return `${name}: a practical resource for ${input.audience}`;
  if (input.channelType === 'blog') return `${name}: what we learned building for ${input.audience}`;
  if (input.channelType === 'reddit') return `I tested ${name} for ${input.audience}`;
  if (input.channelType === 'startup') return `We built ${name} for ${input.audience}`;
  if (input.channelType === 'newsletter') return `${name}: a useful pick for ${input.audience}`;
  if (input.channelType === 'alternative') return `${name} as an alternative for ${input.valueProp}`;
  return `${name}: a better way to ${input.valueProp}`;
}

function buildDescription(input: {
  productName: string;
  projectDescription: string | null;
  channelName: string;
  channelType: string;
  audience: string;
  proofPoint: string;
  disclosure: string;
}): string {
  const productName = input.productName || 'This product';
  const baseDescription =
    input.projectDescription ||
    `A practical product for ${input.audience}.`;

  const channelGuidance: Record<string, string> = {
    directory: 'Focus on the problem it solves, the workflow it fits, and one concrete proof point.',
    alternative: 'State the comparison honestly and explain the decision difference in plain language.',
    startup: 'Lead with the launch context, why it exists, and what readers can test first.',
    community: 'Answer the question first, then mention the product only if it helps the answer.',
    newsletter: 'Keep it short, concrete, and useful for the reader audience.',
    blog: 'Use first-party evidence, dates, and test notes so readers can verify the claim.',
    github: 'Make the repository or example genuinely useful before adding any product mention.',
    reddit: 'Keep it conversational, useful, and clearly disclosed.',
  };

  return truncate(
    `${productName} ${baseDescription} ${channelGuidance[input.channelType] || channelGuidance.directory} ${input.proofPoint}. ${input.disclosure}`,
    input.channelType === 'blog' ? 1200 : 800,
  );
}

function buildDisclosure(channelType: string, productName: string): string {
  if (channelType === 'community' || channelType === 'reddit') {
    return `Disclosure: I work on ${productName}.`;
  }
  if (channelType === 'github') {
    return `Disclosure: maintained by the ${productName} team.`;
  }
  return `Disclosure: we built ${productName}.`;
}

function buildFollowUpPrompt(channelType: string, productName: string): string {
  if (channelType === 'community' || channelType === 'reddit') {
    return `Watch replies for follow-up questions and keep the discussion useful for ${productName}.`;
  }
  if (channelType === 'startup') {
    return `Check whether the launch page, comments, or review queue needs follow-up after the first submission.`;
  }
  if (channelType === 'blog') {
    return `Update the post when new evidence, screenshots, or limits change.`;
  }
  return `Log the live URL, review date, and any rejection or follow-up note for ${productName}.`;
}

export function composeDistributionCopyPackage(input: {
  productName: string;
  projectDescription: string | null;
  projectUrl: string | null;
  channelName: string;
  channelType: string;
  template: DistributionChannelTemplateInput | null;
  proofPoint: string;
  audience: string;
  valueProp: string;
}): DistributionCopyPackage {
  const disclosure = buildDisclosure(input.channelType, input.productName);
  const title = buildTitle({
    productName: input.productName,
    channelType: input.channelType,
    audience: input.audience,
    valueProp: input.valueProp,
  });
  const description = buildDescription({
    productName: input.productName,
    projectDescription: input.projectDescription,
    channelName: input.channelName,
    channelType: input.channelType,
    audience: input.audience,
    proofPoint: input.proofPoint,
    disclosure,
  });
  const templateFields = input.template?.requiredFields || [];
  const requiredFields = uniqueStrings([
    ...templateFields,
    input.projectUrl ? 'product_url' : null,
    input.channelType === 'community' || input.channelType === 'reddit' ? 'disclosure' : null,
  ]);

  return {
    title: truncate(title, input.template?.maxTitleLength || null),
    titleAlternatives: uniqueStrings([
      `${input.productName}: ${input.valueProp}`,
      `${input.productName} for ${input.audience}`,
      input.channelType === 'reddit' ? `Why ${input.productName} matters for ${input.audience}` : null,
    ]).map((item) => truncate(item, input.template?.maxTitleLength || null)),
    description: truncate(description, input.template?.maxDescriptionLength || null),
    disclosure,
    proofPoints: uniqueStrings([
      input.proofPoint,
      input.projectUrl ? `Live site: ${input.projectUrl}` : null,
      input.channelType === 'blog' ? 'Use screenshots, dates, and test notes.' : null,
    ]),
    requiredFields,
    handoffNotes: uniqueStrings([
      input.template?.titleTemplate || null,
      input.template?.descriptionTemplate || null,
      `${input.channelName} requires human review before sending.`,
      input.channelType === 'community' || input.channelType === 'reddit'
        ? 'Write the answer first, not the product pitch.'
        : 'Start with the concrete user value, then disclose.',
    ]),
    followUpPrompt: buildFollowUpPrompt(input.channelType, input.productName),
    maxTitleLength: input.template?.maxTitleLength ?? null,
    maxDescriptionLength: input.template?.maxDescriptionLength ?? null,
  };
}
