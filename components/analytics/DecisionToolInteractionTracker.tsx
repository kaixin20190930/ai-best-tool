'use client';

import { useEffect } from 'react';

import { collectDecisionMetricEvent } from '@/app/actions/decisionMetrics';
import { createDecisionEventDispatcher } from '@/lib/analytics/decisionEvents/client';
import { decisionClaimTypes, type DecisionClaimType } from '@/lib/analytics/decisionEvents/contract';

export default function DecisionToolInteractionTracker({
  toolId,
  locale,
  enabled,
}: {
  toolId: string;
  locale: string;
  enabled: boolean;
}) {
  useEffect(() => {
    if (!enabled) return undefined;
    const metrics = createDecisionEventDispatcher({ enabled, send: collectDecisionMetricEvent });
    const metricLocale = locale === 'cn' || locale === 'tw' ? 'cn' : 'en';
    const onClick = (event: MouseEvent) => {
      const link = event.target instanceof Element ? event.target.closest('a') : null;
      if (!link || !link.closest('[data-tool-detail-page]')) return;
      if (link.matches('[data-decision-official-visit]')) {
        metrics.track((flowInstanceId) => ({
          eventName: 'official_site_click',
          eventVersion: 1,
          flowInstanceId,
          locale: metricLocale,
          surface: 'tool_detail',
          toolId,
          entryPoint: 'tool_detail',
          officialDomainCode: 'official_site',
        }));
      }
      const comparisonUrl = new URL(link.href, window.location.origin);
      if (comparisonUrl.origin !== window.location.origin) return;
      const comparisonPath = comparisonUrl.pathname;
      const key = comparisonPath.split('/').pop() || '';
      if (/^[a-z0-9]+(?:[_-][a-z0-9]+)*-comparison$/.test(key) && comparisonPath.includes('/guides/')) {
        metrics.track((flowInstanceId) => ({
          eventName: 'comparison_open',
          eventVersion: 1,
          flowInstanceId,
          locale: metricLocale,
          surface: 'comparison',
          comparisonKey: key,
          entryPoint: 'tool_detail',
          sourceToolId: toolId,
        }));
      }
    };
    const onToggle = (event: Event) => {
      const disclosure = event.target;
      if (!(disclosure instanceof HTMLDetailsElement) || !disclosure.open ||
          !disclosure.closest('[data-tool-detail-page] [data-evidence-ledger]')) return;
      const { claimType } = disclosure.dataset;
      if (!decisionClaimTypes.includes(claimType as DecisionClaimType)) return;
      metrics.track((flowInstanceId) => ({
        eventName: 'evidence_open',
        eventVersion: 1,
        flowInstanceId,
        locale: metricLocale,
        surface: 'tool_detail',
        toolId,
        evidenceSurface: 'ledger',
        claimType: claimType as DecisionClaimType,
      }));
    };
    document.addEventListener('click', onClick, true);
    document.addEventListener('toggle', onToggle, true);
    return () => {
      document.removeEventListener('click', onClick, true);
      document.removeEventListener('toggle', onToggle, true);
    };
  }, [enabled, locale, toolId]);

  return null;
}
