'use client';

import Link from 'next/link';
import { useTranslations } from 'next-intl';
import { usePathname } from 'next/navigation';
import {
  LayoutDashboard,
  Wrench,
  ClipboardList,
  Users,
  BarChart3,
  Settings,
  Home,
  Mail,
  MessageSquare,
  Search,
  ReceiptText,
} from 'lucide-react';

const navigation = [
  { name: 'dashboard', href: '/admin/dashboard', icon: LayoutDashboard },
  { name: 'collection', href: '/admin/collection', icon: ClipboardList },
  { name: 'tools', href: '/admin/tools', icon: Wrench },
  { name: 'comments', href: '/admin/comments', icon: MessageSquare },
  { name: 'emailTest', href: '/admin/email-test', icon: Mail },
  { name: 'searchConsole', href: '/admin/search-console', icon: Search },
  { name: 'paymentCallbacks', href: '/admin/payment-callbacks', icon: ReceiptText },
  { name: 'users', href: '/admin/users', icon: Users },
  { name: 'analytics', href: '/admin/analytics', icon: BarChart3 },
  { name: 'settings', href: '/admin/settings', icon: Settings },
];

export default function AdminSidebar() {
  const t = useTranslations('admin');
  const pathname = usePathname();

  return (
    <aside className="theme-surface hidden w-64 rounded-none border-r border-slate-200 lg:block">
      <div className="flex h-16 items-center border-b border-slate-200 px-6">
        <h1 className="theme-text-strong text-xl font-bold">{t('title')}</h1>
      </div>

      <nav className="space-y-1 p-4">
        <Link
          href="/"
          className="flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium text-slate-600 transition-colors hover:bg-slate-100 hover:text-slate-900"
        >
          <Home className="h-5 w-5" />
          {t('backToSite')}
        </Link>

        <div className="my-4 border-t border-slate-200" />

        {navigation.map((item) => (
          <Link
            key={item.name}
            href={item.href}
            className={`flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors ${
              pathname.includes(item.href)
                ? 'bg-cyan-50 text-cyan-700'
                : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
            }`}
          >
            <item.icon className="h-5 w-5" />
            {t(`nav.${item.name}`)}
          </Link>
        ))}
      </nav>
    </aside>
  );
}
