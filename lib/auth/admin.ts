import type { User } from '@supabase/supabase-js';

export function getAdminEmails(): string[] {
  return (process.env.ADMIN_EMAILS || '')
    .split(',')
    .map((email) => email.trim().toLowerCase())
    .filter(Boolean);
}

export function isAdminUser(user: User | null): boolean {
  if (!user) {
    return false;
  }

  const role = user.user_metadata?.role || 'user';
  const email = user.email?.toLowerCase();

  return (
    role === 'admin' ||
    role === 'moderator' ||
    (!!email && getAdminEmails().includes(email))
  );
}
