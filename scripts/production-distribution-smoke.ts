#!/usr/bin/env tsx
/**
 * Production smoke test for distribution-related routes.
 *
 * This is intentionally lightweight: it verifies that the routes exist,
 * return non-5xx responses, and show the expected content or redirects.
 */

const baseUrl = (process.env.SMOKE_BASE_URL || process.env.NEXT_PUBLIC_SITE_URL || 'https://aibesttool.com').replace(/\/$/, '');

type SmokeCheck = {
  path: string;
  acceptStatus: number[];
  keyword?: string;
  redirectPrefix?: string;
  allowForbidden?: boolean;
};

type SmokeResult = {
  path: string;
  status: number;
  ok: boolean;
  detail: string;
};

const checks: SmokeCheck[] = [
  { path: '/distribution', acceptStatus: [200, 302, 307, 308], keyword: 'Distribution' , redirectPrefix: '/login' },
  { path: '/admin/distribution', acceptStatus: [200, 302, 307, 308], keyword: 'Distribution' , redirectPrefix: '/login' },
  { path: '/admin/targets', acceptStatus: [200, 302, 307, 308], keyword: 'Target' , redirectPrefix: '/login' },
  { path: '/api/admin/distribution/report?format=json', acceptStatus: [200, 403], allowForbidden: true, keyword: 'summary' },
];

async function runCheck(check: SmokeCheck): Promise<SmokeResult> {
  const url = new URL(check.path, `${baseUrl}/`).toString();
  const response = await fetch(url, { redirect: 'manual' });
  const body = response.status === 200 ? await response.text() : '';

  if (!check.acceptStatus.includes(response.status)) {
    return { path: check.path, status: response.status, ok: false, detail: `Unexpected status ${response.status}` };
  }

  if (response.status === 403 && check.allowForbidden) {
    return { path: check.path, status: response.status, ok: true, detail: 'Forbidden as expected' };
  }

  if (response.status >= 300 && response.status < 400) {
    const location = response.headers.get('location') || '';
    if (check.redirectPrefix && !location.includes(check.redirectPrefix)) {
      return { path: check.path, status: response.status, ok: false, detail: `Redirected to unexpected location: ${location || '(missing location)'}` };
    }
    return { path: check.path, status: response.status, ok: true, detail: `Redirected to ${location || '(missing location)'}` };
  }

  if (check.keyword && !body.toLowerCase().includes(check.keyword.toLowerCase())) {
    return { path: check.path, status: response.status, ok: false, detail: `Missing keyword "${check.keyword}"` };
  }

  return { path: check.path, status: response.status, ok: true, detail: 'OK' };
}

async function main() {
  console.log(`🔎 Production distribution smoke check: ${baseUrl}`);
  const results = await Promise.all(checks.map((check) => runCheck(check)));
  results.forEach((result) => {
    const icon = result.ok ? '✅' : '❌';
    console.log(`${icon} ${result.path} -> ${result.status} (${result.detail})`);
  });

  const failed = results.filter((result) => !result.ok);
  if (failed.length > 0) {
    throw new Error(`Production distribution smoke check failed with ${failed.length} issue(s).`);
  }

  console.log(`\n✅ Production distribution smoke check passed for ${baseUrl}`);
}

main().catch((error) => {
  console.error(error instanceof Error ? error.message : error);
  process.exit(1);
});
