import { createHash } from 'node:crypto';

import { extractProductEvidence } from '@/lib/services/intelligence/evidenceExtractor';
import { classifyProductPage } from '@/lib/services/intelligence/pageClassifier';
import { discoverProductPages } from '@/lib/services/intelligence/pageDiscovery';
import { persistProductIntelligence, previewProductIntelligence } from '@/lib/services/intelligence/persistence';
import {
  isEvidenceHtmlContentType,
  isSuccessfulHttpStatus,
  SafeFetchError,
  safeFetchText,
} from '@/lib/services/intelligence/safeFetch';
import type { IntelligenceFetchStatus, IntelligencePageType } from '@/lib/services/intelligence/types';

async function run() {
  const args = process.argv.slice(2);
  const websiteUrl = args.find((argument) => argument !== '--' && !argument.startsWith('--'));
  const dryRun = args.includes('--dry-run');
  const ownerType = (args.find((argument) => argument.startsWith('--owner-type='))?.split('=')[1] || 'tool') as
    | 'tool'
    | 'distribution_project';
  const ownerId = args.find((argument) => argument.startsWith('--owner-id='))?.split('=')[1] || '';

  if (!websiteUrl) {
    throw new Error(
      'Usage: pnpm run intelligence:sync -- https://example.com --owner-id=<uuid> [--owner-type=tool|distribution_project] [--dry-run]',
    );
  }

  if (!ownerId) {
    throw new Error('The --owner-id flag is required.');
  }

  const discovery = await discoverProductPages(websiteUrl);
  const sources: Array<{
    url: string;
    pageType: IntelligencePageType;
    fetchStatus: IntelligenceFetchStatus;
    httpStatus: number | null;
    canonicalUrl: string | null;
    contentHash: string | null;
    contentType: string | null;
    fetchedAt: string;
    metadata: Record<string, unknown>;
    claims: ReturnType<typeof extractProductEvidence>['claims'];
    assets: ReturnType<typeof extractProductEvidence>['assets'];
  }> = [];

  for (const page of discovery.pages) {
    try {
      const fetched = await safeFetchText(page.url);
      const fetchedAt = new Date().toISOString();
      const isUsableEvidence = isSuccessfulHttpStatus(fetched.status) && isEvidenceHtmlContentType(fetched.contentType);

      if (!isUsableEvidence) {
        sources.push({
          url: fetched.finalUrl,
          pageType: page.pageType,
          fetchStatus: 'failed',
          httpStatus: fetched.status,
          canonicalUrl: fetched.finalUrl,
          contentHash: null,
          contentType: fetched.contentType,
          fetchedAt,
          metadata: {
            discovery: page,
            ignoredReason: isSuccessfulHttpStatus(fetched.status) ? 'non_html_evidence' : 'non_success_http_status',
          },
          claims: [],
          assets: [],
        });
        continue;
      }

      const classification = classifyProductPage({ url: fetched.finalUrl, html: fetched.body });
      const evidence = extractProductEvidence({
        url: fetched.finalUrl,
        html: fetched.body,
        pageType: classification.pageType,
      });

      sources.push({
        url: fetched.finalUrl,
        pageType: classification.pageType,
        fetchStatus: 'success',
        httpStatus: fetched.status,
        canonicalUrl: fetched.finalUrl,
        contentHash: createHash('sha256').update(fetched.body).digest('hex'),
        contentType: fetched.contentType,
        fetchedAt,
        metadata: {
          discovery: page,
          classification,
          warnings: evidence.warnings,
        },
        claims: evidence.claims,
        assets: evidence.assets,
      });
    } catch (error) {
      sources.push({
        url: page.url,
        pageType: page.pageType,
        fetchStatus: error instanceof SafeFetchError && error.code === 'robots_disallowed' ? 'blocked' : 'failed',
        httpStatus: null,
        canonicalUrl: null,
        contentHash: null,
        contentType: null,
        fetchedAt: new Date().toISOString(),
        metadata: {
          discovery: page,
          error: error instanceof Error ? error.message : 'unknown_fetch_error',
          errorCode: error instanceof SafeFetchError ? error.code : 'unknown',
        },
        claims: [],
        assets: [],
      });
    }
  }

  const result = dryRun
    ? await previewProductIntelligence({
        ownerType,
        ownerId,
        canonicalDomain: new URL(websiteUrl).hostname.replace(/^www\./, ''),
        productName: discovery.pages.find((page) => page.pageType === 'homepage')?.anchorText || undefined,
        sources,
      })
    : await persistProductIntelligence({
        ownerType,
        ownerId,
        canonicalDomain: new URL(websiteUrl).hostname.replace(/^www\./, ''),
        productName: discovery.pages.find((page) => page.pageType === 'homepage')?.anchorText || undefined,
        sources,
      });

  console.log(
    JSON.stringify(
      {
        dryRun,
        websiteUrl,
        profileId: result.profileId,
        profileStatus: result.profileStatus,
        versionChanged: result.versionChanged,
        summary: result.snapshot.summary,
        facts: result.snapshot.facts,
        conflicts: result.snapshot.conflicts,
      },
      null,
      2,
    ),
  );
}

run().catch((error) => {
  console.error(error instanceof Error ? error.message : error);
  process.exitCode = 1;
});
