'use client';

import { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useTranslations } from 'next-intl';
import type { User } from '@supabase/supabase-js';

import { NAV_LINKS } from '@/lib/constants';
import { cn } from '@/lib/utils';

import BaseImage from '../image/BaseImage';
import LocaleSwitcher from '../LocaleSwitcher';
import { UserMenu } from '../auth/UserMenu';
import NotificationBell from '../NotificationBell';
import MenuBtn from './MenuBtn';
import NavigationDrawer from './NavigationDrawer';

interface NavigationProps {
  user?: User | null;
}

export default function Navigation({ user }: NavigationProps) {
  const t = useTranslations('Navigation');
  const pathname = usePathname();

  const [open, setOpen] = useState(false);

  const NavLinks = NAV_LINKS.map((item) => ({
    ...item,
    label: t(`${item.code}`),
  }));

  return (
    <>
      <header className='bg-frosted-glass sticky left-0 top-0 z-50 flex h-[64px] border-b border-slate-200/80 bg-white/85 px-5 lg:px-0'>
        <nav className='mx-auto flex max-w-pc flex-1 items-center'>
          <div>
            <Link className='flex justify-self-center hover:opacity-80' href='/' title={t('title')}>
              <BaseImage
                src='/images/aitools.svg'
                alt='AI Best Tool logo icon - discover and explore AI tools'
                title={t('title')}
                width={64}
                height={16}
                className='size-[58px] lg:size-16'
              />
              <BaseImage
                src='/images/Aileron.svg'
                alt='AI Best Tool wordmark - your AI tools directory'
                title={t('title')}
                width={64}
                height={16}
                className='my-auto h-8 w-28 lg:h-8 lg:w-32'
              />
            </Link>
          </div>
          {/* pc */}
          <div className='ml-auto flex h-full items-center gap-x-[46px]'>
            <ul className='hidden h-full flex-1 capitalize lg:flex lg:gap-x-12'>
              {NavLinks.map((item) => (
                <Link key={item.code} href={item.href} title={item.code}>
                  <li
                    className={cn(
                      'flex h-full items-center text-slate-700 transition-colors hover:text-slate-950',
                      pathname === item.href && 'text-cyan-700',
                      pathname.includes(item.href) && item.href !== '/' && 'text-cyan-700',
                    )}
                  >
                    {item.label}
                  </li>
                </Link>
              ))}
            </ul>
            <div className='flex items-center gap-x-3'>
              {user && <NotificationBell userId={user.id} />}
              <UserMenu user={user || null} />
              <LocaleSwitcher />
            </div>
          </div>
          {/* mobile */}
          <div className='mx-3 flex items-center gap-x-4 lg:hidden'>
            <MenuBtn open={open} onClick={() => setOpen(!open)} />
          </div>
        </nav>
      </header>
      <NavigationDrawer open={open} setOpen={setOpen} />
    </>
  );
}
