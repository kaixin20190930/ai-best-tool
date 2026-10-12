'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  AlertTriangle,
  BadgeCheck,
  BarChart3,
  ChevronDown,
  ClipboardList,
  GitCompareArrows,
  Home,
  LayoutDashboard,
  Mail,
  MessageSquare,
  ReceiptText,
  Search,
  Settings,
  ShieldCheck,
  Sparkles,
  Users,
  Wrench,
} from 'lucide-react';
import { useTranslations } from 'next-intl';

import NotificationBell from '@/components/NotificationBell';

const primaryNavigation = [
  { name: 'dashboard', href: '/admin/dashboard', icon: LayoutDashboard },
  { name: 'tools', href: '/admin/tools', icon: Wrench },
  { name: 'intelligence', href: '/admin/intelligence', icon: Sparkles },
  { name: 'decision', href: '/admin/decision', icon: GitCompareArrows, label: 'Decision review' },
  { name: 'indexReviews', href: '/admin/index-reviews', icon: ShieldCheck, label: 'Index reviews' },
  { name: 'analytics', href: '/admin/analytics', icon: BarChart3 },
];

const supportingNavigation = [
  { name: 'claims', href: '/admin/claims', icon: BadgeCheck },
  { name: 'owners', href: '/admin/owners', icon: Users },
  { name: 'cleanup', href: '/admin/cleanup', icon: AlertTriangle },
  { name: 'collection', href: '/admin/collection', icon: ClipboardList },
  { name: 'searchConsole', href: '/admin/search-console', icon: Search },
  { name: 'comments', href: '/admin/comments', icon: MessageSquare },
  { name: 'outreach', href: '/admin/outreach', icon: Mail },
  { name: 'emailOps', href: '/admin/email-ops', icon: Mail },
  { name: 'paymentCallbacks', href: '/admin/payment-callbacks', icon: ReceiptText },
  { name: 'emailTest', href: '/admin/email-test', icon: Mail },
  { name: 'users', href: '/admin/users', icon: Users },
  { name: 'settings', href: '/admin/settings', icon: Settings },
];

function isActivePath(pathname: string, href: string) {
  return pathname.includes(href);
}

export default function AdminSidebar({ userId }: { userId?: string }) {
  const t = useTranslations('admin');
  const pathname = usePathname();
  const supportingActive = supportingNavigation.some((item) => isActivePath(pathname, item.href));
  const moreLabel = /^\/(cn|tw)(\/|$)/.test(pathname) ? '更多管理工具' : 'More tools';

  return (
    <aside className='theme-surface hidden w-64 rounded-none border-r border-slate-200 lg:block'>
      <div className='flex h-16 items-center justify-between border-b border-slate-200 px-6'>
        <h1 className='theme-text-strong text-xl font-bold'>{t('title')}</h1>
        {userId ? <NotificationBell userId={userId} /> : null}
      </div>

      <nav className='space-y-1 p-4'>
        <Link
          href='/'
          className='flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium text-slate-600 transition-colors hover:bg-slate-100 hover:text-slate-900'
        >
          <Home className='h-5 w-5' />
          {t('backToSite')}
        </Link>

        <div className='my-4 border-t border-slate-200' />

        {primaryNavigation.map((item) => (
          <Link
            key={item.name}
            href={item.href}
            className={`flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors ${
              isActivePath(pathname, item.href)
                ? 'bg-cyan-50 text-cyan-700'
                : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
            }`}
          >
            <item.icon className='h-5 w-5' />
            {'label' in item ? item.label : t(`nav.${item.name}`)}
          </Link>
        ))}

        <details className='group mt-3 border-t border-slate-200 pt-3' open={supportingActive || undefined}>
          <summary className='flex cursor-pointer list-none items-center justify-between rounded-lg px-3 py-2 text-sm font-semibold text-slate-500 transition-colors hover:bg-slate-100 hover:text-slate-900'>
            <span>{moreLabel}</span>
            <ChevronDown className='h-4 w-4 transition-transform group-open:rotate-180' />
          </summary>
          <div className='mt-1 space-y-1 border-l border-slate-200 pl-2'>
            {supportingNavigation.map((item) => (
              <Link
                key={item.name}
                href={item.href}
                className={`flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors ${
                  isActivePath(pathname, item.href)
                    ? 'bg-cyan-50 text-cyan-700'
                    : 'text-slate-500 hover:bg-slate-100 hover:text-slate-900'
                }`}
              >
                <item.icon className='h-4 w-4' />
                {t(`nav.${item.name}`)}
              </Link>
            ))}
          </div>
        </details>
      </nav>
    </aside>
  );
}
