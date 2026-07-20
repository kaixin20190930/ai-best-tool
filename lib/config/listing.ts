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
      amountCents: number;
      reviewWindow: string;
      summary: string;
      highlights: string[];
    };
    priorityReview: {
      label: string;
      priceLabel: string;
      amountCents: number;
      reviewWindow: string;
      summary: string;
      highlights: string[];
    };
    featuredWindows: Array<{
      days: 3 | 7 | 14;
      label: string;
      priceLabel: string;
      amountCents: number;
      summary: string;
    }>;
    launchBundle: {
      label: string;
      priceLabel: string;
      amountCents: number;
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
    'Free submissions stay open. Paid options buy faster review and a fixed visibility window, not guaranteed placement.',
  salesBullets: [
    'Free submissions stay in the standard queue until reviewed.',
    'Paid review is for launches, updates, and timing-sensitive submissions.',
    'Featured placement gives you a fixed visibility window and ends automatically.',
  ],
  pricingTiers: {
    free: {
      label: 'Free submission',
      priceLabel: '$0',
      amountCents: 0,
      reviewWindow: '3-7 days',
      summary: 'Standard review for new listings and general submissions.',
      highlights: ['Standard review queue', 'No featured placement included'],
    },
    priorityReview: {
      label: 'Priority review',
      priceLabel: '$9 one-time',
      amountCents: 900,
      reviewWindow: '1-3 days',
      summary: 'A smaller one-time fee for time-sensitive submissions that need a faster response.',
      highlights: ['Shorter review window', 'Best for launches, updates, and campaign timing'],
    },
    featuredWindows: [
      {
        days: 3,
        label: '3-day featured',
        priceLabel: '+$9',
        amountCents: 900,
        summary: 'Add-on: a short burst for a quick announcement.',
      },
      {
        days: 7,
        label: '7-day featured',
        priceLabel: '+$19',
        amountCents: 1900,
        summary: 'Add-on: a full week of added visibility.',
      },
      {
        days: 14,
        label: '14-day featured',
        priceLabel: '+$29',
        amountCents: 2900,
        summary: 'Add-on: longer visibility for bigger campaigns.',
      },
    ],
    launchBundle: {
      label: 'Launch bundle',
      priceLabel: '$39',
      amountCents: 3900,
      summary: 'Priority review plus 14 days of featured visibility for a launch window.',
      highlights: ['Includes priority review', 'Includes a 14-day featured window', 'Designed for launch periods'],
    },
  },
  plans: {
    free: {
      label: 'Free submission',
      summary: 'Reviewed in the standard queue with no visibility guarantee.',
      reviewWindow: '3-7 days',
      highlights: ['Suitable for general submissions', 'No featured placement included'],
    },
    standard_paid: {
      label: 'Standard paid',
      summary: 'Shorter review with optional featured visibility and a fixed time window.',
      reviewWindow: '1-3 days',
      highlights: ['Shorter review window', 'Optional featured placement', 'Secure payment confirmation'],
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

export function getListingTotalCents(featuredDays: 0 | 3 | 7 | 14, fastTrack: boolean): number {
  if (fastTrack && featuredDays === 14) {
    return listingConfig.pricingTiers.launchBundle.amountCents;
  }

  const featuredAmount =
    listingConfig.pricingTiers.featuredWindows.find((item) => item.days === featuredDays)?.amountCents || 0;

  return listingConfig.pricingTiers.priorityReview.amountCents + featuredAmount;
}
