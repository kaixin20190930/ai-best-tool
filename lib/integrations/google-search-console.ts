export type GoogleAccessTokenProvider = () => Promise<string>;

export type GoogleSearchConsoleClientConfig = {
  propertyUrl: string;
  accessTokenProvider: GoogleAccessTokenProvider;
  siteOrigin?: string;
};

export type GoogleSearchConsoleSitemapResult = {
  siteUrl: string;
  sitemapUrl: string;
  status: number;
};

export type GoogleSearchConsoleUrlInspectionResult = {
  siteUrl: string;
  inspectionUrl: string;
  raw: unknown;
};

export type GoogleSearchConsoleProperty = {
  siteUrl: string;
  permissionLevel: string;
};

export type SearchAnalyticsDimension = 'date' | 'page' | 'query';

export type SearchAnalyticsRequest = {
  startDate: string;
  endDate: string;
  type?: 'web';
  dimensions?: SearchAnalyticsDimension[];
  dataState?: 'all' | 'final';
  rowLimit?: number;
  startRow?: number;
};

export type SearchAnalyticsRow = {
  keys?: string[];
  clicks: number;
  impressions: number;
  ctr: number;
  position: number;
};

export type SearchAnalyticsResponse = {
  rows?: SearchAnalyticsRow[];
  responseAggregationType?: string;
  metadata?: { first_incomplete_date?: string };
};

export function createRefreshTokenAccessTokenProvider(input: {
  clientId: string;
  clientSecret: string;
  refreshToken: string;
}) {
  const { clientId, clientSecret, refreshToken } = input;

  return async function getAccessToken(): Promise<string> {
    const tokenResponse = await fetch('https://oauth2.googleapis.com/token', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: new URLSearchParams({
        client_id: clientId,
        client_secret: clientSecret,
        refresh_token: refreshToken,
        grant_type: 'refresh_token',
      }).toString(),
    });

    if (!tokenResponse.ok) {
      throw new Error(`Failed to refresh Google access token (${tokenResponse.status}).`);
    }

    const data = (await tokenResponse.json()) as { access_token?: string };
    if (!data.access_token) {
      throw new Error('Google token endpoint returned no access token.');
    }

    return data.access_token;
  };
}

function resolveAbsoluteUrl(input: string, siteOrigin?: string) {
  const value = input.trim();
  if (!value) {
    throw new Error('URL is required.');
  }

  if (/^https?:\/\//i.test(value)) {
    return value;
  }

  if (!siteOrigin) {
    throw new Error('siteOrigin is required for relative URLs.');
  }

  return new URL(value, siteOrigin).toString();
}

async function authorizedJsonRequest(
  accessTokenProvider: GoogleAccessTokenProvider,
  url: string,
  init: RequestInit = {},
) {
  const accessToken = await accessTokenProvider();
  return fetch(url, {
    ...init,
    headers: {
      Authorization: `Bearer ${accessToken}`,
      ...(init.headers || {}),
    },
  });
}

export function createGoogleSearchConsoleClient(config: GoogleSearchConsoleClientConfig) {
  const propertyUrl = config.propertyUrl.trim();
  if (!propertyUrl) {
    throw new Error('propertyUrl is required.');
  }

  return {
    async getProperty(): Promise<GoogleSearchConsoleProperty> {
      const endpoint = `https://www.googleapis.com/webmasters/v3/sites/${encodeURIComponent(propertyUrl)}`;
      const response = await authorizedJsonRequest(config.accessTokenProvider, endpoint);
      if (!response.ok) {
        throw new Error(`Google Search Console property access check failed (${response.status}).`);
      }
      const property = (await response.json()) as GoogleSearchConsoleProperty;
      if (
        property.siteUrl !== propertyUrl ||
        !['siteOwner', 'siteFullUser', 'siteRestrictedUser'].includes(property.permissionLevel)
      ) {
        throw new Error('Google Search Console property is not readable by this account.');
      }
      return property;
    },

    async querySearchAnalytics(request: SearchAnalyticsRequest): Promise<SearchAnalyticsResponse> {
      if (
        request.rowLimit !== undefined &&
        (!Number.isInteger(request.rowLimit) || request.rowLimit < 1 || request.rowLimit > 25_000)
      ) {
        throw new Error('Search Analytics rowLimit must be between 1 and 25000.');
      }
      if (request.startRow !== undefined && (!Number.isInteger(request.startRow) || request.startRow < 0)) {
        throw new Error('Search Analytics startRow must be a non-negative integer.');
      }
      const endpoint = `https://www.googleapis.com/webmasters/v3/sites/${encodeURIComponent(propertyUrl)}/searchAnalytics/query`;
      const response = await authorizedJsonRequest(config.accessTokenProvider, endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(request),
      });
      if (!response.ok) {
        throw new Error(`Google Search Console Search Analytics query failed (${response.status}).`);
      }
      return (await response.json()) as SearchAnalyticsResponse;
    },

    async submitSitemap(sitemapUrl: string): Promise<GoogleSearchConsoleSitemapResult> {
      const resolvedSitemapUrl = resolveAbsoluteUrl(sitemapUrl, config.siteOrigin);
      const endpoint = `https://www.googleapis.com/webmasters/v3/sites/${encodeURIComponent(propertyUrl)}/sitemaps/${encodeURIComponent(resolvedSitemapUrl)}`;
      const response = await authorizedJsonRequest(config.accessTokenProvider, endpoint, {
        method: 'PUT',
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Google Search Console sitemap submission failed: ${errorText}`);
      }

      return {
        siteUrl: propertyUrl,
        sitemapUrl: resolvedSitemapUrl,
        status: response.status,
      };
    },

    async inspectUrl(inspectionUrl: string): Promise<GoogleSearchConsoleUrlInspectionResult> {
      const resolvedInspectionUrl = resolveAbsoluteUrl(inspectionUrl, config.siteOrigin);
      const response = await authorizedJsonRequest(
        config.accessTokenProvider,
        'https://searchconsole.googleapis.com/v1/urlInspection/index:inspect',
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            inspectionUrl: resolvedInspectionUrl,
            siteUrl: propertyUrl,
          }),
        },
      );

      const raw = await response.json().catch(async () => ({
        message: await response.text(),
      }));

      if (!response.ok) {
        throw new Error(
          `Google Search Console URL inspection failed: ${
            typeof raw === 'object' && raw && 'message' in raw
              ? String((raw as { message?: string }).message || '')
              : response.statusText
          }`,
        );
      }

      return {
        siteUrl: propertyUrl,
        inspectionUrl: resolvedInspectionUrl,
        raw,
      };
    },
  };
}
