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
    'Free submissions stay open, with paid options for faster review and added visibility.',
  salesBullets: [
    'Free submissions are reviewed in the standard queue.',
    'Paid review shortens the review window for time-sensitive launches.',
    'Featured placement runs for a fixed window and ends automatically.',
  ],
  pricingTiers: {
    free: {
      label: 'Free submission',
      priceLabel: '$0',
      reviewWindow: '3-7 days',
      summary: 'A standard review path for new listings.',
      highlights: ['Standard review queue', 'No featured placement included'],
    },
    priorityReview: {
      label: 'Priority review',
      priceLabel: '$29 one-time',
      reviewWindow: '1-3 days',
      summary: 'A shorter review window for time-sensitive submissions.',
      highlights: ['Shorter review window', 'Useful for launches, updates, and campaign timing'],
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
        summary: 'A full week of added visibility.',
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
      summary: 'Priority review plus 14 days of featured visibility.',
      highlights: ['Includes priority review', 'Includes a 14-day featured window', 'Designed for launch periods'],
    },
  },
  plans: {
    free: {
      label: 'Free submission',
      summary: 'Reviewed in the standard queue.',
      reviewWindow: '3-7 days',
      highlights: ['Suitable for general submissions', 'No featured placement included'],
    },
    standard_paid: {
      label: 'Standard paid',
      summary: 'Shorter review with optional featured visibility.',
      reviewWindow: '1-3 days',
      highlights: [
        'Shorter review window',
        'Optional featured placement',
        'Secure payment confirmation',
      ],
      fastTrackLabel: '24-48h review target',
      featuredLabel: 'Featured placement',
      launchWindowLabel: 'Featured window',
    },
  },
  supportEmail: 'contact@AIBestTool.com',
};

export function getListingPaymentMailto(subject: string): string {
  return `mailto:${listingConfig.supportEmail}?subject=${encodeURIComponent(subject)}`;
}
