export type ListingPlan = 'free' | 'standard_paid';

export type ListingConfig = {
  currencySymbol: string;
  listingFeeLabel: string;
  valueProposition: string;
  salesBullets: string[];
  pricingTiers: {
    free: {
      label: string;
      priceLabel: string;
      reviewWindow: string;
      summary: string;
      highlights: string[];
    };
    priorityReview: {
      label: string;
      priceLabel: string;
      reviewWindow: string;
      summary: string;
      highlights: string[];
    };
    featuredWindows: Array<{
      days: 3 | 7 | 14;
      label: string;
      priceLabel: string;
      summary: string;
      recommended?: boolean;
    }>;
    launchBundle: {
      label: string;
      priceLabel: string;
      summary: string;
      highlights: string[];
    };
  };
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
  valueProposition:
    'Keep free submissions open, then offer one-time priority review and time-boxed featured placement when timing or visibility matters.',
  salesBullets: [
    'Free submissions stay open for broad coverage.',
    'Priority review is one-time, not recurring.',
    'Featured placement is time-boxed and expires automatically.',
  ],
  pricingTiers: {
    free: {
      label: 'Free submission',
      priceLabel: '$0',
      reviewWindow: '3-7 days',
      summary: 'Best for broad coverage and first-time submissions.',
      highlights: ['Standard queue review', 'No featured slot reserved'],
    },
    priorityReview: {
      label: 'Priority review',
      priceLabel: '$29 one-time',
      reviewWindow: '1-3 days',
      summary: 'Faster review for teams that care about timing.',
      highlights: ['Moves your submission ahead in the queue', 'Good for launches or time-sensitive updates'],
    },
    featuredWindows: [
      {
        days: 3,
        label: '3-day featured',
        priceLabel: '$29',
        summary: 'Short burst for a quick announcement.',
      },
      {
        days: 7,
        label: '7-day featured',
        priceLabel: '$49',
        summary: 'Recommended for most launches.',
        recommended: true,
      },
      {
        days: 14,
        label: '14-day featured',
        priceLabel: '$79',
        summary: 'Longer visibility for bigger campaigns.',
      },
    ],
    launchBundle: {
      label: 'Launch bundle',
      priceLabel: '$99',
      summary: 'Priority review + 14-day featured placement for launches that need maximum runway.',
      highlights: ['Includes priority review', 'Includes a 14-day featured window', 'Simplest option for launch week'],
    },
  },
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
