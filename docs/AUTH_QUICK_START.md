# Authentication Quick Start Guide

## For Developers

This guide helps you quickly get started with the authentication system.

## Basic Usage

### Check if User is Authenticated (Server Component)

```typescript
import { createClient } from '@/lib/supabase/server';

export default async function MyPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return <div>Please log in</div>;
  }

  return <div>Welcome, {user.email}!</div>;
}
```

### Check if User is Authenticated (Client Component)

```typescript
'use client';

import { useEffect, useState } from 'react';
import { createClient } from '@/lib/supabase/client';
import type { User } from '@supabase/supabase-js';

export default function MyComponent() {
  const [user, setUser] = useState<User | null>(null);
  const supabase = createClient();

  useEffect(() => {
    supabase.auth.getUser().then(({ data: { user } }) => {
      setUser(user);
    });
  }, []);

  if (!user) {
    return <div>Please log in</div>;
  }

  return <div>Welcome, {user.email}!</div>;
}
```

### Protect a Route (Server Component)

```typescript
import { requireAuth } from '@/lib/auth/middleware';

export default async function ProtectedPage() {
  const user = await requireAuth(); // Throws error if not authenticated

  return <div>Protected content for {user.email}</div>;
}
```

### Protect an Admin Route

```typescript
import { requireAdmin } from '@/lib/auth/middleware';

export default async function AdminPage() {
  const user = await requireAdmin(); // Throws error if not admin

  return <div>Admin content</div>;
}
```

### Get User Profile

```typescript
import { getCurrentUserProfile } from '@/lib/services/user';

export default async function ProfilePage() {
  const profile = await getCurrentUserProfile();

  if (!profile) {
    return <div>Not logged in</div>;
  }

  return (
    <div>
      <h1>{profile.username}</h1>
      <p>{profile.email}</p>
      <p>Role: {profile.role}</p>
    </div>
  );
}
```

### Sign Out (Client Component)

```typescript
'use client';

import { signOut } from '@/app/actions/auth';
import { Button } from '@/components/ui/button';

export default function SignOutButton() {
  return (
    <Button onClick={() => signOut()}>
      Sign Out
    </Button>
  );
}
```

## Site URL Contract

The app uses the configured canonical site URL for redirects, metadata, and share links. Keep `NEXT_PUBLIC_SITE_URL` pointed at the production domain in Vercel so OAuth and auth emails resolve to the right origin.

## Common Patterns

### Conditional Rendering Based on Auth

```typescript
import { createClient } from '@/lib/supabase/server';

export default async function MyPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  return (
    <div>
      {user ? (
        <div>Authenticated content</div>
      ) : (
        <div>Public content</div>
      )}
    </div>
  );
}
```

### Get User Favorites

```typescript
import { getUserFavorites } from '@/lib/services/user';

export default async function FavoritesPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    redirect('/login');
  }

  const favorites = await getUserFavorites(user.id);

  return (
    <div>
      {favorites.map((fav) => (
        <div key={fav.id}>{fav.tool.title}</div>
      ))}
    </div>
  );
}
```

### Check if Tool is Favorited

```typescript
import { isFavorited } from '@/lib/services/user';

export default async function ToolPage({ toolId }: { toolId: string }) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  const favorited = user ? await isFavorited(user.id, toolId) : false;

  return (
    <div>
      {favorited ? 'Favorited' : 'Not favorited'}
    </div>
  );
}
```

## API Routes

### Protect an API Route

```typescript
import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

export async function GET(request: NextRequest) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  // Your protected logic here
  return NextResponse.json({ data: 'Protected data' });
}
```

## Server Actions

### Create a Protected Server Action

```typescript
'use server';

import { createClient } from '@/lib/supabase/server';

export async function myProtectedAction(formData: FormData) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return { error: 'Unauthorized' };
  }

  // Your protected logic here
  return { success: true };
}
```

## Environment Setup

1. Copy `.env.local.example` to `.env.local` (if exists)
2. Add your Supabase credentials:
   ```bash
   NEXT_PUBLIC_SUPABASE_URL=your-project-url
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
   NEXT_PUBLIC_SITE_URL=http://localhost:3000
   ```

## Testing Locally

1. Start the development server:
   ```bash
   pnpm dev
   ```

2. Navigate to `/register` to create an account
3. Check your email for verification link
4. Navigate to `/login` to sign in
5. Test protected routes

## Common Issues

### "Invalid JWT" Error
- Clear browser cookies
- Check that Supabase URL and keys are correct
- Verify middleware is properly configured

### Email Not Sending
- Check Supabase email settings
- Verify SMTP configuration (if using custom SMTP)
- Check spam folder

### OAuth Not Working
- Verify OAuth credentials in Supabase Dashboard
- Check redirect URLs match exactly
- Ensure OAuth app is not in development mode

## Resources

- [Full Setup Guide](./AUTH_SETUP.md)
- [Supabase Auth Docs](https://supabase.com/docs/guides/auth)
- [Next.js + Supabase](https://supabase.com/docs/guides/auth/server-side/nextjs)
