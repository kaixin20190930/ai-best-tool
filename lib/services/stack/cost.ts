export type StackBillingPeriod = 'month' | 'year' | 'usage' | 'one_time' | 'unknown';

export type NormalizedStackCost = {
  monthlyCost: number | null;
  normalization: {
    method: 'monthly_direct' | 'annual_divided_by_12' | 'usage_monthly_estimate' | 'not_normalized';
    sourceAmount: number | null;
    sourcePeriod: StackBillingPeriod;
    divisor?: number;
  };
};

function roundCurrency(value: number) {
  return Math.round((value + Number.EPSILON) * 100) / 100;
}

export function normalizeStackCost(
  billingAmount: number | null,
  billingPeriod: StackBillingPeriod,
): NormalizedStackCost {
  if (billingAmount === null || !Number.isFinite(billingAmount) || billingAmount < 0) {
    return {
      monthlyCost: null,
      normalization: { method: 'not_normalized', sourceAmount: null, sourcePeriod: billingPeriod },
    };
  }

  if (billingPeriod === 'month') {
    return {
      monthlyCost: roundCurrency(billingAmount),
      normalization: { method: 'monthly_direct', sourceAmount: billingAmount, sourcePeriod: billingPeriod },
    };
  }

  if (billingPeriod === 'year') {
    return {
      monthlyCost: roundCurrency(billingAmount / 12),
      normalization: {
        method: 'annual_divided_by_12',
        sourceAmount: billingAmount,
        sourcePeriod: billingPeriod,
        divisor: 12,
      },
    };
  }

  if (billingPeriod === 'usage') {
    return {
      monthlyCost: roundCurrency(billingAmount),
      normalization: {
        method: 'usage_monthly_estimate',
        sourceAmount: billingAmount,
        sourcePeriod: billingPeriod,
      },
    };
  }

  return {
    monthlyCost: null,
    normalization: { method: 'not_normalized', sourceAmount: billingAmount, sourcePeriod: billingPeriod },
  };
}
