import { createHash } from 'node:crypto';
import { loadEnvConfig } from '@next/env';

import { closePool } from '@/db/neon/client';
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
import { getToolById } from '@/lib/services/tools';

loadEnvConfig(process.cwd());

function describeError(error: unknown) {
  if (!(error instanceof Error)) return String(error);

  const cause = error.cause;
  if (!cause || typeof cause !== 'object') return error.message;

  const details = cause as {
    code?: unknown;
    hostname?: unknown;
    message?: unknown;
  };
  const causeParts = [
    typeof details.code === 'string' ? `code=${details.code}` : null,
    typeof details.hostname === 'string' ? `host=${details.hostname}` : null,
    typeof details.message === 'string' ? details.message : null,
  ].filter(Boolean);

  return causeParts.length > 0 ? `${error.message} (${causeParts.join(', ')})` : error.message;
}

async function run() {
  const args = process.argv.slice(2);
  const websiteUrl = args.find((argument) => argument !== '--' && !argument.startsWith('--'));
  const dryRun = args.includes('--dry-run');
  const ownerTypeValue = args.find((argument) => argument.startsWith('--owner-type='))?.split('=')[1] || 'tool';
  if (!['tool', 'distribution_project', 'site'].includes(ownerTypeValue)) {
    throw new Error('The --owner-type flag must be tool, distribution_project, or site.');
  }
  const ownerType = ownerTypeValue as 'tool' | 'distribution_project' | 'site';
  const ownerId = args.find((argument) => argument.startsWith('--owner-id='))?.split('=')[1] || '';

  if (!websiteUrl) {
    throw new Error(
      'Usage: pnpm run intelligence:sync -- https://example.com --owner-id=<uuid> [--owner-type=tool|distribution_project|site] [--dry-run]',
    );
  }

  if (!ownerId) {
    throw new Error('The --owner-id flag is required.');
  }

  if (ownerType === 'tool') {
    const ownerTool = await getToolById(ownerId);
    if (!ownerTool) {
      throw new Error(
        `The tool owner ID ${ownerId} does not exist in the directory. Open the tool in Admin and use the UUID from /admin/tools/<uuid>/edit.`,
      );
    }
  }

  const adminKey = process.env.SUPABASE_SECRET_KEY?.trim() || process.env.SUPABASE_SERVICE_ROLE_KEY?.trim();
  if (!dryRun && !adminKey) {
    throw new Error(
      'SUPABASE_SECRET_KEY or SUPABASE_SERVICE_ROLE_KEY is required for database writes. Add one to .env.local without a NEXT_PUBLIC_ prefix, then rerun the command.',
    );
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

  const input = {
    ownerType,
    ownerId,
    canonicalDomain: new URL(websiteUrl).hostname.replace(/^www\./, ''),
    productName: discovery.pages.find((page) => page.pageType === 'homepage')?.anchorText || undefined,
    sources,
  };

  let result;
  try {
    result = dryRun ? await previewProductIntelligence(input) : await persistProductIntelligence(input);
  } catch (error) {
    const supabaseHost = (() => {
      try {
        return new URL(process.env.NEXT_PUBLIC_SUPABASE_URL || '').hostname;
      } catch {
        return 'invalid-or-missing-host';
      }
    })();

    throw new Error(
      `${dryRun ? 'Intelligence preview' : 'Supabase persistence'} failed${
        dryRun ? '' : ` for ${supabaseHost}`
      }: ${describeError(error)}`,
    );
  }

  console.log(
    JSON.stringify(
      {
        dryRun,
        websiteUrl,
        profileId: result.profileId,
        profileStatus: result.profileStatus,
        versionChanged: result.versionChanged,
        pendingChangeCount: result.pendingChangeCount,
        summary: result.snapshot.summary,
        facts: result.snapshot.facts,
        conflicts: result.snapshot.conflicts,
      },
      null,
      2,
    ),
  );
}

run()
  .catch((error) => {
    console.error(describeError(error));
    process.exitCode = 1;
  })
  .finally(async () => {
    await closePool();
    process.exit(process.exitCode || 0);
  });
