export type GrowthRelease = { id: string; releasedOn: string; paths: string[] };
export type GrowthMilestoneRecord = {
  key: string;
  release: string;
  releasedOn: string;
  day: number;
  dueOn: string;
  paths: string[];
  milestoneStatus: string;
  nextScheduledNode?: string;
};

export function milestoneDate(date: string, days: number) {
  const d = new Date(date + 'T00:00:00Z');
  d.setUTCDate(d.getUTCDate() + days);
  return d.toISOString().slice(0, 10);
}

// Recording an observation closes the scheduled check, not the search outcome.
// In particular, waiting_data must not become either a daily overdue task or a success.
export function reconcileGrowthMilestones(
  releases: GrowthRelease[],
  days: number[],
  today: string,
  ledgers: { file: string; data: unknown }[],
) {
  const records = new Map<string, { record: GrowthMilestoneRecord; file: string; observedOn: string }>();
  for (const { file, data } of ledgers) {
    const ledger = data as { schemaVersion?: number; observedOn?: string; records?: GrowthMilestoneRecord[] };
    if (ledger?.schemaVersion !== 1 || !Array.isArray(ledger.records))
      throw new Error('Invalid milestone ledger: ' + file);
    for (const record of ledger.records) {
      const release = releases.find((r) => r.id === record.release);
      const dueOn = release && milestoneDate(release.releasedOn, record.day);
      // Old releases can remain in the audit history without affecting this release window.
      if (release && record.releasedOn !== release.releasedOn) continue;
      const observedOn = ledger.observedOn || record.key?.slice(0, 10);
      if (
        !release ||
        !days.includes(record.day) ||
        record.dueOn !== dueOn ||
        record.key !== `${dueOn}:${release.id}:D+${record.day}` ||
        !Array.isArray(record.paths) ||
        [...record.paths].sort().join('\n') !== [...release.paths].sort().join('\n') ||
        !/^(observed_[a-z0-9_]+|waiting_data)$/.test(record.milestoneStatus) ||
        !observedOn ||
        !/^\d{4}-\d{2}-\d{2}$/.test(observedOn) ||
        observedOn < dueOn! ||
        observedOn > today
      )
        throw new Error('Invalid milestone record: ' + file);
      if (records.has(record.key)) throw new Error('Duplicate milestone record: ' + record.key);
      records.set(record.key, { record, file, observedOn });
    }
  }
  return releases.flatMap((release) =>
    days.map((day) => {
      const dueOn = milestoneDate(release.releasedOn, day);
      const key = `${dueOn}:${release.id}:D+${day}`;
      const entry = records.get(key);
      return {
        key,
        release: release.id,
        day,
        dueOn,
        status: entry?.record.milestoneStatus || (today < dueOn ? 'not_due' : 'due_needs_evidence'),
        needsObservation: today >= dueOn && !entry,
        observedOn: entry?.observedOn || null,
        evidenceFile: entry?.file || null,
        nextScheduledNode: entry?.record.nextScheduledNode || null,
      };
    }),
  );
}

const start = '<!-- growth-observation:start -->';
const end = '<!-- growth-observation:end -->';
export function updateGrowthObservationDocument(previous: string, generated: string) {
  const section = `${start}\n${generated.trim()}\n${end}`;
  if (previous.includes(start)) {
    const first = previous.indexOf(start);
    const last = previous.indexOf(end, first);
    if (last < 0) throw new Error('Unclosed generated observation section');
    return previous.slice(0, first) + section + previous.slice(last + end.length);
  }
  // Migrate the original generated preamble while retaining human/Google evidence sections.
  const evidence = previous.search(/^## /m);
  return section + '\n' + (evidence < 0 ? '' : '\n' + previous.slice(evidence));
}
