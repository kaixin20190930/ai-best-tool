import { getTranslations } from 'next-intl/server';
import Link from 'next/link';
import { CheckCircle2, ExternalLink, Globe2, Search, Send, Spline, TriangleAlert } from 'lucide-react';

import {
  getGoogleSearchConsoleLogs,
  inspectGoogleSearchConsoleUrlAction,
  submitGoogleSearchConsoleSitemapAction,
} from '@/app/actions/admin/googleSearchConsole';
import { BASE_URL } from '@/lib/env';

export async function generateMetadata({ params }: { params: { locale: string } }) {
  const t = await getTranslations({ locale: params.locale, namespace: 'admin' });

  return {
    title: `${t('title')} - Search Console`,
  };
}

export default async function AdminSearchConsolePage({
  params,
}: {
  params: { locale: string };
}) {
  const isChinese = params.locale === 'cn' || params.locale === 'tw';
  const defaultPropertyUrl = process.env.GSC_PROPERTY_URL || BASE_URL;
  const defaultSiteOrigin = process.env.GSC_SITE_ORIGIN || BASE_URL;
  const defaultSitemapUrl =
    process.env.GSC_DEFAULT_SITEMAP_URL ||
    (defaultSiteOrigin ? `${defaultSiteOrigin.replace(/\/$/, '')}/sitemap.xml` : '/sitemap.xml');

  const logs = await getGoogleSearchConsoleLogs(20).catch(() => []);

  return (
    <div className='theme-page min-h-screen'>
      <div className='mb-6 flex flex-col gap-3 lg:flex-row lg:items-end lg:justify-between'>
        <div>
          <h1 className='text-3xl font-bold text-slate-900'>
            {isChinese ? 'Google Search Console 工具' : 'Google Search Console tool'}
          </h1>
          <p className='mt-2 max-w-3xl text-sm leading-6 text-slate-600'>
            {isChinese
              ? '这里自动化的是 Google 支持的两件事：提交 sitemap 和检查 URL。一般页面没有公开的“强制收录”API，所以不要把它理解成手动提交按钮的完全替代。'
              : 'This automates the two supported GSC actions: sitemap submission and URL inspection. Google does not expose a public force-index API for general pages, so this is not a literal replacement for the manual request indexing button.'}
          </p>
        </div>
        <Link
          href='https://support.google.com/webmasters/answer/7451184'
          target='_blank'
          rel='noreferrer'
          className='inline-flex items-center gap-2 text-sm font-semibold text-cyan-700 hover:text-cyan-800'
        >
          {isChinese ? '查看官方说明' : 'Read the official docs'}
          <ExternalLink className='size-4' />
        </Link>
      </div>

      <section className='grid gap-4 lg:grid-cols-[1fr_1fr]'>
        <form
          action={submitGoogleSearchConsoleSitemapAction}
          className='theme-surface rounded-lg border border-slate-200 p-6 shadow-sm'
        >
          <div className='flex items-start gap-3'>
            <div className='rounded-lg bg-cyan-50 p-2 text-cyan-700'>
              <Send className='size-5' />
            </div>
            <div>
              <h2 className='text-lg font-semibold text-slate-900'>
                {isChinese ? '提交 sitemap' : 'Submit sitemap'}
              </h2>
              <p className='mt-1 text-sm leading-6 text-slate-600'>
                {isChinese
                  ? '适合新页面、分类页、指南页批量上线后触发发现。'
                  : 'Use this after new pages, categories, or guides go live so Google can discover them faster.'}
              </p>
            </div>
          </div>

          <div className='mt-5 grid gap-4'>
            <label className='grid gap-2 text-sm font-medium text-slate-700'>
              {isChinese ? 'Property URL' : 'Property URL'}
              <input
                name='propertyUrl'
                defaultValue={defaultPropertyUrl}
                placeholder='sc-domain:example.com'
                className='rounded-lg border border-slate-200 px-3 py-2 text-sm text-slate-900 outline-none ring-0 focus:border-cyan-400'
              />
            </label>
            <label className='grid gap-2 text-sm font-medium text-slate-700'>
              {isChinese ? 'Site origin' : 'Site origin'}
              <input
                name='siteOrigin'
                defaultValue={defaultSiteOrigin}
                placeholder='https://example.com'
                className='rounded-lg border border-slate-200 px-3 py-2 text-sm text-slate-900 outline-none ring-0 focus:border-cyan-400'
              />
            </label>
            <label className='grid gap-2 text-sm font-medium text-slate-700'>
              {isChinese ? 'Sitemap URL' : 'Sitemap URL'}
              <input
                name='sitemapUrl'
                defaultValue={defaultSitemapUrl}
                placeholder='https://example.com/sitemap.xml'
                className='rounded-lg border border-slate-200 px-3 py-2 text-sm text-slate-900 outline-none ring-0 focus:border-cyan-400'
              />
            </label>
          </div>

          <button
            type='submit'
            className='mt-5 inline-flex items-center justify-center gap-2 rounded-lg bg-slate-950 px-4 py-2.5 text-sm font-semibold text-white hover:bg-slate-800'
          >
            <Spline className='size-4' />
            {isChinese ? '提交 sitemap' : 'Submit sitemap'}
          </button>
        </form>

        <form
          action={inspectGoogleSearchConsoleUrlAction}
          className='theme-surface rounded-lg border border-slate-200 p-6 shadow-sm'
        >
          <div className='flex items-start gap-3'>
            <div className='rounded-lg bg-emerald-50 p-2 text-emerald-700'>
              <Search className='size-5' />
            </div>
            <div>
              <h2 className='text-lg font-semibold text-slate-900'>
                {isChinese ? '检查 URL' : 'Inspect URL'}
              </h2>
              <p className='mt-1 text-sm leading-6 text-slate-600'>
                {isChinese
                  ? '用于检查单个页面的可索引状态、抓取结果和结构化数据问题。'
                  : 'Use this to inspect a single page for indexability, fetch results, and structured data issues.'}
              </p>
            </div>
          </div>

          <div className='mt-5 grid gap-4'>
            <label className='grid gap-2 text-sm font-medium text-slate-700'>
              {isChinese ? 'Property URL' : 'Property URL'}
              <input
                name='propertyUrl'
                defaultValue={defaultPropertyUrl}
                placeholder='sc-domain:example.com'
                className='rounded-lg border border-slate-200 px-3 py-2 text-sm text-slate-900 outline-none ring-0 focus:border-emerald-400'
              />
            </label>
            <label className='grid gap-2 text-sm font-medium text-slate-700'>
              {isChinese ? 'Site origin' : 'Site origin'}
              <input
                name='siteOrigin'
                defaultValue={defaultSiteOrigin}
                placeholder='https://example.com'
                className='rounded-lg border border-slate-200 px-3 py-2 text-sm text-slate-900 outline-none ring-0 focus:border-emerald-400'
              />
            </label>
            <label className='grid gap-2 text-sm font-medium text-slate-700'>
              {isChinese ? 'Inspection URL' : 'Inspection URL'}
              <input
                name='inspectionUrl'
                placeholder='https://example.com/guides/how-to-choose-ai-tools'
                className='rounded-lg border border-slate-200 px-3 py-2 text-sm text-slate-900 outline-none ring-0 focus:border-emerald-400'
              />
            </label>
          </div>

          <button
            type='submit'
            className='mt-5 inline-flex items-center justify-center gap-2 rounded-lg bg-emerald-700 px-4 py-2.5 text-sm font-semibold text-white hover:bg-emerald-800'
          >
            <CheckCircle2 className='size-4' />
            {isChinese ? '检查 URL' : 'Inspect URL'}
          </button>
        </form>
      </section>

      <section className='mt-6 rounded-lg border border-amber-200 bg-amber-50 p-5 text-sm leading-6 text-amber-950'>
        <div className='flex items-start gap-3'>
          <TriangleAlert className='mt-0.5 size-5 shrink-0' />
          <p>
            {isChinese
              ? '如果你想加速收录，真正可控的路径仍然是：内容质量、内部链接、sitemap 及时更新、服务器响应稳定，以及合理的站内导流。这个工具只负责把 Google 支持的自动化动作收起来。'
              : 'If you want faster discovery, the controllable levers are still content quality, internal links, fresh sitemaps, stable server response, and good in-site routing. This tool only automates the GSC-supported parts.'}
          </p>
        </div>
      </section>

      <section className='theme-surface mt-6 rounded-lg border border-slate-200 p-6 shadow-sm'>
        <div className='flex items-center justify-between gap-3'>
          <div>
            <h2 className='text-lg font-semibold text-slate-900'>
              {isChinese ? '最近日志' : 'Recent logs'}
            </h2>
            <p className='mt-1 text-sm text-slate-600'>
              {isChinese
                ? '看这里确认 Google API 是否真的返回成功，失败时也能直接看到错误。'
                : 'Use this to confirm whether the Google API returned success and to inspect failures quickly.'}
            </p>
          </div>
          <Globe2 className='hidden size-5 text-cyan-600 sm:block' />
        </div>

        {logs.length === 0 ? (
          <p className='mt-4 text-sm text-slate-500'>
            {isChinese ? '还没有日志。' : 'No logs yet.'}
          </p>
        ) : (
          <div className='mt-4 overflow-x-auto'>
            <table className='min-w-full divide-y divide-slate-200 text-sm'>
              <thead className='bg-slate-50'>
                <tr>
                  <th className='px-3 py-2 text-left font-medium text-slate-600'>
                    {isChinese ? '时间' : 'Time'}
                  </th>
                  <th className='px-3 py-2 text-left font-medium text-slate-600'>
                    {isChinese ? '操作' : 'Operation'}
                  </th>
                  <th className='px-3 py-2 text-left font-medium text-slate-600'>
                    {isChinese ? '目标' : 'Target'}
                  </th>
                  <th className='px-3 py-2 text-left font-medium text-slate-600'>
                    {isChinese ? '状态' : 'Status'}
                  </th>
                  <th className='px-3 py-2 text-left font-medium text-slate-600'>
                    {isChinese ? '错误/响应' : 'Error / response'}
                  </th>
                </tr>
              </thead>
              <tbody className='divide-y divide-slate-200'>
                {logs.map((log) => (
                  <tr key={log.id}>
                    <td className='px-3 py-2 text-slate-600'>
                      {new Date(log.createdAt).toLocaleString()}
                    </td>
                    <td className='px-3 py-2 text-slate-900'>
                      {log.operation === 'submit_sitemap'
                        ? isChinese
                          ? '提交 sitemap'
                          : 'Submit sitemap'
                        : isChinese
                        ? '检查 URL'
                        : 'Inspect URL'}
                    </td>
                    <td className='px-3 py-2 text-slate-600'>
                      <div className='max-w-[28rem] truncate'>{log.targetUrl}</div>
                    </td>
                    <td className='px-3 py-2'>
                      <span
                        className={`inline-flex rounded-full px-2 py-0.5 text-xs font-semibold ${
                          log.status === 'success'
                            ? 'bg-emerald-100 text-emerald-700'
                            : 'bg-red-100 text-red-700'
                        }`}
                      >
                        {log.status === 'success'
                          ? isChinese
                            ? '成功'
                            : 'Success'
                          : isChinese
                          ? '失败'
                          : 'Failed'}
                      </span>
                    </td>
                    <td className='px-3 py-2 text-slate-600'>
                      {log.status === 'success'
                        ? log.response
                          ? JSON.stringify(log.response).slice(0, 180)
                          : '-'
                        : log.errorMessage || '-'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>
    </div>
  );
}
