import { randomUUID } from 'node:crypto';
import { constants } from 'node:fs';
import { lstat, mkdir, open, realpath, rename, unlink } from 'node:fs/promises';
import path from 'node:path';

type GscOutputKind = 'private' | 'summary';

function isInside(root: string, target: string): boolean {
  const relative = path.relative(root, target);
  return relative !== '' && relative !== '..' && !relative.startsWith(`..${path.sep}`) && !path.isAbsolute(relative);
}

async function checkDirectoryChain(workspaceRoot: string, directory: string, create: boolean): Promise<void> {
  const relative = path.relative(workspaceRoot, directory);
  if (relative === '..' || relative.startsWith(`..${path.sep}`) || path.isAbsolute(relative)) {
    throw new Error('GSC output directory escapes the workspace.');
  }
  const segments = relative === '' ? [] : relative.split(path.sep);
  async function checkSegment(index: number, parent: string): Promise<void> {
    if (index >= segments.length) return;
    const current = path.join(parent, segments[index]);
    try {
      let entry;
      try {
        entry = await lstat(current);
      } catch (error) {
        if (!create || (error as NodeJS.ErrnoException).code !== 'ENOENT') throw error;
        try {
          await mkdir(current, { mode: 0o700 });
        } catch (mkdirError) {
          if ((mkdirError as NodeJS.ErrnoException).code !== 'EEXIST') throw mkdirError;
        }
        entry = await lstat(current);
      }
      if (entry.isSymbolicLink() || !entry.isDirectory() || (await realpath(current)) !== current) {
        throw new Error(`GSC output directory is not a direct directory: ${current}`);
      }
    } catch (error) {
      if ((error as NodeJS.ErrnoException).code === 'ENOENT') {
        throw new Error(`GSC output directory does not exist: ${current}`);
      }
      throw error;
    }
    await checkSegment(index + 1, current);
  }
  await checkSegment(0, workspaceRoot);
}

async function checkTarget(target: string): Promise<void> {
  try {
    const entry = await lstat(target);
    if (entry.isSymbolicLink() || !entry.isFile()) {
      throw new Error(`GSC output target is not a regular file: ${target}`);
    }
  } catch (error) {
    if ((error as NodeJS.ErrnoException).code !== 'ENOENT') throw error;
  }
}

export default async function writeGscOutput(
  workspace: string,
  outputPath: string,
  content: string,
  kind: GscOutputKind,
): Promise<string> {
  const workspaceRoot = await realpath(workspace);
  const target = path.resolve(workspaceRoot, outputPath);
  const allowedRoot = path.join(workspaceRoot, ...(kind === 'private' ? ['.local', 'gsc'] : ['docs']));
  if (!isInside(allowedRoot, target) || (kind === 'summary' && path.extname(target) !== '.md')) {
    throw new Error(`GSC ${kind} output must stay inside ${allowedRoot}.`);
  }
  const parent = path.dirname(target);
  await checkDirectoryChain(workspaceRoot, parent, kind === 'private');
  await checkTarget(target);

  const temporary = path.join(parent, `.gsc-${randomUUID()}.tmp`);
  const handle = await open(
    temporary,
    constants.O_WRONLY + constants.O_CREAT + constants.O_EXCL + constants.O_NOFOLLOW,
    kind === 'private' ? 0o600 : 0o644,
  );
  let closed = false;
  let renamed = false;
  try {
    await checkDirectoryChain(workspaceRoot, parent, false);
    await handle.writeFile(content);
    await handle.sync();
    await handle.close();
    closed = true;
    await checkDirectoryChain(workspaceRoot, parent, false);
    await checkTarget(target);
    await rename(temporary, target);
    renamed = true;
  } finally {
    if (!closed) await handle.close();
    if (!renamed) {
      await checkDirectoryChain(workspaceRoot, parent, false)
        .then(() => unlink(temporary))
        .catch(() => undefined);
    }
  }
  return target;
}
