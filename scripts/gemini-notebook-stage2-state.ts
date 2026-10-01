import { createHash } from 'node:crypto';

type Row = Record<string, unknown>;

export type Stage2State = {
  profile: Row | null;
  sources: Row[];
  claims: Row[];
  decision: Row | null;
  capabilities: Row[];
  fit: Row | null;
  decisionLinks: Row[];
  capabilityLinks: Row[];
  fitLinks: Row[];
};

// PostgreSQL jsonb::text orders object keys by UTF-8 byte length, then bytes,
// and uses a space after each comma and colon. Keep this in sync with the
// jsonb_build_object / jsonb_agg expression in the three Owner SQL files.
export function postgresJsonbText(value: unknown): string {
  if (value === null || value === undefined) return 'null';
  if (typeof value === 'string' || typeof value === 'number' || typeof value === 'boolean') {
    return JSON.stringify(value);
  }
  if (Array.isArray(value)) return `[${value.map(postgresJsonbText).join(', ')}]`;
  const record = value as Record<string, unknown>;
  const keys = Object.keys(record).sort((a, b) =>
    Buffer.byteLength(a, 'utf8') - Buffer.byteLength(b, 'utf8') || Buffer.compare(Buffer.from(a), Buffer.from(b)));
  return `{${keys.map((key) => `${JSON.stringify(key)}: ${postgresJsonbText(record[key])}`).join(', ')}}`;
}

const sorted = (rows: Row[], columns: string[]) => [...rows].sort((a, b) => {
  for (const column of columns) {
    const cmp = Buffer.compare(Buffer.from(String(a[column])), Buffer.from(String(b[column])));
    if (cmp) return cmp;
  }
  return 0;
});

export function stage2StateMd5(state: Stage2State): string {
  const payload = {
    profile: state.profile,
    sources: sorted(state.sources, ['id']),
    claims: sorted(state.claims, ['id']),
    decision: state.decision,
    capabilities: sorted(state.capabilities, ['id']),
    fit: state.fit,
    decisionLinks: sorted(state.decisionLinks, ['claim_id', 'purpose']),
    capabilityLinks: sorted(state.capabilityLinks, ['tool_capability_id', 'claim_id', 'purpose']),
    fitLinks: sorted(state.fitLinks, ['claim_id', 'purpose']),
  };
  return createHash('md5').update(postgresJsonbText(payload), 'utf8').digest('hex');
}
