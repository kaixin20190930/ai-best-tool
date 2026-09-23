import assert from 'node:assert/strict';
import { spawn } from 'node:child_process';

const port = 31887;
const server = spawn(process.execPath, ['node_modules/next/dist/bin/next', 'start', '-p', String(port)], {
  cwd: process.cwd(),
  stdio: 'ignore',
  env: process.env,
});
const origin = `http://127.0.0.1:${port}`;

async function waitForServer(): Promise<void> {
  for (let attempt = 0; attempt < 60; attempt += 1) {
    if (server.exitCode !== null) throw new Error(`next start exited early with ${server.exitCode}`);
    try {
      await fetch(`${origin}/api/health`, { signal: AbortSignal.timeout(1500) });
      return;
    } catch {
      await new Promise((resolve) => {
        setTimeout(resolve, 500);
      });
    }
  }
  throw new Error('next start did not become ready');
}

async function main() {
  try {
    await waitForServer();
    for (const [index, url] of [
      '/tasks/meeting-notes',
      '/tasks/not-a-real-task',
      '/tasks/not-a-task.html',
      '/tasks/not-a-task/child',
    ].entries()) {
      const response = await fetch(`${origin}${url}`, { redirect: 'manual', signal: AbortSignal.timeout(15000) });
      assert.equal(response.status, 404, `GET ${url} must return a hard 404`);
      if (index < 2) assert.equal(response.headers.get('x-robots-tag'), 'noindex, follow');
    }
    const head = await fetch(`${origin}/tasks/meeting-notes`, {
      method: 'HEAD',
      redirect: 'manual',
      signal: AbortSignal.timeout(15000),
    });
    assert.equal(head.status, 404, 'HEAD for an ineligible Task must return a hard 404');
    console.log(JSON.stringify({ success: true, get404: true, head404: true }, null, 2));
  } finally {
    server.kill('SIGTERM');
  }
}

main().catch((error: unknown) => {
  console.error(error);
  process.exitCode = 1;
});
