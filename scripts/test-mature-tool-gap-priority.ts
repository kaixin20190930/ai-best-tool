import fs from 'node:fs';
import path from 'node:path';

type PriorityItem = {
  action: string;
  decisionAngles: string[];
  deliverable: string;
  existingSources: string[];
  gscSignals: string[];
  priority: 'P0' | 'P1';
  rank: number;
  score: number;
  slug: string;
  status: 'queued' | 'in_progress' | 'completed' | 'blocked';
};

const queuePath = path.join(process.cwd(), 'data', 'collection', 'mature-tool-gap-priority-2026-09-01.json');
const queue = JSON.parse(fs.readFileSync(queuePath, 'utf8')) as { items: PriorityItem[] };

if (queue.items.length !== 10) {
  throw new Error(`Expected exactly 10 mature-tool priorities, received ${queue.items.length}.`);
}

const slugs = new Set<string>();
queue.items.forEach((item, index) => {
  if (item.rank !== index + 1) throw new Error(`Rank sequence is invalid at ${item.slug}.`);
  if (slugs.has(item.slug)) throw new Error(`Duplicate mature-tool slug: ${item.slug}.`);
  slugs.add(item.slug);

  if (!['upgrade_existing', 'consolidate_existing', 'migrate_and_upgrade'].includes(item.action)) {
    throw new Error(`${item.slug} would create an unapproved new URL.`);
  }
  if (item.gscSignals.length === 0 || item.existingSources.length === 0 || item.decisionAngles.length < 3) {
    throw new Error(`${item.slug} is missing demand, source, or decision evidence.`);
  }
  if (!item.deliverable.trim() || item.score < 0 || item.score > 100) {
    throw new Error(`${item.slug} has an invalid deliverable or score.`);
  }
});

console.log('✅ Mature-tool content gap priority queue is valid: 10 existing URLs, no duplicate expansion.');
