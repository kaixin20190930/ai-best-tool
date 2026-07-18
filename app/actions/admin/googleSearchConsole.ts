'use server';

import { revalidatePath } from 'next/cache';

import { query } from '@/db/neon/client';
import { BASE_URL } from '@/lib/env';
import { requireAdmin } from '@/lib/auth/middleware';
import {
  createGoogleSearchConsoleClient,
  createRefreshTokenAccessTokenProvider,
  type GoogleSearchConsoleClientConfig,
} from '@/lib/integrations/google-search-console';

type GoogleSearchConsoleLogStatus = 'success' | 'failed';
type GoogleSearchConsoleLogOperation = 'submit_sitemap' | 'inspect_url';
type GoogleSearchConsoleLogSource = 'admin' | 'monitor-api';

async function ensureGoogleSearchConsoleLogsTable() {
  await query(`
    CREATE TABLE IF NOT EXISTS google_search_console_logs (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      operation TEXT NOT NULL CHECK (operation IN ('submit_sitemap', 'inspect_url')),
      property_url TEXT NOT NULL,
      target_url TEXT NOT NULL,
      status TEXT NOT NULL CHECK (status IN ('success', 'failed')),
      source TEXT,
      response JSONB,
      error_message TEXT,
      created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
    )
  `);
  await query(`
    CREATE INDEX IF NOT EXISTS idx_google_search_console_logs_created_at
    ON google_search_console_logs(created_at DESC)
  `);
  await query(`
    CREATE INDEX IF NOT EXISTS idx_google_search_console_logs_operation
    ON google_search_console_logs(operation)
  `);
  await query(`
    CREATE INDEX IF NOT EXISTS idx_google_search_console_logs_status
    ON google_search_console_logs(status)
  `);
}

async function insertGoogleSearchConsoleLog(input: {
  operation: GoogleSearchConsoleLogOperation;
  propertyUrl: string;
  targetUrl: string;
  status: GoogleSearchConsoleLogStatus;
  source?: GoogleSearchConsoleLogSource | null;
  response?: Record<string, unknown> | null;
  errorMessage?: string | null;
}) {
  await ensureGoogleSearchConsoleLogsTable();
  await query(
    `
      INSERT INTO google_search_console_logs (
        operation,
        property_url,
        target_url,
        status,
        source,
        response,
        error_message
      )
      VALUES ($1, $2, $3, $4, $5, $6, $7)
    `,
    [
      input.operation,
      input.propertyUrl,
      input.targetUrl,
      input.status,
      input.source || null,
      input.response ? JSON.stringify(input.response) : null,
      input.errorMessage || null,
    ]
  );
}

function getGoogleSearchConsoleConfig(overrides?: {
  propertyUrl?: string;
  siteOrigin?: string;
  clientId?: string;
  clientSecret?: string;
  refreshToken?: string;
}): GoogleSearchConsoleClientConfig {
  const propertyUrl =
    overrides?.propertyUrl?.trim() ||
    process.env.GSC_PROPERTY_URL ||
    BASE_URL ||
    '';
  const siteOrigin =
    overrides?.siteOrigin?.trim() ||
    process.env.GSC_SITE_ORIGIN ||
    BASE_URL ||
    undefined;
  const clientId = overrides?.clientId?.trim() || process.env.GSC_CLIENT_ID || '';
  const clientSecret = overrides?.clientSecret?.trim() || process.env.GSC_CLIENT_SECRET || '';
  const refreshToken = overrides?.refreshToken?.trim() || process.env.GSC_REFRESH_TOKEN || '';

  if (!propertyUrl) {
    throw new Error('GSC_PROPERTY_URL is not configured.');
  }
  if (!clientId || !clientSecret || !refreshToken) {
    throw new Error('GSC_CLIENT_ID, GSC_CLIENT_SECRET and GSC_REFRESH_TOKEN are required.');
  }

  return {
    propertyUrl,
    siteOrigin,
    accessTokenProvider: createRefreshTokenAccessTokenProvider({
      clientId,
      clientSecret,
      refreshToken,
    }),
  };
}

async function runGoogleSearchConsoleOperation(
  operation: GoogleSearchConsoleLogOperation,
  targetUrl: string,
  source: GoogleSearchConsoleLogSource,
  overrides: {
    propertyUrl?: string;
    siteOrigin?: string;
    clientId?: string;
    clientSecret?: string;
    refreshToken?: string;
  } | undefined,
  executor: (client: ReturnType<typeof createGoogleSearchConsoleClient>) => Promise<Record<string, unknown>>
) {
  let config: GoogleSearchConsoleClientConfig;

  try {
    config = getGoogleSearchConsoleConfig(overrides);
  } catch (error) {
    const errorMessage =
      error instanceof Error ? error.message : 'Google Search Console is not configured.';

    try {
      await insertGoogleSearchConsoleLog({
        operation,
        propertyUrl:
          overrides?.propertyUrl?.trim() ||
          process.env.GSC_PROPERTY_URL ||
          BASE_URL ||
          '',
        targetUrl,
        status: 'failed',
        source,
        errorMessage,
      });
    } catch {
      // Logging should never turn a configuration error into a harder failure.
    }

    return { success: false, error: errorMessage };
  }

  const client = createGoogleSearchConsoleClient(config);

  try {
    const response = await executor(client);
    await insertGoogleSearchConsoleLog({
      operation,
      propertyUrl: config.propertyUrl,
      targetUrl,
      status: 'success',
      source,
      response,
    });
    return { success: true, response };
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Google Search Console operation failed.';
    await insertGoogleSearchConsoleLog({
      operation,
      propertyUrl: config.propertyUrl,
      targetUrl,
      status: 'failed',
      source,
      errorMessage,
    });
    return { success: false, error: errorMessage };
  }
}

export async function submitGoogleSearchConsoleSitemapAction(formData: FormData) {
  try {
    await requireAdmin();
  } catch (error) {
    return { success: false, error: error instanceof Error ? error.message : 'Unauthorized' };
  }

  const sitemapUrl = String(formData.get('sitemapUrl') || '').trim();
  const propertyUrl = String(formData.get('propertyUrl') || '').trim() || undefined;
  const siteOrigin = String(formData.get('siteOrigin') || '').trim() || undefined;
  if (!sitemapUrl) {
    return { success: false, error: 'Sitemap URL is required.' };
  }

  const result = await runGoogleSearchConsoleOperation(
    'submit_sitemap',
    sitemapUrl,
    'admin',
    { propertyUrl, siteOrigin },
    async (client) => client.submitSitemap(sitemapUrl)
  );

  revalidatePath('/admin/search-console');
  return result;
}

export async function inspectGoogleSearchConsoleUrlAction(formData: FormData) {
  try {
    await requireAdmin();
  } catch (error) {
    return { success: false, error: error instanceof Error ? error.message : 'Unauthorized' };
  }

  const inspectionUrl = String(formData.get('inspectionUrl') || '').trim();
  const propertyUrl = String(formData.get('propertyUrl') || '').trim() || undefined;
  const siteOrigin = String(formData.get('siteOrigin') || '').trim() || undefined;
  if (!inspectionUrl) {
    return { success: false, error: 'Inspection URL is required.' };
  }

  const result = await runGoogleSearchConsoleOperation(
    'inspect_url',
    inspectionUrl,
    'admin',
    { propertyUrl, siteOrigin },
    async (client) => client.inspectUrl(inspectionUrl).then((data) => data.raw as Record<string, unknown>)
  );

  revalidatePath('/admin/search-console');
  return result;
}

export async function submitGoogleSearchConsoleSitemapBySystem(
  sitemapUrl: string,
  overrides?: {
    propertyUrl?: string;
    siteOrigin?: string;
    clientId?: string;
    clientSecret?: string;
    refreshToken?: string;
  },
  source: GoogleSearchConsoleLogSource = 'monitor-api'
) {
  if (!sitemapUrl.trim()) {
    return { success: false, error: 'Sitemap URL is required.' };
  }

  return runGoogleSearchConsoleOperation(
    'submit_sitemap',
    sitemapUrl,
    source,
    overrides,
    async (client) => client.submitSitemap(sitemapUrl).then((data) => data as unknown as Record<string, unknown>)
  );
}

export async function inspectGoogleSearchConsoleUrlBySystem(
  inspectionUrl: string,
  overrides?: {
    propertyUrl?: string;
    siteOrigin?: string;
    clientId?: string;
    clientSecret?: string;
    refreshToken?: string;
  },
  source: GoogleSearchConsoleLogSource = 'monitor-api'
) {
  if (!inspectionUrl.trim()) {
    return { success: false, error: 'Inspection URL is required.' };
  }

  return runGoogleSearchConsoleOperation(
    'inspect_url',
    inspectionUrl,
    source,
    overrides,
    async (client) => client.inspectUrl(inspectionUrl).then((data) => data.raw as Record<string, unknown>)
  );
}

export async function getGoogleSearchConsoleLogs(limit = 50) {
  try {
    await requireAdmin();
  } catch {
    return [];
  }

  await ensureGoogleSearchConsoleLogsTable();

  const result = await query(
    `
      SELECT
        id::text AS id,
        operation,
        property_url AS "propertyUrl",
        target_url AS "targetUrl",
        status,
        source,
        response,
        error_message AS "errorMessage",
        created_at AS "createdAt"
      FROM google_search_console_logs
      ORDER BY created_at DESC
      LIMIT $1
    `,
    [Math.max(1, Math.min(limit, 200))]
  );

  return result.rows as Array<{
    id: string;
    operation: GoogleSearchConsoleLogOperation;
    propertyUrl: string;
    targetUrl: string;
    status: GoogleSearchConsoleLogStatus;
    source: GoogleSearchConsoleLogSource | null;
    response: Record<string, unknown> | null;
    errorMessage: string | null;
    createdAt: string;
  }>;
}
