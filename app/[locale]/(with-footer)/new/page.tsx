import type { Metadata } from 'next';
import { ArrowRight, Clock3, FolderOpen, Sparkles } from 'lucide-react';
import { getTranslations } from 'next-intl/server';

import { getAllCategories, getLocalizedField as getLocalizedCategoryField } from '@/lib/services/categories';
import { toolToListRow } from '@/lib/services/toolPresenter';
import { getLatestTools } from '@/lib/services/tools';
import WebNavCardList from '@/components/webNav/WebNavCardList';
import { Link } from '@/app/navigation';

export const revalidate = 3600;

function isWithinLastDays(dateLike: string | Date | undefined, days: number) {
  if (!dateLike) return false;

  const timestamp = new Date(dateLike).getTime();
  if (Number.isNaN(timestamp)) return false;

  return Date.now() - timestamp <= days * 24 * 60 * 60 * 1000;
}

export async function generateMetadata({ params: { locale } }: { params: { locale: string } }): Promise<Metadata> {
  const isChinese = locale === 'cn' || locale === 'tw';

  return {
    title: isChinese ? '本周新增 AI 工具' : 'New This Week AI Tools',
    description: isChinese
      ? '查看 AI Best Tool 本周新增和最近收录的工具，快速跟上最近补进来的真实内容。'
      : 'Catch up on the newest AI tools added to AI Best Tool this week and see the latest reviewed additions in one place.',
    alternates: {
      canonical: './new',
    },
    robots: {
      index: false,
      follow: true,
    },
  };
}

export default async function NewToolsPage({ params: { locale } }: { params: { locale: string } }) {
  const isChinese = locale === 'cn' || locale === 'tw';
  const t = await getTranslations('Navigation');
  const [latestTools, categories] = await Promise.all([
    getLatestTools(24).catch(() => []),
    getAllCategories(false).catch(() => []),
  ]);
  const categoryMap = new Map(categories.map((category) => [category.id, category]));
  const rows = latestTools.map((tool) => toolToListRow(tool, locale));
  const thisWeekRows = rows.filter((row) => isWithinLastDays(row.createdAt, 7));
  const recentRows = rows.filter((row) => !thisWeekRows.some((item) => item.id === row.id));
  const groupedThisWeek = latestTools
    .filter((tool) => isWithinLastDays(tool.createdAt, 7))
    .reduce<
      Array<{
        categoryId: string;
        categoryName: string;
        categorySlug: string;
        rows: ReturnType<typeof toolToListRow>[];
      }>
    >((groups, tool) => {
      if (!tool.categoryId) {
        return groups;
      }

      const category = categoryMap.get(tool.categoryId);
      if (!category) {
        return groups;
      }

      const existing = groups.find((group) => group.categoryId === tool.categoryId);
      const row = toolToListRow(tool, locale);

      if (existing) {
        existing.rows.push(row);
        return groups;
      }

      groups.push({
        categoryId: tool.categoryId,
        categoryName: getLocalizedCategoryField(category.name, locale),
        categorySlug: category.slug,
        rows: [row],
      });
      return groups;
    }, [])
    .sort((a, b) => b.rows.length - a.rows.length || a.categoryName.localeCompare(b.categoryName))
    .slice(0, 4);

  const heroTitle = isChinese ? '本周新增' : 'New this week';
  const heroDescription = isChinese
    ? '这里集中展示最近补进目录、并已经整理好详情与媒体素材的工具。适合回看最近一周站里新增了什么。'
    : 'This page pulls together the newest tools we have recently added and cleaned up, so it is easy to catch up on what changed this week.';

  return (
    <div className='bg-slate-50'>
      <section className='border-b border-slate-200 bg-white'>
        <div className='mx-auto flex w-full max-w-7xl flex-col gap-6 px-4 py-10 lg:px-6 lg:py-14'>
          <div className='flex flex-wrap gap-2'>
            <span className='inline-flex items-center gap-2 rounded-full bg-cyan-50 px-3 py-1 text-sm font-semibold text-cyan-700'>
              <Sparkles className='size-4' />
              {heroTitle}
            </span>
            <span className='inline-flex items-center gap-2 rounded-full bg-emerald-50 px-3 py-1 text-sm font-semibold text-emerald-700'>
              <Clock3 className='size-4' />
              {isChinese ? '最近 7 天' : 'Last 7 days'}
            </span>
          </div>

          <div className='grid gap-6 lg:grid-cols-[minmax(0,1fr)_320px]'>
            <div>
              <h1 className='text-4xl font-bold tracking-tight text-slate-950 lg:text-5xl'>{heroTitle}</h1>
              <p className='mt-4 max-w-3xl text-base leading-7 text-slate-600 lg:text-lg'>{heroDescription}</p>
              <div className='mt-6 flex flex-wrap gap-3'>
                <Link
                  href='/explore?sort=latest'
                  className='inline-flex items-center gap-2 rounded-lg bg-slate-950 px-5 py-3 text-sm font-semibold text-white hover:bg-slate-800'
                >
                  {isChinese ? '按时间继续浏览' : 'Browse by latest'}
                  <ArrowRight className='size-4' />
                </Link>
                <Link
                  href='/submit'
                  className='inline-flex items-center gap-2 rounded-lg bg-white px-5 py-3 text-sm font-semibold text-slate-800 ring-1 ring-slate-200 hover:bg-slate-100'
                >
                  {isChinese ? '提交工具' : 'Submit a tool'}
                </Link>
              </div>
            </div>

            <aside className='grid gap-3'>
              <div className='rounded-lg bg-slate-950 p-5 text-white shadow-sm'>
                <p className='text-sm text-slate-300'>{isChinese ? '本周新增工具' : 'Added this week'}</p>
                <p className='mt-2 text-3xl font-bold'>{thisWeekRows.length}</p>
              </div>
              <div className='rounded-lg bg-white p-5 shadow-sm ring-1 ring-slate-200'>
                <p className='text-sm text-slate-500'>{isChinese ? '最近更新入口' : 'Fresh entry point'}</p>
                <p className='mt-2 text-3xl font-bold text-slate-950'>{rows.length}</p>
                <p className='mt-2 text-sm leading-6 text-slate-600'>
                  {isChinese
                    ? '这里优先展示最近补货和最近整理过的高价值工具。'
                    : 'This page prioritizes the newest high-value tools we recently added or cleaned up.'}
                </p>
              </div>
              <div className='rounded-lg bg-white p-5 shadow-sm ring-1 ring-slate-200'>
                <p className='text-sm text-slate-500'>{isChinese ? '继续探索' : 'Keep exploring'}</p>
                <Link
                  href='/guides'
                  className='mt-3 inline-flex items-center gap-2 text-sm font-semibold text-cyan-700 hover:text-cyan-800'
                >
                  <FolderOpen className='size-4' />
                  {t('guides')}
                </Link>
              </div>
            </aside>
          </div>
        </div>
      </section>

      <div className='mx-auto flex w-full max-w-7xl flex-col gap-10 px-4 py-10 lg:px-6 lg:py-12'>
        <section className='rounded-[18px] border border-slate-200 bg-white p-6 shadow-sm'>
          <div className='mb-5 flex flex-col gap-2 lg:mb-6'>
            <h2 className='text-2xl font-bold text-slate-950 lg:text-3xl'>
              {isChinese ? '本周重点去向' : 'Where to go next this week'}
            </h2>
            <p className='max-w-3xl text-sm leading-6 text-slate-600'>
              {isChinese
                ? '如果你想从“最近新增”继续往下筛，这几个页面是现在最值得继续走的核心入口。'
                : 'If you want to keep moving from recent additions into stronger directory pages, these are the best next stops right now.'}
            </p>
          </div>
          <div className='grid gap-3 md:grid-cols-2 xl:grid-cols-4'>
            <Link
              href='/explore?sort=latest'
              className='rounded-lg border border-slate-200 bg-slate-50 p-4 transition hover:border-cyan-200 hover:bg-cyan-50/60'
            >
              <p className='text-sm font-semibold text-slate-950'>
                {isChinese ? '继续看全部最新' : 'Browse all latest tools'}
              </p>
              <p className='mt-2 text-sm leading-6 text-slate-600'>
                {isChinese
                  ? '回到探索页，按最新排序继续扩大范围。'
                  : 'Return to Explore and keep scanning the newest listings.'}
              </p>
            </Link>
            <Link
              href='/categories/productivity?sort=latest'
              className='rounded-lg border border-slate-200 bg-slate-50 p-4 transition hover:border-cyan-200 hover:bg-cyan-50/60'
            >
              <p className='text-sm font-semibold text-slate-950'>
                {isChinese ? '进入生产力分类' : 'Open productivity'}
              </p>
              <p className='mt-2 text-sm leading-6 text-slate-600'>
                {isChinese
                  ? '如果你想优先看实用型工具，这是最稳的入口之一。'
                  : 'A strong next stop if you want practical, high-frequency workflows first.'}
              </p>
            </Link>
            <Link
              href='/categories/web3?sort=latest'
              className='rounded-lg border border-slate-200 bg-slate-50 p-4 transition hover:border-cyan-200 hover:bg-cyan-50/60'
            >
              <p className='text-sm font-semibold text-slate-950'>{isChinese ? '进入 Web3 分类' : 'Open Web3'}</p>
              <p className='mt-2 text-sm leading-6 text-slate-600'>
                {isChinese
                  ? '如果你关注链上研究和数据工具，这里最值得继续深挖。'
                  : 'The best next stop for on-chain research, analytics, and infra workflows.'}
              </p>
            </Link>
            <Link
              href='/guides/how-to-choose-ai-tools'
              className='rounded-lg border border-slate-200 bg-slate-50 p-4 transition hover:border-cyan-200 hover:bg-cyan-50/60'
            >
              <p className='text-sm font-semibold text-slate-950'>
                {isChinese ? '回到选型指南' : 'Return to the guide'}
              </p>
              <p className='mt-2 text-sm leading-6 text-slate-600'>
                {isChinese
                  ? '如果你已经看花了，先回指南重新确认比较维度。'
                  : 'If the choices are getting noisy, reset your criteria with the guide.'}
              </p>
            </Link>
          </div>
        </section>

        <section>
          <div className='mb-5 flex flex-col gap-2 lg:mb-6'>
            <h2 className='text-2xl font-bold text-slate-950 lg:text-3xl'>
              {isChinese ? '最近 7 天新增' : 'Added in the last 7 days'}
            </h2>
            <p className='max-w-3xl text-sm leading-6 text-slate-600'>
              {isChinese
                ? '优先从这里看最近补进站里的内容。如果你想知道“这周到底新增了什么”，这一栏最直接。'
                : 'Start here if you want the shortest answer to “what is actually new on the site this week?”'}
            </p>
          </div>
          {thisWeekRows.length > 0 ? (
            <WebNavCardList dataList={thisWeekRows} contextLabel='latest' />
          ) : (
            <div className='rounded-lg border border-slate-200 bg-white p-6 text-sm leading-6 text-slate-600'>
              {isChinese
                ? '最近 7 天还没有新的正式收录工具，先看看下面最近补齐的工具。'
                : 'There were no newly published tools in the last 7 days, so the recent additions below are the next best place to look.'}
            </div>
          )}
        </section>

        {groupedThisWeek.length > 0 && (
          <section>
            <div className='mb-5 flex flex-col gap-2 lg:mb-6'>
              <h2 className='text-2xl font-bold text-slate-950 lg:text-3xl'>
                {isChinese ? '按分类看本周新增' : 'Browse this week by category'}
              </h2>
              <p className='max-w-3xl text-sm leading-6 text-slate-600'>
                {isChinese
                  ? '如果你只关心某一类工具，这里会把最近 7 天新增内容按分类拆开，方便你直接进入。'
                  : 'If you only care about certain use cases, this section groups the newest additions by category so you can jump in faster.'}
              </p>
            </div>

            <div className='grid gap-6'>
              {groupedThisWeek.map((group) => (
                <div
                  key={group.categoryId}
                  className='rounded-[18px] border border-slate-200 bg-white p-5 shadow-sm lg:p-6'
                >
                  <div className='mb-4 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between'>
                    <div>
                      <p className='text-sm font-semibold uppercase tracking-wide text-cyan-700'>
                        {isChinese ? '分类入口' : 'Category'}
                      </p>
                      <h3 className='mt-1 text-xl font-bold text-slate-950'>{group.categoryName}</h3>
                      <p className='mt-1 text-sm leading-6 text-slate-600'>
                        {isChinese
                          ? `最近 7 天新增 ${group.rows.length} 个工具，适合从这个分类继续往下看。`
                          : `${group.rows.length} newly added tools in the last 7 days.`}
                      </p>
                    </div>
                    <Link
                      href={`/categories/${group.categorySlug}?sort=latest`}
                      className='inline-flex items-center gap-2 text-sm font-semibold text-slate-700 hover:text-slate-950'
                    >
                      {isChinese ? '进入分类' : 'Open category'}
                      <ArrowRight className='size-4' />
                    </Link>
                  </div>

                  <WebNavCardList dataList={group.rows.slice(0, 4)} contextLabel='latest' />
                </div>
              ))}
            </div>
          </section>
        )}

        {recentRows.length > 0 && (
          <section>
            <div className='mb-5 flex flex-col gap-2 lg:mb-6'>
              <h2 className='text-2xl font-bold text-slate-950 lg:text-3xl'>
                {isChinese ? '最近补齐的工具' : 'Recent additions worth catching up on'}
              </h2>
              <p className='max-w-3xl text-sm leading-6 text-slate-600'>
                {isChinese
                  ? '这些不是本周刚发布，但仍然是最近补充和整理过、值得一起看的工具。'
                  : 'These were not necessarily published this week, but they are still recent enough to matter if you are catching up on newly improved entries.'}
              </p>
            </div>
            <WebNavCardList dataList={recentRows.slice(0, 12)} contextLabel='latest' />
          </section>
        )}
      </div>
    </div>
  );
}
