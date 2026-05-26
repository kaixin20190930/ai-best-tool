/**
 * Authentication Configuration
 * 
 * This file contains configuration for Supabase Auth including:
 * - OAuth providers (Google, GitHub)
 * - Email settings
 * - Redirect URLs
 */

export const authConfig = {
  // OAuth Providers
  providers: {
    google: {
      enabled: true,
      scopes: 'email profile',
    },
    github: {
      enabled: true,
      scopes: 'user:email',
    },
  },

  // Email Configuration
  email: {
    // Email verification required
    requireEmailVerification: true,
    // Email templates can be customized in Supabase Dashboard
    templates: {
      confirmation: 'confirm-email',
      passwordReset: 'reset-password',
      magicLink: 'magic-link',
    },
  },

  // Redirect URLs
  redirects: {
    afterSignIn: '/',
    afterSignUp: '/verify-email',
    afterSignOut: '/',
    afterPasswordReset: '/login',
  },

  // Session Configuration
  session: {
    // Session will be refreshed automatically by middleware
    autoRefresh: true,
    // Persist session in cookies
    persistSession: true,
  },
};

// Site URL for OAuth redirects
export const getSiteUrl = () => {
  return (process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000').replace(/\/$/, '');
};

// OAuth redirect URL
export const getOAuthRedirectUrl = () => {
  return `${getSiteUrl()}/auth/callback`;
};
