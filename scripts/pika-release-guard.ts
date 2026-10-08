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
