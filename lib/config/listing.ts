export type ListingPlan = 'free' | 'standard_paid';

export type ListingConfig = {
  currencySymbol: string;
  listingFeeLabel: string;
  valueProposition: string;
  salesBullets: string[];
  plans: {
    free: {
      label: string;
      summary: string;
      reviewWindow: string;
      highlights: string[];
    };
    standard_paid: {
      label: string;
      summary: string;
      reviewWindow: string;
      highlights: string[];
      fastTrackLabel: string;
      featuredLabel: string;
      launchWindowLabel: string;
    };
  };
  supportEmail: string;
};

export const listingConfig: ListingConfig = {
  currencySymbol: '$',
  listingFeeLabel: 'One-time listing fee',
  valueProposition: 'Optional paid listing, priority review, and featured exposure for teams that need extra visibility.',
  salesBullets: [
    'Free submissions stay open for broad coverage.',
    'Paid listing is there when timing or visibility matters.',
    'Featured placement can be time-boxed for launches and updates.',
  ],
  plans: {
    free: {
      label: 'Free submission',
      summary: 'Reviewed in the standard queue.',
      reviewWindow: '3-7 days',
      highlights: ['Good for first-time submissions', 'No featured slot reserved'],
    },
    standard_paid: {
      label: 'Standard paid',
      summary: 'Priority review with optional featured placement.',
      reviewWindow: '1-3 days',
      highlights: [
        'Priority review with shorter wait',
        'Optional featured placement window',
        'Supports payment confirmation workflow',
      ],
      fastTrackLabel: 'Fast track enabled',
      featuredLabel: 'Featured placement',
      launchWindowLabel: 'Launch window',
    },
  },
  supportEmail: 'contact@AIBestTool.com',
};

export function getListingPaymentMailto(subject: string): string {
  return `mailto:${listingConfig.supportEmail}?subject=${encodeURIComponent(subject)}`;
}
