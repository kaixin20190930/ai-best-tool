import assert from 'node:assert/strict';

type Match = { id: string; name: string };

export function assertPikaEmptyPreimage(matches: Match[], idMatches: Match[], expectedId: string) {
  assert.equal(matches.length, 0, 'pika: duplicate slug, title, or domain requires manual review');
  assert.equal(idMatches.length, 0, 'pika: protected existing ID requires manual review');
  assert.match(expectedId, /^[0-9a-f-]{36}$/i);
}

export function assertPikaSingleInsert(rowCount: number | null) {
  assert.equal(rowCount, 1, 'pika: insert did not create exactly one entity; protected row was not overwritten');
}

export function assertPikaPostcheck(
  matches: Match[],
  expectedId: string,
  relationCounts: { tasks: number; capabilities: number; fits: number },
) {
  assert.equal(matches.length, 1, 'pika: postcheck requires one unique entity');
  assert.equal(matches[0].id, expectedId, 'pika: postcheck found an unexpected entity ID');
  assert.equal(matches[0].name, 'pika', 'pika: postcheck found an unexpected canonical slug');
  assert.deepEqual(relationCounts, { tasks: 0, capabilities: 0, fits: 0 }, 'pika: relations require separate approval');
}

export function assertPikaOnlinePage(
  pathname: string,
  page: { status: number; canonical: string | null; noindex: boolean; heading: string; decisionCard: boolean },
  sitemap: string,
) {
  assert.equal(page.status, 200, `pika: ${pathname} must return 200`);
  assert.equal(page.canonical, `https://aibesttool.com${pathname}`, `pika: ${pathname} canonical mismatch`);
  assert(page.noindex, `pika: ${pathname} must remain noindex`);
  assert.match(page.heading.toLowerCase(), /pika/, `pika: ${pathname} product heading missing`);
  assert(page.decisionCard, `pika: ${pathname} Decision Card missing`);
  assert(!/<loc>[^<]*pika[^<]*<\/loc>/i.test(sitemap), 'pika: sitemap must contain zero Pika URLs');
}
