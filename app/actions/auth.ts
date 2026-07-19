'use server';

import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';

import { createClient } from '@/lib/supabase/server';
import { authConfig, getOAuthRedirectUrl, getSiteUrl } from '@/lib/config/auth';
import { recordDistributionAttributionEvent } from '@/lib/services/distributionAttribution';

function getAuthErrorMessage(error: unknown) {
  if (error instanceof Error && error.message === 'fetch failed') {
    return 'Unable to reach Supabase Auth. Please check NEXT_PUBLIC_SUPABASE_URL and network/DNS.';
  }

  return error instanceof Error ? error.message : 'Authentication request failed.';
}

function getSafeRedirectPath(value: FormDataEntryValue | null, fallback: string) {
  if (typeof value !== 'string' || !value.startsWith('/')) {
    return fallback;
  }

  if (value.startsWith('//') || value.includes('://')) {
    return fallback;
  }

  return value;
}

/**
 * Sign up with email and password
 */
export async function signUp(formData: FormData) {
  const email = formData.get('email') as string;
  const password = formData.get('password') as string;
  const username = formData.get('username') as string;

  // Validate inputs
  if (!email || !password || !username) {
    return { error: 'Email, password, and username are required' };
  }

  try {
    const supabase = await createClient();

    // Sign up user
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          username,
        },
        emailRedirectTo: `${getSiteUrl()}/auth/callback`,
      },
    });

    if (error) {
      return { error: error.message };
    }

    // Create user preferences
    if (data.user) {
      const { error: prefError } = await supabase.from('user_preferences').insert({
        user_id: data.user.id,
        language: 'en',
      });

      if (prefError) {
        console.error('Failed to create user preferences:', prefError);
      }
      await recordDistributionAttributionEvent('signup', data.user.id);
    }

    revalidatePath('/', 'layout');
  } catch (error) {
    return { error: getAuthErrorMessage(error) };
  }

  redirect(authConfig.redirects.afterSignUp);
}

/**
 * Sign in with email and password
 */
export async function signIn(formData: FormData) {
  const email = formData.get('email') as string;
  const password = formData.get('password') as string;
  const redirectTo = getSafeRedirectPath(
    formData.get('redirectTo'),
    authConfig.redirects.afterSignIn
  );

  // Validate inputs
  if (!email || !password) {
    return { error: 'Email and password are required' };
  }

  try {
    const supabase = await createClient();
    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      return { error: error.message };
    }

    revalidatePath('/', 'layout');
  } catch (error) {
    return { error: getAuthErrorMessage(error) };
  }

  redirect(redirectTo);
}

/**
 * Sign out
 */
export async function signOut() {
  const supabase = await createClient();

  const { error } = await supabase.auth.signOut();

  if (error) {
    return { error: error.message };
  }

  revalidatePath('/', 'layout');
  redirect(authConfig.redirects.afterSignOut);
}

/**
 * Sign in with OAuth provider
 */
export async function signInWithOAuth(provider: 'google' | 'github') {
  let redirectUrl: string | null = null;

  try {
    const supabase = await createClient();

    const { data, error } = await supabase.auth.signInWithOAuth({
      provider,
      options: {
        redirectTo: getOAuthRedirectUrl(),
      },
    });

    if (error) {
      return { error: error.message };
    }

    redirectUrl = data.url;
  } catch (error) {
    return { error: getAuthErrorMessage(error) };
  }

  if (redirectUrl) {
    redirect(redirectUrl);
  }
}

/**
 * Request password reset
 */
export async function resetPassword(formData: FormData) {
  const supabase = await createClient();

  const email = formData.get('email') as string;

  if (!email) {
    return { error: 'Email is required' };
  }

  const { error } = await supabase.auth.resetPasswordForEmail(email, {
    redirectTo: `${getSiteUrl()}/auth/reset-password`,
  });

  if (error) {
    return { error: error.message };
  }

  return { success: true, message: 'Password reset email sent' };
}

/**
 * Update password (after reset)
 */
export async function updatePassword(formData: FormData) {
  const supabase = await createClient();

  const password = formData.get('password') as string;

  if (!password) {
    return { error: 'Password is required' };
  }

  const { error } = await supabase.auth.updateUser({
    password,
  });

  if (error) {
    return { error: error.message };
  }

  revalidatePath('/', 'layout');
  redirect(authConfig.redirects.afterPasswordReset);
}

/**
 * Get current user
 */
export async function getCurrentUser() {
  const supabase = await createClient();

  const {
    data: { user },
    error,
  } = await supabase.auth.getUser();

  if (error) {
    return null;
  }

  return user;
}

/**
 * Get user session
 */
export async function getSession() {
  const supabase = await createClient();

  const {
    data: { session },
    error,
  } = await supabase.auth.getSession();

  if (error) {
    return null;
  }

  return session;
}

/**
 * Resend verification email
 */
export async function resendVerificationEmail(email: string) {
  const supabase = await createClient();

  const { error } = await supabase.auth.resend({
    type: 'signup',
    email,
    options: {
      emailRedirectTo: `${getSiteUrl()}/auth/callback`,
    },
  });

  if (error) {
    return { error: error.message };
  }

  return { success: true, message: 'Verification email sent' };
}
