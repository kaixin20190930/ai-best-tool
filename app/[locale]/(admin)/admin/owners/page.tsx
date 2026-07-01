import { Metadata } from 'next';
import Link from 'next/link';
import { getPool } from '@/db/neon/client';
import { ArrowRight, CheckCircle2, Clock3, Mail, Sparkles, TriangleAlert, UserRound } from 'lucide-react';
import { getTranslations } from 'next-intl/server';

import { requireAdmin } from '@/lib/auth/middleware';

type ToolOwnerRow = {
  id: string;
  name: string;
  title: unknown;
  url: string;
  status: string;
  ownerEmail: string | null;
  claimStatus: string | null;
  claimedAt: string | null;
  createdAt: string;
  updatedAt: string;
  pricing: string | null;
  isSponsoredPlacement: boolean;
  featuredActiveFrom: string | null;
  featuredUntil: string | null;
};

function getTitle(title: unknown, fallback: string): string {
  if (typeof title === 'string' && title.trim()) {
    return title.trim();
  }

  if (title && typeof title === 'object') {
    const record = title as Record<string, unknown>;
    const value =
      (typeof record.en === 'string' && record.en.trim()) ||
      (typeof record.zh === 'string' && record.zh.trim()) ||
      Object.values(record).find((item) => typeof item === 'string' && item.trim());

    if (typeof value === 'string' && value.trim()) {
      return value.trim();
    }
  }

  return fallback;
}

function formatDate(value: string | null): string {
  if (!value) return '—';
  const timestamp = new Date(value).getTime();
  if (!Number.isFinite(timestamp)) return '—';
  return new Intl.DateTimeFormat('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  }).format(new Date(timestamp));
}

function getClaimStatusLabel(status: string | null, isChinese: boolean): string {
  if (status === 'claimed') return isChinese ? '已认领' : 'Claimed';
  if (status === 'pending') return isChinese ? '待确认' : 'Pending';
  if (status === 'rejected') return isChinese ? '已驳回' : 'Rejected';
  return isChinese ? '未认领' : 'Unclaimed';
}

function getClaimStatusTone(status: string | null): string {
  if (status === 'claimed') return 'bg-emerald-50 text-emerald-700';
  if (status === 'pending') return 'bg-amber-50 text-amber-700';
  if (status === 'rejected') return 'bg-rose-50 text-rose-700';
  return 'bg-slate-100 text-slate-600';
}

function getToneClasses(tone: string): string {
  const toneClassMap: Record<string, string> = {
    emerald: 'bg-emerald-50 text-emerald-700',
    amber: 'bg-amber-50 text-amber-700',
    rose: 'bg-rose-50 text-rose-700',
    cyan: 'bg-cyan-50 text-cyan-700',
  };

  return toneClassMap[tone] || 'bg-slate-100 text-slate-600';
}

function getFeaturedStatusLabel(tool: ToolOwnerRow, now: Date, isChinese: boolean): string {
  if (!tool.isSponsoredPlacement) {
    return isChinese ? '无' : 'None';
  }

  if (!tool.featuredUntil) {
    return isChinese ? '已设置' : 'Configured';
  }

  const until = new Date(tool.featuredUntil);
  if (Number.isNaN(until.getTime())) {
    return isChinese ? '已设置' : 'Configured';
  }

  if (until >= now) {
    return isChinese ? '进行中' : 'Active';
  }

  return isChinese ? '已过期' : 'Expired';
}

function getNextFeaturedLabel(nextFeaturedTool: ToolOwnerRow | null, isChinese: boolean): string {
  if (nextFeaturedTool) return getTitle(nextFeaturedTool.title, nextFeaturedTool.name);
  return isChinese ? '暂无' : 'None';
}

function getNextFeaturedDaysLeftLabel(nextFeaturedDaysLeft: number | null, isChinese: boolean): string {
  if (nextFeaturedDaysLeft !== null) {
    return isChinese
      ? `还剩 ${nextFeaturedDaysLeft} 天`
      : `${nextFeaturedDaysLeft} day${nextFeaturedDaysLeft === 1 ? '' : 's'} left`;
  }

  return isChinese ? '当前没有活跃前排。' : 'No active featured listing right now.';
}

export async function generateMetadata({ params: { locale } }: { params: { locale: string } }): Promise<Metadata> {
  try {
    const t = await getTranslations({ locale, namespace: 'admin' });

    return {
      title: `${t('title')} - ${locale === 'cn' || locale === 'tw' ? '认领面板' : 'Tool Owner Dashboard'}`,
    };
  } catch (error) {
    console.error('Admin owners metadata failed to load:', error);
    return {
      title: 'Tool Owner Dashboard',
    };
  }
}

export default async function AdminOwnersPage({
  searchParams,
  params,
}: {
  searchParams?: {
    search?: string;
    status?: string;
  };
  params: { locale: string };
}) {
  try {
    const { locale } = params;
    const isChinese = locale === 'cn' || locale === 'tw';
    const search = searchParams?.search?.trim() || '';
    const statusFilter =
      searchParams?.status === 'claimed' ||
      searchParams?.status === 'pending' ||
      searchParams?.status === 'rejected' ||
      searchParams?.status === 'unclaimed' ||
      searchParams?.status === 'owner_email' ||
      searchParams?.status === 'featured_active' ||
      searchParams?.status === 'featured_expiring' ||
      searchParams?.status === 'featured_expired'
        ? searchParams.status
        : 'all';
    await requireAdmin();

    const pool = getPool();
    const result = await pool.query(
      `
      SELECT
        t.id::text AS id,
        t.name,
        t.title,
        t.url,
        t.status,
        t.owner_email AS "ownerEmail",
        t.claim_status AS "claimStatus",
        t.claimed_at AS "claimedAt",
        t.created_at AS "createdAt",
        t.updated_at AS "updatedAt",
        t.pricing,
        COALESCE(t.features->'submission'->'commercial'->>'isSponsoredPlacement', 'false') = 'true' AS "isSponsoredPlacement",
        NULLIF(t.features->'submission'->'commercial'->>'featuredActiveFrom', '')::timestamptz AS "featuredActiveFrom",
        NULLIF(t.features->'submission'->'commercial'->>'featuredUntil', '')::timestamptz AS "featuredUntil"
      FROM tools t
      ORDER BY COALESCE(t.claimed_at, t.updated_at, t.created_at) DESC
      LIMIT 300
    `,
    );

    const tools = result.rows as ToolOwnerRow[];
    const normalizedSearch = search.toLowerCase();
    const now = new Date();
    const filteredTools = tools.filter((tool) => {
      const title = getTitle(tool.title, tool.name).toLowerCase();
      const fields = [tool.name, title, tool.url, tool.ownerEmail || '', tool.claimStatus || '', tool.pricing || '']
        .join(' ')
        .toLowerCase();
      const matchesSearch = !normalizedSearch || fields.includes(normalizedSearch);

      let matchesStatus = true;
      if (statusFilter === 'claimed') matchesStatus = tool.claimStatus === 'claimed';
      else if (statusFilter === 'pending') matchesStatus = tool.claimStatus === 'pending';
      else if (statusFilter === 'rejected') matchesStatus = tool.claimStatus === 'rejected';
      else if (statusFilter === 'unclaimed') matchesStatus = !tool.claimStatus || tool.claimStatus === 'unclaimed';
      else if (statusFilter === 'owner_email') matchesStatus = Boolean(tool.ownerEmail);
      else if (statusFilter === 'featured_active') {
        const until = tool.featuredUntil ? new Date(tool.featuredUntil) : null;
        matchesStatus = tool.isSponsoredPlacement && Boolean(until && !Number.isNaN(until.getTime()) && until >= now);
      } else if (statusFilter === 'featured_expiring') {
        const until = tool.featuredUntil ? new Date(tool.featuredUntil) : null;
        const daysLeft =
          until && !Number.isNaN(until.getTime())
            ? Math.ceil((until.getTime() - now.getTime()) / (1000 * 60 * 60 * 24))
            : null;
        matchesStatus =
          tool.isSponsoredPlacement &&
          Boolean(until && !Number.isNaN(until.getTime()) && until >= now && daysLeft !== null && daysLeft <= 3);
      } else if (statusFilter === 'featured_expired') {
        const until = tool.featuredUntil ? new Date(tool.featuredUntil) : null;
        matchesStatus = tool.isSponsoredPlacement && Boolean(until && !Number.isNaN(until.getTime()) && until < now);
      }

      return matchesSearch && matchesStatus;
    });

    const claimedTools = filteredTools.filter((tool) => tool.claimStatus === 'claimed');
    const pendingTools = filteredTools.filter((tool) => tool.claimStatus === 'pending');
    const rejectedTools = filteredTools.filter((tool) => tool.claimStatus === 'rejected');
    const ownerLinkedTools = filteredTools.filter((tool) => Boolean(tool.ownerEmail) && tool.claimStatus !== 'claimed');
    const unclaimedPublishedTools = filteredTools.filter(
      (tool) =>
        tool.status === 'published' && (!tool.claimStatus || tool.claimStatus === 'unclaimed') && !tool.ownerEmail,
    );
    const featuredTools = filteredTools.filter((tool) => tool.isSponsoredPlacement && Boolean(tool.featuredUntil));
    const activeFeaturedTools = featuredTools.filter((tool) => {
      if (!tool.featuredUntil) return false;
      const until = new Date(tool.featuredUntil);
      return !Number.isNaN(until.getTime()) && until >= now;
    });
    const expiringFeaturedTools = activeFeaturedTools.filter((tool) => {
      if (!tool.featuredUntil) return false;
      const until = new Date(tool.featuredUntil);
      if (Number.isNaN(until.getTime())) return false;
      const daysLeft = Math.ceil((until.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
      return daysLeft <= 3;
    });
    const expiredFeaturedTools = featuredTools.filter((tool) => {
      if (!tool.featuredUntil) return false;
      const until = new Date(tool.featuredUntil);
      return !Number.isNaN(until.getTime()) && until < now;
    });
    const nextFeaturedTool =
      activeFeaturedTools
        .slice()
        .sort((a, b) => new Date(a.featuredUntil || 0).getTime() - new Date(b.featuredUntil || 0).getTime())[0] || null;
    const nextFeaturedDaysLeft = nextFeaturedTool?.featuredUntil
      ? Math.max(
          0,
          Math.ceil((new Date(nextFeaturedTool.featuredUntil).getTime() - now.getTime()) / (1000 * 60 * 60 * 24)),
        )
      : null;
    const ownerFollowUps = pendingTools.length + ownerLinkedTools.length;
    const revenueActions = activeFeaturedTools.length + expiringFeaturedTools.length + expiredFeaturedTools.length;
    const cleanupActions = unclaimedPublishedTools.length;

    const summaryCards = [
      {
        label: isChinese ? '已认领' : 'Claimed',
        value: claimedTools.length,
        tone: 'emerald',
        icon: CheckCircle2,
        subtext: isChinese ? '已经走完 owner 确认' : 'Already connected to an owner flow',
      },
      {
        label: isChinese ? '待确认' : 'Pending',
        value: pendingTools.length,
        tone: 'amber',
        icon: Clock3,
        subtext: isChinese ? '还需要人工核对' : 'Still needs manual verification',
      },
      {
        label: isChinese ? '已驳回' : 'Rejected',
        value: rejectedTools.length,
        tone: 'rose',
        icon: TriangleAlert,
        subtext: isChinese ? '需要重新联系或修正信息' : 'Needs a follow-up or data correction',
      },
      {
        label: isChinese ? '未认领' : 'Unclaimed',
        value: unclaimedPublishedTools.length,
        tone: 'slate',
        icon: UserRound,
        subtext: isChinese ? '公开条目里还没建立 owner 链路' : 'Published tools without an owner link',
      },
      {
        label: isChinese ? '已有 owner 邮箱' : 'Owner email set',
        value: ownerLinkedTools.length,
        tone: 'cyan',
        icon: Mail,
        subtext: isChinese ? '可直接发起跟进' : 'Ready for a direct follow-up',
      },
      {
        label: isChinese ? '前排中' : 'Featured active',
        value: activeFeaturedTools.length,
        tone: 'amber',
        icon: Sparkles,
        subtext: isChinese ? '正在消耗曝光窗口' : 'Currently using visibility windows',
      },
      {
        label: isChinese ? '快到期' : 'Expiring soon',
        value: expiringFeaturedTools.length,
        tone: 'rose',
        icon: Clock3,
        subtext: isChinese ? '3 天内需要关注' : 'Needs attention within 3 days',
      },
    ];

    const sections = [
      {
        title: isChinese ? '已认领条目' : 'Claimed tools',
        description: isChinese
          ? '已经进入 owner 闭环的工具，通常可继续做更新、留资和付费升级。'
          : 'Tools already connected to an owner loop.',
        items: claimedTools.slice(0, 8),
        emptyLabel: isChinese ? '暂无已认领条目。' : 'No claimed tools yet.',
      },
      {
        title: isChinese ? '待确认条目' : 'Pending claims',
        description: isChinese
          ? '已经收到认领或 owner 变更请求，但还没完成确认。'
          : 'Claims or owner changes that still need manual confirmation.',
        items: pendingTools.slice(0, 8),
        emptyLabel: isChinese ? '暂无待确认条目。' : 'No pending claims yet.',
      },
      {
        title: isChinese ? '需补 owner 链路' : 'Need owner cleanup',
        description: isChinese
          ? '有邮箱但还没认领，适合继续人工跟进。'
          : 'Entries with an email but no completed claim.',
        items: ownerLinkedTools.slice(0, 8),
        emptyLabel: isChinese ? '暂无需要清理的 owner 链路。' : 'No owner cleanup items yet.',
      },
      {
        title: isChinese ? '已发布但未认领' : 'Published but unclaimed',
        description: isChinese
          ? '已经公开上线，但还没有 owner 信息。'
          : 'Published listings that still do not have an owner link.',
        items: unclaimedPublishedTools.slice(0, 8),
        emptyLabel: isChinese ? '暂无未认领的公开条目。' : 'No published unclaimed tools yet.',
      },
      {
        title: isChinese ? '前排窗口' : 'Featured windows',
        description: isChinese
          ? '把正在曝光、快到期和已经过期的前排窗口放在一起看。'
          : 'See active, expiring, and expired visibility windows together.',
        items: featuredTools.slice(0, 8),
        emptyLabel: isChinese ? '暂无前排窗口。' : 'No featured windows yet.',
      },
    ];

    const buildOwnersHref = (nextStatus: string, nextSearch = search): string => {
      const queryParams = new URLSearchParams();
      if (nextStatus !== 'all') {
        queryParams.set('status', nextStatus);
      }
      if (nextSearch) {
        queryParams.set('search', nextSearch);
      }
      const query = queryParams.toString();
      return query ? `/admin/owners?${query}` : '/admin/owners';
    };

    return (
      <div className='space-y-6'>
        <div className='flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between'>
          <div className='max-w-3xl'>
            <div className='inline-flex items-center gap-2 rounded-full bg-cyan-50 px-3 py-1 text-xs font-semibold text-cyan-800'>
              <Sparkles className='size-3.5' />
              {isChinese ? 'Tool Owner Dashboard V1' : 'Tool Owner Dashboard V1'}
            </div>
            <h1 className='mt-3 text-3xl font-bold text-slate-950 lg:text-4xl'>
              {isChinese ? '认领闭环看板' : 'Owner flow dashboard'}
            </h1>
            <p className='mt-2 max-w-3xl text-sm leading-6 text-slate-600'>
              {isChinese
                ? '把认领、待确认、未认领和 owner 邮箱已知的条目放在一起看，方便人工快速决定下一步要跟谁联系。'
                : 'Group claimed, pending, unclaimed, and owner-email-known listings together so manual follow-up is easier.'}
            </p>
          </div>

          <div className='flex flex-wrap gap-3'>
            <Link
              href='/admin/claims'
              className='inline-flex items-center justify-center rounded-lg border border-cyan-200 bg-cyan-50 px-4 py-2 text-sm font-semibold text-cyan-700 hover:bg-cyan-100'
            >
              {isChinese ? '看认领队列' : 'Open claim queue'}
              <ArrowRight className='ml-2 size-4' />
            </Link>
            <Link
              href='/admin/tools'
              className='inline-flex items-center justify-center rounded-lg border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50'
            >
              {isChinese ? '回到工具管理' : 'Back to tools'}
            </Link>
            <Link
              href='/admin/cleanup'
              className='inline-flex items-center justify-center rounded-lg border border-rose-200 bg-rose-50 px-4 py-2 text-sm font-semibold text-rose-700 hover:bg-rose-100'
            >
              {isChinese ? '打开清理队列' : 'Open cleanup queue'}
            </Link>
          </div>
        </div>

        <div className='rounded-2xl border border-cyan-100 bg-cyan-50 p-5 shadow-sm'>
          <div className='flex flex-col gap-3 lg:flex-row lg:items-end lg:justify-between'>
            <div>
              <p className='text-sm font-semibold uppercase tracking-wide text-cyan-700'>
                {isChinese ? 'Owner + Featured 概览' : 'Owner + featured overview'}
              </p>
              <h2 className='mt-1 text-xl font-bold text-slate-950'>
                {isChinese ? '先看认领关系，再看前排续期' : 'Check owner links first, then featured renewals'}
              </h2>
              <p className='mt-2 text-sm leading-6 text-slate-600'>
                {isChinese
                  ? '这个页不只是认领列表，也会告诉你哪些条目正在吃曝光、哪些快要结束。'
                  : 'This page is not only about claims. It also shows which listings are consuming visibility and which are ending soon.'}
              </p>
            </div>
            <div className='flex flex-wrap gap-2 text-xs font-semibold'>
              <Link
                href='/admin/analytics#email-ops'
                className='rounded-full bg-white px-3 py-1.5 text-cyan-700 ring-1 ring-cyan-200 hover:bg-cyan-50'
              >
                {isChinese ? '去邮件运营' : 'Go to email ops'}
              </Link>
              <Link
                href='/admin/claims'
                className='rounded-full bg-white px-3 py-1.5 text-slate-700 ring-1 ring-slate-200 hover:bg-slate-50'
              >
                {isChinese ? '去认领队列' : 'Go to claim queue'}
              </Link>
            </div>
          </div>

          <div className='mt-4 grid gap-3 md:grid-cols-2 xl:grid-cols-4'>
            <div className='rounded-xl border border-white bg-white p-4 shadow-sm'>
              <p className='text-xs font-semibold uppercase tracking-wide text-slate-500'>
                {isChinese ? '前排中' : 'Active featured'}
              </p>
              <p className='mt-2 text-2xl font-bold text-amber-700'>{activeFeaturedTools.length}</p>
              <p className='mt-1 text-sm text-slate-600'>
                {isChinese ? '当前正在消耗曝光窗口' : 'Listings currently using visibility windows'}
              </p>
            </div>
            <div className='rounded-xl border border-white bg-white p-4 shadow-sm'>
              <p className='text-xs font-semibold uppercase tracking-wide text-slate-500'>
                {isChinese ? '快到期' : 'Expiring soon'}
              </p>
              <p className='mt-2 text-2xl font-bold text-rose-700'>{expiringFeaturedTools.length}</p>
              <p className='mt-1 text-sm text-slate-600'>
                {isChinese ? '3 天内需要回访' : 'Need follow-up within 3 days'}
              </p>
            </div>
            <div className='rounded-xl border border-white bg-white p-4 shadow-sm'>
              <p className='text-xs font-semibold uppercase tracking-wide text-slate-500'>
                {isChinese ? '已过期' : 'Expired'}
              </p>
              <p className='mt-2 text-2xl font-bold text-slate-700'>{expiredFeaturedTools.length}</p>
              <p className='mt-1 text-sm text-slate-600'>
                {isChinese ? '已结束但仍需清理' : 'Ended windows that may need cleanup'}
              </p>
            </div>
            <div className='rounded-xl border border-white bg-white p-4 shadow-sm'>
              <p className='text-xs font-semibold uppercase tracking-wide text-slate-500'>
                {isChinese ? '下一条到期' : 'Next expiry'}
              </p>
              <p className='mt-2 text-lg font-bold text-slate-950'>
                {getNextFeaturedLabel(nextFeaturedTool, isChinese)}
              </p>
              <p className='mt-1 text-sm text-slate-600'>
                {getNextFeaturedDaysLeftLabel(nextFeaturedDaysLeft, isChinese)}
              </p>
            </div>
          </div>
        </div>

        <div className='grid gap-4 md:grid-cols-3'>
          <div className='rounded-2xl border border-slate-200 bg-white p-5 shadow-sm'>
            <p className='text-xs font-semibold uppercase tracking-wide text-slate-500'>
              {isChinese ? '下一步' : 'Next action'}
            </p>
            <p className='mt-2 text-2xl font-bold text-slate-950'>{ownerFollowUps}</p>
            <p className='mt-1 text-sm text-slate-600'>
              {isChinese
                ? '待确认和已留邮箱的条目可以优先跟进'
                : 'Pending and owner-email-known listings are the fastest follow-up path.'}
            </p>
            <div className='mt-4'>
              <Link
                href={buildOwnersHref('pending', search)}
                className='inline-flex items-center justify-center rounded-lg border border-cyan-200 bg-cyan-50 px-3 py-1.5 text-xs font-semibold text-cyan-700 hover:bg-cyan-100'
              >
                {isChinese ? '打开待确认' : 'Open pending'}
              </Link>
            </div>
          </div>

          <div className='rounded-2xl border border-slate-200 bg-white p-5 shadow-sm'>
            <p className='text-xs font-semibold uppercase tracking-wide text-slate-500'>
              {isChinese ? '收入动作' : 'Revenue action'}
            </p>
            <p className='mt-2 text-2xl font-bold text-slate-950'>{revenueActions}</p>
            <p className='mt-1 text-sm text-slate-600'>
              {isChinese
                ? '前排中、快到期和已过期都算在这里'
                : 'Active, expiring, and expired featured windows are all captured here.'}
            </p>
            <div className='mt-4 flex flex-wrap gap-2'>
              <Link
                href={buildOwnersHref('featured_active', search)}
                className='inline-flex items-center justify-center rounded-lg border border-amber-200 bg-amber-50 px-3 py-1.5 text-xs font-semibold text-amber-800 hover:bg-amber-100'
              >
                {isChinese ? '看前排中' : 'Open featured'}
              </Link>
              <Link
                href={buildOwnersHref('featured_expiring', search)}
                className='inline-flex items-center justify-center rounded-lg border border-rose-200 bg-rose-50 px-3 py-1.5 text-xs font-semibold text-rose-700 hover:bg-rose-100'
              >
                {isChinese ? '看快到期' : 'Open expiring'}
              </Link>
            </div>
          </div>

          <div className='rounded-2xl border border-slate-200 bg-white p-5 shadow-sm'>
            <p className='text-xs font-semibold uppercase tracking-wide text-slate-500'>
              {isChinese ? '清理动作' : 'Cleanup action'}
            </p>
            <p className='mt-2 text-2xl font-bold text-slate-950'>{cleanupActions}</p>
            <p className='mt-1 text-sm text-slate-600'>
              {isChinese
                ? '已发布但未认领的条目应该尽快补 owner 链路'
                : 'Published unclaimed entries should get owner links quickly.'}
            </p>
            <div className='mt-4 flex flex-wrap gap-2'>
              <Link
                href={buildOwnersHref('unclaimed', search)}
                className='inline-flex items-center justify-center rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-xs font-semibold text-slate-700 hover:bg-slate-50'
              >
                {isChinese ? '打开未认领' : 'Open unclaimed'}
              </Link>
              <Link
                href='/admin/cleanup'
                className='inline-flex items-center justify-center rounded-lg border border-rose-200 bg-rose-50 px-3 py-1.5 text-xs font-semibold text-rose-700 hover:bg-rose-100'
              >
                {isChinese ? '去清理队列' : 'Go to cleanup'}
              </Link>
            </div>
          </div>
        </div>

        <form
          action={`/${locale}/admin/owners`}
          method='get'
          className='flex flex-col gap-3 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm lg:flex-row lg:items-center'
        >
          {statusFilter !== 'all' && <input type='hidden' name='status' value={statusFilter} />}
          <input
            type='text'
            name='search'
            defaultValue={search}
            placeholder={isChinese ? '搜索名称、邮箱、URL、状态...' : 'Search name, email, URL, or status...'}
            className='h-11 min-w-[280px] flex-1 rounded-lg border border-slate-300 px-4 text-sm text-slate-900'
          />
          <button
            type='submit'
            className='inline-flex h-11 items-center justify-center rounded-lg border border-cyan-200 bg-cyan-50 px-4 text-sm font-semibold text-cyan-700 hover:bg-cyan-100'
          >
            {isChinese ? '搜索' : 'Search'}
          </button>
          {search && (
            <Link
              href={buildOwnersHref(statusFilter, '')}
              className='inline-flex h-11 items-center justify-center rounded-lg border border-slate-200 bg-white px-4 text-sm font-semibold text-slate-700 hover:bg-slate-50'
            >
              {isChinese ? '清除' : 'Clear'}
            </Link>
          )}
        </form>

        <div className='flex flex-wrap gap-2'>
          {[
            { key: 'all', label: isChinese ? '全部' : 'All' },
            { key: 'claimed', label: isChinese ? '已认领' : 'Claimed' },
            { key: 'pending', label: isChinese ? '待确认' : 'Pending' },
            { key: 'rejected', label: isChinese ? '已驳回' : 'Rejected' },
            { key: 'unclaimed', label: isChinese ? '未认领' : 'Unclaimed' },
            { key: 'owner_email', label: isChinese ? '有邮箱' : 'Owner email' },
            { key: 'featured_active', label: isChinese ? '前排中' : 'Featured active' },
            { key: 'featured_expiring', label: isChinese ? '快到期' : 'Expiring soon' },
            { key: 'featured_expired', label: isChinese ? '已过期' : 'Expired' },
          ].map((item) => (
            <Link
              key={item.key}
              href={buildOwnersHref(item.key, search)}
              className={`rounded-lg px-3 py-1.5 text-sm font-medium ${
                statusFilter === item.key
                  ? 'border border-cyan-200 bg-cyan-50 text-cyan-800'
                  : 'border border-slate-200 bg-slate-50 text-slate-700 hover:bg-slate-100'
              }`}
            >
              {item.label}
            </Link>
          ))}
        </div>

        <div className='grid gap-4 md:grid-cols-2 xl:grid-cols-5'>
          {summaryCards.map((card) => (
            <div key={card.label} className='theme-surface rounded-2xl border border-slate-200 bg-white p-5 shadow-sm'>
              <div className='flex items-start justify-between gap-3'>
                <div>
                  <p className='text-sm font-medium text-slate-600'>{card.label}</p>
                  <p className='mt-2 text-3xl font-semibold text-slate-950'>{card.value.toLocaleString()}</p>
                </div>
                <div className={`rounded-full p-2 ${getToneClasses(card.tone)}`}>
                  <card.icon className='size-5' />
                </div>
              </div>
              <p className='mt-3 text-sm leading-6 text-slate-500'>{card.subtext}</p>
            </div>
          ))}
        </div>

        <div className='grid gap-4 lg:grid-cols-2'>
          {sections.map((section) => (
            <section key={section.title} className='rounded-[20px] border border-slate-200 bg-white p-5 shadow-sm'>
              <div className='flex items-start justify-between gap-3'>
                <div>
                  <h2 className='text-lg font-semibold text-slate-950'>{section.title}</h2>
                  <p className='mt-1 text-sm leading-6 text-slate-600'>{section.description}</p>
                </div>
                <span className='rounded-full bg-slate-100 px-2.5 py-1 text-xs font-semibold text-slate-600'>
                  {section.items.length}
                </span>
              </div>

              <div className='mt-4 space-y-3'>
                {section.items.length > 0 ? (
                  section.items.map((tool) => (
                    <div key={tool.id} className='rounded-2xl border border-slate-200 bg-slate-50 p-4'>
                      <div className='flex flex-wrap items-start justify-between gap-3'>
                        <div>
                          <p className='text-sm font-semibold text-slate-950'>{getTitle(tool.title, tool.name)}</p>
                          <p className='mt-1 text-xs text-slate-500'>{tool.name}</p>
                        </div>
                        <div className='flex flex-col items-end gap-2'>
                          <span
                            className={`inline-flex rounded-full px-2.5 py-1 text-xs font-semibold ${getClaimStatusTone(tool.claimStatus)}`}
                          >
                            {getClaimStatusLabel(tool.claimStatus, isChinese)}
                          </span>
                          <span className='rounded-full bg-white px-2.5 py-1 text-xs font-medium text-slate-600 ring-1 ring-slate-200'>
                            {tool.status}
                          </span>
                        </div>
                      </div>

                      <div className='mt-3 grid gap-2 text-xs text-slate-500 sm:grid-cols-2'>
                        <p>
                          {isChinese ? 'Owner 邮箱' : 'Owner email'}: {tool.ownerEmail || '—'}
                        </p>
                        <p>
                          {isChinese ? '认领时间' : 'Claimed at'}: {formatDate(tool.claimedAt)}
                        </p>
                        <p>
                          {isChinese ? '最近更新' : 'Updated'}: {formatDate(tool.updatedAt)}
                        </p>
                        <p>
                          {isChinese ? '定价' : 'Pricing'}: {tool.pricing || '—'}
                        </p>
                        <p>
                          {isChinese ? '前排状态' : 'Featured'}: {getFeaturedStatusLabel(tool, now, isChinese)}
                        </p>
                        <p>
                          {isChinese ? '到期时间' : 'Featured until'}: {formatDate(tool.featuredUntil)}
                        </p>
                      </div>

                      <div className='mt-4 flex flex-wrap gap-3'>
                        <Link
                          href={`/admin/tools/${tool.id}/edit`}
                          className='inline-flex items-center justify-center rounded-lg border border-cyan-200 bg-cyan-50 px-3 py-1.5 text-xs font-semibold text-cyan-700 hover:bg-cyan-100'
                        >
                          {isChinese ? '编辑条目' : 'Edit tool'}
                        </Link>
                        <Link
                          href='/admin/analytics#email-ops'
                          className='inline-flex items-center justify-center rounded-lg border border-amber-200 bg-amber-50 px-3 py-1.5 text-xs font-semibold text-amber-900 hover:bg-amber-100'
                        >
                          {isChinese ? '发续期提醒' : 'Send renewal reminder'}
                        </Link>
                        <Link
                          href={`/${locale}/ai/${tool.name}`}
                          className='inline-flex items-center justify-center rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-xs font-semibold text-slate-700 hover:bg-slate-50'
                        >
                          {isChinese ? '查看前台' : 'Open listing'}
                        </Link>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className='rounded-2xl border border-dashed border-slate-200 bg-slate-50 p-4 text-sm text-slate-500'>
                    {section.emptyLabel}
                  </div>
                )}
              </div>
            </section>
          ))}
        </div>
      </div>
    );
  } catch (error) {
    console.error('Admin owners page failed to load:', error);
    return (
      <div className='rounded-2xl border border-rose-200 bg-rose-50 p-6 text-rose-900'>
        <h1 className='text-2xl font-bold'>Tool owner dashboard unavailable</h1>
        <p className='mt-2 text-sm leading-6'>
          The owner dashboard could not finish loading right now. Please try again later, or return to the admin home.
        </p>
        <div className='mt-4 flex flex-wrap gap-3'>
          <Link
            href='/admin'
            className='inline-flex items-center justify-center rounded-lg bg-rose-700 px-4 py-2 text-sm font-semibold text-white hover:bg-rose-800'
          >
            Back to admin home
          </Link>
          <Link
            href='/admin/owners'
            className='inline-flex items-center justify-center rounded-lg border border-rose-200 bg-white px-4 py-2 text-sm font-semibold text-rose-800 hover:bg-rose-100'
          >
            Retry owner dashboard
          </Link>
        </div>
      </div>
    );
  }
}
