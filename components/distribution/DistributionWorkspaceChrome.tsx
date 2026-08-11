'use client';

import type { ReactNode } from 'react';
import Link from 'next/link';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import { Loader2 } from 'lucide-react';
import {
  ArrowLeft,
  ArrowRight,
  BellRing,
  BarChart3,
  Home,
  ListChecks,
  Menu,
  Package,
  Settings,
  Wrench,
} from 'lucide-react';
import { type Ref, useEffect, useMemo, useRef, useState, useTransition } from 'react';

type DistributionWorkspaceItem = {
  id: string;
  href: string;
  label: string;
  description: string;
  icon: typeof Home;
};

type DistributionWorkspaceChromeProps = {
  locale: string;
  children: ReactNode;
};

const workspaceItems = [
  { id: 'today', href: '/distribution', label: '今天', description: '今日最重要任务', icon: Home },
  { id: 'products', href: '/distribution/products', label: '产品资料', description: '准备度与素材', icon: Package },
  {
    id: 'opportunities',
    href: '/distribution/opportunities',
    label: '目标机会',
    description: '推荐与决策',
    icon: ListChecks,
  },
  { id: 'tasks', href: '/distribution/tasks', label: '执行任务', description: '提交与阻塞处理', icon: Wrench },
  {
    id: 'monitoring',
    href: '/distribution/monitoring',
    label: '跟进与监控',
    description: '复查与异常',
    icon: BellRing,
  },
  { id: 'reports', href: '/distribution/reports', label: '结果报告', description: '指标与复盘', icon: BarChart3 },
];

const extraItems = [
  { id: 'settings', href: '/distribution/settings', label: '套餐与设置', description: '升级与偏好', icon: Settings },
];

function getActiveWorkspaceSection(pathname: string | null) {
  if (!pathname) return 'today';
  const parts = pathname.split('/').filter(Boolean);
  const distributionIndex = parts.findIndex((part) => part === 'distribution');
  if (distributionIndex === -1) return 'today';
  const section = parts[distributionIndex + 1] || 'today';
  if (section === 'tasks') return 'tasks';
  return section;
}

function withLocale(locale: string, path: string) {
  if (path === '/') return `/${locale}`;
  return `/${locale}${path}`;
}

function withQueryLocale(locale: string, path: string, query: string | undefined) {
  const base = withLocale(locale, path);
  return `${base}${query ? `?${query}` : ''}`;
}

function NavigationItem({
  item,
  href,
  active,
  loading,
  locale,
  onNavigate,
}: {
  item: DistributionWorkspaceItem;
  href: string;
  active: boolean;
  loading: boolean;
  locale: string;
  onNavigate: (id: string, href: string) => void;
}) {
  const Icon = item.icon;

  return (
    <Link
      href={href}
      aria-label={`${locale === 'cn' ? '进入' : 'Open'} ${item.label}`}
      className={`flex items-center gap-2 rounded-xl border px-3 py-2.5 text-sm transition ${
        active
          ? 'border-cyan-300 bg-cyan-50 text-cyan-900'
          : 'border-slate-200 bg-white text-slate-700 hover:border-slate-300 hover:bg-slate-50'
      }`}
      onClick={(event) => {
        event.preventDefault();
        onNavigate(item.id, href);
      }}
    >
      <Icon className='h-4 w-4' />
      <span className='font-semibold'>{item.label}</span>
      <span className='ml-auto text-[11px] text-slate-500'>
        {loading ? <Loader2 className='h-3.5 w-3.5 animate-spin' aria-hidden='true' /> : item.description}
      </span>
    </Link>
  );
}

function MobileNavigationItem({
  item,
  href,
  active,
  loading,
  locale,
  onNavigate,
  firstRef,
  onEscape,
}: {
  item: DistributionWorkspaceItem;
  href: string;
  active: boolean;
  loading: boolean;
  locale: string;
  onNavigate: (id: string, href: string) => void;
  firstRef?: Ref<HTMLAnchorElement>;
  onEscape: () => void;
}) {
  const Icon = item.icon;
  return (
    <Link
      ref={firstRef}
      href={href}
      aria-label={`${locale === 'cn' ? '进入' : 'Open'} ${item.label}`}
      className={`mb-2 flex items-center justify-between rounded-lg border px-3 py-2 text-sm ${
        active
          ? 'border-cyan-300 bg-cyan-50 text-cyan-900'
          : 'border-slate-200 bg-white text-slate-700 hover:bg-slate-50'
      }`}
      onKeyDown={(event) => {
        if (event.key === 'Escape') onEscape();
      }}
      onClick={(event) => {
        event.preventDefault();
        onNavigate(item.id, href);
      }}
    >
      <span className='inline-flex items-center gap-2'>
        <Icon className='h-4 w-4' />
        <span className='font-semibold'>{item.label}</span>
      </span>
      <span className='inline-flex items-center gap-1 text-slate-500'>
        {loading ? <Loader2 className='h-4 w-4 animate-spin' /> : <ArrowRight className='h-4 w-4' />}
      </span>
    </Link>
  );
}

export default function DistributionWorkspaceChrome({ locale, children }: DistributionWorkspaceChromeProps) {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const router = useRouter();
  const [openNav, setOpenNav] = useState(false);
  const [isPending, startTransition] = useTransition();
  const [pendingSection, setPendingSection] = useState<string | null>(null);
  const menuButtonRef = useRef<HTMLButtonElement | null>(null);
  const firstItemRef = useRef<HTMLAnchorElement | null>(null);

  const activeSection = useMemo(() => getActiveWorkspaceSection(pathname), [pathname]);
  const query = searchParams?.toString();
  const withQuery = (path: string) => withQueryLocale(locale, path, query);

  const navigate = (sectionId: string, href: string) => {
    if (isPending) return;
    if (href === withLocale(locale, pathname || '') || withLocale(locale, pathname || '').startsWith(href)) {
      setPendingSection(null);
      setOpenNav(false);
      return;
    }
    setPendingSection(sectionId);
    startTransition(() => {
      router.push(href);
      setOpenNav(false);
    });
  };

  useEffect(() => {
    setOpenNav(false);
    setPendingSection(null);
  }, [pathname]);

  useEffect(() => {
    if (!openNav) {
      return;
    }

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape' && openNav) {
        setOpenNav(false);
        menuButtonRef.current?.focus();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    const timer = window.setTimeout(() => {
      firstItemRef.current?.focus();
    }, 0);

    return () => {
      document.body.style.overflow = previousOverflow;
      window.removeEventListener('keydown', handleKeyDown);
      window.clearTimeout(timer);
    };
  }, [openNav]);

  const backToApp = (
    <div className='mb-4 border-b border-slate-200 pb-3'>
      <Link
        href={locale === 'cn' ? '/cn' : '/en'}
        className='inline-flex items-center gap-2 text-xs font-bold text-slate-600 hover:text-slate-900'
      >
        <ArrowLeft className='h-3.5 w-3.5' />
        {locale === 'cn' ? '回到网站首页' : 'Back to site home'}
      </Link>
    </div>
  );

  return (
    <div className='w-full'>
      <div className='lg:hidden'>
        <div className='sticky top-0 z-30 border-b border-slate-200 bg-white px-4 py-3'>
          <div className='mx-auto flex max-w-6xl items-center justify-between'>
            <div className='text-sm font-bold text-slate-900'>{locale === 'cn' ? '分发工作台' : 'Distribution Workspace'}</div>
            <button
              ref={menuButtonRef}
              type='button'
              onClick={() => setOpenNav((current) => !current)}
              aria-expanded={openNav}
              aria-controls='distribution-mobile-menu'
              aria-label={locale === 'cn' ? '打开分发导航菜单' : 'Open distribution menu'}
              className='inline-flex items-center gap-2 rounded-lg border border-slate-200 px-2.5 py-1.5 text-xs font-bold text-slate-700'
            >
              <Menu className='h-4 w-4' />
              {locale === 'cn' ? '菜单' : 'Menu'}
            </button>
          </div>
          <div className='px-4 pb-2 pt-2 text-xs text-slate-500'>
            {isPending ? (locale === 'cn' ? '正在切换工作台...' : 'Switching workspace section...') : null}
          </div>
        </div>
        {openNav ? (
          <div
            id='distribution-mobile-menu'
            role='navigation'
            aria-label={locale === 'cn' ? '分发移动端导航' : 'Distribution mobile navigation'}
            className='border-b border-slate-200 bg-white/95 p-4'
          >
            {backToApp}
            {workspaceItems.concat(extraItems).map((item, index) => (
              <MobileNavigationItem
                key={item.id}
                item={item}
                href={withQuery(item.href)}
                active={activeSection === item.id}
                loading={pendingSection === item.id}
                locale={locale}
                firstRef={index === 0 ? firstItemRef : undefined}
                onNavigate={navigate}
                onEscape={() => setOpenNav(false)}
              />
            ))}
          </div>
        ) : null}
      </div>

      <div className='mx-auto flex w-full max-w-7xl gap-5 px-4 py-5 md:px-6'>
        <aside className='hidden w-72 shrink-0 lg:block'>
          <div className='sticky top-4 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm'>
            {backToApp}
            <div>
              <div className='mb-1 text-xs uppercase tracking-[0.16em] text-slate-500'>{locale === 'cn' ? '工作台导航' : 'Workspace'}</div>
              <div className='text-base font-bold text-slate-900'>{locale === 'cn' ? '分发工作台' : 'Distribution'}</div>
            </div>
            <nav className='mt-4 space-y-2' role='navigation' aria-label={locale === 'cn' ? '侧边导航' : 'Sidebar navigation'}>
              {workspaceItems.map((item) => (
                <NavigationItem
                  key={item.id}
                  item={item}
                  href={withQuery(item.href)}
                  active={activeSection === item.id}
                  loading={pendingSection === item.id}
                  locale={locale}
                  onNavigate={navigate}
                />
              ))}
            </nav>
            <nav className='mt-6 border-t border-slate-200 pt-4' aria-label={locale === 'cn' ? '附加功能' : 'Extra actions'}>
              {extraItems.map((item) => (
                <NavigationItem
                  key={item.id}
                  item={item}
                  href={withQuery(item.href)}
                  active={activeSection === item.id}
                  loading={pendingSection === item.id}
                  locale={locale}
                  onNavigate={navigate}
                />
              ))}
            </nav>
          </div>
        </aside>
        <main className='w-full'>{children}</main>
      </div>
    </div>
  );
}
