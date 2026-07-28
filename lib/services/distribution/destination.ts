export interface DistributionDestinationSuggestion {
  destinationUrl: string;
  utmSource: string;
  utmMedium: string;
  utmCampaign: string;
  utmContent: string | null;
  linkName: string;
  summary: string;
}

function normalizeSlug(value: string): string {
  return value
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '')
    .slice(0, 120);
}

export function buildDistributionDestinationSuggestion(input: {
  projectUrl: string | null;
  channelKey: string;
  channelName: string;
  projectName: string;
  campaign: string;
  content?: string | null;
}): DistributionDestinationSuggestion {
  const destinationUrl = new URL(input.projectUrl || 'https://example.com');
  const utmSource = normalizeSlug(input.channelKey || input.channelName || 'distribution') || 'distribution';
  const utmCampaign = normalizeSlug(input.campaign || `${input.projectName}-${input.channelName}`);
  const utmContent = input.content ? normalizeSlug(input.content) : null;
  const linkName = `${input.projectName} · ${input.channelName}`;

  destinationUrl.searchParams.set('utm_source', utmSource);
  destinationUrl.searchParams.set('utm_medium', 'distribution');
  destinationUrl.searchParams.set('utm_campaign', utmCampaign || normalizeSlug(input.projectName));
  if (utmContent) destinationUrl.searchParams.set('utm_content', utmContent);

  return {
    destinationUrl: destinationUrl.toString(),
    utmSource,
    utmMedium: 'distribution',
    utmCampaign: utmCampaign || normalizeSlug(input.projectName),
    utmContent,
    linkName,
    summary: `Use ${utmSource} as the source, keep the campaign name readable, and record the live URL after submission.`,
  };
}
