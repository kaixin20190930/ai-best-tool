/* eslint-disable import/prefer-default-export */
import { createClient as createSupabaseClient } from '@supabase/supabase-js';

import { getSupabaseUrl } from './env';

export function createAdminClient() {
  const url = getSupabaseUrl();
  const adminKey = process.env.SUPABASE_SECRET_KEY?.trim() || process.env.SUPABASE_SERVICE_ROLE_KEY?.trim();

  if (!adminKey) {
    throw new Error('SUPABASE_SECRET_KEY or SUPABASE_SERVICE_ROLE_KEY is not configured.');
  }

  return createSupabaseClient(url, adminKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  });
}
