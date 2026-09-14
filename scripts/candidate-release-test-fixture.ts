import { spawnSync } from 'node:child_process';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';

// Keep date/media regression checks independent of the real candidate's release status.
export default function runUnreleasedCandidate(slug: string, args: string[], preload?: string) {
  const root = process.cwd();
  const fixture = fs.mkdtempSync(path.join(os.tmpdir(), 'candidate-release-test-'));
  try {
    fs.mkdirSync(path.join(fixture, 'data/collection'), { recursive: true });
    const auditPath = `data/collection/${slug}-preaudit-2026-09-07.json`;
    const audit = JSON.parse(fs.readFileSync(path.join(root, auditPath), 'utf8'));
    audit.status = 'ready_for_next_slot';
    audit.productionWriteApproved = false;
    audit.sitemapChangeApproved = false;
    delete audit.releasedAt;
    delete audit.actualPublishedAt;
    delete audit.releaseIndexState;
    fs.writeFileSync(path.join(fixture, auditPath), JSON.stringify(audit));
    fs.copyFileSync(
      path.join(root, `data/collection/${slug}-release.json`),
      path.join(fixture, `data/collection/${slug}-release.json`),
    );
    for (const directory of ['public', 'node_modules']) {
      fs.symlinkSync(path.join(root, directory), path.join(fixture, directory), 'dir');
    }
    return spawnSync(
      process.execPath,
      [
        '--import', 'tsx', ...(preload ? ['--import', preload] : []),
        path.join(root, 'scripts/candidate-release-pipeline.ts'), `--candidate=${slug}`, ...args,
      ],
      {
        cwd: fixture,
        encoding: 'utf8',
        env: { ...process.env, POSTGRES_URL: 'postgres://invalid:invalid@127.0.0.1:1/invalid' },
      },
    );
  } finally {
    fs.rmSync(fixture, { recursive: true, force: true });
  }
}
