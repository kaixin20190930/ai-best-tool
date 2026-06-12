'use client';

import { useState } from 'react';
import type { User } from '@supabase/supabase-js';

import { signOut } from '@/app/actions/auth';
import { Link } from '@/app/navigation';
import { Button } from '@/components/ui/button';
import { UserAvatar } from '@/components/auth/UserAvatar';

interface UserMenuProps {
  user: User | null;
}

export function UserMenu({ user }: UserMenuProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  async function handleSignOut() {
    setIsLoading(true);
    await signOut();
  }

  if (!user) {
    return (
      <div className="flex items-center gap-2">
        <Button asChild variant="ghost" size="sm">
          <Link href="/login">Sign in</Link>
        </Button>
        <Button asChild size="sm">
          <Link href="/register">Sign up</Link>
        </Button>
      </div>
    );
  }

  const username = user.user_metadata?.username || user.email?.split('@')[0] || 'User';
  const avatar = user.user_metadata?.avatar_url;

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 rounded-full hover:opacity-80"
      >
        <UserAvatar name={username} avatarUrl={avatar} size={32} />
        <span className="hidden text-sm font-medium lg:inline">{username}</span>
        <svg
          className={`h-4 w-4 transition-transform ${isOpen ? 'rotate-180' : ''}`}
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </button>

      {isOpen && (
        <>
          <div
            className="fixed inset-0 z-40"
            onClick={() => setIsOpen(false)}
          />
          <div className="theme-surface absolute right-0 top-full z-50 mt-2 w-48 rounded-md border border-slate-200 shadow-sm">
            <div className="p-2">
              <div className="border-b border-slate-200 px-3 py-2">
                <p className="text-sm font-medium text-slate-900">{username}</p>
                <p className="text-xs text-slate-500">{user.email}</p>
              </div>
              <div className="py-1">
                <Link
                  href="/profile"
                  className="block rounded-md px-3 py-2 text-sm text-slate-700 hover:bg-slate-100"
                  onClick={() => setIsOpen(false)}
                >
                  Profile
                </Link>
                <Link
                  href="/profile/favorites"
                  className="block rounded-md px-3 py-2 text-sm text-slate-700 hover:bg-slate-100"
                  onClick={() => setIsOpen(false)}
                >
                  Favorites
                </Link>
                <Link
                  href="/profile/submissions"
                  className="block rounded-md px-3 py-2 text-sm text-slate-700 hover:bg-slate-100"
                  onClick={() => setIsOpen(false)}
                >
                  My submissions
                </Link>
                <Link
                  href="/settings"
                  className="block rounded-md px-3 py-2 text-sm text-slate-700 hover:bg-slate-100"
                  onClick={() => setIsOpen(false)}
                >
                  Settings
                </Link>
              </div>
              <div className="border-t border-slate-200 py-1">
                <button
                  onClick={handleSignOut}
                  disabled={isLoading}
                  className="w-full rounded-md px-3 py-2 text-left text-sm text-red-600 hover:bg-slate-100 disabled:opacity-50"
                >
                  {isLoading ? 'Signing out...' : 'Sign out'}
                </button>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
