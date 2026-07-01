import type { Metadata } from 'next';
import Link from 'next/link';
import { ArrowRight, TriangleAlert } from 'lucide-react';

import { requireAdmin } from '@/lib/auth/middleware';
import CleanupQueueActions from '@/components/admin/CleanupQueueActions';
import CleanupQueueBatchOpen from '@/components/admin/CleanupQueueBatchOpen';
import CleanupQueueGroupDone from '@/components/admin/CleanupQueueGroupDone';
import CleanupQueueTable from '@/components/admin/CleanupQueueTable';
import { getPaidListingBlockerSummary } from '@/app/actions/admin/tools';

function getBlockerAnchorId(label: string): string {
  return label
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

function getBlockerActionLabel(label: string, isChinese: boolean): string {
  const normalized = label.toLowerCase();

  if (normalized.includes('category')) {
    return isChinese ? '先补分类，再继续其它字段。' : 'Start with category, then move to the rest.';
  }

  if (normalized.includes('screenshot') || normalized.includes('logo')) {
    return isChinese ? '先补视觉素材，最容易拉高可发布度。' : 'Fix visuals first to unlock publish readiness faster.';
  }

  if (normalized.includes('description') || normalized.includes('detail')) {
    return isChinese
      ? '先把文案补足，再回头补其它字段。'
      : 'Fill in the copy first, then return to the remaining fields.';
  }

  if (normalized.includes('pricing')) {
    return isChinese ? '补上定价，清理页就能少一个阻塞。' : 'Add pricing to remove one of the fastest blockers.';
  }

  if (normalized.includes('tags')) {
    return isChinese ? '标签通常很好补，适合顺手收尾。' : 'Tags are usually quick wins and good to finish last.';
  }

  return isChinese ? '先打开这一组，逐条补齐。' : 'Open this group and clear it item by item.';
}

function getTopBlockerLabel(topBlocker: { label: string } | undefined, isChinese: boolean): string {
  if (topBlocker) return topBlocker.label;
  return isChinese ? '暂无' : 'None';
}

function getTopBlockerDescription(topBlocker: { count: number } | undefined, isChinese: boolean): string {
  if (topBlocker) {
    return isChinese
      ? `${topBlocker.count} 个条目仍缺这个字段。`
      : `${topBlocker.count} listings still need this field.`;
  }

  return isChinese ? '当前没有明显阻塞。' : 'No backlog is visible right now.';
}

function getNextBlockerLabel(currentBlockerIndex: number, availableBlockers: string[]): string {
  if (currentBlockerIndex >= 0 && availableBlockers.length > 1) {
    return availableBlockers[(currentBlockerIndex + 1) % availableBlockers.length];
  }

  return '';
}

function CleanupFallback({ error }: { error: string }) {
  return (
    <div className='space-y-4'>
      <div className='rounded-2xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-900'>
        Cleanup queue loaded with partial data: {error}
      </div>
      <div className='rounded-2xl border border-slate-200 bg-white p-6 shadow-sm'>
        <h1 className='text-3xl font-bold text-slate-950'>Paid listing blockers</h1>
        <p className='mt-2 text-sm leading-6 text-slate-600'>
          The cleanup workflow is temporarily unavailable. Retry the page or jump back to tools while the source
          recovers.
        </p>
        <div className='mt-4 flex flex-wrap gap-3'>
          <Link
            href='/admin/cleanup'
            className='inline-flex items-center justify-center rounded-lg border border-rose-200 bg-rose-50 px-4 py-2 text-sm font-semibold text-rose-700 hover:bg-rose-100'
          >
            Retry cleanup queue
          </Link>
          <Link
            href='/admin/tools'
            className='inline-flex items-center justify-center rounded-lg border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50'
          >
            Open tools
          </Link>
        </div>
      </div>
    </div>
  );
}

export default async function AdminCleanupPage({
  searchParams,
  params,
}: {
  searchParams?: {
    search?: string;
    blocker?: string;
    urgent?: string;
    focus?: string;
  };
  params: { locale: string };
}) {
  try {
    await requireAdmin();

    const { locale } = params;
    const isChinese = locale === 'cn' || locale === 'tw';
    const blockerSummary = await getPaidListingBlockerSummary(25);
    const search = searchParams?.search?.trim() || '';
    const blockerFilter = searchParams?.blocker?.trim() || 'all';
    const urgentOnly = searchParams?.urgent === '1';
    const focusTopOnly = searchParams?.focus === 'top';
    const superFocusOnly = blockerFilter === 'all' && urgentOnly && focusTopOnly && !search;
    const normalizedSearch = search.toLowerCase();
    const availableBlockers = blockerSummary.blockerCounts.map((item) => item.label);
    const topBlocker = blockerSummary.blockerCounts[0];
    const filteredItems = blockerSummary.items.filter((item) => {
      const matchesSearch =
        !normalizedSearch ||
        `${item.title} ${item.name} ${item.blockers.join(' ')}`.toLowerCase().includes(normalizedSearch);
      const matchesBlocker = blockerFilter === 'all' ? true : item.blockers.includes(blockerFilter);
      const matchesUrgent = urgentOnly ? item.blockers.length >= 2 : true;
      const matchesFocus = focusTopOnly && topBlocker ? item.blockers.includes(topBlocker.label) : true;
      return matchesSearch && matchesBlocker && matchesUrgent && matchesFocus;
    });
    const sortedItems = [...filteredItems].sort((a, b) => {
      if (b.blockers.length !== a.blockers.length) {
        return b.blockers.length - a.blockers.length;
      }

      return new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime();
    });
    const urgentCount = blockerSummary.items.filter((item) => item.blockers.length >= 2).length;
    const blockerGroups = blockerSummary.blockerCounts
      .slice(0, 4)
      .filter((blocker) => (focusTopOnly && topBlocker ? blocker.label === topBlocker.label : true))
      .map((blocker) => ({
        label: blocker.label,
        count: blocker.count,
        items: blockerSummary.items.filter((item) => item.blockers.includes(blocker.label)),
      }));

    const buildHref = (
      nextBlocker: string,
      nextSearch = search,
      nextUrgent = urgentOnly,
      nextFocusTopOnly = focusTopOnly,
    ) => {
      const queryParams = new URLSearchParams();
      if (nextBlocker !== 'all') queryParams.set('blocker', nextBlocker);
      if (nextSearch) queryParams.set('search', nextSearch);
      if (nextUrgent) queryParams.set('urgent', '1');
      if (nextFocusTopOnly) queryParams.set('focus', 'top');
      const query = queryParams.toString();
      return query ? `/admin/cleanup?${query}` : '/admin/cleanup';
    };
    const currentBlockerLabel =
      blockerFilter !== 'all' ? blockerFilter : topBlocker?.label || availableBlockers[0] || '';
    const currentBlockerIndex = currentBlockerLabel
      ? availableBlockers.findIndex((label) => label === currentBlockerLabel)
      : -1;
    const nextBlockerLabel = getNextBlockerLabel(currentBlockerIndex, availableBlockers);
    const nextBlockerHref = nextBlockerLabel
      ? `${buildHref(nextBlockerLabel, '', true, true)}#blocker-${getBlockerAnchorId(nextBlockerLabel)}`
      : '';
    const openBlockerLabel = blockerFilter !== 'all' ? blockerFilter : topBlocker?.label || '';
    const priorityBlockers = blockerSummary.blockerCounts.slice(0, 3).map((blocker) => ({
      ...blocker,
      href: `${buildHref(blocker.label, '', true, true)}#blocker-${getBlockerAnchorId(blocker.label)}`,
      action: getBlockerActionLabel(blocker.label, isChinese),
    }));

    return (
      <div className='space-y-6'>
        <div className='flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between'>
          <div className='max-w-3xl'>
            <div className='inline-flex items-center gap-2 rounded-full bg-rose-50 px-3 py-1 text-xs font-semibold text-rose-700'>
              <TriangleAlert className='size-3.5' />
              {isChinese ? '待补资料队列' : 'Cleanup queue'}
            </div>
            <h1 className='mt-3 text-3xl font-bold text-slate-950 lg:text-4xl'>
              {isChinese ? '付费发布阻塞项' : 'Paid listing blockers'}
            </h1>
            <p className='mt-2 max-w-3xl text-sm leading-6 text-slate-600'>
              {isChinese
                ? '这里专门收口那些还缺分类、截图、logo、文案、定价或标签的条目。先补齐这些字段，再把工具送回正常发布流。'
                : 'This queue collects listings that still need category, screenshot, logo, copy, pricing, or tag cleanup before they can move back into the normal publish flow.'}
            </p>
          </div>

          <div className='flex flex-wrap gap-3'>
            {blockerFilter !== 'all' || urgentOnly || focusTopOnly || search ? (
              <Link
                href='/admin/cleanup'
                className='inline-flex items-center justify-center rounded-lg border border-rose-200 bg-rose-50 px-4 py-2 text-sm font-semibold text-rose-700 hover:bg-rose-100'
              >
                {isChinese ? '回到全量视图' : 'Reset to all'}
              </Link>
            ) : null}
            <Link
              href='/admin/tools?paidBlockers=1'
              className='inline-flex items-center justify-center rounded-lg border border-rose-200 bg-rose-50 px-4 py-2 text-sm font-semibold text-rose-700 hover:bg-rose-100'
            >
              {isChinese ? '打开工具过滤器' : 'Open tools filter'}
              <ArrowRight className='ml-2 size-4' />
            </Link>
            <Link
              href='/admin/analytics'
              className='inline-flex items-center justify-center rounded-lg border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50'
            >
              {isChinese ? '查看分析页' : 'Open analytics'}
            </Link>
            {nextBlockerHref ? (
              <Link
                href={nextBlockerHref}
                className='inline-flex items-center justify-center rounded-lg border border-amber-200 bg-amber-50 px-4 py-2 text-sm font-semibold text-amber-700 hover:bg-amber-100'
              >
                {isChinese ? '下一个分组' : 'Next group'}
              </Link>
            ) : null}
          </div>
        </div>

        <div className='grid gap-4 md:grid-cols-4'>
          <div className='theme-surface rounded-2xl border border-slate-200 bg-white p-5 shadow-sm'>
            <p className='text-sm font-medium text-slate-600'>{isChinese ? '阻塞条目' : 'Blocked listings'}</p>
            <p className='mt-2 text-3xl font-semibold text-rose-600'>{blockerSummary.totalBlocked}</p>
            <p className='mt-3 text-sm leading-6 text-slate-500'>
              {isChinese
                ? '这些条目暂时还不能顺畅进入付费发布。'
                : 'These listings are not ready to re-enter the paid publish flow yet.'}
            </p>
          </div>

          <div className='theme-surface rounded-2xl border border-slate-200 bg-white p-5 shadow-sm'>
            <p className='text-sm font-medium text-slate-600'>{isChinese ? '最高频阻塞项' : 'Top blocker'}</p>
            <p className='mt-2 text-2xl font-semibold text-slate-950'>{getTopBlockerLabel(topBlocker, isChinese)}</p>
            <p className='mt-3 text-sm leading-6 text-slate-500'>{getTopBlockerDescription(topBlocker, isChinese)}</p>
          </div>

          <div className='theme-surface rounded-2xl border border-slate-200 bg-white p-5 shadow-sm'>
            <p className='text-sm font-medium text-slate-600'>{isChinese ? '阻塞类型' : 'Blocker types'}</p>
            <p className='mt-2 text-3xl font-semibold text-slate-950'>{blockerSummary.blockerCounts.length}</p>
            <p className='mt-3 text-sm leading-6 text-slate-500'>
              {isChinese
                ? '把最常见的缺失字段先补完，后面的发布会顺很多。'
                : 'Fix the most common missing fields first to smooth out the rest of the pipeline.'}
            </p>
          </div>

          <div className='theme-surface rounded-2xl border border-slate-200 bg-white p-5 shadow-sm'>
            <p className='text-sm font-medium text-slate-600'>{isChinese ? '高优先级' : 'Urgent items'}</p>
            <p className='mt-2 text-3xl font-semibold text-slate-950'>{urgentCount}</p>
            <p className='mt-3 text-sm leading-6 text-slate-500'>
              {isChinese
                ? '至少缺两项阻塞字段的条目，优先处理。'
                : 'Listings missing two or more blocker fields should be handled first.'}
            </p>
          </div>
        </div>

        {blockerSummary.blockerCounts.length > 0 && (
          <div className='rounded-2xl border border-rose-100 bg-rose-50 px-4 py-3 text-sm text-rose-800'>
            <span className='font-semibold'>{isChinese ? '当前缺口：' : 'Current gaps: '}</span>
            {blockerSummary.blockerCounts.map((item) => `${item.label} (${item.count})`).join(' · ')}
          </div>
        )}

        {priorityBlockers.length > 0 && (
          <section className='rounded-[20px] border border-slate-200 bg-white p-5 shadow-sm'>
            <div className='flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between'>
              <div>
                <h2 className='text-lg font-semibold text-slate-950'>
                  {isChinese ? '优先修复顺序' : 'Priority order'}
                </h2>
                <p className='mt-1 text-sm leading-6 text-slate-600'>
                  {isChinese
                    ? '按出现频率先处理最常见的缺失项，通常能最快拉低整体阻塞。'
                    : 'Tackle the most common missing fields first to reduce the backlog fastest.'}
                </p>
              </div>
              <Link
                href={nextBlockerHref || '/admin/cleanup'}
                className='text-sm font-semibold text-rose-700 hover:text-rose-800'
              >
                {isChinese ? '跳到下一个分组' : 'Jump to next group'}
              </Link>
            </div>
            <div className='mt-4 grid gap-3 md:grid-cols-3'>
              {priorityBlockers.map((blocker, index) => (
                <Link
                  key={blocker.label}
                  href={blocker.href}
                  className='rounded-2xl border border-slate-200 bg-slate-50 p-4 transition hover:-translate-y-0.5 hover:border-rose-200 hover:bg-rose-50'
                >
                  <p className='text-xs font-semibold uppercase tracking-wide text-slate-500'>
                    {isChinese ? `优先 ${index + 1}` : `Priority ${index + 1}`}
                  </p>
                  <p className='mt-2 text-lg font-bold text-slate-950'>{blocker.label}</p>
                  <p className='mt-1 text-sm text-slate-600'>{blocker.count}</p>
                  <p className='mt-3 text-sm leading-6 text-slate-600'>{blocker.action}</p>
                </Link>
              ))}
            </div>
          </section>
        )}

        {superFocusOnly && (
          <div className='rounded-2xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-900'>
            {isChinese
              ? `超级聚焦已开启：只展示紧急且命中主阻塞的条目，并默认隐藏已处理项。当前主分组：${currentBlockerLabel || '无'}。`
              : `Super focus is on: only urgent items matching the top blocker are shown, and completed items stay hidden. Current group: ${currentBlockerLabel || 'none'}.`}
          </div>
        )}

        {blockerGroups.length > 0 && (
          <section className='overflow-hidden rounded-[20px] border border-slate-200 bg-white shadow-sm'>
            <div className='border-b border-slate-200 px-5 py-4'>
              <h2 className='text-lg font-semibold text-slate-950'>
                {isChinese ? '按 blocker 分组' : 'Blocker groups'}
              </h2>
              <p className='mt-1 text-sm leading-6 text-slate-600'>
                {isChinese
                  ? '按缺失字段直接分组处理，每组都能单独批量打开。'
                  : 'Work by missing field type and open each group in batch.'}
              </p>
            </div>
            <div className='space-y-3 p-5'>
              {blockerGroups.map((group) => (
                <details
                  key={group.label}
                  id={`blocker-${getBlockerAnchorId(group.label)}`}
                  className='group rounded-2xl border border-slate-200 bg-slate-50 p-4'
                  open={group.label === openBlockerLabel}
                >
                  <summary className='flex cursor-pointer list-none items-start justify-between gap-3'>
                    <div>
                      <p className='text-sm font-semibold text-slate-950'>{group.label}</p>
                      <p className='mt-1 text-xs text-slate-500'>
                        {isChinese ? `${group.count} 个条目` : `${group.count} items`}
                      </p>
                    </div>
                    <Link
                      href={buildHref(group.label, search, urgentOnly, focusTopOnly)}
                      className='rounded-full bg-white px-2.5 py-1 text-xs font-medium text-slate-700 ring-1 ring-slate-200 hover:bg-slate-50'
                    >
                      {isChinese ? '筛选' : 'Filter'}
                    </Link>
                  </summary>
                  <div className='mt-4'>
                    <p className='text-xs leading-5 text-slate-500'>
                      {isChinese
                        ? '直接把这一类缺失项拉出来，优先修复。'
                        : 'Pull this missing field type into focus and repair it first.'}
                    </p>
                    <div className='mt-4 flex flex-wrap gap-2'>
                      <CleanupQueueGroupDone items={group.items} locale={locale} />
                      <CleanupQueueBatchOpen items={group.items} locale={locale} limit={3} />
                    </div>
                  </div>
                </details>
              ))}
            </div>
          </section>
        )}

        <section className='overflow-hidden rounded-[20px] border border-slate-200 bg-white shadow-sm'>
          <div className='border-b border-slate-200 px-5 py-4'>
            <div className='flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between'>
              <div>
                <h2 className='text-lg font-semibold text-slate-950'>
                  {isChinese ? '待处理条目' : 'Items to clean up'}
                </h2>
                <p className='mt-1 text-sm leading-6 text-slate-600'>
                  {isChinese
                    ? '先补齐阻塞字段，再回到工具编辑页保存。'
                    : 'Open the tool editor, fill the missing fields, and then send the item back through the normal flow.'}
                </p>
              </div>
              <p className='text-xs font-medium text-slate-500'>
                {isChinese ? `共 ${filteredItems.length} 条` : `${filteredItems.length} items`}
              </p>
            </div>

            <div className='flex flex-col gap-3 sm:flex-row sm:items-center'>
              <form action={`/${locale}/admin/cleanup`} method='get' className='flex flex-1 gap-2'>
                <input
                  type='text'
                  name='search'
                  defaultValue={search}
                  placeholder={isChinese ? '搜索名称、标题或阻塞项...' : 'Search name, title, or blocker...'}
                  className='h-10 min-w-[220px] flex-1 rounded-lg border border-slate-300 px-3 text-sm text-slate-900'
                />
                {blockerFilter !== 'all' && <input type='hidden' name='blocker' value={blockerFilter} />}
                {urgentOnly && <input type='hidden' name='urgent' value='1' />}
                {focusTopOnly && <input type='hidden' name='focus' value='top' />}
                <button
                  type='submit'
                  className='inline-flex h-10 items-center justify-center rounded-lg border border-rose-200 bg-rose-50 px-4 text-sm font-semibold text-rose-700 hover:bg-rose-100'
                >
                  {isChinese ? '搜索' : 'Search'}
                </button>
                {search && (
                  <Link
                    href={buildHref(blockerFilter, '', urgentOnly, focusTopOnly)}
                    className='inline-flex h-10 items-center justify-center rounded-lg border border-slate-200 bg-white px-4 text-sm font-semibold text-slate-700 hover:bg-slate-50'
                  >
                    {isChinese ? '清除' : 'Clear'}
                  </Link>
                )}
              </form>
            </div>

            <div className='mt-4 flex flex-wrap gap-2'>
              <Link
                href={buildHref('all', search, urgentOnly, focusTopOnly)}
                className={`rounded-lg px-3 py-1.5 text-sm font-medium ${
                  blockerFilter === 'all'
                    ? 'border border-rose-200 bg-rose-50 text-rose-800'
                    : 'border border-slate-200 bg-slate-50 text-slate-700 hover:bg-slate-100'
                }`}
              >
                {isChinese ? '全部' : 'All'}
              </Link>
              {availableBlockers.map((label) => (
                <Link
                  key={label}
                  href={buildHref(label, search, urgentOnly, focusTopOnly)}
                  className={`rounded-lg px-3 py-1.5 text-sm font-medium ${
                    blockerFilter === label
                      ? 'border border-rose-200 bg-rose-50 text-rose-800'
                      : 'border border-slate-200 bg-slate-50 text-slate-700 hover:bg-slate-100'
                  }`}
                >
                  {label}
                </Link>
              ))}
              <Link
                href={buildHref(blockerFilter, search, !urgentOnly, focusTopOnly)}
                className={`rounded-lg px-3 py-1.5 text-sm font-medium ${
                  urgentOnly
                    ? 'border border-rose-200 bg-rose-50 text-rose-800'
                    : 'border border-slate-200 bg-slate-50 text-slate-700 hover:bg-slate-100'
                }`}
              >
                {isChinese ? '只看紧急' : 'Urgent only'}
              </Link>
              <Link
                href={buildHref(blockerFilter, search, urgentOnly, !focusTopOnly)}
                className={`rounded-lg px-3 py-1.5 text-sm font-medium ${
                  focusTopOnly
                    ? 'border border-slate-300 bg-slate-50 text-slate-900'
                    : 'border border-slate-200 bg-slate-50 text-slate-700 hover:bg-slate-100'
                }`}
              >
                {isChinese ? '只看主阻塞' : 'Top blocker only'}
              </Link>
              <Link
                href={buildHref('all', '', true, true)}
                className={`rounded-lg px-3 py-1.5 text-sm font-medium ${
                  superFocusOnly
                    ? 'border border-rose-200 bg-rose-50 text-rose-800'
                    : 'border border-rose-200 bg-rose-50 text-rose-700 hover:bg-rose-100'
                }`}
              >
                {isChinese ? '超级聚焦' : 'Super focus'}
              </Link>
            </div>

            <div className='mt-4 flex justify-end'>
              <div className='flex flex-wrap gap-2'>
                <CleanupQueueBatchOpen items={sortedItems} locale={locale} />
                <CleanupQueueActions items={sortedItems} locale={locale} />
              </div>
            </div>
          </div>

          <CleanupQueueTable
            items={sortedItems}
            locale={locale}
            isChinese={isChinese}
            forceHideProcessed={superFocusOnly}
          />
        </section>
      </div>
    );
  } catch (error) {
    console.error('Failed to load admin cleanup page:', error);
    return <CleanupFallback error={error instanceof Error ? error.message : 'Unknown error'} />;
  }
}

export async function generateMetadata({ params }: { params: { locale: string } }): Promise<Metadata> {
  const isChinese = params.locale === 'cn' || params.locale === 'tw';

  return {
    title: isChinese ? '待补资料 - 管理面板' : 'Cleanup Queue - Admin Panel',
  };
}
