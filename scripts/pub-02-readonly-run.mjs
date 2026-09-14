// Development/QA helper only. Do not use this runner for release or database mutations.
import { spawn } from 'node:child_process';
import { readFileSync } from 'node:fs';
import dotenv from 'dotenv';

const source = dotenv.parse(readFileSync(process.env.PUB02_ENV_FILE || '.env.local'));
const env = { ...process.env };
for (const key of Object.keys(env)) {
  if (/SUPABASE_(SECRET_KEY|SERVICE_ROLE_KEY)/.test(key)) delete env[key];
}
for (const [key, value] of Object.entries(source)) {
  if (/^(POSTGRES|DATABASE_URL|NEXT_PUBLIC_)/.test(key)) env[key] = value;
}
for (const [key, value] of Object.entries(env)) {
  if (/^(POSTGRES|DATABASE_URL)/.test(key) && /^postgres/.test(value)) {
    const url = new URL(value);
    url.searchParams.set('options', '-c default_transaction_read_only=on');
    env[key] = url.href;
  }
}
env.PGOPTIONS = '-c default_transaction_read_only=on';
env.MONITOR_API_TOKEN = 'pub02-local-monitor-disabled';
env.DB_POOL_MAX = '2';
const [command, ...args] = process.argv.slice(2);
if (!command) throw new Error('Provide a read-only verification command.');
const child = spawn(command, args, { env, stdio: 'inherit' });
child.on('exit', (code) => process.exit(code || 0));
child.on('error', (error) => {
  console.error(error.message);
  process.exitCode = 1;
});
