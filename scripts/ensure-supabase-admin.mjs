import { readFile } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

import { createClient } from '@supabase/supabase-js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const rootDir = path.resolve(__dirname, '..');

async function loadEnvFile(filePath) {
  try {
    const content = await readFile(filePath, 'utf8');
    for (const line of content.split('\n')) {
      const trimmed = line.trim();
      if (!trimmed || trimmed.startsWith('#')) continue;

      const separatorIndex = trimmed.indexOf('=');
      if (separatorIndex === -1) continue;

      const key = trimmed.slice(0, separatorIndex).trim();
      const value = trimmed
        .slice(separatorIndex + 1)
        .trim()
        .replace(/^['"]|['"]$/g, '');

      if (key && !process.env[key]) {
        process.env[key] = value;
      }
    }
  } catch {
    // Local env file is optional.
  }
}

await loadEnvFile(path.join(rootDir, '.env.local'));

const email = process.argv[2] || process.env.ADMIN_EMAILS?.split(',')[0]?.trim();
const password = process.argv[3] || process.env.ADMIN_PASSWORD;
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!email) {
  throw new Error('Provide an admin email argument or ADMIN_EMAILS in .env.local.');
}

if (!supabaseUrl || !serviceRoleKey) {
  throw new Error(
    'NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY are required.'
  );
}

const supabase = createClient(supabaseUrl, serviceRoleKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false,
  },
});

const { data: usersData, error: listError } = await supabase.auth.admin.listUsers({
  page: 1,
  perPage: 1000,
});

if (listError) {
  throw listError;
}

const existingUser = usersData.users.find(
  (user) => user.email?.toLowerCase() === email.toLowerCase()
);

if (existingUser) {
  const { error } = await supabase.auth.admin.updateUserById(existingUser.id, {
    user_metadata: {
      ...existingUser.user_metadata,
      role: 'admin',
    },
  });

  if (error) {
    throw error;
  }

  console.log(`Updated ${email} to admin.`);
} else {
  if (!password) {
    throw new Error(
      'User does not exist. Provide a password argument or ADMIN_PASSWORD to create it.'
    );
  }

  const { error } = await supabase.auth.admin.createUser({
    email,
    password,
    email_confirm: true,
    user_metadata: {
      role: 'admin',
      username: email.split('@')[0],
    },
  });

  if (error) {
    throw error;
  }

  console.log(`Created ${email} as admin.`);
}
