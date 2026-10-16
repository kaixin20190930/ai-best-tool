import assert from 'node:assert/strict';

export type ApprovedWritablePath = { slug: string; path: string; from: string; to: string };
export type WritableItem = {
  slug: string;
  detailReplacements?: Record<string, { from: string; to: string }>;
  featureReplacements?: { path: string[]; from: string; to: string }[];
};

const allowedPath = /^(?:detail\.(?:en|zh|cn)|features\.decision\.freshnessSummary\.(?:en|zh|cn))$/;

export function validateApprovedWritablePaths(items: WritableItem[], approved: ApprovedWritablePath[]) {
  assert(Array.isArray(approved), 'Missing approvedWritablePaths');
  const actual = items.flatMap((item) => [
    ...Object.entries(item.detailReplacements || {}).map(([locale, patch]) => ({
      slug: item.slug,
      path: `detail.${locale}`,
      ...patch,
    })),
    ...(item.featureReplacements || []).map((patch) => ({
      slug: item.slug,
      path: `features.${patch.path.join('.')}`,
      from: patch.from,
      to: patch.to,
    })),
  ]);
  for (const entry of [...actual, ...approved]) {
    assert(allowedPath.test(entry.path), `Unauthorized writable path ${entry.path}`);
    assert(
      items.some((item) => item.slug === entry.slug),
      `Unknown writable slug ${entry.slug}`,
    );
    assert(typeof entry.from === 'string' && entry.from.length > 0, `Missing old value ${entry.path}`);
    assert(
      typeof entry.to === 'string' && entry.to.length > 0 && entry.to !== entry.from,
      `Invalid new value ${entry.path}`,
    );
  }
  const canonical = (entries: ApprovedWritablePath[]) => entries.map((entry) => JSON.stringify(entry)).sort();
  assert.equal(
    new Set(actual.map((entry) => `${entry.slug}:${entry.path}`)).size,
    actual.length,
    'Duplicate replacement path',
  );
  assert.equal(
    new Set(approved.map((entry) => `${entry.slug}:${entry.path}`)).size,
    approved.length,
    'Duplicate approved path',
  );
  assert.deepEqual(canonical(actual), canonical(approved), 'Writable path or value is not exactly approved');
}

export function replaceApprovedText(value: string, from: string, to: string) {
  if (value.includes(to) && !value.includes(from)) return value;
  assert(value.includes(from), 'Old value does not match');
  return value.replace(from, to);
}

export function replaceApprovedAtPath(value: Record<string, any>, path: string[], from: string, to: string) {
  assert(allowedPath.test(`features.${path.join('.')}`), `Unauthorized feature path ${path.join('.')}`);
  let cursor = value;
  for (const key of path.slice(0, -1)) {
    assert(cursor[key] && typeof cursor[key] === 'object', `Missing ${path.join('.')}`);
    cursor = cursor[key];
  }
  const key = path.at(-1)!;
  if (cursor[key] === to) return;
  assert.equal(cursor[key], from, `Old value does not match ${path.join('.')}`);
  cursor[key] = to;
}

export function buildAllowedUpdateSql(featurePaths: string[][], writeDetail: boolean) {
  for (const path of featurePaths) {
    assert(allowedPath.test(`features.${path.join('.')}`), `Unauthorized feature path ${path.join('.')}`);
  }
  const offset = writeDetail ? 0 : -1;
  const featureExpr = featurePaths.reduce(
    (expr, _, index) =>
      `jsonb_set(${expr}, $${6 + offset + 2 * index}::text[], $${7 + offset + 2 * index}::jsonb, false)`,
    `jsonb_set(t.features, '{maintenanceReview}', $${3 + offset}::jsonb, true)`,
  );
  const assignments = [
    ...(writeDetail ? ['detail=$2::jsonb'] : []),
    `features=${featureExpr}`,
    `next_review_date=$${4 + offset}::date`,
  ];
  return `UPDATE public.tools AS t SET ${assignments.join(', ')}
    WHERE id=$1 AND name=$${5 + offset} RETURNING to_jsonb(t) - 'search_vector' AS record`;
}
