import assert from 'node:assert/strict';
import { lstat, mkdir, mkdtemp, readFile, rm, symlink } from 'node:fs/promises';
import os from 'node:os';
import path from 'node:path';

import writeGscOutput from '../lib/integrations/gsc-output-safety';

async function main() {
  const fixture = await mkdtemp(path.join(os.tmpdir(), 'gsc-output-safety-'));
  const workspace = path.join(fixture, 'workspace');
  const outside = path.join(fixture, 'outside');
  await mkdir(path.join(workspace, 'docs'), { recursive: true });
  await mkdir(outside);
  try {
    const privatePath = await writeGscOutput(workspace, '.local/gsc/sample/snapshot.json', '{"ok":true}', 'private');
    assert.equal(await readFile(privatePath, 'utf8'), '{"ok":true}');
    await writeGscOutput(workspace, '.local/gsc/sample/snapshot.json', '{"ok":false}', 'private');
    assert.equal(await readFile(privatePath, 'utf8'), '{"ok":false}');
    assert.equal((await lstat(privatePath)).mode % 0o1000, 0o600);

    const summaryPath = await writeGscOutput(workspace, 'docs/summary.md', '# Summary\n', 'summary');
    assert.equal(await readFile(summaryPath, 'utf8'), '# Summary\n');

    await symlink(outside, path.join(workspace, 'docs', 'escape'));
    await assert.rejects(
      writeGscOutput(workspace, 'docs/escape/leak.md', 'private query', 'summary'),
      /not a direct directory/,
    );
    await assert.rejects(readFile(path.join(outside, 'leak.md')));

    await symlink(path.join(outside, 'target.md'), path.join(workspace, 'docs', 'target.md'));
    await assert.rejects(writeGscOutput(workspace, 'docs/target.md', 'private query', 'summary'), /not a regular file/);
    await assert.rejects(readFile(path.join(outside, 'target.md')));

    await rm(path.join(workspace, '.local'), { recursive: true });
    await symlink(outside, path.join(workspace, '.local'));
    await assert.rejects(
      writeGscOutput(workspace, '.local/gsc/escaped.json', '{"private":true}', 'private'),
      /not a direct directory/,
    );
    await assert.rejects(readFile(path.join(outside, 'gsc', 'escaped.json')));
    process.stdout.write('GSC output path safety tests passed.\n');
  } finally {
    await rm(fixture, { recursive: true, force: true });
  }
}

main().catch((error: unknown) => {
  process.stderr.write(`${error instanceof Error ? error.stack : String(error)}\n`);
  process.exitCode = 1;
});
