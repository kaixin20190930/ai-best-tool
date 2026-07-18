# Authentication Setup Guide

This guide explains how to configure authentication for the AI Tools Navigation site using Supabase Auth.

## Overview

The authentication system uses **Supabase Auth** which provides:
- Email/Password authentication
- OAuth providers (Google, GitHub)
- Magic link authentication
- Email verification
- Password reset functionality
- Session management

## Prerequisites

1. A Supabase project (already configured in `.env.local`)
2. Supabase CLI (optional, for local development)

## Configuration Steps

### 1. Supabase Dashboard Configuration

#### Enable Email Authentication

1. Go to your Supabase Dashboard: https://app.supabase.com
2. Select your project
3. Navigate to **Authentication** → **Providers**
4. Enable **Email** provider
5. Configure email templates:
   - **Confirm signup**: Customize the email verification template
   - **Reset password**: Customize the password reset template
   - **Magic Link**: Customize the magic link template

#### Configure OAuth Providers

##### Google OAuth

1. Go to **Authentication** → **Providers** → **Google**
2. Enable Google provider
3. Create OAuth credentials in [Google Cloud Console](https://console.cloud.google.com/):
   - Go to **APIs & Services** → **Credentials**
   - Create **OAuth 2.0 Client ID**
   - Application type: **Web application**
   - Authorized redirect URIs: `https://<your-project-ref>.supabase.co/auth/v1/callback`
4. Copy **Client ID** and **Client Secret** to Supabase
5. Save configuration

##### GitHub OAuth

1. Go to **Authentication** → **Providers** → **GitHub**
2. Enable GitHub provider
3. Create OAuth App in [GitHub Settings](https://github.com/settings/developers):
   - Go to **Developer settings** → **OAuth Apps** → **New OAuth App**
   - Application name: Your app name
   - Homepage URL: Your site URL
   - Authorization callback URL: `https://<your-project-ref>.supabase.co/auth/v1/callback`
4. Copy **Client ID** and **Client Secret** to Supabase
5. Save configuration

### 2. Email Service Configuration

Supabase provides a built-in email service for development. For production:

1. Go to **Project Settings** → **Auth**
2. Configure **SMTP Settings** (optional, for custom email service):
   - SMTP Host
   - SMTP Port
   - SMTP User
   - SMTP Password
   - Sender email
   - Sender name

### 3. Site URL Configuration

1. Go to **Project Settings** → **Auth**
2. Set **Site URL** to your production URL (e.g., `https://yourdomain.com`)
3. Add **Redirect URLs**:
   - `http://localhost:3000/auth/callback` (for local development)
   - `https://yourdomain.com/auth/callback` (for production)

### 4. Environment Variables

Ensure your `.env.local` file contains:

```bash
# Supabase Configuration
NEXT_PUBLIC_SUPABASE_URL=https://your-project-ref.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key

# Site URL (for OAuth redirects)
NEXT_PUBLIC_SITE_URL=http://localhost:3000
```

For production, update `NEXT_PUBLIC_SITE_URL` to your canonical production domain. The app now normalizes this value before using it in redirects, metadata, and share links.

### 5. Database Setup

The authentication system uses Supabase's built-in `auth.users` table. Additional user data is stored in custom tables:

- `user_preferences`: User settings and preferences
- `favorites`: User's favorited tools
- `ratings`: User's tool ratings
- `comments`: User's comments

These tables are already defined in `db/supabase/schema.sql`.

## Testing Authentication

### Local Development

1. Start your development server:
   ```bash
   pnpm dev
   ```

2. Navigate to `/register` to test registration
3. Check your email for verification link
4. Navigate to `/login` to test login
5. Test OAuth by clicking Google/GitHub buttons

### Email Templates

You can customize email templates in Supabase Dashboard:

1. Go to **Authentication** → **Email Templates**
2. Edit templates for:
   - Confirm signup
   - Invite user
   - Magic Link
   - Change Email Address
   - Reset Password

Use these variables in templates:
- `{{ .ConfirmationURL }}`: Email confirmation link
- `{{ .Token }}`: Verification token
- `{{ .TokenHash }}`: Token hash
- `{{ .SiteURL }}`: Your site URL

## Security Best Practices

1. **Never commit** `.env.local` to version control
2. Use **Row Level Security (RLS)** policies in Supabase
3. Enable **email verification** for new users
4. Set appropriate **session timeout** values
5. Use **HTTPS** in production
6. Implement **rate limiting** for auth endpoints
7. Enable **CAPTCHA** for registration (optional)

## Troubleshooting

### Email not sending

- Check SMTP configuration in Supabase Dashboard
- Verify email service is enabled
- Check spam folder
- Review Supabase logs

### OAuth not working

- Verify redirect URLs match exactly
- Check OAuth credentials are correct
- Ensure OAuth app is not in development mode (for production)
- Review browser console for errors

### Session issues

- Clear browser cookies
- Check middleware is properly configured
- Verify Supabase URL and keys are correct
- Review server logs

## Next Steps

After completing authentication setup:

1. Implement user profile management
2. Add user preferences
3. Implement protected routes
4. Add admin role management
5. Set up email notifications

## Resources

- [Supabase Auth Documentation](https://supabase.com/docs/guides/auth)
- [Next.js + Supabase Guide](https://supabase.com/docs/guides/auth/server-side/nextjs)
- [OAuth Setup Guide](https://supabase.com/docs/guides/auth/social-login)
